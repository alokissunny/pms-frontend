import React, { useState } from 'react';
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
  Switch,
  TextField,
} from '@mui/material';

interface RoomData {
  id: number;
  name: string;
  roomCount: number;
  price: number;
  isBlocked: boolean;
}

export const DashboardPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rooms] = useState<RoomData[]>([
    {
      id: 1,
      name: 'Test',
      roomCount: 10,
      price: 100,
      isBlocked: false,
    },
    {
      id: 2,
      name: 'Test',
      roomCount: 10,
      price: 444,
      isBlocked: false,
    },
  ]);

  const daysInWeek = 14; // Show 2 weeks
  const dates = Array.from({ length: daysInWeek }, (_, i) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ p: 2, backgroundColor: 'white', boxShadow: 1 }}>
        <TextField
          select
          value="Ace Divino"
          variant="outlined"
          sx={{ minWidth: 200, mr: 2 }}
        />
        <Button variant="contained" color="primary">
          Bulk Edit
        </Button>
      </Box>

      <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TextField
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            sx={{ mr: 2 }}
          />
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
            APR 2025
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePrevWeek}
            sx={{ mr: 1 }}
          >
            Prev Week
          </Button>
          <Button variant="contained" color="primary" onClick={handleNextWeek}>
            Next Week
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '200px' }}>Room Type</TableCell>
                {dates.map((date, index) => (
                  <TableCell key={index} align="center">
                    <Typography variant="body2" color="textSecondary">
                      {formatDate(date).split(' ')[0].toUpperCase()}
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(date).split(' ')[1]}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rooms.map((room) => (
                <React.Fragment key={room.id}>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">{room.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        (Price For 2A)
                      </Typography>
                    </TableCell>
                    {Array(daysInWeek).fill(0).map((_, index) => (
                      <TableCell key={index} align="center">
                        {room.roomCount}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>Price INR</TableCell>
                    {Array(daysInWeek).fill(0).map((_, index) => (
                      <TableCell key={index} align="center">
                        {room.price}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell>Block room</TableCell>
                    {Array(daysInWeek).fill(0).map((_, index) => (
                      <TableCell key={index} align="center">
                        <Switch
                          size="small"
                          checked={room.isBlocked}
                          onChange={() => {}}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', mt: 2, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: 'warning.main',
                mr: 1,
              }}
            />
            <Typography variant="body2">Updated Room Count</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                mr: 1,
              }}
            />
            <Typography variant="body2">Updated Price INR</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: 'grey.400',
                mr: 1,
              }}
            />
            <Typography variant="body2">Default Room Count / Default Price INR</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="contained" color="primary">
            Update
          </Button>
        </Box>
      </Container>
    </Box>
  );
}; 