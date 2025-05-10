import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createAuthConfig, retrieveServices } from '../../../actions/auth';
import WelcomeBanner from './WelcomeBanner';

/**
 * BookConsultation component for displaying consultation services
 * 
 * @param {Object} props.onServiceSelect - Callback function triggered when a service is selected
 * @param {Object} props.onBookService - Callback function triggered when a user wants to book a service
 * @param {Object} props.onServicesLoaded - Callback function triggered when services are loaded
 */
const BookConsultation = ({ onServiceSelect, onBookService, onServicesLoaded }) => {
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  
  // Fetch services when component mounts
  useEffect(() => {
    fetchServices();
  }, []);
  
  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const config = await createAuthConfig();
      const response = await retrieveServices(config);
      
      if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
        console.log(`Retrieved ${response.data.length} services`);
        
        // Map the API response to the service options format we need
        const services = response.data.map(service => ({
          id: service._id,
          name: service.name,
          duration: service.duration || 30,
          price: service.price || 50,
          type: service.consultation_type || 'video',
          description: service.description || service.sub_title || 'No description available',
          image: service.image || null,
          benefits: service.benefits ? 
            (typeof service.benefits === 'string' ? 
              service.benefits.split(',').map(b => b.trim()) : 
              service.benefits) : 
            []
        }));
        
        setServiceOptions(services);
        
        // Select the first service by default
        if (services.length > 0) {
          setSelectedService(services[0]);
          
          // Notify parent component if a callback was provided
          if (onServiceSelect) {
            onServiceSelect(services[0]);
          }
        }
        
        // Notify parent about loaded services
        if (onServicesLoaded) {
          onServicesLoaded(services);
        }
      } else {
        console.error('Error fetching services:', response.message);
        // Show empty state
        setServiceOptions([]);
        setSelectedService(null);
        
        // Notify parent about empty services
        if (onServicesLoaded) {
          onServicesLoaded([]);
        }
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      // Show empty state
      setServiceOptions([]);
      setSelectedService(null);
      
      // Notify parent about empty services
      if (onServicesLoaded) {
        onServicesLoaded([]);
      }
    } finally {
      setLoadingServices(false);
    }
  };
  
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    if (onServiceSelect) {
      onServiceSelect(service);
    }
  };

  // Helper function to get placeholder benefits if none are provided
  const getDefaultBenefits = (serviceName) => {
    switch(serviceName.toLowerCase()) {
      case 'personal reading':
      case 'astrological reading':
        return [
          'Detailed personality analysis',
          'Future predictions and timing',
          'Relationship compatibility insights',
          'Career path guidance',
          'Life purpose revelation'
        ];
      case 'spiritual guidance':
        return [
          'Deep spiritual insights',
          'Emotional healing techniques',
          'Spiritual practice guidance',
          'Energy alignment',
          'Inner peace development'
        ];
      default:
        return [
          'Professional consultation',
          'Expert guidance',
          'Personalized approach',
          'Comprehensive analysis',
          'Follow-up support'
        ];
    }
  };
  
  const renderServiceCard = (service) => {
    const isSelected = selectedService && selectedService.id === service.id;
    const benefits = service.benefits && service.benefits.length > 0 
      ? service.benefits 
      : getDefaultBenefits(service.name);
      
    return (
      <TouchableOpacity 
        key={service.id}
        style={[
          styles.serviceCard,
          isSelected && styles.selectedServiceCard
        ]}
        onPress={() => handleServiceSelect(service)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.servicePrice}>£{service.price}</Text>
          </View>
          
          <Text style={styles.serviceSubtitle}>Deep Life Insights</Text>
          
          <View style={styles.durationContainer}>
            <Ionicons name="time-outline" size={18} color="#555" />
            <Text style={styles.durationText}>{service.duration} min</Text>
          </View>
          
          <Text style={styles.serviceDescription}>
            Get a comprehensive analysis of your life path, including insights into your personality, relationships, and future.
          </Text>
          
          <View style={styles.benefitsContainer}>
            {benefits.slice(0, 5).map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <Ionicons name="checkmark-circle" size={16} color="#12a554" />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.knowMoreButton}
              onPress={() => onBookService(service.id)}
            >
              <Text style={styles.knowMoreText}>Know More</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.bookNowButton}
              onPress={() => onBookService(service.id)}
            >
              <Text style={styles.bookNowText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <WelcomeBanner />
      
      {loadingServices ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7765e3" />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      ) : serviceOptions.length > 0 ? (
        <View style={styles.servicesContainer}>
          {serviceOptions.map(service => renderServiceCard(service))}
        </View>
      ) : (
        <View style={styles.noServicesContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#ccc" />
          <Text style={styles.noServicesText}>No services available at the moment.</Text>
          <Text style={styles.tryAgainText}>Please try again later or contact support.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  servicesContainer: {
    flex: 1,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedServiceCard: {
    borderColor: '#7765e3',
    borderWidth: 2,
    shadowColor: '#7765e3',
    shadowOpacity: 0.2,
  },
  cardContent: {
    padding: 20,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2a2a2a',
  },
  servicePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  durationText: {
    fontSize: 15,
    color: '#555',
    marginLeft: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 16,
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 10,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  knowMoreButton: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#7765e3',
    borderRadius: 8,
    marginRight: 10,
  },
  knowMoreText: {
    color: '#7765e3',
    fontSize: 15,
    fontWeight: '600',
  },
  bookNowButton: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff6c00',
    borderRadius: 8,
  },
  bookNowText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  noServicesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  noServicesText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tryAgainText: {
    marginTop: 8,
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
});

export default BookConsultation; 