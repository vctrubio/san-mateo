import { requireAdminSession } from "@/lib/auth-session";

export default async function UsersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdminSession();

  return children;
}
