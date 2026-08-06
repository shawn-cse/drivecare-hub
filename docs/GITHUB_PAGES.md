# GitHub Pages Deployment

DriveCare Hub keeps the complete frontend and backend in one GitHub repository while publishing only the frontend demo to GitHub Pages.

## Published content

The workflow uploads this directory only:

```text
client/
```

The following directories remain repository source code and are not part of the published Pages artifact:

```text
server/
tests/
docs/
scripts/
screenshots/
```

## Demo behaviour

The frontend automatically enables browser demo mode when it detects a `github.io` hostname. In demo mode:

- The application opens with realistic sample records.
- Changes are stored in browser `localStorage`.
- No request is sent to the Node.js backend.
- The user can reset sample records from the interface.
- Data is specific to that browser and device.

For local browser testing, add `?demo=1` to the URL.

Example:

```text
http://localhost:4000/?demo=1
```

## Enable deployment

1. Push the complete project to the `main` branch.
2. Open the GitHub repository.
3. Go to **Settings → Pages**.
4. Set the publishing source to **GitHub Actions**.
5. Open the **Actions** tab.
6. Run or wait for **Deploy frontend demo to GitHub Pages**.

The workflow file is:

```text
.github/workflows/deploy-pages.yml
```

## Expected website

```text
https://shawn-cse.github.io/drivecare-hub/
```

## Common problem: README appears instead of the application

This happens when GitHub Pages is configured to publish the repository root instead of using the included workflow.

Correct the Pages source to **GitHub Actions**. The workflow then uploads `client/`, where the actual `index.html` is located.

## Full backend deployment

GitHub Pages cannot run the Node.js API. To demonstrate the real backend, deploy the complete repository to a Node.js hosting platform and start it with:

```bash
npm start
```
