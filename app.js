/* Muscu Offline - PWA - 100% local */
const STORAGE_KEY = "training_camp_v5";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const groups = ["Bras","Pecs","Dos","Jambes","Épaules","Abdos"];
// ==============================
// Icônes SVG offline (libres) + helpers
// ==============================
function svgIconData(iconKey) {
  const common = `fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
  const icons = {
    default: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M14 50h36M18 18h28M22 18v10m20-10v10"/><circle ${common} cx="32" cy="30" r="5"/><path ${common} d="M24 58l8-14 8 14"/></svg>`,

    bench_flat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M10 18h44M16 18v10m32-10v10"/><path ${common} d="M14 44h36M22 44l-6-10m18 10l6-10"/><circle ${common} cx="32" cy="30" r="5"/></svg>`,
    bench_incline: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M12 46h40"/><path ${common} d="M18 44l18-18"/><path ${common} d="M18 44l-4-8m26-18l10 0"/><circle ${common} cx="34" cy="28" r="5"/><path ${common} d="M26 58l8-14 8 14"/></svg>`,
    bench_decline: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M12 46h40"/><path ${common} d="M18 22l18 18"/><path ${common} d="M18 22l-4 8m26 18l10 0"/><circle ${common} cx="34" cy="36" r="5"/><path ${common} d="M26 58l8-14 8 14"/></svg>`,
    pushup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M10 44h44"/><circle ${common} cx="20" cy="32" r="4"/><path ${common} d="M24 32l14 6 16 2"/><path ${common} d="M26 38l-6 12"/></svg>`,
    pec_deck: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle ${common} cx="32" cy="18" r="5"/><path ${common} d="M22 30l10 10 10-10"/><path ${common} d="M16 28l6 6m26-6l-6 6"/><path ${common} d="M26 58l6-14 6 14"/></svg>`,
    fly_incline: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle ${common} cx="32" cy="16" r="5"/><path ${common} d="M16 32l16 10 16-10"/><path ${common} d="M14 30l8 4m28-4l-8 4"/><path ${common} d="M24 58l8-14 8 14"/></svg>`,
    cable_fly_mid: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M14 18v28M50 18v28"/><circle ${common} cx="32" cy="24" r="5"/><path ${common} d="M18 28l14 10 14-10"/><path ${common} d="M24 58l8-14 8 14"/></svg>`,
    cable_fly_up: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M14 18v28M50 18v28"/><circle ${common} cx="32" cy="26" r="5"/><path ${common} d="M18 36l14-10 14 10"/><path ${common} d="M24 58l8-14 8 14"/></svg>`,
    cable_fly_down: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M14 18v28M50 18v28"/><circle ${common} cx="32" cy="22" r="5"/><path ${common} d="M18 26l14 12 14-12"/><path ${common} d="M24 58l8-14 8 14"/></svg>`,
    pullover: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle ${common} cx="24" cy="18" r="5"/><path ${common} d="M16 52h36"/><path ${common} d="M24 23l14 10"/><path ${common} d="M38 33l10-8"/><path ${common} d="M34 33l4 15"/></svg>`,

    pullup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M10 14h44"/><circle ${common} cx="32" cy="24" r="5"/><path ${common} d="M22 30l10-6 10 6"/><path ${common} d="M32 29v16m-10 0l10-6 10 6"/></svg>`,
    pulldown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M14 14h36"/><path ${common} d="M32 14v10"/><circle ${common} cx="32" cy="30" r="5"/><path ${common} d="M22 30l10 6 10-6"/><path ${common} d="M22 50l10-14 10 14"/></svg>`,
    row_bar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle ${common} cx="26" cy="18" r="5"/><path ${common} d="M20 56h34"/><path ${common} d="M26 23l-8 16m8-16l14 10"/><path ${common} d="M18 39l18 0m4-6l8-4"/></svg>`,
    row_one: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle ${common} cx="24" cy="16" r="5"/><path ${common} d="M20 56h36"/><path ${common} d="M24 21l-8 18"/><path ${common} d="M16 39l18 0m10-10l6-4"/></svg>`,
    row_cable: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M14 48h36"/><circle ${common} cx="26" cy="22" r="5"/><path ${common} d="M26 27l-8 16"/><path ${common} d="M18 43l18 0m8-18l6-4"/></svg>`,
    row_tbar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M32 12v34"/><path ${common} d="M18 18h28"/><circle ${common} cx="26" cy="24" r="5"/><path ${common} d="M26 29l-8 16"/><path ${common} d="M20 56h34"/></svg>`,
    row_machine: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M14 50h36"/><path ${common} d="M20 22h24"/><circle ${common} cx="28" cy="28" r="5"/><path ${common} d="M28 33l-8 14"/><path ${common} d="M42 22v20"/></svg>`,
    facepull: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M14 22v22M50 22v22"/><circle ${common} cx="32" cy="28" r="5"/><path ${common} d="M18 30l14 6 14-6"/><path ${common} d="M24 58l8-14 8 14"/></svg>`,
    rear_delt: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle ${common} cx="28" cy="16" r="5"/><path ${common} d="M28 21l-10 12m10-12l14 8"/><path ${common} d="M18 33l18 0m6-4l10-6"/><path ${common} d="M24 58l6-14 8 14"/></svg>`,
    deadlift: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M10 46h44"/><circle ${common} cx="32" cy="22" r="5"/><path ${common} d="M32 27l-6 12m6-12l6 12"/><path ${common} d="M26 39l-2 15m16-15l2 15"/></svg>`,
    rdl: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M14 18h36M18 18v8m28-8v8"/><circle ${common} cx="32" cy="26" r="5"/><path ${common} d="M32 31l-6 12m6-12l6 12M26 43l-2 15m16-15l2 15"/></svg>`,
    back_extension: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle ${common} cx="22" cy="20" r="5"/><path ${common} d="M16 52h40"/><path ${common} d="M22 25l14 10c6 4 12 6 18 6"/><path ${common} d="M28 35l-6 12"/></svg>`,

    squat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M20 12l24 0M18 20l28 0M24 22l-4 8m20-8l4 8"/><circle ${common} cx="32" cy="30" r="6"/><path ${common} d="M28 36l-8 10m16-10l8 10M20 46l-4 12m28-12l4 12"/></svg>`,
    legpress: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M10 48h44M44 48L54 20M48 22L24 38M18 42l-6 6"/><circle ${common} cx="22" cy="34" r="4"/><path ${common} d="M22 38l-6 8m6-8l10 4"/></svg>`,
    lunge: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle ${common} cx="26" cy="16" r="5"/><path ${common} d="M26 21l-6 12m6-12l10 8m-16 4l-6 10M36 29l-2 10M24 33l14 0M32 39l8 15M14 58h36"/></svg>`,
    calf: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M18 56h28"/><path ${common} d="M26 12c8 2 12 10 10 18l-2 10c-1 6 2 10 10 10"/><path ${common} d="M26 12l-6 14c-2 5 1 10 6 10h8"/></svg>`,

    curl: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle ${common} cx="28" cy="16" r="5"/><path ${common} d="M28 21l-6 12m6-12l10 8"/><path ${common} d="M18 44c10 0 12-10 18-10s8 10 18 10"/><path ${common} d="M16 44h6m26 0h6"/></svg>`,
    hammer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle ${common} cx="26" cy="18" r="5"/><path ${common} d="M26 23l-6 14"/><path ${common} d="M20 37l10 4 10-4"/><path ${common} d="M18 41h8m12 0h8"/></svg>`,
    triceps_pushdown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M32 10v10"/><circle ${common} cx="32" cy="26" r="5"/><path ${common} d="M24 30l8 10 8-10"/><path ${common} d="M24 52l8-12 8 12"/></svg>`,
    skull: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle ${common} cx="32" cy="18" r="5"/><path ${common} d="M20 34h24"/><path ${common} d="M32 23l-8 16m8-16l8 16"/><path ${common} d="M22 34l-6 10m26-10l6 10"/></svg>`,
    dip: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M14 18h36M20 18v34m24-34v34"/><circle ${common} cx="32" cy="28" r="5"/><path ${common} d="M32 33l-6 10m6-10l6 10"/></svg>`,

    press: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M18 12h28"/><circle ${common} cx="32" cy="24" r="5"/><path ${common} d="M24 30l8-6 8 6"/><path ${common} d="M32 29v10"/><path ${common} d="M22 52l10-13 10 13"/></svg>`,
    lateral: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle ${common} cx="32" cy="16" r="5"/><path ${common} d="M32 21v16"/><path ${common} d="M20 30l12 6 12-6"/><path ${common} d="M16 30h8m24 0h8"/><path ${common} d="M24 58l8-14 8 14"/></svg>`,
    shrug: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle ${common} cx="32" cy="16" r="5"/><path ${common} d="M20 34c6-6 18-6 24 0"/><path ${common} d="M24 34l-6 10m28-10l6 10"/><path ${common} d="M22 58l10-14 10 14"/></svg>`,

    crunch: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle ${common} cx="22" cy="22" r="5"/><path ${common} d="M18 56h34"/><path ${common} d="M22 27l10 10c4 4 10 6 16 6"/><path ${common} d="M32 37l-6 10"/></svg>`,
    legraise: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M14 52h36"/><circle ${common} cx="24" cy="24" r="5"/><path ${common} d="M24 29l10 8"/><path ${common} d="M34 37l14-10"/><path ${common} d="M34 37l4 15"/></svg>`,
    plank: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path ${common} d="M12 44h40"/><circle ${common} cx="22" cy="30" r="5"/><path ${common} d="M22 35l10 6 18 3"/><path ${common} d="M26 41l-6 10"/></svg>`,
    twist: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle ${common} cx="32" cy="16" r="5"/><path ${common} d="M20 54c8-10 16-10 24 0"/><path ${common} d="M22 30c6 6 14 6 20 0"/><path ${common} d="M18 30h8m12 0h8"/></svg>`,
  };

  const svg = icons[iconKey] || icons.default;
  const encoded = encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22");
  return `data:image/svg+xml,${encoded}`;
}


