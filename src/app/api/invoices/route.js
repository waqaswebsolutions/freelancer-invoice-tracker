import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Invoice from "@/lib/models/Invoice";
import Settings from "@/lib/models/Settings";

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { clientId, dueDate, items, subtotal, tax, total, notes } = body;

    // Validate
    if (!clientId) {
      return NextResponse.json({ error: "Client is required" }, { status: 400 });
    }
    if (!dueDate) {
      return NextResponse.json({ error: "Due date is required" }, { status: 400 });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
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
        defaultDueDays: 15,
        defaultTaxRate: 0,
        defaultInvoiceNotes: 'Payment is due within 15 days. Thank you for your business!',
        companyName: 'Your Business',
        currency: 'USD',
      });
    }

    // Get next invoice number - handle missing or invalid values
    let nextNumber = settings.nextInvoiceNumber;
    
    // If nextInvoiceNumber doesn't exist or is invalid, calculate from lastInvoiceNumber
    if (nextNumber === undefined || nextNumber === null || isNaN(nextNumber)) {
      nextNumber = (settings.lastInvoiceNumber || 0) + 1;
    }
    
    // Ensure it's a valid number
    nextNumber = Number(nextNumber);
    if (isNaN(nextNumber) || nextNumber < 1) {
      nextNumber = 1;
    }
    
    // Format date (YYMM)
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const dateFormat = `${year}${month}`;
    
    // Format invoice number: INV-YYMM-0001
    const invoiceNumber = `${settings.invoicePrefix}-${dateFormat}-${nextNumber.toString().padStart(4, '0')}`;

    console.log("Generated invoice number:", invoiceNumber);
    console.log("Next number used:", nextNumber);

    // Format items
    const formattedItems = items.map(item => ({
      description: item.description,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      amount: Number(item.amount) || (Number(item.quantity) * Number(item.rate)),
    }));

    // Calculate totals
    const calculatedSubtotal = formattedItems.reduce((sum, item) => sum + item.amount, 0);
    const calculatedTax = Number(tax) || 0;
    const calculatedTotal = calculatedSubtotal + (calculatedSubtotal * calculatedTax / 100);

    // Create invoice with generated number
    const invoice = await Invoice.create({
      userId: user.id,
      invoiceNumber: invoiceNumber,
      clientId,
      dueDate: new Date(dueDate),
      items: formattedItems,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      total: calculatedTotal,
      notes: notes || "",
      status: "draft",
    });

    console.log("Invoice created with ID:", invoice._id);
    console.log("Invoice number from database:", invoice.invoiceNumber);

    // Update the last invoice number and next invoice number in settings
    const newNextNumber = nextNumber + 1;
    
    await Settings.updateOne(
      { userId: user.id },
      { 
        $set: { 
          lastInvoiceNumber: nextNumber,
          nextInvoiceNumber: newNextNumber,
          updatedAt: new Date()
        } 
      }
    );

    // Populate client data
    await invoice.populate('clientId');

    // Create the response object explicitly with invoice number
    const responseData = {
      _id: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId,
      dueDate: invoice.dueDate,
      items: invoice.items,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      notes: invoice.notes,
      status: invoice.status,
      createdAt: invoice.createdAt
    };

    console.log("Sending response with invoice number:", responseData.invoiceNumber);

    return NextResponse.json(responseData, { status: 201 });
    
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const invoices = await Invoice.find({ userId: user.id })
      .populate('clientId')
      .sort({ createdAt: -1 });

    console.log("Fetched invoices count:", invoices.length);
    if (invoices.length > 0) {
      console.log("First invoice number:", invoices[0].invoiceNumber);
    }

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}