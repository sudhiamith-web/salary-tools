import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";

// Two different build tools produce this config, and each only statically
// replaces its own prefix: Next.js's build (for the embedded /studio route)
// replaces NEXT_PUBLIC_*, while Sanity's own CLI build (for `sanity deploy`,
// used for the standalone *.sanity.studio hosting) only replaces
// SANITY_STUDIO_*. Checking both means this file works correctly for either
// build without needing two separate config files.
const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_STUDIO_PROJECT_ID ||
  "";
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_STUDIO_DATASET ||
  "production";

export default defineConfig({
  name: "salary-tools-studio",
  title: "Salary-Tools Content",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
