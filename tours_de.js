// GEOPULSE — German Tour Translations
// Injects title_de / text_de into existing TOURS steps after main.js loads
(function() {
    if (!window._TOURS_REF) return;
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
    // COLD WAR
    // ═══════════════════════════════════════════
    applyDE('coldwar', [
        { t: '🧱 BERLIN — DIE GETEILTE STADT', d: 'Am 13. August 1961 begann die DDR mit dem Bau der Berliner Mauer — dem Symbol des Kalten Krieges. 28 Jahre lang teilte sie Familien, Freunde und eine Nation. Mindestens 140 Menschen starben beim Fluchtversuch. Am 9. November 1989 fiel die Mauer in einer friedlichen Revolution.' },
        { t: '🧱 MOSKAU — HERZ DES SOWJETREICHS', d: 'Moskau war das Zentrum des Sowjetimperiums, das von 1922 bis 1991 bestand. Der Kreml kontrollierte 15 Republiken, den Warschauer Pakt und ein nukleares Arsenal von 40.000 Sprengköpfen. Der Zusammenbruch der UdSSR 1991 beendete den Kalten Krieg.' }
    ]);

    // ═══════════════════════════════════════════
    // WORLD WAR I (partial)
    // ═══════════════════════════════════════════
    applyDE('ww1', [
        { t: '🪖 SARAJEVO — DER FUNKE', d: 'Am 28. Juni 1914 erschoss Gavrilo Princip den österreichisch-ungarischen Thronfolger Erzherzog Franz Ferdinand in Sarajevo. Dieses Attentat löste eine Kettenreaktion von Bündnisverpflichtungen aus, die innerhalb von 5 Wochen ganz Europa in den Krieg stürzte. Vier Großreiche sollten untergehen.' }
    ]);

    // ═══════════════════════════════════════════
    // WORLD WAR II (partial)
    // ═══════════════════════════════════════════
    applyDE('ww2', [
        { t: '⚔️ GDAŃSK — DER BEGINN', d: 'Am 1. September 1939 eröffnete das deutsche Schlachtschiff Schleswig-Holstein das Feuer auf die polnische Garnison auf der Westerplatte in Danzig. Dies markierte den Beginn des Zweiten Weltkriegs — des tödlichsten Konflikts der Menschheitsgeschichte mit 70–85 Millionen Toten.' }
    ]);

})();
