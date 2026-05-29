import { Suspense } from 'react';
import ClientComp from "./TestEnvironmentPage.jsx";

const SITE_URL = 'https://question.maarula.in';

export const metadata = {
  title: "Mock Test Interface | NIMCET & CUET-PG Practice | Mathem Solvex",
  description: "Experience the real exam environment with our mock test interface. Practice NIMCET and CUET-PG questions in a timed, computer-based test format to improve your speed and accuracy.",
  keywords: "NIMCET mock test, CUET PG mock test online, MCA entrance practice test, CBT exam simulator, NIMCET practice paper",
  alternates: {
    canonical: `${SITE_URL}/test`,
  },
  openGraph: {
    title: "Practice Test Environment | Mathem Solvex",
    description: "Build exam confidence with our realistic MCA entrance test simulator.",
    url: `${SITE_URL}/test`,
    type: "website",
    siteName: "Mathem Solvex by Maarula Classes",
  },
  twitter: {
    card: "summary",
    title: "Mock Test — NIMCET & CUET-PG Practice | Mathem Solvex",
    description: "Practice in a realistic exam environment.",
  },
};

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: 20,
      color: '#64748b',
      background: '#f1f5f9'
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '4px solid #e2e8f0',
        borderTopColor: 'var(--primary, #ff5e0e)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p>Preparing Exam Environment...</p>
    </div>
  );
}

export default async function Page({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ClientComp params={resolvedParams} searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

