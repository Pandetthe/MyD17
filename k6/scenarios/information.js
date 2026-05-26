import { check, group } from "k6";
import http from "k6/http";
import { BASE_URL } from "../config.js";

const INFO_PATH =
  "/api/information-page?" +
  "populate[staticInformation][populate][content][on][content.text]=true&" +
  "populate[staticInformation][populate][content][on][content.section-title]=true&" +
  "populate[staticInformation][populate][content][on][content.location]=true&" +
  "populate[staticInformation][populate][content][on][content.event-date-time]=true&" +
  "populate[staticInformation][populate][content][on][content.chip]=true&" +
  "populate[staticInformation][populate][content][on][content.calendar][populate][entries]=true";

export function viewInformation() {
  group("information page", () => {
    const res = http.get(`${BASE_URL}${INFO_PATH}`);

    let body;
    try {
      body = JSON.parse(res.body);
    } catch (_) {}

    check(res, {
      "information page status 200": (r) => r.status === 200,
      "information page has data": () =>
        body !== undefined && body.data !== null,
    });
  });
}
