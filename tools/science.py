import sys
from qlib import Bank, table, bar, line, svg

B = Bank('science', 's')
D, P, X = 'diagnostic', 'practice', 'mock'
K, A, R = 'knowledge', 'application', 'reasoning'

# ------------------------------------------------------------ human body
t = 's-body'
B.add(D, t, K, 1, 'identify', 'Which organ pumps blood around the body?', options=['Heart', 'Lungs', 'Liver', 'Stomach'],
      hint='It is a muscle in your chest that beats.', explain='The heart is a muscular pump that pushes blood through blood vessels.')
B.add(D, t, A, 2, 'explain', 'Why does your heart beat faster when you run?',
      options=['Your muscles need more oxygen and food, so blood must be delivered faster', 'Running makes your blood thicker', 'The heart is trying to cool you down', 'Your lungs stop working while you run'],
      mistakes={'The heart is trying to cool you down': 'Sweating cools you; the heart rate rises to supply oxygen'},
      hint='Think about what working muscles need.', explain='Working muscles use more oxygen and glucose. The heart beats faster to carry more blood (and oxygen) to them.')
B.add(P, t, K, 1, 'identify', 'Which blood vessels carry blood away from the heart?', options=['Arteries', 'Veins', 'Capillaries', 'Nerves'],
      mistakes={'Veins': 'Veins carry blood back to the heart'}, hint='A for Away.', explain='Arteries carry blood away from the heart; veins carry it back.')
B.add(P, t, K, 1, 'identify', 'Where does most digestion and absorption of food into the blood happen?', options=['Small intestine', 'Large intestine', 'Mouth', 'Oesophagus'],
      mistakes={'Large intestine': 'The large intestine mainly absorbs water'}, hint='It is a long, coiled tube after the stomach.', explain='Digested food is absorbed into the blood through the wall of the small intestine.')
B.add(P, t, K, 1, 'describe', 'What is the main job of the lungs?', options=['To take oxygen into the blood and remove carbon dioxide', 'To pump blood', 'To digest food', 'To filter waste from blood to make urine'],
      hint='Breathing.', explain='In the lungs, oxygen passes into the blood and carbon dioxide passes out to be breathed out.')
B.add(P, t, A, 2, 'identify', 'Which food group mainly helps the body grow and repair itself?', options=['Proteins', 'Carbohydrates', 'Fats', 'Fibre'],
      mistakes={'Carbohydrates': 'Carbohydrates mainly provide energy'}, hint='Found in eggs, beans, fish and meat.', explain='Proteins are used for growth and repair.')
B.add(P, t, A, 2, 'sort', 'Put these in the order food passes through them: stomach, mouth, small intestine, oesophagus. Type them separated by commas.',
      answer=['mouth, oesophagus, stomach, small intestine'], hint='Food starts in the mouth.', explain='Mouth → oesophagus (food pipe) → stomach → small intestine.')
B.add(P, t, R, 3, 'explain', 'A student’s pulse was 72 beats per minute at rest and 130 after exercise. Five minutes later it was 80. What does this show?',
      options=['Heart rate rises during exercise and returns towards the resting rate afterwards', 'Exercise permanently increases heart rate', 'The pulse was measured incorrectly', 'Resting makes the heart beat faster'],
      hint='Compare all three readings.', explain='The pulse rose with exercise, then fell back towards 72 during rest — this is recovery.')
B.add(P, t, R, 3, 'suggest', 'Why do doctors advise eating foods that contain fibre?', options=['Fibre helps food move through the intestines and prevents constipation', 'Fibre gives the most energy', 'Fibre builds muscles', 'Fibre carries oxygen in the blood'],
      hint='Think about the digestive system.', explain='Fibre is not digested but keeps the gut working well, helping food move through.')
B.add(P, t, A, 2, 'identify', 'Which organ filters the blood to remove waste and make urine?', options=['Kidneys', 'Liver', 'Heart', 'Lungs'], hint='There are two, in your lower back.', explain='The kidneys filter waste from the blood, producing urine.')
B.add(X, t, K, 1, 'identify', 'Which part of the blood carries oxygen?', options=['Red blood cells', 'White blood cells', 'Platelets', 'Plasma'], hint='Their colour comes from a substance that holds oxygen.', explain='Red blood cells carry oxygen around the body.')
B.add(X, t, A, 2, 'explain', 'Why is smoking harmful to the lungs?', options=['Smoke damages the lungs, making it harder for oxygen to pass into the blood', 'Smoke gives the lungs extra oxygen', 'Smoke only affects the teeth', 'Smoke makes the heart beat more slowly so it rests'],
      hint='Think about what the lungs need to do.', explain='Chemicals and tar in smoke damage lung tissue, so less oxygen gets into the blood.')
B.add(X, t, R, 3, 'predict', 'Predict what happens to breathing rate during exercise, and why.', options=['It increases, to take in more oxygen and remove more carbon dioxide', 'It decreases, to save energy', 'It stays the same because breathing is automatic', 'It stops until the exercise is over'],
      hint='Muscles need more oxygen.', explain='Breathing gets faster and deeper so more oxygen reaches the blood and more carbon dioxide is removed.')

# ----------------------------------------------------------------- plants
t = 's-plants'
B.add(D, t, K, 1, 'identify', 'Which part of a plant takes in water from the soil?', options=['Roots', 'Leaves', 'Flowers', 'Petals'],
      hint='It is underground.', explain='Roots absorb water and minerals from the soil and anchor the plant.')
B.add(D, t, A, 2, 'explain', 'A plant is kept in a dark cupboard for two weeks. Its leaves turn yellow. Why?',
      options=['Without light the plant cannot make its own food', 'The cupboard was too cold for any plant', 'Plants only need water, so it was over-watered', 'The soil turned yellow'],
      hint='What do plants need light for?', explain='Plants use light energy to make food in their leaves. Without light they cannot make food and become weak and yellow.')
B.add(P, t, K, 1, 'identify', 'What is the main job of the leaves?', options=['To make food for the plant using light', 'To hold the plant in the soil', 'To attract insects', 'To store seeds'],
      hint='They are usually green and flat.', explain='Leaves capture light to make food for the plant.')
B.add(P, t, K, 1, 'describe', 'What is pollination?', options=['The transfer of pollen from the male part to the female part of a flower', 'When a seed starts to grow', 'When seeds are carried away from the plant', 'When a plant takes in water'],
      mistakes={'When a seed starts to grow': 'That is germination', 'When seeds are carried away from the plant': 'That is seed dispersal'},
      hint='It involves pollen.', explain='Pollination is the transfer of pollen from the anther (male) to the stigma (female).')
