# Google Play Console - Upload Key Certificate Reset Guide

## Step 1: Download Keystore from EAS

Run this command and follow the prompts:

```bash
eas credentials
```

Then select:

1. **Platform**: Android
2. **Build profile**: production
3. **What do you want to do**: Keystore: Manage everything needed to build your project
4. **Select**: Download existing keystore
5. Save the file as `upload-keystore.jks` in your project directory

## Step 2: Export Upload Certificate (PEM Format)

Once you have the keystore downloaded, run this command to export the certificate:

```bash
keytool -export -rfc -keystore upload-keystore.jks -alias KEYSTORE_ALIAS -file upload_certificate.pem
```

**Important**: Replace `KEYSTORE_ALIAS` with the actual key alias shown in your EAS credentials.

From your EAS credentials, the Key Alias is: **5d23b6bd536c2c930901a1b0500ea579**

So your actual command should be:

```bash
keytool -export -rfc -keystore upload-keystore.jks -alias 5d23b6bd536c2c930901a1b0500ea579 -file upload_certificate.pem
```

You'll be prompted to enter the keystore password (stored securely in EAS).

## Step 3: Upload to Google Play Console

1. Go to Google Play Console
2. Navigate to: **Setup → App Signing**
3. Click **Request upload key reset**
4. Upload the `upload_certificate.pem` file
5. Follow Google's verification process

## Your Keystore Details (from EAS)

- **Key Alias**: 5d23b6bd536c2c930901a1b0500ea579
- **MD5 Fingerprint**: 12:5E:8C:72:93:29:16:D8:99:D4:6F:4B:25:80:BE:87
- **SHA1 Fingerprint**: 28:18:02:20:46:61:87:94:D0:1D:85:89:84:29:9D:9E:20:64:20:C5
- **SHA256 Fingerprint**: 9E:A3:15:C1:D0:60:07:2E:E2:26:16:47:34:0C:9B:14:91:0F:11:F7:71:D8:D1:22:A9:24:68:B9:45:E7:40:0F

## Alternative: Let EAS Handle It Automatically

EAS can manage your app signing automatically. When you build with EAS:

```bash
eas build --platform android --profile production
```

EAS will use the keystore it manages for you.

## Quick Steps Summary

1. Run: `eas credentials`
2. Select: Android → production → Keystore → Download existing keystore
3. Save as: `upload-keystore.jks`
4. Export certificate: `keytool -export -rfc -keystore upload-keystore.jks -alias 5d23b6bd536c2c930901a1b0500ea579 -file upload_certificate.pem`
5. Upload `upload_certificate.pem` to Google Play Console

---

**Note**: The keystore password is stored securely in EAS. You can retrieve it from the EAS dashboard at https://expo.dev/accounts/genielab/projects/Discount/credentials
