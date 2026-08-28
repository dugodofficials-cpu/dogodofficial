'use client';

import { useUpdateBlackboxQuestion } from '@/hooks/admin/blackbox';
import { BlackboxQuestion, UpdateQuestionDto, uploadQuestionImageDirect } from '@/lib/admin/api/blackbox';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { enqueueSnackbar } from 'notistack';
import React, { useState, useCallback, useEffect } from 'react';

const MAX_QUESTION_IMAGE_BYTES = 10 * 1024 * 1024;

interface EditQuestionModalProps {
  open: boolean;
  onClose: () => void;
  question: BlackboxQuestion;
}

export function EditQuestionModal({
  open,
  onClose,
  question,
}: EditQuestionModalProps) {
  const [formData, setFormData] = useState<UpdateQuestionDto>({});
  const [errors, setErrors] = useState<Partial<UpdateQuestionDto>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const updateQuestion = useUpdateBlackboxQuestion();

  useEffect(() => {
    setFormData({
      question: question.question,
      answer: question.answer,
      secret: question.secret,
      order: question.order,
      isActive: question.isActive,
    });
    setImageFile(null);
    setErrors({});
  }, [question]);

  const handleInputChange = useCallback(
    (field: keyof UpdateQuestionDto, value: string | number | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<UpdateQuestionDto> = {};

    if (formData.question !== undefined) {
      if (!formData.question.trim()) {
        newErrors.question = 'Question is required';
      } else if (formData.question.length > 1000) {
        newErrors.question = 'Question must be less than 1000 characters';
      }
    }

    if (formData.answer !== undefined) {
      if (!formData.answer.trim()) {
        newErrors.answer = 'Answer is required';
      } else if (formData.answer.length > 500) {
        newErrors.answer = 'Answer must be less than 500 characters';
      }
    }

    if (formData.secret !== undefined) {
      if (!formData.secret.trim()) {
        newErrors.secret = 'Secret is required';
      } else if (formData.secret.length > 1000) {
        newErrors.secret = 'Secret must be less than 1000 characters';
      }
    }

    if (formData.order !== undefined && Number(formData.order) < 1) {
      newErrors.order = 'Order must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = { ...formData };
    if (imageFile) {
      setIsUploadingImage(true);
      try {
        // Uploads straight to storage from the browser — this request never
        // carries the file bytes, so it can't hit Vercel's request-size limit.
        const { key } = await uploadQuestionImageDirect(imageFile);
        payload.imageUrl = key;
      } catch (error) {
        enqueueSnackbar(error instanceof Error ? error.message : 'Failed to upload image', { variant: 'error' });
        setIsUploadingImage(false);
        return;
      }
      setIsUploadingImage(false);
    }

    updateQuestion.mutate({ id: question._id, data: payload });
    onClose();
  };

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Blackbox Question</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Question"
            multiline
            rows={3}
            value={formData.question || ''}
            onChange={(e) => handleInputChange('question', e.target.value)}
            error={!!errors.question}
            helperText={
              errors.question || 'Enter the question text (max 1000 characters)'
            }
            fullWidth
          />

          <TextField
            label="Answer"
            value={formData.answer || ''}
            onChange={(e) => handleInputChange('answer', e.target.value)}
            error={!!errors.answer}
            helperText={
              errors.answer || 'Enter the correct answer (max 500 characters)'
            }
            fullWidth
          />

          <TextField
            label="Secret"
            multiline
            rows={3}
            value={formData.secret || ''}
            onChange={(e) => handleInputChange('secret', e.target.value)}
            error={!!errors.secret}
            helperText={
              errors.secret ||
              'Enter the secret that will be revealed when answered correctly (max 1000 characters)'
            }
            fullWidth
          />

          <TextField
            label="Order"
            type="number"
            value={formData.order || ''}
            onChange={(e) =>
              handleInputChange('order', parseInt(e.target.value) || 1)
            }
            error={!!errors.order}
            helperText={
              errors.order || 'Enter the sequence order for this question'
            }
            fullWidth
            inputProps={{ min: 1 }}
          />

          {question.imageUrl && !imageFile && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                Current clue image
              </Typography>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={question.imageUrl} alt="Question clue" style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 4 }} />
            </Box>
          )}

          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
          >
            {imageFile ? imageFile.name : question.imageUrl ? 'Replace clue image' : 'Upload clue image (optional)'}
            <input
              type="file"
              hidden
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (file && file.size > MAX_QUESTION_IMAGE_BYTES) {
                  enqueueSnackbar(`Image must be under ${MAX_QUESTION_IMAGE_BYTES / (1024 * 1024)}MB`, { variant: 'error' });
                  return;
                }
                setImageFile(file);
              }}
            />
          </Button>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive ?? false}
                onChange={(e) =>
                  handleInputChange('isActive', e.target.checked)
                }
              />
            }
            label="Active"
          />

          <Alert severity="info">
            <strong>Note:</strong> Changing the order may affect the sequence of
            questions. Users must answer questions in order to progress.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={updateQuestion.isPending || isUploadingImage}
          sx={{ bgcolor: '#2FD65D', '&:hover': { bgcolor: '#2AC152' } }}
        >
          {isUploadingImage ? 'Uploading image...' : updateQuestion.isPending ? 'Updating...' : 'Update Question'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
