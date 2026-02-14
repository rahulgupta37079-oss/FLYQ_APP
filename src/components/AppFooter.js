import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';

const AppFooter = ({ compact = false }) => {
  const currentYear = 2026;

  const handleCall = () => {
    Linking.openURL('tel:+919137361474').catch(() => 
      Alert.alert('Error', 'Could not open phone dialer')
    );
  };

  const handleEmail = () => {
    Linking.openURL('mailto:info@passion3dworld.com').catch(() => 
      Alert.alert('Error', 'Could not open email client')
    );
  };

  const handleWebsite = () => {
    Linking.openURL('https://passion3dworld.com').catch(() => 
      Alert.alert('Error', 'Could not open website')
    );
  };

  if (compact) {
    return (
      <View style={styles.footerCompact}>
        <Text style={styles.copyrightCompact}>
          © {currentYear} FLYQ - Passion 3D World
        </Text>
        <View style={styles.contactRowCompact}>
          <TouchableOpacity onPress={handleCall} activeOpacity={0.7}>
            <Text style={styles.contactLinkCompact}>📞 Support</Text>
          </TouchableOpacity>
          <Text style={styles.separator}>•</Text>
          <TouchableOpacity onPress={handleEmail} activeOpacity={0.7}>
            <Text style={styles.contactLinkCompact}>📧 Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.footer}>
      {/* Company Info */}
      <View style={styles.footerSection}>
        <Text style={styles.footerTitle}>FLYQ Drone Controller</Text>
        <Text style={styles.footerSubtitle}>by Passion 3D World</Text>
        <Text style={styles.copyrightText}>© {currentYear} All Rights Reserved</Text>
      </View>

      {/* Contact Information */}
      <View style={styles.footerSection}>
        <Text style={styles.sectionTitle}>Contact & Support</Text>
        
        <TouchableOpacity 
          style={styles.contactItem}
          onPress={handleCall}
          activeOpacity={0.7}
        >
          <Text style={styles.contactIcon}>📞</Text>
          <View style={styles.contactText}>
            <Text style={styles.contactLabel}>Phone</Text>
            <Text style={styles.contactValue}>+91 9137361474</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.contactItem}
          onPress={handleEmail}
          activeOpacity={0.7}
        >
          <Text style={styles.contactIcon}>📧</Text>
          <View style={styles.contactText}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>info@passion3dworld.com</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.contactItem}
          onPress={handleWebsite}
          activeOpacity={0.7}
        >
          <Text style={styles.contactIcon}>🌐</Text>
          <View style={styles.contactText}>
            <Text style={styles.contactLabel}>Website</Text>
            <Text style={styles.contactValue}>passion3dworld.com</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Support Channels */}
      <View style={styles.footerSection}>
        <Text style={styles.sectionTitle}>Get Help</Text>
        <Text style={styles.supportText}>
          For technical support, firmware updates, and drone help, contact us via phone or email.
        </Text>
        <View style={styles.supportTags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>24/7 Support</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Quick Response</Text>
          </View>
        </View>
      </View>

      {/* Version Info */}
      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>Version 2.1.0 • Professional Edition</Text>
        <Text style={styles.versionSubtext}>Developed for professional drone operations</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Full Footer Styles
  footer: {
    backgroundColor: '#0a0a0a',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  footerSection: {
    marginBottom: 24,
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  footerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  copyrightText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  contactIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  supportText: {
    fontSize: 13,
    color: '#aaa',
    lineHeight: 20,
    marginBottom: 12,
  },
  supportTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  tagText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  versionInfo: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  versionText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },

  // Compact Footer Styles
  footerCompact: {
    backgroundColor: '#0a0a0a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
  },
  copyrightCompact: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
  },
  contactRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactLinkCompact: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    color: '#666',
  },
});

export default AppFooter;
