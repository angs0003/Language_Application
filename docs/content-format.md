# Content format and how to add a content part

Moved from CLAUDE.md sections 6 and 7.

## Content format (content/parts/*.js)

The content is a set of plain scripts in `content/parts/`, loaded in the order of `content/manifest.js` (one shared global scope, so a part may use names from earlier parts). Each part starts with the line `/*@part NAME*/`. Tools read and write the parts through `tools/lib-content-files.js`. `VIDS`, `PARTS`, `LEVELS`, `CASUAL` are in `parts/meta.js`, `KANJI_JA` in `parts/kanji.js`, `KANA`, `TVREC` and `ACCENT_JA` in `parts/kana-tv-accent.js`.


- **Chinese word:** `[word, pinyin, meaning, example, example pinyin, example English, example with word breaks]`
- **Japanese word:** `[word, kana, romaji, meaning, example, example romaji, example English, example with word breaks]`
  (for kana-only words, kana = word).
- **Example with word breaks** (last element, required; the validator fails without it): the example sentence in the sentence-string format below, one token per word with its reading and meaning in this sentence,
  punctuation as bare tokens, ending with `= example English` (the same English as the example). The token texts must join to the example, the token readings must join to the example reading (case, spaces, tone marks and apostrophes ignored),
  and one token must be the word itself (or its inflected form). A token meaning must never contain ` / ` (write `(at/to)`). The lesson shows this sentence under each new word, and each word opens the word callout.
  Add the sentences with `node tools/add-word-breaks.js file.json` (a JSON file `{"zh":{"word":"sentence string"}}`); check meanings with `node tools/check-word-breaks.js`.
- **Theme:** `["Title", [10 words], [6 sentence strings]]` (Level 1 themes 1 to 8 have 5 words). The third element holds the theme’s
  **practice sentences**: 6 sentences in the sentence-string format below, with **no speaker labels**, 2 to 8 content tokens each, using
  only words, grammar and kanji the learner has met. They appear in the lesson’s **Sentences** step and in the quiz (up to 4 sentence
  questions). Inflected forms of theme verbs and い-adjectives count as the theme’s words. Write new themes with the sentences included.
- **Sentence string** (stories and travel): tokens separated by `" / "`, each token
  `text|reading|meaning`; punctuation is a bare token; then `" = English translation"`.
  Example: `"私|watashi|I / は|wa|(topic) / 学生|gakusei|student / です|desu|am / 。 = I am a student."`
  Japanese readings are romaji; write the particles は and を as `wa` and `o`.
  The kana づ is spelled “zu” and ぢ is spelled “ji” in romaji (not “dzu” or “dji”).
  The checks (`tools/romaji-match.js`, `romajiMatches`, used by tools/validate-content.js and tools/check-words.js) compare a word whose kana has づ, ぢ or を
  with づ=ず, ぢ=じ, を=お, so “z”, “j” and “o” pass, and the older “dz”, “dj” and “wo” also pass. Any other kana is compared exactly (ず must be “zu”, じ must be “ji”).
  A new Japanese word whose kana has づ or ぢ also needs an entry in `FURI_DZ` (js/kanji.js, see docs/features/fading-furigana.md).
- **Story chapter:** `{t:"English title", l:[6 to 8 sentence strings], q:[[afterLineIndex, "Question?", ["correct","wrong","wrong"], 0, "Literal reason."]]}`.
  Chapter *n* belongs to theme *n*: **the number of chapters must equal the number of themes**.
- **Grammar point:** `["Title", "Pattern", "Literal explanation.", [tokens as arrays], "English"]`.
- **Kanji entry (in `KANJI_JA`):** `{c, m:[meanings], on:[readings], kun:[readings with "." before okurigana], n:strokes, p:[SVG stroke paths]}`.
  Every kanji used in `JA` words must exist in `KANJI_JA` (the validator checks this). For new kanji, take meanings and
  readings from KANJIDIC2 and stroke paths from KanjiVG (`https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/0XXXX.svg`,
  5-digit lowercase hex code), in the same order as first appearance. Keep the credits in Settings.
- **Catalogue video (in `VIDS`):** `{id:"11-character YouTube id", title, ch:"channel", lvn:level number, len:"5 minutes", has:"what it uses",
  transcript:[{t:startSeconds, line:"sentence string as above"}]}`. Add a transcript only for videos the owner chooses,
  and only with text the owner provides or approves. Times must increase.
