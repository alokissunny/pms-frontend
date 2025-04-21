import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Property, propertyService } from '../services/propertyService';

interface PropertyContextType {
  properties: Property[];
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  loading: boolean;
  error: string | null;
  refreshProperties: () => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching properties from API...');
      
      const data = await propertyService.getAllProperties();
      console.log('Properties fetched:', data);
      
      if (data && data.length > 0) {
        setProperties(data);
        
        // If no property is selected and we have properties, select the first one
        if (!selectedProperty) {
          console.log('No property selected, selecting first property:', data[0]);
          setSelectedProperty(data[0]);
        } else {
          // Check if the currently selected property still exists in the fetched data
          const propertyStillExists = data.some(p => p._id === selectedProperty._id);
          if (!propertyStillExists) {
            console.log('Selected property no longer exists, selecting first property');
            setSelectedProperty(data[0]);
          } else {
            console.log('Selected property still exists:', selectedProperty);
          }
        }
      } else {
        console.log('No properties found in API response');
        setProperties([]);
        setSelectedProperty(null);
        setError('No properties found');
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to fetch properties. Please try again later.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch properties on component mount
  useEffect(() => {
    console.log('PropertyProvider mounted, fetching properties...');
    fetchProperties();
  }, []);

  const value = {
    properties,
    selectedProperty,
    setSelectedProperty,
    loading,
    error,
    refreshProperties: fetchProperties,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
}; 