'use server';

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth-session";
import { getConnection } from "../../../db/client";

export async function updateGuestNotes(formData: FormData) {
  await requireAdminSession();

  const guestId = String(formData.get("guestId") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!guestId) {
    throw new Error("Guest id is required.");
  }

  const conn = await getConnection();

  try {
    await conn.execute("UPDATE guests SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [notes, guestId]);
  } finally {
    await conn.end();
  }

  revalidatePath("/admin/guests");
  revalidatePath(`/admin/guests/${guestId}`);
}
