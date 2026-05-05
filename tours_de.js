// GEOPULSE — German Tour Translations
// Injects title_de / text_de into existing TOURS steps after main.js loads
window._applyToursDE = function() {
    if (!window._TOURS_REF || window._toursDE_applied) return;
    window._toursDE_applied = true;
    const T = window._TOURS_REF;

    // ── Helper: apply DE translations to a tour ──
    function applyDE(tourId, deSteps) {
        if (!T[tourId]) return;
        deSteps.forEach((de, i) => {
            if (T[tourId].steps[i] && de) {
                if (de.t) T[tourId].steps[i].title_de = de.t;
                if (de.d) T[tourId].steps[i].text_de = de.d;
            }
        });
    }

    // ── Tour names (DE) ──
    const NAMES_DE = {
        welcome: 'Willkommen bei GEOPULSE',
        ringoffire: 'Feuerring',
        nuclear: 'Nukleares Erbe',
        cables: 'Digitale Seidenstraße',
        bri: 'Neue Seidenstraße',
        coldwar: 'Kalter Krieg bis Wiedervereinigung',
        trump: 'Trump Welttour – Macht, Deals & Disruption',
        chokepoints: 'Nadelöhre – Die Welt hängt am seidenen Faden',
        battery: 'Der Batterie-Wettlauf – Woher kommt dein Handy?',
        climate: 'Klimafronten – Wer verbrennt, wer ertrinkt',
        water: 'Wasserkriege – Der nächste globale Konflikt',
        f1: 'Formel 1 – Der globale Geschwindigkeitszirkus',
        worldcup: 'FIFA Weltmeisterschaft – Die größte Bühne des Fußballs',
        ww1: 'Erster Weltkrieg – Der Große Krieg (1914–1918)',
        ww2: 'Zweiter Weltkrieg – Der tödlichste Konflikt (1939–1945)',
        quakes: 'Erdbeben & Eruptionen – Wenn die Erde bricht',
        olympics: 'Olympische Spiele – Geschichte der Nationen & des Sports',
        romanempire: 'Das Römische Reich – Aufstieg, Herrschaft & Untergang',
        summits14: '14 Achttausender – Die höchsten Gipfel der Welt',
        spacerace: 'Wettlauf ins All – Von Apollo bis Mars',
        extremeearth: 'Extreme Erde – Planet der Rekorde',
        lostwonders: 'Verlorene Wunder – Monumente der Menschheit',
        techcapitals: 'Tech-Hauptstädte – Wo die Zukunft gebaut wird',
        forbiddenzones: 'Verbotene Zonen – Orte, die man nicht betreten darf',
        shipwrecks: 'Schiffswracks & Verlorene Schätze'
    };
    Object.keys(NAMES_DE).forEach(id => {
        if (T[id]) T[id].name_de = NAMES_DE[id];
    });

    // ═══════════════════════════════════════════
    // RING OF FIRE
    // ═══════════════════════════════════════════
    applyDE('ringoffire', [
        { t: '🌋 MOUNT FUJI — JAPAN', d: 'Japan liegt auf dem Pazifischen Feuerring — einem 40.000 km langen Hufeisen seismischer und vulkanischer Aktivität. Mount Fuji (3.776 m) brach zuletzt 1707 aus und wird rund um die Uhr überwacht. Japan erlebt ca. 1.500 Erdbeben pro Jahr.' },
        { t: '🌋 KRAKATAU & MERAPI — INDONESIEN', d: 'Indonesien hat über 130 aktive Vulkane — mehr als jedes andere Land. Die Eruption des Krakatau 1883 war 5.000 km weit zu hören und verursachte einen globalen Temperaturrückgang. Der Kindvulkan Anak Krakatau löste 2018 einen Tsunami aus.' },
        { t: '🌋 KASKADENKETTE — USA', d: 'Die Cascade Range erstreckt sich von BC bis Kalifornien. Der Ausbruch des Mount St. Helens 1980 tötete 57 Menschen — der tödlichste in der US-Geschichte. Mount Rainier gilt als der gefährlichste wegen der Lahar-Gefahr für über 3 Mio. Einwohner nahe Seattle.' },
        { t: '🌋 ANDEN-VULKANE — SÜDAMERIKA', d: 'Die Andenkette beherbergt die höchsten aktiven Vulkane der Erde. Cotopaxi (5.897 m) in Ecuador ist einer der gefährlichsten weltweit. Nevado del Ruiz in Kolumbien tötete 1985 23.000 Menschen, als Lahare die Stadt Armero begruben.' },
        { t: '🌋 ISLAND — MITTELATLANTISCHER RÜCKEN', d: 'Island liegt direkt auf dem Mittelatlantischen Rücken, wo die Eurasische und Nordamerikanische Platte auseinanderdriften. Eyjafjallajökulls Ausbruch 2010 legte den europäischen Luftverkehr 6 Tage lang lahm und strandete 10 Millionen Reisende.' },
        { t: '🌍 DER KOMPLETTE FEUERRING', d: 'Der Pazifische Feuerring ist verantwortlich für 75% aller Vulkanausbrüche und 90% aller Erdbeben weltweit. Er erstreckt sich über 40.000 km von Neuseeland über Japan, Alaska und hinunter über den gesamten amerikanischen Kontinent. Über 450 Vulkane säumen diesen Bogen.' }
    ]);

    // ═══════════════════════════════════════════
    // NUCLEAR LEGACY
    // ═══════════════════════════════════════════
    applyDE('nuclear', [
        { t: '☢️ TSCHERNOBYL — UKRAINE, 1986', d: 'Am 26. April 1986 erlitt Reaktor 4 des Kernkraftwerks Tschernobyl eine katastrophale Kernschmelze und Explosion. Es wurde 400-mal mehr Strahlung freigesetzt als bei der Hiroshima-Bombe. 350.000 Menschen wurden dauerhaft evakuiert. Die 30-km-Sperrzone bleibt unbewohnbar.' },
        { t: '☢️ FUKUSHIMA DAIICHI — JAPAN, 2011', d: 'Am 11. März 2011 löste ein Erdbeben der Stärke 9,1 einen 14 Meter hohen Tsunami aus, der Fukushimas Schutzmauern überwand. Drei Reaktoren erlitten vollständige Kernschmelzen. 154.000 Bewohner wurden evakuiert. 2023 begann Japan die umstrittene Einleitung von behandeltem radioaktivem Wasser in den Pazifik.' },
        { t: '☢️ THREE MILE ISLAND — USA, 1979', d: 'Die partielle Kernschmelze von TMI-2 bei Harrisburg, Pennsylvania war der schwerste Nuklearunfall in der US-Geschichte. Obwohl niemand starb, veränderte sie die Nuklearregulierung weltweit grundlegend. 34 Jahre lang wurde kein neuer US-Reaktor genehmigt.' },
        { t: '☢️ SEMIPALATINSK — KASACHSTAN, 1949–1989', d: 'Das sowjetische „Polygon" war Schauplatz von 456 Atomwaffentests über 40 Jahre — darunter 116 atmosphärische Detonationen. 1,5 Millionen Menschen in umliegenden Dörfern wurden ohne ihr Wissen radioaktiver Strahlung ausgesetzt. Die Krebsraten liegen noch heute 50% über dem Landesdurchschnitt.' },
        { t: '☢️ BIKINI-ATOLL — MARSHALLINSELN, 1946–1958', d: 'Die USA führten 67 Atomtests auf Bikini durch, darunter Castle Bravo (1954) — eine 15-Megatonnen-Explosion, 1.000-mal stärker als Hiroshima. Die 167 Bikini-Insulaner wurden „vorübergehend" umgesiedelt und sind nie zurückgekehrt. Die Strahlungswerte sind 70+ Jahre später immer noch zu hoch.' }
    ]);

    // ═══════════════════════════════════════════
    // EARTHQUAKES & ERUPTIONS
    // ═══════════════════════════════════════════
    applyDE('quakes', [
        { t: '🌊 TŌHOKU-ERDBEBEN — JAPAN, 2011', d: 'Am 11. März 2011 erschütterte ein Erdbeben der Stärke 9,1 die Pazifikküste Japans — das viertstärkste jemals aufgezeichnete. Der resultierende Tsunami erreichte Höhen von 40 Metern und drang bis zu 10 km ins Landesinnere vor. 19.759 Menschen starben, 6.242 wurden verletzt, 2.553 werden bis heute vermisst. Der Tsunami löste die Nuklearkatastrophe von Fukushima Daiichi aus (INES-Stufe 7). Wirtschaftlicher Schaden: 235 Milliarden Dollar — die teuerste Naturkatastrophe der Geschichte.' },
        { t: '🌊 INDISCHER-OZEAN-TSUNAMI — 2004', d: 'Am 26. Dezember 2004 löste ein Erdbeben der Stärke 9,1 vor Sumatra den tödlichsten Tsunami der Geschichte aus. Wellen bis 30 Meter Höhe trafen 14 Länder rund um den Indischen Ozean. Todesopfer: 227.898 Menschen in Indonesien (170.000), Sri Lanka (35.000), Indien (16.000) und Thailand (8.000). Der Tsunami bewegte sich mit 800 km/h — Geschwindigkeit eines Düsenjets. Es gab kein Tsunami-Warnsystem im Indischen Ozean. Eines wurde bis 2006 installiert.' },
        { t: '💔 ERDBEBEN IN HAITI — 2010', d: 'Am 12. Januar 2010 traf ein Erdbeben der Stärke 7,0 nur 25 km von Port-au-Prince entfernt, Haitis Hauptstadt. Das Beben tötete schätzungsweise 220.000–316.000 Menschen, verletzte 300.000 und machte 1,5 Millionen obdachlos — in einem Land, das bereits das ärmste der westlichen Hemisphäre war. 250.000 Häuser und 30.000 Geschäftsgebäude stürzten ein.' },
        { t: '💔 TÜRKEI-SYRIEN-ERDBEBEN — 2023', d: 'Am 6. Februar 2023 erschütterten zwei massive Erdbeben (M7,8 und M7,7) die Südosttürkei und Nordsyrien innerhalb von 9 Stunden. Todesopfer: 59.259 (Türkei: 50.783, Syrien: 8.476). Über 120.000 wurden verletzt. 14 Millionen Menschen waren betroffen. Das Beben war bis in 1.500 km entferntes Ägypten spürbar. In der Türkei wurden 520.000+ Gebäude beschädigt oder zerstört — viele wegen korrupter Baupraktiken.' },
        { t: '🌋 VESUV — POMPEJI, 79 n. Chr.', d: 'Am 24. August 79 n. Chr. brach der Vesuv mit einer geschätzten Stärke von VEI-5 aus und begrub die römischen Städte Pompeji und Herculaneum unter 4–6 Metern vulkanischer Asche. Geschätzt 16.000 Menschen starben durch pyroklastische Ströme mit 700°C und 100 km/h. Die Städte wurden in außergewöhnlichem Detail konserviert — 1.700 Jahre lang in der Zeit eingefroren bis zu ihrer Wiederentdeckung 1748. Heute leben 3 Millionen Menschen in der Gefahrenzone.' },
        { t: '🌋 KRAKATAU — INDONESIEN, 1883', d: 'Am 27. August 1883 brach der Krakatau in einem der gewaltigsten Vulkanausbrüche der Geschichte aus (VEI-6). Die Explosion war 4.800 km weit in Australien zu hören — das lauteste Geräusch der Neuzeit. Sie erzeugte Tsunamis bis 30 Meter Höhe und tötete 36.417 Menschen. Die Eruption schleuderte 25 km³ Gestein und Asche aus, was die globale Temperatur 5 Jahre lang um 1,2°C senkte.' },
        { t: '🌋 TAMBORA — DAS JAHR OHNE SOMMER, 1815', d: 'Der Ausbruch des Mount Tambora am 10. April 1815 war der stärkste Vulkanausbruch der aufgezeichneten Menschheitsgeschichte — VEI-7. Er schleuderte 160 km³ Material aus, die Eruptionssäule erreichte 43 km Höhe. Direkte Tote: ca. 10.000. Doch die globalen Klimafolgen töteten weit mehr: Das Schwefeldioxid blockierte das Sonnenlicht und machte 1816 zum „Jahr ohne Sommer". Ernteausfälle verursachten Hungersnöte in Europa und Nordamerika. Geschätzte 90.000 Menschen starben an Hunger und Krankheiten.' },
        { t: '🌍 ERDBEBEN & ERUPTIONEN — DIE ZAHLEN', d: 'Die Erde erlebt jährlich etwa 500.000 nachweisbare Erdbeben. Davon sind 100.000 spürbar und etwa 100 verursachen Schäden. Das tödlichste Erdbeben der Geschichte: Shaanxi, China (1556) — 830.000 Tote. Das stärkste jemals aufgezeichnete: Chile (1960) — Magnitude 9,5. Es gibt weltweit ca. 1.500 potenziell aktive Vulkane, von denen 50–70 jedes Jahr ausbrechen. Seit 1900 haben Erdbeben und Vulkanausbrüche über 2,5 Millionen Menschen getötet.' }
    ]);

    // ═══════════════════════════════════════════
    // OLYMPIC GAMES
    // ═══════════════════════════════════════════
    applyDE('olympics', [
        { t: '🏛️ ATHEN 1896 — DIE WIEDERGEBURT', d: 'Die ersten modernen Olympischen Spiele fanden vom 6.–15. April 1896 in Athen statt. Organisiert von Pierre de Coubertin, belebten sie eine 1.500 Jahre ruhende Tradition. Teilnehmer: 241 Athleten aus 14 Nationen. Sportarten: 9. Keine Frauen traten an. Das Panathenäische Stadion, ursprünglich 329 v. Chr. erbaut, wurde für den Anlass restauriert. Zuschauer: ca. 80.000. James Connolly (USA) gewann das erste olympische Gold im Dreisprung.' },
        { t: '✊ BERLIN 1936 — PROPAGANDA & WIDERSTAND', d: 'Adolf Hitler beabsichtigte, die Olympischen Spiele 1936 als Schaufenster arischer Überlegenheit zu nutzen. Stattdessen gewann der afroamerikanische Athlet Jesse Owens 4 Goldmedaillen und widerlegte die Nazi-Rassenideologie vor 100.000 Zuschauern. Teilnehmer: 3.963 Athleten aus 49 Nationen. Es waren die ersten im Fernsehen übertragenen Spiele (162.000 Zuschauer). Der Olympische Fackellauf wurde hier eingeführt — als Propaganda des Hitler-Regimes.' },
        { t: '🇯🇵 TOKIO 1964 — ASIENS DEBÜT', d: 'Tokio 1964 waren die ersten Olympischen Spiele in Asien und symbolisierten Japans Wiederaufbau nach dem Krieg. Die Spiele führten Satellitenübertragung für 600 Millionen Zuschauer weltweit ein. Teilnehmer: 5.151 Athleten aus 93 Nationen. Japan baute den Shinkansen (Hochgeschwindigkeitszug) speziell für diese Spiele — er wurde 9 Tage vor der Eröffnungszeremonie eingeweiht. Die 2,7-Milliarden-Dollar-Investition verwandelte Tokio in eine moderne Metropole.' },
        { t: '😢 MÜNCHEN 1972 — TERROR BEI DEN SPIELEN', d: 'Die Münchner Olympiade sollte als „Heitere Spiele" die Erinnerung an Berlin 1936 auslöschen. Am 5. September nahmen palästinensische Terroristen (Schwarzer September) 11 israelische Athleten als Geiseln. Alle 11 Geiseln, 5 Terroristen und 1 deutscher Polizist wurden getötet. Trotz der Tragödie setzte das IOC die Spiele nach 34-stündiger Pause fort. Teilnehmer: 7.134 aus 121 Nationen. US-Schwimmer Mark Spitz gewann 7 Goldmedaillen.' },
        { t: '🇪🇸 BARCELONA 1992 — DIE GOLDENE ÄRA', d: 'Barcelona 1992 gilt als die besten Olympischen Spiele der Neuzeit. Es waren die ersten Spiele ohne Boykott seit 1972 und die ersten nach Ende des Kalten Krieges. Das „Dream Team" (US-Basketball mit Jordan, Magic, Bird) debütierte. Teilnehmer: 9.356 Athleten aus 169 Nationen. Die Spiele verwandelten Barcelona von einer Industriestadt in ein globales Reiseziel. TV-Zuschauer: 3,5 Milliarden.' },
        { t: '🇨🇳 PEKING 2008 — DAS SPEKTAKEL', d: 'China investierte 42 Milliarden Dollar für die prächtigsten Olympischen Spiele der Geschichte. Das Vogelnest-Stadion (91.000 Plätze) und der Water Cube wurden architektonische Ikonen. Die Eröffnungszeremonie gilt als die größte der Olympia-Geschichte — 15.000 Darsteller, 29.000 Feuerwerkskörper. Teilnehmer: 10.942 Athleten aus 204 Nationen (Rekord). Usain Bolt gewann 3 Gold und stellte 3 Weltrekorde auf. Michael Phelps gewann 8 Gold. TV-Zuschauer: 4,7 Milliarden.' },
        { t: '🇬🇧 LONDON 2012 — VERMÄCHTNIS-SPIELE', d: 'London wurde die erste Stadt, die dreimal Olympische Spiele austrug (1908, 1948, 2012). Die Spiele regenerierten den verarmten Osten Londons mit 9 Milliarden Pfund Infrastrukturinvestitionen. Teilnehmer: 10.568 Athleten aus 204 Nationen. Usain Bolt verteidigte seine Sprint-Titel. Team GB gewann 65 Medaillen — ihr bestes Ergebnis seit 104 Jahren. Erstmals entsandten alle Nationen weibliche Athleten.' },
        { t: '🇫🇷 PARIS 2024 — DIE OFFENEN SPIELE', d: 'Paris richtete seine dritten Olympischen Spiele aus (nach 1900 und 1924) mit einem revolutionären Open-Air-Konzept. Die Eröffnungszeremonie fand auf der Seine statt — 6.000 Athleten auf 85 Booten — die erste Zeremonie außerhalb eines Stadions. Teilnehmer: 10.714 Athleten aus 206 Nationen. Sportarten: 32 (erstmals Breaking/Breakdance). Wettbewerbe an ikonischen Orten: Beachvolleyball am Eiffelturm, Reitsport in Versailles. Budget: 8,8 Milliarden Euro.' },
        { t: '🏅 OLYMPISCHE SPIELE — IN ZAHLEN', d: 'Die modernen Olympischen Spiele wurden seit 1896 33-mal (Sommer) und seit 1924 24-mal (Winter) ausgetragen. Insgesamt nehmen 206 Nationen teil. Über 150.000 Athleten haben in 50+ Sportarten angetreten. Die USA führen den ewigen Medaillenspiegel mit über 2.600 Medaillen an. Die Olympischen Spiele generieren über 7 Milliarden Dollar pro Ausgabe. 5 Milliarden Menschen — 60% der Menschheit — sahen mindestens einen Teil der Spiele 2024 in Paris. Nächste Sommerspiele: Los Angeles 2028. Olympisches Motto: Citius, Altius, Fortius — Communiter (Schneller, Höher, Stärker — Gemeinsam).' }
    ]);

    // ═══════════════════════════════════════════
    // COLD WAR (full)
    // ═══════════════════════════════════════════
    applyDE('coldwar', [
        { t: '🧱 BERLIN — DIE GETEILTE STADT', d: 'Von 1961 bis 1989 teilte die Berliner Mauer die Stadt in West (demokratisch, NATO) und Ost (kommunistisch, Warschauer Pakt). Über 140 Menschen starben beim Fluchtversuch. Am 9. November 1989 öffnete die DDR die Grenze nach wochenlangen Massenprotesten. Tausende strömten mit Hämmern und Meißeln durch. Die Mauer fiel in einer einzigen Nacht — live im Fernsehen weltweit.' },
        { t: '⚔️ DER WARSCHAUER PAKT (1955–1991)', d: 'Der Warschauer Pakt vereinte 8 kommunistische Staaten unter sowjetischer Militärführung: UdSSR, Polen, DDR, Tschechoslowakei, Ungarn, Rumänien, Bulgarien und Albanien. Auf dem Höhepunkt hatte er 6 Millionen Soldaten und 60.000 Panzer, die der NATO am Eisernen Vorhang gegenüberstanden.' },
        { t: '⭐ MOSKAU — DAS ZENTRUM KOLLABIERT', d: 'Michail Gorbatschows Reformen — Glasnost (Offenheit) und Perestroika (Umgestaltung) — zersetzten unbeabsichtigt die Sowjetunion. Am 25. Dezember 1991 wurde die Sowjetflagge ein letztes Mal über dem Kreml eingeholt. 15 unabhängige Nationen entstanden aus den Trümmern des größten Landes der Welt.' },
        { t: '🇪🇺 DIE OSTERWEITERUNG', d: 'Nach dem Mauerfall drängten die ehemaligen Warschauer-Pakt-Staaten Richtung Westen. Polen, Tschechien und Ungarn traten 1999 der NATO bei. Die baltischen Staaten folgten 2004. Bis 2024 waren sogar Finnland und Schweden beigetreten. Russland betrachtet diese Erweiterung als existenzielle Bedrohung.' },
        { t: '🇺🇦 UKRAINE — DIE UNVOLLENDETE GESCHICHTE', d: 'Die Ukraine liegt genau an der Bruchlinie zwischen dem ehemaligen Warschauer Pakt und der NATO. 2014 stürzte die Euromaidan-Revolution einen pro-russischen Präsidenten. Russland annektierte die Krim. Im Februar 2022 startete Russland eine Vollinvasion — der größte europäische Krieg seit 1945.' },
        { t: '🌍 VOM EISERNEN VORHANG ZU NEUEN FRONTLINIEN', d: 'Der Kalte Krieg endete 1991, aber seine Echos bestimmen die heutige Welt. Die NATO wuchs von 16 auf 32 Mitglieder. Russland wandelte sich vom Supermacht zum isolierten Aggressor. China stieg von ländlicher Armut zur zweitgrößten Volkswirtschaft auf. Der Eiserne Vorhang ist weg, aber neue Trennlinien haben seinen Platz eingenommen.' }
    ]);

    // ═══════════════════════════════════════════
    // DIGITAL SILK ROAD (cables)
    // ═══════════════════════════════════════════
    applyDE('cables', [
        { t: '🌐 CORNWALL — KABELKNOTENPUNKT', d: '95% des interkontinentalen Datenverkehrs laufen durch unterseeische Glasfaserkabel — NICHT über Satelliten. Cornwall, England, ist einer der wichtigsten Kabellandepunkte der Welt. Kabel zu den USA, Europa und Afrika laufen hier zusammen. Ein einzelnes Kabel kann 250 Terabit pro Sekunde übertragen.' },
        { t: '🌐 SUEZKANAL & ROTES MEER — ENGPASS', d: 'Über ein Dutzend Unterseekabel verlaufen durch das Rote Meer und den Suez-Korridor und transportieren Internetverkehr zwischen Europa und Asien. 2024 beschädigten Huthi-Angriffe 3 Kabel und unterbrachen 25% des Datenverkehrs für Monate.' },
        { t: '🌐 SINGAPUR — ASIENS DIGITALE KREUZUNG', d: 'Singapur ist der größte Unterseekabel-Knotenpunkt in Asien. Es beherbergt über 70 Rechenzentren. Wenn Singapurs Kabelverbindungen durchtrennt würden, würde das halbe Internet Südostasiens ausfallen.' },
        { t: '🌐 TRANSATLANTIKKABEL — DAS RÜCKGRAT', d: 'Das erste transatlantische Telegrafenkabel wurde 1858 verlegt. Heute verbinden über 15 Glasfaserkabel Nordamerika mit Europa. Google, Meta, Microsoft und Amazon haben Milliarden in private Kabel investiert.' },
        { t: '🌍 DAS GLOBALE KABELNETZWERK', d: 'Es gibt über 550 aktive Unterseekabel mit 1,4 Millionen Kilometer Länge auf dem Meeresboden. Sie sind nur 3 cm dick, transportieren aber täglich Finanztransaktionen im Wert von 10 Billionen Dollar. Ohne diese Kabel würde das moderne Internet aufhören zu existieren.' }
    ]);

    // ═══════════════════════════════════════════
    // BELT & ROAD INITIATIVE
    // ═══════════════════════════════════════════
    applyDE('bri', [
        { t: '🛤️ XI\'AN — WO ALLES BEGINNT', d: 'Xi\'an war vor 2.000 Jahren der Ausgangspunkt der antiken Seidenstraße. 2013 verkündete Präsident Xi Jinping hier die Belt and Road Initiative (BRI) — das größte Infrastrukturprojekt der Menschheitsgeschichte. Über 1 Billion Dollar investiert in 150+ Ländern.' },
        { t: '🛤️ CPEC — CHINA-PAKISTAN-KORRIDOR', d: 'Der China-Pakistan-Wirtschaftskorridor (CPEC) ist das BRI-Flaggschiff: ein 62-Milliarden-Dollar-Netzwerk aus Straßen, Eisenbahnen und Pipelines. Es verbindet Kaschgar in Westchina mit dem Hafen Gwadar am Arabischen Meer und gibt China direkten Zugang zum Indischen Ozean.' },
        { t: '🛤️ PIRÄUS — CHINAS TOR ZU EUROPA', d: '2016 erwarb der chinesische Staatskonzern COSCO 67% des Hafens Piräus in Griechenland für 1,5 Milliarden Euro. Der Containerumschlag ist seitdem um 700% gestiegen. Piräus ist nun Chinas Einstiegspunkt in den europäischen Markt.' },
        { t: '🛤️ DSCHIBUTI — CHINAS MILITÄRISCHER FUSSABDRUCK', d: 'Dieses winzige ostafrikanische Land beherbergt Chinas erste Militärbasis im Ausland (eröffnet 2017), nur 10 km vom US-Stützpunkt Camp Lemonnier entfernt. Dschibutis Schulden gegenüber China übersteigen 70% des BIP.' },
        { t: '🛤️ NAIROBI — AFRIKAS BRI-KNOTENPUNKT', d: 'Kenias 3,6-Milliarden-Dollar-Eisenbahn Mombasa–Nairobi wurde von China gebaut. Sie verkürzte die Reisezeit von 12 auf 4,5 Stunden. China ist mittlerweile Afrikas größter bilateraler Kreditgeber mit über 170 Milliarden Dollar an Darlehen seit 2000.' },
        { t: '🌍 NEUE SEIDENSTRASSE — DAS GESAMTBILD', d: 'Die BRI umfasst 150+ Länder und 1 Billion Dollar an Investitionen. Kritiker nennen es Schuldenfallendiplomatie — Sri Lanka übergab den Hafen Hambantota für 99 Jahre nach einem Zahlungsausfall. Befürworter sagen, es füllt eine 40-Billionen-Dollar-Infrastrukturlücke. So oder so verändert es die Weltordnung.' }
    ]);

    // ═══════════════════════════════════════════
    // WORLD WAR I (full — 8 steps)
    // ═══════════════════════════════════════════
    applyDE('ww1', [
        { t: '🪖 DER GROSSE KRIEG — ÜBERBLICK', d: 'Dauer: 4 Jahre (Juli 1914 – November 1918). Ursache: Imperiale Rivalitäten, Militarismus und verflochtene Bündnisse, ausgelöst durch die Ermordung von Erzherzog Franz Ferdinand. Alliierte (Frankreich, UK, Russland, Italien, USA) gegen Mittelmächte (Deutschland, Österreich-Ungarn, Osmanisches Reich). Verluste: ~20 Millionen Tote, 21 Millionen Verwundete.' },
        { t: '🪖 SARAJEVO — DER FUNKE', d: 'Am 28. Juni 1914 erschoss Gavrilo Princip Erzherzog Franz Ferdinand und seine Frau Sophie auf den Straßen Sarajevos. Österreich-Ungarn machte Serbien verantwortlich und löste eine Kette von Bündnisverpflichtungen aus. Innerhalb von 6 Wochen befand sich ganz Europa im Krieg. Eine Kugel, abgefeuert von einem 19-Jährigen, tötete 20 Millionen Menschen.' },
        { t: '🪖 VERDUN — DIE HÖLLE', d: 'Die Schlacht von Verdun (Feb–Dez 1916) dauerte 303 Tage — die längste Einzelschlacht der Geschichte. Deutschland wollte „Frankreich ausbluten". ~700.000 Gefallene auf einer Front von nur 30 km Breite. Der französische Schlachtruf „Ils ne passeront pas!" wurde zum Symbol nationalen Widerstands. Über 60 Millionen Granaten wurden abgefeuert.' },
        { t: '🪖 YPERN — GIFTGAS', d: 'Bei Ypern in Belgien führte Deutschland am 22. April 1915 die chemische Kriegsführung ein und setzte 168 Tonnen Chlorgas frei. Tausende alliierte Soldaten erstickten in ihren Schützengräben. Drei Schlachten von Ypern töteten über 850.000 Soldaten.' },
        { t: '🪖 GALLIPOLI — CHURCHILLS WAGNIS', d: '1915 versuchten die Alliierten die Dardanellen einzunehmen und das Osmanische Reich aus dem Krieg zu drängen. Die Kampagne war ein katastrophales Scheitern. Über 500.000 Verluste in 8 Monaten. Für die Türkei war die Verteidigung ein entscheidender Moment unter Mustafa Kemal (dem späteren Atatürk).' },
        { t: '🪖 DIE SOMME — INDUSTRIELLER TOD', d: '1. Juli 1916: der tödlichste Tag in der Geschichte der britischen Armee. 19.240 britische Soldaten fielen vor Mittag. Die Schlacht an der Somme dauerte 141 Tage mit über 1 Million Gesamtverlusten. Der Panzer wurde hier erstmals eingesetzt (September 1916).' },
        { t: '🪖 COMPIÈGNE — DER WAFFENSTILLSTAND', d: 'Um 5:10 Uhr am 11. November 1918 wurde der Waffenstillstand in einem Eisenbahnwaggon im Wald von Compiègne unterzeichnet. Die Kämpfe endeten um 11:00 Uhr — „die elfte Stunde des elften Tages des elften Monats". Geschätzt 2.738 Soldaten starben am letzten Tag.' },
        { t: '🪖 VERSAILLES — SAAT DES NÄCHSTEN KRIEGES', d: 'Der Vertrag von Versailles (Juni 1919) legte Deutschland erdrückende Bedingungen auf: Verlust von 13% des Territoriums, fast vollständige Entwaffnung und Reparationen von 132 Milliarden Goldmark (~442 Milliarden Dollar heute). Artikel 231 — die „Kriegsschuldklausel" — zwang Deutschland, die alleinige Verantwortung zu akzeptieren. 20 Jahre später begann der Zweite Weltkrieg.' }
    ]);

    // ═══════════════════════════════════════════
    // WORLD WAR II (full — 9 steps)
    // ═══════════════════════════════════════════
    applyDE('ww2', [
        { t: '⚔️ ZWEITER WELTKRIEG — ÜBERBLICK', d: 'Dauer: 6 Jahre (September 1939 – September 1945). Ursache: NS-Expansionismus, japanischer Imperialismus, Scheitern der Beschwichtigung. Alliierte (UK, UdSSR, USA, Frankreich, China) gegen Achsenmächte (Deutschland, Japan, Italien). Opfer: 70–85 Millionen Tote — der tödlichste Konflikt der Menschheitsgeschichte. ~6 Millionen Juden im Holocaust ermordet.' },
        { t: '⚔️ DANZIG — DIE ERSTEN SCHÜSSE', d: 'Am 1. September 1939 um 4:45 Uhr eröffnete das Schlachtschiff Schleswig-Holstein das Feuer auf die polnische Garnison auf der Westerplatte in Danzig. Es war die erste Kriegshandlung des Zweiten Weltkriegs. Innerhalb von Stunden überschritten 1,5 Millionen deutsche Soldaten die polnische Grenze im „Blitzkrieg". Polen fiel in 5 Wochen.' },
        { t: '⚔️ LONDON — DER BLITZ', d: 'Von September 1940 bis Mai 1941 bombardierte Deutschland London 57 aufeinanderfolgende Nächte. Der Blitz tötete 43.000 Zivilisten und zerstörte über 1 Million Häuser. Churchills Trotz — „Wir werden an den Stränden kämpfen... wir werden uns niemals ergeben" — wurde zur Stimme des Widerstands. Der Sieg der RAF in der Luftschlacht um England verhinderte eine deutsche Invasion.' },
        { t: '⚔️ STALINGRAD — DER WENDEPUNKT', d: 'Die Schlacht von Stalingrad (Aug 1942 – Feb 1943) war die blutigste Schlacht der Geschichte: ~2 Millionen Verluste. Hitler befahl die Einnahme der Stadt um jeden Preis. Stalin befahl „Keinen Schritt zurück!" Die sowjetische Einkreisung und Kapitulation der 6. Armee (91.000 Kriegsgefangene) markierte den Wendepunkt. Von 91.000 deutschen Kriegsgefangenen kehrten nur ~5.000 jemals nach Hause zurück.' },
        { t: '⚔️ AUSCHWITZ — DER HOLOCAUST', d: 'Auschwitz-Birkenau war das größte NS-Vernichtungslager. Zwischen 1940 und 1945 wurden hier geschätzt 1,1 Millionen Menschen ermordet — 90% davon Juden. Der Holocaust (Shoah) tötete ungefähr 6 Millionen Juden — zwei Drittel der jüdischen Bevölkerung Europas. „Nie wieder" wurde das feierlichste Versprechen der Menschheit.' },
        { t: '⚔️ NORMANDIE — D-DAY', d: '6. Juni 1944: Operation Overlord, die größte Seelandung der Geschichte. 156.000 alliierte Soldaten landeten an fünf Stränden der Normandie. Über 4.400 Alliierte starben am ersten Tag. Innerhalb eines Monats waren 850.000 Soldaten gelandet. D-Day eröffnete die Westfront, die Nazi-Deutschland von Westen zermalmen sollte, während die Sowjets von Osten vorrückten.' },
        { t: '⚔️ HIROSHIMA — DAS ATOMZEITALTER', d: 'Am 6. August 1945 um 8:15 Uhr warf die B-29 „Enola Gay" die Uranbombe „Little Boy" auf Hiroshima. 80.000 Menschen starben sofort. Bis Jahresende stieg die Zahl auf 140.000. Drei Tage später wurde „Fat Man" auf Nagasaki abgeworfen — 70.000 Tote. Japan kapitulierte am 15. August 1945. Die Atombomben bleiben der einzige Einsatz von Kernwaffen in einem Krieg.' },
        { t: '⚔️ BERLIN — FALL DES DRITTEN REICHS', d: 'Im April 1945 umzingelten sowjetische Truppen Berlin mit 2,5 Millionen Soldaten. Die Schlacht um Berlin tötete ~175.000 Soldaten und bis zu 125.000 Zivilisten. Am 30. April beging Hitler Selbstmord in seinem Bunker. Deutschland kapitulierte bedingungslos am 8. Mai 1945 — dem Tag des Sieges.' },
        { t: '⚔️ VERMÄCHTNIS — EINE NEUE WELTORDNUNG', d: 'Der Zweite Weltkrieg tötete 70–85 Millionen Menschen — 3% der Weltbevölkerung. Aus seiner Asche entstanden: die Vereinten Nationen (1945), die Allgemeine Erklärung der Menschenrechte (1948), die Genfer Konventionen (1949), die EU (als Kohle- und Stahlgemeinschaft 1951), die NATO (1949) und der Marshallplan. Jede internationale Institution, auf die wir uns heute verlassen, existiert wegen der Ereignisse von 1939 bis 1945.' }
    ]);

    // ═══════════════════════════════════════════
    // TRUMP WORLD TOUR (10 steps)
    // ═══════════════════════════════════════════
    applyDE('trump', [
        { t: '🏛️ WASHINGTON D.C. — AMERICA FIRST RELOADED', d: 'Im Januar 2025 begann Donald Trump seine zweite Präsidentschaft mit sofortigen Exekutivmaßnahmen. Kernpunkte: Austritt aus dem Pariser Klimaabkommen (erneut), umfassende Zollpakete auf Verbündete und Rivalen gleichermaßen. Die Doktrin signalisiert einen Wandel von der regelbasierten internationalen Ordnung hin zu bilateralen Machtverhandlungen.' },
        { t: '🍁 KANADA — ALLIANZ UNTER DRUCK', d: 'Die US-kanadischen Beziehungen erreichten 2025 einen historischen Tiefpunkt. Trump erhob 25% Zölle auf kanadische Waren, sprach öffentlich vom „51. Bundesstaat" und stellte Kanadas Souveränität über arktische Passagen in Frage. Die diplomatische Reibung offenbarte die Fragilität der „längsten unverteidigten Grenze der Welt".' },
        { t: '❄️ GRÖNLAND — STRATEGISCHE ARKTIS-AMBITION', d: 'Trump erneuerte das US-Interesse am Erwerb Grönlands und verwies auf seinen strategischen Militärwert (Pituffik-Weltraumbasis) und seine riesigen Reserven an seltenen Erden. Dänemark lehnte ab, aber der Vorstoß unterstrich die Arktis als geopolitische Grenze. Grönland besitzt schätzungsweise 25% der weltweit unentdeckten seltenen Erden.' },
        { t: '🚢 PANAMAKANAL — HANDELSROUTEN-SPANNUNGEN', d: 'Trump stellte Panamas Souveränität über den Kanal öffentlich in Frage und kritisierte chinesisch verbundene Hafenoperationen. Der Panamakanal wickelt 5% des globalen Seehandels und 40% des gesamten US-Containerverkehrs ab. Dürrebedingungen reduzierten die täglichen Durchfahrten bereits von 36 auf 24 Schiffe.' },
        { t: '🇨🇺 KUBA — WIRTSCHAFTLICHE DRUCKSTRATEGIE', d: 'Die Trump-Regierung verschärfte das Handelsembargo gegen Kuba. Neue Beschränkungen betrafen Energieimporte, Überweisungen und Reisen. Kubas Stromnetz — bereits bei 50% Kapazität — leidet unter häufigen landesweiten Blackouts. Die Strategie nutzt wirtschaftlichen Hebel, um Regimewechsel ohne direkte militärische Eingriffe zu erzwingen.' },
        { t: '⚡ VENEZUELA — HARTE MACHTPOLITIK', d: '2025 eskalierte die USA die Konfrontation mit der Maduro-Regierung durch erweiterte Sanktionen auf Ölexporte und diplomatische Isolation. Venezuela besitzt die weltgrößten nachgewiesenen Ölreserven (303 Milliarden Barrel). Die USA rahmten ihre Aktionen als Demokratieverteidigung; Kritiker nannten es ressourcengetriebenen Interventionismus — eine Wiederbehauptung der Monroe-Doktrin.' },
        { t: '🇪🇺 BRÜSSEL — TRANSATLANTISCHER BRUCH', d: 'Trump erhob Zölle auf europäischen Stahl, Aluminium und Automobilexporte. Das transatlantische Vertrauen sank auf Tiefststände seit dem Zweiten Weltkrieg. Europäische Staaten beschleunigten Verteidigungsausgaben und begannen, Handelsbeziehungen nach Asien und Afrika zu diversifizieren.' },
        { t: '🇩🇪 DEUTSCHLAND — IM FADENKREUZ & ISOLIERT', d: 'Deutschland wurde zur direkten Zielscheibe US-amerikanischen Drucks, nachdem Bundeskanzler Friedrich Merz Trumps Außenpolitik und Zollstrategie öffentlich kritisiert hatte. Das Weiße Haus reagierte mit zwei Strafmaßnahmen: dem Abzug von mindestens 5.000 US-Soldaten von deutschen Stützpunkten (darunter Ramstein Air Base und U.S. EUCOM in Stuttgart) sowie neuen 25%-Zöllen auf deutsche Automobilexporte — BMW, Mercedes-Benz, Volkswagen und Porsche betroffen. Deutschland exportiert jährlich ca. 30 Mrd. Euro an Fahrzeugen in die USA und ist damit die am stärksten exponierte europäische Volkswirtschaft. Der Truppenabzug schwächt die östliche NATO-Logistikdrehscheibe und signalisiert eine fundamentale Neubewertung der US-Vorwärtspräsenz in Europa. Berlin steht vor einer Doppelkrise: wirtschaftlicher Schaden durch Auto-Zölle und ein Sicherheitsvakuum durch den Rückzug des wichtigsten Militärverbündeten. Das Risiko einer deutschen Isolation innerhalb von NATO und EU wächst — gefangen zwischen US-Feindseligkeit und europäischen Partnern, die entschlossenere Führung fordern.' },
        { t: '🔥 IRAN — ESKALATIONSZONE', d: 'Iran blieb der brisanteste Brennpunkt der US-Außenpolitik. Die Trump-Regierung verfolgte „Maximum Pressure 2.0": erweiterte Sanktionen, Marinepräsenz in der Straße von Hormuz (durch die 20% des globalen Öls fließen). Iran beschleunigte die Urananreicherung auf nahezu waffenfähiges Niveau (60%+). Jede Fehlkalkulation könnte eine globale Energiekrise auslösen.' },
        { t: '🌍 DIE NEUE WELTORDNUNG — URSACHE & WIRKUNG', d: 'Trumps zweite Präsidentschaft beschleunigte eine globale Neuausrichtung. Traditionelle Allianzen (NATO, G7) stehen unter Druck, während alternative Blöcke (BRICS+, SCO) an Dynamik gewinnen. Zölle ersetzten Diplomatie; bilaterale Deals ersetzten multilaterale Rahmenwerke; militärisches Posieren ersetzte Soft Power. Die Nachkriegsordnung von 1945 wird grundlegend neu verhandelt.' }
    ]);

    // ═══════════════════════════════════════════
    // CHOKEPOINTS (8 steps)
    // ═══════════════════════════════════════════
    applyDE('chokepoints', [
        { t: '⛽ STRASSE VON HORMUZ — DAS ÖLTOR', d: 'Durch die Straße von Hormuz fließen täglich 21 Millionen Barrel Öl — 21% des weltweiten Verbrauchs. Die engste Stelle ist nur 33 km breit. Iran kann sie mit einer Raketensperre innerhalb von Minuten schließen. Jede Blockade würde den Ölpreis über Nacht verdoppeln. Die USA unterhalten hier permanent die 5. Flotte.' },
        { t: '🚢 SUEZKANAL — DIE ABKÜRZUNG, DIE ALLES VERÄNDERTE', d: 'Der Suezkanal verbindet Mittelmeer und Rotes Meer und erspart Schiffen 10.000 km Umweg um Afrika. 12% des Welthandels passieren ihn. 2021 blockierte die Ever Given den Kanal 6 Tage lang und verursachte Schäden von 10 Milliarden Dollar pro Tag. Ägypten verdient jährlich 9 Milliarden Dollar an Kanalgebühren.' },
        { t: '⚓ STRASSE VON MALAKKA — ASIENS LEBENSADER', d: 'Die Straße von Malakka zwischen Malaysia und Indonesien ist nur 2,8 km breit an der engsten Stelle. 25% des gesamten Welthandels passieren diese Meerenge — darunter 80% von Chinas Ölimporten. Eine Blockade würde die Weltwirtschaft lähmen.' },
        { t: '🚢 BAB EL-MANDEB — DAS TOR DER TRÄNEN', d: 'Diese 29 km breite Meerenge zwischen Jemen und Dschibuti verbindet Suezkanal und Indischen Ozean. 2024 zwangen Huthi-Angriffe auf Handelsschiffe große Reedereien zur Umleitung um das Kap der Guten Hoffnung — 10 Tage länger, 1 Million Dollar mehr Treibstoff pro Fahrt.' },
        { t: '🌍 STRASSE VON GIBRALTAR — MITTELMEERTOR', d: 'Nur 14 km trennen Europa von Afrika an der Straße von Gibraltar. Alle Schiffe, die ins Mittelmeer oder hinaus wollen, müssen hier durch. Die strategische Lage kontrolliert den Zugang für NATO-Flotten und den gesamten Mittelmeerhandel.' },
        { t: '🇹🇷 TÜRKISCHE MEERENGEN — RUSSLANDS WARMES WASSER', d: 'Bosporus und Dardanellen sind Russlands einziger Zugang vom Schwarzen Meer zum Mittelmeer. Die Türkei kontrolliert diese Passage gemäß der Konvention von Montreux (1936). Russlands Schwarzmeerflotte ist davon abhängig — eine geopolitische Schwachstelle seit Jahrhunderten.' },
        { t: '🚢 PANAMAKANAL — DIE GROSSE ABKÜRZUNG', d: 'Der Panamakanal spart Schiffen 12.000 km Umweg um Südamerika. 14.000 Schiffe passieren jährlich mit 5% des Welthandels. Die 2016 eröffnete Erweiterung verdoppelte die Kapazität, aber Dürre reduzierte 2024 die Durchfahrten dramatisch.' },
        { t: '🗺️ DIE NADELÖHR-KARTE — FRAGIL VON DESIGN', d: 'Sieben schmale Wasserstraßen kontrollieren den Großteil des Welthandels. Eine einzige Blockade kann Lieferketten weltweit lahmlegen. Die Globalisierung hat ein System geschaffen, das effizient ist, aber auf wenigen verwundbaren Punkten basiert. Kriege, Piraterie, Klimawandel und geopolitische Spannungen bedrohen diese Lebensadern ständig.' }
    ]);

    // ═══════════════════════════════════════════
    // BATTERY RACE (7 steps)
    // ═══════════════════════════════════════════
    applyDE('battery', [
        { t: '⛏️ KONGO — DIE KOBALTMINEN', d: 'Die Demokratische Republik Kongo produziert 70% des weltweiten Kobalts — unverzichtbar für Lithium-Ionen-Batterien. Über 40.000 Kinder arbeiten in handwerklichen Minen unter lebensgefährlichen Bedingungen. Die Gewinne fließen zu internationalen Konzernen und chinesischen Verarbeitern.' },
        { t: '⛏️ LITHIUM-DREIECK — DAS WEISSE GOLD', d: 'Argentinien, Bolivien und Chile bilden das Lithium-Dreieck mit 60% der weltweiten Reserven. Lithium ist unverzichtbar für jede Batterie in Elektroautos und Smartphones. Der Abbau verbraucht massive Wassermengen in einer der trockensten Regionen der Erde.' },
        { t: '🇦🇺 AUSTRALIEN — HARTGESTEIN-LITHIUM', d: 'Australien ist der weltgrößte Lithiumproduzent durch Hartgesteinabbau. Die Minen in Westaustralien liefern das Rohmaterial, das in China zu batterietauglichem Lithium verarbeitet wird.' },
        { t: '🇨🇳 CHINA — DAS VERARBEITUNGSMONOPOL', d: 'China kontrolliert 60-80% der weltweiten Batterie-Lieferkette. Es verarbeitet Kobalt, Lithium und seltene Erden und produziert 77% aller Batteriezellen weltweit. Diese Dominanz gibt China enormen geopolitischen Einfluss.' },
        { t: '🔋 TAIWAN — DER CHIP-ENGPASS', d: 'Jedes Elektroauto enthält Tausende Computerchips. TSMC in Taiwan produziert 90% der fortschrittlichsten Chips weltweit. Eine chinesische Invasion Taiwans würde die globale Automobil- und Elektronikindustrie zum Stillstand bringen.' },
        { t: '🏭 GIGAFACTORIES — DAS FLIESSBAND', d: 'Tesla, CATL, BYD und andere bauen riesige Batteriefabriken weltweit. Die USA investieren über 100 Milliarden Dollar durch den Inflation Reduction Act, um Chinas Dominanz zu brechen und eine eigene Lieferkette aufzubauen.' },
        { t: '🗺️ DIE BATTERIE-LIEFERKETTE — KARTIERT', d: 'Vom kongolesischen Kobalt über chilenisches Lithium, chinesische Verarbeitung bis zur Gigafactory: Ihr Smartphone-Akku hat 50.000 km Lieferkette hinter sich. Wer die Batterie-Lieferkette kontrolliert, kontrolliert die industrielle Zukunft.' }
    ]);

    // ═══════════════════════════════════════════
    // CLIMATE FRONTLINES (7 steps)
    // ═══════════════════════════════════════════
    applyDE('climate', [
        { t: '❄️ SVALBARD — DER ARKTISCHE KANARIENVOGEL', d: 'Svalbard erwärmt sich 6-mal schneller als der globale Durchschnitt. Der Permafrost taut und bedroht den Svalbard Global Seed Vault — die Weltnotfall-Saatgutbank. Eisbären verlieren ihr Jagdgebiet, da das Meereis schmilzt. Die Arktis könnte bis 2040 im Sommer eisfrei sein.' },
        { t: '🐠 GREAT BARRIER REEF — MASSENBLEICHE', d: 'Das größte Korallenriff der Welt hat 2024 seine schwerste Massenbleiche erlebt. 73% aller Riffabschnitte waren betroffen. Steigende Meerestemperaturen von nur 1°C über dem Normalwert töten die symbiotischen Algen. Ohne Korallen verlieren 25% aller Meeresspezies ihren Lebensraum.' },
        { t: '🌳 AMAZONAS — DIE LUNGE BRENNT', d: 'Der Amazonas-Regenwald produziert 20% des weltweiten Sauerstoffs. Zwischen 2001 und 2023 gingen 17% der Waldfläche durch Abholzung und Brände verloren. Der Amazonas nähert sich dem Kipppunkt, an dem er sich in eine Savanne verwandeln könnte — mit katastrophalen Folgen für das Weltklima.' },
        { t: '🌊 BANGLADESCH — ERTRINKEN IN ZEITLUPE', d: 'Bangladesch liegt größtenteils weniger als 5 Meter über dem Meeresspiegel. 30 Millionen Menschen sind bis 2050 von Überschwemmungen bedroht. Zyklone werden häufiger und stärker. Jedes Jahr werden 700.000 Menschen durch klimabedingte Katastrophen vertrieben.' },
        { t: '🏝️ TUVALU — DIE NATION, DIE VERSCHWINDET', d: 'Tuvalu im Pazifik hat einen höchsten Punkt von nur 4,6 Metern. Bei aktuellem Meeresspiegelanstieg wird der Inselstaat bis 2100 unbewohnbar. 2023 schloss Tuvalu ein Abkommen mit Australien für „digitale Staatsbürgerschaft" — ein Staat ohne Land.' },
        { t: '🔥 KALIFORNIEN — FEUERSAISON IST GANZJÄHRIG', d: 'Waldbrände in Kalifornien haben sich in den letzten 20 Jahren verfünffacht. 2020 brannten über 1,7 Millionen Hektar — eine Fläche größer als Connecticut. Dürre, Wind und 100 Jahre Brandunterdrückung haben einen perfekten Sturm geschaffen.' },
        { t: '🗺️ KLIMAFRONTEN — DIE KARTE LÜGT NICHT', d: 'Die ärmsten Nationen, die am wenigsten zum Klimawandel beigetragen haben, leiden am stärksten. Die 10 verletzlichsten Länder emittieren zusammen weniger als 1% der globalen CO₂-Emissionen. Die Kosten der Klimaanpassung für Entwicklungsländer werden auf 300 Milliarden Dollar jährlich geschätzt.' }
    ]);

    // ═══════════════════════════════════════════
    // WATER WARS (7 steps)
    // ═══════════════════════════════════════════
    applyDE('water', [
        { t: '🏞️ NIL — DER GROSSE STAUDAMM-STREIT', d: 'Äthiopiens GERD-Staudamm (Grand Ethiopian Renaissance Dam) ist der größte Staudamm Afrikas. Er könnte Ägypten 25% seiner Wasserversorgung kosten — den Nil, von dem 100 Millionen Ägypter abhängen. Ägypten drohte mit militärischer Gewalt. Die Verhandlungen sind seit Jahren festgefahren.' },
        { t: '🇹🇷 TIGRIS-EUPHRAT — DIE TÜRKEI KONTROLLIERT DEN HAHN', d: 'Die Türkei kontrolliert mit 22 Staudämmen die Quellen von Tigris und Euphrat. Der Ilisu-Staudamm hat den Tigris-Zufluss zum Irak um 60% reduziert. Syrien und Irak — bereits destabilisiert — verlieren landwirtschaftliches Wasser. Wasserknappheit war ein Katalysator des syrischen Bürgerkriegs.' },
        { t: '🇮🇳 INDUS — ZWEI ATOMMÄCHTE, EIN FLUSS', d: 'Der Indus-Wasservertrag von 1960 zwischen Indien und Pakistan gilt als eines der stabilsten Wasserabkommen der Welt. Doch steigende Spannungen zwischen den Atommächten und Indiens wachsender Wasserbedarf setzen den Vertrag unter Druck. Der Indus speist 80% von Pakistans Landwirtschaft.' },
        { t: '🏜️ COLORADO RIVER — TROCKNET AUS', d: 'Der Colorado River versorgt 40 Millionen Menschen in 7 US-Bundesstaaten und Mexiko. Seit 2000 ist sein Wasserstand um 20% gefallen. Lake Mead — der größte Stausee der USA — erreichte 2022 seinen niedrigsten Stand seit der Füllung 1937. Wasserrationierung ist bereits Realität.' },
        { t: '💀 ARALSEE — DIE GRÖSSTE UMWELTKATASTROPHE', d: 'Der Aralsee war einst das viertgrößte Binnengewässer der Welt. Sowjetische Bewässerungsprojekte für Baumwolle leiteten seine Zuflüsse um. Bis 2014 war er auf 10% seiner ursprünglichen Größe geschrumpft. Zurück blieben giftige Salzwüsten, Schiffswracks und eine Gesundheitskrise für Millionen.' },
        { t: '🌍 TSCHADSEE — DIE KRISE EINES KONTINENTS', d: 'Der Tschadsee ist seit 1960 um 90% geschrumpft. 30 Millionen Menschen in 4 Ländern (Nigeria, Niger, Tschad, Kamerun) sind auf sein Wasser angewiesen. Die Wasserknappheit treibt Konflikte zwischen Bauern, Fischern und Hirten und befeuert die Boko-Haram-Krise.' },
        { t: '🗺️ WASSERKRIEGE — DIE BEDROHUNG DES 21. JAHRHUNDERTS', d: '2,2 Milliarden Menschen haben keinen Zugang zu sauberem Trinkwasser. Bis 2025 werden 1,8 Milliarden in Regionen mit absolutem Wassermangel leben. Die Weltbank warnt: Wasserknappheit könnte das BIP-Wachstum einiger Regionen bis 2050 um 6% reduzieren.' }
    ]);

    // ═══════════════════════════════════════════
    // FORMULA 1 (9 steps)
    // ═══════════════════════════════════════════
    applyDE('f1', [
        { t: '🏎️ MONACO — DAS JUWEL IN DER KRONE', d: 'Der GP von Monaco ist das prestigeträchtigste Rennen der Welt — durch die Straßen des zweitkleinsten Staats der Erde. Die Strecke ist 3,337 km lang mit 19 Kurven. Durchschnittsgeschwindigkeit: nur 160 km/h, aber jeder Fehler endet in der Leitplanke. Das Rennen wird seit 1929 ausgetragen.' },
        { t: '🏎️ SILVERSTONE — WO ALLES BEGANN', d: 'Silverstone richtete am 13. Mai 1950 das allererste Formel-1-Rennen aus. Giuseppe Farina gewann im Alfa Romeo. Die ehemalige RAF-Landebahn wurde zum Herzstück des britischen Motorsports. Noch heute gilt Silverstone als ultimativer Fahrertest.' },
        { t: '🏎️ MONZA — DER TEMPEL DER GESCHWINDIGKEIT', d: 'Der Autodromo di Monza ist die schnellste Strecke im F1-Kalender — Durchschnittsgeschwindigkeit über 260 km/h. Die Tifosi (Ferrari-Fans) verwandeln jedes Heimrennen in ein Fußballstadion. Monza ist seit 1922 aktiv — eine der ältesten Rennstrecken der Welt.' },
        { t: '🏎️ SPA-FRANCORCHAMPS — DIE FAHRERLIEBLINGSSTRECKE', d: 'Spa in den belgischen Ardennen ist 7,004 km lang — die längste im Kalender. Die berühmte Eau Rouge / Raidillon-Kombination ist die ikonischste Kurve des Motorsports. Das Wetter kann sich in Minuten ändern — Regen auf einer Seite, Sonne auf der anderen.' },
        { t: '🏎️ SUZUKA — PRÄZISIONSTECHNIK', d: 'Suzuka ist die einzige Achterschleife im F1-Kalender. Die 130R-Kurve wird mit über 300 km/h durchfahren. Japan und Honda sind eng mit der F1 verbunden — Ayrton Sennas legendäre Duelle mit Alain Prost in Suzuka definierten eine Ära.' },
        { t: '🏎️ INTERLAGOS — WO LEGENDEN GEBOREN WERDEN', d: 'Interlagos in São Paulo ist die spirituelle Heimat von Ayrton Senna. Die Strecke verläuft gegen den Uhrzeigersinn und ist bekannt für dramatische Schlussrennen. Brasiliens Leidenschaft für den Motorsport macht jeden GP zu einem Nationalereignis.' },
        { t: '🏎️ SINGAPUR — DAS NACHTSPEKTAKEL', d: 'Singapur war 2008 das erste Nachtrennen der F1-Geschichte. Die beleuchtete Strecke durch Marina Bay ist visuell atemberaubend. Das Rennen dauert 2 Stunden bei 30°C und 80% Luftfeuchtigkeit — die physisch anspruchsvollste Herausforderung.' },
        { t: '🏎️ YAS MARINA — DAS SAISONFINALE', d: 'Abu Dhabis Yas Marina Circuit beendet traditionell die F1-Saison. Die Strecke verläuft durch einen Yachthafen und unter einem Hotel hindurch. Das Dämmerungsrennen — Start bei Tag, Ziel bei Nacht — ist eines der spektakulärsten im Kalender.' },
        { t: '🏁 FORMEL 1 — DER GLOBALE ZIRKUS', d: 'Die Formel 1 fährt auf 5 Kontinenten in 24 Ländern. Jedes Auto kostet über 150 Millionen Dollar pro Saison. Motoren drehen bis 15.000 U/min. Jährlich schauen 1,5 Milliarden TV-Zuschauer zu. Die F1 generiert über 3 Milliarden Dollar Jahresumsatz. Von Fangio über Senna bis Hamilton — die F1 produziert die größten Rennlegenden der Geschichte.' }
    ]);

    // ═══════════════════════════════════════════
    // FIFA WORLD CUP (8 steps)
    // ═══════════════════════════════════════════
    applyDE('worldcup', [
        { t: '⚽ BRASILIEN 2014 — FUSSBALL KOMMT NACH HAUSE', d: 'Brasilien gab 15 Milliarden Dollar für die WM aus — Stadien, Infrastruktur, Sicherheit. Deutschland demütigte Brasilien 7:1 im Halbfinale — das schockierendste Ergebnis in der WM-Geschichte. Deutschland gewann den Titel mit 1:0 n.V. gegen Argentinien. 3,4 Milliarden TV-Zuschauer.' },
        { t: '⚽ RUSSLAND 2018 — OST TRIFFT WEST', d: 'Russland richtete die teuerste WM der Geschichte aus (14 Milliarden Dollar). Frankreich gewann den Titel mit 4:2 gegen Kroatien. Russland überraschte als Gastgeber und erreichte das Viertelfinale. Die VAR-Technologie (Video Assistant Referee) wurde erstmals bei einer WM eingesetzt.' },
        { t: '⚽ KATAR 2022 — DAS WÜSTENFINALE', d: 'Die erste Winter-WM wegen der extremen Hitze. Kosten: geschätzt 220 Milliarden Dollar — die teuerste Sportveranstaltung der Geschichte. Argentinien und Messi gewannen das vielleicht beste Finale aller Zeiten (3:3, 4:2 n.E.) gegen Frankreich. 5 Milliarden TV-Zuschauer — das meistgesehene Sportereignis der Geschichte.' },
        { t: '⚽ 2026 — VEREINTE BEWERBUNG (USA, KANADA, MEXIKO)', d: 'Die erste WM mit 48 Teams (statt 32). 104 Spiele in 16 Städten über 3 Länder verteilt. Das MetLife Stadium in New York wird voraussichtlich das Finale ausrichten. Das erweiterte Format wird den Wettbewerb für kleinere Nationen öffnen.' },
        { t: '⚽ 2034 — SAUDI-ARABIEN', d: 'Saudi-Arabien wird die WM 2034 ausrichten. Das Land plant den Bau neuer Stadien als Teil der Vision 2030. Kontroversen um Menschenrechte und Arbeitsbedingungen begleiten die Vergabe — ähnlich wie bei Katar 2022.' },
        { t: '⚽ DEUTSCHLAND 2006 — DAS SOMMERMÄRCHEN', d: 'Die WM 2006 verwandelte Deutschlands Image. Public Viewing wurde zum Massenphänomen. Italien gewann das Finale gegen Frankreich (Zidanes Kopfstoß gegen Materazzi). Deutschland wurde Dritter. Die WM gilt als Wendepunkt für Deutschlands internationales Ansehen.' },
        { t: '⚽ SÜDAFRIKA 2010 — AFRIKAS MOMENT', d: 'Die erste WM in Afrika. Vuvuzelas wurden zum Symbol des Turniers. Spanien gewann seinen ersten WM-Titel mit dem Tiki-Taka-Stil (1:0 gegen die Niederlande n.V.). Südafrika investierte 5 Milliarden Dollar in Infrastruktur. Die WM stärkte Afrikas Stellung im Weltfußball.' },
        { t: '🏆 DIE WM — FUSSBALL-UNIVERSUM', d: 'Die FIFA WM wird seit 1930 alle 4 Jahre ausgetragen. 211 FIFA-Mitgliedsverbände nehmen teil — mehr als die UN-Mitglieder. Brasilien hat 5 Titel (Rekord), Deutschland und Italien je 4. Das WM-Finale ist das meistgesehene TV-Ereignis der Welt mit über 1 Milliarde Zuschauern für ein einzelnes Spiel.' }
    ]);

    // ═══════════════════════════════════════════
    // ROMAN EMPIRE (8 steps)
    // ═══════════════════════════════════════════
    applyDE('romanempire', [
        { t: '🏛️ DAS RÖMISCHE REICH — AUF SEINEM HÖHEPUNKT', d: 'Auf dem Höhepunkt unter Kaiser Trajan 117 n. Chr. erstreckte sich das Römische Reich von Britannien bis Mesopotamien und kontrollierte das gesamte Mittelmeer — „Mare Nostrum" (Unser Meer). Fläche: 5 Millionen km². Bevölkerung: 55–70 Millionen (25% der Menschheit). Dauer: 753 v. Chr. (Gründung Roms) bis 476 n. Chr. (Fall des Westens) = 1.229 Jahre. Epochen: Königszeit (753–509 v. Chr.), Republik (509–27 v. Chr.), Kaiserreich (27 v. Chr.–476 n. Chr.). Das Oströmische Reich (Byzanz) überlebte bis 1453 — fast 2.200 Jahre ununterbrochene römische Zivilisation.' },
        { t: '🏛️ ROM — CAPUT MUNDI', d: 'Rom war über 500 Jahre die Hauptstadt der bekannten Welt. Auf seinem Höhepunkt (~200 n. Chr.) hatte die Stadt 1 Million Einwohner — eine Größe, die keine europäische Stadt bis zum London des 19. Jahrhunderts erreichte. Das Kolosseum (72–80 n. Chr.) fasste 50.000–80.000 Zuschauer. Rom hatte fließendes Wasser über 11 Aquädukte mit 1 Million Kubikmeter pro Tag, öffentliche Toiletten, beheizte Bäder und 6-stöckige Mietshäuser (Insulae). 80.000 km gepflasterte Straßen verbanden das Reich.' },
        { t: '⚔️ DER LIMES — ROMS GRENZE IN GERMANIEN', d: 'Der Limes Germanicus war eine 568 km lange Grenzbefestigung vom Rhein zur Donau — Roms längste Landgrenze. Er umfasste 900 Wachtürme und 60 Kastelle, besetzt mit 30.000+ Soldaten. Dahinter lebten die „Barbaren" — germanische Stämme, die Rom nie unterwerfen konnte. Die Varusschlacht im Teutoburger Wald (9 n. Chr.) vernichtete 3 Legionen (~20.000 Mann). Kaiser Augustus soll gerufen haben: „Varus, gib mir meine Legionen zurück!" Rom eroberte nie Germanien östlich des Rheins.' },
        { t: '🏺 ÄGYPTEN — ROMS KORNKAMMER', d: 'Ägypten war Roms wertvollste Provinz. Sein Getreide ernährte 1 Million Römer — jede Unterbrechung konnte Revolution auslösen. Nach der Niederlage von Kleopatra VII. und Marcus Antonius bei Actium (31 v. Chr.) machte Octavian (Augustus) Ägypten zu seinem Privateigentum. Alexandria mit 500.000 Einwohnern beherbergte die berühmte Bibliothek und den Leuchtturm (eines der Sieben Weltwunder). Ägypten versorgte Rom 400 Jahre lang.' },
        { t: '🌋 POMPEJI — EINGEFROREN IN DER ZEIT', d: 'Am 24. August 79 n. Chr. brach der Vesuv aus und begrub Pompeji unter 4–6 Metern Asche in nur 18 Stunden. Die Stadt mit 11.000 Einwohnern wurde perfekt konserviert — Häuser, Läden, Graffiti, Essen und die Körper der Opfer in ihren letzten Momenten erstarrt. 1748 wiederentdeckt, ist Pompeji die vollständigste Momentaufnahme des römischen Alltags: Bäckereien, Wahlplakate, Schnellimbisse (Thermopolia) und sogar antike Verkehrsstaus.' },
        { t: '⭐ KONSTANTINOPEL — DAS ZWEITE ROM', d: '330 n. Chr. verlegte Kaiser Konstantin die Hauptstadt von Rom nach Byzantion und benannte es in Konstantinopel um. Es wurde für 1.000 Jahre die reichste Stadt der Welt. Die Theodosianischen Mauern (erbaut 413 n. Chr.) waren die ausgeklügeltsten Befestigungen der Antike — sie hielten 1.000 Jahre jeder Belagerung stand bis zur osmanischen Eroberung 1453. Konstantinopel kontrollierte den Handel zwischen Mittelmeer und Seidenstraße.' },
        { t: '🛡️ BRITANNIEN — AM RAND DER WELT', d: 'Rom eroberte Britannien 43 n. Chr. unter Kaiser Claudius und hielt es 367 Jahre. Der Hadrianswall (erbaut 122 n. Chr.) erstreckte sich 117 km quer durch Nordengland — 15.000 Mann brauchten 6 Jahre für den Bau. Römisches Britannien hatte Fußbodenheizung (Hypokaustum), Badehäuser und Städte wie Londinium (London, 60.000 Einwohner). Rom zog 410 n. Chr. seine Legionen ab — innerhalb einer Generation brachen Schriftkultur, Münzwesen und Stadtleben zusammen.' },
        { t: '🌍 UNTERGANG & VERMÄCHTNIS — WARUM ROM NOCH ZÄHLT', d: 'Das Weströmische Reich fiel am 4. September 476 n. Chr., als der germanische Heerführer Odoaker den letzten Kaiser Romulus Augustulus absetzte. Ursachen: Überdehnung, militärische Überlastung, Wirtschaftskollaps und Barbarendruck. Doch Roms Vermächtnis ist überall: Latein wurde zu Französisch, Spanisch, Italienisch, Portugiesisch und Rumänisch. Römisches Recht ist die Grundlage jedes europäischen Rechtssystems. Kalender, Beton, Bögen, Aquädukte, Straßen und das Konzept der Staatsbürgerschaft — alles römisch.' }
    ]);

};
// Auto-apply after DOM is ready (in case main.js has already set _TOURS_REF)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(window._applyToursDE, 100));
} else {
    setTimeout(window._applyToursDE, 100);
}