B.add(P, t, A, 2, 'identify', 'A seed has hooks that stick to animal fur. How is it dispersed?', options=['By animals', 'By wind', 'By water', 'By exploding'], hint='Hooks catch onto something.', explain='Hooked seeds catch in fur and are carried to new places by animals.')
B.add(P, t, A, 2, 'explain', 'Why is it useful for seeds to be dispersed away from the parent plant?',
      options=['So new plants do not compete with the parent for light, water and space', 'So the parent plant can rest', 'So the seeds can be eaten more easily', 'It is not useful'],
      hint='What would happen if all seeds grew underneath the parent?', explain='Seeds spread out so seedlings are not competing with each other and the parent for resources.')
B.add(P, t, K, 1, 'identify', 'Which of these is NOT needed for a seed to germinate?', options=['Light', 'Water', 'Warmth', 'Oxygen (air)'],
      hint='Many seeds germinate underground.', explain='Seeds need water, warmth and air to germinate. Light is needed later for growth, once leaves appear.')
B.add(P, t, R, 3, 'explain', 'Celery is placed in water with blue food colouring. After a day the leaves have blue streaks. What does this show?',
      options=['Water is carried up the stem to the leaves', 'Leaves make blue colouring', 'Roots absorb light', 'The stem stores food'],
      hint='Follow the path of the colouring.', explain='The coloured water travelled up tubes in the stem to the leaves, showing how water is transported.')
B.add(P, t, R, 3, 'suggest', 'Why do many flowers have brightly coloured petals and a sweet smell?', options=['To attract insects for pollination', 'To scare away animals', 'To absorb more water', 'To make more light for the leaves'],
      hint='What visits flowers?', explain='Colour and scent attract insects, which carry pollen from flower to flower.')
B.add(X, t, K, 1, 'identify', 'What does the stem do?', options=['Supports the plant and carries water to the leaves', 'Makes seeds', 'Absorbs light to make food', 'Attracts insects'], hint='It holds the plant up.', explain='The stem supports the plant and transports water and nutrients.')
B.add(X, t, A, 2, 'explain', 'Dandelion seeds have a light, fluffy “parachute”. How are they dispersed?', options=['By wind', 'By animals eating them', 'By water', 'By the plant throwing them'], hint='Light and fluffy.', explain='The parachute catches the wind and carries the seed away.')
B.add(X, t, R, 3, 'predict', 'Two identical plants are given the same water and light, but one is kept at 5 °C and one at 22 °C. Predict which grows better.',
      options=['The plant at 22 °C, because warmth helps growth', 'The plant at 5 °C, because cold helps growth', 'Both grow the same because they have the same water and light', 'Neither will grow'],
      hint='Plants need warmth.', explain='Most plants grow better in warm conditions, so the plant at 22 °C should grow better.')

# ---------------------------------------------- living things & environments
t = 's-eco'
B.add(D, t, K, 1, 'identify', 'In the food chain grass → rabbit → fox, which is the producer?', options=['Grass', 'Rabbit', 'Fox', 'The Sun'],
      mistakes={'The Sun': 'The Sun provides energy but is not a living producer'}, hint='Producers make their own food.', explain='Grass is a plant; it makes its own food using light, so it is the producer.')
B.add(D, t, R, 3, 'predict', 'In the food chain grass → rabbit → fox, what would probably happen to the grass if most of the foxes died?',
      options=['Less grass, because more rabbits would survive to eat it', 'More grass, because foxes eat grass', 'No change, because foxes do not eat grass', 'More grass, because rabbits would die out'],
      hint='Think about the rabbits first.', explain='Fewer foxes → more rabbits survive → rabbits eat more grass → less grass.')
B.add(P, t, K, 1, 'describe', 'What do the arrows in a food chain show?', options=['The direction energy (food) is passed', 'Which animal is bigger', 'Which animal eats the arrow’s starting organism', 'Where animals live'],
      mistakes={'Which animal eats the arrow’s starting organism': 'Close, but the arrow points to the eater, showing energy flow'}, hint='Arrows point from the food to the eater.', explain='Arrows show the flow of energy from the organism eaten to the organism that eats it.')
B.add(P, t, K, 1, 'identify', 'An animal that eats only plants is called a…', options=['Herbivore', 'Carnivore', 'Omnivore', 'Producer'], hint='Herb = plant.', explain='Herbivores eat only plants.')
B.add(P, t, A, 2, 'identify', 'Use the key. An animal has six legs and wings. Which group is it in?',
      options=['Insect', 'Spider', 'Bird', 'Fish'],
      stimulus=table(['Question', 'Yes', 'No'], [['1. Does it have six legs?', 'Go to 2', 'Go to 3'], ['2. Does it have wings?', 'Insect', 'Insect (without wings)'], ['3. Does it have eight legs?', 'Spider', 'Go to 4'], ['4. Does it have feathers?', 'Bird', 'Fish']], 'Classification key'),
      hint='Start at question 1 and follow the answers.', explain='Six legs → question 2 → wings → insect.')
B.add(P, t, A, 2, 'explain', 'How is a polar bear adapted to its cold habitat?', options=['Thick fur and a layer of fat keep it warm', 'Large ears to lose heat', 'Thin skin to feel the snow', 'Dark fur to stand out from the snow'],
      hint='What keeps an animal warm?', explain='Thick fur and fat insulate the polar bear; white fur also gives camouflage.')
B.add(P, t, A, 2, 'explain', 'Why do cactus plants have spines instead of wide leaves?', options=['Spines lose less water and protect the plant from animals', 'Spines absorb more sunlight', 'Spines help it float', 'Spines attract insects'],
      hint='Deserts are very dry.', explain='Spines have a small surface area so the cactus loses less water; they also deter animals.')
B.add(P, t, R, 3, 'explain', 'Farmers spray a chemical to kill insects on crops. Birds in the area become fewer. Which is the best explanation?',
      options=['The birds had fewer insects to eat, or ate poisoned insects', 'The chemical made the crops grow taller', 'Birds do not like the smell of crops', 'The birds migrated because it was winter'],
      hint='Think about the food chain crop → insect → bird.', explain='Killing insects removes the birds’ food, and birds that eat poisoned insects may be harmed.')
B.add(P, t, R, 3, 'suggest', 'Which action would best help protect a local habitat?', options=['Planting native trees and reducing litter', 'Building a car park on the meadow', 'Removing all the insects', 'Draining the pond'],
      hint='Which choice gives living things food and shelter?', explain='Native trees provide food and shelter; reducing litter protects animals.')
