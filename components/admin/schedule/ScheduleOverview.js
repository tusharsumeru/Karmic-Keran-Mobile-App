import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Image,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NextConsultationCard from './NextConsultationCard';
import TimeOfDayScheduleView from './TimeOfDayScheduleView';
import { LinearGradient } from 'expo-linear-gradient';

const ScheduleOverview = ({ scheduleData, onRefresh }) => {
  // Format date to display only date part (e.g., "May 5, 2023")
  const formatDate = (dateString) => {
    if (!dateString) return 'Today';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Get total booked consultations for today
  const getTotalBookedToday = () => {
    if (!scheduleData?.consultations) return 0;
    return scheduleData.consultations.filter(consultation => {
      const consultDate = consultation.scheduledTime?.split('T')[0];
      return consultDate === today;
    }).length;
  };

  // Get completed consultations for today
  const getCompletedToday = () => {
    if (!scheduleData?.consultations) return 0;
    return scheduleData.consultations.filter(consultation => {
      const consultDate = consultation.scheduledTime?.split('T')[0];
      return consultDate === today && consultation.status === 'completed';
    }).length;
  };

  // Get upcoming consultations for today
  const getUpcomingToday = () => {
    if (!scheduleData?.consultations) return 0;
    const now = new Date();
    return scheduleData.consultations.filter(consultation => {
      if (!consultation.scheduledTime) return false;
      const consultDate = consultation.scheduledTime.split('T')[0];
      const consultTime = new Date(consultation.scheduledTime);
      return consultDate === today && 
             consultTime > now && 
             consultation.status !== 'completed' &&
             consultation.status !== 'cancelled';
    }).length;
  };

  // Get the next scheduled consultation
  const getNextConsultation = () => {
    if (!scheduleData?.consultations || scheduleData.consultations.length === 0) {
      console.log('No consultations data available');
      return null;
    }

    // Get current date/time
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // First priority: Show pending or confirmed consultations for today
    const todayConsultations = scheduleData.consultations.filter(consultation => {
      if (!consultation.scheduledTime) return false;
      const consultDate = consultation.scheduledTime.split('T')[0];
      return (
        consultDate === today && 
        (consultation.status === 'pending' || consultation.status === 'confirmed')
      );
    });
    
    if (todayConsultations.length > 0) {
      // Sort by time and return the soonest
      return todayConsultations.sort(
        (a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime)
      )[0];
    }
    
    // Second priority: Show upcoming consultations (not completed/cancelled and in the future)
    const upcomingConsultations = scheduleData.consultations.filter(
      consultation => 
        consultation.scheduledTime &&
        consultation.status !== 'completed' && 
        consultation.status !== 'cancelled' &&
        new Date(consultation.scheduledTime) > now
    );

    if (upcomingConsultations.length === 0) {
      console.log('No upcoming consultations found');
      return null;
    }
    
    // Sort by time and return the soonest
    return upcomingConsultations.sort(
      (a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime)
    )[0];
  };

  // Group consultations by time of day
  const groupConsultationsByTimeOfDay = () => {
    if (!scheduleData?.consultations) return {};
    
    const todayConsultations = scheduleData.consultations.filter(consultation => {
      if (!consultation.scheduledTime) return false;
      return consultation.scheduledTime.split('T')[0] === today;
    });

    const groups = {
      morning: [],
      afternoon: [],
      evening: [],
      night: []
    };

    todayConsultations.forEach(consultation => {
      if (!consultation.scheduledTime) return;
      
      const hours = new Date(consultation.scheduledTime).getHours();
      
      if (hours >= 5 && hours < 12) {
        groups.morning.push(consultation);
      } else if (hours >= 12 && hours < 17) {
        groups.afternoon.push(consultation);
      } else if (hours >= 17 && hours < 20) {
        groups.evening.push(consultation);
      } else {
        groups.night.push(consultation);
      }
    });

    return groups;
  };

  const nextConsultation = getNextConsultation();
  const groupedConsultations = groupConsultationsByTimeOfDay();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeContent}>
          <Image 
            source={require('../../../assets/images/namaste-image.png')} 
            style={styles.welcomeImage} 
          />
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeTitle}>Welcome to your Schedule, Karmic Keran</Text>
            <Text style={styles.welcomeSubtitle}>
              View your upcoming consultations and today's schedule at a glance
            </Text>
          </View>
        </View>
      </View>

      {/* Next Consultation Card */}
      {nextConsultation && (
        <NextConsultationCard 
          consultation={nextConsultation}
          onUpdate={onRefresh}
        />
      )}

      {/* Today's Overview Section */}
      <View style={styles.overviewContainer}>
        <View style={styles.overviewHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar" size={24} color="#2563eb" />
            </View>
            <View>
              <Text style={styles.overviewTitle}>Today's Overview</Text>
              <Text style={styles.overviewSubtitle}>Real-time consultation metrics for today</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          {/* Metric Cards */}
          <LinearGradient
            colors={['#8B5CF6', '#6366F1']}
            style={styles.metricCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.metricContent}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>Total Booked</Text>
                <View style={styles.metricIconContainer}>
                  <Ionicons name="time" size={16} color="#fff" />
                </View>
              </View>
              <View style={styles.metricValueContainer}>
                <Text style={styles.metricValue}>{getTotalBookedToday()}</Text>
                <Text style={styles.metricUnit}>consultations</Text>
              </View>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.metricCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.metricContent}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>Completed</Text>
                <View style={styles.metricIconContainer}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              </View>
              <View style={styles.metricValueContainer}>
                <Text style={styles.metricValue}>{getCompletedToday()}</Text>
                <Text style={styles.metricUnit}>sessions</Text>
              </View>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.metricCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.metricContent}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>Upcoming</Text>
                <View style={styles.metricIconContainer}>
                  <Ionicons name="chevron-forward" size={16} color="#fff" />
                </View>
              </View>
              <View style={styles.metricValueContainer}>
                <Text style={styles.metricValue}>{getUpcomingToday()}</Text>
                <Text style={styles.metricUnit}>sessions</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Today's Schedule Section */}
      <TimeOfDayScheduleView 
        groupedConsultations={groupedConsultations}
      />
    </ScrollView>
  );
};

const ConsultationItem = ({ consultation }) => {
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <TouchableOpacity style={styles.consultationItem}>
      <View style={styles.consultationTimeContainer}>
        <Text style={styles.consultationTime}>
          {formatTime(consultation.scheduledTime)}
        </Text>
      </View>
      <View style={styles.consultationContent}>
        <Text style={styles.consultationClientName}>
          {consultation.client?.name || 'Unknown Client'}
        </Text>
        <Text style={styles.consultationType}>
          {consultation.type || 'Consultation'}
        </Text>
      </View>
      <View style={styles.consultationAction}>
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  welcomeSection: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
    opacity: 0.9,
  },
  welcomeTextContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 24,
  },
  overviewContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  overviewSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricContent: {
    flex: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
    flex: 1,
  },
  metricValueContainer: {
    flexDirection: 'column',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  metricUnit: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.8,
  },
  metricIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  consultationItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  consultationTimeContainer: {
    marginRight: 12,
  },
  consultationTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  consultationContent: {
    flex: 1,
  },
  consultationClientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  consultationType: {
    fontSize: 13,
    color: '#6B7280',
  },
  consultationAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});

export default ScheduleOverview; 