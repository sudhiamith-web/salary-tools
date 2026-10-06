import { defineArrayMember, defineField, defineType } from "sanity";
import { GROUPS, faqField, regionTitle, stateField, statusIcon, verificationFields } from "./shared";

export const holidayList = defineType({
  name: "holidayList",
  title: "Holiday list",
  type: "document",
  groups: GROUPS,
  fields: [
    stateField,
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      group: "data",
      initialValue: () => new Date().getFullYear() + 1,
      validation: (rule) => rule.required().integer().min(2025).max(2100),
    }),
    defineField({
      name: "holidays",
      title: "Government holiday list",
      type: "array",
      group: "data",
      description:
        "From the state government's annual holiday notification. Keep general (gazetted) and restricted/optional holidays separate.",
      of: [
        defineArrayMember({
          type: "object",
          name: "holiday",
          fields: [
            defineField({ name: "name", title: "Holiday", type: "string", validation: (r) => r.required() }),
            defineField({ name: "date", title: "Date", type: "date", validation: (r) => r.required() }),
            defineField({
              name: "kind",
              title: "Type",
              type: "string",
              initialValue: "general",
              options: {
                list: [
                  { title: "National (26 Jan, 15 Aug, 2 Oct)", value: "national" },
                  { title: "General / gazetted", value: "general" },
                  { title: "Restricted / optional", value: "restricted" },
                ],
                layout: "radio",
                direction: "horizontal",
              },
              validation: (r) => r.required(),
            }),
            defineField({
              name: "tentative",
              title: "Date may change (lunar calendar)",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: {
            select: { title: "name", date: "date", kind: "kind" },
            prepare: ({ title, date, kind }) => ({ title, subtitle: `${date ?? "no date"} · ${kind ?? ""}` }),
          },
        }),
      ],
      validation: (rule) =>
        rule.custom((items) => {
          const list = (items ?? []) as { date?: string; name?: string }[];
          const keys = list.map((h) => `${h.date}|${h.name}`);
          return new Set(keys).size === keys.length ? true : "The same holiday is listed twice.";
        }),
    }),
    defineField({
      name: "privateEmployerRules",
      title: "Private employers (National & Festival Holidays law)",
      type: "object",
      group: "data",
      description:
        "What private factories, shops and establishments must give under the state's NFH Act or Shops & Establishments Act. This is NOT the government list above.",
      fields: [
        defineField({ name: "actName", title: "Governing Act", type: "string", description: "e.g. Karnataka Industrial Establishments (National and Festival Holidays) Act, 1963" }),
        defineField({ name: "minimumPaidHolidays", title: "Minimum paid holidays per year", type: "number" }),
        defineField({
          name: "mandatoryHolidays",
          title: "Mandatory holidays (every employer must give)",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              name: "mandatoryHoliday",
              fields: [
                defineField({ name: "name", title: "Holiday", type: "string", validation: (r) => r.required() }),
                defineField({ name: "date", title: "Date (if fixed)", type: "date" }),
              ],
              preview: { select: { title: "name", subtitle: "date" } },
            }),
          ],
        }),
        defineField({ name: "festivalHolidaysToChoose", title: "Festival holidays the employer chooses", type: "number" }),
        defineField({ name: "eligibility", title: "Eligibility for paid holiday", type: "text", rows: 2 }),
        defineField({ name: "workingOnHolidayRule", title: "If an employee works on a holiday", type: "text", rows: 2, description: "e.g. Double wages, or one day's wages plus a substituted holiday" }),
        defineField({ name: "notes", title: "Other notes", type: "text", rows: 2 }),
      ],
    }),
    ...verificationFields,
    faqField,
  ],
  orderings: [
    { title: "Year, then state", name: "yearState", by: [{ field: "year", direction: "desc" }, { field: "state", direction: "asc" }] },
  ],
  preview: {
    select: { state: "state", year: "year", status: "status", holidays: "holidays" },
    prepare: ({ state, year, status, holidays }) => ({
      title: `${statusIcon(status)} ${regionTitle(state)} · ${year ?? ""}`,
      subtitle: `${(holidays ?? []).length} holidays`,
    }),
  },
});
