'use client';

import { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Skeleton, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '@/hooks/admin/use-auth';
import { useUpdateUser } from '@/hooks/admin/users';

export function AdminProfileForm() {
  const { user, isLoading } = useAuth();
  const { mutate: updateUser, isPending } = useUpdateUser();
  const admin = user?.data;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Populated from the signed-in admin rather than hardcoded sample values,
  // which previously showed every admin the same fictional profile.
  useEffect(() => {
    if (!admin) return;
    setFormData({
      firstName: admin.firstName || '',
      lastName: admin.lastName || '',
      phone: admin.phone || '',
    });
  }, [admin]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isDirty =
    !!admin &&
    (formData.firstName !== (admin.firstName || '') ||
      formData.lastName !== (admin.lastName || '') ||
      formData.phone !== (admin.phone || ''));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!admin?._id || !isDirty) return;
    updateUser({ id: admin._id, data: formData });
  };

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 600 }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={56} sx={{ mb: 3 }} />
        ))}
      </Box>
    );
  }

  if (!admin) {
    return <Alert severity="error">Could not load your profile. Try signing in again.</Alert>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
      <Typography variant="subtitle1" gutterBottom>
        First Name
      </Typography>
      <TextField
        fullWidth
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      <Typography variant="subtitle1" gutterBottom>
        Last Name
      </Typography>
      <TextField
        fullWidth
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      <Typography variant="subtitle1" gutterBottom>
        Email (readonly)
      </Typography>
      <TextField fullWidth value={admin.email} disabled sx={{ mb: 3 }} />

      <Typography variant="subtitle1" gutterBottom>
        Contact Number
      </Typography>
      <TextField
        fullWidth
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      <Button
        type="submit"
        variant="contained"
        startIcon={<SaveIcon />}
        disabled={!isDirty || isPending}
      >
        {isPending ? 'Saving...' : 'Save Changes'}
      </Button>
    </Box>
  );
}
