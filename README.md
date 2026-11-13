# Bookings · WebLuxe website template

> **All content is an example.** WebLuxe Villa is a made-up business: the names, addresses, phone numbers, prices, photos (Unsplash), reviews and booked dates are samples to show the template. Replace them with the client's own before launch, and set `demo.enabled` to `false`.

A booking-focused website for tourism businesses, so they take direct bookings instead of paying 15–25% commission to Booking.com, Expedia or GetYourGuide. One template covers three kinds of business: guesthouses and villas, boat trips and tours, and car rental. Try all three on the demo with the "See this template for" switch.

**Live demo:** https://webluxe.github.io/HighTier_Bookings/ · **Admin demo:** https://webluxe.github.io/HighTier_Bookings/admin/?demo

Plain HTML, CSS and JavaScript. No build step, no framework, nothing to install. Upload the folder to any host (GitHub Pages, Netlify, Vercel, cPanel) and it works.

## Files

| File | What it is |
|---|---|
| `index.html` | Home: full-screen hero with the booking bar, why book direct, intro, listings, reviews, location, Instagram grid, FAQ. |
| `listings.html` | All rooms, trips or cars. |
| `listing.html` | One listing: photos, description, amenities, price table with seasons, policies and a live price estimate. |
| `book.html` | The booking request: dates, guests, extras, details, live total, then form or WhatsApp. |
| `gallery.html`, `reviews.html`, `contact.html` | Gallery, all reviews, and contact with hours and how to get here. |
| `examples/` | Sample setups for a tour company and a car rental company (used by the demo switch). |
| `config.js` | **Everything about the client.** The only file you edit for a new client. |
| `css/style.css` | All the styles. Colours and fonts come from `config.js`. |
| `js/main.js` | Builds the pages from `config.js`. Do not edit. |
| `assets/` | Logo, favicon and the client's own photos. |

## How to rebrand for a new client (about 30 minutes)

1. **Copy the whole folder** and rename it for the client.
2. Open **`config.js`** and work down it from the top. Each block has a comment explaining it.
   - **The business:** `name`, `legalName`, `tagline`, `logo` (put a logo file in `assets/` and write its path in `logo.image`, or leave it empty to use the letter mark).
   - **Brand:** `colors.primary`, `colors.accent`, `colors.dark`, `colors.light`. The text colour on buttons is chosen automatically so it stays readable. `fonts.heading` and `fonts.body` take any Google Fonts name.
   - **Contact:** `phone`, `whatsapp` (country code + number, digits only, e.g. `23057001234`), `whatsappMessage`, `email`, the address lines, `lat`/`lng`, and `mapEmbed` (Google Maps → Share → Embed a map → copy the link inside `src="…"`).
   - **Hours:** `"08:00-17:00"` per day, `""` when closed. Days with the same hours are grouped automatically, and the "Open now" badge uses `timeZone`.
   - **Social:** paste the links you have. Empty ones are hidden.
   - **SEO:** `seo.title`, `seo.description`, `seo.image` (the picture shown when the link is shared), `seo.schemaType` and `seo.siteUrl` (the final web address).
   - **Form:** create a free form at formspree.io and paste its link into `form.endpoint`. With no link, the form opens the visitor's email app instead.
   - **Type:** `type` is `"accommodation"` (rooms, per night, check-in/out), `"tour"` (trips, per person, one date, adults and children) or `"rental"` (cars, per day, pick-up/return). For a tour or rental client, copy the values from `examples/tour.js` or `examples/rental.js` into `config.js`.
   - **Listings** (`listings`): each has an `id`, `price` (rupees per night, per adult or per day), optional `seasons` with `from`/`to` as `"MM-DD"`, `capacity`, `minUnits`, photos, `features` (up to 4 icons on cards), `amenities` and its text.
   - **Extras** (`extras`): `per` is `"booking"`, `"unit"` (per night or day), `"person"` or `"personUnit"`.
   - **Money:** prices are in rupees. `currency.rates` sets the euro and dollar rates for the currency switch, so update them now and then. `booking.depositPct` shows the deposit line.
   - **Booking requests:** `booking.sendVia` is `"both"`, `"endpoint"` or `"whatsapp"`.
   - **Policies, why book direct, location (facts and how to get here), reviews (with TripAdvisor/Google links), Instagram, gallery, FAQ:** plain lists in `config.js`.
   - Delete `demo.examples` and the `examples/` folder for a real client.
   - **Wording:** every piece of text has an English and a French version: `{ en: "...", fr: "..." }`. For an English-only site, set `languages: ["en"]` and the FR button disappears.
