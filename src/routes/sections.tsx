import { lazy, Suspense, useState } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import { Fab } from '@mui/material';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import useUser from 'src/hooks/useUser';
import useAdmin from 'src/hooks/useAdmin';

import { varAlpha } from 'src/theme/styles';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import PaymentFormModal from 'src/components/shared/modals/contributeForm';

const AppProvider = lazy(() => import('src/components/provider'));

// ----------------------------------------------------------------------

export const HomePage = lazy(() => import('src/pages/home'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const ContributionsPage = lazy(() => import('src/pages/contributions'));
export const LogoutPage = lazy(() => import('src/pages/logout'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

// ----------------------------------------------------------------------

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export function Router() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const { isAdminMode } = useAdmin();

  const onOpen = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const contributeBtn = (
    <Fab
      size="large"
      aria-label="Github"
      onClick={onOpen}
      sx={{
        zIndex: 9,
        right: 20,
        bottom: 20,
        position: 'fixed',
        bgcolor: 'grey.800',
        color: 'common.white',
      }}
    >
      <Iconify width={24} icon="mdi:donate" />
    </Fab>
  );

  const dashRoutes = [
    { element: <HomePage />, index: true },
    { path: 'user', element: <UserPage /> },
    { path: 'products', element: <ProductsPage /> },
    { path: 'blog', element: <BlogPage /> },
    { path: 'contributions', element: <ContributionsPage /> },
  ];

  const routes = !isAdminMode ? dashRoutes.filter((route) => route.path !== 'user') : dashRoutes;

  return useRoutes([
    {
      element: (
        <Suspense fallback={renderFallback}>
          <AppProvider pay={onOpen}>
            <DashboardLayout>
              <Suspense fallback={renderFallback}>
                <Outlet />
                <PaymentFormModal
                  amount={user?.pledgeAmount ?? ''}
                  open={open}
                  handleClose={onClose}
                />
                {contributeBtn}
              </Suspense>
            </DashboardLayout>
          </AppProvider>
        </Suspense>
      ),
      children: routes,
    },
    {
      path: 'signin',
      element: (
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      ),
    },
    {
      path: 'logout',
      element: <LogoutPage />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
}
