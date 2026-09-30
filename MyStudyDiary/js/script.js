// Diario de Estudio — Bitácora

// Utilidades de fecha (siempre hora local, nunca UTC)

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayKey() {
  return formatDateKey(new Date());
}

// Convertir "AAAA-MM-DD" en Date (siempre hora local, nunca UTC)
function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Formatear fecha larga en español: "lunes, 30 de septiembre"
function formatDateLong(dateKey) {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// Cargar y guardar sesiones en localStorage

function loadSessions() {
  const data = localStorage.getItem("study-sessions");
  return data ? JSON.parse(data) : [];
}

function saveSessions(sessions) {
  localStorage.setItem("study-sessions", JSON.stringify(sessions));
}

// Calcular total de minutos esta semana (lunes a domingo)

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = domingo, 1 = lunes, ...
  const diff = day === 0 ? -6 : 1 - day; // ajustar para empezar en lunes
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calculateWeeklyMinutes(sessions) {
  const startOfWeek = getStartOfWeek(new Date());
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return sessions
    .filter((s) => {
      const sessionDate = parseDateKey(s.date);
      return sessionDate >= startOfWeek && sessionDate <= today;
    })
    .reduce((total, s) => total + s.minutes, 0);
}

function updateWeeklyMinutes() {
  const sessions = loadSessions();
  const totalMinutes = calculateWeeklyMinutes(sessions);

  let display;
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    display = mins > 0 ? `${hours} h ${mins} min` : `${hours} h`;
  } else {
    display = `${totalMinutes} min`;
  }

  document.getElementById("weekly-minutes").textContent = display;
}

// Calcular total de días estudiados este mes

function calculateMonthlyDays(sessions) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const daysThisMonth = new Set();

  for (const session of sessions) {
    const sessionDate = parseDateKey(session.date);
    if (
      sessionDate.getFullYear() === currentYear &&
      sessionDate.getMonth() === currentMonth
    ) {
      daysThisMonth.add(session.date);
    }
  }

  return daysThisMonth.size;
}

function updateMonthlyDays() {
  const sessions = loadSessions();
  const days = calculateMonthlyDays(sessions);
  document.getElementById("monthly-days").textContent =
    `${days} ${days === 1 ? "día" : "días"}`;
}

// Calcular racha actual

