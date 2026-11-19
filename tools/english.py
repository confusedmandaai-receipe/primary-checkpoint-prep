import sys, json
from qlib import Bank

B = Bank('english', 'e')
D, P, X = 'diagnostic', 'practice', 'mock'
K, A, R = 'knowledge', 'application', 'reasoning'

# All passages are original, written for this site.
PASSAGES = [
 {'id': 'pd1', 'pool': D, 'type': 'Fiction', 'title': 'The Last Bus',
  'paragraphs': [
   'The rain had been falling since lunchtime, and by six o’clock the bus shelter on Harbour Road was the only dry place Amira could find. She pressed herself against the back wall, clutching her violin case as though it might float away.',
   'The timetable said the last bus would come at 6:15. Her watch said 6:24. Amira checked it again, then again, as if looking harder might change the numbers.',
   '“Waiting for the number twelve?” An old man with a dripping umbrella had appeared beside her. Amira nodded, not trusting her voice.',
   '“It’s always late on Thursdays,” he said cheerfully. “The driver stops to buy his mother’s bread.” He winked, and for the first time that afternoon, Amira felt her shoulders drop a little.',
   'At 6:31, two yellow headlights swam out of the grey. Amira let out a breath she hadn’t known she was holding. As she climbed aboard, she turned to thank the old man — but the shelter was empty, and only a small puddle marked where he had stood.'
  ]},
 {'id': 'pd2', 'pool': D, 'type': 'Non-fiction (information text)', 'title': 'The Desert Ship',
  'paragraphs': [
   'Camels have been called “ships of the desert” for hundreds of years. Like ships crossing an ocean, they carry people and goods across vast, empty landscapes where few other animals could survive.',
   'Contrary to popular belief, a camel’s hump does not store water. It stores fat, which the camel can use for energy when food is scarce. A camel can, however, drink more than 100 litres of water in about ten minutes, and then go for days without drinking again.',
   'Its body is built for sand and sun. Two rows of long eyelashes protect its eyes from blowing sand, and it can close its nostrils during a sandstorm. Wide, padded feet stop it sinking into soft ground.',
   'So next time you see a picture of a camel, look carefully. Every part of it tells a story of survival.'
  ]},
 {'id': 'pp1', 'pool': P, 'type': 'Non-fiction (information text)', 'title': 'Hotels for Bees',
  'paragraphs': [
   'Not all bees live in hives. In fact, most of the world’s bee species are solitary: each female builds her own small nest and raises her young alone. These bees are excellent pollinators, but they are finding it harder to locate safe places to nest as gardens are paved over and old walls are repaired.',
   'One simple solution is a “bee hotel”. A bee hotel is a bundle of hollow tubes — often bamboo canes, paper straws or holes drilled into a block of wood — fixed in a sunny, sheltered spot. Female bees crawl inside, lay an egg, leave a supply of pollen, and seal the tube with mud or chewed leaves.',
   'Location matters more than appearance. A hotel should face the morning sun, sit at least one metre above the ground and be protected from heavy rain. Tubes that are damp or shaded are usually ignored.',
   'At Rivermouth Primary School, pupils built six bee hotels last spring. By summer, more than half of the tubes had been sealed. “We didn’t expect so many visitors,” said Year 6 pupil Tomas. “Now we check them every Friday and record what we see.”',
   'Scientists caution that bee hotels are not a complete answer. Bees also need flowers that bloom from early spring to late autumn. A hotel with no food nearby is like a block of flats in the middle of a desert.'
  ]},
 {'id': 'pp2', 'pool': P, 'type': 'Fiction', 'title': 'The Storm Light',
  'paragraphs': [
   'Jonah had promised his grandmother he would be home before dark, but the sea had other plans. By the time he had pulled the last lobster pot aboard, the sky over Gull Point had turned the colour of a bruise.',
   'The first wave slapped the side of the little boat like an angry hand. Jonah gripped the tiller and pointed the bow towards the harbour, though he could no longer see it. Rain stung his face. The engine coughed, recovered, coughed again.',
   'Then, through the howling dark, a light blinked. Once. Twice. A pause. Once again. Jonah knew that pattern. Every night for eleven years his grandmother had flashed it from the kitchen window so he would know she was waiting.',
   'He steered towards it, wave after wave, until the harbour wall rose out of the gloom like a sleeping giant. When he finally tied up the boat, his hands were shaking so much he could barely work the knot.',
   'His grandmother was standing on the slipway in her nightgown and wellington boots, the torch still in her hand. She did not say a word. She simply wrapped her coat around him and led him home.'
  ]},
 {'id': 'pp3', 'pool': P, 'type': 'Poem', 'title': 'City Morning',
  'paragraphs': [
   'Before the buses clear their throats, / before the shutters yawn, / the city stretches, one grey arm / across the edge of dawn.',
   'A baker’s window glows like gold; / the pigeons strut and wait. / A cyclist hums a half-heard tune / and rattles past the gate.',
   'Then all at once the streets awake — / a thousand footsteps race, / and every hurried, hopeful face / is rushing to its place.'
  ]},
 {'id': 'pp4', 'pool': P, 'type': 'Non-fiction (persuasive leaflet)', 'title': 'Switch Off, Step Out!',
  'paragraphs': [
   'Did you know that the average eleven-year-old now spends more than five hours a day looking at a screen? That is more time than most of us spend in lessons! It is time to switch off and step out.',
   'Playing outdoors is not just fun — it is good for you. Fresh air and exercise help your body grow strong, and studies suggest that time in green spaces can improve concentration and mood. Wouldn’t you like to feel calmer and sharper in class?',
   'Join our Saturday Explorers Club at Greenway Park. Every week we build dens, track wildlife and play team games. No experience is needed, and the club is completely free.',
   'Don’t let another weekend disappear into a screen. Grab a friend, put on your trainers, and come and discover what you have been missing. We will see you on Saturday!'
  ]},
 {'id': 'px1', 'pool': X, 'type': 'Non-fiction (information text)', 'title': 'Forests That Grow in the Sea',
  'paragraphs': [
   'Along warm coastlines, where rivers meet the ocean, grow some of the most remarkable forests on Earth. Mangrove trees can survive in salty water that would kill most plants within days.',
   'Their secret lies in their roots. Some mangroves have tall, arching roots that hold the tree above the water like stilts. Others send up thin roots called pneumatophores, which poke out of the mud like pencils and allow the tree to “breathe” when the tide is high.',
   'Mangrove forests are nurseries for the sea. Young fish, crabs and shrimps shelter among the tangled roots, safe from larger predators, until they are big enough to swim into open water.',
   'Mangroves also protect people. Their roots slow down waves and trap mud, reducing damage from storms and preventing coastlines from washing away. Yet, over the last fifty years, large areas of mangrove forest have been cleared for farms and buildings.',
   'Today, communities in many countries are replanting mangroves. It is slow work, but each seedling is a small promise: a safer coast and a richer sea for the future.'
  ]},
 {'id': 'px2', 'pool': X, 'type': 'Fiction', 'title': 'The Audition',
  'paragraphs': [
   'Leila had practised the piece one hundred and twelve times. She knew because she had kept a tally on the back of her bedroom door, five neat lines for every five attempts.',
   'Now, standing in the echoing hall, she could not remember the first note.',
   'Three judges sat behind a long table. The one in the middle, a woman with silver glasses, smiled and said, “Whenever you are ready.” Her voice was kind, but Leila’s fingers felt as though they belonged to someone else.',
   'She closed her eyes. She thought of her bedroom, of the tally marks, of her little brother pretending to be an audience of thousands. Slowly, the first note returned, and then the second, and then the music was flowing out of her like water from a tap that had been stuck for years.',
   'When she finished, the hall was silent. Then the woman with silver glasses put down her pen and, very quietly, began to clap.'
  ]},
 {'id': 'px3', 'pool': X, 'type': 'Non-fiction (recount)', 'title': 'A Short History of the Bicycle',
  'paragraphs': [
   'The first bicycles had no pedals at all. In 1817, a German inventor built a wooden “running machine”: riders sat on a seat and pushed themselves along with their feet.',
   'Pedals arrived in the 1860s, attached directly to the front wheel. To travel faster, makers built bigger and bigger front wheels, until some were taller than a grown man. These “penny-farthings” were exciting but dangerous; a rider who hit a stone could be thrown head-first over the handlebars.',
   'In the 1880s, the “safety bicycle” changed everything. It had two wheels of the same size and a chain that connected the pedals to the back wheel. Air-filled tyres soon followed, making rides far more comfortable.',
   'Within a few years, cycling became hugely popular. For the first time, many ordinary people could travel several kilometres to work or visit friends without a horse.',
   'Today, the basic design has hardly changed. Modern bicycles are lighter and have gears, but a rider from 1890 would still recognise one instantly.'
  ]},
 {'id': 'px4', 'pool': X, 'type': 'Fiction', 'title': 'The Fog Market',
  'paragraphs': [
   'Every year, on the first foggy morning of autumn, the market appeared in the square. Nobody saw it arrive. One moment the square was empty; the next, it was crowded with stalls selling things that could not be bought anywhere else.',
   'Ben had heard the stories, of course. Bottled thunderstorms. Maps that redrew themselves. A clock that ran backwards for anyone who wanted one more hour. He had never believed a word.',
   'Yet here he was, his breath making small clouds, staring at a stall piled high with glass jars. Inside each jar, something glowed faintly — a different colour in every one.',
   '“Memories,” said the stallholder, a tall woman whose coat seemed to be stitched from a hundred different maps. “Good ones only. One coin each.”',
   'Ben’s hand closed around the single coin in his pocket. He had been saving it for a week. He looked at the jars for a long time. Then, slowly, he shook his head, turned, and walked home to find his sister.'
  ]},
]

