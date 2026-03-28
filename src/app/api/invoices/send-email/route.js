import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Resend } from 'resend';
import connectDB from "@/lib/mongodb";
import Settings from "@/lib/models/Settings";
import Invoice from "@/lib/models/Invoice";
import { getInvoiceEmailTemplate } from "@/lib/email/invoiceEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    }

    await connectDB();

    const invoice = await Invoice.findOne({ _id: invoiceId, userId: user.id })
      .populate('clientId');

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const client = invoice.clientId;
    
    if (!client.email) {
      return NextResponse.json({ error: "Client has no email address" }, { status: 400 });
    }

    const invoiceNumber = invoice.invoiceNumber;
    const settings = await Settings.findOne({ userId: user.id });
    const emailHtml = getInvoiceEmailTemplate(invoice, client, invoiceNumber, settings);

    // For testing - send to your own email only
    // Remove this condition when you verify a domain
    const isTestMode = true; // Set to false when you verify a domain
    const recipientEmail = isTestMode ? 'chocolatywiqi@gmail.com' : client.email;
    
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: recipientEmail,
      subject: `Invoice ${invoiceNumber} from Your Project Manager`, // Removed (TEST)
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update invoice status
    if (invoice.status === 'draft') {
      await Invoice.updateOne(
        { _id: invoiceId },
        { status: 'sent', emailSent: true }
      );
    }

    const message = isTestMode 
      ? `Test email sent to ${recipientEmail} (client's email would be: ${client.email})`
      : `Invoice sent to ${client.email}`;

    return NextResponse.json({ 
      success: true, 
      message: message 
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}