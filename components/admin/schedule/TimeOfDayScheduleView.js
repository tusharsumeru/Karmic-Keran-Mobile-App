import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const TimeOfDayScheduleView = ({ groupedConsultations, onViewChart, onViewDetails }) => {
  const timeSlotConfigs = {
    morning: {
      icon: 'sunny',
      title: 'Morning',
      gradientColors: ['#FEF3C7', '#FDE68A'],
      iconColor: '#F59E0B',
      borderColor: 'rgba(251,191,36,0.4)',
      shadowColor: 'rgba(251,191,36,0.3)'
    },
    afternoon: {
      icon: 'sunny',
      title: 'Afternoon',
      gradientColors: ['#FFEDD5', '#FED7AA'],
      iconColor: '#F97316',
      borderColor: 'rgba(251,146,60,0.4)',
      shadowColor: 'rgba(251,146,60,0.3)'
    },
    evening: {
      icon: 'moon',
      title: 'Evening',
      gradientColors: ['#DBEAFE', '#BFDBFE'],
      iconColor: '#3B82F6',
      borderColor: 'rgba(96,165,250,0.4)',
      shadowColor: 'rgba(96,165,250,0.3)'
    },
    night: {
      icon: 'moon',
      title: 'Night',
      gradientColors: ['#E0E7FF', '#C7D2FE'],
      iconColor: '#6366F1',
      borderColor: 'rgba(129,140,248,0.4)',
      shadowColor: 'rgba(129,140,248,0.3)'
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'No time set';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return 'Invalid time';
    }
  };

  const renderTimeSlot = (timeSlot, consultations = []) => {
    const config = timeSlotConfigs[timeSlot];
    
    return (
      <View key={timeSlot} style={styles.timeSlotSection}>
        <View style={styles.timeSlotHeader}>
          <View style={styles.headerContent}>
            <View style={[styles.iconContainer, { 
              backgroundColor: config.gradientColors[0],
              borderColor: config.borderColor,
              shadowColor: config.shadowColor
            }]}>
              <LinearGradient
                colors={[`${config.iconColor}20`, 'transparent']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Ionicons name={config.icon} size={16} color={config.iconColor} />
            </View>
            <Text style={styles.timeSlotTitle}>{config.title}</Text>
            <View style={styles.divider} />
            <Text style={styles.consultationCount}>
              {consultations.length} Consultations
            </Text>
          </View>
        </View>

        {consultations.length > 0 ? (
          <View style={styles.consultationsContainer}>
            {consultations.map((consultation, index) => (
              <TouchableOpacity
                key={consultation._id || index}
                style={styles.consultationCard}
                onPress={() => onViewDetails?.(consultation)}
              >
                <View style={styles.consultationInfo}>
                  <Text style={styles.consultationTime}>
                    {formatTime(consultation.scheduledTime)}
                  </Text>
                  <Text style={styles.clientName}>
                    {consultation.client?.name || 'Unknown Client'}
                  </Text>
                  <Text style={styles.serviceType}>
                    {consultation.type || 'Consultation'}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => onViewChart?.(consultation)}
                  >
                    <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>
              No consultations available for {config.title}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Schedule</Text>
        <Text style={styles.subtitle}>All consultations for today</Text>
      </View>
      <View style={styles.content}>
        {Object.entries(timeSlotConfigs).map(([timeSlot]) => 
          renderTimeSlot(timeSlot, groupedConsultations[timeSlot] || [])
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    gap: 24,
  },
  timeSlotSection: {
    gap: 12,
  },
  timeSlotHeader: {
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(243, 244, 246, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  timeSlotTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(243, 244, 246, 0.8)',
    marginHorizontal: 12,
  },
  consultationCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  consultationsContainer: {
    gap: 8,
  },
  consultationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  consultationInfo: {
    flex: 1,
  },
  consultationTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  serviceType: {
    fontSize: 13,
    color: '#6B7280',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyStateContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default TimeOfDayScheduleView; 