import { describe, expect, it } from "vitest";
import { parseProjectTaskTypePage } from "../src/utils/parseProjectTaskTypePage";

describe("project task type API pagination", () => {
  const type = {
    code: "task",
    project_id: "p1",
    name: "Tarea",
    archived: false,
  };

  it("accepts the last API page where next_after is omitted", () => {
    expect(parseProjectTaskTypePage({ items: [type] })).toEqual({
      items: [type],
      next_after: null,
    });
    expect(parseProjectTaskTypePage({ items: [] }).next_after).toBeNull();
  });

  it("retains valid cursors and accepts explicit null", () => {
    expect(
      parseProjectTaskTypePage({ items: [type], next_after: "task" })
        .next_after,
    ).toBe("task");
    expect(
      parseProjectTaskTypePage({ items: [], next_after: null }).next_after,
    ).toBeNull();
  });

  it("rejects malformed catalogs and cursors", () => {
    expect(() =>
      parseProjectTaskTypePage({ items: [], next_after: 123 }),
    ).toThrow();
    expect(() => parseProjectTaskTypePage({ items: "invalid" })).toThrow();
    expect(() =>
      parseProjectTaskTypePage({ items: [{ ...type, archived: "false" }] }),
    ).toThrow();
  });
});
