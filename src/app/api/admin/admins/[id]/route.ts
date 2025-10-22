import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Update notification settings for a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: user_id } = await params;

  // Check auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { receive_notifications } = body;

    // Validate that receive_notifications is provided
    if (receive_notifications === undefined) {
      return NextResponse.json(
        { error: 'receive_notifications is required' },
        { status: 400 }
      );
    }

    // Check if settings exist for this user
    const { data: existingSettings } = await supabase
      .from('admin_settings')
      .select('id')
      .eq('user_id', user_id)
      .single();

    let data;
    let error;

    if (existingSettings) {
      // Update existing settings
      const result = await supabase
        .from('admin_settings')
        .update({ receive_notifications })
        .eq('user_id', user_id)
        .select()
        .single();

      data = result.data;
      error = result.error;
    } else {
      // Create new settings
      const result = await supabase
        .from('admin_settings')
        .insert({ user_id, receive_notifications })
        .select()
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Update/Insert error:', error);
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
