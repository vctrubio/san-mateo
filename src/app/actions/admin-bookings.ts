'use server';

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth-session";
import { getConnection } from "../../../db/client";

const allowedStatuses = new Set([
  "pending",
  "confirmed",
  "checked_in",
  "checked_out",
  "completed",
  "cancelled",
]);

export async function updateBookingStatus(formData: FormData) {
  await requireAdminSession();

  const bookingId = String(formData.get("bookingId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!bookingId) {
    throw new Error("Booking id is required.");
  }

  if (!allowedStatuses.has(status)) {
    throw new Error("Invalid status requested.");
  }

  const conn = await getConnection();

  try {
    const updates: string[] = ["status = ?"];
    const values: Array<string | null> = [status];

    if (status === "confirmed") {
      updates.push("confirmed_at = CURRENT_TIMESTAMP");
    }

    if (status === "cancelled") {
      updates.push("cancelled_at = CURRENT_TIMESTAMP");
      updates.push("cancellation_reason = ?");
      values.push(reason || "Cancelled by admin");
    }

    values.push(bookingId);

    await conn.execute(
      `UPDATE bookings SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    await conn.execute(
      "INSERT INTO booking_events (id, booking_id, event_type, payload, actor_type) VALUES (UUID(), ?, ?, ?, 'admin')",
      [
        bookingId,
        `booking.${status}`,
        JSON.stringify({ status, reason: reason || null }),
      ],
    );
  } finally {
    await conn.end();
  }

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
}
