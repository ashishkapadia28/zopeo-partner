import React, { useState, useCallback } from 'react';
import { Box, Button, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

interface FileUploadProps {
  label: string;
  name: string;
  required?: boolean;
  accept?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: boolean;
  helperText?: string;
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  name,
  required = false,
  accept = 'image/*,.pdf',
  value,
  onChange,
  error = false,
  helperText,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
    onChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" gutterBottom>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          border: isDragging ? '2px dashed #1976d2' : '1px dashed rgba(0, 0, 0, 0.23)',
          backgroundColor: isDragging ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
          cursor: 'pointer',
          textAlign: 'center',
          minHeight: 120,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <Box sx={{ textAlign: 'center' }}>
            <img
              src={preview}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '200px', marginBottom: '8px' }}
            />
            <Typography variant="body2" color="textSecondary">
              {value?.name}
            </Typography>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleFileChange(null);
              }}
              sx={{ mt: 1 }}
            >
              Remove
            </Button>
          </Box>
        ) : (
          <Box>
            <CloudUploadIcon fontSize="large" color="action" />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Drag and drop your file here, or click to select
            </Typography>
            <Typography variant="caption" color="textSecondary">
              (Supports: JPG, PNG, PDF, max 5MB)
            </Typography>
            <Button
              component="label"
              variant="outlined"
              sx={{ mt: 1 }}
              startIcon={<CloudUploadIcon />}
              onClick={(e) => e.stopPropagation()}
            >
              Choose File
              <VisuallyHiddenInput
                type="file"
                name={name}
                accept={accept}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleFileChange(file);
                }}
              />
            </Button>
          </Box>
        )}
      </Paper>
      {helperText && (
        <Typography
          variant="caption"
          color={error ? 'error' : 'textSecondary'}
          sx={{ display: 'block', mt: 0.5, ml: 1 }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

interface DocumentUploadProps {
  onNext: () => void;
  onBack: () => void;
  onDataUpdate: (data: any) => void;
  businessCategory?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onNext,
  onBack,
  onDataUpdate,
  businessCategory = '',
}) => {
  const [documents, setDocuments] = useState({
    panFile: null as File | null,
    addressProof: null as File | null,
    gstFile: null as File | null,
    fssaiFile: null as File | null,
    shopImage: null as File | null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const isFoodRelated = businessCategory?.toLowerCase().includes('food');
  
  const handleFileChange = (name: string, file: File | null) => {
    setDocuments(prev => ({
      ...prev,
      [name]: file
    }));
    
    // Clear error when file is selected
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!documents.panFile) newErrors.panFile = 'PAN card is required';
    if (!documents.addressProof) newErrors.addressProof = 'Address proof is required';
    if (isFoodRelated && !documents.fssaiFile) {
      newErrors.fssaiFile = 'FSSAI certificate is required for food-related businesses';
    }
    if (!documents.shopImage) newErrors.shopImage = 'Shop image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Create FormData for file uploads
        const formData = new FormData();
        
        // Append all files to FormData
        Object.entries(documents).forEach(([key, file]) => {
          if (file) {
            formData.append(key, file);
          }
        });
        
        // Here you would typically make an API call to upload the files
        // For example:
        // await api.post('/seller/onboard/upload-documents', formData, {
        //   headers: {
        //     'Content-Type': 'multipart/form-data',
        //   },
        // });
        
        // Update parent with document data
        onDataUpdate({
          documents: Object.fromEntries(
            Object.entries(documents).filter(([_, value]) => value !== null)
          )
        });
        
        // Proceed to next step
        onNext();
      } catch (error) {
        console.error('Error uploading documents:', error);
        setErrors({
          form: 'Failed to upload documents. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Document Upload
      </Typography>
      
      <Typography variant="body2" color="textSecondary" paragraph>
        Please upload the required documents for verification. All documents should be clear and legible.
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
          <FileUpload
            label="PAN Card (Front)"
            name="panFile"
            required
            accept="image/*,.pdf"
            value={documents.panFile}
            onChange={(file) => handleFileChange('panFile', file)}
            error={!!errors.panFile}
            helperText={errors.panFile || "Upload a clear image of your PAN card (front side)"}
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
          <FileUpload
            label="Address Proof"
            name="addressProof"
            required
            accept="image/*,.pdf"
            value={documents.addressProof}
            onChange={(file) => handleFileChange('addressProof', file)}
            error={!!errors.addressProof}
            helperText={errors.addressProof || "Upload Aadhaar, Voter ID, or Passport"}
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
          <FileUpload
            label="GST Certificate"
            name="gstFile"
            accept="image/*,.pdf"
            value={documents.gstFile}
            onChange={(file) => handleFileChange('gstFile', file)}
            helperText="Upload your GST certificate (if applicable)"
          />
        </Box>
        
        {isFoodRelated && (
          <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
            <FileUpload
              label="FSSAI Certificate"
              name="fssaiFile"
              required={isFoodRelated}
              accept="image/*,.pdf"
              value={documents.fssaiFile}
              onChange={(file) => handleFileChange('fssaiFile', file)}
              error={!!errors.fssaiFile}
              helperText={errors.fssaiFile || "FSSAI certificate is required for food businesses"}
            />
          </Box>
        )}
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <FileUpload
          label="Shop/Store Image"
          name="shopImage"
          required
          accept="image/*"
          value={documents.shopImage}
          onChange={(file) => handleFileChange('shopImage', file)}
          error={!!errors.shopImage}
          helperText={errors.shopImage || "Upload an image of your shop/store"}
        />
      </Box>
      
      {errors.form && (
        <Typography color="error" variant="body2" sx={{ mt: 2, mb: 1 }}>
          {errors.form}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          onClick={onBack}
          variant="outlined"
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Uploading...' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
};

export default DocumentUpload;