def pq(pool, passage, topic, skill, diff, cmd, prompt, **kw):
    return B.add(pool, topic, skill, diff, cmd, prompt, passage=passage, **kw)

# ---------------------------------------------------------- diagnostic
pq(D, 'pd1', 'e-retrieve', K, 1, 'give', 'What time was the last bus supposed to arrive?', options=['6:15', '6:24', '6:31', '6:00'],
   hint='Look in paragraph 2.', explain='Paragraph 2: “The timetable said the last bus would come at 6:15.”')
pq(D, 'pd1', 'e-infer', R, 2, 'explain', 'How is Amira feeling at the start of the story?', options=['Worried and anxious', 'Bored and sleepy', 'Excited and cheerful', 'Angry with the driver'],
   hint='Look at how she holds her violin case and checks her watch.', explain='She clutches her case and checks her watch again and again — signs of worry.')
pq(D, 'pd1', 'e-language', R, 3, 'explain', 'In paragraph 5, the headlights “swam out of the grey”. What does this suggest?',
   options=['The lights appeared slowly and blurrily through the rain', 'The bus had driven into the sea', 'The headlights were moving very fast', 'The driver could not swim'],
   hint='Think about how things look through heavy rain.', explain='“Swam” suggests the lights drifted into view gradually and blurrily, as if through water.')
pq(D, 'pd1', 'e-structure', R, 3, 'explain', 'Why does the writer end the story with the empty shelter and the puddle?',
   options=['To leave a mysterious feeling — perhaps the old man was not an ordinary person', 'To explain the bus timetable', 'To show that it had stopped raining', 'To introduce a new character'],
   hint='What is unusual about the ending?', explain='The man vanishes, leaving only a puddle, which creates mystery and makes the reader wonder who he was.')
pq(D, 'pd1', 'e-vocab', A, 2, 'give', 'In paragraph 1, which word could replace “clutching” without changing the meaning?', options=['gripping', 'dropping', 'swinging', 'opening'],
   hint='What do you do with something you are afraid to lose?', explain='“Clutching” means holding tightly — “gripping”.')
