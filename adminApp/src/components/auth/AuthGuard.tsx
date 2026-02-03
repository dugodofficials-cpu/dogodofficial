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
  const [token, setToken] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    setToken(cookies.getAuthToken());
  }, []);

  useEffect(() => {
    if (hasMounted && !token) {
      router.push('/login');
    }
  }, [router, hasMounted, token]);

  if (!hasMounted) {
    return null;
  }

  if (!token) {
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