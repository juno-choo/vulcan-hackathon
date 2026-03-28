// Types match Supabase REST API responses (snake_case from DB)

export type UserRole = 'HOST' | 'BOOKER' | 'BOTH';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role?: UserRole;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  location?: { city: string; state: string; lat: number; lng: number };
  created_at?: string;
  updated_at?: string;
}

export interface Workshop {
  id: string;
  host_id: string;
  service_category_id: string;
  name: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  hourly_rate: number;
  photo_urls: string[];
  avg_rating?: number;
  total_reviews?: number;
  is_active: boolean;
  host?: { id: string; full_name: string; avatar_url?: string; bio?: string };
  serviceCategory?: ServiceCategory;
  equipment?: WorkshopEquipmentWithDetails[];
  availability?: WorkshopAvailabilityWithSlot[];
  reviews?: Review[];
}

export interface WorkshopEquipmentWithDetails {
  id: string;
  workshop_id: string;
  equipment_id: string;
  equipment: EquipmentCatalogItem;
}

export interface WorkshopAvailabilityWithSlot {
  id: string;
  workshop_id: string;
  time_slot_type_id: string;
  available_date: string;
  is_available: boolean;
  timeSlotType: TimeSlotType;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export interface EquipmentCategory {
  id: string;
  name: string;
  icon?: string;
  equipment: EquipmentCatalogItem[];
}

export interface EquipmentCatalogItem {
  id: string;
  category_id: string;
  name: string;
  icon?: string;
}

export interface SkillCatalog {
  id: string;
  service_category_id: string;
  name: string;
}

export interface TimeSlotType {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
}

export interface AddonCatalog {
  id: string;
  name: string;
  description?: string;
  default_price: number;
  is_active: boolean;
}

export interface LookupsResponse {
  serviceCategories: ServiceCategory[];
  equipmentCategories: EquipmentCategory[];
  timeSlots: TimeSlotType[];
  addons: AddonCatalog[];
}

export interface Booking {
  id: string;
  booker_id: string;
  workshop_id: string;
  time_slot_type_id: string;
  booking_date: string;
  status: BookingStatus;
  base_price: number;
  total_price: number;
  safety_acknowledged: boolean;
  notes?: string;
  late_cancellation?: boolean;
  workshop?: Workshop;
  booker?: { id: string; full_name: string; avatar_url?: string; email?: string; phone?: string };
  timeSlotType?: TimeSlotType;
  addons?: BookingAddonWithDetails[];
  project?: Project;
  review?: Review;
}

export interface BookingAddonWithDetails {
  id: string;
  booking_id: string;
  addon_id: string;
  price_at_booking: number;
  addon: AddonCatalog;
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer?: { full_name: string; avatar_url?: string };
}

export interface Project {
  id: string;
  booking_id: string;
  title: string;
  description?: string;
  booking?: Booking;
  snapshots?: Snapshot[];
  _count?: { snapshots: number };
}

export interface Snapshot {
  id: string;
  project_id: string;
  sequence_number: number;
  before_photo_url: string;
  after_photo_url: string;
  notes?: string;
  created_at: string;
  tools?: SnapshotToolWithDetails[];
  skills?: SnapshotSkillWithDetails[];
}

export interface SnapshotToolWithDetails {
  id: string;
  snapshot_id: string;
  equipment_id: string;
  equipment: EquipmentCatalogItem;
}

export interface SnapshotSkillWithDetails {
  id: string;
  snapshot_id: string;
  skill_id: string;
  skill: SkillCatalog;
}
