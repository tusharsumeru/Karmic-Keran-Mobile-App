import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QueryDialog from './QueryDialog';

const QueryItem = ({ item, config, onViewBirthChart, loading, onQueryAnswered }) => {
  const [showAnswerDialog, setShowAnswerDialog] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const calculateAvgRating = () => {
    if (!item.rating || 
        (item.rating.quality === 0 && 
         item.rating.content === 0 && 
         item.rating.perception === 0)) {
      return null;
    }

    const ratings = [
      item.rating.quality || 0,
      item.rating.content || 0,
      item.rating.perception || 0
    ].filter(r => r > 0);

    if (ratings.length === 0) return null;

    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    return avg.toFixed(1);
  };

  const avgRating = calculateAvgRating();

  const getStatusColor = () => {
    if (item.answer) return '#4CAF50';
    return '#FF9800';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
          </View>
        </View>
        <View style={styles.headerContent}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '15' }]}>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {item.answer ? 'Answered' : 'Pending'}
              </Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="bookmark-outline" size={14} color="#666" />
              <Text style={styles.metaText}>{item.category}</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      {/* Question Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="help-circle-outline" size={18} color="#666" />
          <Text style={styles.sectionTitle}>Question</Text>
        </View>
        <Text style={styles.questionText}>{item.question}</Text>
      </View>
      
      {/* Customer Details Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={18} color="#666" />
          <Text style={styles.sectionTitle}>Customer Details</Text>
        </View>
        
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{item.email}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date of Birth</Text>
            <Text style={styles.detailValue}>{formatDate(item.date_of_birth)}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Time of Birth</Text>
            <Text style={styles.detailValue}>{formatTime(item.time_of_birth)}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Place of Birth</Text>
            <Text style={styles.detailValue}>{item.place_of_birth || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Gender</Text>
            <Text style={styles.detailValue}>{item.gender || 'N/A'}</Text>
          </View>
        </View>
      </View>
      
      {/* Answer Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="chatbubble-outline" size={18} color="#666" />
          <Text style={styles.sectionTitle}>
            {item.answer ? 'Answer' : 'No Answer Yet'}
          </Text>
        </View>
        
        {item.answer ? (
          <Text style={styles.answerText}>{item.answer}</Text>
        ) : (
          <View style={styles.noAnswerContainer}>
            <Text style={styles.noAnswerText}>
              This query hasn't been answered yet. Use the buttons below to provide an answer.
            </Text>
          </View>
        )}
      </View>
      
      {/* Rating Section - If available */}
      {avgRating && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star-outline" size={18} color="#666" />
            <Text style={styles.sectionTitle}>Rating</Text>
          </View>
          
          <View style={styles.ratingsGrid}>
            {item.rating?.quality > 0 && (
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Quality</Text>
                <View style={styles.ratingStars}>
                  <Ionicons name="star" size={16} color="#FFB400" />
                  <Text style={styles.ratingValue}>{item.rating.quality}</Text>
                </View>
              </View>
            )}
            
            {item.rating?.content > 0 && (
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Content</Text>
                <View style={styles.ratingStars}>
                  <Ionicons name="star" size={16} color="#FFB400" />
                  <Text style={styles.ratingValue}>{item.rating.content}</Text>
                </View>
              </View>
            )}
            
            {item.rating?.perception > 0 && (
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Perception</Text>
                <View style={styles.ratingStars}>
                  <Ionicons name="star" size={16} color="#FFB400" />
                  <Text style={styles.ratingValue}>{item.rating.perception}</Text>
                </View>
              </View>
            )}
            
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>Average</Text>
              <View style={styles.ratingStars}>
                <Ionicons name="star" size={16} color="#FFB400" />
                <Text style={styles.ratingValue}>{avgRating}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
      
      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {!item.answer ? (
          <>
            <TouchableOpacity 
              style={styles.answerButton}
              onPress={() => setShowAnswerDialog(true)}
            >
              <Ionicons name="create-outline" size={16} color="#2196F3" />
              <Text style={styles.answerButtonText}>Write Answer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.birthChartButton}
              onPress={onViewBirthChart}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FF9800" />
              ) : (
                <>
                  <Ionicons name="document-text-outline" size={16} color="#FF9800" />
                  <Text style={styles.birthChartButtonText}>View Kundali</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={styles.birthChartButton}
            onPress={onViewBirthChart}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FF9800" />
            ) : (
              <>
                <Ionicons name="document-text-outline" size={16} color="#FF9800" />
                <Text style={styles.birthChartButtonText}>View Kundali</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {showAnswerDialog && (
        <QueryDialog 
          questionId={item._id}
          question={item.question}
          config={config}
          onClose={() => setShowAnswerDialog(false)}
          onSuccess={() => {
            setShowAnswerDialog(false);
            if (onQueryAnswered) onQueryAnswered();
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  headerContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  questionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
  },
  answerText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  noAnswerContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  noAnswerText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  ratingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  ratingItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  answerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  answerButtonText: {
    fontSize: 13,
    color: '#2196F3',
    marginLeft: 6,
  },
  birthChartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  birthChartButtonText: {
    fontSize: 13,
    color: '#FF9800',
    marginLeft: 6,
  },
});

export default QueryItem; 