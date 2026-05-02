'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-session";
import { getConnection } from "../../../db/client";

export async function updateUserRole(formData: FormData) {
  const session = await requireAdminSession();
  const userId = String(formData.get("userId") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  if (!userId) {
    throw new Error("User id is required.");
  }

  if (role !== "admin" && role !== "user") {
    throw new Error("Invalid role requested.");
  }

  const conn = await getConnection();

  try {
    await conn.execute(
      "UPDATE `user` SET `role` = ?, `updatedAt` = CURRENT_TIMESTAMP WHERE `id` = ?",
      [role, userId],
    );
  } finally {
    await conn.end();
  }

  revalidatePath("/users");
  revalidatePath("/admin");

  if (session.user.id === userId && role !== "admin") {
    redirect("/user");
  }

  redirect("/users");
}
