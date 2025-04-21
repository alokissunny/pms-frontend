import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import { useProperty } from '../../context/PropertyContext';

interface AddPropertyFormData {
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  email: string;
  website: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Property name is required'),
  description: Yup.string().required('Description is required'),
  address: Yup.object({
    street: Yup.string().required('Street address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    zipCode: Yup.string().required('ZIP code is required'),
    country: Yup.string().required('Country is required'),
  }),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  website: Yup.string().url('Invalid URL').required('Website is required'),
});

export const AddPropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProperties } = useProperty();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const formik = useFormik<AddPropertyFormData>({
    initialValues: {
      name: '',
      description: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      email: '',
      website: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        // Create the property using the service
        const newProperty = await propertyService.createProperty({
          ...values,
          isActive: true,
          location: {
            type: 'Point',
            coordinates: [0, 0] // Default coordinates, should be updated with actual location
          }
        });
        
        // Refresh the properties list in the context
        await refreshProperties();
        
        // Show success message
        setSnackbarMessage('Property created successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Navigate back to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } catch (err: any) {
        console.error('Error creating property:', err);
        setError(err.response?.data?.error || 'Failed to create property. Please try again.');
        setSnackbarMessage('Failed to create property');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Add New Property
        </Typography>
        <Divider sx={{ mb: 4 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
            {/* Basic Information */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Property Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  id="description"
                  name="description"
                  label="Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                  disabled={loading}
                />
              </Stack>
            </Box>

            {/* Address */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Address
              </Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  id="address.street"
                  name="address.street"
                  label="Street Address"
                  value={formik.values.address.street}
                  onChange={formik.handleChange}
                  error={formik.touched.address?.street && Boolean(formik.errors.address?.street)}
                  helperText={formik.touched.address?.street && formik.errors.address?.street}
                  disabled={loading}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    id="address.city"
                    name="address.city"
                    label="City"
                    value={formik.values.address.city}
                    onChange={formik.handleChange}
                    error={formik.touched.address?.city && Boolean(formik.errors.address?.city)}
                    helperText={formik.touched.address?.city && formik.errors.address?.city}
                    disabled={loading}
                  />
                  <TextField
                    fullWidth
                    id="address.state"
                    name="address.state"
                    label="State"
                    value={formik.values.address.state}
                    onChange={formik.handleChange}
                    error={formik.touched.address?.state && Boolean(formik.errors.address?.state)}
                    helperText={formik.touched.address?.state && formik.errors.address?.state}
                    disabled={loading}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    id="address.zipCode"
                    name="address.zipCode"
                    label="ZIP Code"
                    value={formik.values.address.zipCode}
                    onChange={formik.handleChange}
                    error={formik.touched.address?.zipCode && Boolean(formik.errors.address?.zipCode)}
                    helperText={formik.touched.address?.zipCode && formik.errors.address?.zipCode}
                    disabled={loading}
                  />
                  <TextField
                    fullWidth
                    id="address.country"
                    name="address.country"
                    label="Country"
                    value={formik.values.address.country}
                    onChange={formik.handleChange}
                    error={formik.touched.address?.country && Boolean(formik.errors.address?.country)}
                    helperText={formik.touched.address?.country && formik.errors.address?.country}
                    disabled={loading}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Contact Information */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Contact Information
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    disabled={loading}
                  />
                  <TextField
                    fullWidth
                    id="website"
                    name="website"
                    label="Website"
                    value={formik.values.website}
                    onChange={formik.handleChange}
                    error={formik.touched.website && Boolean(formik.errors.website)}
                    helperText={formik.touched.website && formik.errors.website}
                    disabled={loading}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Creating Property...' : 'Add Property'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}; 