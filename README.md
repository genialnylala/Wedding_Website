# Wedding Website

This is a static wedding website with content managed in code.

## Structure

- `index.html`, `styles.css`, `script.js`: public website
- `content/*.json`: site content
- `content/*.en.json`, `content/*.pl.json`, `content/*.el.json`: language-specific content

`content/site*.json` also supports media fields:

- `heroImageUrl`: hero background image path (local uploads go to `assets/uploads`)
- `photos`: gallery image path list (local uploads go to `assets/uploads`)
- `videoUrl`: YouTube/Vimeo/direct video URL
- `weddingDate`: display date text shown in the wedding details section
- `weddingDateIso`: ISO date-time value used to calculate the day countdown
- `weddingLocation`: location text shown in the wedding details section

Media paths work with GitHub Pages project URLs (for example `https://<user>.github.io/<repo>/`) and can be stored as either:

- `assets/uploads/file.jpg` (preferred)
- `/assets/uploads/file.jpg` (still supported by runtime normalization)

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

Then open `http://localhost:8080/` to view the site.
