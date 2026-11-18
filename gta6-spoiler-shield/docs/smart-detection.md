# Smart detection: catching spoilers that never say "spoiler"

Most spoilers aren't labeled. People post "bro what 💀", a thumbnail of the ending with "you have to see this", or a clip of a mission whose name nobody has heard of yet. Spoiler Shield stacks several layers, cheapest first, so each one catches what the others miss.

| Layer | Catches | Runs where | On by default |
|---|---|---|---|
| **Pack words** | "GTA 6 ending explained", "#GTA6Spoilers the final heist" | In the page | Yes |
| **Reactions & teasers** (pack category) | "bro what 💀 #GTA6", "not them doing that 😭", "I'm not okay" | In the page | Yes |
| **Unlabeled screenshots & clips** (pack category) | A GTA VI post with a picture but no spoiler words: **only the picture is covered**, so you can still read "GTA 6 unlock times confirmed" | In the page | Yes |
| **Page context** | "the ending made me cry" under a GTA VI video, in r/GTA6, on a GTA VI stream | In the page | Yes |
| **Learning from the wiki** | Characters, missions, places and gangs added to the game's wiki after the pack was written | Background, every 12 h | Yes |
| **Your reports** | Anything you right-click → 🚩 *Report as a spoiler*: hidden at once, everywhere that video or post appears | In the page | Yes |
| **Picture fingerprints** | The same screenshot reposted with a different caption, size, compression or letterbox | Background | Yes |
| **Community** | Videos and pictures that enough *different* people reported; names and channels that keep showing up in reports | Your community server | When you set a server |
| **On-device vision** | Text written inside thumbnails ("LUCIA DIES??") and game footage behind random captions | Your computer only | Opt-in |

## Learning from the wiki

A pack can list `sources`: MediaWiki categories it reads every 12 hours. The GTA VI pack reads these categories on gta.fandom.com: *Characters in GTA VI*, *Missions in GTA VI*, *Locations in GTA VI* (and its subcategories), *Organizations in GTA VI* and *Businesses in GTA VI*.

- New pages become words in the matching category. Run against the live wiki on 18 Nov 2026, that was 296 words: 37 characters and 259 places and businesses.
- Multi-word character names also become "this is about GTA VI" signals, so "Zed Quillfeather is back" is recognised without anyone writing "GTA".
- "Unnamed …" pages, list pages, and names the pack already knows (including the protagonists) are skipped.
- Learned words show in Settings → Categories with a 📚 mark. Remove any of them like any other word; removals survive future refreshes.

The missions category doesn't exist on the wiki yet. It fills in by itself as editors document missions after launch.

## Reports and the community server

Right-click a post, video, thumbnail or page and choose **🚩 Report as a spoiler**, or use the popup's **Report page** button. What happens next:

1. It's hidden immediately, and so is every other place that video or post shows up. Item ids are read from links, embeds and thumbnail URLs (`youtube:…`, `tiktok:…`, `x:…`, `reddit:…`, `instagram:…`, Twitch clips, Bluesky, Threads, and more), using patterns in `rules/sites.json`.
2. Its pictures are fingerprinted (a 64-bit difference hash, with letterbox bars trimmed). Any later picture within 12 bits of it is hidden too, whatever its caption. In testing, a reposted screenshot (smaller, JPEG, letterboxed) landed 7–12 bits away; unrelated pictures landed 25–35 bits away.
3. If you follow a community server and *Share my reports* is on, the report is sent there. Sent: the item ids, the picture fingerprints, the visible title, the channel name, which pack it was about, and a random install id. Nothing is sent while you browse.

**👍 Not a spoiler** undoes a report and tells the server, which counts it as a vote the other way.

### Running a server

`server/server.js` has no dependencies:

```
node server/server.js                # listens on :8787, stores data/community.json
ITEM_THRESHOLD=10 node server/server.js
```

Put it behind HTTPS (any reverse proxy, or a host like Fly, Render or Railway), set `TRUST_PROXY=1` there, and give people the link. They paste it under Settings → Community.

How the server stays fair:

- **Different people, really.** An item is listed only when enough *different install ids from different networks* reported it (`ITEM_THRESHOLD`, default 5). One person with ten browsers on one connection counts once.
- **Votes both ways.** An item stays listed only while reports outnumber "not a spoiler" votes two to one.
- **Rate limits.** Each network can send `RATE_PER_HOUR` reports per hour (default 60).
- **Moderation.** Set `ADMIN_TOKEN` and you can `POST /v1/admin/remove` with `{ "keys": [...], "hashes": [...], "terms": [...] }`.
- **Privacy.** Install ids and IP addresses are stored only as salted hashes. Reports expire after `MAX_AGE_DAYS` (default 45).

**What it learns.** Phrases of one to three words that keep appearing in reported titles across different items and reporters (`TERM_THRESHOLD`, default 8) become a *Community-reported* category in that pack. Channels that keep getting reported (`AUTHOR_THRESHOLD`) start counting as "about GTA VI". Common words are never learned, and a longer phrase wins over its parts ("night train", not "night").

Endpoints: `GET /v1/feed`, `POST /v1/report`, `POST /v1/safe`, `GET /health`.

## On-device vision

This is opt-in (Settings → Smart detection). On GTA VI pages and on video feeds (YouTube, TikTok, X, Reddit, Instagram, Twitch and others, set by `visionFeed` in the site rules), thumbnails without a decision yet are shown to the browser's **built-in** model (Chrome's `LanguageModel` API, Gemini Nano). It's asked to copy the words written in the picture and say whether it's game footage. The answer goes through the same matcher as any caption, so the pack decides what's a spoiler.

- Pictures never leave the computer.
- Answers are cached, checks run one at a time, and each page gets at most 60 checks.
- If the browser has no model but has `TextDetector`, that's used to read text only.
- If neither exists, the setting says so and every other layer still works.

The model is a one-time download, which the settings page starts only when you click **Download the model**.

## Honest limits

- A spoiler that is only visual, never reported, and whose post doesn't mention the game anywhere can still get through, unless on-device vision is on and recognises it.
- Text inside video frames while a video plays isn't read. Spoiler video pages are covered by the full-page shield when their title, context or a report gives them away.
- Fingerprints catch reposts of the same picture, not a different screenshot of the same scene.
- Learning and the community make the shield better over time. In the first hours after launch, reports are what will matter most.
