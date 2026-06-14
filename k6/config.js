export const BASE_URL = __ENV.BASE_URL || "http://localhost:1337";

const thresholdsByScenario = {
  smoke: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
  load: {
    http_req_duration: ["p(95)<1500"],
    http_req_failed: ["rate<0.01"],
  },
  stress: {
    http_req_duration: ["p(95)<6000"],
    http_req_failed: ["rate<0.05"],
  },
};

export const thresholds =
  thresholdsByScenario[__ENV.SCENARIO || "load"] || thresholdsByScenario.load;

const SCENARIO = __ENV.SCENARIO || "load";

const stages = {
  smoke: [{ duration: "30s", target: 1 }],
  load: [
    { duration: "1m", target: 30 },
    { duration: "3m", target: 30 },
    { duration: "1m", target: 0 },
  ],
  stress: [
    { duration: "30s", target: 50 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 0 },
  ],
};

export const activeStages = stages[SCENARIO] || stages.load;
