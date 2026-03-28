import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/workshops?lat=&lng=&radius=&equipment=&category=
router.get('/', async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius = '50', equipment, category } = req.query;

    let query = supabase
      .from('workshops')
      .select(`
        *,
        host:users!workshops_host_id_fkey(id, full_name, avatar_url),
        serviceCategory:service_categories!workshops_service_category_id_fkey(*),
        equipment:workshop_equipment(id, workshop_id, equipment_id, equipment:equipment_catalog(*))
      `)
      .eq('is_active', true)
      .order('avg_rating', { ascending: false });

    if (lat && lng) {
      const latNum = parseFloat(lat as string);
      const lngNum = parseFloat(lng as string);
      const radiusKm = parseFloat(radius as string);
      const latDelta = radiusKm / 111;
      const lngDelta = radiusKm / (111 * Math.cos((latNum * Math.PI) / 180));

      query = query
        .gte('latitude', latNum - latDelta)
        .lte('latitude', latNum + latDelta)
        .gte('longitude', lngNum - lngDelta)
        .lte('longitude', lngNum + lngDelta);
    }

    if (category) {
      query = query.eq('service_category_id', category as string);
    }

    const { data: workshops, error } = await query;
    if (error) throw error;

    // Filter by equipment client-side (Supabase doesn't support nested filtering easily)
    let result = workshops || [];
    if (equipment) {
      const equipmentIds = (equipment as string).split(',');
      result = result.filter((ws: any) =>
        ws.equipment?.some((we: any) => equipmentIds.includes(we.equipment_id))
      );
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workshops/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const { data: workshop, error } = await supabase
      .from('workshops')
      .select(`
        *,
        host:users!workshops_host_id_fkey(id, full_name, avatar_url, bio),
        serviceCategory:service_categories!workshops_service_category_id_fkey(*),
        equipment:workshop_equipment(id, workshop_id, equipment_id, equipment:equipment_catalog(*, category:equipment_categories(*))),
        availability:workshop_availability(id, workshop_id, time_slot_type_id, available_date, is_available, timeSlotType:time_slot_types(*))
      `)
      .eq('id', id)
      .single();

    if (error || !workshop) {
      res.status(404).json({ error: 'Workshop not found' });
      return;
    }

    // Filter availability to future + available
    const now = new Date().toISOString().split('T')[0];
    workshop.availability = (workshop.availability || []).filter(
      (a: any) => a.is_available && a.available_date >= now
    );

    // Get reviews for this workshop's completed bookings
    const { data: bookingsWithReviews } = await supabase
      .from('bookings')
      .select(`
        review:reviews(id, booking_id, reviewer_id, rating, comment, created_at, reviewer:users!reviews_reviewer_id_fkey(full_name, avatar_url))
      `)
      .eq('workshop_id', id)
      .eq('status', 'COMPLETED')
      .order('created_at', { ascending: false })
      .limit(10);

    const reviews = (bookingsWithReviews || [])
      .filter((b: any) => b.review && b.review.length > 0)
      .map((b: any) => b.review[0]);

    res.json({ ...workshop, reviews });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workshops
router.post('/', async (req: Request, res: Response) => {
  try {
    const { hostId, serviceCategoryId, name, description, address, latitude, longitude, hourlyRate, photoUrls } = req.body;

    const { data, error } = await supabase
      .from('workshops')
      .insert({
        host_id: hostId,
        service_category_id: serviceCategoryId,
        name,
        description,
        address,
        latitude,
        longitude,
        hourly_rate: hourlyRate,
        photo_urls: photoUrls || [],
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        host:users!workshops_host_id_fkey(id, full_name, avatar_url),
        serviceCategory:service_categories!workshops_service_category_id_fkey(*)
      `)
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/workshops/:id/equipment
router.put('/:id/equipment', async (req: Request, res: Response) => {
  try {
    const { equipmentIds } = req.body;
    const workshopId = req.params.id;

    // Delete existing
    await supabase.from('workshop_equipment').delete().eq('workshop_id', workshopId);

    // Insert new
    const rows = equipmentIds.map((equipmentId: string) => ({
      workshop_id: workshopId,
      equipment_id: equipmentId,
    }));

    const { data, error } = await supabase
      .from('workshop_equipment')
      .insert(rows)
      .select('*, equipment:equipment_catalog(*)');

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workshops/:id/availability
router.post('/:id/availability', async (req: Request, res: Response) => {
  try {
    const workshopId = req.params.id;
    const { slots } = req.body;

    const results = await Promise.all(
      slots.map(async (slot: { timeSlotTypeId: string; availableDate: string; isAvailable: boolean }) => {
        const { data: existing } = await supabase
          .from('workshop_availability')
          .select('id')
          .eq('workshop_id', workshopId)
          .eq('time_slot_type_id', slot.timeSlotTypeId)
          .eq('available_date', slot.availableDate)
          .maybeSingle();

        if (existing) {
          const { data } = await supabase
            .from('workshop_availability')
            .update({ is_available: slot.isAvailable })
            .eq('id', existing.id)
            .select()
            .single();
          return data;
        } else {
          const { data } = await supabase
            .from('workshop_availability')
            .insert({
              workshop_id: workshopId,
              time_slot_type_id: slot.timeSlotTypeId,
              available_date: slot.availableDate,
              is_available: slot.isAvailable,
            })
            .select()
            .single();
          return data;
        }
      })
    );

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
