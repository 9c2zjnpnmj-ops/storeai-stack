# StoreAI Stack

Bilingual AI tools directory, tutorials, comparisons, and matcher for Shopify sellers.

## Local preview

```powershell
node scripts\build.js
node scripts\serve.js
```

Open `http://127.0.0.1:4173/zh/`.

## GitHub Pages build

For a project page named `storeai-stack`:

```powershell
$env:BASE_PATH='/storeai-stack'
$env:SITE_URL='https://YOUR_USERNAME.github.io/storeai-stack'
node scripts\build.js
```

Publish the `dist` folder as the GitHub Pages root.
