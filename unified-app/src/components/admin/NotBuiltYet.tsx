'use client';

import { Alert, AlertTitle, Box, Typography } from '@mui/material';

/**
 * Marks an admin surface that has no backend behind it yet.
 *
 * These screens used to render bare strings like "Platform Configurations
 * content", or a Save button that silently threw the input away, both of which
 * read as working features. Saying so plainly is better than either.
 */
export function NotBuiltYet({ title, detail }: { title: string; detail?: string }) {
  return (
    <Box sx={{ maxWidth: 800 }}>
      <Alert severity="info" variant="outlined">
        <AlertTitle>{title} is not available yet</AlertTitle>
        <Typography variant="body2">
          {detail ||
            'This section has no settings wired up to it, so nothing here can be saved. It is a placeholder for a feature that has not been built.'}
        </Typography>
      </Alert>
    </Box>
  );
}
