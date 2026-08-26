# QuantuSecure 🛡️⚡
> **Post-Quantum Cryptographic (PQC) Peer-to-Peer LAN Desktop Messenger**  
> *Zero-server, quantum-resilient, text-only communications over local area networks.*

---

## 🌟 Overview

**QuantuSecure** is a standalone, decentralized desktop chat application engineered for ultra-secure communications over local networks (LAN) and local loopback (`127.0.0.1`). Inspired by the minimalist, text-first utility of WhatsApp, QuantuSecure strips away trackers, centralized servers, media bloat, and phone-number identity in favor of direct **P2P TCP sockets** secured with **NIST FIPS 203 Post-Quantum Cryptography**.

Standard modern messengers rely on classical key exchanges (RSA, ECDH) that are vulnerable to **"Harvest Now, Decrypt Later"** (HNDL) attacks by future Cryptanalytically Relevant Quantum Computers (CRQCs). QuantuSecure eliminates this vulnerability by securing every session with **ML-KEM-768** key encapsulation and **AES-256-GCM** authenticated payload encryption.

---

## 🔐 Cryptographic Stack & Specifications

| Layer | Algorithm / Standard | Specification & Parameters | Purpose |
|---|---|---|---|
| **Key Exchange (KEM)** | **ML-KEM-768** (Kyber-768) | NIST FIPS 203 / Category 3 Security (~128-bit quantum security) | Quantum-safe session secret encapsulation |
| **Authentication & Signing** | **Ed25519** *(Falcon-512 drop-in ready)* | Curve25519 / SHA-512 | Handshake transcript signing & peer authentication |
| **Key Derivation (KDF)** | **HKDF-SHA256** | RFC 5869 (Extract & Expand) | Derives 256-bit symmetric session key from KEM secret |
| **Payload Encryption** | **AES-256-GCM** | 256-bit Key, 96-bit Random IV, 128-bit Auth Tag | End-to-end message confidentiality & integrity (AEAD) |
| **Anti-Replay & Ordering** | **Monotonic Sequence Tracker** | 64-bit strictly incrementing sequence numbers | Protection against message replay, duplication, and reordering |
| **Identity Fingerprint** | **SHA-256** | Hex-formatted colon-delimited hash of signing key | Out-of-band identity verification |

---

## 🔄 5-Step PQC Handshake Protocol

When two nodes connect over TCP, QuantuSecure executes an authenticated 5-step quantum-resistant handshake before exchanging any messages:

```
    INITIATOR (Node A)                                    RESPONDER (Node B)
    ==================                                    ==================
            │                                                      │
            │  1. HANDSHAKE_HELLO (kemPubKey_A, sigPubKey_A, name) │
            ├─────────────────────────────────────────────────────►│
            │                                                      │
            │  2. HANDSHAKE_HELLO (kemPubKey_B, sigPubKey_B, name) │
            │◄─────────────────────────────────────────────────────┤
            │                                                      │
            │  [Node A encapsulates sharedSecret against Node B]   │
            │  3. HANDSHAKE_KEM_RESP (ciphertext_AB)              │
            ├─────────────────────────────────────────────────────►│
            │                                                      │
            │  [Node A signs transcript: (Hello_A || Hello_B || Ciphertext)]
            │  4a. HANDSHAKE_AUTH (sig_A)                          │
            ├─────────────────────────────────────────────────────►│
            │                                                      │
            │                       [Node B decapsulates sharedSecret]
            │                       [Node B signs transcript: (Hello_B || Hello_A || Ciphertext)]
            │  4b. HANDSHAKE_AUTH (sig_B)                          │
            │◄─────────────────────────────────────────────────────┤
            │                                                      │
            │  5a. HANDSHAKE_COMPLETE                              │
            ├─────────────────────────────────────────────────────►│
            │  5b. HANDSHAKE_COMPLETE                              │
            │◄─────────────────────────────────────────────────────┤
            │                                                      │
     [Derive AES Session Key]                               [Derive AES Session Key]
            │                                                      │
            │◄─────────── AES-256-GCM Encrypted Chat ─────────────►│
```

---

## 🚀 Key Features

- **P2P Direct Addressing (IP:Port)**:
  - No phone numbers, email addresses, or accounts.
  - Connects directly to peers via `127.0.0.1:<port>` (localhost testing) or `192.168.x.x:<port>` (LAN).
