import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../utils/api';
import { useProperty } from '../../context/PropertyContext';

interface Guest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

interface PaymentDetail {
  amount: number;
  method: string;
  transactionId: string;
  date: Date;
}

interface RoomType {
  _id: string;
  name: string;
  description?: string;
  baseRate: number;
  capacity: number;
  amenities?: string[];
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface Room {
  _id: string;
  roomNumber: string;
  status: string;
}

interface Reservation {
  _id?: string;
  reservationNumber: string;
  guest: Guest;
  room?: Room;
  roomType?: RoomType;
  roomTypeId?: string;
  checkInDate: Date;
  checkOutDate: Date;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'no-show';
  totalAmount: number;
  paymentStatus: 'pending' | 'partially_paid' | 'paid' | 'refunded';
  paymentDetails?: PaymentDetail[];
  source: 'direct' | 'booking.com' | 'expedia' | 'airbnb' | 'other';
  sourceId?: string;
  specialRequests?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  propertyId: string;
}

interface ApiResponse {
  success: boolean;
  data: Reservation[] | Reservation;
  count?: number;
  pagination?: {
    total: number;
    page: number;
    pages: number;
  };
  error?: string;
}

const validationSchema = Yup.object({
  reservationNumber: Yup.string().required('Reservation number is required'),
  guest: Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string(),
  }),
  checkInDate: Yup.date().required('Check-in date is required'),
  checkOutDate: Yup.date()
    .required('Check-out date is required')
    .min(Yup.ref('checkInDate'), 'Check-out date must be after check-in date'),
  status: Yup.string().required('Status is required'),
  totalAmount: Yup.number().required('Total amount is required').min(0),
  paymentStatus: Yup.string().required('Payment status is required'),
  source: Yup.string().required('Source is required'),
});

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  'confirmed': 'primary',
  'checked-in': 'success',
  'checked-out': 'info',
  'cancelled': 'error',
  'no-show': 'error',
};

const paymentStatusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  'pending': 'warning',
  'partially_paid': 'info',
  'paid': 'success',
  'refunded': 'error',
};

