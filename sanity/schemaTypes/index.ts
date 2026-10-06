import { postType } from "./post";

export const schemaTypes = [postType];

import { complianceSchemaTypes } from "./compliance";

export const schemaTypes = [
  // ...your existing types (post, etc.)
  ...complianceSchemaTypes,
];
