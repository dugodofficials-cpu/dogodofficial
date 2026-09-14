'use client';

import {
  Product,
  ProductSize,
  ProductStatus,
  ProductType,
  BundleItem,
} from '@/lib/admin/api/products';
import {
  EditProductFormData,
  editProductSchema,
} from '@/lib/admin/validations/product';
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
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Image from 'next/image';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { productCategories } from '@/lib/admin/utils/categories';
import { uploadProductFileDirect } from '@/lib/admin/api/products';
import { enqueueSnackbar } from 'notistack';

const MAX_PRODUCT_IMAGE_BYTES = 10 * 1024 * 1024;

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (updatedProduct: Product) => void;
  isLoading: boolean;
}

const sizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const bundleTiers = ['platinum', 'diamond', 'gold'];

export function EditProductModal({
  open,
  onClose,
  product,
  onSave,
  isLoading,
}: EditProductModalProps) {
  const [bundleItems, setBundleItems] = React.useState<BundleItem[]>(
    product?.bundleItems || [],
  );
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      sizes: product?.sizes || [],
      name: product?.name || '',
      price: product?.price.toString() || '',
      images: product?.images || [],
      categories: product?.categories || [],
      stockQuantity: product?.stockQuantity?.toString() || '',
      status: product?.status || ProductStatus.DRAFT,
      description: product?.description || '',
      sku: product?.sku || '',
      bundleTier: product?.bundleTier || '',
      color: product?.color || '',
      type: product?.type || ProductType.PHYSICAL,
      order: product?.order || 0,
    },
  });

  React.useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sizes: product.sizes || [],
        price: product.price.toString(),
        images: product.images,
        categories: product.categories,
        stockQuantity: product.stockQuantity?.toString() || '',
        status: product.status,
        description: product.description,
        sku: product.sku,
        bundleTier: product.bundleTier,
        color: product.color,
        type: product.type,
        order: product.order,
      });
      setBundleItems(product.bundleItems || []);
      setImageFile(null);
    }
  }, [product, reset]);

  const handleAddBundleItem = () => {
    const newItem: BundleItem = {
      productId: '',
      quantity: 1,
      title: '',
    };
    const updatedItems = [...bundleItems, newItem];
    setBundleItems(updatedItems);
  };

  const handleRemoveBundleItem = (index: number) => {
    const updatedItems = bundleItems.filter((_, i) => i !== index);
    setBundleItems(updatedItems);
  };

  const handleBundleItemChange = (
    index: number,
    field: keyof BundleItem,
    value: string | number,
  ) => {
    const updatedItems = [...bundleItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setBundleItems(updatedItems);
  };

  const onSubmit = async (data: EditProductFormData) => {
    if (product) {
      const updatedProduct: Record<string, unknown> = {
        ...product,
        ...data,
        sizes: data.sizes as ProductSize[],
        categories: data.categories?.[0] ? [data.categories[0]] : [],
        price: Number(data.price),
        stockQuantity: data.stockQuantity
          ? Number(data.stockQuantity)
          : undefined,
      };
      // Only touch images when a new file was actually picked. product.images
      // here is always the signed URL from the last GET response, never the
      // stored key — resubmitting it unchanged would persist that temporary
      // signed URL as the permanent value, breaking the image once its
      // 7-day signature expires. Omitting the field entirely leaves the
      // existing stored key untouched server-side.
      delete updatedProduct.images;
      if (imageFile) {
        setIsUploadingImage(true);
        try {
          // Uploads straight to storage from the browser — this request
          // never carries the file bytes, so it can't hit Vercel's
          // request-size limit.
          const { key } = await uploadProductFileDirect(imageFile);
          updatedProduct.images = [key];
        } catch (error) {
          enqueueSnackbar(error instanceof Error ? error.message : 'Failed to upload image', { variant: 'error' });
          setIsUploadingImage(false);
          return;
        }
        setIsUploadingImage(false);
      }

      if (product.type === ProductType.BUNDLE) {
        updatedProduct.bundleItems = bundleItems;
        updatedProduct.bundlePrice = Number(data.price);
      } else {
        updatedProduct.bundleItems = undefined;
        updatedProduct.bundlePrice = undefined;
      }

      onSave(updatedProduct as unknown as Product);
    }
    onClose();
  };

  if (!product) return null;

  const isBundle = product.type === ProductType.BUNDLE;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Edit {isBundle ? 'Bundle' : 'Product'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ width: 100, height: 100, position: 'relative', flexShrink: 0 }}>
                <Image
                  src={product.images[0] || '/assets/product-placeholder.svg'}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
              >
                {imageFile ? imageFile.name : `Replace ${isBundle ? 'bundle' : 'product'} image`}
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (file && file.size > MAX_PRODUCT_IMAGE_BYTES) {
                      enqueueSnackbar(`Image must be under ${MAX_PRODUCT_IMAGE_BYTES / (1024 * 1024)}MB`, { variant: 'error' });
                      return;
                    }
                    setImageFile(file);
                  }}
                />
              </Button>
            </Box>

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={isBundle ? 'Bundle Name' : 'Item Name'}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  required
                />
              )}
            />
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
                    field.onChange(value === '' ? undefined : Number(value));
                  }}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  required
                />
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
                  required
                />
              )}
            />

            {!isBundle && (
              <>
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
              </>
            )}

            <Controller
              name="categories"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={!!errors.categories}
                  sx={{ mb: 2 }}
                >
                  <InputLabel>Categories</InputLabel>
                  <Select
                    {...field}
                    multiple
                    label="Categories"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
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
            {isBundle && (
              <Controller
                name="bundleTier"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.bundleTier}
                    sx={{ mb: 2 }}
                  >
                    <InputLabel>Bundle Tier</InputLabel>
                    <Select {...field} label="Bundle Tier">
                      {bundleTiers.map((bundleTier) => (
                        <MenuItem key={bundleTier} value={bundleTier}>
                          {bundleTier}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.bundleTier && (
                      <FormHelperText>
                        {errors.bundleTier.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            )}

            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={isBundle ? 'Bundle Price' : 'Price'}
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

            {!isBundle && (
              <Controller
                name="stockQuantity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Stock Quantity"
                    type="number"
                    error={!!errors.stockQuantity}
                    helperText={errors.stockQuantity?.message}
                    required
                  />
                )}
              />
            )}

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="Status"
                  error={!!errors.status}
                  helperText={errors.status?.message}
                  required
                >
                  {Object.values(ProductStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {isBundle && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Bundle Items
                </Typography>

                {bundleItems.map((item, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 5 }}>
                          <TextField
                            fullWidth
                            label="Product ID"
                            value={item.productId}
                            onChange={(e) =>
                              handleBundleItemChange(
                                index,
                                'productId',
                                e.target.value,
                              )
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                          <TextField
                            type="number"
                            label="Quantity"
                            value={item.quantity}
                            onChange={(e) =>
                              handleBundleItemChange(
                                index,
                                'quantity',
                                parseInt(e.target.value),
                              )
                            }
                            inputProps={{ min: 1 }}
                            fullWidth
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            label="Title"
                            value={item.title}
                            onChange={(e) =>
                              handleBundleItemChange(
                                index,
                                'title',
                                e.target.value,
                              )
                            }
                            fullWidth
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 1 }}>
                          <IconButton
                            onClick={() => handleRemoveBundleItem(index)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddBundleItem}
                  variant="outlined"
                  sx={{ mb: 2 }}
                >
                  Add Bundle Item
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            sx={{ bgcolor: '#2FD65D' }}
            disabled={isLoading || isUploadingImage}
          >
            {isUploadingImage ? 'Uploading image...' : isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
