import type { SidebarItem } from '@/features/navigation/Sidebar';
import { CANDIDATE_ROUTES } from './routes.constants';

export const candidateSidebarRoutes: SidebarItem[] = [
  { label: 'Home', href: CANDIDATE_ROUTES.HOME },

  {
    label: 'Explore Internships',
    href: CANDIDATE_ROUTES.INTERNSHIPS,
    match: 'startsWith',
  },

  {
    label: 'My Applications',
    href: CANDIDATE_ROUTES.APPLICATIONS,
  },

  {
    label: 'Assessments',
    href: CANDIDATE_ROUTES.ASSESSMENTS,
    match: 'startsWith',
  },

  {
    label: 'Industry Readiness',
    href: CANDIDATE_ROUTES.INDUSTRY_READINESS,
  },
  {
    label: 'Subscription',
    href: CANDIDATE_ROUTES.SUBSCRIPTION,
  },

  {
    label: 'Profile',
    href: CANDIDATE_ROUTES.PROFILE_EDIT,
  },

  //  Logout exactly below Profile
  {
    label: 'Logout',
    action: () => {
      window.location.href = '/api/auth/logout';
    },
    variant: 'danger',
  },
];
