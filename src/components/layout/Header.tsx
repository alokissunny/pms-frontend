import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  Select,
  SelectChangeEvent,
  CircularProgress,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useProperty } from '../../context/PropertyContext';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { logout } = useAuth();
  const { properties, selectedProperty, setSelectedProperty, loading, error, refreshProperties } = useProperty();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error' | 'info'>('info');

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePropertyChange = (event: SelectChangeEvent<string>) => {
    const property = properties.find(p => p._id === event.target.value);
    if (property) {
      setSelectedProperty(property);
      setSnackbarMessage(`Selected property: ${property.name}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  const handleAddProperty = () => {
    navigate('/add-property');
  };

  const handleRefreshProperties = async () => {
    try {
      await refreshProperties();
      setSnackbarMessage('Properties refreshed successfully');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Failed to refresh properties');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        color: 'text.primary',
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 'bold' }}
        >
          Property Management System
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={selectedProperty?._id || ''}
                onChange={handlePropertyChange}
                displayEmpty
                disabled={loading}
                sx={{
                  backgroundColor: 'white',
                  '& .MuiSelect-select': {
                    py: 1,
                  },
                }}
                endAdornment={loading ? <CircularProgress size={20} /> : null}
              >
                <MenuItem value="" disabled>
                  {loading ? 'Loading properties...' : 'Select Property'}
                </MenuItem>
                {properties.map((property) => (
                  <MenuItem key={property._id} value={property._id}>
                    {property.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Tooltip title="Refresh Properties">
              <IconButton 
                color="primary" 
                onClick={handleRefreshProperties}
                size="small"
                disabled={loading}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Add New Property">
              <IconButton 
                color="primary" 
                onClick={handleAddProperty}
                size="small"
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 32,
                height: 32,
              }}
            >
              A
            </Avatar>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ mr: 0.5 }}>
                Admin User
              </Typography>
              <IconButton
                size="small"
                onClick={handleMenu}
                color="inherit"
              >
                <KeyboardArrowDownIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleClose}>Settings</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>

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
    </AppBar>
  );
}; 