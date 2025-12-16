import { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export type AuthResult =
  | { success: true; userId: string }
  | { success: false; response: NextResponse };

/**
 * Verify admin user with MFA (AAL2) requirement
 * Returns user ID if authenticated with MFA, or error response
 */
export async function verifyAdmin(
  supabase: SupabaseClient
): Promise<AuthResult> {
  // Check user authentication
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  // Check MFA (AAL2) level
  const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (!mfaData || mfaData.currentLevel !== 'aal2') {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'MFA required' },
        { status: 403 }
      ),
    };
  }

  return { success: true, userId: user.id };
}
