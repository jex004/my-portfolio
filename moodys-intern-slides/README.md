# Internship presentation

The portfolio's pinned presentation is placed after Selected work and before Off the clock. It uses all eight slides in narrative order, with arrow keys, swipe navigation, and slide selectors. Slide 5 includes a link to the published flipbook. It does not autoplay.

## Source files and order

The original SingleFile HTML exports are unchanged. Their visible slides run in this order:

1. `moodys-slide-1.html` - Introduction
2. `moodys-slide-8.html` - About me
3. `moodys-slide-7.html` - Internship in numbers
4. `moodys-slide-6.html` - Behind the tickets
5. `moodys-slide-5.html` - Projects delivered
6. `moodys-slide-4.html` - Python showcase
7. `moodys-slide-3.html` - Team acknowledgments
8. `moodys-slide-2.html` - Thank you

Each saved HTML file contains the whole presentation, with one slide visible. The preview generator isolates that slide and takes a browser screenshot, preserving its text, charts, and photos while excluding the surrounding corporate website navigation. The saved exports have no scripts, so these are static slide previews, not live interactive charts.

Previews enlarge and center the visible content with consistent safe margins, rather than retaining the exports' large empty borders. The statistics slide gets a wider chart column to accommodate its saved SVG coordinates. Slides stay inline; clicking them does not open a popup.

## Updating previews

`slides.js` provides the slide titles, descriptions, image paths, source paths, and extracted transcripts. The previews in `../imgs/moodys/` total about 600 KB, compared with about 67 MB for the source HTML files. Only the current preview needs to load on the website.

After replacing a source slide:

1. Serve the repository on `http://127.0.0.1:8000` (for example, `python -m http.server 8000 --bind 127.0.0.1`).
2. Start a separate Chromium test browser with remote debugging on port 9223 and a dedicated temporary user-data directory.
3. Run `node scripts/build-slide-previews.cjs` from the repository root (Node 22 or newer).

This regenerates `imgs/moodys/slide-01.webp` through `slide-08.webp` and `moodys-intern-slides/slides.js`. The generator uses Node's built-in WebSocket support; it has no package dependencies. Update its `order`, `titles`, and `summaries` arrays if the presentation changes.
