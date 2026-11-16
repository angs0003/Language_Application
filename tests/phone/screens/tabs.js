/* Screens of the area "tabs" (fields: see tests/phone/screens.js). Add a new screen of this area at the end of the list. */
module.exports = [
    { name: "Learn tab", covers: ["homeLearn", "screenHome"], open: "setTab('learn')" },
    { name: "Practise tab", covers: ["homePractise"], open: "setTab('practise')" },
    { name: "Listen tab", covers: ["homeListen"], open: "setTab('listen')" },
    { name: "Travel tab", covers: ["homeTravel"], open: "setTab('travel')" },
    { name: "Settings", covers: ["screenSettings"], open: "view={s:'settings'};render()" },
];
