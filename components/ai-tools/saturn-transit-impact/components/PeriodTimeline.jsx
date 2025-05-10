import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { formatDate } from '../utils/dateHelpers';

const PhaseIcon = ({ phase }) => {
  const getIconStyle = () => {
    if (phase.includes('First Phase')) return styles.iconYellow;
    if (phase.includes('Second Phase')) return styles.iconRed;
    if (phase.includes('Third Phase')) return styles.iconGreen;
    return styles.iconGray;
  };

  const getIconText = () => {
    if (phase.includes('First Phase')) return '1';
    if (phase.includes('Second Phase')) return '2';
    if (phase.includes('Third Phase')) return '3';
    return '•';
  };

  return (
    <View style={[styles.phaseIcon, getIconStyle()]}>
      <Text style={styles.phaseIconText}>{getIconText()}</Text>
    </View>
  );
};

const TimelineSection = ({ title, periods, icon }) => {
  if (!periods || periods.length === 0) {
    return (
      <View style={styles.emptyPeriodContainer}>
        <Text style={styles.emptyPeriodText}>
          No {title.toLowerCase()} Sade Sati periods
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Text style={styles.sectionIconText}>{icon}</Text>
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      
      <View style={styles.periodsList}>
        {periods.map((period, index) => (
          <View key={index} style={styles.periodCard}>
            <View style={styles.periodContent}>
              {/* Period Header */}
              <View style={styles.periodHeader}>
                <Text style={styles.periodDate}>
                  {formatDate(period.from)} - {formatDate(period.to)}
                </Text>
              </View>

              {/* Phase Details */}
              <View style={styles.phaseList}>
                {period.details.map((phase, phaseIndex) => (
                  <View key={phaseIndex} style={styles.phaseItem}>
                    <PhaseIcon phase={phase.phase} />
                    <View style={styles.phaseContent}>
                      <Text style={styles.phaseName}>{formatPhase(phase.phase)}</Text>
                      <Text style={styles.phaseDates}>
                        {formatDate(phase.from)} - {formatDate(phase.to)}
                      </Text>
                      <Text style={styles.phaseDescription}>
                        {getPhaseDescription(phase.phase)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffYears = end.getFullYear() - start.getFullYear();
  const diffMonths = end.getMonth() - start.getMonth();
  
  let years = diffYears;
  let months = diffMonths;
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  const yearText = years === 1 ? 'year' : 'years';
  const monthText = months === 1 ? 'month' : 'months';
  
  if (years === 0) return `${months} ${monthText}`;
  if (months === 0) return `${years} ${yearText}`;
  return `${years} ${yearText}, ${months} ${monthText}`;
};

const formatPhase = (phase) => {
  if (phase.includes('12th from Moon')) return 'First Phase';
  if (phase.includes('Moon sign')) return 'Peak Phase';
  if (phase.includes('2nd from Moon')) return 'Final Phase';
  return phase;
};

const getPhaseDescription = (phase) => {
  if (phase.includes('12th from Moon')) {
    return 'Period of introspection, spiritual preparation, and letting go of the past';
  }
  if (phase.includes('Moon sign')) {
    return 'Most intense phase - deep transformation of emotions and core beliefs';
  }
  if (phase.includes('2nd from Moon')) {
    return 'Integration of lessons, material adjustments, and new foundations';
  }
  return '';
};

const PeriodTimeline = ({ periods }) => {
  if (!periods) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#7765E3" />
        <Text style={styles.loadingText}>Loading Sade Sati periods...</Text>
      </View>
    );
  }

  const { current, past, future } = periods;

  return (
    <View style={styles.container}>
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FBBF24' }]} />
          <Text style={styles.legendText}>First Phase</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F87171' }]} />
          <Text style={styles.legendText}>Peak Phase</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4ADE80' }]} />
          <Text style={styles.legendText}>Final Phase</Text>
        </View>
      </View>
      
      <View style={styles.timelineSections}>
        <TimelineSection title="Current Period" periods={current} icon="C" />
        <TimelineSection title="Past Periods" periods={past} icon="P" />
        <TimelineSection title="Future Periods" periods={future} icon="F" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#64748b',
  },
  timelineSections: {
    marginTop: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E0E7FF',
  },
  sectionIconText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4F46E5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#334155',
  },
  periodsList: {
    marginTop: 8,
  },
  periodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  periodContent: {
    padding: 16,
  },
  periodHeader: {
    marginBottom: 16,
  },
  periodDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  phaseList: {
    marginTop: 8,
  },
  phaseItem: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  phaseIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
  },
  iconYellow: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  iconRed: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  iconGreen: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  iconGray: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  phaseIconText: {
    fontSize: 16,
    fontWeight: '600',
  },
  phaseContent: {
    flex: 1,
  },
  phaseName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 4,
  },
  phaseDates: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  phaseDescription: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
  },
  emptyPeriodContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyPeriodText: {
    fontSize: 15,
    color: '#64748b',
  },
  loadingContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
  }
});

export default PeriodTimeline; 