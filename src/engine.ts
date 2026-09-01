import type { AccessRequest, ConsentPolicy, Decision } from "./types";

/** Validates if an access request complies with a given healthcare consent policy. */
export function evaluateConsent(
	policy: ConsentPolicy,
	request: AccessRequest,
): Decision {
	if (policy.status !== "active") {
		return { allowed: false, reason: "POLICY_INACTIVE" };
	}

	if (isConsentExpired(policy.expiresAt)) {
		return { allowed: false, reason: "POLICY_EXPIRED" };
	}

	if (policy.allowedActors !== "*" && !policy.allowedActors.includes(request.actorId)) {
		return { allowed: false, reason: "ACTOR_NOT_PERMITTED" };
	}

	if (policy.allowedPurposes !== "*" && !policy.allowedPurposes.includes(request.purpose.toUpperCase())) {
		return { allowed: false, reason: "PURPOSE_NOT_PERMITTED" };
	}

	if (
		request.dataCategory &&
		policy.exceptedCategories?.includes(request.dataCategory.toLowerCase())
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
