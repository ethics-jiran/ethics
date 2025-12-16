import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/auth/verify-admin';

const updatePolicySchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(50000),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check auth + MFA (AAL2)
    const authResult = await verifyAdmin(supabase);
    if (!authResult.success) {
      return authResult.response;
    }

    // Parse and validate request body
    const body = await request.json();
    const validated = updatePolicySchema.parse(body);

    // Update policy
    const { data, error } = await supabase
      .from('policy')
      .update({
        title: validated.title,
        content: validated.content,
        updated_by: authResult.userId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating policy:', error);
      return NextResponse.json(
        { error: 'Failed to update policy' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error('Error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: err.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
