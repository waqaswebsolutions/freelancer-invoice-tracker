import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Client from "@/lib/models/Client";

// GET - Fetch single client
export async function GET(request, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // IMPORTANT: Await params
    const { id } = await params;
    
    console.log("GET - Fetching client ID:", id);
    
    await connectDB();
    
    const client = await Client.findOne({ _id: id, userId: user.id });
    
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    
    return NextResponse.json(client);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update client
export async function PUT(request, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // IMPORTANT: Await params
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, company, address } = body;
    
    console.log("PUT - Updating client ID:", id);
    
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }
    
    await connectDB();
    
    const updated = await Client.findOneAndUpdate(
      { _id: id, userId: user.id },
      {
        name,
        email: email.toLowerCase(),
        phone: phone || "",
        company: company || "",
        address: address || { street: "", city: "", state: "", zipCode: "", country: "" },
      },
      { new: true }
    );
    
    if (!updated) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete client
export async function DELETE(request, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // IMPORTANT: Await params
    const { id } = await params;
    
    console.log("DELETE - Deleting client ID:", id);
    
    await connectDB();
    
    const deleted = await Client.findOneAndDelete({ _id: id, userId: user.id });
    
    if (!deleted) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}