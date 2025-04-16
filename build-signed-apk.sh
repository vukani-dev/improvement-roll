#!/bin/bash

# Exit on error
set -e

echo "Bundling JavaScript code..."
mkdir -p android/app/src/main/assets
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

echo "Cleaning Android project..."
cd android
./gradlew clean

echo "Building signed release APK..."
./gradlew assembleRelease


echo "Done! APK is available at:"
echo "$(pwd)/app/build/outputs/apk/release/improvement-roll-1.4.0.apk"

# Check if user wants to install the APK to a connected device
if [ "$1" == "--install" ]; then
  echo "Installing APK to connected device..."
  adb devices
  adb install -r app/build/outputs/apk/release/improvement-roll-1.4.0.apk
fi

cd .. 