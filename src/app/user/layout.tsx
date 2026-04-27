import { requireSession } from "@/lib/auth-session";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireSession("/user");

  return children;
}