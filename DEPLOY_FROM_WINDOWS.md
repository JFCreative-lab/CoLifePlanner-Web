# Deploy From Windows And Install On iPhone

This is the easiest route. No Xcode. No Apple Developer account. No certificate. No provisioning profile.

## Upload To GitHub

1. Create a new GitHub repository, for example `our-love-planner`.
2. Upload everything inside this `CoLifePlanner-Web` folder.
3. Make sure these files are visible in the repository:
   - `index.html`
   - `app.js`
   - `styles.css`
   - `manifest.webmanifest`
   - `service-worker.js`
   - `.github/workflows/deploy-pages.yml`
   - `assets/couple-photo.png`

## Turn On GitHub Pages

1. Open the repository on GitHub.
2. Go to Settings.
3. Go to Pages.
4. Under Source, choose GitHub Actions.

## Run The Deploy

1. Go to Actions.
2. Select `Deploy Web App`.
3. Click Run workflow.
4. When it finishes, GitHub shows a website link.

## Install On iPhone

1. Open the GitHub Pages website link in Safari on your iPhone.
2. Tap the Share button.
3. Tap Add to Home Screen.
4. Name it `Our Love`.
5. Tap Add.

Now it opens from your iPhone home screen like an app.

## Important

The plans are saved on the phone/browser with local storage. That means your phone keeps its own list. To sync between you and your wife later, the web app needs a small online database.
