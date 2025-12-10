import { create } from 'zustand';

// Flight Path Point
export interface FlightPathPoint {
  timestamp: number;
  latitude: number;
  longitude: number;
  altitude: number;
  roll: number;
  pitch: number;
  yaw: number;
  thrust: number;
  batteryVoltage: number;
}

// Drone Connection Info (for multi-drone)
export interface DroneConnection {
  id: string;
  name: string;
  ip: string;
  ssid: string;
  model: 'FLYQ_Air' | 'FLYQ_Vision';
  connected: boolean;
  batteryPercentage: number;
}

export interface DroneState {
  // Connection
  connected: boolean;
  droneIP: string;
  droneSSID: string;
  droneModel: 'FLYQ_Air' | 'FLYQ_Vision' | null;
  
  // Control values
  thrust: number; // 0-100%
  yaw: number; // -200 to +200 °/s
  roll: number; // -30 to +30°
  pitch: number; // -30 to +30°
  
  // ARM/DISARM
  armed: boolean;
  
  // Telemetry
  batteryVoltage: number;
  batteryPercentage: number;
  
  // Settings
  rollTrim: number; // -50 to +50
  pitchTrim: number; // -50 to +50
  joystickSensitivity: number; // 1-200
  
  // Height hold
  heightHoldEnabled: boolean;
  targetHeight: number; // 20-150 cm
  
  // Debug mode
  debugMode: boolean;
  
  // v2.1 Features
  // Camera Streaming
  cameraStreamEnabled: boolean;
  cameraStreamUrl: string | null;
  
  // Flight Path Recording
  flightRecordingEnabled: boolean;
  flightRecordingActive: boolean;
  currentFlightPath: FlightPathPoint[];
  savedFlightPaths: { id: string; name: string; points: FlightPathPoint[]; date: string; }[];
  
  // Multiple Drone Management
  multiDroneEnabled: boolean;
  connectedDrones: DroneConnection[];
  activeDroneId: string | null;
  
  // Gesture Controls
  gestureControlEnabled: boolean;
  gestureShakeThreshold: number;
  gestureTiltSensitivity: number;
  
  // Actions - Basic
  setConnected: (connected: boolean) => void;
  setDroneIP: (ip: string) => void;
  setDroneSSID: (ssid: string) => void;
  setDroneModel: (model: 'FLYQ_Air' | 'FLYQ_Vision' | null) => void;
  setControlValues: (thrust: number, yaw: number, roll: number, pitch: number) => void;
  setArmed: (armed: boolean) => void;
  setBattery: (voltage: number, percentage: number) => void;
  setRollTrim: (trim: number) => void;
  setPitchTrim: (trim: number) => void;
  setJoystickSensitivity: (sensitivity: number) => void;
  setHeightHold: (enabled: boolean, height?: number) => void;
  setDebugMode: (enabled: boolean) => void;
  resetControlValues: () => void;
  
  // Actions - Camera Streaming
  setCameraStreamEnabled: (enabled: boolean) => void;
  setCameraStreamUrl: (url: string | null) => void;
  
  // Actions - Flight Path Recording
  setFlightRecordingEnabled: (enabled: boolean) => void;
  startFlightRecording: () => void;
  stopFlightRecording: () => void;
  addFlightPathPoint: (point: FlightPathPoint) => void;
  saveCurrentFlightPath: (name: string) => void;
  loadFlightPath: (id: string) => void;
  deleteFlightPath: (id: string) => void;
  clearCurrentFlightPath: () => void;
  
  // Actions - Multiple Drone Management
  setMultiDroneEnabled: (enabled: boolean) => void;
  addDrone: (drone: DroneConnection) => void;
  removeDrone: (id: string) => void;
  setActiveDrone: (id: string) => void;
  updateDroneStatus: (id: string, updates: Partial<DroneConnection>) => void;
  
  // Actions - Gesture Controls
  setGestureControlEnabled: (enabled: boolean) => void;
  setGestureShakeThreshold: (threshold: number) => void;
  setGestureTiltSensitivity: (sensitivity: number) => void;
}

