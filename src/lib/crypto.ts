export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: CryptoKey }> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    false, // Private key is not extractable for security
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
  const data = encoder.encode(publicKeyBase64);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.slice(0, 12).toUpperCase();
}
export async function encryptPayload(data: string): Promise<string> {
  // Placeholder for AES-256-GCM implementation
  return btoa(`encrypted:${data}`);
}