import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Vulcan database...');

  // ──────────────────────────────────────
  // Service Categories (6)
  // ──────────────────────────────────────
  const serviceCategories = await Promise.all([
    prisma.serviceCategory.create({ data: { name: 'Woodworking', icon: 'hammer', description: 'Furniture, cabinetry, carving, and turning' } }),
    prisma.serviceCategory.create({ data: { name: 'Metalworking', icon: 'wrench', description: 'Welding, forging, machining, and fabrication' } }),
    prisma.serviceCategory.create({ data: { name: '3D Printing & CNC', icon: 'cpu', description: 'Additive manufacturing, CNC routing, and laser cutting' } }),
    prisma.serviceCategory.create({ data: { name: 'Electronics', icon: 'zap', description: 'Soldering, PCB design, Arduino, and Raspberry Pi' } }),
    prisma.serviceCategory.create({ data: { name: 'Automotive', icon: 'truck', description: 'Engine work, bodywork, restoration, and detailing' } }),
    prisma.serviceCategory.create({ data: { name: 'Ceramics & Pottery', icon: 'coffee', description: 'Wheel throwing, hand building, glazing, and kiln firing' } }),
  ]);

  const [woodworking, metalworking, printing3d, electronics, automotive, ceramics] = serviceCategories;

  // ──────────────────────────────────────
  // Equipment Categories (7)
  // ──────────────────────────────────────
  const equipmentCategories = await Promise.all([
    prisma.equipmentCategory.create({ data: { name: 'Power Tools', icon: 'zap' } }),
    prisma.equipmentCategory.create({ data: { name: 'Hand Tools', icon: 'tool' } }),
    prisma.equipmentCategory.create({ data: { name: 'CNC & Digital Fabrication', icon: 'cpu' } }),
    prisma.equipmentCategory.create({ data: { name: 'Welding Equipment', icon: 'thermometer' } }),
    prisma.equipmentCategory.create({ data: { name: 'Safety Equipment', icon: 'shield' } }),
    prisma.equipmentCategory.create({ data: { name: 'Finishing Tools', icon: 'paintBucket' } }),
    prisma.equipmentCategory.create({ data: { name: 'Measurement & Layout', icon: 'ruler' } }),
  ]);

  const [powerTools, handTools, cncDigital, weldingEquip, safetyEquip, finishingTools, measureTools] = equipmentCategories;

  // ──────────────────────────────────────
  // Equipment Catalog (39 items)
  // ──────────────────────────────────────
  const equipment = await Promise.all([
    // Power Tools (8)
    prisma.equipmentCatalog.create({ data: { categoryId: powerTools.id, name: 'Table Saw', icon: 'disc' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: powerTools.id, name: 'Band Saw', icon: 'disc' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: powerTools.id, name: 'Drill Press', icon: 'target' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: powerTools.id, name: 'Router Table', icon: 'grid' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: powerTools.id, name: 'Planer', icon: 'layers' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: powerTools.id, name: 'Jointer', icon: 'minus' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: powerTools.id, name: 'Lathe', icon: 'rotate-cw' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: powerTools.id, name: 'Miter Saw', icon: 'triangle' } }),
    // Hand Tools (6)
    prisma.equipmentCatalog.create({ data: { categoryId: handTools.id, name: 'Chisel Set', icon: 'edit-3' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: handTools.id, name: 'Hand Plane', icon: 'minus' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: handTools.id, name: 'Clamp Set', icon: 'maximize' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: handTools.id, name: 'Hammer Set', icon: 'tool' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: handTools.id, name: 'Screwdriver Set', icon: 'tool' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: handTools.id, name: 'File Set', icon: 'file' } }),
    // CNC & Digital Fabrication (5)
    prisma.equipmentCatalog.create({ data: { categoryId: cncDigital.id, name: 'CNC Router', icon: 'cpu' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: cncDigital.id, name: '3D Printer (FDM)', icon: 'box' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: cncDigital.id, name: '3D Printer (Resin)', icon: 'droplet' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: cncDigital.id, name: 'Laser Cutter', icon: 'crosshair' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: cncDigital.id, name: 'Vinyl Cutter', icon: 'scissors' } }),
    // Welding Equipment (5)
    prisma.equipmentCatalog.create({ data: { categoryId: weldingEquip.id, name: 'MIG Welder', icon: 'zap' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: weldingEquip.id, name: 'TIG Welder', icon: 'zap' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: weldingEquip.id, name: 'Stick Welder', icon: 'zap' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: weldingEquip.id, name: 'Plasma Cutter', icon: 'crosshair' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: weldingEquip.id, name: 'Oxy-Acetylene Torch', icon: 'flame' } }),
    // Safety Equipment (5)
    prisma.equipmentCatalog.create({ data: { categoryId: safetyEquip.id, name: 'Safety Glasses', icon: 'eye' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: safetyEquip.id, name: 'Welding Helmet', icon: 'shield' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: safetyEquip.id, name: 'Dust Collection System', icon: 'wind' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: safetyEquip.id, name: 'Hearing Protection', icon: 'volume-x' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: safetyEquip.id, name: 'Fire Extinguisher', icon: 'alert-triangle' } }),
    // Finishing Tools (5)
    prisma.equipmentCatalog.create({ data: { categoryId: finishingTools.id, name: 'Random Orbital Sander', icon: 'circle' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: finishingTools.id, name: 'Spray Gun (HVLP)', icon: 'droplet' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: finishingTools.id, name: 'Belt Sander', icon: 'minus' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: finishingTools.id, name: 'Buffing Wheel', icon: 'circle' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: finishingTools.id, name: 'Heat Gun', icon: 'thermometer' } }),
    // Measurement & Layout (5)
    prisma.equipmentCatalog.create({ data: { categoryId: measureTools.id, name: 'Digital Caliper', icon: 'ruler' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: measureTools.id, name: 'Combination Square', icon: 'square' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: measureTools.id, name: 'Marking Gauge', icon: 'edit' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: measureTools.id, name: 'Tape Measure', icon: 'ruler' } }),
    prisma.equipmentCatalog.create({ data: { categoryId: measureTools.id, name: 'Level', icon: 'minus' } }),
  ]);

  // ──────────────────────────────────────
  // Skill Catalog (33 skills)
  // ──────────────────────────────────────
  await Promise.all([
    // Woodworking (7)
    prisma.skillCatalog.create({ data: { serviceCategoryId: woodworking.id, name: 'Joinery Basics' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: woodworking.id, name: 'Wood Turning' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: woodworking.id, name: 'Cabinet Making' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: woodworking.id, name: 'Wood Carving' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: woodworking.id, name: 'Finishing & Staining' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: woodworking.id, name: 'Scroll Sawing' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: woodworking.id, name: 'Router Techniques' } }),
    // Metalworking (6)
    prisma.skillCatalog.create({ data: { serviceCategoryId: metalworking.id, name: 'MIG Welding' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: metalworking.id, name: 'TIG Welding' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: metalworking.id, name: 'Metal Forging' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: metalworking.id, name: 'Sheet Metal Fabrication' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: metalworking.id, name: 'Grinding & Polishing' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: metalworking.id, name: 'Plasma Cutting' } }),
    // 3D Printing & CNC (5)
    prisma.skillCatalog.create({ data: { serviceCategoryId: printing3d.id, name: '3D Modeling (CAD)' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: printing3d.id, name: 'FDM Printing' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: printing3d.id, name: 'Resin Printing' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: printing3d.id, name: 'CNC Programming' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: printing3d.id, name: 'Laser Cutting Design' } }),
    // Electronics (5)
    prisma.skillCatalog.create({ data: { serviceCategoryId: electronics.id, name: 'Soldering' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: electronics.id, name: 'PCB Design' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: electronics.id, name: 'Arduino Programming' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: electronics.id, name: 'Circuit Analysis' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: electronics.id, name: 'Raspberry Pi Projects' } }),
    // Automotive (5)
    prisma.skillCatalog.create({ data: { serviceCategoryId: automotive.id, name: 'Engine Diagnostics' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: automotive.id, name: 'Brake Service' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: automotive.id, name: 'Bodywork & Paint' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: automotive.id, name: 'Electrical Wiring' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: automotive.id, name: 'Suspension Setup' } }),
    // Ceramics & Pottery (5)
    prisma.skillCatalog.create({ data: { serviceCategoryId: ceramics.id, name: 'Wheel Throwing' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: ceramics.id, name: 'Hand Building' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: ceramics.id, name: 'Glazing Techniques' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: ceramics.id, name: 'Kiln Operation' } }),
    prisma.skillCatalog.create({ data: { serviceCategoryId: ceramics.id, name: 'Sculpture' } }),
  ]);

  // ──────────────────────────────────────
  // Time Slot Types (3)
  // ──────────────────────────────────────
  const timeSlots = await Promise.all([
    prisma.timeSlotType.create({ data: { name: 'Morning', startTime: '08:00', endTime: '12:00' } }),
    prisma.timeSlotType.create({ data: { name: 'Afternoon', startTime: '12:00', endTime: '17:00' } }),
    prisma.timeSlotType.create({ data: { name: 'Evening', startTime: '17:00', endTime: '21:00' } }),
  ]);

  const [morning, afternoon, evening] = timeSlots;

  // ──────────────────────────────────────
  // Addon Catalog (2)
  // ──────────────────────────────────────
  const addons = await Promise.all([
    prisma.addonCatalog.create({ data: { name: 'Expert Mentorship', description: 'One-on-one guidance from the host throughout your session', defaultPrice: 25.00 } }),
    prisma.addonCatalog.create({ data: { name: 'Consumable Materials', description: 'Wood, metal, filament, or other materials provided by the host', defaultPrice: 15.00 } }),
  ]);

  const [mentorship, materials] = addons;

  // ──────────────────────────────────────
  // Users — 5 hosts + 2 bookers
  // ──────────────────────────────────────
  const hosts = await Promise.all([
    prisma.user.create({ data: {
      email: 'marcus.turner@example.com', password: 'password', fullName: 'Marcus Turner', role: 'HOST',
      bio: 'Master woodworker with 20 years of experience. I love sharing the craft and helping beginners discover the joy of working with wood.',
      phone: '316-555-0101',
      location: { city: 'Wichita', state: 'KS', lat: 37.6872, lng: -97.3301 },
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    }}),
    prisma.user.create({ data: {
      email: 'sarah.chen@example.com', password: 'password', fullName: 'Sarah Chen', role: 'HOST',
      bio: 'Metalworker and sculptor. My studio is open for anyone who wants to learn welding, forging, or just make something cool out of steel.',
      phone: '316-555-0102',
      location: { city: 'Wichita', state: 'KS', lat: 37.6922, lng: -97.3375 },
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    }}),
    prisma.user.create({ data: {
      email: 'david.okafor@example.com', password: 'password', fullName: 'David Okafor', role: 'HOST',
      bio: 'Digital fabrication enthusiast. 3D printing, CNC routing, laser cutting — if it involves a computer and a machine, I am your guy.',
      phone: '316-555-0103',
      location: { city: 'Wichita', state: 'KS', lat: 37.6840, lng: -97.3450 },
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    }}),
    prisma.user.create({ data: {
      email: 'maria.garcia@example.com', password: 'password', fullName: 'Maria Garcia', role: 'HOST',
      bio: 'Ceramic artist with a focus on wheel throwing and hand building. My studio has two kick wheels and a gas kiln.',
      phone: '316-555-0104',
      location: { city: 'Wichita', state: 'KS', lat: 37.6950, lng: -97.3200 },
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    }}),
    prisma.user.create({ data: {
      email: 'james.wright@example.com', password: 'password', fullName: 'James Wright', role: 'HOST',
      bio: 'Retired shop teacher turned workshop host. Woodworking and metalworking are my two passions.',
      phone: '316-555-0105',
      location: { city: 'Wichita', state: 'KS', lat: 37.6800, lng: -97.3500 },
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    }}),
  ]);

  const bookers = await Promise.all([
    prisma.user.create({ data: {
      email: 'alex.kim@example.com', password: 'password', fullName: 'Alex Kim', role: 'BOOKER',
      bio: 'Software developer looking to learn hands-on skills on weekends.',
      phone: '316-555-0201',
      location: { city: 'Wichita', state: 'KS', lat: 37.6890, lng: -97.3360 },
      avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=200',
    }}),
    prisma.user.create({ data: {
      email: 'priya.patel@example.com', password: 'password', fullName: 'Priya Patel', role: 'BOOKER',
      bio: 'Architecture student wanting to prototype designs in real materials.',
      phone: '316-555-0202',
      location: { city: 'Wichita', state: 'KS', lat: 37.6910, lng: -97.3280 },
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    }}),
  ]);

  // ──────────────────────────────────────
  // Workshops (6) — Wichita, KS area
  // ──────────────────────────────────────
  const workshops = await Promise.all([
    // Woodworking #1
    prisma.workshop.create({ data: {
      hostId: hosts[0].id, serviceCategoryId: woodworking.id,
      name: 'Turner\'s Timber Studio', description: 'A fully equipped woodworking shop in downtown Wichita. Table saw, band saw, lathe, and a full set of hand tools. Perfect for beginners and hobbyists.',
      address: '234 E Douglas Ave, Wichita, KS 67202', latitude: 37.6872, longitude: -97.3301,
      hourlyRate: 45.00,
      photoUrls: [
        'https://images.unsplash.com/photo-1572297891079-cf1a3b70e56c?w=800',
        'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800',
      ],
      avgRating: 4.8, totalReviews: 12,
    }}),
    // Woodworking #2
    prisma.workshop.create({ data: {
      hostId: hosts[4].id, serviceCategoryId: woodworking.id,
      name: 'Wright\'s Woodshop', description: 'Old-school woodshop with a modern touch. Great for learning joinery, cabinet making, and finishing techniques.',
      address: '501 S Broadway St, Wichita, KS 67202', latitude: 37.6800, longitude: -97.3500,
      hourlyRate: 40.00,
      photoUrls: [
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800',
        'https://images.unsplash.com/photo-1597753822799-4dd6a5e5e781?w=800',
      ],
      avgRating: 4.6, totalReviews: 8,
    }}),
    // Metalworking #1
    prisma.workshop.create({ data: {
      hostId: hosts[1].id, serviceCategoryId: metalworking.id,
      name: 'Chen\'s Forge & Fab', description: 'MIG, TIG, and stick welding stations. Plasma cutter and a 2-ton power hammer for forging. Come make sparks fly.',
      address: '1020 E 1st St N, Wichita, KS 67214', latitude: 37.6922, longitude: -97.3375,
      hourlyRate: 55.00,
      photoUrls: [
        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800',
        'https://images.unsplash.com/photo-1567361808960-dec9cb578182?w=800',
      ],
      avgRating: 4.9, totalReviews: 15,
    }}),
    // Metalworking #2
    prisma.workshop.create({ data: {
      hostId: hosts[4].id, serviceCategoryId: metalworking.id,
      name: 'Wright\'s Metal Lab', description: 'Beginner-friendly metal shop. Learn welding basics, sheet metal work, and grinding in a safe environment.',
      address: '510 S Broadway St, Wichita, KS 67202', latitude: 37.6805, longitude: -97.3505,
      hourlyRate: 50.00,
      photoUrls: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
        'https://images.unsplash.com/photo-1605618500665-486a05e9d4dd?w=800',
      ],
      avgRating: 4.5, totalReviews: 6,
    }}),
    // 3D Printing
    prisma.workshop.create({ data: {
      hostId: hosts[2].id, serviceCategoryId: printing3d.id,
      name: 'Okafor Digital Lab', description: 'Six 3D printers (FDM + resin), a Shapeoko CNC router, and a 60W laser cutter. Design on our workstations or bring your own files.',
      address: '325 E Douglas Ave, Wichita, KS 67202', latitude: 37.6840, longitude: -97.3450,
      hourlyRate: 60.00,
      photoUrls: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
        'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800',
      ],
      avgRating: 4.7, totalReviews: 10,
    }}),
    // Ceramics & Pottery
    prisma.workshop.create({ data: {
      hostId: hosts[3].id, serviceCategoryId: ceramics.id,
      name: 'Garcia Clay Studio', description: 'Two pottery wheels, a slab roller, and a gas kiln. Glazes and clay included for beginners. Come get your hands dirty!',
      address: '720 E Douglas Ave, Wichita, KS 67202', latitude: 37.6950, longitude: -97.3200,
      hourlyRate: 35.00,
      photoUrls: [
        'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800',
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
      ],
      avgRating: 4.9, totalReviews: 18,
    }}),
  ]);

  // ──────────────────────────────────────
  // Workshop Equipment (5–8 items each)
  // ──────────────────────────────────────
  // equipment array indices: 0=TableSaw,1=BandSaw,2=DrillPress,3=RouterTable,4=Planer,5=Jointer,6=Lathe,7=MiterSaw
  // 8=ChiselSet,9=HandPlane,10=ClampSet,11=HammerSet,12=ScrewdriverSet,13=FileSet
  // 14=CNCRouter,15=3DPrinterFDM,16=3DPrinterResin,17=LaserCutter,18=VinylCutter
  // 19=MIGWelder,20=TIGWelder,21=StickWelder,22=PlasmaCutter,23=OxyAceTorch
  // 24=SafetyGlasses,25=WeldingHelmet,26=DustCollection,27=HearingProtection,28=FireExtinguisher
  // 29=RandOrbitSander,30=SprayGun,31=BeltSander,32=BuffingWheel,33=HeatGun
  // 34=DigitalCaliper,35=CombinationSquare,36=MarkingGauge,37=TapeMeasure,38=Level

  const workshopEquipmentData = [
    // Turner's Timber Studio (woodworking #1) — 8 items
    { workshopId: workshops[0].id, equipmentIds: [0, 1, 2, 6, 8, 9, 10, 26] },
    // Wright's Woodshop (woodworking #2) — 7 items
    { workshopId: workshops[1].id, equipmentIds: [0, 3, 4, 5, 7, 29, 35] },
    // Chen's Forge & Fab (metalworking #1) — 7 items
    { workshopId: workshops[2].id, equipmentIds: [19, 20, 22, 23, 25, 28, 31] },
    // Wright's Metal Lab (metalworking #2) — 6 items
    { workshopId: workshops[3].id, equipmentIds: [19, 21, 13, 24, 25, 34] },
    // Okafor Digital Lab (3D printing) — 6 items
    { workshopId: workshops[4].id, equipmentIds: [14, 15, 16, 17, 18, 34] },
    // Garcia Clay Studio (ceramics) — 5 items
    { workshopId: workshops[5].id, equipmentIds: [24, 27, 37, 38, 11] },
  ];

  for (const we of workshopEquipmentData) {
    await Promise.all(
      we.equipmentIds.map((eqIdx) =>
        prisma.workshopEquipment.create({
          data: { workshopId: we.workshopId, equipmentId: equipment[eqIdx].id },
        })
      )
    );
  }

  // ──────────────────────────────────────
  // Workshop Availability (next 7 days)
  // ──────────────────────────────────────
  const today = new Date();
  for (const ws of workshops) {
    const slots = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      const dateStr = date.toISOString().split('T')[0];

      for (const ts of timeSlots) {
        // Randomly make ~80% of slots available
        slots.push({
          workshopId: ws.id,
          timeSlotTypeId: ts.id,
          availableDate: new Date(dateStr),
          isAvailable: Math.random() > 0.2,
        });
      }
    }
    await prisma.workshopAvailability.createMany({ data: slots });
  }

  // ──────────────────────────────────────
  // Completed bookings (2) with projects + snapshots
  // ──────────────────────────────────────
  const pastDate1 = new Date(today);
  pastDate1.setDate(today.getDate() - 5);
  const pastDate2 = new Date(today);
  pastDate2.setDate(today.getDate() - 3);

  const booking1 = await prisma.booking.create({ data: {
    bookerId: bookers[0].id, workshopId: workshops[0].id, timeSlotTypeId: morning.id,
    bookingDate: pastDate1, status: 'COMPLETED', basePrice: 45.00, totalPrice: 85.00, safetyAcknowledged: true,
    addons: { create: [
      { addonId: mentorship.id, priceAtBooking: 25.00 },
      { addonId: materials.id, priceAtBooking: 15.00 },
    ]},
  }});

  const project1 = await prisma.project.create({ data: {
    bookingId: booking1.id, title: 'First Dovetail Joint', description: 'Learning hand-cut dovetail joinery with Marcus',
  }});

  for (let i = 1; i <= 3; i++) {
    await prisma.snapshot.create({ data: {
      projectId: project1.id, sequenceNumber: i,
      beforePhotoUrl: `https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=${i}0`,
      afterPhotoUrl: `https://images.unsplash.com/photo-1597753822799-4dd6a5e5e781?w=600&q=${i}0`,
      notes: i === 1 ? 'Marking out the pins' : i === 2 ? 'Cutting the tails' : 'Final fit and glue-up',
      tools: { create: [{ equipmentId: equipment[8].id }, { equipmentId: equipment[9].id }] },
    }});
  }

  const booking2 = await prisma.booking.create({ data: {
    bookerId: bookers[1].id, workshopId: workshops[2].id, timeSlotTypeId: afternoon.id,
    bookingDate: pastDate2, status: 'COMPLETED', basePrice: 55.00, totalPrice: 80.00, safetyAcknowledged: true,
    addons: { create: [{ addonId: mentorship.id, priceAtBooking: 25.00 }] },
  }});

  const project2 = await prisma.project.create({ data: {
    bookingId: booking2.id, title: 'Steel Bookend Set', description: 'MIG welding project to create a pair of steel bookends',
  }});

  for (let i = 1; i <= 3; i++) {
    await prisma.snapshot.create({ data: {
      projectId: project2.id, sequenceNumber: i,
      beforePhotoUrl: `https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=${i}0`,
      afterPhotoUrl: `https://images.unsplash.com/photo-1567361808960-dec9cb578182?w=600&q=${i}0`,
      notes: i === 1 ? 'Cutting steel plates' : i === 2 ? 'Tack welding the frame' : 'Grinding and finishing',
      tools: { create: [{ equipmentId: equipment[19].id }] },
    }});
  }

  // Reviews for completed bookings
  await prisma.review.create({ data: {
    bookingId: booking1.id, reviewerId: bookers[0].id, rating: 5,
    comment: 'Marcus is an incredible teacher. I went from zero woodworking knowledge to cutting dovetails in one session!',
  }});

  await prisma.review.create({ data: {
    bookingId: booking2.id, reviewerId: bookers[1].id, rating: 5,
    comment: 'Sarah made welding approachable and fun. The bookends turned out great and I feel confident to try more projects.',
  }});

  // ──────────────────────────────────────
  // Pending booking (1)
  // ──────────────────────────────────────
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 2);

  await prisma.booking.create({ data: {
    bookerId: bookers[0].id, workshopId: workshops[4].id, timeSlotTypeId: morning.id,
    bookingDate: futureDate, status: 'PENDING', basePrice: 60.00, totalPrice: 75.00, safetyAcknowledged: true,
    addons: { create: [{ addonId: materials.id, priceAtBooking: 15.00 }] },
  }});

  console.log('✅ Seed complete!');
  console.log(`   ${serviceCategories.length} service categories`);
  console.log(`   ${equipmentCategories.length} equipment categories`);
  console.log(`   ${equipment.length} equipment items`);
  console.log(`   ${timeSlots.length} time slots`);
  console.log(`   ${addons.length} add-ons`);
  console.log(`   ${hosts.length} hosts + ${bookers.length} bookers`);
  console.log(`   ${workshops.length} workshops`);
  console.log(`   2 completed bookings with projects + snapshots`);
  console.log(`   1 pending booking`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
