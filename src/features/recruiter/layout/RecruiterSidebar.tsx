'use client';

import Sidebar from '@/features/navigation/Sidebar';
import { recruiterSidebarRoutes } from '@/features/recruiter/routes.sidebar';

export default function RecruiterSidebar() {
  return <Sidebar items={recruiterSidebarRoutes} />;
}
