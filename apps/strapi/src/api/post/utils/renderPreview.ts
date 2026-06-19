import { escape } from "./postUtils";

type Block = { __component: string; [key: string]: unknown };

const DAY_PL: Record<string, string> = {
  monday: "Poniedziałek",
  tuesday: "Wtorek",
  wednesday: "Środa",
  thursday: "Czwartek",
  friday: "Piątek",
  saturday: "Sobota",
  sunday: "Niedziela",
};

const VARIANT_LABEL: Record<string, string> = {
  normal: "",
  phone: "📞",
  email: "✉️",
  link: "🔗",
  copy: "📋",
};

function roomLabel(raw: string): string {
  const room = raw.startsWith("s") ? raw.slice(1) : raw;
  return `Budynek D-17, Sala ${room}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderBlock(block: Block): string {
  switch (block.__component) {
    case "content.section-title":
      return `<h3 class="section-title">${escape(String(block.content ?? ""))}</h3>`;

    case "content.text":
      return `<p class="text-block">${escape(String(block.content ?? "")).replace(/\n/g, "<br>")}</p>`;

    case "content.location": {
      const raw = String(block.content ?? "");
      return `
        <div class="info-card">
          <div class="info-row">
            <span class="info-icon">📍</span>
            <div class="info-text">
              <span class="info-label">Lokalizacja</span>
              <span class="info-value">${escape(roomLabel(raw))}</span>
            </div>
          </div>
        </div>`;
    }

    case "content.event-date-time": {
      const start = String(block.startDateTime ?? "");
      const end = block.endDateTime ? String(block.endDateTime) : null;
      let range = "";
      if (start) {
        const startD = new Date(start);
        const sameDay =
          end &&
          new Date(start).toDateString() === new Date(end).toDateString();
        range = end
          ? sameDay
            ? `${formatDate(start)}, ${formatTime(start)} – ${formatTime(end)}`
            : `${formatDate(start)}, ${formatTime(start)} – ${formatDate(end)}, ${formatTime(end)}`
          : `${formatDate(start)}, ${formatTime(start)}`;
      }
      return `
        <div class="info-card">
          <div class="info-row">
            <span class="info-icon">🕐</span>
            <div class="info-text">
              <span class="info-label">Kiedy</span>
              <span class="info-value">${escape(range)}</span>
            </div>
          </div>
        </div>`;
    }

    case "content.chip": {
      const title = escape(String(block.title ?? ""));
      const content = escape(String(block.content ?? ""));
      const variant = String(block.variant ?? "normal");
      const prefix = VARIANT_LABEL[variant] ?? "";
      return `
        <div class="info-card">
          <div class="info-row">
            <span class="info-icon">${prefix || "ℹ️"}</span>
            <div class="info-text">
              <span class="info-label">${title}</span>
              <span class="info-value">${content}</span>
            </div>
          </div>
        </div>`;
    }

    case "content.calendar": {
      const entries =
        (block.entries as Array<{
          withDate?: boolean;
          day?: string;
          date?: string;
          startTime?: string;
          endTime?: string;
        }>) ?? [];
      if (!entries.length) return "";
      const rows = entries
        .map((e) => {
          const label =
            e.withDate && e.date
              ? formatDate(e.date)
              : (DAY_PL[e.day ?? ""] ?? e.day ?? "");
          const time = [e.startTime, e.endTime].filter(Boolean).join(" – ");
          return `<tr><td class="cal-day">${escape(label)}</td><td class="cal-time">${escape(time)}</td></tr>`;
        })
        .join("");
      return `
        <div class="info-card">
          <table class="cal-table">
            <thead><tr><th>Dzień</th><th>Godziny</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }

    default:
      return "";
  }
}

export function renderPreviewHtml(
  title: string,
  blocks: Block[],
  status: "draft" | "published",
): string {
  const safeTitle = escape(title);
  const statusLabel = status === "published" ? "Opublikowany" : "Szkic";
  const statusColor = status === "published" ? "#22C55E" : "#F59E0B";
  const blocksHtml = blocks.map(renderBlock).join("\n");

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Podgląd – ${safeTitle}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #0F1829;
      color: #fff;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px;
      gap: 24px;
    }

    .header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-align: center;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      background: color-mix(in srgb, ${statusColor} 20%, transparent);
      color: ${statusColor};
      border: 1px solid color-mix(in srgb, ${statusColor} 40%, transparent);
    }

    .doc-title {
      font-size: 22px;
      font-weight: 700;
      color: #fff;
    }

    .phone {
      background: #212C3F;
      border-radius: 32px;
      padding: 28px 20px 40px;
      width: 100%;
      max-width: 390px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 20px 80px rgba(0,0,0,0.6);
    }

    .section-title {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: #85B9E5;
      padding-top: 4px;
    }

    .text-block {
      font-size: 14px;
      line-height: 1.6;
      color: #fff;
    }

    .info-card {
      background: linear-gradient(135deg, #0F1829, #212C3F);
      border-radius: 16px;
      padding: 14px 16px;
      border: 1px solid rgba(255,255,255,0.07);
    }

    .info-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .info-icon {
      font-size: 18px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .info-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .info-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: #4977BB;
    }

    .info-value {
      font-size: 13px;
      font-weight: 500;
      color: #fff;
      line-height: 1.4;
    }

    .cal-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .cal-table th {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: #4977BB;
      text-align: left;
      padding-bottom: 8px;
    }

    .cal-table td {
      padding: 6px 0;
      border-top: 1px solid rgba(255,255,255,0.07);
      color: #fff;
    }

    .cal-day { font-weight: 500; padding-right: 16px; }
    .cal-time { color: #85B9E5; }

    .empty {
      color: rgba(255,255,255,0.4);
      font-size: 14px;
      text-align: center;
      padding: 24px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="status-badge">${statusLabel}</span>
    <h1 class="doc-title">${safeTitle}</h1>
  </div>
  <div class="phone">
    ${blocksHtml || '<p class="empty">Brak bloków treści.</p>'}
  </div>
</body>
</html>`;
}
