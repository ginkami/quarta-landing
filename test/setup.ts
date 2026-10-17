import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

// Vitest runs without injected globals, so Testing Library cannot register
// its own cleanup — hook it up explicitly to isolate tests.
afterEach(() => {
  cleanup();
});
