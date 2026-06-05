import { AuthGuard } from 'src/auth/guard';
import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';
import ReduxProvider from 'src/redux/provider';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  if (CONFIG.auth.skip) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  return (
    <AuthGuard>
       <ReduxProvider>
      <DashboardLayout>
        {children}
        </DashboardLayout>
        </ReduxProvider>
    </AuthGuard>
  );
}

