"use strict";

const STORAGE_KEY = "lea-ops-console-state-v1";

const state = loadState();
let activeCaseId = "";
let databaseStatus = "localStorage fallback";

const els = {
  viewTitle: document.getElementById("viewTitle"),
  navItems: document.querySelectorAll(".nav-item"),
  views: document.querySelectorAll(".view"),
  metricGrid: document.getElementById("metricGrid"),
  priorityList: document.getElementById("priorityList"),
  statusChart: document.getElementById("statusChart"),
  recentActivity: document.getElementById("recentActivity"),
  caseForm: document.getElementById("caseForm"),
  caseType: document.getElementById("caseType"),
  subject: document.getElementById("subject"),
  location: document.getElementById("location"),
  contact: document.getElementById("contact"),
  summary: document.getElementById("summary"),
  riskDanger: document.getElementById("riskDanger"),
  riskVulnerable: document.getElementById("riskVulnerable"),
  riskEvidence: document.getElementById("riskEvidence"),
  riskVerified: document.getElementById("riskVerified"),
  scorePreview: document.getElementById("scorePreview"),
  scoreReason: document.getElementById("scoreReason"),
  caseSearch: document.getElementById("caseSearch"),
  caseStatusFilter: document.getElementById("caseStatusFilter"),
  caseSort: document.getElementById("caseSort"),
  caseCount: document.getElementById("caseCount"),
  caseList: document.getElementById("caseList"),
  evidenceForm: document.getElementById("evidenceForm"),
  evidenceCase: document.getElementById("evidenceCase"),
  evidenceType: document.getElementById("evidenceType"),
  evidenceLabel: document.getElementById("evidenceLabel"),
  receivedFrom: document.getElementById("receivedFrom"),
  evidenceDescription: document.getElementById("evidenceDescription"),
  evidenceCount: document.getElementById("evidenceCount"),
  evidenceList: document.getElementById("evidenceList"),
  taskForm: document.getElementById("taskForm"),
  taskCase: document.getElementById("taskCase"),
  taskText: document.getElementById("taskText"),
  taskOwner: document.getElementById("taskOwner"),
  taskDue: document.getElementById("taskDue"),
  taskBoard: document.getElementById("taskBoard"),
  personForm: document.getElementById("personForm"),
  personName: document.getElementById("personName"),
  personRole: document.getElementById("personRole"),
  personCase: document.getElementById("personCase"),
  personContact: document.getElementById("personContact"),
  personNotes: document.getElementById("personNotes"),
  peopleSearch: document.getElementById("peopleSearch"),
  peopleRoleFilter: document.getElementById("peopleRoleFilter"),
  peopleSort: document.getElementById("peopleSort"),
  peopleCount: document.getElementById("peopleCount"),
  peopleList: document.getElementById("peopleList"),
  briefOutput: document.getElementById("briefOutput"),
  auditList: document.getElementById("auditList"),
  dbStatus: document.getElementById("dbStatus"),
  dbStats: document.getElementById("dbStats"),
  dbBackupBtn: document.getElementById("dbBackupBtn"),
  dbImportBtn: document.getElementById("dbImportBtn"),
  dbImportFile: document.getElementById("dbImportFile"),
  dbCompactBtn: document.getElementById("dbCompactBtn"),
  dbSearch: document.getElementById("dbSearch"),
  dbSearchResults: document.getElementById("dbSearchResults"),
  caseModal: document.getElementById("caseModal"),
  modalBody: document.getElementById("modalBody"),
  modalTitle: document.getElementById("modalTitle"),
  closeModal: document.getElementById("closeModal"),
  seedBtn: document.getElementById("seedBtn"),
  exportBtn: document.getElementById("exportBtn"),
  printBtn: document.getElementById("printBtn"),
  clearBtn: document.getElementById("clearBtn"),
  copyBriefBtn: document.getElementById("copyBriefBtn"),
  toast: document.getElementById("toast")
};

function defaultState() {
  return {
    cases: [],
    evidence: [],
    tasks: [],
    people: [],
    audit: []
  };
}

