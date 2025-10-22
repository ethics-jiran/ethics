import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Note: MFA is enforced by RLS RESTRICTIVE policy
  // RLS checks: auth.jwt() ->> 'aal' = 'aal2'

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  try {
    // Get all users from auth using admin client
    const adminClient = createAdminClient();
    const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers();

    if (usersError) {
      console.error('Users fetch error:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Get admin settings
    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('*');

    if (settingsError) {
      console.error('Settings fetch error:', settingsError);
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    // Create a map of settings by user_id
    const settingsMap = new Map(
      settings?.map(s => [s.user_id, s]) || []
    );

    // Combine auth users with their settings
    let admins = users.map(authUser => {
      const userSettings = settingsMap.get(authUser.id);
      return {
        id: authUser.id,
        email: authUser.email || '',
        created_at: authUser.created_at,
        receive_notifications: userSettings?.receive_notifications ?? true,
        settings_id: userSettings?.id || null,
      };
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      admins = admins.filter(admin =>
        admin.email.toLowerCase().includes(searchLower)
      );
    }

    // Sort by creation date
    admins.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({
      data: admins,
      total: admins.length,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

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
    const { user_id, receive_notifications = true } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Check if settings already exist
    const { data: existingSettings } = await supabase
      .from('admin_settings')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (existingSettings) {
      return NextResponse.json(
        { error: 'Settings for this user already exist' },
        { status: 409 }
      );
    }

    // Insert new settings
    const { data, error } = await supabase
      .from('admin_settings')
      .insert({
        user_id,
        receive_notifications,
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
