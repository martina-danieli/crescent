# crescent

Period Tracker. A bare-bones React Native app (iOS only), to learn how to use React Native for the next step of the app building.

## One-time setup (each Mac)

1. Install **Xcode** from the App Store and open it once.
   In Xcode > Settings > Components, install the **iOS** platform (simulator).
2. Point the command-line tools at Xcode (asks for your password):
   ```bash
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   ```
3. Install [Homebrew](https://brew.sh), then:
   ```bash
   brew install node watchman cocoapods
   ```

## Install the project

From the repo folder:

```bash
npm install
cd ios && pod install && cd ..
```

Run `pod install` again whenever you add a library that has native code.

## Run it in Xcode

1. Start the JavaScript server in a terminal and leave it open:
   ```bash
   npm start
   ```
2. Open **`ios/Crescent.xcworkspace`** in Xcode (the `.xcworkspace`, **not** the `.xcodeproj`).
3. Pick an iPhone simulator at the top and press **Run** (⌘R).

You can also skip Xcode and run `npm run ios`.

## Where things are

| File | What it is |
| --- | --- |
| `App.tsx` | The app's screen. Start editing here; saving reloads the simulator. |
| `index.js` | Entry point that registers `App`. |
| `ios/` | The native Xcode project. You rarely need to touch it. |
| `package.json` | JavaScript dependencies and scripts. |

## Handy tips

- In the simulator, press **⌘D** for the dev menu, or **R** in the `npm start` terminal to reload.
- Something weird? Stop Metro and run `npm start -- --reset-cache`.
- Native build errors after adding a library: `cd ios && pod install`, then clean the build in Xcode (⇧⌘K).

## Supabase echo test

See [docs/echo-test.md](docs/echo-test.md) for deploying the `echo` function and testing it from the app.