export const ManageInventoryPage: React.FC = () => {
  const { selectedProperty } = useProperty();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    guest: '',
    checkInDate: '',
    checkOutDate: '',
    source: '',
    roomType: '',
    room: '',
  });

  useEffect(() => {
    if (selectedProperty?._id) {
      fetchReservations();
      fetchRoomTypes();
    }
  }, [page, filters, selectedProperty?._id]);

  const fetchRoomTypes = async () => {
    try {
      const response = await api.get<{ success: boolean; data: RoomType[] }>(`/room-types?propertyId=${selectedProperty?._id}`);
      if (response.data.success) {
        setRoomTypes(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching room types:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        propertyId: selectedProperty?._id || '',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      });
      
      const response = await api.get<ApiResponse>(`/reservations?${params}`);
      
      if (response.data.success) {
        setReservations(Array.isArray(response.data.data) ? response.data.data : [response.data.data]);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.pages);
        }
      } else {
        setError(response.data.error || 'Failed to fetch reservations');
        setReservations([]);
      }
    } catch (error: any) {
      console.error('Error fetching reservations:', error);
      setError(error.response?.data?.error || 'Failed to fetch reservations');
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const formik = useFormik<Reservation>({
    initialValues: {
      reservationNumber: '',
      guest: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      },
      roomTypeId: '',
      checkInDate: new Date(),
      checkOutDate: new Date(),
      status: 'confirmed',
      totalAmount: 0,
      paymentStatus: 'pending',
      source: 'direct',
      propertyId: selectedProperty?._id || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        setSuccessMessage(null);
        
        if (selectedReservation?._id) {
          const response = await api.put<ApiResponse>(`/reservations/${selectedReservation._id}`, values);
          if (response.data.success) {
            setSuccessMessage('Reservation updated successfully');
          } else {
            setError(response.data.error || 'Failed to update reservation');
          }
        } else {
          const response = await api.post<ApiResponse>('/reservations', {
            ...values,
            propertyId: selectedProperty?._id,
          });
          if (response.data.success) {
            setSuccessMessage('Reservation created successfully');
          } else {
            setError(response.data.error || 'Failed to create reservation');
          }
        }
        
        await fetchReservations();
        handleCloseDialog();
      } catch (error: any) {
        console.error('Error saving reservation:', error);
        setError(error.response?.data?.error || 'Failed to save reservation');
      }
    },
  });

  const handleOpenDialog = (reservation?: Reservation) => {
    if (reservation) {
      setSelectedReservation(reservation);
      formik.setValues({
        ...reservation,
        checkInDate: new Date(reservation.checkInDate),
        checkOutDate: new Date(reservation.checkOutDate),
      });
    } else {
      setSelectedReservation(null);
      formik.resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedReservation(null);
    formik.resetForm();
    setError(null);
    setSuccessMessage(null);
  };

  const handleDeleteReservation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) return;

    try {
      setError(null);
      setSuccessMessage(null);
      const response = await api.delete<ApiResponse>(`/reservations/${id}`);
      
      if (response.data.success) {
        setSuccessMessage('Reservation deleted successfully');
        await fetchReservations();
      } else {
        setError(response.data.error || 'Failed to delete reservation');
      }
    } catch (error: any) {
      console.error('Error deleting reservation:', error);
      setError(error.response?.data?.error || 'Failed to delete reservation');
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Manage Reservations</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
          disabled={!selectedProperty?._id}
        >
          New Reservation
        </Button>
      </Box>

      {!selectedProperty?._id && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please select a property to manage reservations
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Guest Name/Email"
            value={filters.guest}
            onChange={(e) => handleFilterChange('guest', e.target.value)}
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="checked-in">Checked In</MenuItem>
              <MenuItem value="checked-out">Checked Out</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="no-show">No Show</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Source</InputLabel>
            <Select
              value={filters.source}
              label="Source"
              onChange={(e) => handleFilterChange('source', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="direct">Direct</MenuItem>
              <MenuItem value="booking.com">Booking.com</MenuItem>
              <MenuItem value="expedia">Expedia</MenuItem>
              <MenuItem value="airbnb">Airbnb</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Stack direction="row" spacing={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Check-in From"
              value={filters.checkInDate ? new Date(filters.checkInDate) : null}
              onChange={(date) => handleFilterChange('checkInDate', date ? date.toISOString() : '')}
              slotProps={{
                textField: {
                  size: 'small',
                }
              }}
            />
            <DatePicker
              label="Check-in To"
              value={filters.checkOutDate ? new Date(filters.checkOutDate) : null}
              onChange={(date) => handleFilterChange('checkOutDate', date ? date.toISOString() : '')}
              slotProps={{
                textField: {
                  size: 'small',
                }
              }}
            />
          </LocalizationProvider>
        </Stack>
      </Paper>

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
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reservation #</TableCell>
                  <TableCell>Guest</TableCell>
                  <TableCell>Room Type</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Check-in</TableCell>
                  <TableCell>Check-out</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      No reservations found
                    </TableCell>
                  </TableRow>
                ) : (
                  reservations.map((reservation) => (
                    <TableRow key={reservation._id}>
                      <TableCell>{reservation.reservationNumber}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {`${reservation.guest.firstName} ${reservation.guest.lastName}`}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {reservation.guest.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {reservation.roomType?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {reservation.room?.roomNumber || '-'}
                      </TableCell>
                      <TableCell>
                        {formatDate(reservation.checkInDate.toString())}
                      </TableCell>
                      <TableCell>
                        {formatDate(reservation.checkOutDate.toString())}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={reservation.status}
                          color={statusColors[reservation.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {formatCurrency(reservation.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={reservation.paymentStatus}
                          color={paymentStatusColors[reservation.paymentStatus]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(reservation)}
                          title="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => reservation._id && handleDeleteReservation(reservation._id)}
                          title="Delete"
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

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {selectedReservation ? 'Edit Reservation' : 'New Reservation'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                id="reservationNumber"
                name="reservationNumber"
                label="Reservation Number"
                value={formik.values.reservationNumber}
                onChange={formik.handleChange}
                error={formik.touched.reservationNumber && Boolean(formik.errors.reservationNumber)}
                helperText={formik.touched.reservationNumber && formik.errors.reservationNumber}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  id="guest.firstName"
                  name="guest.firstName"
                  label="First Name"
                  value={formik.values.guest.firstName}
                  onChange={formik.handleChange}
                  error={formik.touched.guest?.firstName && Boolean(formik.errors.guest?.firstName)}
                  helperText={formik.touched.guest?.firstName && formik.errors.guest?.firstName}
                />
                <TextField
                  fullWidth
                  id="guest.lastName"
                  name="guest.lastName"
                  label="Last Name"
                  value={formik.values.guest.lastName}
                  onChange={formik.handleChange}
                  error={formik.touched.guest?.lastName && Boolean(formik.errors.guest?.lastName)}
                  helperText={formik.touched.guest?.lastName && formik.errors.guest?.lastName}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  id="guest.email"
                  name="guest.email"
                  label="Email"
                  type="email"
                  value={formik.values.guest.email}
                  onChange={formik.handleChange}
                  error={formik.touched.guest?.email && Boolean(formik.errors.guest?.email)}
                  helperText={formik.touched.guest?.email && formik.errors.guest?.email}
                />
                <TextField
                  fullWidth
                  id="guest.phone"
                  name="guest.phone"
                  label="Phone"
                  value={formik.values.guest.phone}
                  onChange={formik.handleChange}
                />
              </Box>

              <FormControl fullWidth>
                <InputLabel>Room Type</InputLabel>
                <Select
                  id="roomTypeId"
                  name="roomTypeId"
                  value={formik.values.roomTypeId}
                  onChange={formik.handleChange}
                  label="Room Type"
                  error={formik.touched.roomTypeId && Boolean(formik.errors.roomTypeId)}
                >
                  {roomTypes.map((type) => (
                    <MenuItem key={type._id} value={type._id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.roomTypeId && formik.errors.roomTypeId && (
                  <FormHelperText error>{formik.errors.roomTypeId}</FormHelperText>
                )}
              </FormControl>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    label="Check-in Date"
                    value={formik.values.checkInDate}
                    onChange={(value) => formik.setFieldValue('checkInDate', value)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: formik.touched.checkInDate && Boolean(formik.errors.checkInDate),
                        helperText: formik.touched.checkInDate && (formik.errors.checkInDate as string),
                      }
                    }}
                  />
                  <DatePicker
                    label="Check-out Date"
                    value={formik.values.checkOutDate}
                    onChange={(value) => formik.setFieldValue('checkOutDate', value)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: formik.touched.checkOutDate && Boolean(formik.errors.checkOutDate),
                        helperText: formik.touched.checkOutDate && (formik.errors.checkOutDate as string),
                      }
                    }}
                  />
                </Box>
              </LocalizationProvider>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    id="status"
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    label="Status"
                  >
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="checked-in">Checked In</MenuItem>
                    <MenuItem value="checked-out">Checked Out</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="no-show">No Show</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Payment Status</InputLabel>
                  <Select
                    id="paymentStatus"
                    name="paymentStatus"
                    value={formik.values.paymentStatus}
                    onChange={formik.handleChange}
                    label="Payment Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="partially_paid">Partially Paid</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="refunded">Refunded</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  id="totalAmount"
                  name="totalAmount"
                  label="Total Amount"
                  type="number"
                  value={formik.values.totalAmount}
                  onChange={formik.handleChange}
                  error={formik.touched.totalAmount && Boolean(formik.errors.totalAmount)}
                  helperText={formik.touched.totalAmount && formik.errors.totalAmount}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel>Source</InputLabel>
                  <Select
                    id="source"
                    name="source"
                    value={formik.values.source}
                    onChange={formik.handleChange}
                    label="Source"
                  >
                    <MenuItem value="direct">Direct</MenuItem>
                    <MenuItem value="booking.com">Booking.com</MenuItem>
                    <MenuItem value="expedia">Expedia</MenuItem>
                    <MenuItem value="airbnb">Airbnb</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={3}
                id="specialRequests"
                name="specialRequests"
                label="Special Requests"
                value={formik.values.specialRequests}
                onChange={formik.handleChange}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                id="notes"
                name="notes"
                label="Notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
              />
            </Stack>
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
                selectedReservation ? 'Update' : 'Create'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}; 