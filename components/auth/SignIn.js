import React, { useState } from 'react';
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
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SignIn = ({ onSubmit, onLogin, loading, onSocialLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [useOtpForLogin, setUseOtpForLogin] = useState(false);

  // Colors that match the button gradient
  const primaryColor = '#e33100';
  const secondaryColor = '#f8a109';

  const validateEmail = (text) => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleSendOTP = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    
    // Either check email or attempt login based on current view state
    if (!showPasswordField) {
      const result = await onSubmit(email);
      
      // Show password field if user is registered
      if (result && result.isRegistered) {
        setShowPasswordField(true);
        setIsRegistered(true);
      }
      // If user isn't registered, the screen component handles OTP flow
    } else {
      if (useOtpForLogin) {
        // If user chose to login with OTP instead of password
        await onSubmit(email, true); // Pass true to indicate OTP login for existing user
      } else {
        // For registered user, attempt login with password
        if (!password.trim()) {
          setError('Please enter your password');
          return;
        }
        
        onLogin(email, password);
      }
    }
  };

  const openLink = (url) => {
    Linking.openURL(url).catch(err => console.error('An error occurred', err));
  };
  
  const handleSocialLogin = (provider) => {
    if (onSocialLogin) {
      onSocialLogin(provider);
    } else {
      console.log(`Login with ${provider}`);
    }
  };

  const toggleLoginMethod = () => {
    setUseOtpForLogin(!useOtpForLogin);
    setPassword('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
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
              <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Sign In</Text>
                <Text style={styles.headerSubtitle}>
                  {showPasswordField 
                    ? useOtpForLogin
                      ? 'An OTP will be sent to your email'
                      : 'Enter your password to continue' 
                    : 'Enter your email address to continue'}
                </Text>
              </View>
              
              <View style={styles.inputContainer}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="mail-outline" size={22} color={primaryColor} />
                </View>
                <TextInput
                  style={[styles.input, error && email.length === 0 && styles.inputError]}
                  placeholder="Email Address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError('');
                  }}
                  editable={!showPasswordField} // Disable email field when showing password
                  placeholderTextColor="#999"
                />
              </View>
              
              {showPasswordField && !useOtpForLogin && (
                <View style={[styles.inputContainer, { marginTop: 12 }]}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="lock-closed-outline" size={22} color={primaryColor} />
                  </View>
                  <TextInput
                    style={[styles.input, error && password.length === 0 && styles.inputError]}
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (error) setError('');
                    }}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    style={styles.visibilityToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={22}
                      color={primaryColor}
                    />
                  </TouchableOpacity>
                </View>
              )}
              
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                <Text style={styles.helperText}>
                  {showPasswordField
                    ? useOtpForLogin
                      ? "We'll send you a one-time verification code to log in"
                      : 'Enter the password for your account'
                    : "We'll send you a one-time verification code"}
                </Text>
              )}

              <TouchableOpacity
                disabled={((!email.trim() || (showPasswordField && !useOtpForLogin && !password.trim())) || loading)}
                onPress={handleSendOTP}
                style={styles.buttonContainer}
              >
                <LinearGradient
                  colors={[((!email.trim() || (showPasswordField && !useOtpForLogin && !password.trim())) || loading) ? '#cccccc' : primaryColor, ((!email.trim() || (showPasswordField && !useOtpForLogin && !password.trim())) || loading) ? '#cccccc' : secondaryColor]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {showPasswordField 
                        ? useOtpForLogin 
                          ? 'Send OTP' 
                          : 'Submit' 
                        : 'Continue with Email'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              
              {!showPasswordField && (
                <>
                  <View style={styles.orDivider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.orText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>
                
                  {/* Social Login Buttons */}
                  <TouchableOpacity 
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('google')}
                  >
                    <View style={styles.socialButtonContent}>
                      <Image 
                        source={require('../../assets/images/google.png')} 
                        style={styles.socialIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.socialButtonText}>Continue with Google</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('meta')}
                  >
                    <View style={styles.socialButtonContent}>
                      <Image 
                        source={require('../../assets/images/meta.png')} 
                        style={styles.socialIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.socialButtonText}>Continue with Meta</Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}

              {showPasswordField && (
                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={toggleLoginMethod}
                >
                  <Text style={[styles.forgotPasswordText, { color: primaryColor }]}>
                    {useOtpForLogin ? 'Sign In with Password' : 'Sign In with OTP'}
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By continuing, you agree to our{' '}
                  <Text 
                    style={[styles.termsLink, { color: primaryColor, textDecorationLine: 'underline' }]}
                    onPress={() => openLink('https://karmickeran.com/terms-and-conditions')}
                  >
                    Terms of Service
                  </Text> and{' '}
                  <Text 
                    style={[styles.termsLink, { color: primaryColor, textDecorationLine: 'underline' }]}
                    onPress={() => openLink('https://karmickeran.com/privacy-policy')}
                  >
                    Privacy Policy
                  </Text>
                </Text>
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
    backgroundColor: '#fff'
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
    marginTop: height * 0.05,
    marginBottom: 30
  },
  logo: {
    width: 180,
    height: 120,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContainer: {
    marginBottom: 25
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
  },
  iconWrapper: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
    height: '100%',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#f44336',
  },
  visibilityToggle: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center'
  },
  helperText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 24
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginBottom: 24
  },
  buttonContainer: {
    marginTop: 10,
  },
  gradientButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  orText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
  socialButton: {
    height: 50,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 15,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500'
  },
  termsContainer: {
    marginTop: 24,
    alignItems: 'center'
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20
  },
  termsLink: {
    fontWeight: '500'
  }
});

export default SignIn; 