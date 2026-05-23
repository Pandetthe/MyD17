import { factories } from "@strapi/strapi";

const IOS_STORE_URL =
  process.env.IOS_APP_STORE_URL ?? "https://apps.apple.com/app/myd17";
const ANDROID_STORE_URL =
  process.env.ANDROID_PLAY_STORE_URL ??
  "https://play.google.com/store/apps/details?id=io.github.stawex.myd17";

function isMobileUA(ua: string): boolean {
  return /Android|iPhone|iPad|iPod/i.test(ua);
}

function isIosUA(ua: string): boolean {
  return /iPhone|iPad|iPod/i.test(ua);
}

function escape(str: string): string {
  return str.replace(
    /[<>"&]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", '"': "&quot;", "&": "&amp;" })[c]!,
  );
}

function ogMeta(
  title: string,
  description: string,
  imageUrl: string | null,
  pageUrl: string,
): string {
  const safeTitle = escape(title);
  const safeDesc = escape(description);
  return `
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:url" content="${escape(pageUrl)}" />
  ${imageUrl ? `<meta property="og:image" content="${escape(imageUrl)}" />` : ""}
  <meta name="twitter:card" content="${imageUrl ? "summary_large_image" : "summary"}" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  ${imageUrl ? `<meta name="twitter:image" content="${escape(imageUrl)}" />` : ""}`;
}

const APPLE_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>`;
const GPLAY_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0"><path d="M3.18 23.76c.3.17.65.22 1.02.16l12.86-7.43-2.76-2.75zm-1.67-20.5C1.19 3.67 1 4.12 1 4.69v14.62c0 .57.19 1.02.51 1.34l.07.07 8.19-8.19v-.19zm18.98 8.94-2.78-1.61-3.1 3.1 3.1 3.1 2.8-1.62c.8-.46.8-1.5-.02-1.97M4.2.08 17.06 7.5l-2.76 2.76L3.18.24C3.5.18 3.87.23 4.2.08z"/></svg>`;

function mobileRedirectHtml(
  documentId: string,
  title: string,
  description: string,
  imageUrl: string | null,
  pageUrl: string,
  isIos: boolean,
): string {
  const iosDeepLink = `myd17://post/${documentId}`;
  const androidDeepLink = `intent://post/${documentId}#Intent;scheme=myd17;package=io.github.stawex.myd17;S.browser_fallback_url=${encodeURIComponent(ANDROID_STORE_URL)};end`;
  const deepLink = isIos ? iosDeepLink : androidDeepLink;
  const storeUrl = isIos ? IOS_STORE_URL : ANDROID_STORE_URL;
  const storeIcon = isIos ? APPLE_SVG : GPLAY_SVG;
  const storeName = isIos ? "App Store" : "Google Play";
  const safeTitle = escape(title);

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle} – MyD17</title>
  ${ogMeta(title, description, imageUrl, pageUrl)}
  <style>
    body { font-family: system-ui, sans-serif; display: flex; flex-direction: column;
           align-items: center; justify-content: center; min-height: 100vh; margin: 0;
           background: #f0f7ff; color: #1a1a1a; text-align: center; padding: 24px; box-sizing: border-box; }
    h1 { font-size: 1.2rem; margin-bottom: 8px; }
    p  { color: #555; font-size: 0.9rem; }
    .spinner { width: 40px; height: 40px; border: 4px solid #cce3fb;
               border-top-color: #208AEF; border-radius: 50%;
               animation: spin 0.8s linear infinite; margin: 16px auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fallback { display: flex; flex-direction: column; align-items: center; }
    .btn { display: inline-flex; align-items: center; gap: 8px; margin-top: 20px; padding: 12px 28px;
           background: #208AEF; color: #fff; border-radius: 10px;
           font-size: 1rem; font-weight: 600; text-decoration: none; }
    .store-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px;
                 background: #1a1a1a; color: #fff; border-radius: 10px;
                 font-size: 0.9rem; font-weight: 600; text-decoration: none; margin-top: 12px; }
    .store-label { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2; }
    .store-sub { font-size: 0.7rem; font-weight: 400; opacity: .8; }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <h1>${safeTitle}</h1>
  <p>Otwieranie w aplikacji MyD17...</p>
  <div class="fallback" id="fallback">
    <p>Jeśli aplikacja nie otworzyła się automatycznie:</p>
    <a href="${escape(deepLink)}" class="btn">Otwórz w aplikacji</a>
    <p style="margin-top:24px">Nie masz jeszcze aplikacji?</p>
    <a href="${escape(storeUrl)}" class="store-btn">
      ${storeIcon}
      <span class="store-label">
        <span class="store-sub">Pobierz z</span>
        ${storeName}
      </span>
    </a>
  </div>
  <script>
    var deepLink = '${deepLink.replace(/'/g, "\\'")}';
    var storeUrl = '${storeUrl}';
    var isIos = ${isIos};

    function hideSpinner() {
      document.querySelector('.spinner').style.display = 'none';
    }

    function tryOpenApp() {
      if (isIos) {
        var start = Date.now();
        window.location.href = deepLink;
        setTimeout(function() {
          hideSpinner();
          if (Date.now() - start < 2000) {
            window.location.href = storeUrl;
          }
        }, 1500);
      } else {
        window.location.href = deepLink;
        setTimeout(hideSpinner, 2000);
      }
    }

    window.addEventListener('load', function() {
      setTimeout(tryOpenApp, 100);
    });
  </script>
