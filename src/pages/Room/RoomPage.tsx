import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import api from '../../utils/api';
import { useProperty } from '../../context/PropertyContext';

interface RoomType {
  _id: string;
  name: string;
  description?: string;
  baseRate: number;
  capacity: number;
}

interface Room {
  _id?: string;
  roomNumber: string;
  propertyId: string;
  roomType: string | RoomType;
  floor: number;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  bedType: string;
  description?: string;
  images?: Array<{
    url: string;
    caption?: string;
    isPrimary: boolean;
  }>;
  isActive: boolean;
  notes?: string;
  amenities: string[];
  lastCleaned?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const bedTypes = ['king', 'queen', 'double', 'single', 'twin', 'twin_xl', 'california_king'];
const amenitiesList = [
  { id: 'ac', label: 'AC', icon: '❄️' },
  { id: 'shower', label: 'Shower', icon: '🚿' },
  { id: 'smoking', label: 'Smoking', icon: '🚬' },
  { id: 'tv', label: 'TV', icon: '📺' },
  { id: 'bathtub', label: 'Bath tub', icon: '🛁' },
  { id: 'balcony', label: 'Balcony', icon: '🏗️' },
  { id: 'airPurifier', label: 'Air purifier', icon: '🌬️' },
  { id: 'electricKettle', label: 'Electric kettle', icon: '⚡' },
  { id: 'heater', label: 'Heater', icon: '🔥' },
  { id: 'inRoomDining', label: 'In room dining', icon: '🍽️' },
  { id: 'minibar', label: 'Minibar', icon: '🍷' },
  { id: 'coupleFriendly', label: 'Couple Friendly', icon: '👫' },
  { id: 'hairDryer', label: 'Hair Dryer', icon: '💨' },
  { id: 'microwave', label: 'Microwave', icon: '📡' },
  { id: 'fridge', label: 'Fridge', icon: '❄️' },
  { id: 'iron', label: 'Iron', icon: '👔' },
];

const validationSchema = Yup.object({
  roomNumber: Yup.string().required('Room number is required'),
  propertyId: Yup.string().required('Property is required'),
  roomType: Yup.string().required('Room type is required'),
  floor: Yup.number().required('Floor is required'),
  bedType: Yup.string().required('Bed type is required'),
  description: Yup.string(),
  amenities: Yup.array().of(Yup.string()),
  isActive: Yup.boolean().default(true),
  notes: Yup.string(),
});

export const RoomPage: React.FC = () => {
  const { selectedProperty } = useProperty();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  useEffect(() => {
    if (selectedProperty?._id) {
      fetchRooms();
      fetchRoomTypes();
    }
  }, [selectedProperty?._id]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/rooms?propertyId=${selectedProperty?._id}`);
      if (response.data.success) {
        setRooms(response.data.data);
      } else {
        setError('Failed to fetch rooms');
      }
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      setError(error.response?.data?.error || 'Failed to fetch rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const response = await api.get(`/room-types?propertyId=${selectedProperty?._id}`);
      if (response.data.success) {
        setRoomTypes(response.data.data);
      } else {
        setError('Failed to fetch room types');
      }
    } catch (error: any) {
      console.error('Error fetching room types:', error);
      setError(error.response?.data?.error || 'Failed to fetch room types');
    }
  };

  const formik = useFormik<Room>({
    initialValues: {
      roomNumber: '',
      propertyId: selectedProperty?._id || '',
      roomType: '',
      floor: 1,
      status: 'available',
      bedType: '',
      description: '',
      images: [],
      isActive: true,
      notes: '',
      amenities: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        setSuccessMessage(null);
        
        if (selectedRoom?._id) {
          // Update existing room
          const response = await api.put(`/rooms/${selectedRoom._id}`, values);
          if (response.data.success) {
            setSuccessMessage('Room updated successfully');
            fetchRooms();
            handleCloseDialog();
          } else {
            setError(response.data.error || 'Failed to update room');
          }
        } else {
          // Create new room
          const response = await api.post('/rooms', {
            ...values,
            propertyId: selectedProperty?._id,
          });
          if (response.data.success) {
            setSuccessMessage('Room created successfully');
            fetchRooms();
            handleCloseDialog();
          } else {
            setError(response.data.error || 'Failed to create room');
          }
        }
      } catch (error: any) {
        console.error('Error saving room:', error);
        setError(error.response?.data?.error || 'Failed to save room');
      }
    },
  });

  const handleOpenDialog = (room?: Room) => {
    if (room) {
      setSelectedRoom(room);
      formik.setValues({
        roomNumber: room.roomNumber,
        propertyId: room.propertyId,
        roomType: room.roomType,
        floor: room.floor,
        status: room.status,
        bedType: room.bedType,
        description: room.description || '',
        images: room.images || [],
        isActive: room.isActive,
        notes: room.notes || '',
        amenities: room.amenities || [],
      });
    } else {
      setSelectedRoom(null);
      formik.resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedRoom(null);
    formik.resetForm();
    setError(null);
    setSuccessMessage(null);
  };

  const handleDeleteClick = (room: Room) => {
    setRoomToDelete(room);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roomToDelete?._id) return;
    
    try {
      setError(null);
      setSuccessMessage(null);
      const response = await api.delete(`/rooms/${roomToDelete._id}`);
      
      if (response.data.success) {
        setSuccessMessage('Room deleted successfully');
        fetchRooms();
      } else {
        setError(response.data.error || 'Failed to delete room');
      }
    } catch (error: any) {
      console.error('Error deleting room:', error);
      setError(error.response?.data?.error || 'Failed to delete room');
    } finally {
      setIsDeleteDialogOpen(false);
      setRoomToDelete(null);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // TODO: Implement image upload
      console.log('Uploading images:', files);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'occupied':
        return 'error';
      case 'maintenance':
        return 'warning';
      case 'cleaning':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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

      {!selectedProperty?._id && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please select a property to manage rooms
        </Alert>
      )}

      {/* Room List Section */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Rooms</Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => handleOpenDialog()}
            disabled={!selectedProperty?._id}
          >
            Create Room
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : rooms.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', p: 3 }}>
            No rooms found. Create a new room to get started.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Room Number</TableCell>
                  <TableCell>Floor</TableCell>
                  <TableCell>Room Type</TableCell>
                  <TableCell>Bed Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room._id}>
                    <TableCell>{room.roomNumber}</TableCell>
                    <TableCell>{room.floor}</TableCell>
                    <TableCell>
                      {typeof room.roomType === 'string' 
                        ? (roomTypes.find(type => type._id === room.roomType)?.name || 'Unknown Room Type')
                        : (room.roomType?.name || 'Unknown Room Type')}
                    </TableCell>
                    <TableCell>{room.bedType}</TableCell>
                    <TableCell>
                      <Chip 
                        label={room.status} 
                        color={getStatusColor(room.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(room)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteClick(room)}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Room Edit Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedRoom ? 'Edit Room' : 'Create Room'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  id="roomNumber"
                  name="roomNumber"
                  label="Room Number"
                  value={formik.values.roomNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.roomNumber && Boolean(formik.errors.roomNumber)}
                  helperText={formik.touched.roomNumber && formik.errors.roomNumber}
                />
                <TextField
                  fullWidth
                  id="floor"
                  name="floor"
                  label="Floor"
                  type="number"
                  value={formik.values.floor}
                  onChange={formik.handleChange}
                  error={formik.touched.floor && Boolean(formik.errors.floor)}
                  helperText={formik.touched.floor && formik.errors.floor}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Room Type</InputLabel>
                  <Select
                    id="roomType"
                    name="roomType"
                    value={formik.values.roomType}
                    onChange={formik.handleChange}
                    error={formik.touched.roomType && Boolean(formik.errors.roomType)}
                    label="Room Type"
                  >
                    {isLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : roomTypes.length === 0 ? (
                      <MenuItem disabled>No room types available</MenuItem>
                    ) : (
                      roomTypes.map((type) => (
                        <MenuItem key={type._id} value={type._id}>
                          {type.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Bed Type</InputLabel>
                  <Select
                    id="bedType"
                    name="bedType"
                    value={formik.values.bedType}
                    onChange={formik.handleChange}
                    error={formik.touched.bedType && Boolean(formik.errors.bedType)}
                    label="Bed Type"
                  >
                    {bedTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
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
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Room Images
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                  {[1, 2, 3, 4].map((index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '200px',
                        backgroundColor: '#f5f5f5',
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`image-upload-${index}`}
                        onChange={handleImageUpload}
                      />
                      <label htmlFor={`image-upload-${index}`}>
                        <IconButton component="span">
                          <ImageIcon sx={{ fontSize: 40 }} />
                        </IconButton>
                      </label>
                      <Typography variant="body2" color="textSecondary">
                        Click to upload
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Amenities
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {amenitiesList.map((amenity) => (
                    <Chip
                      key={amenity.id}
                      icon={<span>{amenity.icon}</span>}
                      label={amenity.label}
                      onClick={() => {
                        const newAmenities = formik.values.amenities.includes(amenity.id)
                          ? formik.values.amenities.filter((id) => id !== amenity.id)
                          : [...formik.values.amenities, amenity.id];
                        formik.setFieldValue('amenities', newAmenities);
                      }}
                      color={formik.values.amenities.includes(amenity.id) ? 'primary' : 'default'}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  id="notes"
                  name="notes"
                  label="Notes"
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  error={formik.touched.notes && Boolean(formik.errors.notes)}
                  helperText={formik.touched.notes && formik.errors.notes}
                />
              </Box>
            </Stack>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => formik.handleSubmit()}
            disabled={formik.isSubmitting || !selectedProperty?._id}
          >
            {formik.isSubmitting ? (
              <CircularProgress size={24} />
            ) : selectedRoom ? (
              'Update'
            ) : (
              'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete room {roomToDelete?.roomNumber}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDeleteConfirm}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}; 