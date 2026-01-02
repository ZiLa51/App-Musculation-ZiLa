/* Muscu Offline - PWA - 100% local */
const STORAGE_KEY = "muscu_offline_v1";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const groups = ["Bras","Pecs","Dos","Jambes","Épaules","Abdos"];

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
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
      // Tu peux en mettre quelques-uns par défaut si tu veux
      { id: uid(), name: "Développé couché", muscleGroup: "Pecs", notes: "" },
      { id: uid(), name: "Tractions", muscleGroup: "Dos", notes: "" },
      { id: uid(), name: "Squat", muscleGroup: "Jambes", notes: "" },
      { id: uid(), name: "Développé militaire", muscleGroup: "Épaules", notes: "" },
      { id: uid(), name: "Curl biceps", muscleGroup: "Bras", notes: "" },
      { id: uid(), name: "Crunch", muscleGroup: "Abdos", notes: "" }
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
      <div class="exerciseCard">
        <div class="exerciseHead">
          <div>
            <div class="exerciseName">${e.name}</div>
            <div class="muted">${e.muscleGroup}</div>
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
