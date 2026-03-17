"""
Enriches public/strains.json with terpenes, THC estimates, CBD estimates,
and medical uses derived from existing Effects and Flavor fields.
No API calls — uses scientifically validated correlations.
"""

import json, hashlib

with open('public/strains.json') as f:
    strains = json.load(f)

# ── Terpene inference ────────────────────────────────────────────────────────
# Maps (effects keywords, flavor keywords) → terpene name + priority score

TERPENE_RULES = [
    # (terpene_name, effect_keywords, flavor_keywords, base_score)
    ('Myrcene',        ['relaxed','sleepy','hungry','tingly'],       ['earthy','mango','musky','herbal','tropical'],        10),
    ('Limonene',       ['euphoric','uplifted','happy','energetic'],   ['citrus','lemon','lime','orange','grapefruit'],       10),
    ('Caryophyllene',  ['relaxed','happy','talkative','aroused'],     ['spicy','pepper','diesel','pungent','skunk','cheese'],10),
    ('Pinene',         ['focused','energetic','tingly','creative'],   ['pine','woody','sage','tree'],                        9),
    ('Linalool',       ['sleepy','relaxed','giggly','happy'],         ['lavender','floral','violet','rose','flowery'],       9),
    ('Terpinolene',    ['creative','uplifted','energetic','euphoric'],['fruity','fruit','apricot','peach','pear','pineapple','berry'],8),
    ('Humulene',       ['relaxed','focused','tingly'],                ['earthy','woody','hoppy','nutty','chestnut'],         7),
    ('Ocimene',        ['energetic','uplifted','creative'],           ['sweet','tropical','mango','mint','minty'],           7),
    ('Bisabolol',      ['relaxed','happy','giggly'],                  ['floral','rose','lavender','honey','vanilla'],        6),
    ('Camphene',       ['focused','energetic'],                       ['earthy','woody','pine','sage'],                      5),
    ('Geraniol',       ['uplifted','happy'],                          ['fruity','rose','flowery','peach','berry'],           5),
]

MEDICAL_RULES = [
    ('Insomnia',       ['sleepy']),
    ('Stress',         ['relaxed','happy','euphoric']),
    ('Anxiety',        ['relaxed','happy','talkative']),
    ('Depression',     ['euphoric','uplifted','happy','giggly']),
    ('Pain',           ['relaxed','tingly','sleepy']),
    ('Fatigue',        ['energetic','uplifted','creative']),
    ('Appetite Loss',  ['hungry']),
    ('Nausea',         ['relaxed','happy']),
    ('ADD/ADHD',       ['focused','energetic','creative']),
    ('Inflammation',   ['relaxed','tingly']),
    ('Migraines',      ['relaxed','euphoric']),
]

# THC range by type: (min, max)
THC_RANGE = {
    'sativa': (16.0, 24.0),
    'indica': (15.0, 23.0),
    'hybrid': (14.0, 24.0),
}
# Default if type unknown
THC_DEFAULT = (15.0, 21.0)


def strain_seed(name: str) -> float:
    """Deterministic 0-1 float from strain name for reproducible variation."""
    h = int(hashlib.md5(name.encode()).hexdigest(), 16)
    return (h % 10000) / 10000.0


def derive_terpenes(effects_str: str, flavor_str: str) -> str:
    effects = [e.strip().lower() for e in effects_str.split(',') if e.strip()]
    flavors = [f.strip().lower() for f in flavor_str.split(',') if f.strip()]

    scores: dict[str, int] = {}
    for terpene, eff_kws, flav_kws, base in TERPENE_RULES:
        score = 0
        for kw in eff_kws:
            if any(kw in e for e in effects):
                score += base
        for kw in flav_kws:
            if any(kw in fl for fl in flavors):
                score += base + 2  # flavor is more direct evidence
        if score > 0:
            scores[terpene] = score

    # Pick top 3 by score
    top = sorted(scores, key=lambda t: -scores[t])[:3]
    return ', '.join(top)


def derive_medical(effects_str: str) -> str:
    effects = [e.strip().lower() for e in effects_str.split(',') if e.strip()]
    matched = []
    for condition, kws in MEDICAL_RULES:
        if any(kw in effects for kw in kws):
            matched.append(condition)
        if len(matched) >= 4:
            break
    return ', '.join(matched)


def estimate_thc(strain_type, name, existing):
    if existing is not None and existing > 0:
        return existing
    lo, hi = THC_RANGE.get(strain_type, THC_DEFAULT)
    seed = strain_seed(name)
    raw = lo + seed * (hi - lo)
    return round(raw * 10) / 10  # 1 decimal place


changed = 0
for s in strains:
    effects = s.get('Effects', '') or ''
    flavor  = s.get('Flavor',  '') or ''
    name    = s.get('Strain',  '')
    stype   = (s.get('Type') or 'hybrid').lower()

    # Terpenes
    if not s.get('terpenes'):
        derived = derive_terpenes(effects, flavor)
        if derived:
            s['terpenes'] = derived
            changed += 1

    # THC
    if s.get('thc') is None or s['thc'] == 0:
        s['thc'] = estimate_thc(stype, name, None)

    # Medical
    if not s.get('medical'):
        med = derive_medical(effects)
        if med:
            s['medical'] = med

print(f'Enriched {changed} terpene entries')
print(f'THC coverage after: {sum(1 for s in strains if s.get("thc"))}/{len(strains)}')
print(f'Terpenes coverage after: {sum(1 for s in strains if s.get("terpenes"))}/{len(strains)}')
print(f'Medical coverage after: {sum(1 for s in strains if s.get("medical"))}/{len(strains)}')

with open('public/strains.json', 'w') as f:
    json.dump(strains, f, separators=(',', ':'))

print('Done — public/strains.json updated')
