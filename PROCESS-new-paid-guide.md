# Process: add a new paid guide to joseebedard.com

This is the exact pipeline used for The AI Employee System ($27), Your AI Business in 7 Days ($27), They Already Wrote It, and The Faceless Starter Kit. Follow it start to finish for any new paid PDF guide.

Folders involved:
- Website: `content ready/joseebedard-site/` (GitHub repo `jaybee17/joseebedard-site`, auto-deploys to joseebedard.com on push to main)
- Backend: `AI DIGITAL SOCIETY/postprofits/supabase/functions/` (Supabase project `trobqziwskkxclablptx`, shared with The Content System)
- Product source: its own folder under `content ready/` (e.g. `product-ai-employee-system/` with `guide.html` + a `_render_*.mjs` Playwright script that makes the PDF)

## Step 1 — Finish the PDF
Build the guide in its product folder (guide.html, render script, PDF out). When final, copy the PDF into the site:
`joseebedard-site/downloads/<Clean-File-Name>.pdf`
(no spaces, use hyphens — this exact path is what buyers download).

## Step 2 — Create the Stripe price (Josée does this, or a chat with Stripe access)
Stripe Dashboard → Products → Add product → name + one-time price (e.g. $27 USD) → copy the **price ID** (`price_...`).

## Step 3 — Register the product in BOTH Supabase functions
In `postprofits/supabase/functions/`:

1. `product-checkout/index.ts` → add an entry to the `PRODUCTS` map (copy an existing one):
   key = short camelCase id (e.g. `facelessKit`), with its `priceId` (from Step 2), `name`, and `successPath` pointing at `/tools/thank-you.html` with its product key.
2. `verify-product-payment/index.ts` → add the same key to the `DOWNLOADS` map:
   `{ file: "/downloads/<Clean-File-Name>.pdf", name: "<Display Name>" }`.

Deploy both functions:
`npx supabase functions deploy product-checkout verify-product-payment --project-ref trobqziwskkxclablptx`
Commit the postprofits changes.

## Step 4 — Build the sales page
Copy an existing sales page as the template: `joseebedard-site/tools/ai-employee-system.html` → `tools/<slug>.html`. Update:
- Title, meta description, headline, lede
- "What's inside" section (page count, what they get)
- FAQ answers
- Price shown in the buy box
- Cover image: add `tools/img-<slug>.png` and update the `<img>`
- In the `buy()` script: change `product: '<key>'` to the new key from Step 3 (everything else stays — same Supabase URL and publishable key)

## Step 5 — Add the card to the storefront
`tools/index.html` → copy an existing `.tool-card` in the "Digital Products & Guides" grid: badge (`$27 · INSTANT`), price line, title, 1–2 sentence blurb, `See What's Inside →`, link to `tools/<slug>.html`.

## Step 6 — Optional mentions elsewhere (follow the free/paid rule)
- NEVER describe a paid guide as free anywhere (home cards, guides library, masterclass, ribbons). The rule: free pages TEACH the system; the paid guide gives every file and template ready to copy.
- If a free overview page exists for it in `guides/`, its ribbon and bottom CTA must point to the SALES page with the price, not to Skool.

## Step 7 — Publish and verify
1. If `css/site.css` changed, bump `site.css?v=N` on every page that links it.
2. `git add -A && git commit && git push` in `joseebedard-site/` (live on joseebedard.com in ~1 minute).
3. Test the full flow: open the sales page → click buy → Stripe checkout opens → after paying, thank-you page shows the download button and says the link was emailed.

## Copy rules for everything written
- Her voice: short sentences, plain words, kitchen-table talk. No em-dashes. No income claims or dollar-results promises. No "playbook", no "barn", no "check your DM requests". Never mention price for They Already Wrote It in content.
- Footer on every new page: Privacy / Terms / Refund Policy links (all sales final — digital products).
- Nav on every new page must match the site standard exactly, including the mobile hamburger button.
