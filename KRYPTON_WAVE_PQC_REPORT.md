<div align="center">

# 🛡️⚡ Kπyρτόn_wave~ (κρυπτόν_wave~)
### *Comprehensive Engineering Report & Changelog: Post-Quantum Protocol Evolution*

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Courier+New&weight=700&size=20&duration=3000&pause=1000&color=00FF41&center=true&vCenter=true&width=750&lines=Kπyρτόn_wave~+PQC+Networking+Experiment;NIST+FIPS+203+ML-KEM-768+Key+Exchange;NIST+FIPS+206+Falcon-512+Digital+Signatures;Pure+AES-256-GCM+Encryption+(Zero-HKDF);Real-Time+Wireshark+Packet+Inspection+Mode)](https://git.io/typing-svg)

<p align="center">
  <img src="https://img.shields.io/badge/KEM-NIST_FIPS_203_(ML--KEM--768)-00BFFF?style=for-the-badge&logo=shield&logoColor=white" alt="ML-KEM-768" />
  <img src="https://img.shields.io/badge/Signature-NIST_FIPS_206_(Falcon--512)-FF8C00?style=for-the-badge&logo=auth0&logoColor=white" alt="Falcon-512" />
  <img src="https://img.shields.io/badge/Cipher-AES--256--GCM_(256--bit)-FF3131?style=for-the-badge&logo=lock&logoColor=white" alt="AES-256-GCM" />
  <img src="https://img.shields.io/badge/Analysis-Wireshark_Mode-A855F7?style=for-the-badge&logo=wireshark&logoColor=white" alt="Wireshark" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-33.2.1-47848F?style=flat-square&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6.0.5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/@noble/post--quantum-0.7.0-00C853?style=flat-square&logo=npm&logoColor=white" alt="Noble" />
  <img src="https://img.shields.io/badge/TCP_Port-5050_/_5051-black?style=flat-square&logo=target&logoColor=00FF41" alt="Port" />
</p>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png" alt="line" width="100%" />

</div>

---

## 📑 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Full Changelog of Today's Work](#2-full-changelog-of-todays-work)
3. [Deep Dive: Post-Quantum Cryptography (PQC) Implementation](#3-deep-dive-post-quantum-cryptography-pqc-implementation)
   - [ML-KEM-768 (NIST FIPS 203)](#ml-kem-768-nist-fips-203)
   - [Falcon-512 (NIST FIPS 206)](#falcon-512-nist-fips-206)
   - [Direct 32-Byte Key Application (Total Removal of HKDF)](#direct-32-byte-key-application-total-removal-of-hkdf)
4. [Deep Dive: How Falcon-512 & Pure ESM Were Made Compatible with Electron](#4-deep-dive-how-falcon-512--pure-esm-were-made-compatible-with-electron)
   - [The Problem: `ERR_REQUIRE_ESM`](#the-problem-err_require_esm)
   - [The Solution: Asynchronous Dynamic `import()` Bridge](#the-solution-asynchronous-dynamic-import-bridge)
   - [Automatic Identity Key Migration](#automatic-identity-key-migration)
5. [The 4 Interactive Security Toggles & Wire-Level Packet Anatomy](#5-the-4-interactive-security-toggles--wire-level-packet-anatomy)
   - [Toggle Behavior Matrix](#toggle-behavior-matrix)
   - [Wireshark Analysis Mode (Plaintext Companion Frames)](#wireshark-analysis-mode-plaintext-companion-frames)
6. [User Interface & Visual Laboratory Experience](#6-user-interface--visual-laboratory-experience)
7. [Step-by-Step Real Wireshark Experiment Guide](#7-step-by-step-real-wireshark-experiment-guide)
8. [Automated Test Suite & Verification Results](#8-automated-test-suite--verification-results)
9. [File Inventory](#9-file-inventory)

---

## 1. Executive Summary

Today, the **QuantuSecure** codebase was systematically transformed into **`Kπyρτόn_wave~`** (`κρυπτόν_wave~`)—an advanced cryptographic networking laboratory designed to allow real-time observation of quantum-resilient protocols using the **real Wireshark application**.

### Core Achievements:
1. **Full NIST Post-Quantum Suite:** Upgraded cryptography to **ML-KEM-768** (FIPS 203) for key exchange and **Falcon-512** (FIPS 206) for digital signatures, paired directly with **AES-256-GCM** authenticated payload encryption.
2. **Total Removal of HKDF:** Completely eliminated HKDF-SHA256 across all files; the 32-byte pseudorandom shared secret output by ML-KEM-768 is now mapped directly to the 256-bit AES session key.
3. **Four Real Protocol Toggles:** Added 4 live switches (`ML-KEM-768`, `Falcon-512`, `AES-256-GCM`, `WIRESHARK MODE`) that physically alter the TCP wire bytes transmitted on port 5050.
4. **Electron ESM Compatibility:** Solved Node/Electron CommonJS vs Pure ESM module conflicts with a high-performance dynamic import bridge.
5. **Real-Time Telemetry & Visuals:** Built a live packet telemetry log, dynamic security badges, purple Wireshark alert banners, and a cybersecurity laboratory visual style.

> [!IMPORTANT]
> **No Simulation:** Every single packet captured in Wireshark originates from real Node.js `net.Socket` networking calls and real cryptographic output.

---

## 2. Full Changelog of Today's Work

| Area | Modification | Reason / Benefit |
|---|---|---|
| **Branding** | Renamed project across all app files to **`Kπyρτόn_wave~`** (kept `Paper/` untouched) | User specification for new project identity |
| **Signatures** | Replaced Ed25519 with **NIST FIPS 206 Falcon-512** | Genuine post-quantum lattice-based digital signatures |
| **Dependencies** | Upgraded `@noble/post-quantum` from `^0.2.1` to `^0.7.0` | Required for native Falcon-512 implementation |
| **ESM Bridge** | Replaced synchronous `require()` in `pqc.js` with `initPQC()` dynamic `import()` | Fixed Electron 33 `ERR_REQUIRE_ESM` crash |
| **Key Derivation** | **Completely removed HKDF-SHA256** from backend, UI, and docs | Direct 32-byte ML-KEM shared secret mapping to AES-256 key |
| **Handshake** | Redesigned `peer.js` state machine to be fully toggle-aware | Supports conditional KEM (vs ECDH), conditional Falcon-512 auth, and conditional AES encryption |
| **Bug Fix** | Fixed duplicate `_sendAuth()` call in initiator handshake | Prevented sending authentication before key exchange completed |
| **Socket Fix** | Added `socket.readyState === 'open'` check in `peer.js` | Handshake triggers immediately even if socket already connected |
| **Wireshark Mode** | Created `ANALYSIS` message frame type in `protocol.js` | Transmits readable nested analysis string with real hex metadata |
| **Main Process** | Added `get-security-config` and `set-security-config` IPCs, plus `crypto-event` push | Allows renderer to dynamically control TCP crypto parameters live |
| **UI Toggles** | Added 4 glowing switches in `IdentityScreen.jsx` with per-algorithm colors | `#00BFFF` (Blue), `#FF8C00` (Orange), `#FF3131` (Red), `#A855F7` (Purple) |
| **Telemetry** | Built `LIVE CRYPTO TELEMETRY` table in `IdentityScreen.jsx` | Displays real-time message byte counts, direction, timestamps, IV, and tag |
| **Chat Header** | Made `ConversationView` encryption badge dynamic | Reflects active layers (`ML-KEM-768 · Falcon-512 · AES-256` or `⚠ PLAIN`) |
| **Banner** | Created `WiresharkWarningBanner.jsx` | Alerts users when plaintext debug analysis frames are being transmitted |
| **Identity Migration**| Added auto-detection and backup of legacy Ed25519 identity files | Creates `identity.json.backup-<timestamp>` and regenerates Falcon-512 keys |

---

## 3. Deep Dive: Post-Quantum Cryptography (PQC) Implementation

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        Kπyρτόn_wave~ PROTOCOL STACK                        │
├────────────────────────────────────────────────────────────────────────────┤
│  Layer 1: Key Encapsulation  │  ML-KEM-768 (NIST FIPS 203)                 │
│  Layer 2: Digital Signatures │  Falcon-512 (NIST FIPS 206)                 │
│  Layer 3: Payload Cipher     │  AES-256-GCM (Direct 256-bit Key, AEAD)     │
│  Layer 4: Educational Debug  │  Wireshark Analysis Mode (Plaintext Frames) │
└────────────────────────────────────────────────────────────────────────────┘
```

### ML-KEM-768 (NIST FIPS 203)
* **Underlying Hardness:** Module Learning with Errors (MLWE) over polynomial rings $R_q = \mathbb{Z}_q[X]/(X^{256} + 1)$ with $k=3$ and modulus $q=3329$.
* **NIST Security Level:** Category 3 (~128-bit quantum security, equivalent to AES-192).
* **Wire Profile:**
  * **Public Key:** `1,184 bytes` (exchanged in `HANDSHAKE_HELLO`)
  * **Secret Key:** `2,400 bytes` (stored locally on device)
  * **Ciphertext:** `1,088 bytes` (transmitted in `HANDSHAKE_KEM_RESP`)
  * **Shared Secret:** Exactly `32 bytes` (256 bits of uniform entropy)

### Falcon-512 (NIST FIPS 206)
* **Underlying Hardness:** Short Integer Solution (SIS) problem over NTRU lattices using Fast Fourier orthogonalization and Gaussian sampling.
* **NIST Security Level:** Category 1 (~128-bit classical security, resilient against quantum forgery).
* **Wire Profile:**
  * **Public Key:** `897 bytes` (FIPS 206 format)
  * **Secret Key:** `1,281 bytes`
  * **Signature:** `~660 bytes` (transmitted in `HANDSHAKE_AUTH`)
  * **Fingerprint:** Deterministic SHA-256 digest of the 897-byte public key formatted as `XXXX:XXXX:XXXX:...`

### Direct 32-Byte Key Application (Total Removal of HKDF)
Previously, the system passed the KEM shared secret through HKDF-SHA256 (RFC 5869). Per NIST FIPS 203 specifications, the ML-KEM decapsulation process already applies an internal hash (SHAKE-256 / SHA3) to yield a uniformly distributed 32-byte pseudorandom key. 

We simplified the architecture by eliminating HKDF entirely:
```javascript
function deriveSessionKey(sharedSecret) {
  const buf = Buffer.from(sharedSecret);
  if (buf.length === 32) return buf;
  if (buf.length > 32) return buf.subarray(0, 32);
  const padded = Buffer.alloc(32, 0);
  buf.copy(padded);
  return padded;
}
```
The 32-byte shared secret is now directly fed into Node.js `crypto.createCipheriv('aes-256-gcm', sessionKey, iv)`.

---

## 4. Deep Dive: How Falcon-512 & Pure ESM Were Made Compatible with Electron

### The Problem: `ERR_REQUIRE_ESM`
When upgrading `@noble/post-quantum` to `v0.7.0` to obtain native Falcon-512 support, the package declared `"type": "module"` in its `package.json` and distributed pure ES modules. 

In Electron 33's main process (which runs CommonJS):
```
Error [ERR_REQUIRE_ESM]: require() of ES Module .../@noble/post-quantum/ml-kem.js 
from .../src/crypto/pqc.js not supported.
Instead change the require ... to a dynamic import()
```

### The Solution: Asynchronous Dynamic `import()` Bridge
Because cryptographic functions like `kemEncapsulate()`, `sign()`, and `verify()` are called synchronously inside high-speed network event handlers (`_onFrame`, `_onHello`), they could not all be refactored into async functions without cascading timing bugs across the TCP state machine.

We designed a **pre-warmed dynamic import singleton**:

```javascript
// src/crypto/pqc.js
let ml_kem768 = null;
let falcon512 = null;

// 1. Immediately trigger ESM loading at require() time
const initPromise = (async () => {
  try {
    const [kemMod, falconMod] = await Promise.all([
      import('@noble/post-quantum/ml-kem.js'),
      import('@noble/post-quantum/falcon.js'),
    ]);
    ml_kem768 = kemMod.ml_kem768;
    falcon512 = falconMod.falcon512;
  } catch (err) {
    console.error('[pqc] Error loading post-quantum ES modules:', err);
  }
})();

// 2. Export initPQC() to guarantee resolution before app ready
async function initPQC() {
  await initPromise;
  if (!ml_kem768 || !falcon512) {
    throw new Error('[pqc] Post-quantum modules failed to initialize.');
  }
}

// 3. Keep cryptographic operations synchronous
function kemKeyGen() {
  ensureReady();
  const keys = ml_kem768.keygen();
  return { kemPublicKey: toB64(keys.publicKey), kemSecretKey: toB64(keys.secretKey) };
}
```

In `main.js`:
```javascript
app.whenReady().then(async () => {
  const { initPQC } = require('./src/crypto/pqc');
  await initPQC(); // Awaited once at boot!
  ...
});
```

### Falcon-512 Signature Mode: Attached `seal()` & `open()`
In `@noble/post-quantum` v0.7.0, Falcon-512 uses an attached format where signature and message are bundled:
* **Signing:** `const sealed = falcon512.attached.seal(msgUint8Array, secretKey);` (produces `~660 + msgLen` bytes)
* **Verification:** `const recovered = falcon512.attached.open(sealed, publicKey);` (recovers the original message and validates NTRU polynomial bounds; returns `null` if forged)

### Automatic Identity Key Migration
Legacy `identity.json` files generated with Ed25519 are incompatible with Falcon-512. In `src/crypto/identity.js`, we implemented an automatic migration detector:
```javascript
if (id.sigAlgorithm && id.sigAlgorithm === 'Falcon-512') {
  return id;
} else {
  // Automatically back up old identity
  const backupPath = identityPath + '.backup-' + Date.now();
  fs.copyFileSync(identityPath, backupPath);
  // Generate fresh Falcon-512 + ML-KEM-768 keypair
  ...
}
```

---

## 5. The 4 Interactive Security Toggles & Wire-Level Packet Anatomy

```
┌─────────────────────────┐    ┌─────────────────────────┐
│     ML-KEM-768 (KEM)    │    │    Falcon-512 (AUTH)    │
│  ● ON  : NIST FIPS 203  │    │  ● ON  : NIST FIPS 206  │
│  ○ OFF : Classical ECDH │    │  ○ OFF : No Signature   │
└─────────────────────────┘    └─────────────────────────┘
┌─────────────────────────┐    ┌─────────────────────────┐
│     AES-256-GCM (ENC)   │    │      WIRESHARK MODE     │
│  ● ON  : Ciphertext AEAD│    │  ● ON  : ANALYSIS Frame │
│  ○ OFF : Raw Plaintext  │    │  ○ OFF : Silent Mode    │
└─────────────────────────┘    └─────────────────────────┘
```

### Toggle Behavior Matrix

| Toggle Config | TCP Handshake Packets | Message Frame (`CHAT_MESSAGE`) | Wireshark Companion (`ANALYSIS`) |
|---|---|---|---|
| **ALL ON (Default)** | `HELLO` + `KEM_RESP` (~1088B) + `AUTH` (~660B) + `COMPLETE` | Base64 Ciphertext, 96-bit IV, 128-bit Tag | None |
| **AES OFF** | `HELLO` + `KEM_RESP` + `AUTH` + `COMPLETE` | `{"type":"CHAT_MESSAGE_PLAIN","content":"hello"}` | None |
| **ML-KEM OFF** | `HELLO` + `ECDH_EXCHANGE` (~65B) + `AUTH` + `COMPLETE` | Base64 Ciphertext | None |
| **Falcon-512 OFF** | `HELLO` + `KEM_RESP` + `COMPLETE` *(No `AUTH` frame)* | Base64 Ciphertext | None |
| **ALL ON + WIRESHARK**| `HELLO` + `KEM_RESP` + `AUTH` + `COMPLETE` | Base64 Ciphertext | `{"type":"ANALYSIS","data":"ML-KEM-768(Falcon-512(AES-256-GCM(...)))"}` |
| **ALL OFF + WIRESHARK**| `HELLO` + `ECDH_EXCHANGE` + `COMPLETE` | Raw Plaintext | `{"type":"ANALYSIS","data":"data(<plaintext>)"}` |

### Wireshark Analysis Mode (Plaintext Companion Frames)
When **WIRESHARK MODE** is toggled **ON**, the application intentionally transmits a secondary ASCII analysis frame immediately following the primary message:

```json
{
  "type": "ANALYSIS",
  "data": "ML-KEM-768(Falcon-512(AES-256-GCM(iv:7a3e9c10...:ct:8d2f01a4...:tag:4e1c8b7a...)))",
  "seqNum": 1,
  "timestamp": 1724675412345,
  "note": "ANALYSIS FRAME — Educational metadata only. Not application data."
}
```

> [!CAUTION]
> **Zero Secret Leakage:** Wireshark Analysis Mode exposes algorithm names, IVs, tags, and ciphertext hex snippets (which are already visible on the wire). It **NEVER** transmits session keys, shared secrets, private keys, or decrypted message content when AES is enabled.

---

## 6. User Interface & Visual Laboratory Experience

### Visual Palette
* **Background:** Deep Void `#080808` / `#000000`
* **Text / Accents:** Neon Green `#00FF41` / `#00E676`
* **Typography:** `JetBrains Mono` / `Courier New` monospace
* **Toggle Colors:**
  * ML-KEM-768: Cyan Blue `#00BFFF`
  * Falcon-512: Amber Orange `#FF8C00`
  * AES-256-GCM: Vivid Red `#FF3131`
  * WIRESHARK MODE: Neon Purple `#A855F7`

### UI Components Added / Enhanced
1. **`IdentityScreen.jsx`:**
   * **Wireshark Card:** Located above the stack with pulsating purple glow and warning banner.
   * **Cryptographic Stack:** 3 interactive pill toggle switches with live state indicators.
   * **Live Crypto Telemetry:** Real-time log table showing packet arrival timestamps, message directions (`SENT`/`RECEIVED`), algorithms used, exact byte sizes, and IV/Tag hex strings.
   * **Dirty Configuration Alert:** Reconnect warning (`⚡ Security configuration changed — reconnect to apply`) when toggles change during an active chat session.
2. **`ConversationView.jsx`:**
   * Dynamic encryption badge (`ML-KEM-768 · Falcon-512 · AES-256-GCM`, `⚠ PLAIN`, or `🧪 WS`).
   * Purple `WiresharkWarningBanner` at the top of the chat whenever Wireshark Analysis Mode is active.
3. **`Sidebar.jsx`:**
   * Wordmark updated to **`Kπyρτόn_wave~`**.

---

## 7. Step-by-Step Real Wireshark Experiment Guide

```
+-------------------------------------------------------------------+
|                     WIRESHARK EXPERIMENT SETUP                    |
|                                                                   |
|   Terminal 1: Instance A (Port 5050)                             |
|   Terminal 2: Instance B (Port 5051)                             |
|   Wireshark Filter: tcp.port == 5050 || tcp.port == 5051          |
+-------------------------------------------------------------------+
```

### 1. Launch Instance A
```powershell
cd "d:\Work\IOT\Quantu Secure\Web_App"
npm run dev
# Choose option 1 (Port 5173), TCP listen port 5050
```

### 2. Launch Instance B (Separate User Profile)
```powershell
cd "d:\Work\IOT\Quantu Secure\Web_App"
$env:ELECTRON_USER_DATA_DIR="$env:TEMP\krypton_peer2"
npm run dev
# Choose option 2 (Port 5174), TCP listen port 5051
```

### 3. Configure Wireshark
1. Open the standalone **Wireshark** application.
2. Select **Npcap Loopback Adapter** (for local testing on `127.0.0.1`) or your active **Wi-Fi / Ethernet** interface.
3. Enter display filter:
   ```wireshark
   tcp.port == 5050 || tcp.port == 5051
   ```

### 4. Execute Experiments
* **Experiment 1 (Ciphertext Inspection):** Connect Instance A to `127.0.0.1:5051` with all toggles ON. Send `"Post-Quantum Confidential"`. Inspect the TCP stream: only random base64 ciphertext is visible.
* **Experiment 2 (Plaintext Wire Inspection):** Go to Settings in Instance A, turn **AES-256-GCM OFF**. Send `"Unencrypted Plaintext"`. Right-click packet in Wireshark → **Follow → TCP Stream**: the literal text is readable.
* **Experiment 3 (Analysis Mode):** Turn **AES-256-GCM ON** and **WIRESHARK MODE ON**. Send `"Demonstration Packet"`. Observe the dual frames in the TCP stream: the encrypted message frame followed by the `ANALYSIS` metadata frame.

---

## 8. Automated Test Suite & Verification Results

### Suite 1: Full Protocol Toggle Combinations (`test_all_toggles.js`)
Tested across live TCP loopback sockets:
```
=== Testing: 1. ALL ON (ML-KEM + Falcon-512 + AES-GCM) ===
  [Alice] Handshake ready with: Bob (Falcon-512)
  [Bob] Handshake ready with: Alice (Falcon-512)
  [Bob] Received message: "Secret test message from Alice" (seq: 1)
  [Alice] Received reply: "Hello back from Bob!"
  [OK] Both sides exchanged messages successfully!

=== Testing: 2. ALL ON + WIRESHARK MODE ===
  [OK] Both sides exchanged messages successfully!

=== Testing: 3. AES OFF (Plaintext messages over TCP) ===
  [OK] Both sides exchanged messages successfully!

=== Testing: 4. ML-KEM OFF (ECDH key exchange) ===
  [OK] Both sides exchanged messages successfully!

=== Testing: 5. Falcon-512 OFF (Skip authentication) ===
  [OK] Both sides exchanged messages successfully!

=== Testing: 6. ALL CRYPTO OFF + WIRESHARK MODE ===
  [OK] Both sides exchanged messages successfully!

=============================================
✅ ALL 6 PROTOCOL COMBINATIONS PASSED PERFECTLY!
=============================================
```

### Suite 2: Wire Byte Assertions (`test_wire_capture.js`)
Directly validated raw byte buffers received from TCP stream:
```
====================================================
🔬 VERIFYING WIRE BYTES (ACTUAL TCP PACKET CONTENTS)
====================================================
🔍 Wire Capture Test: AES OFF (Plaintext on wire)
  [Wire Inspection] Plaintext found in TCP stream: true (Expected: true)

🔍 Wire Capture Test: AES ON (Ciphertext on wire)
  [Wire Inspection] Plaintext found in TCP stream: false (Expected: false)
  [Wire Inspection] Encrypted CHAT_MESSAGE frame present: true (Expected: true)

🔍 Wire Capture Test: ALL ON + WIRESHARK MODE
  [Wire Inspection] ANALYSIS frame in TCP stream: true (Expected: true)
  [Wire Inspection] Nested analysis string present: true (Expected: true)

🔍 Wire Capture Test: ALL ON + WIRESHARK MODE OFF
  [Wire Inspection] ANALYSIS frame in TCP stream: false (Expected: false)

🔍 Wire Capture Test: ML-KEM OFF (ECDH exchange on wire)
  [Wire Inspection] ECDH_EXCHANGE in TCP stream: true (Expected: true)
  [Wire Inspection] HANDSHAKE_KEM_RESP in TCP stream: false (Expected: false)

🔍 Wire Capture Test: Falcon-512 OFF (No auth frame on wire)
  [Wire Inspection] HANDSHAKE_AUTH in TCP stream: false (Expected: false)

====================================================
🎉 ALL WIRE INSPECTION ASSERTIONS CONFIRMED 100%!
====================================================
```

### Suite 3: Production Vite Bundle
* `npm run build:renderer`: Compiled in **1.04s** with 0 errors.

---

## 9. File Inventory

```
Web_App/
├── main.js                              # Electron entry, IPC config handlers & crypto telemetry
├── preload.js                           # contextBridge API exposing kryptonWave & quantuSecure
├── package.json                         # Rebranded metadata & @noble/post-quantum 0.7.0 dependency
├── scripts/
│   └── dev.js                           # Interactive multi-port dev launcher with Kπyρτόn_wave~ banner
└── src/
    ├── crypto/
    │   ├── pqc.js                       # ML-KEM-768 & Falcon-512 dynamic ESM bridge & keygen
    │   ├── identity.js                  # Falcon-512 identity persistence & automatic migration
    │   └── session.js                   # AES-256-GCM AEAD, zero-HKDF direct key & buildAnalysisString
    ├── network/
    │   ├── protocol.js                  # Wire protocol definitions (ECDH, PLAIN, ANALYSIS frames)
    │   ├── peer.js                      # Config-aware TCP state machine & readyState socket safety
    │   └── server.js                    # PeerManager managing active security configuration
    └── renderer/
        ├── App.jsx                      # Main React layout
        ├── index.html                   # HTML metadata & Kπyρτόn_wave~ title
        ├── store/
        │   └── useAppStore.js           # Zustand store holding securityConfig & live crypto telemetry
        ├── components/
        │   ├── IdentityScreen.jsx       # 4 security toggles, Wireshark card, live telemetry log
        │   ├── ConversationView.jsx     # Dynamic header badges & Wireshark banner integration
        │   ├── Sidebar.jsx              # Rebranded wordmark & navigation
        │   ├── WiresharkWarningBanner.jsx # Glowing purple warning banner
        │   └── SecurityDetailsModal.jsx # Falcon-512 fingerprint inspection & key verification
        └── styles/
            └── index.css                # Color tokens, neon glows, telemetry grid & terminal animations
```
