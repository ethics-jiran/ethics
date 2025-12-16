/**
 * Environment variable validation
 * Call validateEnv() at application startup to ensure all required env vars are set
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

const optionalEnvVars = [
  'CRON_SECRET',
  'SMTP_HOSTNAME',
  'SMTP_PORT',
  'SMTP_USERNAME',
  'SMTP_PASSWORD',
  'SMTP_FROM_EMAIL',
  'NEXT_PUBLIC_SITE_URL',
  'OUTBOX_BATCH_SIZE',
] as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];
type OptionalEnvVar = (typeof optionalEnvVars)[number];

interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required env vars
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Check optional but recommended env vars
  for (const key of optionalEnvVars) {
    if (!process.env[key]) {
      warnings.push(`${key} is not set (optional but recommended)`);
    }
  }

  const valid = missing.length === 0;

  if (!valid) {
    console.error('Missing required environment variables:', missing);
  }

  if (warnings.length > 0) {
    console.warn('Environment variable warnings:', warnings);
  }

  return { valid, missing, warnings };
}

/**
 * Get a required environment variable or throw
 */
export function getRequiredEnv(key: RequiredEnvVar): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get an optional environment variable with a default value
 */
export function getOptionalEnv(key: OptionalEnvVar, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}
