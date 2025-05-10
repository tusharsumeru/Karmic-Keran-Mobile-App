import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, startOfDay, isEqual, parseISO } from 'date-fns';
import { DateTime } from 'luxon';
import CountryFlag from "react-native-country-flag";
import { retrieveAvailableSlots, createAuthConfig } from '../../../../actions/auth';

/**
 * SchedulePicker component - Step 3 of booking flow
 * Allows selecting date, time and timezone for the consultation
 */
const SchedulePicker = ({ 
  initialData, 
  onDataChange, 
  availableSlots: initialSlots, 
  serviceData, 
  onContinue, 
  onBack 
}) => {
  // Component state
  const [selectedDate, setSelectedDate] = useState(initialData?.date || null);
  const [selectedTime, setSelectedTime] = useState(initialData?.time || null);
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);
  const [timezones, setTimezones] = useState([]);
  const [filteredZones, setFilteredZones] = useState([]);
  const [errors, setErrors] = useState({});
  const [availableSlots, setAvailableSlots] = useState(initialSlots || {});
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  // Get service duration from serviceData
  const serviceDuration = serviceData?.duration || 30;
  
  // Add state for timezone search
  const [timezoneSearchQuery, setTimezoneSearchQuery] = useState('');
  
  // Default to browser's timezone if not set, with fallback to 'Europe/London'
  const [selectedTimezone, setSelectedTimezone] = useState(() => {
    try {
      return initialData?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London';
    } catch (err) {
      return 'Europe/London'; // Fallback to London timezone
    }
  });
  
  // Effects
  
  // Load available slots on component mount
  useEffect(() => {
    fetchAvailableSlots();
  }, [serviceDuration]);
  
  // Initialize timezones list on component mount
  useEffect(() => {
    // Define a limited but diverse set of timezones that work reliably
    const reliableTimezones = [
      "Africa/Cairo", "Africa/Johannesburg", "Africa/Lagos", 
      "America/Chicago", "America/Denver", "America/Los_Angeles", 
      "America/Mexico_City", "America/New_York", "America/Phoenix", 
      "America/Toronto", "America/Vancouver",
      "Asia/Calcutta", "Asia/Dubai", "Asia/Hong_Kong", "Asia/Jerusalem", 
      "Asia/Kolkata", "Asia/Seoul", "Asia/Shanghai", "Asia/Singapore", 
      "Asia/Tokyo",
      "Australia/Melbourne", "Australia/Perth", "Australia/Sydney",
      "Europe/Amsterdam", "Europe/Berlin", "Europe/Dublin", "Europe/Istanbul", 
      "Europe/London", "Europe/Madrid", "Europe/Moscow", "Europe/Paris", "Europe/Rome",
      "Pacific/Auckland", "Pacific/Honolulu"
    ];
    
    setTimezones(reliableTimezones);
    setFilteredZones(reliableTimezones);
  }, []);
  
  // Track selected date/time changes
  useEffect(() => {
    if (selectedDate && selectedTime) {
      onDataChange({
        date: selectedDate,
        time: selectedTime,
        timezone: selectedTimezone
      });
      
      // Clear errors when valid selections are made
      if (errors.date || errors.time) {
        setErrors(prev => ({
          ...prev,
          date: null,
          time: null
        }));
      }
    }
  }, [selectedDate, selectedTime, selectedTimezone]);
  
  // Fetch available slots from API
  const fetchAvailableSlots = async () => {
    if (!serviceDuration) return;
    
    try {
      setIsLoadingSlots(true);
      const config = await createAuthConfig();
      const response = await retrieveAvailableSlots(config, serviceDuration);
      
      if (response.status === 200 && response.data) {
        setAvailableSlots(response.data);
        
        // Select first available date if none selected
        if (!selectedDate && Object.keys(response.data).length > 0) {
          const firstDate = Object.keys(response.data)[0];
          setSelectedDate(firstDate);
        }
      } else {
        console.warn('No available slots returned from API');
        setAvailableSlots({});
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      Alert.alert('Error', 'Failed to fetch available slots. Please try again.');
      setAvailableSlots({});
    } finally {
      setIsLoadingSlots(false);
    }
  };
  
  // Helper functions
  
  // Format date in readable format
  const formatDateDisplay = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEE, MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Get next 14 days for date selection
  const getDateOptions = () => {
    const dates = [];
    const today = startOfDay(new Date());
    
    for (let i = 0; i < 14; i++) {
      const date = addDays(today, i);
      dates.push({
        date: format(date, 'yyyy-MM-dd'),
        display: format(date, 'EEE, MMM d'),
        day: format(date, 'd'),
        weekday: format(date, 'EEE'),
        isToday: i === 0
      });
    }
    
    return dates;
  };
  
  // Format date string properly for timezone conversion
  const formatDateTimeString = (dateString, timeString) => {
    try {
      // Parse the date string (YYYY-MM-DD)
      const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
      
      // Parse time string (which could be in various formats)
      let hours = 0;
      let minutes = 0;
      
      // Handle "HH:MM AM/PM" format
      if (timeString.includes('AM') || timeString.includes('PM')) {
        const timeParts = timeString.replace(/\s+/g, ' ').trim().split(' ');
        const [hoursMinutes, period] = [timeParts[0], timeParts[1]];
        const [h, m] = hoursMinutes.split(':').map(num => parseInt(num, 10));
        
        hours = h;
        minutes = m;
        
        // Convert 12-hour to 24-hour
        if (period === 'PM' && hours < 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }
      } 
      // Handle "HH:MM" 24-hour format
      else if (timeString.includes(':')) {
        const [h, m] = timeString.split(':').map(num => parseInt(num, 10));
        hours = h;
        minutes = m;
      }
      
      // Create a Luxon DateTime object
      return DateTime.fromObject({ 
        year, 
        month, 
        day, 
        hour: hours, 
        minute: minutes 
      });
    } catch (error) {
      console.warn('Error formatting date string:', error);
      return null;
    }
  };
  
  // Get available time slots for selected date
  const getTimeSlots = (dateString) => {
    if (!availableSlots || !dateString) return [];
    
    if (isLoadingSlots) {
      return []; // Don't show slots while loading
    }
    
    // Check for the new format coming from the API (matches web frontend)
    // Format: { "yyyy-MM-dd": { isDayOff: boolean, slots: [] } }
    if (availableSlots[dateString] && availableSlots[dateString].slots) {
      return availableSlots[dateString].slots.map(slot => {
        try {
          // Get the start time from the slot
          const startTimeStr = slot.startTime;
          const endTimeStr = slot.endTime;
          
          // Create DateTime object for the slot time (assuming UTC or server timezone)
          // Use Luxon for better timezone handling
          const serverTimezone = slot.zoneName || 'Europe/London'; // Default to London if not specified
          
          // Parse the slot start time using Luxon (assuming format HH:MM or HH:MM AM/PM)
          let startDateTime;
          
          // Handle time string with or without AM/PM
          if (startTimeStr.includes('AM') || startTimeStr.includes('PM')) {
            // Format: "HH:MM AM/PM"
            startDateTime = DateTime.fromFormat(
              `${dateString} ${startTimeStr}`, 
              'yyyy-MM-dd h:mm a', 
              { zone: serverTimezone }
            );
          } else {
            // Format: "HH:MM" (24-hour)
            startDateTime = DateTime.fromFormat(
              `${dateString} ${startTimeStr}`, 
              'yyyy-MM-dd HH:mm', 
              { zone: serverTimezone }
            );
          }
          
          // Parse end time in the same way
          let endDateTime;
          if (endTimeStr) {
            if (endTimeStr.includes('AM') || endTimeStr.includes('PM')) {
              endDateTime = DateTime.fromFormat(
                `${dateString} ${endTimeStr}`, 
                'yyyy-MM-dd h:mm a', 
                { zone: serverTimezone }
              );
            } else {
              endDateTime = DateTime.fromFormat(
                `${dateString} ${endTimeStr}`, 
                'yyyy-MM-dd HH:mm', 
                { zone: serverTimezone }
              );
            }
          }
          
          if (!startDateTime.isValid) {
            console.warn('Invalid datetime from slot:', dateString, startTimeStr);
            return {
              time: startTimeStr.split(' ')[0], // Extract HH:MM part
              display: startTimeStr,
              isAvailable: !slot.disabled,
              slot,
              startTime: startTimeStr,
              endTime: endTimeStr,
              originalZone: serverTimezone
            };
          }
          
          // Convert to the user's selected timezone
          const localStartTime = startDateTime.setZone(selectedTimezone);
          
          // Also convert end time if it exists and is valid
          let localEndTime;
          if (endDateTime && endDateTime.isValid) {
            localEndTime = endDateTime.setZone(selectedTimezone);
          }
          
          // Format for display in the user's timezone
          const displayStartTime = localStartTime.toLocaleString(DateTime.TIME_SIMPLE);
          const displayEndTime = localEndTime ? localEndTime.toLocaleString(DateTime.TIME_SIMPLE) : '';
          
          // Check if time is in the past
          const now = DateTime.now().setZone(selectedTimezone);
          const isPast = localStartTime < now;
          
          return {
            time: startTimeStr.split(' ')[0], // Keep original time as identifier
            display: displayStartTime, // Show converted start time
            isAvailable: !slot.disabled && !isPast,
            slot,
            startTime: displayStartTime,
            endTime: displayEndTime,
            originalZone: serverTimezone,
            localTime: displayStartTime
          };
        } catch (err) {
          console.warn('Error converting timezone for slot:', err);
          // Fallback to original format if conversion fails
          return {
            time: slot.startTime.split(' ')[0], // Extract HH:MM part
            display: slot.startTime,
            isAvailable: !slot.disabled,
            slot,
            startTime: slot.startTime,
            endTime: slot.endTime
          };
        }
      });
    }
    
    // Backwards compatibility for the old format
    // Ensure daySlots is always an array
    let daySlots = Array.isArray(availableSlots[dateString]) 
      ? availableSlots[dateString] 
      : [];
    
    // Format slots for the old format
    return daySlots.map(slot => {
      try {
        // Handle possible invalid date formats
        const startTimeString = slot.start || slot;
        const endTimeString = slot.end;
        
        // Create a Luxon DateTime object for start time
        const startDateTime = DateTime.fromFormat(
          `${dateString} ${startTimeString}`,
          'yyyy-MM-dd HH:mm',
          { zone: 'Europe/London' } // Assume server timezone
        );
        
        // Create a Luxon DateTime object for end time if available
        let endDateTime;
        if (endTimeString) {
          endDateTime = DateTime.fromFormat(
            `${dateString} ${endTimeString}`,
            'yyyy-MM-dd HH:mm',
            { zone: 'Europe/London' } // Assume server timezone
          );
        }
        
        if (!startDateTime.isValid) {
          throw new Error('Invalid datetime');
        }
        
        // Convert to the user's selected timezone
        const localStartTime = startDateTime.setZone(selectedTimezone);
        
        // Convert end time if available
        let localEndTime;
        if (endDateTime && endDateTime.isValid) {
          localEndTime = endDateTime.setZone(selectedTimezone);
        }
        
        // Format for display
        const displayStartTime = localStartTime.toLocaleString(DateTime.TIME_SIMPLE);
        const displayEndTime = localEndTime ? localEndTime.toLocaleString(DateTime.TIME_SIMPLE) : '';
        
        // Check if time is in the past
        const now = DateTime.now().setZone(selectedTimezone);
        const isPast = localStartTime < now;
        
        return {
          time: startTimeString,
          display: displayStartTime,
          isAvailable: !isPast,
          slot,
          startTime: displayStartTime,
          endTime: displayEndTime
        };
      } catch (err) {
        console.warn('Error parsing time slot:', err);
        // Return a default slot object if parsing fails
        return {
          time: '12:00',
          display: '12:00 AM',
          isAvailable: false,
          slot: {},
          startTime: '12:00 AM',
          endTime: ''
        };
      }
    });
  };
  
  // Format timezone for display
  const formatTimezone = (timezone) => {
    try {
      const parts = timezone.split('/');
      return parts[parts.length - 1].replace(/_/g, ' ');
    } catch (e) {
      return timezone;
    }
  };
  
  // Filter timezones based on search
  const filterTimezones = (query) => {
    if (!query.trim()) {
      setFilteredZones(timezones);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    
    // First try to search by country or city
    fetchTimezoneByLocation(lowerQuery)
      .then(locationBasedZones => {
        if (locationBasedZones && locationBasedZones.length > 0) {
          // Found location-based timezone results
          setFilteredZones(locationBasedZones);
        } else {
          // No location results, fall back to direct timezone filtering
          const filtered = timezones.filter(tz => 
            tz.toLowerCase().includes(lowerQuery) || 
            formatTimezone(tz).toLowerCase().includes(lowerQuery)
          );
          setFilteredZones(filtered);
        }
      })
      .catch(err => {
        console.error('Error in timezone search:', err);
        // Fallback to direct filtering
        const filtered = timezones.filter(tz => 
          tz.toLowerCase().includes(lowerQuery) || 
          formatTimezone(tz).toLowerCase().includes(lowerQuery)
        );
        setFilteredZones(filtered);
      });
  };
  
  // Search for timezones by location name (city or country)
  const fetchTimezoneByLocation = async (searchText) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=5`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'KarmicKeranApp/1.0'
          }
        }
      );
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        return [];
      }
      
      // Try to determine timezones for the found locations
      // Since Nominatim doesn't provide timezone directly,
      // we'll have to rely on known mappings or nearby timezones
      const possibleTimezones = [];
      
      // For each location, try to find a timezone that might be associated with it
      for (const location of data) {
        if (!location.lat || !location.lon) continue;
        
        // Try to find a timezone for this location
        const tzForLocation = await getTimezoneForCoordinates(location.lat, location.lon);
        if (tzForLocation && !possibleTimezones.includes(tzForLocation)) {
          possibleTimezones.push(tzForLocation);
        }
        
        // If we find no timezone but have a country code, try some common timezones for that country
        if (location.address && location.address.country_code && possibleTimezones.length === 0) {
          const countryCode = location.address.country_code.toUpperCase();
          const countryTimezones = getCommonTimezonesForCountry(countryCode);
          countryTimezones.forEach(tz => {
            if (!possibleTimezones.includes(tz)) {
              possibleTimezones.push(tz);
            }
          });
        }
      }
      
      return possibleTimezones.length > 0 ? possibleTimezones : [];
    } catch (error) {
      console.error('Error fetching timezone by location:', error);
      return [];
    }
  };
  
  // Get timezone for coordinates using the timezone API
  const getTimezoneForCoordinates = async (lat, lon) => {
    try {
      // Using a free timezone API
      const response = await fetch(
        `https://timezone.abstractapi.com/v1/current_time/?api_key=24a35adbd39b475b806b956b94baa202&location=${lat},${lon}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      return data && data.timezone && data.timezone.name ? data.timezone.name : null;
    } catch (error) {
      console.error('Error getting timezone for coordinates:', error);
      return null;
    }
  };
  
  // Get common timezones for a country code
  const getCommonTimezonesForCountry = (countryCode) => {
    // Basic mapping of common timezones by country code
    const countryTimezones = {
      'US': ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'],
      'GB': ['Europe/London'],
      'IN': ['Asia/Kolkata'],
      'AU': ['Australia/Sydney', 'Australia/Perth', 'Australia/Adelaide'],
      'CA': ['America/Toronto', 'America/Vancouver'],
      'DE': ['Europe/Berlin'],
      'FR': ['Europe/Paris'],
      // Add more countries as needed
    };
    
    return countryTimezones[countryCode] || [];
  };
  
  // Handle timezone search
  const handleTimezoneSearch = (query) => {
    setTimezoneSearchQuery(query);
    filterTimezones(query);
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedDate) {
      newErrors.date = 'Please select a date for your consultation';
    }
    
    if (!selectedTime) {
      newErrors.time = 'Please select a time for your consultation';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle final continue
  const handleContinue = () => {
    if (validateForm()) {
      onContinue();
    }
  };
  
  // Event handlers
  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString);
    setSelectedTime(null); // Reset time when date changes
  };
  
  const handleTimeSelect = (timeString) => {
    setSelectedTime(timeString);
  };
  
  const handleTimezoneSelect = (timezone) => {
    setSelectedTimezone(timezone);
    setShowTimezonePicker(false);
  };
  
  // Component renderers
  
  // Render the date selection horizontal list
  const renderDateSelector = () => {
    const dateOptions = getDateOptions();
    
    return (
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dateScrollView}
        contentContainerStyle={styles.dateScrollContent}
      >
        {dateOptions.map((item) => (
          <TouchableOpacity
            key={item.date}
            style={[
              styles.dateItem,
              selectedDate === item.date && styles.selectedDateItem
            ]}
            onPress={() => handleDateSelect(item.date)}
          >
            <Text style={[
              styles.weekdayText,
              selectedDate === item.date && styles.selectedDateText
            ]}>
              {item.weekday}
            </Text>
            <Text style={[
              styles.dayText,
              selectedDate === item.date && styles.selectedDateText
            ]}>
              {item.day}
            </Text>
            {item.isToday && (
              <View style={styles.todayIndicator}>
                <Text style={styles.todayText}>Today</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  // Render time slot grid
  const renderTimeSlots = () => {
    if (!selectedDate) {
      return (
        <View style={styles.emptyTimeSlotsMessage}>
          <Text style={styles.emptyText}>Please select a date to view available times</Text>
        </View>
      );
    }
    
    if (isLoadingSlots) {
      return (
        <View style={styles.emptyTimeSlotsMessage}>
          <ActivityIndicator size="large" color="#7765e3" />
          <Text style={styles.loadingText}>Loading available time slots...</Text>
        </View>
      );
    }
    
    const timeSlots = getTimeSlots(selectedDate);
    
    if (timeSlots.length === 0) {
      return (
        <View style={styles.emptyTimeSlotsMessage}>
          <Ionicons name="calendar-outline" size={40} color="#ccc" />
          <Text style={styles.noSlotsText}>No available slots on this date</Text>
          <Text style={styles.noSlotsSubText}>Please select another date</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.timeSlotsContainer}>
        <View style={styles.timeSlotsGrid}>
          {timeSlots.map((slot, index) => (
            <TouchableOpacity
              key={`${slot.time}-${index}`}
              style={[
                styles.timeSlot,
                selectedTime === slot.time && styles.selectedTimeSlot,
                !slot.isAvailable && styles.unavailableTimeSlot
              ]}
              onPress={() => slot.isAvailable && handleTimeSelect(slot.time)}
              disabled={!slot.isAvailable}
            >
              <Text style={[
                styles.timeSlotText,
                selectedTime === slot.time && styles.selectedTimeSlotText,
                !slot.isAvailable && styles.unavailableTimeSlotText
              ]}>
                {slot.display}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  // Add timezone to country code mapping function
  const getCountryCodeForTimezone = (timezone) => {
    // This is a simplified mapping - more comprehensive mappings can be implemented
    const timezoneToCountry = {
      // Asia
      'Asia/Kolkata': 'IN',
      'Asia/Singapore': 'SG',
      'Asia/Tokyo': 'JP',
      'Asia/Dubai': 'AE',
      'Asia/Bangkok': 'TH',
      'Asia/Seoul': 'KR',
      'Asia/Shanghai': 'CN',
      
      // Europe
      'Europe/London': 'GB',
      'Europe/Paris': 'FR',
      'Europe/Berlin': 'DE',
      'Europe/Moscow': 'RU',
      'Europe/Amsterdam': 'NL',
      'Europe/Istanbul': 'TR',
      'Europe/Madrid': 'ES',
      'Europe/Rome': 'IT',
      
      // Americas
      'America/New_York': 'US',
      'America/Los_Angeles': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'America/Toronto': 'CA',
      'America/Sao_Paulo': 'BR',
      
      // Australia and Pacific
      'Australia/Sydney': 'AU',
      'Australia/Melbourne': 'AU',
      'Australia/Perth': 'AU',
      'Pacific/Auckland': 'NZ',
      'Pacific/Honolulu': 'US',
      
      // Africa
      'Africa/Cairo': 'EG',
      'Africa/Johannesburg': 'ZA',
      'Africa/Lagos': 'NG',
      'Africa/Nairobi': 'KE'
    };
    
    return timezoneToCountry[timezone] || 'GB'; // Default to GB if timezone not found
  };
  
  // Update the renderTimezoneSelector function to include country flags
  const renderTimezoneSelector = () => {
    // List of common timezones with labels directly in the selector function
    const commonTimezones = [
      { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
      { value: "Europe/London", label: "Europe/London (GMT/BST)" },
      { value: "America/New_York", label: "New York (EST/EDT)" },
      { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)" },
      { value: "Asia/Singapore", label: "Singapore" },
      { value: "Asia/Tokyo", label: "Tokyo" },
      { value: "Asia/Dubai", label: "Dubai" },
      { value: "Australia/Sydney", label: "Sydney" },
      { value: "Europe/Paris", label: "Paris (CET/CEST)" },
      { value: "Europe/Berlin", label: "Berlin" },
      { value: "Europe/Moscow", label: "Moscow" },
      { value: "Africa/Cairo", label: "Cairo" },
      { value: "Asia/Bangkok", label: "Bangkok" },
      { value: "Asia/Seoul", label: "Seoul" },
      { value: "Asia/Shanghai", label: "Shanghai" },
      { value: "America/Chicago", label: "Chicago" },
      { value: "America/Denver", label: "Denver" },
      { value: "America/Sao_Paulo", label: "São Paulo" },
      { value: "America/Toronto", label: "Toronto" },
      { value: "Pacific/Auckland", label: "Auckland" },
      { value: "Pacific/Honolulu", label: "Honolulu" }
    ];

    // Filter timezones based on search
    const filteredTimezones = timezoneSearchQuery
      ? commonTimezones.filter(tz => 
          tz.label.toLowerCase().includes(timezoneSearchQuery.toLowerCase()) ||
          tz.value.toLowerCase().includes(timezoneSearchQuery.toLowerCase()))
      : commonTimezones;

    // Find the current timezone label and country code
    const currentTz = commonTimezones.find(tz => tz.value === selectedTimezone);
    const currentLabel = currentTz ? currentTz.label : selectedTimezone;
    const currentCountryCode = getCountryCodeForTimezone(selectedTimezone);
    
    // Get the current time in the selected timezone using Luxon
    const currentTimeInTimezone = DateTime.now().setZone(selectedTimezone).toLocaleString(DateTime.TIME_WITH_SECONDS);
    
    return (
      <View style={styles.timezoneContainer}>
        <Text style={styles.sectionTitle}>Your Timezone</Text>
        <Text style={styles.timezoneDescription}>
          Select your timezone for scheduling the consultation
        </Text>
        
        <TouchableOpacity
          style={styles.timezoneSelector}
          onPress={() => setShowTimezonePicker(true)}
        >
          <View style={styles.timezoneSelectorContent}>
            <View style={styles.flagContainer}>
              <CountryFlag isoCode={currentCountryCode} size={16} />
            </View>
            <View style={styles.timezoneTextContainer}>
              <Text style={styles.timezoneText}>{currentLabel}</Text>
              <Text style={styles.timezoneLocalTime}>Current time: {currentTimeInTimezone}</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#555" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.timezoneNote}>
          Consultation times will be shown in your local timezone
        </Text>
        
        {/* Timezone dropdown with search and scrolling */}
        {showTimezonePicker && (
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownList}>
              {/* Search box */}
              <View style={styles.dropdownSearchBox}>
                <Ionicons name="search" size={18} color="#666" />
                <TextInput
                  style={styles.dropdownSearchInput}
                  placeholder="Search timezone..."
                  value={timezoneSearchQuery}
                  onChangeText={handleTimezoneSearch}
                  placeholderTextColor="#999"
                />
                {timezoneSearchQuery ? (
                  <TouchableOpacity onPress={() => {
                    setTimezoneSearchQuery('');
                    setFilteredZones(timezones); // Reset filtered zones when clearing search
                  }}>
                    <Ionicons name="close-circle" size={18} color="#666" />
                  </TouchableOpacity>
                ) : null}
              </View>
              
              {/* Scrollable timezone list */}
              <View style={styles.dropdownScrollContainer}>
                <ScrollView 
                  style={styles.dropdownScroll}
                  contentContainerStyle={styles.dropdownScrollContent}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  alwaysBounceVertical={false}
                >
                  {filteredZones.length > 0 ? (
                    filteredZones.map((tz) => (
                      <TouchableOpacity
                        key={tz}
                        style={[
                          styles.dropdownItem,
                          selectedTimezone === tz && styles.dropdownItemSelected
                        ]}
                        onPress={() => handleTimezoneSelect(tz)}
                      >
                        <View style={styles.dropdownItemContent}>
                          <View style={styles.dropdownItemRow}>
                            <CountryFlag isoCode={getCountryCodeForTimezone(tz)} size={18} style={styles.flagIcon} />
                            <Text style={[
                              styles.dropdownItemText,
                              selectedTimezone === tz && styles.dropdownItemTextSelected
                            ]}>
                              {formatTimezone(tz)}
                            </Text>
                          </View>
                          <Text style={styles.dropdownItemSubtext}>
                            {getTimeInTimezone(tz)}
                          </Text>
                        </View>
                        {selectedTimezone === tz && (
                          <Ionicons name="checkmark" size={18} color="#FF4D00" />
                        )}
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.noResultsContainer}>
                      <Text style={styles.noResultsText}>No timezones found</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
              
              {/* Close button */}
              <TouchableOpacity 
                style={styles.dropdownCloseButton}
                onPress={() => {
                  setShowTimezonePicker(false);
                  setTimezoneSearchQuery('');
                }}
              >
                <Text style={styles.dropdownCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };
  
  // Get current time in a specific timezone
  const getTimeInTimezone = (timezone) => {
    try {
      // Use Luxon to get the current time in the specified timezone
      return DateTime.now().setZone(timezone).toLocaleString(DateTime.TIME_SIMPLE);
    } catch (err) {
      console.error('Error formatting time with timezone:', err);
      return DateTime.now().toLocaleString(DateTime.TIME_SIMPLE);
    }
  };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Select Time Slot</Text>
          <Text style={styles.subtitle}>
            Select a time slot that works best for you.
          </Text>
        </View>
        
        {/* Timezone selection */}
        <View style={styles.formSection}>
          <Text style={styles.fieldLabel}>Select Your Local Timezone</Text>
          <TouchableOpacity
            style={styles.timezoneButton}
            onPress={() => setShowTimezonePicker(true)}
          >
            <View style={styles.timezoneSelectorContent}>
              <View style={styles.flagAndCountry}>
                <CountryFlag isoCode={getCountryCodeForTimezone(selectedTimezone)} size={20} style={styles.flagIcon} />
                <Text style={styles.countryText}>
                  {getCountryCodeForTimezone(selectedTimezone) === 'US' ? 'USA' : getCountryCodeForTimezone(selectedTimezone)}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#555" />
            </View>
          </TouchableOpacity>

          {/* Timezone dropdown with search and scrolling */}
          {showTimezonePicker && (
            <View style={styles.dropdownContainer}>
              <View style={styles.dropdownList}>
                {/* Search box */}
                <View style={styles.dropdownSearchBox}>
                  <Ionicons name="search" size={18} color="#666" />
                  <TextInput
                    style={styles.dropdownSearchInput}
                    placeholder="Search timezone..."
                    value={timezoneSearchQuery}
                    onChangeText={handleTimezoneSearch}
                    placeholderTextColor="#999"
                  />
                  {timezoneSearchQuery ? (
                    <TouchableOpacity onPress={() => {
                      setTimezoneSearchQuery('');
                      setFilteredZones(timezones); // Reset filtered zones when clearing search
                    }}>
                      <Ionicons name="close-circle" size={18} color="#666" />
                    </TouchableOpacity>
                  ) : null}
                </View>
                
                {/* Scrollable timezone list */}
                <View style={styles.dropdownScrollContainer}>
                  <ScrollView 
                    style={styles.dropdownScroll}
                    contentContainerStyle={styles.dropdownScrollContent}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                    alwaysBounceVertical={false}
                  >
                    {filteredZones.length > 0 ? (
                      filteredZones.map((tz) => (
                        <TouchableOpacity
                          key={tz}
                          style={[
                            styles.dropdownItem,
                            selectedTimezone === tz && styles.dropdownItemSelected
                          ]}
                          onPress={() => handleTimezoneSelect(tz)}
                        >
                          <View style={styles.dropdownItemContent}>
                            <View style={styles.dropdownItemRow}>
                              <CountryFlag isoCode={getCountryCodeForTimezone(tz)} size={18} style={styles.flagIcon} />
                              <Text style={[
                                styles.dropdownItemText,
                                selectedTimezone === tz && styles.dropdownItemTextSelected
                              ]}>
                                {formatTimezone(tz)}
                              </Text>
                            </View>
                            <Text style={styles.dropdownItemSubtext}>
                              {getTimeInTimezone(tz)}
                            </Text>
                          </View>
                          {selectedTimezone === tz && (
                            <Ionicons name="checkmark" size={18} color="#FF4D00" />
                          )}
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.noResultsContainer}>
                        <Text style={styles.noResultsText}>No timezones found</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
                
                {/* Close button */}
                <TouchableOpacity 
                  style={styles.dropdownCloseButton}
                  onPress={() => {
                    setShowTimezonePicker(false);
                    setTimezoneSearchQuery('');
                  }}
                >
                  <Text style={styles.dropdownCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        
        {/* Date selection */}
        <View style={styles.formSection}>
          <Text style={styles.fieldLabel}>Choose Date & Time</Text>
          <TouchableOpacity style={styles.datePickerButton}>
            <Ionicons name="calendar" size={18} color="#555" style={styles.calendarIcon} />
            <Text style={styles.dateText}>
              {selectedDate ? formatDateDisplay(selectedDate) : 'Select a date'}
            </Text>
          </TouchableOpacity>
          {renderDateSelector()}
          {errors.date && (
            <Text style={styles.errorText}>{errors.date}</Text>
          )}
        </View>
        
        {/* Time selection */}
        <View style={styles.formSection}>
          <Text style={styles.fieldLabel}>
            Available slots
            {selectedDate ? ` for ${formatDateDisplay(selectedDate)}` : ''}
          </Text>
          {isLoadingSlots ? (
            <View style={styles.emptyTimeSlotsMessage}>
              <ActivityIndicator size="large" color="#FF4D00" />
              <Text style={styles.loadingText}>Loading available time slots...</Text>
            </View>
          ) : !selectedDate ? (
            <View style={styles.emptyTimeSlotsMessage}>
              <Text style={styles.emptyText}>Please select a date to view available times</Text>
            </View>
          ) : (
            <View style={styles.timeSlotGrid}>
              {getTimeSlots(selectedDate).length > 0 ? (
                getTimeSlots(selectedDate).map((slot, index) => (
                  <TouchableOpacity
                    key={`${slot.time}-${index}`}
                    style={[
                      styles.modernTimeSlot,
                      selectedTime === slot.time && styles.selectedModernTimeSlot,
                      !slot.isAvailable && styles.unavailableModernTimeSlot
                    ]}
                    onPress={() => slot.isAvailable && handleTimeSelect(slot.time)}
                    disabled={!slot.isAvailable}
                  >
                    <View style={styles.slotContent}>
                      <Text style={[
                        styles.slotTimeText,
                        selectedTime === slot.time && styles.selectedSlotTimeText,
                        !slot.isAvailable && styles.unavailableSlotTimeText
                      ]}>
                        {slot.display} - {slot.endTime || 'End time'}
                      </Text>
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{serviceDuration} minutes</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noSlotsContainer}>
                  <Ionicons name="calendar-outline" size={40} color="#ccc" />
                  <Text style={styles.noSlotsText}>No available slots on this date</Text>
                  <Text style={styles.noSlotsSubText}>Please select another date</Text>
                </View>
              )}
            </View>
          )}
          {errors.time && (
            <Text style={styles.errorText}>{errors.time}</Text>
          )}
        </View>
      </ScrollView>
      
      {/* Action buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.previousButton}
          onPress={onBack}
        >
          <Text style={styles.previousButtonText}>Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.submitButton,
            (!selectedDate || !selectedTime) && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedDate || !selectedTime}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  formSection: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    height: 48,
    marginBottom: 16,
  },
  calendarIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  timezoneButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    height: 48,
    marginBottom: 16,
  },
  timezoneSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flagAndCountry: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagIcon: {
    marginRight: 8,
  },
  countryText: {
    fontSize: 14,
    color: '#333',
  },
  dateScrollView: {
    marginBottom: 16,
  },
  dateScrollContent: {
    paddingRight: 20,
  },
  dateItem: {
    width: 70,
    height: 80,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedDateItem: {
    backgroundColor: '#FF4D00',
    borderColor: '#FF4D00',
  },
  weekdayText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dayText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedDateText: {
    color: '#fff',
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 6,
    backgroundColor: '#666',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  todayText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timeSlotGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modernTimeSlot: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  selectedModernTimeSlot: {
    borderColor: '#FF4D00',
    backgroundColor: 'rgba(255, 77, 0, 0.05)',
  },
  unavailableModernTimeSlot: {
    opacity: 0.5,
  },
  slotContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  slotTimeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  selectedSlotTimeText: {
    color: '#FF4D00',
  },
  unavailableSlotTimeText: {
    color: '#999',
  },
  durationBadge: {
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 100,
  },
  durationText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  emptyTimeSlotsMessage: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginTop: 16,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  noSlotsContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
  },
  noSlotsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 8,
  },
  noSlotsSubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    height: 64,
  },
  previousButton: {
    width: 96,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  previousButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  submitButton: {
    width: 96,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#FF4D00',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 77, 0, 0.5)',
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 999,
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 350,
    zIndex: 999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  dropdownSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  dropdownSearchInput: {
    flex: 1,
    height: 36,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    marginRight: 8,
  },
  dropdownScrollContainer: {
    height: 250,
    overflow: 'hidden',
  },
  dropdownScroll: {
    flex: 1,
  },
  dropdownScrollContent: {
    paddingBottom: 8,
  },
  noResultsContainer: {
    padding: 15,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#666',
    fontSize: 14,
  },
  dropdownCloseButton: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  dropdownCloseButtonText: {
    color: '#FF4D00',
    fontWeight: '600',
    fontSize: 14,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemContent: {
    flex: 1,
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(255, 77, 0, 0.05)',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: '#FF4D00',
    fontWeight: 'bold',
  },
  dropdownItemSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  dropdownItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SchedulePicker; 