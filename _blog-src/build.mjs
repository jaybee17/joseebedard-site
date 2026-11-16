// Builds /blog from the POSTS list below. Run: node _blog.mjs
// Output: blog/index.html, blog/<slug>/index.html, sitemap.xml, robots.txt
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://joseebedard.com";
const BEACON = `<!-- Cloudflare Web Analytics --><script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "94809ead9f3b4ffc98620b13b2fce628"}'></script><!-- End Cloudflare Web Analytics -->`;

import { POSTS as POSTS_A } from "./posts-1.mjs";
import { POSTS as POSTS_B } from "./posts-2.mjs";
import { execSync } from "child_process";

// A post goes live on its date (Toronto time). Later ones are not built yet.
const TODAY = process.env.BLOG_TODAY || new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
const ALL_POSTS = [...POSTS_A, ...POSTS_B];
const POSTS = ALL_POSTS.filter((p) => p.date <= TODAY);


const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const fmtDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });

const head = (title, desc, url, extra = "", ogimg = "") => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="${extra ? "article" : "website"}">
<meta property="og:url" content="${url}">
${ogimg ? `<meta property="og:image" content="${SITE}${ogimg}">
<meta name="twitter:card" content="summary_large_image">` : ""}
<link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/img/favicon-16.png">
<link rel="icon" type="image/png" sizes="192x192" href="/img/favicon-192.png">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Newsreader:ital,opsz,wght@1,18,400;1,18,500;0,18,500&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/site.css?v=30">
<style>
.blog{background:var(--cream);padding:70px 0 90px;min-height:60vh}
.blog__head{max-width:820px;margin:0 auto 40px;text-align:center;padding:0 24px}
.blog__head h1{font-size:clamp(36px,5.5vw,58px);font-weight:900;letter-spacing:-.02em;margin:14px 0 14px}
.blog__head h1 em{font-family:var(--serif);font-weight:500;font-style:italic;color:var(--gold)}
.blog__head p{font-family:var(--serif);font-style:italic;font-size:20px;color:var(--ink-soft)}
.blog__grid{max-width:1160px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
@media (max-width:860px){.blog__grid{grid-template-columns:1fr}}
.post__inner h2{font-size:clamp(24px,3.4vw,30px);font-weight:900;letter-spacing:-.01em;margin:38px 0 12px;line-height:1.2}
.post__inner p,.post__inner li{font-size:18px;line-height:1.7;color:var(--ink-soft)}
.post__inner p{margin-bottom:16px}
.post__inner ul,.post__inner ol{margin:0 0 18px 22px}
.post__inner li{margin-bottom:8px}
.post__inner a{color:var(--gold);font-weight:600}
.post__by{font-size:15px;color:var(--ink-soft);margin:-6px 0 28px}
.post__img{width:100%;height:auto;border-radius:14px;margin:0 0 30px;display:block}
.card__img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:10px;margin-bottom:16px;display:block}
.bp-signup{margin:40px 0 0;padding:28px 26px 22px;border-radius:14px;background:var(--ink);text-align:left;position:relative}
.bp-signup h3{font-size:22px;font-weight:800;color:var(--cream-card);margin-bottom:8px}
.bp-signup p{font-size:15.5px;line-height:1.5;color:rgba(244,238,223,.8);margin-bottom:16px}
.bp-signup__row{display:flex;gap:10px;flex-wrap:wrap}
.bp-signup__row input{flex:1 1 220px;min-width:0;padding:14px 16px;font:inherit;font-size:16px;border-radius:8px;border:1.5px solid rgba(244,238,223,.35);background:var(--cream-card);color:var(--ink)}
.bp-signup__row .btn{padding:14px 24px;font-size:16px;border:0;cursor:pointer}
.bp-signup__fine{margin:12px 0 0!important;font-size:13.5px!important;line-height:1.5!important;margin-bottom:0!important;color:rgba(244,238,223,.65)!important}
.bp-signup__msg{margin:12px 0 0!important;font-size:14.5px!important;min-height:1.2em;color:var(--gold-bright)!important}
.bp-signup__msg:empty{display:none}
.bp-signup__msg.is-error{color:#f2a99a!important}
.qs-consent{display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.5;color:rgba(244,238,223,.8);margin-top:12px;cursor:pointer;text-align:left}
.qs-consent input{margin-top:3px;width:18px;height:18px;flex:0 0 18px;accent-color:#B9903E}
.post__inner .bp-signup{margin:36px 0 10px}
.post__inner .bp-signup h3{margin:0 0 8px}
.post__inner .bp-signup p,.post__inner .guide__cta p{color:rgba(244,238,223,.85);font-size:16.5px;line-height:1.5}
.post__inner .guide__cta{margin:34px 0 10px}
.post__inner .guide__cta h3{margin-top:0}
.post__inner a.btn{color:var(--ink);font-weight:700}
.post__inner .bp-signup .qs-consent{color:rgba(244,238,223,.8);font-size:14px}
.post__inner h3{font-size:20px;font-weight:800;margin:26px 0 8px;line-height:1.3}
.prompt{background:var(--cream-card);border:1px solid var(--paper-line);border-left:4px solid var(--gold);border-radius:10px;padding:16px 20px;margin:0 0 20px;font-size:16.5px;line-height:1.65;color:var(--ink-soft)}
.post__crumbs{font-size:14px;margin-bottom:14px}
.post__crumbs a{text-decoration:none;font-weight:600}
</style>
${extra}
</head>
<body>

<nav class="nav">
  <div class="nav__inner">
    <a class="nav__logo" href="/index.html">Josée <em>Bédard</em></a>
    <div class="nav__links">
      <span class="nav__textlinks">
        <a href="/pivot-to-what/">Start Here</a>
        <a href="/guides/">Free Guides</a>
        <a href="/masterclass/">Free Masterclass</a>
        <a href="/tools/">Resources</a>
      </span>
      <a class="btn" href="https://www.skool.com/ai-digital-society-5263" target="_blank" rel="noopener">Show Me How · Free</a>
    </div>
      <button class="nav__burger" aria-label="Menu" onclick="this.closest('.nav').classList.toggle('is-open')">☰</button>
    </div>
  </div>
</nav>
`;

const footer = `
<footer class="footer">
  <div class="footer__links">© 2026 Josée Bédard · <a href="/blog/">Blog</a> · <a href="/guides/">All Guides</a> · <a href="/index.html">Home</a> · <a href="/legal/privacy.html">Privacy</a> · <a href="/legal/terms.html">Terms</a> · <a href="/legal/refunds.html">Refund Policy</a></div>
  <p class="footer__disclaimer">My story is my own, from years of full-time work. It is not typical and it is not a promise of your results. Everything on this site is education, not financial advice.</p>
</footer>
`;

const signup = (slug) => `
<form class="bp-signup qs-form" id="qs-form" novalidate style="margin:36px 0 10px">
  <h3>Want the free guide?</h3>
  <p>Enter your email and I will send you Your One-Person AI Business right away. Free, made for 40+.</p>
  <div class="bp-signup__row">
    <input type="email" id="qs-email" name="email" placeholder="Your email" autocomplete="email" required aria-label="Your email address">
    <button class="btn" type="submit" id="qs-btn">Send Me the Guide</button>
  </div>
  <input type="text" name="website" id="qs-website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;height:0;width:0;opacity:0;">
  <label class="qs-consent"><input type="checkbox" id="qs-consent"> Yes, send me the guide and occasional emails from Josée with new free guides and tips. I can unsubscribe any time.</label>
  <p class="bp-signup__msg" id="qs-msg" role="status" aria-live="polite"></p>
  <input type="hidden" id="qs-source" value="joseebedard.com/blog/${slug}">
</form>
<script>
  (function () {
    var form = document.getElementById("qs-form");
    if (!form) return;
    var msg = document.getElementById("qs-msg"), btn = document.getElementById("qs-btn");
    function say(t, bad) { msg.textContent = t; msg.style.color = bad ? "#e7a58f" : "#D6A843"; }
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var email = document.getElementById("qs-email").value.trim();
      var consent = document.getElementById("qs-consent").checked;
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(email)) { say("Please enter a valid email address.", true); return; }
      if (!consent) { say("Please tick the box so I know you want the guide and my emails.", true); return; }
      btn.disabled = true; btn.textContent = "Sending...";
      try {
        var res = await fetch("https://trobqziwskkxclablptx.supabase.co/functions/v1/guide-subscribe", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email, consent: true, website: document.getElementById("qs-website").value, source: document.getElementById("qs-source").value, guide: "one-person" })
        });
        var data = await res.json().catch(function () { return {}; });
        if (res.ok && data.ok) {
          form.querySelector(".bp-signup__row").style.display = "none";
          form.querySelector(".qs-consent").style.display = "none";
          say("Done! Check your inbox for Your One-Person AI Business. It can take a few minutes, and it may land in your spam folder.");
        } else { say(data.error || "Something went wrong. Please try again.", true); btn.disabled = false; btn.textContent = "Send Me the Guide"; }
      } catch (err) { say("Something went wrong. Please try again.", true); btn.disabled = false; btn.textContent = "Send Me the Guide"; }
    });
  })();