B.add(P, t, K, 2, 'identify', 'In the food chain leaf → caterpillar → bird → hawk, which animal is the top predator?', options=['Hawk', 'Bird', 'Caterpillar', 'Leaf'], hint='Nothing eats it in this chain.', explain='The hawk is at the end of the chain; nothing in the chain eats it.')
B.add(X, t, K, 1, 'identify', 'Which is a vertebrate?', options=['Frog', 'Worm', 'Snail', 'Spider'], hint='Vertebrates have a backbone.', explain='A frog has a backbone; the others are invertebrates.')
B.add(X, t, A, 2, 'identify', 'In the food chain seaweed → limpet → crab → seagull, which organism is a prey but not a predator?', options=['Limpet', 'Crab', 'Seagull', 'Seaweed'],
      hint='It is eaten, but only eats plants.', explain='The limpet is eaten by the crab, but it eats seaweed (a plant), so it is not a predator.')
B.add(X, t, R, 3, 'explain', 'Camels have wide, flat feet. How does this help them survive in the desert?', options=['They spread the camel’s weight so it does not sink into sand', 'They store water', 'They help it swim', 'They keep it cool by releasing heat'],
      hint='Think about walking on sand.', explain='Wide feet spread the weight over a larger area, so the camel does not sink into soft sand.')

# ---------------------------------------------------- materials & states
t = 's-matter'
B.add(D, t, K, 1, 'describe', 'Which statement describes the particles in a solid?', options=['Close together in a fixed pattern, vibrating in place', 'Far apart and moving quickly in all directions', 'Close together but able to move past each other', 'Not moving at all and spread far apart'],
      mistakes={'Close together but able to move past each other': 'That describes a liquid', 'Far apart and moving quickly in all directions': 'That describes a gas'},
      hint='Solids keep their shape.', explain='Solid particles are tightly packed in a regular pattern and can only vibrate.')
B.add(D, t, A, 2, 'explain', 'A puddle disappears on a sunny day. What has happened to the water?', options=['It has evaporated and become water vapour in the air', 'It has melted into the ground', 'It has condensed', 'It has frozen'],
      mistakes={'It has condensed': 'Condensation is gas turning to liquid — the opposite'}, hint='Heat turns liquid into a gas.', explain='The Sun’s heat makes liquid water evaporate into water vapour, a gas.')
B.add(P, t, K, 1, 'identify', 'What is the change from a liquid to a solid called?', options=['Freezing', 'Melting', 'Evaporation', 'Condensation'], hint='Water becoming ice.', explain='Freezing is when a liquid turns into a solid.')
B.add(P, t, K, 1, 'identify', 'Which property makes copper a good choice for electrical wires?', options=['It conducts electricity', 'It is magnetic', 'It is transparent', 'It is soft like rubber'], hint='Wires carry electric current.', explain='Copper is a good electrical conductor.')
B.add(P, t, A, 2, 'explain', 'Water droplets form on the outside of a cold glass of juice. Where does the water come from?', options=['Water vapour in the air condenses on the cold glass', 'Juice leaks through the glass', 'The glass is melting', 'The ice is evaporating'],
      mistakes={'Juice leaks through the glass': 'Glass is not permeable; the water comes from the air'}, hint='The air contains water vapour.', explain='Water vapour in the air cools when it touches the cold glass and condenses into liquid droplets.')
B.add(P, t, A, 2, 'explain', 'Why does a gas fill any container it is put in?', options=['Its particles are far apart and move freely in all directions', 'Its particles are heavier than air', 'Its particles are tightly packed', 'Gases have a fixed shape'],
      hint='Think about particle spacing and movement.', explain='Gas particles move quickly and freely, spreading out to fill the whole space.')
B.add(P, t, A, 2, 'identify', 'Which material would be best for a saucepan handle?', options=['Wood or plastic, because they are thermal insulators', 'Steel, because it conducts heat well', 'Glass, because it is transparent', 'Copper, because it is shiny'],
      hint='You do not want the handle to get hot.', explain='Handles should be thermal insulators so heat does not travel to your hand.')
B.add(P, t, R, 3, 'explain', 'Wet clothes dry faster on a warm, windy day than on a cold, still day. Why?', options=['Warmth and wind both increase the rate of evaporation', 'Wind adds water to the clothes', 'Cold air makes water evaporate faster', 'The clothes melt in the warmth'],
      hint='Think about what speeds up evaporation.', explain='Higher temperature gives particles more energy, and wind carries water vapour away, so evaporation is faster.')
B.add(P, t, K, 2, 'identify', 'At what temperature does pure water boil at sea level?', options=['100 °C', '0 °C', '50 °C', '212 °C'],
      mistakes={'0 °C': 'That is the freezing/melting point', '212 °C': '212 is the boiling point in °F, not °C'}, hint='It is a round number in °C.', explain='Pure water boils at 100 °C at sea level.')
B.add(P, t, R, 3, 'explain', 'Chocolate melts in your hand but not in the fridge. What does this tell you?', options=['Its melting point is between fridge temperature and body temperature', 'Chocolate cannot freeze', 'Hands are colder than fridges', 'Melting needs light'],
      hint='Compare the temperatures.', explain='Your hand (about 37 °C) is above chocolate’s melting point; the fridge is below it.')
B.add(X, t, K, 1, 'identify', 'Which is a gas at room temperature?', options=['Oxygen', 'Iron', 'Water', 'Salt'], hint='You breathe it.', explain='Oxygen is a gas at room temperature.')
B.add(X, t, A, 2, 'explain', 'Why does steam on a bathroom mirror turn into water droplets?', options=['The steam cools on the mirror and condenses', 'The mirror melts the steam', 'The steam evaporates', 'The mirror absorbs the steam'], hint='Gas → liquid.', explain='Water vapour cools on the cold mirror and condenses into liquid water.')
B.add(X, t, R, 3, 'suggest', 'Why are winter coats often filled with feathers or fibres that trap air?', options=['Trapped air is a good thermal insulator, reducing heat loss', 'Air conducts heat into the body', 'Feathers are magnetic', 'Air makes the coat heavier'],
      hint='Think about insulators.', explain='Trapped air is a poor conductor of heat, so it slows heat loss from the body.')

# ----------------------------------------------------- mixtures & changes
t = 's-change'
B.add(D, t, A, 2, 'identify', 'How would you separate sand from water?', options=['Filtering', 'Using a magnet', 'Sieving with large holes', 'Melting'],
      mistakes={'Using a magnet': 'Sand is not magnetic'}, hint='Filter paper lets water through but not the sand grains.', explain='Filtering traps sand on the filter paper while water passes through.')
B.add(D, t, K, 1, 'identify', 'Which of these is an irreversible change?', options=['Burning wood', 'Melting ice', 'Dissolving sugar in water', 'Freezing water'],
      mistakes={'Dissolving sugar in water': 'Dissolving is reversible — evaporating the water gets the sugar back'}, hint='Which one makes new materials that cannot be changed back?', explain='Burning makes new substances (ash, smoke, gases) and cannot be reversed.')
