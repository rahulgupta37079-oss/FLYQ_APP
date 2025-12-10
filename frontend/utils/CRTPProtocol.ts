/**
 * CRTP (Crazy Real Time Protocol) Implementation
 * Used for communicating with Crazyflie-compatible drones (FLYQ Air, FLYQ Vision)
 */

export class CRTPProtocol {
  private static CRTP_PORT_COMMANDER = 0x03;
  private static CRTP_PORT_PLATFORM = 0x0D;
  private static CRTP_CHANNEL_ARM = 0;
  private static CRTP_CHANNEL_CALIBRATE = 1;

  /**
   * Create a CRTP Commander packet (15 bytes)
   * Format: [header, roll (4 bytes), pitch (4 bytes), yaw (4 bytes), thrust (2 bytes)]
   */
  static createCommanderPacket(
    roll: number,
    pitch: number,
    yaw: number,
    thrust: number
  ): Uint8Array {
    const packet = new Uint8Array(15);
    const dataView = new DataView(packet.buffer);

    // Header byte (port 0x03, channel 0)
    packet[0] = (this.CRTP_PORT_COMMANDER << 4) | 0;

    // Roll (float32, little-endian)
    dataView.setFloat32(1, roll, true);

    // Pitch (float32, little-endian)
    dataView.setFloat32(5, pitch, true);

    // Yaw (float32, little-endian)
    dataView.setFloat32(9, yaw, true);

    // Thrust (uint16, little-endian) - range 0-65535
    const thrustValue = Math.max(0, Math.min(65535, Math.round(thrust)));
    dataView.setUint16(13, thrustValue, true);

    return packet;
  }

  /**
   * Create ARM/DISARM command packet
   * @param arm true to ARM, false to DISARM
   */
  static createArmPacket(arm: boolean): Uint8Array {
    const packet = new Uint8Array(2);
    // Header byte (port 0x0D, channel 0)
    packet[0] = (this.CRTP_PORT_PLATFORM << 4) | this.CRTP_CHANNEL_ARM;
    // Command: 1 for ARM, 0 for DISARM
    packet[1] = arm ? 1 : 0;
    return packet;
  }

  /**
   * Create calibration command packet
   */
  static createCalibratePacket(): Uint8Array {
    const packet = new Uint8Array(2);
    // Header byte (port 0x0D, channel 1)
    packet[0] = (this.CRTP_PORT_PLATFORM << 4) | this.CRTP_CHANNEL_CALIBRATE;
    // Command: 1 to start calibration
    packet[1] = 1;
    return packet;
  }

  /**
   * Convert control percentage (-100 to +100) to angle in degrees
   * Used for roll and pitch
   */
  static percentageToAngle(percentage: number, maxAngle: number = 30): number {
    return (percentage / 100) * maxAngle;
  }

  /**
   * Convert control percentage (-100 to +100) to yaw rate
   * Used for yaw (rotation)
   */
  static percentageToYawRate(percentage: number, maxRate: number = 200): number {
    return (percentage / 100) * maxRate;
  }

  /**
   * Convert thrust percentage (0 to 100) to uint16 value (0 to 65535)
   */
  static percentageToThrust(percentage: number): number {
    // Clamp percentage to 0-100
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    return Math.round((clampedPercentage / 100) * 65535);
  }

  /**
   * Convert packet to base64 for transmission
   */
  static packetToBase64(packet: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < packet.length; i++) {
      binary += String.fromCharCode(packet[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert packet to hex string for debugging
   */
  static packetToHex(packet: Uint8Array): string {
    return Array.from(packet)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ');
  }
}
