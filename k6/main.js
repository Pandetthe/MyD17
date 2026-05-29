import { sleep } from "k6";
import { activeStages, thresholds } from "./config.js";
import { browseFeed } from "./scenarios/feed.js";
import { viewPost } from "./scenarios/post-detail.js";
import { viewInformation } from "./scenarios/information.js";

export const options = {
  stages: activeStages,
  thresholds,
};

// Each VU iteration simulates one user session: open feed → read a post → view info page.
export default function () {
  const documentId = browseFeed();
  sleep(1);

  viewPost(documentId);
  sleep(1);

  viewInformation();
  sleep(1);
}
