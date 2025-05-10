import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * ServiceConfirmation component - Step 1 of booking flow
 * Shows service details and price summary
 */
const ServiceConfirmation = ({ service, onServiceDataChange, onContinue }) => {
  // We don't actually allow changing the service here, but the prop is kept for consistency

  // Function to get placeholder benefits if none are provided
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

  // Get benefits to display
  const benefits = service.benefits && service.benefits.length > 0 
    ? service.benefits 
    : getDefaultBenefits(service.name);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Confirm Your Service</Text>
        
        {/* Service Card */}
        <View style={styles.serviceCard}>
          {service.image ? (
            <Image source={{ uri: service.image }} style={styles.serviceImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="star" size={40} color="#7765e3" />
            </View>
          )}
          
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.servicePrice}>£{service.price}</Text>
          </View>
          
          <Text style={styles.serviceSubtitle}>
            {service.subtitle || 'Deep Life Insights'}
          </Text>
          
          <View style={styles.durationContainer}>
            <Ionicons name="time-outline" size={18} color="#555" />
            <Text style={styles.durationText}>{service.duration} min</Text>
          </View>
          
          <Text style={styles.serviceDescription}>
            {service.description || 'Get a comprehensive analysis of your life path, including insights into your personality, relationships, and future.'}
          </Text>
        </View>
        
        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>What You'll Get</Text>
          <View style={styles.benefitsContainer}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <Ionicons name="checkmark-circle" size={16} color="#12a554" />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Price Summary */}
        <View style={styles.priceSummaryCard}>
          <Text style={styles.priceSummaryTitle}>Price Summary</Text>
          
          <View style={styles.priceSummaryRow}>
            <Text style={styles.priceSummaryLabel}>Service Fee</Text>
            <Text style={styles.priceSummaryValue}>£{service.price}</Text>
          </View>
          
          <View style={styles.priceSummaryRow}>
            <Text style={styles.priceSummaryLabel}>Platform Fee</Text>
            <Text style={styles.priceSummaryValue}>£0</Text>
          </View>
          
          {service.discount > 0 && (
            <View style={styles.priceSummaryRow}>
              <Text style={styles.priceSummaryLabel}>Discount</Text>
              <Text style={[styles.priceSummaryValue, styles.discountText]}>
                -£{service.discount}
              </Text>
            </View>
          )}
          
          <View style={styles.priceSummaryDivider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              £{service.price - (service.discount || 0)}
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Continue Button */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={onContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  serviceImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
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
    flex: 1,
  },
  servicePrice: {
    fontSize: 22,
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
  },
  benefitsSection: {
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  benefitsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 10,
    flex: 1,
  },
  priceSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  priceSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  priceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceSummaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  priceSummaryValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  discountText: {
    color: '#12a554',
  },
  priceSummaryDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  actionsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  continueButton: {
    backgroundColor: '#7765e3',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default ServiceConfirmation; 