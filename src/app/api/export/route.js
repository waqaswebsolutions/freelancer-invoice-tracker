import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Client from "@/lib/models/Client";
import Invoice from "@/lib/models/Invoice";

export async function GET(request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    await connectDB();

    // Fetch data based on type
    if (type === "clients") {
      const clients = await Client.find({ userId: user.id }).sort({ createdAt: -1 });
      return NextResponse.json(clients);
    }
    
    if (type === "invoices") {
      const invoices = await Invoice.find({ userId: user.id })
        .populate('clientId')
        .sort({ createdAt: -1 });
      return NextResponse.json(invoices);
    }
    
    // Default: return all data
    const clients = await Client.find({ userId: user.id }).sort({ createdAt: -1 });
    const invoices = await Invoice.find({ userId: user.id })
      .populate('clientId')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ clients, invoices });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}