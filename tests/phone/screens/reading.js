/* Screens of the area "reading" (fields: see tests/phone/screens.js). Add a new screen of this area at the end of the list. */
module.exports = [
    { name: "Story reader", covers: ["screenStory"], open: "openChapter(0)" },
    { name: "Story reader: all lines", covers: [], open: "{openChapter(1);view.shown=chapter(S.lang,1).lines.length;render();}" },
    { name: "Story reader: questions", covers: [], open: "{openChapter(0);view.phase='q';view.k=0;render();}" },
    { name: "Story player", covers: ["screenPlayer"], open: "openPlayer('story',0)" },
    { name: "Podcast player", covers: [], open: "openPlayer('pod',0)" },
    { name: "Travel player", covers: [], open: "openPlayer('trip',0)" },
    { name: "Podcast episode", covers: ["screenPod"], open: "openPod(0)" },
    { name: "Travel situation", covers: ["screenTrip"], open: "openTrip(0)" },
];