function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}
// Helper: crée un exercice (compatible ancien/nouveau)
function makeExercise(id, name, muscleGroup, iconKeyOrNotes = "", notesMaybe = "") {
  let iconKey = "";
  let notes = "";

  // 4 paramètres -> ancien format: (id, name, group, notes)
  // 5 paramètres -> nouveau format: (id, name, group, iconKey, notes)
  if (notesMaybe === "") {
    notes = iconKeyOrNotes || "";
  } else {
    iconKey = iconKeyOrNotes || "";
    notes = notesMaybe || "";
  }

  return { id, name, muscleGroup, iconKey, notes };
}

function todayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d - tz).toISOString().slice(0,10);
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);

  // Seed minimal + templates par groupe (avec exos vides au départ)
  const seed = {
    exercises: [
  // =====================
  // PECS 
  // =====================
  makeExercise(uid(), "Développé incliné barre", "Pecs", "bench_incline", "Zone: Haut des pecs"),
  makeExercise(uid(), "Développé incliné haltères", "Pecs", "bench_incline", "Zone: Haut des pecs"),
  makeExercise(uid(), "Développé incliné machine", "Pecs", "bench_incline", "Zone: Haut des pecs"),
  makeExercise(uid(), "Écarté incliné haltères", "Pecs", "fly_incline", "Zone: Haut des pecs"),
  makeExercise(uid(), "Poulie vis-à-vis bas → haut", "Pecs", "cable_fly_up", "Zone: Haut des pecs"),

  makeExercise(uid(), "Développé couché barre", "Pecs", "bench_flat", "Zone: Milieu des pecs"),
  makeExercise(uid(), "Développé couché haltères", "Pecs", "bench_flat", "Zone: Milieu des pecs"),
  makeExercise(uid(), "Chest press machine", "Pecs", "bench_flat", "Zone: Milieu des pecs"),
  makeExercise(uid(), "Pompes", "Pecs", "pushup", "Zone: Milieu des pecs"),
  makeExercise(uid(), "Pec deck", "Pecs", "pec_deck", "Zone: Milieu des pecs"),
  makeExercise(uid(), "Écarté poulie (vis-à-vis)", "Pecs", "cable_fly_mid", "Zone: Milieu des pecs"),

  makeExercise(uid(), "Développé décliné barre", "Pecs", "bench_decline", "Zone: Bas des pecs"),
  makeExercise(uid(), "Développé décliné haltères", "Pecs", "bench_decline", "Zone: Bas des pecs"),
  makeExercise(uid(), "Dips (buste penché)", "Pecs", "dip", "Zone: Bas des pecs"),
  makeExercise(uid(), "Poulie vis-à-vis haut → bas", "Pecs", "cable_fly_down", "Zone: Bas des pecs"),
  makeExercise(uid(), "Pull-over haltère", "Pecs", "pullover", "Zone: Pecs/serratus"),

  // =====================
  // DOS
  // =====================
  makeExercise(uid(), "Tractions pronation", "Dos", "pullup", "Zone: Lats"),
  makeExercise(uid(), "Tractions supination", "Dos", "pullup", "Zone: Lats"),
  makeExercise(uid(), "Lat pulldown prise large", "Dos", "pulldown", "Zone: Lats"),
  makeExercise(uid(), "Lat pulldown prise serrée", "Dos", "pulldown", "Zone: Lats"),
  makeExercise(uid(), "Rowing unilatéral haltère", "Dos", "row_one", "Zone: Lats"),
  makeExercise(uid(), "Rowing poulie basse prise serrée", "Dos", "row_cable", "Zone: Lats"),
  makeExercise(uid(), "Pull-over poulie", "Dos", "pullover", "Zone: Lats/serratus"),

  makeExercise(uid(), "Rowing barre buste penché", "Dos", "row_bar", "Zone: Haut du dos"),
  makeExercise(uid(), "Rowing T-bar", "Dos", "row_tbar", "Zone: Haut du dos"),
  makeExercise(uid(), "Rowing machine (chest supported)", "Dos", "row_machine", "Zone: Haut du dos"),
  makeExercise(uid(), "Face pull", "Dos", "facepull", "Zone: Haut du dos/arrière d'épaule"),
  makeExercise(uid(), "Oiseau à la poulie", "Dos", "rear_delt", "Zone: Haut du dos"),

  makeExercise(uid(), "Soulevé de terre", "Dos", "deadlift", "Zone: Bas du dos"),
  makeExercise(uid(), "Soulevé de terre roumain (RDL)", "Dos", "rdl", "Zone: Bas du dos/ischios"),
  makeExercise(uid(), "Extensions lombaires", "Dos", "back_extension", "Zone: Bas du dos"),

  // =====================
  // JAMBES
  // =====================
  makeExercise(uid(), "Squat", "Jambes", "squat", "Zone: Quadriceps"),
  makeExercise(uid(), "Front squat", "Jambes", "squat_front", "Zone: Quadriceps"),
  makeExercise(uid(), "Hack squat", "Jambes", "hack_squat", "Zone: Quadriceps"),
  makeExercise(uid(), "Leg press", "Jambes", "legpress", "Zone: Quadriceps"),
  makeExercise(uid(), "Leg extension", "Jambes", "leg_extension", "Zone: Quadriceps"),
  makeExercise(uid(), "Fentes marchées", "Jambes", "lunge", "Zone: Quadriceps/Fessiers"),
  makeExercise(uid(), "Bulgarian split squat", "Jambes", "split_squat", "Zone: Quadriceps/Fessiers"),
  makeExercise(uid(), "Step-up", "Jambes", "stepup", "Zone: Quadriceps/Fessiers"),

  makeExercise(uid(), "Leg curl allongé", "Jambes", "leg_curl", "Zone: Ischios"),
  makeExercise(uid(), "Leg curl assis", "Jambes", "leg_curl", "Zone: Ischios"),
  makeExercise(uid(), "Good morning", "Jambes", "good_morning", "Zone: Ischios/Bas du dos"),
  makeExercise(uid(), "RDL (ischios)", "Jambes", "rdl", "Zone: Ischios"),

  makeExercise(uid(), "Hip thrust", "Jambes", "hip_thrust", "Zone: Fessiers"),
  makeExercise(uid(), "Glute bridge", "Jambes", "glute_bridge", "Zone: Fessiers"),
  makeExercise(uid(), "Kickback poulie", "Jambes", "kickback", "Zone: Fessiers"),

  makeExercise(uid(), "Mollets debout", "Jambes", "calf", "Zone: Mollets"),
  makeExercise(uid(), "Mollets assis", "Jambes", "calf", "Zone: Mollets"),

  // =====================
  // ÉPAULES
  // =====================
  makeExercise(uid(), "Développé militaire", "Épaules", "press", "Zone: Avant/Global"),
  makeExercise(uid(), "Développé haltères assis", "Épaules", "press", "Zone: Avant/Global"),
  makeExercise(uid(), "Arnold press", "Épaules", "press", "Zone: Avant/Global"),

  makeExercise(uid(), "Élévations latérales haltères", "Épaules", "lateral", "Zone: Moyen faisceau"),
  makeExercise(uid(), "Élévations latérales poulie", "Épaules", "lateral", "Zone: Moyen faisceau"),
  makeExercise(uid(), "Élévations latérales machine", "Épaules", "lateral", "Zone: Moyen faisceau"),

  makeExercise(uid(), "Oiseau haltères", "Épaules", "rear_delt", "Zone: Arrière"),
  makeExercise(uid(), "Rear delt machine", "Épaules", "rear_delt", "Zone: Arrière"),
  makeExercise(uid(), "Face pull", "Épaules", "facepull", "Zone: Arrière/haut du dos"),

  makeExercise(uid(), "Rowing menton (léger/contrôlé)", "Épaules", "upright_row", "Zone: Épaules/Trap"),
  makeExercise(uid(), "Shrugs", "Épaules", "shrug", "Zone: Trapèzes"),
  makeExercise(uid(), "Farmer walk", "Épaules", "farmer", "Zone: Trap/prise"),

  // =====================
  // BRAS
  // =====================
  makeExercise(uid(), "Curl barre", "Bras", "curl", "Zone: Biceps"),
  makeExercise(uid(), "Curl haltères", "Bras", "curl", "Zone: Biceps"),
  makeExercise(uid(), "Curl incliné", "Bras", "curl_incline", "Zone: Biceps (long)"),
  makeExercise(uid(), "Curl pupitre", "Bras", "preacher", "Zone: Biceps"),
  makeExercise(uid(), "Curl marteau", "Bras", "hammer", "Zone: Brachial/avant-bras"),
  makeExercise(uid(), "Curl câble", "Bras", "curl", "Zone: Biceps"),

  makeExercise(uid(), "Pushdown triceps (barre)", "Bras", "triceps_pushdown", "Zone: Triceps"),
  makeExercise(uid(), "Pushdown corde", "Bras", "triceps_pushdown", "Zone: Triceps"),
  makeExercise(uid(), "Extensions triceps au-dessus tête", "Bras", "triceps_overhead", "Zone: Triceps (long)"),
  makeExercise(uid(), "Barre au front (skullcrusher)", "Bras", "skull", "Zone: Triceps"),
  makeExercise(uid(), "Dips triceps", "Bras", "dip", "Zone: Triceps"),

  makeExercise(uid(), "Wrist curl", "Bras", "forearm", "Zone: Avant-bras"),
  makeExercise(uid(), "Reverse wrist curl", "Bras", "forearm", "Zone: Avant-bras"),
  makeExercise(uid(), "Reverse curl", "Bras", "reverse_curl", "Zone: Avant-bras/brachial"),

  // =====================
  // ABDOS
  // =====================
  makeExercise(uid(), "Crunch", "Abdos", "crunch", "Zone: Haut"),
  makeExercise(uid(), "Crunch câble", "Abdos", "crunch", "Zone: Haut"),
  makeExercise(uid(), "Sit-up", "Abdos", "situp", "Zone: Haut"),

  makeExercise(uid(), "Relevés de jambes", "Abdos", "legraise", "Zone: Bas"),
  makeExercise(uid(), "Relevés de genoux (chaise romaine)", "Abdos", "legraise", "Zone: Bas"),
  makeExercise(uid(), "Dead bug", "Abdos", "deadbug", "Zone: Gainage"),

  makeExercise(uid(), "Russian twist", "Abdos", "twist", "Zone: Obliques"),
  makeExercise(uid(), "Woodchopper poulie", "Abdos", "woodchop", "Zone: Obliques"),
  makeExercise(uid(), "Side plank", "Abdos", "sideplank", "Zone: Obliques/Gainage"),

  makeExercise(uid(), "Planche", "Abdos", "plank", "Zone: Gainage"),
  makeExercise(uid(), "Planche dynamique (shoulder taps)", "Abdos", "plank", "Zone: Gainage"),
  makeExercise(uid(), "Hollow hold", "Abdos", "hollow", "Zone: Gainage"),
],

    templates: [
      // Chaque template contient des items: {exerciseId, setsPlanned, repTarget, restSec}
      { id: uid(), name: "Bras", items: [] },
      { id: uid(), name: "Pecs", items: [] },
      { id: uid(), name: "Dos", items: [] },
      { id: uid(), name: "Jambes", items: [] },
      { id: uid(), name: "Épaules", items: [] },
      { id: uid(), name: "Abdos", items: [] }
    ],
    logs: [] // {id, date, templateId, templateName, entries:[{exerciseId, exerciseName, sets:[{weight,reps,done}]}]}
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

// ---------------- PWA SW register ----------------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./service-worker.js");
      $("#statusText").textContent = "Offline prêt ✅";
    } catch (e) {
      $("#statusText").textContent = "Offline non activé";
    }
  });
}

