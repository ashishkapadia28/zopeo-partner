import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, MenuItem, Typography, CircularProgress, styled } from '@mui/material';
import { keyframes } from '@emotion/react';
import { useDebounce } from '../../../hooks/useDebounce';
import { sellerApi } from '../../../services/authService';

// Styled components
const RoundedInput = styled('div')({
  '& .MuiOutlinedInput-root': {
    borderRadius: '50px !important',
    '& fieldset': {
      borderRadius: '50px !important',
    },
    '&.Mui-focused fieldset': {
      borderWidth: '2px !important',
    },
  },
  '& .MuiOutlinedInput-input': {
    borderRadius: '50px !important',
  },
  '& .MuiSelect-select': {
    borderRadius: '50px !important',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderRadius: '50px !important',
  },
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    transition: 'all 0.2s ease-in-out',
    '& fieldset': {
      borderColor: theme.palette.grey[300],
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.light,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: '2px',
      borderColor: theme.palette.primary.main,
      boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.1)',
    },
    '&.Mui-error': {
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.error.light,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.error.main,
        boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.1)',
      },
    },
    // Style for select dropdown
    '&.MuiInputBase-adornedEnd': {
      paddingRight: '4px',
    },
    // Style for textarea
    '&.MuiInputBase-multiline': {
      padding: '8px 16px',
      '& textarea': {
        minHeight: '100px',
        padding: '8px 0',
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    fontSize: '0.95rem',
    '&.Mui-focused': {
      color: theme.palette.primary.main,
      fontWeight: 500,
    },
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderRadius: '50px !important',
    borderColor: theme.palette.grey[300] + ' !important',
    transition: 'all 0.2s ease-in-out',
  },
  '& .MuiOutlinedInput-input': {
    padding: '14px 16px',
    fontSize: '0.95rem',
    borderRadius: '50px',
  },
  '& .MuiSelect-select': {
    paddingRight: '32px',
    paddingLeft: '16px',
    borderRadius: '50px',
  },
  '& .MuiSelect-icon': {
    right: '12px',
    color: theme.palette.text.secondary,
  },
  '& .MuiInputLabel-outlined': {
    transform: 'translate(16px, 16px) scale(1)',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.85)',
      backgroundColor: theme.palette.background.paper,
      padding: '0 8px',
      borderRadius: '4px',
    },
  },
  marginBottom: '1.5rem',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '50px',
  padding: '14px 28px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  letterSpacing: '0.3px',
  boxShadow: '0 2px 10px 0 rgba(99, 102, 241, 0.15)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.25)',
  },
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: '0 2px 6px 0 rgba(99, 102, 241, 0.15)',
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.grey[500],
    boxShadow: 'none',
  },
}));

const FormContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 600,
  margin: '1.5rem 0 1rem',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: 0,
    width: '48px',
    height: '4px',
    background: 'linear-gradient(90deg, #4f46e5, #8b5cf6)',
    borderRadius: '2px',
  },
}));


interface Category {
  id: string;
  name: string;
}

interface BusinessInfoProps {
  onNext: () => void;
  onDataUpdate: (data: any) => void;
}

const STORAGE_KEY = 'onboarding_form_data';

