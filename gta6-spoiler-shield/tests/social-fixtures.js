/*
 * Minimal copies of how each network structures its pages, served under the real hostname.
 * Convention: an element with id "s-..." is a spoiler and must end up under a shield;
 * an element with id "ok-..." must stay visible. "page" lists expected full-page shields.
 */
const page = (title, body, head = '') =>
  `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>${head}
  <style>body{font-family:system-ui;margin:0;padding:20px;background:#fafafa;color:#111}
  .card,article,li,[data-testid],[data-e2e],.status{display:block;margin:8px 0;padding:10px;background:#fff;border:1px solid #ddd;border-radius:8px}</style>
  </head><body>${body}</body></html>`;

module.exports = [
  {
    name: 'YouTube home + search suggestions',
    url: 'https://www.youtube.com/',
    html: page('YouTube', `
      <ytd-rich-grid-renderer><div id="contents">
        <ytd-rich-item-renderer><div id="content"><a id="thumbnail" href="/watch?v=1"><img alt=""></a>
          <h3><a id="video-title-link" title="GTA 6 ENDING EXPLAINED (spoilers!!)"><yt-formatted-string id="s-yt1">GTA 6 ENDING EXPLAINED (spoilers!!)</yt-formatted-string></a></h3>
          <span>GameLore · 1.2M views</span></div></ytd-rich-item-renderer>
        <ytd-rich-item-renderer><div id="content"><h3><yt-formatted-string id="ok-yt1">GTA 6 honest first impressions (no spoilers)</yt-formatted-string></h3></div></ytd-rich-item-renderer>
        <ytd-rich-item-renderer><div id="content"><h3><yt-formatted-string id="s-yt2">𝗚𝗧𝗔 𝟲 full map tour in 4K</yt-formatted-string></h3></div></ytd-rich-item-renderer>
        <ytd-rich-item-renderer><div id="content"><h3><yt-formatted-string id="ok-yt2">Lofi beats to study to</yt-formatted-string></h3></div></ytd-rich-item-renderer>
      </div></ytd-rich-grid-renderer>
      <div class="ytSearchboxComponentSuggestionsContainer"><ul>
        <li class="ytSearchboxComponentSuggestion" id="s-yt3">gta 6 ending</li>
        <li class="ytSearchboxComponentSuggestion" id="ok-yt3">gta 6 release time</li>
      </ul></div>`)
  },
  {
    name: 'YouTube watch page comments (page context)',
    url: 'https://www.youtube.com/watch?v=abc',
    html: page('GTA 6 first impressions (no spoilers) - YouTube', `
      <ytd-watch-metadata><h1 id="ok-ytw1">GTA 6 first impressions (no spoilers)</h1></ytd-watch-metadata>
      <ytd-comment-thread-renderer><div id="content-text" id2="c1"><span id="s-ytw1">the ending had me in tears ngl</span></div></ytd-comment-thread-renderer>
      <ytd-comment-thread-renderer><div><span id="ok-ytw2">great video, thanks for keeping it clean!</span></div></ytd-comment-thread-renderer>`)
  },
  {
    name: 'Reddit with web components (shadow DOM)',
    url: 'https://www.reddit.com/r/gaming/',
    html: page('r/gaming', `
      <script>
        customElements.define('shreddit-post', class extends HTMLElement { constructor() { super(); this.attachShadow({ mode: 'open' }).innerHTML = '<div><slot name="title"></slot><slot></slot><footer>Share · Save</footer></div>'; } });
        customElements.define('shreddit-comment', class extends HTMLElement { connectedCallback() { if (this.shadowRoot) return; const r = this.attachShadow({ mode: 'open' }); r.innerHTML = '<p id="' + this.dataset.mid + '">' + this.dataset.body + '</p><slot></slot>'; } });
      </script>
      <article><shreddit-post><a slot="title" id="s-rd1">GTA VI map is massive, every location compared to Los Santos</a></shreddit-post></article>
      <article><shreddit-post><a slot="title" id="ok-rd1">My cat knocked over my PS5 on launch night</a></shreddit-post></article>
      <shreddit-comment data-mid="s-rd2" data-body="Rockstar really made the GTA ending hurt"></shreddit-comment>
      <shreddit-comment data-mid="ok-rd2" data-body="what a time to be alive"></shreddit-comment>`)
  },
  {
    name: 'X timeline, hashtags and trends',
    url: 'https://x.com/home',
    html: page('Home / X', `
      <div data-testid="cellInnerDiv"><article data-testid="tweet"><div data-testid="tweetText" id="s-x1">#GTA6Spoilers the final heist 😭😭</div></article></div>
      <div data-testid="cellInnerDiv"><article data-testid="tweet"><div data-testid="tweetText" id="ok-x1">Rockstar just posted the unlock times 🚀 #GTA6</div></article></div>
      <div data-testid="cellInnerDiv"><article data-testid="tweet"><div data-testid="tweetText" id="s-x2">G​TA 6 map leak is real, look at this</div></article></div>
      <div data-testid="cellInnerDiv"><article data-testid="tweet"><div data-testid="tweetText" id="s-x3">Lucia's death... I can't</div></article></div>
      <div data-testid="cellInnerDiv"><article data-testid="tweet"><div data-testid="tweetText" id="ok-x2">Vice City Stories still holds up honestly, that ending</div></article></div>
      <div data-testid="trend"><span>Trending in Gaming</span><span id="s-x4">#GTAVIEasterEggs</span></div>`)
  },
  {
    name: 'Instagram grid and comments',
    url: 'https://www.instagram.com/explore/',
    html: page('Instagram', `
      <div class="grid">
        <a href="/p/aaa/" id="s-ig1"><img alt="Photo by @gamer. #gta6 #leonida full map leak"></a>
        <a href="/p/bbb/" id="ok-ig1"><img alt="Photo by @travel. Sunset at the beach"></a>
      </div>
      <article><h2>@travelgram</h2><span>New screenshot day</span>
        <ul><li><span id="s-ig2">wait so Jason betrays Lucia?? 💀</span></li><li><span id="ok-ig2">beautiful pic</span></li></ul>
      </article>`)
  },
  {
    name: 'TikTok For You feed',
    url: 'https://www.tiktok.com/foryou',
    html: page('TikTok', `
      <div data-e2e="recommend-list-item-container"><div data-e2e="video-desc" id="s-tt1">POV: you just saw the gta 6 ending 💀 #gta6 #fyp</div></div>
      <div data-e2e="recommend-list-item-container"><div data-e2e="video-desc" id="ok-tt1">my cat vs the vacuum #fyp</div></div>
      <div data-e2e="recommend-list-item-container"><div data-e2e="video-desc" id="s-tt2">#gta6leaks every mission name 👀</div></div>`)
  },
  {
    name: 'Twitch live stream with GTA VI category',
    url: 'https://www.twitch.tv/somestreamer',
    page: true,
    html: page('somestreamer - Twitch', `
      <h1>somestreamer</h1><p>BLIND RUN day 1 !discord !merch</p>
      <a data-a-target="stream-game-link" href="/directory/category/grand-theft-auto-vi"><span>Grand Theft Auto VI</span></a>
      <div class="chat-line__message">lol the map is huge</div>`)
  },
  {
    name: 'Twitch directory',
    url: 'https://www.twitch.tv/directory/following',
    html: page('Following - Twitch', `
      <div data-a-target="card-1"><p id="s-tw1">BLIND first playthrough of GTA VI!! no spoilers in chat</p><p>Grand Theft Auto VI</p></div>
      <div data-a-target="card-2"><p id="ok-tw1">chill minecraft building</p><p>Minecraft</p></div>`)
  },
  {
    name: 'Facebook feed',
    url: 'https://www.facebook.com/',
    html: page('Facebook', `
      <div role="feed">
        <div aria-posinset="1"><div role="article"><span id="s-fb1">Who else thinks the GTA 6 story is peak? That twist in chapter 4!!</span></div></div>
        <div aria-posinset="2"><div role="article"><span id="ok-fb1">Happy birthday Mike! 🎂</span></div></div>
      </div>`)
  },
  {
    name: 'Threads',
    url: 'https://www.threads.com/',
    html: page('Threads', `
      <div data-pressable-container="true"><span id="s-th1">gta vi map leaked in full 👀</span></div>
      <div data-pressable-container="true"><span id="ok-th1">coffee first, then everything else</span></div>`)
  },
  {
    name: 'Bluesky',
    url: 'https://bsky.app/',
    html: page('Bluesky', `
      <div data-testid="feedItem-by-gamer"><div id="s-bs1">A thread of every GTA VI easter egg I found 🧵</div></div>
      <div data-testid="feedItem-by-cook"><div id="ok-bs1">sourdough attempt number 4</div></div>`)
  },
  {
    name: 'Mastodon (self-hosted, detected by page)',
    url: 'https://mastodon.social/home',
    html: page('Mastodon', `
      <div id="mastodon"><div class="columns">
        <div class="status"><div class="status__content" id="s-ma1">#GTAVI the twist in chapter 3, wow</div></div>
        <div class="status"><div class="status__content" id="ok-ma1">Federated timelines are cozy today</div></div>
      </div></div>`)
  },
  {
    name: 'Discord chat',
    url: 'https://discord.com/channels/1/2',
    html: page('Discord | #general', `
      <ol data-list-id="chat-messages">
        <li id="chat-messages-1-a"><div id="s-dc1">bro the gta 6 final mission was crazy</div></li>
        <li id="chat-messages-1-b"><div id="ok-dc1">anyone up for valorant later?</div></li>
      </ol>`)
  },
  {
    name: 'LinkedIn feed',
    url: 'https://www.linkedin.com/feed/',
    html: page('Feed | LinkedIn', `
      <div class="feed-shared-update-v2"><span id="s-li1">Thrilled to share I helped build the GTA VI map interiors for the last 4 years!</span></div>
      <div class="feed-shared-update-v2"><span id="ok-li1">We're hiring backend engineers.</span></div>`)
  },
  {
    name: 'Tumblr',
    url: 'https://www.tumblr.com/dashboard',
    html: page('Tumblr', `
      <article><p id="s-tu1">gta 6 jason x lucia ending fanart (spoilers!!)</p></article>
      <article><p id="ok-tu1">frog appreciation post</p></article>`)
  },
  {
    name: 'Pinterest',
    url: 'https://www.pinterest.com/',
    html: page('Pinterest', `
      <div data-test-id="pin"><img alt="GTA 6 full map poster printable" id="s-pi1"></div>
      <div data-test-id="pin"><img alt="cozy reading nook ideas" id="ok-pi1"></div>`)
  },
  {
    name: 'WhatsApp Web',
    url: 'https://web.whatsapp.com/',
    html: page('WhatsApp', `
      <div role="row"><div class="message-in"><span id="s-wa1">dont watch the gta 6 ending clips on tiktok lol</span></div></div>
      <div role="row"><div class="message-in"><span id="ok-wa1">dinner at 8?</span></div></div>`)
  },
  {
    name: 'Telegram Web',
    url: 'https://web.telegram.org/a/',
    html: page('Telegram', `
      <div class="Message"><div id="s-tg1">GTA6 leak dump: all missions list inside</div></div>
      <div class="Message"><div id="ok-tg1">see you tomorrow</div></div>`)
  },
  {
    name: 'Steam community',
    url: 'https://steamcommunity.com/app/1/',
    html: page('Steam Community', `
      <div class="apphub_Card"><div id="s-st1">Grand Theft Auto VI 100% walkthrough guide</div></div>
      <div class="apphub_Card"><div id="ok-st1">Screenshot of my farm in Stardew</div></div>`)
  },
  {
    name: 'Google search results + suggestions',
    url: 'https://www.google.com/search?q=gta+6',
    html: page('gta 6 - Google Search', `
      <div class="MjjYud"><h3 id="s-go1">GTA 6 ending explained - every twist and death</h3><span>ign.com</span></div>
      <div class="MjjYud"><h3 id="ok-go1">GTA 6 release date and price</h3><span>rockstargames.com</span></div>
      <ul role="listbox"><li role="presentation"><div role="option" id="s-go2">gta 6 secret ending</div></li></ul>`)
  }
];
