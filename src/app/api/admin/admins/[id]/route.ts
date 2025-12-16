import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/auth/verify-admin';

// Update notification settings for a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: user_id } = await params;

  // Check auth + MFA (AAL2)
  const authResult = await verifyAdmin(supabase);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const {
      receive_notifications,
      notify_email,
      notify_message,
      notify_notification,
    } = body;

    // Build partial update object with only provided fields
    const updatePayload: Record<string, boolean> = {};
    if (typeof receive_notifications === 'boolean') {
      updatePayload.receive_notifications = receive_notifications;
    }
    if (typeof notify_email === 'boolean') {
      updatePayload.notify_email = notify_email;
    }
    if (typeof notify_message === 'boolean') {
      updatePayload.notify_message = notify_message;
    }
    if (typeof notify_notification === 'boolean') {
      updatePayload.notify_notification = notify_notification;
    }

    // Require at least one updatable field
    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: 'At least one of receive_notifications, notify_email, notify_message, notify_notification is required' },
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
        .update(updatePayload)
        .eq('user_id', user_id)
        .select()
        .single();

      data = result.data;
      error = result.error;
    } else {
      // Create new settings
      const result = await supabase
        .from('admin_settings')
        .insert({ user_id, ...updatePayload })
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
