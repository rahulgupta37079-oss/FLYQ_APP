import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MaterialIcons name="error-outline" size={80} color="#FF5252" />
        <Text style={styles.title}>App Error</Text>
        <Text style={styles.message}>Something went wrong</Text>
        
        <ScrollView style={styles.errorBox}>
          <Text style={styles.errorText}>{error.message}</Text>
          {error.stack && (
            <Text style={styles.stackText}>{error.stack}</Text>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={retry}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={() => {
            try {
              router.replace('/');
            } catch (e) {
              retry();
            }
          }}
        >
          <Text style={styles.buttonText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorBox: {
    width: '100%',
    maxHeight: 200,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.3)',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  stackText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
