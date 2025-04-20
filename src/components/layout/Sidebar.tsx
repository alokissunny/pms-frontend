import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Toolbar,
} from '@mui/material';
import {
  Add as AddIcon,
  MeetingRoom as RoomIcon,
  Category as RoomTypeIcon,
  Inventory as InventoryIcon,
  Assignment as TaskIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 240;

const menuItems = [
  {
    text: 'Add Property',
    icon: <AddIcon />,
    path: '/add-property',
  },
  {
    text: 'Rooms',
    icon: <RoomIcon />,
    path: '/rooms',
  },
  {
    text: 'Room Type',
    icon: <RoomTypeIcon />,
    path: '/room-type',
  },
  {
    text: 'Manage Inventory',
    icon: <InventoryIcon />,
    path: '/manage-inventory',
  },
  {
    text: 'Tasks',
    icon: <TaskIcon />,
    path: '/tasks',
  },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#1a237e', // Dark blue background
          color: 'white',
        },
      }}
    >
      <Toolbar /> {/* This creates space for the fixed header */}
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                  color: 'white',
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}; 