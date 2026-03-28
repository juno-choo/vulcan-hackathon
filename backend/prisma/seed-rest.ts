/**
 * Seed script using Supabase REST API (since direct Postgres is blocked).
 * Run with: npx tsx prisma/seed-rest.ts
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function uuid() {
  return randomUUID();
}

async function insert(table: string, rows: any[]) {
  const { data, error } = await supabase.from(table).insert(rows).select();
  if (error) throw new Error(`Insert into ${table} failed: ${error.message}`);
  return data;
}

async function main() {
  console.log('🌱 Seeding Vulcan database via Supabase REST API...\n');

  // ──────────────────────────────────────
  // Service Categories (6)
  // ──────────────────────────────────────
  const now = new Date().toISOString();

  const serviceCategoryRows = [
    { id: uuid(), name: 'Woodworking', icon: 'hammer', description: 'Furniture, cabinetry, carving, and turning', created_at: now },
    { id: uuid(), name: 'Metalworking', icon: 'wrench', description: 'Welding, forging, machining, and fabrication', created_at: now },
    { id: uuid(), name: '3D Printing & CNC', icon: 'cpu', description: 'Additive manufacturing, CNC routing, and laser cutting', created_at: now },
    { id: uuid(), name: 'Electronics', icon: 'zap', description: 'Soldering, PCB design, Arduino, and Raspberry Pi', created_at: now },
    { id: uuid(), name: 'Automotive', icon: 'truck', description: 'Engine work, bodywork, restoration, and detailing', created_at: now },
    { id: uuid(), name: 'Ceramics & Pottery', icon: 'coffee', description: 'Wheel throwing, hand building, glazing, and kiln firing', created_at: now },
  ];
  const serviceCategories = await insert('service_categories', serviceCategoryRows);
  console.log(`✅ ${serviceCategories.length} service categories`);

  const [woodworking, metalworking, printing3d, electronics, automotive, ceramics] = serviceCategories;

  // ──────────────────────────────────────
  // Equipment Categories (7)
  // ──────────────────────────────────────
  const equipCatRows = [
    { id: uuid(), name: 'Power Tools', icon: 'zap', created_at: now },
    { id: uuid(), name: 'Hand Tools', icon: 'tool', created_at: now },
    { id: uuid(), name: 'CNC & Digital Fabrication', icon: 'cpu', created_at: now },
    { id: uuid(), name: 'Welding Equipment', icon: 'thermometer', created_at: now },
    { id: uuid(), name: 'Safety Equipment', icon: 'shield', created_at: now },
    { id: uuid(), name: 'Finishing Tools', icon: 'paintBucket', created_at: now },
    { id: uuid(), name: 'Measurement & Layout', icon: 'ruler', created_at: now },
  ];
  const equipmentCategories = await insert('equipment_categories', equipCatRows);
  console.log(`✅ ${equipmentCategories.length} equipment categories`);

  const [powerTools, handTools, cncDigital, weldingEquip, safetyEquip, finishingTools, measureTools] = equipmentCategories;

  // ──────────────────────────────────────
  // Equipment Catalog (39 items)
  // ──────────────────────────────────────
  const equipRows = [
    // Power Tools (8)
    { id: uuid(), category_id: powerTools.id, name: 'Table Saw', icon: 'disc' },
    { id: uuid(), category_id: powerTools.id, name: 'Band Saw', icon: 'disc' },
    { id: uuid(), category_id: powerTools.id, name: 'Drill Press', icon: 'target' },
    { id: uuid(), category_id: powerTools.id, name: 'Router Table', icon: 'grid' },
    { id: uuid(), category_id: powerTools.id, name: 'Planer', icon: 'layers' },
    { id: uuid(), category_id: powerTools.id, name: 'Jointer', icon: 'minus' },
    { id: uuid(), category_id: powerTools.id, name: 'Lathe', icon: 'rotate-cw' },
    { id: uuid(), category_id: powerTools.id, name: 'Miter Saw', icon: 'triangle' },
    // Hand Tools (6)
    { id: uuid(), category_id: handTools.id, name: 'Chisel Set', icon: 'edit-3' },
    { id: uuid(), category_id: handTools.id, name: 'Hand Plane', icon: 'minus' },
    { id: uuid(), category_id: handTools.id, name: 'Clamp Set', icon: 'maximize' },
    { id: uuid(), category_id: handTools.id, name: 'Hammer Set', icon: 'tool' },
    { id: uuid(), category_id: handTools.id, name: 'Screwdriver Set', icon: 'tool' },
    { id: uuid(), category_id: handTools.id, name: 'File Set', icon: 'file' },
    // CNC & Digital Fabrication (5)
    { id: uuid(), category_id: cncDigital.id, name: 'CNC Router', icon: 'cpu' },
    { id: uuid(), category_id: cncDigital.id, name: '3D Printer (FDM)', icon: 'box' },
    { id: uuid(), category_id: cncDigital.id, name: '3D Printer (Resin)', icon: 'droplet' },
    { id: uuid(), category_id: cncDigital.id, name: 'Laser Cutter', icon: 'crosshair' },
    { id: uuid(), category_id: cncDigital.id, name: 'Vinyl Cutter', icon: 'scissors' },
    // Welding Equipment (5)
    { id: uuid(), category_id: weldingEquip.id, name: 'MIG Welder', icon: 'zap' },
    { id: uuid(), category_id: weldingEquip.id, name: 'TIG Welder', icon: 'zap' },
    { id: uuid(), category_id: weldingEquip.id, name: 'Stick Welder', icon: 'zap' },
    { id: uuid(), category_id: weldingEquip.id, name: 'Plasma Cutter', icon: 'crosshair' },
    { id: uuid(), category_id: weldingEquip.id, name: 'Oxy-Acetylene Torch', icon: 'flame' },
    // Safety Equipment (5)
    { id: uuid(), category_id: safetyEquip.id, name: 'Safety Glasses', icon: 'eye' },
    { id: uuid(), category_id: safetyEquip.id, name: 'Welding Helmet', icon: 'shield' },
    { id: uuid(), category_id: safetyEquip.id, name: 'Dust Collection System', icon: 'wind' },
    { id: uuid(), category_id: safetyEquip.id, name: 'Hearing Protection', icon: 'volume-x' },
    { id: uuid(), category_id: safetyEquip.id, name: 'Fire Extinguisher', icon: 'alert-triangle' },
    // Finishing Tools (5)
    { id: uuid(), category_id: finishingTools.id, name: 'Random Orbital Sander', icon: 'circle' },
    { id: uuid(), category_id: finishingTools.id, name: 'Spray Gun (HVLP)', icon: 'droplet' },
    { id: uuid(), category_id: finishingTools.id, name: 'Belt Sander', icon: 'minus' },
    { id: uuid(), category_id: finishingTools.id, name: 'Buffing Wheel', icon: 'circle' },
    { id: uuid(), category_id: finishingTools.id, name: 'Heat Gun', icon: 'thermometer' },
    // Measurement & Layout (5)
    { id: uuid(), category_id: measureTools.id, name: 'Digital Caliper', icon: 'ruler' },
    { id: uuid(), category_id: measureTools.id, name: 'Combination Square', icon: 'square' },
    { id: uuid(), category_id: measureTools.id, name: 'Marking Gauge', icon: 'edit' },
    { id: uuid(), category_id: measureTools.id, name: 'Tape Measure', icon: 'ruler' },
    { id: uuid(), category_id: measureTools.id, name: 'Level', icon: 'minus' },
  ];
  const equipment = await insert('equipment_catalog', equipRows);
  console.log(`✅ ${equipment.length} equipment items`);

  // ──────────────────────────────────────
  // Skill Catalog (33 skills)
  // ──────────────────────────────────────
  const skillRows = [
    // Woodworking (7)
    { id: uuid(), service_category_id: woodworking.id, name: 'Joinery Basics' },
    { id: uuid(), service_category_id: woodworking.id, name: 'Wood Turning' },
    { id: uuid(), service_category_id: woodworking.id, name: 'Cabinet Making' },
    { id: uuid(), service_category_id: woodworking.id, name: 'Wood Carving' },
    { id: uuid(), service_category_id: woodworking.id, name: 'Finishing & Staining' },
    { id: uuid(), service_category_id: woodworking.id, name: 'Scroll Sawing' },
    { id: uuid(), service_category_id: woodworking.id, name: 'Router Techniques' },
    // Metalworking (6)
    { id: uuid(), service_category_id: metalworking.id, name: 'MIG Welding' },
    { id: uuid(), service_category_id: metalworking.id, name: 'TIG Welding' },
    { id: uuid(), service_category_id: metalworking.id, name: 'Metal Forging' },
    { id: uuid(), service_category_id: metalworking.id, name: 'Sheet Metal Fabrication' },
    { id: uuid(), service_category_id: metalworking.id, name: 'Grinding & Polishing' },
    { id: uuid(), service_category_id: metalworking.id, name: 'Plasma Cutting' },
    // 3D Printing & CNC (5)
    { id: uuid(), service_category_id: printing3d.id, name: '3D Modeling (CAD)' },
    { id: uuid(), service_category_id: printing3d.id, name: 'FDM Printing' },
    { id: uuid(), service_category_id: printing3d.id, name: 'Resin Printing' },
    { id: uuid(), service_category_id: printing3d.id, name: 'CNC Programming' },
    { id: uuid(), service_category_id: printing3d.id, name: 'Laser Cutting Design' },
    // Electronics (5)
    { id: uuid(), service_category_id: electronics.id, name: 'Soldering' },
    { id: uuid(), service_category_id: electronics.id, name: 'PCB Design' },
    { id: uuid(), service_category_id: electronics.id, name: 'Arduino Programming' },
    { id: uuid(), service_category_id: electronics.id, name: 'Circuit Analysis' },
    { id: uuid(), service_category_id: electronics.id, name: 'Raspberry Pi Projects' },
    // Automotive (5)
    { id: uuid(), service_category_id: automotive.id, name: 'Engine Diagnostics' },
    { id: uuid(), service_category_id: automotive.id, name: 'Brake Service' },
    { id: uuid(), service_category_id: automotive.id, name: 'Bodywork & Paint' },
    { id: uuid(), service_category_id: automotive.id, name: 'Electrical Wiring' },
    { id: uuid(), service_category_id: automotive.id, name: 'Suspension Setup' },
    // Ceramics & Pottery (5)
    { id: uuid(), service_category_id: ceramics.id, name: 'Wheel Throwing' },
    { id: uuid(), service_category_id: ceramics.id, name: 'Hand Building' },
    { id: uuid(), service_category_id: ceramics.id, name: 'Glazing Techniques' },
    { id: uuid(), service_category_id: ceramics.id, name: 'Kiln Operation' },
    { id: uuid(), service_category_id: ceramics.id, name: 'Sculpture' },
  ];
  const skills = await insert('skill_catalog', skillRows);
  console.log(`✅ ${skills.length} skills`);

  // ──────────────────────────────────────
  // Time Slot Types (3)
  // ──────────────────────────────────────
  const timeSlotRows = [
    { id: uuid(), name: 'Morning', start_time: '08:00', end_time: '12:00' },
    { id: uuid(), name: 'Afternoon', start_time: '12:00', end_time: '17:00' },
    { id: uuid(), name: 'Evening', start_time: '17:00', end_time: '21:00' },
  ];
  const timeSlots = await insert('time_slot_types', timeSlotRows);
  console.log(`✅ ${timeSlots.length} time slots`);
  const [morning, afternoon, evening] = timeSlots;

  // ──────────────────────────────────────
  // Addon Catalog (2)
  // ──────────────────────────────────────
  const addonRows = [
    { id: uuid(), name: 'Expert Mentorship', description: 'One-on-one guidance from the host throughout your session', default_price: 25.00 },
    { id: uuid(), name: 'Consumable Materials', description: 'Wood, metal, filament, or other materials provided by the host', default_price: 15.00 },
  ];
  const addons = await insert('addon_catalog', addonRows);
  console.log(`✅ ${addons.length} add-ons`);
  const [mentorship, materials] = addons;

  // ──────────────────────────────────────
  // Users — 5 hosts + 2 bookers
  // ──────────────────────────────────────
  const hostRows = [
    { id: uuid(), auth_id: 'host-auth-001', email: 'marcus.turner@example.com', full_name: 'Marcus Turner', role: 'HOST', bio: 'Master woodworker with 20 years of experience. I love sharing the craft and helping beginners discover the joy of working with wood.', phone: '316-555-0101', location: { city: 'Wichita', state: 'KS', lat: 37.6872, lng: -97.3301 }, avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', created_at: now, updated_at: now },
    { id: uuid(), auth_id: 'host-auth-002', email: 'sarah.chen@example.com', full_name: 'Sarah Chen', role: 'HOST', bio: 'Metalworker and sculptor. My studio is open for anyone who wants to learn welding, forging, or just make something cool out of steel.', phone: '316-555-0102', location: { city: 'Wichita', state: 'KS', lat: 37.6922, lng: -97.3375 }, avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', created_at: now, updated_at: now },
    { id: uuid(), auth_id: 'host-auth-003', email: 'david.okafor@example.com', full_name: 'David Okafor', role: 'HOST', bio: 'Digital fabrication enthusiast. 3D printing, CNC routing, laser cutting — if it involves a computer and a machine, I am your guy.', phone: '316-555-0103', location: { city: 'Wichita', state: 'KS', lat: 37.6840, lng: -97.3450 }, avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', created_at: now, updated_at: now },
    { id: uuid(), auth_id: 'host-auth-004', email: 'maria.garcia@example.com', full_name: 'Maria Garcia', role: 'HOST', bio: 'Ceramic artist with a focus on wheel throwing and hand building. My studio has two kick wheels and a gas kiln.', phone: '316-555-0104', location: { city: 'Wichita', state: 'KS', lat: 37.6950, lng: -97.3200 }, avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', created_at: now, updated_at: now },
    { id: uuid(), auth_id: 'host-auth-005', email: 'james.wright@example.com', full_name: 'James Wright', role: 'HOST', bio: 'Retired shop teacher turned workshop host. Woodworking and metalworking are my two passions.', phone: '316-555-0105', location: { city: 'Wichita', state: 'KS', lat: 37.6800, lng: -97.3500 }, avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', created_at: now, updated_at: now },
  ];
  const hosts = await insert('users', hostRows);
  console.log(`✅ ${hosts.length} hosts`);

  const bookerRows = [
    { id: uuid(), auth_id: 'booker-auth-001', email: 'alex.kim@example.com', full_name: 'Alex Kim', role: 'BOOKER', bio: 'Software developer looking to learn hands-on skills on weekends.', phone: '316-555-0201', location: { city: 'Wichita', state: 'KS', lat: 37.6890, lng: -97.3360 }, avatar_url: 'https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=200', created_at: now, updated_at: now },
    { id: uuid(), auth_id: 'booker-auth-002', email: 'priya.patel@example.com', full_name: 'Priya Patel', role: 'BOOKER', bio: 'Architecture student wanting to prototype designs in real materials.', phone: '316-555-0202', location: { city: 'Wichita', state: 'KS', lat: 37.6910, lng: -97.3280 }, avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', created_at: now, updated_at: now },
  ];
  const bookers = await insert('users', bookerRows);
  console.log(`✅ ${bookers.length} bookers`);

  // ──────────────────────────────────────
  // Workshops (6)
  // ──────────────────────────────────────
  const workshopRows = [
    { id: uuid(), host_id: hosts[0].id, service_category_id: woodworking.id, name: "Turner's Timber Studio", description: 'A fully equipped woodworking shop in downtown Wichita. Table saw, band saw, lathe, and a full set of hand tools.', address: '234 E Douglas Ave, Wichita, KS 67202', latitude: 37.6872, longitude: -97.3301, hourly_rate: 45.00, photo_urls: ['https://images.unsplash.com/photo-1572297891079-cf1a3b70e56c?w=800', 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800'], avg_rating: 4.8, total_reviews: 12, is_active: true, created_at: now, updated_at: now },
    { id: uuid(), host_id: hosts[4].id, service_category_id: woodworking.id, name: "Wright's Woodshop", description: 'Old-school woodshop with a modern touch. Great for learning joinery, cabinet making, and finishing techniques.', address: '501 S Broadway St, Wichita, KS 67202', latitude: 37.6800, longitude: -97.3500, hourly_rate: 40.00, photo_urls: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800', 'https://images.unsplash.com/photo-1597753822799-4dd6a5e5e781?w=800'], avg_rating: 4.6, total_reviews: 8, is_active: true, created_at: now, updated_at: now },
    { id: uuid(), host_id: hosts[1].id, service_category_id: metalworking.id, name: "Chen's Forge & Fab", description: 'MIG, TIG, and stick welding stations. Plasma cutter and a 2-ton power hammer for forging.', address: '1020 E 1st St N, Wichita, KS 67214', latitude: 37.6922, longitude: -97.3375, hourly_rate: 55.00, photo_urls: ['https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800', 'https://images.unsplash.com/photo-1567361808960-dec9cb578182?w=800'], avg_rating: 4.9, total_reviews: 15, is_active: true, created_at: now, updated_at: now },
    { id: uuid(), host_id: hosts[4].id, service_category_id: metalworking.id, name: "Wright's Metal Lab", description: 'Beginner-friendly metal shop. Learn welding basics, sheet metal work, and grinding in a safe environment.', address: '510 S Broadway St, Wichita, KS 67202', latitude: 37.6805, longitude: -97.3505, hourly_rate: 50.00, photo_urls: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800', 'https://images.unsplash.com/photo-1605618500665-486a05e9d4dd?w=800'], avg_rating: 4.5, total_reviews: 6, is_active: true, created_at: now, updated_at: now },
    { id: uuid(), host_id: hosts[2].id, service_category_id: printing3d.id, name: 'Okafor Digital Lab', description: 'Six 3D printers (FDM + resin), a Shapeoko CNC router, and a 60W laser cutter.', address: '325 E Douglas Ave, Wichita, KS 67202', latitude: 37.6840, longitude: -97.3450, hourly_rate: 60.00, photo_urls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800', 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800'], avg_rating: 4.7, total_reviews: 10, is_active: true, created_at: now, updated_at: now },
    { id: uuid(), host_id: hosts[3].id, service_category_id: ceramics.id, name: 'Garcia Clay Studio', description: 'Two pottery wheels, a slab roller, and a gas kiln. Glazes and clay included for beginners.', address: '720 E Douglas Ave, Wichita, KS 67202', latitude: 37.6950, longitude: -97.3200, hourly_rate: 35.00, photo_urls: ['https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'], avg_rating: 4.9, total_reviews: 18, is_active: true, created_at: now, updated_at: now },
  ];
  const workshops = await insert('workshops', workshopRows);
  console.log(`✅ ${workshops.length} workshops`);

  // ──────────────────────────────────────
  // Workshop Equipment
  // ──────────────────────────────────────
  // equipment indices: 0=TableSaw,1=BandSaw,2=DrillPress,3=RouterTable,4=Planer,5=Jointer,6=Lathe,7=MiterSaw
  // 8=ChiselSet,9=HandPlane,10=ClampSet,11=HammerSet,12=ScrewdriverSet,13=FileSet
  // 14=CNCRouter,15=3DPrinterFDM,16=3DPrinterResin,17=LaserCutter,18=VinylCutter
  // 19=MIGWelder,20=TIGWelder,21=StickWelder,22=PlasmaCutter,23=OxyAceTorch
  // 24=SafetyGlasses,25=WeldingHelmet,26=DustCollection,27=HearingProtection,28=FireExtinguisher
  // 29=RandOrbitSander,30=SprayGun,31=BeltSander,32=BuffingWheel,33=HeatGun
  // 34=DigitalCaliper,35=CombSquare,36=MarkingGauge,37=TapeMeasure,38=Level

  const weMapping = [
    { wsIdx: 0, eqIdxs: [0, 1, 2, 6, 8, 9, 10, 26] },  // Turner's Timber
    { wsIdx: 1, eqIdxs: [0, 3, 4, 5, 7, 29, 35] },      // Wright's Woodshop
    { wsIdx: 2, eqIdxs: [19, 20, 22, 23, 25, 28, 31] },  // Chen's Forge
    { wsIdx: 3, eqIdxs: [19, 21, 13, 24, 25, 34] },      // Wright's Metal Lab
    { wsIdx: 4, eqIdxs: [14, 15, 16, 17, 18, 34] },      // Okafor Digital Lab
    { wsIdx: 5, eqIdxs: [24, 27, 37, 38, 11] },           // Garcia Clay Studio
  ];

  const weRows = weMapping.flatMap(({ wsIdx, eqIdxs }) =>
    eqIdxs.map((eqIdx) => ({
      id: uuid(),
      workshop_id: workshops[wsIdx].id,
      equipment_id: equipment[eqIdx].id,
    }))
  );
  const workshopEquip = await insert('workshop_equipment', weRows);
  console.log(`✅ ${workshopEquip.length} workshop-equipment links`);

  // ──────────────────────────────────────
  // Workshop Availability (next 7 days)
  // ──────────────────────────────────────
  const today = new Date();
  const availRows: any[] = [];
  for (const ws of workshops) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      const dateStr = date.toISOString().split('T')[0];

      for (const ts of timeSlots) {
        availRows.push({
          id: uuid(),
          workshop_id: ws.id,
          time_slot_type_id: ts.id,
          available_date: dateStr,
          is_available: Math.random() > 0.2,
        });
      }
    }
  }
  // Insert in batches (Supabase REST has row limits)
  for (let i = 0; i < availRows.length; i += 50) {
    await insert('workshop_availability', availRows.slice(i, i + 50));
  }
  console.log(`✅ ${availRows.length} availability slots`);

  // ──────────────────────────────────────
  // Completed bookings (2) with projects + snapshots
  // ──────────────────────────────────────
  const pastDate1 = new Date(today);
  pastDate1.setDate(today.getDate() - 5);
  const pastDate2 = new Date(today);
  pastDate2.setDate(today.getDate() - 3);

  const booking1Id = uuid();
  const booking2Id = uuid();

  const bookingRows = [
    { id: booking1Id, booker_id: bookers[0].id, workshop_id: workshops[0].id, time_slot_type_id: morning.id, booking_date: pastDate1.toISOString().split('T')[0], status: 'COMPLETED', base_price: 45.00, total_price: 85.00, safety_acknowledged: true, created_at: now, updated_at: now },
    { id: booking2Id, booker_id: bookers[1].id, workshop_id: workshops[2].id, time_slot_type_id: afternoon.id, booking_date: pastDate2.toISOString().split('T')[0], status: 'COMPLETED', base_price: 55.00, total_price: 80.00, safety_acknowledged: true, created_at: now, updated_at: now },
  ];
  await insert('bookings', bookingRows);

  // Booking addons
  await insert('booking_addons', [
    { id: uuid(), booking_id: booking1Id, addon_id: mentorship.id, price_at_booking: 25.00 },
    { id: uuid(), booking_id: booking1Id, addon_id: materials.id, price_at_booking: 15.00 },
    { id: uuid(), booking_id: booking2Id, addon_id: mentorship.id, price_at_booking: 25.00 },
  ]);

  // Projects
  const project1Id = uuid();
  const project2Id = uuid();
  await insert('projects', [
    { id: project1Id, booking_id: booking1Id, title: 'First Dovetail Joint', description: 'Learning hand-cut dovetail joinery with Marcus', created_at: now, updated_at: now },
    { id: project2Id, booking_id: booking2Id, title: 'Steel Bookend Set', description: 'MIG welding project to create a pair of steel bookends', created_at: now, updated_at: now },
  ]);

  // Snapshots for project 1
  const snap1Notes = ['Marking out the pins', 'Cutting the tails', 'Final fit and glue-up'];
  const snap1Rows = snap1Notes.map((note, i) => ({
    id: uuid(),
    project_id: project1Id,
    sequence_number: i + 1,
    before_photo_url: `https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=${(i + 1) * 10}`,
    after_photo_url: `https://images.unsplash.com/photo-1597753822799-4dd6a5e5e781?w=600&q=${(i + 1) * 10}`,
    notes: note,
    created_at: now,
  }));
  const snaps1 = await insert('snapshots', snap1Rows);

  // Snapshot tools for project 1
  const snapToolRows1 = snaps1.flatMap((s: any) => [
    { id: uuid(), snapshot_id: s.id, equipment_id: equipment[8].id },
    { id: uuid(), snapshot_id: s.id, equipment_id: equipment[9].id },
  ]);
  await insert('snapshot_tools', snapToolRows1);

  // Snapshots for project 2
  const snap2Notes = ['Cutting steel plates', 'Tack welding the frame', 'Grinding and finishing'];
  const snap2Rows = snap2Notes.map((note, i) => ({
    id: uuid(),
    project_id: project2Id,
    sequence_number: i + 1,
    before_photo_url: `https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=${(i + 1) * 10}`,
    after_photo_url: `https://images.unsplash.com/photo-1567361808960-dec9cb578182?w=600&q=${(i + 1) * 10}`,
    notes: note,
    created_at: now,
  }));
  const snaps2 = await insert('snapshots', snap2Rows);

  const snapToolRows2 = snaps2.map((s: any) => ({
    id: uuid(),
    snapshot_id: s.id,
    equipment_id: equipment[19].id,
  }));
  await insert('snapshot_tools', snapToolRows2);

  console.log(`✅ 2 completed bookings with projects + 6 snapshots`);

  // Reviews
  await insert('reviews', [
    { id: uuid(), booking_id: booking1Id, reviewer_id: bookers[0].id, rating: 5, comment: 'Marcus is an incredible teacher. I went from zero woodworking knowledge to cutting dovetails in one session!', created_at: now },
    { id: uuid(), booking_id: booking2Id, reviewer_id: bookers[1].id, rating: 5, comment: 'Sarah made welding approachable and fun. The bookends turned out great and I feel confident to try more projects.', created_at: now },
  ]);
  console.log(`✅ 2 reviews`);

  // Pending booking
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 2);
  await insert('bookings', [{
    id: uuid(), booker_id: bookers[0].id, workshop_id: workshops[4].id, time_slot_type_id: morning.id,
    booking_date: futureDate.toISOString().split('T')[0], status: 'PENDING', base_price: 60.00, total_price: 75.00,
    safety_acknowledged: true, created_at: now, updated_at: now,
  }]);
  console.log(`✅ 1 pending booking`);

  console.log('\n🎉 Seed complete!');
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
