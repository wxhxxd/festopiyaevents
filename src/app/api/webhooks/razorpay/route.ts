import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Helper to initialize Supabase client lazily at runtime
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase URL or Service Role Key environment variables are missing.");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    // 1. Get raw body text for webhook signature validation
    const rawBody = await req.text();

    // 2. Extract Razorpay signature from headers
    const signature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    if (!signature) {
      return NextResponse.json(
        { error: "Signature header missing" },
        { status: 400 }
      );
    }

    // 3. Verify signature using HMAC SHA256
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const signatureBuffer = Buffer.from(signature, "utf-8");
    const expectedSignatureBuffer = Buffer.from(expectedSignature, "utf-8");

    const isSignatureValid =
      signatureBuffer.length === expectedSignatureBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer);

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    // 4. Parse payload
    const payload = JSON.parse(rawBody);
    const eventType = payload.event;

    // 5. Handle success event (payment.captured)
    if (eventType === "payment.captured") {
      const bookingId = payload.payload?.payment?.entity?.notes?.booking_id;

      if (!bookingId) {
        return NextResponse.json(
          { error: "booking_id not found in payload notes" },
          { status: 400 }
        );
      }

      // Convert to integer if the DB ID is numeric
      const numericBookingId = parseInt(bookingId, 10);
      const targetId = isNaN(numericBookingId) ? bookingId : numericBookingId;

      // Update Supabase bookings table
      const { error } = await supabase
        .from("bookings")
        .update({ status: "advance_paid" })
        .eq("id", targetId);

      if (error) {
        console.error("Supabase error updating booking status:", error);
        return NextResponse.json(
          { error: "Failed to update booking status in database" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, message: "Booking status updated to advance_paid" },
        { status: 200 }
      );
    }

    // Return 200 for unhandled events to prevent Razorpay retries
    return NextResponse.json(
      { success: true, message: `Event ${eventType} received but not processed` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Razorpay webhook handler error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal Server Error", message: errorMessage },
      { status: 500 }
    );
  }
}