pq(D, 'pd2', 'e-retrieve', K, 1, 'give', 'According to paragraph 2, what does a camel’s hump store?', options=['Fat', 'Water', 'Food it has eaten', 'Air'],
   mistakes={'Water': 'The text says this is a popular belief that is wrong'}, hint='Read paragraph 2 carefully — it corrects a common belief.', explain='“It stores fat, which the camel can use for energy.”')
pq(D, 'pd2', 'e-language', R, 3, 'explain', 'Why are camels called “ships of the desert”?', options=['Like ships at sea, they carry people and goods across huge empty areas', 'Because they can float', 'Because they were carried on ships', 'Because they sway like waves'],
   hint='Paragraph 1 explains the comparison.', explain='The metaphor compares crossing a desert to a ship crossing an ocean.')
pq(D, 'pd2', 'e-infer', R, 3, 'explain', 'Which detail best shows that camels are adapted to sandstorms?', options=['They can close their nostrils', 'They can drink 100 litres of water', 'Their humps store fat', 'They have been used for hundreds of years'],
   hint='Which feature helps when sand is blowing?', explain='Closing their nostrils keeps sand out during a sandstorm.')
pq(D, 'pd2', 'e-structure', A, 2, 'explain', 'What is the purpose of the final paragraph?', options=['To sum up the main idea and speak directly to the reader', 'To introduce a new fact about camels', 'To give instructions for riding a camel', 'To tell a story about a camel'],
   hint='Is there new information, or a conclusion?', explain='It concludes the text by addressing the reader (“you”) and summarising that every feature helps survival.')
B.add(D, 'e-grammar', K, 1, 'identify', 'Which word is an adverb in this sentence? “The cat crept silently across the garden.”', options=['silently', 'crept', 'cat', 'garden'],
      mistakes={'crept': 'That is the verb'}, hint='Adverbs often tell us how something is done.', explain='“Silently” tells us how the cat crept — it is an adverb.')
B.add(D, 'e-grammar', A, 2, 'identify', 'Which sentence is written in the passive voice?', options=['The window was broken by the ball.', 'The ball broke the window.', 'The boy kicked the ball.', 'The ball flew over the fence.'],
      hint='In the passive, the thing that the action happens to comes first.', explain='“The window was broken by the ball” — the window (receiver of the action) is the subject.')
B.add(D, 'e-punct', K, 1, 'identify', 'Which sentence uses an apostrophe correctly?', options=['The dog’s bowl was empty.', 'The dogs’s bowl was empty.', 'The dog’s were barking.', 'Its’ bowl was empty.'],
      mistakes={'The dog’s were barking.': 'Plurals do not need apostrophes'}, hint='Apostrophes show possession or missing letters — not plurals.', explain='“The dog’s bowl” shows the bowl belongs to one dog.')
B.add(D, 'e-punct', A, 2, 'identify', 'Which sentence is punctuated correctly?', options=['“Are you coming?” asked Sam.', '“Are you coming,” asked Sam?', '“Are you coming? asked Sam.”', 'Are you coming? “asked Sam.”'],
      hint='The question mark goes inside the speech marks.', explain='Spoken words, including their punctuation, go inside the speech marks.')
B.add(D, 'e-vocab', A, 2, 'give', 'What does the prefix “mis-” mean in “misunderstand” and “misbehave”?', options=['wrongly or badly', 'again', 'before', 'not able to'],
      hint='Misbehave means to behave …', explain='“Mis-” means wrongly or badly.')
B.add(D, 'e-sentences', A, 2, 'identify', 'Which is the best way to join these sentences? “It was raining. We played inside.”', options=['Because it was raining, we played inside.', 'It was raining, we played inside.', 'It was raining but we played inside.', 'We played inside, it was raining.'],
      mistakes={'It was raining, we played inside.': 'A comma alone cannot join two sentences (comma splice)', 'It was raining but we played inside.': '“But” shows contrast, which does not fit here'},
      hint='Show the reason for the action.', explain='“Because” shows the cause; the subordinate clause is followed by a comma.')
B.add(D, 'e-sentences', R, 3, 'identify', 'Which sentence has been edited correctly? Original: “me and him goes to the park every saturday”', options=['He and I go to the park every Saturday.', 'Me and him go to the park every Saturday.', 'Him and I goes to the park every saturday.', 'He and me goes to the park every Saturday.'],
      hint='Check pronouns, verb agreement and capital letters.', explain='“He and I” are subject pronouns, “go” agrees with a plural subject, and days of the week need capitals.')
B.add(D, 'e-grammar', K, 2, 'identify', 'Which word is a conjunction in this sentence? “I wanted to go out, although it was cold.”', options=['although', 'wanted', 'out', 'cold'],
      hint='A conjunction joins clauses.', explain='“Although” joins the two clauses.')

# ----------------------------------------------------------- practice: bee hotels
pq(P, 'pp1', 'e-retrieve', K, 1, 'give', 'According to paragraph 1, why are solitary bees finding it harder to nest?', options=['Gardens are being paved over and old walls repaired', 'There are too many hives', 'They cannot find any flowers at all', 'They prefer to live in hives now'],
   hint='Paragraph 1, last sentence.', explain='The text says gardens are paved over and old walls are repaired, removing nesting places.')
pq(P, 'pp1', 'e-retrieve', K, 1, 'give', 'Which materials does paragraph 2 say can be used to make the tubes? Select all that apply.', multi=(['bamboo canes', 'paper straws', 'drilled wood', 'plastic bags', 'metal pipes'], ['bamboo canes', 'paper straws', 'drilled wood']),
   hint='Paragraph 2 lists them. Select all that are mentioned.', explain='Bamboo canes, paper straws and holes drilled into wood are all mentioned.')
pq(P, 'pp1', 'e-retrieve', A, 2, 'give', 'Where should a bee hotel be placed? Choose the answer that matches paragraph 3.', options=['Facing the morning sun, at least one metre high, sheltered from rain', 'In a shady corner on the ground', 'Facing the evening sun, close to the ground', 'Anywhere, as long as it looks attractive'],
   hint='Paragraph 3.', explain='It should face the morning sun, be at least 1 m above the ground and protected from heavy rain.')
