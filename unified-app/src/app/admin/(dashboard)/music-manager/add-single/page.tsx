'use client';

import { useGetAlbumCovers } from '@/hooks/admin/products';
import {
  CreateProductDto,
  AlbumCover,
  ProductStatus,
  ProductType,
  createProduct,
  uploadProductFileDirect,
} from '@/lib/admin/api/products';
import { singleFormSchema, type SingleFormData } from '@/lib/admin/validations/music';
import { ROUTES } from '@/utils/paths';
import { zodResolver } from '@hookform/resolvers/zod';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';

const MAX_AUDIO_FILE_BYTES = 300 * 1024 * 1024;
const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/flac', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg'];

// Browsers report audio mimetypes inconsistently (e.g. .mp3 usually comes
// back as audio/mpeg, .m4a varies by OS) — fall back to the extension so
// the presigned upload always gets a type the storage service will accept.
const resolveAudioContentType = (file: File): string => {
  if (validAudioTypes.includes(file.type)) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  const byExt: Record<string, string> = {
    mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/x-m4a',
    aac: 'audio/aac', ogg: 'audio/ogg', flac: 'audio/flac',
  };
  return byExt[ext || ''] || file.type || 'application/octet-stream';
};

export default function AddSinglePage() {
  const { data: albumCovers, isLoading: isLoadingAlbumCovers } =
    useGetAlbumCovers();
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<{
    cover?: File;
    audio?: File;
  }>({});

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SingleFormData>({
    resolver: zodResolver(singleFormSchema),
    defaultValues: {
      name: '',
      albumId: '',
      duration: '',
      sku: '',
      order: '',
      price: '',
      description: '',
      categories: '',
      tags: '',
      isActive: true,
    },
  });

  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'cover' | 'audio',
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === 'audio') {
        if (file.size > MAX_AUDIO_FILE_BYTES) {
          enqueueSnackbar(`Audio file must be under ${MAX_AUDIO_FILE_BYTES / (1024 * 1024)}MB`, { variant: 'error' });
          return;
        }
        setSelectedFileName(file.name);
        setUploadedFiles((prev) => ({ ...prev, audio: file }));
        setValue('audioFile', file.name);
      }
    }
  };

  const onSubmit = async (data: SingleFormData) => {
    if (!uploadedFiles.audio) {
      enqueueSnackbar('Please add an audio file', { variant: 'error' });
      return;
    }
    setIsPending(true);
    try {
      // Uploads straight to storage from the browser — this request never
      // carries the audio bytes, so it can't hit Vercel's request-size
      // limit no matter how large the track is.
      const { key: audioKey } = await uploadProductFileDirect(
        uploadedFiles.audio,
        resolveAudioContentType(uploadedFiles.audio),
      );

      await createProduct({
        ...data,
        type: ProductType.DIGITAL,
        status: ProductStatus.DRAFT,
        albumPrice: '1000',
        album:
          albumCovers?.data?.find((cover) => cover.id === data.albumId)?.title ||
          '',
        digitalDeliveryInfo: { downloadUrl: audioKey },
      } as unknown as CreateProductDto);

      enqueueSnackbar('Song created successfully', { variant: 'success' });
      router.push(ROUTES.DASHBOARD.MUSIC_MANAGER.HOME);
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Failed to create song', { variant: 'error' });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          mb: 4,
          flexDirection: 'column',
        }}
      >
        <Button
          component={Link}
          href={ROUTES.DASHBOARD.MUSIC_MANAGER.HOME}
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Songs
        </Button>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontFamily: 'ClashDisplay', fontWeight: 700 }}
        >
          Add Song
        </Typography>
      </Box>

      <Paper
        sx={{
          p: 4,
          maxWidth: 800,
          backgroundColor: '#F5F5F5',
          borderRadius: 2,
        }}
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Single Title
          </Typography>
          <TextField
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register('name')}
            sx={{ mb: 3 }}
          />

          <Typography variant="h6" sx={{ mb: 1 }}>
            Album
          </Typography>
          <TextField
            fullWidth
            select
            error={!!errors.albumId}
            helperText={errors.albumId?.message}
            {...register('albumId')}
            sx={{ mb: 3 }}
            disabled={isLoadingAlbumCovers}
          >
            <MenuItem value="" disabled={isLoadingAlbumCovers}>
              {isLoadingAlbumCovers ? 'Loading albums...' : 'Select an album'}
            </MenuItem>
            {albumCovers?.data?.map((cover: AlbumCover) => (
              <MenuItem key={cover.id} value={cover.id}>
                {cover.title}
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Order
          </Typography>
          <TextField
            fullWidth
            type="number"
            error={!!errors.order}
            helperText={errors.order?.message}
            {...register('order')}
            sx={{ mb: 3 }}
          />

          <Typography variant="h6" sx={{ mb: 1 }}>
            Duration
          </Typography>
          <TextField
            fullWidth
            placeholder="e.g., 03:54"
            error={!!errors.duration}
            helperText={errors.duration?.message}
            {...register('duration')}
            sx={{ mb: 3 }}
          />
          <Typography variant="h6" sx={{ mb: 1 }}>
            SKU
          </Typography>
          <TextField
            fullWidth
            placeholder="e.g., SKU123"
            error={!!errors.sku}
            helperText={errors.sku?.message}
            {...register('sku')}
            sx={{ mb: 3 }}
          />

          <Typography variant="h6" sx={{ mb: 1 }}>
            Genre
          </Typography>
          <TextField
            fullWidth
            placeholder="e.g., Afro-fusion, Hip-hop"
            error={!!errors.categories}
            helperText={errors.categories?.message}
            {...register('categories')}
            sx={{ mb: 3 }}
          />

          <Typography variant="h6" sx={{ mb: 1 }}>
            Price
          </Typography>
          <TextField
            fullWidth
            placeholder="e.g., ₦12,000"
            error={!!errors.price}
            helperText={errors.price?.message}
            {...register('price')}
            sx={{ mb: 3 }}
          />

          <Typography variant="h6" sx={{ mb: 1 }}>
            Feature Artist(s) (optional)
          </Typography>
          <TextField
            fullWidth
            placeholder="Ft. Maka, Oz, Sheva"
            error={!!errors.tags}
            helperText={errors.tags?.message}
            {...register('tags')}
            sx={{ mb: 3 }}
          />

          <Typography variant="h6" sx={{ mb: 1 }}>
            Description
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            error={!!errors.description}
            helperText={errors.description?.message}
            {...register('description')}
            sx={{ mb: 3 }}
          />

          <Typography variant="h6" sx={{ mb: 1 }}>
            Audio Upload (MP3, WAV, M4A, AAC, OGG)
          </Typography>
          <Box
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 3,
              mb: 3,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { borderColor: '#2FD65D' },
            }}
            onClick={() => document.getElementById('audio-upload')?.click()}
          >
            <IconButton size="large" sx={{ mb: 1 }}>
              <CloudUploadIcon />
            </IconButton>
            <Typography>
              {errors.audioFile ? (
                <span style={{ color: 'red' }}>{errors.audioFile.message}</span>
              ) : selectedFileName ? (
                <Box>
                  <Typography>Selected file:</Typography>
                  <Typography sx={{ color: '#2FD65D', fontWeight: 'medium' }}>
                    {selectedFileName}
                  </Typography>
                </Box>
              ) : (
                'Drop Audio files (MP3, WAV, M4A, AAC, OGG)'
              )}
            </Typography>
            <input
              id="audio-upload"
              type="file"
              accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/ogg"
              hidden
              {...register('audioFile')}
              onChange={(e) => handleFileChange(e, 'audio')}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{
              bgcolor: '#2FD65D',
              color: 'white',
              '&:hover': { bgcolor: '#2AC152' },
              py: 1.5,
            }}
            disabled={isPending}
          >
            {isPending ? 'Saving...' : 'Save Song'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
