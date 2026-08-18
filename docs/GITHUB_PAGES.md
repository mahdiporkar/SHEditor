# GitHub Pages deployment

The `Deploy SHEditor Demo` workflow validates the repository and publishes `dist/playground` to the dedicated `gh-pages` branch. It runs on every push to `main` and can also be started manually.

1. Open the repository on GitHub and select **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**, then choose `gh-pages` and `/(root)`.
3. Push to `main`, or open **Actions → Deploy SHEditor Demo → Run workflow**.
4. Wait for both the `build` and `deploy` jobs to succeed.
5. Open `https://mahdiporkar.github.io/SHEditor/` after GitHub finishes the Pages build.

For this repository, the expected project-site URL is `https://mahdiporkar.github.io/SHEditor/`. It becomes available only after the first successful deployment. The Vite build uses relative assets and hash routes, so repository renames and route refreshes do not require configuration changes.

No personal token or repository secret is required; the workflow uses the scoped built-in token. A custom domain can be added later without changing the build.
