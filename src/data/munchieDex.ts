export type MunchieEntry = {
  terpene: string
  color: string
  aroma: string[]
  pairings: { food: string; reason: string }[]
}

const munchieDex: MunchieEntry[] = [
  {
    terpene: 'Myrcene',
    color: '#84cc16',
    aroma: ['Earthy', 'Musky', 'Mango'],
    pairings: [
      { food: 'Mango & chilli',    reason: 'Mango is naturally high in myrcene — it enhances terpene absorption and the sweet-heat contrast is ideal.' },
      { food: 'Dark chocolate',    reason: 'Earthy bitterness mirrors myrcene\'s musky depth. Magnesium in chocolate may also ease muscle tension.' },
      { food: 'Lemongrass broth',  reason: 'Lemongrass shares myrcene compounds — the pairing creates a warm, herbaceous synergy.' },
    ],
  },
  {
    terpene: 'Limonene',
    color: '#f59e0b',
    aroma: ['Citrus', 'Lemon', 'Orange'],
    pairings: [
      { food: 'Lemon sorbet',      reason: 'Mirrors the bright citrus profile exactly. Cold temperature also cleanses the palate between hits.' },
      { food: 'Ginger lemonade',   reason: 'Ginger\'s spice complements Limonene\'s uplifting energy. Both are associated with anti-nausea properties.' },
      { food: 'Yuzu shortbread',   reason: 'Yuzu is the Japanese citrus with the highest terpene complexity — an elevated match for premium limonene strains.' },
    ],
  },
  {
    terpene: 'Caryophyllene',
    color: '#f97316',
    aroma: ['Spicy', 'Peppery', 'Woody'],
    pairings: [
      { food: 'Black pepper crackers', reason: 'Black pepper is the richest dietary source of caryophyllene. If you\'re overwhelmed, chewing it may calm anxiety.' },
      { food: 'Chilli dark chocolate', reason: 'Capsaicin and caryophyllene both engage pain-relief pathways — the combination is potent and warming.' },
      { food: 'Clove-spiced chai',     reason: 'Cloves are extremely high in caryophyllene. A warming, anti-inflammatory pairing for indica sessions.' },
    ],
  },
  {
    terpene: 'Linalool',
    color: '#a78bfa',
    aroma: ['Floral', 'Lavender', 'Honey'],
    pairings: [
      { food: 'Lavender honey toast', reason: 'Lavender is the richest food source of linalool. Honey softens the floral intensity into something comforting.' },
      { food: 'Chamomile & oat cookies', reason: 'Chamomile shares calming GABA-receptor activity with linalool — a deeply sedating evening combination.' },
      { food: 'Rosewater rice pudding', reason: 'Light, floral, and warming. The vanilla-rose combination pairs with linalool\'s gentle floral high.' },
    ],
  },
  {
    terpene: 'Pinene',
    color: '#84cc16',
    aroma: ['Pine', 'Fresh', 'Rosemary'],
    pairings: [
      { food: 'Rosemary focaccia',  reason: 'Rosemary is high in pinene. Baking amplifies the aromatic compounds — a crisp, herbaceous pairing.' },
      { food: 'Pine nut pesto',     reason: 'Pine nuts bring literal pinene into the dish. Olive oil extends the terpene release on the palate.' },
      { food: 'Dill cucumber bites', reason: 'Dill is one of the highest pinene-containing herbs. Light and refreshing — ideal for sativa sessions.' },
    ],
  },
  {
    terpene: 'Humulene',
    color: '#f97316',
    aroma: ['Hoppy', 'Earthy', 'Woody'],
    pairings: [
      { food: 'Craft IPA beer',     reason: 'Hops and cannabis are botanical cousins sharing humulene. IPAs are the most direct flavour mirror possible.' },
      { food: 'Aged cheddar',       reason: 'The funky, earthy notes in aged cheese echo humulene\'s woody depth. A savoury grounding snack.' },
      { food: 'Ginger rice crackers', reason: 'Ginger shares humulene. Light enough not to disrupt the session, grounding enough to feel satisfying.' },
    ],
  },
]

export default munchieDex
