import { promisify } from "util";
import { existsSync, rmdirSync } from "fs";
import { resolve } from "path";

const exec = promisify(require("child_process").exec);

describe("Scripts", () => {
  afterEach(() => {
    try {
      rmdirSync(resolve(process.cwd(), "./output"), {
        recursive: true,
      });
    } catch (e) {
      console.warn(e);
    }
  });

  describe("json-builder", () => {
    test("it creates an exercise.json file in the root", async () => {
      await exec("npm run build:json", { cwd: process.cwd() });
      expect(existsSync(resolve(process.cwd(), "./output"))).toBe(true);
      expect(existsSync(resolve(process.cwd(), "./output/images"))).toBe(true);
      expect(
        existsSync(resolve(process.cwd(), "./output/exercises.json"))
      ).toBe(true);
      // Test the first copied image
      expect(
        existsSync(resolve(process.cwd(), "./output/images/3-4-sit-up-end.jpg"))
      ).toBe(true);
      expect(
        existsSync(
          resolve(process.cwd(), "./output/images/3-4-sit-up-start.jpg")
        )
      ).toBe(true);
    }, 25000);
  });
});
