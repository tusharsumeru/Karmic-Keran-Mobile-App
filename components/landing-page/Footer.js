import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Footer() {
  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      
      <View style={styles.topSection}>
        <View style={styles.logoSection}>
          <Text style={styles.logoText}>Karmic Keran</Text>
          <Text style={styles.tagline}>Discover your spiritual path</Text>
        </View>
        
        <View style={styles.linksContainer}>
          <View style={styles.linkColumn}>
            <Text style={styles.linkHeader}>Services</Text>
            <TouchableOpacity><Text style={styles.linkItem}>AI Astrology</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.linkItem}>Consultations</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.linkItem}>Self-Discovery</Text></TouchableOpacity>
          </View>
          
          <View style={styles.linkColumn}>
            <Text style={styles.linkHeader}>Company</Text>
            <TouchableOpacity><Text style={styles.linkItem}>About Us</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.linkItem}>Our Experts</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.linkItem}>Contact</Text></TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.socialSection}>
        <Text style={styles.socialText}>Follow us on</Text>
        <View style={styles.socialIcons}>
          <TouchableOpacity style={styles.socialIcon}>
            <Ionicons name="logo-facebook" size={20} color="#7765e3" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon}>
            <Ionicons name="logo-instagram" size={20} color="#7765e3" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon}>
            <Ionicons name="logo-twitter" size={20} color="#7765e3" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.bottomSection}>
        <Text style={styles.copyright}>© 2025 Karmic Keran. All rights reserved.</Text>
        <View style={styles.legalLinks}>
          <TouchableOpacity><Text style={styles.legalLink}>Privacy Policy</Text></TouchableOpacity>
          <View style={styles.legalDivider} />
          <TouchableOpacity><Text style={styles.legalLink}>Terms of Service</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 30,
  },
  topSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  logoSection: {
    marginBottom: 24,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
  },
  linksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: width > 600 ? '60%' : '100%',
  },
  linkColumn: {
    marginBottom: 24,
    minWidth: 120,
  },
  linkHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  linkItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  socialSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  socialText: {
    fontSize: 14,
    color: '#666',
    marginRight: 16,
  },
  socialIcons: {
    flexDirection: 'row',
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(119, 101, 227, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyright: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legalLink: {
    fontSize: 12,
    color: '#666',
  },
  legalDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#ccc',
    marginHorizontal: 8,
  },
}); 