</body>
</html>`;
}

function desktopDownloadHtml(
  title: string,
  description: string,
  imageUrl: string | null,
  pageUrl: string,
): string {
  const safeTitle = escape(title);
  const safeDesc = escape(description);
  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle} – MyD17</title>
  ${ogMeta(title, description, imageUrl, pageUrl)}
  <style>
    body { font-family: system-ui, sans-serif; display: flex; flex-direction: column;
           align-items: center; justify-content: center; min-height: 100vh; margin: 0;
           background: #f0f7ff; color: #1a1a1a; text-align: center; padding: 24px; }
    h1 { font-size: 1.4rem; margin-bottom: 8px; }
    p  { color: #555; font-size: 0.95rem; max-width: 400px; }
    .buttons { display: flex; gap: 16px; margin-top: 32px; flex-wrap: wrap; justify-content: center; }
    .store-btn { display: inline-flex; align-items: center; gap: 10px; padding: 12px 24px;
                 border-radius: 10px; font-weight: 600; font-size: 0.95rem;
                 text-decoration: none; background: #1a1a1a; color: #fff; }
    .store-btn:hover { background: #333; }
    .store-label { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2; }
    .store-sub { font-size: 0.7rem; font-weight: 400; opacity: .8; }
  </style>
</head>
<body>
  <h1>${safeTitle}</h1>
  <p>${safeDesc}</p>
  <div class="buttons">
    <a href="${IOS_STORE_URL}" class="store-btn">
      ${APPLE_SVG}
      <span class="store-label"><span class="store-sub">Pobierz z</span>App Store</span>
    </a>
    <a href="${ANDROID_STORE_URL}" class="store-btn">
      ${GPLAY_SVG}
      <span class="store-label"><span class="store-sub">Pobierz z</span>Google Play</span>
    </a>
  </div>
</body>
</html>`;
}

export default factories.createCoreController(
  "api::post.post",
  ({ strapi }) => ({
    async share(ctx) {
      const { documentId } = ctx.params as { documentId: string };

      const post = await strapi.documents("api::post.post").findOne({
        documentId,
        fields: ["title", "description", "websiteUrl"],
        populate: { images: { fields: ["url"] } },
        status: "published",
      });

      if (!post) {
        ctx.status = 404;
        ctx.body = "Not found";
        return;
      }

      const ua = (ctx.request.headers["user-agent"] as string) ?? "";
      const title = post.title as string;
      const description = (post.description as string | undefined) ?? "";
      const websiteUrl = post.websiteUrl as string | undefined;

      const strapiBaseUrl =
        process.env.STRAPI_URL ?? strapi.config.get<string>("server.url", "");
      const firstImage = (
        post.images as Array<{ url: string }> | undefined
      )?.[0];
      const imageUrl = firstImage
        ? firstImage.url.startsWith("http")
          ? firstImage.url
          : `${strapiBaseUrl}${firstImage.url}`
        : null;

      const pageUrl = `${strapiBaseUrl}/api/share/post/${documentId}`;

      ctx.type = "text/html; charset=utf-8";

      if (!isMobileUA(ua)) {
        if (websiteUrl) {
          ctx.redirect(websiteUrl);
          return;
        }
        ctx.body = desktopDownloadHtml(title, description, imageUrl, pageUrl);
        return;
      }

      ctx.body = mobileRedirectHtml(
        documentId,
        title,
        description,
        imageUrl,
        pageUrl,
        isIosUA(ua),
      );
    },

    async like(ctx) {
      const { documentId } = ctx.params as { documentId: string };
      const { action } = (ctx.request.body as { action?: string }) ?? {};

      const post = await strapi.documents("api::post.post").findOne({
        documentId,
        fields: ["likesCount"],
        status: "published",
      });

      if (!post) {
        ctx.status = 404;
        ctx.body = { error: "Not found" };
        return;
      }

      const current = (post.likesCount as number) ?? 0;
      const newCount =
        action === "unlike" ? Math.max(0, current - 1) : current + 1;

      await strapi.db.query("api::post.post").updateMany({
        where: { documentId, publishedAt: { $notNull: true } },
        data: { likesCount: newCount },
      });

      ctx.body = { likesCount: newCount };
    },
  }),
);