3. **Turn off demo mode:** set `demo.enabled` to `false`. In demo mode WhatsApp, calls, emails and forms only show a pop-up, and Google is told not to index the site.
4. **Update the head of each `.html` file:** `<title>`, the description and the three `og:` lines. WhatsApp, Facebook and LinkedIn read these when someone shares a link. Also update the Google Fonts link if you changed fonts, and the hero photo preload line in `index.html`.
5. **Replace `assets/favicon.svg`** with the client's icon (any square SVG or PNG; update the `<link rel="icon">` path if it's a PNG).
6. **Check it:** open `index.html` on a phone at 360px wide, switch to French, try dark mode, send the form, and tap WhatsApp.

### Hiding things

- A whole section: add `enabled: false` to it in `config.sections`.
- One item: delete it from its list.
- One line of text: set it to `""`.

Empty sections and items are removed from the page cleanly. They never leave a gap.

### Photos

Unsplash links get sized automatically for each screen. For the client's own photos, put them in `assets/` (JPEG or WebP, about 2000px wide, under 400 KB each) and write the path, e.g. `"assets/photos/office.jpg"`. Write photos as `{ src: "...", alt: { en: "...", fr: "..." } }` so blind visitors and Google know what they show.

## Built in

- Phone first: designed at 360px, then tablet and desktop. 44px+ tap targets, with no sideways scrolling.
- Sticky header that slims as you scroll, animated mobile menu, scroll-in animations, and respect for "reduce motion" settings.
- English / French switch (remembered), and light / dark mode (remembered).
- Floating WhatsApp button with a pre-filled message, click-to-call and email links.
- Footer year updates itself.
- Google: title, description, Open Graph tags, and schema.org data built from `config.js`.
- No trackers and no cookies. Works over HTTPS.
- Live price estimate with seasonal rates, minimum stays, capacity checks and extras, and a currency switch (MUR / EUR / USD).
- Booking requests go to Formspree or as a WhatsApp message with the full summary, followed by a confirmation screen with a reference number.
- Photo carousels on cards, a full-screen gallery, parallax photo bands and a sticky "Book now" bar with the price on phones.
- schema.org data as LodgingBusiness, TouristTrip or AutoRental, depending on the type.

