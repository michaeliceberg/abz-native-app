// src/utils/helpers.ts
export function isConcreteMaterial(material: string): boolean {
  if (!material) return false;
  const lower = material.toLowerCase();
  const concreteMarkers = [
    "бст",
    "бсм",
    "бетон",
    "раствор",
    "в25",
    "в30",
    "f200",
    "f300",
  ];
  for (const marker of concreteMarkers) {
    if (lower.includes(marker)) return true;
  }
  return false;
}

// src/utils/helpers.ts

export function getDateKey(dateStr: string): string {
  if (!dateStr) return "Неизвестно";

  // Пробуем разные форматы
  let date: Date;

  // Формат ISO: "2026-07-07T14:08:00"
  if (dateStr.includes("T")) {
    date = new Date(dateStr);
  } else {
    // Формат "ДД.ММ.ГГГГ ЧЧ:ММ:СС"
    const parts = dateStr.split(" ");
    const dateParts = parts[0].split(".");
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const year = parseInt(dateParts[2], 10);
      date = new Date(year, month, day);
    } else {
      date = new Date(dateStr);
    }
  }

  if (isNaN(date.getTime())) {
    return "Неизвестно";
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

export function formatTime(dateStr: string): string {
  if (!dateStr) return "--:--";

  let date: Date;

  if (dateStr.includes("T")) {
    date = new Date(dateStr);
  } else {
    const parts = dateStr.split(" ");
    if (parts.length > 1) {
      const timeParts = parts[1].split(":");
      const dateParts = parts[0].split(".");
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const year = parseInt(dateParts[2], 10);
        const hours = parseInt(timeParts[0], 10) || 0;
        const minutes = parseInt(timeParts[1], 10) || 0;
        date = new Date(year, month, day, hours, minutes);
      } else {
        date = new Date(dateStr);
      }
    } else {
      date = new Date(dateStr);
    }
  }

  if (isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
