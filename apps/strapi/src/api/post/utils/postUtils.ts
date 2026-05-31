export function isMobileUA(ua: string): boolean {
  return /Android|iPhone|iPad|iPod/i.test(ua);
}

export function isIosUA(ua: string): boolean {
  return /iPhone|iPad|iPod/i.test(ua);
}

export function escape(str: string): string {
  return str.replace(
    /[<>"&]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", '"': "&quot;", "&": "&amp;" })[c]!,
  );
}

export function ogMeta(
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
