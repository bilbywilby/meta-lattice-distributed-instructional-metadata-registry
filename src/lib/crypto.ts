export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: CryptoKey }> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    false,
    ["sign", "verify"]
  );
  const exportedPublic = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
  const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPublic)));
  return {
    publicKey: publicKeyBase64,
    privateKey: keyPair.privateKey
  };
}
export async function deriveNodeId(publicKeyBase64: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(publicKeyBase64.trim());
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  // 12-char hex ID for branding v0.8.2 Android parity
  return hashHex.slice(0, 12).toUpperCase();
}
/**
 * Perform the SHA256(street + salt) transformation described in the Android spec.
 * Ensures raw text addresses never leave the device.
 */
export async function saltResidency(street: string, salt: string = "VALLEY_HUB_V1"): Promise<string> {
  const message = `${street.trim().toUpperCase()}:${salt}`;
  return await sha256(message);
}
export function generateJitteredGeo(lat: number, lon: number) {
  // Exact ±0.0045 jitter factor (~500m) as per Android spec v0.8.2
  // We use (Math.random() - 0.5) to center the jitter around the actual point
  const jitterLat = (Math.random() - 0.5) * 0.009;
  const jitterLon = (Math.random() - 0.5) * 0.009;
  return {
    lat: lat + jitterLat,
    lon: lon + jitterLon
  };
}
export function computeGeohash(lat: number | null, lon: number | null): string {
  if (lat === null || lon === null) return "000000";
  const chars = "0123456789bcdefghjkmnpqrstuvwxyz";
  let geohash = "";
  let minLat = -90, maxLat = 90;
  let minLon = -180, maxLon = 180;
  let bit = 0, ch = 0;
  let even = true;
  while (geohash.length < 6) {
    if (even) {
      let mid = (minLon + maxLon) / 2;
      if (lon > mid) { ch |= (1 << (4 - bit)); minLon = mid; }
      else maxLon = mid;
    } else {
      let mid = (minLat + maxLat) / 2;
      if (lat > mid) { ch |= (1 << (4 - bit)); minLat = mid; }
      else maxLat = mid;
    }
    even = !even;
    if (bit < BitRangeEnd) bit++;
    else {
      geohash += chars[ch];
      bit = 0; ch = 0;
    }
  }
  return geohash;
}
const BitRangeEnd = 4;
export async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message.trim().toLowerCase());
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}