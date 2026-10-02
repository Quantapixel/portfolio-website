# Jaskaran Singh — personal website

A Home/About scroll site with a separate expanded profile and work index, built with HTML, CSS, and vanilla JavaScript. It keeps the original black and gold palette, Fraunces name treatment, and JetBrains Mono interface text, with an interactive metallic loop sculpture.

## Preview

Run `python3 preview.py`, then visit http://127.0.0.1:4181. Home and About scroll between the two homepage sections. The homepage About section stays compact with Languages and AI / vision; “Read the full profile” opens `/about`, while Work and “View all work” open `/projects`. Two featured entries sit beneath the homepage introduction and open shareable detail views. The preview returns an idle state for Spotify; Vercel uses the existing server endpoint.

## Editing

- `index.html`: the homepage, biography, contact links, work index, and detail-view structure.
- `content.js`: all project, write-up, and research entries. The first two entries marked `featured: true` appear on the homepage. Article bodies are locally authored HTML.
- `app.js`: homepage section navigation, `/projects` routing, detail views, history/scroll restoration, scroll reveals, and the GitHub contribution grid.
- `css/main.css` and `css/terminal-identity.css`: palette, typography, layout, animations, and responsive styles. `css/featured-work.css` styles the homepage features and separate work index. `css/about-profile.css` styles the About bio, toolkit, and experience timeline; the profile copy and dates in `index.html` come from the LinkedIn text supplied by Jaskaran.
- `hero-sculpture.js` and `css/hero-sculpture.css`: the responsive hero and metallic loop. One static WebGL mesh, one draw call per frame, capped at 30 rendered frames per second and 960 pixels per side. Animation pauses offscreen, in background tabs, and for reduced motion. Supports dragging and arrow keys; a static illustration appears when WebGL is unavailable.

Project details are linked from both Featured and the work index, with URLs such as `/projects?project=cicada-writeup`. Browser Back restores the previous scroll location; the detail back link returns to its originating page. Older `/#work`, `/#projects`, and `/?project=…` links remain supported. Scroll reveals respect reduced-motion preferences. Vercel Analytics and the existing Spotify endpoint remain enabled.
