import type {
  Genre,
  Mood,
  MusicalKey,
  Order,
  OrderItem,
  Producer,
  Profile,
  Review,
  ServiceRequest,
  Track,
  TrackFile,
  User,
} from "@/types/domain";

export const users: User[] = [
  { id: "usr_buyer_01", email: "buyer@demo.com", role: "buyer" },
  { id: "usr_producer_01", email: "producer@demo.com", role: "producer" },
  { id: "usr_admin_01", email: "admin@demo.com", role: "admin" },
];

export const profiles: Profile[] = [
  {
    id: "prf_001",
    userId: "usr_producer_01",
    displayName: "Arden Vale",
    bio: "Ghost producer for melodic and cinematic club records.",
    country: "Netherlands",
  },
  {
    id: "prf_002",
    userId: "usr_buyer_01",
    displayName: "Lena K",
    bio: "Touring DJ and label A&R.",
    country: "Germany",
  },
  {
    id: "prf_003",
    userId: "usr_admin_01",
    displayName: "Ops Control",
    bio: "Platform operations and quality review.",
    country: "United Kingdom",
  },
  {
    id: "prf_004",
    userId: "usr_producer_02",
    displayName: "Noah Vane",
    bio: "Afro and deep house specialist with festival placements.",
    country: "Spain",
  },
  {
    id: "prf_005",
    userId: "usr_producer_03",
    displayName: "Mira S",
    bio: "Tech house grooves built for peak-time dance floors.",
    country: "Italy",
  },
  {
    id: "prf_006",
    userId: "usr_producer_04",
    displayName: "Kai Ord",
    bio: "Progressive and emotional melodic producer.",
    country: "Sweden",
  },
];

export const producers: Producer[] = [
  {
    id: "pro_001",
    profileId: "prf_001",
    artistName: "Arden Vale",
    genres: ["Melodic Techno", "Progressive House"],
    rating: 4.9,
    totalSales: 87,
    responseTime: "< 6h",
  },
  {
    id: "pro_002",
    profileId: "prf_004",
    artistName: "Noah Vane",
    genres: ["Afro House", "Deep House"],
    rating: 4.8,
    totalSales: 112,
    responseTime: "< 12h",
  },
  {
    id: "pro_003",
    profileId: "prf_005",
    artistName: "Mira S",
    genres: ["Tech House", "Garage"],
    rating: 4.7,
    totalSales: 64,
    responseTime: "< 8h",
  },
  {
    id: "pro_004",
    profileId: "prf_006",
    artistName: "Kai Ord",
    genres: ["Progressive House", "Melodic Techno"],
    rating: 4.9,
    totalSales: 53,
    responseTime: "< 10h",
  },
];

const cc0PreviewFiles = [
  "/previews/1.mp3",
  "/previews/2.mp3",
  "/previews/3.mp3",
  "/previews/4.mp3",
  "/previews/5.mp3",
  "/previews/6.mp3",
  "/previews/7.mp3",
];

function track(
  id: number,
  title: string,
  producerId: string,
  genre: Genre,
  bpm: number,
  musicalKey: MusicalKey,
  mood: Mood,
  price: number,
  durationSeconds: number,
  tags: string[],
  popularity: number,
  createdAt: string,
  options?: Partial<
    Pick<
      Track,
      | "hasStems"
      | "hasMidi"
      | "hasMaster"
      | "hasUnmastered"
      | "hasExtendedMix"
      | "hasRadioEdit"
      | "exclusivityStatus"
    >
  >,
): Track {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return {
    id: `trk_${id.toString().padStart(3, "0")}`,
    title,
    slug,
    producerId,
    genre,
    bpm,
    musicalKey,
    mood,
    description:
      "A release-ready ghost production with premium mixdown, arrangement details, and full ownership transfer after purchase.",
    price,
    artworkUrl: `/artworks/${id}.jpg`,
    previewUrl: cc0PreviewFiles[(id - 1) % cc0PreviewFiles.length],
    hasStems: options?.hasStems ?? true,
    hasMidi: options?.hasMidi ?? true,
    hasMaster: options?.hasMaster ?? true,
    hasUnmastered: options?.hasUnmastered ?? true,
    hasExtendedMix: options?.hasExtendedMix ?? true,
    hasRadioEdit: options?.hasRadioEdit ?? true,
    exclusivityStatus: options?.exclusivityStatus ?? "available",
    durationSeconds,
    tags,
    popularity,
    createdAt,
  };
}

