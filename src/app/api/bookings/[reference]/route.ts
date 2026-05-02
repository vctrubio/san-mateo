import { NextResponse } from "next/server";
import { getBookingByReference } from "@/services/BookingLookupService";

type Params = {
  params: Promise<{ reference: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { reference } = await params;

  if (!reference) {
    return NextResponse.json({ error: "Reference is required." }, { status: 400 });
  }

  const booking = await getBookingByReference(reference.toUpperCase());

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  return NextResponse.json(booking, { status: 200 });
}