- **Interactive Dev Launcher with Auto Port Discovery**:
  - `npm run dev` scans ports `5173–5179` and presents a clean interactive selector.
  - Automatic TCP port fallback (if port 5050 is busy, automatically binds 5051, 5052, etc.).
- **Unsaved / Unknown Sender Security Banner**:
  - Incoming messages from unknown peers display a verification banner with 1-click **Save Contact** or **Block**.
- **Right-Click & Header Context Menu**:
  - Right-click any contact or click the header menu `⋮` to:
    - ✏️ **Rename Contact** / 💾 **Save Contact**
    - 🔒 **Inspect Security Details**
    - 🚫 **Block / Unblock Peer**
    - ✕ **Close Chat**
    - 🗑️ **Delete Chat History**
- **Security & Key Material Inspector**:
  - View raw Base64 ML-KEM-768 public keys, signing keys, and SHA-256 fingerprints with 1-click copy.
- **Peer Blocking Engine**:
  - Blocked peers are persisted in `blocked.json`. Blocked sockets are severed immediately and packets dropped.
- **Offline-First Atomic JSON Storage**:
  - Zero SQL dependencies. Stored in `%APPDATA%/QuantuSecure` using safe atomic writes (`.tmp` → atomic rename).
- **Cyber-Defense Aesthetic**:
  - Frameless window with custom macOS-style traffic lights (🔴 Close, 🟡 Minimize, 🟢 Maximize/Restore).
  - Micro-animations via GSAP, custom scrollbars, and neon green-on-dark cyber palette.

---

## 📁 Repository Structure

```
Quantu Secure/
│
├── Web_App/                            # Main Application Workspace
│   ├── main.js                         # Electron Main process (TCP server, IPC handlers, window lifecycle)
│   ├── preload.js                      # Context isolation bridge (window.quantuSecure API)
│   ├── package.json                    # Dependencies & build scripts
│   ├── vite.config.js                  # Vite configuration for React renderer
│   │
│   ├── scripts/
│   │   └── dev.js                      # Interactive multi-port launcher (Vite + Electron supervisor)
│   │
│   ├── src/
│   │   ├── crypto/                     # Cryptographic Primitives Layer
│   │   │   ├── pqc.js                  # ML-KEM-768 encapsulation/decapsulation & Ed25519 signing
│   │   │   ├── session.js              # AES-256-GCM AEAD, HKDF-SHA256, and Sequence Tracker
│   │   │   └── identity.js             # Node identity keypair generation & JSON persistence
│   │   │
│   │   ├── network/                    # TCP Networking Layer
│   │   │   ├── protocol.js             # 4-byte length-prefix framing & stream parser (FrameParser)
│   │   │   ├── peer.js                 # PeerConnection state machine (5-step PQC handshake)
│   │   │   └── server.js               # PeerManager singleton (TCP server & connection registry)
│   │   │
│   │   ├── storage/                    # Flat JSON Persistence Layer
│   │   │   ├── store.js                # Atomic filesystem read/write engine
│   │   │   ├── contacts.js             # Contacts & Blocked peers CRUD (contacts.json, blocked.json)
│   │   │   └── messages.js             # Message history CRUD (messages/<contactId>.json)
│   │   │
│   │   └── renderer/                   # React Frontend (UI/UX)
│   │       ├── index.html              # HTML shell
│   │       ├── main.jsx                # React root mount
│   │       ├── App.jsx                 # App container & modal coordinator
│   │       │
│   │       ├── store/
│   │       │   └── useAppStore.js      # Zustand global state store & IPC event subscribers
│   │       │
│   │       ├── components/
│   │       │   ├── Sidebar.jsx         # Contact list, search, wordmark, settings trigger
│   │       │   ├── ContactItem.jsx     # Contact row with right-click menu & status indicators
│   │       │   ├── ConversationView.jsx# Active chat pane, header, message stream, unsaved banner
│   │       │   ├── MessageBubble.jsx   # Sent/Received bubbles with timestamp & delivery status
│   │       │   ├── InputBar.jsx        # Auto-resizing textarea with debounce typing signals
│   │       │   ├── TypingIndicator.jsx # Live peer typing animation
│   │       │   ├── AddPeerModal.jsx    # Handshake initiator state machine modal
│   │       │   ├── RenameContactModal.jsx # Rename / Save contact modal
│   │       │   ├── SecurityDetailsModal.jsx # Cryptographic key inspector modal
│   │       │   ├── ContextMenu.jsx     # Dark glassmorphic right-click popup menu
│   │       │   ├── WindowControls.jsx  # Frameless macOS-style window controls (🔴 🟡 🟢)
│   │       │   ├── IdentityScreen.jsx  # Local/LAN address display & node configuration
│   │       │   └── Icons.jsx           # Pure SVG iconography
│   │       │
│   │       └── styles/
│   │           ├── index.css           # Design tokens, cyber theme, layout styles
│   │           └── animations.css      # Keyframes & GSAP transitions
│   │
├── Circut_Diagram/                     # Hardware schematics & Fritzing parts (433T30D.fzpz)
├── Hardware_code/                      # Microcontroller / LoRa firmware modules
├── Mobile_App/                         # Mobile client package
└── Test/                               # Test suites & diagnostic scripts
```

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **OS**: Windows 10/11, macOS, or Linux

