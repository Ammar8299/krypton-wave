<div align="center">

# 🛡️⚡ QuantuSecure (Krypton)
### *Post-Quantum Cryptographic P2P Messenger & LoRa Gateway*

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=24&duration=3000&pause=1000&color=00FF66&center=true&vCenter=true&width=650&lines=Quantum-Resilient+Peer-to-Peer+Messenger;NIST+FIPS+203+ML-KEM-768+Key+Exchange;Zero-Server+Decentralized+LAN+%26+LoRa+P2P;End-to-End+AES-256-GCM+AEAD+Encryption)](https://git.io/typing-svg)

<p align="center">
  <img src="https://img.shields.io/badge/Security-NIST_FIPS_203_(ML--KEM--768)-00C853?style=for-the-badge&logo=shield&logoColor=white" alt="ML-KEM-768" />
  <img src="https://img.shields.io/badge/Encryption-AES--256--GCM-black?style=for-the-badge&logo=lock&logoColor=00E676" alt="AES-256-GCM" />
  <img src="https://img.shields.io/badge/Auth-Ed25519_%2F_Falcon--512-1a1a1a?style=for-the-badge&logo=auth0&logoColor=00C853" alt="Auth" />
  <img src="https://img.shields.io/badge/Architecture-Direct_P2P_TCP_%26_LoRa-004D40?style=for-the-badge&logo=target&logoColor=white" alt="P2P" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-33.2.1-47848F?style=flat-square&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6.0.5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/ESP32--S3-DevKitC--1-E7352C?style=flat-square&logo=espressif&logoColor=white" alt="ESP32" />
  <img src="https://img.shields.io/badge/LoRa-433MHz_SX1262-FF6F00?style=flat-square&logo=satellite&logoColor=white" alt="LoRa" />
  <img src="https://img.shields.io/badge/Storage-Zero--SQL_Flat_JSON-00C853?style=flat-square&logo=json&logoColor=white" alt="JSON" />
</p>

<p align="center">
  <a href="#-key-features">Features</a> •
  <a href="#-hardware-schematic--circuit-design">Hardware & Circuit</a> •
  <a href="#-cryptographic-stack--specifications">Cryptographic Stack</a> •
  <a href="#-5-step-pqc-handshake-protocol">Handshake Protocol</a> •
  <a href="#-installation--setup">Installation</a> •
  <a href="#-running-the-application">Running</a> •
  <a href="#-project-structure">Structure</a>
</p>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png" alt="line" width="100%" />

</div>

---

## 🌟 Executive Summary

**QuantuSecure (Krypton)** is a decentralized, zero-server desktop messenger and hardware gateway designed for immunity against **"Harvest Now, Decrypt Later" (HNDL)** quantum computing threats.

Traditional messaging platforms rely on classical asymmetric cryptography (RSA, ECDH) to exchange session keys. These schemes are vulnerable to Shor's algorithm running on future Cryptanalytically Relevant Quantum Computers (CRQCs). QuantuSecure resolves this vulnerability by combining **NIST FIPS 203 ML-KEM-768** post-quantum key encapsulation with **AES-256-GCM** authenticated payload encryption over direct peer-to-peer TCP networks and 433MHz LoRa physical links.

```
       ┌─────────────────────────────────────────────────────────────┐
       │             QUANTUM THREAT IMMUNITY ARCHITECTURE            │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
   ┌──────────────────────┐                       ┌──────────────────────┐
   │  P2P Desktop Layer   │                       │  Hardware Gateway    │
   │  (Electron + React)  │                       │  (ESP32-S3 + LoRa)   │
   │  Direct TCP Sockets  │                       │  433T30D Long-Range  │
   └──────────┬───────────┘                       └──────────┬───────────┘
              │                                               │
              └───────────────────────┬───────────────────────┘
                                      │
                                      ▼
             ┌─────────────────────────────────────────────────┐
             │       FIPS 203 ML-KEM-768 + AES-256-GCM        │
             │           Post-Quantum Secure Tunnel            │
             └─────────────────────────────────────────────────┘
```

---

## 🔌 Hardware Schematic & Circuit Design

QuantuSecure includes hardware gateway schematics for off-grid, long-range peer-to-peer transmission via the **ESP32-S3** microcontroller and the **EBYTE E220/E32 433T30D (SX1262 / SX1278)** 1-Watt 433MHz high-power LoRa module.

<div align="center">
  <br />
  <img src="./Circuit_Diagram/krypton_circuit.png" alt="Krypton Circuit Diagram" width="92%" style="border-radius: 12px; border: 1px solid #00C853; box-shadow: 0 8px 32px rgba(0, 200, 83, 0.2);" />
  <br />
  <em><b>Figure 1:</b> Hardware wiring schematic for QuantuSecure (Krypton) ESP32-S3 and 433T30D LoRa Transceiver module.</em>
  <br /><br />
</div>

### 🧩 Hardware Component Pinout & Interfacing

| Component | Pin / Interface | ESP32-S3 Connection | Function / Description |
|---|---|---|---|
| **EBYTE 433T30D** | `VCC` | `5V / 3.3V (External 1A Regulator)` | High-power RF amplification supply rail |
| **EBYTE 433T30D** | `GND` | `GND (Common Ground Plane)` | RF ground reference |
| **EBYTE 433T30D** | `RXD` | `GPIO 17 (TXD2)` | Hardware UART data transmission from MCU |
| **EBYTE 433T30D** | `TXD` | `GPIO 18 (RXD2)` | Hardware UART data reception into MCU |
| **EBYTE 433T30D** | `M0` | `GPIO 4` | Operating mode selector (Transparent / Config) |
| **EBYTE 433T30D** | `M1` | `GPIO 5` | Operating mode selector (Sleep / Normal) |
| **EBYTE 433T30D** | `AUX` | `GPIO 6` | Buffer state indicator & sleep wakeup trigger |
| **Antenna** | `SMA-K 50Ω` | `433MHz Whip / Dipole Antenna` | Long-range sub-GHz RF transmission |

---

## 🔐 Cryptographic Stack & Specifications

<div align="center">

| Layer | Primitive / Standard | Security Parameters | Cryptographic Purpose |
|---|---|---|---|
| **Key Encapsulation** | **ML-KEM-768** *(Kyber-768)* | NIST FIPS 203 / Category 3 (~128-bit quantum security) | Quantum-safe session secret establishment |
| **Digital Signatures** | **Ed25519** *(Falcon-512 Ready)* | Curve25519 / SHA-512 | Handshake transcript authentication |
| **Key Derivation** | **HKDF-SHA256** | RFC 5869 (Extract & Expand) | Symmetric session key derivation |
| **Payload Cipher** | **AES-256-GCM** | 256-bit Key, 96-bit IV, 128-bit Tag | AEAD message encryption & integrity |
| **Anti-Replay** | **Sequence Tracker** | 64-bit strictly monotonic counter | Replay attack & reordering defense |
| **Fingerprint** | **SHA-256 Digest** | Hex-formatted colon-delimited string | Out-of-band visual key verification |

</div>

<details>
<summary><b>🔬 Click to expand Mathematical Security Rationale</b></summary>
<br />

### Module Learning with Errors (MLWE)
ML-KEM-768 bases its security on the hardness of the Module Learning with Errors problem over polynomial rings:
$$R_q = \mathbb{Z}_q[X]/(X^{256} + 1)$$
With matrix dimensions $k=3$ and modulus $q=3329$, ML-KEM-768 provides **NIST Security Category 3** protection, requiring $>2^{140}$ classical operations and $>2^{128}$ quantum operations to break—well beyond the capabilities of any envisioned quantum computer.

### Authenticated Encryption with Associated Data (AEAD)
Every message payload is encrypted under AES-256 in Galois/Counter Mode (GCM). The 128-bit authentication tag guarantees that tampering, byte-flipping, or truncation by network adversaries causes decryption failure and immediate socket teardown.
</details>

---

## 🔄 5-Step PQC Handshake Protocol

Before any message can be transmitted, QuantuSecure runs a **cryptographically bound 5-step quantum handshake**:

```
      INITIATOR (Node A)                                    RESPONDER (Node B)
      ==================                                    ==================
              │                                                      │
              │  1. HANDSHAKE_HELLO (kemPubKey_A, sigPubKey_A, port) │
              ├─────────────────────────────────────────────────────►│
              │                                                      │
              │  2. HANDSHAKE_HELLO (kemPubKey_B, sigPubKey_B, port) │
              │◄─────────────────────────────────────────────────────┤
              │                                                      │
              │  [Node A encapsulates sharedSecret against Node B]   │
              │  3. HANDSHAKE_KEM_RESP (ciphertext_AB)              │
              ├─────────────────────────────────────────────────────►│
              │                                                      │
              │  [Node A signs transcript: (Hello_A || Hello_B || Ciphertext)]
              │  4a. HANDSHAKE_AUTH (signature_A)                    │
              ├─────────────────────────────────────────────────────►│
              │                                                      │
              │                       [Node B decapsulates sharedSecret]
              │                       [Node B signs transcript: (Hello_B || Hello_A || Ciphertext)]
              │  4b. HANDSHAKE_AUTH (signature_B)                    │
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

<table>
  <tr>
    <td width="50%">
      <h3>🌐 Direct P2P Addressing</h3>
      Connect to any peer instantly using <code>IP:Port</code> (e.g. <code>127.0.0.1:5051</code> on localhost or <code>192.168.1.14:5050</code> on LAN). Zero user registration, zero central phone directory.
    </td>
    <td width="50%">
      <h3>🛡️ Unknown Sender Shield</h3>
      Incoming connections from unlisted peers display an inline safety banner with 1-click <b>SAVE CONTACT</b> or <b>BLOCK PEER</b> controls.
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🖱️ Right-Click Context Menu</h3>
      Full dark glassmorphic right-click menu and header <code>⋮</code> menu for:
      <ul>
        <li>✏️ Rename Contact / Save Peer</li>
        <li>🔒 Inspect Public Keys & Fingerprints</li>
        <li>🚫 Instant Block / Unblock</li>
        <li>✕ Close / Delete Conversation</li>
      </ul>
    </td>
    <td width="50%">
      <h3>💾 Atomic Flat-JSON Storage</h3>
      Zero SQL setup or daemon requirement. Uses crash-safe atomic write patterns (<code>.tmp</code> write &rarr; atomic filesystem rename) for <code>contacts.json</code>, <code>blocked.json</code>, and per-contact message histories.
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🎨 Cyber-Defense UI & UX</h3>
      Mac-style frameless window with interactive traffic lights (🔴 Close, 🟡 Minimize, 🟢 Maximize/Restore), GSAP micro-animations, and live typing indicators.
    </td>
    <td width="50%">
      <h3>⚡ Auto Port Supervisor</h3>
      Interactive CLI port scanner (ports 5173–5179) with automatic TCP collision detection and auto-increment fallback.
    </td>
  </tr>
</table>

---

## 📁 Project Architecture & Structure

```
Quantu Secure/
│
├── Circuit_Diagram/                    # 🔌 Hardware Schematics & CAD
│   ├── krypton_circuit.png             # Full circuit wiring diagram
│   ├── krypton_circuit.fzz             # Fritzing editable CAD file
│   ├── 433T30D.fzpz                    # LoRa SX1262 Fritzing part
│   └── esp32-s3-devkitc-1.fzpz         # ESP32-S3 DevKitC part
│
├── Hardware_code/                      # 🤖 ESP32-S3 Microcontroller Firmware
│
├── Web_App/                            # 💻 Electron Desktop Application
│   ├── main.js                         # Electron Main process (TCP manager, IPC, window)
│   ├── preload.js                      # Context isolation security bridge
│   ├── package.json                    # Dependencies & packaging metadata
│   ├── vite.config.js                  # Vite configuration
│   │
│   ├── scripts/
│   │   └── dev.js                      # Interactive multi-port dev launcher
│   │
│   └── src/
│       ├── crypto/                     # 🔐 Cryptographic Subsystem
│       │   ├── pqc.js                  # ML-KEM-768 & Ed25519 signing primitives
│       │   ├── session.js              # AES-256-GCM, HKDF-SHA256, Sequence Tracker
│       │   └── identity.js             # Node identity keypair generation & storage
│       │
│       ├── network/                    # 📡 TCP Networking Subsystem
│       │   ├── protocol.js             # 4-byte length-prefix framing (FrameParser)
│       │   ├── peer.js                 # PeerConnection state machine & handshake
│       │   └── server.js               # PeerManager singleton & TCP server
│       │
│       ├── storage/                    # 🗄️ JSON Persistence Layer
│       │   ├── store.js                # Atomic filesystem read/write engine
│       │   ├── contacts.js             # Contacts & Blocklist CRUD
│       │   └── messages.js             # Per-contact message histories
│       │
│       └── renderer/                   # 🎨 React 18 UI
│           ├── App.jsx                 # App root & modal coordinator
│           ├── store/useAppStore.js    # Zustand state store
│           ├── components/             # React modular components
│           │   ├── Sidebar.jsx         # Contact list & navigation
│           │   ├── ConversationView.jsx# Active chat stream & safety banner
│           │   ├── ContextMenu.jsx     # Right-click dark glassmorphic popup
│           │   ├── SecurityDetailsModal.jsx # Key inspector modal
│           │   ├── AddPeerModal.jsx    # Handshake initiator modal
│           │   ├── RenameContactModal.jsx # Contact rename modal
│           │   └── WindowControls.jsx  # macOS-style traffic lights
│           └── styles/                 # CSS Design System
│
├── Mobile_App/                         # 📱 Mobile Client Package
└── Paper/                              # 📄 Project Synopsis & Documentation
```

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher
- **Git**

### Clone & Install
```bash
# Clone the repository
git clone https://github.com/<your-username>/QuantuSecure.git
cd "QuantuSecure/Web_App"

# Install dependencies
npm install
```

---

## 💻 Running the Application

### 🟢 Single Instance Mode
```powershell
npm run dev
```
1. The CLI scans available ports and displays an interactive menu:
```
  QuantuSecure    PQC-Secured LAN Chat
  ──────────────────────────────────────
  ML-KEM-768 · AES-256-GCM · HKDF-SHA256

  Select renderer port:
   [1] 5173  ← default
   [2] 5174
   ...
```
2. Press **Enter** to accept the default port. The Vite dev server and Electron app launch automatically.

---

### 👥 Dual Instance Simulation (P2P Localhost Handshake)

To test post-quantum encrypted chatting between two local nodes on the same PC:

#### **Terminal 1 (Instance A — Port 5050 / Renderer 5173):**
```powershell
cd "d:\Work\IOT\Quantu Secure\Web_App"
npm run dev
# Choose Port 1 (5173)
```

#### **Terminal 2 (Instance B — Port 5051 / Renderer 5174):**
```powershell
cd "d:\Work\IOT\Quantu Secure\Web_App"
$env:NODE_ENV='development'; npx electron . --user-data-dir="C:\tmp\quantu-b"
```

#### **Connecting the Peers:**
1. In **Instance A**, click the green **`+`** button (bottom left).
2. Enter **`127.0.0.1:5051`** (Instance B's listening port).
3. Click **`INITIATE HANDSHAKE`** &rarr; **`SAVE CONTACT`**.
4. Both nodes will display an active online connection with full quantum encryption.

---

## 📦 Building for Production

```powershell
cd "d:\Work\IOT\Quantu Secure\Web_App"
npm run build
```
Packaged binaries (`.exe` on Windows, `.dmg` on macOS, `.AppImage` on Linux) will be generated in `Web_App/release/`.

---

<div align="center">

### 🛠️ Technology Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=js,nodejs,react,electron,vite,cpp,arduino,git,vscode" alt="Tech Stack" />
</p>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png" alt="line" width="100%" />

### 🛡️ Compliance & Standards
*Cryptographic primitives strictly conform to **NIST FIPS 203 (ML-KEM)** and **RFC 5869 / RFC 5116 (AEAD)** standards.*

**QuantuSecure (Krypton)** • *Engineered for the Post-Quantum Era.*

</div>
