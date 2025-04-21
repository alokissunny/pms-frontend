import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface Property {
  _id: string;
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
  isActive: boolean;
  location: {
    type: string;
    coordinates: [number, number];
  };
}

export const propertyService = {
  getAllProperties: async (): Promise<Property[]> => {
    try {
      const response = await api.get('/properties');
      // Check if the response has the expected structure
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Unexpected API response structure:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  getPropertyById: async (id: string): Promise<Property> => {
    try {
      const response = await api.get(`/properties/${id}`);
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error(`Error fetching property with ID ${id}:`, error);
      throw error;
    }
  },

  createProperty: async (property: Omit<Property, '_id'>): Promise<Property> => {
    try {
      const response = await api.post('/properties', property);
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },

  updateProperty: async (id: string, property: Partial<Property>): Promise<Property> => {
    try {
      const response = await api.put(`/properties/${id}`, property);
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error(`Error updating property with ID ${id}:`, error);
      throw error;
    }
  },

  deleteProperty: async (id: string): Promise<void> => {
    try {
      await api.delete(`/properties/${id}`);
    } catch (error) {
      console.error(`Error deleting property with ID ${id}:`, error);
      throw error;
    }
  }
}; 