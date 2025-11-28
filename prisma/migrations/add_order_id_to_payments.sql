-- Add order_id column to payments table
ALTER TABLE "payments" ADD COLUMN "order_id" TEXT;
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");
CREATE INDEX "payments_order_id_idx" ON "payments"("order_id");




