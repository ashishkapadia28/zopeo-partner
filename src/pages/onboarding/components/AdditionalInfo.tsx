import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Paper
} from '@mui/material';
import { format, parse } from 'date-fns';

interface AdditionalInfoProps {
  onNext: () => void;
  onBack: () => void;
  onDataUpdate: (data: any) => void;
  businessType?: string;
  businessCategory?: string;
}

const FOOD_CATEGORY_IDS = ['food', 'restaurant', 'grocery', 'beverages'];

const AdditionalInfo: React.FC<AdditionalInfoProps> = ({ 
  onNext, 
  onBack, 
  onDataUpdate,
  businessType = 'RETAILER',
  businessCategory = ''
}) => {
  const [formData, setFormData] = useState({
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    businessHours: {
      monday: { open: '08:00', close: '21:00' },
      tuesday: { open: '08:00', close: '21:00' },
      wednesday: { open: '08:00', close: '21:00' },
      thursday: { open: '08:00', close: '21:00' },
      friday: { open: '08:00', close: '21:00' },
      saturday: { open: '08:00', close: '21:00' },
      sunday: { open: '08:00', close: '21:00' }
    },
    gstNumber: '',
    fssaiNumber: ''
  });
  
  const isFoodBusiness = FOOD_CATEGORY_IDS.some(id => 
    businessCategory?.toLowerCase().includes(id)
  );
  const isGstRequired = businessType !== 'RETAILER';
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const validatePhone = (phone: string) => {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBusinessHoursChange = (day: string, field: 'open' | 'close', time: string) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day as keyof typeof prev.businessHours],
          [field]: time
        }
      }
    }));
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    if (!formData.ownerPhone) {
      newErrors.ownerPhone = 'Phone number is required';
    } else if (!validatePhone(formData.ownerPhone)) {
      newErrors.ownerPhone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.ownerEmail) {
      newErrors.ownerEmail = 'Email is required';
    } else if (!validateEmail(formData.ownerEmail)) {
      newErrors.ownerEmail = 'Please enter a valid email address';
    }
    
    if (isGstRequired && !formData.gstNumber) {
      newErrors.gstNumber = 'GST number is required for this business type';
    }
    
    if (isFoodBusiness && !formData.fssaiNumber) {
      newErrors.fssaiNumber = 'FSSAI number is required for food businesses';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onDataUpdate({
        additionalInfo: formData
      });
      onNext();
    }
  };
  
  // Format time for display
  const formatTimeDisplay = (time: string) => {
    try {
      return format(parse(time, 'HH:mm', new Date()), 'hh:mm a');
    } catch (e) {
      return time;
    }
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>  
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {daysOfWeek.map((day) => (
          <Box key={day.key} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Box sx={{ width: { xs: '100%', sm: '25%' }, minWidth: 100 }}>
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'medium' }}>{day.label}</Typography>
            </Box>
            <Box sx={{ width: { xs: '45%', sm: '20%' }, minWidth: 120 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Open</InputLabel>
                <Select
                  value={formData.businessHours[day.key as keyof typeof formData.businessHours].open}
                  onChange={(e) => handleBusinessHoursChange(day.key, 'open', e.target.value)}
                  label="Open"
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return Array.from({ length: 4 }, (_, j) => {
                      const minute = (j * 15).toString().padStart(2, '0');
                      const time = `${hour}:${minute}`;
                      return (
                        <MenuItem key={`${day.key}-open-${time}`} value={time}>
                          {formatTimeDisplay(time)}
                        </MenuItem>
                      );
                    });
                  })}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ width: { xs: '45%', sm: '20%' }, minWidth: 120 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Close</InputLabel>
                <Select
                  value={formData.businessHours[day.key as keyof typeof formData.businessHours].close}
                  onChange={(e) => handleBusinessHoursChange(day.key, 'close', e.target.value)}
                  label="Close"
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return Array.from({ length: 4 }, (_, j) => {
                      const minute = (j * 15).toString().padStart(2, '0');
                      const time = `${hour}:${minute}`;
                      return (
                        <MenuItem key={`${day.key}-close-${time}`} value={time}>
                          {formatTimeDisplay(time)}
                        </MenuItem>
                      );
                    });
                  })}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ 
              width: { xs: '100%', sm: '25%' },
              mt: { xs: 1, sm: 0 },
              textAlign: { xs: 'left', sm: 'center' },
              pl: { xs: 0, sm: 2 }
            }}>
              {formatTimeDisplay(formData.businessHours[day.key as keyof typeof formData.businessHours].open)} - {formatTimeDisplay(formData.businessHours[day.key as keyof typeof formData.businessHours].close)}
            </Box>
          </Box>
        ))}
      </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Contact Information
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 16px)' } }}>
          <TextField
            required
            fullWidth
            label="Owner's Full Name"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleChange}
            error={!!errors.ownerName}
            helperText={errors.ownerName}
            margin="normal"
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 16px)' } }}>
          <TextField
            required
            fullWidth
            label="Owner's Phone Number"
            name="ownerPhone"
            type="tel"
            value={formData.ownerPhone}
            onChange={handleChange}
            error={!!errors.ownerPhone}
            helperText={errors.ownerPhone || "10-digit mobile number"}
            placeholder="9876543210"
            margin="normal"
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 16px)' } }}>
          <TextField
            required
            fullWidth
            label="Owner's Email"
            name="ownerEmail"
            type="email"
            value={formData.ownerEmail}
            onChange={handleChange}
            error={!!errors.ownerEmail}
            helperText={errors.ownerEmail}
            placeholder="john@testshop.com"
            margin="normal"
          />
        </Box>
      </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Business Registration
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {isGstRequired && (
          <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 16px)' } }}>
            <TextField
              required={isGstRequired}
              fullWidth
              label="GST Number"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              error={!!errors.gstNumber}
              helperText={errors.gstNumber || (isGstRequired ? 'Required for wholesale/manufacturing businesses' : 'Optional')}
              placeholder="22AAAAA0000A1Z5"
              margin="normal"
            />
          </Box>
        )}
        
        {isFoodBusiness && (
          <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 16px)' } }}>
            <TextField
              required={isFoodBusiness}
              fullWidth
              label="FSSAI License Number"
              name="fssaiNumber"
              value={formData.fssaiNumber}
              onChange={handleChange}
              error={!!errors.fssaiNumber}
              helperText={errors.fssaiNumber || 'Required for food businesses'}
              placeholder="100XXXXXX"
              margin="normal"
            />
          </Box>
        )}
      </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default AdditionalInfo;