import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
} from '@mui/material';

interface ReviewSubmitProps {
  data: any;
  onBack: () => void;
  onComplete: () => void;
}

const ReviewSubmit: React.FC<ReviewSubmitProps> = ({ data, onBack, onComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    businessInfo = {},
    additionalInfo = {},
    documents = {}
  } = data;
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Here you would typically make the final submission API call
      // For example:
      // const response = await api.post('/seller/onboard/submit', {
      //   sessionId: data.sessionId
      // });
      
      // If successful, proceed to completion
      onComplete();
    } catch (err) {
      console.error('Submission failed:', err);
      setError('Failed to submit your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderSection = (title: string, data: Record<string, any>, exclude: string[] = []) => {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableBody>
              {Object.entries(data)
                .filter(([key]) => !exclude.includes(key))
                .map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell component="th" scope="row" sx={{ width: '40%', fontWeight: 'bold' }}>
                      {key.split(/(?=[A-Z])/).map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </TableCell>
                    <TableCell>
                      {value === null || value === undefined ? 'Not provided' : String(value)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };
  
  const renderDocuments = () => {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Documents
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Document Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>PAN Card</TableCell>
                <TableCell>
                  {documents.panFile ? '✓ Uploaded' : '✗ Missing'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Address Proof</TableCell>
                <TableCell>
                  {documents.addressProof ? '✓ Uploaded' : '✗ Missing'}
                </TableCell>
              </TableRow>
              {documents.gstFile && (
                <TableRow>
                  <TableCell>GST Certificate</TableCell>
                  <TableCell>✓ Uploaded</TableCell>
                </TableRow>
              )}
              {documents.fssaiFile && (
                <TableRow>
                  <TableCell>FSSAI Certificate</TableCell>
                  <TableCell>✓ Uploaded</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell>Shop Image</TableCell>
                <TableCell>
                  {documents.shopImage ? '✓ Uploaded' : '✗ Missing'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Review Your Information
      </Typography>
      
      <Typography variant="body1" paragraph>
        Please review all the information you've provided. Make sure everything is accurate before submitting your application.
      </Typography>
      
      {renderSection('Business Information', businessInfo)}
      {renderSection('Additional Information', additionalInfo)}
      {renderDocuments()}
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          onClick={onBack}
          variant="outlined"
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </Box>
    </Box>
  );
};

export default ReviewSubmit;
