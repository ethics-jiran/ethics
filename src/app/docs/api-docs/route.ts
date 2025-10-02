import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'src', 'app', 'docs', 'api-docs', 'api-docs.html');
  const htmlContent = fs.readFileSync(filePath, 'utf-8');

  return new NextResponse(htmlContent, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
