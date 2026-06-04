import { CONFIG } from 'src/global-config';

import { DashboardLayout } from 'src/layouts/dashboard';

import { AuthGuard } from 'src/auth/guard';

import ReduxProvider from 'src/redux/provider';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  if (CONFIG.auth.skip) {
    return (
      <ReduxProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </ReduxProvider>
    );
  }

  return (
    <ReduxProvider>
      <AuthGuard>
        <DashboardLayout>{children}</DashboardLayout>
      </AuthGuard>
    </ReduxProvider>
  );
}