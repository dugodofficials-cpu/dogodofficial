'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cookies } from '@/lib/utils/cookies';
import { Box, CircularProgress } from '@mui/material';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>(
    'checking',
  );

  useEffect(() => {
    const token = cookies.getAuthToken();
    setAuthStatus(token ? 'authenticated' : 'unauthenticated');
  }, []);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.replace('/login');
    }
  }, [router, authStatus]);

  if (authStatus !== 'authenticated') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
} 