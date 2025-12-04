# Google Play Store Submission Guide

## Data Safety Section Configuration

When submitting to Google Play, configure the Data Safety section as follows:

### Data Collection

**Does your app collect or share any of the required user data types?**

- Answer: **NO**

### Data Security

**Is all of the user data collected by your app encrypted in transit?**

- Answer: **Not Applicable** (no data is collected)

**Do users have a way to request that their data is deleted?**

- Answer: **Not Applicable** (no data is collected)

---

## App Content Declarations

### Target Audience

- **Target Age Group**: All Ages
- **Designed for Children**: No

### Privacy Policy

- **Privacy Policy URL**: https://schedulefor.com/privacy
- Include the Privacy Policy link in your app listing

### Store Listing Information

**App Title**: Board Game Scoreboard

**Short Description** (80 characters max):
Track scores for two players during board games - Simple, fast, and free

**Full Description**:
Board Game Scoreboard is a simple and intuitive score tracker for two-player board games and card games. Keep track of points with large, easy-to-tap plus and minus buttons.

**Features:**
✓ Two-player score tracking
✓ Large, easy-to-use buttons
✓ Reset scores instantly
✓ Clean, distraction-free interface
✓ No ads or tracking
✓ Works completely offline
✓ Free forever
✓ No permissions required

**Privacy:**
Your privacy matters. This app does not collect, store, or transmit any personal data. All scores are stored locally on your device.

**Category**: Tools

**Tags**: scoreboard, score tracker, board games, card games, game counter, score keeper, two player, game score

**Content Rating**: Everyone

### App Access

- This app is available to all users
- No special access restrictions

### Ads

- Contains ads: **NO**

### In-app Purchases

- Offers in-app purchases: **NO**

---

## Technical Requirements Checklist

✅ **Package Name**: com.bpidjetpktortg.app
✅ **Target API Level**: 34 (Android 14) or higher
✅ **Minimum SDK**: 21 (Android 5.0)
✅ **Permissions**: None required
✅ **Privacy Policy**: Available at https://schedulefor.com/privacy
✅ **Contact Email**: support@schedulefor.com
✅ **App Description**: Complete
✅ **Data Safety**: No data collected

---

## Building for Production

### 1. Build the APK/AAB

```bash
# Build Android App Bundle (recommended for Play Store)
npx expo build:android --type app-bundle

# Or build APK for testing
npx expo build:android --type apk
```

### 2. Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android
```

### 3. Sign Your App

- Generate a keystore file
- Keep your keystore file and credentials secure
- Use the same keystore for all future updates

---

## Required Assets

### App Icon

- **Size**: 512x512 px
- **Format**: PNG (32-bit)
- **Background**: No transparency (use solid color)

### Feature Graphic

- **Size**: 1024x500 px
- **Format**: PNG or JPEG
- **Content**: App logo and key features

### Screenshots (Minimum 2, Maximum 8)

- **Phone**: 16:9 or 9:16 ratio
- **Minimum**: 320 px
- **Maximum**: 3840 px
- Show key features and UI

### Promo Video (Optional)

- YouTube video URL showcasing app features

---

## Pre-Launch Checklist

- [ ] App tested on multiple Android devices/versions
- [ ] All features working correctly
- [ ] Privacy Policy accessible and accurate
- [ ] About page complete with contact information
- [ ] No crashes or critical bugs
- [ ] App follows Material Design guidelines
- [ ] Screenshots prepared
- [ ] Feature graphic created
- [ ] App icon meets requirements
- [ ] Store listing text reviewed
- [ ] Contact email verified and monitored

---

## Post-Launch

### Monitor

- Google Play Console for crash reports
- User reviews and ratings
- App performance metrics

### Respond to Users

- Reply to reviews within 48 hours
- Address bug reports promptly
- Consider user feedback for updates

---

## Support Contact

Email: support@schedulefor.com

---

## Version History

- v1.0.0 (Initial Release) - December 3, 2025
