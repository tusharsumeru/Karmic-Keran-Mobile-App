import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const StepNavigation = ({ currentStep, totalSteps, onNext, onPrevious, isNextDisabled }) => {
  // Calculate progress for each step
  const getProgressWidth = (stepNumber) => {
    if (stepNumber < currentStep) {
      return '100%'; // Completed step
    } else if (stepNumber === currentStep) {
      return '100%'; // Current step
    } else {
      return '0%'; // Future step
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Progress Indicators */}
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View key={index} style={styles.progressStep}>
            <View style={styles.progressBg}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: getProgressWidth(index + 1) }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>

      {/* Fixed Bottom Navigation */}
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.backButton, 
              currentStep === 1 && styles.hiddenButton
            ]} 
            onPress={onPrevious}
            disabled={currentStep === 1}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.nextButton, isNextDisabled && styles.disabledButton]} 
            onPress={onNext}
            disabled={isNextDisabled}
            activeOpacity={0.7}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === totalSteps ? 'Finish' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%'
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    maxWidth: 300,
    alignSelf: 'flex-end',
  },
  progressStep: {
    flex: 1,
    marginHorizontal: 4,
  },
  progressBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF7A00',
    borderRadius: 4,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  backButton: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  hiddenButton: {
    opacity: 0,
  },
  backButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  nextButton: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#FF7A00',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
    opacity: 0.5,
  },
});

export default StepNavigation; 