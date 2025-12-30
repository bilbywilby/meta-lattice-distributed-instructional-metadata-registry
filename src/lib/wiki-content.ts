export interface WikiPage {
  id: string;
  title: string;
  category: string;
  content: string;
}
export const WIKI_PAGES: WikiPage[] = [
  {
    id: 'system-overview',
    title: 'System_Architecture',
    category: 'Core',
    content: `
# LV Hub OS v0.8.2 // System Architecture
Meta-Lattice serves as a high-performance, edge-resident registry for instructional metadata.
## Core Components
- **Identity Layer**: P-256 Elliptic Curve Digital Signatures.
- **Storage Layer**: IndexedDB (Dexie) with 24h rolling pruning.
- **Network Layer**: Cloudflare Durable Objects + P2P WebRTC Mesh.
## Data Lifecycle
1. **Ingress**: Data entered via Sentinel Uplink.
2. **Validation**: Zod-enforced schema checks.
3. **Masking**: Geo-jitter (±0.0045) and SHA-256 address hashing.
4. **Broadcast**: Distributed to regional mesh nodes.
`
  },
  {
    id: 'sentinel-uplink',
    title: 'Sentinel_Protocols',
    category: 'Sentinel',
    content: `
# Sentinel Ingress Protocols
The Sentinel module handles the safe ingestion of regional observations.
## Geo-Privacy Masking
To prevent forensic tracking of nodes, the following transformations are applied:
- **Jitter**: Random coordinate offset within a 500m radius.
- **Geohashing**: 6-character precision mask for regional clustering.
- **Residency Proof**: Cross-streets are salted and hashed; raw text is never transmitted to the global registry.
## Uplink Sync
Reports are stored in a local **Outbox** and synchronized with the Durable Object when a network connection is established.
`
  },
  {
    id: 'privacy-jitters',
    title: 'Geo_Jitter_Spec',
    category: 'Privacy',
    content: `
# Geo-Privacy Specification
Mathematical variance applied to all coordinates at the ingestion layer.
\`\`\`typescript
const JITTER_FACTOR = 0.0045; // Approx 500m
const jitterLat = (Math.random() - 0.5) * JITTER_FACTOR;
const jitterLon = (Math.random() - 0.5) * JITTER_FACTOR;
\`\`\`
## Deterministic Geohash
We use a base32 geohash algorithm to provide regional context without point-accuracy. This allows for spatial queries (clustering) while maintaining individual node anonymity.
`
  },
  {
    id: 'mesh-networking',
    title: 'Mesh_P2P_Sync',
    category: 'Mesh',
    content: `
# Mesh P2P Topology
LV Hub OS utilizes a browser-to-browser synchronization layer.
## Protocol Stack
- **Signaling**: Handled via Durable Object state updates.
- **Transport**: WebRTC SCTP DataChannels.
- **Encryption**: DTLS-SRTP (Mandatory).
## Telemetry Sharing
Nodes share high-level registry hashes to detect desynchronization. If a delta is detected, missing reports are fetched via the command-query interface.
`
  }
];