</script>
`;

fs.mkdirSync(path.join(ROOT, "blog"), { recursive: true });
for (const p of ALL_POSTS) if (p.date > TODAY) fs.rmSync(path.join(ROOT, "blog", p.slug), { recursive: true, force: true });

// Post pages
for (const p of POSTS) {
  const url = `${SITE}/blog/${p.slug}/`;
  const ld = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.desc,
    datePublished: p.date,
    dateModified: p.date,
    author: { "@type": "Person", name: "Josée Bédard", url: SITE + "/" },
    publisher: { "@type": "Person", name: "Josée Bédard" },
    mainEntityOfPage: url,
  })}</script>`;
  const others = POSTS.filter((x) => x.slug !== p.slug)
    .map((x) => `<li><a href="/blog/${x.slug}/">${esc(x.title)}</a></li>`)
    .join("");
  const html = `${head(p.title + " | Josée Bédard", p.desc, url, ld)}
<article class="guide post">
  <div class="guide__inner post__inner">
    <div class="post__crumbs"><a href="/blog/">Blog</a> / ${esc(p.crumb)}</div>
    <div class="guide__meta">${p.tag} · ${p.minutes} min read</div>
    <h1>${esc(p.title)}</h1>
    <p class="guide__lede">${p.lede}</p>
    <p class="post__by">By Josée Bédard · <time datetime="${p.date}">${fmtDate(p.date)}</time></p>
${p.body}
${signup(p.slug)}
    <h2>Keep going, free</h2>
    <ul>
      <li><a href="/pivot-to-what/"><b>Pivot to What?</b></a>: not sure what to start? Ten simple businesses you can start after 50, and how to pick yours.</li>
      <li><a href="/masterclass/"><b>The Free Masterclass</b></a>: how I built my business by replacing myself with AI helpers inside Claude. No coding needed.</li>
    </ul>
    <div class="guide__cta">
      <h3>Come build it with me</h3>
      <p>Inside my free community I walk these steps with you, and when you ask a question in there, it is me who answers. Not an assistant, not a bot. Me.</p>
      <a class="btn" href="https://www.skool.com/ai-digital-society-5263" target="_blank" rel="noopener">Join Free &amp; Start Building</a>
    </div>
    <h2>More from the blog</h2>
    <ul>${others}</ul>
  </div>
</article>
${footer}
${BEACON}
</body>
</html>
`;
  const dir = path.join(ROOT, "blog", p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

// Blog index
const cards = POSTS.map(
  (p) => `
    <a class="card" href="/blog/${p.slug}/">
      <div class="card__tags"><span class="tag tag--gold">${p.tag}</span><span class="tag">${p.minutes} MIN</span></div>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.desc)}</p>
      <div class="card__meta">Read it →</div>
    </a>`
).join("\n");
const indexHtml = `${head("Blog | Josée Bédard", "Plain-words posts on building a small online business with AI helpers, from Josée Bédard's real experience.", SITE + "/blog/")}
<section class="blog">
  <div class="blog__head">
    <div class="kicker">The Blog</div>
    <h1>Plain words. <em>Real experience.</em></h1>
    <p>How I build a small online business with AI helpers, written like I would tell you at the kitchen table.</p>
  </div>
  <div class="blog__grid">
${cards}
  </div>
</section>
${footer}
${BEACON}
</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, "blog", "index.html"), indexHtml);

// Sitemap + robots
const skip = new Set(["stats", "downloads", "img", "css", "node_modules", ".git"]);
const urls = [{ loc: SITE + "/", mod: TODAY }];
const walk = (dir, rel = "") => {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith("_") || ent.name.startsWith(".")) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (skip.has(ent.name) && rel === "") continue;
      walk(full, rel + ent.name + "/");
    } else if (ent.name.endsWith(".html")) {
      if (/thank-you|backup|welcome/.test(ent.name)) continue;
      if (rel === "" && ent.name === "index.html") continue;
      const loc = ent.name === "index.html" ? `${SITE}/${rel}` : `${SITE}/${rel}${ent.name}`;
      let mod;
      try { mod = execSync(`git log -1 --format=%cs -- "${path.join(rel, ent.name)}"`, { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { mod = ""; }
      if (!mod) mod = fs.statSync(full).mtime.toISOString().slice(0, 10);
      urls.push({ loc, mod });
    }
  }
};
walk(ROOT);
fs.writeFileSync(
  path.join(ROOT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.mod}</lastmod></url>`).join("\n") +
    `\n</urlset>\n`
);
fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /stats/\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log("live posts:", POSTS.length, "of", ALL_POSTS.length, "| today:", TODAY, "sitemap urls:", urls.length);
