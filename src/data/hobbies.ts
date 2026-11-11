// Single source for /hobbies/. Photos live in public/assets/img/hobbies/ as
// <name>.jpg (1800 px, opened in the lightbox) and <name>-sm.jpg (800 px, grid).
// To add a trip: convert the photos into that folder, then add an entry here.
// Strip metadata when converting; holiday photos carry GPS.

export interface Photo {
    name: string;
    alt: { en: string; de: string };
    // Pixel size of the large version, so the grid can reserve space
    width: number;
    height: number;
}

export interface Trip {
    id: string;
    title: { en: string; de: string };
    when: string;
    sailing?: boolean;
    summary?: { en: string; de: string };
    // YouTube video id; the thumbnail is stored locally as video-<id>.jpg
    video?: { id: string; title: string };
    photos: Photo[];
}

const p = (name: string, width: number, height: number, en: string, de: string): Photo => ({ name, width, height, alt: { en, de } });

// Full-width photo at the top of the page
export const cover: Photo = p('norway-sailboat', 1800, 1013, 'A sailing yacht under sail in the evening light off the Norwegian coast', 'Eine Segelyacht im Abendlicht vor der norwegischen Küste');

export const trips: Trip[] = [
    {
        id: 'norway-2026',
        title: { en: 'Northern Norway: Tromsø to Bodø', de: 'Nordnorwegen: Tromsø nach Bodø' },
        when: '2026',
        sailing: true,
        summary: {
            en: 'Sailing south along the coast from Tromsø through the Lofoten to Bodø.',
            de: 'Unter Segeln von Tromsø an der Küste entlang durch die Lofoten nach Bodø.',
        },
        video: { id: 'z9yd1lA-ObM', title: 'Sailing Norway 2026: Tromsø to Bodø // Lofoten' },
        photos: [
            p('norway-bow', 1350, 1800, 'Jonas on the bow of the boat in a narrow fjord', 'Jonas auf dem Vorschiff in einem engen Fjord'),
            p('norway-aurora', 1800, 1350, 'Northern lights over calm water', 'Polarlichter über ruhigem Wasser'),
            p('norway-eagle', 1800, 1200, 'A sea eagle against a grey sky', 'Ein Seeadler vor grauem Himmel'),
        ],
    },
    {
        id: 'iceland-2025',
        title: { en: 'Iceland', de: 'Island' },
        when: '2025',
        sailing: true,
        summary: {
            en: 'Sailing along the west coast and into the Westfjords, with the Reykjanes eruption at the start of the trip.',
            de: 'Segeln an der Westküste und in die Westfjorde, mit dem Ausbruch auf Reykjanes zu Beginn der Reise.',
        },
        video: { id: 'wpxHDoHppdk', title: 'ICELAND Pt 2 Sailing' },
        photos: [
            p('iceland-anchorage', 1800, 1350, 'A sailing yacht at anchor below dark sea cliffs', 'Eine Segelyacht vor Anker unter dunklen Klippen'),
            p('iceland-eruption', 1800, 1350, 'The glow of a volcanic eruption under a dark sky', 'Das Leuchten eines Vulkanausbruchs unter dunklem Himmel'),
            p('iceland-dynjandi', 1800, 1350, 'The Dynjandi waterfall from above', 'Der Wasserfall Dynjandi von oben'),
            p('iceland-fjord-sunset', 1800, 1350, 'Sunset over a fjord with a yacht at anchor', 'Sonnenuntergang über einem Fjord mit einer ankernden Yacht'),
            p('iceland-arctic-fox', 1800, 1200, 'An arctic fox looking into the camera', 'Ein Polarfuchs, der in die Kamera schaut'),
            p('iceland-whale', 1800, 1200, 'The tail of a humpback whale above the water', 'Die Fluke eines Buckelwals über dem Wasser'),
            p('iceland-icebergs', 1800, 1200, 'Small icebergs on a black beach', 'Kleine Eisberge an einem schwarzen Strand'),
        ],
    },
    {
        id: 'madeira-2025',
        title: { en: 'Madeira', de: 'Madeira' },
        when: '2025',
        summary: {
            en: 'Hiking above the clouds and along the cliffs in the east.',
            de: 'Wandern über den Wolken und an den Klippen im Osten.',
        },
        video: { id: 'FWhbxsJTRmI', title: 'Madeira 2025' },
        photos: [
            p('madeira-above-clouds', 1800, 1350, 'Sunrise above a sea of clouds', 'Sonnenaufgang über einem Wolkenmeer'),
            p('madeira-cliffs', 1800, 1350, 'Red volcanic cliffs above the sea', 'Rote Vulkanklippen über dem Meer'),
        ],
    },
    {
        id: 'baltic-2024',
        title: { en: 'Baltic Sea: Kiel, Anholt, Aarhus', de: 'Ostsee: Kiel, Anholt, Aarhus' },
        when: '2024',
        sailing: true,
        summary: {
            en: 'A trip on the Iuventa from Kiel to Anholt and Aarhus, and the sailing closer to home.',
            de: 'Ein Törn auf der Iuventa von Kiel nach Anholt und Aarhus, und das Segeln vor der eigenen Haustür.',
        },
        video: { id: 'ZFU9ESBA3JM', title: 'Iuventa Törn 2024 - Kiel // Anholt // Aarhus' },
        photos: [
            p('baltic-fehmarnsund', 1800, 1350, 'Under sail towards the Fehmarnsund bridge', 'Unter Segeln auf die Fehmarnsundbrücke zu'),
            p('baltic-wind-farm', 1800, 1200, 'An offshore wind farm seen from the water', 'Ein Offshore-Windpark vom Wasser aus'),
        ],
    },
    {
        id: 'new-zealand-2024',
        title: { en: 'New Zealand and Australia', de: 'Neuseeland und Australien' },
        when: '2024',
        summary: {
            en: 'Kayaking, rafting and the fjords of the South Island, then Tasmania, the Great Ocean Road and Sydney.',
            de: 'Kajak, Rafting und die Fjorde der Südinsel, danach Tasmanien, die Great Ocean Road und Sydney.',
        },
        video: { id: '2BgKcG8OXrs', title: 'New Zealand 2024' },
        photos: [
            p('nz-milford-sound', 1800, 1350, 'Steep mountains and sun rays over Milford Sound', 'Steile Berge und Sonnenstrahlen über dem Milford Sound'),
            p('nz-kayak', 1800, 1575, 'Sea kayaking in turquoise water', 'Seekajak in türkisem Wasser'),
            p('nz-waterfall', 1200, 1800, 'A waterfall in mist and rainforest', 'Ein Wasserfall in Gischt und Regenwald'),
            p('nz-rafting', 1800, 1203, 'A raft in white water', 'Ein Raft im Wildwasser'),
            p('au-tasmanian-devils', 1800, 1200, 'Two Tasmanian devils in the grass', 'Zwei Tasmanische Teufel im Gras'),
            p('au-twelve-apostles', 1200, 1800, 'The Twelve Apostles on the Great Ocean Road', 'Die Zwölf Apostel an der Great Ocean Road'),
            p('au-sydney', 1800, 1350, 'Sydney Opera House and skyline at night', 'Sydney Opera House und Skyline bei Nacht'),
        ],
    },
    {
        id: 'in-between',
        title: { en: 'Surfing, cycling and skiing', de: 'Surfen, Radfahren und Skifahren' },
        when: '2025–2026',
        summary: {
            en: 'Closer to home: surfing and cycling on the Danish west coast, and skiing in Tyrol.',
            de: 'Näher an zu Hause: Surfen und Radfahren an der dänischen Westküste und Skifahren in Tirol.',
        },
        video: { id: 'rzQw9Yb2DyQ', title: 'DK25 Surfing' },
        photos: [
            p('dk-bike', 1350, 1800, 'A gravel bike against a bunker on a Danish beach', 'Ein Gravelbike an einem Bunker am dänischen Strand'),
            p('alps-skiing', 1350, 1800, 'Jonas on skis in front of snowy mountains', 'Jonas auf Skiern vor verschneiten Bergen'),
            p('horse', 1800, 1200, 'Close-up of a horse\'s eye', 'Nahaufnahme eines Pferdeauges'),
        ],
    },
];
