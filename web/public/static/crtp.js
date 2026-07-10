// CRTP (Crazy Real-Time Protocol) for LiteWing / ESP-Drone — browser build.
// Ported from the native app's CRTPProtocol.js so the exact same packets
// are produced. Used both by the on-screen simulator and the real UDP bridge.

export const CRTP_PORT = {
  CONSOLE: 0x00,
  PARAM: 0x02,
  COMMANDER: 0x03,
  MEM: 0x04,
  LOG: 0x05,
  LOCALIZATION: 0x06,
  PLATFORM: 0x0d,
  LINK: 0x0f,
};

export const COMMANDER_TYPE = { RPYT: 0, RPYT_FULL: 1, STOP: 2, HOVER: 3 };

export function createCRTPHeader(port, channel = 0) {
  return ((port & 0x0f) << 4) | ((channel & 0x03) << 2);
}

// Roll/pitch in degrees (-30..30), yaw deg/s (-200..200), thrust 0..65535
export function createRPYTPacket(roll, pitch, yaw, thrust) {
  const packet = new Uint8Array(15);
  packet[0] = createCRTPHeader(CRTP_PORT.COMMANDER, 0);
  packet[1] = COMMANDER_TYPE.RPYT;
  const r = Math.round(roll * 100) & 0xffff;
  const p = Math.round(pitch * 100) & 0xffff;
  const y = Math.round(yaw * 100) & 0xffff;
  const t = Math.round(thrust) & 0xffff;
  packet[2] = r & 0xff;          packet[3] = (r >> 8) & 0xff;
  packet[4] = p & 0xff;          packet[5] = (p >> 8) & 0xff;
  packet[6] = y & 0xff;          packet[7] = (y >> 8) & 0xff;
  packet[8] = t & 0xff;          packet[9] = (t >> 8) & 0xff;
  return packet;
}

export function createStopPacket() {
  const packet = new Uint8Array(2);
  packet[0] = createCRTPHeader(CRTP_PORT.COMMANDER, 0);
  packet[1] = COMMANDER_TYPE.STOP;
  return packet;
}

// Map dual joysticks -> flight command (same mapping as native app)
// left:  y => thrust(0..1), x => yaw(-1..1)
// right: y => pitch(-1..1), x => roll(-1..1)
export function mapJoystickToCRTP(left, right) {
  const thrust = Math.max(0, Math.min(1, (left.y + 1) / 2)) * 65535;
  const yaw = left.x * 200;
  const pitch = right.y * 30;
  const roll = right.x * 30;
  return { roll, pitch, yaw, thrust };
}

// ESP-Drone appends a 1-byte additive checksum to each UDP frame.
export function withChecksum(bytes) {
  let sum = 0;
  for (const b of bytes) sum = (sum + (b & 0xff)) & 0xff;
  return new Uint8Array([...bytes, sum]);
}

export function toHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(' ');
}
