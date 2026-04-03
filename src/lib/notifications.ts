export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    return reg;
  } catch {
    return null;
  }
}

export function showBrowserNotification(title: string, body: string, url = "/") {
  if (Notification.permission !== "granted") return;
  const n = new Notification(title, {
    body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
  });
  n.onclick = () => {
    window.focus();
    window.location.href = url;
    n.close();
  };
  // Auto close after 8 seconds
  setTimeout(() => n.close(), 8000);
}

// Schedule daily notifications using setTimeout
// Fires when current time matches the target time
export function scheduleDailyNotification(
  hour: number,
  minute: number,
  title: string,
  body: string,
  url = "/"
) {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);

  // If time already passed today, schedule for tomorrow
  if (target <= now) target.setDate(target.getDate() + 1);

  const delay = target.getTime() - now.getTime();

  setTimeout(() => {
    showBrowserNotification(title, body, url);
    // Re-schedule for next day
    scheduleDailyNotification(hour, minute, title, body, url);
  }, delay);
}

// Check reminders every minute and fire notification if time matches
export function startReminderChecker(
  reminders: { id: string; title: string; description?: string; type: string; time: string; completed: boolean }[]
) {
  const check = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    reminders.forEach((r) => {
      if (r.completed) return;
      if (r.time === currentTime) {
        const emoji = {
          MEDICATION: "💊",
          HYDRATION: "💧",
          TASK: "✅",
          APPOINTMENT: "📅",
          EXERCISE: "🏃",
        }[r.type] || "🔔";

        showBrowserNotification(
          `${emoji} ${r.title}`,
          r.description || "Time for your reminder!",
          "/reminders"
        );

        // Also speak it
        if ("speechSynthesis" in window) {
          const u = new SpeechSynthesisUtterance(
            `Reminder: ${r.title}. ${r.description || ""}`
          );
          u.rate = 0.85;
          window.speechSynthesis.speak(u);
        }
      }
    });
  };

  // Check immediately then every 60 seconds
  check();
  return setInterval(check, 60000);
}