import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const USER_ID = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
const WORKSHOP_ID = 'b9ee0b0b-6cc8-46cf-8ee6-83ea77beb272';
const BASE_URL = 'http://localhost:3000';

async function main() {
  // Update user avatar
  const { error: userErr } = await supabase
    .from('users')
    .update({ avatar_url: `${BASE_URL}/uploads/marcus-avatar.webp` })
    .eq('id', USER_ID);

  if (userErr) console.error('User update error:', userErr.message);
  else console.log('Updated Marcus avatar_url');

  // Update workshop photo_urls
  const { error: wsErr } = await supabase
    .from('workshops')
    .update({ photo_urls: [`${BASE_URL}/uploads/marcus-workshop.png`] })
    .eq('id', WORKSHOP_ID);

  if (wsErr) console.error('Workshop update error:', wsErr.message);
  else console.log('Updated workshop photo_urls');
}

main().catch(console.error);
