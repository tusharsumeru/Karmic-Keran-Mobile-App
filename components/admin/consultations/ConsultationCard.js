import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConsultationCard = ({ consultation, onStatusUpdate, onViewDetails }) => {
  // Log the raw date fields from the consultation object
  console.log(`Card ${consultation._id} raw date fields:`, {
    scheduledTime: consultation.scheduledTime,
    date: consultation.date,
    createdAt: consultation.createdAt,
    bookingDate: consultation.bookingDate,
    startTime: consultation.startTime
  });
  
  // First try to get the correct date from the object
  const getValidDateString = () => {
    // Check for a startTime or bookingDate field - these are often provided by APIs
    if (consultation.startTime) return consultation.startTime;
    if (consultation.bookingDate) return consultation.bookingDate;
    
    // Then try the standard fields we expect
    if (consultation.scheduledTime && isValidDateString(consultation.scheduledTime)) 
      return consultation.scheduledTime;
    if (consultation.date && isValidDateString(consultation.date)) 
      return consultation.date;
    if (consultation.createdAt && isValidDateString(consultation.createdAt)) 
      return consultation.createdAt;
    
    // If no valid date field, log this specific issue
    console.warn(`No valid date found for consultation ${consultation._id}`);
    return null;
  };
  
  // Check if a string contains a valid date
  const isValidDateString = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
  };
  
  // Get the best available date string
  const dateString = getValidDateString();
  console.log(`Card ${consultation._id} using date:`, dateString);
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'upcoming':
        return { bg: '#e8f5e9', text: '#4caf50', icon: 'checkmark-circle' };
      case 'pending':
      case 'today':
        return { bg: '#fff8e1', text: '#ffa000', icon: 'time' };
      case 'completed':
        return { bg: '#e1f5fe', text: '#03a9f4', icon: 'star' };
      case 'cancelled':
        return { bg: '#ffebee', text: '#f44336', icon: 'close-circle' };
      default:
        return { bg: '#f5f5f5', text: '#9e9e9e', icon: 'help-circle' };
    }
  };

  const statusColor = getStatusColor(consultation.status);
  
  // Check if consultation is today
  const isToday = () => {
    if (!dateString) return false;
    
    try {
      const consultDate = new Date(dateString);
      if (isNaN(consultDate.getTime())) return false;
      
      const today = new Date();
      
      return (
        consultDate.getDate() === today.getDate() &&
        consultDate.getMonth() === today.getMonth() &&
        consultDate.getFullYear() === today.getFullYear()
      );
    } catch (error) {
      return false;
    }
  };

  // Format date and time with better error handling
  const formatCardDate = (dateStr) => {
    if (!dateStr) return 'No date';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Date error';
    }
  };

  const formatCardTime = (dateStr) => {
    if (!dateStr) return 'No time';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid time';
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Time error';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.consultationCard, isToday() && styles.todayCard]}
      onPress={() => onViewDetails(consultation)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.dateText}>{formatCardDate(dateString)}</Text>
          <View style={styles.timeWrapper}>
            <Ionicons name="time-outline" size={14} color="#555" />
            <Text style={styles.timeText}>{formatCardTime(dateString)}</Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
          <Ionicons name={statusColor.icon} size={12} color={statusColor.text} />
          <Text style={[styles.statusText, { color: statusColor.text }]}>
            {consultation.status}
          </Text>
        </View>
      </View>

      <View style={styles.clientContainer}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {consultation.client?.name ? consultation.client.name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <View style={styles.clientDetails}>
          <Text style={styles.clientName}>{consultation.client?.name || 'Unknown Client'}</Text>
          <Text style={styles.serviceType}>{consultation.type || 'General Consultation'}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        {consultation.status === 'pending' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => onStatusUpdate(consultation._id, 'confirmed')}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        )}
        
        {consultation.status === 'confirmed' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => onStatusUpdate(consultation._id, 'completed')}
          >
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>
        )}
        
        {(consultation.status === 'pending' || consultation.status === 'confirmed') && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => onStatusUpdate(consultation._id, 'cancelled')}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.detailsButton]}
          onPress={() => onViewDetails(consultation)}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  consultationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  todayCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateTimeContainer: {
    flexDirection: 'column',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  clientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  serviceType: {
    fontSize: 14,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
    marginBottom: 8,
  },
  confirmButton: {
    backgroundColor: '#e8f5e9',
  },
  confirmButtonText: {
    color: '#4caf50',
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: '#e3f2fd',
  },
  completeButtonText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#ffebee',
  },
  cancelButtonText: {
    color: '#f44336',
    fontWeight: '500',
  },
  detailsButton: {
    backgroundColor: '#f5f5f5',
  },
  detailsButtonText: {
    color: '#757575',
    fontWeight: '500',
  },
});

export default ConsultationCard; 