- **Casual lesson (in `CASUAL`, `{ja:[...], zh:[...]}`):** `{t:"Title", e:"Literal explanation.", p:[[politeSentence, casualSentence, "who you say the casual one to"], ...4 to 6 pairs]}`, sentence strings as above;
  the two sentences of a pair must differ. Append only.
- **Travel situation:** `{e, t, intro, facts[], hear[sentences], say[[polite, casual|null]], local[[word,reading,meaning,note]], etiq[], drill[[hearIdx, sayIdx]], role["h0","s0",...]}`.
- Characters: Japanese story follows ゆい (Yui) in Tokyo with けん, 田中先生, 山田さん;
  Chinese story follows 小文 (Xiǎo Wén) in Beijing with 大明, 李老师, 王阿姨. Keep facts consistent
  with earlier chapters (for example, Daming's father is a teacher).
- Language rules for all content: literal, no idioms, no metaphors, no sarcasm.
- **Spoken register** (stories, practice sentences, examples, travel phrases): write how people really speak, not textbook text.
  1. Friends and family use plain form (Japanese: 待った？ not 待ちましたか; Chinese: short sentences, 吧, 啊, 呢, 嘛, 儿化 where natural in Beijing).
  2. Staff, teachers, 山田さん and strangers stay polite. Keigo only in the right direction (尊敬語 for others, 謙譲語 for the speaker; teachers say います to students).
  3. Drop the subject when clear (no 私は or あなた in every sentence); use short replies (うん, ううん, いいよ; 嗯, 好的, 行).
  4. Use spoken words in speech, not written or news words (今 not 現在; 降りる not 下車; 可是 not 然而; 所以 not 因此). Written words only in reading text.
  5. Use real measure words and real situations (一份饺子, 这个故事; a bank scene stays at a bank).
  6. Travel `say` lists hold the phrase a traveller really uses first; keep an older or more formal phrase as the second form. New phrases are appended so existing indexes stay valid.
- **No duplicate words** within a language across all themes.

## How to add a content part (150 words)


Tools that help (all in `tools/`): `check-words.js` (word lists), `check-chapters.js` and `check-sentences.js` (stories and practice sentences,
including a check for words the learner has not met yet), `add-kanji.js` (adds missing kanji with stroke order from KanjiVG and
readings from KANJI_JA sources), `validate-content.js` (everything, also run by `npm test`), `check-dictionary.js`
(`npm run dict`: each word's reading against CC-CEDICT and JMdict; report only; `npm run dict:get` downloads JMdict to `tmp/dict/`). Lesson order: Words, Grammar, Sentences, Story, Quiz, Summary.

1. Create a new part `content/parts/<name>.js` (for example `ja-part-15.js`; first line `/*@part ja-part-15*/`) and add its name to `content/manifest.js` before `"meta"`. In it, write the new themes as a new array (for example `const JA5=[...]`, 15 themes × 10 words, each with its 6 sentences),
   10 grammar points (`const GR_JA3=[...]`) and 15 chapters (`const STORY_JA3=[...]`), following the "Content format" section above.
2. Append them next to the existing appends: `JA.push(...JA5)`, `STORY_JA.push(...STORY_JA3)`, and
   `GR.ja.push(...GR_JA3)` (next to `GR.ja.push(...GR_JA2)`).
3. In `content/parts/meta.js`, add one entry to `PARTS.ja`, for example `{lv:2,t:34,g:20,n:10}`
   (`t` = number of Japanese themes before this part, `g` = number of Japanese grammar points before it).
4. Update the matching label in `LEVELS`.
4a. Run `node tools/add-kanji.js` to add the kanji the new Japanese words use.
4b. Add the word breaks of every new word's example sentence (`node tools/add-word-breaks.js --todo ja FROM TO` lists them; `--check` then add). `npm test` fails without them.
5. Run `npm test`. Fix every error.
6. Run `/release`: it commits to a branch and opens a pull request. Do not run `npm run upload` and do not change `CACHE`.
7. After the owner merges, the Deploy workflow uploads the content and publishes. The app downloads the new content at its next start.
