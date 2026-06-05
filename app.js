const relationshipStart = new Date(2026, 1, 10);
const storageKey = "coLifePlanner.web.plans";
const members = { jeff: "Jeff", wife: "My Wife" };

const icons = {
  appointment: "📅",
  medication: "💊",
  birthday: "🎁",
  chore: "✓",
  meal: "🍽",
  reminder: "♥"
};

const starterPlans = [
  {
    id: crypto.randomUUID(),
    title: "Morning medication",
    type: "medication",
    date: dateKey(new Date()),
    time: "08:00",
    people: ["jeff"],
    repeat: true,
    notes: "Take with breakfast.",
    doneDates: []
  },
  {
    id: crypto.randomUUID(),
    title: "Plan something sweet together",
    type: "reminder",
    date: dateKey(new Date()),
    time: "19:30",
    people: ["jeff", "wife"],
    repeat: false,
    notes: "Small plans count too.",
    doneDates: []
  },
  {
    id: crypto.randomUUID(),
    title: "Relationship anniversary",
    type: "birthday",
    date: "2026-02-10",
    time: "09:00",
    people: ["jeff", "wife"],
    repeat: false,
    notes: "Started our story on 10-02-2026.",
    doneDates: []
  }
];

let plans = loadPlans();
let selectedDate = dateKey(new Date());

const views = {
  today: document.querySelector("#todayView"),
  calendar: document.querySelector("#calendarView"),
  routines: document.querySelector("#routinesView"),
  home: document.querySelector("#homeView")
};

const dialog = document.querySelector("#planDialog");
const form = document.querySelector("#planForm");
const calendarDate = document.querySelector("#calendarDate");

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

document.querySelector("#addToday").addEventListener("click", () => openDialog(dateKey(new Date()), false));
document.querySelector("#addCalendar").addEventListener("click", () => openDialog(selectedDate, false));
document.querySelector("#addRoutine").addEventListener("click", () => openDialog(dateKey(new Date()), true));

calendarDate.value = selectedDate;
calendarDate.addEventListener("change", () => {
  selectedDate = calendarDate.value;
  render();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const people = [];
  if (document.querySelector("#forJeff").checked) people.push("jeff");
  if (document.querySelector("#forWife").checked) people.push("wife");

  plans.push({
    id: crypto.randomUUID(),
    title: document.querySelector("#titleInput").value.trim(),
    type: document.querySelector("#typeInput").value,
    date: document.querySelector("#dateInput").value,
    time: document.querySelector("#timeInput").value,
    people: people.length ? people : ["jeff", "wife"],
    repeat: document.querySelector("#repeatInput").checked,
    notes: document.querySelector("#notesInput").value.trim(),
    doneDates: []
  });

  savePlans();
  dialog.close();
  form.reset();
  render();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js");
  });
}

render();

function loadPlans() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || starterPlans;
  } catch {
    return starterPlans;
  }
}

function savePlans() {
  localStorage.setItem(storageKey, JSON.stringify(plans));
}

function showView(name) {
  Object.entries(views).forEach(([key, element]) => {
    element.classList.toggle("active", key === name);
  });
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === name);
  });
}

function openDialog(defaultDate, routine) {
  form.reset();
  document.querySelector("#dateInput").value = defaultDate;
  document.querySelector("#timeInput").value = routine ? "08:00" : currentTime();
  document.querySelector("#repeatInput").checked = routine;
  document.querySelector("#typeInput").value = routine ? "medication" : "appointment";
  document.querySelector("#forJeff").checked = true;
  document.querySelector("#forWife").checked = true;
  dialog.showModal();
  document.querySelector("#titleInput").focus();
}

function render() {
  renderDaysTogether();
  renderLists();
  renderStats();
}

function renderDaysTogether() {
  const today = new Date();
  const diff = Math.floor((stripTime(today) - stripTime(relationshipStart)) / 86400000);
  document.querySelector("#daysTogether").textContent = Math.max(diff, 0);
}

function renderLists() {
  renderPlanList("#todayList", plansForDate(dateKey(new Date())));
  renderPlanList("#calendarList", plansForDate(selectedDate), selectedDate);
  renderPlanList("#routineList", plans.filter((plan) => plan.repeat || plan.type === "medication" || plan.type === "chore"));
}

function renderStats() {
  const todayPlans = plansForDate(dateKey(new Date()));
  document.querySelector("#todayCount").textContent = todayPlans.length;
  document.querySelector("#doneCount").textContent = todayPlans.filter((plan) => isDone(plan, dateKey(new Date()))).length;
  document.querySelector("#togetherCount").textContent = todayPlans.filter((plan) => plan.people.length > 1).length;
  document.querySelector("#jeffCount").textContent = `${plans.filter((plan) => plan.people.includes("jeff")).length} plans`;
  document.querySelector("#wifeCount").textContent = `${plans.filter((plan) => plan.people.includes("wife")).length} plans`;
}

function renderPlanList(selector, items, day = dateKey(new Date())) {
  const list = document.querySelector(selector);
  const sorted = [...items].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  if (!sorted.length) {
    list.innerHTML = `<div class="empty">Nothing here yet. Add one small plan for both of you.</div>`;
    return;
  }

  list.innerHTML = "";
  sorted.forEach((plan) => {
    const card = document.createElement("article");
    const done = isDone(plan, day);
    card.className = `plan-card${done ? " done" : ""}`;
    card.innerHTML = `
      <div class="plan-icon">${icons[plan.type] || "♥"}</div>
      <div>
        <strong>${escapeHtml(plan.title)}</strong>
        <small>${plan.time} - ${peopleText(plan.people)}${plan.repeat ? " - daily" : ""}</small>
      </div>
      <button class="done-button" aria-label="Mark done">${done ? "✓" : ""}</button>
    `;
    card.querySelector("button").addEventListener("click", () => toggleDone(plan.id, day));
    list.appendChild(card);
  });
}

function plansForDate(day) {
  return plans.filter((plan) => plan.date === day || plan.repeat);
}

function toggleDone(id, day) {
  plans = plans.map((plan) => {
    if (plan.id !== id) return plan;
    const doneDates = new Set(plan.doneDates || []);
    if (doneDates.has(day)) {
      doneDates.delete(day);
    } else {
      doneDates.add(day);
    }
    return { ...plan, doneDates: [...doneDates] };
  });
  savePlans();
  render();
}

function isDone(plan, day) {
  return (plan.doneDates || []).includes(day);
}

function peopleText(people) {
  if (people.length > 1) return "Together";
  return members[people[0]] || "Together";
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function currentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}
