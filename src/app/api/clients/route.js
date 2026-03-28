import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Client from "@/lib/models/Client";

// POST - Create a new client
export async function POST(req) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone, company, address } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    await connectDB();

    const existingClient = await Client.findOne({ 
      userId: user.id, 
      email: email.toLowerCase() 
    });

    if (existingClient) {
      return NextResponse.json({ error: "A client with this email already exists" }, { status: 400 });
    }

    const client = await Client.create({
      userId: user.id,
      name,
      email: email.toLowerCase(),
      phone: phone || "",
      company: company || "",
      address: address || { street: "", city: "", state: "", zipCode: "", country: "" },
    });

    return NextResponse.json({
      _id: client._id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      address: client.address,
      createdAt: client.createdAt
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Fetch all clients
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const clients = await Client.find({ userId: user.id }).sort({ createdAt: -1 });
    
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}