/* Screens of the area "kana-kanji" (fields: see tests/phone/screens.js). Add a new screen of this area at the end of the list. */
module.exports = [
    { name: "Kana lesson", covers: ["screenKana"], langs: ["ja"], open: "startKana('hira',0)" },
    { name: "Kanji card", covers: ["screenKanjiCard"], langs: ["ja"], open: "openKanji('私')" },
    { name: "Kanji lesson", covers: ["screenKanjiLearn"], langs: ["ja"], open: "startKanjiLesson()" },
];