pq(P, 'pp1', 'e-infer', R, 2, 'explain', 'What can you infer from the fact that more than half of the tubes at Rivermouth were sealed?', options=['Many bees used the hotels to lay eggs', 'The pupils sealed the tubes themselves', 'The hotels were broken', 'No bees visited the school'],
   hint='Who seals the tubes, according to paragraph 2?', explain='Bees seal a tube after laying an egg, so sealed tubes show the hotels were used.')
pq(P, 'pp1', 'e-language', R, 3, 'explain', 'What does the comparison “like a block of flats in the middle of a desert” suggest?', options=['A bee hotel is useless if there is no food nearby', 'Bee hotels should be built in deserts', 'Bees like to live in tall buildings', 'Bee hotels are too big'],
   hint='What would be the problem with flats in a desert?', explain='The simile suggests that, like people with no food or water around them, bees cannot survive in a hotel without flowers nearby.')
pq(P, 'pp1', 'e-structure', R, 3, 'explain', 'Why has the writer included the quotation from Tomas in paragraph 4?', options=['To give a real example that shows bee hotels can work', 'To explain how to drill holes', 'To argue that bee hotels are dangerous', 'To introduce a story about Tomas'],
   hint='How does it support the main idea?', explain='A real example with a quotation makes the information more convincing and relatable.')
pq(P, 'pp1', 'e-vocab', A, 2, 'give', 'In paragraph 5, what does “caution” mean?', options=['warn', 'celebrate', 'measure', 'forget'], hint='Scientists are pointing out a problem.', explain='To caution is to warn.')
pq(P, 'pp1', 'e-structure', A, 2, 'identify', 'What is the main purpose of this text?', options=['To inform readers about bee hotels and why they help', 'To entertain readers with a story about bees', 'To persuade readers to buy honey', 'To instruct readers how to look after a hive'],
   hint='What does the text mostly do?', explain='It is an information text explaining what bee hotels are and how they help solitary bees.')

# ------------------------------------------------------------ practice: storm light
pq(P, 'pp2', 'e-retrieve', K, 1, 'give', 'What was Jonah doing when the storm began?', options=['Pulling in the last lobster pot', 'Walking home from school', 'Talking to his grandmother', 'Mending the engine'], hint='Paragraph 1.', explain='He had just pulled the last lobster pot aboard.')
pq(P, 'pp2', 'e-language', R, 3, 'explain', 'The sky “had turned the colour of a bruise”. What does this description suggest?', options=['The sky was dark purple and threatening', 'The sky was bright and sunny', 'Jonah had hurt himself', 'The sky was pale blue'],
   hint='What colour is a bruise, and how does it make you feel?', explain='Bruises are dark purple-grey, so the sky was dark and menacing, hinting at danger.')
pq(P, 'pp2', 'e-language', A, 2, 'identify', 'Which phrase from paragraph 2 is a simile?', options=['like an angry hand', 'Rain stung his face', 'The engine coughed', 'gripped the tiller'],
   mistakes={'The engine coughed': 'That is personification, not a simile'}, hint='A simile compares using “like” or “as”.', explain='“Slapped the side of the little boat like an angry hand” uses “like” to compare.')
pq(P, 'pp2', 'e-infer', R, 3, 'explain', 'How did Jonah know the light came from his grandmother?', options=['It flashed the same pattern she had used every night for years', 'He could see her face', 'She shouted to him', 'It was the only house on the coast'],
   hint='Paragraph 3.', explain='The light flashed a pattern — once, twice, pause, once — that his grandmother had used for eleven years.')
pq(P, 'pp2', 'e-infer', R, 3, 'explain', 'Why does the grandmother “not say a word” at the end?', options=['She is too relieved and emotional to speak — her actions show her love', 'She is angry and refuses to talk', 'She cannot hear because of the storm', 'She does not recognise Jonah'],
   hint='What does she do instead of speaking?', explain='She wraps him in her coat — her actions show relief and love more strongly than words.')
pq(P, 'pp2', 'e-structure', R, 3, 'explain', 'How does the writer build tension in paragraph 2?', options=['Short sentences and a sputtering engine create a sense of danger', 'A long description of the harbour', 'A conversation between characters', 'A flashback to Jonah’s childhood'],
   hint='Look at sentence lengths and what goes wrong.', explain='Short sentences (“Rain stung his face.”) and the failing engine make the danger feel immediate.')
pq(P, 'pp2', 'e-vocab', A, 2, 'give', 'In paragraph 4, what does “gloom” mean?', options=['darkness', 'happiness', 'noise', 'rain'], hint='Think about the weather and time of day.', explain='“Gloom” means darkness or dim light.')

# ------------------------------------------------------------- practice: poem
pq(P, 'pp3', 'e-language', A, 2, 'identify', 'Which technique is used in “the shutters yawn”?', options=['Personification', 'Simile', 'Alliteration', 'Rhetorical question'],
   hint='Can shutters really yawn?', explain='Giving shutters a human action (yawning) is personification.')
pq(P, 'pp3', 'e-language', R, 3, 'explain', 'Why does the poet say the baker’s window “glows like gold”?', options=['To show it looks warm, bright and inviting in the grey morning', 'Because the window is made of gold', 'To show the bread is expensive', 'Because the baker is rich'],
   hint='Compare it with the “grey” of the city.', explain='The simile contrasts warm golden light with the grey dawn, making the bakery seem inviting.')
pq(P, 'pp3', 'e-structure', R, 3, 'explain', 'How does the mood change in the final verse?', options=['From quiet and sleepy to busy and fast', 'From busy to quiet', 'From happy to sad', 'It does not change'],
   hint='Compare verse 1 with verse 3.', explain='The first verses are calm and slow; the final verse is full of racing footsteps and rushing faces.')
