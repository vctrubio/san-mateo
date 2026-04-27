import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireSession(callbackUrl: string) {
  const session = await getCurrentSession();

  if (!session) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return session;
}

export async function requireAdminSession() {
  const session = await requireSession("/admin");

  if (session.user.role !== "admin") {
    redirect("/user");
  }

  return session;
}