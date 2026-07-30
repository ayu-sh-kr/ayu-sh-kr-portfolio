import { defineEventHandler } from "nitro/h3";

/**
 * Confirms that the Nitro server is running and owns the same-origin API path.
 */
export default defineEventHandler(() => ({
  message: "Hello from Nitro",
}));
