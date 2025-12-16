export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('@/lib/env');
    const result = validateEnv();

    if (!result.valid) {
      console.error('='.repeat(60));
      console.error('FATAL: Missing required environment variables');
      console.error('Missing:', result.missing.join(', '));
      console.error('='.repeat(60));

      // In production, fail hard
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          `Missing required environment variables: ${result.missing.join(', ')}`
        );
      }
    }
  }
}
