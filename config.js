/* ==========================================================================
   config.js: EVERYTHING ABOUT THE CLIENT LIVES IN THIS FILE.
   Change the values below and save. The pages, css/ and js/ never need editing.

   - type: "accommodation" (rooms, per night), "tour" (trips, per person)
     or "rental" (cars, per day). The wording and the price maths follow.
   - Text that changes with the language is written { en: "...", fr: "..." }.
   - Leave a value empty ("") or delete a list item to hide it. Set
     enabled: false on a section to remove it.
   - Prices are in rupees (MUR). Visitors can switch to EUR or USD using the
     rates in "currency" below; update them now and then.
   - Photos: img("unsplash-id", alt) for Unsplash, or "assets/photos/x.jpg".
   ========================================================================== */
function img(id, alt) { return { src: id.includes('/') ? id : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=70`, alt: alt || '' }; }

window.SITE = {

  /* ---------- 1. The business ---------- */
  type: "accommodation",
  name: "Villa Corail",
  legalName: "Villa Corail Boutique Guesthouse Ltd",
  tagline: { en: "A boutique guesthouse of six suites, two minutes from the lagoon at Trou aux Biches.", fr: "Une maison d'hôtes de charme de six suites, à deux minutes du lagon de Trou aux Biches." },
  logo: { image: "", mark: "V", text: "Villa Corail" },

  /* ---------- 2. Brand ---------- */
  colors: {
    primary: "#0F3D47",  // deep lagoon teal: buttons, the "book direct" strip
    accent:  "#B8442C",  // flamboyant red, like the trees in December: "Book now", highlights
    dark:    "#0A1F24",  // footer, photo overlays, dark mode
    light:   "#F3EADB",  // sand: the colour of the page
  },
  fonts: { heading: "Instrument Serif", headingWeights: "400", headingFallback: "Georgia, serif", body: "Hanken Grotesk", bodyWeights: "400;500;600;700", script: "Caveat", scriptWeights: "500;600" },  // script: the handwriting on postcards and signatures
  darkMode: true,
  languages: ["en", "fr"],
  defaultLanguage: "en",
  timeZone: "Indian/Mauritius",

  currency: {
    rates: { EUR: 0.0196, USD: 0.0217 },   // 1 rupee in euros and dollars. Remove a line to hide that currency
    default: "MUR",                        // what visitors see first: "MUR", "EUR" or "USD"
    secondary: "EUR",                      // shown small next to rupee prices ("≈ €94"). Empty to hide
  },

  /* ---------- the motion layer (js/fx.js) ----------
     Loads after the page is usable, only on devices that can carry it, and turns parts off by itself if frames drop. */
  effects: {
    enabled: true,
    webgl: true,         // the hero video or photos drawn in 3D: water drift, ripples under the finger, photos melting into each other
    seaLine: 0.45,       // how high the water reaches in the hero picture (0 = bottom edge, 1 = top edge)
    scrollScenes: true,  // headlines rise, room photos settle, "A day at" pins and slides sideways, postcards and polaroids arrive
    smoothScroll: true,  // gliding scroll on computers
    cursor: true,        // a custom cursor on computers ("View" over photos)
  },

  /* ---------- 3. Contact ---------- */
  contact: {
    phone: "+230 5123 4567",
    whatsapp: "23051234567",
    whatsappMessage: { en: "Hello Villa Corail, I would like to ask about a stay.", fr: "Bonjour Villa Corail, je voudrais des informations pour un séjour." },
    email: "stay@villacorail.mu",
    responseTime: { en: "We reply within 2 hours, 8 am to 9 pm Mauritius time.", fr: "Nous répondons sous 2 heures, de 8 h à 21 h heure de Maurice." },
    street: "Royal Road, Trou aux Biches",
    city: "Pamplemousses",
    region: "",
    postalCode: "",
    country: { en: "Mauritius", fr: "Maurice" },
    countryCode: "MU",
    lat: -20.0365, lng: 57.5466,
    mapEmbed: "https://www.google.com/maps?q=Trou+aux+Biches+Mauritius&z=14&output=embed",
    mapsLink: "",
  },
  hours: { mon: "08:00-21:00", tue: "08:00-21:00", wed: "08:00-21:00", thu: "08:00-21:00", fri: "08:00-21:00", sat: "08:00-21:00", sun: "08:00-21:00" },
  social: { instagram: "https://instagram.com", facebook: "https://facebook.com", tripadvisor: "https://tripadvisor.com", google: "", tiktok: "", youtube: "" },

  /* ---------- 4. Google and link previews ---------- */
  seo: {
    title: { en: "Villa Corail | Boutique guesthouse in Trou aux Biches, Mauritius", fr: "Villa Corail | Maison d'hôtes de charme à Trou aux Biches, Maurice" },
    description: { en: "Six suites and a private pool villa two minutes from the lagoon. Book direct for the best price, free cancellation and airport pick-up.", fr: "Six suites et une villa avec piscine à deux minutes du lagon. Réservez en direct : meilleur prix, annulation gratuite et transfert aéroport." },
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=70",
    favicon: "assets/favicon.svg",
    schemaType: "",   // empty = chosen from "type" (LodgingBusiness, TravelAgency or AutoRental)
    priceRange: "Rs 4,500 – Rs 18,500",
    siteUrl: "",
  },

  /* ---------- 5. Booking requests ---------- */
  form: { endpoint: "" },  // e.g. "https://formspree.io/f/abcdwxyz". Empty = the request opens the visitor's email app
  booking: {
    sendVia: "both",     // "both", "endpoint" or "whatsapp"
    depositPct: 30,      // shown as "30% deposit to confirm". 0 hides it
    defaultUnits: 4,     // nights pre-filled in the search bar
    refPrefix: "VC",     // booking reference, e.g. VC-8K2QF
    commissionPct: 18,   // what booking sites add. Used for the "you keep" receipt on the home page; 0 hides it
    times: [],           // tours only: departure times, e.g. ["08:30", "13:30"]
    childAge: "",        // tours only, e.g. { en: "ages 3–11", fr: "3 à 11 ans" }
  },

  /* ---------- 6. Rooms (or trips, or cars) ----------
     price: per night (accommodation), per adult (tour) or per day (rental), in rupees.
     seasons: other prices between two dates, written "MM-DD" (they may cross New Year).
     capacity: most people allowed. minUnits: shortest stay or rental.
     features: up to 4 show on cards (icons: bed, users, snow, wave, wifi, coffee, pool, eye, clock, car, gear, fuel, anchor, fish, sun, compass, key, home, bag) */
  listings: [
    {
      id: "garden-suite", name: { en: "Garden Suite", fr: "Suite Jardin" }, badge: "",
      short: { en: "A calm suite opening onto the tropical garden, with an outdoor rain shower.", fr: "Une suite calme ouverte sur le jardin tropical, avec douche extérieure." },
      price: 4800, capacity: 2, minUnits: 2,
      seasons: [{ name: { en: "Festive season", fr: "Fêtes de fin d'année" }, from: "12-18", to: "01-06", price: 6200 }, { name: { en: "Winter offer", fr: "Offre d'hiver" }, from: "06-01", to: "08-31", price: 4200 }],
      images: [img("1611892440504-42a792e24d32", "Garden Suite bedroom with a wooden bed"), img("1731336478850-6bce7235e320", "White bed with a wooden headboard"), img("1646974400439-8472d58bb19e", "Bathroom with a large bathtub")],
      features: [{ icon: "bed", label: { en: "King bed", fr: "Lit king size" } }, { icon: "users", label: { en: "2 guests", fr: "2 personnes" } }, { icon: "snow", label: { en: "Air-con", fr: "Climatisation" } }, { icon: "leaf", label: { en: "Garden view", fr: "Vue jardin" } }],
      description: [{ en: "Our quietest suite sits at the back of the garden under two mango trees. Wake up to birdsong, have breakfast on your private veranda and walk two minutes to the beach.", fr: "Notre suite la plus calme se trouve au fond du jardin sous deux manguiers. Réveil au chant des oiseaux, petit-déjeuner sur votre véranda privée et la plage à deux minutes à pied." }],
      amenities: [{ en: "28 m² with private veranda", fr: "28 m² avec véranda privée" }, { en: "Outdoor rain shower", fr: "Douche de pluie extérieure" }, { en: "Fast Wi-Fi", fr: "Wi-Fi rapide" }, { en: "Nespresso machine", fr: "Machine Nespresso" }, { en: "Daily housekeeping", fr: "Ménage quotidien" }, { en: "Beach towels and bags", fr: "Serviettes et sacs de plage" }],
    },
    {
      id: "lagoon-room", name: { en: "Lagoon View Room", fr: "Chambre Vue Lagon" }, badge: { en: "Most booked", fr: "La plus réservée" },
      short: { en: "Upstairs, with a balcony looking straight over the lagoon.", fr: "À l'étage, avec un balcon face au lagon." },
      price: 6200, capacity: 2, minUnits: 2,
      seasons: [{ name: { en: "Festive season", fr: "Fêtes de fin d'année" }, from: "12-18", to: "01-06", price: 7900 }, { name: { en: "Winter offer", fr: "Offre d'hiver" }, from: "06-01", to: "08-31", price: 5400 }],
      images: [img("1721369483526-62f48a00b949", "Bedroom with a view over the beach and ocean"), img("1774280954999-9758f11f3d41", "Bedroom with a large window onto greenery"), img("1776525433347-13ffc965601a", "Bright bathroom with a freestanding bathtub")],
      features: [{ icon: "bed", label: { en: "Queen bed", fr: "Lit queen size" } }, { icon: "users", label: { en: "2 guests", fr: "2 personnes" } }, { icon: "wave", label: { en: "Sea view", fr: "Vue mer" } }, { icon: "snow", label: { en: "Air-con", fr: "Climatisation" } }],
      description: [{ en: "Open the shutters and the lagoon is right there. This upstairs room catches the sea breeze all day and has the best sunset view in the house.", fr: "Ouvrez les volets : le lagon est là. Cette chambre à l'étage profite de la brise marine toute la journée et offre le plus beau coucher de soleil de la maison." }],
      amenities: [{ en: "24 m² with sea-view balcony", fr: "24 m² avec balcon vue mer" }, { en: "Freestanding bathtub", fr: "Baignoire îlot" }, { en: "Fast Wi-Fi", fr: "Wi-Fi rapide" }, { en: "Minibar", fr: "Minibar" }, { en: "Daily housekeeping", fr: "Ménage quotidien" }],
    },
    {
      id: "canopy-suite", name: { en: "Canopy Suite", fr: "Suite Canopée" }, badge: "",
      short: { en: "Our largest suite: a four-poster bed, a lounge and a terrace in the treetops.", fr: "Notre plus grande suite : lit à baldaquin, salon et terrasse dans les arbres." },
      price: 8500, capacity: 3, minUnits: 2,
      seasons: [{ name: { en: "Festive season", fr: "Fêtes de fin d'année" }, from: "12-18", to: "01-06", price: 10900 }],
      images: [img("1791535767615-2fb43a41e8a8", "Canopy bed suite overlooking green trees"), img("1646974400439-321c4a9240b9", "Suite lounge with a sofa and tall windows"), img("1664917555352-f3f66e57ccc2", "Warm-toned bathroom with a bathtub")],
      features: [{ icon: "bed", label: { en: "Four-poster bed", fr: "Lit à baldaquin" } }, { icon: "users", label: { en: "Up to 3", fr: "Jusqu'à 3" } }, { icon: "home", label: { en: "45 m²", fr: "45 m²" } }, { icon: "sun", label: { en: "Terrace", fr: "Terrasse" } }],
      description: [{ en: "Made for honeymoons and long stays: a separate lounge, a deep bathtub and a terrace among the palm tops where we can serve breakfast or a candlelit dinner.", fr: "Idéale pour les lunes de miel et les longs séjours : salon séparé, baignoire profonde et terrasse à hauteur des palmiers où nous servons petit-déjeuner ou dîner aux chandelles." }],
      amenities: [{ en: "45 m² with lounge and terrace", fr: "45 m² avec salon et terrasse" }, { en: "Sofa bed for a third guest", fr: "Canapé-lit pour une 3e personne" }, { en: "Deep bathtub and rain shower", fr: "Baignoire profonde et douche de pluie" }, { en: "Fast Wi-Fi", fr: "Wi-Fi rapide" }, { en: "Welcome bottle of rum", fr: "Bouteille de rhum de bienvenue" }],
    },
    {
      id: "pool-villa", name: { en: "Private Pool Villa", fr: "Villa Piscine Privée" }, badge: { en: "Family favourite", fr: "Coup de cœur des familles" },
      short: { en: "A two-bedroom villa with its own pool, kitchen and garden.", fr: "Une villa de deux chambres avec piscine, cuisine et jardin privés." },
      price: 14500, capacity: 4, minUnits: 3,
      seasons: [{ name: { en: "Festive season", fr: "Fêtes de fin d'année" }, from: "12-18", to: "01-06", price: 18500 }, { name: { en: "Winter offer", fr: "Offre d'hiver" }, from: "06-01", to: "08-31", price: 12500 }],
      images: [img("1596178067639-5c6e68aea6dc", "Beachfront villa with a private pool"), img("1675657144361-98ae33e6b6f9", "Private villa pool with a sun lounger"), img("1609602126247-4ab7188b4aa1", "Villa room opening onto the lagoon")],
      features: [{ icon: "bed", label: { en: "2 bedrooms", fr: "2 chambres" } }, { icon: "users", label: { en: "Up to 4", fr: "Jusqu'à 4" } }, { icon: "pool", label: { en: "Private pool", fr: "Piscine privée" } }, { icon: "coffee", label: { en: "Kitchen", fr: "Cuisine" } }],
      description: [{ en: "Your own house within the guesthouse: two bedrooms, a full kitchen and a 9-metre pool in a walled garden, with all the hotel services when you want them.", fr: "Votre maison au sein de la maison d'hôtes : deux chambres, une cuisine équipée et une piscine de 9 mètres dans un jardin clos, avec les services de l'hôtel quand vous le souhaitez." }],
      amenities: [{ en: "120 m², two en-suite bedrooms", fr: "120 m², deux chambres avec salle de bain" }, { en: "9 m private pool", fr: "Piscine privée de 9 m" }, { en: "Full kitchen", fr: "Cuisine équipée" }, { en: "Washing machine", fr: "Lave-linge" }, { en: "Private parking", fr: "Parking privé" }, { en: "Cot and high chair on request", fr: "Lit bébé et chaise haute sur demande" }],
    },
  ],

  /* Extras the guest can tick. per: "booking" (once), "unit" (each night/day), "person" (each guest), "personUnit" (each guest, each night/day). only: ["listing-id"] limits an extra to some listings */
  extras: [
    { id: "airport", icon: "car", price: 2500, per: "booking", label: { en: "Airport transfer", fr: "Transfert aéroport" }, text: { en: "Private car, both ways, 55 minutes", fr: "Voiture privée, aller-retour, 55 minutes" } },
    { id: "breakfast", icon: "coffee", price: 450, per: "personUnit", label: { en: "Breakfast every morning", fr: "Petit-déjeuner chaque matin" }, text: { en: "Tropical fruit, pastries and eggs your way", fr: "Fruits tropicaux, viennoiseries et œufs à votre goût" } },
    { id: "floating", icon: "pool", price: 1800, per: "booking", label: { en: "Floating breakfast", fr: "Petit-déjeuner flottant" }, text: { en: "Served in the pool, once during your stay", fr: "Servi dans la piscine, une fois pendant le séjour" } },
    { id: "dinner", icon: "heart", price: 4500, per: "booking", label: { en: "Dinner on the beach", fr: "Dîner sur la plage" }, text: { en: "Three courses for two at sunset", fr: "Trois plats pour deux au coucher du soleil" } },
    { id: "late", icon: "clock", price: 1200, per: "booking", label: { en: "Late check-out (4 pm)", fr: "Départ tardif (16 h)" }, text: "" },
  ],

  /* Policies shown on every listing page */
  policies: {
    checkIn: "14:00", checkOut: "11:00",
    items: [
      { icon: "clock", title: { en: "Check-in and check-out", fr: "Arrivée et départ" }, text: { en: "Check-in from 2 pm, check-out by 11 am. Early arrival? We keep your bags and you can use the pool.", fr: "Arrivée dès 14 h, départ avant 11 h. Arrivée matinale ? Nous gardons vos bagages et la piscine est à vous." } },
      { icon: "calendar", title: { en: "Free cancellation", fr: "Annulation gratuite" }, text: { en: "Free up to 14 days before arrival. After that, the deposit is kept.", fr: "Gratuite jusqu'à 14 jours avant l'arrivée. Ensuite, l'acompte est conservé." } },
      { icon: "lock", title: { en: "Deposit", fr: "Acompte" }, text: { en: "30% by card or bank transfer confirms your stay. The rest is paid on arrival.", fr: "30 % par carte ou virement confirment le séjour. Le solde est réglé à l'arrivée." } },
      { icon: "users", title: { en: "Children", fr: "Enfants" }, text: { en: "Welcome in the Canopy Suite and the Pool Villa. Cots are free.", fr: "Bienvenus dans la Suite Canopée et la Villa Piscine. Lit bébé gratuit." } },
    ],
  },

  /* ---------- 7. Pages, section by section ---------- */
  sections: {
    hero: {
      eyebrow: { en: "Trou aux Biches · Mauritius", fr: "Trou aux Biches · Maurice" },
      title: { en: "Slow mornings by the lagoon", fr: "Des matins paisibles au bord du lagon" },
      text: { en: "Six suites and a private pool villa, two minutes from one of the island's calmest beaches.", fr: "Six suites et une villa avec piscine, à deux minutes de l'une des plages les plus calmes de l'île." },
      video: "assets/video/lagoon.mp4",   // optional: a short muted loop, 1280x720 H.264 and under 4 MB plays on every phone. Empty = the photos below take turns
      poster: "assets/video/lagoon-poster.jpg",   // the still shown while the video loads
      videoTall: "assets/video/lagoon-tall.mp4",  // optional: an upright (720x1280) version for phones held upright, much sharper there
      posterTall: "assets/video/lagoon-tall-poster.jpg",
      images: [img("1582719508461-905c673771fd", "Infinity pool overlooking the sea"), img("1622779536320-bb5f5b501a06", "Palm-fringed beach beside a turquoise lagoon"), img("1607849973414-68ea06463344", "Aerial view of a sandbank in the lagoon")],
    },
    ticker: {   // the band of big words that slides with the scroll. Empty list hides it
      words: [{ en: "Trou aux Biches", fr: "Trou aux Biches" }, { en: "Six suites", fr: "Six suites" }, { en: "One pool villa", fr: "Une villa piscine" }, { en: "Breakfast by the lagoon", fr: "Petit-déjeuner au bord du lagon" }, { en: "Mauritius", fr: "Maurice" }],
    },
    day: {      // "A day at": hour by hour. tone = the background colour while that hour is on screen
      eyebrow: { en: "A day at Villa Corail", fr: "Une journée à Villa Corail" },
      title: { en: "From first swim to last light", fr: "De la première baignade à la dernière lueur" },
      items: [
        { time: "07:00", tone: "#F7E1C6", image: img("1622779536320-bb5f5b501a06", "The beach at sunrise"), title: { en: "A swim before anyone else", fr: "Une baignade avant tout le monde" }, text: { en: "The lagoon is flat and glassy. Towels are already on the gate.", fr: "Le lagon est lisse comme un miroir. Les serviettes sont déjà au portail." } },
        { time: "09:30", tone: "#FBEBD6", image: img("1756115374220-c43b04be3a53", "Floating breakfast in the pool"), title: { en: "Breakfast on the water", fr: "Petit-déjeuner sur l'eau" }, text: { en: "Mango, papaya, fresh bread from the village, coffee from the hills.", fr: "Mangue, papaye, pain frais du village, café des hauts." } },
        { time: "13:00", tone: "#CFE9EA", image: img("1609601470014-5754ed429f30", "A sandbank in the lagoon"), title: { en: "The sandbank at low tide", fr: "Le banc de sable à marée basse" }, text: { en: "Twenty minutes by boat. Bring a mask, leave the phone.", fr: "Vingt minutes en bateau. Prenez un masque, laissez le téléphone." } },
        { time: "17:45", tone: "#E9A274", image: img("1580629844914-374f3b707fe5", "Palms against a golden sunset"), title: { en: "Golden hour", fr: "L'heure dorée" }, text: { en: "Rum punch on the terrace while the sky turns pink.", fr: "Un punch au rhum sur la terrasse pendant que le ciel rosit." } },
        { time: "20:00", tone: "#142630", image: img("1759372945658-1e9f56e751bd", "The villa lit up at night"), title: { en: "Dinner under the stars", fr: "Dîner sous les étoiles" }, text: { en: "Grilled fish by the pool, and the sound of the reef.", fr: "Poisson grillé au bord de la piscine, et le bruit du récif." } },
      ],
    },
    whyDirect: {
      eyebrow: { en: "Book with us, not a website", fr: "Réservez chez nous, pas sur un site" },
      title: { en: "Same room. Less money. A real person.", fr: "La même chambre. Moins cher. Une vraie personne." },
      text: { en: "Booking sites charge us a commission and pass it on to you. Book here and it stays in your pocket.", fr: "Les sites de réservation nous prennent une commission et la répercutent sur vous. Réservez ici, elle reste dans votre poche." },
      items: [
        { icon: "tag", title: { en: "Best price, guaranteed", fr: "Meilleur prix garanti" }, text: { en: "Lower than any booking site.", fr: "Moins cher que tout site de réservation." } },
        { icon: "calendar", title: { en: "Free cancellation", fr: "Annulation gratuite" }, text: { en: "Up to 14 days before you arrive.", fr: "Jusqu'à 14 jours avant l'arrivée." } },
        { icon: "wa", title: { en: "Local support", fr: "Une équipe sur place" }, text: { en: "Talk to us on WhatsApp, day or night.", fr: "Écrivez-nous sur WhatsApp, jour et nuit." } },
        { icon: "check", title: { en: "No booking fees", fr: "Aucuns frais de réservation" }, text: { en: "What you see is what you pay.", fr: "Le prix affiché est le prix payé." } },
      ],
    },
    intro: {
      eyebrow: { en: "Welcome", fr: "Bienvenue" },
      title: { en: "A small house, run by the family", fr: "Une petite maison, tenue par la famille" },
      text: [
        { en: "Villa Corail was our grandparents' beach house. Today it has six suites and one villa, a pool under the palms and a breakfast terrace that smells of fresh mango and coffee.", fr: "Villa Corail était la maison de plage de nos grands-parents. Elle compte aujourd'hui six suites et une villa, une piscine sous les palmiers et une terrasse où le petit-déjeuner sent la mangue et le café." },
        { en: "We are small on purpose. We know every guest by name, and we will happily plan your days, from the best snorkelling spot to the right table for sunset.", fr: "Nous restons petits exprès. Nous connaissons chaque hôte par son prénom, et nous organisons volontiers vos journées, du meilleur spot de snorkeling à la bonne table pour le coucher du soleil." },
      ],
      signature: { en: "Anaïs & Kevin, your hosts", fr: "Anaïs & Kevin, vos hôtes" },
      images: [img("1793891546320-b031d3d7a040", "Doorway view of palms, pool and the ocean"), img("1756115374220-c43b04be3a53", "Floating breakfast tray in a private pool")],
    },
    featured: { eyebrow: { en: "Stay with us", fr: "Séjourner chez nous" }, title: { en: "Suites and villa", fr: "Suites et villa" }, count: 3 },
    parallax: { image: img("1580629844914-374f3b707fe5", "Palm trees against a golden sunset"), quote: { en: "“The kind of place you start missing before you have even left.”", fr: "« Le genre d'endroit qui vous manque avant même d'être parti. »" }, by: { en: "Claire, from Lyon", fr: "Claire, de Lyon" } },
    reviews: {
      eyebrow: { en: "Guest reviews", fr: "Avis des hôtes" },
      title: { en: "Loved by our guests", fr: "Nos hôtes en parlent" },
      summary: { rating: 4.9, count: 286 },
      links: [{ name: "TripAdvisor", icon: "tripadvisor", url: "https://tripadvisor.com" }, { name: "Google", icon: "google", url: "https://google.com/maps" }],
      items: [
        { name: "Claire M.", from: { en: "France", fr: "France" }, date: { en: "October 2026", fr: "octobre 2026" }, source: "Google", rating: 5, text: { en: "We booked direct after reading the reviews and paid less than on Booking. Anaïs sent us snorkelling tips on WhatsApp before we even landed.", fr: "Nous avons réservé en direct après avoir lu les avis et payé moins cher que sur Booking. Anaïs nous a envoyé des conseils de snorkeling sur WhatsApp avant même notre arrivée." } },
        { name: "James & Holly", from: { en: "United Kingdom", fr: "Royaume-Uni" }, date: { en: "August 2026", fr: "août 2026" }, source: "TripAdvisor", rating: 5, text: { en: "The Pool Villa was perfect with our two kids. The floating breakfast was the highlight of the trip for all of us.", fr: "La Villa Piscine était parfaite avec nos deux enfants. Le petit-déjeuner flottant a été le moment fort du voyage pour nous tous." } },
        { name: "Markus W.", from: { en: "Germany", fr: "Allemagne" }, date: { en: "July 2026", fr: "juillet 2026" }, source: "Google", rating: 5, text: { en: "Quiet, spotless and two minutes from a calm beach. Kevin drove us to the airport at 5 am with coffee for the road.", fr: "Calme, impeccable et à deux minutes d'une plage tranquille. Kevin nous a conduits à l'aéroport à 5 h avec un café pour la route." } },
        { name: "Priya S.", from: { en: "South Africa", fr: "Afrique du Sud" }, date: { en: "June 2026", fr: "juin 2026" }, source: "TripAdvisor", rating: 5, text: { en: "Our honeymoon in the Canopy Suite felt like a private treehouse. The dinner on the beach was unforgettable.", fr: "Notre lune de miel dans la Suite Canopée, c'était comme une cabane privée dans les arbres. Le dîner sur la plage était inoubliable." } },
        { name: "Élodie & Marc", from: { en: "Réunion", fr: "La Réunion" }, date: { en: "May 2026", fr: "mai 2026" }, source: "Google", rating: 5, text: { en: "Third stay and still the same warm welcome. The lagoon room at sunset is magic.", fr: "Troisième séjour et toujours le même accueil chaleureux. La chambre vue lagon au coucher du soleil, c'est magique." } },
        { name: "Daniel R.", from: { en: "Switzerland", fr: "Suisse" }, date: { en: "April 2026", fr: "avril 2026" }, source: "Google", rating: 4, text: { en: "Lovely small place with great breakfasts. Book a car if you want to explore the south.", fr: "Petit endroit charmant, excellents petits-déjeuners. Louez une voiture pour explorer le sud." } },
      ],
    },
    location: {
      eyebrow: { en: "Location", fr: "Emplacement" },
      title: { en: "On the quiet side of the north coast", fr: "Sur la côte nord, côté calme" },
      text: { en: "Trou aux Biches has one of the safest swimming lagoons in Mauritius, with Grand Baie's restaurants ten minutes away.", fr: "Trou aux Biches offre l'un des lagons les plus sûrs de Maurice pour la baignade, avec les restaurants de Grand Baie à dix minutes." },
      facts: [
        { icon: "plane", value: { en: "55 min", fr: "55 min" }, label: { en: "from SSR Airport", fr: "de l'aéroport SSR" } },
        { icon: "wave", value: { en: "2 min", fr: "2 min" }, label: { en: "walk to the beach", fr: "à pied de la plage" } },
        { icon: "bag", value: { en: "10 min", fr: "10 min" }, label: { en: "to Grand Baie", fr: "de Grand Baie" } },
        { icon: "car", value: { en: "Free", fr: "Gratuit" }, label: { en: "parking on site", fr: "parking sur place" } },
      ],
      howToGetHere: [
        { icon: "car", title: { en: "Airport transfer:", fr: "Transfert aéroport :" }, text: { en: "add it to your booking and our driver meets you at arrivals with a sign.", fr: "ajoutez-le à votre réservation : notre chauffeur vous attend aux arrivées avec une pancarte." } },
        { icon: "compass", title: { en: "By car:", fr: "En voiture :" }, text: { en: "take the M2 north, exit at Triolet, then follow Royal Road to Trou aux Biches (we are opposite the police station).", fr: "prenez la M2 vers le nord, sortie Triolet, puis Royal Road jusqu'à Trou aux Biches (face au poste de police)." } },
        { icon: "users", title: { en: "By bus:", fr: "En bus :" }, text: { en: "the Port Louis – Grand Baie bus stops 100 m from the gate.", fr: "le bus Port-Louis – Grand Baie s'arrête à 100 m du portail." } },
      ],
    },
    instagram: {
      eyebrow: { en: "Follow along", fr: "Suivez-nous" }, title: { en: "Life at the villa", fr: "La vie à la villa" },
      handle: "@villacorail.mu", url: "https://instagram.com",
      // caption: the handwritten line under each polaroid (optional)
      images: [
        { ...img("1687151621813-75a278d025cb", "Breakfast tray on the edge of the pool"), caption: { en: "breakfast, 8 am", fr: "petit-déj, 8 h" } },
        { ...img("1790276319385-67459b89a702", "Window view of a palm-lined beach"), caption: { en: "the view from no. 2", fr: "la vue de la n° 2" } },
        { ...img("1759372945658-1e9f56e751bd", "Tropical villa with a pool at twilight"), caption: { en: "the villa at dusk", fr: "la villa au crépuscule" } },
        { ...img("1609601470014-5754ed429f30", "White sandbank in clear water"), caption: { en: "sandbank, 20 min by boat", fr: "banc de sable, 20 min en bateau" } },
        { ...img("1581609836630-9007630f7a7b", "Palm tree on the shore at sunset"), caption: { en: "every evening, 6.15 pm", fr: "chaque soir, 18 h 15" } },
        { ...img("1776761420375-c50a5a3b2e0d", "Aerial view of a pool by the beach"), caption: { en: "from the drone, finally", fr: "vue du drone, enfin" } },
      ],
    },
    gallery: {
      images: [img("1582719508461-905c673771fd", "Infinity pool overlooking the sea"), img("1793891546320-b031d3d7a040", "Doorway view of palms, pool and the ocean"), img("1611892440504-42a792e24d32", "Garden Suite bedroom"), img("1756115374220-c43b04be3a53", "Floating breakfast in the pool"), img("1622779536320-bb5f5b501a06", "The beach at Trou aux Biches"), img("1791535767615-2fb43a41e8a8", "The Canopy Suite"), img("1759372945658-1e9f56e751bd", "The villa at twilight"), img("1596178067639-5c6e68aea6dc", "The Private Pool Villa"), img("1687151621813-75a278d025cb", "Breakfast by the pool"), img("1790276319385-67459b89a702", "View over the palm-lined beach"), img("1721369483526-62f48a00b949", "Lagoon View Room"), img("1580629844914-374f3b707fe5", "Sunset through the palms")],
    },
    faq: {
      eyebrow: { en: "Before you come", fr: "Avant de venir" }, title: { en: "Questions, answered", fr: "Vos questions" },
      items: [
        { q: { en: "Is breakfast included?", fr: "Le petit-déjeuner est-il inclus ?" }, a: { en: "You can add it when you book (Rs 450 per person per night) or decide on the day.", fr: "Vous pouvez l'ajouter à la réservation (Rs 450 par personne et par nuit) ou décider sur place." } },
        { q: { en: "How do I pay the deposit?", fr: "Comment payer l'acompte ?" }, a: { en: "We send a secure card payment link or our bank details by email within two hours of your request.", fr: "Nous envoyons un lien de paiement sécurisé ou nos coordonnées bancaires par e-mail dans les deux heures." } },
        { q: { en: "Is the beach safe for children?", fr: "La plage est-elle sûre pour les enfants ?" }, a: { en: "Yes. The lagoon at Trou aux Biches is shallow and calm, protected by the reef.", fr: "Oui. Le lagon de Trou aux Biches est peu profond et calme, protégé par le récif." } },
        { q: { en: "Do you arrange excursions?", fr: "Organisez-vous des excursions ?" }, a: { en: "Yes: catamaran days, dolphin swims, hikes and island tours with partners we trust.", fr: "Oui : journées en catamaran, nage avec les dauphins, randonnées et tours de l'île avec des partenaires de confiance." } },
        { q: { en: "What about cyclone season?", fr: "Et la saison des cyclones ?" }, a: { en: "From January to March. If a cyclone warning stops you travelling, you can move your dates for free.", fr: "De janvier à mars. Si une alerte cyclonique vous empêche de voyager, vous pouvez déplacer vos dates gratuitement." } },
      ],
    },
    finalCta: {
      title: { en: "Your lagoon is waiting", fr: "Votre lagon vous attend" },
      text: { en: "Book direct for our best price and free airport pick-up on stays of 7 nights or more.", fr: "Réservez en direct pour notre meilleur prix et le transfert aéroport offert dès 7 nuits." },
      image: img("1607849973414-68ea06463344", "Sandbank in a turquoise lagoon"),
    },
    pageHeads: {
      listings: { title: { en: "Suites & villa", fr: "Suites et villa" }, text: { en: "Six suites and one private pool villa, each with its own character.", fr: "Six suites et une villa avec piscine privée, chacune avec son caractère." }, image: img("1596178067639-5c6e68aea6dc", "") },
      gallery: { title: { en: "Gallery", fr: "Galerie" }, text: { en: "A look around the villa, the garden and the lagoon.", fr: "Un tour de la villa, du jardin et du lagon." }, image: img("1793891546320-b031d3d7a040", "") },
      reviews: { title: { en: "Guest reviews", fr: "Avis des hôtes" }, text: { en: "4.9 out of 5 from 286 stays.", fr: "4,9 sur 5 pour 286 séjours." }, image: img("1580629844914-374f3b707fe5", "") },
      contact: { title: { en: "Contact & location", fr: "Contact et accès" }, text: { en: "Questions before you book? We reply within two hours.", fr: "Une question avant de réserver ? Réponse sous deux heures." }, image: img("1622779536320-bb5f5b501a06", "") },
    },
  },

  credit: { name: "WebLuxe", url: "https://webluxe.github.io/WebLuxe/" },

  /* ---------- 8. Demo mode (WebLuxe sales demos). Set enabled: false for a real client ---------- */
  demo: {
    enabled: true,
    studioWhatsapp: "",
    examples: { tour: "examples/tour.js", rental: "examples/rental.js" },  // lets a prospect see the other business types
    tiers: [
      { label: { en: "Essentials", fr: "Essentiel" }, url: "https://webluxe.github.io/LowTier_BusinessEssentials/" },
      { label: { en: "Portfolio", fr: "Portfolio" }, url: "https://webluxe.github.io/MidTier_PortfolioQuotes/" },
      { label: { en: "Bookings", fr: "Réservations" }, url: "https://webluxe.github.io/HighTier_Bookings/", current: true },
    ],
  },

  /* ---------- 9. All the small words ---------- */
  text: {
    en: {
      // ----- words used on every WebLuxe template (menus, buttons, messages) -----
      home: "Home", skip: "Skip to content", menu: "Menu", switchLang: "Voir le site en français", toggleTheme: "Switch light or dark mode",
      explore: "Explore", footerNav: "Footer links", contactTitle: "Contact", hoursTitle: "Opening hours", rights: "All rights reserved.", websiteBy: "Website by",
      whatsappUs: "Chat on WhatsApp", phone: "Phone", email: "Email", address: "Address", chatNow: "Chat with us now",
      closed: "Closed", today: "today", tomorrow: "tomorrow", openUntil: "Open now, until {time}", closedOpens: "Closed now. Opens {day} at {time}",
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      introSkip: "Skip", close: "Close", ok: "OK", prev: "Previous", next: "Next", slide: "Go to slide {n}", showMap: "Show the map", mapTitle: "Map showing our location",
      formSending: "Sending…", formSent: "Thank you. Your message has been sent and we will reply soon.", formError: "Sorry, the message could not be sent. Please call us on {phone}.",
      formMailto: "Your email app has opened with your message. Press send there to finish.", formDemoDone: "Demo: nothing was sent.",
      demoLabel: "About this demo", demoBadge: "Demo", demoNote: "Example website by WebLuxe. The business, prices and reviews are samples.",
      demoTitle: "This is a demo", demoWa: "On the real website, this opens WhatsApp with this message ready to send:", demoTel: "On the real website, this calls the business:",
      demoMail: "On the real website, this opens an email to the business.", demoForm: "On the real website, the business receives this:",
      demoStudio: "Get a site like this", demoStudioMsg: "Hello WebLuxe, I saw the {site} demo and would like a website like it.",
      // ----- this template -----
      navGallery: "Gallery", navReviews: "Reviews", navContact: "Contact", breadcrumb: "You are here", currency: "Change currency",
      bookNow: "Book now", bookDirect: "Book direct", from: "From", checkAvailability: "Check availability", readAll: "Read all reviews", ratingOf: "{n} out of 5 stars",
      basedOn: "from {n} reviews", seeUsOn: "See us on {site}", howToGetHere: "How to get here", directions: "Get directions", viewFull: "View full screen", allPhotos: "All {n} photos",
      responseTime: "Quick replies", prices: "Prices", period: "Period", standardRate: "Standard rate", policies: "Good to know", noPayNow: "No payment now. We confirm availability first.",
      estTotal: "Estimated total", pickDates: "Choose your dates to see the price", pickDate: "Choose a date to see the price", outAfterIn: "The end date must be after the start date.", seasonalRates: "seasonal rates",
      back: "Back", continue: "Continue", bookTitle: "Request your booking", bookLead: "Three quick steps. Nothing is charged now: we confirm availability within two hours.",
      stepExtras: "Extras", stepDetails: "Your details", time: "Departure time", less: "One less", more: "One more", free: "Free",
      availNote: "We check availability and reply within two hours with a payment link for the deposit.", extrasTitle: "Make it special",
      per_booking: "once", per_unit: "per {unit}", per_person: "per {person}", per_personUnit: "per {person}, per {unit}",
      yourDetails: "Your details", fName: "Full name", fEmail: "Email", fPhone: "Phone / WhatsApp", withCode: "(with country code)", fCountry: "Country", fMessage: "Anything we should know?", optional: "(optional)",
      sendRequest: "Send booking request", confirmWa: "Confirm on WhatsApp", yourBooking: "Your booking", dates: "Dates", details: "Details",
      depositLine: "{pct}% deposit to confirm: {amount}", ref: "Reference {ref}", doneTitle: "Thank you, request received",
      doneSent: "We are checking availability now and will email you within two hours.", doneWa: "Press send in WhatsApp and we will confirm within two hours.",
      next1: "We confirm your dates and the final price.", next2: "You pay a {pct}% deposit by card or bank transfer.", next3: "We send directions and arrange your transfer.", backHome: "Back to the home page",
      waIntro: "Hello {name}, I would like to book:", waFollow: "Hello, about my booking request {ref}:", bookSubject: "New booking request from the {name} website",
      cursorView: "View", cursorDrag: "Drag", onSites: "On booking sites", bookedHere: "Booked here", youKeep: "You keep", commissionNote: "Booking sites add around {pct}% in fees and commission.",
      demoTypeLabel: "See this template for", demoType_accommodation: "a guesthouse or villa", demoType_tour: "boat trips and tours", demoType_rental: "car rental",
      countries: ["Mauritius", "France", "Réunion", "United Kingdom", "Germany", "Italy", "Switzerland", "Belgium", "South Africa", "India", "United Arab Emirates", "United States", "Australia", "China", "Netherlands", "Austria", "Spain", "Seychelles", "Madagascar"],
      types: {
        accommodation: { items: "Rooms", item: "Room", unit: "night", units: "nights", perUnit: "per night", people: "Guests", person: "guest", adults: "Guests", adult: "guest", child: "child", children: "Children", checkIn: "Check-in", checkOut: "Check-out", date: "Date", minUnits: "Minimum stay: {n} nights.", tooMany: "This room sleeps up to {n} guests.", seeAll: "See all {n}", amenities: "In the room", alsoLike: "You may also like", view: "See the room", sample: "{n} nights in the {item}", step1: "Your stay", messageHint: "Arrival time, celebrations, dietary needs…" },
        tour: { items: "Trips", item: "Trip", unit: "trip", units: "trips", perUnit: "per person", people: "People", person: "person", adults: "Adults", adult: "adult", child: "child", children: "Children", checkIn: "Date", checkOut: "", date: "Date", minUnits: "", tooMany: "This trip takes up to {n} people per booking.", seeAll: "See all {n} trips", amenities: "Included", alsoLike: "Other trips", view: "See the trip", sample: "{n} people on the {item}", step1: "Your trip", messageHint: "Hotel for pick-up, swimming level, celebrations…" },
        rental: { items: "Cars", item: "Car", unit: "day", units: "days", perUnit: "per day", people: "Drivers", person: "driver", adults: "Drivers", adult: "driver", child: "", children: "", checkIn: "Pick-up", checkOut: "Return", date: "Date", minUnits: "Minimum rental: {n} days.", tooMany: "Up to {n} drivers.", seeAll: "See all {n} cars", amenities: "Included", alsoLike: "Other cars", view: "See the car", sample: "{n} days with the {item}", step1: "Your rental", messageHint: "Flight number, delivery address, driver's age…" },
      },
    },
    fr: {
      // ----- mots utilisés sur tous les modèles WebLuxe (menus, boutons, messages) -----
      home: "Accueil", skip: "Aller au contenu", menu: "Menu", switchLang: "View the site in English", toggleTheme: "Passer en mode clair ou sombre",
      explore: "Explorer", footerNav: "Liens du pied de page", contactTitle: "Contact", hoursTitle: "Horaires", rights: "Tous droits réservés.", websiteBy: "Site web par",
      whatsappUs: "Écrire sur WhatsApp", phone: "Téléphone", email: "E-mail", address: "Adresse", chatNow: "Écrivez-nous maintenant",
      closed: "Fermé", today: "aujourd'hui", tomorrow: "demain", openUntil: "Ouvert, jusqu'à {time}", closedOpens: "Fermé. Ouvre {day} à {time}",
      days: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"], daysShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
      introSkip: "Passer", close: "Fermer", ok: "OK", prev: "Précédent", next: "Suivant", slide: "Aller à la diapositive {n}", showMap: "Afficher la carte", mapTitle: "Carte de notre adresse",
      formSending: "Envoi…", formSent: "Merci. Votre message a été envoyé et nous vous répondrons très vite.", formError: "Désolé, le message n'a pas pu être envoyé. Appelez-nous au {phone}.",
      formMailto: "Votre messagerie s'est ouverte avec votre message. Appuyez sur envoyer pour terminer.", formDemoDone: "Démo : rien n'a été envoyé.",
      demoLabel: "À propos de cette démo", demoBadge: "Démo", demoNote: "Exemple de site par WebLuxe. L'entreprise, les prix et les avis sont fictifs.",
      demoTitle: "Ceci est une démo", demoWa: "Sur le vrai site, ceci ouvre WhatsApp avec ce message prêt à envoyer :", demoTel: "Sur le vrai site, ceci appelle l'entreprise :",
      demoMail: "Sur le vrai site, ceci ouvre un e-mail vers l'entreprise.", demoForm: "Sur le vrai site, l'entreprise reçoit ceci :",
      demoStudio: "Je veux un site comme celui-ci", demoStudioMsg: "Bonjour WebLuxe, j'ai vu la démo {site} et je voudrais un site comme celui-ci.",
      // ----- ce modèle -----
      navGallery: "Galerie", navReviews: "Avis", navContact: "Contact", breadcrumb: "Vous êtes ici", currency: "Changer de devise",
      bookNow: "Réserver", bookDirect: "Réserver en direct", from: "Dès", checkAvailability: "Voir les disponibilités", readAll: "Lire tous les avis", ratingOf: "{n} étoiles sur 5",
      basedOn: "sur {n} avis", seeUsOn: "Voir sur {site}", howToGetHere: "Comment venir", directions: "Itinéraire", viewFull: "Voir en plein écran", allPhotos: "Les {n} photos",
      responseTime: "Réponse rapide", prices: "Tarifs", period: "Période", standardRate: "Tarif normal", policies: "Bon à savoir", noPayNow: "Aucun paiement maintenant. Nous confirmons d'abord la disponibilité.",
      estTotal: "Total estimé", pickDates: "Choisissez vos dates pour voir le prix", pickDate: "Choisissez une date pour voir le prix", outAfterIn: "La date de fin doit suivre la date de début.", seasonalRates: "tarifs saisonniers",
      back: "Retour", continue: "Continuer", bookTitle: "Demande de réservation", bookLead: "Trois étapes rapides. Rien n'est débité : nous confirmons la disponibilité sous deux heures.",
      stepExtras: "Options", stepDetails: "Vos coordonnées", time: "Heure de départ", less: "Un de moins", more: "Un de plus", free: "Offert",
      availNote: "Nous vérifions la disponibilité et répondons sous deux heures avec un lien de paiement pour l'acompte.", extrasTitle: "Pour un séjour inoubliable",
      per_booking: "une fois", per_unit: "par {unit}", per_person: "par {person}", per_personUnit: "par {person} et par {unit}",
      yourDetails: "Vos coordonnées", fName: "Nom complet", fEmail: "E-mail", fPhone: "Téléphone / WhatsApp", withCode: "(avec l'indicatif)", fCountry: "Pays", fMessage: "Quelque chose à nous dire ?", optional: "(facultatif)",
      sendRequest: "Envoyer la demande", confirmWa: "Confirmer sur WhatsApp", yourBooking: "Votre réservation", dates: "Dates", details: "Détails",
      depositLine: "Acompte de {pct} % pour confirmer : {amount}", ref: "Référence {ref}", doneTitle: "Merci, demande reçue",
      doneSent: "Nous vérifions la disponibilité et vous écrivons sous deux heures.", doneWa: "Appuyez sur envoyer dans WhatsApp et nous confirmons sous deux heures.",
      next1: "Nous confirmons vos dates et le prix final.", next2: "Vous réglez un acompte de {pct} % par carte ou virement.", next3: "Nous envoyons l'itinéraire et organisons votre transfert.", backHome: "Retour à l'accueil",
      waIntro: "Bonjour {name}, je voudrais réserver :", waFollow: "Bonjour, au sujet de ma demande {ref} :", bookSubject: "Nouvelle demande de réservation depuis le site {name}",
      cursorView: "Voir", cursorDrag: "Glisser", onSites: "Sur les sites de réservation", bookedHere: "Réservé ici", youKeep: "Vous gardez", commissionNote: "Les sites de réservation ajoutent environ {pct} % de frais et de commission.",
      demoTypeLabel: "Voir ce modèle pour", demoType_accommodation: "une maison d'hôtes ou villa", demoType_tour: "excursions en mer", demoType_rental: "location de voitures",
      countries: ["Maurice", "France", "La Réunion", "Royaume-Uni", "Allemagne", "Italie", "Suisse", "Belgique", "Afrique du Sud", "Inde", "Émirats arabes unis", "États-Unis", "Australie", "Chine", "Pays-Bas", "Autriche", "Espagne", "Seychelles", "Madagascar"],
      types: {
        accommodation: { items: "Chambres", item: "Chambre", unit: "nuit", units: "nuits", perUnit: "par nuit", people: "Personnes", person: "personne", adults: "Personnes", adult: "personne", child: "enfant", children: "Enfants", checkIn: "Arrivée", checkOut: "Départ", date: "Date", minUnits: "Séjour minimum : {n} nuits.", tooMany: "Cette chambre accueille jusqu'à {n} personnes.", seeAll: "Voir les {n}", amenities: "Dans la chambre", alsoLike: "Vous aimerez aussi", view: "Voir la chambre", sample: "{n} nuits en {item}", step1: "Votre séjour", messageHint: "Heure d'arrivée, anniversaire, régime alimentaire…" },
        tour: { items: "Excursions", item: "Excursion", unit: "sortie", units: "sorties", perUnit: "par personne", people: "Personnes", person: "personne", adults: "Adultes", adult: "adulte", child: "enfant", children: "Enfants", checkIn: "Date", checkOut: "", date: "Date", minUnits: "", tooMany: "Cette sortie accepte jusqu'à {n} personnes par réservation.", seeAll: "Voir les {n} excursions", amenities: "Inclus", alsoLike: "Autres excursions", view: "Voir la sortie", sample: "{n} personnes, {item}", step1: "Votre sortie", messageHint: "Hôtel pour la prise en charge, niveau de nage, anniversaire…" },
        rental: { items: "Voitures", item: "Voiture", unit: "jour", units: "jours", perUnit: "par jour", people: "Conducteurs", person: "conducteur", adults: "Conducteurs", adult: "conducteur", child: "", children: "", checkIn: "Prise en charge", checkOut: "Retour", date: "Date", minUnits: "Location minimum : {n} jours.", tooMany: "Jusqu'à {n} conducteurs.", seeAll: "Voir les {n} voitures", amenities: "Inclus", alsoLike: "Autres voitures", view: "Voir la voiture", sample: "{n} jours, {item}", step1: "Votre location", messageHint: "Numéro de vol, adresse de livraison, âge du conducteur…" },
      },
    },
  },
};
