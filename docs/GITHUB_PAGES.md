# GitHub Pages deployment

The `Deploy SHEditor Demo` workflow validates and publishes `dist/playground` using GitHub's official Pages actions and OIDC token. It runs on every push to `main` and can also be started manually.

1. Open the repository on GitHub and select **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main`, or open **Actions → Deploy SHEditor Demo → Run workflow**.
4. Wait for both the `build` and `deploy` jobs to succeed.
5. Open the URL shown in the `github-pages` deployment environment.

If the repository does not allow the workflow to perform first-time Pages enablement, a built `gh-pages` branch is also available. In **Settings → Pages**, choose **Deploy from a branch**, select `gh-pages` and `/(root)`, then save. This one-time repository setting cannot be enabled by ordinary source-code pushes.

For this repository, the expected project-site URL is `https://mahdiporkar.github.io/SHEditor/`. It becomes available only after the first successful deployment. The Vite build uses relative assets and hash routes, so repository renames and route refreshes do not require configuration changes.

No secret or personal access token is required. A custom domain can be added later through GitHub Pages settings without changing the build.
