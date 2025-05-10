import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const DateRangeFilter = ({ dateRange, setDateRange }) => {
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const onFromDateChange = (event, selectedDate) => {
    setShowFromPicker(Platform.OS === 'ios');
    if (event.type === 'dismissed') return;
    
    if (selectedDate) {
      // Ensure the "from" date is not after the "to" date
      if (dateRange.to && selectedDate > new Date(dateRange.to)) {
        setDateRange({
          from: selectedDate.toISOString().split('T')[0],
          to: selectedDate.toISOString().split('T')[0]
        });
      } else {
        setDateRange({
          ...dateRange,
          from: selectedDate.toISOString().split('T')[0]
        });
      }
    }
  };

  const onToDateChange = (event, selectedDate) => {
    setShowToPicker(Platform.OS === 'ios');
    if (event.type === 'dismissed') return;
    
    if (selectedDate) {
      // Ensure the "to" date is not before the "from" date
      if (dateRange.from && selectedDate < new Date(dateRange.from)) {
        setDateRange({
          from: dateRange.from,
          to: dateRange.from
        });
      } else {
        setDateRange({
          ...dateRange,
          to: selectedDate.toISOString().split('T')[0]
        });
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Select date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const clearDates = () => {
    setDateRange({ from: null, to: null });
  };

  return (
    <View style={styles.container}>
      <View style={styles.datePickersContainer}>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowFromPicker(true)}
        >
          <Text style={styles.datePickerLabel}>From:</Text>
          <View style={styles.dateDisplay}>
            <Text style={styles.dateText}>
              {formatDate(dateRange.from)}
            </Text>
            <Ionicons name="calendar-outline" size={16} color="#666" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowToPicker(true)}
        >
          <Text style={styles.datePickerLabel}>To:</Text>
          <View style={styles.dateDisplay}>
            <Text style={styles.dateText}>
              {formatDate(dateRange.to)}
            </Text>
            <Ionicons name="calendar-outline" size={16} color="#666" />
          </View>
        </TouchableOpacity>
      </View>

      {(dateRange.from || dateRange.to) && (
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={clearDates}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      )}

      {showFromPicker && (
        <DateTimePicker
          value={dateRange.from ? new Date(dateRange.from) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={onFromDateChange}
        />
      )}

      {showToPicker && (
        <DateTimePicker
          value={dateRange.to ? new Date(dateRange.to) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={onToDateChange}
          minimumDate={dateRange.from ? new Date(dateRange.from) : undefined}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  datePickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePickerButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  datePickerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  clearButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
  },
  clearButtonText: {
    fontSize: 12,
    color: '#666',
  },
});

export default DateRangeFilter; 