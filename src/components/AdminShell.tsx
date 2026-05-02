import React from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { getCurrentSession } from '@/lib/auth-session';

export default async function AdminShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-[#F5F2ED]">
      <div className="flex min-h-screen">
        <AdminSidebar user={{ name: user?.name, email: user?.email, role: user?.role }} />
        <div className="flex-1">
          <div className="px-8 py-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
