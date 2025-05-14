import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, ScrollView, View, Text, StatusBar, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BookConsultation from '../../components/user/consultations/BookConsultation';
import ConsultationBookingFlow from '../../components/user/consultations/ConsultationBookingFlow';
import { LinearGradient } from 'expo-linear-gradient';

export default function BookConsultationScreen() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState(null);
  const [serviceOptions, setServiceOptions] = useState([]);
  
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    console.log('Selected service:', service);
  };
  
  const handleServicesLoaded = (services) => {
    setServiceOptions(services);
  };
  
  const openBookingFlow = (serviceId) => {
    // Find the service based on the ID
    const service = serviceOptions.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service);
    }
    
    setBookingServiceId(serviceId);
    setShowBookingFlow(true);
  };
  
  const closeBookingFlow = () => {
    setShowBookingFlow(false);
    setBookingServiceId(null);
  };
  
  const handleBookingComplete = (bookingData) => {
    setShowBookingFlow(false);
    setBookingServiceId(null);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f9f9f9" barStyle="dark-content" />
      <View style={styles.header}>
        {showBookingFlow && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={closeBookingFlow}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          {showBookingFlow ? 'Book Consultation' : 'Book Consultation'}
        </Text>
      </View>
      
      {!showBookingFlow ? (
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <BookConsultation 
            onServiceSelect={handleServiceSelect} 
            onBookService={openBookingFlow}
            onServicesLoaded={handleServicesLoaded}
          />
        </ScrollView>
      ) : (
        <View style={styles.bookingFlowContainer}>
          <ConsultationBookingFlow 
            service={selectedService}
            serviceId={bookingServiceId}
            onClose={closeBookingFlow}
            onBookingComplete={handleBookingComplete}
            inlineMode={true}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    marginBottom:20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 10,
    marginTop:40
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginTop:40
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  bookingFlowContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 