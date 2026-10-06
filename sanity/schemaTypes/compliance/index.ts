import { holidayList } from "./holidayList";
import { lwfRule } from "./lwfRule";
import { minimumWageNotification, minimumWageSchedule } from "./minimumWage";

/** Spread into the `types` array in sanity/schemaTypes/index.ts */
export const complianceSchemaTypes = [holidayList, minimumWageNotification, minimumWageSchedule, lwfRule];
