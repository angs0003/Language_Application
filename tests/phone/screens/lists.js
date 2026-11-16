/* Screens of the area "lists" (fields: see tests/phone/screens.js). Add a new screen of this area at the end of the list. */
module.exports = [
    { name: "All themes", covers: ["screenLib", "homePath"], open: "openSub('themes')" },
    { name: "Grammar guide", covers: ["homeGrammar"], open: "openSub('grammar')" },
    { name: "Your videos", covers: ["homeWatch"], open: "openSub('watchadd')" },
    { name: "Phrases to review", covers: ["homeReal"], open: "openSub('real')" },
    { name: "Casual speech list", covers: ["homeCasual"], open: "openSub('casual')" },
    { name: "Kanji list", covers: ["homeKanji"], langs: ["ja"], maxPrimary: 2, open: "openSub('kanji')" },
    { name: "Kana list", covers: [], langs: ["ja"], open: "openSub('kana')" },
];
