import { create } from 'zustand';

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
  
  // Actions
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
}

export const useDroneStore = create<DroneState>((set) => ({
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
  
  // Actions
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
}));