B.add(P, t, K, 1, 'describe', 'When salt dissolves in water, what has happened?', options=['The salt has broken into tiny particles mixed among the water particles', 'The salt has disappeared completely', 'The salt has melted', 'The salt has turned into water'],
      mistakes={'The salt has melted': 'Melting needs heat; dissolving is mixing into a liquid', 'The salt has disappeared completely': 'The salt is still there — the water tastes salty'}, hint='Taste the water — is the salt still there?', explain='The salt is still present but spread out as tiny particles: a solution.')
B.add(P, t, A, 2, 'identify', 'How could you get the salt back from salty water?', options=['Evaporate the water', 'Filter it', 'Use a sieve', 'Use a magnet'],
      mistakes={'Filter it': 'Dissolved salt passes straight through filter paper'}, hint='Leave it somewhere warm.', explain='Evaporating the water leaves the salt crystals behind.')
B.add(P, t, A, 2, 'identify', 'How could you separate iron filings from sand?', options=['Use a magnet', 'Filter the mixture', 'Evaporate', 'Add water and stir'], hint='Iron has a special property.', explain='Iron is magnetic and sand is not.')
B.add(P, t, A, 2, 'identify', 'Which change will make sugar dissolve faster in water?', options=['Using warmer water and stirring', 'Using colder water', 'Using bigger sugar lumps', 'Leaving it completely still'],
      hint='Think about temperature, stirring and particle size.', explain='Warm water and stirring both speed up dissolving (as do smaller grains).')
B.add(P, t, R, 3, 'explain', 'A student says “Cooking an egg is a reversible change because the egg is still an egg.” Is she right?',
      options=['No — cooking makes new substances; the egg cannot be made raw again', 'Yes — the egg can be cooled back to raw', 'Yes — all changes involving heat are reversible', 'No — because eggs are solids'],
      hint='Can you un-cook an egg?', explain='Cooking permanently changes the egg — it is an irreversible change.')
B.add(P, t, R, 3, 'suggest', 'You have a mixture of rice, salt and water. Which order of steps separates all three?',
      options=['Sieve out the rice, then evaporate the water to leave salt', 'Evaporate first, then filter', 'Use a magnet, then sieve', 'Filter the salt, then sieve the water'],
      hint='Start with the biggest pieces.', explain='A sieve removes the rice; evaporating the salty water leaves the salt.')
B.add(P, t, K, 2, 'identify', 'Which word describes a solid that does NOT dissolve in water?', options=['Insoluble', 'Soluble', 'Transparent', 'Flexible'], hint='In- means not.', explain='An insoluble substance does not dissolve.')
B.add(X, t, K, 1, 'identify', 'Which of these is a reversible change?', options=['Melting chocolate', 'Baking a cake', 'Rusting iron', 'Burning paper'], hint='Can it be changed back?', explain='Melted chocolate can be cooled to become solid again.')
B.add(X, t, A, 2, 'identify', 'Which equipment separates large stones from fine soil?', options=['A sieve', 'Filter paper', 'A magnet', 'A thermometer'], hint='Holes of a certain size.', explain='A sieve lets the fine soil through and keeps the large stones.')
B.add(X, t, R, 3, 'explain', 'Why does more sugar dissolve in hot tea than in cold tea?', options=['Particles move faster in hot liquids, so sugar dissolves faster and more of it can dissolve', 'Hot tea contains less water', 'Sugar melts in hot tea', 'Cold tea is already full of sugar'],
      hint='Think about particles and temperature.', explain='In hotter liquids particles move faster, so the solid dissolves faster and more can dissolve before the solution is saturated.')

# ------------------------------------------------------------ forces
t = 's-forces'
B.add(D, t, K, 1, 'identify', 'What is the unit used to measure force?', options=['Newton (N)', 'Kilogram (kg)', 'Metre (m)', 'Litre (l)'],
      mistakes={'Kilogram (kg)': 'Kilograms measure mass, not force'}, hint='Named after a famous scientist.', explain='Force is measured in newtons (N) using a forcemeter.')
B.add(D, t, A, 2, 'explain', 'A ball rolling across the grass slows down and stops. Which force causes this?', options=['Friction', 'Upthrust', 'Magnetism', 'Gravity pulling it forwards'],
      hint='This force acts between surfaces that rub.', explain='Friction between the ball and grass acts against the motion and slows the ball down.')
B.add(P, t, K, 1, 'describe', 'What is the difference between mass and weight?', options=['Mass is the amount of matter (kg); weight is the pull of gravity on it (N)', 'They are the same thing', 'Weight is measured in kg and mass in newtons', 'Mass changes on the Moon but weight does not'],
      mistakes={'Mass changes on the Moon but weight does not': 'It is the other way round: weight changes, mass stays the same'}, hint='One is measured in kg, the other in N.', explain='Mass (kg) stays the same everywhere; weight (N) depends on gravity.')
B.add(P, t, A, 2, 'explain', 'An astronaut goes to the Moon. What happens to her mass and weight?', options=['Her mass stays the same; her weight is less', 'Both become less', 'Her mass is less; her weight stays the same', 'Both stay the same'],
      hint='The Moon’s gravity is weaker.', explain='Mass does not change, but weaker gravity means her weight is less.')
B.add(P, t, A, 2, 'identify', 'A boat floats on water. Which two forces are balanced?', options=['Weight (gravity) and upthrust', 'Friction and gravity', 'Air resistance and magnetism', 'Upthrust and friction'],
      hint='One pulls down, one pushes up.', explain='The boat’s weight acts down and upthrust from the water acts up; they are balanced.')
B.add(P, t, A, 2, 'explain', 'Why does a parachute slow a skydiver down?', options=['Its large surface area increases air resistance', 'It reduces gravity', 'It makes the skydiver lighter', 'It increases upthrust from the ground'],
      hint='More surface pushing against the air…', explain='The large canopy pushes against lots of air, increasing air resistance.')
B.add(P, t, R, 3, 'predict', 'Two people push a box from opposite sides. One pushes with 30 N, the other with 50 N. What happens?',
      options=['The box moves towards the person pushing with 30 N', 'The box moves towards the person pushing with 50 N', 'The box stays still because both are pushing', 'The box moves upwards'],
      hint='The larger force wins.', explain='There is an unbalanced force of 20 N in the direction of the 50 N push — towards the person pushing with 30 N.')
