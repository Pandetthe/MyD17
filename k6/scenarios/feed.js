import { check, group } from "k6";
import http from "k6/http";
import { BASE_URL } from "../config.js";

const PAGE_SIZE = 10;

function buildFeedUrl(page) {
  return (
    `${BASE_URL}/api/posts?` +
    `pagination[page]=${page}&` +
    `pagination[pageSize]=${PAGE_SIZE}&` +
    "populate[images]=true&" +
    "populate[author][populate][avatar]=true&" +
    "populate[tags]=true&" +
    "sort=publishedAt:desc"
  );
}

// Returns a documentId extracted from the first post, or null if no posts exist.
export function browseFeed() {
  let firstDocumentId = null;

  group("feed browsing", () => {
    const res1 = http.get(buildFeedUrl(1));

    let body1;
    try {
      body1 = JSON.parse(res1.body);
    } catch (_) {}

    check(res1, {
      "feed page 1 status 200": (r) => r.status === 200,
      "feed page 1 has posts": () =>
        body1 !== undefined &&
        Array.isArray(body1.data) &&
        body1.data.length > 0,
    });

    if (body1 && Array.isArray(body1.data) && body1.data.length > 0) {
      firstDocumentId = body1.data[0].documentId;

      const pageCount =
        body1.meta && body1.meta.pagination
          ? body1.meta.pagination.pageCount
          : 0;
      if (pageCount > 1) {
        const res2 = http.get(buildFeedUrl(2));
        check(res2, {
          "feed page 2 status 200": (r) => r.status === 200,
        });
      }
    }
  });

  return firstDocumentId;
}
