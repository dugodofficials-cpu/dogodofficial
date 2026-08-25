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
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SaveIcon from '@mui/icons-material/Save';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createProductSchema,
  CreateProductFormData,
} from '@/lib/admin/validations/product';
import {
  CreateProductDto,
  ProductStatus,
  ProductType,
  uploadProductImageDirect,
  createProduct,
  updateProduct,
} from '@/lib/admin/api/products';
import { enqueueSnackbar } from 'notistack';
import { ROUTES } from '@/utils/paths';
import { productCategories } from '@/lib/admin/utils/categories';
import { useRouter } from 'next/navigation';

const shippingCategories = ['Small', 'Medium', 'Large', 'Extra Large'];
const sizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function AddProductForm() {
  const [images, setImages] = React.useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      description: '',
      sizes: [],
      color: '',
      sku: '',
      price: '',
      stockQuantity: '',
      categories: [],
      status: ProductStatus.DRAFT,
      type: ProductType.PHYSICAL,
      images: [],
      tags: '',
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 4) {
      alert('You can only upload up to 4 images');
      return;
    }
    const oversized = files.find((file) => file.size > MAX_IMAGE_BYTES);
    if (oversized) {
      alert(`"${oversized.name}" is over ${MAX_IMAGE_BYTES / (1024 * 1024)}MB. Please choose a smaller image.`);
      return;
    }
    setImages(files);
  };

  const onSubmit = async (data: CreateProductFormData) => {
    setIsSubmitting(true);
    try {
      const { tags, ...rest } = data;
      // Create the product's metadata first — this request has no file in
      // it, so it's small and can't hit Vercel's request-size limit.
      const created = await createProduct({
        ...rest,
        tags: [tags],
      } as unknown as CreateProductDto);

      if (images.length > 0) {
        try {
          // Each image uploads straight to storage from the browser, then we
          // attach the resulting keys with a normal (small, JSON) update —
          // the image bytes never pass through this app's own API route.
          const uploaded = await Promise.all(images.map((file) => uploadProductImageDirect(file)));
          await updateProduct(created.data._id, { images: uploaded.map((u) => u.key) });
        } catch (uploadError) {
          enqueueSnackbar(
            'Product was created, but the image upload failed — edit the product to add images.',
            { variant: 'warning' },
          );
          console.error('Product image upload failed:', uploadError);
          reset();
          router.push(ROUTES.DASHBOARD.SHOP.HOME);
          return;
        }
      }

      enqueueSnackbar('Product created successfully', { variant: 'success' });
      reset();
      router.push(ROUTES.DASHBOARD.SHOP.HOME);
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Failed to create product', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ maxWidth: 800 }}
    >
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: '1rem' }}
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Item Name"
              error={!!errors.name}
              helperText={errors.name?.message}
              required
            />
          )}
        />

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
                <FormHelperText>{errors.categories.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

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
            />
          )}
        />

        <Controller
          name="sizes"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.sizes} required>
              <InputLabel id="sizes-label">Size</InputLabel>
              <Select
                {...field}
                labelId="sizes-label"
                label="Sizes"
                multiple
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                input={<OutlinedInput label="Sizes" />}
              >
                {sizes.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
              {errors.sizes && (
                <FormHelperText>{errors.sizes.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Color"
              error={!!errors.color}
              helperText={errors.color?.message}
              required
            />
          )}
        />

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

        <Controller
          name="stockQuantity"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Inventory Quantity"
              type="number"
              error={!!errors.stockQuantity}
              helperText={errors.stockQuantity?.message}
              required
            />
          )}
        />

        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              fullWidth
              label="Shipping Category"
              error={!!errors.tags}
              helperText={errors.tags?.message}
              required
            >
              {shippingCategories.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

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

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Cover Art Upload
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: 'grey.50',
            }}
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            <input
              type="file"
              id="image-upload"
              hidden
              multiple
              accept="image/jpeg,image/png"
              onChange={handleImageUpload}
            />
            <FileUploadIcon
              sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }}
            />
            <Typography>Upload image (.jpg, .png, less than 2MB)</Typography>
            {images.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="primary">
                  {images.length} image(s) selected
                </Typography>
              </Box>
            )}
            {errors.images && (
              <FormHelperText error>{errors.images.message}</FormHelperText>
            )}
          </Paper>
        </Box>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          startIcon={<SaveIcon />}
          sx={{
            bgcolor: '#2FD65D',
            '&:hover': { bgcolor: '#2AC152' },
            color: 'white',
          }}
        >
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </Button>
      </Box>
    </Box>
  );
}
