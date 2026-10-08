/* ═══════════════════════════════════════════════════════════════════════════
   ✏️  CONFIG.JS: EVERY WORD ON YOUR SITE LIVES IN THIS FILE.

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

  // ✏️ EDIT ▸ The year of your oldest photo. The footer reads "© 2017–2026 Aman Jaswal".
  firstYear: 2017,


  /* ───────────── ABOUT PAGE ───────────── */

  // ✏️ EDIT ▸ The paragraph under "Hi, I'm Aman.".
  about: "Photography is my hobby. I love travelling, and I love making photographs along the way. This is where I keep them.",

  // ✏️ EDIT ▸ The quote on the About page. Put "" (two quotes, nothing inside) to hide it.
  quote: "Photographs are my way of speaking to the world without saying a word.",

  // ✏️ EDIT ▸ The heading of the contact section on the About page.
  contactTitle: "Get in touch",

  // ✏️ EDIT ▸ The sentence above your email and the "Request to use" button.
  contactLine: "Please reach out if you'd like to use one of my photographs, or if you'd simply like to get in touch.",


  /* ───────────── CONTACT ───────────── */

  // ✏️ EDIT ▸ YOUR EMAIL. EVERY "Request to use" button opens an email to this address.
  email: "you@example.com",

  // ✏️ EDIT ▸ Your Instagram handle without the @, e.g. "amj.photos". Leave "" to hide the button.
  instagram: "",


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
  pageTransitionMs: 700,
};
