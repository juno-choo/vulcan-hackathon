import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const USER_ID = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
const WORKSHOP_ID = 'b9ee0b0b-6cc8-46cf-8ee6-83ea77beb272';

// Woodworking equipment IDs
const EQUIPMENT = {
  tableSaw: 'b844186a-4fdd-423e-88c4-dcc9546aa2ad',
  bandSaw: 'c1b7bf3e-8c53-46a0-ada0-2762a204e07c',
  drillPress: '4ffbd0d8-cf24-4803-892e-a22e91d16b5a',
  lathe: '674848e3-7165-45d7-9cd1-29bfcc4167a7',
  chiselSet: 'fedd0292-11a5-4b5e-b182-dc9de33286f4',
  handPlane: 'a0d8dca7-eb1e-4d7f-9c7b-b0b53ea41617',
  clampSet: '4eaaad32-22d2-410e-bd79-6051229c9e6f',
  dustCollection: '108b43d4-4084-4fd6-aedd-ec484474ec9c',
  randOrbitalSander: '6f206221-c2b6-4cda-91a3-36ff1ecf04b2',
  combinationSquare: '530f3109-4f48-4135-a9ce-2a9f7aab0c03',
};

// Time slots
const TIME_SLOTS = {
  morning: '7f2e6951-3139-4458-9bb7-f6e1254f6998',
  afternoon: '96d1ec68-58b5-48da-b5df-bbb0cb290df7',
  evening: 'd9056e87-fe54-4106-86ce-a72e875ea491',
};

// Addons
const ADDONS = {
  materials: '253ec62a-bb0f-417a-9553-82e1894fcd89',
  mentorship: '56346032-672b-466b-946c-b306352f6975',
};

// Woodworking skills
const SKILLS = {
  cabinetMaking: '5de2c7a3-3d5d-4c73-aef4-d69afbdc34f0',
  finishingStaining: '214462e7-a99d-4bed-bbae-6808b67a46a6',
  joineryBasics: 'ee5b30e5-ce0b-49f3-b2c2-19a760b939e3',
  routerTechniques: '89e1e6be-8514-42aa-a7bd-2fe88b2486d4',
  scrollSawing: 'e8edf7de-d266-4332-b04a-34e346457ba1',
  woodCarving: 'e5a2248f-7664-4fc3-a3f8-a9e30a4f1658',
  woodTurning: '611182ce-6834-45f3-8a39-478101b1a981',
};

// Existing booker users (from seed data)
const BOOKER_ALEX = 'booker-alex'; // We'll look up by auth_id
const BOOKER_PRIYA = 'booker-priya';

