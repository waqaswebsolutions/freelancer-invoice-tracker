import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Settings from "@/lib/models/Settings";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get or create settings for this user
    let settings = await Settings.findOne({ userId: user.id });
    
    if (!settings) {
      settings = await Settings.create({
        userId: user.id,
        lastInvoiceNumber: 0,
        nextInvoiceNumber: 1,
        invoicePrefix: 'INV',
        invoiceDateFormat: 'YYMM',
      });
    }

    // Get the next number - handle missing field
    let nextNumber = settings.nextInvoiceNumber;
    
    // If nextInvoiceNumber doesn't exist, calculate from lastInvoiceNumber
    if (nextNumber === undefined || nextNumber === null || isNaN(nextNumber)) {
      nextNumber = (settings.lastInvoiceNumber || 0) + 1;
    }
    
    // Ensure it's a valid number
    nextNumber = Number(nextNumber);
    if (isNaN(nextNumber)) {
      nextNumber = 1;
    }
    
    // Format date (YYMM)
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const dateFormat = `${year}${month}`;
    
    // Format invoice number: INV-YYMM-0001
    const invoiceNumber = `${settings.invoicePrefix}-${dateFormat}-${nextNumber.toString().padStart(4, '0')}`;

    return NextResponse.json({
      invoiceNumber,
      nextNumber,
      prefix: settings.invoicePrefix,
      dateFormat,
    });
  } catch (error) {
    console.error("Error generating invoice number:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}