import { factories } from "@strapi/strapi";
import type { Context } from "koa";

const IOS_STORE_URL =
  process.env.IOS_APP_STORE_URL ?? "https://apps.apple.com/app/myd17";
const ANDROID_STORE_URL =
  process.env.ANDROID_PLAY_STORE_URL ??
  "https://play.google.com/store/apps/details?id=io.github.stawex.myd17";

function isMobileUA(ua: string): boolean {
  return /Android|iPhone|iPad|iPod/i.test(ua);
}

function mobileRedirectHtml(documentId: string, title: string): string {
  const deepLink = `myd17://post/${documentId}`;
  const androidIntent = `intent://post/${documentId}#Intent;scheme=myd17;package=io.github.stawex.myd17;end`;
  const escapedTitle = title.replace(/[<>"&]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", '"': "&quot;", "&": "&amp;" })[c]!
  );
  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapedTitle} – MyD17</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; flex-direction: column;
           align-items: center; justify-content: center; min-height: 100vh; margin: 0;
           background: #f0f7ff; color: #1a1a1a; text-align: center; padding: 24px; box-sizing: border-box; }
    h1 { font-size: 1.2rem; margin-bottom: 8px; }
    p  { color: #555; font-size: 0.9rem; }
    .spinner { width: 40px; height: 40px; border: 4px solid #cce3fb;
               border-top-color: #208AEF; border-radius: 50%;
               animation: spin 0.8s linear infinite; margin: 24px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .btn { display: inline-block; margin-top: 20px; padding: 12px 28px;
           background: #208AEF; color: #fff; border-radius: 10px;
           font-size: 1rem; font-weight: 600; text-decoration: none; }
    .store-link { color: #208AEF; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <h1>${escapedTitle}</h1>
  <p>Jeśli aplikacja nie otworzyła się automatycznie, kliknij poniżej.</p>
  <a id="open-btn" href="${deepLink}" class="btn">Otwórz w aplikacji</a>
  <p style="margin-top:24px">
    Nie masz jeszcze aplikacji?
    <a id="store-link" href="#" class="store-link">Pobierz tutaj</a>
  </p>
  <script>
    var ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    var android = /Android/.test(navigator.userAgent);

    document.getElementById('store-link').href = ios ? '${IOS_STORE_URL}' : '${ANDROID_STORE_URL}';
    document.getElementById('open-btn').href = android ? '${androidIntent}' : '${deepLink}';

    if (!android) {
      window.location.href = '${deepLink}';
    }
  </script>
</body>
</html>`;
}

function desktopDownloadHtml(title: string): string {
  const escapedTitle = title.replace(/[<>"&]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", '"': "&quot;", "&": "&amp;" })[c]!
  );
  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapedTitle} – MyD17</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; flex-direction: column;
           align-items: center; justify-content: center; min-height: 100vh; margin: 0;
           background: #f0f7ff; color: #1a1a1a; text-align: center; padding: 24px; }
    h1 { font-size: 1.4rem; margin-bottom: 8px; }
    p  { color: #555; font-size: 0.95rem; max-width: 400px; }
    .buttons { display: flex; gap: 16px; margin-top: 32px; flex-wrap: wrap; justify-content: center; }
    a { display: inline-block; padding: 12px 24px; border-radius: 10px; font-weight: 600;
        font-size: 0.95rem; text-decoration: none; background: #208AEF; color: #fff; }
    a:hover { background: #1a75cc; }
  </style>
</head>
<body>
  <h1>${escapedTitle}</h1>
  <p>Ten post jest dostępny w aplikacji mobilnej MyD17 dla Twojego wydziału.</p>
  <div class="buttons">
    <a href="${IOS_STORE_URL}">App Store</a>
    <a href="${ANDROID_STORE_URL}">Google Play</a>
  </div>
</body>
</html>`;
}

export default factories.createCoreController(
  "api::post.post",
  ({ strapi }) => ({
    async share(ctx: Context) {
      const { documentId } = ctx.params as { documentId: string };

      const post = await strapi.documents("api::post.post").findOne({
        documentId,
        fields: ["title", "websiteUrl"],
        status: "published",
      });

      if (!post) {
        ctx.status = 404;
        ctx.body = "Not found";
        return;
      }

      const ua = (ctx.request.headers["user-agent"] as string) ?? "";
      const title = post.title as string;
      const websiteUrl = post.websiteUrl as string | undefined;

      ctx.type = "text/html; charset=utf-8";

      if (!isMobileUA(ua)) {
        if (websiteUrl) {
          ctx.redirect(websiteUrl);
          return;
        }
        ctx.body = desktopDownloadHtml(title);
        return;
      }

      ctx.body = mobileRedirectHtml(documentId, title);
    },
  })
);
