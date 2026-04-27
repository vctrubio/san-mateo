'use server';

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getConnection } from "../../../db/client";

export async function updateDevRole(formData: FormData) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Dev role switching is disabled in production.");
  }

  const requestedRole = formData.get("role");

  if (requestedRole !== "admin" && requestedRole !== "user") {
    throw new Error("Invalid role requested.");
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in?callbackUrl=/user");
  }

  const conn = await getConnection();
  await conn.execute(
    "UPDATE `user` SET `role` = ?, `updatedAt` = CURRENT_TIMESTAMP WHERE `id` = ?",
    [requestedRole, session.user.id],
  );

  revalidatePath("/admin");
  revalidatePath("/user");

  redirect(requestedRole === "admin" ? "/admin" : "/user");
}