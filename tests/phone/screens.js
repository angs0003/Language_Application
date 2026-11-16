/* Registry of every screen of the app and how to open it (JavaScript run in the page after the language is set and marked as placed).
   Used by:
   - tests/phone/phone.spec.js: opens every registered screen in both languages and at both phone sizes and checks that it has no script errors,
     no sideways scrolling, at most one primary button and no new touch target under 44 px (CLAUDE.md section 3);
   - tests/screens.test.js: fails when a screenX or homeX function of the app is in neither \`screens\` (covers) nor \`skip\`.
   When you add a screen, add it here. A feature that appears on many screens should also be tested on each of them (see the callout and podcast tests in phone.spec.js).
   open: JavaScript. langs: ["ja"] when the screen exists only for Japanese. setup: JavaScript run first.
   maxPrimary: a KNOWN breach of design rule 2 (one primary button per screen): the number of primary buttons the screen has today. The test fails if it gets worse. Fix the screen, then remove the field. */
/* The screens are listed by area in tests/phone/screens/<area>.js (each file exports an array of cases; shared helpers in screens/shared.js).
   Add a new screen at the end of the file of its area; add a new area by adding its name to AREAS.
   Run only some screens: PHONE_AREA=lessons,tabs (area names) and/or PHONE_SCREEN=text (part of the screen name, any case); npm run test:phone:area -- lessons. Without these the full list runs (CI). */
const AREAS = ["tabs", "lists", "kana-kanji", "lessons", "reading", "practice"];
const screens = AREAS.flatMap(area => require("./screens/" + area + ".js").map(sc => Object.assign({ area }, sc)));
const list = v => (v || "").split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
const areas = list(process.env.PHONE_AREA), text = (process.env.PHONE_SCREEN || "").trim().toLowerCase();
const unknown = areas.filter(a => !AREAS.includes(a));
if (unknown.length) throw new Error("Unknown PHONE_AREA: " + unknown.join(", ") + ". Areas: " + AREAS.join(", "));
const filtered = !!(areas.length || text);
const selected = screens.filter(sc => (!areas.length || areas.includes(sc.area)) && (!text || sc.name.toLowerCase().includes(text)));
module.exports = {
  AREAS,
  screens, // all screens (used by tests/screens.test.js)
  selected, // the screens to run (all, unless PHONE_AREA or PHONE_SCREEN is set)
  filtered,
  /* Functions that are not screens of their own, or that need something the test cannot give. Give the reason. */
  skip: {
    screenVideo: "needs the YouTube player, which the tests block (no network); covered by tests/features.test.js with a fake player",
    screenTalk: "AI conversation: AI_OFF is true, so the screen cannot be opened",
    homeStories: "not used anywhere (old library section)",
    homePod: "not used anywhere (old library section)",
    homeTalk: "not used anywhere (old library section)",
    homeReview: "not used anywhere (old library section)",
    homeTrip: "not used anywhere (old library section)"
  }
};
