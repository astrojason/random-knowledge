import { expect, it } from "vitest";
import { isOutOfCredits } from "./openai-errors";

const apiError = (status: number, message: string, code?: string) => Object.assign(new Error(`${status} ${message}`), { status, code });

it.each([
  apiError(429, "You have no credits remaining. Add credits to continue using the API at https://platform.openai.com/settings/organization/billing/."),
  apiError(429, "You exceeded your current quota, please check your plan and billing details.", "insufficient_quota"),
  apiError(429, "Something else", "insufficient_quota"),
])("recognizes an account with no credits: %s", (err) => {
  expect(isOutOfCredits(err)).toBe(true);
});

it.each([
  apiError(429, "Rate limit reached for gpt-4.1 on tokens per min.", "rate_limit_exceeded"),
  apiError(500, "You have no credits remaining."),
  apiError(401, "Incorrect API key provided."),
  new Error("Could not find enough corroborating sources. Please try again."),
  "429 no credits remaining",
  null,
])("does not mistake other failures for it: %s", (err) => {
  expect(isOutOfCredits(err)).toBe(false);
});
