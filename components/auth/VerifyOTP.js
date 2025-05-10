import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const OTP_LENGTH = 6;

const VerifyOTP = ({ email, onVerify, onResend, loading, onSelectUserType, isExistingUser = false }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value.length === 1 && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1].focus();
    }
    
    // Clear error if any
    if (error) setError('');
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace to move to previous input
    if (e.nativeEvent.key === 'Backspace' && index > 0 && !otp[index]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH) {
      setError('Please enter a valid OTP');
      return;
    }

    try {
      const result = await onVerify(email, otpString);
      
      if (result?.status !== 200) {
        setError(result?.message || 'Invalid OTP. Please try again.');
      }
      // No longer need to set any verified state - navigation happens in parent
    } catch (err) {
      setError('Verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await onResend(email);
      setTimer(30);
      setOtp(['', '', '', '', '', '']);
      setError('');
      // Focus first input after resend
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          style={styles.scrollContainer} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.innerContainer}>
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/images/kk-logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.cardContainer}>
              <View style={styles.formSubheader}>
                <Text style={styles.verifyTitle}>
                  {isExistingUser ? 'Login with OTP' : 'Verify Your Email'}
                </Text>
                <Text style={styles.instructionText}>
                  {isExistingUser 
                    ? 'Enter the 6-digit code sent to your email to login' 
                    : 'Enter the 6-digit code sent to'}{'\n'}
                  <Text style={styles.emailText}>{email}</Text>
                </Text>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={ref => (inputRefs.current[index] = ref)}
                      style={[
                        styles.otpInput,
                        digit && styles.otpInputFilled,
                        error && styles.otpInputError
                      ]}
                      value={digit}
                      onChangeText={value => handleOtpChange(value, index)}
                      onKeyPress={e => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectionColor="#FF7A00"
                    />
                  ))}
                </View>
                
                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : (
                  <Text style={styles.helperText}>
                    Didn't receive code?{' '}
                    {timer > 0 ? (
                      <Text style={styles.timerText}>Resend in {timer}s</Text>
                    ) : (
                      <Text 
                        style={resending ? styles.timerText : styles.resendText} 
                        onPress={!resending ? handleResend : null}
                      >
                        {resending ? 'Sending...' : 'Resend'}
                      </Text>
                    )}
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.buttonContainer}
                  onPress={handleVerify}
                  disabled={otp.some(digit => !digit) || loading}
                >
                  <LinearGradient
                    colors={[otp.some(digit => !digit) || loading ? '#cccccc' : '#FF7A00', otp.some(digit => !digit) || loading ? '#cccccc' : '#FFA149']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>
                        {isExistingUser ? 'Login' : 'Verify Email'}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 20
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.08,
    marginBottom: 40,
    height: 80
  },
  logo: {
    width: width * 0.6,
    height: '100%'
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)'
  },
  formSubheader: {
    alignItems: 'center',
    marginBottom: 32
  },
  verifyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center'
  },
  instructionText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22
  },
  emailText: {
    fontWeight: '600',
    color: '#FF7A00'
  },
  formContainer: {
    marginBottom: 10
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  otpInput: {
    width: width * 0.12,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1A1A1A',
    borderWidth: 1.5,
    borderColor: '#E5E7EB'
  },
  otpInputFilled: {
    borderColor: '#FF7A00',
    backgroundColor: 'rgba(255, 122, 0, 0.05)'
  },
  otpInputError: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255, 59, 48, 0.05)'
  },
  helperText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32
  },
  timerText: {
    color: '#999'
  },
  resendText: {
    color: '#FF7A00',
    fontWeight: '600'
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32
  },
  buttonContainer: {
    marginTop: 8,
  },
  gradientButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  accountTypeHeader: {
    alignItems: 'center',
    marginBottom: 32
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  accountOptions: {
    width: '100%',
    gap: 16
  },
  accountOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  accountContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  accountTextContainer: {
    flex: 1,
    marginLeft: 16
  },
  accountIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userIcon: {
    backgroundColor: '#FF7A00'
  },
  adminIcon: {
    backgroundColor: '#4169E1'
  },
  accountTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4
  },
  accountDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  }
});

export default VerifyOTP; 