export const tracks: Track[] = [
  track(
    1,
    "Velvet Horizon",
    "pro_001",
    "Melodic Techno",
    124,
    "F# minor",
    "Emotional",
    1290,
    386,
    ["Festival", "Cinematic", "Peak-time"],
    94,
    "2026-02-28T10:00:00Z",
  ),
  track(
    2,
    "Golden Circuit",
    "pro_003",
    "Tech House",
    127,
    "A minor",
    "Groovy",
    980,
    342,
    ["Club", "Rolling", "Vocal chops"],
    82,
    "2026-02-20T10:00:00Z",
  ),
  track(
    3,
    "Echoes of Tide",
    "pro_002",
    "Afro House",
    122,
    "D minor",
    "Atmospheric",
    1180,
    401,
    ["Organic percussion", "Sunset", "Vocal texture"],
    91,
    "2026-03-05T10:00:00Z",
  ),
  track(
    4,
    "Monochrome Pulse",
    "pro_001",
    "Progressive House",
    126,
    "C# minor",
    "Hypnotic",
    1420,
    416,
    ["Big room", "Synth lead", "Drive"],
    97,
    "2026-02-15T10:00:00Z",
  ),
  track(
    5,
    "Night Ferry",
    "pro_002",
    "Deep House",
    120,
    "E minor",
    "Dark",
    890,
    355,
    ["Deep bass", "Late night", "Warm keys"],
    76,
    "2026-01-28T10:00:00Z",
    { hasMidi: false },
  ),
  track(
    6,
    "Nova Tension",
    "pro_004",
    "Melodic Techno",
    125,
    "B minor",
    "Euphoric",
    1350,
    392,
    ["Anthem", "Build-up", "Lead arps"],
    88,
    "2026-03-02T10:00:00Z",
  ),
  track(
    7,
    "Neon Atlas",
    "pro_003",
    "Garage",
    133,
    "G minor",
    "Groovy",
    760,
    299,
    ["UK swing", "Vocal edits", "Underground"],
    71,
    "2026-02-08T10:00:00Z",
    { hasUnmastered: false, hasExtendedMix: false },
  ),
  track(
    8,
    "Aurora Station",
    "pro_004",
    "Progressive House",
    123,
    "A major",
    "Cinematic",
    1490,
    430,
    ["Epic intro", "Emotional", "Story arc"],
    98,
    "2026-03-06T10:00:00Z",
  ),
  track(
    9,
    "Iridescent Drift",
    "pro_002",
    "Afro House",
    121,
    "C minor",
    "Atmospheric",
    1120,
    368,
    ["Percussive", "Organic", "Dreamy"],
    84,
    "2026-02-26T10:00:00Z",
  ),
  track(
    10,
    "Subtle Riot",
    "pro_003",
    "Tech House",
    128,
    "D# minor",
    "Hypnotic",
    1010,
    334,
    ["Bass groove", "Warehouse", "Dry drums"],
    79,
    "2026-01-18T10:00:00Z",
  ),
  track(
    11,
    "Silver Lumen",
    "pro_001",
    "Melodic Techno",
    124,
    "F minor",
    "Emotional",
    1390,
    408,
    ["Warm pads", "Arp line", "Festival outro"],
    90,
    "2026-03-01T10:00:00Z",
  ),
  track(
    12,
    "Tidal Orbit",
    "pro_004",
    "Progressive House",
    122,
    "G major",
    "Euphoric",
    1320,
    396,
    ["Wide synths", "Vocal hooks", "Sunrise set"],
    86,
    "2026-02-22T10:00:00Z",
    { exclusivityStatus: "sold" },
  ),
  track(
    13,
    "Afterglow District",
    "pro_002",
    "Deep House",
    119,
    "A minor",
    "Atmospheric",
    840,
    347,
    ["Lo-fi textures", "Late set", "Elegant groove"],
    69,
    "2026-01-10T10:00:00Z",
  ),
  track(
    14,
    "Gravity Veil",
    "pro_001",
    "Melodic Techno",
    126,
    "B minor",
    "Dark",
    1450,
    415,
    ["Industrial edge", "Tension", "Driving low end"],
    93,
    "2026-03-08T10:00:00Z",
  ),
];

export const trackFiles: TrackFile[] = tracks.flatMap((item) => [
  { id: `${item.id}_wav`, trackId: item.id, fileType: "WAV", included: true },
  { id: `${item.id}_stems`, trackId: item.id, fileType: "Stems", included: item.hasStems },
  { id: `${item.id}_midi`, trackId: item.id, fileType: "MIDI", included: item.hasMidi },
  { id: `${item.id}_master`, trackId: item.id, fileType: "Master", included: item.hasMaster },
  {
    id: `${item.id}_unmastered`,
    trackId: item.id,
    fileType: "Unmastered",
    included: item.hasUnmastered,
  },
  {
    id: `${item.id}_extended`,
    trackId: item.id,
    fileType: "Extended Mix",
    included: item.hasExtendedMix,
  },
  {
    id: `${item.id}_radio`,
    trackId: item.id,
    fileType: "Radio Edit",
    included: item.hasRadioEdit,
  },
]);