// ---------------- Tabs ----------------
$$(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    $$(".panel").forEach(p => p.classList.remove("active"));
    $(`#tab-${tab}`).classList.add("active");
    renderAll();
  });
});

// ---------------- Timer (simple) ----------------
let timerInterval = null;
let timerRemaining = 120;

function formatMMSS(sec) {
  const m = Math.floor(sec/60).toString().padStart(2,"0");
  const s = Math.floor(sec%60).toString().padStart(2,"0");
  return `${m}:${s}`;
}
function updateTimerUI() {
  $("#timerText").textContent = formatMMSS(timerRemaining);
}
$("#restPreset").addEventListener("change", () => {
  timerRemaining = Number($("#restPreset").value);
  updateTimerUI();
});
$("#btnTimer").addEventListener("click", () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    $("#btnTimer").textContent = "Start";
    return;
  }
  $("#btnTimer").textContent = "Pause";
  timerInterval = setInterval(() => {
    timerRemaining -= 1;
    if (timerRemaining <= 0) {
      timerRemaining = 0;
      clearInterval(timerInterval);
      timerInterval = null;
      $("#btnTimer").textContent = "Start";
      try { navigator.vibrate?.(200); } catch {}
      // petit bip via WebAudio
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine"; o.frequency.value = 880;
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
        o.start(); o.stop(ctx.currentTime + 0.28);
      } catch {}
    }
    updateTimerUI();
  }, 1000);
});
$("#btnTimerReset").addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
  $("#btnTimer").textContent = "Start";
  timerRemaining = Number($("#restPreset").value);
  updateTimerUI();
});

