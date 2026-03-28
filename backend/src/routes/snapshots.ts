import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// POST /api/snapshots/projects
router.post('/projects', async (req: Request, res: Response) => {
  try {
    const { bookingId, title, description } = req.body;

    const { data: booking } = await supabase
      .from('bookings')
      .select('id')
      .eq('id', bookingId)
      .maybeSingle();

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (existing) {
      res.status(400).json({ error: 'Project already exists for this booking' });
      return;
    }

    const nowStr = new Date().toISOString();
    const { data: project, error } = await supabase
      .from('projects')
      .insert({ booking_id: bookingId, title, description, created_at: nowStr, updated_at: nowStr })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/snapshots/projects/:projectId
router.get('/projects/:projectId', async (req: Request, res: Response) => {
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        booking:bookings!projects_booking_id_fkey(
          *,
          workshop:workshops!bookings_workshop_id_fkey(name),
          booker:users!bookings_booker_id_fkey(full_name, avatar_url)
        ),
        snapshots(
          *,
          tools:snapshot_tools(id, snapshot_id, equipment_id, equipment:equipment_catalog(*)),
          skills:snapshot_skills(id, snapshot_id, skill_id, skill:skill_catalog(*))
        )
      `)
      .eq('id', req.params.projectId)
      .order('sequence_number', { referencedTable: 'snapshots', ascending: true })
      .single();

    if (error || !project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/snapshots/projects/:projectId/snapshots
router.post('/projects/:projectId/snapshots', async (req: Request, res: Response) => {
  try {
    const { beforePhotoUrl, afterPhotoUrl, notes, toolIds = [], skillIds = [] } = req.body;
    const projectId = req.params.projectId;

    if (!beforePhotoUrl || !afterPhotoUrl) {
      res.status(400).json({ error: 'Both before and after photo URLs are required' });
      return;
    }

    // Get next sequence number
    const { data: lastSnap } = await supabase
      .from('snapshots')
      .select('sequence_number')
      .eq('project_id', projectId)
      .order('sequence_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const sequenceNumber = (lastSnap?.sequence_number || 0) + 1;

    const { data: snapshot, error } = await supabase
      .from('snapshots')
      .insert({
        project_id: projectId,
        sequence_number: sequenceNumber,
        before_photo_url: beforePhotoUrl,
        after_photo_url: afterPhotoUrl,
        notes,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Insert tools
    if (toolIds.length > 0) {
      await supabase.from('snapshot_tools').insert(
        toolIds.map((equipmentId: string) => ({
          snapshot_id: snapshot.id,
          equipment_id: equipmentId,
        }))
      );
    }

    // Insert skills
    if (skillIds.length > 0) {
      await supabase.from('snapshot_skills').insert(
        skillIds.map((skillId: string) => ({
          snapshot_id: snapshot.id,
          skill_id: skillId,
        }))
      );
    }

    // Return with tools and skills
    const { data: full } = await supabase
      .from('snapshots')
      .select(`
        *,
        tools:snapshot_tools(id, snapshot_id, equipment_id, equipment:equipment_catalog(*)),
        skills:snapshot_skills(id, snapshot_id, skill_id, skill:skill_catalog(*))
      `)
      .eq('id', snapshot.id)
      .single();

    res.status(201).json(full);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/snapshots/workshop/:workshopId — all projects+snapshots for a workshop
router.get('/workshop/:workshopId', async (req: Request, res: Response) => {
  try {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('workshop_id', req.params.workshopId);

    if (!bookings || bookings.length === 0) {
      res.json([]);
      return;
    }

    const bookingIds = bookings.map((b) => b.id);

    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        booking:bookings!projects_booking_id_fkey(
          booking_date,
          booker:users!bookings_booker_id_fkey(full_name, avatar_url)
        ),
        snapshots(
          *,
          tools:snapshot_tools(id, snapshot_id, equipment_id, equipment:equipment_catalog(*)),
          skills:snapshot_skills(id, snapshot_id, skill_id, skill:skill_catalog(*))
        )
      `)
      .in('booking_id', bookingIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(projects || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/snapshots/user/:userId
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    // Get bookings for this user
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('booker_id', req.params.userId);

    if (!bookings || bookings.length === 0) {
      res.json([]);
      return;
    }

    const bookingIds = bookings.map((b) => b.id);

    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        booking:bookings!projects_booking_id_fkey(
          workshop:workshops!bookings_workshop_id_fkey(name, photo_urls)
        ),
        snapshots(
          *,
          tools:snapshot_tools(id, snapshot_id, equipment_id, equipment:equipment_catalog(*)),
          skills:snapshot_skills(id, snapshot_id, skill_id, skill:skill_catalog(*))
        )
      `)
      .in('booking_id', bookingIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(projects || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
