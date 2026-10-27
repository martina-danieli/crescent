# End-to-end test: app → Supabase "echo" function

What this tests: you type text in the app, press **Send**, the app signs in anonymously,
calls the `echo` edge function, and shows what the function sent back.

Files involved:

| File | What it is |
| --- | --- |
| `src/config.ts` | Supabase URL and publishable key (the one place to change them) |
| `src/lib/supabase.ts` | The shared Supabase client (keeps you signed in across restarts) |
| `App.tsx` | The screen: text box, Send button, result |
| `supabase/functions/echo/index.ts` | The edge function that runs on Supabase |

> ⚠️ The function logs the text you send. That's for testing only and must be removed
> before any real user data is sent, because this app will handle health data.

---

## 0. Check once: anonymous sign-in is on

Supabase Dashboard → **Authentication** → **Sign In / Providers** → make sure
**Allow anonymous sign-ins** is turned on, then click **Save changes**.
It's **off** by default on new projects, and nothing else works until it's on.

---

## 1. Deploy the function

Pick **one** of the two ways.

### Option A: in the browser (no Terminal)

1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and choose your project.
2. Click **Edge Functions** in the left sidebar.
3. Click **Deploy a new function** → **Via Editor**.
4. Name the function exactly: `echo`
5. Delete the sample code in the editor. Open `supabase/functions/echo/index.ts` from this
   project, copy **all** of it, and paste it in.
6. Click **Deploy function** and wait for it to say it's deployed.
7. Open the function's **Details** (or settings) and make sure **Verify JWT** /
   **Enforce JWT verification** is **ON**.

### Option B: from Terminal

1. Open Terminal and go to the project folder:
   ```bash
   cd ~/PichaCode/crescent
   ```
2. Log in to Supabase (opens your browser once):
   ```bash
   npx supabase login
   ```
3. Deploy:
   ```bash
   npx supabase functions deploy echo --project-ref mxwmowbnqdwieyzzlcip
   ```
   Verify JWT stays on by default. Don't add `--no-verify-jwt`.

To update the function later, repeat the same steps (paste the new code, or run the deploy command again).

---

## 2. Test the function without the app (optional, Terminal)

**Step 1: get an anonymous access token.** This creates an anonymous user and saves Supabase's answer in `SIGNUP`:

```bash
SIGNUP=$(curl -s -X POST 'https://mxwmowbnqdwieyzzlcip.supabase.co/auth/v1/signup' -H 'apikey: sb_publishable_5AauuumjJM6mjHupWSf3DQ_8sWww3FU' -H 'Content-Type: application/json' -d '{}')
```

Pull the token out of it:

```bash
TOKEN=$(echo "$SIGNUP" | node -pe 'JSON.parse(require("fs").readFileSync(0)).access_token')
```

Check it worked. This should print a long string starting with `eyJ`:

```bash
echo $TOKEN
```

If it prints `undefined`, show Supabase's answer to see why:

```bash
echo "$SIGNUP"
```

- `"Anonymous sign-ins are disabled"`: turn them on (step 0), then run step 1 again.
- `"Request rate limit reached"`: too many sign-ups from your network in the last hour. Wait, then try again.

**Step 2: call the function** (in the same Terminal window):

```bash
curl -i -X POST 'https://mxwmowbnqdwieyzzlcip.supabase.co/functions/v1/echo' -H "Authorization: Bearer $TOKEN" -H 'apikey: sb_publishable_5AauuumjJM6mjHupWSf3DQ_8sWww3FU' -H 'Content-Type: application/json' -d '{"text":"hello from Tide"}'
```

You should see `HTTP/2 200` and something like:

```json
{"received":"hello from Tide","length":15,"userId":"…","at":"2026-…"}
```

Common answers:
- `401`: the token is missing or expired. Run step 1 again.
- `400`: the body didn't contain `"text"` as a string.
- `404`: the function isn't deployed or isn't named exactly `echo`.

---

## 3. Run the app in the iOS Simulator

This is a bare React Native project (no Expo). We added a native library (AsyncStorage),
so you need **one new build in Xcode**. After that, JavaScript changes reload instantly again.

1. **One time only**, if you haven't yet: point the tools at Xcode (asks for your password):
   ```bash
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   ```
2. Start Metro and leave this Terminal window open:
   ```bash
   cd ~/PichaCode/crescent && npm start
   ```
3. Open `ios/Crescent.xcworkspace` in Xcode (the white **.xcworkspace**, not `.xcodeproj`).
4. Pick **iPhone 17 Pro** at the top and press **▶ Run** (⌘R).
5. In the simulator, tap the text box, type `hello from Tide`, and tap **Send**.
6. You should see a spinner, then:
   ```
   {
     "received": "hello from Tide",
     "length": 15,
     "userId": "…",
     "at": "…"
   }
   ```
   If something fails, a red message explains it (with the HTTP status if there is one).

### Check that the same user comes back after a restart

1. Write down (or screenshot) the `userId`.
2. Fully close the app: in Xcode press **■ Stop**, then press **▶ Run** again.
   (Or in the simulator, swipe up from the bottom, swipe the app away, and tap its icon.)
3. Tap **Send** again. The `userId` should be **the same**.

---

## 4. See the log line in the dashboard

1. Supabase Dashboard → **Edge Functions** → click **echo**.
2. Open the **Logs** tab.
3. Look for a line like:
   ```
   echo userId=1234-… length=15 text="hello from Tide"
   ```
   Logs can take a few seconds to show up. Refresh if you don't see it.

---

## Troubleshooting

| What you see | What to do |
| --- | --- |
| `HTTP 404` in the app | The function isn't deployed or isn't named `echo`. Redo step 1. |
| `HTTP 401` in the app | Make sure anonymous sign-ins are enabled (step 0). |
| "Anonymous sign-ins are disabled" | Turn it on (step 0). |
| `Network error` | Check the Mac's internet connection, then try again. |
| Red screen "No bundle URL present" | Metro isn't running. Do step 3.2, then press ⌘R in the simulator. |
| Build error mentioning AsyncStorage or "file cannot be found" | Run `cd ios && pod install && cd ..`, then press ▶ again. |
