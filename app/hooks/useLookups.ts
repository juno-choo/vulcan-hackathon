import { useStore } from '@/lib/store';

export function useLookups() {
  const {
    serviceCategories,
    equipmentCategories,
    timeSlots,
    addons,
    lookupsLoaded,
  } = useStore();

  // Flatten all equipment items for filter pills
  const allEquipment = equipmentCategories.flatMap((cat) => cat.equipment);

  return {
    serviceCategories,
    equipmentCategories,
    timeSlots,
    addons,
    allEquipment,
    lookupsLoaded,
  };
}