B.add(P, t, R, 3, 'explain', 'A car is moving at a steady speed on a straight road. What can you say about the forces on it?',
      options=['The driving force and the resistive forces are balanced', 'There are no forces acting', 'The driving force is much bigger than friction', 'Gravity is pushing it forwards'],
      mistakes={'There are no forces acting': 'Forces still act, but they are balanced'}, hint='Steady speed means no change in motion.', explain='At a steady speed, forces are balanced: forward force = friction + air resistance.')
B.add(P, t, A, 2, 'identify', 'Which surface would give the most friction for a toy car?', options=['Carpet', 'Ice', 'Polished wood', 'Smooth plastic'], hint='Rough surfaces grip more.', explain='Carpet is the roughest surface, so it gives most friction.')
B.add(X, t, K, 1, 'identify', 'Which force pulls objects towards the Earth?', options=['Gravity', 'Friction', 'Upthrust', 'Air resistance'], hint='It makes things fall.', explain='Gravity pulls objects towards the centre of the Earth.')
B.add(X, t, A, 2, 'explain', 'Why are the soles of trainers made with a deep pattern?', options=['To increase friction and stop slipping', 'To reduce friction so you run faster', 'To make them lighter', 'To make them magnetic'], hint='Grip.', explain='The pattern increases friction between the shoe and the ground.')
B.add(X, t, R, 3, 'calculate', 'A forcemeter shows that a rock weighs 12 N in air and 8 N when hanging in water. What is the size of the upthrust in newtons?', answer=4, unit='N',
      mistakes={20: 'Added the readings'}, hint='Upthrust reduces the reading.', explain='12 − 8 = 4 N of upthrust.')

# --------------------------------------------------------- electricity
t = 's-elec'
circuit = svg('<svg viewBox="0 0 260 150" xmlns="http://www.w3.org/2000/svg" font-size="12"><rect x="30" y="30" width="200" height="90" fill="none" stroke="#1d2b44" stroke-width="2"/><rect x="105" y="22" width="50" height="16" fill="#fff"/><line x1="115" y1="20" x2="115" y2="40" stroke="#1d2b44" stroke-width="3"/><line x1="125" y1="25" x2="125" y2="35" stroke="#1d2b44" stroke-width="3"/><line x1="135" y1="20" x2="135" y2="40" stroke="#1d2b44" stroke-width="3"/><line x1="145" y1="25" x2="145" y2="35" stroke="#1d2b44" stroke-width="3"/><circle cx="90" cy="120" r="12" fill="#fff" stroke="#1d2b44" stroke-width="2"/><line x1="82" y1="112" x2="98" y2="128" stroke="#1d2b44" stroke-width="2"/><line x1="98" y1="112" x2="82" y2="128" stroke="#1d2b44" stroke-width="2"/><circle cx="170" cy="120" r="12" fill="#fff" stroke="#1d2b44" stroke-width="2"/><line x1="162" y1="112" x2="178" y2="128" stroke="#1d2b44" stroke-width="2"/><line x1="178" y1="112" x2="162" y2="128" stroke="#1d2b44" stroke-width="2"/><text x="112" y="14">battery</text><text x="70" y="145">lamp</text><text x="150" y="145">lamp</text></svg>', 'A series circuit')
B.add(D, t, A, 2, 'predict', 'Look at the circuit. What would happen if one lamp was removed?', stimulus=circuit,
      options=['The other lamp goes out because the circuit is broken', 'The other lamp gets brighter', 'The other lamp stays the same', 'The battery runs out immediately'],
      hint='In a series circuit there is only one path.', explain='In a series circuit the current has one path. Removing a lamp breaks the circuit, so the other lamp goes out.')
B.add(D, t, K, 1, 'identify', 'Which material is an electrical insulator?', options=['Plastic', 'Copper', 'Steel', 'Aluminium'], hint='Wires are covered in it for safety.', explain='Plastic does not let electricity flow through it easily.')
B.add(P, t, K, 1, 'identify', 'What does a switch do in a circuit?', options=['Opens or closes the circuit to stop or start the current', 'Makes the battery last longer', 'Changes the colour of the light', 'Stores electricity'], hint='Think of turning a light on and off.', explain='A switch completes (closes) or breaks (opens) the circuit.')
B.add(P, t, A, 2, 'predict', 'What happens to the brightness of lamps in a series circuit if you add another lamp?', options=['The lamps become dimmer', 'The lamps become brighter', 'Nothing changes', 'Only the new lamp lights up'],
      hint='The same battery has to push current through more lamps.', explain='More lamps in series means more resistance and less current, so each lamp is dimmer.')
B.add(P, t, A, 2, 'predict', 'What happens if you add a second battery (cell) in series to a circuit with one lamp?', options=['The lamp becomes brighter', 'The lamp becomes dimmer', 'The lamp goes out', 'Nothing changes'],
      hint='More cells, more “push”.', explain='Two cells give a greater voltage, so more current flows and the lamp is brighter.')
B.add(P, t, K, 1, 'identify', 'Which pair of magnet poles will attract each other?', options=['North and south', 'North and north', 'South and south', 'None — magnets only repel'], hint='Opposites…', explain='Opposite poles attract; like poles repel.')
B.add(P, t, A, 2, 'identify', 'Which object would be attracted to a magnet?', options=['An iron nail', 'An aluminium can', 'A copper coin', 'A plastic ruler'],
      mistakes={'An aluminium can': 'Aluminium is a metal but it is not magnetic', 'A copper coin': 'Copper is not magnetic'}, hint='Not all metals are magnetic.', explain='Iron is a magnetic material. Aluminium and copper are metals but not magnetic.')
B.add(P, t, R, 3, 'explain', 'A lamp in a circuit does not light. Which is the most sensible first check?', options=['Check that all the connections are complete and the switch is closed', 'Buy a new circuit', 'Add more lamps', 'Remove the battery'],
      hint='A circuit must be a complete loop.', explain='A gap in the circuit (loose wire or open switch) is the most common reason a lamp does not light.')
B.add(P, t, R, 3, 'suggest', 'How could you test whether a pencil “lead” (graphite) conducts electricity?', options=['Put it in a gap in a working circuit with a lamp and see if the lamp lights', 'Hold it near a magnet', 'Put it in water', 'Measure its length'],
      hint='Use a circuit as a tester.', explain='If the lamp lights when the material completes the circuit, it is a conductor. (Graphite does conduct.)')
B.add(X, t, K, 1, 'identify', 'Which of these is a good electrical conductor?', options=['Copper', 'Wood', 'Rubber', 'Glass'], hint='Used in wires.', explain='Copper is a metal and a good conductor.')
B.add(X, t, A, 2, 'predict', 'Two lamps are connected in series with one cell. One lamp’s filament breaks. What happens?', options=['Both lamps go out', 'The other lamp becomes brighter', 'Only the broken lamp goes out', 'The cell becomes hotter'],
      hint='Is there still a complete loop?', explain='The circuit is broken, so no current flows and both lamps go out.')
