import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ConsultationDetails = ({ visible, consultation, onClose, onStatusUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState(consultation?.status || 'pending');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  if (!consultation) return null;

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#f59e0b', icon: 'time-outline' },
    { value: 'upcoming', label: 'Upcoming', color: '#3b82f6', icon: 'calendar-outline' },
    { value: 'today', label: 'Today', color: '#fd7e14', icon: 'today-outline' },
    { value: 'completed', label: 'Completed', color: '#16a34a', icon: 'checkmark-circle-outline' },
    { value: 'cancelled', label: 'Cancelled', color: '#ef4444', icon: 'close-circle-outline' }
  ];

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date time:', error);
      return 'Date error';
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : '#6b7280';
  };

  const getStatusIcon = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.icon : 'help-circle-outline';
  };

  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
    setShowStatusDropdown(false);
  };

  const handleSaveStatus = () => {
    if (selectedStatus !== consultation.status) {
      onStatusUpdate(consultation._id, selectedStatus);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.modalTitle}>Consultation Details</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(consultation.status) + '20' }]}>
                <Ionicons name={getStatusIcon(consultation.status)} size={14} color={getStatusColor(consultation.status)} style={styles.statusIcon} />
                <Text style={[styles.statusText, { color: getStatusColor(consultation.status) }]}>
                  {consultation.status}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Consultation ID Banner */}
            <View style={styles.idBanner}>
              <Text style={styles.idLabel}>Consultation ID</Text>
              <Text style={styles.idValue}>
                {consultation.id || consultation.displayId || (consultation._id ? `KK${consultation._id.substring(0, 5).toUpperCase()}` : 'Unknown')}
              </Text>
            </View>
            
            {/* Client Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person-outline" size={18} color="#4b5563" />
                <Text style={styles.sectionTitle}>Client Information</Text>
              </View>
              
              <View style={styles.clientCard}>
                <View style={styles.clientAvatar}>
                  <Text style={styles.clientInitials}>
                    {consultation.client?.name ? consultation.client.name.substring(0, 1).toUpperCase() : '?'}
                  </Text>
                </View>
                <View style={styles.clientDetails}>
                  <Text style={styles.clientName}>{consultation.client?.name || 'Unknown Client'}</Text>
                  {consultation.client?.email && (
                    <View style={styles.contactRow}>
                      <Ionicons name="mail-outline" size={14} color="#6b7280" />
                      <Text style={styles.contactText}>{consultation.client.email}</Text>
                    </View>
                  )}
                  {consultation.client?.phone && (
                    <View style={styles.contactRow}>
                      <Ionicons name="call-outline" size={14} color="#6b7280" />
                      <Text style={styles.contactText}>{consultation.client.phone}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            
            {/* Service Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="medical-outline" size={18} color="#4b5563" />
                <Text style={styles.sectionTitle}>Service Details</Text>
              </View>
              
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Service Type:</Text>
                  <Text style={styles.infoValue}>{consultation.type}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Duration:</Text>
                  <Text style={styles.infoValue}>{consultation.duration || 30} minutes</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Price:</Text>
                  <Text style={styles.infoValue}>£{consultation.price || consultation.amount || '45.00'}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Created On:</Text>
                  <Text style={styles.infoValue}>{formatDateTime(consultation.created_at || consultation.createdAt || consultation.date)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Scheduled For:</Text>
                  <Text style={styles.infoValue}>{formatDateTime(consultation.start_time || consultation.scheduledTime || consultation.date || consultation.bookingDate || consultation.startTime)}</Text>
                </View>
              </View>
            </View>
            
            {/* Payment Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="wallet-outline" size={18} color="#4b5563" />
                <Text style={styles.sectionTitle}>Payment Information</Text>
              </View>
              
              <View style={styles.infoCard}>
                <View style={styles.paymentStatusRow}>
                  <Text style={styles.infoLabel}>Payment Status:</Text>
                  <View style={[styles.paymentBadge, { 
                    backgroundColor: consultation.isPaid ? '#dcfce7' : '#fee2e2' 
                  }]}>
                    <Ionicons 
                      name={consultation.isPaid ? "checkmark-circle" : "alert-circle"} 
                      size={14} 
                      color={consultation.isPaid ? '#16a34a' : '#ef4444'} 
                      style={styles.paymentIcon}
                    />
                    <Text style={[styles.paymentText, { 
                      color: consultation.isPaid ? '#16a34a' : '#ef4444' 
                    }]}>
                      {consultation.isPaid ? 'Paid' : 'Unpaid'}
                    </Text>
                  </View>
                </View>
                
                {consultation.payment_method && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Payment Method:</Text>
                    <Text style={styles.infoValue}>{consultation.payment_method}</Text>
                  </View>
                )}
                
                <View style={styles.divider} />
                
                <View style={styles.statusUpdateContainer}>
                  <Text style={styles.statusUpdateLabel}>Update Status:</Text>
                  <View style={{ position: 'relative', zIndex: 100 }}>
                    <TouchableOpacity 
                      style={styles.statusDropdownButton}
                      onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                    >
                      <View style={[styles.selectedStatusIndicator, { backgroundColor: getStatusColor(selectedStatus) }]} />
                      <Text style={styles.selectedStatusText}>
                        {statusOptions.find(opt => opt.value === selectedStatus)?.label || 'Select Status'}
                      </Text>
                      <Ionicons 
                        name={showStatusDropdown ? "chevron-up" : "chevron-down"} 
                        size={16} 
                        color="#6b7280" 
                      />
                    </TouchableOpacity>
                    
                    {showStatusDropdown && (
                      <View style={styles.statusDropdown}>
                        {statusOptions.map(option => (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              styles.statusOption,
                              selectedStatus === option.value && styles.selectedStatusOption
                            ]}
                            onPress={() => handleStatusChange(option.value)}
                          >
                            <Ionicons name={option.icon} size={16} color={option.color} style={styles.statusOptionIcon} />
                            <Text style={[
                              styles.statusOptionText,
                              selectedStatus === option.value && styles.selectedStatusOptionText
                            ]}>
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Meeting URL */}
            {consultation.meeting && consultation.meeting.url && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="videocam-outline" size={18} color="#4b5563" />
                  <Text style={styles.sectionTitle}>Meeting Information</Text>
                </View>
                
                <View style={styles.infoCard}>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('Opening meeting URL:', consultation.meeting.url);
                      Linking.openURL(consultation.meeting.url)
                        .catch(err => console.error('Error opening URL:', err));
                    }}
                    style={styles.meetingButton}
                  >
                    <Ionicons name="videocam" size={18} color="#ffffff" style={styles.meetingIcon} />
                    <Text style={styles.meetingButtonText}>Join Meeting</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.meetingUrlContainer}>
                    <Text style={styles.meetingUrlLabel}>Meeting URL:</Text>
                    <Text style={styles.meetingUrl} numberOfLines={2}>{consultation.meeting.url}</Text>
                  </View>
                  
                  {consultation.meeting.provider && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Provider:</Text>
                      <Text style={styles.infoValue}>{consultation.meeting.provider}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Notes Section */}
            {consultation.notes && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="document-text-outline" size={18} color="#4b5563" />
                  <Text style={styles.sectionTitle}>Notes</Text>
                </View>
                
                <View style={styles.notesCard}>
                  <Text style={styles.notesText}>{consultation.notes}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveStatus}
            >
              <Ionicons name="save-outline" size={16} color="#FFFFFF" style={{marginRight: 6}} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: Math.min(width * 0.9, 550),
    maxHeight: height * 0.85,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#f9fafb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  modalContent: {
    padding: 16,
    maxHeight: height * 0.6,
  },
  idBanner: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  idLabel: {
    fontSize: 12,
    color: '#6366f1',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  idValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4f46e5',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  clientCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  clientDetails: {
    marginLeft: 16,
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  contactText: {
    fontSize: 14,
    color: '#4b5563',
  },
  infoCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'right',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  paymentStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  paymentIcon: {
    marginRight: 6,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusUpdateContainer: {
    marginTop: 8,
  },
  statusUpdateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    minWidth: 180,
  },
  selectedStatusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  selectedStatusText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  statusDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedStatusOption: {
    backgroundColor: '#f3f4f6',
  },
  statusOptionIcon: {
    marginRight: 10,
  },
  statusOptionText: {
    fontSize: 14,
    color: '#111827',
  },
  selectedStatusOptionText: {
    fontWeight: '600',
  },
  meetingButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  meetingIcon: {
    marginRight: 8,
  },
  meetingButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  meetingUrlContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  meetingUrlLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  meetingUrl: {
    fontSize: 13,
    color: '#3b82f6',
  },
  notesCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#f9fafb',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

export default ConsultationDetails; 