import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// POST /api/bookings
router.post('/', async (req: Request, res: Response) => {
  try {
    const { bookerId, workshopId, timeSlotTypeId, bookingDate, addonIds = [], safetyAcknowledged, notes } = req.body;

    if (!safetyAcknowledged) {
      res.status(400).json({ error: 'Safety rules must be acknowledged' });
      return;
    }

    // Check slot availability
    const { data: slot } = await supabase
      .from('workshop_availability')
      .select('id')
      .eq('workshop_id', workshopId)
      .eq('time_slot_type_id', timeSlotTypeId)
      .eq('available_date', bookingDate)
      .eq('is_available', true)
      .maybeSingle();

    if (!slot) {
      res.status(400).json({ error: 'Selected time slot is not available' });
      return;
    }

    // Check no conflicting booking
    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('workshop_id', workshopId)
      .eq('time_slot_type_id', timeSlotTypeId)
      .eq('booking_date', bookingDate)
      .in('status', ['PENDING', 'CONFIRMED']);

    if (conflicts && conflicts.length > 0) {
      res.status(400).json({ error: 'Time slot already booked' });
      return;
    }

    // Get workshop for pricing
    const { data: workshop } = await supabase
      .from('workshops')
      .select('hourly_rate')
      .eq('id', workshopId)
      .single();

    if (!workshop) {
      res.status(404).json({ error: 'Workshop not found' });
      return;
    }

    const basePrice = Number(workshop.hourly_rate);
    let addonTotal = 0;
    const addonRecords: { addon_id: string; price_at_booking: number }[] = [];

    if (addonIds.length > 0) {
      const { data: addons } = await supabase
        .from('addon_catalog')
        .select('id, default_price')
        .in('id', addonIds);

      for (const addon of addons || []) {
        addonTotal += Number(addon.default_price);
        addonRecords.push({ addon_id: addon.id, price_at_booking: Number(addon.default_price) });
      }
    }

    const totalPrice = basePrice + addonTotal;
    const nowStr = new Date().toISOString();

    // Create booking
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .insert({
        booker_id: bookerId,
        workshop_id: workshopId,
        time_slot_type_id: timeSlotTypeId,
        booking_date: bookingDate,
        base_price: basePrice,
        total_price: totalPrice,
        safety_acknowledged: safetyAcknowledged,
        notes,
        created_at: nowStr,
        updated_at: nowStr,
      })
      .select(`
        *,
        workshop:workshops!bookings_workshop_id_fkey(name),
        timeSlotType:time_slot_types!bookings_time_slot_type_id_fkey(*)
      `)
      .single();

    if (bookingErr) throw bookingErr;

    // Insert addons
    if (addonRecords.length > 0) {
      await supabase.from('booking_addons').insert(
        addonRecords.map((ar) => ({ ...ar, booking_id: booking.id }))
      );
    }

    // Mark slot unavailable
    await supabase
      .from('workshop_availability')
      .update({ is_available: false })
      .eq('id', slot.id);

    res.status(201).json(booking);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/user/:userId?status=
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        workshop:workshops!bookings_workshop_id_fkey(id, name, photo_urls, address, host:users!workshops_host_id_fkey(full_name, avatar_url)),
        timeSlotType:time_slot_types!bookings_time_slot_type_id_fkey(*),
        addons:booking_addons(*, addon:addon_catalog(*))
      `)
      .eq('booker_id', req.params.userId)
      .order('booking_date', { ascending: false });

    if (req.query.status) {
      query = query.eq('status', req.query.status as string);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/workshop/:workshopId
router.get('/workshop/:workshopId', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        booker:users!bookings_booker_id_fkey(id, full_name, avatar_url, email, phone),
        timeSlotType:time_slot_types!bookings_time_slot_type_id_fkey(*),
        addons:booking_addons(*, addon:addon_catalog(*))
      `)
      .eq('workshop_id', req.params.workshopId)
      .order('booking_date', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/host/:hostId — all bookings across host's workshops with booker info
router.get('/host/:hostId', async (req: Request, res: Response) => {
  try {
    // Get all workshops owned by this host
    const { data: workshops } = await supabase
      .from('workshops')
      .select('id')
      .eq('host_id', req.params.hostId);

    if (!workshops || workshops.length === 0) {
      res.json([]);
      return;
    }

    const workshopIds = workshops.map((w) => w.id);

    let query = supabase
      .from('bookings')
      .select(`
        *,
        booker:users!bookings_booker_id_fkey(id, full_name, avatar_url, email, phone),
        workshop:workshops!bookings_workshop_id_fkey(id, name, photo_urls, address),
        timeSlotType:time_slot_types!bookings_time_slot_type_id_fkey(*),
        addons:booking_addons(*, addon:addon_catalog(*))
      `)
      .in('workshop_id', workshopIds)
      .order('booking_date', { ascending: false });

    if (req.query.status) {
      query = query.eq('status', req.query.status as string);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id/status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    // Get booking
    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Enforce snapshot rule for COMPLETED
    if (status === 'COMPLETED') {
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('booking_id', bookingId)
        .maybeSingle();

      let hasValidSnapshot = false;
      if (project) {
        const { data: snaps } = await supabase
          .from('snapshots')
          .select('before_photo_url, after_photo_url')
          .eq('project_id', project.id);

        hasValidSnapshot = (snaps || []).some(
          (s) => s.before_photo_url && s.after_photo_url
        );
      }

      if (!hasValidSnapshot) {
        res.status(400).json({
          error: 'Cannot complete booking without at least one snapshot with both before and after photos',
        });
        return;
      }
    }

    const updateData: any = { status, updated_at: new Date().toISOString() };

    if (status === 'CANCELLED') {
      const bookingDate = new Date(booking.booking_date);
      const hoursUntil = (bookingDate.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntil < 24) {
        updateData.late_cancellation = true;
      }

      // Re-open availability
      await supabase
        .from('workshop_availability')
        .update({ is_available: true })
        .eq('workshop_id', booking.workshop_id)
        .eq('time_slot_type_id', booking.time_slot_type_id)
        .eq('available_date', booking.booking_date);
    }

    const { data: updated, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select(`
        *,
        workshop:workshops!bookings_workshop_id_fkey(name),
        timeSlotType:time_slot_types!bookings_time_slot_type_id_fkey(*)
      `)
      .single();

    if (error) throw error;
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