pq(P, 'pp3', 'e-infer', R, 2, 'explain', 'What time of day is described in the poem?', options=['Early morning', 'Midday', 'Evening', 'Midnight'], hint='Look for clues like “dawn”.', explain='References to dawn and the city waking up show early morning.')
pq(P, 'pp3', 'e-structure', K, 2, 'identify', 'Which words rhyme in verse 3?', options=['race, face, place', 'awake, race', 'streets, footsteps', 'once, thousand'],
   hint='Listen to the line endings.', explain='“Race”, “face” and “place” rhyme.')

# ----------------------------------------------------------- practice: leaflet
pq(P, 'pp4', 'e-structure', A, 2, 'identify', 'What is the main purpose of this leaflet?', options=['To persuade readers to join an outdoor club', 'To explain how screens work', 'To tell a story about a park', 'To give instructions for building a den'],
   hint='What does it want readers to do?', explain='It persuades readers to spend less time on screens and join the Saturday Explorers Club.')
pq(P, 'pp4', 'e-language', A, 2, 'identify', 'Which persuasive technique is used in “Wouldn’t you like to feel calmer and sharper in class?”', options=['Rhetorical question', 'Simile', 'Onomatopoeia', 'Flashback'],
   hint='It is a question that does not expect an answer.', explain='A rhetorical question makes the reader think and agree.')
pq(P, 'pp4', 'e-language', R, 3, 'explain', 'Why does the writer use a statistic in the first paragraph?', options=['To make the problem seem real and serious', 'To show off their maths', 'To describe the park', 'To make the leaflet longer'],
   hint='Facts and figures can be convincing.', explain='The figure (more than five hours a day) makes the problem seem factual and urgent.')
pq(P, 'pp4', 'e-retrieve', K, 1, 'give', 'How much does the Saturday Explorers Club cost?', options=['It is free', 'One coin per week', 'It is not mentioned', 'Five pounds'], hint='Paragraph 3.', explain='“The club is completely free.”')
pq(P, 'pp4', 'e-infer', R, 2, 'explain', 'Who is the leaflet mainly written for?', options=['Children around eleven years old', 'Scientists', 'Park keepers', 'Very young babies'],
   hint='Look at who is addressed as “you” and the examples used.', explain='It mentions eleven-year-olds and lessons, and addresses the reader directly as a pupil.')
pq(P, 'pp4', 'e-vocab', A, 2, 'give', 'Which word is closest in meaning to “discover” in the final paragraph?', options=['find out', 'hide', 'forget', 'cover'], hint='dis- + cover.', explain='To discover is to find out.')

# --------------------------------------------------------- practice: language
g = 'e-grammar'
B.add(P, g, K, 1, 'identify', 'Which word is a noun? “The brave knight rode quickly.”', options=['knight', 'brave', 'rode', 'quickly'], hint='A noun names a person, place or thing.', explain='“Knight” names a person.')
B.add(P, g, K, 1, 'identify', 'Choose the correct verb: “Yesterday, we ___ to the museum.”', options=['went', 'go', 'goes', 'going'], mistakes={'go': 'Present tense — “yesterday” needs the past tense'}, hint='Yesterday = past tense.', explain='“Went” is the past tense of “go”.')
B.add(P, g, A, 2, 'identify', 'Which sentence keeps the same tense throughout?', options=['She opened the door and walked inside.', 'She opens the door and walked inside.', 'She opened the door and walks inside.', 'She will open the door and walked inside.'],
      hint='Both verbs should be in the past.', explain='“Opened” and “walked” are both past tense.')
B.add(P, g, A, 2, 'identify', 'Rewrite in the active voice: “The cake was eaten by the children.”', options=['The children ate the cake.', 'The cake ate the children.', 'The children were eaten by the cake.', 'The cake was eating.'],
      hint='Start with who did the action.', explain='Active voice: subject (the children) + verb (ate) + object (the cake).')
B.add(P, g, A, 2, 'identify', 'Which sentence contains a relative clause?', options=['The boy who lives next door has a dog.', 'The boy has a dog.', 'The boy and his dog ran.', 'Run to the shop!'],
      hint='Look for who, which, that, whose.', explain='“who lives next door” is a relative clause giving more information about the boy.')
B.add(P, g, K, 2, 'identify', 'Which word is a preposition in: “The keys are under the mat.”?', options=['under', 'keys', 'are', 'mat'], hint='It shows position.', explain='“Under” shows where the keys are.')
B.add(P, g, R, 3, 'identify', 'Which sentence uses “fewer” or “less” correctly?', options=['There are fewer apples in the bowl today.', 'There are less apples in the bowl today.', 'I have fewer water than you.', 'She has less friends than me.'],
      hint='Use “fewer” for things you can count.', explain='Apples can be counted, so “fewer” is correct.')
B.add(P, g, A, 2, 'identify', 'Which is a modal verb showing possibility? “It ___ rain later.”', options=['might', 'is', 'has', 'does'], hint='Modal verbs: can, could, may, might, should …', explain='“Might” shows possibility.')
p = 'e-punct'
B.add(P, p, K, 1, 'identify', 'Which sentence uses commas correctly in a list?', options=['I bought apples, bananas, pears and grapes.', 'I bought, apples bananas pears and grapes.', 'I bought apples bananas, pears, and, grapes.', 'I, bought apples bananas pears and grapes.'],
      hint='Commas separate items in a list.', explain='Commas go between list items; usually no comma before “and” in British English.')
B.add(P, p, A, 2, 'identify', 'Which shows the correct use of a contraction?', options=['They’re going to the beach.', 'Their going to the beach.', 'There going to the beach.', 'Theyre going to the beach.'],
      mistakes={'Their going to the beach.': '“Their” shows possession', 'There going to the beach.': '“There” refers to a place'}, hint='They’re = they are.', explain='“They’re” is short for “they are”.')