### 1. Clone & Install Dependencies
```powershell
cd "d:\Work\IOT\Quantu Secure\Web_App"
npm install
```

---

## 💻 Running the Application

### Single Instance (Normal Dev Mode)
```powershell
cd "d:\Work\IOT\Quantu Secure\Web_App"
npm run dev
```
1. An interactive terminal menu will scan candidate ports (`5173–5179`).
2. Press **Enter** to accept the default or type a number to select a port.
3. The Vite renderer starts, followed automatically by the Electron window.

---

### Dual Instance E2E Testing (Localhost Handshake)

To test post-quantum encrypted chatting between two local nodes on the same machine:

#### **Terminal 1 — Instance A (Port 5050 / Renderer 5173):**
```powershell
cd "d:\Work\IOT\Quantu Secure\Web_App"
npm run dev
# Choose Port 1 (5173)
```
*Instance A starts with TCP listener on `127.0.0.1:5050`.*

#### **Terminal 2 — Instance B (Port 5051 / Renderer 5174):**
```powershell
cd "d:\Work\IOT\Quantu Secure\Web_App"
$env:NODE_ENV='development'; npx electron . --user-data-dir="C:\tmp\quantu-b"
```
*Instance B starts with an isolated identity profile and binds to TCP port `127.0.0.1:5051` (or port shown in its Identity tab).*

#### **Establish Connection:**
1. In **Instance A**, click the green **`+`** button in the bottom-left corner.
2. Enter **`127.0.0.1:5051`** (Instance B's listening address).
3. Click **`INITIATE HANDSHAKE`**.
4. The 5-step ML-KEM-768 key exchange executes in milliseconds. Click **`SAVE CONTACT`**.
5. Both instances are now connected via an end-to-end quantum-encrypted TCP tunnel.

---

## 📦 Building for Production

To create an optimized production executable:

```powershell
cd "d:\Work\IOT\Quantu Secure\Web_App"
npm run build
```
Packaged distributions (NSIS `.exe` on Windows, `.dmg` on macOS, `.AppImage` on Linux) will be generated in `Web_App/release/`.

---

## 🛡️ Security Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer (React)                │
└──────────────────────────────┬──────────────────────────────┘
                               │ IPC (Context Isolation)
┌──────────────────────────────▼──────────────────────────────┐
│                    Electron Main Process                    │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────┐       ┌────────────────────────┐ │
│  │   Flat JSON Storage   │       │  TCP Server / Client   │ │
│  │ (contacts, messages)  │       │     (Net Sockets)      │ │
│  └───────────┬───────────┘       └───────────┬────────────┘ │
│              │                               │              │
│  ┌───────────▼───────────────────────────────▼────────────┐ │
│  │             QuantuSecure Cryptographic Core            │ │
│  │                                                        │ │
│  │   • ML-KEM-768 (Quantum Key Encapsulation)            │ │
│  │   • Ed25519 / Falcon-512 (Transcript Auth Signing)     │ │
│  │   • HKDF-SHA256 (Session Key Derivation)              │ │
│  │   • AES-256-GCM (Payload AEAD Encryption)              │ │
│  │   • SeqTracker (Anti-Replay & Sequence Enforcement)    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 📄 License & Thesis Notice
Developed as a Post-Quantum Cryptography secure communications research implementation.
All cryptographic primitives comply with NIST Post-Quantum Cryptography Standardization (FIPS 203).
