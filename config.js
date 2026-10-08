/* ═══════════════════════════════════════════════════════════════════════════
   ✏️  CONFIG.JS: EVERY WORD ON THE WEBSITE LIVES IN THIS FILE.

   HOW TO EDIT (on github.com):
     1. Open this file → click the pencil icon (top right of the file).
     2. Change ONLY the text between the quotes "like this".
     3. KEEP the quotes and the comma at the end of each line.
     4. Click "Commit changes…" → "Commit changes". The site updates in about a minute.

   SWITCHES: true = ON, false = OFF (no quotes around true/false).
   ═══════════════════════════════════════════════════════════════════════════ */
window.SITE = {

  /* ───────────── YOUR NAME ───────────── */

  // ✏️ EDIT ▸ The letters in the top-left corner of every page.
  monogram: "AMJ",

  // ✏️ EDIT ▸ Your first name. Shows as the About page heading: "Hi, I'm Aman."
  firstName: "Aman",

  // ✏️ EDIT ▸ Your full name. Used in every "© 2026 Aman Jaswal. All rights reserved." line.
  fullName: "Aman Jaswal",

  // ✏️ EDIT ▸ The year of your oldest photo. The footer reads "© 2014–2026 Aman Jaswal".
  firstYear: 2014,


  /* ───────────── ABOUT PAGE ───────────── */

  // ✏️ EDIT ▸ The paragraph under "Hi, I'm Aman.".
  about: "Photography has been a hobby of mine for over a decade, or, if we're counting from when I was 13, for considerably longer than I'd care to admit. I like noticing the moments, places, and little details that catch my eye and holding on to them for a while. Occasionally, I even know what I'm doing. This site is a collection of the photographs I've taken along the way.",

  // ✏️ EDIT ▸ The quote on the About page. Put "" (two quotes, nothing inside) to hide it.
  quote: "",


  /* ───────────── REQUEST FORM (your email stays private) ───────────── */

  // ✏️ EDIT ▸ Your Web3Forms access key (safe to be public; it is NOT your email).
  formKey: "a8daebe4-0214-4bf5-8c00-cb537271683c",

  // ✏️ EDIT ▸ Optional sentence above the "Request to use a photo" button on the About page.
  //   Leave "" (empty) to show just the button.
  contactLine: "",


  /* ───────────── THE TWO SIDES ───────────── */

  // ✏️ EDIT ▸ The names of the two sides.
  //   label  = the big title (home page + top of each side)
  //   short  = the short name in the menu
  //   kicker = the small word above the big title
  sides: {
    color: { label: "Color",         short: "Color", kicker: "Side A" },
    bw:    { label: "Black & White", short: "B&W",   kicker: "Side B" },
  },


  /* ───────────── SWITCHES (true = on, false = off) ───────────── */

  // ✏️ SWITCH ▸ Show the place a photo was taken (e.g. "Banff, Alberta, Canada") under the photo.
  showPlace: true,

  // ✏️ SWITCH ▸ Show the camera readout (shutter · aperture · ISO · focal length · exposure comp.)
  //            under each photo. OFF by default to keep things simple. Turn it ON with: true
  showCameraData: false,

  // ✏️ SWITCH ▸ Show the highlighted "Request to use" button under each photo.
  showRequestButton: true,

  // ✏️ SWITCH ▸ Right-click / long-press / drag on a photo shows a © notice instead of "Save image".
  blockRightClick: true,


  /* ───────────── ANIMATION SPEED ───────────── */

  // ✏️ EDIT ▸ How long opening a side (and going back) takes, in milliseconds.
  //   700 = smooth (default) · 500 = snappier · 1000 = slow and dramatic
  pageTransitionMs: 750,
};
