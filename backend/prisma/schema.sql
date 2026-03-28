-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('HOST', 'BOOKER', 'BOTH');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "auth_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'BOOKER',
    "avatar_url" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "location" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshops" (
    "id" UUID NOT NULL,
    "host_id" UUID NOT NULL,
    "service_category_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "hourly_rate" DECIMAL(10,2) NOT NULL,
    "photo_urls" TEXT[],
    "avg_rating" DOUBLE PRECISION DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workshops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_catalog" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "equipment_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_catalog" (
    "id" UUID NOT NULL,
    "service_category_id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "skill_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_slot_types" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,

    CONSTRAINT "time_slot_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addon_catalog" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "default_price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "addon_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshop_equipment" (
    "id" UUID NOT NULL,
    "workshop_id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,

    CONSTRAINT "workshop_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshop_availability" (
    "id" UUID NOT NULL,
    "workshop_id" UUID NOT NULL,
    "time_slot_type_id" UUID NOT NULL,
    "available_date" DATE NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "workshop_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "booker_id" UUID NOT NULL,
    "workshop_id" UUID NOT NULL,
    "time_slot_type_id" UUID NOT NULL,
    "booking_date" DATE NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "base_price" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "safety_acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "late_cancellation" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_addons" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "addon_id" UUID NOT NULL,
    "price_at_booking" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "booking_addons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snapshots" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "before_photo_url" TEXT NOT NULL,
    "after_photo_url" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snapshot_tools" (
    "id" UUID NOT NULL,
    "snapshot_id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,

    CONSTRAINT "snapshot_tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snapshot_skills" (
    "id" UUID NOT NULL,
    "snapshot_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,

    CONSTRAINT "snapshot_skills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_id_key" ON "users"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_name_key" ON "service_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_categories_name_key" ON "equipment_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_catalog_category_id_name_key" ON "equipment_catalog"("category_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "skill_catalog_service_category_id_name_key" ON "skill_catalog"("service_category_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "time_slot_types_name_key" ON "time_slot_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "addon_catalog_name_key" ON "addon_catalog"("name");

-- CreateIndex
CREATE UNIQUE INDEX "workshop_equipment_workshop_id_equipment_id_key" ON "workshop_equipment"("workshop_id", "equipment_id");

-- CreateIndex
CREATE UNIQUE INDEX "workshop_availability_workshop_id_time_slot_type_id_availab_key" ON "workshop_availability"("workshop_id", "time_slot_type_id", "available_date");

-- CreateIndex
CREATE UNIQUE INDEX "booking_addons_booking_id_addon_id_key" ON "booking_addons"("booking_id", "addon_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_booking_id_key" ON "reviews"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_booking_id_key" ON "projects"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "snapshots_project_id_sequence_number_key" ON "snapshots"("project_id", "sequence_number");

-- CreateIndex
CREATE UNIQUE INDEX "snapshot_tools_snapshot_id_equipment_id_key" ON "snapshot_tools"("snapshot_id", "equipment_id");

-- CreateIndex
CREATE UNIQUE INDEX "snapshot_skills_snapshot_id_skill_id_key" ON "snapshot_skills"("snapshot_id", "skill_id");

-- AddForeignKey
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_service_category_id_fkey" FOREIGN KEY ("service_category_id") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_catalog" ADD CONSTRAINT "equipment_catalog_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "equipment_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_catalog" ADD CONSTRAINT "skill_catalog_service_category_id_fkey" FOREIGN KEY ("service_category_id") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshop_equipment" ADD CONSTRAINT "workshop_equipment_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshop_equipment" ADD CONSTRAINT "workshop_equipment_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshop_availability" ADD CONSTRAINT "workshop_availability_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshop_availability" ADD CONSTRAINT "workshop_availability_time_slot_type_id_fkey" FOREIGN KEY ("time_slot_type_id") REFERENCES "time_slot_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_booker_id_fkey" FOREIGN KEY ("booker_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_time_slot_type_id_fkey" FOREIGN KEY ("time_slot_type_id") REFERENCES "time_slot_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_addons" ADD CONSTRAINT "booking_addons_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_addons" ADD CONSTRAINT "booking_addons_addon_id_fkey" FOREIGN KEY ("addon_id") REFERENCES "addon_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snapshot_tools" ADD CONSTRAINT "snapshot_tools_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snapshot_tools" ADD CONSTRAINT "snapshot_tools_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snapshot_skills" ADD CONSTRAINT "snapshot_skills_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snapshot_skills" ADD CONSTRAINT "snapshot_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skill_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

