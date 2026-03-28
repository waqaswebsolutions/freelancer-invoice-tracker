import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Invoice from "@/lib/models/Invoice";

export async function GET(request, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the ID from params
    const { id } = await params;
    
    console.log("Fetching invoice with ID:", id);
    
    await connectDB();
    
    const invoice = await Invoice.findOne({ _id: id, userId: user.id })
      .populate('clientId');
    
    if (!invoice) {
      console.log("Invoice not found");
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    
    console.log("Invoice found:", invoice._id);
    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;
    
    console.log("Updating invoice:", id, "to status:", status);
    
    await connectDB();
    
    // Check current status to prevent reverting paid invoices
    const currentInvoice = await Invoice.findOne({ _id: id, userId: user.id });
    if (currentInvoice?.status === 'paid' && status !== 'paid') {
      return NextResponse.json({ error: "Cannot change status of paid invoice" }, { status: 400 });
    }
    
    const updated = await Invoice.findOneAndUpdate(
      { _id: id, userId: user.id },
      { 
        status,
        paidAt: status === 'paid' ? new Date() : null
      },
      { new: true }
    ).populate('clientId');
    
    if (!updated) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}