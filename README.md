# Board Game Scoreboard

A modern, feature-rich digital scoreboard app for board games, card games, sports, and casual competitions. Built with Expo and React Native.

## Features

### Core Functionality

- 🎲 **Multi-Player Support** — Up to 6 players with custom names
- 📊 **Real-Time Score Tracking** — Large, easy-to-read score displays
- 🎨 **Color-Coded Players** — Each player gets a unique color for visual identification
- ➕➖ **Responsive Controls** — Large tap areas for quick scoring adjustments
- ↩️ **Undo Feature** — Revert the last action instantly

### Advanced Features

- ⏱️ **Game Timer** — Automatic time tracking from game start to finish
- 🔄 **Round Counter** — Track multiple rounds in a single game
- ⭐ **Turn Indicator** — Highlights whose turn it is to reduce confusion
- 📱 **Fullscreen Mode** — Display scores on a tablet or phone for all players to see
- 📈 **Live Statistics** — View real-time game stats and player performance
- 💾 **Persistent Storage** — Game state saved locally between sessions
- 🌙 **Dark/Light Theme** — Switch between themes for different lighting conditions

### Game Management

- 🆕 **Setup Screen** — Easy player addition/removal before starting
- 🏆 **Game Results** — View winner, final scores, and game duration
- 📜 **Game History** — Save and review past games
- ⚙️ **Settings** — Customize theme and gameplay preferences

## Privacy

This app does NOT collect, store, or transmit any personal data. All game data and scores are stored locally on your device. No permissions required.

## Installation

### For Development

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Run on Android (emulator or device):

```bash
npm run android
```

4. Run on iOS:

```bash
npm run ios
```

## Building for Production

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android
```

## Google Play Store Submission

See [GOOGLE_PLAY_SUBMISSION.md](./GOOGLE_PLAY_SUBMISSION.md) for detailed submission instructions and [DATA_SAFETY.md](./DATA_SAFETY.md) for data safety configuration.

## Tech Stack

- **Framework**: Expo SDK 54
- **Language**: JavaScript
- **UI**: React Native
- **Styling**: React Native StyleSheet with LinearGradient
- **Storage**: AsyncStorage (local persistence)
- **Feedback**: Expo Haptics (haptic feedback)

## Responsive Design

- ✅ Optimized for phones and tablets
- ✅ Portrait and landscape orientations
- ✅ Responsive player grid layout (2-3 columns)
- ✅ Fullscreen mode for shared displays
- ✅ Touch-friendly UI with large buttons

## Package Information

- **Package ID**: com.bpidjetpktortg.app
- **Version**: 2.0.0
- **Min SDK**: Android 5.0 (API 21)
- **Target SDK**: Android 14 (API 34)

## Dependencies

- `@expo/vector-icons` — Material design icons
- `expo-linear-gradient` — Gradient backgrounds
- `expo-status-bar` — System status bar control
- `@react-native-async-storage/async-storage` — Local data persistence
- `expo-haptics` — Haptic feedback

## License

MIT

## Support

For questions or support, contact: support@schedulefor.com

## Developer

Schedule For (genielab)

---

© 2025 Schedule For. All rights reserved.
