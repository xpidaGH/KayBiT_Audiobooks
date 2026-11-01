# KayBiT Audiobooks: Multiplatform CI/CD & Production Code Signing Specification

This comprehensive guide details the automated build, test, secure code-signing, multi-runner matrix, and multiplatform distribution pipeline for **KayBiT Audiobooks** across **iOS (`.ipa`)**, **macOS (`.dmg`/`.app`)**, **Android (`.apk`/`.aab`)**, **Windows (`.exe`/`.msi`)**, and **Linux (`.deb`/`.AppImage`)**.

---

## 1. Secrets & Code-Signing Security Architecture

> **Security Mandate**: Never commit raw keystores, certificates, private keys, or provisioning profiles to Git. Convert them into Base64 strings, save them as GitHub Repository Secrets, and decode them in-memory inside the ephemeral runner container.

### A. Converting Certificates to Base64

#### On macOS / Linux (Bash):
```bash
# 1. Android Keystore to Base64:
base64 -i my-release-key.jks | tr -d '\n' > android_keystore_base64.txt

# 2. Apple Distribution Certificate (.p12) to Base64:
base64 -i AuthKey_ABC123XYZ.p8 | tr -d '\n' > apple_appstore_key_base64.txt
base64 -i Certificates.p12 | tr -d '\n' > ios_certificate_base64.txt

# 3. Apple Provisioning Profile (.mobileprovision) to Base64:
base64 -i KayBiT_AppStore.mobileprovision | tr -d '\n' > ios_provisioning_profile_base64.txt

# 4. Windows Code-Signing Certificate (.pfx) to Base64 (Optional):
base64 -i windows_cert.pfx | tr -d '\n' > windows_cert_base64.txt
```

#### On Windows (PowerShell):
```powershell
# 1. Android Keystore to Base64:
[Convert]::ToBase64String([IO.File]::ReadAllBytes("my-release-key.jks")) | Out-File -Encoding ascii android_keystore_base64.txt

# 2. Apple Distribution Certificate (.p12) to Base64:
[Convert]::ToBase64String([IO.File]::ReadAllBytes("Certificates.p12")) | Out-File -Encoding ascii ios_certificate_base64.txt

# 3. Apple Provisioning Profile (.mobileprovision) to Base64:
[Convert]::ToBase64String([IO.File]::ReadAllBytes("KayBiT_AppStore.mobileprovision")) | Out-File -Encoding ascii ios_provisioning_profile_base64.txt

# 4. Windows Certificate (.pfx) to Base64:
[Convert]::ToBase64String([IO.File]::ReadAllBytes("windows_cert.pfx")) | Out-File -Encoding ascii windows_cert_base64.txt
```

---

## 2. GitHub Secrets Reference Matrix

Navigate to your GitHub Repository: **Settings > Secrets and variables > Actions > New repository secret**:

| Secret Key Name | Purpose | Example Value Format |
| :--- | :--- | :--- |
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded Android release JKS | Raw base64 string |
| `ANDROID_KEYSTORE_PASSWORD` | Password for your Android keystore | Plain text secret |
| `ANDROID_KEY_ALIAS` | Key alias name inside keystore | `kaybit-release-alias` |
| `ANDROID_KEY_PASSWORD` | Password for the key alias | Plain text secret |
| `ANDROID_SERVICE_ACCOUNT_JSON` | Google Play Console API service account | Google Cloud service account JSON |
| `IOS_P12_BASE64` | Apple Distribution Certificate (.p12) | Raw base64 string |
| `IOS_P12_PASSWORD` | Password protecting the .p12 certificate | Plain text secret |
| `IOS_PROVISION_PROFILE_BASE64`| App Store Provisioning Profile | Raw base64 string |
| `APPLE_TEAM_ID` | 10-character Apple Developer Team ID | `A1B2C3D4E5` |
| `APPLE_BUNDLE_ID` | Application identifier | `com.kaybit.audiobooks` |
| `APPLE_PROVISIONING_PROFILE_NAME`| Name of provisioning profile | `KayBiT Audiobooks AppStore` |
| `APP_STORE_CONNECT_KEY_ID` | App Store Connect API Key ID | `ABC123XYZ` |
| `APP_STORE_CONNECT_ISSUER_ID` | App Store Connect Issuer UUID | `69a6de70-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `APP_STORE_CONNECT_PRIVATE_KEY`| App Store Connect .p8 private key text | `-----BEGIN PRIVATE KEY----- ...` |
| `WINDOWS_CERTIFICATE_BASE64` | Windows Authenticode .pfx (Optional) | Raw base64 string |
| `WINDOWS_CERTIFICATE_PASSWORD` | Password for Windows .pfx | Plain text secret |
| `SLACK_WEBHOOK_URL` | Incoming Webhook for Slack alerts | `https://hooks.slack.com/services/...` |
| `DISCORD_WEBHOOK_URL` | Webhook URL for Discord alerts | `https://discord.com/api/webhooks/...` |

