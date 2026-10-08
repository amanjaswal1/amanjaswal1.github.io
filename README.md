# AMJ · Photographs

Photographs by me, at **[amanjaswal1.github.io](https://amanjaswal1.github.io)**.

---

## 1. What it is

A personal photography site with two sides, **Color** and **Black & White**. Each side is split into sets.

- **Home:** the two sides fill the screen. Hover one and it grows; click it and its photo glides open into that side.
- **A side:** a cover photo with the title on it, the sets underneath, then the photos laid out in tidy, even rows.
- **A photo:** opens full screen. Visitors can zoom (click, scroll or pinch), swipe or use the arrow keys to browse, copy a link, or press **Request to use** to email me about licensing it. The place it was taken is shown when known.
- **About:** a short hello, a quote, how to get in touch, and the copyright notice.

There are no ads, trackers or analytics, and no cookies. Every photograph is © protected, all rights reserved.

---

## 2. How it works

**Three repositories:**

| Repo | Visibility | Holds |
|---|---|---|
| `amanjaswal1.github.io` (this one) | public | the website, plus small web copies of the photos |
| `photos-color` | private | full-resolution colour originals |
| `photos-bw` | private | full-resolution black & white originals |

**Uploading a photo** to a private repo starts its *Publish photos* automation (GitHub Actions). It:

1. **Makes web copies** at 512 / 1024 / 2048 px. It turns each photo upright, converts it to sRGB, and never enlarges.
2. **Protects them.** It removes GPS coordinates and camera serial numbers, and writes the © notice and contact details into every file.
3. **Reads the metadata:** date, camera, lens, settings, and GPS turned into a place name (e.g. "Banff, Alberta, Canada"). The place lookup runs offline using GeoNames data.
4. **Merges in `photo-log.csv`.** This is a table with one row per photo, where missing places and dates can be filled in by hand. Hand-typed values always win.
5. **Measures the pixels and orders the photos.** Each photo is measured in CIE L\*a\*b\* colour: brightness, contrast, hue, colourfulness (Hasler–Süsstrunk), warmth and texture. Then the shortest path through all photos in that space is found (nearest-neighbour + 2-opt), so each photo sits next to the ones it most resembles. A spectral-residual saliency map finds each photo's subject, so crops and zooms aim at it.
6. **Pushes** `photos/<side>/…` and `data/<side>.json` into this repo. GitHub Pages then publishes the site.

**The website** is plain HTML, CSS and JavaScript, with no build step and no libraries.

- `assets/js/app.js` reads the two data files.
- It packs photos into rows with optimal line-breaking (the way TeX lays out paragraphs), so every row is close to the ideal height.
- It animates between pages with the browser's View Transitions API. Browsers without it get a soft fade.
- All fonts are stored in `assets/fonts/`, so nothing loads from third parties.

**To change things**, search the files for ✏️:

- `config.js`: every word on the site, plus switches
- `assets/css/site.css`: sizes, colours, speeds (find things by their `[TAG]`)
- `settings.json` (in each photo repo): image sizes and quality

---

## Credits & thanks

- **Ram Patra**, for the [photography](https://github.com/rampatra/photography) Jekyll template that started this idea.
- **AJ / [HTML5 UP](https://html5up.net)** ([@ajlkn](https://twitter.com/ajlkn)), for the *Multiverse* template that Ram's site builds on.
- **Bydani**, for the typeface **Soria** ([Behance](https://www.behance.net/danibydani) · [Font Squirrel](https://www.fontsquirrel.com/fonts/soria) · [Gumroad](https://bydani.gumroad.com/l/uLSbM)). Licensed [CC BY-ND 4.0](https://creativecommons.org/licenses/by-nd/4.0/). Change made: converted from TTF to WOFF2 for the web; the design is unchanged.
- **The Inter Project Authors / Rasmus Andersson**, for [Inter Tight](https://github.com/rsms/inter-tight) (SIL Open Font License 1.1).
- **IBM**, for [IBM Plex Mono](https://github.com/IBM/plex) (SIL Open Font License 1.1).
- **[GeoNames](https://www.geonames.org)**, for place data ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)), used through [reverse_geocode](https://github.com/richardpenman/reverse_geocode) by Richard Penman.
- **[Pillow](https://python-pillow.org)**, **[NumPy](https://numpy.org)** and **[SciPy](https://scipy.org)**, for the image processing and maths.
- The ideas behind the layout:
  - D. Hasler & S. Süsstrunk, *Measuring colourfulness in natural images* (2003)
  - X. Hou & L. Zhang, *Saliency Detection: A Spectral Residual Approach* (CVPR 2007)
  - D. E. Knuth & M. F. Plass, *Breaking Paragraphs into Lines* (1981)
- Built and modified using **Claude Opus 5.5** by [Anthropic](https://www.anthropic.com).

## Licence

**Photographs:** © Aman Jaswal. All rights reserved. Not for use without permission. 

**Code:** no open-source licence is granted, so all rights are reserved by default.

**Fonts:** under their own licences, in `assets/fonts/licenses/`.