---
Template by [WebLuxe](https://webluxe.github.io/WebLuxe/), Mauritius. Sample photos from [Unsplash](https://unsplash.com). The businesses, people, prices and reviews in the demo are invented.

## The motion layer (js/fx.js)

Loads after the page is usable, only on devices that can carry it, and checks the frame rate the whole time (it turns the 3D hero off first, then the smooth scroll, if frames drop):

- **3D hero (three.js):** the hero video or photos drawn in WebGL: the water drifts, ripples follow the finger or mouse, photos melt into each other. The video is only re-sent to the graphics card when it shows a new frame, and drawing stops when the hero is off screen.
- **Scroll scenes (GSAP ScrollTrigger):** headlines rise word by word, room photos settle, "A day at" pins while the colour changes (phones and tablets: each moment lifts in over the last, nothing moves sideways; computers: the row slides sideways), the receipt counts the saving, postcards and polaroids arrive.
- **Computers only:** smooth scrolling (Lenis), a "View" cursor over photos, buttons that lean toward the cursor.
- Each part can be turned off under `effects` in `config.js`; `enabled: false` turns the whole layer off.

## The hero video

Set `hero.video` (wide, for computers) and `hero.videoTall` (upright, for phones held upright), plus their stills `hero.poster` and `hero.posterTall`. Leave `video` empty and the hero photos take turns instead. Keep videos short (10–15 s), muted, H.264, 1280x720 and 720x1280, under 4 MB: those play smoothly on every phone, including budget Androids. The demo videos are from Mixkit (see `assets/video/CREDITS.md`).

## New in this version

- **Availability calendars**: on each room's page and the booking page, with the price of every night, booked nights crossed out (`listings[].booked`) and the minimum stay enforced; a pop-up calendar in the hero search.
- **Admin panel** at `/admin/` (below): edit texts, photos, rooms, prices, extras and availability from a phone; inbox, payments and staff logins.
- **Payments**: a "Pay the deposit" button after a booking request (`payments.link`).
- **Google**: Google Business profile in the schema.org data, "Review us on Google", canonical and EN/FR links, `sitemap.xml`, `robots.txt`, a Search Console slot and a branded `404.html`.
- **Prices in any base currency** (`currency.base`, rupees if not set) and ratings out of 10 (`reviews.summary.best`).
- Phones: WhatsApp sits in the bottom booking bar instead of floating over the page.
- The demo business is now **WebLuxe Villa**.

## Google set-up (before launch)

1. **`seo.siteUrl`** in `config.js`: the final address, e.g. `https://www.edenvilla.mu/`. This turns on the canonical link and the English/French links Google reads on every page.
2. **`sitemap.xml` and `robots.txt`**: replace `https://www.your-domain.mu/` with the same address.
3. **Google Search Console**: add the site, paste the verification tag into the marked line in `index.html` (or verify by DNS), then submit `sitemap.xml`.
4. **`contact.googleBusiness`**: the client's Google Business / Maps link. "Get directions" uses it and the schema.org data tells Google the site and the listing are the same place. **`contact.googleReview`**: the profile's "write a review" link, which shows the "Review us on Google" buttons.
5. **`404.html`** is ready: a mistyped address shows a branded page with a way home instead of the host's error page.

## Admin panel (`/admin/`)

Open **`/admin/`** on the website. It edits everything in Mid, plus **payments** (a "Pay the deposit" button), **staff logins** (invite and remove people), the "A day here" story and the photo strip; and the **Inbox**, where confirming a booking blocks its dates in the calendar.

- **Preview** opens the real website with the changes that are not published yet (on that device only).
- **Publish** saves them to `data/site.js` in this repository; GitHub Pages shows them about a minute later. `config.js` stays the starting point: delete `data/site.js` to go back to it.
- **Try the admin without signing in** is a demo mode for prospects: nothing is saved online.

### Signing in

Each person signs in with a GitHub key for **WebLuxe/HighTier_Bookings (or the client's own copy)**. The key stays on their device.

1. On github.com: **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. **Repository access → Only select repositories →** this repository.
3. **Permissions → Repository → Contents: Read and write** (and **Administration: Read and write** for the owner, to manage staff). Set an expiry, generate, and paste the key into the sign-in.

Fine-grained keys only work on repositories owned by the person's own account (or an organisation they belong to). For a client who will manage the site themselves, **transfer the repository to their GitHub account** (Settings → Transfer) and update `admin.repo` in `config.js`. Someone added as a collaborator on another person's repository uses a **classic** token with only **public_repo** ticked.

### Inbox (booking requests and messages)

Every request from the website is also written to a Google Sheet that the owner owns: free, no server.

1. Create a Google Sheet, open **Extensions → Apps Script**, and paste [`admin/inbox.gs`](admin/inbox.gs).
2. Change `SECRET` to a long word only the owner knows (optionally put an email in `NOTIFY` to get an email per request).
3. **Deploy → New deployment → Web app**, execute as *Me*, access *Anyone*. Copy the web-app address.
4. In the admin **Inbox**: paste the address and Publish; type the SECRET as the inbox key (kept on that device).

Requests still go by email/Formspree or WhatsApp as before; the inbox keeps them all in one place with a status (new, replied, confirmed, declined).

### Payments

In the admin **Payments** (or `payments` in `config.js`): a payment link such as `https://paypal.me/yourname/{amount}{currency}`, a Stripe payment page or the bank's. After a booking request the guest sees **Pay … now** with the deposit (`booking.depositPct`, or the full total when 0). Nobody is charged automatically: the owner confirms the dates first.

### Staff logins

In the admin **Staff logins** the owner invites people by their GitHub username and removes them when they leave. Each person has their own key, so access can be taken away from one person without changing anyone else's.
