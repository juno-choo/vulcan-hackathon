import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/lookups/all
router.get('/all', async (_req: Request, res: Response) => {
  try {
    const [catRes, equipCatRes, slotsRes, addonsRes] = await Promise.all([
      supabase.from('service_categories').select('*').order('name'),
      supabase.from('equipment_categories').select('*, equipment:equipment_catalog(*)').order('name'),
      supabase.from('time_slot_types').select('*').order('start_time'),
      supabase.from('addon_catalog').select('*').eq('is_active', true).order('name'),
    ]);

    res.json({
      serviceCategories: catRes.data || [],
      equipmentCategories: equipCatRes.data || [],
      timeSlots: slotsRes.data || [],
      addons: addonsRes.data || [],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/lookups/service-categories
router.get('/service-categories', async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from('service_categories').select('*').order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/lookups/equipment-categories
router.get('/equipment-categories', async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('equipment_categories')
    .select('*, equipment:equipment_catalog(*)')
    .order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/lookups/equipment?categoryId=
router.get('/equipment', async (req: Request, res: Response) => {
  let query = supabase.from('equipment_catalog').select('*').order('name');
  if (req.query.categoryId) query = query.eq('category_id', req.query.categoryId as string);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/lookups/skills?serviceCategoryId=
router.get('/skills', async (req: Request, res: Response) => {
  let query = supabase.from('skill_catalog').select('*').order('name');
  if (req.query.serviceCategoryId) query = query.eq('service_category_id', req.query.serviceCategoryId as string);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/lookups/time-slots
router.get('/time-slots', async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from('time_slot_types').select('*').order('start_time');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/lookups/addons
router.get('/addons', async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from('addon_catalog').select('*').eq('is_active', true).order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
