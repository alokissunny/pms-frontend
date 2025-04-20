import React from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

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
        console.log('Form values:', values);
        // TODO: Implement API call to save property
      } catch (error) {
        console.error('Error saving property:', error);
      }
    },
  });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Add New Property
        </Typography>
        <Divider sx={{ mb: 4 }} />

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
              >
                Add Property
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}; 