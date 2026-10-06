# KayBiT_Audiobooks: Native Cross-Platform Installation & Deployment Guide

This guide provides step-by-step instructions for packaging and distributing the **KayBiT_Audiobooks** application natively across **Android (APK & AAB)**, **iOS (PWA & Native Container)**, **Windows (.exe & .msi)**, and **macOS (.dmg)**, as well as running local production servers.

---

## Quick Reference Summary

| Target Platform | Package Format | Recommended Packaging Framework | Prerequisites |
| :--- | :--- | :--- | :--- |
| **Android** | `.apk`, `.aab` | Capacitor / TWA (Bubblewrap) | Android Studio, JDK 17+, Android SDK 34+ |
| **iOS** | PWA / `.ipa` | WebKit Standalone / Capacitor iOS | macOS, Xcode 15+, Apple Developer ID |
| **Windows** | `.exe`, `.msi` | Tauri 2.0 / Electron Forge | Node.js 20+, Rust toolchain, Visual Studio C++ Build Tools |
| **macOS** | `.dmg` | Tauri 2.0 / Electron Forge | macOS (arm64 / x64), Xcode CLI tools, Rust |
| **Web / PWA** | Instant Web App | Modern Web Browser (Chrome, Safari, Edge, Firefox) | HTTPS enabled server |

---

## 1. Web Progressive Web App (PWA) Direct Installation
Students can install the platform directly on any desktop or mobile device with zero compilation needed.

### On Android (Chrome / Edge / Samsung Internet):
1. Navigate to the hosted app URL in Chrome.
2. Tap the browser menu (`⋮`) and select **"Add to Home screen"** or **"Install app"**.
3. The app is installed as a standalone web app with full background audio privileges.

### On iOS / iPadOS (Safari):
1. Open the application URL in **Safari**.
2. Tap the **Share** button (box with upward arrow).
3. Scroll down and tap **"Add to Home Screen"**.
4. Confirm by tapping **"Add"** in the top-right corner. The app launches fullscreen with standalone display mode.

### On Windows / macOS / Linux (Desktop Chrome or Edge):
1. Click the **Install** icon in the browser address bar (top right).
2. Click **Install**. The application will now run in an isolated native window without browser address bars.

---

## 2. Android Native Build (APK & Google Play AAB)
Using **Capacitor** to build a standalone Android project.

### Step 1: Install Capacitor CLI & Dependencies
In the root directory of your project:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "KayBiT Audiobooks" com.kaybit.audiobooks --web-dir dist
```

### Step 2: Build the Production Web Assets
```bash
npm run build
npx cap add android
npx cap sync
```

### Step 3: Configure Android Audio Permissions
Open `android/app/src/main/AndroidManifest.xml` and add the following inside `<manifest>`:
```xml
<!-- Background Audio & Network Capabilities -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
```

### Step 4: Build Debug APK
```bash
cd android
./gradlew assembleDebug
```
The output file is located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### Step 5: Build Release Signed AAB (Google Play Store)
```bash
./gradlew bundleRelease
```
The output bundle will be at:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 3. iOS Native Package (.ipa & Xcode Project)

### Step 1: Add iOS Capacitor Platform
```bash
npm install @capacitor/ios
npx cap add ios
npx cap sync
```

### Step 2: Configure Background Audio in Info.plist
Open `ios/App/App/Info.plist` and add background audio capabilities:
```xml
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
  <string>fetch</string>
</array>
```

### Step 3: Open in Xcode
```bash
npx cap open ios
```
In Xcode:
1. Select your target device (Any iOS Device or Simulator).
2. Choose your Signing Team under **Signing & Capabilities**.
3. Select **Product > Archive** to build an `.ipa` for TestFlight or Ad-Hoc distribution.

---

## 4. Windows Desktop Build (.exe & .msi)

### Option A: Using Tauri (Recommended - Lightweight ~12MB)
1. Install Tauri CLI:
   ```bash
   npm install -D @tauri-apps/cli
   npx tauri init
   ```
2. Set configuration in `src-tauri/tauri.conf.json`:
   ```json
   {
     "build": {
       "beforeBuildCommand": "npm run build",
       "frontendDist": "../dist"
     },
     "bundle": {
       "active": true,
       "targets": ["nsis", "msi"]
     }
   }
   ```
3. Run the Windows release builder:
   ```bash
   npm run tauri build
   ```
   Outputs will be in `src-tauri/target/release/bundle/nsis/` (`.exe` setup) and `/msi/` (`.msi` installer).

### Option B: Using Electron Forge
```bash
npx electron-forge import
npm run make -- --platform=win32
```
Output: `out/make/squirrel.windows/x64/KayBiT_Audiobooks-setup.exe`

---

## 5. macOS Desktop Build (.dmg & .app)

### Using Tauri:
```bash
# On a macOS machine:
npm run build
npm run tauri build -- --target universal-apple-darwin
```
Outputs:
`src-tauri/target/universal-apple-darwin/release/bundle/dmg/KayBiT_Audiobooks.dmg`

### Code Signing & Notarization (for Gatekeeper):
```bash
xcrun notarytool submit KayBiT_Audiobooks.dmg \
  --apple-id "instructor@kaybit.edu" \
  --team-id "TEAMID123" \
  --password "app-specific-password" \
  --wait
xcrun stapler staple KayBiT_Audiobooks.dmg
```

---

## 6. Docker Container Deployment (Self-Hosted Server)
Create a `Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t kaybit-audiobooks .
docker run -d -p 8080:80 --name kaybit-audiobooks-app kaybit-audiobooks
```
Visit `http://localhost:8080`.
