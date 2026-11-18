# Spoiler Shield for GTA VI

A Chrome extension (Manifest V3) that hides GTA VI spoilers across the web, and lets you decide exactly what counts as a spoiler: only the story, only the map, everything, or your own custom rules.

**Nothing about GTA VI is hard-coded.** The engine only knows how to read *topic packs* (JSON files with context words, categories and spoiler words) and *site rules* (JSON describing how each website wraps a post). GTA VI ships as the default pack. Packs and site rules can be edited in the settings, installed from a file, or subscribed to from a link that refreshes every 6 hours, so new spoiler words (a mission revealed after launch, a new character) reach everyone without an extension update. The same engine works for any game, show or film: see [docs/packs.md](docs/packs.md).

> Unofficial fan tool. Not affiliated with or endorsed by Rockstar Games or Take-Two Interactive.

## Install (unpacked)

1. Open `chrome://extensions` and switch on **Developer mode** (top right).
2. Click **Load unpacked** and pick this `gta6-spoiler-shield` folder.
3. Pin the shield icon. A welcome tab opens with the settings.

Works in Chrome, Edge, Brave, Arc, Opera and other Chromium browsers.

## Spoilers that never say "spoiler"

Most people don't label spoilers. Spoiler Shield layers several kinds of detection so it catches those too. The full explanation is in [docs/smart-detection.md](docs/smart-detection.md).

- **Reactions & teasers.** Things like "bro what 💀 #GTA6" or "not them doing that 😭".
- **Unlabeled screenshots.** A GTA VI post with a picture but no spoiler words gets **just the picture covered**, and the title stays readable.
- **Learns from the game wiki every 12 hours.** It picks up new characters, missions and places as editors add them. On launch eve it learned 296 words this way.
- **Report as a spoiler** (right-click). The post is hidden at once, everywhere that video or post appears. Its picture is fingerprinted, so the same screenshot reposted under a different caption is caught too.
- **Community server** (`server/`, no dependencies). Once enough *different* people report something, it's hidden for everyone. The server also learns names and channels that keep showing up in reports. "Not a spoiler" votes, rate limits and moderation keep it honest.
- **Optional on-device AI.** It reads the words written inside thumbnails ("LUCIA DIES??"). Pictures never leave your computer.

## What it does

- **Covers spoilers before they paint.** It runs at `document_start` and watches the page with a `MutationObserver`, so infinite feeds, lazy-loaded comments and recycled cards (YouTube) are caught as they appear.
- **Shields the whole card, not just a word.** It has tuned rules for 29 sites and falls back to a smart "one card in a feed" detector everywhere else:
  - **Video & streaming:** YouTube (videos, Shorts, comments, live chat, end screens, search suggestions), Twitch (cards, chat), Kick, TikTok (feed, search, comments)
  - **Social:** X, Instagram (grid tiles, posts, comments), Facebook, Threads, Bluesky, Mastodon (any server, detected automatically), Tumblr, LinkedIn, Pinterest, Snapchat, VK
  - **Communities & chat:** Reddit (new UI with web components, old Reddit), Discord, WhatsApp Web, Telegram Web, Messenger, Steam Community, 9GAG, Imgur, Quora, Hacker News, Fandom
  - **Search:** Google, Bing, DuckDuckGo, including autocomplete suggestions
- **Understands how people post.** Glued hashtags (`#GTA6Spoilers`, `#GTAVIEasterEggs`), handles (`@RockstarGames`), fancy fonts (`𝗚𝗧𝗔 𝟲`), invisible zero-width characters, emoji digits and possessives ("Lucia's death") are all read correctly. "No spoilers" and "spoiler-free" are treated as promises, so those videos stay visible.
- **Live streams.** A Twitch or Kick stream whose category is GTA VI is shielded as gameplay footage, even if the title is just "day 1 blind run".
- **Web components.** Text inside open shadow DOM (new Reddit and others) is read too.
- **Full-page shield** for spoiler articles, wiki pages and video watch pages, with the tab title hidden and videos paused. Options: *Take me back*, *Show page* (posts on it stay shielded), *Turn off on this site*.
- **Smart page context.** On a page that is itself about GTA VI (r/GTA6, a GTA VI video, a GTA VI article URL), every comment is judged as GTA VI even if it never names the game. So "the ending made me cry" under a GTA VI video gets shielded, while the same sentence on a cooking blog does not.
- **Reads more than text:** image `alt`, `title` and `aria-label` too, so thumbnails with spoiler alt text are covered.

## Categories (GTA VI pack)

