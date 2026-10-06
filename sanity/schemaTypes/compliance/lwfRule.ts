import { defineArrayMember, defineField, defineType } from "sanity";
import { GROUPS, faqField, regionTitle, stateField, statusIcon, verificationFields } from "./shared";

export const lwfRule = defineType({
  name: "lwfRule",
  title: "LWF rule",
  type: "document",
  groups: GROUPS,
  fields: [
    stateField,
    defineField({
      name: "applicable",
      title: "State levies LWF",
      type: "boolean",
      group: "data",
      initialValue: true,
      description: "Turn off for states with no Labour Welfare Fund law. The page will say so and the other fields are ignored.",
    }),
    defineField({ name: "actName", title: "Governing Act", type: "string", group: "data", hidden: ({ document }) => document?.applicable === false }),
    defineField({ name: "boardName", title: "Labour Welfare Board", type: "string", group: "data", hidden: ({ document }) => document?.applicable === false }),
    defineField({ name: "portalUrl", title: "Payment / board portal", type: "url", group: "data", hidden: ({ document }) => document?.applicable === false }),
    defineField({ name: "effectiveFrom", title: "Current rates effective from", type: "date", group: "data", hidden: ({ document }) => document?.applicable === false }),
    defineField({
      name: "frequency",
      title: "Contribution frequency",
      type: "string",
      group: "data",
      hidden: ({ document }) => document?.applicable === false,
      options: {
        list: [
          { title: "Monthly", value: "monthly" },
          { title: "Half-yearly", value: "half-yearly" },
          { title: "Yearly", value: "yearly" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({
      name: "deductionMonths",
      title: "Months the employee share is deducted",
      type: "array",
      group: "data",
      hidden: ({ document }) => document?.applicable === false || document?.frequency === "monthly",
      of: [defineArrayMember({ type: "number" })],
      options: {
        list: [
          { title: "Jan", value: 1 }, { title: "Feb", value: 2 }, { title: "Mar", value: 3 },
          { title: "Apr", value: 4 }, { title: "May", value: 5 }, { title: "Jun", value: 6 },
          { title: "Jul", value: 7 }, { title: "Aug", value: 8 }, { title: "Sep", value: 9 },
          { title: "Oct", value: 10 }, { title: "Nov", value: 11 }, { title: "Dec", value: 12 },
        ],
      },
    }),
    defineField({
      name: "dueDates",
      title: "Due dates",
      type: "array",
      group: "data",
      hidden: ({ document }) => document?.applicable === false,
      of: [
        defineArrayMember({
          type: "object",
          name: "lwfDue",
          fields: [
            defineField({ name: "period", title: "For", type: "string", description: "e.g. June contribution", validation: (r) => r.required() }),
            defineField({ name: "due", title: "Pay by", type: "string", description: "e.g. 15 July", validation: (r) => r.required() }),
          ],
          preview: { select: { title: "period", subtitle: "due" } },
        }),
      ],
    }),
    defineField({ name: "minEmployees", title: "Applies to establishments with at least (employees)", type: "number", group: "data", hidden: ({ document }) => document?.applicable === false }),
    defineField({ name: "excludedAboveWage", title: "Employees earning above this monthly wage are excluded", type: "number", group: "data", hidden: ({ document }) => document?.applicable === false }),
    defineField({ name: "coverageNotes", title: "Who is covered / excluded", type: "text", rows: 3, group: "data", hidden: ({ document }) => document?.applicable === false }),
    defineField({
      name: "slabs",
      title: "Contribution rates",
      type: "array",
      group: "data",
      hidden: ({ document }) => document?.applicable === false,
      description:
        "One row is enough when every employee pays the same. Add more rows for wage bands (fill Wage from / to) or establishment types (fill Label).",
      of: [
        defineArrayMember({
          type: "object",
          name: "lwfSlab",
          fields: [
            defineField({ name: "label", title: "Label (optional)", type: "string", description: "e.g. Shops & commercial establishments" }),
            defineField({ name: "wageFrom", title: "Wage from (₹/month)", type: "number" }),
            defineField({ name: "wageTo", title: "Wage to (₹/month)", type: "number" }),
            defineField({
              name: "mode",
              title: "Type",
              type: "string",
              initialValue: "fixed",
              options: {
                list: [
                  { title: "Fixed amount", value: "fixed" },
                  { title: "% of wages", value: "percent" },
                ],
                layout: "radio",
                direction: "horizontal",
              },
              validation: (r) => r.required(),
            }),
            defineField({ name: "employee", title: "Employee (₹ per cycle)", type: "number", hidden: ({ parent }) => parent?.mode !== "fixed" }),
            defineField({ name: "employer", title: "Employer (₹ per cycle)", type: "number", hidden: ({ parent }) => parent?.mode !== "fixed" }),
            defineField({ name: "employeePercent", title: "Employee %", type: "number", hidden: ({ parent }) => parent?.mode !== "percent" }),
            defineField({ name: "employeeCap", title: "Employee maximum (₹)", type: "number", hidden: ({ parent }) => parent?.mode !== "percent" }),
            defineField({ name: "employerPercent", title: "Employer %", type: "number", hidden: ({ parent }) => parent?.mode !== "percent" }),
            defineField({ name: "employerCap", title: "Employer maximum (₹)", type: "number", hidden: ({ parent }) => parent?.mode !== "percent" }),
          ],
          preview: {
            select: { label: "label", mode: "mode", e: "employee", r: "employer", ep: "employeePercent", rp: "employerPercent" },
            prepare: ({ label, mode, e, r, ep, rp }) => ({
              title: label || "All employees",
              subtitle: mode === "percent" ? `${ep ?? 0}% + ${rp ?? 0}%` : `₹${e ?? 0} + ₹${r ?? 0}`,
            }),
          },
        }),
      ],
      validation: (rule) =>
        rule.custom((slabs, context) => {
          const doc = context.document as { applicable?: boolean } | undefined;
          if (doc?.applicable === false) return true;
          return slabs && (slabs as unknown[]).length > 0 ? true : "Add at least one contribution rate.";
        }),
    }),
    ...verificationFields,
    faqField,
  ],
  preview: {
    select: { state: "state", applicable: "applicable", status: "status", frequency: "frequency" },
    prepare: ({ state, applicable, status, frequency }) => ({
      title: `${statusIcon(status)} ${regionTitle(state)}`,
      subtitle: applicable === false ? "Not applicable" : frequency ?? "",
    }),
  },
});
