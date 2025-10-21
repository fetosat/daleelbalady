'use client';

import React from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import CoachDiet from '@/components/CoachDiet';

export default function CoachDietPage() {
  // Set the document title for this page
  useDocumentTitle('كوتش & دايت - دليل بلدي', 'Coach & Diet - Daleel Balady');

  return <CoachDiet />;
}
