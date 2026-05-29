import { check, group } from "k6";
import http from "k6/http";
import { BASE_URL } from "../config.js";

function buildPostUrl(documentId) {
  return (
    `${BASE_URL}/api/posts/${documentId}?` +
    "populate[images]=true&" +
    "populate[author][populate][avatar]=true&" +
    "populate[tags]=true&" +
    "populate[content][on][content.text]=true&" +
    "populate[content][on][content.location]=true&" +
    "populate[content][on][content.event-date-time]=true&" +
    "populate[content][on][content.chip]=true&" +
    "populate[content][on][content.section-title]=true&" +
    "populate[content][on][content.calendar][populate][entries]=true"
  );
}

export function viewPost(documentId) {
  if (!documentId) return;

  group("post detail", () => {
    const res = http.get(buildPostUrl(documentId));

    let body;
    try {
      body = JSON.parse(res.body);
    } catch (_) {}

    check(res, {
      "post detail status 200": (r) => r.status === 200,
      "post detail has data": () =>
        body !== undefined &&
        body.data !== null &&
        body.data.documentId !== undefined,
    });
  });
}
