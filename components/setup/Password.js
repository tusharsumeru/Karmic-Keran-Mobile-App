import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Primary colors matching other components
const primaryColor = '#FF7A00';
const secondaryColor = '#FFA149';

const Password = ({ userData, setUserData, errors }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create Password</Text>
          <Text style={styles.subtitle}>Secure your account with a strong password</Text>
        </View>
        
        <View style={styles.cardContainer}>
          <View style={styles.inputContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="lock-closed-outline" size={22} color={primaryColor} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={userData.password}
              onChangeText={(text) => setUserData({ ...userData, password: text })}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color={primaryColor} 
              />
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          
          <View style={styles.inputContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="lock-closed-outline" size={22} color={primaryColor} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry={!showConfirmPassword}
              value={userData.confirmPassword}
              onChangeText={(text) => setUserData({ ...userData, confirmPassword: text })}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons 
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color={primaryColor} 
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
          
          <View style={styles.passwordStrength}>
            <Text style={styles.strengthText}>Password Strength:</Text>
            <View style={styles.strengthBar}>
              <View 
                style={[
                  styles.strengthFill, 
                  { 
                    width: `${getPasswordStrength(userData.password) * 25}%`,
                    backgroundColor: getStrengthColor(userData.password)
                  }
                ]} 
              />
            </View>
            <Text style={styles.strengthLabel}>{getStrengthLabel(userData.password)}</Text>
          </View>
          
          <Text style={styles.passwordTips}>
            Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.
          </Text>
        </View>
      </View>
    </View>
  );
};

// Helper functions for password strength
const getPasswordStrength = (password) => {
  if (!password) return 0;
  
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength += 1;
  
  // Contains lowercase letters
  if (/[a-z]/.test(password)) strength += 1;
  
  // Contains uppercase letters
  if (/[A-Z]/.test(password)) strength += 1;
  
  // Contains numbers
  if (/[0-9]/.test(password)) strength += 1;
  
  return strength;
};

const getStrengthColor = (password) => {
  const strength = getPasswordStrength(password);
  
  if (strength === 0) return '#cccccc';
  if (strength === 1) return '#FF3B30'; // Red - matching error color
  if (strength === 2) return '#FF9500'; // Orange
  if (strength === 3) return '#FFCC00'; // Yellow
  return '#34C759'; // Green
};

const getStrengthLabel = (password) => {
  const strength = getPasswordStrength(password);
  
  if (strength === 0) return 'None';
  if (strength === 1) return 'Weak';
  if (strength === 2) return 'Fair';
  if (strength === 3) return 'Good';
  return 'Strong';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    // Offset for bottom navigation bar to ensure true center
    marginBottom: 60, 
  },
  headerContainer: {
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 15,
    color: '#999',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 16,
    height: 56,
    backgroundColor: '#fff',
  },
  iconWrapper: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    height: '100%',
    marginLeft: -15,
    marginRight: 15,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 16,
    marginLeft: 5,
  },
  passwordStrength: {
    marginTop: 10,
  },
  strengthText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  strengthBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 4,
  },
  strengthLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  passwordTips: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    lineHeight: 18,
  },
});

export default Password; 