// ---------------- Modal helpers ----------------
function openModal(title, bodyHTML, footHTML) {
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = bodyHTML;
  $("#modalFoot").innerHTML = footHTML;
  $("#modalBackdrop").hidden = false;
}
function closeModal() {
  $("#modalBackdrop").hidden = true;
}
$("#modalClose").addEventListener("click", closeModal);
$("#modalBackdrop").addEventListener("click", (e) => {
  if (e.target.id === "modalBackdrop") closeModal();
});

// ---------------- Helpers ----------------
function getExercise(id) {
  return state.exercises.find(e => e.id === id);
}
function getTemplate(id) {
  return state.templates.find(t => t.id === id);
}

function computePRs() {
  // PR simple: meilleure charge (et reps associées) par exercice
  const prs = new Map(); // exerciseId -> {weight, reps, date}
  for (const log of state.logs) {
    for (const entry of log.entries) {
      for (const set of entry.sets) {
        if (!set.done) continue;
        const w = Number(set.weight || 0);
        const r = Number(set.reps || 0);
        const prev = prs.get(entry.exerciseId);
        if (!prev || w > prev.weight || (w === prev.weight && r > prev.reps)) {
          prs.set(entry.exerciseId, { weight: w, reps: r, date: log.date });
        }
      }
    }
  }
  return prs;
}

