import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createAuthConfig } from '../../../actions/auth';
import { BASE_URL } from '../../../actions/base_url';

const QueriesList = () => {
  const navigation = useNavigation();
  const [queries, setQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    setIsLoading(true);
    try {
      // Use the createAuthConfig helper to get proper authentication headers
      const config = await createAuthConfig();
      
      // Check if we have authorization
      if (!config.headers.Authorization) {
        setError('Authentication required');
        setIsLoading(false);
        return;
      }

      // Make API call directly
      const response = await fetch(`${BASE_URL}/query/all`, {
        method: 'GET',
        headers: config.headers
      });

      const data = await response.json();
      console.log('Queries fetch result:', data);

      if (response.ok) {
        if (data && data.data) {
          setQueries(data.data);
        } else {
          setQueries([]);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch queries');
      }
    } catch (err) {
      console.error('Error fetching queries:', err);
      setError(err.message || 'Failed to load queries');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openQueryDetail = (query) => {
    setSelectedQuery(query);
    setModalVisible(true);
  };

  const renderQueryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.queryCard}
      onPress={() => openQueryDetail(item)}
    >
      <View style={styles.queryHeader}>
        <View style={styles.categoryContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.queryCategory}>{item.category}</Text>
          </View>
          <View style={[
            styles.statusBadge, 
            item.answer ? styles.statusAnsweredBadge : styles.statusPendingBadge
          ]}>
            <Text style={styles.statusText}>
              {item.answer ? 'Answered' : 'Pending'}
            </Text>
          </View>
        </View>
        <Text style={styles.queryDate}>{formatDate(item.createdAt)}</Text>
      </View>
      
      <Text style={styles.queryText} numberOfLines={2}>
        {item.question}
      </Text>
      
      {item.answer && (
        <View style={styles.answerPreviewContainer}>
          <Text style={styles.answerLabel}>Answer:</Text>
          <Text style={styles.answerPreview} numberOfLines={1}>
            {item.answer}
          </Text>
        </View>
      )}
      
      <View style={styles.cardFooter}>
        <View style={styles.querySummary}>
          <Text style={styles.summaryText}>
            <Text style={styles.summaryLabel}>Birth: </Text>
            {item.date_of_birth}
          </Text>
        </View>
        <View style={styles.viewDetailsButton}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#7765E3" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const QueryDetailModal = () => {
    if (!selectedQuery) return null;
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Question Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Category</Text>
                <View style={styles.categoryBadgeLarge}>
                  <Text style={styles.categoryTextLarge}>{selectedQuery.category}</Text>
                </View>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Status</Text>
                <View style={[
                  styles.statusBadgeLarge, 
                  selectedQuery.answer ? styles.statusAnsweredBadge : styles.statusPendingBadge
                ]}>
                  <Text style={styles.statusTextLarge}>
                    {selectedQuery.answer ? 'Answered' : 'Pending'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Date Submitted</Text>
                <Text style={styles.detailText}>{formatDate(selectedQuery.createdAt)}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Personal Details</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{selectedQuery.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedQuery.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Gender:</Text>
                  <Text style={styles.detailValue}>{selectedQuery.gender}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Birth Date:</Text>
                  <Text style={styles.detailValue}>{selectedQuery.date_of_birth}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Birth Time:</Text>
                  <Text style={styles.detailValue}>{selectedQuery.time_of_birth}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Birth Location:</Text>
                  <Text style={styles.detailValue}>{selectedQuery.place_of_birth}</Text>
                </View>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Your Question</Text>
                <Text style={styles.questionText}>{selectedQuery.question}</Text>
              </View>
              
              {selectedQuery.answer ? (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Answer</Text>
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerText}>{selectedQuery.answer}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Answer</Text>
                  <View style={styles.pendingAnswerContainer}>
                    <Ionicons name="time-outline" size={24} color="#FF9800" />
                    <Text style={styles.pendingAnswerText}>
                      Your question is being reviewed by our astrologer. You will receive a notification when it's answered.
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#7765E3" />
        <Text style={styles.loadingText}>Loading your queries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={queries}
        renderItem={renderQueryItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={fetchQueries}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>My Queries</Text>
            <TouchableOpacity
              style={styles.askButton}
              onPress={() => navigation.navigate('ask-question')}
            >
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.askButtonText}>New Question</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No queries yet</Text>
            <Text style={styles.emptySubtext}>
              Ask your first question to get personalized astrological guidance
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('ask-question')}
            >
              <Text style={styles.emptyButtonText}>Ask a Question</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      <QueryDetailModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7765E3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  askButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  queryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  queryHeader: {
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#ede9ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  queryCategory: {
    color: '#7765E3',
    fontWeight: '600',
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusAnsweredBadge: {
    backgroundColor: '#e6f7ed',
  },
  statusPendingBadge: {
    backgroundColor: '#fff0e0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  queryDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  queryText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
    fontWeight: '500',
  },
  answerPreviewContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  answerPreview: {
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  querySummary: {
    flex: 1,
  },
  summaryText: {
    fontSize: 12,
    color: '#666',
  },
  summaryLabel: {
    fontWeight: '600',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#7765E3',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#7765E3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalScrollContent: {
    flex: 1,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 8,
  },
  categoryBadgeLarge: {
    backgroundColor: '#ede9ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryTextLarge: {
    color: '#7765E3',
    fontWeight: '600',
    fontSize: 14,
  },
  statusBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusTextLarge: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 14,
    color: '#555',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    width: 100,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  questionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  answerContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  answerText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  pendingAnswerContainer: {
    backgroundColor: '#fff9e6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  pendingAnswerText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  modalCloseButton: {
    backgroundColor: '#7765E3',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default QueriesList; 