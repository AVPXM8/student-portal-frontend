import { getPdfBySlug } from '@/utils/pdf';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { slug } = await params;
  const pdfInfo = await getPdfBySlug(slug);

  if (!pdfInfo) {
    return new NextResponse('PDF not found', { status: 404 });
  }

  const url = new URL(`/pyqPdf/${encodeURIComponent(pdfInfo.fileName)}`, request.url);
  return NextResponse.redirect(url, { status: 301 });
}
