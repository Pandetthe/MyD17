export const PREVIEW_ALLOWED_UIDS = new Set([
  "api::post.post",
  "api::static-information.static-information",
  "api::contact.contact",
]);

export const CONTENT_POPULATE = {
  on: {
    "content.text": true,
    "content.section-title": true,
    "content.location": true,
    "content.event-date-time": true,
    "content.chip": true,
    "content.calendar": { populate: { entries: true } },
  },
} as const;
