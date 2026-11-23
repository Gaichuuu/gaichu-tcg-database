import { describe, it, expect } from "vitest";
import { getIsoWeekKey, isoWeekMonday } from "./isoWeek.js";

describe("getIsoWeekKey", () => {
  it("formats ISO week with zero-padded week number", () => {
    // 2026-01-01 is a Thursday → ISO week 1 of 2026
    expect(getIsoWeekKey(new Date("2026-01-01T12:00:00Z"))).toBe("2026-W01");
  });
  it("computes a mid-year week", () => {
    // 2026-05-25 is a Monday → ISO week 22
    expect(getIsoWeekKey(new Date("2026-05-25T00:00:00Z"))).toBe("2026-W22");
  });
  it("assigns early-January days to the previous year's last week", () => {
    // 2027-01-01 is a Friday → ISO week 53 of 2026
    expect(getIsoWeekKey(new Date("2027-01-01T12:00:00Z"))).toBe("2026-W53");
  });
});

describe("isoWeekMonday", () => {
  it("returns the Monday (UTC) of the date's ISO week as YYYY-MM-DD", () => {
    expect(isoWeekMonday(new Date("2026-05-27T15:00:00Z"))).toBe("2026-05-25");
  });
});
