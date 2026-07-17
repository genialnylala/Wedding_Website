# Wedding Website (Decap CMS)

This is a static wedding website scaffold with Decap CMS for editing content.

## Structure

- `index.html`, `styles.css`, `script.js`: public website
- `content/*.json`: editable content
- `content/*.en.json`, `content/*.pl.json`, `content/*.el.json`: language-specific content
- `admin/index.html`, `admin/config.yml`: Decap CMS admin panel

`content/site*.json` also supports media fields:

- `heroImageUrl`: hero background image
- `photos`: gallery image URL list
- `videoUrl`: YouTube/Vimeo/direct video URL

## Languages

The site supports three languages:

- English (`en`)
- Polish (`pl`)
- Greek (`el`)

Use the language switcher in the header or `?lang=en|pl|el` in the URL.
The selected language is saved in local storage.

## Local preview

Use any static server from this folder, for example:

```powershell
python -m http.server 8080
```

Then open:

- `http://localhost:8080/` for the site
- `http://localhost:8080/admin/` for CMS

## Local CMS workflow (no Netlify login)

This project is configured with:

- `backend: git-gateway` for production
- `local_backend: true` for local editing

To use CMS locally, run two terminals from this folder:

1. Static site server:

```powershell
python -m http.server 8080
```

2. Decap local proxy server:

```powershell
npx decap-server
```

Then open `http://localhost:8080/admin/` and choose the local backend login option.

## Decap CMS setup for production

This config uses `git-gateway` backend, typically with Netlify Identity.
To enable editing in production:

1. Deploy the site (for example on Netlify).
2. Enable Identity and Git Gateway in your hosting dashboard.
3. Invite yourself as a CMS user.
