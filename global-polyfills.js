// Global polyfills for React Native
// Fixes Buffer and other Node.js globals

import { Buffer } from 'buffer';

// Make Buffer available globally
global.Buffer = Buffer;

// Export for explicit imports
export { Buffer };
