import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  useEffect(() => {
    // Redirect to connect screen
    router.replace('/connect');
  }, []);

  return null;
}
