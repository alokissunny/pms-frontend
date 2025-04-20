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
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ImageIcon from '@mui/icons-material/Image';
import api from '../../utils/api';

interface RoomType {
  _id: string;
  name: string;
  description?: string;
  baseRate: number;
  capacity: number;
}

interface RoomData {
  name: string;
  type: string;
  bedType: string;
  roomCount: number;
  description: string;
  basePrice: number;
  amenities: string[];
  images: string[];
}

const bedTypes = ['King size', 'Queen size', 'Twin', 'Single'];
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
  name: Yup.string().required('Room name is required'),
  type: Yup.string().required('Room type is required'),
  bedType: Yup.string().required('Bed type is required'),
  roomCount: Yup.number()
    .required('Room count is required')
    .min(1, 'Must have at least 1 room'),
  description: Yup.string().required('Description is required'),
  basePrice: Yup.number()
    .required('Base price is required')
    .min(0, 'Price must be positive'),
  amenities: Yup.array().of(Yup.string()),
  images: Yup.array().of(Yup.string()),
});

export const RoomPage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/room-types');
      if (response.data.success) {
        setRoomTypes(response.data.data);
      } else {
        setError('Failed to fetch room types');
      }
    } catch (error: any) {
      console.error('Error fetching room types:', error);
      setError(error.response?.data?.message || 'Failed to fetch room types');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for room list
  const [rooms] = useState<Array<Partial<RoomData>>>([
    { 
      name: 'Test',
      type: 'Deluxe',
      bedType: 'King size',
      roomCount: 1,
      description: '',
      basePrice: 0,
      amenities: [],
      images: []
    },
    { 
      name: 'Test',
      type: 'Deluxe',
      bedType: 'King size',
      roomCount: 1,
      description: '',
      basePrice: 0,
      amenities: [],
      images: []
    }
  ]);

  const formik = useFormik<RoomData>({
    initialValues: {
      name: '',
      type: '',
      bedType: '',
      roomCount: 1,
      description: '',
      basePrice: 0,
      amenities: [],
      images: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        console.log('Form values:', values);
        // TODO: Implement API call to save room
      } catch (error) {
        console.error('Error saving room:', error);
      }
    },
  });

  const handleGenerateDescription = () => {
    // TODO: Implement AI description generation
    console.log('Generating description...');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // TODO: Implement image upload
      console.log('Uploading images:', files);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Room List Section */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => setIsEditing(true)}
          >
            Create Room
          </Button>
          <Box sx={{ display: 'flex', gap: 2, ml: 4 }}>
            {rooms.map((room, index) => (
              <Paper
                key={index}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: '1px solid #e0e0e0',
                  '&:hover': { borderColor: 'primary.main' },
                }}
                onClick={() => {
                  setSelectedRoom(room as RoomData);
                  setIsEditing(true);
                }}
              >
                <Typography variant="subtitle1">{room.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {room.type}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Room Edit Form */}
      {isEditing && (
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h5">
              {selectedRoom ? 'Edit Room' : 'Create Room'}
            </Typography>
            <Button variant="contained" color="primary" onClick={formik.submitForm}>
              {selectedRoom ? 'Update' : 'Create'}
            </Button>
          </Box>

          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Room Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
                <FormControl fullWidth>
                  <InputLabel>Room Type</InputLabel>
                  <Select
                    id="type"
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                    error={formik.touched.type && Boolean(formik.errors.type)}
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
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
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
                <TextField
                  fullWidth
                  id="roomCount"
                  name="roomCount"
                  label="Room Count"
                  type="number"
                  value={formik.values.roomCount}
                  onChange={formik.handleChange}
                  error={formik.touched.roomCount && Boolean(formik.errors.roomCount)}
                  helperText={formik.touched.roomCount && formik.errors.roomCount}
                />
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
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mt: 1 }}
                  onClick={handleGenerateDescription}
                >
                  Generate Description using AI
                </Button>
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
                  Base Price (2 Guests)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography>₹</Typography>
                  <TextField
                    id="basePrice"
                    name="basePrice"
                    type="number"
                    value={formik.values.basePrice}
                    onChange={formik.handleChange}
                    error={formik.touched.basePrice && Boolean(formik.errors.basePrice)}
                    helperText={formik.touched.basePrice && formik.errors.basePrice}
                  />
                  <Button variant="outlined" size="small">
                    Edit
                  </Button>
                </Box>
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  startIcon={<AddIcon />}
                >
                  Configure Hourly Rate
                </Button>
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
            </Stack>
          </form>
        </Paper>
      )}
    </Container>
  );
}; 