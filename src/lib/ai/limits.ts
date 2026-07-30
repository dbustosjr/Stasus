/** Shared input / AI payload limits (server + client should match). */

export const MAX_SYMPTOM_NOTES_LENGTH = 2000;
export const MAX_SESSION_NOTES_LENGTH = 500;
export const MAX_CUSTOM_TRIGGER_LENGTH = 80;
export const MAX_TRIGGERS_PER_LOG = 20;
/** Cap duration for a single symptom episode (24 hours). */
export const MAX_DURATION_MINUTES = 24 * 60;
/** Cap a single exercise session length (3 hours). */
export const MAX_SESSION_DURATION_SECONDS = 3 * 60 * 60;

/**
 * Rolling 24h ceiling on Anthropic calls per user (ai_call_log rows).
 * Daily notes + occasional weekly/monthly regenerate stay under this for normal use.
 */
export const AI_CALLS_PER_USER_PER_DAY = 30;

export const MODEL_LOGS_JSON_MAX_CHARS = 12_000;
export const MODEL_MONTHLY_LOGS_JSON_MAX_CHARS = 14_000;
