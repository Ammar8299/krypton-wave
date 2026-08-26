<div align="center">

# 🛡️⚡ Kπyρτόn_wave~ (κρυπτόν_wave~)
### *Comprehensive Engineering Report & Changelog: Post-Quantum Protocol Evolution*

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Courier+New&weight=700&size=20&duration=3000&pause=1000&color=00FF41&center=true&vCenter=true&width=750&lines=Kπyρτόn_wave~+PQC+Networking+Experiment;NIST+FIPS+203+ML-KEM-768+Key+Exchange;NIST+FIPS+206+Falcon-512+Digital+Signatures;Direct+AES-256-GCM+Encryption+(Zero-HKDF);Real-Time+Wireshark+Embedded+Wire+Telemetry)](https://git.io/typing-svg)

<p align="center">
  <img src="https://img.shields.io/badge/KEM-NIST_FIPS_203_(ML--KEM--768)-00BFFF?style=for-the-badge&logo=shield&logoColor=white" alt="ML-KEM-768" />
  <img src="https://img.shields.io/badge/Signature-NIST_FIPS_206_(Falcon--512)-FF8C00?style=for-the-badge&logo=auth0&logoColor=white" alt="Falcon-512" />
  <img src="https://img.shields.io/badge/Cipher-AES--256--GCM_(256--bit)-FF3131?style=for-the-badge&logo=lock&logoColor=white" alt="AES-256-GCM" />
  <img src="https://img.shields.io/badge/Wire_Metadata-Embedded_pqc__data-00FF66?style=for-the-badge&logo=wireshark&logoColor=black" alt="pqc_data" />
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
2. [Complete Engineering Changelog](#2-complete-engineering-changelog)
3. [Deep Dive: Post-Quantum Cryptography (PQC) Implementation](#3-deep-dive-post-quantum-cryptography-pqc-implementation)
   - [ML-KEM-768 (NIST FIPS 203)](#ml-kem-768-nist-fips-203)
   - [Falcon-512 (NIST FIPS 206)](#falcon-512-nist-fips-206)
   - [Direct 32-Byte Key Application (Total Removal of HKDF)](#direct-32-byte-key-application-total-removal-of-hkdf)
4. [Electron CommonJS + Pure ESM Bridge](#4-electron-commonjs--pure-esm-bridge)
   - [The Problem: `ERR_REQUIRE_ESM`](#the-problem-err_require_esm)
   - [The Solution: Dynamic `import()` Pre-Warmed Singleton](#the-solution-dynamic-import-pre-warmed-singleton)
   - [Automatic Identity Key Migration](#automatic-identity-key-migration)
5. [The 3 Interactive Security Toggles & Embedded `pqc_data` Wire Format](#5-the-3-interactive-security-toggles--embedded-pqc_data-wire-format)
   - [Toggle Behavior Matrix](#toggle-behavior-matrix)
   - [Embedded `pqc_data` Layer Hierarchy](#embedded-pqc_data-layer-hierarchy)
   - [Cryptographic Parity Guarantee](#cryptographic-parity-guarantee)
6. [Unsaved Peer Instant Messaging Architecture](#6-unsaved-peer-instant-messaging-architecture)
7. [Step-by-Step Wireshark Packet Inspection Guide](#7-step-by-step-wireshark-packet-inspection-guide)
8. [Automated Test Suite & Verification Results](#8-automated-test-suite--verification-results)
9. [Project File Inventory](#9-project-file-inventory)

---

## 1. Executive Summary

The **QuantuSecure** platform has been fully upgraded into **`Kπyρτόn_wave~`** (`κρυπτόν_wave~`)—an advanced cryptographic networking laboratory designed to allow real-time observation and analysis of post-quantum resilient protocols using the **real Wireshark network analyzer**.

### Core Pillars of the Architecture:
1. **Full NIST Post-Quantum Suite:** Upgraded cryptography to **ML-KEM-768** (FIPS 203) for quantum-resistant key exchange and **Falcon-512** (FIPS 206) for Fast-Fourier lattice digital signatures, paired with **AES-256-GCM** authenticated payload encryption.
2. **Total Removal of HKDF:** Completely eliminated HKDF-SHA256 across all files; the 32-byte pseudorandom shared secret output by ML-KEM-768 is mapped directly to the 256-bit AES session key.
3. **Three Clean Interactive Toggles:** Cleaned the interface down to three genuine cryptographic controls (`ML-KEM-768`, `Falcon-512`, `AES-256-GCM`) that physically alter the TCP wire bytes transmitted on the network.
4. **Embedded `pqc_data` Metadata on Wire:** Replaced separate secondary debug frames with an embedded `"pqc_data"` field inside every real `CHAT_MESSAGE` frame, reflecting the real ciphertext and cryptographic encapsulation hierarchy in a single packet.
5. **Instant Visibility for Unsaved Peers:** Incoming connections and messages from new, unsaved peers are automatically detected, rendered, and auto-activated in the UI with full bidirectional reply capability before the user saves the contact.

> [!IMPORTANT]
> **No Simulation:** Every single packet captured in Wireshark originates from real Node.js `net.Socket` networking calls and real cryptographic output.

---

## 2. Complete Engineering Changelog

| Component | Modification | Benefit / Engineering Impact |
|---|---|---|
| **Signatures** | Replaced Ed25519 with **NIST FIPS 206 Falcon-512** | True post-quantum lattice-based digital signatures (~660B) |
| **Key Exchange** | Implemented **NIST FIPS 203 ML-KEM-768** | Quantum-safe key encapsulation with 32-byte uniform shared secret |
| **Key Derivation** | **Completely removed HKDF-SHA256** from backend and UI | Direct 32-byte ML-KEM shared secret mapping to AES-256 key |
| **Wire Protocol** | Removed separate `ANALYSIS` frames; embedded `pqc_data` in `CHAT_MESSAGE` | Single-frame packet structure containing actual ciphertext hierarchy |
| **Toggles** | Removed Wireshark Mode toggle; streamlined to 3 core crypto switches | Clean user experience focused on ML-KEM, Falcon, and AES |
| **Unsaved Peers** | Added auto-conversation activation and ephemeral peer tracking in store | Messages from unsaved peers render instantly upon arrival |
| **Sidebar** | Added live message preview, relative timestamps, and unread notification badges | Polished conversation management with search across all peers |
| **ESM Bridge** | Implemented `initPQC()` dynamic `import()` singleton | Resolved Electron 33 `ERR_REQUIRE_ESM` compatibility |
| **Identity Migration**| Added auto-detection and backup of legacy Ed25519 identities | Automatically creates `.backup-<ts>` and generates Falcon-512 keys |
| **Multi-Port Dev**| Multi-instance launcher with isolated profile directories | Enables dual-node testing on `127.0.0.1:5050` and `5051` seamlessly |

---

## 3. Deep Dive: Post-Quantum Cryptography (PQC) Implementation

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        Kπyρτόn_wave~ PROTOCOL STACK                        │
├────────────────────────────────────────────────────────────────────────────┤
│  Layer 1: Key Encapsulation  │  ML-KEM-768 (NIST FIPS 203)                 │
│  Layer 2: Digital Signatures │  Falcon-512 (NIST FIPS 206)                 │
│  Layer 3: Payload Cipher     │  AES-256-GCM (Direct 256-bit Key, AEAD)     │
│  Layer 4: Embedded Wire Meta │  pqc_data Field in Every Chat Message Frame │
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
Per NIST FIPS 203 specifications, the ML-KEM decapsulation process applies an internal hash (SHAKE-256) to yield a uniformly distributed 32-byte pseudorandom key. 

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
The 32-byte shared secret is fed directly into Node.js `crypto.createCipheriv('aes-256-gcm', sessionKey, iv)`.

---

## 4. Electron CommonJS + Pure ESM Bridge

### The Problem: `ERR_REQUIRE_ESM`
When upgrading `@noble/post-quantum` to `v0.7.0` for native Falcon-512 support, the package distributed pure ES modules. In Electron's CommonJS main process, synchronous `require()` failed with `ERR_REQUIRE_ESM`.

### The Solution: Dynamic `import()` Pre-Warmed Singleton
Because cryptographic functions like `kemEncapsulate()`, `sign()`, and `verify()` are called synchronously inside high-speed network event handlers (`_onFrame`, `_onHello`), we implemented a pre-warmed dynamic import singleton:

```javascript
// src/crypto/pqc.js
let ml_kem768 = null;
let falcon512 = null;

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

async function initPQC() {
  await initPromise;
  if (!ml_kem768 || !falcon512) {
    throw new Error('[pqc] Post-quantum modules failed to initialize.');
  }
}
```

In `main.js`:
```javascript
app.whenReady().then(async () => {
  const { initPQC } = require('./src/crypto/pqc');
  await initPQC(); // Awaited once at boot!
});
```

---

## 5. The 3 Interactive Security Toggles & Embedded `pqc_data` Wire Format

```
┌─────────────────────────────────┐    ┌─────────────────────────────────┐
│       ML-KEM-768 (Blue)         │    │       Falcon-512 (Orange)       │
│  ● ON  : NIST FIPS 203 (Kyber)  │    │  ● ON  : NIST FIPS 206 Lattice  │
│  ○ OFF : Classical ECDH (P-256) │    │  ○ OFF : Skip Authentication    │
└─────────────────────────────────┘    └─────────────────────────────────┘
                 ┌─────────────────────────────────┐
                 │       AES-256-GCM (Red)         │
                 │  ● ON  : Authenticated Cipher   │
                 │  ○ OFF : Raw Plaintext JSON     │
                 └─────────────────────────────────┘
```

### Toggle Behavior Matrix

| Toggle Combination | TCP Wire Frame Type | `pqc_data` Embedded Field on Wire |
|---|---|---|
| **1. ALL ON (Default)** | `CHAT_MESSAGE` (AES-256-GCM) | `"ML-KEM-768(Falcon-512(AES-256-GCM(<real_ciphertext>)))"` |
| **2. Falcon-512 OFF** | `CHAT_MESSAGE` (AES-256-GCM) | `"ML-KEM-768(AES-256-GCM(<real_ciphertext>))"` |
| **3. ML-KEM OFF** | `CHAT_MESSAGE` (AES-256-GCM) | `"Falcon-512(AES-256-GCM(<real_ciphertext>))"` |
| **4. Only AES-256 ON** | `CHAT_MESSAGE` (AES-256-GCM) | `"AES-256-GCM(<real_ciphertext>)"` |
| **5. AES OFF (ML-KEM + Falcon ON)** | `CHAT_MESSAGE_PLAIN` (Plaintext) | `"ML-KEM-768(Falcon-512(PLAINTEXT(<content>)))"` |
| **6. ALL OFF** | `CHAT_MESSAGE_PLAIN` (Plaintext) | `"PLAINTEXT(<content>)"` |

### Wire Frame Structure
Every chat message frame transmitted on the TCP socket uses a 4-byte big-endian length prefix followed by a UTF-8 JSON payload:

```json
{
  "type": "CHAT_MESSAGE",
  "messageId": "c3eb9ed5-696f-4e5f-8343-f177bafbb481",
  "seqNum": 5,
  "payload": {
    "ciphertext": "88XjLFDF+E0WT8ei15V993G3Mgal...",
    "iv": "sv8zJEBIaTDZJVj8",
    "tag": "lL78U8CqeU68JYh4Q8DXRA==",
    "seqNum": 5
  },
  "pqc_data": "ML-KEM-768(Falcon-512(AES-256-GCM(88XjLFDF+E0WT8ei15V993G3Mgal...)))"
}
```

### Cryptographic Parity Guarantee
* When AES-256-GCM is active, the ciphertext inside `pqc_data` **identically matches `payload.ciphertext`**.
* No simulated or fake hashes: `payload.ciphertext` is generated with `crypto.createCipheriv('aes-256-gcm', ...)` using a fresh random 96-bit IV per message.

---

## 6. Unsaved Peer Instant Messaging Architecture

When an incoming connection or message arrives from a peer not yet in `contacts.json`:
1. **Auto-Registration:** The peer is registered into `ephemeralPeers` with full handshake keys and fingerprint.
2. **Auto-Activation:** If no conversation is currently selected, the app automatically switches `activeContactId` and `view: 'chat'` so incoming messages are **immediately visible on screen without requiring contact saving**.
3. **Sidebar Presentation:** Displays in the sidebar under `"Active / Unsaved Peers"` with an `[UNSAVED]` badge, latest message preview, timestamp, and unread notification count.
4. **Bidirectional Reply:** The receiver can immediately type and send encrypted replies over the active TCP session.
5. **In-Chat Save Button:** A banner at the top of the conversation view provides one-click **SAVE CONTACT** and **BLOCK** actions.

---

## 7. Step-by-Step Wireshark Packet Inspection Guide

### 1. Start Two Local Nodes
* **Terminal 1 (Node A on Port 5050):**
  ```powershell
  cd "d:\Work\IOT\Quantu Secure\Web_App"
  npm run dev
  # Select option 1 (Port 5173)
  ```
* **Terminal 2 (Node B on Port 5051):**
  ```powershell
  cd "d:\Work\IOT\Quantu Secure\Web_App"
  $env:ELECTRON_USER_DATA_DIR="$env:TEMP\krypton_peer2"
  npm run dev
  # Select option 2 (Port 5174)
  ```

### 2. Configure Wireshark
1. Open Wireshark.
2. Select **`Adapter for loopback traffic capture`** (`\Device\NPF_Loopback`).
3. Enter display filter:
   ```wireshark
   tcp contains "pqc_data"
   ```
   *or*
   ```wireshark
   tcp.port == 5050 || tcp.port == 5051
   ```

### 3. Inspect Packets
* Send a message from Node A to Node B.
* In Wireshark, right-click the captured TCP packet &rarr; **Follow &rarr; TCP Stream** (or look at the Packet Bytes ASCII pane).
* You will see the complete JSON structure containing `payload.ciphertext` and `"pqc_data"`.

> [!NOTE]
> Because AES-256-GCM generates a random 12-byte IV for every message, **the ciphertext changes with each message**. Searching for a static hash from a past test run will yield no results; use `tcp contains "pqc_data"` to find all live packets.

---

## 8. Automated Test Suite & Verification Results

### Suite 1: Embedded `pqc_data` Matrix Across All Toggle Permutations (`test_pqc_data_matrix.js`)
```
================================================================
🚀 TESTING pqc_data EMBEDDED IN CHAT_MESSAGE FRAMES (TCP WIRE)
================================================================

Case 1: OFF / OFF / OFF (All crypto OFF)
  -> pqc_data: "PLAINTEXT(Live message for test case #1)"               ✅ PASSED
Case 2: OFF / OFF / ON (AES-256-GCM only)
  -> pqc_data: "AES-256-GCM(0bTNdFGyouul6Fnd71Dn...)"                   ✅ PASSED
Case 3: OFF / ON / ON (Falcon-512 + AES-256-GCM)
  -> pqc_data: "Falcon-512(AES-256-GCM(ERbS3b4Cbmiw...))"              ✅ PASSED
Case 4: ON / OFF / ON (ML-KEM-768 + AES-256-GCM)
  -> pqc_data: "ML-KEM-768(AES-256-GCM(QlJHc7XjcD3p...))"              ✅ PASSED
Case 5: ON / ON / ON (ML-KEM-768 + Falcon-512 + AES-256-GCM)
  -> pqc_data: "ML-KEM-768(Falcon-512(AES-256-GCM(P8xoEA7j...)))"      ✅ PASSED
Case 6: ON / ON / OFF (ML-KEM-768 + Falcon-512 + Plaintext)
  -> pqc_data: "ML-KEM-768(Falcon-512(PLAINTEXT(Live message...)))"     ✅ PASSED

✨ ALL TEST CASES PASSED WITH 100% CRYPTOGRAPHIC PRECISION!
```

### Suite 2: Unsaved Peer Message & Reply Test (`test_unsaved_peer_message.js`)
```
================================================================
🧪 TESTING UNSAVED PEER INCOMING MESSAGE & VISIBILITY
================================================================
[Step 1] Alice connects to Bob (127.0.0.1:5091)...
  [Bob getActivePeers()] Found 1 active peer: Alice Node
[Step 2] Alice sends message to Bob before Bob saves Alice...
  [Bob Message Received]: "Hello Bob! I am a new unsaved contact."
  ✅ Bob successfully received message from unsaved peer!
[Step 3] Bob replies back to the unsaved contact (127.0.0.1:5090)...
  [Alice Message Received]: "Hello Alice! I can reply to you directly before saving!"
  ✅ Bidirectional reply verified!

🎉 UNSAVED PEER COMMUNICATION TEST PASSED 100%!
```

### Suite 3: Contact Isolation & Storage Safety (`test_contact_isolation.js`)
* Multi-instance contact storage isolation verified (`contacts.json` and `messages/<id>.json` operate independently across user profiles).

### Suite 4: Production Vite Bundle
* `npm run build:renderer`: 49 modules transformed, built production bundle in **1.15s** with 0 errors.

---

## 9. Project File Inventory

```
Web_App/
├── main.js                              # Electron main process, TCP server lifecycle & get-active-peers IPC
├── preload.js                           # contextBridge API exposing kryptonWave & quantuSecure
├── package.json                         # Rebranded metadata & @noble/post-quantum 0.7.0 dependency
├── scripts/
│   └── dev.js                           # Interactive multi-port dev launcher with Kπyρτόn_wave~ banner
└── src/
    ├── crypto/
    │   ├── pqc.js                       # ML-KEM-768 & Falcon-512 dynamic ESM bridge & keygen
    │   ├── identity.js                  # Falcon-512 identity persistence & auto-migration
    │   └── session.js                   # AES-256-GCM AEAD, direct 32B key & buildPQCData
    ├── network/
    │   ├── protocol.js                  # 4-byte big-endian framing & JSON dispatcher
    │   ├── peer.js                      # Config-aware TCP state machine & pqc_data embedder
    │   └── server.js                    # PeerManager singleton with getActivePeers
    ├── storage/
    │   ├── store.js                     # Atomic filesystem read/write engine
    │   ├── contacts.js                  # Contacts & Blocklist CRUD
    │   └── messages.js                  # Per-contact message histories
    └── renderer/
        ├── App.jsx                      # Main React layout
        ├── index.html                   # HTML metadata & Kπyρτόn_wave~ title
        ├── store/
        │   └── useAppStore.js           # Zustand store with auto-conversation activator & unsaved peer sync
        ├── components/
        │   ├── IdentityScreen.jsx       # 3 security toggles & live packet telemetry
        │   ├── ConversationView.jsx     # Active chat, dynamic badge & save contact banner
        │   ├── Sidebar.jsx              # Searchable contact list with Active/Unsaved section
        │   ├── ContactItem.jsx          # Live message preview, relative time, unread badge
        │   ├── ContextMenu.jsx          # Right-click dark glassmorphic popup
        │   ├── SecurityDetailsModal.jsx # Falcon-512 fingerprint inspection & key verification
        │   ├── AddPeerModal.jsx         # Handshake initiator modal
        │   └── RenameContactModal.jsx   # Contact rename / save modal
        └── styles/
            └── index.css                # CSS Design System, unread badges & neon toggle glows
```