B.add(P, p, A, 2, 'identify', 'Where should the colon go? “You will need three things a pencil, a ruler and an eraser.”', options=['After “things”', 'After “need”', 'After “pencil”', 'After “ruler”'],
      hint='A colon introduces a list.', explain='“You will need three things: a pencil, a ruler and an eraser.”')
B.add(P, p, A, 2, 'identify', 'Which sentence uses brackets correctly?', options=['Mount Everest (the world’s highest mountain) is in the Himalayas.', 'Mount (Everest the world’s highest) mountain is in the Himalayas.', '(Mount Everest the world’s) highest mountain is in the Himalayas.', 'Mount Everest the world’s highest mountain (is in the Himalayas.'],
      hint='Brackets hold extra information that could be removed.', explain='The bracketed words add information; the sentence makes sense without them.')
B.add(P, p, R, 3, 'identify', 'Which sentence uses a semicolon correctly?', options=['It was late; we decided to go home.', 'It was; late we decided to go home.', 'It was late we; decided to go home.', 'It; was late we decided to go home.'],
      hint='A semicolon joins two closely related complete sentences.', explain='Both “It was late” and “we decided to go home” are complete clauses.')
B.add(P, p, K, 1, 'identify', 'Which word is spelt correctly?', options=['necessary', 'neccessary', 'necesary', 'neccesary'], hint='One collar, two sleeves: one c, two s.', explain='“Necessary” has one c and two s’s.')
B.add(P, p, A, 2, 'identify', 'Which sentence uses the apostrophe correctly for more than one owner?', options=['The girls’ changing room was locked.', 'The girl’s’ changing room was locked.', 'The girls changing’ room was locked.', 'The girls’s changing room was locked.'],
      hint='For a plural ending in s, add the apostrophe after the s.', explain='“Girls’” shows the room belongs to several girls.')
B.add(P, p, K, 2, 'identify', 'Which word is spelt correctly?', options=['separate', 'seperate', 'seprate', 'separete'], hint='There is “a rat” in it.', explain='Sep-a-rate: “separate”.')
s = 'e-sentences'
B.add(P, s, A, 2, 'identify', 'Which is a complex sentence?', options=['When the bell rang, everyone hurried outside.', 'The bell rang.', 'The bell rang and everyone hurried outside.', 'Hurry outside!'],
      hint='A complex sentence has a main clause and a subordinate clause.', explain='“When the bell rang” is a subordinate clause attached to the main clause.')
B.add(P, s, A, 2, 'identify', 'Which word best fills the gap to show contrast? “The test was difficult; ___, most pupils passed.”', options=['however', 'therefore', 'because', 'meanwhile'],
      mistakes={'therefore': '“Therefore” shows a result, not a contrast'}, hint='The second part is surprising given the first.', explain='“However” signals a contrast.')
B.add(P, s, A, 2, 'identify', 'Which is the best opening for a new paragraph about a change of time?', options=['Later that afternoon,', 'And then', 'Also,', 'But'],
      hint='Paragraphs can start with a time adverbial.', explain='“Later that afternoon” clearly signals a time change.')
B.add(P, s, R, 3, 'identify', 'Which sentence is the clearest and most precise?', options=['The exhausted runner collapsed across the finish line.', 'The runner was really really tired and fell at the end.', 'The runner did a thing at the end.', 'The tired runner who was tired fell over the line.'],
      hint='Look for precise vocabulary and no repetition.', explain='Precise words (“exhausted”, “collapsed”) say more in fewer words.')
B.add(P, s, R, 3, 'identify', 'Which sentence has been edited correctly? “the children was playing football when it started to rain”', options=['The children were playing football when it started to rain.', 'The children was playing football when it started to rain.', 'the children were playing football, when it started to rain', 'The Children were playing Football when it started to rain.'],
      hint='Capital letter, verb agreement, full stop.', explain='“Children” is plural, so “were”; start with a capital and end with a full stop.')
B.add(P, s, A, 2, 'identify', 'Which pair of sentences is joined correctly?', options=['The film was long, but it was exciting.', 'The film was long, it was exciting.', 'The film was long but, it was exciting.', 'The film was long it was exciting.'],
      mistakes={'The film was long, it was exciting.': 'This is a comma splice'}, hint='Use a conjunction with the comma.', explain='A comma plus a conjunction (“but”) joins two main clauses.')
B.add(P, s, R, 3, 'identify', 'Which word is the best cohesive device to add an idea? “Bikes are good exercise. ___, they do not pollute the air.”', options=['Furthermore', 'However', 'Instead', 'Although'],
      hint='You are adding a second reason.', explain='“Furthermore” adds another point in the same direction.')
v = 'e-vocab'
B.add(P, v, K, 1, 'give', 'Which word is an antonym (opposite) of “ancient”?', options=['modern', 'old', 'historic', 'aged'], hint='Opposite of very old.', explain='“Modern” means new or recent.')
B.add(P, v, A, 2, 'give', 'Which suffix turns “enjoy” into a noun?', options=['-ment', '-ly', '-ed', '-ful'], hint='enjoy + ? = a noun', explain='enjoy + ment = enjoyment.')
B.add(P, v, A, 2, 'give', 'Which word is the most precise synonym for “walked” in: “The tired soldier ___ slowly home.”?', options=['trudged', 'skipped', 'sprinted', 'hopped'], hint='Think about how a tired person walks.', explain='“Trudged” means walked slowly and heavily.')
B.add(P, v, R, 3, 'give', '“The scientist was meticulous, checking every measurement three times.” What does “meticulous” mean?', options=['very careful and precise', 'careless', 'very fast', 'forgetful'], hint='Use the clue in the rest of the sentence.', explain='Checking everything three times shows great care — “meticulous”.')
B.add(P, v, A, 2, 'give', 'What does the root “aqua” mean in “aquarium” and “aquatic”?', options=['water', 'fish', 'blue', 'air'], hint='Think about what an aquarium holds.', explain='“Aqua” comes from the Latin for water.')

