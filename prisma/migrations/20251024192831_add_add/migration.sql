-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
