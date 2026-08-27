/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
  FormHelperText,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  Grid,
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SaveIcon from '@mui/icons-material/Save';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CreateProductDto,
  ProductStatus,
  ProductType,
  createProduct,
  uploadProductFileDirect,
} from '@/lib/admin/api/products';
import { enqueueSnackbar } from 'notistack';
import { ROUTES } from '@/utils/paths';
import { productCategories } from '@/lib/admin/utils/categories';
import { useRouter } from 'next/navigation';

const ebookSchema = z.object({
  name: z.string().min(3, 'Ebook name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.string().min(1, 'Price is required'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  status: z.nativeEnum(ProductStatus),
  tags: z.string().optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
});

type EbookFormData = z.infer<typeof ebookSchema>;

const MAX_COVER_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_EBOOK_FILE_BYTES = 200 * 1024 * 1024;

export function CreateEbookForm() {
  const [coverImage, setCoverImage] = React.useState<File | null>(null);
  const [ebookFile, setEbookFile] = React.useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = React.useState<
    string | null
  >(null);
  const [isCreatingProduct, setIsCreatingProduct] = React.useState(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EbookFormData>({
    resolver: zodResolver(ebookSchema),
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      price: '',
      categories: [],
      status: ProductStatus.DRAFT,
      images: [],
      tags: '',
      isActive: true,
    },
  });

  const handleCoverImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        enqueueSnackbar('Please upload an image file', { variant: 'error' });
        return;
      }
      if (file.size > MAX_COVER_IMAGE_BYTES) {
        enqueueSnackbar(`Cover image must be under ${MAX_COVER_IMAGE_BYTES / (1024 * 1024)}MB`, { variant: 'error' });
        return;
      }
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validEbookTypes = [
    'application/pdf',
    'application/epub+zip',
    'application/x-mobipocket-ebook',
    'application/vnd.amazon.ebook',
  ];

  // Some browsers report an empty/generic mimetype for .mobi/.epub files —
  // fall back to the extension so the presigned upload still gets a real,
  // storage-accepted content type instead of '' or application/octet-stream.
  const resolveEbookContentType = (file: File): string => {
    if (validEbookTypes.includes(file.type)) return file.type;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'application/pdf';
    if (ext === 'epub') return 'application/epub+zip';
    if (ext === 'mobi') return 'application/x-mobipocket-ebook';
    return file.type || 'application/octet-stream';
  };

  const handleEbookFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        !validEbookTypes.includes(file.type) &&
        !file.name.match(/\.(pdf|epub|mobi)$/i)
      ) {
        enqueueSnackbar('Please upload a valid ebook file (PDF, EPUB, MOBI)', {
          variant: 'error',
        });
        return;
      }
      if (file.size > MAX_EBOOK_FILE_BYTES) {
        enqueueSnackbar(`Ebook file must be under ${MAX_EBOOK_FILE_BYTES / (1024 * 1024)}MB`, { variant: 'error' });
        return;
      }
      setEbookFile(file);
    }
  };

  const onSubmit = async (data: EbookFormData) => {
    if (!coverImage || !ebookFile) {
      enqueueSnackbar('Please add a cover image and an ebook file', { variant: 'error' });
      return;
    }
    setIsCreatingProduct(true);
    try {
      // Both files upload straight to storage from the browser first — this
      // request never carries the file bytes, so it can't hit Vercel's
      // request-size limit no matter how large the ebook file is.
      const [coverUpload, ebookUpload] = await Promise.all([
        uploadProductFileDirect(coverImage),
        uploadProductFileDirect(ebookFile, resolveEbookContentType(ebookFile)),
      ]);

      await createProduct({
        name: data.name,
        description: data.description,
        sku: data.sku.trim().toUpperCase(),
        price: data.price,
        categories: data.categories,
        status: data.status,
        tags: data.tags,
        isActive: data.isActive,
        type: ProductType.EBOOK,
        images: [coverUpload.key],
        ebookDeliveryInfo: {
          downloadUrl: ebookUpload.key,
          bookCoverArt: coverUpload.key,
        },
      } as unknown as CreateProductDto);

      enqueueSnackbar('Ebook created successfully', { variant: 'success' });
      reset();
      setCoverImage(null);
      setEbookFile(null);
      setCoverImagePreview(null);
      router.push(ROUTES.DASHBOARD.SHOP.HOME);
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Failed to create ebook. SKU may already exist.',
        { variant: 'error' },
      );
    } finally {
      setIsCreatingProduct(false);
    }
  };

  return (
    <Paper sx={{ p: 4, mt: 2 }}>
      <Typography
        variant="h5"
        component="h2"
        sx={{ mb: 3, fontFamily: 'ClashDisplay', fontWeight: 600 }}
      >
        Create Ebook Product
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ maxWidth: 800 }}
      >
        <Box
          sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: '1rem' }}
        >
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
              <Typography variant="subtitle1" gutterBottom>
                Book Cover Art
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: 'grey.50',
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() =>
                  document.getElementById('cover-image-upload')?.click()
                }
              >
                <input
                  type="file"
                  id="cover-image-upload"
                  hidden
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleCoverImageUpload}
                />
                {coverImagePreview ? (
                  <Box sx={{ width: '100%', mb: 2 }}>
                    <img
                      src={coverImagePreview}
                      alt="Cover preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 300,
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                ) : (
                  <>
                    <FileUploadIcon
                      sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }}
                    />
                    <Typography>Upload cover image (.jpg, .png)</Typography>
                  </>
                )}
                {coverImage && (
                  <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                    {coverImage.name}
                  </Typography>
                )}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" gutterBottom>
                Ebook File (PDF, EPUB, MOBI)
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: 'grey.50',
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() =>
                  document.getElementById('ebook-file-upload')?.click()
                }
              >
                <input
                  type="file"
                  id="ebook-file-upload"
                  hidden
                  accept=".pdf,.epub,.mobi,application/pdf,application/epub+zip,application/x-mobipocket-ebook,application/vnd.amazon.ebook"
                  onChange={handleEbookFileUpload}
                />
                <FileUploadIcon
                  sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }}
                />
                <Typography>Upload ebook file</Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  PDF, EPUB, or MOBI format
                </Typography>
                {ebookFile && (
                  <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
                    {ebookFile.name} (
                    {(ebookFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Typography>
                )}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isCreatingProduct || !coverImage || !ebookFile}
                startIcon={<SaveIcon />}
                sx={{
                  bgcolor: '#2FD65D',
                  '&:hover': { bgcolor: '#2AC152' },
                  color: 'white',
                }}
              >
                {isCreatingProduct ? 'Creating Ebook...' : 'Create Ebook'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
}