B.add(X, t, R, 3, 'explain', 'Why do magnets push apart when two north poles face each other?', options=['Like poles repel each other', 'North poles are heavier', 'The magnets have run out', 'Opposite poles repel'], hint='Like or unlike?', explain='Like poles (N–N or S–S) repel.')

# ---------------------------------------------------------- light & sound
t = 's-light'
B.add(D, t, K, 1, 'describe', 'How do we see an object such as a book?', options=['Light from a source reflects off the book into our eyes', 'Light travels from our eyes to the book', 'The book gives out its own light', 'We see it because of sound waves'],
      mistakes={'Light travels from our eyes to the book': 'Eyes receive light; they do not send it out'}, hint='Most objects are not light sources.', explain='Light from a source (like the Sun or a lamp) reflects off the book and enters our eyes.')
B.add(D, t, A, 2, 'explain', 'Why does a shadow form behind an object?', options=['The object blocks light, which travels in straight lines', 'The object reflects all the light backwards', 'Light bends around the object', 'Shadows are made of dark light'],
      hint='Light cannot go through an opaque object.', explain='Light travels in straight lines; an opaque object blocks it, leaving a dark area behind.')
B.add(P, t, K, 1, 'identify', 'Which of these is a light source?', options=['A candle flame', 'The Moon', 'A mirror', 'A white wall'],
      mistakes={'The Moon': 'The Moon reflects light from the Sun', 'A mirror': 'A mirror reflects light'}, hint='It produces its own light.', explain='A candle flame produces its own light; the Moon and mirrors only reflect light.')
B.add(P, t, K, 1, 'describe', 'How are sounds made?', options=['By objects vibrating', 'By light reflecting', 'By objects staying still', 'By magnets attracting'], hint='Touch your throat while humming.', explain='All sounds are made by vibrations.')
B.add(P, t, A, 2, 'predict', 'A guitar string is tightened. What happens to the sound?', options=['The pitch becomes higher', 'The pitch becomes lower', 'The sound becomes quieter', 'There is no sound'],
      hint='Tighter strings vibrate faster.', explain='A tighter string vibrates faster, giving a higher pitch.')
B.add(P, t, A, 2, 'predict', 'A torch is moved closer to an object. What happens to the shadow on the screen behind?', options=['It gets bigger', 'It gets smaller', 'It disappears', 'It changes colour'],
      hint='The object blocks more of the light spreading from the torch.', explain='Closer to the light source, the object blocks a wider cone of light, so the shadow is bigger.')
B.add(P, t, A, 2, 'explain', 'Why can sound not travel through space?', options=['Sound needs particles (a medium) to travel through, and space is a vacuum', 'Space is too cold', 'Space is too dark', 'Sound travels too slowly'],
      hint='Sound is passed on by vibrating particles.', explain='Sound travels as vibrations passed between particles. Space has almost no particles.')
B.add(P, t, R, 3, 'explain', 'A pencil in a glass of water looks bent at the surface. Why?', options=['Light changes direction (refracts) as it passes from water to air', 'The water bends the pencil', 'Light reflects off the water', 'The glass is magnifying it'],
      hint='Light travels at different speeds in different materials.', explain='Light refracts (bends) as it passes between water and air, so the pencil appears bent.')
B.add(P, t, R, 3, 'suggest', 'Which material would be best for soundproofing a music room?', options=['Thick foam or fabric panels', 'Thin glass', 'Metal sheets', 'Smooth tiles'],
      hint='Soft materials absorb sound.', explain='Soft, thick materials absorb sound vibrations instead of reflecting them.')
B.add(X, t, K, 1, 'identify', 'What happens to light when it hits a mirror?', options=['It reflects', 'It is absorbed completely', 'It stops existing', 'It turns into sound'], hint='You see yourself.', explain='Mirrors reflect light.')
B.add(X, t, A, 2, 'explain', 'Hitting a drum harder makes the sound…', options=['louder, because the vibrations are bigger', 'higher in pitch', 'quieter', 'travel slower'], hint='Bigger vibrations…', explain='Hitting harder makes bigger vibrations, so the sound is louder.')
B.add(X, t, R, 3, 'predict', 'You see lightning before you hear the thunder. What does this tell you?', options=['Light travels much faster than sound', 'Sound travels faster than light', 'Thunder happens after the lightning has finished', 'Your eyes work faster than your ears'],
      hint='They happen at the same time.', explain='Both are made at the same moment, but light reaches you almost instantly; sound is much slower.')

# ------------------------------------------------------------ earth & space
t = 's-earth'
B.add(D, t, K, 1, 'explain', 'What causes day and night on Earth?', options=['The Earth spinning on its axis', 'The Earth orbiting the Sun', 'The Sun moving around the Earth', 'The Moon blocking the Sun'],
      mistakes={'The Earth orbiting the Sun': 'Orbiting the Sun takes a year and causes the year, not day and night', 'The Sun moving around the Earth': 'The Sun appears to move because the Earth spins'},
      hint='It takes 24 hours.', explain='The Earth rotates once every 24 hours. The side facing the Sun has day; the side facing away has night.')
B.add(D, t, A, 2, 'identify', 'Which type of rock forms when lava or magma cools?', options=['Igneous', 'Sedimentary', 'Metamorphic', 'Fossil'],
      hint='Think about fire and volcanoes.', explain='Igneous rocks form when molten rock cools and solidifies.')
B.add(P, t, K, 1, 'identify', 'How long does it take the Earth to orbit the Sun?', options=['About 365 days', '24 hours', 'About 28 days', '7 days'], mistakes={'24 hours': 'That is one rotation (a day)', 'About 28 days': 'That is roughly the Moon’s cycle'}, hint='One year.', explain='One orbit takes about 365¼ days — one year.')
B.add(P, t, K, 1, 'identify', 'Which planet is closest to the Sun?', options=['Mercury', 'Venus', 'Earth', 'Mars'], hint='It is the smallest planet too.', explain='Mercury is the closest planet to the Sun.')
B.add(P, t, A, 2, 'explain', 'Why does the Moon appear to change shape during a month?', options=['We see different amounts of its sunlit half as it orbits the Earth', 'The Earth’s shadow covers parts of it each night', 'The Moon actually changes shape', 'Clouds cover parts of it'],
      mistakes={'The Earth’s shadow covers parts of it each night': 'That only happens in a lunar eclipse'}, hint='Half the Moon is always lit by the Sun.', explain='As the Moon orbits, we see different parts of its sunlit side — the phases.')
