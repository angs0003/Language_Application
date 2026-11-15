/*@part ja-part-5*/
/* Levels, parts and video recommendations (stored in the database as meta rows). */
/* PARTS: one entry per content part, in order. t = index of the part's first theme,
   g = index of the part's first grammar point, n = number of grammar points in the part.
   To add a part: append its themes, grammar and chapters in content/content.js, then add one entry here. */
/* JA-PART-5-BEGIN */
const JA_P5A=[
 ["Colds and injuries",
  [["鼻水","はなみず","hanamizu","runny nose","鼻水が出ます。","Hanamizu ga demasu.","I have a runny nose.","鼻水|hanamizu|runny nose / が|ga|(subject) / 出ます|demasu|to come out (polite) / 。 = I have a runny nose."],
  ["喉","のど","nodo","throat","喉が痛いです。","Nodo ga itai desu.","My throat hurts.","喉|nodo|throat / が|ga|(subject) / 痛い|itai|painful / です|desu|is / 。 = My throat hurts."],
  ["怪我","けが","kega","injury","足を怪我しました。","Ashi o kega shimashita.","I hurt my foot.","足|ashi|foot / を|o|(object) / 怪我|kega|injury / しました|shimashita|did / 。 = I hurt my foot."],
  ["治る","なおる","naoru","to get better, to recover","熱はすぐ治ります。","Netsu wa sugu naorimasu.","A fever gets better soon.","熱|netsu|fever / は|wa|(topic) / すぐ|sugu|soon / 治ります|naorimasu|to get better (polite) / 。 = A fever gets better soon."],
  ["注射","ちゅうしゃ","chuusha","injection","注射は痛いです。","Chuusha wa itai desu.","An injection hurts.","注射|chuusha|injection / は|wa|(topic) / 痛い|itai|painful / です|desu|is / 。 = An injection hurts."],
  ["汗","あせ","ase","sweat","夏は汗をたくさんかきます。","Natsu wa ase o takusan kakimasu.","I sweat a lot in summer.","夏|natsu|summer / は|wa|(topic) / 汗|ase|sweat / を|o|(object) / たくさん|takusan|a lot / かきます|kakimasu|to sweat (polite) / 。 = I sweat a lot in summer."],
  ["血","ち","chi","blood","血が出ました。","Chi ga demashita.","I bled.","血|chi|blood / が|ga|(subject) / 出ました|demashita|came out / 。 = I bled."],
  ["倒れる","たおれる","taoreru","to fall down, to collapse","道で人が倒れました。","Michi de hito ga taoremashita.","A person fell down on the road.","道|michi|road / で|de|(on) / 人|hito|person / が|ga|(subject) / 倒れました|taoremashita|fell down / 。 = A person fell down on the road."],
  ["具合","ぐあい","guai","condition (of body or machine)","具合が悪いです。","Guai ga warui desu.","I do not feel well.","具合|guai|condition / が|ga|(subject) / 悪い|warui|bad / です|desu|is / 。 = I do not feel well."],
  ["寒気","さむけ","samuke","chill (a cold feeling in the body)","寒気がします。","Samuke ga shimasu.","I have a chill.","寒気|samuke|chill / が|ga|(subject) / します|shimasu|to have (polite) / 。 = I have a chill."]],
  [
   "鼻水|hanamizu|runny nose / が|ga|(subject) / 出たら|detara|if (it) comes out / 薬|kusuri|medicine / を|o|(object) / 飲みます|nomimasu|take / 。 = If my nose runs, I take medicine.",
   "喉|nodo|throat / が|ga|(subject) / 痛かったら|itakattara|if (it) hurts / 病院|byouin|hospital / に|ni|to / 行って|itte|go / ください|kudasai|please / 。 = If your throat hurts, please go to the hospital.",
   "血|chi|blood / が|ga|(subject) / 出たら|detara|if (it) comes out / 医者|isha|doctor / に|ni|to / 電話します|denwa shimasu|phone / 。 = If I bleed, I phone the doctor.",
   "休んだら|yasundara|if (you) rest / 熱|netsu|fever / は|wa|(topic) / 治る|naoru|get better / と|to|(quote) / 思います|omoimasu|think / 。 = If you rest, I think your fever will get better.",
   "注射|chuusha|injection / が|ga|(subject) / 怖い|kowai|scary / です|desu|is / 。 = I am afraid of injections.",
   "汗|ase|sweat / が|ga|(subject) / たくさん|takusan|a lot / 出たら|detara|if (it) comes out / 水|mizu|water / を|o|(object) / 飲みましょう|nomimashou|let’s drink / 。 = If you sweat a lot, let’s drink water."
  ]],
 ["At the hospital",
  [["入院","にゅういん","nyuuin","hospital stay (to be admitted to hospital)","父は先月入院しました。","Chichi wa sengetsu nyuuin shimashita.","My father went into hospital last month.","父|chichi|father / は|wa|(topic) / 先月|sengetsu|last month / 入院|nyuuin|hospital stay / しました|shimashita|did / 。 = My father went into hospital last month."],
  ["退院","たいいん","taiin","leaving hospital","来週、退院します。","Raishuu, taiin shimasu.","I leave the hospital next week.","来週|raishuu|next week / 、 / 退院|taiin|leaving hospital / します|shimasu|to do (polite) / 。 = I leave the hospital next week."],
  ["検査","けんさ","kensa","test, check-up","病院で検査をします。","Byouin de kensa o shimasu.","I have a test at the hospital.","病院|byouin|hospital / で|de|(at) / 検査|kensa|test / を|o|(object) / します|shimasu|to do (polite) / 。 = I have a test at the hospital."],
  ["体温","たいおん","taion","body temperature","体温を調べます。","Taion o shirabemasu.","I check my body temperature.","体温|taion|body temperature / を|o|(object) / 調べます|shirabemasu|to check (polite) / 。 = I check my body temperature."],
  ["健康","けんこう","kenkou","health, healthy","運動は健康にいいです。","Undou wa kenkou ni ii desu.","Exercise is good for health.","運動|undou|exercise / は|wa|(topic) / 健康|kenkou|health / に|ni|(for) / いい|ii|good / です|desu|is / 。 = Exercise is good for health."],
  ["予防","よぼう","yobou","prevention","病気の予防に、手を洗います。","Byouki no yobou ni, te o araimasu.","I wash my hands to prevent illness.","病気|byouki|illness / の|no|(of) / 予防|yobou|prevention / に|ni|(for) / 、 / 手|te|hands / を|o|(object) / 洗います|araimasu|to wash (polite) / 。 = I wash my hands to prevent illness."],
  ["栄養","えいよう","eiyou","nutrition","野菜は栄養があります。","Yasai wa eiyou ga arimasu.","Vegetables have nutrition.","野菜|yasai|vegetables / は|wa|(topic) / 栄養|eiyou|nutrition / が|ga|(subject) / あります|arimasu|there is (polite) / 。 = Vegetables have nutrition."],
  ["薬局","やっきょく","yakkyoku","pharmacy","薬局で薬を買います。","Yakkyoku de kusuri o kaimasu.","I buy medicine at a pharmacy.","薬局|yakkyoku|pharmacy / で|de|(at) / 薬|kusuri|medicine / を|o|(object) / 買います|kaimasu|to buy (polite) / 。 = I buy medicine at a pharmacy."],
  ["お大事に","おだいじに","odaiji ni","take care (said to a sick person)","医者は「お大事に」と言いました。","Isha wa “odaiji ni” to iimashita.","The doctor said, “Take care.”","医者|isha|doctor / は|wa|(topic) / 「 / お大事に|odaiji ni|take care / 」 / と|to|(quote) / 言いました|iimashita|said / 。 = The doctor said, “Take care.”"],
  ["看病","かんびょう","kanbyou","nursing, caring for a sick person","母が毎日、父を看病しています。","Haha ga mainichi, chichi o kanbyou shite imasu.","My mother takes care of my father every day.","母|haha|mother / が|ga|(subject) / 毎日|mainichi|every day / 、 / 父|chichi|father / を|o|(object) / 看病|kanbyou|nursing / して|shite|doing / います|imasu|is (ongoing) / 。 = My mother takes care of my father every day."]],
  [
   "父|chichi|my father / は|wa|(topic) / 先週|senshuu|last week / 入院|nyuuin|hospital stay / しました|shimashita|did / 。 = My father went into hospital last week.",
   "兄|ani|my older brother / は|wa|(topic) / 来週|raishuu|next week / 退院|taiin|leaving hospital / します|shimasu|do / 。 = My older brother leaves the hospital next week.",
   "検査|kensa|test / は|wa|(topic) / 午前|gozen|morning / に|ni|in / あります|arimasu|there is / 。 = The test is in the morning.",
   "薬局|yakkyoku|pharmacy / は|wa|(topic) / 病院|byouin|hospital / の|no|of / 隣|tonari|next to / です|desu|is / 。 = The pharmacy is next to the hospital.",
   "野菜|yasai|vegetables / を|o|(object) / 食べれば|tabereba|if (you) eat / 健康|kenkou|health / に|ni|for / いい|ii|good / です|desu|is / 。 = If you eat vegetables, it is good for your health.",
   "毎朝|maiasa|every morning / 体温|taion|body temperature / を|o|(object) / 調べます|shirabemasu|check / 。 = I check my body temperature every morning."
  ]],
 ["Health and body habits",
  [["マスク","マスク","masuku","mask (face mask)","冬はマスクをします。","Fuyu wa masuku o shimasu.","I wear a mask in winter.","冬|fuyu|winter / は|wa|(topic) / マスク|masuku|mask / を|o|(object) / します|shimasu|to wear (polite) / 。 = I wear a mask in winter."],
  ["目薬","めぐすり","megusuri","eye drops","目薬を使います。","Megusuri o tsukaimasu.","I use eye drops.","目薬|megusuri|eye drops / を|o|(object) / 使います|tsukaimasu|to use (polite) / 。 = I use eye drops."],
  ["体調","たいちょう","taichou","physical condition","今日は体調がいいです。","Kyou wa taichou ga ii desu.","My condition is good today.","今日|kyou|today / は|wa|(topic) / 体調|taichou|physical condition / が|ga|(subject) / いい|ii|good / です|desu|is / 。 = My condition is good today."],
  ["睡眠","すいみん","suimin","sleep","睡眠が少ないです。","Suimin ga sukunai desu.","I get little sleep.","睡眠|suimin|sleep / が|ga|(subject) / 少ない|sukunai|little / です|desu|is / 。 = I get little sleep."],
  ["増える","ふえる","fueru","to increase","客が増えました。","Kyaku ga fuemashita.","The number of customers increased.","客|kyaku|customers / が|ga|(subject) / 増えました|fuemashita|increased / 。 = The number of customers increased."],
  ["減る","へる","heru","to decrease, to go down","お腹が減りました。","Onaka ga herimashita.","I got hungry.","お腹|onaka|stomach / が|ga|(subject) / 減りました|herimashita|decreased / 。 = I got hungry."],
  ["塗る","ぬる","nuru","to apply (medicine, paint)","薬を塗ります。","Kusuri o nurimasu.","I put medicine on.","薬|kusuri|medicine / を|o|(object) / 塗ります|nurimasu|to apply (polite) / 。 = I put medicine on."],
  ["太る","ふとる","futoru","to gain weight","去年、少し太りました。","Kyonen, sukoshi futorimashita.","I gained a little weight last year.","去年|kyonen|last year / 、 / 少し|sukoshi|a little / 太りました|futorimashita|gained weight / 。 = I gained a little weight last year."],
  ["痩せる","やせる","yaseru","to lose weight","運動して、痩せました。","Undou shite, yasemashita.","I exercised and lost weight.","運動して|undou shite|exercised (and) / 、 / 痩せました|yasemashita|lost weight / 。 = I exercised and lost weight."],
  ["ダイエット","ダイエット","daietto","diet (to lose weight)","ダイエットをしています。","Daietto o shite imasu.","I am on a diet.","ダイエット|daietto|diet / を|o|(object) / して|shite|doing / います|imasu|am (ongoing) / 。 = I am on a diet."]],
  [
   "冬|fuyu|winter / は|wa|(topic) / マスク|masuku|mask / を|o|(object) / します|shimasu|wear / 。 = I wear a mask in winter.",
   "目薬|megusuri|eye drops / を|o|(object) / 使います|tsukaimasu|use / 。 = I use eye drops.",
   "今日|kyou|today / は|wa|(topic) / 体調|taichou|condition / が|ga|(subject) / いい|ii|good / です|desu|is / 。 = My condition is good today.",
   "怪我|kega|injury / に|ni|on / 薬|kusuri|medicine / を|o|(object) / 塗ります|nurimasu|apply / 。 = I put medicine on a wound.",
   "夜|yoru|night / たくさん|takusan|a lot / 食べる|taberu|eat / と|to|if / 太ります|futorimasu|gain weight / 。 = If I eat a lot at night, I gain weight.",
   "運動|undou|exercise / する|suru|do / と|to|if / お腹|onaka|stomach / が|ga|(subject) / 減ります|herimasu|decreases / 。 = When I exercise, I get hungry."
  ]],
 ["School life",
  [["入学","にゅうがく","nyuugaku","entering a school","来月、大学に入学します。","Raigetsu, daigaku ni nyuugaku shimasu.","I enter university next month.","来月|raigetsu|next month / 、 / 大学|daigaku|university / に|ni|(into) / 入学|nyuugaku|entering a school / します|shimasu|to do (polite) / 。 = I enter university next month."],
  ["卒業","そつぎょう","sotsugyou","graduation, to graduate","去年、大学を卒業しました。","Kyonen, daigaku o sotsugyou shimashita.","I graduated from university last year.","去年|kyonen|last year / 、 / 大学|daigaku|university / を|o|(object) / 卒業|sotsugyou|graduation / しました|shimashita|did / 。 = I graduated from university last year."],
  ["学期","がっき","gakki","school term, semester","新しい学期が始まります。","Atarashii gakki ga hajimarimasu.","A new term begins.","新しい|atarashii|new / 学期|gakki|school term / が|ga|(subject) / 始まります|hajimarimasu|to begin (polite) / 。 = A new term begins."],
  ["遅刻","ちこく","chikoku","being late (for school or work)","電車が遅れて、遅刻しました。","Densha ga okurete, chikoku shimashita.","The train was late, so I was late.","電車|densha|train / が|ga|(subject) / 遅れて|okurete|was late (and) / 、 / 遅刻|chikoku|being late / しました|shimashita|did / 。 = The train was late, so I was late."],
  ["欠席","けっせき","kesseki","absence, to be absent","熱で欠席しました。","Netsu de kesseki shimashita.","I was absent because of a fever.","熱|netsu|fever / で|de|(because of) / 欠席|kesseki|absence / しました|shimashita|did / 。 = I was absent because of a fever."],
  ["出席","しゅっせき","shusseki","attendance, to attend","授業に出席します。","Jugyou ni shusseki shimasu.","I attend class.","授業|jugyou|class / に|ni|(at) / 出席|shusseki|attendance / します|shimasu|to do (polite) / 。 = I attend class."],
  ["成績","せいせき","seiseki","grades, results","成績がいいです。","Seiseki ga ii desu.","My grades are good.","成績|seiseki|grades / が|ga|(subject) / いい|ii|good / です|desu|is / 。 = My grades are good."],
  ["生徒","せいと","seito","pupil, student (at school)","この学校は生徒が多いです。","Kono gakkou wa seito ga ooi desu.","This school has many pupils.","この|kono|this / 学校|gakkou|school / は|wa|(topic) / 生徒|seito|pupils / が|ga|(subject) / 多い|ooi|many / です|desu|is / 。 = This school has many pupils."],
  ["制服","せいふく","seifuku","uniform","制服は青いです。","Seifuku wa aoi desu.","The uniform is blue.","制服|seifuku|uniform / は|wa|(topic) / 青い|aoi|blue / です|desu|is / 。 = The uniform is blue."],
  ["教科書","きょうかしょ","kyoukasho","textbook","教科書を開けてください。","Kyoukasho o akete kudasai.","Please open your textbook.","教科書|kyoukasho|textbook / を|o|(object) / 開けて|akete|open / ください|kudasai|please / 。 = Please open your textbook."]],
  [
   "熱|netsu|fever / が|ga|(subject) / ある|aru|have / ので|node|because / 欠席|kesseki|absence / します|shimasu|do / 。 = Because I have a fever, I will be absent.",
   "遅刻|chikoku|being late / する|suru|do / ので|node|because / 電話|denwa|phone call / します|shimasu|do / 。 = I will phone because I will be late.",
   "授業|jugyou|class / に|ni|to / 出席|shusseki|attendance / する|suru|do / ので|node|because / 早く|hayaku|early / 起きます|okimasu|get up / 。 = I will attend class, so I get up early.",
   "成績|seiseki|grades / が|ga|(subject) / いい|ii|good / ので|node|because / 嬉しい|ureshii|happy / です|desu|am / 。 = My grades are good, so I am happy.",
   "教科書|kyoukasho|textbook / が|ga|(subject) / 重い|omoi|heavy / ので|node|because / かばん|kaban|bag / は|wa|(topic) / 大きい|ookii|big / です|desu|is / 。 = The textbooks are heavy, so my bag is big.",
   "来月|raigetsu|next month / 卒業|sotsugyou|graduation / する|suru|do / ので|node|because / 寂しい|sabishii|lonely / です|desu|am / 。 = I am lonely because I will graduate next month."
  ]],
 ["Exams and study",
  [["受験","じゅけん","juken","taking an entrance exam","来年、大学を受験します。","Rainen, daigaku o juken shimasu.","I take the entrance exam for a university next year.","来年|rainen|next year / 、 / 大学|daigaku|university / を|o|(object) / 受験|juken|taking an entrance exam / します|shimasu|to do (polite) / 。 = I take the entrance exam for a university next year."],
  ["合格","ごうかく","goukaku","passing (an exam)","試験に合格しました。","Shiken ni goukaku shimashita.","I passed the exam.","試験|shiken|exam / に|ni|(in) / 合格|goukaku|passing / しました|shimashita|did / 。 = I passed the exam."],
  ["点数","てんすう","tensuu","score, marks","点数が高いです。","Tensuu ga takai desu.","The score is high.","点数|tensuu|score / が|ga|(subject) / 高い|takai|high / です|desu|is / 。 = The score is high."],
  ["復習","ふくしゅう","fukushuu","review (of what was learned)","毎晩、復習をします。","Maiban, fukushuu o shimasu.","I review every night.","毎晩|maiban|every night / 、 / 復習|fukushuu|review / を|o|(object) / します|shimasu|to do (polite) / 。 = I review every night."],
  ["予習","よしゅう","yoshuu","preparation (before class)","授業の前に予習します。","Jugyou no mae ni yoshuu shimasu.","I prepare before class.","授業|jugyou|class / の|no|(of) / 前|mae|before / に|ni|(at) / 予習|yoshuu|preparation / します|shimasu|to do (polite) / 。 = I prepare before class."],
  ["間違える","まちがえる","machigaeru","to make a mistake, to get wrong","問題を間違えました。","Mondai o machigaemashita.","I got the question wrong.","問題|mondai|question / を|o|(object) / 間違えました|machigaemashita|got wrong / 。 = I got the question wrong."],
  ["失敗","しっぱい","shippai","failure, mistake","料理に失敗しました。","Ryouri ni shippai shimashita.","The cooking went wrong.","料理|ryouri|cooking / に|ni|(in) / 失敗|shippai|failure / しました|shimashita|did / 。 = The cooking went wrong."],
  ["頑張る","がんばる","ganbaru","to do one’s best","試験まで頑張ります。","Shiken made ganbarimasu.","I will do my best until the exam.","試験|shiken|exam / まで|made|until / 頑張ります|ganbarimasu|to do one’s best (polite) / 。 = I will do my best until the exam."],
  ["諦める","あきらめる","akirameru","to give up","旅行を諦めました。","Ryokou o akiramemashita.","I gave up the trip.","旅行|ryokou|trip / を|o|(object) / 諦めました|akiramemashita|gave up / 。 = I gave up the trip."],
  ["努力","どりょく","doryoku","effort","毎日、努力します。","Mainichi, doryoku shimasu.","I make an effort every day.","毎日|mainichi|every day / 、 / 努力|doryoku|effort / します|shimasu|to do (polite) / 。 = I make an effort every day."]],
  [
   "毎日|mainichi|every day / 勉強|benkyou|study / する|suru|do / のに|noni|although / 合格|goukaku|passing / しません|shimasen|does not do / 。 = Although I study every day, I do not pass.",
   "毎日|mainichi|every day / 復習|fukushuu|review / する|suru|do / のに|noni|although / 間違えます|machigaemasu|make mistakes / 。 = Although I review every day, I make mistakes.",
   "毎日|mainichi|every day / 頑張る|ganbaru|do my best / のに|noni|although / 先生|sensei|teacher / は|wa|(topic) / 厳しい|kibishii|strict / です|desu|is / 。 = Although I do my best every day, the teacher is strict.",
   "頑張った|ganbatta|did my best / のに|noni|although / 失敗|shippai|failure / しました|shimashita|did / 。 = Although I did my best, I failed.",
   "受験|juken|entrance exam / は|wa|(topic) / 来年|rainen|next year / な|na|(be) / のに|noni|although / まだ|mada|yet / 勉強|benkyou|study / しません|shimasen|do not do / 。 = Although the exam is next year, I do not study yet.",
   "努力|doryoku|effort / する|suru|do / のに|noni|although / 点数|tensuu|score / が|ga|(subject) / 悪い|warui|bad / です|desu|is / 。 = Although I make an effort, my score is bad."
  ]]
];
const GR_P5A=[
 ["Conditions with たら","Verb, adjective or noun た-form + ら, result","たら (tara) is added to the た-form of a verb, an い-adjective or a noun. It means “if” or “when”: the first part is the condition and the second part is the result. For verbs, make the た-form (飲む becomes 飲んだ, 行く becomes 行った, 食べる becomes 食べた) and add ら: 飲んだら means “if I drink”. For い-adjectives, change い to かった and add ら: 安い becomes 安かったら. For nouns and な-adjectives, use だったら: 雨だったら means “if it rains”. The result can be a request, a suggestion or a plan.",[["熱","netsu","fever"],["が","ga","(subject)"],["出たら","detara","if (it) comes out"],["薬","kusuri","medicine"],["を","o","(object)"],["飲んで","nonde","take"],["ください","kudasai","please"],["。","",""]],"If you get a fever, please take medicine."],
 ["Conditions with ば","ば-form + result","The ば-form (ba) also means “if”. It is often used for natural conditions, advice and hopes. For る-verbs, change る to れば: 食べる becomes 食べれば. For other verbs, change the last sound to the え-row sound and add ば: 飲む becomes 飲めば, 行く becomes 行けば. する becomes すれば and 来る becomes 来れば. For い-adjectives, change い to ければ: 安い becomes 安ければ. Do not use the ば-form when the result is a request such as “please …”.",[["野菜","yasai","vegetables"],["を","o","(object)"],["食べれば","tabereba","if (you) eat"],["健康","kenkou","health"],["に","ni","for"],["いい","ii","good"],["です","desu","is"],["。","",""]],"If you eat vegetables, it is good for your health."],
 ["Automatic results with と","Dictionary form + と, result","と (to) after the dictionary form means “whenever” or “if”: the second part always happens after the first part. It is used for natural results, habits and directions. 春になると花が咲きます means “When spring comes, flowers bloom”. Do not use a request or a wish in the second part.",[["この","kono","this"],["薬","kusuri","medicine"],["を","o","(object)"],["飲む","nomu","take"],["と","to","if, whenever"],["眠く","nemuku","sleepy"],["なります","narimasu","become"],["。","",""]],"If I take this medicine, I become sleepy."],
 ["Reasons with ので","Plain form + ので, result","ので (node) gives a reason, like から. It is softer and more polite than から, so it is often used to explain a problem or to ask for something. Put a plain form before it: 行く, 行かない, 行った, 行かなかった. For い-adjectives use the plain form: 痛い. For nouns and な-adjectives use な: 病気なので means “because I am ill”.",[["熱","netsu","fever"],["が","ga","(subject)"],["ある","aru","have"],["ので","node","because"],["今日","kyou","today"],["は","wa","(topic)"],["休みます","yasumimasu","rest"],["。","",""]],"I have a fever, so I rest today."],
 ["Despite with のに","Plain form + のに, result","のに (noni) joins two parts when the result is different from what you expect: “although” or “even though”. The speaker often feels surprised, sorry or angry. Put a plain form before it. For nouns and な-adjectives use な: 日曜日なのに means “although it is Sunday”. Do not use a request in the second part.",[["薬","kusuri","medicine"],["を","o","(object)"],["飲んだ","nonda","took"],["のに","noni","although"],["治りません","naorimasen","do not get better"],["。","",""]],"Although I took medicine, I do not get better."]
];
const STORY_P5A=[
 {"t":"Yui has a fever","l":[
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 今朝|kesa|this morning / 具合|guai|condition / が|ga|(subject) / 悪い|warui|bad / です|desu|is / 。 = This morning Yui does not feel well.",
  "寒気|samuke|chill / が|ga|(subject) / します|shimasu|have / 。 / 鼻水|hanamizu|runny nose / も|mo|also / 出ます|demasu|comes out / 。 / 喉|nodo|throat / も|mo|also / 痛い|itai|painful / です|desu|is / 。 = She has a chill and a runny nose. Her throat also hurts.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 病院|byouin|hospital / に|ni|to / 行きました|ikimashita|went / 。 = Yui went to the hospital.",
  "医者|isha|doctor / ： / 熱|netsu|fever / が|ga|(subject) / あります|arimasu|there is / 。 / 薬|kusuri|medicine / を|o|(object) / 飲んで|nonde|take / 休んで|yasunde|rest / ください|kudasai|please / 。 = Doctor: You have a fever. Please take medicine and rest.",
  "ゆい|Yui|Yui (name) / ： / 注射|chuusha|injection / が|ga|(subject) / 怖い|kowai|scary / です|desu|is / 。 = Yui: I am afraid of injections.",
  "医者|isha|doctor / ： / 注射|chuusha|injection / は|wa|(topic) / しません|shimasen|do not do / 。 / 薬|kusuri|medicine / を|o|(object) / 飲んだら|nondara|if (you) take / 治ります|naorimasu|get better / 。 = Doctor: No injection. If you take medicine, you will get better.",
  "けん|Ken|Ken (name) / は|wa|(topic) / ゆい|Yui|Yui (name) / に|ni|to / 電話しました|denwa shimashita|phoned / 。 = Ken phoned Yui."
 ],"q":[[2,"Where did Yui go?",["To the hospital","To the school","To the bank"],0,"Line 3: 病院に行きました means “went to the hospital”."],[5,"What will help Yui get better?",["Medicine","An injection","Exercise"],0,"Line 6: 薬を飲んだら治ります means “if you take medicine, you will get better”."]]},
 {"t":"Yamada-san in hospital","l":[
  "山田さん|Yamada san|Yamada-san / は|wa|(topic) / 先週|senshuu|last week / 入院|nyuuin|hospital stay / しました|shimashita|did / 。 = Yamada-san went into hospital last week.",
  "ゆい|Yui|Yui (name) / と|to|and / けん|Ken|Ken (name) / は|wa|(topic) / 病院|byouin|hospital / に|ni|to / 行きました|ikimashita|went / 。 = Yui and Ken went to the hospital.",
  "山田さん|Yamada san|Yamada-san / ： / 検査|kensa|test / は|wa|(topic) / 終わりました|owarimashita|finished / 。 / 来週|raishuu|next week / 退院|taiin|leaving hospital / します|shimasu|do / 。 = Yamada-san: The tests are finished. I will leave the hospital next week.",
  "看護師|kangoshi|nurse / は|wa|(topic) / 毎朝|maiasa|every morning / 体温|taion|body temperature / を|o|(object) / 調べます|shirabemasu|checks / 。 = The nurse checks her body temperature every morning.",
  "山田さん|Yamada san|Yamada-san / ： / 野菜|yasai|vegetables / は|wa|(topic) / 栄養|eiyou|nutrition / が|ga|(subject) / あります|arimasu|have / 。 / たくさん|takusan|a lot / 食べれば|tabereba|if (you) eat / 健康|kenkou|healthy / に|ni|(become) / なります|narimasu|become / 。 = Yamada-san: Vegetables have nutrition. If you eat a lot, you become healthy.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 毎日|mainichi|every day / 山田さん|Yamada san|Yamada-san / に|ni|(object) / 会います|aimasu|meets / 。 = Yui meets Yamada-san every day.",
  "けん|Ken|Ken (name) / ： / お大事に|odaiji ni|take care / 。 = Ken: Take care."
 ],"q":[[0,"When did Yamada-san go into hospital?",["Last week","Next week","Yesterday"],0,"Line 1: 先週入院しました means “went into hospital last week”."],[3,"What does the nurse check every morning?",["Body temperature","Shoes","Money"],0,"Line 4: 毎朝体温を調べます means “checks the body temperature every morning”."]]},
 {"t":"Healthy habits","l":[
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 今年|kotoshi|this year / 少し|sukoshi|a little / 太りました|futorimashita|gained weight / 。 = This year Yui gained a little weight.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / ダイエット|daietto|diet / を|o|(object) / して|shite|do / います|imasu|is doing / 。 = Yui is on a diet.",
  "けん|Ken|Ken (name) / ： / 運動|undou|exercise / する|suru|exercise / と|to|if / 痩せる|yaseru|lose weight / よ|yo|(friendly ending) / 。 / 一緒に|issho ni|together / 散歩|sanpo|walk / しよう|shiyou|let’s do / 。 = Ken: If you exercise, you lose weight. Let’s take a walk together.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 毎日|mainichi|every day / 歩きます|arukimasu|walks / 。 / お腹|onaka|stomach / が|ga|(subject) / 減ります|herimasu|decreases / 。 = Yui walks every day. She gets hungry.",
  "ゆい|Yui|Yui (name) / ： / 睡眠|suimin|sleep / が|ga|(subject) / 少ない|sukunai|little / と|to|if / 体調|taichou|condition / が|ga|(subject) / 悪い|warui|bad / 。 = Yui: When I get little sleep, my condition is bad.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / マスク|masuku|mask / を|o|(object) / します|shimasu|wears / 。 / 目|me|eye / が|ga|(subject) / 痛い|itai|painful / から|kara|so / 目薬|megusuri|eye drops / を|o|(object) / 使います|tsukaimasu|uses / 。 = Yui wears a mask. Her eyes hurt, so she uses eye drops."
 ],"q":[[1,"What is Yui doing?",["A diet","Shopping","Cooking"],0,"Line 2: ダイエットをしています means “is on a diet”."],[4,"What is bad when Yui gets little sleep?",["Her condition","Her bag","Her homework"],0,"Line 5: 睡眠が少ないと体調が悪い means “when I get little sleep, my condition is bad”."]]},
 {"t":"Absent and late","l":[
  "新しい|atarashii|new / 学期|gakki|term / が|ga|(subject) / 始まりました|hajimarimashita|began / 。 = A new term began.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 教科書|kyoukasho|textbook / を|o|(object) / 買いました|kaimashita|bought / 。 = Yui bought a textbook.",
  "雨|ame|rain / が|ga|(subject) / 降った|futta|fell / ので|node|because / 電車|densha|train / が|ga|(subject) / 遅れました|okuremashita|was late / 。 = Because it rained, the train was late.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 遅刻|chikoku|being late / しました|shimashita|did / 。 = Yui was late.",
  "田中|Tanaka|Tanaka (name) / 先生|sensei|teacher / ： / 生徒|seito|pupils / は|wa|(topic) / みんな|minna|everyone / 出席|shusseki|attendance / して|shite|do / います|imasu|are / 。 / けん|Ken|Ken (name) / だけ|dake|only / 欠席|kesseki|absent / です|desu|is / 。 = Tanaka-sensei: All the pupils are present. Only Ken is absent.",
  "けん|Ken|Ken (name) / は|wa|(topic) / 熱|netsu|fever / が|ga|(subject) / ある|aru|have / ので|node|because / 欠席|kesseki|absent / です|desu|is / 。 = Ken is absent because he has a fever.",
  "田中|Tanaka|Tanaka (name) / 先生|sensei|teacher / ： / ゆい|Yui|Yui (name) / は|wa|(topic) / 成績|seiseki|grades / が|ga|(subject) / いい|ii|good / です|desu|are / 。 = Tanaka-sensei: Yui’s grades are good."
 ],"q":[[2,"Why was the train late?",["It rained","Ken had a fever","The door was closed"],0,"Line 3: 雨が降ったので電車が遅れました means “because it rained, the train was late”."],[5,"Why is Ken absent?",["He has a fever","He is late","He is at the bank"],0,"Line 6: 熱があるので欠席です means “he is absent because he has a fever”."]]},
 {"t":"Before the exam","l":[
  "今日|kyou|today / ゆい|Yui|Yui (name) / は|wa|(topic) / 練習|renshuu|practice / の|no|of / 試験|shiken|exam / を|o|(object) / しました|shimashita|did / 。 = Today Yui took a practice exam.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 毎日|mainichi|every day / 予習|yoshuu|preparation / と|to|and / 復習|fukushuu|review / を|o|(object) / します|shimasu|does / 。 = Yui does preparation and review every day.",
  "ゆい|Yui|Yui (name) / ： / 頑張った|ganbatta|did my best / のに|noni|although / 問題|mondai|questions / を|o|(object) / 間違えました|machigaemashita|got wrong / 。 = Yui: Although I did my best, I got some questions wrong.",
  "田中|Tanaka|Tanaka (name) / 先生|sensei|teacher / ： / 点数|tensuu|score / は|wa|(topic) / 悪くない|warukunai|not bad / です|desu|is / 。 / 諦めないで|akiramenaide|do not give up / ください|kudasai|please / 。 = Tanaka-sensei: Your score is not bad. Please do not give up.",
  "ゆい|Yui|Yui (name) / ： / 努力|doryoku|effort / します|shimasu|will do / 。 = Yui: I will make an effort.",
  "けん|Ken|Ken (name) / ： / 失敗|shippai|failure / は|wa|(topic) / 大丈夫|daijoubu|all right / だ|da|is / よ|yo|(friendly ending) / 。 / もう一度|mou ichido|once more / 頑張ろう|ganbarou|let’s do our best / 。 = Ken: A failure is all right. Let’s do our best once more.",
  "来月|raigetsu|next month / ゆい|Yui|Yui (name) / は|wa|(topic) / 受験|juken|entrance exam / します|shimasu|will take / 。 = Next month Yui will take the entrance exam."
 ],"q":[[2,"What did Yui get wrong?",["Questions","Her address","Her name"],0,"Line 3: 問題を間違えました means “got the questions wrong”."],[3,"What does Tanaka-sensei say?",["Do not give up","Go home","Buy a dictionary"],0,"Line 4: 諦めないでください means “please do not give up”."]]}
];
const JA_P5B=[
 ["Grammar, words and homework",
  [["文法","ぶんぽう","bunpou","grammar","日本語の文法は難しいです。","Nihongo no bunpou wa muzukashii desu.","Japanese grammar is difficult.","日本語|nihongo|Japanese / の|no|(of) / 文法|bunpou|grammar / は|wa|(topic) / 難しい|muzukashii|difficult / です|desu|is / 。 = Japanese grammar is difficult."],
  ["単語","たんご","tango","word, vocabulary item","単語を毎日覚えます。","Tango o mainichi oboemasu.","I memorise words every day.","単語|tango|words / を|o|(object) / 毎日|mainichi|every day / 覚えます|oboemasu|to memorise (polite) / 。 = I memorise words every day."],
  ["発音","はつおん","hatsuon","pronunciation","先生は発音がいいです。","Sensei wa hatsuon ga ii desu.","The teacher’s pronunciation is good.","先生|sensei|teacher / は|wa|(topic) / 発音|hatsuon|pronunciation / が|ga|(subject) / いい|ii|good / です|desu|is / 。 = The teacher’s pronunciation is good."],
  ["作文","さくぶん","sakubun","composition, short essay","作文を書きます。","Sakubun o kakimasu.","I write a composition.","作文|sakubun|composition / を|o|(object) / 書きます|kakimasu|to write (polite) / 。 = I write a composition."],
  ["計算","けいさん","keisan","calculation","計算が速いです。","Keisan ga hayai desu.","I am fast at calculation.","計算|keisan|calculation / が|ga|(subject) / 速い|hayai|fast / です|desu|is / 。 = I am fast at calculation."],
  ["暗記","あんき","anki","memorising","漢字を暗記します。","Kanji o anki shimasu.","I memorise kanji.","漢字|kanji|kanji / を|o|(object) / 暗記|anki|memorising / します|shimasu|to do (polite) / 。 = I memorise kanji."],
  ["課題","かだい","kadai","assignment, task","課題が多いです。","Kadai ga ooi desu.","There are many assignments.","課題|kadai|assignments / が|ga|(subject) / 多い|ooi|many / です|desu|is / 。 = There are many assignments."],
  ["提出","ていしゅつ","teishutsu","handing in","宿題を提出します。","Shukudai o teishutsu shimasu.","I hand in my homework.","宿題|shukudai|homework / を|o|(object) / 提出|teishutsu|handing in / します|shimasu|to do (polite) / 。 = I hand in my homework."],
  ["発表","はっぴょう","happyou","presentation, announcement","教室で発表します。","Kyoushitsu de happyou shimasu.","I give a presentation in the classroom.","教室|kyoushitsu|classroom / で|de|(in) / 発表|happyou|presentation / します|shimasu|to do (polite) / 。 = I give a presentation in the classroom."],
  ["資料","しりょう","shiryou","materials, documents for reference","資料を読みます。","Shiryou o yomimasu.","I read the materials.","資料|shiryou|materials / を|o|(object) / 読みます|yomimasu|to read (polite) / 。 = I read the materials."]],
  [
   "文法|bunpou|grammar / が|ga|(subject) / 難しくても|muzukashikute mo|even if difficult / 勉強|benkyou|study / します|shimasu|do / 。 = Even if grammar is difficult, I study.",
   "単語|tango|words / を|o|(object) / 忘れても|wasurete mo|even if (I) forget / もう一度|mou ichido|once more / 覚えます|oboemasu|remember / 。 = Even if I forget words, I remember them once more.",
   "発音|hatsuon|pronunciation / が|ga|(subject) / 下手|heta|bad / でも|demo|even if it is / 話します|hanashimasu|speak / 。 = Even if my pronunciation is bad, I speak.",
   "作文|sakubun|composition / は|wa|(topic) / 短くても|mijikakute mo|even if short / いい|ii|good / です|desu|is / 。 = It is all right even if the composition is short.",
   "課題|kadai|assignments / が|ga|(subject) / 多くても|ookute mo|even if many / 今日|kyou|today / 提出|teishutsu|handing in / します|shimasu|do / 。 = Even if there are many assignments, I hand them in today.",
   "発表|happyou|presentation / の|no|of / 資料|shiryou|materials / を|o|(object) / 見ても|mite mo|may (you) look / いい|ii|all right / です|desu|is / 。 = You may look at the materials for the presentation."
  ]],
 ["Working in an office",
  [["会議","かいぎ","kaigi","meeting","午後は会議があります。","Gogo wa kaigi ga arimasu.","I have a meeting in the afternoon.","午後|gogo|afternoon / は|wa|(topic) / 会議|kaigi|meeting / が|ga|(subject) / あります|arimasu|there is (polite) / 。 = I have a meeting in the afternoon."],
  ["社長","しゃちょう","shachou","company president","社長は忙しいです。","Shachou wa isogashii desu.","The company president is busy.","社長|shachou|company president / は|wa|(topic) / 忙しい|isogashii|busy / です|desu|is / 。 = The company president is busy."],
  ["部長","ぶちょう","buchou","department head","部長は厳しいです。","Buchou wa kibishii desu.","The department head is strict.","部長|buchou|department head / は|wa|(topic) / 厳しい|kibishii|strict / です|desu|is / 。 = The department head is strict."],
  ["同僚","どうりょう","douryou","colleague","同僚と昼ご飯を食べます。","Douryou to hirugohan o tabemasu.","I eat lunch with a colleague.","同僚|douryou|colleague / と|to|(with) / 昼ご飯|hirugohan|lunch / を|o|(object) / 食べます|tabemasu|to eat (polite) / 。 = I eat lunch with a colleague."],
  ["書類","しょるい","shorui","documents, papers","書類を出します。","Shorui o dashimasu.","I hand in the documents.","書類|shorui|documents / を|o|(object) / 出します|dashimasu|to hand in (polite) / 。 = I hand in the documents."],
  ["残業","ざんぎょう","zangyou","overtime work","今日は残業します。","Kyou wa zangyou shimasu.","I work overtime today.","今日|kyou|today / は|wa|(topic) / 残業|zangyou|overtime work / します|shimasu|to do (polite) / 。 = I work overtime today."],
  ["昼休み","ひるやすみ","hiruyasumi","lunch break","昼休みに散歩します。","Hiruyasumi ni sanpo shimasu.","I take a walk during the lunch break.","昼休み|hiruyasumi|lunch break / に|ni|(during) / 散歩|sanpo|walk / します|shimasu|to do (polite) / 。 = I take a walk during the lunch break."],
  ["打ち合わせ","うちあわせ","uchiawase","short meeting, briefing","十時から打ち合わせがあります。","Juuji kara uchiawase ga arimasu.","I have a briefing from ten o’clock.","十時|juuji|ten o’clock / から|kara|(from) / 打ち合わせ|uchiawase|briefing / が|ga|(subject) / あります|arimasu|there is (polite) / 。 = I have a briefing from ten o’clock."],
  ["コピー","コピー","kopii","copy, to photocopy","資料をコピーします。","Shiryou o kopii shimasu.","I copy the materials.","資料|shiryou|materials / を|o|(object) / コピー|kopii|copy / します|shimasu|to do (polite) / 。 = I copy the materials."],
  ["上司","じょうし","joushi","boss, superior","上司に相談します。","Joushi ni soudan shimasu.","I consult my boss.","上司|joushi|boss / に|ni|(with) / 相談|soudan|consultation / します|shimasu|to do (polite) / 。 = I consult my boss."]],
  [
   "会議|kaigi|meeting / の|no|of / とき|toki|time / 携帯|keitai|mobile phone / を|o|(object) / 消します|keshimasu|turn off / 。 = I turn off my phone during a meeting.",
   "社長|shachou|company president / が|ga|(subject) / 来る|kuru|come / とき|toki|when / みんな|minna|everyone / 立ちます|tachimasu|stand / 。 = When the company president comes, everyone stands.",
   "部長|buchou|department head / と|to|with / 話す|hanasu|talk / とき|toki|when / ゆっくり|yukkuri|slowly / 話します|hanashimasu|speak / 。 = When I talk with the department head, I speak slowly.",
   "同僚|douryou|colleague / と|to|with / 昼休み|hiruyasumi|lunch break / に|ni|in / 昼ご飯|hirugohan|lunch / を|o|(object) / 食べます|tabemasu|eat / 。 = I eat lunch with a colleague during the lunch break.",
   "残業|zangyou|overtime / が|ga|(subject) / 多い|ooi|many / とき|toki|when / 疲れました|tsukaremashita|was tired / 。 = When I had a lot of overtime, I was tired.",
   "コピー|kopii|copies / が|ga|(subject) / 多い|ooi|many / とき|toki|when / 上司|joushi|boss / に|ni|to / 頼みます|tanomimasu|ask / 。 = When there are many copies, I ask my boss."
  ]],
 ["Plans and deadlines",
  [["締め切り","しめきり","shimekiri","deadline","締め切りは金曜日です。","Shimekiri wa kin’youbi desu.","The deadline is Friday.","締め切り|shimekiri|deadline / は|wa|(topic) / 金曜日|kin’youbi|Friday / です|desu|is / 。 = The deadline is Friday."],
  ["期限","きげん","kigen","time limit, expiry date","期限は来週です。","Kigen wa raishuu desu.","The time limit is next week.","期限|kigen|time limit / は|wa|(topic) / 来週|raishuu|next week / です|desu|is / 。 = The time limit is next week."],
  ["間に合う","まにあう","maniau","to be in time","終電に間に合いました。","Shuuden ni maniaimashita.","I was in time for the last train.","終電|shuuden|last train / に|ni|(for) / 間に合いました|maniaimashita|was in time / 。 = I was in time for the last train."],
  ["準備","じゅんび","junbi","preparation","授業の準備をします。","Jugyou no junbi o shimasu.","I prepare for class.","授業|jugyou|class / の|no|(for) / 準備|junbi|preparation / を|o|(object) / します|shimasu|to do (polite) / 。 = I prepare for class."],
  ["計画","けいかく","keikaku","plan (a detailed one)","計画を作ります。","Keikaku o tsukurimasu.","I make a plan.","計画|keikaku|plan / を|o|(object) / 作ります|tsukurimasu|to make (polite) / 。 = I make a plan."],
  ["延期","えんき","enki","postponement","会議は来週に延期しました。","Kaigi wa raishuu ni enki shimashita.","The meeting was postponed to next week.","会議|kaigi|meeting / は|wa|(topic) / 来週|raishuu|next week / に|ni|(to) / 延期|enki|postponement / しました|shimashita|did / 。 = The meeting was postponed to next week."],
  ["変更","へんこう","henkou","change (of a plan)","予定を変更します。","Yotei o henkou shimasu.","I change the plan.","予定|yotei|plan / を|o|(object) / 変更|henkou|change / します|shimasu|to do (polite) / 。 = I change the plan."],
  ["確認","かくにん","kakunin","checking, confirmation","時間を確認します。","Jikan o kakunin shimasu.","I confirm the time.","時間|jikan|time / を|o|(object) / 確認|kakunin|confirmation / します|shimasu|to do (polite) / 。 = I confirm the time."],
  ["報告","ほうこく","houkoku","report, to report","先生に報告します。","Sensei ni houkoku shimasu.","I report to the teacher.","先生|sensei|teacher / に|ni|(to) / 報告|houkoku|report / します|shimasu|to do (polite) / 。 = I report to the teacher."],
  ["日程","にってい","nittei","schedule (of days)","日程を決めます。","Nittei o kimemasu.","I decide the schedule.","日程|nittei|schedule / を|o|(object) / 決めます|kimemasu|to decide (polite) / 。 = I decide the schedule."]],
  [
   "締め切り|shimekiri|deadline / は|wa|(topic) / 金曜日|kin’youbi|Friday / です|desu|is / 。 = The deadline is Friday.",
   "報告|houkoku|report / を|o|(object) / 金曜日|kin’youbi|Friday / までに|made ni|by / 出します|dashimasu|hand in / 。 = I hand in the report by Friday.",
   "三|san|three / 時|ji|o’clock / までに|made ni|by / 準備|junbi|preparation / が|ga|(subject) / 終わります|owarimasu|finishes / 。 = The preparation finishes by three o’clock.",
   "会議|kaigi|meeting / は|wa|(topic) / 来週|raishuu|next week / に|ni|to / 延期|enki|postponement / します|shimasu|do / 。 = The meeting is postponed to next week.",
   "時間|jikan|time / を|o|(object) / 確認|kakunin|confirmation / して|shite|do / ください|kudasai|please / 。 = Please confirm the time.",
   "来月|raigetsu|next month / までに|made ni|by / 計画|keikaku|plan / を|o|(object) / 作ります|tsukurimasu|make / 。 = I make the plan by next month."
  ]],
 ["Habits and daily troubles",
  [["習慣","しゅうかん","shuukan","habit, custom","朝、散歩する習慣があります。","Asa, sanpo suru shuukan ga arimasu.","I have a habit of taking a walk in the morning.","朝|asa|morning / 、 / 散歩|sanpo|walk / する|suru|to do / 習慣|shuukan|habit / が|ga|(subject) / あります|arimasu|there is / 。 = I have a habit of taking a walk in the morning."],
  ["早起き","はやおき","hayaoki","getting up early","早起きは気持ちいいです。","Hayaoki wa kimochi ii desu.","Getting up early feels good.","早起き|hayaoki|getting up early / は|wa|(topic) / 気持ちいい|kimochi ii|feels good / です|desu|is / 。 = Getting up early feels good."],
  ["夜更かし","よふかし","yofukashi","staying up late","夜更かしは体に悪いです。","Yofukashi wa karada ni warui desu.","Staying up late is bad for the body.","夜更かし|yofukashi|staying up late / は|wa|(topic) / 体|karada|body / に|ni|(for) / 悪い|warui|bad / です|desu|is / 。 = Staying up late is bad for the body."],
  ["寝坊","ねぼう","nebou","oversleeping","今朝、寝坊しました。","Kesa, nebou shimashita.","I overslept this morning.","今朝|kesa|this morning / 、 / 寝坊|nebou|oversleeping / しました|shimashita|did / 。 = I overslept this morning."],
  ["我慢","がまん","gaman","to put up with (pain, annoyance)","痛いですが、我慢します。","Itai desu ga, gaman shimasu.","It hurts, but I put up with it.","痛い|itai|painful / です|desu|is / が|ga|but / 、 / 我慢|gaman|putting up with / します|shimasu|do / 。 = It hurts, but I put up with it."],
  ["無理","むり","muri","impossible, too much","それは無理です。","Sore wa muri desu.","That is impossible.","それ|sore|that / は|wa|(topic) / 無理|muri|impossible / です|desu|is / 。 = That is impossible."],
  ["慣れる","なれる","nareru","to get used to","新しい仕事に慣れました。","Atarashii shigoto ni naremashita.","I got used to the new job.","新しい|atarashii|new / 仕事|shigoto|job / に|ni|(to) / 慣れました|naremashita|got used to / 。 = I got used to the new job."],
  ["癖","くせ","kuse","habit (often a small, unconscious one)","それは私の癖です。","Sore wa watashi no kuse desu.","That is my habit.","それ|sore|that / は|wa|(topic) / 私|watashi|I / の|no|(of) / 癖|kuse|habit / です|desu|is / 。 = That is my habit."],
  ["悩む","なやむ","nayamu","to worry, to be troubled","仕事のことで悩んでいます。","Shigoto no koto de nayande imasu.","I am worried about my work.","仕事|shigoto|work / の|no|(of) / こと|koto|matter / で|de|(about) / 悩んでいます|nayande imasu|am worried / 。 = I am worried about my work."],
  ["寝不足","ねぶそく","nebusoku","lack of sleep","寝不足で眠いです。","Nebusoku de nemui desu.","I am sleepy because I did not sleep enough.","寝不足|nebusoku|lack of sleep / で|de|(because of) / 眠い|nemui|sleepy / です|desu|is / 。 = I am sleepy because I did not sleep enough."]],
  [
   "早起き|hayaoki|getting up early / は|wa|(topic) / 気持ちいい|kimochi ii|pleasant / し|shi|and / 体|karada|body / に|ni|for / いい|ii|good / です|desu|is / 。 = Getting up early is pleasant, and it is good for the body.",
   "夜更かし|yofukashi|staying up late / は|wa|(topic) / 体|karada|body / に|ni|for / 悪い|warui|bad / し|shi|and / 眠く|nemuku|sleepy / なります|narimasu|become / 。 = Staying up late is bad for the body, and I become sleepy.",
   "寝坊|nebou|oversleeping / する|suru|do / し|shi|and / 電車|densha|train / も|mo|also / 遅れる|okureru|is late / し|shi|and / 困ります|komarimasu|have a problem / 。 = I oversleep, and the train is late too, so I have a problem.",
   "毎朝|maiasa|every morning / 散歩|sanpo|walk / する|suru|do / 習慣|shuukan|habit / が|ga|(subject) / あります|arimasu|have / 。 = I have a habit of taking a walk every morning.",
   "仕事|shigoto|work / に|ni|to / 慣れた|nareta|got used to / し|shi|and / 同僚|douryou|colleague / も|mo|also / 親切|shinsetsu|kind / です|desu|is / 。 = I got used to the work, and my colleagues are kind too.",
   "仕事|shigoto|work / の|no|of / こと|koto|matter / で|de|about / 悩んで|nayande|worrying / います|imasu|am / 。 = I am worried about my work."
  ]],
 ["Part-time jobs and interviews",
  [["アルバイト","アルバイト","arubaito","part-time job","週末、アルバイトをします。","Shuumatsu, arubaito o shimasu.","I do a part-time job on weekends.","週末|shuumatsu|weekend / 、 / アルバイト|arubaito|part-time job / を|o|(object) / します|shimasu|do / 。 = I do a part-time job on weekends."],
  ["面接","めんせつ","mensetsu","interview","明日、面接があります。","Ashita, mensetsu ga arimasu.","I have an interview tomorrow.","明日|ashita|tomorrow / 、 / 面接|mensetsu|interview / が|ga|(subject) / あります|arimasu|there is / 。 = I have an interview tomorrow."],
  ["履歴書","りれきしょ","rirekisho","résumé, CV","履歴書を書きます。","Rirekisho o kakimasu.","I write a résumé.","履歴書|rirekisho|résumé / を|o|(object) / 書きます|kakimasu|write / 。 = I write a résumé."],
  ["経験","けいけん","keiken","experience","経験がありません。","Keiken ga arimasen.","I have no experience.","経験|keiken|experience / が|ga|(subject) / ありません|arimasen|there is not / 。 = I have no experience."],
  ["募集","ぼしゅう","boshuu","recruiting, call for applicants","店員を募集しています。","Ten’in o boshuu shite imasu.","We are recruiting shop clerks.","店員|ten’in|shop clerk / を|o|(object) / 募集|boshuu|recruiting / して|shite|doing / います|imasu|am (doing) / 。 = We are recruiting shop clerks."],
  ["資格","しかく","shikaku","qualification, licence","資格を取りました。","Shikaku o torimashita.","I got a qualification.","資格|shikaku|qualification / を|o|(object) / 取りました|torimashita|got / 。 = I got a qualification."],
  ["休日","きゅうじつ","kyuujitsu","day off, holiday","休日は日曜日です。","Kyuujitsu wa nichiyoubi desu.","My day off is Sunday.","休日|kyuujitsu|day off / は|wa|(topic) / 日曜日|nichiyoubi|Sunday / です|desu|is / 。 = My day off is Sunday."],
  ["勤める","つとめる","tsutomeru","to work for (a company)","銀行に勤めています。","Ginkou ni tsutomete imasu.","I work at a bank.","銀行|ginkou|bank / に|ni|(at) / 勤めて|tsutomete|work for / います|imasu|am (doing) / 。 = I work at a bank."],
  ["通勤","つうきん","tsuukin","commuting to work","通勤は電車です。","Tsuukin wa densha desu.","I commute by train.","通勤|tsuukin|commuting / は|wa|(topic) / 電車|densha|train / です|desu|is / 。 = I commute by train."],
  ["担当","たんとう","tantou","being in charge","受付の担当です。","Uketsuke no tantou desu.","I am in charge of the reception desk.","受付|uketsuke|reception desk / の|no|(of) / 担当|tantou|being in charge / です|desu|am / 。 = I am in charge of the reception desk."]],
  [
   "アルバイト|arubaito|part-time job / なら|nara|if you mean / この|kono|this / 店|mise|shop / が|ga|(subject) / いい|ii|good / です|desu|is / 。 = If you mean a part-time job, this shop is good.",
   "面接|mensetsu|interview / なら|nara|if it is / 明日|ashita|tomorrow / 午前|gozen|morning / に|ni|in / 来て|kite|come / ください|kudasai|please / 。 = If it is the interview, please come tomorrow morning.",
   "履歴書|rirekisho|résumé / なら|nara|if you mean / 事務所|jimusho|office / に|ni|in / あります|arimasu|there is / 。 = If you mean the résumé form, it is in the office.",
   "経験|keiken|experience / が|ga|(subject) / 少ない|sukunai|little / なら|nara|if / 練習|renshuu|practice / しましょう|shimashou|let’s do / 。 = If you have little experience, let’s practise.",
   "募集|boshuu|recruiting / を|o|(object) / 見る|miru|see / なら|nara|if / 新聞|shinbun|newspaper / が|ga|(subject) / いい|ii|good / です|desu|is / 。 = If you want to see job ads, a newspaper is good.",
   "通勤|tsuukin|commuting / が|ga|(subject) / 長い|nagai|long / なら|nara|if / 本|hon|book / を|o|(object) / 読んで|yonde|read / ください|kudasai|please / 。 = If your commute is long, please read a book."
  ]]
];
const GR_P5B=[
 ["Even if with ても","Verb て-form + も; い-adjective く + ても; noun + でも","ても (temo) means “even if” or “even though”. For verbs, use the て-form and add も: 飲んでも means “even if I drink”. For い-adjectives, change い to くて and add も: 高くても means “even if it is expensive”. For nouns and な-adjectives, use でも: 雨でも means “even if it rains”. The result happens in both cases.",[["雨","ame","rain"],["でも","demo","even if it is"],["学校","gakkou","school"],["に","ni","to"],["行きます","ikimasu","go"],["。","",""]],"Even if it rains, I go to school."],
 ["When with とき","Plain form + とき, sentence","とき (toki) means “when” or “at the time of”. Put a plain form before it: 行くとき, 行ったとき. With a dictionary form, the action has not finished yet. With a た-form, the action has finished. For nouns use の: 学生のとき means “when I was a student”. For な-adjectives use な: 暇なとき means “when I am free”.",[["会社","kaisha","company"],["に","ni","to"],["行く","iku","go"],["とき","toki","when"],["電車","densha","train"],["に","ni","(by)"],["乗ります","norimasu","ride"],["。","",""]],"When I go to the company, I ride the train."],
 ["Deadline with までに","Time + までに, action","までに (made ni) shows a deadline: the action must be done at that time or before it. まで (made) means “until” and the action continues until then. までに means “by” and the action happens once, at any time before then. 五時までに帰ります means “I will go home by five o’clock”. 五時まで働きます means “I work until five o’clock”.",[["金曜日","kin’youbi","Friday"],["までに","made ni","by"],["宿題","shukudai","homework"],["を","o","(object)"],["出します","dashimasu","hand in"],["。","",""]],"I hand in the homework by Friday."],
 ["Listing reasons with し","Plain form + し、plain form + し","し (shi) after a plain form lists reasons or facts. It means “and also”, and the speaker gives more than one reason. Put a plain form before each し and finish with the result: 安いし、おいしいし、よく行きます means “It is cheap and tasty, so I often go”. Do not use it for only one reason; use から or ので then.",[["熱","netsu","fever"],["も","mo","also"],["ある","aru","have"],["し","shi","and"],["、","",""],["喉","nodo","throat"],["も","mo","also"],["痛い","itai","painful"],["し","shi","and"],["、","",""],["休みます","yasumimasu","rest"],["。","",""]],"I have a fever, my throat also hurts, and so I rest."],
 ["Conditions with なら","Topic + なら, suggestion","なら (nara) takes a topic that the other person has just said or that is known, and then gives advice, a suggestion or an opinion about it. 病院なら、駅の前にあります means “If you mean a hospital, there is one in front of the station”. It can follow a noun or a plain form: 行くなら, 安いなら. The result is often a suggestion, an invitation or a request. It is different from たら because なら uses what the other person said.",[["病院","byouin","hospital"],["なら","nara","if you mean"],["駅","eki","station"],["の","no","of"],["前","mae","front"],["に","ni","at"],["あります","arimasu","there is"],["。","",""]],"If you mean a hospital, there is one in front of the station."]
];
const STORY_P5B=[
 {"t":"Homework and a presentation","l":[
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 課題|kadai|assignments / が|ga|(subject) / 多い|ooi|many / です|desu|are / 。 = Yui has many assignments.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 作文|sakubun|composition / を|o|(object) / 書きます|kakimasu|writes / 。 / 文法|bunpou|grammar / は|wa|(topic) / 難しい|muzukashii|difficult / です|desu|is / 。 = Yui writes a composition. Grammar is difficult.",
  "ゆい|Yui|Yui (name) / ： / 難しくても|muzukashikute mo|even if difficult / 勉強|benkyou|study / する|suru|do / 。 = Yui: Even if it is difficult, I will study.",
  "けん|Ken|Ken (name) / ： / 単語|tango|words / を|o|(object) / 暗記|anki|memorising / する|suru|do / よ|yo|(friendly ending) / 。 / 忘れても|wasurete mo|even if (I) forget / もう一度|mou ichido|once more / 覚える|oboeru|remember / 。 = Ken: I memorise words. Even if I forget, I remember them once more.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 教室|kyoushitsu|classroom / で|de|in / 発表|happyou|presentation / します|shimasu|gives / 。 / 資料|shiryou|materials / を|o|(object) / 見ても|mite mo|(she) may look / いい|ii|all right / です|desu|is / 。 = Yui gives a presentation in the classroom. She may look at the materials.",
  "田中|Tanaka|Tanaka (name) / 先生|sensei|teacher / ： / 発音|hatsuon|pronunciation / が|ga|(subject) / いい|ii|good / です|desu|is / 。 = Tanaka-sensei: Your pronunciation is good.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 金曜日|kin’youbi|Friday / に|ni|on / 宿題|shukudai|homework / を|o|(object) / 提出|teishutsu|handing in / します|shimasu|does / 。 = Yui hands in her homework on Friday."
 ],"q":[[2,"What will Yui do even if it is difficult?",["Study","Sleep","Go home"],0,"Line 3: 難しくても勉強する means “even if it is difficult, I will study”."],[4,"What may Yui look at in the presentation?",["The materials","A dictionary","A map"],0,"Line 5: 資料を見てもいいです means “she may look at the materials”."]]},
 {"t":"At Satou-san’s company","l":[
  "さとうさん|Satou san|Satou-san / は|wa|(topic) / 会社|kaisha|company / で|de|at / 働きます|hatarakimasu|works / 。 = Satou-san works at a company.",
  "さとうさん|Satou san|Satou-san / の|no|of / 上司|joushi|boss / は|wa|(topic) / 部長|buchou|department head / です|desu|is / 。 = Satou-san’s boss is the department head.",
  "今日|kyou|today / 会議|kaigi|meeting / が|ga|(subject) / あります|arimasu|there is / 。 = There is a meeting today.",
  "社長|shachou|company president / が|ga|(subject) / 来る|kuru|come / とき|toki|when / みんな|minna|everyone / 立ちます|tachimasu|stand / 。 = When the company president comes, everyone stands.",
  "昼休み|hiruyasumi|lunch break / に|ni|in / さとうさん|Satou san|Satou-san / は|wa|(topic) / 同僚|douryou|colleague / と|to|with / 昼ご飯|hirugohan|lunch / を|o|(object) / 食べます|tabemasu|eats / 。 = Satou-san eats lunch with a colleague during the lunch break.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / さとうさん|Satou san|Satou-san / の|no|of / 書類|shorui|documents / を|o|(object) / コピー|kopii|copy / しました|shimashita|did / 。 = Yui copied Satou-san’s documents.",
  "さとうさん|Satou san|Satou-san / ： / 今日|kyou|today / は|wa|(topic) / 残業|zangyou|overtime / です|desu|is / 。 / 打ち合わせ|uchiawase|briefings / が|ga|(subject) / 多い|ooi|many / です|desu|are / 。 = Satou-san: Today I work overtime. There are many briefings."
 ],"q":[[1,"Who is Satou-san’s boss?",["The department head","The company president","Ken"],0,"Line 2: 上司は部長です means “the boss is the department head”."],[5,"What did Yui copy?",["Documents","A map","A letter"],0,"Line 6: 書類をコピーしました means “copied the documents”."]]},
 {"t":"The deadline","l":[
  "田中|Tanaka|Tanaka (name) / 先生|sensei|teacher / ： / 報告|houkoku|report / の|no|of / 締め切り|shimekiri|deadline / は|wa|(topic) / 金曜日|kin’youbi|Friday / です|desu|is / 。 = Tanaka-sensei: The deadline for the report is Friday.",
  "ゆい|Yui|Yui (name) / ： / 金曜日|kin’youbi|Friday / までに|made ni|by / 出します|dashimasu|will hand in / 。 = Yui: I will hand it in by Friday.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 毎日|mainichi|every day / 準備|junbi|preparation / を|o|(object) / します|shimasu|does / 。 / 計画|keikaku|plan / を|o|(object) / 作ります|tsukurimasu|makes / 。 = Yui prepares every day. She makes a plan.",
  "けん|Ken|Ken (name) / ： / 間に合う|maniau|be in time / ？ = Ken: Will you be in time?",
  "ゆい|Yui|Yui (name) / ： / 日程|nittei|schedule / を|o|(object) / 確認|kakunin|confirmation / した|shita|did / よ|yo|(friendly ending) / 。 / 期限|kigen|time limit / は|wa|(topic) / 金曜日|kin’youbi|Friday / 。 = Yui: I checked the schedule. The time limit is Friday.",
  "田中|Tanaka|Tanaka (name) / 先生|sensei|teacher / ： / 予定|yotei|plan / を|o|(object) / 変更|henkou|change / しました|shimashita|did / 。 / 締め切り|shimekiri|deadline / は|wa|(topic) / 来週|raishuu|next week / に|ni|to / 延期|enki|postponement / しました|shimashita|did / 。 = Tanaka-sensei: I changed the plan. The deadline is postponed to next week.",
  "ゆい|Yui|Yui (name) / ： / 来週|raishuu|next week / の|no|of / 月曜日|getsuyoubi|Monday / までに|made ni|by / 報告|houkoku|report / を|o|(object) / 出します|dashimasu|will hand in / 。 = Yui: I will hand in the report by Monday next week."
 ],"q":[[0,"When is the deadline at first?",["Friday","Monday","Sunday"],0,"Line 1: 締め切りは金曜日です means “the deadline is Friday”."],[5,"What did Tanaka-sensei postpone?",["The deadline","The class","The lunch"],0,"Line 6: 締め切りは来週に延期しました means “the deadline was postponed to next week”."]]},
 {"t":"Yui’s habits","l":[
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 夜更かし|yofukashi|staying up late / を|o|(object) / します|shimasu|does / 。 = Yui stays up late.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 寝不足|nebusoku|lack of sleep / です|desu|is / 。 / 今朝|kesa|this morning / も|mo|also / 寝坊|nebou|oversleeping / しました|shimashita|did / 。 = Yui does not sleep enough. She overslept this morning too.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 悩んで|nayande|worrying / います|imasu|is / 。 = Yui is worried.",
  "けん|Ken|Ken (name) / ： / 早起き|hayaoki|getting up early / は|wa|(topic) / 気持ちいい|kimochi ii|pleasant / し|shi|and / 元気|genki|healthy / に|ni|(become) / なる|naru|become / よ|yo|(friendly ending) / 。 = Ken: Getting up early is pleasant, and you become energetic.",
  "ゆい|Yui|Yui (name) / ： / 早起き|hayaoki|getting up early / は|wa|(topic) / 無理|muri|impossible / だ|da|is / よ|yo|(friendly ending) / 。 = Yui: Getting up early is impossible for me.",
  "けん|Ken|Ken (name) / ： / 習慣|shuukan|habit / に|ni|(become) / なる|naru|become / よ|yo|(friendly ending) / 。 / 慣れる|nareru|get used to / と|to|if / 大丈夫|daijoubu|all right / 。 = Ken: It becomes a habit. When you get used to it, it is fine.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 我慢|gaman|patience / して|shite|do / 早く|hayaku|early / 寝ます|nemasu|goes to bed / 。 = Yui puts up with it and goes to bed early."
 ],"q":[[1,"What did Yui do this morning too?",["She overslept","She went shopping","She cleaned the room"],0,"Line 2: 今朝も寝坊しました means “overslept this morning too”."],[5,"What does Ken say becomes a habit?",["Getting up early","Eating fruit","Writing letters"],0,"Line 6: 習慣になるよ means “it becomes a habit”; line 4 and line 5 are about getting up early."]]},
 {"t":"A job at the bookstore","l":[
  "ゆい|Yui|Yui (name) / は|wa|(topic) / アルバイト|arubaito|part-time job / が|ga|(subject) / したい|shitai|want to do / です|desu|is / 。 = Yui wants a part-time job.",
  "けん|Ken|Ken (name) / ： / 本屋|hon’ya|bookstore / が|ga|(subject) / 店員|ten’in|shop clerks / を|o|(object) / 募集してる|boshuu shiteru|is recruiting / よ|yo|(friendly ending) / 。 = Ken: The bookstore is recruiting shop clerks.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 履歴書|rirekisho|résumé / を|o|(object) / 書きます|kakimasu|writes / 。 / 経験|keiken|experience / は|wa|(topic) / ありません|arimasen|there is none / 。 = Yui writes a résumé. She has no experience.",
  "山田さん|Yamada san|Yamada-san / ： / 面接|mensetsu|interview / なら|nara|if it is / 練習|renshuu|practice / しましょう|shimashou|let’s do / 。 = Yamada-san: If it is the interview, let’s practise.",
  "面接|mensetsu|interview / は|wa|(topic) / 午前|gozen|morning / に|ni|in / 終わりました|owarimashita|finished / 。 / ゆい|Yui|Yui (name) / は|wa|(topic) / 本屋|hon’ya|bookstore / で|de|at / 働きます|hatarakimasu|will work / 。 = The interview finished in the morning. Yui will work at the bookstore.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 土曜日|doyoubi|Saturday / に|ni|on / 働きます|hatarakimasu|works / 。 / 休日|kyuujitsu|day off / は|wa|(topic) / 日曜日|nichiyoubi|Sunday / です|desu|is / 。 = Yui works on Saturday. Her day off is Sunday.",
  "通勤|tsuukin|commuting / は|wa|(topic) / 自転車|jitensha|bicycle / です|desu|is / 。 = Yui commutes by bicycle."
 ],"q":[[1,"What is the bookstore doing?",["Recruiting shop clerks","Closing","Selling bicycles"],0,"Line 2: 店員を募集してる means “is recruiting shop clerks”."],[3,"What does Yamada-san offer to do?",["Practise the interview","Buy a book","Make dinner"],0,"Line 4: 面接なら練習しましょう means “if it is the interview, let’s practise”."]]}
];
const JA_P5C=[
 ["Nerves and stress",
  [["緊張","きんちょう","kinchou","nervousness, tension","試験の前は緊張します。","Shiken no mae wa kinchou shimasu.","I get nervous before an exam.","試験|shiken|exam / の|no|(of) / 前|mae|before / は|wa|(topic) / 緊張|kinchou|nervousness / します|shimasu|do / 。 = I get nervous before an exam."],
  ["不安","ふあん","fuan","anxiety, uneasy","少し不安です。","Sukoshi fuan desu.","I feel a little uneasy.","少し|sukoshi|a little / 不安|fuan|uneasy / です|desu|am / 。 = I feel a little uneasy."],
  ["焦る","あせる","aseru","to be in a hurry, to rush","焦らないでください。","Aseranaide kudasai.","Please do not rush.","焦らないで|aseranaide|do not rush / ください|kudasai|please / 。 = Please do not rush."],
  ["慌てる","あわてる","awateru","to panic, to be flustered","朝、寝坊して慌てました。","Asa, nebou shite awatemashita.","I overslept in the morning and panicked.","朝|asa|morning / 、 / 寝坊して|nebou shite|overslept and / 慌てました|awatemashita|panicked / 。 = I overslept in the morning and panicked."],
  ["落ち着く","おちつく","ochitsuku","to calm down, to feel settled","ここは静かで落ち着きます。","Koko wa shizuka de ochitsukimasu.","It is quiet here, so I feel calm.","ここ|koko|here / は|wa|(topic) / 静か|shizuka|quiet / で|de|and / 落ち着きます|ochitsukimasu|feel calm / 。 = It is quiet here, so I feel calm."],
  ["安心","あんしん","anshin","relief, peace of mind","薬を飲んで安心しました。","Kusuri o nonde anshin shimashita.","I took medicine and felt relieved.","薬|kusuri|medicine / を|o|(object) / 飲んで|nonde|took and / 安心|anshin|relief / しました|shimashita|did / 。 = I took medicine and felt relieved."],
  ["ストレス","ストレス","sutoresu","stress","仕事のストレスが多いです。","Shigoto no sutoresu ga ooi desu.","I have a lot of work stress.","仕事|shigoto|work / の|no|(of) / ストレス|sutoresu|stress / が|ga|(subject) / 多い|ooi|a lot / です|desu|is / 。 = I have a lot of work stress."],
  ["気分","きぶん","kibun","mood, how one feels","気分が悪いです。","Kibun ga warui desu.","I feel sick.","気分|kibun|mood / が|ga|(subject) / 悪い|warui|bad / です|desu|is / 。 = I feel sick."],
  ["怒る","おこる","okoru","to get angry","先生は怒りました。","Sensei wa okorimashita.","The teacher got angry.","先生|sensei|teacher / は|wa|(topic) / 怒りました|okorimashita|got angry / 。 = The teacher got angry."],
  ["集中","しゅうちゅう","shuuchuu","concentration","静かな部屋で集中します。","Shizuka na heya de shuuchuu shimasu.","I concentrate in a quiet room.","静かな|shizuka na|quiet / 部屋|heya|room / で|de|(in) / 集中|shuuchuu|concentration / します|shimasu|do / 。 = I concentrate in a quiet room."]],
  [
   "試験|shiken|exam / の|no|of / 前|mae|before / は|wa|(topic) / 緊張|kinchou|nervousness / します|shimasu|have / 。 = I get nervous before an exam.",
   "明日|ashita|tomorrow / は|wa|(topic) / 少し|sukoshi|a little / 不安|fuan|uneasy / です|desu|am / 。 = I feel a little uneasy about tomorrow.",
   "焦らないで|aseranaide|do not rush / ください|kudasai|please / 。 = Please do not rush.",
   "朝|asa|morning / 寝坊|nebou|oversleeping / して|shite|do / 慌てました|awatemashita|panicked / 。 = I overslept in the morning and panicked.",
   "この|kono|this / 部屋|heya|room / は|wa|(topic) / 静か|shizuka|quiet / な|na|(be) / ので|node|because / 落ち着きます|ochitsukimasu|feel calm / 。 = Because this room is quiet, I feel calm.",
   "医者|isha|doctor / に|ni|to / 相談|soudan|consultation / して|shite|do / 安心|anshin|relief / しました|shimashita|did / 。 = I consulted a doctor and felt relieved."
  ]],
 ["Daily troubles",
  [["面倒","めんどう","mendou","troublesome, a bother","掃除は面倒です。","Souji wa mendou desu.","Cleaning is troublesome.","掃除|souji|cleaning / は|wa|(topic) / 面倒|mendou|troublesome / です|desu|is / 。 = Cleaning is troublesome."],
  ["不便","ふべん","fuben","inconvenient","駅から遠くて不便です。","Eki kara tookute fuben desu.","It is far from the station, so it is inconvenient.","駅|eki|station / から|kara|from / 遠くて|tookute|far and / 不便|fuben|inconvenient / です|desu|is / 。 = It is far from the station, so it is inconvenient."],
  ["邪魔","じゃま","jama","in the way, a disturbance","荷物が邪魔です。","Nimotsu ga jama desu.","The luggage is in the way.","荷物|nimotsu|luggage / が|ga|(subject) / 邪魔|jama|in the way / です|desu|is / 。 = The luggage is in the way."],
  ["迷惑","めいわく","meiwaku","trouble, a nuisance","夜の電話は迷惑です。","Yoru no denwa wa meiwaku desu.","Phone calls at night are a nuisance.","夜|yoru|night / の|no|(of) / 電話|denwa|phone call / は|wa|(topic) / 迷惑|meiwaku|nuisance / です|desu|is / 。 = Phone calls at night are a nuisance."],
  ["汚れる","よごれる","yogoreru","to get dirty","シャツが汚れました。","Shatsu ga yogoremashita.","My shirt got dirty.","シャツ|shatsu|shirt / が|ga|(subject) / 汚れました|yogoremashita|got dirty / 。 = My shirt got dirty."],
  ["汚い","きたない","kitanai","dirty","部屋が汚いです。","Heya ga kitanai desu.","The room is dirty.","部屋|heya|room / が|ga|(subject) / 汚い|kitanai|dirty / です|desu|is / 。 = The room is dirty."],
  ["割れる","われる","wareru","to break (glass, plates)","コップが割れました。","Koppu ga waremashita.","The glass broke.","コップ|koppu|glass / が|ga|(subject) / 割れました|waremashita|broke / 。 = The glass broke."],
  ["落とす","おとす","otosu","to drop","携帯を落としました。","Keitai o otoshimashita.","I dropped my phone.","携帯|keitai|mobile phone / を|o|(object) / 落としました|otoshimashita|dropped / 。 = I dropped my phone."],
  ["乾く","かわく","kawaku","to dry, to become dry","タオルはすぐ乾きます。","Taoru wa sugu kawakimasu.","Towels dry quickly.","タオル|taoru|towel / は|wa|(topic) / すぐ|sugu|quickly / 乾きます|kawakimasu|dry / 。 = Towels dry quickly."],
  ["濡れる","ぬれる","nureru","to get wet","雨で服が濡れました。","Ame de fuku ga nuremashita.","My clothes got wet in the rain.","雨|ame|rain / で|de|(because of) / 服|fuku|clothes / が|ga|(subject) / 濡れました|nuremashita|got wet / 。 = My clothes got wet in the rain."]],
  [
   "掃除|souji|cleaning / は|wa|(topic) / 面倒|mendou|troublesome / です|desu|is / 。 = Cleaning is troublesome.",
   "駅|eki|station / から|kara|from / 遠い|tooi|far / ので|node|because / 不便|fuben|inconvenient / です|desu|is / 。 = It is inconvenient because it is far from the station.",
   "荷物|nimotsu|luggage / が|ga|(subject) / 邪魔|jama|in the way / です|desu|is / 。 = My luggage is in the way.",
   "夜|yoru|night / の|no|of / 電話|denwa|phone call / は|wa|(topic) / 迷惑|meiwaku|nuisance / です|desu|is / 。 = Phone calls at night are a nuisance.",
   "シャツ|shatsu|shirt / が|ga|(subject) / 汚れた|yogoreta|got dirty / ので|node|because / 洗います|araimasu|wash / 。 = My shirt got dirty, so I wash it.",
   "コップ|koppu|glass / を|o|(object) / 落としたら|otoshitara|if (you) drop / 割れます|waremasu|breaks / 。 = If you drop a glass, it breaks."
  ]],
 ["School events and school people",
  [["運動会","うんどうかい","undoukai","sports day","来月、運動会があります。","Raigetsu, undoukai ga arimasu.","There is a sports day next month.","来月|raigetsu|next month / 、 / 運動会|undoukai|sports day / が|ga|(subject) / あります|arimasu|there is / 。 = There is a sports day next month."],
  ["文化祭","ぶんかさい","bunkasai","school festival","文化祭で歌います。","Bunkasai de utaimasu.","I sing at the school festival.","文化祭|bunkasai|school festival / で|de|(at) / 歌います|utaimasu|sing / 。 = I sing at the school festival."],
  ["遠足","えんそく","ensoku","school trip, excursion","遠足で山に登ります。","Ensoku de yama ni noborimasu.","We climb a mountain on the school trip.","遠足|ensoku|school trip / で|de|(on) / 山|yama|mountain / に|ni|(to) / 登ります|noborimasu|climb / 。 = We climb a mountain on the school trip."],
  ["部活","ぶかつ","bukatsu","club activities (at school)","部活でサッカーをします。","Bukatsu de sakkaa o shimasu.","I play soccer in club activities.","部活|bukatsu|club activities / で|de|(in) / サッカー|sakkaa|soccer / を|o|(object) / します|shimasu|play / 。 = I play soccer in club activities."],
  ["先輩","せんぱい","senpai","senior (at school or work)","先輩は優しいです。","Senpai wa yasashii desu.","My senior is kind.","先輩|senpai|senior / は|wa|(topic) / 優しい|yasashii|kind / です|desu|is / 。 = My senior is kind."],
  ["後輩","こうはい","kouhai","junior (at school or work)","後輩に教えます。","Kouhai ni oshiemasu.","I teach my junior.","後輩|kouhai|junior / に|ni|(to) / 教えます|oshiemasu|teach / 。 = I teach my junior."],
  ["同級生","どうきゅうせい","doukyuusei","classmate","同級生と会いました。","Doukyuusei to aimashita.","I met a classmate.","同級生|doukyuusei|classmate / と|to|(with) / 会いました|aimashita|met / 。 = I met a classmate."],
  ["夏休み","なつやすみ","natsuyasumi","summer holiday","夏休みは長いです。","Natsuyasumi wa nagai desu.","The summer holiday is long.","夏休み|natsuyasumi|summer holiday / は|wa|(topic) / 長い|nagai|long / です|desu|is / 。 = The summer holiday is long."],
  ["時間割","じかんわり","jikanwari","timetable (at school)","時間割を見ます。","Jikanwari o mimasu.","I look at the timetable.","時間割|jikanwari|timetable / を|o|(object) / 見ます|mimasu|look at / 。 = I look at the timetable."],
  ["給食","きゅうしょく","kyuushoku","school lunch","給食はおいしいです。","Kyuushoku wa oishii desu.","School lunch is tasty.","給食|kyuushoku|school lunch / は|wa|(topic) / おいしい|oishii|tasty / です|desu|is / 。 = School lunch is tasty."]],
  [
   "来月|raigetsu|next month / 学校|gakkou|school / で|de|at / 運動会|undoukai|sports day / が|ga|(subject) / あります|arimasu|there is / 。 = There is a sports day at school next month.",
   "文化祭|bunkasai|school festival / で|de|at / 歌います|utaimasu|sing / 。 = I sing at the school festival.",
   "遠足|ensoku|school trip / は|wa|(topic) / 雨|ame|rain / でも|demo|even if it is / 行きます|ikimasu|go / 。 = We go on the school trip even if it rains.",
   "部活|bukatsu|club activities / で|de|in / サッカー|sakkaa|soccer / を|o|(object) / します|shimasu|play / 。 = I play soccer in club activities.",
   "先輩|senpai|senior / は|wa|(topic) / 優しい|yasashii|kind / ので|node|because / 好き|suki|liked / です|desu|is / 。 = I like my senior because he is kind.",
   "夏休み|natsuyasumi|summer holiday / に|ni|in / 同級生|doukyuusei|classmate / と|to|with / 会います|aimasu|meet / 。 = I meet a classmate in the summer holiday."
  ]],
 ["Office tasks",
  [["印刷","いんさつ","insatsu","printing","資料を印刷します。","Shiryou o insatsu shimasu.","I print the materials.","資料|shiryou|materials / を|o|(object) / 印刷|insatsu|printing / します|shimasu|do / 。 = I print the materials."],
  ["名刺","めいし","meishi","business card","名刺を出します。","Meishi o dashimasu.","I hand over my business card.","名刺|meishi|business card / を|o|(object) / 出します|dashimasu|hand over / 。 = I hand over my business card."],
  ["メモ","メモ","memo","memo, note","メモを取ります。","Memo o torimasu.","I take notes.","メモ|memo|memo / を|o|(object) / 取ります|torimasu|take / 。 = I take notes."],
  ["ファイル","ファイル","fairu","file, folder","ファイルを開けます。","Fairu o akemasu.","I open the file.","ファイル|fairu|file / を|o|(object) / 開けます|akemasu|open / 。 = I open the file."],
  ["出勤","しゅっきん","shukkin","going to work","電車で出勤します。","Densha de shukkin shimasu.","I go to work by train.","電車|densha|train / で|de|(by) / 出勤|shukkin|going to work / します|shimasu|do / 。 = I go to work by train."],
  ["休暇","きゅうか","kyuuka","leave, vacation from work","来週、休暇を取ります。","Raishuu, kyuuka o torimasu.","I take leave next week.","来週|raishuu|next week / 、 / 休暇|kyuuka|leave / を|o|(object) / 取ります|torimasu|take / 。 = I take leave next week."],
  ["営業","えいぎょう","eigyou","sales, business operation","営業の仕事をしています。","Eigyou no shigoto o shite imasu.","I do sales work.","営業|eigyou|sales / の|no|(of) / 仕事|shigoto|work / を|o|(object) / して|shite|doing / います|imasu|am (doing) / 。 = I do sales work."],
  ["当番","とうばん","touban","turn of duty","今日は掃除の当番です。","Kyou wa souji no touban desu.","Today I am on cleaning duty.","今日|kyou|today / は|wa|(topic) / 掃除|souji|cleaning / の|no|(of) / 当番|touban|turn of duty / です|desu|am / 。 = Today I am on cleaning duty."],
  ["部署","ぶしょ","busho","department, section","新しい部署で働きます。","Atarashii busho de hatarakimasu.","I will work in a new department.","新しい|atarashii|new / 部署|busho|department / で|de|(in) / 働きます|hatarakimasu|work / 。 = I will work in a new department."],
  ["残る","のこる","nokoru","to remain, to stay behind","会社に残って仕事をします。","Kaisha ni nokotte shigoto o shimasu.","I stay at the office and work.","会社|kaisha|company / に|ni|(at) / 残って|nokotte|stay behind and / 仕事|shigoto|work / を|o|(object) / します|shimasu|do / 。 = I stay at the office and work."]],
  [
   "資料|shiryou|materials / を|o|(object) / 印刷|insatsu|printing / します|shimasu|do / 。 = I print the materials.",
   "初めて|hajimete|for the first time / 会う|au|meet / とき|toki|when / 名刺|meishi|business card / を|o|(object) / 出します|dashimasu|hand over / 。 = When I meet someone for the first time, I hand over a business card.",
   "メモ|memo|memo / を|o|(object) / 見て|mite|look at / ください|kudasai|please / 。 = Please look at the memo.",
   "毎朝|maiasa|every morning / 電車|densha|train / で|de|by / 出勤|shukkin|going to work / します|shimasu|do / 。 = I go to work by train every morning.",
   "来週|raishuu|next week / 休暇|kyuuka|leave / が|ga|(subject) / あります|arimasu|there is / 。 = I have leave next week.",
   "営業|eigyou|sales / の|no|of / 部署|busho|department / は|wa|(topic) / 忙しい|isogashii|busy / です|desu|is / 。 = The sales department is busy."
  ]],
 ["Schedules and time words",
  [["平日","へいじつ","heijitsu","weekday","平日は忙しいです。","Heijitsu wa isogashii desu.","I am busy on weekdays.","平日|heijitsu|weekday / は|wa|(topic) / 忙しい|isogashii|busy / です|desu|am / 。 = I am busy on weekdays."],
  ["普段","ふだん","fudan","usually, ordinarily","普段は電車で行きます。","Fudan wa densha de ikimasu.","I usually go by train.","普段|fudan|usually / は|wa|(topic) / 電車|densha|train / で|de|(by) / 行きます|ikimasu|go / 。 = I usually go by train."],
  ["最近","さいきん","saikin","recently, these days","最近、暑いです。","Saikin, atsui desu.","It is hot these days.","最近|saikin|these days / 、 / 暑い|atsui|hot / です|desu|is / 。 = It is hot these days."],
  ["途中","とちゅう","tochuu","on the way, halfway","帰る途中で買い物をします。","Kaeru tochuu de kaimono o shimasu.","I shop on the way home.","帰る|kaeru|to return home / 途中|tochuu|on the way / で|de|(on) / 買い物|kaimono|shopping / を|o|(object) / します|shimasu|do / 。 = I shop on the way home."],
  ["最初","さいしょ","saisho","first, the beginning","最初に手を洗います。","Saisho ni te o araimasu.","First I wash my hands.","最初|saisho|first / に|ni|(at) / 手|te|hands / を|o|(object) / 洗います|araimasu|wash / 。 = First I wash my hands."],
  ["最後","さいご","saigo","last, the end","最後に先生が話しました。","Saigo ni sensei ga hanashimashita.","At the end the teacher spoke.","最後|saigo|the end / に|ni|(at) / 先生|sensei|teacher / が|ga|(subject) / 話しました|hanashimashita|spoke / 。 = At the end the teacher spoke."],
  ["順番","じゅんばん","junban","order, turn","順番を待ちます。","Junban o machimasu.","I wait for my turn.","順番|junban|turn / を|o|(object) / 待ちます|machimasu|wait for / 。 = I wait for my turn."],
  ["日付","ひづけ","hidzuke","date (day, month, year)","日付を書いてください。","Hidzuke o kaite kudasai.","Please write the date.","日付|hidzuke|date / を|o|(object) / 書いて|kaite|write and / ください|kudasai|please / 。 = Please write the date."],
  ["以内","いない","inai","within","駅から十分以内です。","Eki kara juppun inai desu.","It is within ten minutes from the station.","駅|eki|station / から|kara|from / 十分|juppun|ten minutes / 以内|inai|within / です|desu|is / 。 = It is within ten minutes from the station."],
  ["急に","きゅうに","kyuu ni","suddenly","急に雨が降りました。","Kyuu ni ame ga furimashita.","It suddenly rained.","急に|kyuu ni|suddenly / 雨|ame|rain / が|ga|(subject) / 降りました|furimashita|fell / 。 = It suddenly rained."]],
  [
   "平日|heijitsu|weekday / は|wa|(topic) / 忙しい|isogashii|busy / です|desu|am / 。 = I am busy on weekdays.",
   "普段|fudan|usually / は|wa|(topic) / 電車|densha|train / で|de|by / 学校|gakkou|school / に|ni|to / 行きます|ikimasu|go / 。 = I usually go to school by train.",
   "最近|saikin|recently / 寒い|samui|cold / です|desu|is / ね|ne|(right?) / 。 = It is cold these days, isn’t it?",
   "帰る|kaeru|go home / 途中|tochuu|on the way / で|de|at / 買い物|kaimono|shopping / を|o|(object) / します|shimasu|do / 。 = I shop on the way home.",
   "最初|saisho|first / に|ni|at / 手|te|hand / を|o|(object) / 洗います|araimasu|wash / 。 = First I wash my hands.",
   "日付|hidzuke|date / を|o|(object) / 書いて|kaite|write / ください|kudasai|please / 。 = Please write the date."
  ]]
];
const STORY_P5C=[
 {"t":"The first day at work","l":[
  "今日|kyou|today / は|wa|(topic) / ゆい|Yui|Yui (name) / の|no|of / 初めて|hajimete|first / の|no|of / 仕事|shigoto|work / です|desu|is / 。 = Today is Yui’s first day of work.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 緊張|kinchou|nervousness / して|shite|do / います|imasu|is / 。 / 少し|sukoshi|a little / 不安|fuan|uneasy / です|desu|is / 。 = Yui is nervous. She feels a little uneasy.",
  "けん|Ken|Ken (name) / ： / 焦らないで|aseranaide|do not rush / 。 / ゆっくり|yukkuri|slowly / 話して|hanashite|speak / 。 = Ken: Do not rush. Speak slowly.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / お茶|ocha|tea / を|o|(object) / 飲んで|nonde|drink / 落ち着きました|ochitsukimashita|calmed down / 。 = Yui drank tea and calmed down.",
  "客|kyaku|customers / が|ga|(subject) / 多い|ooi|many / ので|node|because / ゆい|Yui|Yui (name) / は|wa|(topic) / 慌てました|awatemashita|panicked / 。 = Because there were many customers, Yui panicked.",
  "山田さん|Yamada san|Yamada-san / が|ga|(subject) / 本屋|hon’ya|bookstore / に|ni|to / 来ました|kimashita|came / 。 / ゆい|Yui|Yui (name) / は|wa|(topic) / 安心|anshin|relief / しました|shimashita|did / 。 = Yamada-san came to the bookstore. Yui felt relieved.",
  "ゆい|Yui|Yui (name) / ： / 今日|kyou|today / は|wa|(topic) / 気分|kibun|mood / が|ga|(subject) / いい|ii|good / 。 = Yui: I feel good today."
 ],"q":[[1,"How does Yui feel at first?",["Nervous","Angry","Sleepy"],0,"Line 2: 緊張しています means “is nervous”."],[5,"Who came to the bookstore?",["Yamada-san","Tanaka-sensei","The doctor"],0,"Line 6: 山田さんが本屋に来ました means “Yamada-san came to the bookstore”."]]},
 {"t":"A rainy day at home","l":[
  "今日|kyou|today / は|wa|(topic) / 朝|asa|morning / から|kara|from / 雨|ame|rain / です|desu|is / 。 / ゆい|Yui|Yui (name) / の|no|of / 服|fuku|clothes / が|ga|(subject) / 濡れました|nuremashita|got wet / 。 = It rains from the morning. Yui’s clothes got wet.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 服|fuku|clothes / を|o|(object) / 洗います|araimasu|washes / 。 / 洗濯|sentaku|laundry / は|wa|(topic) / 面倒|mendou|troublesome / です|desu|is / 。 = Yui washes her clothes. Laundry is troublesome.",
  "服|fuku|clothes / は|wa|(topic) / すぐ|sugu|soon / 乾きません|kawakimasen|do not dry / 。 / ゆい|Yui|Yui (name) / の|no|of / 部屋|heya|room / は|wa|(topic) / 狭い|semai|small / ので|node|because / 不便|fuben|inconvenient / です|desu|is / 。 = The clothes do not dry soon. Yui’s room is small, so it is inconvenient.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / コップ|koppu|glass / を|o|(object) / 落としました|otoshimashita|dropped / 。 / コップ|koppu|glass / が|ga|(subject) / 割れました|waremashita|broke / 。 = Yui dropped a glass. The glass broke.",
  "ゆい|Yui|Yui (name) / ： / 荷物|nimotsu|luggage / が|ga|(subject) / 邪魔|jama|in the way / だ|da|is / な|na|(softener) / 。 = Yui: My luggage is in the way.",
  "けん|Ken|Ken (name) / が|ga|(subject) / 来ました|kimashita|came / 。 / ゆい|Yui|Yui (name) / ： / 迷惑|meiwaku|trouble / を|o|(object) / 掛けて|kakete|cause / すみません|sumimasen|sorry / 。 = Ken came. Yui: Sorry for the trouble.",
  "けん|Ken|Ken (name) / ： / 大丈夫|daijoubu|all right / 。 / 部屋|heya|room / は|wa|(topic) / 汚くない|kitanakunai|not dirty / よ|yo|(friendly ending) / 。 = Ken: It is all right. Your room is not dirty."
 ],"q":[[1,"What is troublesome for Yui?",["Laundry","Reading","Walking"],0,"Line 2: 洗濯は面倒です means “laundry is troublesome”."],[3,"What happened to the glass?",["It broke","It was lost","It was sold"],0,"Line 4: コップが割れました means “the glass broke”."]]},
 {"t":"The school festival","l":[
  "学校|gakkou|school / で|de|at / 文化祭|bunkasai|school festival / が|ga|(subject) / あります|arimasu|there is / 。 = There is a school festival at the school.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / けん|Ken|Ken (name) / と|to|with / 行きます|ikimasu|goes / 。 = Yui goes with Ken.",
  "けん|Ken|Ken (name) / ： / 同級生|doukyuusei|classmates / が|ga|(subject) / 歌う|utau|sing / よ|yo|(friendly ending) / 。 = Ken: My classmates sing.",
  "先輩|senpai|seniors / と|to|and / 後輩|kouhai|juniors / も|mo|also / 来ます|kimasu|come / 。 / けん|Ken|Ken (name) / は|wa|(topic) / 部活|bukatsu|club activities / で|de|in / サッカー|sakkaa|soccer / を|o|(object) / しました|shimashita|did / 。 = Seniors and juniors come too. Ken played soccer in the club.",
  "けん|Ken|Ken (name) / ： / 給食|kyuushoku|school lunch / は|wa|(topic) / おいしかった|oishikatta|was tasty / 。 = Ken: The school lunch was tasty.",
  "けん|Ken|Ken (name) / ： / 運動会|undoukai|sports day / と|to|and / 遠足|ensoku|school trip / は|wa|(topic) / 楽しかった|tanoshikatta|was fun / 。 / 夏休み|natsuyasumi|summer holiday / も|mo|also / 好きだった|suki datta|liked / 。 = Ken: The sports day and the school trip were fun. I also liked the summer holiday.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 時間割|jikanwari|timetable / を|o|(object) / 見ました|mimashita|looked at / 。 / ゆい|Yui|Yui (name) / ： / 楽しい|tanoshii|fun / です|desu|is / ね|ne|(right?) / 。 = Yui looked at the timetable. Yui: It looks fun, doesn’t it?"
 ],"q":[[2,"What do Ken’s classmates do?",["Sing","Cook","Swim"],0,"Line 3: 同級生が歌うよ means “my classmates sing”."],[3,"What did Ken do in the club?",["Played soccer","Played the piano","Cooked"],0,"Line 4: 部活でサッカーをしました means “played soccer in the club”."]]},
 {"t":"A visit to Satou-san’s office","l":[
  "さとうさん|Satou san|Satou-san / は|wa|(topic) / 営業|eigyou|sales / の|no|of / 部署|busho|department / で|de|in / 働きます|hatarakimasu|works / 。 = Satou-san works in the sales department.",
  "今日|kyou|today / ゆい|Yui|Yui (name) / は|wa|(topic) / さとうさん|Satou san|Satou-san / の|no|of / 会社|kaisha|company / に|ni|to / 行きました|ikimashita|went / 。 = Today Yui went to Satou-san’s company.",
  "さとうさん|Satou san|Satou-san / ： / 名刺|meishi|business card / を|o|(object) / どうぞ|douzo|please / 。 = Satou-san: Here is my business card.",
  "ゆい|Yui|Yui (name) / は|wa|(topic) / メモ|memo|memo / を|o|(object) / 書きました|kakimashita|wrote / 。 / ゆい|Yui|Yui (name) / は|wa|(topic) / 資料|shiryou|materials / を|o|(object) / 印刷|insatsu|printing / しました|shimashita|did / 。 = Yui wrote a memo. Yui printed the materials.",
  "さとうさん|Satou san|Satou-san / ： / 今日|kyou|today / は|wa|(topic) / 掃除|souji|cleaning / の|no|of / 当番|touban|duty / です|desu|is / 。 = Satou-san: Today I am on cleaning duty.",
  "さとうさん|Satou san|Satou-san / は|wa|(topic) / 来週|raishuu|next week / 休暇|kyuuka|leave / を|o|(object) / 取ります|torimasu|takes / 。 = Satou-san takes leave next week.",
  "みんな|minna|everyone / は|wa|(topic) / 帰りました|kaerimashita|went home / 。 / さとうさん|Satou san|Satou-san / だけ|dake|only / 会社|kaisha|company / に|ni|at / 残りました|nokorimashita|stayed / 。 = Everyone went home. Only Satou-san stayed at the company."
 ],"q":[[0,"Which department does Satou-san work in?",["Sales","Cleaning","Bank"],0,"Line 1: 営業の部署 means “the sales department”."],[6,"Who stayed at the company?",["Satou-san","Ken","Yui"],0,"Line 7: 山田さんだけ会社に残りました means “only Satou-san stayed at the company”."]]},
 {"t":"A busy week","l":[
  "ゆい|Yui|Yui (name) / は|wa|(topic) / 平日|heijitsu|weekdays / に|ni|on / 学校|gakkou|school / に|ni|to / 、 / 土曜日|doyoubi|Saturday / に|ni|on / 本屋|hon’ya|bookstore / に|ni|to / 行きます|ikimasu|goes / 。 = Yui goes to school on weekdays and to the bookstore on Saturday.",
  "本屋|hon’ya|bookstore / に|ni|to / は|wa|(topic) / 自転車|jitensha|bicycle / で|de|by / 行きます|ikimasu|goes / 。 = She goes to the bookstore by bicycle.",
  "今日|kyou|today / は|wa|(topic) / 急に|kyuu ni|suddenly / 雨|ame|rain / が|ga|(subject) / 降りました|furimashita|fell / 。 = Today it suddenly rained.",
  "帰る|kaeru|go home / 途中|tochuu|on the way / で|de|at / ゆい|Yui|Yui (name) / は|wa|(topic) / 傘|kasa|umbrella / を|o|(object) / 買いました|kaimashita|bought / 。 = Yui bought an umbrella on the way home.",
  "最近|saikin|recently / ゆい|Yui|Yui (name) / は|wa|(topic) / 忙しい|isogashii|busy / です|desu|is / 。 / 試験|shiken|exam / の|no|of / 日付|hidzuke|date / を|o|(object) / 見ました|mimashita|looked at / 。 = Yui is busy these days. She looked at the date of the exam.",
  "本屋|hon’ya|bookstore / は|wa|(topic) / 駅|eki|station / から|kara|from / 十分|juppun|ten minutes / 以内|inai|within / です|desu|is / 。 = The bookstore is within ten minutes from the station.",
  "ゆい|Yui|Yui (name) / と|to|and / けん|Ken|Ken (name) / は|wa|(topic) / 順番|junban|order / を|o|(object) / 見ました|mimashita|looked at / 。 / 最初|saisho|first / は|wa|(topic) / けん|Ken|Ken (name) / です|desu|is / 。 / 最後|saigo|last / は|wa|(topic) / ゆい|Yui|Yui (name) / です|desu|is / 。 = Yui and Ken looked at the order. Ken is first. Yui is last."
 ],"q":[[2,"What happened today?",["It suddenly rained","Ken was late","The shop closed"],0,"Line 3: 急に雨が降りました means “it suddenly rained”."],[3,"What did Yui buy on the way home?",["An umbrella","A hat","A bag"],0,"Line 4: 傘を買いました means “bought an umbrella”."]]}
];
JA.push(...JA_P5A,...JA_P5B,...JA_P5C);GR.ja.push(...GR_P5A,...GR_P5B);STORY_JA.push(...STORY_P5A,...STORY_P5B,...STORY_P5C);
/* JA-PART-5-END */