const BusinessInfo: React.FC<BusinessInfoProps> = ({ onNext, onDataUpdate }) => {
  // Load saved data from localStorage on component mount
  const loadSavedData = () => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.businessInfo) {
          // Remove gstNumber from saved data if it exists
          const { gstNumber, ...rest } = parsedData.businessInfo;
          return rest;
        }
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
    // Return default values if no saved data
    return {
      shopName: '',
      businessType: 'RETAILER',
      panNumber: '',
      address: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
      country: 'India',
      businessCategory: '',
      businessSubCategory: '',
      shopUsername: ''
    };
  };

  const [formData, setFormData] = useState(loadSavedData);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const debouncedUsername = useDebounce(formData.shopUsername, 500);
  
  // Fetch main categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await sellerApi.get('/onboard/main-categories');
        // Make sure the response data is an array before setting it
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          // If the categories are nested in a data property
          setCategories(response.data.data);
        } else if (response.data && response.data.categories) {
          // If the categories are in a categories property
          setCategories(response.data.categories);
        } else {
          console.error('Unexpected categories response format:', response.data);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]); // Ensure categories is always an array
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fetch sub-categories when business category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (formData.businessCategory) {
        try {
          const response = await sellerApi.get(`/onboard/subcategories?categoryId=${formData.businessCategory}`);
          // Make sure the response data is an array before setting it
          if (Array.isArray(response.data)) {
            setSubCategories(response.data);
          } else if (response.data && Array.isArray(response.data.data)) {
            setSubCategories(response.data.data);
          } else if (response.data && response.data.subCategories) {
            setSubCategories(response.data.subCategories);
          } else {
            console.error('Unexpected sub-categories response format:', response.data);
            setSubCategories([]);
          }
        } catch (error) {
          console.error('Error fetching sub-categories:', error);
          setSubCategories([]); // Ensure subCategories is always an array
        }
      } else {
        setSubCategories([]);
      }
    };
    
    fetchSubCategories();
  }, [formData.businessCategory]);
  
  // Check username availability when debounced username changes
  useEffect(() => {
    const checkUsername = async () => {
      if (debouncedUsername && debouncedUsername.length >= 3) {
        setIsLoading(true);
        try {
          const response = await sellerApi.post('/onboard/check-username', {
            username: debouncedUsername
          });
          setIsUsernameAvailable(response.data.available);
        } catch (error) {
          console.error('Error checking username:', error);
          setIsUsernameAvailable(false);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    checkUsername();
  }, [debouncedUsername]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    if (!name) return;
    
    setFormData((prev: Record<string, any>) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev: Record<string, string>) => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.shopName.trim()) newErrors.shopName = 'Shop name is required';
    if (!formData.panNumber) newErrors.panNumber = 'PAN number is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    if (!formData.businessCategory) newErrors.businessCategory = 'Business category is required';
    if (!formData.businessSubCategory) newErrors.businessSubCategory = 'Business sub-category is required';
    if (!formData.shopUsername) {
      newErrors.shopUsername = 'Shop username is required';
    } else if (isUsernameAvailable === false) {
      newErrors.shopUsername = 'Username is not available';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const saveFormData = () => {
      try {
        const currentData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        currentData.businessInfo = formData;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    };
    
    saveFormData();
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onDataUpdate({
        businessInfo: formData
      });
      onNext();
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit}>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3, borderRadius: '8px', }}>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)'} }}>
          <TextField
            required
            fullWidth
            label="Shop Name"
            name="shopName"
            value={formData.shopName}
            sx={{ Radius: '20px' }}
            onChange={handleChange}
            error={!!errors.shopName}
            helperText={errors.shopName}
            variant="outlined"
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
          <TextField
            select
            required
            fullWidth
            label="Business Type"
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            error={!!errors.businessType}
            helperText={errors.businessType}
            variant="outlined"
          >
            <MenuItem value="RETAILER">Retailer</MenuItem>
            <MenuItem value="WHOLESALER">Wholesaler</MenuItem>
            <MenuItem value="MANUFACTURER">Manufacturer</MenuItem>
            <MenuItem value="SERVICE_PROVIDER">Service Provider</MenuItem>
          </TextField>
        </Box>
        


        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
          <TextField
            required
            fullWidth
            label="PAN Number"
            name="panNumber"
            value={formData.panNumber}
            onChange={handleChange}
            error={!!errors.panNumber}
            helperText={errors.panNumber || 'Required for verification'}
            variant="outlined"
          />
        </Box>

        <Box sx={{ width: '100%' }}>
          <TextField
            required
            fullWidth
            multiline
            rows={3}
            label="Business Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={!!errors.address}
            helperText={errors.address}
            variant="outlined"
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 16px)' } }}>
          <TextField
            required
            fullWidth
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            error={!!errors.city}
            helperText={errors.city}
            variant="outlined"
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 16px)' } }}>
          <TextField
            required
            fullWidth
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            error={!!errors.state}
            helperText={errors.state}
            variant="outlined"
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 16px)' } }}>
          <TextField
            required
            fullWidth
            label="Pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            error={!!errors.pincode}
            helperText={errors.pincode}
            variant="outlined"
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
          <TextField
            select
            required
            fullWidth
            label="Business Category"
            name="businessCategory"
            value={formData.businessCategory}
            onChange={handleChange}
            error={!!errors.businessCategory}
            helperText={errors.businessCategory}
            variant="outlined"
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
          <TextField
            select
            required
            fullWidth
            label="Business Sub-category"
            name="businessSubCategory"
            value={formData.businessSubCategory}
            onChange={handleChange}
            error={!!errors.businessSubCategory}
            helperText={errors.businessSubCategory}
            disabled={!formData.businessCategory}
            variant="outlined"
          >
            {subCategories.map((subCategory) => (
              <MenuItem key={subCategory.id} value={subCategory.id}>
                {subCategory.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ width: '100%' }}>
          <TextField
            required
            fullWidth
            label="Shop Username"
            name="shopUsername"
            value={formData.shopUsername}
            onChange={handleChange}
            error={!!errors.shopUsername}
            helperText={
              errors.shopUsername || 
              (isLoading ? 'Checking availability...' : 
               isUsernameAvailable === false ? 'Username not available' : 
               isUsernameAvailable === true ? 'Username available' : 'Choose a unique username')
            }
            InputProps={{
              endAdornment: isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : null,
            }}
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            disabled={isLoading}
            sx={{
              background: 'linear-gradient(90deg, #4f46e5, #8b5cf6)',
              '&:hover': {
                background: 'linear-gradient(90deg, #4338ca, #7c3aed)',
              },
            }}
          >
            Continue to Next Step
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default BusinessInfo;
