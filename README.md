<div align="center">

# 🛡️⚡ Kπyρτόn_wave~ (κρυπτόν_wave~)
### *Post-Quantum Cryptographic Networking Experiment & Real-Time Traffic Laboratory*

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=24&duration=3000&pause=1000&color=00FF66&center=true&vCenter=true&width=700&lines=Kπyρτόn_wave~+PQC+Networking+Experiment;NIST+FIPS+203+ML-KEM-768+Key+Exchange;NIST+FIPS+206+Falcon-512+Digital+Signatures;Direct+AES-256-GCM+Encryption+(Zero-HKDF);Live+Wireshark+Packet+Inspection+Mode)](https://git.io/typing-svg)

<p align="center">
  <img src="https://img.shields.io/badge/Key_Exchange-NIST_FIPS_203_(ML--KEM--768)-00BFFF?style=for-the-badge&logo=shield&logoColor=white" alt="ML-KEM-768" />
  <img src="https://img.shields.io/badge/Signatures-NIST_FIPS_206_(Falcon--512)-FF8C00?style=for-the-badge&logo=auth0&logoColor=white" alt="Falcon-512" />
  <img src="https://img.shields.io/badge/Encryption-AES--256--GCM-FF3131?style=for-the-badge&logo=lock&logoColor=white" alt="AES-256-GCM" />
  <img src="https://img.shields.io/badge/Analysis-Wireshark_Mode-A855F7?style=for-the-badge&logo=wireshark&logoColor=white" alt="Wireshark Mode" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-33.2.1-47848F?style=flat-square&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6.0.5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/@noble/post--quantum-0.7.0-00C853?style=flat-square&logo=npm&logoColor=white" alt="Noble" />
  <img src="https://img.shields.io/badge/ESP32--S3-DevKitC--1-E7352C?style=flat-square&logo=espressif&logoColor=white" alt="ESP32" />
  <img src="https://img.shields.io/badge/LoRa-433MHz_SX1262-FF6F00?style=flat-square&logo=satellite&logoColor=white" alt="LoRa" />
</p>

<p align="center">
  <a href="#-whats-new-in-kπyρτόn_wave">What's New</a> •
  <a href="#-cryptographic-stack--specifications">Cryptographic Stack</a> •
  <a href="#-the-4-interactive-protocol-toggles">Interactive Toggles</a> •
  <a href="#-5-step-pqc-handshake-protocol">Handshake Protocol</a> •
  <a href="#-real-wireshark-packet-capture-experiment">Wireshark Guide</a> •
  <a href="#-hardware-schematic--circuit-design">Hardware & Circuit</a> •
  <a href="#-running-the-application">Running</a>
</p>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png" alt="line" width="100%" />

</div>

---

## 🚀 What's New in Kπyρτόn_wave~ (Latest Update)

> [!IMPORTANT]
> The project has evolved from a basic encrypted messenger into **`Kπyρτόn_wave~`**—a fully functional **post-quantum cryptographic networking experiment**. Every toggle directly alters the raw TCP socket packets captured in the standalone **Wireshark** application.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             WHAT CHANGED IN THIS UPDATE                          │
├──────────────────────────────────────────────────────────────────────────────────┤
│  1. NIST FIPS 206 Falcon-512  │ Upgraded from Ed25519 to genuine post-quantum    │
│                               │ Fast-Fourier lattice signatures (~660B).         │
│  2. Zero-HKDF Architecture    │ Removed HKDF-SHA256 completely; ML-KEM-768       │
│                               │ 32-byte shared secret maps directly to AES-256.  │
│  3. 4 Real Protocol Toggles   │ ML-KEM-768, Falcon-512, AES-256, Wireshark Mode  │
│                               │ with individual neon-glowing control switches.   │
│  4. Wireshark Analysis Frames │ Emits readable companion metadata frames over    │
│                               │ TCP for educational inspection in Wireshark.     │
│  5. Live Crypto Telemetry     │ Real-time log table showing raw packet size,     │
│                               │ IV/tag hex snippets, direction, and timestamps.  │
│  6. Electron ESM Bridge       │ Dynamic import loader solving ERR_REQUIRE_ESM.   │
│  7. Auto-Migration            │ Backs up legacy keys and regenerates Falcon-512. │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Executive Summary

**`Kπyρτόn_wave~`** is a decentralized, zero-server desktop messenger and hardware gateway engineered for absolute immunity against **"Harvest Now, Decrypt Later" (HNDL)** quantum computing threats.

Traditional messaging systems rely on classical asymmetric cryptography (RSA, ECDH) to exchange session keys. These schemes are mathematically vulnerable to Shor's algorithm running on future Cryptanalytically Relevant Quantum Computers (CRQCs). `Kπyρτόn_wave~` eliminates this vulnerability by pairing **NIST FIPS 203 ML-KEM-768** post-quantum key encapsulation with **NIST FIPS 206 Falcon-512** digital signatures and **AES-256-GCM** authenticated payload encryption over direct peer-to-peer TCP networks and 433MHz LoRa physical links.

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
             │       FIPS 203 ML-KEM + FIPS 206 Falcon-512     │
             │           Post-Quantum Secure Tunnel            │
             └─────────────────────────────────────────────────┘
```

---

## 🔐 Cryptographic Stack & Specifications

<div align="center">

| Layer | Primitive / Standard | Security Parameters | Cryptographic Purpose |
|---|---|---|---|
| **Key Encapsulation** | **ML-KEM-768** | NIST FIPS 203 / Category 3 (~128-bit quantum security) | Quantum-safe session secret establishment |
| **Digital Signatures** | **Falcon-512** | NIST FIPS 206 / Category 1 lattice signatures | Handshake transcript authentication |
| **Payload Cipher** | **AES-256-GCM** | 256-bit Key, 96-bit IV, 128-bit Tag | AEAD message encryption & integrity |
| **Anti-Replay** | **Sequence Tracker** | 64-bit strictly monotonic counter | Replay attack & reordering defense |
| **Fingerprint** | **SHA-256 Digest** | Hex-formatted colon-delimited string | Out-of-band visual key verification |

</div>

<details>
<summary><b>🔬 Click to expand Mathematical Security Rationale & Key Sizes</b></summary>
<br />

### 1. Module Learning with Errors (MLWE) — ML-KEM-768
ML-KEM-768 bases its security on the hardness of the Module Learning with Errors problem over polynomial rings:
$$R_q = \mathbb{Z}_q[X]/(X^{256} + 1)$$
With matrix dimensions $k=3$ and modulus $q=3329$, ML-KEM-768 provides **NIST Security Category 3** protection ($>2^{128}$ quantum operations to break).
* **Public Key:** `1,184 bytes`
* **Ciphertext:** `1,088 bytes`
* **Shared Secret:** Exactly `32 bytes` (256 bits)

### 2. Fast Fourier Lattice Signatures — Falcon-512
Falcon-512 is based on the Short Integer Solution (SIS) problem over NTRU lattices using Fast Fourier orthogonalization and trapdoor Gaussian sampling.
* **Public Key:** `897 bytes` (FIPS 206 compliant)
* **Secret Key:** `1,281 bytes`
* **Signature Size:** `~660 bytes` (attached format)

### 3. Direct 32-Byte Key Mapping (Zero-HKDF)
ML-KEM-768 decapsulation already outputs a cryptographically uniform 32-byte secret (derived via SHAKE-256 internally). This 32-byte secret is mapped **directly** to the AES-256-GCM key with zero intermediate HMAC expansions.

### 4. Authenticated Encryption with Associated Data (AEAD)
Every message payload is encrypted under AES-256-GCM with a 96-bit random IV and sequence-numbered AAD. The 128-bit authentication tag guarantees that byte-flipping, truncation, or tampering triggers immediate socket rejection.
</details>

---

## 🎛️ The 4 Interactive Protocol Toggles

Inside the **Identity & Settings** screen, four glowing switches allow full experimental control over the network traffic:

```
┌─────────────────────────┐    ┌─────────────────────────┐
│   ML-KEM-768 (Blue)     │    │   Falcon-512 (Orange)   │
│  ● ON  : NIST FIPS 203  │    │  ● ON  : NIST FIPS 206  │
│  ○ OFF : Classical ECDH │    │  ○ OFF : Skip Auth      │
└─────────────────────────┘    └─────────────────────────┘
┌─────────────────────────┐    ┌─────────────────────────┐
│   AES-256-GCM (Red)     │    │ WIRESHARK MODE (Purple) │
│  ● ON  : Ciphertext     │    │  ● ON  : ANALYSIS Frame │
│  ○ OFF : Raw Plaintext  │    │  ○ OFF : Silent Frames  │
└─────────────────────────┘    └─────────────────────────┘
```

| Toggle Combination | TCP Wire Difference Captured in Wireshark (Port `5050`) |
|---|---|
| **ALL ON (Default)** | Handshake exchanges `ML-KEM-768` (~1088B) + `Falcon-512` (~660B) auth signatures. Messages appear as base64 ciphertext in `CHAT_MESSAGE` frames. Plaintext is **100% invisible**. |
| **AES OFF** | Messages are transmitted as unencrypted JSON: `{"type":"CHAT_MESSAGE_PLAIN","content":"<your readable message>"}`. Plaintext is **directly readable** in Wireshark. |
| **ML-KEM OFF** | Replaces post-quantum `HANDSHAKE_KEM_RESP` (~1088B) with classical `ECDH_EXCHANGE` (~65B P-256 key exchange). |
| **Falcon-512 OFF** | `HANDSHAKE_AUTH` frames are completely omitted from the TCP stream. |
| **WIRESHARK MODE ON**| Encrypted message is immediately followed by a plaintext educational companion frame: `{"type":"ANALYSIS","data":"ML-KEM-768(Falcon-512(AES-256-GCM(iv:...:ct:...:tag:...)))"}` |

---

## 🔄 5-Step PQC Handshake Protocol

Before any message can be transmitted, `Kπyρτόn_wave~` executes a **cryptographically bound 5-step quantum handshake**:

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
              │  [Node A signs transcript with Falcon-512 Secret Key]│
              │  4a. HANDSHAKE_AUTH (falconSignature_A)              │
              ├─────────────────────────────────────────────────────►│
              │                                                      │
              │                       [Node B decapsulates sharedSecret]
              │                       [Node B signs transcript with Falcon-512 Secret Key]
              │  4b. HANDSHAKE_AUTH (falconSignature_B)              │
              │◄─────────────────────────────────────────────────────┤
              │                                                      │
              │  5a. HANDSHAKE_COMPLETE                              │
              ├─────────────────────────────────────────────────────►│
              │  5b. HANDSHAKE_COMPLETE                              │
              │◄─────────────────────────────────────────────────────┤
              │                                                      │
        [Direct 32-Byte AES Key]                               [Direct 32-Byte AES Key]
              │                                                      │
              │◄─────────── AES-256-GCM Encrypted Chat ─────────────►│
              │                                                      │
              │── (Optional) ANALYSIS Frame (Wireshark Mode) ───────►│
```

---

## 🔬 Real Wireshark Packet Capture Experiment

You can observe your cryptographic configuration altering packets in real-time:

### Step 1: Start Two Local Instances
In Terminal 1 (Node A on Port 5050):
```powershell
cd "d:\Work\IOT\Quantu Secure\Web_App"
npm run dev
# Select Port 1 (5173)
```

In Terminal 2 (Node B on Port 5051):
```powershell
cd "d:\Work\IOT\Quantu Secure\Web_App"
$env:ELECTRON_USER_DATA_DIR="$env:TEMP\krypton_peer2"
npm run dev
# Select Port 2 (5174)
```

### Step 2: Open Wireshark
1. Launch the standalone **Wireshark** application.
2. Select **Npcap Loopback Adapter** (for `127.0.0.1` traffic) or your local **Wi-Fi / Ethernet** interface.
3. Apply filter:
   ```wireshark
   tcp.port == 5050 || tcp.port == 5051
   ```

### Step 3: Run the Experiment
1. **Plaintext Test:** In Node A, toggle **AES-256-GCM** to `OFF`. Connect to `127.0.0.1:5051` and send `"Hello Plaintext"`. In Wireshark, right-click any packet &rarr; **Follow &rarr; TCP Stream** to see the unencrypted text.
2. **Encrypted + Analysis Test:** Toggle **AES-256-GCM** to `ON` and **WIRESHARK MODE** to `ON`. Send `"Encrypted Experiment"`. Inspect the TCP Stream to observe the encrypted payload followed by the nested `ANALYSIS` companion frame.

---

## 🔌 Hardware Schematic & Circuit Design

`Kπyρτόn_wave~` includes hardware gateway schematics for off-grid, long-range peer-to-peer transmission via the **ESP32-S3** microcontroller and the **EBYTE E220/E32 433T30D (SX1262 / SX1278)** 1-Watt 433MHz high-power LoRa module.

<div align="center">
  <br />
  <img src="./Circuit_Diagram/krypton_circuit.png" alt="Krypton Circuit Diagram" width="92%" style="border-radius: 12px; border: 1px solid #00C853; box-shadow: 0 8px 32px rgba(0, 200, 83, 0.2);" />
  <br />
  <em><b>Figure 1:</b> Hardware wiring schematic for Kπyρτόn_wave~ ESP32-S3 and 433T30D LoRa Transceiver module.</em>
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

## 📁 Project Architecture & Structure

```
Quantu Secure/
│
├── KRYPTON_WAVE_PQC_REPORT.md           # 📑 Detailed Engineering & PQC Report
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
│       │   ├── pqc.js                  # ML-KEM-768 & Falcon-512 dynamic ESM bridge
│       │   ├── session.js              # AES-256-GCM AEAD, zero-HKDF direct key & Wireshark Mode
│       │   └── identity.js             # Falcon-512 identity persistence & auto-migration
│       │
│       ├── network/                    # 📡 TCP Networking Subsystem
│       │   ├── protocol.js             # 4-byte framing (ECDH, PLAIN, ANALYSIS frames)
│       │   ├── peer.js                 # Config-aware TCP state machine & socket safety
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
│           │   ├── Sidebar.jsx         # Contact list & Kπyρτόn_wave~ wordmark
│           │   ├── ConversationView.jsx# Active chat, dynamic badge & WS banner
│           │   ├── IdentityScreen.jsx  # 4 security toggles & live packet telemetry
│           │   ├── WiresharkWarningBanner.jsx # Glowing purple warning banner
│           │   ├── ContextMenu.jsx     # Right-click dark glassmorphic popup
│           │   ├── SecurityDetailsModal.jsx # Key inspector & fingerprint modal
│           │   ├── AddPeerModal.jsx    # Handshake initiator modal
│           │   ├── RenameContactModal.jsx # Contact rename modal
│           │   └── WindowControls.jsx  # macOS-style traffic lights
│           └── styles/index.css        # CSS Design System & neon toggle glows
│
└── Paper/                              # 📄 Project Synopsis & Academic Research (Preserved)
```

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher
- **Git**
- **Wireshark** (optional, for live packet inspection)

### Clone & Install
```bash
git clone https://github.com/<your-username>/QuantuSecure.git
cd "QuantuSecure/Web_App"
npm install
```

---

## 💻 Running the Application

```powershell
cd "d:\Work\IOT\Quantu Secure\Web_App"
npm run dev
```

1. The CLI scans available ports and displays an interactive menu:
```
  Kπyρτόn_wave~    Post-Quantum Cryptographic Networking Experiment
  ──────────────────────────────────────────────────────────────────
  ML-KEM-768 · Falcon-512 · AES-256-GCM · Wireshark Analysis Mode

  Select renderer port:
   [1] 5173  ← default
   [2] 5174
   ...
```
2. Press **Enter** to accept the default port. Vite and Electron will launch automatically.

---

## 📦 Building for Production

```powershell
cd "d:\Work\IOT\Quantu Secure\Web_App"
npm run build
```
Packaged binaries will be output to `Web_App/release/`.

---

<div align="center">

### 🛡️ Compliance & Standards
*Cryptographic primitives strictly conform to **NIST FIPS 203 (ML-KEM-768)**, **NIST FIPS 206 (Falcon-512)**, and **NIST SP 800-38D (AES-256-GCM)**.*

**Kπyρτόn_wave~** • *Post-Quantum Cryptographic Networking Laboratory.*

</div>