function lastPerformance(exerciseId) {
  // Dernière perf: cherche dans logs du plus récent au plus ancien, prend dernière série validée
  const logs = [...state.logs].sort((a,b) => b.date.localeCompare(a.date));
  for (const log of logs) {
    const entry = log.entries.find(e => e.exerciseId === exerciseId);
    if (!entry) continue;
    for (let i = entry.sets.length - 1; i >= 0; i--) {
      const s = entry.sets[i];
      if (s.done && (s.weight || s.reps)) return { date: log.date, weight: s.weight || 0, reps: s.reps || 0 };
    }
  }
  return null;
}

// ---------------- Workout flow ----------------
let currentWorkout = null; 
// {id, date, templateId, templateName, entries:[{exerciseId, exerciseName, sets:[{weight,reps,done}]}]}

$("#workoutDate").value = todayISO();

function ensureTemplateSelect() {
  const sel = $("#workoutTemplateSelect");
  sel.innerHTML = "";
  state.templates.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.name;
    sel.appendChild(opt);
  });
}

function renderWorkoutArea() {
  const area = $("#workoutArea");
  area.innerHTML = "";

  if (!currentWorkout) {
    area.innerHTML = `<div class="card"><div class="muted">Aucune séance en cours.</div></div>`;
    $("#btnFinish").disabled = true;
    $("#btnDiscard").disabled = true;
    return;
  }

  $("#btnFinish").disabled = false;
  $("#btnDiscard").disabled = false;

  for (const entry of currentWorkout.entries) {
    const ex = getExercise(entry.exerciseId);
    const pr = computePRs().get(entry.exerciseId);
    const last = lastPerformance(entry.exerciseId);

    const setsHTML = entry.sets.map((s, idx) => {
      const checked = s.done ? "checked" : "";
      return `
        <div class="setRow">
          <div class="setIdx">S${idx+1}</div>
          <input inputmode="decimal" placeholder="kg" value="${s.weight ?? ""}"
            data-ex="${entry.exerciseId}" data-set="${idx}" data-field="weight" />
          <input inputmode="numeric" placeholder="reps" value="${s.reps ?? ""}"
            data-ex="${entry.exerciseId}" data-set="${idx}" data-field="reps" />
          <div class="checkbox ${s.done ? "checked" : ""}" role="button"
            data-ex="${entry.exerciseId}" data-set="${idx}" data-action="toggle">
            <span>✓</span>
          </div>
        </div>
      `;
    }).join("");

    const html = `
      <div class="exerciseCard">
        <div class="exerciseHead">
          <div>
            <div class="exerciseName">${ex?.name ?? entry.exerciseName}</div>
            <div class="muted">${ex?.muscleGroup ?? ""}</div>
          </div>
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; justify-content:flex-end;">
            <div class="badge"><strong>Dernier</strong> ${last ? `${last.weight}kg x ${last.reps} (${last.date})` : "—"}</div>
            <div class="badge"><strong>PR</strong> ${pr ? `${pr.weight}kg x ${pr.reps} (${pr.date})` : "—"}</div>
            <button class="ghost" data-action="addSet" data-ex="${entry.exerciseId}">+ série</button>
            <button class="ghost" data-action="removeSet" data-ex="${entry.exerciseId}">- série</button>
          </div>
        </div>
        <hr class="sep" />
        <div>${setsHTML}</div>
      </div>
    `;
    area.insertAdjacentHTML("beforeend", html);
  }

  // Input handlers
  area.querySelectorAll("input").forEach(inp => {
    inp.addEventListener("input", () => {
      const exId = inp.dataset.ex;
      const setIdx = Number(inp.dataset.set);
      const field = inp.dataset.field;
      const entry = currentWorkout.entries.find(e => e.exerciseId === exId);
      if (!entry) return;
      entry.sets[setIdx][field] = inp.value === "" ? "" : Number(inp.value);
      saveDraftWorkout();
    });
  });

  // Toggle / add / remove
  area.querySelectorAll("[data-action]").forEach(el => {
    el.addEventListener("click", () => {
      const action = el.dataset.action;
      const exId = el.dataset.ex;
      const entry = currentWorkout.entries.find(e => e.exerciseId === exId);
      if (!entry) return;

      if (action === "toggle") {
        const setIdx = Number(el.dataset.set);
        entry.sets[setIdx].done = !entry.sets[setIdx].done;
      }
      if (action === "addSet") {
        entry.sets.push({ weight:"", reps:"", done:false });
      }
      if (action === "removeSet") {
        if (entry.sets.length > 1) entry.sets.pop();
      }
      saveDraftWorkout();
      renderWorkoutArea();
    });
  });
}

