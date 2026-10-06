import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "f3c45rz4",
    dataset: "production",
  },
  // Fixed hostname so `sanity deploy` never stops to ask for one
  // (an automated GitHub Action can't answer prompts).
  studioHost: "salary-tools",
});
