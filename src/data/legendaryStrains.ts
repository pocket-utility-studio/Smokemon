export type LegendaryStrain = {
  id: number
  name: string
  type: 'Indica' | 'Sativa' | 'Hybrid'
  era: string
  lore: string
}

const legendaryStrains: LegendaryStrain[] = [
  { id: 1,  name: 'Afghan Kush',     type: 'Indica',  era: 'The Ancestors',  lore: 'The rugged, heavy resin producer from the Hindu Kush mountains. The father of modern indicas.' },
  { id: 2,  name: 'Hindu Kush',      type: 'Indica',  era: 'The Ancestors',  lore: 'Pure, unadulterated relaxation. It brought the earthy, hash-like aromas of the high mountains to the West.' },
  { id: 3,  name: 'Acapulco Gold',   type: 'Sativa',  era: 'The Ancestors',  lore: 'A legendary Mexican sativa that changed the standard for potency in the 1960s. Golden calyxes, euphoric buzz.' },
  { id: 4,  name: 'Colombian Gold',  type: 'Sativa',  era: 'The Ancestors',  lore: 'The classic giggly, energetic landrace that formed the backbone of Skunk lines.' },
  { id: 5,  name: 'Panama Red',      type: 'Sativa',  era: 'The Ancestors',  lore: 'A pure 1960s sativa known for its deep red pistils and psychedelic, mind-expanding energy.' },
  { id: 6,  name: 'Durban Poison',   type: 'Sativa',  era: 'The Ancestors',  lore: "South Africa's crown jewel. Pure sativa, tasting of sweet black licorice, delivering espresso-like focus." },
  { id: 7,  name: "Lamb's Bread",    type: 'Sativa',  era: 'The Ancestors',  lore: "Rumoured to be Bob Marley's favourite. A bright, uplifting Jamaican sativa with spiritual associations." },
  { id: 8,  name: 'Kilimanjaro',     type: 'Sativa',  era: 'The Ancestors',  lore: 'Cultivated on the slopes of Tanzania, traditionally used by native hunters for its hyper-focus effects.' },
  { id: 9,  name: 'Malawi Gold',     type: 'Sativa',  era: 'The Ancestors',  lore: 'Famous for its incredibly long flowering time and euphoric, mind-racing effects.' },
  { id: 10, name: 'Thai Stick',      type: 'Sativa',  era: 'The Ancestors',  lore: 'The citrusy, potent Southeast Asian sativa that introduced tied-curing methods to the world.' },
  { id: 11, name: 'Skunk #1',        type: 'Hybrid',  era: 'The Foundation', lore: 'The most important hybrid ever made. Crossed Colombian Gold, Acapulco Gold and Afghan. The blueprint for modern cannabis genetics.' },
  { id: 12, name: 'Northern Lights', type: 'Indica',  era: 'The Foundation', lore: 'An incredibly resilient, heavy-hitting Afghan cross that dominated the 80s indoor growing scene. Still a benchmark indica.' },
  { id: 13, name: 'Haze',            type: 'Sativa',  era: 'The Foundation', lore: 'A complex, multi-landrace sativa cross that takes forever to grow but delivers an unmatched soaring cerebral high.' },
  { id: 14, name: 'G13',             type: 'Indica',  era: 'The Foundation', lore: 'The subject of a famous myth claiming it was engineered by the US government at a Mississippi research facility.' },
  { id: 15, name: 'White Widow',     type: 'Hybrid',  era: 'The Foundation', lore: 'A Dutch coffee shop legend from the 90s, famous for being so heavily coated in trichomes it looks white.' },
  { id: 16, name: 'Chemdawg',        type: 'Hybrid',  era: 'The Foundation', lore: 'Grown from a bagseed found at a Grateful Dead concert in 1991. The incredibly pungent parent of Diesel and Kush lines.' },
  { id: 17, name: 'OG Kush',         type: 'Hybrid',  era: 'The Foundation', lore: 'Thought to be a Chemdawg cross. The definitive West Coast strain — earthy, piney, fuel — that spawned an entire lineage.' },
  { id: 18, name: 'Jack Herer',      type: 'Sativa',  era: 'The Foundation', lore: 'Named after the cannabis activist. A complex Haze cross with a spicy, piney aroma and an energising, clear-headed high.' },
  { id: 19, name: 'AK-47',           type: 'Hybrid',  era: 'The Foundation', lore: 'Despite the aggressive name, AK-47 delivers a mellow, long-lasting cerebral buzz. A Serious Seeds classic from 1992.' },
  { id: 20, name: 'Super Silver Haze', type: 'Sativa', era: 'The Foundation', lore: 'Three-time High Times Cannabis Cup winner in the late 90s. The gold standard of Dutch sativa hybrids.' },
  { id: 21, name: 'Blue Dream',      type: 'Hybrid',  era: 'The Modern Era', lore: 'The bestselling strain in legal US markets for years. A gentle, versatile Blueberry x Haze hybrid with mass appeal.' },
  { id: 22, name: 'Girl Scout Cookies', type: 'Hybrid', era: 'The Modern Era', lore: 'GSC — originally from the Bay Area — took over the industry with its sweet earthy flavour and powerful euphoric effects.' },
  { id: 23, name: 'Gelato',          type: 'Hybrid',  era: 'The Modern Era', lore: 'A Cookies x Sunset Sherbet cross that became the cornerstone of the dessert strain era. Creamy, potent, visually stunning.' },
  { id: 24, name: 'Runtz',           type: 'Hybrid',  era: 'The Modern Era', lore: 'Strain of the Year 2020. Zkittlez x Gelato — fruity candy flavour, dense rainbow-coloured buds, high potency.' },
]

export default legendaryStrains
