// CRTP (Crazy Real-Time Protocol) Implementation for LiteWing Drone
// Based on Crazyflie protocol specification

/**
 * CRTP Packet Structure:
 * - Header (1 byte): [Port (4 bits) | Channel (2 bits) | Reserved (2 bits)]
 * - Payload (0-31 bytes): Command data
 */

// CRTP Ports
export const CRTP_PORT = {
  CONSOLE: 0x00,
  PARAM: 0x02,
  COMMANDER: 0x03,
  MEM: 0x04,
  LOG: 0x05,
  LOCALIZATION: 0x06,
  PLATFORM: 0x0D,
  LINK: 0x0F,
};

// Commander Packet Type
export const COMMANDER_TYPE = {
  RPYT: 0,      // Roll, Pitch, Yaw, Thrust
  RPYT_FULL: 1, // Full state commander
  STOP: 2,      // Emergency stop
  HOVER: 3,     // Hover mode
};

/**
 * Create CRTP Header
 * @param {number} port - CRTP port (4 bits)
 * @param {number} channel - Channel number (2 bits)
 * @returns {number} Header byte
 */
export function createCRTPHeader(port, channel = 0) {
  return ((port & 0x0F) << 4) | ((channel & 0x03) << 2);
}

/**
 * Create Commander RPYT Packet
 * @param {number} roll - Roll angle (-30 to +30 degrees)
 * @param {number} pitch - Pitch angle (-30 to +30 degrees)
 * @param {number} yaw - Yaw rate (-200 to +200 deg/s)
 * @param {number} thrust - Thrust (0 to 65535, where 0 = 0%, 65535 = 100%)
 * @returns {Uint8Array} CRTP packet
 */
export function createRPYTPacket(roll, pitch, yaw, thrust) {
  const packet = new Uint8Array(15);
  const header = createCRTPHeader(CRTP_PORT.COMMANDER, 0);
  
  packet[0] = header;
  packet[1] = COMMANDER_TYPE.RPYT;
  
  // Convert to int16 for roll, pitch, yaw
  const rollInt = Math.round(roll * 100) & 0xFFFF;
  const pitchInt = Math.round(pitch * 100) & 0xFFFF;
  const yawInt = Math.round(yaw * 100) & 0xFFFF;
  const thrustInt = Math.round(thrust) & 0xFFFF;
  
  // Pack as little-endian int16
  packet[2] = rollInt & 0xFF;
  packet[3] = (rollInt >> 8) & 0xFF;
  
  packet[4] = pitchInt & 0xFF;
  packet[5] = (pitchInt >> 8) & 0xFF;
  
  packet[6] = yawInt & 0xFF;
  packet[7] = (yawInt >> 8) & 0xFF;
  
  packet[8] = thrustInt & 0xFF;
  packet[9] = (thrustInt >> 8) & 0xFF;
  
  return packet;
}

/**
 * Create Emergency Stop Packet
 * @returns {Uint8Array} CRTP stop packet
 */
export function createStopPacket() {
  const packet = new Uint8Array(2);
  packet[0] = createCRTPHeader(CRTP_PORT.COMMANDER, 0);
  packet[1] = COMMANDER_TYPE.STOP;
  return packet;
}

/**
 * Parse Telemetry Packet
 * @param {Uint8Array} data - Received CRTP packet
 * @returns {Object} Parsed telemetry data
 */
export function parseTelemetryPacket(data) {
  if (data.length < 2) return null;
  
  const header = data[0];
  const port = (header >> 4) & 0x0F;
  const channel = (header >> 2) & 0x03;
  
  // Check if this is a log/telemetry packet
  if (port === CRTP_PORT.LOG) {
    return {
      port,
      channel,
      timestamp: Date.now(),
      payload: Array.from(data.slice(1)),
    };
  }
  
  return null;
}

/**
 * Map joystick values to CRTP commands
 * @param {Object} joystick - Joystick values {x, y} normalized to -1..1
 * @param {number} throttle - Throttle 0..1
 * @returns {Object} CRTP command values
 */
export function mapJoystickToCRTP(leftJoystick, rightJoystick) {
  // Left joystick: Y = throttle (0-1), X = yaw (-1 to 1)
  // Right joystick: Y = pitch (-1 to 1), X = roll (-1 to 1)
  
  const thrust = Math.max(0, Math.min(1, (leftJoystick.y + 1) / 2)) * 65535;
  const yaw = leftJoystick.x * 200; // -200 to +200 deg/s
  const pitch = rightJoystick.y * 30; // -30 to +30 degrees
  const roll = rightJoystick.x * 30; // -30 to +30 degrees
  
  return { roll, pitch, yaw, thrust };
}

/**
 * Create Connection Request Packet
 * For initial handshake with drone
 */
export function createConnectionPacket() {
  const packet = new Uint8Array(2);
  packet[0] = createCRTPHeader(CRTP_PORT.LINK, 0);
  packet[1] = 0x00; // Connection request
  return packet;
}

/**
 * Create Ping Packet
 * Keep connection alive
 */
export function createPingPacket() {
  const packet = new Uint8Array(2);
  packet[0] = createCRTPHeader(CRTP_PORT.LINK, 0);
  packet[1] = 0x01; // Ping
  return packet;
}

export default {
  CRTP_PORT,
  COMMANDER_TYPE,
  createCRTPHeader,
  createRPYTPacket,
  createStopPacket,
  parseTelemetryPacket,
  mapJoystickToCRTP,
  createConnectionPacket,
  createPingPacket,
};
