/*
 * Spoiler Shield for GTA VI: built-in categories, context terms and default settings.
 *
 * Term syntax (also accepted in every user-editable list):
 *   - plain words or phrases: "final mission"  (spaces/hyphens/dots are flexible, so "gta 6" also hits "GTA-6" and "gta6")
 *   - trailing wildcard:      "betray*"        (betray, betrayed, betrayal...)
 *   - raw regular expression: "/rumou?rs?/"
 */
(function (root) {
  'use strict';

  // Context decides whether a piece of text is about GTA VI at all.
  // Each distinct hit adds its weight; text "is about GTA VI" once the score reaches the
  // threshold for the current sensitivity (see CONTEXT_THRESHOLD).
  const CONTEXT = {
    strong: [
      'gta 6', 'gta vi', 'gta six', 'gta 6 online', 'gta vi online',
      'grand theft auto 6', 'grand theft auto vi', 'grand theft auto six',
      'lucia caminos', 'jason duval', 'jason and lucia', 'lucia and jason',
      'leonida', 'leonida keys', 'port gellhorn', 'grassrivers', 'mount kalaga',
      'gta6leaks', 'r/gta6'
    ],
    weak: [
      'gta', 'grand theft auto', 'rockstar games', 'rockstar', 'vice city',
      'take-two', 'take two interactive', 'rockstar north'
    ],
    names: ['lucia', 'jason']
  };

  const CONTEXT_WEIGHT = { strong: 2, weak: 1, names: 0.5 };
  const CONTEXT_THRESHOLD = { relaxed: 1.5, balanced: 1.5, strict: 1 };

  // Pages whose URL alone means "everything here is GTA VI".
  const CONTEXT_URL_PATTERNS = [
    /reddit\.com\/r\/(gta6|gtavi|gta6_|gta6leaks|gtaonline6|vicecity)\b/i,
    /gtaforums\.com/i,
    /gta\.fandom\.com\/wiki\/.*(vi|6|leonida|vice_city)/i,
    /rockstargames\.com\/vi\b/i,
    /rockstargames\.com\/gta-?vi/i,
    /\/(gta-?6|gta-?vi|grand-theft-auto-(6|vi))(\/|$|-|\?)/i
  ];

  // Search result pages never get a full-page shield (results are shielded one by one).
  const SEARCH_PAGE_PATTERNS = [
    /^https?:\/\/(www\.)?google\.[a-z.]+\/search/i,
    /^https?:\/\/(www\.)?bing\.com\/search/i,
    /^https?:\/\/(html\.)?duckduckgo\.com\//i,
    /^https?:\/\/search\.yahoo\.com\//i,
    /^https?:\/\/(www\.)?youtube\.com\/results/i,
    /^https?:\/\/(www\.)?youtube\.com\/?(\?|$)/i,
    /^https?:\/\/(www\.)?reddit\.com\/search/i,
    /^https?:\/\/(x|twitter)\.com\/search/i
  ];

  /*
   * Built-in categories.
   *   terms:  anything that makes GTA VI text belong to the category (Balanced + Strict)
   *   strong: the clearly spoilery subset; Relaxed mode only blocks on these
   *   solo:   phrases specific enough to block even when the text never names the game
   */
  const CATEGORIES = [
    {
      id: 'story', short: 'Story', emoji: '📖', label: 'Story & plot', defaultOn: true,
      description: 'Plot points, twists, deaths, betrayals and endings.',
      terms: [
        'story', 'plot', 'storyline', 'story mode', 'campaign', 'ending', 'endings', 'ending explained',
        'true ending', 'secret ending', 'good ending', 'bad ending', 'final mission', 'last mission',
        'finale', 'epilogue', 'prologue', 'twist', 'plot twist', 'betray*', 'dies', 'died', 'death',
        'killed', 'kills', 'murder*', 'cutscene*', 'narrative', 'chapter*', 'act 1', 'act 2', 'act 3',
        'who dies', 'spoiler*', 'post-credits', 'post credits', 'credits scene', 'villain*',
        'antagonist*', 'fate', 'backstory', 'flashback*', 'breakup', 'break up', 'what happens',
        'lore', 'canon', 'heartbreaking', 'tragic', 'cliffhanger', 'sequel bait',
        'arrested', 'prison break', 'double cross*', 'snitch*'
      ],
      strong: [
        'ending*', 'ending explained', 'true ending', 'secret ending', 'final mission', 'last mission',
        'finale', 'epilogue', 'twist', 'plot twist', 'betray*', 'dies', 'died', 'death', 'killed',
        'who dies', 'spoiler*', 'post-credits', 'post credits', 'credits scene', 'cliffhanger',
        'double cross*', 'heartbreaking', 'what happens'
      ],
      solo: [
        'lucia dies', 'jason dies', 'lucia death', 'jason death', 'lucia betray*', 'jason betray*',
        'lucia and jason ending', 'jason and lucia ending'
      ]
    },
    {
      id: 'characters', short: 'Characters', emoji: '🎭', label: 'Characters & cast', defaultOn: true,
      description: 'Side characters, cameos, returning faces and who voices whom.',
      terms: [
        'character*', 'cast', 'voice actor*', 'voice actress', 'voice cast', 'voiced by', 'cameo*',
        'returning character*', 'comeback', 'new character*', 'side character*', 'npc*',
        'gang leader', 'actor', 'actress', 'mo-cap', 'motion capture',
        'who plays', 'cal hampton', 'boobie ike', "dre'quan priest", 'dre quan', 'drequan',
        'real dimez', 'raul bautista', 'brian heder', 'trevor philips', 'trevor', 'michael de santa',
        'franklin clinton', 'niko bellic', 'tommy vercetti', 'lamar davis', 'lester'
      ],
      strong: [
        'cameo*', 'returning character*', 'comeback', 'voice actor*', 'voice cast', 'voiced by',
        'trevor', 'michael de santa', 'franklin clinton', 'niko bellic', 'tommy vercetti', 'lamar davis', 'lester'
      ],
      solo: []
    },
    {
      id: 'missions', short: 'Missions', emoji: '🎯', label: 'Missions & heists', defaultOn: true,
      description: 'Mission names, heist setups, walkthroughs and completion guides.',
      terms: [
        'mission*', 'heist*', 'walkthrough*', 'guide', 'objective*', 'side quest*', 'side mission*',
        'stranger*', 'freaks', '100%', '100 percent', 'completion', 'speedrun*', 'how to beat',
        'boss fight', 'gold medal*', 'all missions', 'mission list', 'final heist', 'robbery', 'robberies'
      ],
      strong: ['final heist', 'mission list', 'all missions', 'walkthrough*', 'how to beat', 'boss fight', '100%'],
      solo: []
    },
    {
      id: 'map', short: 'Map', emoji: '🗺️', label: 'Map & locations', defaultOn: true,
      description: 'Map leaks and reveals, size comparisons, regions, interiors and landmarks.',
      terms: [
        'map', 'maps', 'full map', 'map size', 'map leak*', 'map reveal*', 'world map', 'mapping project',
        'location*', 'every location', 'all locations', 'new region*', 'island*', 'interior*', 'landmark*',
        'explore', 'exploration', 'tour', 'city tour', 'points of interest', 'neighborhood*', 'neighbourhood*',
        'district*', 'county', 'counties', 'swamp*', 'everglades', 'beach', 'downtown', 'map comparison',
        'map vs', 'bigger than', 'square miles', 'sq mi', 'km2', 'enterable', 'leonida keys',
        'grassrivers', 'port gellhorn', 'ambrosia', 'mount kalaga', 'kalaga', 'vice beach', 'little haiti'
      ],
      strong: [
        'full map', 'map leak*', 'map reveal*', 'map size', 'world map', 'every location', 'all locations',
        'mapping project', 'map comparison', 'square miles', 'interior*', 'enterable'
      ],
      solo: ['gta 6 map', 'gta vi map', 'leonida map', 'vice city map']
    },
    {
      id: 'footage', short: 'Footage', emoji: '📹', label: 'Gameplay footage', defaultOn: true,
      description: 'Playthroughs, streams, clips and "first hour" videos.',
      terms: [
        'playthrough*', "let's play", 'lets play', 'livestream*', 'live stream*', 'streaming', 'stream',
        'gameplay video', 'gameplay walkthrough', 'first hour', 'first 10 minutes', 'first 15 minutes',
        'first 30 minutes', 'first mission', 'opening mission', 'opening scene', 'intro', 'longplay',
        'no commentary', 'part 1', 'part 2', 'episode 1', 'ep 1', 'ep. 1', '4k 60fps', 'pc gameplay',
        'ps5 gameplay', 'ps5 pro', 'xbox gameplay', 'clip*', 'footage', 'reaction*', 'vod', 'full game',
        'blind playthrough', 'shorts'
      ],
      strong: [
        'playthrough*', "let's play", 'lets play', 'first hour', 'first 10 minutes', 'first 30 minutes',
        'no commentary', 'longplay', 'footage', 'full game', 'opening mission', 'first mission'
      ],
      solo: []
    },
    {
      id: 'leaks', short: 'Leaks', emoji: '🕵️', label: 'Leaks & rumors', defaultOn: true,
      description: 'Leaked builds, dataminers, insiders and early copies.',
      terms: [
        'leak*', 'datamin*', 'data min*', 'insider*', '/rumou?rs?/', '/rumou?red/', 'source code',
        'dev build', 'development build', 'debug', 'unreleased', 'early copy', 'early copies',
        'street date', 'broke street date', 'reportedly', 'allegedly', 'unconfirmed', 'scrapped',
        'cut content'
      ],
      strong: ['leak*', 'datamin*', 'early cop*', 'street date', 'dev build', 'development build', 'cut content'],
      solo: ['gta 6 leak*', 'gta vi leak*', 'gta6leaks']
    },
    {
      id: 'secrets', short: 'Secrets', emoji: '🥚', label: 'Easter eggs & secrets', defaultOn: true,
      description: 'Hidden stuff, collectibles, cheats, myths and mysteries.',
      terms: [
        'easter egg*', 'secret*', 'hidden', 'collectible*', 'cheat*', 'cheat code*', 'ufo*', 'alien*',
        'bigfoot', 'sasquatch', 'ghost*', 'myth*', 'mystery', 'mysteries', 'unlockable*', 'glitch*',
        'exploit*', 'money glitch', 'reference*', 'nod to', 'things you missed', 'details you missed',
        'you missed', 'insane details', 'tiny details'
      ],
      strong: [
        'easter egg*', 'secret*', 'collectible*', 'cheat*', 'unlockable*', 'things you missed',
        'details you missed', 'money glitch'
      ],
      solo: []
    },
    {
      id: 'gameplay', short: 'Gameplay', emoji: '🕹️', label: 'Gameplay & features', defaultOn: false,
      description: 'Mechanics, weapons, vehicles, skills, economy and systems.',
      terms: [
        'gameplay', 'mechanic*', 'feature*', 'weapon*', 'vehicle*', 'car', 'cars', 'skill*', 'abilit*',
        'wanted system', 'wanted level', 'police', 'cops', 'combat', 'driving', 'shooting',
        'customi*', 'upgrade*', 'phone', 'social media', 'economy', 'stealth', 'swimming', 'wildlife',
        'animals', 'alligator*', 'gator*', 'hands-on', 'hands on', 'preview*', 'physics', 'npc ai',
        'side activit*', 'activities', 'minigame*', 'mini-game*', 'property', 'properties', 'businesses'
      ],
      strong: ['mechanic*', 'hands-on', 'hands on', 'preview*', 'wanted system', 'side activit*', 'minigame*'],
      solo: []
    },
    {
      id: 'reviews', short: 'Reviews', emoji: '⭐', label: 'Reviews & scores', defaultOn: false,
      description: 'Review scores, verdicts, Metacritic and impressions.',
      terms: [
        'review*', 'score*', 'metacritic', 'opencritic', 'rated', 'rating*', 'verdict', 'impressions',
        '/\\b\\d{1,2}(\\.\\d)?\\s?\\/\\s?10\\b/', 'out of 10', 'masterpiece', 'disappointing', 'overrated',
        'underrated', 'worth it', 'goty', 'game of the year', 'perfect score', 'first reviews'
      ],
      strong: ['review*', 'metacritic', 'opencritic', 'verdict', 'perfect score', 'out of 10', 'first reviews'],
      solo: ['gta 6 review*', 'gta vi review*']
    },
    {
      id: 'trailers', short: 'Trailers', emoji: '🎬', label: 'Trailers & marketing', defaultOn: false,
      description: 'Official trailers, teasers, screenshots and reveals.',
      terms: [
        'trailer*', 'teaser*', 'screenshot*', 'artwork', 'key art', 'official video', 'reveal*',
        'announcement', 'premiere', 'breakdown', 'analysis', 'frame by frame', 'commercial'
      ],
      strong: ['trailer*', 'teaser*', 'frame by frame', 'breakdown'],
      solo: ['gta 6 trailer*', 'gta vi trailer*']
    },
    {
      id: 'online', short: 'Online', emoji: '🌐', label: 'Online & multiplayer', defaultOn: false,
      description: 'GTA Online for VI, multiplayer modes, roleplay and monetization.',
      terms: [
        'gta online', 'online 2', 'multiplayer', 'online mode', 'co-op', 'coop', 'roleplay', 'rp server*',
        'fivem', 'online launch', 'shark card*', 'battle pass', 'microtransaction*', 'servers'
      ],
      strong: ['gta online', 'multiplayer', 'online mode', 'shark card*', 'battle pass'],
      solo: []
    },
    {
      id: 'music', short: 'Music', emoji: '📻', label: 'Music & radio', defaultOn: false,
      description: 'Radio stations, tracklists, soundtrack and licensed songs.',
      terms: [
        'soundtrack', 'radio', 'radio station*', 'song*', 'music', 'tracklist', 'track list', 'playlist',
        'dj', 'artist*', 'licensed music', 'theme song'
      ],
      strong: ['tracklist', 'track list', 'soundtrack', 'radio station*'],
      solo: []
    }
  ];

  /*
   * Per-site knowledge.
   *   host / detect: which site (hostname regex, or a selector for self-hosted networks like Mastodon)
   *   selectors:     the "card" that gets shielded around matched text (post, tweet, video, comment, chat line)
   *   topic:         elements that say what the whole page is about (stream category, channel name, hashtag header)
   *   live:          if the topic is GTA VI, the page itself is live gameplay footage
   */
  const SITE_CONTAINERS = [
    {
      name: 'YouTube', host: /(^|\.)youtube\.com$/,
      selectors: [
        'ytd-rich-item-renderer', 'ytd-video-renderer', 'ytd-compact-video-renderer', 'ytd-grid-video-renderer',
        'ytd-reel-item-renderer', 'ytd-reel-video-renderer', 'ytd-playlist-renderer', 'ytd-radio-renderer',
        'ytd-compact-playlist-renderer', 'ytd-compact-radio-renderer', 'ytd-comment-thread-renderer', 'ytd-comment-view-model',
        'ytd-comment-renderer', 'ytd-post-renderer', 'ytd-backstage-post-thread-renderer', 'ytd-notification-renderer',
        'yt-lockup-view-model', 'ytm-shorts-lockup-view-model', 'ytm-shorts-lockup-view-model-v2', 'ytd-watch-metadata',
        'ytd-playlist-panel-video-renderer', 'ytd-channel-renderer', 'ytd-universal-watch-card-renderer',
        'yt-live-chat-text-message-renderer', 'yt-live-chat-paid-message-renderer', 'yt-live-chat-membership-item-renderer',
        '.ytp-videowall-still', '.ytp-ce-element', '.ytp-autonav-endscreen-upnext-container', '.ytp-tooltip',
        'ytm-video-with-context-renderer', 'ytm-compact-video-renderer', 'ytm-comment-renderer', 'ytm-reel-item-renderer',
        'ytm-rich-item-renderer', '.ytSearchboxComponentSuggestion', '.sbsb_c'
      ],
      topic: ['ytd-rich-metadata-renderer #title', 'ytd-watch-metadata h1', 'yt-shorts-video-title-view-model', 'ytd-reel-video-renderer[is-active] h2']
    },
    {
      name: 'Reddit', host: /(^|\.)reddit\.com$/,
      selectors: [
        'shreddit-post', 'shreddit-comment', 'article', 'div[data-testid="post-container"]', '.thing', '.comment',
        '[data-testid="search-post"]', 'search-telemetry-tracker', 'reddit-pdp-right-rail-post', 'faceplate-tracker[noun="trending_search"]',
        'shreddit-gallery-carousel', 'li[role="presentation"]'
      ],
      topic: ['shreddit-subreddit-header', '.redditname']
    },
    {
      name: 'X', host: /(^|\.)(x|twitter)\.com$/,
      selectors: [
        'article[data-testid="tweet"]', '[data-testid="trend"]', '[data-testid="UserCell"]', '[data-testid="typeaheadResult"]',
        '[data-testid="notification"]', '[data-testid="card.wrapper"]', '[data-testid="cellInnerDiv"]'
      ],
      topic: ['[data-testid="primaryColumn"] h2[role="heading"]']
    },
    {
      name: 'Facebook', host: /(^|\.)facebook\.com$/,
      selectors: ['div[role="article"]', 'div[aria-posinset]', 'div[data-pagelet^="FeedUnit"]', 'div[data-video-id]', 'li[role="option"]']
    },
    {
      name: 'Instagram', host: /(^|\.)instagram\.com$/,
      selectors: ['article', 'a[href*="/p/"]', 'a[href*="/reel/"]', 'ul li', 'div[role="dialog"] ul > div'],
      topic: ['header h1', 'header h2']
    },
    {
      name: 'TikTok', host: /(^|\.)tiktok\.com$/,
      selectors: [
        'article', 'div[data-e2e="recommend-list-item-container"]', 'div[data-e2e="search_top-item"]', 'div[data-e2e="search_video-item"]',
        'div[data-e2e="search-card-desc"]', 'div[data-e2e="user-post-item"]', 'div[data-e2e="challenge-item"]',
        '[data-e2e="comment-level-1"]', '[data-e2e="comment-level-2"]', 'div[class*="DivCommentItemContainer"]', 'div[class*="DivItemContainer"]',
        '[data-e2e="chat-message"]', 'li[id^="sug-"]'
      ],
      topic: ['h1[data-e2e="challenge-title"]', 'h1[data-e2e="browse-video-desc"]', '[data-e2e="live-game-tag"]'],
      live: false
    },
    {
      name: 'Twitch', host: /(^|\.)twitch\.tv$/,
      selectors: [
        'article', 'div[data-a-target^="card-"]', '.chat-line__message', '[data-a-target="chat-line-message"]', '.vod-message',
        'div[data-target="directory-first-item"]', '[data-test-selector="search-result-live-channel__name"]', '.tw-tower > div',
        '[data-a-target="side-nav-card"]', '.side-nav-card'
      ],
      topic: ['a[data-a-target="stream-game-link"]', '[data-a-target="video-info-game-boxart-link"]', 'a[data-a-target="stream-game-link"] span'],
      live: true
    },
    {
      name: 'Kick', host: /(^|\.)kick\.com$/,
      selectors: ['[data-chat-entry]', '.chat-entry', '#chatroom-messages > div > div', 'div[class*="card"]', 'a[href*="/videos/"]'],
      topic: ['[data-testid="livestream-category"]', '#channel-content a[href*="/category/"]', 'a[href*="/category/"][class*="category"]'],
      live: true
    },
    {
      name: 'Threads', host: /(^|\.)threads\.(net|com)$/,
      selectors: ['div[data-pressable-container]', 'div[data-interactive-id]']
    },
    {
      name: 'Bluesky', host: /(^|\.)bsky\.app$/,
      selectors: ['div[data-testid^="feedItem"]', 'div[data-testid^="postThreadItem"]', 'div[data-testid="contentHider-post"]', 'div[data-testid^="feedGenerator"]']
    },
    {
      name: 'Mastodon', detect: '#mastodon, body.app-body, meta[property="og:site_name"][content*="Mastodon"]',
      selectors: ['article', '.status', '.detailed-status', '.notification', '.conversation', '.account-card']
    },
    {
      name: 'Discord', host: /(^|\.)discord\.com$/,
      selectors: ['li[id^="chat-messages"]', 'div[class*="messageListItem"]', 'div[class*="message_"]', 'div[class*="threadMessage"]', 'div[class*="forumPost"]', 'li[class*="card"]'],
      topic: ['section[aria-label*="hannel"] h1', 'h1[class*="title"]', 'div[class*="titleWrapper"] h1']
    },
    {
      name: 'Tumblr', host: /(^|\.)tumblr\.com$/,
      selectors: ['article', 'div[data-id]', 'div[data-cell-id]', 'div[data-testid="reply"]']
    },
    {
      name: 'LinkedIn', host: /(^|\.)linkedin\.com$/,
      selectors: ['.feed-shared-update-v2', '.comments-comment-item', '.comments-comment-entity', 'article', '.update-components-article', '.news-module__storyline', 'li.feed-follows-module-recommendation']
    },
    {
      name: 'Pinterest', host: /(^|\.)pinterest\.[a-z.]+$/,
      selectors: ['[data-test-id="pin"]', '[data-test-id="pinWrapper"]', '[data-grid-item="true"]', '[data-test-id="comment"]', '[data-test-id="search-suggestion"]']
    },
    {
      name: 'Snapchat', host: /(^|\.)snapchat\.com$/,
      selectors: ['div[class*="Spotlight"]', 'a[href*="/spotlight/"]', 'div[class*="StoryCard"]']
    },
    {
      name: 'Telegram', host: /^web\.telegram\.org$/,
      selectors: ['.message', '.bubble', '.Message', '.chatlist-chat', '.ListItem', '.reply-markup']
    },
    {
      name: 'WhatsApp', host: /^web\.whatsapp\.com$/,
      selectors: ['div[role="row"]', 'div.message-in', 'div.message-out', 'div[role="listitem"]', 'div[role="gridcell"]']
    },
    {
      name: 'Messenger', host: /(^|\.)messenger\.com$/,
      selectors: ['div[role="row"]', 'div[role="gridcell"]', 'a[role="link"][href*="/t/"]']
    },
    {
      name: 'Steam', host: /(^|\.)(steamcommunity\.com|steampowered\.com)$/,
      selectors: ['div.apphub_Card', '.commentthread_comment', '.forum_topic', '.review_box', '.partnereventwebrowembed', '.blotter_block', '.newsPostBlock']
    },
    {
      name: 'VK', host: /(^|\.)vk\.(com|ru)$/,
      selectors: ['.post', '._post', '.reply', '.im-mess', '.feed_row']
    },
    {
      name: '9GAG', host: /(^|\.)9gag\.com$/, selectors: ['article', '.comment-entry', '[class*="comment-item"]']
    },
    {
      name: 'Imgur', host: /(^|\.)imgur\.com$/, selectors: ['.Post-item', '.GalleryComment', '.Gallery-Content--title', '.post-image-container']
    },
    {
      name: 'Quora', host: /(^|\.)quora\.com$/, selectors: ['.dom_annotate_multifeed_bundle_AnswersBundle', 'div.q-box.qu-borderBottom', 'div.q-click-wrapper']
    },
    {
      name: 'Google', host: /(^|\.)google\.[a-z.]+$/,
      selectors: [
        'div.g', 'div.MjjYud', 'g-inner-card', 'div.related-question-pair', 'g-section-with-header', 'div.SoaBEf', 'article',
        'li[role="presentation"]', 'div[role="option"]', 'div[jscontroller][data-hveid] > div'
      ]
    },
    { name: 'Bing', host: /(^|\.)bing\.com$/, selectors: ['li.b_algo', 'div.b_ans', '.news-card', 'li.sa_sg'] },
    { name: 'DuckDuckGo', host: /(^|\.)duckduckgo\.com$/, selectors: ['article[data-testid="result"]', 'li[data-layout]', 'li[role="option"]'] },
    { name: 'Hacker News', host: /(^|\.)news\.ycombinator\.com$/, selectors: ['tr.athing', 'tr.athing + tr', 'td.default'] },
    { name: 'Fandom', host: /(^|\.)fandom\.com$/, selectors: ['section', '.portable-infobox', 'li', 'p', 'figure'] }
  ];

  const GENERIC_CONTAINERS = [
    'article', '[role="article"]', '[role="listitem"]', 'li', 'figure', 'blockquote', 'aside',
    '.card', '[class*="card"]', '[class*="Card"]', '[class*="post"]', '[class*="Post"]', '[class*="story"]',
    '[class*="tile"]', '[class*="teaser"]', '[class*="item"]', '[class*="comment"]', '[class*="Comment"]'
  ];

  function defaultCategoryState() {
    const out = {};
    for (const c of CATEGORIES) out[c.id] = { enabled: c.defaultOn, extra: [], removed: [] };
    return out;
  }

  const DEFAULT_SETTINGS = {
    schema: 1,
    enabled: true,
    sensitivity: 'balanced',      // relaxed | balanced | strict
    categories: defaultCategoryState(),
    customRules: [],              // [{ id, label, emoji, terms: [], requireContext, enabled }]
    keywords: [],                 // always shielded, no GTA context needed
    exceptions: [],               // text containing any of these is never shielded
    extraContext: [],             // extra words that count as "this is GTA VI" (strong weight)
    disabledSites: [],            // hostnames where the shield is off
    blockStyle: 'blur',           // blur | redact | collapse
    revealMode: 'click',          // click | hold | locked
    showReasons: true,
    pageShield: true,             // full-page cover for spoiler articles and videos
    pageContext: true,            // if the page itself is about GTA VI, judge every block on it as GTA VI
    hideThumbnails: true,         // blur images harder than text
    pauseVideos: true,            // pause media under a page shield
    pausedUntil: 0,               // timestamp; shield inactive until then
    activeUntil: ''               // 'YYYY-MM-DD'; shield switches itself off after this date
  };

  const api = {
    CONTEXT, CONTEXT_WEIGHT, CONTEXT_THRESHOLD, CONTEXT_URL_PATTERNS, SEARCH_PAGE_PATTERNS,
    CATEGORIES, SITE_CONTAINERS, GENERIC_CONTAINERS, DEFAULT_SETTINGS
  };

  root.GSS = Object.assign(root.GSS || {}, api);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
