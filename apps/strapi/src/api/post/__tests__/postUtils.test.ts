import { isMobileUA, isIosUA, escape, ogMeta } from "../utils/postUtils";

const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/112 Mobile Safari/537.36";
const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15";
const IPAD_UA = "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15";
const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/112 Safari/537.36";

describe("isMobileUA", () => {
  it("returns true for Android UA", () => {
    expect(isMobileUA(ANDROID_UA)).toBe(true);
  });

  it("returns true for iPhone UA", () => {
    expect(isMobileUA(IPHONE_UA)).toBe(true);
  });

  it("returns true for iPad UA", () => {
    expect(isMobileUA(IPAD_UA)).toBe(true);
  });

  it("returns false for desktop Chrome UA", () => {
    expect(isMobileUA(DESKTOP_UA)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isMobileUA("")).toBe(false);
  });
});

describe("isIosUA", () => {
  it("returns true for iPhone UA", () => {
    expect(isIosUA(IPHONE_UA)).toBe(true);
  });

  it("returns true for iPad UA", () => {
    expect(isIosUA(IPAD_UA)).toBe(true);
  });

  it("returns false for Android UA", () => {
    expect(isIosUA(ANDROID_UA)).toBe(false);
  });

  it("returns false for desktop UA", () => {
    expect(isIosUA(DESKTOP_UA)).toBe(false);
  });
});

describe("escape", () => {
  it("escapes < to &lt;", () => {
    expect(escape("<")).toBe("&lt;");
  });

  it("escapes > to &gt;", () => {
    expect(escape(">")).toBe("&gt;");
  });

  it('escapes " to &quot;', () => {
    expect(escape('"')).toBe("&quot;");
  });

  it("escapes & to &amp;", () => {
    expect(escape("&")).toBe("&amp;");
  });

  it("escapes all four characters in one string", () => {
    expect(escape('<script>alert("xss")&done</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&amp;done&lt;/script&gt;",
    );
  });

  it("returns a clean string unchanged", () => {
    expect(escape("Hello world 123")).toBe("Hello world 123");
  });
});

describe("ogMeta", () => {
  const title = "My Event";
  const description = "An interesting event";
  const pageUrl = "https://example.com/share/post/abc";
  const imageUrl = "https://example.com/image.jpg";

  it("includes og:title with the escaped title", () => {
    const result = ogMeta(title, description, null, pageUrl);
    expect(result).toContain(`og:title" content="My Event"`);
  });

  it("includes og:description with the escaped description", () => {
    const result = ogMeta(title, description, null, pageUrl);
    expect(result).toContain(`og:description" content="An interesting event"`);
  });

  it("includes og:image tag when imageUrl is provided", () => {
    const result = ogMeta(title, description, imageUrl, pageUrl);
    expect(result).toContain(`og:image" content="${imageUrl}"`);
  });

  it("omits og:image tag when imageUrl is null", () => {
    const result = ogMeta(title, description, null, pageUrl);
    expect(result).not.toContain("og:image");
  });

  it("sets twitter:card to 'summary_large_image' when imageUrl is provided", () => {
    const result = ogMeta(title, description, imageUrl, pageUrl);
    expect(result).toContain('content="summary_large_image"');
  });

  it("sets twitter:card to 'summary' when imageUrl is null", () => {
    const result = ogMeta(title, description, null, pageUrl);
    expect(result).toContain('content="summary"');
    expect(result).not.toContain("summary_large_image");
  });

  it("escapes special characters in title and description", () => {
    const result = ogMeta('<b>Title</b>', 'Desc & "more"', null, pageUrl);
    expect(result).toContain("&lt;b&gt;Title&lt;/b&gt;");
    expect(result).toContain("Desc &amp; &quot;more&quot;");
  });
});