export const orders: Order[] = [
  { id: "ord_001", buyerId: "usr_buyer_01", total: 1320, status: "paid", createdAt: "2026-02-12T10:00:00Z" },
  { id: "ord_002", buyerId: "usr_buyer_01", total: 980, status: "paid", createdAt: "2026-02-25T10:00:00Z" },
  { id: "ord_003", buyerId: "usr_buyer_01", total: 890, status: "processing", createdAt: "2026-03-03T10:00:00Z" },
];

export const orderItems: OrderItem[] = [
  { id: "itm_001", orderId: "ord_001", trackId: "trk_012", price: 1320 },
  { id: "itm_002", orderId: "ord_002", trackId: "trk_002", price: 980 },
  { id: "itm_003", orderId: "ord_003", trackId: "trk_005", price: 890 },
];

export const serviceRequests: ServiceRequest[] = [
  {
    id: "srv_001",
    buyerId: "usr_buyer_01",
    service: "Custom Ghost Production",
    genre: "Melodic Techno",
    budgetRange: "$1,500 - $2,500",
    status: "in_review",
    notes: "Need a cinematic festival intro and emotional breakdown.",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "srv_002",
    buyerId: "usr_buyer_01",
    service: "Mixing",
    genre: "Tech House",
    budgetRange: "$300 - $600",
    status: "submitted",
    notes: "Club-focused low-end, vocal cleanup, and final limiter chain.",
    createdAt: "2026-03-06T10:00:00Z",
  },
];

export const reviews: Review[] = [
  {
    id: "rev_001",
    profileId: "prf_002",
    producerId: "pro_001",
    rating: 5,
    text: "Track quality is label-ready and delivery was immediate after checkout.",
  },
  {
    id: "rev_002",
    profileId: "prf_002",
    producerId: "pro_002",
    rating: 5,
    text: "Excellent stems and arrangement notes. Easy handoff for release prep.",
  },
  {
    id: "rev_003",
    profileId: "prf_002",
    producerId: "pro_003",
    rating: 4,
    text: "Clean groove and very responsive communication for revisions.",
  },
];

export const serviceCatalog = [
  {
    name: "Custom Ghost Production",
    description: "Fully bespoke track crafted around your artist profile and release target.",
    startingAt: "$1,500",
  },
  {
    name: "Remix",
    description: "Club-ready remix with arrangement, sound design, and final master.",
    startingAt: "$900",
  },
  {
    name: "Mixing",
    description: "Detailed balance, tone shaping, dynamics, and festival translation checks.",
    startingAt: "$280",
  },
  {
    name: "Mastering",
    description: "Transparent loudness optimization for streaming and club systems.",
    startingAt: "$120",
  },
  {
    name: "Track Finishing",
    description: "Convert your idea demo into a final arrangement and release master.",
    startingAt: "$500",
  },
  {
    name: "Melody Writing",
    description: "Topline and hook design aligned to your brand direction.",
    startingAt: "$250",
  },
] as const;

export const genres: Genre[] = [
  "Afro House",
  "Melodic Techno",
  "Tech House",
  "Deep House",
  "Progressive House",
  "Drum & Bass",
  "Garage",
];

export const moods: Mood[] = [
  "Euphoric",
  "Dark",
  "Hypnotic",
  "Atmospheric",
  "Groovy",
  "Cinematic",
  "Emotional",
];

export const musicalKeys: MusicalKey[] = [
  "A minor",
  "B minor",
  "C minor",
  "D minor",
  "E minor",
  "F minor",
  "G minor",
  "F# minor",
  "C# minor",
  "D# minor",
  "A major",
  "G major",
];

export const testimonials = [
  {
    name: "Rafael M",
    role: "Touring DJ",
    quote: "The first purchase paid for itself in one weekend. Quality is consistently premium.",
  },
  {
    name: "Nadia V",
    role: "Label Manager",
    quote: "The rights transfer process is clear and professional. Perfect for release pipelines.",
  },
  {
    name: "Joel T",
    role: "Artist",
    quote: "Custom production flow is simple, and communication feels like working with a real studio.",
  },
];

export const benefitBullets = [
  "Exclusive one-time sale",
  "Full rights transfer",
  "Stems included",
  "Instant delivery",
];

export const categoryPills = [
  "Festival Melodic",
  "Afro House",
  "Peak-Time Tech House",
  "Progressive Journeys",
  "Underground Grooves",
];
