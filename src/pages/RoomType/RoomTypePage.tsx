import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../utils/api';
import { useProperty } from '../../context/PropertyContext';

interface RoomType {
  _id?: string;
  name: string;
  description?: string;
  baseRate: number;
  capacity: number;
  amenities?: string[];
  images?: string[];
  propertyId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse {
  success: boolean;
  data: RoomType[] | RoomType;
  message?: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  description: Yup.string(),
  baseRate: Yup.number().required('Base rate is required').min(0, 'Base rate must be positive'),
  capacity: Yup.number().required('Capacity is required').min(1, 'Capacity must be at least 1'),
  propertyId: Yup.string().required('Property is required'),
});

export const RoomTypePage: React.FC = () => {
  const { selectedProperty } = useProperty();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);

  useEffect(() => {
    if (selectedProperty?._id) {
      fetchRoomTypes();
    }
  }, [selectedProperty?._id]);

  const fetchRoomTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<ApiResponse>(`/room-types?propertyId=${selectedProperty?._id}`);
      
      if (response.data.success) {
        const roomTypesData = Array.isArray(response.data.data) 
          ? response.data.data 
          : [response.data.data];
        setRoomTypes(roomTypesData);
      } else {
        setError(response.data.message || 'Failed to fetch room types');
        setRoomTypes([]);
      }
    } catch (error: any) {
      console.error('Error fetching room types:', error);
      setError(error.response?.data?.message || 'Failed to fetch room types');
      setRoomTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik<RoomType>({
    initialValues: {
      name: '',
      description: '',
      baseRate: 0,
      capacity: 1,
      amenities: [],
      propertyId: selectedProperty?._id || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        setSuccessMessage(null);
        
        if (selectedRoomType?._id) {
          const response = await api.put<ApiResponse>(`/room-types/${selectedRoomType._id}`, values);
          if (response.data.success) {
            setSuccessMessage('Room type updated successfully');
          } else {
            setError(response.data.message || 'Failed to update room type');
          }
        } else {
          const response = await api.post<ApiResponse>('/room-types', {
            ...values,
            propertyId: selectedProperty?._id,
          });
          if (response.data.success) {
            setSuccessMessage('Room type created successfully');
          } else {
            setError(response.data.message || 'Failed to create room type');
          }
        }
        
        await fetchRoomTypes();
        handleCloseDialog();
      } catch (error: any) {
        console.error('Error saving room type:', error);
        setError(error.response?.data?.message || 'Failed to save room type');
      }
    },
  });

  const handleOpenDialog = (roomType?: RoomType) => {
    setError(null);
    setSuccessMessage(null);
    if (roomType) {
      setSelectedRoomType(roomType);
      formik.setValues({
        name: roomType.name,
        description: roomType.description || '',
        baseRate: roomType.baseRate,
        capacity: roomType.capacity,
        amenities: roomType.amenities || [],
        propertyId: roomType.propertyId,
      });
    } else {
      setSelectedRoomType(null);
      formik.resetForm({
        values: {
          name: '',
          description: '',
          baseRate: 0,
          capacity: 1,
          amenities: [],
          propertyId: selectedProperty?._id || '',
        },
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedRoomType(null);
    formik.resetForm();
    setError(null);
    setSuccessMessage(null);
  };

  const handleDeleteRoomType = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this room type?')) return;
    
    try {
      setError(null);
      setSuccessMessage(null);
      const response = await api.delete<ApiResponse>(`/room-types/${id}`);
      
      if (response.data.success) {
        setSuccessMessage('Room type deleted successfully');
        await fetchRoomTypes();
      } else {
        setError(response.data.message || 'Failed to delete room type');
      }
    } catch (error: any) {
      console.error('Error deleting room type:', error);
      setError(error.response?.data?.message || 'Failed to delete room type');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Room Types</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={!selectedProperty?._id}
        >
          Add Room Type
        </Button>
      </Box>

      {!selectedProperty?._id && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please select a property to manage room types
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Base Rate</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roomTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No room types found
                  </TableCell>
                </TableRow>
              ) : (
                roomTypes.map((roomType) => (
                  <TableRow key={roomType._id}>
                    <TableCell>{roomType.name}</TableCell>
                    <TableCell>{roomType.description || '-'}</TableCell>
                    <TableCell>
                      ${roomType.baseRate.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>{roomType.capacity}</TableCell>
                    <TableCell>{formatDate(roomType.createdAt)}</TableCell>
                    <TableCell>{formatDate(roomType.updatedAt)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(roomType)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteRoomType(roomType._id!)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {selectedRoomType ? 'Edit Room Type' : 'New Room Type'}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                id="description"
                name="description"
                label="Description"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
              <TextField
                fullWidth
                id="baseRate"
                name="baseRate"
                label="Base Rate"
                type="number"
                value={formik.values.baseRate}
                onChange={formik.handleChange}
                error={formik.touched.baseRate && Boolean(formik.errors.baseRate)}
                helperText={formik.touched.baseRate && formik.errors.baseRate}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
              <TextField
                fullWidth
                id="capacity"
                name="capacity"
                label="Capacity"
                type="number"
                value={formik.values.capacity}
                onChange={formik.handleChange}
                error={formik.touched.capacity && Boolean(formik.errors.capacity)}
                helperText={formik.touched.capacity && formik.errors.capacity}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <CircularProgress size={24} />
              ) : (
                selectedRoomType ? 'Update' : 'Create'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}; 