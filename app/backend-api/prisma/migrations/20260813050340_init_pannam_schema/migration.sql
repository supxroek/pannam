-- CreateEnum
CREATE TYPE "Role" AS ENUM ('village_admin', 'meter_reader', 'resident');

-- CreateEnum
CREATE TYPE "UserVillageStatus" AS ENUM ('pending_approval', 'active', 'suspended');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('active', 'suspended');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('pending', 'verifying', 'paid_cash', 'paid_online', 'overdue');

-- CreateEnum
CREATE TYPE "PaymentSlipStatus" AS ENUM ('submitted', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "villages" (
    "village_id" SERIAL NOT NULL,
    "village_code" VARCHAR(20) NOT NULL,
    "village_name" VARCHAR(150) NOT NULL,
    "address" TEXT,
    "default_service_fee" DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    "promptpay_no" VARCHAR(20),
    "promptpay_name" VARCHAR(100),
    "enable_promptpay" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "villages_pkey" PRIMARY KEY ("village_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "line_user_id" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(15),
    "is_global_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_villages" (
    "user_village_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "village_id" INTEGER NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'resident',
    "status" "UserVillageStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_villages_pkey" PRIMARY KEY ("user_village_id")
);

-- CreateTable
CREATE TABLE "water_rates" (
    "rate_id" SERIAL NOT NULL,
    "village_id" INTEGER NOT NULL,
    "min_unit" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "max_unit" DECIMAL(10,2),
    "price_per_unit" DECIMAL(8,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "water_rates_pkey" PRIMARY KEY ("rate_id")
);

-- CreateTable
CREATE TABLE "properties" (
    "property_id" SERIAL NOT NULL,
    "village_id" INTEGER NOT NULL,
    "house_number" VARCHAR(50) NOT NULL,
    "zone" VARCHAR(50),
    "meter_code" VARCHAR(50),
    "status" "PropertyStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("property_id")
);

-- CreateTable
CREATE TABLE "user_properties" (
    "user_property_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "property_id" INTEGER NOT NULL,
    "is_primary_owner" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_properties_pkey" PRIMARY KEY ("user_property_id")
);

-- CreateTable
CREATE TABLE "meter_readings" (
    "reading_id" SERIAL NOT NULL,
    "village_id" INTEGER NOT NULL,
    "property_id" INTEGER NOT NULL,
    "reader_id" INTEGER,
    "billing_month" DATE NOT NULL,
    "previous_reading" DECIMAL(10,2) NOT NULL,
    "current_reading" DECIMAL(10,2) NOT NULL,
    "consumption" DECIMAL(10,2) NOT NULL,
    "image_url" TEXT,
    "reading_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meter_readings_pkey" PRIMARY KEY ("reading_id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "invoice_id" SERIAL NOT NULL,
    "village_id" INTEGER NOT NULL,
    "property_id" INTEGER NOT NULL,
    "reading_id" INTEGER NOT NULL,
    "billing_month" DATE NOT NULL,
    "water_amount" DECIMAL(10,2) NOT NULL,
    "service_fee" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "fine_amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "payment_status" "InvoiceStatus" NOT NULL DEFAULT 'pending',
    "due_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("invoice_id")
);

-- CreateTable
CREATE TABLE "payments" (
    "payment_id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "paid_by_user_id" INTEGER,
    "amount_paid" DECIMAL(10,2) NOT NULL,
    "slip_url" TEXT NOT NULL,
    "verified_by_user_id" INTEGER,
    "payment_status" "PaymentSlipStatus" NOT NULL DEFAULT 'submitted',
    "reject_reason" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "log_id" SERIAL NOT NULL,
    "village_id" INTEGER,
    "user_id" INTEGER,
    "action" VARCHAR(50) NOT NULL,
    "table_name" VARCHAR(50) NOT NULL,
    "record_id" INTEGER NOT NULL,
    "old_data" JSONB,
    "new_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "villages_village_code_key" ON "villages"("village_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_line_user_id_key" ON "users"("line_user_id");

-- CreateIndex
CREATE INDEX "user_villages_village_id_idx" ON "user_villages"("village_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_villages_user_id_village_id_key" ON "user_villages"("user_id", "village_id");

-- CreateIndex
CREATE INDEX "water_rates_village_id_idx" ON "water_rates"("village_id");

-- CreateIndex
CREATE INDEX "properties_village_id_idx" ON "properties"("village_id");

-- CreateIndex
CREATE UNIQUE INDEX "properties_village_id_house_number_key" ON "properties"("village_id", "house_number");

-- CreateIndex
CREATE INDEX "user_properties_property_id_idx" ON "user_properties"("property_id");

-- CreateIndex
CREATE INDEX "user_properties_user_id_idx" ON "user_properties"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_properties_user_id_property_id_key" ON "user_properties"("user_id", "property_id");

-- CreateIndex
CREATE INDEX "meter_readings_village_id_billing_month_idx" ON "meter_readings"("village_id", "billing_month");

-- CreateIndex
CREATE INDEX "meter_readings_property_id_idx" ON "meter_readings"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "meter_readings_property_id_billing_month_key" ON "meter_readings"("property_id", "billing_month");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_reading_id_key" ON "invoices"("reading_id");

-- CreateIndex
CREATE INDEX "invoices_village_id_billing_month_idx" ON "invoices"("village_id", "billing_month");

-- CreateIndex
CREATE INDEX "invoices_property_id_idx" ON "invoices"("property_id");

-- CreateIndex
CREATE INDEX "invoices_payment_status_idx" ON "invoices"("payment_status");

-- CreateIndex
CREATE INDEX "payments_invoice_id_idx" ON "payments"("invoice_id");

-- CreateIndex
CREATE INDEX "audit_logs_village_id_idx" ON "audit_logs"("village_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- AddForeignKey
ALTER TABLE "user_villages" ADD CONSTRAINT "user_villages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_villages" ADD CONSTRAINT "user_villages_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("village_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "water_rates" ADD CONSTRAINT "water_rates_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("village_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("village_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_properties" ADD CONSTRAINT "user_properties_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_properties" ADD CONSTRAINT "user_properties_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meter_readings" ADD CONSTRAINT "meter_readings_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("village_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meter_readings" ADD CONSTRAINT "meter_readings_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meter_readings" ADD CONSTRAINT "meter_readings_reader_id_fkey" FOREIGN KEY ("reader_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("village_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_reading_id_fkey" FOREIGN KEY ("reading_id") REFERENCES "meter_readings"("reading_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("invoice_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_paid_by_user_id_fkey" FOREIGN KEY ("paid_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_verified_by_user_id_fkey" FOREIGN KEY ("verified_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "villages"("village_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
