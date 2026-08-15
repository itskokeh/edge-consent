// export type ConsentStatus = "active" | "inactive" | "revoked";

export interface ConsentPolicy {
	id: string | number;
	patientId: string | number;
	status: "active" | "inactive" | "revoked";
	/** Date or Time */
	expiresAt: string | number | Date;
	/** The specific actors (eg., Dr. Smith, Heavens Well Hospital, 239743) allowed to view data */
	allowedActors: Array<string | number>;
	/** Allowed clinical purposes, eg., ['TREATMENT', 'RESEARCH', 'EMERGENCY'] */
	allowedPurposes: string[];
	/** Data categories explicitly blocked by the patient (eg., ['mental-health', 'hiv']) */
	exceptedCategories?: string[];
}

export interface AccessRequest {
	actorId: string | number;
	purpose: string;
	/** The classification category of the record being accessed */
	dataCategory?: string;
}

export interface Decision {
	allowed: boolean;
	reason:
		| "PERMITTED"
		| "POLICY_INACTIVE"
		| "POLICY_EXPIRED"
		| "ACTOR_NOT_PERMITTED"
		| "PURPOSE_NOT_PERMITTED"
		| "CATEGORY_EXCEPTED";
}
