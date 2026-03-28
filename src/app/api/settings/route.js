import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Settings from "@/lib/models/Settings";

// GET - Fetch user settings
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let settings = await Settings.findOne({ userId: user.id });
    
    if (!settings) {
      // Create default settings for new user
      settings = await Settings.create({
        userId: user.id,
        companyName: user.firstName ? `${user.firstName}'s Business` : 'Your Business',
        businessEmail: user.emailAddresses[0]?.emailAddress || '',
        senderEmail: user.emailAddresses[0]?.emailAddress || '',
        nextInvoiceNumber: 1,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update user settings
export async function PUT(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    await connectDB();

    const updatedSettings = await Settings.findOneAndUpdate(
      { userId: user.id },
      { ...body, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}