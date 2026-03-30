'use client';

import { Suspense } from 'react';
import ForgotPasswordContent from './ForgotPasswordContent';
export default function ForgotPasswordPage() {

  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  );
}