function saveDraftWorkout() {
  // Draft en mémoire + localStorage via state.tempDraft
  state.tempDraft = currentWorkout;
  saveState();
}

function loadDraftWorkout() {
  if (state.tempDraft) currentWorkout = state.tempDraft;
}

$("#btnStart").addEventListener("click", () => {
  const templateId = $("#workoutTemplateSelect").value;
  const t = getTemplate(templateId);
  if (!t) return;

  const date = $("#workoutDate").value || todayISO();

  // Construire séance en cours à partir template
  const entries = t.items.map(it => {
    const ex = getExercise(it.exerciseId);
    const setsCount = Number(it.setsPlanned || 4);
    return {
      exerciseId: it.exerciseId,
      exerciseName: ex?.name ?? "Exercice",
      sets: Array.from({length: setsCount}, () => ({ weight:"", reps:"", done:false }))
    };
  });

  // Si template vide, proposer d’éditer
  if (entries.length === 0) {
    openModal(
      "Programme vide",
      `<div class="muted">Ton programme <b>${t.name}</b> n’a pas d’exercices. Ajoute-en dans <b>Programmes</b>.</div>`,
      `<button class="primary" id="goTemplates">OK</button>`
    );
    $("#goTemplates").addEventListener("click", () => {
      closeModal();
      document.querySelector('[data-tab="templates"]').click();
    });
    return;
  }

  currentWorkout = {
    id: uid(),
    date,
    templateId: t.id,
    templateName: t.name,
    entries
  };
  saveDraftWorkout();
  renderWorkoutArea();
});

$("#btnDiscard").addEventListener("click", () => {
  currentWorkout = null;
  delete state.tempDraft;
  saveState();
  renderWorkoutArea();
});

$("#btnFinish").addEventListener("click", () => {
  if (!currentWorkout) return;

  // Enregistrer dans logs
  state.logs.push(currentWorkout);

  // Supprimer draft
  delete state.tempDraft;
  saveState();

  currentWorkout = null;
  renderWorkoutArea();
  renderHistory();
  renderPRs();

  openModal(
    "Séance sauvegardée ✅",
    `<div class="muted">Bravo. Ta séance a été enregistrée en local.</div>`,
    `<button class="primary" id="okSaved">OK</button>`
  );
  $("#okSaved").addEventListener("click", closeModal);
});

// ---------------- Templates ----------------
function renderTemplates() {
  const list = $("#templatesList");
  list.innerHTML = "";

  state.templates.forEach(t => {
    const items = t.items.map(it => {
      const ex = getExercise(it.exerciseId);
      return `<div class="badge"><strong>${ex?.name ?? "?"}</strong> ${it.setsPlanned}x (${it.repTarget})</div>`;
    }).join(" ");

    list.insertAdjacentHTML("beforeend", `
      <div class="card">
        <div class="row">
          <div>
            <div class="h1">${t.name}</div>
            <div class="muted">${t.items.length} exercice(s)</div>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
            <button class="ghost" data-tt="edit" data-id="${t.id}">Éditer</button>
            <button class="danger" data-tt="del" data-id="${t.id}">Supprimer</button>
          </div>
        </div>
        <div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;">
          ${items || `<span class="muted">Ajoute des exercices.</span>`}
        </div>
      </div>
    `);
  });

  list.querySelectorAll("[data-tt]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const t = getTemplate(id);
      if (!t) return;
      if (btn.dataset.tt === "del") {
        openModal(
          "Supprimer programme",
          `<div class="muted">Supprimer <b>${t.name}</b> ? (Les logs existants ne seront pas supprimés.)</div>`,
          `<button class="ghost" id="cancelDelT">Annuler</button>
           <button class="danger" id="confirmDelT">Supprimer</button>`
        );
        $("#cancelDelT").addEventListener("click", closeModal);
        $("#confirmDelT").addEventListener("click", () => {
          state.templates = state.templates.filter(x => x.id !== id);
          saveState();
          closeModal();
          ensureTemplateSelect();
          renderTemplates();
        });
      } else {
        openTemplateEditor(t);
      }
    });
  });
}

function openTemplateEditor(t) {
  const exOptions = state.exercises.map(e => `<option value="${e.id}">${e.name} (${e.muscleGroup})</option>`).join("");

  const body = `
    <div class="row wrap">
      <label class="field grow">
        <span>Nom du programme</span>
        <input id="tplName" value="${t.name}" />
      </label>
      <div class="kpi">Exercices: ${t.items.length}</div>
    </div>

    <hr class="sep" />
    <div class="muted">Ajoute un exercice au programme :</div>
    <div class="row wrap" style="margin-top:10px;">
      <label class="field grow">
        <span>Exercice</span>
        <select id="tplExSel">${exOptions}</select>
      </label>
      <label class="field">
        <span>Séries</span>
        <input id="tplSets" inputmode="numeric" value="4" />
      </label>
      <label class="field">
        <span>Reps cibles</span>
        <input id="tplReps" value="8-12" />
      </label>
      <label class="field">
        <span>Repos (sec)</span>
        <input id="tplRest" inputmode="numeric" value="120" />
      </label>
      <button class="primary" id="tplAddItem">Ajouter</button>
    </div>

    <hr class="sep" />
    <div class="muted">Liste :</div>
    <div class="stack" id="tplItems"></div>
  `;

  const foot = `
    <button class="ghost" id="tplCancel">Fermer</button>
    <button class="primary" id="tplSave">Sauver</button>
  `;

  openModal(`Éditer: ${t.name}`, body, foot);

  function renderItems() {
    const box = $("#tplItems");
    box.innerHTML = "";
    t.items.forEach((it, idx) => {
      const ex = getExercise(it.exerciseId);
      box.insertAdjacentHTML("beforeend", `
        <div class="exerciseCard">
          <div class="row">
            <div>
              <div class="exerciseName">${ex?.name ?? "?"}</div>
              <div class="muted">${it.setsPlanned} séries • reps ${it.repTarget} • repos ${it.restSec}s</div>
            </div>
            <button class="danger" data-rm="${idx}">Retirer</button>
          </div>
        </div>
      `);
    });

    box.querySelectorAll("[data-rm]").forEach(b => {
      b.addEventListener("click", () => {
        const i = Number(b.dataset.rm);
        t.items.splice(i,1);
        renderItems();
      });
    });
  }

  renderItems();

  $("#tplAddItem").addEventListener("click", () => {
    const exerciseId = $("#tplExSel").value;
    const setsPlanned = Number($("#tplSets").value || 4);
    const repTarget = $("#tplReps").value || "8-12";
    const restSec = Number($("#tplRest").value || 120);
    t.items.push({ exerciseId, setsPlanned, repTarget, restSec });
    renderItems();
  });

  $("#tplCancel").addEventListener("click", closeModal);
  $("#tplSave").addEventListener("click", () => {
    t.name = $("#tplName").value.trim() || t.name;
    saveState();
    ensureTemplateSelect();
    renderTemplates();
    closeModal();
  });
}

