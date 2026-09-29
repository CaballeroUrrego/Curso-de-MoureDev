// Diario de Estudio - Custom JavaScript

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

// Cargar y guardar sesiones en localStorage

function loadSessions() {
  const data = localStorage.getItem("study-sessions");
  return data ? JSON.parse(data) : [];
}

function saveSessions(sessions) {
  localStorage.setItem("study-sessions", JSON.stringify(sessions));
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

// Renderizar la lista de sesiones (más reciente primero)

function renderSessions(sessions) {
  const list = document.getElementById("sessions-list");
  list.innerHTML = "";

  const sorted = [...sessions].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.id - a.id;
  });

  for (const session of sorted) {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";

    const topicSpan = document.createElement("span");
    topicSpan.className = "session-topic";
    topicSpan.textContent = session.topic;

    const detailsSpan = document.createElement("span");
    detailsSpan.className = "session-details";
    detailsSpan.textContent = `${session.date} · ${session.minutes} min`;

    li.appendChild(topicSpan);
    li.appendChild(detailsSpan);
    list.appendChild(li);
  }
}

// Actualizar racha en pantalla

function updateStreak() {
  const sessions = loadSessions();
  const streak = calculateStreak(sessions);
  document.getElementById("streak").textContent = streak;
}

// Inicializar

document.addEventListener("DOMContentLoaded", function () {
  // Fecha por defecto: hoy
  document.getElementById("date").value = getTodayKey();

  // Cargar datos guardados
  updateStreak();
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
      renderSessions(sessions);

      // Limpiar solo tema y minutos
      document.getElementById("topic").value = "";
      document.getElementById("minutes").value = "";
    });
});