export const useDroneStore = create<DroneState>((set, get) => ({
  // Initial state
  connected: false,
  droneIP: '192.168.4.1',
  droneSSID: '',
  droneModel: null,
  
  thrust: 0,
  yaw: 0,
  roll: 0,
  pitch: 0,
  
  armed: false,
  
  batteryVoltage: 4.2,
  batteryPercentage: 100,
  
  rollTrim: 0,
  pitchTrim: 0,
  joystickSensitivity: 110,
  
  heightHoldEnabled: false,
  targetHeight: 80,
  
  debugMode: false,
  
  // v2.1 Features Initial State
  cameraStreamEnabled: false,
  cameraStreamUrl: null,
  
  flightRecordingEnabled: false,
  flightRecordingActive: false,
  currentFlightPath: [],
  savedFlightPaths: [],
  
  multiDroneEnabled: false,
  connectedDrones: [],
  activeDroneId: null,
  
  gestureControlEnabled: false,
  gestureShakeThreshold: 2.5,
  gestureTiltSensitivity: 1.0,
  
  // Actions - Basic
  setConnected: (connected) => set({ connected }),
  setDroneIP: (droneIP) => set({ droneIP }),
  setDroneSSID: (droneSSID) => set({ droneSSID }),
  setDroneModel: (droneModel) => set({ droneModel }),
  
  setControlValues: (thrust, yaw, roll, pitch) => set({ thrust, yaw, roll, pitch }),
  
  setArmed: (armed) => set({ armed }),
  
  setBattery: (batteryVoltage, batteryPercentage) => set({ batteryVoltage, batteryPercentage }),
  
  setRollTrim: (rollTrim) => set({ rollTrim }),
  setPitchTrim: (pitchTrim) => set({ pitchTrim }),
  setJoystickSensitivity: (joystickSensitivity) => set({ joystickSensitivity }),
  
  setHeightHold: (heightHoldEnabled, targetHeight) => 
    set((state) => ({
      heightHoldEnabled,
      targetHeight: targetHeight !== undefined ? targetHeight : state.targetHeight
    })),
  
  setDebugMode: (debugMode) => set({ debugMode }),
  
  resetControlValues: () => set({ thrust: 0, yaw: 0, roll: 0, pitch: 0 }),
  
  // Actions - Camera Streaming
  setCameraStreamEnabled: (cameraStreamEnabled) => set({ cameraStreamEnabled }),
  setCameraStreamUrl: (cameraStreamUrl) => set({ cameraStreamUrl }),
  
  // Actions - Flight Path Recording
  setFlightRecordingEnabled: (flightRecordingEnabled) => set({ flightRecordingEnabled }),
  
  startFlightRecording: () => set({ flightRecordingActive: true, currentFlightPath: [] }),
  
  stopFlightRecording: () => set({ flightRecordingActive: false }),
  
  addFlightPathPoint: (point) => set((state) => ({
    currentFlightPath: [...state.currentFlightPath, point]
  })),
  
  saveCurrentFlightPath: (name) => set((state) => {
    if (state.currentFlightPath.length === 0) return state;
    
    const newPath = {
      id: Date.now().toString(),
      name,
      points: state.currentFlightPath,
      date: new Date().toISOString()
    };
    
    return {
      savedFlightPaths: [...state.savedFlightPaths, newPath],
      currentFlightPath: [],
      flightRecordingActive: false
    };
  }),
  
  loadFlightPath: (id) => set((state) => {
    const path = state.savedFlightPaths.find(p => p.id === id);
    if (!path) return state;
    
    return {
      currentFlightPath: path.points,
      flightRecordingActive: false
    };
  }),
  
  deleteFlightPath: (id) => set((state) => ({
    savedFlightPaths: state.savedFlightPaths.filter(p => p.id !== id)
  })),
  
  clearCurrentFlightPath: () => set({ currentFlightPath: [], flightRecordingActive: false }),
  
  // Actions - Multiple Drone Management
  setMultiDroneEnabled: (multiDroneEnabled) => set({ multiDroneEnabled }),
  
  addDrone: (drone) => set((state) => {
    // Don't add if already exists
    if (state.connectedDrones.find(d => d.id === drone.id)) {
      return state;
    }
    return {
      connectedDrones: [...state.connectedDrones, drone]
    };
  }),
  
  removeDrone: (id) => set((state) => ({
    connectedDrones: state.connectedDrones.filter(d => d.id !== id),
    activeDroneId: state.activeDroneId === id ? null : state.activeDroneId
  })),
  
  setActiveDrone: (activeDroneId) => set({ activeDroneId }),
  
  updateDroneStatus: (id, updates) => set((state) => ({
    connectedDrones: state.connectedDrones.map(drone =>
      drone.id === id ? { ...drone, ...updates } : drone
    )
  })),
  
  // Actions - Gesture Controls
  setGestureControlEnabled: (gestureControlEnabled) => set({ gestureControlEnabled }),
  setGestureShakeThreshold: (gestureShakeThreshold) => set({ gestureShakeThreshold }),
  setGestureTiltSensitivity: (gestureTiltSensitivity) => set({ gestureTiltSensitivity }),
}));