# ------------------------------------------------------- mock: mangroves
pq(X, 'px1', 'e-retrieve', K, 1, 'give', 'What is the name of the thin roots that poke out of the mud?', options=['pneumatophores', 'stilts', 'seedlings', 'nurseries'], hint='Paragraph 2.', explain='Paragraph 2 names them pneumatophores.')
pq(X, 'px1', 'e-retrieve', A, 2, 'give', 'Give two ways mangroves protect people, according to paragraph 4.', multi=(['They slow down waves', 'They trap mud and stop coastlines washing away', 'They provide fruit to eat', 'They cool the air', 'They stop it from raining'], ['They slow down waves', 'They trap mud and stop coastlines washing away']),
   hint='Select both correct answers.', explain='Roots slow waves and trap mud, reducing storm damage and erosion.')
pq(X, 'px1', 'e-language', R, 3, 'explain', 'Why does the writer call mangrove forests “nurseries for the sea”?', options=['Young sea creatures grow up safely among the roots', 'People plant baby trees there', 'The forests are full of schools', 'The sea is very young there'],
   hint='What is a nursery for?', explain='Like a nursery for children, mangroves shelter young fish, crabs and shrimps while they grow.')
pq(X, 'px1', 'e-vocab', A, 2, 'give', 'In paragraph 1, what does “remarkable” mean?', options=['extraordinary', 'ordinary', 'tiny', 'dangerous'], hint='Worth remarking on.', explain='“Remarkable” means unusual or extraordinary.')
pq(X, 'px1', 'e-structure', R, 3, 'explain', 'How is the final paragraph different in tone from paragraph 4?', options=['It is hopeful, while paragraph 4 ends with a problem', 'It is angry, while paragraph 4 is calm', 'It is funny, while paragraph 4 is serious', 'There is no difference'],
   hint='Compare the last sentence of each paragraph.', explain='Paragraph 4 ends with loss of mangroves; the final paragraph talks of replanting and “a small promise”.')
pq(X, 'px1', 'e-infer', R, 3, 'explain', 'Why do you think the writer put “breathe” in inverted commas in paragraph 2?', options=['Because trees do not breathe exactly like animals do', 'Because someone is speaking', 'Because it is the title', 'Because it is spelt incorrectly'],
   hint='Is the word being used in a special way?', explain='The inverted commas show the word is used loosely — the roots let the tree take in air, which is not quite the same as breathing.')

# ---------------------------------------------------------- mock: audition
pq(X, 'px2', 'e-retrieve', K, 1, 'give', 'How many times had Leila practised the piece?', answer=112, hint='Paragraph 1.', explain='One hundred and twelve times.')
pq(X, 'px2', 'e-structure', R, 3, 'explain', 'Why is paragraph 2 only one sentence long?', options=['To emphasise the sudden shock of forgetting', 'Because the writer ran out of ideas', 'To describe the hall in detail', 'To introduce the judges'],
   hint='How does a very short paragraph affect the reader?', explain='A single-sentence paragraph stands out, highlighting Leila’s sudden panic.')
pq(X, 'px2', 'e-language', R, 3, 'explain', 'What does “her fingers felt as though they belonged to someone else” suggest?', options=['She was so nervous she felt she could not control her hands', 'She was wearing gloves', 'Her fingers were injured', 'Someone else was playing'],
   hint='How does fear affect the body?', explain='Nerves made her feel disconnected from her own hands.')
pq(X, 'px2', 'e-infer', R, 3, 'explain', 'What helped Leila remember the music?', options=['Thinking about home, her practice and her brother', 'The judge played the first note', 'She read the music from a sheet', 'She left the hall and came back'],
   hint='Paragraph 4.', explain='She closed her eyes and thought of her bedroom, tally marks and brother — familiar, calming memories.')
pq(X, 'px2', 'e-language', A, 2, 'identify', 'Which technique is used in “like water from a tap that had been stuck for years”?', options=['Simile', 'Personification', 'Rhetorical question', 'Alliteration'], hint='Look for “like”.', explain='It compares the music to water using “like” — a simile.')
pq(X, 'px2', 'e-infer', R, 3, 'explain', 'What does the ending suggest about Leila’s performance?', options=['It was very good and moved the judge', 'The judges were bored', 'She made many mistakes', 'The judges did not hear it'],
   hint='Why might a judge clap quietly after silence?', explain='The silence followed by the judge clapping suggests the performance impressed and moved her.')

# --------------------------------------------------------- mock: bicycles
pq(X, 'px3', 'e-retrieve', K, 1, 'give', 'In which year was the wooden “running machine” built?', answer=1817, hint='Paragraph 1.', explain='1817.')
pq(X, 'px3', 'e-retrieve', A, 2, 'give', 'Why were penny-farthings dangerous?', options=['Riders could be thrown over the handlebars if they hit a stone', 'They had no wheels', 'They were too slow', 'They had air-filled tyres'], hint='Paragraph 2.', explain='Hitting a stone could throw the rider head-first over the handlebars.')
pq(X, 'px3', 'e-structure', A, 2, 'identify', 'How is this text mainly organised?', options=['In time order (chronologically)', 'As a list of instructions', 'As a story with dialogue', 'As an argument for and against'],
   hint='Look at the dates and time words.', explain='It moves from 1817 to the 1860s, 1880s and today — chronological order.')
pq(X, 'px3', 'e-infer', R, 3, 'explain', 'Why did cycling become popular with “ordinary people”?', options=['Safer bicycles let them travel further without needing a horse', 'Bicycles were given away free', 'Horses were banned', 'Penny-farthings were cheap'],
   hint='Paragraphs 3 and 4.', explain='The safer, more comfortable design meant ordinary people could travel several kilometres cheaply.')
pq(X, 'px3', 'e-vocab', A, 2, 'give', 'In paragraph 5, what does “instantly” mean?', options=['immediately', 'slowly', 'never', 'carefully'], hint='In an instant.', explain='“Instantly” means at once.')

