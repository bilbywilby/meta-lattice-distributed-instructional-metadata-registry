# Meta-Lattice v1.0 Production Registry
Meta-Lattice is a distributed, high-performance instructional metadata registry. It serves as a decentralized source of truth for learning resource definitions, leveraging cryptographic validation and strict JSON Schema enforcement.
## 5-Minute Orientation
### What is Meta-Lattice?
Traditional learning standards (SCORM/LTI) focus on *communication* between a single LMS and a tool. Meta-Lattice focuses on the **Authoritative Ledger** of instructional units across a distributed network.
### The Architecture
1.  **Nodes**: Independent registry instances (Universities, Corporations, AI Agents).
2.  **Lattice Kernel**: The consensus layer ensuring metadata immutability.
3.  **Instructional Atom**: The smallest valid unit of instruction (Lesson, Quiz, Objective) defined by schema.
## Technical Glossary
| Term | Definition |
| :--- | :--- |
| **Instructional-Atom** | A cryptographically signed JSON object representing a discrete learning unit. |
| **Authority** | The DID (Decentralized Identifier) responsible for a metadata claim. |
| **DID** | Decentralized Identifier used for node authorship verification. |
| **REVOKED** | A status indicating an instructional unit is no longer canonical or valid. |
| **Lattice Status** | Lifecycle state (DRAFT, PUBLISHED, REVOKED). |
## Governance Model
Meta-Lattice employs a **Publish-Validate-Sync** model:
- **Publish**: A Node creates a unit signed with its P-256 private key.
- **Validate**: Regional peers verify the unit against the `instructional-unit.schema.json` using AJV.
- **Sync**: Once validated, the unit propagates to the global registry durable object.
## Comparison Matrix
| Feature | Meta-Lattice | xAPI | LTI |
| :--- | :--- | :--- | :--- |
| **Primary Goal** | Metadata Registry | Activity Tracking | Tool Launch |
| **Persistence** | Immutable Ledger | LRS | Transient Session |
| **Validation** | AJV JSON Schema | Loose JSON | OAuth2/OIDC |
| **Trust Model** | P2P Cryptography | API Keys | Trust-Anchor |
## Example Instructional Unit (Minimal)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "InstructionalUnit",
  "title": "Introduction to Lattice",
  "version": "1.0.0",
  "status": "PUBLISHED",
  "author": "did:lattice:node_alpha",
  "content": {
    "format": "MARKDOWN",
    "value": "# Hello Lattice"
  },
  "schemaVersion": "1.0.0"
}
```
## Production Roadmap
- [x] AJV Schema Enforcement (v1.0)
- [x] Distributed Durable Object Persistence
- [ ] ZK-Proofs for Private Curriculum Verification (v1.1)
- [ ] IPFS Content Addressing Integration (v1.2)
---
*Built for the distributed web. Carbon Terminal aesthetic strictly enforced.*