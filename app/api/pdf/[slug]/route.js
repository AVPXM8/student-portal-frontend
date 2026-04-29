import { getPdfBySlug, getPdfPath } from '@/utils/pdf';
import fs from 'fs';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { slug } = await params;
  const pdfInfo = await getPdfBySlug(slug);

  if (!pdfInfo) {
    return new NextResponse('PDF not found', { status: 404 });
  }

  const filePath = getPdfPath(pdfInfo.fileName);

  if (!fs.existsSync(filePath)) {
    return new NextResponse('File not found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${pdfInfo.fileName}"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