B.add(P, t, A, 2, 'identify', 'Which type of rock often contains fossils?', options=['Sedimentary', 'Igneous', 'Metamorphic', 'Lava'], hint='It forms from layers of sediment.', explain='Sedimentary rock forms in layers that can trap the remains of living things.')
B.add(P, t, A, 2, 'identify', 'What is the Earth’s outermost solid layer called?', options=['Crust', 'Mantle', 'Outer core', 'Inner core'], hint='Like the crust on bread.', explain='The crust is the thin rocky outer layer.')
B.add(P, t, R, 3, 'explain', 'Why are there seasons on Earth?', options=['The Earth’s axis is tilted, so each hemisphere gets more direct sunlight at different times of the year', 'The Earth is much closer to the Sun in summer', 'The Sun gets hotter in summer', 'The Moon blocks sunlight in winter'],
      mistakes={'The Earth is much closer to the Sun in summer': 'A common misconception — the tilt matters, not the distance'}, hint='Think about the tilt of the axis.', explain='Because of the tilt, a hemisphere tilted towards the Sun gets longer days and more direct light — summer.')
B.add(P, t, R, 3, 'explain', 'Why do earthquakes and volcanoes often happen in the same places?', options=['They happen where the plates of the Earth’s crust meet and move', 'They happen where it is hottest on the surface', 'They happen near the sea only', 'They are caused by the Moon'],
      hint='The crust is broken into pieces.', explain='Most occur at plate boundaries, where pieces of the crust move against, apart from, or under each other.')
B.add(X, t, K, 1, 'identify', 'What is the Sun?', options=['A star', 'A planet', 'A moon', 'A comet'], hint='It gives out its own light.', explain='The Sun is a star.')
B.add(X, t, A, 2, 'explain', 'Why does the Sun appear to move across the sky during the day?', options=['Because the Earth is spinning', 'Because the Sun orbits the Earth daily', 'Because the Moon pushes it', 'Because clouds move it'], hint='Who is really moving?', explain='The Earth’s rotation makes the Sun appear to rise in the east and set in the west.')
B.add(X, t, R, 3, 'explain', 'Soil A drains water quickly; soil B holds water for a long time. Soil A is most likely…', options=['Sandy soil with large particles', 'Clay soil with tiny particles', 'Soil with no particles', 'Frozen soil'],
      hint='Large gaps let water through.', explain='Sandy soil has large particles with big gaps, so water drains through quickly.')

# ------------------------------------------- planning investigations
t = 's-design'
B.add(D, t, R, 3, 'identify', 'Ravi tests whether the height a ball is dropped from affects how high it bounces. Which variable should he change?',
      options=['The drop height', 'The bounce height', 'The type of ball', 'The surface'],
      mistakes={'The bounce height': 'That is what he measures (dependent variable)'}, hint='The variable you change is the one you are testing.', explain='The independent variable — the one he changes — is the drop height.')
B.add(D, t, R, 3, 'explain', 'Why should Ravi use the same ball and the same floor each time?', options=['To make it a fair test, so only drop height affects the result', 'To save money', 'Because balls only bounce on floors', 'So the results are bigger'],
      hint='What makes a test fair?', explain='Keeping other variables the same (control variables) means any change is caused only by the drop height.')
B.add(P, t, K, 1, 'identify', 'In an investigation, what is the dependent variable?', options=['The variable you measure', 'The variable you change', 'The variables you keep the same', 'The equipment you use'], hint='It depends on what you change.', explain='The dependent variable is what you measure or observe.')
B.add(P, t, A, 2, 'identify', 'Mia investigates how the temperature of water affects how quickly sugar dissolves. What should she measure?', options=['The time for the sugar to dissolve', 'The temperature of the water', 'The amount of sugar', 'The size of the beaker'],
      mistakes={'The temperature of the water': 'That is what she changes'}, hint='How will she know how quickly it dissolves?', explain='She measures the time taken — the dependent variable.')
B.add(P, t, A, 2, 'identify', 'In Mia’s investigation, which should be a control variable?', options=['The amount of water', 'The temperature of the water', 'The time taken to dissolve', 'Her prediction'],
      hint='Something kept the same.', explain='The volume of water should stay the same so the test is fair.')
B.add(P, t, A, 2, 'predict', 'Which is the best prediction for an investigation into ramp height and toy car distance?', options=['The higher the ramp, the further the car will travel, because it will be going faster at the bottom', 'The car will travel', 'Cars are fun', 'The ramp will be 30 cm'],
      hint='A good prediction says what will happen and why.', explain='A scientific prediction links the variables and gives a reason.')
B.add(P, t, R, 3, 'explain', 'Why is it a good idea to repeat measurements in an investigation?', options=['To check results and reduce the effect of errors, so the results are more reliable', 'To make the investigation take longer', 'To get different answers each time', 'Because the first result is always wrong'],
      hint='What if one result is unusual?', explain='Repeating lets you spot anomalous results and calculate an average, making results more reliable.')
B.add(P, t, R, 3, 'suggest', 'Which equipment is best for measuring 50 ml of water accurately?', options=['A measuring cylinder', 'A ruler', 'A forcemeter', 'A stopwatch'], hint='It is marked in ml.', explain='A measuring cylinder measures volume accurately.')
B.add(P, t, R, 3, 'explain', 'Leo tests which paper towel absorbs most water. He uses a different volume of water for each towel. What is wrong?',
      options=['It is not a fair test because the volume of water should be the same', 'Nothing is wrong', 'He should use more towels', 'He should not measure anything'],
      hint='What should be kept the same?', explain='Changing the volume of water as well as the towel means he cannot tell which caused the difference.')
B.add(P, t, A, 2, 'suggest', 'What is a safety risk when heating water in a beaker, and how can it be reduced?', options=['Burns or scalds — wear goggles, let it cool and use heat-proof gloves or tongs', 'Electric shock — wear wellingtons', 'Getting wet — wear a coat', 'There is no risk'],
      hint='Hot water can hurt you.', explain='Hot water can cause scalds. Using tongs, eye protection and care reduces the risk.')
B.add(X, t, A, 2, 'identify', 'An investigation tests whether the number of turns on a spinner’s wings affects how long it takes to fall. What is the independent variable?', options=['The number of turns (the change made to the wings)', 'The time to fall', 'The height it is dropped from', 'The person timing it'],
      hint='What is deliberately changed?', explain='The independent variable is the factor that is changed on purpose.')
B.add(X, t, R, 3, 'explain', 'A student wants to find which plant food helps plants grow tallest. Which plan is fairest?', options=['Use identical plants, the same amount of water and light, and change only the plant food', 'Use different plants for each food', 'Put some plants inside and some outside', 'Give each plant a different amount of water and food'],
      hint='Change one thing only.', explain='Only the plant food should change; everything else stays the same.')
