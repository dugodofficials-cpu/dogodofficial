'use client';

import { Product, ProductStatus, uploadProductFileDirect, updateProduct } from '@/lib/admin/api/products';
import { productCategories } from '@/lib/admin/utils/categories';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { enqueueSnackbar } from 'notistack';

const MAX_COVER_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_EBOOK_FILE_BYTES = 200 * 1024 * 1024;
const validEbookTypes = [
  'application/pdf',
  'application/epub+zip',
  'application/x-mobipocket-ebook',
  'application/vnd.amazon.ebook',
];
const resolveEbookContentType = (file: File): string => {
  if (validEbookTypes.includes(file.type)) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'epub') return 'application/epub+zip';
  if (ext === 'mobi') return 'application/x-mobipocket-ebook';
  return file.type || 'application/octet-stream';
};

const ebookSchema = z.object({
  name: z.string().min(3, 'Ebook name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.string().min(1, 'Price is required'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  status: z.nativeEnum(ProductStatus),
  tags: z.string().optional(),
  order: z.number().optional(),
});

type EditEbookFormData = z.infer<typeof ebookSchema>;

interface EditEbookModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (updatedProduct: Product) => void;
  isLoading: boolean;
}

export function EditEbookModal({
  open,
  onClose,
  product,
  onSave,
  isLoading,
}: EditEbookModalProps) {
  const [newCoverImage, setNewCoverImage] = React.useState<File | null>(null);
  const [newEbookFile, setNewEbookFile] = React.useState<File | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditEbookFormData>({
    resolver: zodResolver(ebookSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      sku: product?.sku || '',
      price: product?.price.toString() || '',
      categories: product?.categories || [],
      status: product?.status || ProductStatus.DRAFT,
      tags: product?.tags?.join(', ') || '',
      order: product?.order || 0,
    },
  });

  React.useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: product.price.toString(),
        categories: product.categories || [],
        status: product.status,
        tags: product.tags?.join(', ') || '',
        order: product.order || 0,
      });

      setNewCoverImage(null);
      setNewEbookFile(null);
    }
  }, [product, reset]);

  const onSubmit = async (data: EditEbookFormData) => {
    if (product) {
      const tagsArray = data.tags
        ? data.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      let images = product.images;
      let ebookDeliveryInfo = product.ebookDeliveryInfo;

      if (newCoverImage || newEbookFile) {
        setIsUploadingMedia(true);
        try {
          // Both files upload straight to storage from the browser — this
          // never routes the file bytes through this app's own API, so it
          // can't hit Vercel's request-size limit no matter how large the
          // ebook file is.
          const [coverUpload, ebookUpload] = await Promise.all([
            newCoverImage ? uploadProductFileDirect(newCoverImage) : Promise.resolve(null),
            newEbookFile ? uploadProductFileDirect(newEbookFile, resolveEbookContentType(newEbookFile)) : Promise.resolve(null),
          ]);
          const coverKey = coverUpload?.key ?? product.images?.[0];
          const ebookKey = ebookUpload?.key ?? product.ebookDeliveryInfo?.downloadUrl;
          images = coverKey ? [coverKey] : product.images;
          ebookDeliveryInfo = { ...product.ebookDeliveryInfo, downloadUrl: ebookKey, bookCoverArt: coverKey };
          await updateProduct(product._id, { images, ebookDeliveryInfo });
        } catch (error) {
          enqueueSnackbar(error instanceof Error ? error.message : 'Failed to upload ebook files', { variant: 'error' });
          setIsUploadingMedia(false);
          return;
        }
        setIsUploadingMedia(false);
      }

      const updatedProduct = {
        ...product,
        ...data,
        price: Number(data.price),
        tags: tagsArray,
        images,
        ebookDeliveryInfo,
        bundleItems: undefined,
        bundlePrice: undefined,
        bundleTier: undefined,
      };

      onSave(updatedProduct as Product);
    }
    onClose();
  };

  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Edit Ebook</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {product.images && product.images.length > 0 && (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ width: 100, height: 100, position: 'relative' }}>
                  <Image
                    src={product.images[0] || '/assets/product-placeholder.svg'}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2">Replace Ebook File (PDF, EPUB, MOBI)</Typography>
              <input
                type="file"
                accept=".pdf,.epub,.mobi,application/pdf,application/epub+zip,application/x-mobipocket-ebook,application/vnd.amazon.ebook"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && file.size > MAX_EBOOK_FILE_BYTES) {
                    enqueueSnackbar(`Ebook file must be under ${MAX_EBOOK_FILE_BYTES / (1024 * 1024)}MB`, { variant: 'error' });
                    return;
                  }
                  setNewEbookFile(file);
                }}
              />
              {newEbookFile ? (
                <Typography variant="caption" color="text.secondary">
                  Selected: {newEbookFile.name}
                </Typography>
              ) : null}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2">Replace Cover Image (JPG, PNG)</Typography>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && file.size > MAX_COVER_IMAGE_BYTES) {
                    enqueueSnackbar(`Cover image must be under ${MAX_COVER_IMAGE_BYTES / (1024 * 1024)}MB`, { variant: 'error' });
                    return;
                  }
                  setNewCoverImage(file);
                }}
              />
              {newCoverImage ? (
                <Typography variant="caption" color="text.secondary">
                  Selected: {newCoverImage.name}
                </Typography>
              ) : null}
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Ebook Title"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="sku"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="SKU"
                      error={!!errors.sku}
                      helperText={errors.sku?.message}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Price"
                      type="number"
                      InputProps={{
                        startAdornment: '₦',
                      }}
                      error={!!errors.price}
                      helperText={errors.price?.message}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.status}>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status">
                        {Object.values(ProductStatus).map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.status && (
                        <FormHelperText>{errors.status.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="categories"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.categories} required>
                      <InputLabel id="categories-label">Categories</InputLabel>
                      <Select
                        {...field}
                        labelId="categories-label"
                        label="Categories"
                        multiple
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        input={<OutlinedInput label="Categories" />}
                      >
                        {productCategories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.categories && (
                        <FormHelperText>
                          {errors.categories.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Description"
                      multiline
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Tags (comma-separated)"
                      placeholder="fiction, romance, thriller"
                      error={!!errors.tags}
                      helperText={errors.tags?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="order"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      label="Order"
                      type="number"
                      error={!!errors.order}
                      helperText={errors.order?.message}
                      inputProps={{ min: 0 }}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(
                          value === '' ? undefined : Number(value),
                        );
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading || isUploadingMedia}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{ bgcolor: '#2FD65D', '&:hover': { bgcolor: '#2AC152' } }}
            disabled={isLoading || isUploadingMedia}
          >
            {isLoading || isUploadingMedia ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