$("#btnAddTemplate").addEventListener("click", () => {
  const body = `
    <label class="field">
      <span>Nom</span>
      <input id="newTplName" placeholder="Ex: Bras" />
    </label>
    <div class="small">Tu pourras ajouter les exercices juste après.</div>
  `;
  const foot = `
    <button class="ghost" id="cancelNewTpl">Annuler</button>
    <button class="primary" id="createNewTpl">Créer</button>
  `;
  openModal("Nouveau programme", body, foot);
  $("#cancelNewTpl").addEventListener("click", closeModal);
  $("#createNewTpl").addEventListener("click", () => {
    const name = $("#newTplName").value.trim();
    if (!name) return;
    state.templates.push({ id: uid(), name, items: [] });
    saveState();
    ensureTemplateSelect();
    renderTemplates();
    closeModal();
  });
});

// ---------------- Exercises ----------------
function renderExercises() {
  const list = $("#exercisesList");
  list.innerHTML = "";

  const filter = $("#exerciseFilter").value;
  const q = ($("#exerciseSearch").value || "").toLowerCase().trim();

  const exs = state.exercises
    .filter(e => !filter || e.muscleGroup === filter)
    .filter(e => !q || e.name.toLowerCase().includes(q));

  exs.forEach(e => {
    list.insertAdjacentHTML("beforeend", `
      <div class="exerciseHead">
  <div style="display:flex; gap:10px; align-items:center;">
    <img src="${svgIconData(e.iconKey || "default")}" alt=""
      style="width:46px;height:46px;border-radius:14px;
border:1px solid rgba(255,255,255,.14);
background:rgba(255,255,255,.07);
padding:8px; flex:0 0 auto;"
 />
    <div>
      <div class="exerciseName">${e.name}</div>
      <div class="muted">${e.muscleGroup}</div>
    </div>
  </div>

  <div style="display:flex; gap:8px;">
    <button class="ghost" data-ex="edit" data-id="${e.id}">Éditer</button>
    <button class="danger" data-ex="del" data-id="${e.id}">Suppr.</button>
  </div>
</div>


        ${e.notes ? `<div class="small" style="margin-top:10px;">📝 ${escapeHTML(e.notes)}</div>` : ""}
      </div>
    `);
  });

  list.querySelectorAll("[data-ex]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const e = getExercise(id);
      if (!e) return;
      if (btn.dataset.ex === "del") {
        openModal(
          "Supprimer exercice",
          `<div class="muted">Supprimer <b>${e.name}</b> ? (Il sera aussi retiré des programmes.)</div>`,
          `<button class="ghost" id="cancelDelE">Annuler</button>
           <button class="danger" id="confirmDelE">Supprimer</button>`
        );
        $("#cancelDelE").addEventListener("click", closeModal);
        $("#confirmDelE").addEventListener("click", () => {
          state.exercises = state.exercises.filter(x => x.id !== id);
          // retirer des templates
          state.templates.forEach(t => t.items = t.items.filter(it => it.exerciseId !== id));
          saveState();
          ensureTemplateSelect();
          renderTemplates();
          renderExercises();
          closeModal();
        });
      } else {
        openExerciseEditor(e);
      }
    });
  });
}

function openExerciseEditor(e) {
  const body = `
    <div class="row wrap">
      <label class="field grow">
        <span>Nom</span>
        <input id="exName" value="${e.name}" />
      </label>
      <label class="field">
        <span>Groupe</span>
        <select id="exGroup">
          ${groups.map(g => `<option ${g===e.muscleGroup?"selected":""}>${g}</option>`).join("")}
        </select>
      </label>
    </div>
    <label class="field" style="margin-top:10px;">
      <span>Notes</span>
      <textarea id="exNotes" placeholder="Cues techniques...">${e.notes || ""}</textarea>
    </label>
  `;
  const foot = `
    <button class="ghost" id="exCancel">Fermer</button>
    <button class="primary" id="exSave">Sauver</button>
  `;
  openModal("Éditer exercice", body, foot);
  $("#exCancel").addEventListener("click", closeModal);
  $("#exSave").addEventListener("click", () => {
    e.name = $("#exName").value.trim() || e.name;
    e.muscleGroup = $("#exGroup").value;
    e.notes = $("#exNotes").value || "";
    saveState();
    ensureTemplateSelect();
    renderExercises();
    closeModal();
  });
}

