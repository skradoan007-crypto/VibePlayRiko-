# VibePlay – Riko

একটি Android মিউজিক প্লেয়ার অ্যাপ। React Native + Expo দিয়ে তৈরি।

`com.rikodev.music` · Expo SDK 54 · Expo Router · TypeScript

---

## GitHub Actions দিয়ে APK Build করার নিয়ম

### ধাপ ১ — GitHub-এ নতুন Repository তৈরি করুন

1. [github.com/new](https://github.com/new) এ যান
2. Repository name দিন: `VibePlayRiko`
3. **Private** রাখুন (যাতে keystore safe থাকে)
4. **Initialize this repository with a README** — এটা **টিক দেবেন না**
5. **Create repository** চাপুন

### ধাপ ২ — এই ফোল্ডারের সব ফাইল GitHub-এ push করুন

আপনার PC-তে Git থাকলে:

```bash
cd vibeplay-riko
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/আপনার-username/VibePlayRiko.git
git push -u origin main
```

অথবা GitHub Desktop দিয়েও করতে পারবেন।

### ধাপ ৩ — Build শুরু হবে automatically

Push করার পর GitHub নিজেই build শুরু করবে।

**Build দেখতে:**
- আপনার repository → **Actions** tab → **Build Android APK (32+64 bit)**

Build সময় লাগবে প্রায় **১৫–২৫ মিনিট**।

### ধাপ ৪ — APK Download করুন

Build শেষ হলে:
1. Actions → সবচেয়ে নতুন workflow run-এ click করুন
2. নিচে **Artifacts** section দেখবেন
3. **VibePlayRiko-universal-APK** এ click করে ZIP download করুন
4. ZIP খুললে ভেতরে `.apk` ফাইল পাবেন

---

## APK-এর বিবরণ

এই workflow যে APK তৈরি করে সেটা **fat/universal APK** — মানে একটাই APK ফাইলে চারটা architecture থাকে:

| Architecture | ফোন |
|---|---|
| `armeabi-v7a` | পুরনো 32-bit Android ফোন |
| `arm64-v8a` | নতুন 64-bit Android ফোন (বেশিরভাগ আধুনিক ফোন) |
| `x86` | Emulator (32-bit) |
| `x86_64` | Emulator (64-bit) |

---

## Manually Build চালু করতে

কোনো code change না করলেও manually build চালু করা যাবে:
- **Actions** tab → **Build Android APK (32+64 bit)** → **Run workflow** → **Run workflow**

---

## App Features

- Local music library scanning
- Audio playback (background support)
- Playlist management
- Shuffle modes (group shuffle)
- Lyrics (.lrc) support
- DSP / audio effects
- Glass UI theme
- SQLite database

---

## Local Development

```bash
npm install
npx expo start
```

Native modules আছে বলে **Expo Go**-তে চলবে না। Expo Dev Client লাগবে।
