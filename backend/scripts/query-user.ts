import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const userId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';

  const user = await p.user.findUnique({ where: { id: userId } });
  console.log('USER:', JSON.stringify(user, null, 2));

  const workshops = await p.workshop.findMany({ where: { hostId: userId } });
  console.log('WORKSHOPS:', workshops.length);

  const bookings = await p.booking.findMany({ where: { bookerId: userId } });
  console.log('BOOKINGS:', bookings.length);

  const reviews = await p.review.findMany({ where: { reviewerId: userId } });
  console.log('REVIEWS:', reviews.length);

  const categories = await p.serviceCategory.findMany();
  console.log('CATEGORIES:', JSON.stringify(categories.map(c => ({ id: c.id, name: c.name })), null, 2));

  const timeSlots = await p.timeSlotType.findMany();
  console.log('TIME_SLOTS:', JSON.stringify(timeSlots, null, 2));

  const addons = await p.addonCatalog.findMany();
  console.log('ADDONS:', JSON.stringify(addons, null, 2));

  const equipment = await p.equipmentCatalog.findMany();
  console.log('EQUIPMENT:', JSON.stringify(equipment.map(e => ({ id: e.id, name: e.name, catId: e.categoryId })), null, 2));

  const skills = await p.skillCatalog.findMany();
  console.log('SKILLS:', JSON.stringify(skills.map(s => ({ id: s.id, name: s.name, catId: s.serviceCategoryId })), null, 2));

  // Check existing workshops
  const allWorkshops = await p.workshop.findMany({ select: { id: true, name: true, hostId: true } });
  console.log('ALL_WORKSHOPS:', JSON.stringify(allWorkshops, null, 2));

  await p.$disconnect();
}

main();