async function main() {
  console.log('Populating data for user', USER_ID);

  // ── 1. Find existing booker users ──
  const { data: bookers } = await supabase
    .from('users')
    .select('id, full_name, auth_id')
    .in('auth_id', ['booker-auth-001', 'booker-auth-002']);

  if (!bookers || bookers.length < 2) {
    console.error('Could not find booker users. Found:', bookers);
    return;
  }
  const alex = bookers.find((b) => b.auth_id === 'booker-auth-001')!;
  const priya = bookers.find((b) => b.auth_id === 'booker-auth-002')!;
  console.log(`Found bookers: ${alex.full_name} (${alex.id}), ${priya.full_name} (${priya.id})`);

  // ── 2. Workshop Equipment ──
  console.log('\nAdding workshop equipment...');
  // First clear any existing
  await supabase.from('workshop_equipment').delete().eq('workshop_id', WORKSHOP_ID);

  const equipmentRows = Object.values(EQUIPMENT).map((eqId) => ({
    id: randomUUID(),
    workshop_id: WORKSHOP_ID,
    equipment_id: eqId,
  }));

  const { error: eqErr } = await supabase.from('workshop_equipment').insert(equipmentRows);
  if (eqErr) console.error('Equipment error:', eqErr.message);
  else console.log(`  Added ${equipmentRows.length} equipment items`);

  // ── 3. Workshop Availability (next 7 days) ──
  console.log('\nAdding workshop availability...');
  await supabase.from('workshop_availability').delete().eq('workshop_id', WORKSHOP_ID);

  const today = new Date();
  const availSlots: any[] = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];

    for (const [name, tsId] of Object.entries(TIME_SLOTS)) {
      availSlots.push({
        id: randomUUID(),
        workshop_id: WORKSHOP_ID,
        time_slot_type_id: tsId,
        available_date: dateStr,
        is_available: Math.random() > 0.2, // ~80% available
      });
    }
  }

  const { error: availErr } = await supabase.from('workshop_availability').insert(availSlots);
  if (availErr) console.error('Availability error:', availErr.message);
  else console.log(`  Added ${availSlots.length} availability slots`);

  // ── 4. Completed Booking #1 (Alex, 5 days ago) ──
  console.log('\nCreating completed booking #1 (Alex)...');
  const pastDate1 = new Date(today);
  pastDate1.setDate(today.getDate() - 5);
  const pastDateStr1 = pastDate1.toISOString().split('T')[0];
  const bookingId1 = randomUUID();
  const nowStr = new Date().toISOString();

  const { error: b1Err } = await supabase.from('bookings').insert({
    id: bookingId1,
    booker_id: alex.id,
    workshop_id: WORKSHOP_ID,
    time_slot_type_id: TIME_SLOTS.morning,
    booking_date: pastDateStr1,
    status: 'COMPLETED',
    base_price: 30.00,
    total_price: 70.00,
    safety_acknowledged: true,
    notes: 'Excited to learn joinery basics!',
    created_at: nowStr,
    updated_at: nowStr,
  });
  if (b1Err) console.error('Booking 1 error:', b1Err.message);
  else console.log(`  Booking 1 created: ${bookingId1}`);

  // Addons for booking 1
  await supabase.from('booking_addons').insert([
    { id: randomUUID(), booking_id: bookingId1, addon_id: ADDONS.mentorship, price_at_booking: 25.00 },
    { id: randomUUID(), booking_id: bookingId1, addon_id: ADDONS.materials, price_at_booking: 15.00 },
  ]);
  console.log('  Added 2 addons');

  // Project + Snapshots for booking 1
  const projectId1 = randomUUID();
  await supabase.from('projects').insert({
    id: projectId1,
    booking_id: bookingId1,
    title: 'Dovetail Box',
    description: 'Learning hand-cut dovetails to build a small jewelry box',
    created_at: nowStr,
    updated_at: nowStr,
  });
  console.log(`  Project created: ${projectId1}`);

  const snapshots1 = [
    { seq: 1, notes: 'Marking and measuring the wood pieces', tools: [EQUIPMENT.chiselSet, EQUIPMENT.combinationSquare], skills: [SKILLS.joineryBasics] },
    { seq: 2, notes: 'Cutting dovetail pins with the chisel set', tools: [EQUIPMENT.chiselSet, EQUIPMENT.handPlane], skills: [SKILLS.joineryBasics, SKILLS.woodCarving] },
    { seq: 3, notes: 'Final assembly, glue-up, and sanding', tools: [EQUIPMENT.clampSet, EQUIPMENT.randOrbitalSander], skills: [SKILLS.finishingStaining] },
  ];

  for (const snap of snapshots1) {
    const snapId = randomUUID();
    await supabase.from('snapshots').insert({
      id: snapId,
      project_id: projectId1,
      sequence_number: snap.seq,
      before_photo_url: `https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=${snap.seq}0`,
      after_photo_url: `https://images.unsplash.com/photo-1597753822799-4dd6a5e5e781?w=600&q=${snap.seq}0`,
      notes: snap.notes,
      created_at: nowStr,
    });

    if (snap.tools.length > 0) {
      await supabase.from('snapshot_tools').insert(
        snap.tools.map((eqId) => ({ id: randomUUID(), snapshot_id: snapId, equipment_id: eqId }))
      );
    }
    if (snap.skills.length > 0) {
      await supabase.from('snapshot_skills').insert(
        snap.skills.map((skId) => ({ id: randomUUID(), snapshot_id: snapId, skill_id: skId }))
      );
    }
  }
  console.log('  Added 3 snapshots with tools and skills');

  // Review for booking 1
  await supabase.from('reviews').insert({
    id: randomUUID(),
    booking_id: bookingId1,
    reviewer_id: alex.id,
    rating: 5,
    comment: 'Marcus is patient and thorough. His workshop is clean, well-organized, and has everything you need for woodworking. Built my first dovetail box in one session!',
    created_at: nowStr,
  });
  console.log('  Added review (5 stars)');

  // ── 5. Completed Booking #2 (Priya, 3 days ago) ──
  console.log('\nCreating completed booking #2 (Priya)...');
  const pastDate2 = new Date(today);
  pastDate2.setDate(today.getDate() - 3);
  const pastDateStr2 = pastDate2.toISOString().split('T')[0];
  const bookingId2 = randomUUID();

  const { error: b2Err } = await supabase.from('bookings').insert({
    id: bookingId2,
    booker_id: priya.id,
    workshop_id: WORKSHOP_ID,
    time_slot_type_id: TIME_SLOTS.afternoon,
    booking_date: pastDateStr2,
    status: 'COMPLETED',
    base_price: 30.00,
    total_price: 55.00,
    safety_acknowledged: true,
    notes: 'Want to learn wood turning for my architecture models',
    created_at: nowStr,
    updated_at: nowStr,
  });
  if (b2Err) console.error('Booking 2 error:', b2Err.message);
  else console.log(`  Booking 2 created: ${bookingId2}`);

  await supabase.from('booking_addons').insert([
    { id: randomUUID(), booking_id: bookingId2, addon_id: ADDONS.mentorship, price_at_booking: 25.00 },
  ]);
  console.log('  Added 1 addon');

  const projectId2 = randomUUID();
  await supabase.from('projects').insert({
    id: projectId2,
    booking_id: bookingId2,
    title: 'Turned Wooden Bowl',
    description: 'Lathe project to create a walnut bowl from a blank',
    created_at: nowStr,
    updated_at: nowStr,
  });
  console.log(`  Project created: ${projectId2}`);

  const snapshots2 = [
    { seq: 1, notes: 'Mounting the walnut blank on the lathe', tools: [EQUIPMENT.lathe], skills: [SKILLS.woodTurning] },
    { seq: 2, notes: 'Roughing out the bowl shape', tools: [EQUIPMENT.lathe, EQUIPMENT.chiselSet], skills: [SKILLS.woodTurning] },
    { seq: 3, notes: 'Sanding and applying finish', tools: [EQUIPMENT.randOrbitalSander], skills: [SKILLS.finishingStaining, SKILLS.woodTurning] },
  ];

  for (const snap of snapshots2) {
    const snapId = randomUUID();
    await supabase.from('snapshots').insert({
      id: snapId,
      project_id: projectId2,
      sequence_number: snap.seq,
      before_photo_url: `https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=${snap.seq}0`,
      after_photo_url: `https://images.unsplash.com/photo-1572297891079-cf1a3b70e56c?w=600&q=${snap.seq}0`,
      notes: snap.notes,
      created_at: nowStr,
    });

    if (snap.tools.length > 0) {
      await supabase.from('snapshot_tools').insert(
        snap.tools.map((eqId) => ({ id: randomUUID(), snapshot_id: snapId, equipment_id: eqId }))
      );
    }
    if (snap.skills.length > 0) {
      await supabase.from('snapshot_skills').insert(
        snap.skills.map((skId) => ({ id: randomUUID(), snapshot_id: snapId, skill_id: skId }))
      );
    }
  }
  console.log('  Added 3 snapshots with tools and skills');

  // Review for booking 2
  await supabase.from('reviews').insert({
    id: randomUUID(),
    booking_id: bookingId2,
    reviewer_id: priya.id,
    rating: 4,
    comment: 'Great workshop with all the tools you need. Marcus showed me how to use the lathe safely and I made a beautiful bowl. Would book again!',
    created_at: nowStr,
  });
  console.log('  Added review (4 stars)');

  // ── 6. Pending Booking (Alex, 2 days from now) ──
  console.log('\nCreating pending booking (Alex)...');
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 2);
  const futureDateStr = futureDate.toISOString().split('T')[0];
  const bookingId3 = randomUUID();

  // Ensure the slot exists and is available
  const { data: existingSlot } = await supabase
    .from('workshop_availability')
    .select('id')
    .eq('workshop_id', WORKSHOP_ID)
    .eq('time_slot_type_id', TIME_SLOTS.evening)
    .eq('available_date', futureDateStr)
    .maybeSingle();

  if (existingSlot) {
    await supabase
      .from('workshop_availability')
      .update({ is_available: false })
      .eq('id', existingSlot.id);
  }

  const { error: b3Err } = await supabase.from('bookings').insert({
    id: bookingId3,
    booker_id: alex.id,
    workshop_id: WORKSHOP_ID,
    time_slot_type_id: TIME_SLOTS.evening,
    booking_date: futureDateStr,
    status: 'PENDING',
    base_price: 30.00,
    total_price: 45.00,
    safety_acknowledged: true,
    notes: 'Looking forward to learning scroll sawing techniques',
    created_at: nowStr,
    updated_at: nowStr,
  });
  if (b3Err) console.error('Booking 3 error:', b3Err.message);
  else console.log(`  Pending booking created: ${bookingId3}`);

  await supabase.from('booking_addons').insert([
    { id: randomUUID(), booking_id: bookingId3, addon_id: ADDONS.materials, price_at_booking: 15.00 },
  ]);
  console.log('  Added 1 addon');

  // ── Done ──
  console.log('\n✅ All data populated for user', USER_ID);
  console.log('Summary:');
  console.log('  - 10 equipment items on workshop');
  console.log('  - 21 availability slots (7 days × 3 time slots)');
  console.log('  - 2 completed bookings with projects, snapshots, tools, skills, and reviews');
  console.log('  - 1 pending booking');
}

main().catch(console.error);
