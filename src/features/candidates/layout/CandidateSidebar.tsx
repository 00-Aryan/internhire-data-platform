'use client';

import Sidebar from '@/features/navigation/Sidebar';
import { candidateSidebarRoutes } from '@/features/candidates/routes';

export default function CandidateSidebar() {
  return <Sidebar items={candidateSidebarRoutes} />;
}
