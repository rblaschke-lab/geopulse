// ══════════════════════════════════════════════════════════════
// GEOPULSE V2.0 — 5 New Guided Tours (Tours #36–#40)
// Loaded after main.js; merges into window._TOURS_REF
// ══════════════════════════════════════════════════════════════
(function() {
    const NEW_TOURS = {
        aurorahunters: {
            name: 'Aurora Hunters — Northern Lights',
            name_de: 'Polarlichtjäger — Nordlichter',
            category: 'science',
            steps: [
                { center: [19.01, 69.65], zoom: 10, title: '🌌 TROMSØ — AURORA CAPITAL', text: 'Tromsø, Norway (69°N) sits inside the auroral oval — the ring around the magnetic pole where aurora activity peaks. From September to March, the city experiences polar night, making it the world\'s top aurora destination. The Northern Lights occur when charged particles from solar wind collide with atmospheric gases at 100–300 km altitude, creating curtains of green (oxygen), purple and red (nitrogen) light.', layers: ['aurora'] },
                { center: [-21.93, 64.15], zoom: 8, title: '🌌 ICELAND — LAND OF FIRE & LIGHT', text: 'Iceland\'s lack of light pollution and position at 64°N makes the entire island an aurora viewing platform. The best displays occur during high Kp-index events (5+), when the auroral oval expands southward. Iceland also sits on the Mid-Atlantic Ridge — one of the few places where tectonic plates are visible above sea level.', layers: ['aurora'] },
                { center: [-147.72, 64.84], zoom: 7, title: '🌌 FAIRBANKS, ALASKA — AURORA SCIENCE', text: 'Fairbanks, Alaska is home to the Geophysical Institute at the University of Alaska, which pioneered aurora research. The city sits directly under the auroral oval at 64°N. Aurora borealis is caused by the solar wind — a stream of plasma from the Sun traveling at 400–800 km/s. When it hits Earth\'s magnetosphere, particles are funneled toward the poles along magnetic field lines.', layers: ['aurora'] },
                { center: [-114.37, 62.45], zoom: 8, title: '🌌 YELLOWKNIFE — CANADA\'S AURORA BELT', text: 'Yellowknife, Northwest Territories, Canada sits beneath the auroral oval and has flat terrain with minimal cloud cover — ideal for aurora photography. The city experiences 240+ nights of aurora activity per year. Aurora colors depend on altitude: green at 100–200 km (oxygen), red above 200 km (oxygen), blue/purple below 100 km (nitrogen).', layers: ['aurora'] },
                { center: [20.22, 67.86], zoom: 9, title: '🌌 KIRUNA — EUROPE\'S SPACE HUB', text: 'Kiruna, Sweden hosts ESRANGE — the European Space and Sounding Rocket Range, used for aurora research since 1966. The town is also home to the world\'s largest underground iron ore mine (LKAB). Kiruna sits at 67°N, well within the auroral zone. The nearby Abisko National Park is considered one of Earth\'s best aurora viewing locations due to the "blue hole of Abisko" — a microclimate creating clear skies.', layers: ['aurora'] },
                { center: [33.09, 68.97], zoom: 8, title: '🌌 MURMANSK — ARCTIC RUSSIA', text: 'Murmansk is the world\'s largest city above the Arctic Circle (population ~270,000). Despite extreme cold (-30°C winters), it remains ice-free due to the North Atlantic Current. The Kola Peninsula has been used for Soviet/Russian aurora and ionosphere research for decades. During strong geomagnetic storms (Kp 7+), aurora can be visible as far south as central Europe.', layers: ['aurora'] },
                { center: [168.66, -44.99], zoom: 8, title: '🌌 QUEENSTOWN, NZ — AURORA AUSTRALIS', text: 'The Southern Hemisphere has its own aurora — Aurora Australis. Queenstown and Stewart Island in New Zealand\'s South Island (46°S) occasionally see spectacular southern lights, especially during high Kp events. Aurora Australis is less commonly photographed because most land at equivalent southern latitudes is ocean. Antarctica offers the best views.', layers: ['aurora'] },
                { center: [-68.30, -54.80], zoom: 8, title: '🌌 USHUAIA — SOUTHERNMOST AURORA', text: 'Ushuaia, Argentina (54°S) — the world\'s southernmost city — occasionally witnesses Aurora Australis during strong geomagnetic storms. The aurora oval is a mirror of the northern one, centered on the geomagnetic south pole in Antarctica. The NOAA OVATION model (shown on this map) predicts aurora probability in real-time using solar wind data from the DSCOVR satellite at Lagrange Point 1, 1.5 million km from Earth.', layers: ['aurora'] }
            ]
        },
        cosmicimpacts: {
            name: 'Cosmic Impacts — Asteroids That Shaped Earth',
            name_de: 'Kosmische Einschläge — Asteroiden die die Erde formten',
            category: 'science',
            steps: [
                { center: [-89.52, 21.36], zoom: 8, title: '☄️ CHICXULUB — THE DINOSAUR KILLER', text: '66 million years ago, a 10–15 km asteroid struck the Yucatán Peninsula at ~20 km/s. The impact released 10 billion Hiroshima bombs of energy, creating a 180 km crater now buried under limestone. The resulting "impact winter" — years of darkness from ejected debris — wiped out 76% of all species, including non-avian dinosaurs. The crater was only discovered in 1978 by geophysicists searching for oil.', layers: ['fireballs'] },
                { center: [101.90, 60.90], zoom: 6, title: '☄️ TUNGUSKA — THE MYSTERY BLAST (1908)', text: 'On June 30, 1908, a massive explosion flattened 2,150 km² of Siberian forest — 80 million trees — near the Podkamennaya Tunguska River. The blast was ~15 megatons (1,000× Hiroshima) but left no crater. Scientists believe a 50–80 meter asteroid or comet fragment exploded 5–10 km above the surface (an "airburst"). The remote location meant no human casualties, but the shock wave was detected worldwide. It remains the largest impact event in recorded history.', layers: ['fireballs'] },
                { center: [61.37, 54.82], zoom: 8, title: '☄️ CHELYABINSK — CAUGHT ON CAMERA (2013)', text: 'On February 15, 2013, a 20-meter asteroid entered Earth\'s atmosphere at 66,000 km/h and exploded over Chelyabinsk, Russia with the force of 500 kilotons (30× Hiroshima). The shockwave damaged 7,200 buildings and injured 1,500 people — mostly from broken glass. It was the first major impact event captured by hundreds of dashcams and smartphones, making it the most documented meteor strike in history. NASA\'s CNEOS fireball database (shown on this map) tracks such events globally.', layers: ['fireballs'], video: 'tq02C_3FvFo' },
                { center: [-111.02, 35.03], zoom: 12, title: '☄️ BARRINGER CRATER — BEST PRESERVED', text: 'Barringer Crater (Meteor Crater) in Arizona is the best-preserved impact crater on Earth. A 50-meter nickel-iron asteroid struck 50,000 years ago at ~45,000 km/h, creating a 1.2 km wide, 170 m deep crater. The impact energy was ~10 megatons. NASA used this site to train Apollo astronauts for the Moon. The crater is privately owned and serves as a research site for planetary science.', layers: ['fireballs'] },
                { center: [27.00, -27.00], zoom: 7, title: '☄️ VREDEFORT — EARTH\'S LARGEST CRATER', text: 'The Vredefort structure in South Africa is the largest verified impact crater on Earth — originally ~300 km in diameter, formed 2.02 billion years ago by an asteroid estimated at 10–15 km across. The impact was so powerful it created a multi-ring basin now deeply eroded. The central uplift is visible as the Vredefort Dome, a UNESCO World Heritage Site. This impact may have disrupted early life on Earth and reshaped the Witwatersrand Basin — now the world\'s largest gold deposit.', layers: [] },
                { center: [-81.18, 46.60], zoom: 7, title: '☄️ SUDBURY — IMPACT & MINING', text: 'The Sudbury Basin in Ontario, Canada was created 1.85 billion years ago by a 10–15 km asteroid. The 250 km structure is now one of the world\'s richest mining districts — the impact melted rocks containing nickel, copper, and platinum-group metals. Sudbury produces 10% of the world\'s nickel supply. The basin also contains "shatter cones" — cone-shaped fractures unique to hypervelocity impacts, proving the extraterrestrial origin.', layers: [] },
                { center: [10.58, 48.85], zoom: 11, title: '☄️ NÖRDLINGER RIES — GERMAN IMPACT TOWN', text: 'The town of Nördlingen, Bavaria sits inside a 24 km impact crater created 14.8 million years ago. The medieval town walls are built from suevite — rock created by the impact\'s extreme heat and pressure. The crater was long thought to be volcanic until 1960, when Dr. Eugene Shoemaker proved its impact origin by finding coesite (a high-pressure quartz mineral). St. George\'s Church contains 72,000 tons of suevite with microscopic diamonds formed by the impact shock.', layers: [] },
                { center: [-68.70, 51.38], zoom: 7, title: '☄️ MANICOUAGAN — THE EYE OF QUÉBEC', text: 'The Manicouagan reservoir in Québec, Canada fills a 100 km ring-shaped impact crater formed 214 million years ago. Visible from space as the "Eye of Québec," it is one of the oldest and largest well-preserved craters on Earth. The impact may coincide with the end-Triassic extinction event. The reservoir now serves as a massive hydroelectric facility (Manic-5), producing ~2,600 MW — demonstrating how cosmic violence was repurposed into clean energy.', layers: [] }
            ]
        },
        climatecrisis: {
            name: 'Climate Crisis — Evidence From Space',
            name_de: 'Klimakrise — Beweise aus dem All',
            category: 'science',
            steps: [
                { center: [147.70, -18.30], zoom: 6, title: '🌡️ GREAT BARRIER REEF — BLEACHING', text: 'The Great Barrier Reef (2,300 km, visible from space) has experienced 7 mass bleaching events since 1998 — with 2024 being the worst on record. When ocean temperatures rise 1–2°C above normal for 4+ weeks, corals expel their symbiotic algae and turn white. If stress persists, they die. NASA\'s sea surface temperature data (toggle SST layer) shows the warming trend. The reef supports 1,500 fish species and generates $6.4B annually for Australia\'s economy.', layers: ['sst'] },
                { center: [15.63, 78.22], zoom: 7, title: '🧊 SVALBARD — ARCTIC AMPLIFICATION', text: 'Svalbard, Norway (78°N) is warming 3–5× faster than the global average — a phenomenon called "Arctic amplification." Since 1970, average temperatures have risen by 4°C. Glaciers that took millennia to form are retreating at 50–100 meters per year. The Svalbard Global Seed Vault, built to protect humanity\'s crop diversity, was flooded in 2017 when permafrost melted around its entrance — infrastructure designed for eternal ice is failing as the Arctic transforms.', layers: ['temperature'] },
                { center: [-62.21, -3.47], zoom: 5, title: '🌳 AMAZON — THE LUNGS UNDER THREAT', text: 'The Amazon rainforest produces 6% of Earth\'s oxygen and stores 150–200 billion tons of carbon. But deforestation and drought are pushing it toward a "tipping point" — the moment the forest can no longer sustain itself and begins converting to savanna. NASA FIRMS fire data (toggle Wildfires) shows the scale of burning. Since 1970, ~17% of the Amazon has been destroyed. Scientists estimate the tipping point lies at 20–25% deforestation — we are dangerously close.', layers: ['fires'] },
                { center: [59.60, 45.00], zoom: 7, title: '🏜️ ARAL SEA — THE VANISHED LAKE', text: 'The Aral Sea was once the world\'s 4th largest lake (68,000 km²). Soviet-era irrigation projects diverted its feeder rivers for cotton farming. By 2014, the eastern basin had completely dried up. Fishing villages now sit 100+ km from water. The exposed seabed creates toxic dust storms carrying pesticides across Central Asia. NASA satellite imagery documents this as one of the worst human-caused environmental disasters in history.', layers: [] },
                { center: [7.66, 45.98], zoom: 9, title: '🏔️ ALPINE GLACIERS — DISAPPEARING ICE', text: 'The European Alps have lost over 60% of their glacier volume since 1850. Switzerland\'s glaciers alone shrank by 6.2% in the single year 2022–2023 — the worst loss ever recorded. The Aletsch Glacier, Europe\'s largest, has retreated 3.5 km. Glacier loss threatens freshwater supply for 100+ million Europeans, hydroelectric power generation, and winter tourism. At current rates, the Alps could be ice-free by 2100.', layers: ['temperature'] },
                { center: [179.19, -8.52], zoom: 10, title: '🌊 TUVALU — DROWNING NATION', text: 'Tuvalu (population 11,000) is one of the first nations facing extinction from sea-level rise. The highest point on most atolls is just 4.6 meters above sea level. With seas rising 3.3 mm/year (accelerating), Tuvalu could become uninhabitable by 2050–2100. In 2023, Tuvalu signed a treaty with Australia to accept climate refugees. The nation is preserving its sovereignty digitally — creating a virtual version of itself as territorial waters disappear.', layers: ['sst'] },
                { center: [-41.0, 72.0], zoom: 4, title: '🧊 GREENLAND — ICE SHEET COLLAPSE', text: 'Greenland\'s ice sheet contains enough water to raise global sea levels by 7.2 meters. It is losing ~270 billion tons of ice per year — a rate that has tripled since the 1990s. Meltwater lubricates the base of glaciers, accelerating their flow to the ocean. Jakobshavn Glacier alone calves enough ice daily to supply New York City\'s water for a year. Complete melting would redraw the coastlines of every continent.', layers: ['temperature'] },
                { center: [0, -75], zoom: 3, title: '🌍 ANTARCTICA — THE DOOMSDAY GLACIER', text: 'The Thwaites Glacier in West Antarctica (nicknamed the "Doomsday Glacier") is 120 km wide and holds enough ice to raise seas by 65 cm alone. Its grounding line is retreating, and warm ocean water is melting it from below. If Thwaites collapses, it could destabilize the entire West Antarctic Ice Sheet — raising seas by 3.3 meters and displacing hundreds of millions of people worldwide. Scientists are racing to understand its timeline.', layers: ['sst', 'temperature'] }
            ]
        },
        greatmigrations: {
            name: 'Great Migrations — Epic Animal Journeys',
            name_de: 'Große Wanderungen — Epische Tierreisen',
            category: 'science',
            steps: [
                { center: [-3.44, 55.38], zoom: 4, title: '🕊️ ARCTIC TERN — POLE TO POLE', text: 'The Arctic Tern makes the longest migration of any animal — 71,000 km annually, pole to pole and back. Breeding in the Arctic (Iceland, Scandinavia, Canada) and wintering in Antarctica, these 100-gram birds experience more daylight than any other creature on Earth. Over a 30-year lifespan, a single tern flies the equivalent of 3 round trips to the Moon. They navigate using Earth\'s magnetic field, the Sun, and star patterns.', layers: [] },
                { center: [-36.0, -54.0], zoom: 5, title: '🐋 HUMPBACK WHALE — OCEAN MARATHON', text: 'Humpback whales migrate up to 16,000 km per year — one of the longest migrations of any mammal. They feed in polar waters (Antarctica, Alaska) during summer, then travel to tropical breeding grounds (Hawaii, Caribbean, Tonga) in winter. They can travel 1,000+ km without eating, living off stored blubber. Their songs — complex vocalizations lasting up to 20 minutes — can travel 30,000 km through ocean sound channels.', layers: [] },
                { center: [-100.33, 40.0], zoom: 5, title: '🦋 MONARCH BUTTERFLY — 4 GENERATIONS', text: 'Monarch butterflies migrate 4,800 km from Canada/USA to central Mexico each autumn — but no single butterfly makes the round trip. It takes 4 generations: the "super generation" born in autumn flies south to winter in oyamel fir forests near Mexico City, then begins the return north in spring. Their descendants continue northward over 3 more generations. How they navigate to a place they\'ve never been remains one of biology\'s great mysteries — likely using a sun compass and magnetic sense.', layers: [] },
                { center: [34.80, -2.50], zoom: 7, title: '🦬 WILDEBEEST — SERENGETI CIRCUIT', text: 'The Great Migration in East Africa involves ~1.5 million wildebeest, 400,000 zebras, and 200,000 gazelles circling 800 km between Tanzania\'s Serengeti and Kenya\'s Masai Mara. This annual clockwise migration follows rainfall and fresh grass. The Mara River crossings are among nature\'s most dramatic spectacles — thousands of animals plunge into crocodile-infested waters. This migration has continued for over a million years.', layers: [] },
                { center: [-152.49, 66.56], zoom: 5, title: '🦌 CARIBOU — ARCTIC HERDS', text: 'The Porcupine caribou herd migrates 2,400 km annually between winter ranges in Alaska\'s interior and calving grounds on the Arctic coastal plain — one of the longest land migrations on Earth. Up to 200,000 caribou travel together, crossing frozen rivers and mountain passes. Their hooves change with the seasons: soft pads in summer for tundra, hard edges in winter for ice. Climate change is disrupting their timing — insects emerge before calving, reducing calf survival.', layers: [] },
                { center: [-55.0, 15.0], zoom: 4, title: '🐢 LEATHERBACK TURTLE — DEEP DIVER', text: 'Leatherback sea turtles migrate up to 16,000 km across entire ocean basins — from nesting beaches in the tropics to feeding grounds in sub-Arctic waters. They can dive to 1,280 meters (deeper than any other turtle) and cross the Atlantic in 150 days. Females return to the exact beach where they hatched to lay eggs, navigating by Earth\'s magnetic field. Populations have declined 95% since 1980 due to fishing bycatch and plastic pollution.', layers: [] },
                { center: [12.0, 45.0], zoom: 4, title: '🦩 WHITE STORK — EUROPE TO AFRICA', text: 'European White Storks migrate 20,000 km annually between breeding grounds in Europe and wintering areas in sub-Saharan Africa. They avoid crossing the Mediterranean Sea (no thermal updrafts over water), instead funneling through the Strait of Gibraltar or the Bosphorus. Some storks now winter in Spain and Portugal, feeding on landfill sites — an example of how human waste is altering ancient migration patterns.', layers: [] },
                { center: [174.0, -41.0], zoom: 4, title: '🐦 BAR-TAILED GODWIT — NONSTOP RECORD', text: 'In 2022, a Bar-tailed Godwit (B6) flew 13,560 km nonstop from Alaska to Tasmania — the longest recorded nonstop flight of any bird. These 300-gram shorebirds fly for 11 days without eating, drinking, or sleeping, crossing the entire Pacific Ocean. Before departure, they nearly double their body weight with fat reserves while their digestive organs shrink to save weight. They navigate using the Sun, stars, and Earth\'s magnetic field, with no landmarks over open ocean.', layers: [] }
            ]
        },
        spycraft: {
            name: 'Espionage World — Famous Spy Sites',
            name_de: 'Spionage-Welt — Berühmte Geheimdienstorte',
            category: 'geopolitics',
            steps: [
                {
                    center: [-77.15, 38.95], zoom: 12,
                    title: '🕵️ CIA HEADQUARTERS — LANGLEY',
                    title_de: '🕵️ CIA-HAUPTQUARTIER — LANGLEY',
                    text: 'The George Bush Center for Intelligence in Langley, Virginia is the headquarters of the Central Intelligence Agency (CIA). Founded in 1947, the CIA conducts foreign intelligence gathering and covert operations. The campus includes the famous "Kryptos" sculpture — an encrypted artwork that remains partially unsolved since 1990. The CIA employs ~21,000 people. Its budget is classified but estimated at $15+ billion annually.',
                    text_de: 'Das George Bush Center for Intelligence in Langley, Virginia ist das Hauptquartier der CIA. Gegründet 1947, führt die CIA Auslandsaufklärung und verdeckte Operationen durch. Auf dem Campus steht die berühmte „Kryptos"-Skulptur — ein verschlüsseltes Kunstwerk, das seit 1990 teilweise ungelöst ist. Die CIA beschäftigt ~21.000 Mitarbeiter bei einem geschätzten Budget von über 15 Mrd. Dollar jährlich.',
                    layers: [],
                    image: { wiki: 'Central_Intelligence_Agency', caption: 'CIA Headquarters, Langley' },
                    video: '8FJJmrnnd5I'
                },
                {
                    center: [-0.11, 51.49], zoom: 13,
                    title: '🕵️ MI6 — VAUXHALL CROSS, LONDON',
                    title_de: '🕵️ MI6 — VAUXHALL CROSS, LONDON',
                    text: 'The SIS Building at 85 Albert Embankment houses MI6 — the UK\'s Secret Intelligence Service. Built in 1994 on the Thames, the postmodern fortress is one of the most recognizable spy buildings in the world, featured in multiple James Bond films. MI6 was officially acknowledged to exist only in 1994 — despite operating since 1909. Its current head is known internally as "C" (not "M" as in the films).',
                    text_de: 'Das SIS-Gebäude am Albert Embankment 85 beherbergt den MI6 — den britischen Auslandsgeheimdienst. 1994 an der Themse erbaut, ist die postmoderne Festung eines der bekanntesten Spionagegebäude der Welt und in mehreren James-Bond-Filmen zu sehen. Der MI6 wurde erst 1994 offiziell anerkannt — obwohl er seit 1909 aktiv war.',
                    layers: [],
                    image: { wiki: 'SIS_Building', caption: 'MI6 Vauxhall Cross, London' },
                    video: 'RZ5DgkoKbOc'
                },
                {
                    center: [37.52, 55.58], zoom: 11,
                    title: '🕵️ SVR/FSB — LUBYANKA & YASENEVO',
                    title_de: '🕵️ SVR/FSB — LUBJANKA & JASSENJEWO',
                    text: 'Moscow houses Russia\'s two main intelligence agencies: the FSB (domestic security, headquartered in the infamous Lubyanka Building — formerly the KGB) and the SVR (foreign intelligence, at Yasenevo in Moscow\'s outskirts). The Lubyanka was a KGB prison where thousands were interrogated and executed during Stalin\'s purges. Russia\'s intelligence apparatus employs an estimated 200,000+ personnel across all agencies.',
                    text_de: 'Moskau beherbergt Russlands zwei wichtigste Geheimdienste: den FSB (Inlandssicherheit, im berüchtigten Lubjanka-Gebäude — ehemals KGB) und den SWR (Auslandsaufklärung, in Jassenjewo). Die Lubjanka war ein KGB-Gefängnis, in dem während Stalins Säuberungen Tausende verhört und hingerichtet wurden. Russlands Geheimdienstapparat beschäftigt geschätzt über 200.000 Mitarbeiter.',
                    layers: [],
                    image: { wiki: 'Lubyanka_Building', caption: 'Lubyanka Building, Moscow' },
                    video: 'oL7PSlUuvaM'
                },
                {
                    center: [52.44, 42.57], zoom: 4,
                    title: '🕵️ BAIKONUR — SPACE ESPIONAGE',
                    title_de: '🕵️ BAIKONUR — WELTRAUM-SPIONAGE',
                    text: 'The Baikonur Cosmodrome in Kazakhstan was the USSR\'s most closely guarded secret — the launch site for Sputnik (1957) and Yuri Gagarin (1961). CIA U-2 spy planes photographed the facility from 20 km altitude. When Gary Powers was shot down over the USSR in 1960, it triggered an international crisis. Space became the ultimate espionage battlefield — both superpowers used spy satellites to monitor each other\'s nuclear arsenals.',
                    text_de: 'Das Kosmodrom Baikonur in Kasachstan war das bestgehütete Geheimnis der UdSSR — Startplatz für Sputnik (1957) und Juri Gagarin (1961). CIA U-2 Spionageflugzeuge fotografierten die Anlage aus 20 km Höhe. Als Gary Powers 1960 über der UdSSR abgeschossen wurde, löste dies eine internationale Krise aus. Der Weltraum wurde zum ultimativen Spionage-Schlachtfeld.',
                    layers: [],
                    image: { wiki: 'Baikonur_Cosmodrome', caption: 'Baikonur Cosmodrome, Kazakhstan' },
                    video: 'st_sap0hGmM'
                },
                {
                    center: [13.39, 52.51], zoom: 12,
                    title: '🕵️ BERLIN — COLD WAR SPY CAPITAL',
                    title_de: '🕵️ BERLIN — SPIONAGE-HAUPTSTADT DES KALTEN KRIEGES',
                    text: 'Divided Berlin was the world\'s spy capital from 1945–1989. The Berlin Wall created a physical intelligence frontier. The CIA\'s Berlin Operations Base and the KGB\'s Karlshorst headquarters were just kilometers apart. The famous Glienicke Bridge ("Bridge of Spies") was used for prisoner exchanges, including U-2 pilot Gary Powers in 1962. The Stasi (East German secret police) employed 91,000 full-time agents and 189,000 informants — surveillance on an industrial scale.',
                    text_de: 'Das geteilte Berlin war von 1945–1989 die Spionage-Hauptstadt der Welt. Die Berliner Mauer schuf eine physische Geheimdienstgrenze. Die CIA-Basis und die KGB-Zentrale in Karlshorst lagen nur Kilometer auseinander. Die berühmte Glienicker Brücke („Brücke der Spione") wurde für Gefangenenaustausch genutzt. Die Stasi beschäftigte 91.000 hauptamtliche Agenten und 189.000 Informanten.',
                    layers: [],
                    image: { wiki: 'Glienicke_Bridge', caption: 'Glienicke Bridge — Bridge of Spies, Berlin' },
                    video: 'nLiMJKS-bJ4'
                },
                {
                    center: [-73.97, 40.75], zoom: 11,
                    title: '🕵️ UNITED NATIONS — DIPLOMATIC ESPIONAGE',
                    title_de: '🕵️ VEREINTE NATIONEN — DIPLOMATISCHE SPIONAGE',
                    text: 'The UN headquarters in New York is one of the world\'s most surveilled buildings. Every major power\'s diplomatic mission doubles as an intelligence station. In 2013, Edward Snowden revealed that the NSA had bugged the EU\'s UN mission, tapped Secretary-General Ban Ki-moon\'s office, and monitored 35+ world leaders\' phones. The UN complex hosts ~4,000 diplomats — many carrying diplomatic immunity that shields intelligence activities from prosecution.',
                    text_de: 'Das UN-Hauptquartier in New York ist eines der meistüberwachten Gebäude der Welt. Jede große Macht nutzt ihre diplomatische Vertretung als Geheimdienststation. 2013 enthüllte Edward Snowden, dass die NSA die EU-Vertretung verwanzt, das Büro des Generalsekretärs abgehört und die Telefone von über 35 Staatschefs überwacht hatte.',
                    layers: [],
                    image: { wiki: 'Headquarters_of_the_United_Nations', caption: 'United Nations HQ, New York' }
                },
                {
                    center: [116.39, 39.91], zoom: 10,
                    title: '🕵️ MSS — CHINA\'S INTELLIGENCE MACHINE',
                    title_de: '🕵️ MSS — CHINAS GEHEIMDIENSTAPPARAT',
                    text: 'China\'s Ministry of State Security (MSS) is among the world\'s largest intelligence agencies. Unlike Western agencies focused on HUMINT (human spies), the MSS pioneered mass cyber-espionage — hacking government systems, defense contractors, and tech companies worldwide. The 2015 OPM hack alone stole 22 million US federal employee records. China\'s "Thousand Talents Program" recruited foreign scientists, blurring the line between academic exchange and espionage.',
                    text_de: 'Chinas Ministerium für Staatssicherheit (MSS) gehört zu den größten Geheimdiensten der Welt. Anders als westliche Dienste mit Fokus auf HUMINT setzte das MSS auf Massen-Cyberspionage — Hackerangriffe auf Regierungssysteme, Rüstungsunternehmen und Technologiekonzerne weltweit. Der OPM-Hack von 2015 erbeutete allein 22 Millionen Datensätze von US-Bundesangestellten.',
                    layers: [],
                    image: { wiki: 'Ministry_of_State_Security_(China)', caption: 'MSS operations, Beijing' }
                },
                {
                    center: [-76.77, 39.11], zoom: 10,
                    title: '🕵️ NSA — FORT MEADE',
                    title_de: '🕵️ NSA — FORT MEADE',
                    text: 'The National Security Agency (NSA) at Fort Meade, Maryland is the world\'s largest signals intelligence (SIGINT) organization. Revealed in detail by Edward Snowden in 2013, the NSA operates global surveillance programs including PRISM (tech company data access), XKeyscore (internet search tool), and Tempora (fiber-optic cable tapping with UK\'s GCHQ). The NSA campus has its own power plant, shopping center, and employs 30,000–40,000 people. It intercepts an estimated 1.7 billion communications per day.',
                    text_de: 'Die National Security Agency (NSA) in Fort Meade, Maryland ist die weltweit größte Organisation für Signalaufklärung (SIGINT). 2013 durch Edward Snowden enthüllt, betreibt die NSA globale Überwachungsprogramme wie PRISM, XKeyscore und Tempora. Der NSA-Campus hat ein eigenes Kraftwerk, Einkaufszentrum und beschäftigt 30.000–40.000 Mitarbeiter. Täglich werden geschätzt 1,7 Milliarden Kommunikationsvorgänge abgefangen.',
                    layers: [],
                    image: { wiki: 'National_Security_Agency', caption: 'NSA Headquarters, Fort Meade' },
                    video: 'dBbe5oM-mBI'
                }
            ]
        },

        iconicarenas: {
            name: 'Iconic Arenas — Legendary Sports Venues',
            name_de: 'Legendäre Arenen — Ikonische Sportstätten',
            category: 'sports',
            steps: [
                {
                    center: [12.4924, 41.8902], zoom: 15,
                    title: '⚔️ COLOSSEUM — THE ORIGINAL ARENA',
                    title_de: '⚔️ KOLOSSEUM — DIE ORIGINAL-ARENA',
                    text: 'The Flavian Amphitheatre, completed in 80 AD under Emperor Titus, is the blueprint for every modern stadium. Built in just 8 years by 60,000 Jewish slaves, it held 50,000–80,000 spectators watching gladiatorial combat, wild animal hunts, and mock naval battles (the arena could be flooded). The hypogeum below contained 80 lift shafts to raise animals and fighters. Construction cost: estimated 200 million sesterces (~$1.5 billion today). UNESCO World Heritage Site and New Wonder of the World.',
                    text_de: 'Das Flavische Amphitheater, fertiggestellt 80 n.Chr. unter Kaiser Titus, ist die Blaupause für jedes moderne Stadion. Erbaut in nur 8 Jahren von 60.000 jüdischen Sklaven, fasste es 50.000–80.000 Zuschauer für Gladiatorenkämpfe, Tierhetzen und nachgestellte Seeschlachten (die Arena konnte geflutet werden). Das Hypogäum darunter enthielt 80 Aufzugschächte. Baukosten: geschätzt 200 Mio. Sesterzen (~1,5 Mrd. € heute). UNESCO-Welterbe und Neues Weltwunder.',
                    layers: [],
                    image: { wiki: 'Colosseum', caption: 'The Colosseum, Rome — built 80 AD' },
                    video: 'eiJfppOPItQ'
                },
                {
                    center: [-82.0203, 33.5032], zoom: 15,
                    title: '🏌️ AUGUSTA NATIONAL — THE MASTERS',
                    title_de: '🏌️ AUGUSTA NATIONAL — THE MASTERS',
                    text: 'Augusta National Golf Club in Georgia is the most exclusive and revered golf course on Earth. Founded in 1933 by Bobby Jones and Clifford Roberts, it hosts The Masters — the first major of the year. Membership is invitation-only (~300 members; women admitted only since 2012). The iconic Amen Corner (holes 11–13) has decided countless tournaments. Green jacket tradition began 1949. No running, no cell phones, sandwiches cost $1.50. Construction cost: $70,000 in 1933 (~$1.6 million today). TV revenue: $130+ million per Masters.',
                    text_de: 'Der Augusta National Golf Club in Georgia ist der exklusivste und verehrteste Golfplatz der Welt. 1933 von Bobby Jones und Clifford Roberts gegründet, beheimatet er The Masters — das erste Major des Jahres. Mitgliedschaft nur auf Einladung (~300 Mitglieder; Frauen erst seit 2012 zugelassen). Das ikonische Amen Corner (Löcher 11–13) hat zahllose Turniere entschieden. Grünes-Jackett-Tradition seit 1949. Kein Rennen, keine Handys, Sandwiches kosten $1,50. Baukosten: $70.000 (1933) — ~1,6 Mio. € heute.',
                    layers: [],
                    image: { wiki: 'Augusta_National_Golf_Club', caption: 'Augusta National — Amen Corner' },
                    video: 'K5lJaBwvFjU'
                },
                {
                    center: [-0.2146, 51.4341], zoom: 15,
                    title: '🎾 WIMBLEDON — THE CHAMPIONSHIPS',
                    title_de: '🎾 WIMBLEDON — THE CHAMPIONSHIPS',
                    text: 'The All England Lawn Tennis Club has hosted The Championships since 1877 — the oldest tennis tournament in the world. Centre Court seats 14,979 spectators and got its retractable roof in 2009 (cost: £100 million). Wimbledon is the only Grand Slam played on grass. Strict white clothing rules, strawberries & cream tradition (28,000 kg consumed annually), and the Royal Box make it tennis\' most prestigious event. Queue tradition: fans camp overnight for unreserved seats. Prize money 2024: £44.7 million.',
                    text_de: 'Der All England Lawn Tennis Club veranstaltet The Championships seit 1877 — das älteste Tennisturnier der Welt. Centre Court fasst 14.979 Zuschauer und erhielt 2009 sein Schiebedach (Kosten: 100 Mio. £). Wimbledon ist das einzige Grand Slam auf Rasen. Strenge weiße Kleiderordnung, Erdbeeren mit Sahne (28.000 kg jährlich), und die Royal Box machen es zum prestigeträchtigsten Tennis-Event. Queue-Tradition: Fans campen über Nacht für Stehplätze. Preisgeld 2024: 44,7 Mio. £.',
                    layers: [],
                    image: { wiki: 'The_Championships,_Wimbledon', caption: 'Centre Court, Wimbledon' },
                    video: 'VqAu4dGkFRk'
                },
                {
                    center: [12.3912, 47.4225], zoom: 14,
                    title: '⛷️ STREIF, KITZBÜHEL — THE DEADLIEST DESCENT',
                    title_de: '⛷️ STREIF, KITZBÜHEL — DIE TÖDLICHSTE ABFAHRT',
                    text: 'The Streif on the Hahnenkamm is the most feared downhill ski course in the world. 3,312 meters long with an 860m vertical drop, racers reach 150 km/h on the Mausefalle (85% gradient — nearly vertical). Since 1931, only 50% of starters have finished. The course has seen multiple career-ending crashes. 100,000+ spectators line the slope each January for the Hahnenkammrennen. Construction cost for modern infrastructure: €50+ million. The Zielschuss finish is so steep that racers experience 4G forces on impact.',
                    text_de: 'Die Streif am Hahnenkamm ist die gefürchtetste Skiabfahrt der Welt. 3.312 Meter lang mit 860m Höhenunterschied, erreichen Rennläufer 150 km/h an der Mausefalle (85% Gefälle — nahezu senkrecht). Seit 1931 haben nur 50% der Starter ins Ziel gefunden. Die Strecke hat zahlreiche karrierebeendende Stürze gesehen. Über 100.000 Zuschauer säumen jeden Januar die Piste beim Hahnenkammrennen. Infrastrukturkosten: über 50 Mio. €. Beim Zielschuss wirken 4G auf die Fahrer.',
                    layers: [],
                    image: { wiki: 'Hahnenkamm_(Kitzbühel)', caption: 'The Streif — Hahnenkamm, Kitzbühel' },
                    video: 'PVJQ3cUBj_o'
                },
                {
                    center: [6.0392, 45.0906], zoom: 13,
                    title: '🚴 ALPE D\'HUEZ — TOUR DE FRANCE LEGEND',
                    title_de: '🚴 ALPE D\'HUEZ — TOUR DE FRANCE LEGENDE',
                    text: 'Alpe d\'Huez is cycling\'s most iconic mountain climb. 21 hairpin bends over 13.8 km with 1,071m elevation gain and an average gradient of 8.1% (max 13%). First climbed in the Tour de France in 1952 by Fausto Coppi. Known as "the Dutch Mountain" — the Netherlands has the most stage winners. Up to 1 million fans line the switchbacks on race day, creating a deafening corridor. Each hairpin is named after a past winner. Dutch Corner (bend 7) is the wildest party on the mountain. Marco Pantani holds the record: 36 min 50 sec (1997).',
                    text_de: 'Die Alpe d\'Huez ist der ikonischste Berganstieg im Radsport. 21 Haarnadelkurven über 13,8 km mit 1.071m Höhenunterschied und 8,1% Durchschnittssteigung (max 13%). Erstmals bei der Tour de France 1952 von Fausto Coppi bezwungen. Als „der holländische Berg" bekannt — die Niederlande haben die meisten Etappensieger. Bis zu 1 Million Fans säumen die Serpentinen, Dutch Corner (Kehre 7) ist die wildeste Party am Berg. Marco Pantani hält den Rekord: 36 Min. 50 Sek. (1997).',
                    layers: [],
                    image: { wiki: 'Alpe_d%27Huez', caption: 'Alpe d\'Huez — 21 hairpin bends' },
                    video: 'YZr15QLRT0c'
                },
                {
                    center: [-86.2347, 39.7955], zoom: 14,
                    title: '🏎️ INDIANAPOLIS MOTOR SPEEDWAY — THE BRICKYARD',
                    title_de: '🏎️ INDIANAPOLIS MOTOR SPEEDWAY — THE BRICKYARD',
                    text: 'Indianapolis Motor Speedway is the largest sporting venue in the world by capacity — 257,325 permanent seats (up to 300,000+ with infield). Built in 1909, the 2.5-mile oval was originally paved with 3.2 million bricks (hence "The Brickyard"). Today only a 3-foot strip of original bricks remains at the start-finish line — winners kiss them. The Indy 500 (first held 1911) is the single largest one-day sporting event on Earth. Speeds exceed 370 km/h. Construction cost: $3 million in 1909 (~$100 million today). The facility covers 253 acres — you could fit the Vatican, Wimbledon, and Monaco\'s F1 circuit inside it.',
                    text_de: 'Der Indianapolis Motor Speedway ist die größte Sportstätte der Welt nach Kapazität — 257.325 feste Sitze (über 300.000 mit Infield). 1909 erbaut, war das 4-km-Oval ursprünglich mit 3,2 Millionen Ziegeln gepflastert (daher „The Brickyard"). Heute bleibt nur ein 1-Meter-Streifen Originalziegel an der Ziellinie — Sieger küssen sie. Das Indy 500 (erstmals 1911) ist das größte eintägige Sportereignis der Erde. Geschwindigkeiten über 370 km/h. Baukosten: $3 Mio. (1909) — ~100 Mio. € heute. Die Anlage ist 102 Hektar groß — Vatikan, Wimbledon und Monacos F1-Strecke passen hinein.',
                    layers: [],
                    image: { wiki: 'Indianapolis_Motor_Speedway', caption: 'Indianapolis Motor Speedway — The Brickyard' },
                    video: 'KfMHkNrPpBU'
                },
                {
                    center: [-0.1297, 51.5945], zoom: 15,
                    title: '🎯 ALEXANDRA PALACE — THE ALLY PALLY',
                    title_de: '🎯 ALEXANDRA PALACE — THE ALLY PALLY',
                    text: 'Alexandra Palace in North London — "The Ally Pally" — has hosted the PDC World Darts Championship since 2007. Originally built in 1873 as "The People\'s Palace", it was the site of the BBC\'s first regular TV broadcast in 1936. The darts atmosphere is unique in sport: 3,000 fans in fancy dress create the most raucous sporting crowd on Earth. "Stand Up If You Love the Darts" echoes through Christmas and New Year. Prize money: £2.5 million (2024). The 7.5-foot walk from backstage to the oche is the most nerve-wracking in sports. Construction cost (1873): £177,000 (~£20 million today).',
                    text_de: 'Alexandra Palace in Nord-London — „The Ally Pally" — ist seit 2007 Austragungsort der PDC-Darts-WM. 1873 als „The People\'s Palace" erbaut, war es 1936 Standort der ersten regulären BBC-Fernsehsendung. Die Darts-Atmosphäre ist einzigartig: 3.000 kostümierte Fans erzeugen die lauteste Sportkulisse der Welt. „Stand Up If You Love the Darts" hallt durch Weihnachten und Silvester. Preisgeld: 2,5 Mio. £ (2024). Der 2,3-Meter-Gang zur Oche ist der nervenaufreibendste im Sport. Baukosten (1873): £177.000 (~20 Mio. € heute).',
                    layers: [],
                    image: { wiki: 'Alexandra_Palace', caption: 'Alexandra Palace — PDC World Darts Championship' },
                    video: 'gu3Jok6sDXA'
                },
                {
                    center: [144.9834, -37.8200], zoom: 15,
                    title: '🏏 MCG — MELBOURNE CRICKET GROUND',
                    title_de: '🏏 MCG — MELBOURNE CRICKET GROUND',
                    text: 'The Melbourne Cricket Ground (MCG) is the 10th-largest stadium on Earth and Australia\'s spiritual home of sport. Established 1853 — older than modern football, basketball, and baseball. Capacity: 100,024. Hosted the 1956 Olympics opening ceremony and 2006 Commonwealth Games. The Boxing Day Test (cricket) draws 90,000+ annually — a national ritual. MCG has hosted 115+ Test cricket matches — more than any other ground. The Great Southern Stand cost AUD $150 million (1992). The MCC Long Room is one of sport\'s most hallowed viewing areas. It\'s also the home of AFL — Australian Rules Football grand finals regularly sell out within minutes.',
                    text_de: 'Der Melbourne Cricket Ground (MCG) ist das 10.-größte Stadion der Erde und Australiens geistliche Sportheimstätte. Gegründet 1853 — älter als moderner Fußball, Basketball und Baseball. Kapazität: 100.024. Austragungsort der Olympischen Spiele 1956 und Commonwealth Games 2006. Der Boxing Day Test (Cricket) zieht jährlich über 90.000 Zuschauer — ein nationales Ritual. Der MCG hat über 115 Test-Cricket-Spiele ausgerichtet — mehr als jedes andere Stadion. Die Great Southern Stand kostete 150 Mio. AUD (1992). AFL-Endspiele sind regelmäßig in Minuten ausverkauft.',
                    layers: [],
                    image: { wiki: 'Melbourne_Cricket_Ground', caption: 'MCG — Melbourne Cricket Ground, 100,024 seats' },
                    video: 'fXdz4eFGwzE'
                },
                {
                    center: [10.6665, 59.9628], zoom: 14,
                    title: '⛷️ HOLMENKOLLEN — NORWAY\'S SACRED HILL',
                    title_de: '⛷️ HOLMENKOLLEN — NORWEGENS HEILIGER BERG',
                    text: 'Holmenkollen in Oslo is the world\'s most famous ski jumping hill and a Norwegian national monument. First built 1892, it has been rebuilt 19 times — most recently in 2010 for the 2011 World Championships (cost: NOK 1.8 billion / ~€170 million). The current hill record is 141 meters. The annual Holmenkollen Ski Festival draws 100,000+ spectators — the largest Nordic skiing event globally. The ski jumping tower is also an observation deck with panoramic views of Oslo. The Ski Museum at the base (opened 1923) is the world\'s oldest. Cross-country skiing and biathlon complete the Nordic triple at this venue.',
                    text_de: 'Der Holmenkollen in Oslo ist die berühmteste Skisprungschanze der Welt und ein norwegisches Nationaldenkmal. 1892 erstmals erbaut, wurde er 19 Mal umgebaut — zuletzt 2010 für die WM 2011 (Kosten: 1,8 Mrd. NOK / ~170 Mio. €). Aktueller Schanzenrekord: 141 Meter. Das jährliche Holmenkollen-Skifestival zieht über 100.000 Zuschauer an — das größte Nordisch-Event weltweit. Der Sprungturm dient auch als Aussichtsplattform über Oslo. Das Skimuseum am Fuß (eröffnet 1923) ist das älteste der Welt.',
                    layers: [],
                    image: { wiki: 'Holmenkollen_ski_jump', caption: 'Holmenkollen Ski Jump, Oslo' },
                    video: '5gXqm2gLwMo'
                },
                {
                    center: [-0.3417, 51.4559], zoom: 15,
                    title: '🏉 TWICKENHAM — FORTRESS OF RUGBY',
                    title_de: '🏉 TWICKENHAM — FESTUNG DES RUGBY',
                    text: 'Twickenham Stadium in Southwest London is the largest dedicated rugby union venue in the world — 82,000 seats. Opened in 1907 on a former cabbage patch (earning the nickname "The Cabbage Patch"). Home of England Rugby and the RFU. Six Nations matches here are legendary — 82,000 singing "Swing Low, Sweet Chariot" creates an unforgettable wall of sound. Hosted the 2015 Rugby World Cup final (New Zealand vs Australia). Major redevelopment in 2006 cost £140 million. The World Rugby Museum on-site chronicles 200 years of the sport. Annual economic impact to the local area: £100+ million.',
                    text_de: 'Das Twickenham-Stadion in Südwest-London ist die größte reine Rugby-Union-Spielstätte der Welt — 82.000 Plätze. 1907 auf einem ehemaligen Kohlfeld eröffnet (Spitzname: „The Cabbage Patch"). Heimat des englischen Rugby und der RFU. Six-Nations-Spiele hier sind legendär — 82.000 singen „Swing Low, Sweet Chariot" und erzeugen eine unvergessliche Klangwand. Austragungsort des Rugby-WM-Finales 2015. Großumbau 2006: 140 Mio. £. Das World Rugby Museum dokumentiert 200 Jahre Sportgeschichte.',
                    layers: [],
                    image: { wiki: 'Twickenham_Stadium', caption: 'Twickenham Stadium — 82,000 seats' },
                    video: 'I37x7Ohmz4E'
                },
                {
                    center: [7.4206, 43.7347], zoom: 15,
                    title: '🏎️ CIRCUIT DE MONACO — THE CROWN JEWEL',
                    title_de: '🏎️ CIRCUIT DE MONACO — DAS KRONJUWEL',
                    text: 'The Circuit de Monaco is the most famous and prestigious Formula 1 race in the world. First held in 1929, the 3.337 km street circuit threads through Monte Carlo\'s narrow streets, through a tunnel, and along the harbour. Top speed: 290 km/h, average: 160 km/h — the slowest F1 circuit but the hardest. Ayrton Senna won 6 times (record). It takes 3 weeks to build the circuit and 3 weeks to dismantle it. Organising cost: €30+ million per race. Yachts in the harbour sell viewing spots for €100,000+. Graham Hill\'s 5 wins in the 1960s earned Monaco its "Crown Jewel" title. Zero run-off areas — one mistake and you\'re in the barriers.',
                    text_de: 'Der Circuit de Monaco ist das berühmteste und prestigeträchtigste Formel-1-Rennen der Welt. Erstmals 1929 ausgetragen, schlängelt sich der 3,337 km lange Straßenkurs durch Monte Carlos enge Gassen, durch einen Tunnel und am Hafen entlang. Topspeed: 290 km/h, Durchschnitt: 160 km/h — langsamster F1-Kurs, aber der schwierigste. Ayrton Senna gewann 6 Mal (Rekord). 3 Wochen Aufbau und 3 Wochen Abbau. Organisationskosten: über 30 Mio. € pro Rennen. Yachten im Hafen verkaufen Zuschauerplätze für 100.000 €+. Null Auslaufzonen — ein Fehler und du steckst in der Leitplanke.',
                    layers: [],
                    image: { wiki: 'Monaco_Grand_Prix', caption: 'Circuit de Monaco — F1 street circuit' },
                    video: '0BXFzPDg6rU'
                }
            ]
        }
    };

    // Merge into main TOURS object when ready
    function mergeNewTours() {
        if (window._TOURS_REF) {
            Object.assign(window._TOURS_REF, NEW_TOURS);
            console.log('[tours_new] Merged 6 new tours into TOURS');
            // Rebuild tour sites GeoJSON so new tours get map dots
            if (typeof window._refreshTourSites === 'function') window._refreshTourSites();
        } else {
            setTimeout(mergeNewTours, 500);
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(mergeNewTours, 1000));
    } else {
        setTimeout(mergeNewTours, 1000);
    }
})();
