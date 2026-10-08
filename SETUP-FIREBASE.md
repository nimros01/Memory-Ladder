# Setting up online accounts

Recall Ladder saves statistics online with Firebase (free Spark plan is enough for family use).
Until the two values below are filled in, the game runs exactly as before, with no sign-in.

## 1. Create the project

1. Go to <https://console.firebase.google.com> and click **Create a project**.
   Call it something like `recall-ladder`. Google Analytics is not needed, turn it off.
2. On the project home page click the **web** icon (`</>`) to add a web app.
   Any nickname is fine; do **not** tick Firebase Hosting.
3. Firebase shows a `firebaseConfig` block. Only two values are needed:
   `apiKey` and `projectId`. These are not secret; they are meant to be in the page.

## 2. Turn on email and password sign-in

**Build > Authentication > Get started > Sign-in method > Email/Password**: enable the first switch
(leave "Email link" off) and save.

Optional: **Authentication > Templates** lets you change the sender name and wording of the
confirmation and password-reset emails.

## 3. Create the database

**Build > Firestore Database > Create database**

- Location: pick one close to you, for example `eur3 (europe)`. This cannot be changed later.
- Start in **production mode**.

## 4. Publish the security rules

In **Firestore Database > Rules**, replace everything with the contents of
[`firestore.rules`](firestore.rules) from this repository and click **Publish**.

The rules let each account read and write only its own data, only after its email is confirmed,
and never change or delete a stage once it is uploaded.

(With the Firebase CLI instead: `firebase deploy --only firestore:rules --project <projectId>`.)

## 5. Put the values in the game

In `index.html`, near the top of the script:

```js
var FIREBASE = { apiKey: "AIza...", projectId: "recall-ladder-xxxxx", emulator: "" };
```

Commit and push; GitHub Pages picks it up within a minute or two.

## 6. Recommended: limit the key to your site

In Google Cloud console > **APIs & Services > Credentials**, open the "Browser key" Firebase created,
set **Application restrictions** to *Websites* and add `https://nimros01.github.io/*`.
Add any other address the game will be served from later (for example a Cloudflare Pages domain).

## How it behaves

- Without an account, play works as before and everything stays on the device.
- **Create account** sends a confirmation email. Nothing uploads until the link in it is opened.
  After that, everything played on the device so far (all players) uploads.
- Signing in on another device downloads the account's players and statistics. If that device
  already has guest play, it asks whether to add it to the account or discard it; players with the
  same name are joined together.
- Stages are saved on the device first and upload in the background, so play works offline and
  catches up when the connection is back. The page itself also works offline after the first visit.
- **Sign out** removes the account's data from that device (it stays online). Use it on shared devices.
- Clear stats, delete player, rename and per-player options all sync between devices.

## Testing locally with the emulator

```sh
npx firebase-tools emulators:start --only auth,firestore --project demo-recall
```

Then set `FIREBASE = { apiKey: "any", projectId: "demo-recall", emulator: "http://127.0.0.1" }`
and serve the folder (`python3 -m http.server`). Confirmation links appear in the emulator UI at
<http://127.0.0.1:4000/auth>.