function loadState() {
  try {
    return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (window.LeaDatabase) {
    window.LeaDatabase.save(state).catch(() => {
      databaseStatus = "localStorage fallback";
      renderDatabase();
    });
  }
}

function normalizeState(value) {
  const base = defaultState();
  return {
    ...base,
    ...(value || {}),
    cases: Array.isArray(value && value.cases) ? value.cases : base.cases,
    evidence: Array.isArray(value && value.evidence) ? value.evidence : base.evidence,
    tasks: Array.isArray(value && value.tasks) ? value.tasks : base.tasks,
    people: Array.isArray(value && value.people) ? value.people : base.people,
    audit: Array.isArray(value && value.audit) ? value.audit : base.audit
  };
}

function replaceState(nextState) {
  const normalized = normalizeState(nextState);
  Object.assign(state, normalized);
}

function id(prefix) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function logAudit(action, detail) {
  state.audit.unshift({
    id: id("AUD"),
    at: new Date().toISOString(),
    action,
    detail
  });
  state.audit = state.audit.slice(0, 150);
}

function caseCode(item) {
  const date = new Date(item.createdAt).toISOString().slice(0, 10).replaceAll("-", "");
  return `CID-${date}-${item.id.slice(-6).toUpperCase()}`;
}

function evidenceCode(item) {
  return `EVD-${item.id.slice(-6).toUpperCase()}`;
}

function priorityLabel(score) {
  if (score >= 80) return { text: "Urgent", className: "urgent" };
  if (score >= 50) return { text: "High", className: "high" };
  return { text: "Normal", className: "normal" };
}

function calculateScore() {
  let score = 20;
  const reasons = ["base 20"];
  if (els.caseType.value === "Missing person") {
    score += 15;
    reasons.push("missing person +15");
  }
  if (els.riskDanger.checked) {
    score += 30;
    reasons.push("immediate risk +30");
  }
  if (els.riskVulnerable.checked) {
    score += 20;
    reasons.push("vulnerable person +20");
  }
  if (els.riskEvidence.checked) {
    score += 15;
    reasons.push("time-sensitive evidence +15");
  }
  if (els.riskVerified.checked) {
    score += 5;
    reasons.push("verifiable detail +5");
  }
  return { score: Math.min(score, 100), reasons };
}

function updateScorePreview() {
  const result = calculateScore();
  els.scorePreview.textContent = result.score;
  els.scoreReason.textContent = result.reasons.join(", ");
}

function setView(viewName) {
  els.navItems.forEach(item => item.classList.toggle("active", item.dataset.view === viewName));
  els.views.forEach(view => view.classList.toggle("active", view.id === `${viewName}View`));
  const active = document.getElementById(`${viewName}View`);
  els.viewTitle.textContent = active ? active.dataset.title : "Dashboard";
  render();
}

function countsBy(items, key) {
  return items.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});
}

function renderMetrics() {
  const openCases = state.cases.filter(item => item.status !== "Closed").length;
  const urgent = state.cases.filter(item => item.score >= 80 && item.status !== "Closed").length;
  const openTasks = state.tasks.filter(item => item.status !== "Done").length;
  const evidenceItems = state.evidence.length;
  const metrics = [
    ["Total cases", state.cases.length],
    ["Urgent open cases", urgent],
    ["Open follow-ups", openTasks],
    ["Evidence items", evidenceItems],
    ["Directory records", state.people.length]
  ];
  if (!openCases && state.cases.length) metrics[1][1] = 0;
  els.metricGrid.innerHTML = metrics.map(([label, value]) => `
    <div class="metric"><span>${label}</span><strong>${value}</strong></div>
  `).join("");
}