# --------------------------------------------------------- mock: fog market
pq(X, 'px4', 'e-retrieve', K, 1, 'give', 'When does the market appear?', options=['On the first foggy morning of autumn', 'Every Saturday', 'On Ben’s birthday', 'At midnight in winter'], hint='Paragraph 1.', explain='“On the first foggy morning of autumn.”')
pq(X, 'px4', 'e-infer', R, 3, 'explain', 'What does paragraph 2 tell us about Ben’s attitude before he visits?', options=['He was doubtful and did not believe the stories', 'He was terrified of the market', 'He had visited many times', 'He wanted to buy a clock'],
   hint='“He had never believed a word.”', explain='He had heard the stories but did not believe them — he was sceptical.')
pq(X, 'px4', 'e-language', R, 3, 'explain', 'What does the description of the stallholder’s coat suggest about her?', options=['She is mysterious and may have travelled to many places', 'She is a tailor', 'She is poor', 'She is very cold'],
   hint='Maps are linked with journeys.', explain='A coat stitched from maps hints at travel and mystery, fitting the magical market.')
pq(X, 'px4', 'e-infer', R, 3, 'explain', 'Why do you think Ben decided not to buy a memory and went to find his sister instead?', options=['He realised he could make real good memories with the people he loves', 'He did not have any money', 'The stallholder frightened him', 'He forgot what he wanted'],
   hint='He had a coin. What did he choose to do instead?', explain='He had the coin but chose to go home to his sister — suggesting real memories with family matter more.')
pq(X, 'px4', 'e-structure', R, 3, 'explain', 'How does the opening paragraph hook the reader?', options=['It describes a mysterious market that appears without anyone seeing it arrive', 'It explains how fog forms', 'It lists the prices at the market', 'It introduces Ben’s sister'],
   hint='What makes you want to read on?', explain='A market that appears from nowhere creates mystery and curiosity.')

# --------------------------------------------------------- mock: language
B.add(X, 'e-grammar', K, 1, 'identify', 'Which word is an adjective? “The enormous whale swam slowly.”', options=['enormous', 'whale', 'swam', 'slowly'], hint='Adjectives describe nouns.', explain='“Enormous” describes the whale.')
B.add(X, 'e-grammar', A, 2, 'identify', 'Which sentence is in the future tense?', options=['We will visit our cousins next week.', 'We visited our cousins last week.', 'We are visiting our cousins now.', 'We visit our cousins every week.'], hint='Look for “will”.', explain='“Will visit” refers to the future.')
B.add(X, 'e-grammar', R, 3, 'identify', 'Which sentence is grammatically correct?', options=['Neither of the boys was ready.', 'Neither of the boys were ready.', 'Neither of the boys are ready.', 'Neither of the boys be ready.'],
      hint='“Neither” is singular.', explain='“Neither” takes a singular verb: “was”.')
B.add(X, 'e-punct', A, 2, 'identify', 'Which sentence is punctuated correctly?', options=['“Look out!” shouted Mum. “There’s a car coming.”', '“Look out! shouted Mum.” There’s a car coming.', 'Look out! “shouted Mum” There’s a car coming.', '“Look out” shouted Mum! “There’s a car coming”'],
      hint='Spoken words and their punctuation go inside speech marks.', explain='Each piece of speech is inside its own speech marks with its punctuation.')
B.add(X, 'e-punct', A, 2, 'identify', 'Which sentence uses a dash correctly?', options=['I opened the box — it was empty.', 'I — opened the box it was empty.', 'I opened — the box it was empty.', 'I opened the box it was — empty.'], hint='A dash can show a pause before extra information.', explain='The dash separates two related clauses for dramatic effect.')
B.add(X, 'e-punct', K, 1, 'identify', 'Which word is spelt correctly?', options=['definitely', 'definately', 'definitly', 'defanitely'], hint='It contains the word “finite”.', explain='De-finite-ly.')
B.add(X, 'e-sentences', A, 2, 'identify', 'Which is the best way to combine: “The fox was hungry. The fox crept towards the henhouse.”?', options=['The hungry fox crept towards the henhouse.', 'The fox was hungry, the fox crept towards the henhouse.', 'The fox was hungry and the fox crept towards the henhouse.', 'Hungry, the fox was hungry and crept.'],
      hint='Avoid repeating “the fox”.', explain='Using “hungry” as an adjective combines the ideas without repetition.')
B.add(X, 'e-sentences', R, 3, 'identify', 'Which sentence uses a fronted adverbial with correct punctuation?', options=['Without a sound, the cat leapt onto the wall.', 'Without a sound the cat, leapt onto the wall.', 'The cat leapt, without a sound onto the wall.', 'Without, a sound the cat leapt onto the wall.'],
      hint='A comma follows the fronted adverbial.', explain='“Without a sound,” is fronted and followed by a comma.')
B.add(X, 'e-vocab', A, 2, 'give', 'Which prefix means “not” in “impossible”?', options=['im-', 'pos-', '-ible', '-sib-'], hint='Look at the beginning.', explain='“im-” means not: not possible.')
B.add(X, 'e-vocab', R, 3, 'give', '“After the long drought, the river was barely a trickle.” What does “drought” mean?', options=['a long period with little or no rain', 'a flood', 'a storm', 'a cold winter'], hint='The river was nearly empty.', explain='A drought is a long time with very little rain.')
B.add(X, 'e-grammar', A, 2, 'identify', 'Which sentence contains a subordinate clause beginning with a conjunction?', options=['Although she was tired, Mia finished her homework.', 'Mia finished her homework.', 'Mia was tired and finished her homework.', 'Finish your homework, Mia.'], hint='Subordinating conjunctions: although, because, when, if …', explain='“Although she was tired” is a subordinate clause.')

for p in PASSAGES:
    assert any(q.get('passage') == p['id'] for q in B.items), p['id']

n = B.dump(sys.argv[1])
with open(sys.argv[2], 'w') as f:
    json.dump({'version': 1, 'note': 'All passages are original texts written for this site.', 'passages': PASSAGES}, f, indent=1, ensure_ascii=False)
print('english', n, 'passages', len(PASSAGES))
