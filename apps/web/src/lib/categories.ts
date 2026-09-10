export const CATEGORIES = {
  psychology: "Mind & Behavior",
  engineering: "Engineering",
  howthings: "How Things Work",
  arthistory: "Art History",
  history: "World History",
  culinary: "Culinary Arts",
  electrical: "Electrical Engineering",
  homemaintenance: "Home Maintenance",
  automaintenance: "Auto Maintenance",
  physics: "Physics",
  astronomy: "Astronomy",
  mythology: "World Mythology",
  howto: "Practical How-Tos & Crafts",
  nature: "Nature & Animal Behavior",
  language: "Language & Writing",
  music: "Music & Sound",
  chemistry: "Materials & Everyday Chemistry",
  gardening: "Plants & Gardening",
  geology: "Geology & Earth Science",
  outdoors: "Navigation & Outdoor Skills",
  textiles: "Textiles & Clothing",
  architecture: "Architecture & Buildings",
  archaeology: "Archaeology & Ancient Technology",
  games: "Games & Strategy",
  culture: "Customs & Everyday Culture",
  sewing: "Sewing & Textile Crafts",
  finance: "Finance & Money",
  politics: "Politics & Government",
  computing: "Computers & the Internet",
  mathematics: "Mathematics & Patterns",
  logic: "Logic & Reasoning",
  philosophy: "Philosophy & Ethics",
  religion: "Religion & Belief",
  humanbody: "The Human Body",
  medicine: "Public Health & Medicine",
  law: "Law & Everyday Rights",
  economics: "Economics & Trade",
  geography: "Maps & Geography",
  photography: "Photography & Visual Storytelling",
  woodworking: "Woodworking & Making",
  infrastructure: "Transportation & Infrastructure",
  advanced: "Big Ideas, Simply Explained",
  general: "Everything Else",
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

// Examples guide depth and variety without limiting lessons to a fixed syllabus.
export const CATEGORY_GUIDANCE = {
  psychology: "Explore a specific mechanism in cognition, memory, perception, emotion, social behavior, or decision-making. Explain the evidence and avoid presenting contested findings as settled facts.",
  engineering: "Explore mechanical, civil, materials, chemical, or systems engineering through one concrete design problem: fatigue cracks, tuned mass dampers, cavitation, heat exchangers, or feedback control. Explain the design tradeoff.",
  howthings: "Unpack one hidden mechanism in an everyday object or process, such as refrigerator expansion valves, inkjet printheads, zipper sliders, or noise-canceling headphones. Follow the causal chain from input to result.",
  arthistory: "Explore one artwork, technique, material, or artistic exchange in its historical context. Draw from traditions worldwide, including African, Asian, Indigenous American, Oceanian, and European art.",
  history: "Explore world history across ancient, medieval, early modern, and modern periods. Vary regions, including Africa, Asia, the Americas, Oceania, and Europe. Go deep on a specific event, institution, trade network, technology, or everyday practice: Mali's manuscript culture, Indian Ocean monsoon trade, Inca quipu administration, Song printing, or Haitian independence. Explain causes, consequences, and what historical evidence can and cannot establish.",
  culinary: "Explore the science, ingredients, and traditions behind cooking across world cuisines: emulsions, starch gelatinization, gluten development, fermentation, nixtamalization, tempering chocolate, spice blooming, or balancing acidity. Explain one mechanism and how it changes flavor or texture, with a practical example. Include relevant food-safety details when giving preparation or storage advice.",
  electrical: "Go deep on one circuit or electrical concept: transistor biasing, RC time constants, impedance and phase, rectification, op-amp feedback, digital logic, grounding, motor back EMF, or power transmission. Trace what voltage and current do, explain the engineering tradeoff, and use a small numerical example when helpful. Any hands-on example should use low-voltage, current-limited circuits; explain hazardous mains or stored-energy systems conceptually.",
  homemaintenance: "Teach one specific household maintenance or diagnostic skill: finding a toilet flapper leak, choosing caulk, patching drywall, understanding a drain trap, weatherstripping, HVAC filter selection, or tracing moisture intrusion. Explain the cause, tools or materials, ordered actions, and how to check the result. Identify when the task needs a qualified professional, especially for gas, mains electricity, structural damage, or suspected hazardous materials.",
  automaintenance: "Explain one vehicle system or routine maintenance task: reading tire wear, checking pressure cold, oil viscosity, coolant chemistry, brake wear, battery corrosion, torque sequences, or interpreting an OBD-II code without assuming it identifies a failed part. Tie symptoms to mechanisms and useful checks. Note model-specific procedures and specifications; for hands-on work include relevant precautions such as a cool engine and properly rated jack stands, and leave high-voltage EV systems to trained technicians.",
  physics: "Explore one precise idea in mechanics, thermodynamics, electromagnetism, waves, optics, quantum physics, relativity, or condensed matter: angular momentum, entropy and microstates, resonance, polarization, tunneling, time dilation, or superconductivity. Explain the actual mechanism with a concrete example or thought experiment, define any symbols, and state where an analogy breaks down.",
  astronomy: "Explore observational astronomy, planetary science, stellar evolution, galaxies, or cosmology through one narrow topic: stellar absorption lines, exoplanet transit curves, orbital resonances, tidal heating, standard candles, pulsar timing, or gravitational lensing. Explain how observations support the conclusion and distinguish measurements from hypotheses. Include practical observing concepts where appropriate, with proper solar-viewing precautions if relevant.",
  mythology: "Draw broadly from Norse, Egyptian, Mesopotamian, Yoruba, Akan, Hindu, Buddhist, Chinese, Japanese, Maya, Mexica, Inuit, Maori, and other Pacific and Indigenous traditions, as well as Greek and Roman. Prefer traditions beyond Greece and Rome rather than defaulting to classical mythology. Focus on one story, figure, motif, or ritual context from a specifically named culture and, where known, source or regional version. Explain its cultural meaning, acknowledge variants and living religious traditions respectfully, and do not collapse distinct peoples into a single mythology or invent universal parallels.",
  howto: "Teach one achievable technique in cooking, sewing, woodworking, knitting, paper crafts, gardening, repair, or other hands-on skills: deglazing a pan, sharpening a chisel, sewing a ladder stitch, joining yarn, folding a book signature, or propagating a cutting. Include needed tools or materials, ordered steps woven into the paragraphs, why the key step works, one common mistake, and an observable success check. Keep the task small enough to explain fully within the lesson and include relevant tool or food-safety precautions.",
  advanced: "Explore genuinely advanced, technical ideas in physics, math, cosmology, computer science theory, or related fields. Preserve the actual concept and explain it with a clear, concrete analogy so a smart non-specialist can follow it; include the analogy's limits.",
  nature: "Explore one adaptation, behavior, or ecological relationship: octopus skin texture, bat echolocation, brood parasitism, coral symbiosis, ant navigation, or seed dispersal by animals. Name the species or group involved, explain the mechanism and evidence, and avoid assigning human motives or treating evolution as intentional design.",
  language: "Explore one feature of a language, writing system, or communication practice: the Cherokee syllabary, grammatical evidentiality, tone sandhi, abjads, signed-language spatial grammar, or a documented sound change. Use a small, accurate example and explain how it works. Draw from languages worldwide, distinguish speech from writing, and avoid invented etymologies or ranking languages as primitive or superior.",
  music: "Explain one musical or acoustic idea: suspended chords, syncopation, overtones, equal temperament, drum resonance, or a specific rhythmic pattern from a named tradition. Give a concrete listening, humming, or tapping example that works without sheet music. Define terms and identify the musical context rather than assuming Western theory applies universally.",
  chemistry: "Unpack the chemistry or material structure behind one everyday effect: cyanoacrylate curing, rust, soap micelles, glass tempering, rubber vulcanization, or why some plastics soften with heat. Connect molecular behavior to an observable property or practical use. Keep any suggested demonstration safe for home use and do not suggest mixing household cleaners or handling hazardous reagents.",
  gardening: "Teach one plant process or achievable gardening skill: finding a node for a cutting, seed dormancy, apical dominance, root aeration, graft unions, or diagnosing overwatering. Name a suitable plant example and explain why the technique works, the relevant growing conditions, ordered steps when applicable, and what success looks like. Account for species, climate, and season rather than giving universal care schedules.",
  geology: "Explore one Earth process or clue in the landscape: columnar jointing, river meanders, karst sinkholes, glacial striations, mineral cleavage, earthquake waves, or rain shadows. Trace the physical mechanism and explain what a specific rock, landform, or measurement reveals. Distinguish timescales and evidence from uncertain reconstructions or predictions.",
  outdoors: "Teach one practical navigation or outdoor skill: orienting a paper map, accounting for magnetic declination, reading contour lines, tying a bowline, pitching a tarp, or layering clothing to manage moisture. State needed equipment, ordered actions, a common mistake, and a way to check the result. Explain the limits of rules of thumb; do not substitute a short lesson for emergency planning or present foraging identifications as safe to act on without expert verification.",
  textiles: "Explore how one fabric, garment feature, or textile process works: twill weave in denim, wool felting, bias stretch, ripstop construction, indigo dyeing, or the structure of a zipper. Connect fiber or construction to drape, strength, warmth, or care. Draw on specifically named textile traditions worldwide when relevant; focus on understanding the material or garment, leaving step-by-step needlework to Sewing & Textile Crafts.",
  architecture: "Explain one building element or design strategy: windcatchers, flying buttresses, courtyards, mashrabiya screens, passive solar overhangs, or earthquake-resistant joints. Follow how air, light, heat, or loads move through it, and show how climate, materials, and local context shape the design. Keep structural examples explanatory rather than providing construction specifications.",
  archaeology: "Explore one artifact, ancient technology, or archaeological method: reconstructing stone-tool production, reading pottery temper, experimental bronze casting, dendrochronology, flotation of plant remains, or interpreting wear marks. Explain how evidence supports a specific inference, distinguish reconstruction from certainty, and recognize the knowledge and perspectives of descendant communities. Avoid speculative lost-civilization claims or instructions to disturb archaeological sites.",
  games: "Teach one strategic idea or mechanic from a specific game: opposition in a chess endgame, liberties in Go, tempo in a card game, backward induction, or the probability of a dice outcome. Give a small self-contained position or scenario with enough rules to follow it, compare plausible choices, and explain when the strategy works or fails. Vary games and traditions rather than defaulting to chess.",
  culture: "Explore one everyday custom in a specifically named community, place, and period: a naming convention, greeting practice, calendar observance, gift-giving custom, or form of hospitality. Explain its social meaning and context with a concrete example. Acknowledge regional, generational, and individual variation; avoid stereotypes, invented origin stories, or treating living cultures as frozen in the past.",
  sewing: "Teach one manageable sewing, mending, embroidery, knitting, crochet, or weaving technique: a ladder stitch, backstitch, zipper insertion, darning a sock, securing a shank button, a knit increase, or a crochet slip stitch. Identify the exact technique and craft because stitch names can vary. Include materials, starting setup, precise ordered hand or needle movements woven into the paragraphs, tension or alignment cues, one common mistake, and a visible success check. Keep the task small enough to explain completely in one lesson.",
  finance: "Explain one specific personal-finance or financial-market concept: compound interest, inflation and purchasing power, loan amortization, credit utilization, bond prices and yields, diversification, expense ratios, bid-ask spreads, or marginal tax brackets. Use a small worked example with clearly stated hypothetical numbers, time periods, and assumptions. Explain the mechanism and a meaningful tradeoff or common misconception. Keep lessons educational; avoid personalized investment advice, stock picks, promised returns, or claims about current rates, prices, or tax rules. Identify jurisdictional differences where relevant.",
  politics: "Explain one specific political institution, process, or idea: proportional representation, ranked-choice voting, coalition formation, parliamentary confidence votes, federalism, judicial review, gerrymandering, legislative committees, collective action, or the difference between state and government. Draw from systems worldwide and identify the country, jurisdiction, and historical period when relevant. Use a concrete example or clearly labeled hypothetical to show how the mechanism works and explain its tradeoffs. Distinguish verifiable facts from interpretations and contested claims, represent substantive perspectives fairly without treating unsupported claims as equally credible, and avoid partisan advocacy or telling the learner how to vote. Prefer durable civic concepts over current news; do not invent current officeholders, election results, or legal rules.",
  computing: "Explain one mechanism in computing or the internet: QR error correction, DNS caching, public-key encryption, image compression, packet routing, or how a database index speeds a lookup. Trace a concrete example from input to result and explain a limitation. Source technical claims from official documentation or original research; distinguish durable concepts from version-specific behavior.",
  mathematics: "Explore one mathematical pattern or counterintuitive result: the birthday problem, nontransitive dice, great-circle routes, fractal dimension, or different sizes of infinity. Work through a small example or intuitive proof with explicit assumptions. Check every calculation and distinguish a useful analogy from a mathematical argument.",
  logic: "Teach one reasoning tool or pitfall: confusing conditional probabilities, base-rate neglect, necessary versus sufficient conditions, Simpson's paradox, or falsifiability. Use an explicitly hypothetical example with enough information to follow the reasoning. Explain exactly where the inference succeeds or fails rather than just attaching a fallacy label.",
  philosophy: "Explore one philosophical question or argument: the Ship of Theseus, moral luck, the experience machine, the veil of ignorance, or a specifically attributed argument from a non-Western tradition. Clearly label thought experiments, state the argument and a substantive objection, and distinguish documented attribution from interpretation. Do not present contested positions as established facts.",
  religion: "Explain one belief, practice, text, or interpretive tradition within a specifically named religious community: a mandala's ritual context, a particular fasting observance, scriptural commentary, pilgrimage, or liturgical calendars. Use reliable scholarship and sources from the community itself, identify variants, and distinguish what adherents believe from empirically established events. Treat living religions respectfully without proselytizing or inventing universal parallels.",
  humanbody: "Explain one anatomical or physiological mechanism: inner-ear rotation sensing, the pupil reflex, tendon elasticity, wound healing, temperature regulation, or why referred pain occurs. Trace the mechanism with a concrete everyday example and correct a common misconception. Use authoritative medical or scientific sources; keep the lesson educational rather than diagnosing symptoms or prescribing treatment.",
  medicine: "Explain one public-health or medical concept: antibiotic targets, vaccine immune memory, screening false positives, herd effects, oral rehydration, or randomized trials. Use current authoritative health guidance or primary research and explain evidence quality and limitations. Keep examples educational; do not provide personalized diagnosis, dosing, or treatment, and do not amplify sensational health claims without strong corroboration.",
  law: "Explain one legal concept or everyday process: consideration in contracts, burdens of proof, small-claims procedure, copyright versus trademarks, or the distinction between civil and criminal cases. Identify the jurisdiction and relevant date, use current official legal sources, and explain exceptions without giving personalized legal advice. Verify any supposedly bizarre law against the actual legal text and its status; never repeat unsourced lists of weird laws.",
  economics: "Explain one economic mechanism: comparative advantage, opportunity cost, externalities, price signals, adverse selection, public goods, or auction design. Use a small clearly hypothetical example with checked arithmetic and explicit assumptions. Distinguish a model's prediction from empirical evidence and discuss where the model stops being useful; focus on exchange and incentives rather than personal investment advice.",
  geography: "Explore one geographic pattern or mapping concept: projection distortion, exclaves, drainage divides, time-zone boundaries, address systems, or the antimeridian. Use a specifically located, sourced example and explain how it arose or how the map represents it. Identify disputed boundaries and dates without treating one contested claim as universally accepted.",
  photography: "Explain one photographic or visual-storytelling technique: motion blur from shutter speed, depth of field, perspective versus focal length, white balance, leading lines, or continuity editing. Give an achievable exercise, explain the underlying mechanism, and describe what to look for in the result. State equipment assumptions and avoid inventing camera settings or attributing effects to the wrong cause.",
  woodworking: "Teach one small woodworking or making technique: pilot holes, reading grain direction, a coping cut, clamping a glue joint, a countersink, or a simple layout jig. Give the materials, setup, ordered steps, why they work, and an observable success check. Include relevant tool precautions and source procedures from reliable craft instruction or manufacturer guidance; avoid compressing hazardous machinery training into a short lesson.",
  infrastructure: "Unpack one transportation or infrastructure mechanism: a railway switch, canal lock, traffic-signal detector, water tower, runway numbering, or a wastewater settling tank. Trace the movement of people, materials, water, or signals through the system. Use a specific sourced example and explain a design constraint or surprising tradeoff without providing instructions to tamper with infrastructure.",
  general: "Explore a surprising, specific topic outside the other categories, such as a postal sorting convention, a library classification rule, or an unusual documented everyday practice. Explain one mechanism or connection with a concrete example rather than listing trivia. Strange-but-true discoveries are welcome only when the evidence supports the exact claim.",
} as const satisfies Record<CategoryKey, string>;

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];

export type Weights = Record<CategoryKey, number>;

export function defaultWeights(): Weights {
  return Object.fromEntries(CATEGORY_KEYS.map((k) => [k, 10])) as Weights;
}

export function pickCategory(
  weights: Weights,
  avoidRecent: CategoryKey[],
  selectedCategories: CategoryKey[] = CATEGORY_KEYS
): CategoryKey {
  const selected = CATEGORY_KEYS.filter((k) => selectedCategories.includes(k));
  if (!selected.length) throw new Error("Choose at least one category.");
  const pool = selected.filter((k) => !avoidRecent.includes(k));
  const usable = pool.length ? pool : selected;
  let total = 0;
  usable.forEach((k) => {
    total += Math.max(weights[k] ?? 1, 1);
  });
  let r = Math.random() * total;
  for (const k of usable) {
    r -= Math.max(weights[k] ?? 1, 1);
    if (r <= 0) return k;
  }
  return usable[0];
}
