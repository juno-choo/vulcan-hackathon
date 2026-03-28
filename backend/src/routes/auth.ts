import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, avatar_url, bio, phone, location')
      .eq('email', email)
      .eq('password', password)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me/:userId
router.get('/me/:userId', async (req: Request, res: Response) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, avatar_url, bio, phone, location')
      .eq('id', req.params.userId)
      .single();

    if (error) throw error;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