function renderDashboard() {
  const priority = [...state.cases]
    .filter(item => item.status !== "Closed")
    .sort((a, b) => b.score - a.score || new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  els.priorityList.innerHTML = priority.length ? priority.map(item => {
    const label = priorityLabel(item.score);
    return `<article class="compact-item">
      <div class="record-head">
        <div><h4>${escapeHtml(item.subject)}</h4><div class="record-meta"><span>${caseCode(item)}</span><span>${escapeHtml(item.type)}</span></div></div>
        <span class="pill ${label.className}">${label.text} ${item.score}</span>
      </div>
    </article>`;
  }).join("") : `<div class="empty">No open priority cases.</div>`;

  const statusCounts = countsBy(state.cases, "status");
  const maxCount = Math.max(1, ...Object.values(statusCounts));
  els.statusChart.innerHTML = ["Open", "Assigned", "Review", "Closed"].map(status => {
    const count = statusCounts[status] || 0;
    const width = Math.max(4, Math.round((count / maxCount) * 100));
    return `<div class="bar-row"><span>${status}</span><div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div><strong>${count}</strong></div>`;
  }).join("");

  renderAuditInto(els.recentActivity, state.audit.slice(0, 8));
}

function filteredCases() {
  const query = els.caseSearch.value.trim().toLowerCase();
  const status = els.caseStatusFilter.value;
  const filtered = state.cases.filter(item => {
    const haystack = [item.type, item.subject, item.location, item.contact, item.summary, item.assignedTo].join(" ").toLowerCase();
    return (status === "All" || item.status === status) && haystack.includes(query);
  });
  if (els.caseSort.value === "newest") {
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  if (els.caseSort.value === "oldest") {
    return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }
  return filtered.sort((a, b) => b.score - a.score || new Date(b.createdAt) - new Date(a.createdAt));
}

function renderCases() {
  const cases = filteredCases();
  els.caseCount.textContent = `${cases.length} cases`;
  els.caseList.innerHTML = cases.length ? cases.map(item => {
    const label = priorityLabel(item.score);
    return `<article class="record">
      <div class="record-head">
        <div>
          <h4>${escapeHtml(item.subject)}</h4>
          <div class="record-meta">
            <span>${caseCode(item)}</span>
            <span>${escapeHtml(item.type)}</span>
            <span>${escapeHtml(item.location || "Unknown location")}</span>
            <span>${new Date(item.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <span class="pill ${label.className}">${label.text} ${item.score}</span>
      </div>
      <p>${escapeHtml(item.summary)}</p>
      <div class="record-meta">
        <span>Status: ${escapeHtml(item.status)}</span>
        <span>Assigned: ${escapeHtml(item.assignedTo || "Unassigned")}</span>
        <span>Evidence: ${state.evidence.filter(evd => evd.caseId === item.id).length}</span>
        <span>Tasks: ${state.tasks.filter(task => task.caseId === item.id && task.status !== "Done").length} open</span>
      </div>
      <div class="record-actions">
        <button class="btn small" data-action="view-case" data-id="${item.id}" type="button">Open workspace</button>
        <button class="btn small" data-action="assign-case" data-id="${item.id}" type="button">Assign</button>
        <button class="btn small" data-action="review-case" data-id="${item.id}" type="button">Send review</button>
        <button class="btn small" data-action="close-case" data-id="${item.id}" type="button">Close</button>
      </div>
    </article>`;
  }).join("") : `<div class="empty">No cases match your filters.</div>`;
}

function renderCaseOptions() {
  const options = state.cases.length
    ? state.cases.map(item => `<option value="${item.id}">${caseCode(item)} - ${escapeHtml(item.subject)}</option>`).join("")
    : `<option value="">Create a case first</option>`;
  els.evidenceCase.innerHTML = options;
  els.taskCase.innerHTML = options;
  els.personCase.innerHTML = `<option value="">No linked case</option>${state.cases.map(item => `<option value="${item.id}">${caseCode(item)} - ${escapeHtml(item.subject)}</option>`).join("")}`;
}

function renderEvidence() {
  renderCaseOptions();
  els.evidenceCount.textContent = `${state.evidence.length} items`;
  els.evidenceList.innerHTML = state.evidence.length ? state.evidence.map(item => {
    const linkedCase = state.cases.find(caseItem => caseItem.id === item.caseId);
    return `<article class="record">
      <div class="record-head">
        <div>
          <h4>${escapeHtml(item.label)}</h4>
          <div class="record-meta">
            <span>${evidenceCode(item)}</span>
            <span>${escapeHtml(item.type)}</span>
            <span>${linkedCase ? caseCode(linkedCase) : "Unlinked"}</span>
            <span>${new Date(item.receivedAt).toLocaleString()}</span>
          </div>
        </div>
        <span class="pill info">Logged</span>
      </div>
      <p>${escapeHtml(item.description)}</p>
      <div class="record-meta">
        <span>Received from: ${escapeHtml(item.receivedFrom)}</span>
        <span>Custody: ${escapeHtml(item.custody.join(" -> "))}</span>
      </div>
    </article>`;
  }).join("") : `<div class="empty">No evidence has been logged.</div>`;
}

function renderTasks() {
  renderCaseOptions();
  const columns = ["Todo", "In progress", "Done"];
  els.taskBoard.innerHTML = columns.map(status => {
    const tasks = state.tasks.filter(task => task.status === status);
    return `<section class="kanban-col">
      <h4>${status} (${tasks.length})</h4>
      <div class="kanban-list">
        ${tasks.length ? tasks.map(task => {
          const linkedCase = state.cases.find(item => item.id === task.caseId);
          return `<article class="kanban-card">
            <h4>${escapeHtml(task.text)}</h4>
            <div class="record-meta">
              <span>${linkedCase ? caseCode(linkedCase) : "No case"}</span>
              <span>${escapeHtml(task.owner || "Unassigned")}</span>
              <span>${task.due || "No due date"}</span>
            </div>
            <div class="record-actions">
              ${status !== "Todo" ? `<button class="btn small" data-action="task-back" data-id="${task.id}" type="button">Back</button>` : ""}
              ${status !== "Done" ? `<button class="btn small" data-action="task-next" data-id="${task.id}" type="button">Advance</button>` : ""}
            </div>
          </article>`;
        }).join("") : `<div class="empty">No tasks.</div>`}
      </div>
    </section>`;
  }).join("");
}

function filteredPeople() {
  const query = els.peopleSearch.value.trim().toLowerCase();
  const role = els.peopleRoleFilter.value;
  const people = state.people.filter(item => {
    const haystack = [item.name, item.role, item.contact, item.notes].join(" ").toLowerCase();
    return (role === "All" || item.role === role) && haystack.includes(query);
  });
  if (els.peopleSort.value === "name") {
    return people.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (els.peopleSort.value === "role") {
    return people.sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name));
  }
  return people.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderPeople() {
  renderCaseOptions();
  const people = filteredPeople();
  els.peopleCount.textContent = `${people.length} records`;
  els.peopleList.innerHTML = people.length ? people.map(item => {
    const linkedCase = state.cases.find(caseItem => caseItem.id === item.caseId);
    return `<article class="record">
      <div class="record-head">
        <div>
          <h4>${escapeHtml(item.name)}</h4>
          <div class="record-meta">
            <span>${escapeHtml(item.role)}</span>
            <span>${linkedCase ? caseCode(linkedCase) : "No linked case"}</span>
            <span>${new Date(item.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <span class="pill info">Directory</span>
      </div>
      <p>${escapeHtml(item.notes || "No notes recorded.")}</p>
      <div class="record-meta">
        <span>Contact: ${escapeHtml(item.contact || "Not provided")}</span>
      </div>
      <div class="record-actions">
        <button class="btn small" data-action="delete-person" data-id="${item.id}" type="button">Remove</button>
      </div>
    </article>`;
  }).join("") : `<div class="empty">No directory records match your filters.</div>`;
}

function buildBrief() {
  const openCases = state.cases.filter(item => item.status !== "Closed");
  const urgent = openCases.filter(item => item.score >= 80);
  const overdue = state.tasks.filter(task => task.status !== "Done" && task.due && new Date(task.due) < new Date());
  const topCases = [...openCases].sort((a, b) => b.score - a.score).slice(0, 5);
  return [
    "LEA OPERATIONS BRIEF",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    `Open cases: ${openCases.length}`,
    `Urgent cases: ${urgent.length}`,
    `Open tasks: ${state.tasks.filter(task => task.status !== "Done").length}`,
    `Evidence items logged: ${state.evidence.length}`,
    `Directory records: ${state.people.length}`,
    `Overdue tasks: ${overdue.length}`,
    "",
    "Top priority cases:",
    ...(topCases.length ? topCases.map(item => `- ${caseCode(item)} | ${item.subject} | ${item.status} | score ${item.score}`) : ["- None"]),
    "",
    "Immediate supervisor checks:",
    "- Confirm urgent cases have a named owner.",
    "- Confirm evidence entries include source, custody, and storage notes.",
    "- Confirm overdue follow-ups are reassigned or closed with reason."
  ].join("\n");
}

function renderReports() {
  els.briefOutput.textContent = buildBrief();
}

function databaseSnapshotStats() {
  const text = JSON.stringify(state);
  return [
    ["Storage engine", databaseStatus],
    ["Cases", state.cases.length],
    ["Evidence", state.evidence.length],
    ["Tasks", state.tasks.length],
    ["People/entities", state.people.length],
    ["Audit entries", state.audit.length],
    ["Approx. size", `${new Blob([text]).size.toLocaleString()} bytes`],
    ["Last saved", state.savedAt ? new Date(state.savedAt).toLocaleString() : "Current session"]
  ];
}

function searchDatabase() {
  const query = els.dbSearch.value.trim().toLowerCase();
  if (!query) return [];
  const results = [];
  state.cases.forEach(item => {
    const text = [caseCode(item), item.type, item.subject, item.location, item.summary, item.assignedTo].join(" ");
    if (text.toLowerCase().includes(query)) results.push({ type: "Case", title: item.subject, meta: caseCode(item), detail: item.summary });
  });
  state.evidence.forEach(item => {
    const linked = state.cases.find(caseItem => caseItem.id === item.caseId);
    const text = [evidenceCode(item), item.type, item.label, item.receivedFrom, item.description].join(" ");
    if (text.toLowerCase().includes(query)) results.push({ type: "Evidence", title: item.label, meta: linked ? caseCode(linked) : evidenceCode(item), detail: item.description });
  });
  state.tasks.forEach(item => {
    const linked = state.cases.find(caseItem => caseItem.id === item.caseId);
    const text = [item.text, item.owner, item.status, item.due].join(" ");
    if (text.toLowerCase().includes(query)) results.push({ type: "Task", title: item.text, meta: linked ? caseCode(linked) : item.status, detail: `${item.status} - ${item.owner || "Unassigned"}` });
  });
  state.people.forEach(item => {
    const text = [item.name, item.role, item.contact, item.notes].join(" ");
    if (text.toLowerCase().includes(query)) results.push({ type: "Directory", title: item.name, meta: item.role, detail: item.notes || item.contact });
  });
  state.audit.forEach(item => {
    const text = [item.action, item.detail].join(" ");
    if (text.toLowerCase().includes(query)) results.push({ type: "Audit", title: item.action, meta: new Date(item.at).toLocaleString(), detail: item.detail });
  });
  return results.slice(0, 30);
}

function renderDatabase() {
  els.dbStatus.textContent = databaseStatus;
  els.dbStats.innerHTML = databaseSnapshotStats().map(([label, value]) => `
    <div class="database-stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>
  `).join("");
  const results = searchDatabase();
  els.dbSearchResults.innerHTML = els.dbSearch.value.trim()
    ? results.map(item => `<article class="record">
        <div class="record-head">
          <div><h4>${escapeHtml(item.title)}</h4><div class="record-meta"><span>${escapeHtml(item.type)}</span><span>${escapeHtml(item.meta)}</span></div></div>
        </div>
        <p>${escapeHtml(item.detail)}</p>
      </article>`).join("") || `<div class="empty">No database records match that search.</div>`
    : `<div class="empty">Search across cases, evidence, tasks, people, and audit entries.</div>`;
}

function renderAuditInto(container, entries) {
  container.innerHTML = entries.length ? entries.map(item => `
    <article class="timeline-item">
      <strong>${escapeHtml(item.action)}</strong>
      <p>${escapeHtml(item.detail)}</p>
      <div class="record-meta"><span>${new Date(item.at).toLocaleString()}</span></div>
    </article>
  `).join("") : `<div class="empty">No audit entries yet.</div>`;
}

function renderAudit() {
  renderAuditInto(els.auditList, state.audit);
}

function render() {
  renderMetrics();
  renderDashboard();
  renderCases();
  renderEvidence();
  renderTasks();
  renderPeople();
  renderReports();
  renderAudit();
  renderDatabase();
}

function createCase(event) {
  event.preventDefault();
  const scoreData = calculateScore();
  const item = {
    id: id("CASE"),
    createdAt: new Date().toISOString(),
    type: els.caseType.value,
    subject: els.subject.value.trim(),
    location: els.location.value.trim(),
    contact: els.contact.value.trim(),
    summary: els.summary.value.trim(),
    risks: {
      danger: els.riskDanger.checked,
      vulnerable: els.riskVulnerable.checked,
      evidence: els.riskEvidence.checked,
      verified: els.riskVerified.checked
    },
    score: scoreData.score,
    status: "Open",
    assignedTo: "",
    notes: [`Scoring: ${scoreData.reasons.join(", ")}`]
  };
  state.cases.unshift(item);
  logAudit("Case created", `${caseCode(item)} - ${item.subject}`);
  saveState();
  els.caseForm.reset();
  updateScorePreview();
  render();
  showToast("Case created.");
}

function addEvidence(event) {
  event.preventDefault();
  if (!els.evidenceCase.value) {
    showToast("Create a case before logging evidence.");
    return;
  }
  const item = {
    id: id("EVD"),
    caseId: els.evidenceCase.value,
    type: els.evidenceType.value,
    label: els.evidenceLabel.value.trim(),
    receivedFrom: els.receivedFrom.value.trim(),
    description: els.evidenceDescription.value.trim(),
    receivedAt: new Date().toISOString(),
    custody: ["Intake desk"]
  };
  state.evidence.unshift(item);
  const linked = state.cases.find(caseItem => caseItem.id === item.caseId);
  logAudit("Evidence logged", `${evidenceCode(item)} linked to ${linked ? caseCode(linked) : "unknown case"}`);
  saveState();
  els.evidenceForm.reset();
  render();
  showToast("Evidence logged.");
}

function addTask(event) {
  event.preventDefault();
  if (!els.taskCase.value) {
    showToast("Create a case before adding a task.");
    return;
  }
  const item = {
    id: id("TASK"),
    caseId: els.taskCase.value,
    text: els.taskText.value.trim(),
    owner: els.taskOwner.value.trim(),
    due: els.taskDue.value,
    status: "Todo",
    createdAt: new Date().toISOString()
  };
  state.tasks.unshift(item);
  const linked = state.cases.find(caseItem => caseItem.id === item.caseId);
  logAudit("Task added", `${item.text} for ${linked ? caseCode(linked) : "unknown case"}`);
  saveState();
  els.taskForm.reset();
  render();
  showToast("Task added.");
}

function updateCase(idValue, changes, auditAction) {
  let changedCase;
  state.cases = state.cases.map(item => {
    if (item.id !== idValue) return item;
    changedCase = { ...item, ...changes };
    return changedCase;
  });
  if (changedCase) {
    logAudit(auditAction, `${caseCode(changedCase)} - ${changedCase.subject}`);
    saveState();
    render();
  }
}

function showCase(idValue) {
  const item = state.cases.find(caseItem => caseItem.id === idValue);
  if (!item) return;
  activeCaseId = idValue;
  const label = priorityLabel(item.score);
  const evd = state.evidence.filter(entry => entry.caseId === item.id);
  const tasks = state.tasks.filter(task => task.caseId === item.id);
  const people = state.people.filter(person => person.caseId === item.id);
  els.modalTitle.textContent = `${caseCode(item)} - ${item.subject}`;
  els.modalBody.innerHTML = `
    <div class="detail-grid">
      <strong>Priority</strong><span><span class="pill ${label.className}">${label.text} ${item.score}</span></span>
      <strong>Status</strong><span>${escapeHtml(item.status)}</span>
      <strong>Assigned</strong><span>${escapeHtml(item.assignedTo || "Unassigned")}</span>
      <strong>Type</strong><span>${escapeHtml(item.type)}</span>
      <strong>Location</strong><span>${escapeHtml(item.location || "Unknown")}</span>
      <strong>Contact</strong><span>${escapeHtml(item.contact || "Not provided")}</span>
      <strong>Created</strong><span>${new Date(item.createdAt).toLocaleString()}</span>
    </div>
    <section><h4>Reported facts</h4><p>${escapeHtml(item.summary)}</p></section>
    <section><h4>Evidence (${evd.length})</h4>${evd.length ? evd.map(entry => `<p>${evidenceCode(entry)} - ${escapeHtml(entry.label)}</p>`).join("") : "<p>No evidence linked.</p>"}</section>
    <section><h4>Tasks (${tasks.length})</h4>${tasks.length ? tasks.map(task => `<p>${escapeHtml(task.status)} - ${escapeHtml(task.text)}</p>`).join("") : "<p>No tasks linked.</p>"}</section>
    <section><h4>People & entities (${people.length})</h4>${people.length ? people.map(person => `<p>${escapeHtml(person.role)} - ${escapeHtml(person.name)}</p>`).join("") : "<p>No directory records linked.</p>"}</section>
    <section><h4>Notes</h4>${item.notes.map(note => `<p>${escapeHtml(note)}</p>`).join("")}</section>
    <form class="note-form" id="noteForm">
      <input id="noteInput" maxlength="180" placeholder="Add case note">
      <button class="btn primary" type="submit">Add note</button>
    </form>
  `;
  els.caseModal.classList.add("open");
}

function addPerson(event) {
  event.preventDefault();
  const item = {
    id: id("PER"),
    createdAt: new Date().toISOString(),
    name: els.personName.value.trim(),
    role: els.personRole.value,
    caseId: els.personCase.value,
    contact: els.personContact.value.trim(),
    notes: els.personNotes.value.trim()
  };
  state.people.unshift(item);
  logAudit("Directory record saved", `${item.role} - ${item.name}`);
  saveState();
  els.personForm.reset();
  render();
  showToast("Directory record saved.");
}

function addCaseNote(event) {
  if (event.target.id !== "noteForm") return;
  event.preventDefault();
  const input = document.getElementById("noteInput");
  const note = input.value.trim();
  if (!note) return;
  state.cases = state.cases.map(item => {
    if (item.id !== activeCaseId) return item;
    return { ...item, notes: [...item.notes, `${note} (${new Date().toLocaleString()})`] };
  });
  const updated = state.cases.find(item => item.id === activeCaseId);
  logAudit("Case note added", updated ? caseCode(updated) : "Case note");
  saveState();
  render();
  showCase(activeCaseId);
  showToast("Note added.");
}

function advanceTask(taskId, direction) {
  const order = ["Todo", "In progress", "Done"];
  let taskName = "";
  state.tasks = state.tasks.map(task => {
    if (task.id !== taskId) return task;
    taskName = task.text;
    const index = order.indexOf(task.status);
    const next = Math.max(0, Math.min(order.length - 1, index + direction));
    return { ...task, status: order[next] };
  });
  logAudit("Task status updated", taskName);
  saveState();
  render();
}

function seedData() {
  const now = Date.now();
  const caseA = {
    id: id("CASE"),
    createdAt: new Date(now - 1000 * 60 * 48).toISOString(),
    type: "Missing person",
    subject: "Welfare check request",
    location: "North bus terminal",
    contact: "Family reporter",
    summary: "Reporter states the subject missed two scheduled check-ins and was last seen near the terminal. Recent photo and clothing details are available.",
    risks: { danger: true, vulnerable: false, evidence: true, verified: true },
    score: 85,
    status: "Open",
    assignedTo: "Duty supervisor",
    notes: ["Photo requested from reporter.", "Transit camera preservation window noted."]
  };
  const caseB = {
    id: id("CASE"),
    createdAt: new Date(now - 1000 * 60 * 160).toISOString(),
    type: "Cyber fraud tip",
    subject: "Payment link impersonation",
    location: "Online",
    contact: "reporter@example.gov",
    summary: "Reporter received a payment link using a department-like name. Screenshots and email headers are available for preservation.",
    risks: { danger: false, vulnerable: false, evidence: true, verified: true },
    score: 55,
    status: "Assigned",
    assignedTo: "Cyber desk",
    notes: ["Reporter advised not to click additional links."]
  };
  state.cases = [caseA, caseB];
  state.evidence = [
    {
      id: id("EVD"),
      caseId: caseB.id,
      type: "Digital artifact",
      label: "Email header and screenshot set",
      receivedFrom: "Reporter",
      description: "Screenshots and full email header preserved as submitted by reporter.",
      receivedAt: new Date(now - 1000 * 60 * 120).toISOString(),
      custody: ["Intake desk", "Cyber desk"]
    }
  ];
  state.tasks = [
    { id: id("TASK"), caseId: caseA.id, text: "Confirm last-known clothing and photo", owner: "Duty desk", due: new Date(now + 86400000).toISOString().slice(0, 10), status: "In progress", createdAt: new Date().toISOString() },
    { id: id("TASK"), caseId: caseB.id, text: "Preserve submitted email headers", owner: "Cyber desk", due: new Date(now + 172800000).toISOString().slice(0, 10), status: "Todo", createdAt: new Date().toISOString() }
  ];
  state.people = [
    {
      id: id("PER"),
      createdAt: new Date(now - 1000 * 60 * 44).toISOString(),
      name: "Family reporter",
      role: "Reporter",
      caseId: caseA.id,
      contact: "Callback on file",
      notes: "Available for confirmation call after 18:00."
    },
    {
      id: id("PER"),
      createdAt: new Date(now - 1000 * 60 * 130).toISOString(),
      name: "Cyber desk",
      role: "Officer or unit",
      caseId: caseB.id,
      contact: "Internal unit queue",
      notes: "Assigned for digital evidence preservation."
    },
    {
      id: id("PER"),
      createdAt: new Date(now - 1000 * 60 * 110).toISOString(),
      name: "Transit operations office",
      role: "Partner agency",
      caseId: caseA.id,
      contact: "Operations desk",
      notes: "Potential source for camera preservation request."
    }
  ];
  state.audit = [];
  logAudit("Demo data loaded", "Seeded two cases, one evidence entry, two tasks, and three directory records.");
  saveState();
  render();
  showToast("Demo data loaded.");
}

function exportJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `lea-ops-console-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("JSON export downloaded.");
}

function downloadBackup() {
  exportJson();
}

function importBackupFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      replaceState(imported);
      logAudit("Backup imported", `Imported ${file.name}`);
      saveState();
      render();
      showToast("Backup imported into the local database.");
    } catch {
      showToast("Import failed. Use a valid LEA Ops JSON backup.");
    }
  };
  reader.readAsText(file);
}

function runIntegrityCheck() {
  const caseIds = new Set(state.cases.map(item => item.id));
  const orphanEvidence = state.evidence.filter(item => !caseIds.has(item.caseId)).length;
  const orphanTasks = state.tasks.filter(item => !caseIds.has(item.caseId)).length;
  const orphanPeople = state.people.filter(item => item.caseId && !caseIds.has(item.caseId)).length;
  logAudit("Integrity check completed", `${orphanEvidence} orphan evidence, ${orphanTasks} orphan tasks, ${orphanPeople} orphan directory records.`);
  saveState();
  render();
  showToast("Integrity check completed.");
}

async function copyBrief() {
  try {
    await navigator.clipboard.writeText(buildBrief());
    showToast("Brief copied.");
  } catch {
    showToast("Clipboard unavailable. Select and copy the brief manually.");
  }
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2600);
}

els.navItems.forEach(item => item.addEventListener("click", () => setView(item.dataset.view)));
document.querySelectorAll("[data-view-jump]").forEach(button => {
  button.addEventListener("click", () => setView(button.dataset.viewJump));
});

els.caseForm.addEventListener("submit", createCase);
els.evidenceForm.addEventListener("submit", addEvidence);
els.taskForm.addEventListener("submit", addTask);
els.modalBody.addEventListener("submit", addCaseNote);
els.closeModal.addEventListener("click", () => els.caseModal.classList.remove("open"));
els.caseModal.addEventListener("click", event => {
  if (event.target === els.caseModal) els.caseModal.classList.remove("open");
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") els.caseModal.classList.remove("open");
});

["input", "change"].forEach(eventName => {
  els.caseForm.addEventListener(eventName, updateScorePreview);
  els.caseSearch.addEventListener(eventName, renderCases);
  els.caseStatusFilter.addEventListener(eventName, renderCases);
  els.caseSort.addEventListener(eventName, renderCases);
});

els.caseList.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const idValue = button.dataset.id;
  if (button.dataset.action === "view-case") showCase(idValue);
  if (button.dataset.action === "assign-case") {
    const assignedTo = prompt("Assign to officer or unit:", "Duty desk");
    if (assignedTo !== null) updateCase(idValue, { status: "Assigned", assignedTo: assignedTo.trim() }, "Case assigned");
  }
  if (button.dataset.action === "review-case") updateCase(idValue, { status: "Review" }, "Case moved to review");
  if (button.dataset.action === "close-case") updateCase(idValue, { status: "Closed" }, "Case closed");
});

els.taskBoard.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  if (button.dataset.action === "task-next") advanceTask(button.dataset.id, 1);
  if (button.dataset.action === "task-back") advanceTask(button.dataset.id, -1);
});

els.seedBtn.addEventListener("click", seedData);
els.exportBtn.addEventListener("click", exportJson);
els.printBtn.addEventListener("click", () => window.print());
els.copyBriefBtn.addEventListener("click", copyBrief);
els.clearBtn.addEventListener("click", () => {
  if (!confirm("Reset all demo data in this browser?")) return;
  Object.assign(state, defaultState());
  saveState();
  render();
  showToast("Demo data reset.");
});

updateScorePreview();
render();