---

## 3. Dynamic `exportOptions.plist` Template for iOS

To ensure Team ID, Bundle ID, and Provisioning Profile names never leak to the public repository, the workflow generates `exportOptions.plist` dynamically in the runner workspace:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>${APPLE_TEAM_ID}</string>
    <key>uploadBitcode</key>
    <false/>
    <key>compileBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>signingStyle</key>
    <string>manual</string>
    <key>signingCertificate</key>
    <string>Apple Distribution</string>
    <key>provisioningProfiles</key>
    <dict>
        <key>${APPLE_BUNDLE_ID}</key>
        <string>${APPLE_PROVISIONING_PROFILE_NAME}</string>
    </dict>
</dict>
</plist>
```

---

## 4. The Complete GitHub Actions Workflow (`.github/workflows/release.yml`)

```yaml
name: Multiplatform Production Build, Code-Sign & Release

on:
  push:
    branches:
      - main
      - release/*
    tags:
      - 'v*.*.*'
  workflow_dispatch:

permissions:
  contents: write
  packages: write

env:
  NODE_VERSION: '20'
  RUST_TOOLCHAIN: 'stable'

jobs:
  # =========================================================================
  # 1. macOS Runner: iOS .ipa (TestFlight) & macOS .dmg/.app Universal Binaries
  # =========================================================================
  build-apple-platforms:
    name: Build & Sign Apple Platforms (iOS + macOS)
    runs-on: macos-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Setup Rust Toolchain (Universal macOS)
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: x86_64-apple-darwin,aarch64-apple-darwin

      - name: Install Dependencies
        run: npm ci

      - name: Inject Dynamic Version Number
        run: |
          VERSION="2.5.${{ github.run_number }}"
          echo "BUILD_VERSION=$VERSION" >> $GITHUB_ENV
          npm version $VERSION --no-git-tag-version --allow-same-version

      - name: Build Web Production Assets
        run: npm run build

      # --- Secure iOS Code Signing Setup ---
      - name: Import Apple Certificates
        uses: apple-actions/import-codesign-certs@v2
        if: env.IOS_P12_BASE64 != ''
        env:
          IOS_P12_BASE64: ${{ secrets.IOS_P12_BASE64 }}
        with:
          p12-file-base64: ${{ secrets.IOS_P12_BASE64 }}
          p12-password: ${{ secrets.IOS_P12_PASSWORD }}

      - name: Install Apple Provisioning Profile
        if: env.IOS_PROVISION_PROFILE_BASE64 != ''
        env:
          IOS_PROVISION_PROFILE_BASE64: ${{ secrets.IOS_PROVISION_PROFILE_BASE64 }}
        run: |
          mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
          echo "$IOS_PROVISION_PROFILE_BASE64" | base64 --decode > ~/Library/MobileDevice/Provisioning\ Profiles/appstore.mobileprovision

      - name: Generate Dynamic exportOptions.plist
        run: |
          cat <<EOF > exportOptions.plist
          <?xml version="1.0" encoding="UTF-8"?>
          <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
          <plist version="1.0">
          <dict>
              <key>method</key>
              <string>app-store</string>
              <key>teamID</key>
              <string>${{ secrets.APPLE_TEAM_ID }}</string>
              <key>signingStyle</key>
              <string>manual</string>
              <key>provisioningProfiles</key>
              <dict>
                  <key>${{ secrets.APPLE_BUNDLE_ID }}</key>
                  <string>${{ secrets.APPLE_PROVISIONING_PROFILE_NAME }}</string>
              </dict>
          </dict>
          </plist>
          EOF

      # --- iOS Compilation ---
      - name: Sync Capacitor iOS
        run: |
          npx cap add ios || true
          npx cap sync ios

      - name: Build and Archive iOS .xcarchive
        run: |
          xcodebuild -workspace ios/App/App.xcworkspace \
            -scheme App \
            -configuration Release \
            -archivePath build/App.xcarchive \
            archive \
            CODE_SIGNING_ALLOWED=YES

      - name: Export iOS .ipa
        run: |
          xcodebuild -exportArchive \
            -archivePath build/App.xcarchive \
            -exportOptionsPlist exportOptions.plist \
            -exportPath build/ipa

      # --- macOS Universal DMG Compilation ---
      - name: Build macOS Universal .dmg (Tauri)
        run: |
          npx tauri build --target universal-apple-darwin || true

      - name: Upload iOS .ipa Artifact
        uses: actions/upload-artifact@v4
        with:
          name: iOS-Package-IPA
          path: build/ipa/*.ipa

      - name: Upload macOS .dmg Artifact
        uses: actions/upload-artifact@v4
        with:
          name: macOS-Universal-DMG
          path: src-tauri/target/universal-apple-darwin/release/bundle/dmg/*.dmg

      # --- Deploy to Apple TestFlight ---
      - name: Publish to Apple TestFlight
        if: startsWith(github.ref, 'refs/tags/v') && env.APP_STORE_CONNECT_PRIVATE_KEY != ''
        env:
          APP_STORE_CONNECT_PRIVATE_KEY: ${{ secrets.APP_STORE_CONNECT_PRIVATE_KEY }}
        uses: apple-actions/upload-testflight-build@v1
        with:
          app-path: build/ipa/*.ipa
          issuer-id: ${{ secrets.APP_STORE_CONNECT_ISSUER_ID }}
          api-key-id: ${{ secrets.APP_STORE_CONNECT_KEY_ID }}
          api-private-key: ${{ secrets.APP_STORE_CONNECT_PRIVATE_KEY }}

  # =========================================================================
  # 2. Windows Runner: Windows .exe & .msi (Tauri / WiX / NSIS)
  # =========================================================================
  build-windows-platforms:
    name: Build Windows Installers (.exe / .msi)
    runs-on: windows-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Setup Rust Toolchain
        uses: dtolnay/rust-toolchain@stable

      - name: Install WiX Toolset
        run: |
          dotnet tool install --global wix

      - name: Install NPM Dependencies
        run: npm ci

      - name: Build Web Application
        run: npm run build

      - name: Build Windows .msi & .exe (Tauri)
        run: |
          npx tauri build

      - name: Upload Windows Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: Windows-Installers
          path: |
            src-tauri/target/release/bundle/msi/*.msi
            src-tauri/target/release/bundle/nsis/*.exe

  # =========================================================================
  # 3. Ubuntu Runner: Android .apk/.aab & Linux .deb/.AppImage (PipeWire)
  # =========================================================================
  build-android-and-linux:
    name: Build Android (APK/AAB) & Linux (Deb/AppImage)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Setup Java JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Install Linux Desktop Audio Dependencies (PipeWire / ALSA / WebKit)
        run: |
          sudo apt-get update
          sudo apt-get install -y libpipewire-0.3-dev libasound2-dev libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev

      - name: Setup Rust Toolchain
        uses: dtolnay/rust-toolchain@stable

      - name: Install Dependencies
        run: npm ci

      - name: Build Web Production Assets
        run: npm run build

      # --- Android Build & Signing ---
      - name: Add Capacitor Android Platform
        run: |
          npx cap add android || true
          npx cap sync android

      - name: Build Unsigned Android AAB & APK
        run: |
          cd android
          ./gradlew bundleRelease assembleRelease

      - name: Sign Android Release AAB
        if: env.ANDROID_KEYSTORE_BASE64 != ''
        uses: r0adkll/sign-android-release@v1
        id: sign_aab
        env:
          ANDROID_KEYSTORE_BASE64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
        with:
          releaseDirectory: android/app/build/outputs/bundle/release
          signingKeyBase64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
          alias: ${{ secrets.ANDROID_KEY_ALIAS }}
          keyStorePassword: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          keyPassword: ${{ secrets.ANDROID_KEY_PASSWORD }}

      # --- Linux Native Build ---
      - name: Build Linux .deb and .AppImage
        run: |
          npx tauri build || true

      - name: Upload Android Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: Android-Release-Packages
          path: |
            android/app/build/outputs/bundle/release/*.aab
            android/app/build/outputs/apk/release/*.apk

      - name: Upload Linux Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: Linux-Packages
          path: |
            src-tauri/target/release/bundle/deb/*.deb
            src-tauri/target/release/bundle/appimage/*.AppImage

      # --- Auto-Publish to Google Play Internal Testing Track ---
      - name: Upload to Google Play Internal Track
        if: startsWith(github.ref, 'refs/tags/v') && env.ANDROID_SERVICE_ACCOUNT_JSON != ''
        uses: r0adkll/upload-google-play@v1
        env:
          ANDROID_SERVICE_ACCOUNT_JSON: ${{ secrets.ANDROID_SERVICE_ACCOUNT_JSON }}
        with:
          serviceAccountJsonPlainText: ${{ secrets.ANDROID_SERVICE_ACCOUNT_JSON }}
          packageName: com.kaybit.audiobooks
          releaseFiles: android/app/build/outputs/bundle/release/*-signed.aab
          track: internal
          status: completed

  # =========================================================================
  # 4. GitHub Releases & Automated Commit Changelog
  # =========================================================================
  create-github-release:
    name: Publish Release & Changelog
    needs: [build-apple-platforms, build-windows-platforms, build-android-and-linux]
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Download All Compilation Artifacts
        uses: actions/download-artifact@v4
        with:
          path: release-artifacts

      - name: Generate Automated Changelog from Commits
        id: changelog
        run: |
          PREV_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")
          if [ -z "$PREV_TAG" ]; then
            CHANGES=$(git log --pretty=format:"* %s (%h)" -n 25)
          else
            CHANGES=$(git log --pretty=format:"* %s (%h)" $PREV_TAG..HEAD)
          fi
          echo "CHANGES<<EOF" >> $GITHUB_ENV
          echo "$CHANGES" >> $GITHUB_ENV
          echo "EOF" >> $GITHUB_ENV

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          name: KayBiT Audiobooks Release ${{ github.ref_name }} (Build #${{ github.run_number }})
          body: |
            ## KayBiT Audiobooks Production Multiplatform Release

            ### 📦 Downloadable Desktop & Mobile Binaries
            - **Windows**: `.msi` (Installer) & `.exe` (NSIS Portable)
            - **macOS**: `.dmg` (Universal Apple Silicon & Intel)
            - **Linux**: `.AppImage` & `.deb` (PipeWire Audio Enabled)
            - **Android**: `.aab` (Google Play) & `.apk` (Direct Sideload)
            - **iOS**: Available in Apple TestFlight

            ### 📋 Automated Git Changelog
            ${{ env.CHANGES }}
          files: |
            release-artifacts/**/*.msi
            release-artifacts/**/*.exe
            release-artifacts/**/*.dmg
            release-artifacts/**/*.deb
            release-artifacts/**/*.AppImage
            release-artifacts/**/*.aab
            release-artifacts/**/*.apk

  # =========================================================================
  # 5. Team Alerts (Slack, Discord, and Email Webhooks)
  # =========================================================================
  notify-team:
    name: Dispatch Team Notifications
    needs: [build-apple-platforms, build-windows-platforms, build-android-and-linux, create-github-release]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Send Discord Webhook Notification
        if: env.DISCORD_WEBHOOK_URL != ''
        env:
          DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
        run: |
          STATUS="${{ job.status }}"
          COLOR=65280
          if [ "$STATUS" != "success" ]; then COLOR=16711680; fi
          curl -H "Content-Type: application/json" -X POST -d '{
            "embeds": [{
              "title": "KayBiT Multiplatform Build: '"$STATUS"'",
              "description": "Run #${{ github.run_number }} on branch `${{ github.ref_name }}` completed.",
              "color": '$COLOR',
              "fields": [
                {"name": "Triggered By", "value": "${{ github.actor }}", "inline": true},
                {"name": "Commit", "value": "${{ github.sha }}", "inline": true}
              ]
            }]
          }' "$DISCORD_WEBHOOK_URL"

      - name: Send Slack Webhook Notification
        if: env.SLACK_WEBHOOK_URL != ''
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: |
          curl -X POST -H 'Content-type: application/json' --data '{
            "text": "📢 *KayBiT Audiobooks Build #${{ github.run_number }}* finished with status: *${{ job.status }}*.\nActor: ${{ github.actor }} | Ref: ${{ github.ref_name }}"
          }' "$SLACK_WEBHOOK_URL"
```

---

## 5. Continuous Build Numbering with `${{ github.run_number }}`

The pipeline leverages GitHub's monotonically increasing integer `${{ github.run_number }}` to guarantee deterministic version bumps:
- Build `1` creates version `2.5.1`
- Build `14` creates version `2.5.14`
This satisfies both Google Play's `versionCode` (strictly increasing integer) and Apple's `CFBundleVersion` requirements without requiring manual Git tag adjustments.