$("#btnAddExercise").addEventListener("click", () => {
  const body = `
    <div class="row wrap">
      <label class="field grow">
        <span>Nom</span>
        <input id="newExName" placeholder="Ex: Développé incliné haltères" />
      </label>
      <label class="field">
        <span>Groupe</span>
        <select id="newExGroup">
          ${groups.map(g => `<option>${g}</option>`).join("")}
        </select>
      </label>
    </div>
    <label class="field" style="margin-top:10px;">
      <span>Notes</span>
      <textarea id="newExNotes" placeholder="Cues techniques..."></textarea>
    </label>
  `;
  const foot = `
    <button class="ghost" id="cancelNewEx">Annuler</button>
    <button class="primary" id="createNewEx">Créer</button>
  `;
  openModal("Nouvel exercice", body, foot);
  $("#cancelNewEx").addEventListener("click", closeModal);
  $("#createNewEx").addEventListener("click", () => {
    const name = $("#newExName").value.trim();
    const muscleGroup = $("#newExGroup").value;
    const notes = $("#newExNotes").value || "";
    if (!name) return;
    state.exercises.push({ id: uid(), name, muscleGroup, notes });
    saveState();
    renderExercises();
    closeModal();
  });
});

$("#exerciseFilter").addEventListener("change", renderExercises);
$("#exerciseSearch").addEventListener("input", renderExercises);

// ---------------- History & PR ----------------
function renderPRs() {
  const prsBox = $("#prsList");
  const prs = computePRs();
  const items = state.exercises
    .map(e => ({ e, pr: prs.get(e.id) }))
    .filter(x => x.pr)
    .sort((a,b) => b.pr.weight - a.pr.weight);

  prsBox.innerHTML = `
    <div class="card">
      <div class="h1">Records (PR)</div>
      <div class="muted">${items.length} exercice(s) avec PR</div>
      <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
        ${items.slice(0, 30).map(x => `
          <div class="badge">
            <strong>${x.e.name}</strong> ${x.pr.weight}kg x ${x.pr.reps} (${x.pr.date})
          </div>
        `).join("") || `<span class="muted">Pas encore de PR.</span>`}
      </div>
    </div>
  `;
}

function renderHistory() {
  const list = $("#historyList");
  list.innerHTML = "";

  const logs = [...state.logs].sort((a,b) => b.date.localeCompare(a.date));
  if (logs.length === 0) {
    list.innerHTML = `<div class="card"><div class="muted">Aucun historique.</div></div>`;
    return;
  }

  logs.forEach(log => {
    const doneSets = log.entries.reduce((acc, e) => acc + e.sets.filter(s => s.done).length, 0);
    const totalSets = log.entries.reduce((acc, e) => acc + e.sets.length, 0);

    const lines = log.entries.map(e => {
      const best = e.sets
        .filter(s => s.done)
        .reduce((m,s) => {
          const w = Number(s.weight||0), r = Number(s.reps||0);
          if (!m) return {w,r};
          if (w > m.w || (w===m.w && r>m.r)) return {w,r};
          return m;
        }, null);
      return `<div class="muted">• <b>${e.exerciseName}</b> — meilleur: ${best ? `${best.w}kg x ${best.r}` : "—"}</div>`;
    }).join("");

    list.insertAdjacentHTML("beforeend", `
      <div class="card">
        <div class="row">
          <div>
            <div class="h1">${log.templateName}</div>
            <div class="muted">${log.date} • ${doneSets}/${totalSets} séries cochées</div>
          </div>
          <button class="danger" data-logdel="${log.id}">Suppr.</button>
        </div>
        <hr class="sep" />
        <div class="stack">${lines}</div>
      </div>
    `);
  });

  list.querySelectorAll("[data-logdel]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.logdel;
      openModal(
        "Supprimer séance",
        `<div class="muted">Supprimer cette séance de l’historique ?</div>`,
        `<button class="ghost" id="cancelDelLog">Annuler</button>
         <button class="danger" id="confirmDelLog">Supprimer</button>`
      );
      $("#cancelDelLog").addEventListener("click", closeModal);
      $("#confirmDelLog").addEventListener("click", () => {
        state.logs = state.logs.filter(l => l.id !== id);
        saveState();
        closeModal();
        renderHistory();
        renderPRs();
      });
    });
  });
}

$("#btnClearAll").addEventListener("click", () => {
  openModal(
    "Tout effacer",
    `<div class="muted">Ça efface <b>exercices</b>, <b>programmes</b> et <b>historique</b>. Irréversible.</div>`,
    `<button class="ghost" id="cancelWipe">Annuler</button>
     <button class="danger" id="confirmWipe">Effacer</button>`
  );
  $("#cancelWipe").addEventListener("click", closeModal);
  $("#confirmWipe").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    state = loadState();
    currentWorkout = null;
    delete state.tempDraft;
    saveState();
    closeModal();
    initUI();
  });
});

// ---------------- Import/Export ----------------
$("#btnExport").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `muscu_backup_${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

$("#btnImport").addEventListener("click", () => $("#importFile").click());
$("#importFile").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  try {
    const imported = JSON.parse(text);
    state = imported;
    saveState();
    currentWorkout = null;
    initUI();
    openModal("Import OK ✅", `<div class="muted">Données importées.</div>`, `<button class="primary" id="okImp">OK</button>`);
    $("#okImp").addEventListener("click", closeModal);
  } catch {
    openModal("Erreur import", `<div class="muted">Fichier JSON invalide.</div>`, `<button class="primary" id="okErr">OK</button>`);
    $("#okErr").addEventListener("click", closeModal);
  }
  e.target.value = "";
});

// ---------------- Utils ----------------
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

// ---------------- Render all ----------------
function renderAll() {
  ensureTemplateSelect();
  renderWorkoutArea();
  renderTemplates();
  renderExercises();
  renderPRs();
  renderHistory();
}

function initUI() {
  $("#workoutDate").value = todayISO();
  timerRemaining = Number($("#restPreset").value);
  updateTimerUI();
  loadDraftWorkout();
  renderAll();
}

initUI();
const splash = document.getElementById("splash");
const startBtn = document.getElementById("startApp");

if (startBtn) {
  startBtn.addEventListener("click", () => {
    splash.style.display = "none";
  });
}
