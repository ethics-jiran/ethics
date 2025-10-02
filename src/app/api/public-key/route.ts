import { NextResponse } from 'next/server';

export async function GET() {
  const publicKey = process.env.RSA_PUBLIC_KEY;

  if (!publicKey) {
    return NextResponse.json(
      { error: 'Public key not configured' },
      { status: 500 }
    );
  }

  return NextResponse.json({ publicKey });
}
