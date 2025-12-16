import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin-sidebar';
import { AdminHeader } from '@/components/admin-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // AAL2 (MFA) 검증 - 이중 보안
  const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (mfaData) {
    const { currentLevel, nextLevel } = mfaData;

    if (currentLevel === 'aal1' && nextLevel === 'aal2') {
      // MFA 설정됨, 인증 필요
      redirect('/login?mfa_required=true');
    }

    if (currentLevel === 'aal1' && nextLevel === 'aal1') {
      // MFA 설정 안됨
      redirect('/setup-mfa');
    }
  }

  return (
    <SidebarProvider>
      <AdminSidebar variant="inset" userEmail={user.email || ''} />
      <SidebarInset>
        <AdminHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
