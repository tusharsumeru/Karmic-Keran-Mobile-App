import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
  Linking,
  Clipboard
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { createAuthConfig, updateConsultationStatus } from '../../../actions/auth';

const NextConsultationCard = ({ consultation, onUpdate }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({ 
    days: '00', 
    hours: '00', 
    minutes: '00', 
    seconds: '00' 
  });

  // Calculate and update time remaining
  useEffect(() => {
    if (!consultation?.scheduledTime) return;
    
    const calculateTimeRemaining = () => {
      const now = new Date();
      const consultationTime = new Date(consultation.scheduledTime);
      const diffMs = consultationTime - now;
      
      if (diffMs <= 0) {
        setTimeRemaining({ 
          days: '00', 
          hours: '00', 
          minutes: '00', 
          seconds: '00' 
        });
        return;
      }
      
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      setTimeRemaining({
        days: String(diffDays).padStart(2, '0'),
        hours: String(diffHours).padStart(2, '0'),
        minutes: String(diffMinutes).padStart(2, '0'),
        seconds: String(diffSeconds).padStart(2, '0')
      });
    };
    
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [consultation]);

  // Format date and time from ISO string
  const formatDateTime = (isoString) => {
    if (!isoString) return { date: '', time: '', duration: '' };
    
    const date = new Date(isoString);
    const endTime = new Date(date.getTime() + (consultation?.duration || 30) * 60000);
    
    const time = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    const endTimeStr = endTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    return { 
      date: formattedDate, 
      time: `${time} - ${endTimeStr}`,
      duration: `${consultation?.duration || 30}m`
    };
  };

  const { date, time, duration } = formatDateTime(consultation?.scheduledTime);
  
  // Handle consultation status update
  const handleStatusUpdate = async (newStatus) => {
    if (!consultation?._id) return;
    
    setLoading(true);
    
    try {
      const config = await createAuthConfig();
      const result = await updateConsultationStatus(config, consultation._id, newStatus);
      
      if (result.status === 200) {
        Alert.alert('Success', `Consultation ${newStatus} successfully`);
        setModalVisible(false);
        if (onUpdate) onUpdate(); // Refresh the parent component
      } else {
        Alert.alert('Error', result.message || 'Failed to update consultation status');
      }
    } catch (error) {
      console.error('Error updating consultation status:', error);
      Alert.alert('Error', 'An error occurred while updating the consultation');
    } finally {
      setLoading(false);
    }
  };

  // Handle copy meeting link
  const handleCopyLink = () => {
    const meetingLink = consultation?.meeting?.link || consultation?.meetingLink || 'https://meet.google.com/mac-rejq-krv';
    Clipboard.setString(meetingLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 3000);
  };

  // Handle join meeting
  const handleJoinMeeting = () => {
    const meetingLink = consultation?.meeting?.link || consultation?.meetingLink || 'https://meet.google.com/mac-rejq-krv';
    Linking.openURL(meetingLink).catch(err => {
      Alert.alert('Error', 'Could not open meeting link');
    });
  };

  // Handle view chart
  const handleViewChart = () => {
    Alert.alert('Coming Soon', 'Chart view will be available soon');
  };

  // Get payment status
  const getPaymentStatus = () => {
    // Check original payment status first
    const originalStatus = consultation?.original?.payment?.status;
    if (originalStatus) {
      return originalStatus.charAt(0).toUpperCase() + originalStatus.slice(1);
    }
    
    // Check direct payment status
    const directStatus = consultation?.payment?.status;
    if (directStatus) {
      return directStatus.charAt(0).toUpperCase() + directStatus.slice(1);
    }

    // Check consultation status as fallback
    const consultStatus = consultation?.status;
    if (consultStatus === 'confirmed' || consultStatus === 'completed') {
      return 'Paid';
    }

    return 'Pending';
  };

  // Get payment status colors
  const getPaymentStatusColor = () => {
    const status = getPaymentStatus().toLowerCase();
    switch (status) {
      case 'paid':
        return {
          bgColor: 'rgba(16, 185, 129, 0.1)',
          textColor: '#10b981'
        };
      case 'pending':
        return {
          bgColor: 'rgba(245, 158, 11, 0.1)',
          textColor: '#f59e0b'
        };
      case 'failed':
        return {
          bgColor: 'rgba(239, 68, 68, 0.1)',
          textColor: '#ef4444'
        };
      default:
        return {
          bgColor: 'rgba(107, 114, 128, 0.1)',
          textColor: '#6b7280'
        };
    }
  };

  if (!consultation) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <Ionicons name="calendar-outline" size={60} color="#E0E0E0" />
          <Text style={styles.emptyStateText}>No upcoming consultations</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Next Consultation</Text>
          <Text style={styles.headerSubtitle}>Coming up next</Text>
        </View>
      </View>

      {/* Countdown Timer */}
      <View style={styles.countdownSection}>
        <LinearGradient
          colors={['rgba(37, 99, 235, 0.1)', 'rgba(59, 130, 246, 0.05)']}
          style={styles.countdownWrapper}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.countdownLabel}>Time until consultation</Text>
          <View style={styles.countdownTimerContainer}>
            <View style={styles.countdownUnit}>
              <Text style={styles.countdownNumber}>{timeRemaining.days}</Text>
              <Text style={styles.countdownText}>Days</Text>
            </View>
            <Text style={styles.countdownSeparator}>:</Text>
            <View style={styles.countdownUnit}>
              <Text style={styles.countdownNumber}>{timeRemaining.hours}</Text>
              <Text style={styles.countdownText}>Hours</Text>
            </View>
            <Text style={styles.countdownSeparator}>:</Text>
            <View style={styles.countdownUnit}>
              <Text style={styles.countdownNumber}>{timeRemaining.minutes}</Text>
              <Text style={styles.countdownText}>Mins</Text>
            </View>
            <Text style={styles.countdownSeparator}>:</Text>
            <View style={styles.countdownUnit}>
              <Text style={styles.countdownNumber}>{timeRemaining.seconds}</Text>
              <Text style={styles.countdownText}>Secs</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Client Card */}
      <LinearGradient
        colors={['#2563eb', '#3b82f6']}
        style={styles.clientCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.clientHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {consultation?.clientName?.[0]?.toUpperCase() || 'C'}
            </Text>
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.clientLabel}>Client Name</Text>
            <Text style={styles.clientName}>{consultation?.clientName || 'Client'}</Text>
          </View>
        </View>

        <View style={styles.consultationDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.dateText}>{date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={18} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.timeText}>{time}</Text>
            <Text style={styles.durationText}>({duration})</Text>
            <Text style={styles.timezoneText}>(Europe/London)</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Service Type Card */}
      <View style={styles.detailCard}>
        <View style={styles.detailHeader}>
          <View style={[styles.detailIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <MaterialCommunityIcons name="star-outline" size={16} color="#2563eb" />
          </View>
          <Text style={styles.detailLabel}>Service Type</Text>
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailValue}>
            {consultation?.service?.name || consultation?.type || 'Love & Relationship Compatibility'}
          </Text>
        </View>
      </View>

      {/* Payment Card */}
      <View style={styles.detailCard}>
        <View style={styles.detailHeader}>
          <View style={[styles.detailIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <MaterialCommunityIcons name="cash" size={16} color="#10b981" />
          </View>
          <Text style={styles.detailLabel}>Payment</Text>
          <View style={[
            styles.paymentBadge,
            {
              backgroundColor: getPaymentStatusColor().bgColor
            }
          ]}>
            <Text style={[
              styles.paymentBadgeText,
              {
                color: getPaymentStatusColor().textColor
              }
            ]}>
              {getPaymentStatus()}
            </Text>
          </View>
        </View>
        <View style={styles.detailContent}>
          <Text style={styles.detailValue}>
            £{consultation?.original?.service?.price || consultation?.original?.price || consultation?.payment?.amount || '999'}
          </Text>
          {consultation?.payment?.date && (
            <Text style={styles.paymentDate}>
              Paid on {new Date(consultation.payment.date).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      {/* Meeting Link Card */}
      <View style={styles.detailCard}>
        <View style={styles.detailHeader}>
          <View style={[styles.detailIconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
            <MaterialCommunityIcons name="video" size={16} color="#6366f1" />
          </View>
          <Text style={styles.detailLabel}>Meeting Link</Text>
        </View>
        <View style={styles.detailContent}>
          <View style={styles.linkButton}>
            <Text style={styles.linkText} numberOfLines={1}>
              {consultation?.meeting?.link || consultation?.meetingLink || 'https://meet.google.com/...'}
            </Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyLink}>
              <Feather name="copy" size={14} color="#6b7280" />
              <Text style={styles.copyText}>{linkCopied ? 'Copied!' : 'Copy'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.joinButton} onPress={handleJoinMeeting}>
          <MaterialCommunityIcons name="video" size={20} color="#fff" />
          <Text style={styles.joinButtonText}>Join Audio/Video Call</Text>
        </TouchableOpacity>
      </View>

      {/* Status Update Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#2563eb" />
            ) : (
              <>
                <Text style={styles.modalTitle}>Cancel Consultation?</Text>
                <Text style={styles.modalText}>
                  Are you sure you want to cancel this consultation? This action cannot be undone.
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalCancelButtonText}>No, Keep</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalConfirmButton]}
                    onPress={() => handleStatusUpdate('cancelled')}
                  >
                    <Text style={styles.modalConfirmButtonText}>Yes, Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
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
  headerSection: {
    marginBottom: 20,
  },
  headerLeft: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  countdownSection: {
    marginBottom: 20,
  },
  countdownWrapper: {
    borderRadius: 12,
    padding: 16,
  },
  countdownLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 12,
    textAlign: 'center',
  },
  countdownTimerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  countdownUnit: {
    alignItems: 'center',
    minWidth: 60,
  },
  countdownNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
  },
  countdownText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  countdownSeparator: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
    marginTop: -8,
  },
  clientCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  clientInfo: {
    flex: 1,
  },
  clientLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  consultationDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  durationText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timezoneText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  detailCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  detailContent: {
    paddingLeft: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  paymentDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  linkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  linkText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
    marginRight: 8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  copyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  actionButtonsContainer: {
    gap: 12,
  },
  joinButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f3f4f6',
  },
  modalCancelButtonText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '600',
  },
  modalConfirmButton: {
    backgroundColor: '#ef4444',
  },
  modalConfirmButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
});

export default NextConsultationCard; 