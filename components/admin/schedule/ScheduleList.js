import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createAuthConfig, updateConsultationStatus } from '../../../actions/auth';

const ScheduleList = ({ consultations = [], refreshData }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'confirmed', 'completed'

  // Filter consultations based on active tab
  const getFilteredConsultations = () => {
    if (activeTab === 'all') return consultations;
    
    return consultations.filter(
      consultation => consultation.status?.toLowerCase() === activeTab
    );
  };

  // Group consultations by date
  const groupConsultationsByDate = () => {
    const filtered = getFilteredConsultations();
    const grouped = {};
    
    filtered.forEach(consultation => {
      if (!consultation.scheduledTime) return;
      
      const date = new Date(consultation.scheduledTime);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!grouped[dateString]) {
        grouped[dateString] = [];
      }
      
      grouped[dateString].push(consultation);
    });
    
    // Sort consultations within each date group by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => 
        new Date(a.scheduledTime) - new Date(b.scheduledTime)
      );
    });
    
    // Convert to array format for FlatList
    return Object.keys(grouped)
      .sort() // Sort dates chronologically
      .map(date => ({
        date,
        consultations: grouped[date]
      }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // Check if date is today
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    // Check if date is tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    
    // Format as "Mon, May 5"
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  // Helper function to safely format time from ISO string
  const formatTime = (isoString) => {
    if (!isoString) {
      console.log('Missing scheduledTime for consultation');
      return 'No time set';
    }
    
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      console.log('Invalid scheduledTime format:', isoString);
      return 'Invalid time';
    }
    
    try {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Time error';
    }
  };

  // Handle consultation status update
  const handleStatusUpdate = async (consultationId, newStatus) => {
    try {
      const config = await createAuthConfig();
      const result = await updateConsultationStatus(config, consultationId, newStatus);
      
      if (result.status === 200) {
        Alert.alert('Success', `Consultation ${newStatus} successfully`);
        refreshData(); // Refresh the list
      } else {
        Alert.alert('Error', result.message || 'Failed to update consultation status');
      }
    } catch (error) {
      console.error('Error updating consultation status:', error);
      Alert.alert('Error', 'An error occurred while updating the consultation');
    }
  };

  // Handle confirmation before cancelling
  const confirmCancellation = (consultationId) => {
    Alert.alert(
      'Cancel Consultation',
      'Are you sure you want to cancel this consultation? This action cannot be undone.',
      [
        { text: 'No, Keep it', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => handleStatusUpdate(consultationId, 'cancelled')
        }
      ]
    );
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed':
        return { bg: '#e8f5e9', text: '#4caf50' };
      case 'pending':
        return { bg: '#fff8e1', text: '#ffa000' };
      case 'completed':
        return { bg: '#e1f5fe', text: '#03a9f4' };
      case 'cancelled':
        return { bg: '#ffebee', text: '#f44336' };
      default:
        return { bg: '#f5f5f5', text: '#9e9e9e' };
    }
  };

  // Render the action buttons for a consultation
  const renderActionButtons = (consultation) => {
    const status = consultation.status?.toLowerCase();
    
    if (status === 'pending') {
      return (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleStatusUpdate(consultation._id, 'confirmed')}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => confirmCancellation(consultation._id)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (status === 'confirmed') {
      return (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleStatusUpdate(consultation._id, 'completed')}
          >
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rescheduleButton]}
            onPress={() => Alert.alert('Coming Soon', 'Reschedule functionality will be available soon')}
          >
            <Text style={styles.rescheduleButtonText}>Reschedule</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return null;
  };

  // Render a consultation item
  const renderConsultationItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const status = item.status?.toLowerCase();
    const showBorder = status === 'pending' || status === 'confirmed';
    
    return (
      <View style={styles.consultationCard}>
        <View style={styles.consultationHeader}>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={16} color="#2196F3" style={styles.icon} />
            <Text style={styles.timeText}>{formatTime(item.scheduledTime)}</Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {item.status || 'Unknown'}
            </Text>
          </View>
        </View>
        
        <View style={[
          styles.clientContainer,
          showBorder && { 
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0'
          }
        ]}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.client?.name ? item.client.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{item.client?.name || 'Unknown Client'}</Text>
            <Text style={styles.consultationType}>
              {item.type || 'Standard'} • {item.duration ? `${item.duration} min` : '30 min'}
            </Text>
          </View>
        </View>
        
        {renderActionButtons(item)}
      </View>
    );
  };

  // Render a date group header
  const renderDateHeader = (date) => {
    return (
      <View style={styles.dateHeader}>
        <Text style={styles.dateHeaderText}>{formatDate(date)}</Text>
        <View style={styles.dateHeaderLine} />
      </View>
    );
  };

  const groupedConsultations = groupConsultationsByDate();

  // Render each group and its consultations
  const renderGroup = ({ item }) => {
    return (
      <View style={styles.dateGroup}>
        {renderDateHeader(item.date)}
        {item.consultations.map((consultation) => (
          <View key={consultation._id}>
            {renderConsultationItem({ item: consultation })}
          </View>
        ))}
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={60} color="#ccc" />
        <Text style={styles.emptyTitle}>No consultations found</Text>
        <Text style={styles.emptyText}>
          {activeTab === 'all' 
            ? 'You have no scheduled consultations at the moment.'
            : `You have no ${activeTab} consultations.`}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterTabs}>
        <TouchableOpacity 
          style={[styles.filterTab, activeTab === 'all' && styles.activeFilterTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.filterTabText, activeTab === 'all' && styles.activeFilterTabText]}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterTab, activeTab === 'pending' && styles.activeFilterTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.filterTabText, activeTab === 'pending' && styles.activeFilterTabText]}>
            Pending
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterTab, activeTab === 'confirmed' && styles.activeFilterTab]}
          onPress={() => setActiveTab('confirmed')}
        >
          <Text style={[styles.filterTabText, activeTab === 'confirmed' && styles.activeFilterTabText]}>
            Confirmed
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterTab, activeTab === 'completed' && styles.activeFilterTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.filterTabText, activeTab === 'completed' && styles.activeFilterTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>
      
      {groupedConsultations.length > 0 ? (
        <FlatList
          data={groupedConsultations}
          renderItem={renderGroup}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  activeFilterTab: {
    backgroundColor: '#2196F3',
  },
  filterTabText: {
    fontSize: 13,
    color: '#666',
  },
  activeFilterTabText: {
    color: '#fff',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 10,
  },
  dateHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  consultationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  clientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
  },
  avatarPlaceholder: {
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
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  consultationType: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: '#e8f5e9',
  },
  confirmButtonText: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#ffebee',
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#f44336',
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#e3f2fd',
  },
  completeButtonText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  rescheduleButton: {
    backgroundColor: '#f3e5f5',
  },
  rescheduleButtonText: {
    fontSize: 12,
    color: '#9c27b0',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
});

export default ScheduleList; 