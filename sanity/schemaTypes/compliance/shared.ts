import { defineArrayMember, defineField } from "sanity";
// Relative import on purpose: Sanity's CLI (Vite) doesn't understand the "@/" alias.
import { REGION_OPTIONS } from "../../../lib/compliance/states";

export const GROUPS = [
  { name: "data", title: "Data", default: true },
  { name: "verification", title: "Sources & verification" },
  { name: "faq", title: "FAQ" },
];

export const stateField = defineField({
  name: "state",
  title: "State / UT",
  type: "string",
  group: "data",
  options: { list: REGION_OPTIONS },
  validation: (rule) => rule.required(),
});

export const verificationFields = [
  defineField({
    name: "status",
    title: "Status",
    type: "string",
    group: "verification",
    description:
      "Only 'Verified' records appear on the website. Keep it as Draft until every number has been checked against the official notification.",
    options: {
      list: [
        { title: "Draft (hidden from site)", value: "draft" },
        { title: "Verified (live, indexed by Google)", value: "verified" },
      ],
      layout: "radio",
      direction: "horizontal",
    },
    initialValue: "draft",
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "lastVerified",
    title: "Last verified on",
    type: "date",
    group: "verification",
    description: "The date you last checked this record against the official source. Shown on the page.",
    validation: (rule) =>
      rule.custom((value, context) => {
        const doc = context.document as { status?: string } | undefined;
        if (doc?.status === "verified" && !value) return "Set the verification date before marking as Verified.";
        return true;
      }),
  }),
  defineField({
    name: "sources",
    title: "Official sources",
    type: "array",
    group: "verification",
    description: "Upload the notification PDF, or link to the official page. At least one is needed to mark as Verified.",
    of: [
      defineArrayMember({
        type: "object",
        name: "sourceDoc",
        fields: [
          defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
          defineField({ name: "issuedBy", title: "Issued by", type: "string", description: "e.g. Labour Department, Government of Karnataka" }),
          defineField({ name: "reference", title: "Notification / G.O. number", type: "string" }),
          defineField({ name: "issuedOn", title: "Issued on", type: "date" }),
          defineField({ name: "file", title: "PDF", type: "file", options: { accept: "application/pdf" } }),
          defineField({ name: "link", title: "Or official link", type: "url" }),
        ],
        preview: { select: { title: "title", subtitle: "reference" } },
      }),
    ],
    validation: (rule) =>
      rule.custom((value, context) => {
        const doc = context.document as { status?: string } | undefined;
        if (doc?.status === "verified" && (!value || (value as unknown[]).length === 0)) {
          return "Add at least one official source before marking as Verified.";
        }
        return true;
      }),
  }),
  defineField({
    name: "editorNote",
    title: "Note shown on page (optional)",
    type: "text",
    rows: 2,
    group: "verification",
    description: "Use for caveats readers should see, e.g. 'Revision announced, notification awaited'.",
  }),
];

export const faqField = defineField({
  name: "faqItems",
  title: "FAQ items",
  type: "array",
  group: "faq",
  description: "Optional. Shown at the bottom of the page and marked up for Google FAQ rich results.",
  of: [
    defineArrayMember({
      type: "object",
      name: "faqItem",
      fields: [
        defineField({ name: "question", title: "Question", type: "string", validation: (r) => r.required() }),
        defineField({ name: "answer", title: "Answer", type: "text", rows: 3, validation: (r) => r.required() }),
      ],
      preview: { select: { title: "question" } },
    }),
  ],
});

/** Builds "Karnataka" from a state slug for previews. */
export function regionTitle(slug?: string): string {
  return REGION_OPTIONS.find((o) => o.value === slug)?.title ?? slug ?? "No state";
}

export function statusIcon(status?: string): string {
  return status === "verified" ? "✅" : "📝";
}
