import { defineArrayMember, defineField, defineType } from "sanity";
import { GROUPS, faqField, regionTitle, stateField, statusIcon, verificationFields } from "./shared";

/**
 * One NOTIFICATION per state per effective date (e.g. Karnataka, 1 Apr 2026).
 * Its rates live in separate SCHEDULE documents, one per scheduled
 * employment / sector, so no single Studio form gets thousands of rows.
 */
export const minimumWageNotification = defineType({
  name: "minimumWageNotification",
  title: "Minimum wage notification",
  type: "document",
  groups: GROUPS,
  fields: [
    stateField,
    defineField({
      name: "effectiveFrom",
      title: "Effective from",
      type: "date",
      group: "data",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "framework",
      title: "Notified under",
      type: "string",
      group: "data",
      initialValue: "legacy",
      options: {
        list: [
          { title: "Old structure (scheduled employments)", value: "legacy" },
          { title: "Code on Wages structure (skill + area)", value: "code-on-wages" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "monthlyDivisor",
      title: "Days per month for daily ↔ monthly conversion",
      type: "number",
      group: "data",
      initialValue: 26,
      description: "26 under the Code on Wages (Central) Rules, 2026. Change only if this state's notification says otherwise.",
      validation: (rule) => rule.required().min(20).max(31),
    }),
    defineField({
      name: "zones",
      title: "Zones / areas",
      type: "array",
      group: "data",
      description: "List every zone used in the notification. If the state has one rate for everywhere, add a single zone called 'All areas'.",
      of: [
        defineArrayMember({
          type: "object",
          name: "wageZone",
          fields: [
            defineField({ name: "key", title: "Zone name", type: "string", description: "Exactly as you'll type it in rate rows, e.g. Zone I", validation: (r) => r.required() }),
            defineField({ name: "areas", title: "Areas covered", type: "text", rows: 2, description: "Districts / cities / municipal limits in this zone" }),
          ],
          preview: { select: { title: "key", subtitle: "areas" } },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "nextRevisionNote",
      title: "Next revision (optional)",
      type: "string",
      group: "data",
      description: "e.g. 'VDA revised every 1 April and 1 October'",
    }),
    ...verificationFields,
    faqField,
  ],
  orderings: [
    { title: "Newest first", name: "effectiveDesc", by: [{ field: "effectiveFrom", direction: "desc" }] },
  ],
  preview: {
    select: { state: "state", effectiveFrom: "effectiveFrom", status: "status" },
    prepare: ({ state, effectiveFrom, status }) => ({
      title: `${statusIcon(status)} ${regionTitle(state)}`,
      subtitle: `Effective ${effectiveFrom ?? "—"}`,
    }),
  },
});

type RowValue = { zone?: string; basic?: number };

export const minimumWageSchedule = defineType({
  name: "minimumWageSchedule",
  title: "Minimum wage rates (per employment)",
  type: "document",
  fields: [
    defineField({
      name: "notification",
      title: "Notification",
      type: "reference",
      to: [{ type: "minimumWageNotification" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "employment",
      title: "Scheduled employment / sector",
      type: "string",
      description: "e.g. Shops & commercial establishments, Security services. Use 'All employments' if the state has one table.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "unit",
      title: "Rates in this table are per",
      type: "string",
      options: {
        list: [
          { title: "Month", value: "month" },
          { title: "Day", value: "day" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "vdaByZone",
      title: "VDA by zone",
      type: "array",
      description: "Most states apply the same VDA to every category in a zone. Enter it once here; use 'VDA override' on a row only when it differs.",
      of: [
        defineArrayMember({
          type: "object",
          name: "zoneVda",
          fields: [
            defineField({ name: "zone", title: "Zone", type: "string", validation: (r) => r.required() }),
            defineField({ name: "vda", title: "VDA", type: "number", validation: (r) => r.required().min(0) }),
          ],
          preview: {
            select: { zone: "zone", vda: "vda" },
            prepare: ({ zone, vda }) => ({ title: `${zone}: ₹${vda ?? 0}` }),
          },
        }),
      ],
    }),
    defineField({
      name: "rows",
      title: "Rates",
      type: "array",
      description: "One row per category × zone. Tip: use the row menu → Duplicate to copy a row and change only the zone and basic.",
      of: [
        defineArrayMember({
          type: "object",
          name: "wageRow",
          fields: [
            defineField({ name: "category", title: "Category / occupation", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "skill",
              title: "Skill level",
              type: "string",
              initialValue: "unskilled",
              options: {
                list: [
                  { title: "Unskilled", value: "unskilled" },
                  { title: "Semi-skilled", value: "semi-skilled" },
                  { title: "Skilled", value: "skilled" },
                  { title: "Highly skilled", value: "highly-skilled" },
                  { title: "Not classified", value: "not-specified" },
                ],
              },
              validation: (r) => r.required(),
            }),
            defineField({ name: "zone", title: "Zone", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "basic",
              title: "Basic",
              type: "number",
              validation: (r) => [
                r.required().min(0),
                // Catches the classic error of typing a daily rate into a monthly table (or vice versa).
                r
                  .custom((value, context) => {
                    const unit = (context.document as { unit?: string } | undefined)?.unit;
                    if (typeof value !== "number" || !unit) return true;
                    if (unit === "month" && value < 2000) return "Looks like a DAILY rate, but this table is set to Month.";
                    if (unit === "day" && value > 3000) return "Looks like a MONTHLY rate, but this table is set to Day.";
                    return true;
                  })
                  .warning(),
              ],
            }),
            defineField({ name: "vdaOverride", title: "VDA override (optional)", type: "number", description: "Leave blank to use the zone VDA above." }),
          ],
          preview: {
            select: { category: "category", zone: "zone", basic: "basic", skill: "skill" },
            prepare: ({ category, zone, basic, skill }) => ({
              title: category,
              subtitle: `${zone ?? "?"} · ${skill ?? ""} · basic ₹${basic ?? "—"}`,
            }),
          },
        }),
      ],
      validation: (rule) =>
        rule.custom(async (rows, context) => {
          const list = (rows ?? []) as RowValue[];
          const ref = (context.document as { notification?: { _ref?: string } } | undefined)?.notification?._ref;
          if (!ref || list.length === 0) return true;
          const client = context.getClient({ apiVersion: "2024-01-01" });
          const zones: string[] =
            (await client.fetch(`*[_id in [$id, "drafts." + $id]][0].zones[].key`, { id: ref })) ?? [];
          if (zones.length === 0) return true;
          const unknown = Array.from(new Set(list.map((r) => r.zone).filter((z): z is string => !!z && !zones.includes(z))));
          return unknown.length
            ? `These zones aren't defined on the notification: ${unknown.join(", ")}. Defined zones: ${zones.join(", ")}.`
            : true;
        }),
    }),
  ],
  preview: {
    select: { employment: "employment", state: "notification.state", eff: "notification.effectiveFrom", rows: "rows", unit: "unit" },
    prepare: ({ employment, state, eff, rows, unit }) => ({
      title: employment,
      subtitle: `${regionTitle(state)} · ${eff ?? ""} · ${(rows ?? []).length} rows / ${unit ?? "?"}`,
    }),
  },
});