B.add(X, t, R, 3, 'predict', 'Predict how the length of a pendulum string affects the time for one swing.', options=['A longer string will take longer to swing, because the bob travels a longer path', 'A longer string will swing faster', 'String length makes no difference to anything', 'Pendulums do not swing'],
      hint='Think of a playground swing with long chains.', explain='A longer pendulum takes more time for each swing.')

# ------------------------------------------------- data & conclusions
t = 's-data'
dissolve = table(['Water temperature (°C)', 'Time to dissolve (s)'], [['20', '120'], ['40', '75'], ['60', '42'], ['80', '25']], 'Time for one spoon of sugar to dissolve')
B.add(D, t, A, 2, 'describe', 'Look at the table. What pattern does it show?', stimulus=dissolve,
      options=['As water temperature increases, the time to dissolve decreases', 'As water temperature increases, the time to dissolve increases', 'Temperature has no effect', 'Sugar dissolves only at 80 °C'],
      hint='Read down both columns together.', explain='Higher temperature → shorter time. Sugar dissolves faster in hotter water.')
B.add(D, t, R, 3, 'predict', 'Using the table, estimate the time for sugar to dissolve at 50 °C.', stimulus=dissolve, answer=58, tol=12, unit='s',
      hint='50 °C is between 40 °C and 60 °C.', explain='Between 75 s (40 °C) and 42 s (60 °C) — about halfway, so roughly 55–60 s. Answers from 46 to 70 s are accepted.')
growth = table(['Week', 'Plant A height (cm)', 'Plant B height (cm)'], [['1', '2', '2'], ['2', '4', '3'], ['3', '7', '4'], ['4', '9', '12'], ['5', '12', '6']], 'Plant heights')
B.add(P, t, A, 2, 'identify', 'Which result in the table is most likely to be anomalous?', stimulus=growth,
      options=['Plant B, week 4', 'Plant A, week 3', 'Plant A, week 5', 'Plant B, week 1'],
      hint='Look for a value that does not fit the pattern.', explain='Plant B grows 2, 3, 4, then 12, then 6 — the 12 cm reading does not fit the steady pattern.')
B.add(P, t, A, 2, 'calculate', 'How much did Plant A grow between week 1 and week 5?', stimulus=growth, answer=10, unit='cm', mistakes={12: 'Gave the final height, not the growth'},
      hint='Subtract the week 1 height from the week 5 height.', explain='12 − 2 = 10 cm.')
B.add(P, t, K, 1, 'identify', 'Which type of graph is best for showing how a plant’s height changes over several weeks?', options=['A line graph', 'A pie chart', 'A pictogram', 'A Venn diagram'],
      hint='The data changes continuously over time.', explain='Line graphs show how a measurement changes over time.')
B.add(P, t, A, 2, 'calculate', 'Three repeat measurements of a ball’s bounce were 42 cm, 46 cm and 44 cm. What is the mean?', answer=44, unit='cm', hint='Add and divide by 3.', explain='(42 + 46 + 44) ÷ 3 = 132 ÷ 3 = 44 cm.')
cooling = line(['0', '5', '10', '15', '20'], [80, 62, 50, 42, 37], 'Temperature of a cup of water as it cools', '°C', 'Time (minutes)')
B.add(P, t, A, 2, 'describe', 'Describe what the graph shows.', stimulus=cooling,
      options=['The water cools quickly at first, then more slowly', 'The water cools at a steady rate', 'The water heats up', 'The temperature stays the same'],
      hint='Compare the drop in the first 5 minutes with the last 5.', explain='It drops 18 °C in the first 5 minutes but only 5 °C in the last 5 — cooling slows down.')
B.add(P, t, R, 3, 'predict', 'Use the graph to predict the temperature of the water after 25 minutes.', stimulus=cooling, answer=34, tol=3, unit='°C',
      hint='The drop is getting smaller each time.', explain='Drops are 18, 12, 8, 5 … the next drop will be about 3, so about 33–35 °C. Answers from 31 to 37 are accepted.')
B.add(P, t, R, 3, 'explain', 'A student concludes: “Plants grow best in red light.” She tested one plant in red light and one in blue light. Why is her conclusion weak?',
      options=['She tested only one plant in each colour, so the result could be due to chance', 'She should have used no light', 'Red light is not real', 'She measured the plants'],
      hint='How much evidence did she collect?', explain='With only one plant per condition, differences could be due to that individual plant. More plants and repeats are needed.')
B.add(P, t, R, 3, 'suggest', 'How could the student improve the investigation into light colour?', options=['Use several plants for each colour and repeat the measurements', 'Use one plant for both colours at the same time', 'Stop measuring the plants', 'Change the amount of water as well'],
      hint='More evidence makes conclusions stronger.', explain='More plants and repeats give more reliable results.')
B.add(X, t, A, 2, 'identify', 'The bar chart shows how far paper planes flew. Which design flew furthest?', stimulus=bar(['Dart', 'Glider', 'Stunt', 'Wide wing'], [6.5, 8.2, 4.1, 7.4], 'Distance flown', 'Metres'),
      options=['Glider', 'Dart', 'Stunt', 'Wide wing'], hint='Tallest bar.', explain='The glider flew 8.2 m — the furthest.')
B.add(X, t, A, 2, 'calculate', 'Using the same bar chart, how much further did the Glider fly than the Stunt plane?', stimulus=bar(['Dart', 'Glider', 'Stunt', 'Wide wing'], [6.5, 8.2, 4.1, 7.4], 'Distance flown', 'Metres'),
      answer=4.1, unit='m', hint='8.2 − 4.1.', explain='8.2 − 4.1 = 4.1 m.')
B.add(X, t, R, 3, 'explain', 'A table shows that the more a spring is stretched by masses, the longer it gets. Which conclusion is best?',
      stimulus=table(['Mass (g)', 'Length of spring (cm)'], [['0', '5'], ['100', '7'], ['200', '9'], ['300', '11']]),
      options=['The length increases by 2 cm for every 100 g added', 'The spring gets shorter with more mass', 'Mass has no effect', 'The spring will always be 11 cm'],
      hint='Look at how much it increases each time.', explain='Each extra 100 g adds 2 cm — a steady pattern.')
B.add(X, t, R, 3, 'calculate', 'Using the spring table, predict the length of the spring with 400 g.', stimulus=table(['Mass (g)', 'Length of spring (cm)'], [['0', '5'], ['100', '7'], ['200', '9'], ['300', '11']]),
      answer=13, unit='cm', hint='Continue the pattern.', explain='11 + 2 = 13 cm.')

n = B.dump(sys.argv[1])
print('science', n)
