import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import LogoImage from '../../assets/images/kk-logo.png';
import AstrologerImage from '../../assets/images/hero.png';


export default function HomeScreen() {
  const [showTopBar, setShowTopBar] = useState(false);

  const navigateTo = (screen) => {
    router.push(screen);
  };

  const handleScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    setShowTopBar(y > 40); // Show top bar after scrolling 40px
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      {showTopBar && (
        <View style={styles.topBar}>
          <Image source={LogoImage} style={styles.topBarLogo} resizeMode="contain" />
          <TouchableOpacity>
            <Ionicons name="menu" size={28} color="#333" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 70 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image
            source={LogoImage}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Astrologer Card Section */}
        <View style={styles.cardContainer}>
          <Image
            source={AstrologerImage}
            style={styles.cardImage}
            resizeMode="cover"
          />
        </View>

        {/* Tagline */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quote}>
            You don't say a word, I'll tell you about yourself and the future
          </Text>
          <Text style={styles.quoteSub}>
            I know you better than you do.
          </Text>
          <View style={styles.textDivider}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDot} />
            <View style={styles.dividerLine} />
          </View>
        </View>

        {/* Description */}
        {/* <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            I combine both Vedic and Western Astrology to present practical predictions that help you
            understand yourself and find solutions to your problems.
          </Text>
        </View> */}

        {/* Quick Actions Section (no title, no Self Discovery) */}
        <View style={styles.actionColumn}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => router.push('book-consultation')}
          >
            <Text style={styles.primaryButtonText}>Book Consultation</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() => router.push('ask-question')}
          >
            <Text style={styles.secondaryButtonText}>Ask a Question</Text>
            <Ionicons name="arrow-forward" size={18} color="#f87400" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          {/* Space after buttons */}
          <View style={{ height: 32 }} />

          {/* Divider */}
          <View style={styles.footerDivider} />

          {/* Footer Text */}
          <Text style={styles.footerText}>developed by sumeru digital</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollView: { paddingHorizontal: 20 },

  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 35,
    marginBottom: 10,
  },
  logoImage: {
    width: 110,
    height: 110,
    marginBottom: 10,
  },
  cardContainer: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardImage: {
    width: '100%',
    height: 300,
    borderRadius: 14,
  },
  cardOverlay: {
    position: 'absolute',
    padding: 15,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.9,
  },
  cardHeadline: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
  },
  cardNote: {
    color: '#fff',
    fontSize: 12,
    marginTop: 10,
    fontStyle: 'italic',
  },
  cardCTA: {
    alignSelf: 'flex-start',
    color: '#fff',
    fontSize: 14,
    backgroundColor: '#00000050',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  quoteContainer: {
    marginTop: 15,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  quote: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  quoteSub: {
    fontSize: 14,
    marginTop: 6,
    color: '#666',
    textAlign: 'center',
  },

  descriptionContainer: {
    marginTop: 18,
    paddingHorizontal: 5,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: '#444',
  },

  sectionSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
    color: '#333',
  },
  actionColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f87400',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 28,
    marginBottom: 10,
    shadowColor: '#f87400',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderWidth: 1.5,
    borderColor: '#f87400',
    shadowColor: '#f87400',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  secondaryButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footerDivider: {
    width: '60%',
    height: 1.5,
    backgroundColor: '#eee',
    marginVertical: 18,
    borderRadius: 1,
  },
  footerText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  textDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    height: 2.5,
    width: 32,
    backgroundColor: '#FFB347',
    borderRadius: 2,
  },
  dividerDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFB347',
    marginHorizontal: 8,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: '#fff',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 25,
  },
  topBarLogo: {
    width: 58,
    height: 58,
  },
});
