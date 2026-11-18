# Topic packs and site rules

Spoiler Shield's code knows nothing about any game or show. Everything topic-specific is data:

| File | What it holds | Where it can come from |
|---|---|---|
| **Topic pack** (`packs/*.json`) | Words that mean "this is about the topic", the spoiler categories and their words, example texts | Built in, a link (auto-updates), a file, or written in Settings → Topic packs |
| **Site rules** (`rules/sites.json`) | How each website wraps one post, video, comment or chat line; which elements name the page's topic; search-page patterns | Built in, a link (auto-updates), plus your own rules in Settings → Sites |
| **Your settings** | Which packs and categories are on, words you added or removed, custom rules, keywords, exceptions | Settings and popup; export/import under Backup |

Your edits are stored separately from the packs, so a pack can update without losing them.

## Keeping packs up to date without releasing the extension

1. Host the pack JSON at any `https://` address. A raw file on GitHub, a Gist or any static host works, for example `https://raw.githubusercontent.com/<you>/<repo>/main/packs/gta6.json`.
2. Put that address in the pack's `"updateUrl"`, or have people install the pack with **Install from link**.
3. Bump `"version"` and push whenever you add words (a mission name revealed after launch, a new character).

Every installed copy checks every 6 hours, and anyone can press **Check for updates** to get it immediately. Site rules work the same way, through **Sites → Site rules link**.

## Pack format

```json
{
  "format": "spoiler-shield-pack@1",
  "id": "starfall",
  "name": "Starfall Saga",
  "short": "Starfall",
  "version": "2026.11.20",
  "description": "Spoilers for Starfall Saga.",
  "updateUrl": "https://example.com/packs/starfall.json",

  "context": {
    "strong": ["starfall saga", "#starfall"],
    "weak":   ["starfall"],
    "names":  ["kira", "the duke"],
    "urls":   ["reddit\\.com/r/starfall"]
  },

  "categories": [
    {
      "id": "story",
      "label": "Story & plot",
      "short": "Story",
      "emoji": "📖",
      "description": "Twists, deaths and the finale.",
      "defaultOn": true,
      "liveStream": false,
      "terms":  ["finale", "twist", "dies", "betray*", "who dies"],
      "strong": ["finale", "dies"],
      "solo":   ["kira dies"]
    }
  ],

  "examples": ["Starfall Saga finale: who dies?"]
}
```

**Context decides whether text is about the topic at all.** Every distinct hit adds to a score: `strong` words count 2, `weak` words count 1, and `names` count 0.5. Text is "about" the topic at 1.5 (Relaxed and Balanced) or 1 (Blackout). So one strong word is enough, while weak words need company: "Rockstar" alone isn't GTA VI, but "Rockstar" plus "GTA" is. A pack can change those numbers with `"threshold": { "relaxed": 1.5, "balanced": 1.5, "strict": 1 }`.

`urls` are regular expressions. A page whose address matches is treated as entirely about the topic, so every comment on it is judged that way.

**Each category** is checked only when the text is about the topic:

- `terms`: any of these, plus topic context, means "shield it" in Balanced mode.
- `strong`: the clearly spoilery subset. Relaxed mode only uses these.
- `solo`: phrases specific enough to shield even when the topic is never named ("lucia dies").
- `liveStream: true`: this category covers live streams. A Twitch or Kick stream whose category matches the pack's context gets a full-page shield under it.
- `defaultOn`: whether the category starts switched on.

**Word syntax:**

- `final mission`: spaces, hyphens and dots are flexible, so `gta 6` also matches `GTA-6`, `gta6` and `#GTA6`.
- `betray*`: matches word endings (betray, betrayed, betrayal).
- `/rumou?rs?/`: a regular expression. Regexes from files and links are checked first. Ones that could freeze a page, like nested repeats `(a+)+` or backreferences, are skipped with a note.

Text is normalized before matching: case, accents, fancy Unicode fonts, zero-width characters, emoji digits, camelCase and glued hashtags (`#GTA6Spoilers`, or `#starfallfinale` when "starfall" is a strong word and "finale" is a category word), and possessives. Phrases like "no spoilers" and "spoiler-free" are ignored.

Limits: 40 categories, 800 words per list, 120 characters per word, 2 MB per file.

## Site rules format

```json
{
  "format": "spoiler-shield-sites@1",
  "version": "2026.11.18",
  "sites": [
    {
      "name": "Twitch",
      "hosts": ["twitch.tv"],
      "selectors": [".chat-line__message", "div[data-a-target^='card-']"],
      "topic": ["a[data-a-target='stream-game-link']"],
      "live": true
    },
    {
      "name": "Mastodon",
      "detect": "#mastodon",
      "selectors": [".status", "article"]
    }
  ],
  "generic": ["article", "li", "[class*='card']"],
  "searchPages": ["^https?://(www\\.)?google\\.[a-z.]+/search"]
}
```

- `hosts`: a host includes its subdomains, and `*` stands for any ending (`google.*` covers `google.co.uk`).
- `detect`: for self-hosted networks, a CSS selector that shows up on every page of that software.
- `selectors`: the element that wraps one post. The nearest match around a spoiler gets covered.
- `topic`: elements whose text says what the whole page is about (a stream category, a channel name, a hashtag header).
- `live: true`: if the topic belongs to a pack, the page is live footage of it.
- `generic`: fallback selectors used on sites without a rule.
- `searchPages`: pages that never get a full-page shield (their results are shielded one by one).

Your own rules (Settings → Sites → My site rules) use the same shape as the entries in `sites` and win over the shared file.
