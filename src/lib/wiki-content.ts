export interface WikiPage {
  id: string;
  title: string;
  category: string;
  content: string;
}
export const WIKI_PAGES: WikiPage[] = [
  {
    id: 'quickstart',
    title: 'Node_Quickstart',
    category: 'Onboarding',
    content: `
# Quickstart Guide v0.8.2
Follow these steps to initialize your node and join the Lehigh Valley Meta-Lattice.
## 1. Identity Generation
Upon first launch, the **Privacy_Initializer** will generate a P-256 keypair locally. 
- **Action**: Click "Generate_P256_Keys".
- **Result**: Your Node ID is derived from the SHA-256 hash of your Public Key.
## 2. Your First Publish
Navigate to **Unit_Publish** to ingress metadata.
- **Title**: Project_Delta_01
- **Content**: Markdown body defining your instructional resource.
- **Verification**: The system signs the payload using your private key before transmission.
## 3. Monitoring
View the **Topology** map to see your node's relationship with the regional registry.
`
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure_Path',
    category: 'Ops',
    content: `
# Production Infrastructure
LV Hub OS supports hybrid deployment paths for maximum resilience.
## Kubernetes (K8s)
Nodes can be deployed as containerized pods using the `infra/k8s-sentinel.yaml` manifest.
- **Service Type**: LoadBalancer
- **Persistence**: Managed via Durable Objects + regional KV caching.
## Cloud Run (Serverless)
Used for the primary API worker and frontend distribution.
- **Canary Strategy**: 10% traffic split via `scripts/deploy_canary.sh`.
- **Health Checks**: Automated smoke tests verify `/api/health` system strings.
`
  },
  {
    id: 'system-overview',
    title: 'System_Architecture',
    category: 'Core',
    content: `
# LV Hub OS v0.8.2 // Production
Meta-Lattice serves as a high-performance, edge-resident registry for instructional metadata.
## Core Pillars
- **Integrity**: Every packet is signed; every schema is enforced via AJV.
- **Privacy**: No raw addresses. No tracking. 500m coordinate jitter.
- **Resilience**: P2P Mesh fallback when the global registry is unreachable.
## Glossary
- **Lattice**: The distributed ledger of instructional units.
- **Sentinel**: The ingress module for regional observations.
- **Jitter**: The mathematical noise applied to GPS data.
- **Geohash**: A 6-character spatial identifier.
`
  },
  {
    id: 'geo-jitter-spec',
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
We use a base32 geohash algorithm to provide regional context without point-accuracy.
`
  }
];