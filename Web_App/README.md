# 🛡️ Kπyρτόn_wave~ — Desktop Application (Web_App)

> Post-Quantum Cryptographic Networking Experiment & Real-Time Traffic Laboratory  
> Built with **Electron + React 18 + Vite + ML-KEM-768 + Falcon-512 + AES-256-GCM**

For complete system architecture, hardware circuit schematics, cryptographic specifications, and Wireshark experiment tutorials, refer to the [Root README.md](../README.md) and the comprehensive [KRYPTON_WAVE_PQC_REPORT.md](../KRYPTON_WAVE_PQC_REPORT.md).

---

### 🚀 What's New in Kπyρτόn_wave~
* 🟠 **NIST FIPS 206 Falcon-512:** True post-quantum lattice signatures (~660B).
* 🔵 **NIST FIPS 203 ML-KEM-768:** Post-quantum key encapsulation.
* 🔴 **AES-256-GCM (Zero-HKDF):** 32-byte shared secret directly powers AEAD encryption.
* 🟣 **Wireshark Analysis Mode:** Emits readable companion metadata frames for network packet inspection.
* 🎛️ **4 Live Wire Toggles:** `ML-KEM-768`, `Falcon-512`, `AES-256-GCM`, `WIRESHARK MODE` inside the Identity & Settings screen.
* 📊 **Live Crypto Telemetry:** Real-time table logging transmitted TCP message packets with IVs, tags, and sizes.

---

### Quick Start

```powershell
# 1. Install dependencies
npm install

# 2. Run in development mode (with interactive port selector)
npm run dev

# 3. Build production binaries (.exe / .dmg / .AppImage)
npm run build
```

---

### 🔬 Dual-Instance Wireshark Capture Test

```powershell
# Terminal 1 (Port 5050 / Renderer 5173):
npm run dev

# Terminal 2 (Port 5051 / Renderer 5174):
$env:ELECTRON_USER_DATA_DIR="$env:TEMP\krypton_peer2"
npm run dev
```
In Wireshark, apply capture filter: `tcp.port == 5050 || tcp.port == 5051`

---

### Hardware Schematics
The hardware circuit diagram for the ESP32-S3 and 433T30D LoRa module is located at [`../Circuit_Diagram/krypton_circuit.png`](../Circuit_Diagram/krypton_circuit.png).
