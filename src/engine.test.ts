import { describe, expect, test } from "vitest";
import { evaluateConsent, isConsentExpired } from "./engine.ts";
import type { ConsentType } from "./types.ts";

// 1. Create a baseline clean mock consent object
const mockConsent = {
	id: "consent-123",
	patientId: "patient-456",
	status: "active",
	expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour in the future
	allowedActors: ["dr-smith", "nurse-jones", 1283],
	allowedPurposes: ["TREATMENT", "EMERGENCY"],
	exceptedCategories: ["mental-health"],
} satisfies ConsentType;

describe("Healthcare Consent Engine - Functional Tests", () => {
	test("should PERMIT valid authorization requests", () => {
		const request = {
			actorId: "dr-smith",
			purpose: "TREATMENT",
		};

		const result = evaluateConsent(mockConsent, request);
		expect(result.allowed).toBe(true);
		expect(result.reason).toBe("PERMITTED");
	});

	test("should DENY access if policy status is inactive", () => {
		const inactiveConsent = { ...mockConsent, status: "inactive" as const };
		const request = { actorId: "dr-smith", purpose: "TREATMENT" };

		const result = evaluateConsent(inactiveConsent, request);
		expect(result.allowed).toBe(false);
		expect(result.reason).toBe("POLICY_INACTIVE");
	});

	test("should DENY access if the policy is expired", () => {
		const expiredConsent = {
			...mockConsent,
			expiresAt: new Date(Date.now() - 1000).toISOString(), // 1 second in the past
		};
		const request = { actorId: "dr-smith", purpose: "TREATMENT" };

		const result = evaluateConsent(expiredConsent, request);
		expect(result.allowed).toBe(false);
		expect(result.reason).toBe("POLICY_EXPIRED");
		expect(isConsentExpired(expiredConsent.expiresAt)).toBe(true);
	});

	test("should DENY access if actor is not on the allowed list", () => {
		const request = { actorId: "dr-evil", purpose: "TREATMENT" };

		const result = evaluateConsent(mockConsent, request);
		expect(result.allowed).toBe(false);
		expect(result.reason).toBe("ACTOR_NOT_PERMITTED");
	});

	test("should DENY access if purpose is unapproved", () => {
		const request = { actorId: "dr-smith", purpose: "RESEARCH" };

		const result = evaluateConsent(mockConsent, request);
		expect(result.allowed).toBe(false);
		expect(result.reason).toBe("PURPOSE_NOT_PERMITTED");
	});

	test("should DENY access if record matches an explicitly excepted category", () => {
		const request = {
			actorId: "dr-smith",
			purpose: "TREATMENT",
			dataCategory: "mental-health",
		};

		const result = evaluateConsent(mockConsent, request);
		expect(result.allowed).toBe(false);
		expect(result.reason).toBe("CATEGORY_EXCEPTED");
	});
});
