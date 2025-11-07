import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

const BATCH_SIZE = Number(process.env.OUTBOX_BATCH_SIZE || 25);
const CRON_SECRET = process.env.CRON_SECRET;

async function handle(req: NextRequest) {
  // Cron auth per Vercel docs: Authorization: Bearer <CRON_SECRET>
  if (CRON_SECRET) {
    const url = new URL(req.url);
    const qsToken = url.searchParams.get('token');
    const auth = req.headers.get('authorization');
    const bearerOk = auth && auth.trim().toLowerCase().startsWith('bearer ')
      ? auth.trim().slice(7) === CRON_SECRET
      : false;
    const legacyKey = req.headers.get('x-cron-key');
    const tokenOk = qsToken === CRON_SECRET;
    if (!bearerOk && legacyKey !== CRON_SECRET && !tokenOk) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Helper to claim a job atomically
  const claimJob = async (id: string) => {
    const { data, error } = await supabase
      .from('notification_outbox')
      .update({ status: 'processing', locked_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'pending')
      .lte('next_attempt_at', new Date().toISOString())
      .select()
      .single();
    if (error || !data) return null;
    return data as any;
  };

  // Fetch candidates (pending and due)
  const { data: candidates, error: selErr } = await supabase
    .from('notification_outbox')
    .select('*')
    .eq('status', 'pending')
    .lte('next_attempt_at', new Date().toISOString())
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (selErr) {
    console.error('[Outbox] select error:', selErr);
    return NextResponse.json({ error: 'Select failed' }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const results: any[] = [];
  console.log('[Outbox] picked', (candidates || []).length, 'jobs (batch size =', BATCH_SIZE, ')');

  for (const cand of candidates || []) {
    // try claim
    const job = await claimJob(cand.id);
    if (!job) continue; // another worker claimed

    const attempt = async () => {
      try {
        const payload = job.payload || {};
        const startedAt = Date.now();
        console.log('[Outbox] processing id=', job.id, 'type=', job.type, 'attempt=', (job.attempts || 0) + 1);
        if (job.type === 'submit_user_email') {
          // Send auth code email
          const resp = await fetch(`${baseUrl}/api/email/send-auth-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: payload.email,
              authCode: payload.auth_code,
              inquiryId: payload.inquiry_id,
            }),
          });
          console.log('[Outbox] user_email id=', job.id, 'http_ok=', resp.ok, 'status=', resp.status);
        } else if (job.type === 'submit_admin_notify') {
          // Get admins and settings
          const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers();
          if (!usersError && users && users.length > 0) {
            const { data: settings } = await supabase
              .from('admin_settings')
              .select('*')
              .eq('receive_notifications', true);

            const notificationUserIds = new Set((settings || []).map((s: any) => s.user_id));
            const adminsToNotify = users.filter((u: any) => {
              const hasSettings = settings?.some((s: any) => s.user_id === u.id);
              return !hasSettings || notificationUserIds.has(u.id);
            });

            const dispatchResults = await Promise.allSettled(
              adminsToNotify.map((admin: any) =>
                fetch(`${baseUrl}/api/notification/send-admin`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    adminId: admin.id,
                    adminEmail: admin.email,
                    inquiryId: payload.inquiry_id,
                  }),
                })
              )
            );
            const fulfilled = dispatchResults.filter(r => r.status === 'fulfilled') as PromiseFulfilledResult<Response>[];
            const okCount = fulfilled.filter(r => r.value.ok).length;
            const notOkCount = fulfilled.length - okCount;
            const rejected = dispatchResults.length - fulfilled.length;
            console.log('[Outbox] admin_notify id=', job.id, 'targets=', adminsToNotify.length, 'http_ok=', okCount, 'http_not_ok=', notOkCount, 'rejected=', rejected);
          }
        }

        // Mark sent
        await supabase
          .from('notification_outbox')
          .update({ status: 'sent', updated_at: new Date().toISOString() })
          .eq('id', job.id);
        const durationMs = Date.now() - startedAt;
        results.push({ id: job.id, ok: true, type: job.type, ms: durationMs });
        console.log('[Outbox] done id=', job.id, 'type=', job.type, 'ms=', durationMs);
      } catch (e: any) {
        const attempts = (job.attempts || 0) + 1;
        const backoffMinutes = Math.min(60, 5 * attempts); // 5m,10m,15m... capped 60m
        const nextAttempt = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString();
        await supabase
          .from('notification_outbox')
          .update({
            status: 'pending',
            attempts,
            next_attempt_at: nextAttempt,
            last_error: String(e?.message || e),
            updated_at: new Date().toISOString(),
            locked_at: null,
            locked_by: null,
          })
          .eq('id', job.id);
        console.error('[Outbox] failed id=', job.id, 'type=', job.type, 'attempts=', attempts, 'next=', nextAttempt, 'error=', String(e?.message || e));
        results.push({ id: job.id, ok: false, type: job.type, attempts, next_attempt_at: nextAttempt, error: String(e?.message || e) });
      }
    };

    await attempt();
  }

  const ok = results.filter(r => r.ok).length;
  const failed = results.length - ok;
  console.log('[Outbox] summary processed=', results.length, 'ok=', ok, 'failed=', failed);
  return NextResponse.json({ processed: results.length, ok, failed, results });
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