function calculateStreak(sessions) {
  if (sessions.length === 0) return 0;

  const daySet = new Set(sessions.map((s) => s.date));

  // La racha viva termina hoy o ayer (si hoy aún no he estudiado)
  let currentDate = new Date();
  if (!daySet.has(getTodayKey())) {
    currentDate.setDate(currentDate.getDate() - 1);
    // Si ayer tampoco hay sesión, la racha está rota
    if (!daySet.has(formatDateKey(currentDate))) {
      return 0;
    }
  }

  let streak = 0;
  while (daySet.has(formatDateKey(currentDate))) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

// Calcular mejor racha histórica

function calculateBestStreak(sessions) {
  if (sessions.length === 0) return 0;

  const daySet = new Set(sessions.map((s) => s.date));
  const sortedDays = [...daySet].sort();

  let bestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = parseDateKey(sortedDays[i - 1]);
    const currDate = parseDateKey(sortedDays[i]);

    // Verificar si son días consecutivos
    const diffTime = currDate.getTime() - prevDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return bestStreak;
}

function updateBestStreak() {
  const sessions = loadSessions();
  const bestStreak = calculateBestStreak(sessions);
  document.getElementById("best-streak").textContent = bestStreak;
}

// Renderizar la lista de sesiones (más reciente primero)

function renderSessions(sessions) {
  const list = document.getElementById("sessions-list");
  list.innerHTML = "";

  const sorted = [...sessions].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.id - a.id;
  });

  for (const session of sorted) {
    const entry = document.createElement("div");
    entry.className = "session-entry";

    const infoDiv = document.createElement("div");
    infoDiv.className = "session-info";

    const topicDiv = document.createElement("div");
    topicDiv.className = "session-topic";
    topicDiv.textContent = session.topic;

    const detailsDiv = document.createElement("div");
    detailsDiv.className = "session-details";
    detailsDiv.innerHTML = `<i class="fas fa-calendar"></i>${formatDateLong(session.date)} · ${session.minutes} min`;

    infoDiv.appendChild(topicDiv);
    infoDiv.appendChild(detailsDiv);

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "session-actions";

    const editBtn = document.createElement("button");
    editBtn.innerHTML = '<i class="fas fa-pen"></i>';
    editBtn.title = "Editar sesión";
    editBtn.addEventListener("click", () => editSession(session.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = "Eliminar sesión";
    deleteBtn.className = "delete";
    deleteBtn.addEventListener("click", () => deleteSession(session.id));

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    entry.appendChild(infoDiv);
    entry.appendChild(actionsDiv);
    list.appendChild(entry);
  }
}

// Actualizar racha en pantalla

let lastStreak = 0;

function updateStreak() {
  const sessions = loadSessions();
  const streak = calculateStreak(sessions);
  const streakEl = document.getElementById("streak");
  streakEl.textContent = streak;

  // Animación solo si la racha aumentó
  if (streak > lastStreak) {
    streakEl.classList.remove("pop");
    void streakEl.offsetWidth; // forzar reflow
    streakEl.classList.add("pop");
  }
  lastStreak = streak;
}

// Editar sesión

let editingSessionId = null;
let editModal = null;

function editSession(id) {
  const sessions = loadSessions();
  const session = sessions.find((s) => s.id === id);
  if (!session) return;

  editingSessionId = id;

  document.getElementById("edit-date").value = session.date;
  document.getElementById("edit-topic").value = session.topic;
  document.getElementById("edit-minutes").value = session.minutes;

  editModal.show();
}

function saveEdit() {
  if (!editingSessionId) return;

  const date = document.getElementById("edit-date").value;
  const topic = document.getElementById("edit-topic").value.trim();
  const minutes = parseInt(document.getElementById("edit-minutes").value, 10);

  if (!date || !topic || isNaN(minutes) || minutes <= 0) return;

  const sessions = loadSessions();
  const index = sessions.findIndex((s) => s.id === editingSessionId);
  if (index === -1) return;

  sessions[index] = {
    ...sessions[index],
    date: date,
    topic: topic,
    minutes: minutes,
  };

  saveSessions(sessions);
  updateStreak();
  updateBestStreak();
  updateWeeklyMinutes();
  updateMonthlyDays();
  renderSessions(sessions);

  editModal.hide();
  editingSessionId = null;
}

// Eliminar sesión

function deleteSession(id) {
  const sessions = loadSessions();
  const session = sessions.find((s) => s.id === id);
  if (!session) return;

  const confirmed = confirm(
    `¿Eliminar la sesión "${session.topic}" del ${session.date}?`,
  );
  if (!confirmed) return;

  const filtered = sessions.filter((s) => s.id !== id);
  saveSessions(filtered);
  updateStreak();
  updateBestStreak();
  updateWeeklyMinutes();
  updateMonthlyDays();
  renderSessions(filtered);
}

// Inicializar

document.addEventListener("DOMContentLoaded", function () {
  // Fecha por defecto: hoy
  document.getElementById("date").value = getTodayKey();

  // Inicializar modal de edición
  editModal = new bootstrap.Modal(document.getElementById("edit-modal"));

  // Cargar datos guardados
  updateStreak();
  updateBestStreak();
  updateWeeklyMinutes();
  updateMonthlyDays();
  renderSessions(loadSessions());

  // Enviar formulario
  document
    .getElementById("session-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const date = document.getElementById("date").value;
      const topic = document.getElementById("topic").value.trim();
      const minutes = parseInt(document.getElementById("minutes").value, 10);

      if (!date || !topic || isNaN(minutes) || minutes <= 0) return;

      const sessions = loadSessions();
      sessions.push({
        id: Date.now(),
        date: date,
        topic: topic,
        minutes: minutes,
      });
      saveSessions(sessions);

      updateStreak();
      updateBestStreak();
      updateWeeklyMinutes();
      updateMonthlyDays();
      renderSessions(sessions);

      // Limpiar solo tema y minutos
      document.getElementById("topic").value = "";
      document.getElementById("minutes").value = "";
    });

  // Guardar edición
  document.getElementById("save-edit").addEventListener("click", saveEdit);
});
