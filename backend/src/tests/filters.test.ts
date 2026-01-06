import { applyCompoundFilter, matchesCompoundFilter, validateCompoundFilterDepth } from "../utils/filters";

const row = (overrides: Record<string, any> = {}) => {
  return {
    name: { type: "title", plainValue: "Larry Kim" },
    company: { type: "rich_text", plainValue: "Reach.io" },
    estimatedValue: { type: "number", number: 250000, plainValue: "250,000.00" },
    done: { type: "checkbox", checkbox: false, plainValue: false },
    tag: {
      type: "multi_select",
      multi_select: [{ name: "A" }, { name: "B" }],
      plainValue: [{ name: "A" }, { name: "B" }],
    },
    followUpDate: { type: "date", date: { start: "2023-01-10" }, plainValue: { start: "2023-01-10" } },
    createdTime: {
      type: "created_time",
      created_time: "2023-01-01T00:00:00.000Z",
      plainValue: "2023-01-01T00:00:00.000Z",
    },
    ...overrides,
  };
};

describe("matchesCompoundFilter", () => {
  test("matches single string operator", () => {
    const f = { property: "company", filterOperator: "contains", value: "reach" };
    expect(matchesCompoundFilter(row(), f)).toBe(true);
  });

  test("supports AND group", () => {
    const f = {
      and: [
        { property: "company", filterOperator: "contains", value: "reach" },
        { property: "name", filterOperator: "starts with", value: "larry" },
      ],
    };
    expect(matchesCompoundFilter(row(), f)).toBe(true);
  });

  test("supports OR group", () => {
    const f = {
      or: [
        { property: "company", filterOperator: "is", value: "Nope" },
        { property: "name", filterOperator: "ends with", value: "kim" },
      ],
    };
    expect(matchesCompoundFilter(row(), f)).toBe(true);
  });

  test("supports nested groups", () => {
    const f = {
      or: [
        { property: "company", filterOperator: "is", value: "Nope" },
        {
          and: [
            { property: "estimatedValue", filterOperator: ">", value: 200000 },
            { property: "done", filterOperator: "is", value: false },
          ],
        },
      ],
    };
    expect(matchesCompoundFilter(row(), f)).toBe(true);
  });

  test("number comparisons use numeric value", () => {
    const f = { property: "estimatedValue", filterOperator: "<=", value: 250000 };
    expect(matchesCompoundFilter(row(), f)).toBe(true);
  });

  test("date comparisons", () => {
    const f = { property: "followUpDate", filterOperator: "is after", value: "2023-01-01" };
    expect(matchesCompoundFilter(row(), f)).toBe(true);
  });

  test("multi_select contains", () => {
    const f = { property: "tag", filterOperator: "contains", value: "b" };
    expect(matchesCompoundFilter(row(), f)).toBe(true);
  });
});

describe("applyCompoundFilter", () => {
  test("filters rows", () => {
    const rows = [row(), row({ company: { type: "rich_text", plainValue: "Other" } })];
    const f = { property: "company", filterOperator: "contains", value: "reach" };
    expect(applyCompoundFilter(rows, f)).toHaveLength(1);
  });
});

describe("validateCompoundFilterDepth", () => {
  test("allows up to max depth", () => {
    const f = { and: [{ or: [{ property: "name", filterOperator: "contains", value: "x" }] }] };
    expect(() => validateCompoundFilterDepth(f as any, 2)).not.toThrow();
  });

  test("throws when exceeding max depth", () => {
    const f = { and: [{ or: [{ and: [{ property: "name", filterOperator: "contains", value: "x" }] }] }] };
    expect(() => validateCompoundFilterDepth(f as any, 2)).toThrow();
  });
});