| On by default | Off by default |
|---|---|
| 📖 Story & plot · 🎭 Characters & cast · 🎯 Missions & heists · 🗺️ Map & locations · 📹 Gameplay footage · 🕵️ Leaks & rumors · 🥚 Easter eggs & secrets | 🕹️ Gameplay & features · ⭐ Reviews & scores · 🎬 Trailers & marketing · 🌐 Online & multiplayer · 📻 Music & radio |

Each category's word list is editable in the settings (add or remove words, reset to default).

## Sensitivity

- **Relaxed:** only clear spoilers (endings, deaths, twists, map leaks, walkthroughs, playthroughs). News and trailers stay visible.
- **Balanced** (default): anything about GTA VI that touches one of your categories.
- **Blackout:** every mention of GTA VI, whatever it is about.

"About GTA VI" is decided by a context score: strong signals (*GTA 6*, *GTA VI*, *Leonida*, *Jason Duval*, *Port Gellhorn*…) count on their own, while weaker ones (*GTA*, *Rockstar*, *Vice City*, *Lucia*…) need to appear together. That is why "Vice City Stories ending" or "the ending of this movie" stays visible.

## Making it your own

- **Topic packs:** install from a link (auto-updates) or a file, create one for any game or show from a template, edit any pack as JSON with validation, export, switch packs on or off. With several packs on, every shield says which pack it came from.
- **Site rules:** subscribe to a site rules link to get layout fixes, or write your own rules for a forum or site that isn't covered. Yours always win.

- **Custom rules:** your own categories with any words, with or without requiring GTA VI context (e.g. Spanish spoilers, a streamer's name).
- **Always shield / Never shield** word lists, and **Also means GTA VI** for nicknames and translations.
- Word syntax: plain phrases (spacing and hyphens are flexible, so `gta 6` also matches `GTA-6` and `#GTA6`), `betray*` for word endings, `/regex/` for anything else.
- **Shield style:** Blur, Redact (solid) or Collapse (slim bar, keeps feeds short).
- **Reveal:** click, hold for a second (no accidental spoilers), or locked.
- **Pause** for 15 min / 1 h / 4 h / until tomorrow, **turn off per site**, or set an **end date** after which the shield switches itself off.
- **Test lab** in settings shows what would be shielded and why. **Stats** show what you dodged. **Export/import** your setup to share with friends.

Right-click menu: *Always shield "selection"*, *Never shield text with "selection"*, *Shield this element*, *Turn off on this site*, *Pause 15 minutes*.

Shortcuts: `Alt+Shift+S` toggles the shield, `Alt+Shift+R` reveals everything on the current page (change them at `chrome://extensions/shortcuts`).

## Privacy

No analytics, no account. Settings, stats and your reports live in `chrome.storage.local`. The extension only goes online to:

- refresh packs and site rules from links you chose
- read the game wiki to learn new names (you can turn this off)
- download the community feed and send *your* reports, only if you set a community server

Pictures are only fingerprinted or read on your computer.

## Development

```
packs/gta6.json            the GTA VI topic pack (data)
rules/sites.json           per-site rules for ~30 networks (data)
src/shared/defaults.js     engine constants and default settings (no topic data)
src/shared/matcher.js      term compiler + text judge (pure, no DOM)
src/shared/packs.js        pack/site-rule validation, storage, install, subscribe, auto-update
src/shared/settings.js     settings storage and migration
src/shared/imagehash.js    picture fingerprints (difference hash with letterbox trimming)
src/shared/community.js    community feed sync and report sending
src/shared/vision.js       optional on-device model / TextDetector wrapper
src/offscreen/             hidden page for the model when the background can't reach it
server/server.js           community server (no dependencies)
src/content/               page engine + overlay styles
src/background/            badge, stats, context menus, shortcuts
src/popup/, src/options/   UI
```

```
npm test            # unit tests: matcher, smart detection, community server
npm run test:e2e    # loads the extension in Chromium via Playwright and checks real pages
npm run test:social # 20 social-network look-alike pages served under their real hostnames
npm run test:packs  # install a pack from a link, update it remotely, write packs and site rules in settings
npm run test:smart  # unlabeled posts, wiki learning, reports, reposted screenshots, community threshold, vision
npm run server      # run a community server locally
npm run icons       # re-render icons from icons/icon.svg
npm run zip         # package for the Chrome Web Store
```

Known limits: text inside closed shadow DOM and inside images or video frames themselves (no OCR) cannot be read. Sites change their markup often; the per-site rules live in `rules/sites.json` (or a subscribed link) and the generic fallback still catches most things when a rule goes stale. If a site shows something that slipped through, right-click it and choose **Shield this element**, or add the word to *Always shield*.
