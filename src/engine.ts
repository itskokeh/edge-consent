import type { ConsentType, RequestType, ResultType } from "./types";

/** Validates if an access request complies with a given healthcare consent policy. */
export function evaluateConsent(
	consent: ConsentType,
	request: RequestType,
): ResultType {
	if (consent.status !== "active") {
		return { allowed: false, reason: "POLICY_INACTIVE" };
	}

	if (isConsentExpired(consent.expiresAt)) {
		return { allowed: false, reason: "POLICY_EXPIRED" };
	}

	if (!consent.allowedActors.includes(request.actorId)) {
		return { allowed: false, reason: "ACTOR_NOT_PERMITTED" };
	}

	if (!consent.allowedPurposes.includes(request.purpose.toUpperCase())) {
		return { allowed: false, reason: "PURPOSE_NOT_PERMITTED" };
	}

	if (
		request.dataCategory &&
		consent.exceptedCategories?.includes(request.dataCategory.toLowerCase())
	) {
		return { allowed: false, reason: "CATEGORY_EXCEPTED" };
	}

	return { allowed: true, reason: "PERMITTED" };
}

/**
 * Quick helper utility to see if a policy is strictly expired.
 */
export const isConsentExpired = (
	expiresAt: string | number | Date,
): boolean => {
	return new Date(expiresAt) <= new Date();
};
