import { defineCliConfig } from "sanity/cli";

// This file is only used by the Sanity CLI (commands like `npx sanity deploy`
// and `npx sanity login`) — it's separate from sanity.config.ts, which
// configures the Studio embedded inside the Next.js app.

export default defineCliConfig({
  api: {
    projectId: "f3c45rz4",
    dataset: "production",
  },
});
