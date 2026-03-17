import { useState } from 'react'

const FONT     = "'PokemonGb', 'Press Start 2P', monospace"
const GBC_GREEN  = '#84cc16'
const GBC_TEXT   = '#c8e890'
const GBC_MUTED  = '#4a7a10'
const GBC_DARKEST = '#2a4a08'
const GBC_BG     = '#050a04'
const GBC_BOX    = '#0a1408'
const GBC_AMBER  = '#f59e0b'
const GBC_VIOLET = '#a78bfa'

type Difficulty = 'EASY' | 'MEDIUM' | 'ADVANCED'
type Recipe = {
  id: number
  name: string
  category: string
  difficulty: Difficulty
  time: string
  avbAmount: string
  ingredients: string[]
  method: string[]
  tip: string
}

const DIFF_COLOR: Record<Difficulty, string> = {
  EASY:     GBC_GREEN,
  MEDIUM:   GBC_AMBER,
  ADVANCED: GBC_VIOLET,
}

const RECIPES: Recipe[] = [
  {
    id: 1,
    name: 'FIRECRACKERS',
    category: 'BAKED',
    difficulty: 'EASY',
    time: '30 MIN',
    avbAmount: '0.5–1G PER CRACKER',
    ingredients: ['Graham crackers or digestive biscuits', 'Peanut butter or Nutella (full-fat)', 'ABV', 'Foil'],
    method: [
      'Preheat oven to 150°C.',
      'Spread a thick layer of peanut butter or Nutella on one cracker.',
      'Press ABV into the spread evenly.',
      'Sandwich with a second cracker. Wrap tightly in foil.',
      'Bake for 22 minutes. Cool before eating.',
    ],
    tip: 'Full-fat spread is essential — fat binds cannabinoids. Do not exceed 160°C or you degrade THC.',
  },
  {
    id: 2,
    name: 'AVB CANNABUTTER',
    category: 'BASE',
    difficulty: 'MEDIUM',
    time: '3 HRS',
    avbAmount: '7–10G PER 250G BUTTER',
    ingredients: ['250g unsalted butter', '7–10g ABV', '500ml water', 'Cheesecloth or fine strainer'],
    method: [
      'Combine butter, water and ABV in a saucepan.',
      'Simmer on lowest heat for 2–3 hours, stirring occasionally. Never boil.',
      'Strain through cheesecloth into a container, pressing to extract all liquid.',
      'Refrigerate. The butter solidifies on top. Discard the water layer below.',
      'Use in any recipe that calls for butter.',
    ],
    tip: 'Water prevents the butter from burning and removes some chlorophyll, improving taste.',
  },
  {
    id: 3,
    name: 'AVB CANNA-OIL',
    category: 'BASE',
    difficulty: 'MEDIUM',
    time: '2–3 HRS',
    avbAmount: '7–10G PER 250ML OIL',
    ingredients: ['250ml coconut oil (or olive oil)', '7–10g ABV', 'Cheesecloth'],
    method: [
      'Combine oil and ABV in a small saucepan or slow cooker.',
      'Heat on lowest setting (around 80°C) for 2–3 hours. Stir every 30 minutes.',
      'Do not allow to smoke or boil.',
      'Strain through cheesecloth. Store in a sealed jar in the fridge.',
    ],
    tip: 'Coconut oil has a high fat content and absorbs cannabinoids efficiently. Use in anything from stir-fries to capsules.',
  },
  {
    id: 4,
    name: 'AVB BROWNIES',
    category: 'BAKED',
    difficulty: 'MEDIUM',
    time: '45 MIN',
    avbAmount: 'CANNABUTTER QUANTITY',
    ingredients: ['200g dark chocolate', '100g AVB cannabutter', '180g caster sugar', '2 eggs', '80g plain flour', '30g cocoa powder', 'Pinch of salt'],
    method: [
      'Preheat oven to 175°C. Line a 20cm square tin.',
      'Melt chocolate and cannabutter together over a bain-marie.',
      'Whisk in sugar, then eggs one at a time.',
      'Fold in flour, cocoa and salt. Do not overmix.',
      'Pour into tin and bake 20–25 minutes. Centre should be slightly underdone.',
      'Cool completely before cutting — they firm up as they cool.',
    ],
    tip: 'Label clearly. Potency depends on your cannabutter strength. Start with a small square and wait 90 minutes.',
  },
  {
    id: 5,
    name: 'AVB CHOCOLATE CHIP COOKIES',
    category: 'BAKED',
    difficulty: 'MEDIUM',
    time: '35 MIN',
    avbAmount: 'CANNABUTTER QUANTITY',
    ingredients: ['115g AVB cannabutter (softened)', '100g caster sugar', '100g brown sugar', '1 egg', '1 tsp vanilla extract', '220g plain flour', '1 tsp bicarbonate of soda', '150g chocolate chips'],
    method: [
      'Preheat oven to 175°C.',
      'Cream cannabutter and sugars until fluffy.',
      'Beat in egg and vanilla.',
      'Fold in flour and bicarb, then chocolate chips.',
      'Roll into balls, place on a lined tray with space between each.',
      'Bake 10–12 minutes. Cool on the tray — they harden as they cool.',
    ],
    tip: 'Cookies freeze well. Pre-score each one so potency per piece is consistent.',
  },
  {
    id: 6,
    name: 'AVB HOT CHOCOLATE',
    category: 'DRINK',
    difficulty: 'EASY',
    time: '10 MIN',
    avbAmount: '0.5–1G PER CUP',
    ingredients: ['250ml whole milk', '0.5–1g finely ground ABV', '2 tsp cocoa powder', '1 tsp sugar or honey', 'Pinch of cinnamon (optional)'],
    method: [
      'Warm milk in a saucepan over low heat — do not boil.',
      'Whisk in cocoa, sugar and ABV.',
      'Simmer gently for 5 minutes, whisking constantly.',
      'Strain through a fine sieve if desired.',
      'Drink slowly.',
    ],
    tip: 'Full-fat milk extracts cannabinoids well. Adding a small amount of butter or cream increases bioavailability further.',
  },
  {
    id: 7,
    name: 'AVB CAPSULES',
    category: 'CAPSULE',
    difficulty: 'EASY',
    time: '15 MIN',
    avbAmount: '0.3–0.5G PER CAPSULE',
    ingredients: ['Finely ground ABV', 'Empty gelatin or vegetarian capsules (size 00)', 'Small funnel or capsule filling tool', 'Optional: coconut oil to bind'],
    method: [
      'Grind ABV as fine as possible.',
      'Optional: mix with a small amount of melted coconut oil for better absorption.',
      'Fill each capsule using a funnel or capsule machine.',
      'Close capsule and store in a sealed container in the fridge.',
      'Take with a fatty meal for best absorption.',
    ],
    tip: 'Capsules are the most discreet and dose-controlled method. Label the container with potency estimate.',
  },
  {
    id: 8,
    name: 'AVB HONEY',
    category: 'SPREAD',
    difficulty: 'EASY',
    time: '2 HRS',
    avbAmount: '3–5G PER 200G HONEY',
    ingredients: ['200g raw honey', '3–5g finely ground ABV', 'Heatproof jar', 'Saucepan with water'],
    method: [
      'Place honey and ABV in a heatproof jar.',
      'Set the jar in a saucepan of warm water (not boiling — around 70°C).',
      'Stir every 20 minutes for 2 hours.',
      'Strain through cheesecloth if a smooth texture is desired, or leave ABV in.',
      'Store at room temperature in a sealed jar.',
    ],
    tip: 'Lovely in herbal tea or drizzled over yoghurt. The fat content in honey is low so absorption can be slower — take with a fatty snack.',
  },
  {
    id: 9,
    name: 'AVB PEANUT BUTTER',
    category: 'SPREAD',
    difficulty: 'EASY',
    time: '5 MIN',
    avbAmount: '1–2G PER 100G PEANUT BUTTER',
    ingredients: ['100g smooth peanut butter (full-fat)', '1–2g finely ground ABV'],
    method: [
      'Grind ABV as fine as possible.',
      'Mix thoroughly into peanut butter until evenly distributed.',
      'Store in a sealed container in the fridge.',
      'Use on toast, crackers, or as a base for firecrackers.',
    ],
    tip: 'No heat needed — ABV is already decarboxylated. Stir well before each use to keep the ABV evenly distributed.',
  },
  {
    id: 10,
    name: 'AVB BANANA BREAD',
    category: 'BAKED',
    difficulty: 'MEDIUM',
    time: '1 HR 15 MIN',
    avbAmount: 'CANNABUTTER QUANTITY',
    ingredients: ['3 ripe bananas', '75g AVB cannabutter', '150g caster sugar', '1 egg', '190g plain flour', '1 tsp baking powder', '0.5 tsp bicarbonate of soda', 'Pinch of salt', 'Optional: chocolate chips or walnuts'],
    method: [
      'Preheat oven to 175°C. Grease a loaf tin.',
      'Mash bananas until smooth. Beat in cannabutter and sugar.',
      'Add egg and mix.',
      'Fold in flour, baking powder, bicarb and salt.',
      'Pour into tin. Bake 55–65 minutes until a skewer comes out clean.',
      'Cool for 10 minutes before slicing.',
    ],
    tip: 'Very easy to dose by the slice if you count slices carefully. The strong banana flavour masks the ABV taste well.',
  },
  {
    id: 11,
    name: 'AVB OAT ENERGY BALLS',
    category: 'NO BAKE',
    difficulty: 'EASY',
    time: '20 MIN',
    avbAmount: '0.5G PER BALL (APPROX)',
    ingredients: ['200g rolled oats', '120g peanut butter or almond butter', '80g honey', '50g dark chocolate chips', '2–4g finely ground ABV', 'Optional: desiccated coconut to coat'],
    method: [
      'Mix all ingredients together in a bowl until well combined.',
      'Refrigerate the mixture for 15 minutes until firm enough to roll.',
      'Roll into balls roughly 3cm in diameter.',
      'Optional: roll in desiccated coconut.',
      'Store in the fridge in a sealed container for up to a week.',
    ],
    tip: 'Make a consistent batch size and weigh ingredients to keep dosing predictable. Each ball should contain roughly the same amount.',
  },
  {
    id: 12,
    name: 'AVB RICE CRISPY TREATS',
    category: 'NO BAKE',
    difficulty: 'EASY',
    time: '20 MIN',
    avbAmount: 'CANNABUTTER QUANTITY',
    ingredients: ['60g AVB cannabutter', '300g marshmallows', '180g puffed rice cereal', 'Optional: vanilla extract'],
    method: [
      'Melt cannabutter in a large saucepan over low heat.',
      'Add marshmallows and stir until fully melted.',
      'Remove from heat. Stir in puffed rice until coated.',
      'Press firmly into a greased tin. Cool completely.',
      'Cut into equal squares to control dosing.',
    ],
    tip: 'One of the easiest infused treats to make in bulk. Potency per square depends entirely on how many squares you cut.',
  },
  {
    id: 13,
    name: 'AVB GUMMIES',
    category: 'CONFECTIONERY',
    difficulty: 'ADVANCED',
    time: '2 HRS + SETTING',
    avbAmount: 'CANNA-OIL QUANTITY',
    ingredients: ['120ml fruit juice', '2 tbsp AVB canna-oil (coconut)', '14g unflavoured gelatin', '2 tbsp honey or sugar', 'Silicone gummy moulds'],
    method: [
      'Warm fruit juice in a saucepan over low heat.',
      'Whisk in gelatin slowly to avoid lumps.',
      'Stir in canna-oil and honey until fully combined.',
      'Pour into silicone moulds using a dropper or spoon.',
      'Refrigerate for 1–2 hours until fully set.',
      'Store in the fridge. Do not leave at room temperature as they will melt.',
    ],
    tip: 'Emulsifying agents like sunflower lecithin help bind the oil into the mixture evenly. Add 1 tsp if available.',
  },
  {
    id: 14,
    name: 'AVB TRAIL MIX',
    category: 'SNACK',
    difficulty: 'EASY',
    time: '5 MIN',
    avbAmount: '1–2G PER SERVING',
    ingredients: ['Mixed nuts and seeds', 'Raisins or dried cranberries', 'Dark chocolate chips', 'Finely ground ABV', 'Optional: pinch of sea salt'],
    method: [
      'Grind ABV as fine as possible.',
      'Mix all ingredients together thoroughly.',
      'Divide into equal-sized portions (a kitchen scale helps).',
      'Store in a sealed bag or container.',
    ],
    tip: 'ABV is already decarboxylated so no cooking required. The nuts provide fat for absorption. Best taken with a glass of full-fat milk.',
  },
  {
    id: 15,
    name: 'AVB PASTA SAUCE',
    category: 'SAVOURY',
    difficulty: 'MEDIUM',
    time: '30 MIN',
    avbAmount: 'CANNA-OIL QUANTITY',
    ingredients: ['2 tbsp AVB-infused olive oil', '400g tinned tomatoes', '3 cloves garlic', '1 onion', 'Fresh basil', 'Salt and pepper', 'Pasta to serve'],
    method: [
      'Gently fry diced onion and garlic in AVB-infused olive oil for 5 minutes.',
      'Add tinned tomatoes and simmer for 20 minutes.',
      'Season with salt, pepper and fresh basil.',
      'Serve over pasta.',
    ],
    tip: 'Do not boil the infused oil at high heat — keep cooking temperature moderate. The fat in the sauce ensures good cannabinoid absorption.',
  },
  {
    id: 16,
    name: 'AVB GUACAMOLE',
    category: 'SAVOURY',
    difficulty: 'EASY',
    time: '10 MIN',
    avbAmount: '1–2G FINELY GROUND',
    ingredients: ['2 ripe avocados', '1 lime (juice)', '1 clove garlic (crushed)', 'Salt, chilli flakes', '1–2g finely ground ABV'],
    method: [
      'Mash avocados with a fork to your preferred texture.',
      'Mix in lime juice, garlic, salt and chilli.',
      'Stir in finely ground ABV until evenly distributed.',
      'Serve immediately with corn chips or crudités.',
    ],
    tip: 'Avocado is naturally high in fat, making it excellent for cannabinoid absorption without any cooking required.',
  },
  {
    id: 17,
    name: 'AVB COCONUT MACAROONS',
    category: 'BAKED',
    difficulty: 'MEDIUM',
    time: '35 MIN',
    avbAmount: '1–2G TOTAL FOR BATCH',
    ingredients: ['200g desiccated coconut', '200g condensed milk', '1–2g finely ground ABV', '1 tsp vanilla extract', 'Optional: dip in dark chocolate'],
    method: [
      'Preheat oven to 160°C.',
      'Mix coconut, condensed milk, ABV and vanilla together.',
      'Scoop into small mounds on a lined baking tray.',
      'Bake 15–18 minutes until lightly golden.',
      'Cool completely before handling.',
      'Optional: dip bases in melted dark chocolate once cooled.',
    ],
    tip: 'Condensed milk and coconut both contain fat. The low baking temperature preserves cannabinoids well.',
  },
  {
    id: 18,
    name: 'AVB FLAPJACKS',
    category: 'BAKED',
    difficulty: 'EASY',
    time: '40 MIN',
    avbAmount: 'CANNABUTTER QUANTITY',
    ingredients: ['100g AVB cannabutter', '80g golden syrup', '60g soft brown sugar', '250g rolled oats', 'Pinch of salt', 'Optional: dried fruit or chocolate chips'],
    method: [
      'Preheat oven to 160°C. Grease a 20cm square tin.',
      'Melt cannabutter, syrup and sugar together in a saucepan over low heat.',
      'Remove from heat. Stir in oats, salt and any extras.',
      'Press firmly into tin.',
      'Bake 20–25 minutes until golden at the edges.',
      'Score into bars while still warm. Cool fully before removing from tin.',
    ],
    tip: 'A British classic. Chewy flapjacks hold together better for portioning than crispy ones — slightly underbake them.',
  },
  {
    id: 19,
    name: 'AVB SMOOTHIE',
    category: 'DRINK',
    difficulty: 'EASY',
    time: '5 MIN',
    avbAmount: '0.5–1G FINELY GROUND',
    ingredients: ['250ml whole milk or oat milk', '1 banana', '2 tbsp peanut butter or almond butter', '0.5–1g finely ground ABV', 'Optional: cocoa powder, honey, ice'],
    method: [
      'Add all ingredients to a blender.',
      'Blend until smooth.',
      'Drink immediately.',
    ],
    tip: 'The fat in the nut butter and milk aids absorption. Drink slowly over 20 minutes rather than all at once. ABV taste is well-masked by peanut butter and banana.',
  },
  {
    id: 20,
    name: 'AVB SHORTBREAD',
    category: 'BAKED',
    difficulty: 'MEDIUM',
    time: '50 MIN',
    avbAmount: 'CANNABUTTER QUANTITY',
    ingredients: ['150g AVB cannabutter (cold)', '75g caster sugar', '225g plain flour', 'Pinch of salt'],
    method: [
      'Preheat oven to 150°C.',
      'Mix flour, sugar and salt.',
      'Rub in cold cannabutter until the mixture resembles breadcrumbs, then press together into a dough.',
      'Roll to 1cm thickness. Cut into fingers or rounds.',
      'Place on a lined tray. Bake 25–30 minutes until very pale golden.',
      'Dust with caster sugar while warm. Cool completely before eating.',
    ],
    tip: 'Shortbread is butter-heavy by design — ideal for cannabutter. The low baking temperature is gentle on THC. Store in an airtight tin.',
  },
]

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [open, setOpen] = useState(false)
  const col = DIFF_COLOR[recipe.difficulty]

  return (
    <div style={{
      border: `3px solid ${col}`,
      boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #1a3008',
      background: GBC_BOX,
    }}>
      {/* Header row — always visible */}
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: '12px', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontFamily: FONT, fontSize: 9, color: col, flex: 1, lineHeight: 1.5 }}>
            {recipe.name}
          </span>
          <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_MUTED }}>{open ? '▲' : '▼'}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: FONT, fontSize: 7, color: col, border: `1px solid ${col}`, padding: '1px 4px' }}>
            {recipe.difficulty}
          </span>
          <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, border: `1px solid ${GBC_DARKEST}`, padding: '1px 4px' }}>
            {recipe.category}
          </span>
          <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, border: `1px solid ${GBC_DARKEST}`, padding: '1px 4px' }}>
            {recipe.time}
          </span>
          <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED }}>
            ABV: {recipe.avbAmount}
          </span>
        </div>
      </div>

      {/* Expanded body */}
      {open && (
        <div style={{ padding: '0 12px 14px', display: 'flex', flexDirection: 'column', gap: 12, borderTop: `1px solid ${GBC_DARKEST}` }}>

          {/* Ingredients */}
          <div style={{ paddingTop: 10 }}>
            <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_MUTED, display: 'block', marginBottom: 6 }}>
              INGREDIENTS
            </span>
            {recipe.ingredients.map((ing, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_DARKEST, flexShrink: 0 }}>■</span>
                <span style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, lineHeight: 1.6 }}>{ing}</span>
              </div>
            ))}
          </div>

          {/* Method */}
          <div>
            <span style={{ fontFamily: FONT, fontSize: 8, color: GBC_MUTED, display: 'block', marginBottom: 6 }}>
              METHOD
            </span>
            {recipe.method.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: FONT, fontSize: 8, color: col, flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, lineHeight: 1.7 }}>{step}</span>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div style={{
            border: `2px solid ${GBC_DARKEST}`,
            background: '#060e05', padding: '10px',
          }}>
            <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_MUTED, display: 'block', marginBottom: 4 }}>
              PROF T-OAK TIP
            </span>
            <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, lineHeight: 1.7, margin: 0 }}>
              {recipe.tip}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AvbEdibles() {
  return (
    <div style={{
      minHeight: '100%', background: GBC_BG, padding: '10px',
      boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12,
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `2px solid ${GBC_DARKEST}`, paddingBottom: 8,
      }}>
        <span style={{ fontFamily: FONT, fontSize: 11, color: GBC_GREEN }}>AVB EDIBLES</span>
        <span style={{
          fontFamily: FONT, fontSize: 7, color: GBC_MUTED,
          border: `1px solid ${GBC_DARKEST}`, padding: '2px 5px',
        }}>
          {RECIPES.length} RECIPES
        </span>
      </div>

      {/* Explainer */}
      <div style={{
        border: `3px solid ${GBC_DARKEST}`,
        boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #1a3008',
        background: GBC_BOX, padding: '12px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_GREEN }}>WHAT IS AVB?</span>
        <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, lineHeight: 1.7, margin: 0 }}>
          Already Vaped Bud (AVB) is the brown material left after vaporising cannabis. It has been decarboxylated by heat — meaning THC is already active. No further decarboxylation is needed. Simply bind it with fat and consume.
        </p>
      </div>

      {/* Key rules */}
      <div style={{
        border: `3px solid ${GBC_DARKEST}`,
        boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #1a3008',
        background: GBC_BOX, padding: '12px',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <span style={{ fontFamily: FONT, fontSize: 9, color: GBC_MUTED, marginBottom: 4, display: 'block' }}>
          GOLDEN RULES
        </span>
        {[
          ['FAT IS ESSENTIAL', 'Cannabinoids are fat-soluble. Always combine AVB with butter, oil, nut butter or full-fat dairy.'],
          ['START LOW', 'AVB potency varies. Start with half a dose and wait 90 minutes before deciding to take more.'],
          ['ONSET IS SLOW', 'Edibles take 45–120 minutes to take effect. Do not redose because you feel nothing at 45 min.'],
          ['TEMPERATURE', 'When cooking, keep heat below 175°C to preserve THC. Vaporisation point is 157°C.'],
        ].map(([rule, desc], i) => (
          <div key={i} style={{ display: 'flex', gap: 8, paddingBottom: 8, borderBottom: i < 3 ? `1px solid ${GBC_DARKEST}` : 'none' }}>
            <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_GREEN, flexShrink: 0, paddingTop: 2 }}>►</span>
            <div>
              <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_GREEN, display: 'block', marginBottom: 3 }}>{rule}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, lineHeight: 1.6 }}>{desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recipes */}
      {RECIPES.map((r) => <RecipeCard key={r.id} recipe={r} />)}

      <div style={{ textAlign: 'center', paddingBottom: 8 }}>
        <span style={{ fontFamily: FONT, fontSize: 7, color: GBC_DARKEST }}>
          TRAINER SCHOOL · AVB RESEARCH
        </span>
      </div>

    </div>
  )
}
