import type { SidebarItem } from '@/features/navigation/Sidebar';
import { RECRUITER_ROUTES } from './routes.constants';

export const recruiterSidebarRoutes: SidebarItem[] = [
  { label: 'Home', href: RECRUITER_ROUTES.HOME },
  { label: 'Post New Internship', href: RECRUITER_ROUTES.POST_NEW, match: 'startsWith' },
  { label: 'Your Drafts', href: RECRUITER_ROUTES.DRAFTS, match: 'startsWith' },
  { label: 'Posted Internships', href: RECRUITER_ROUTES.POSTED_JOBS, match: 'startsWith' },
 
  { label: 'Subscription Plan', href: RECRUITER_ROUTES.SUBSCRIPTION },
  { label: 'Profile', href: RECRUITER_ROUTES.PROFILE_EDIT },

  
  {
    label: 'Logout',
    action: () => {
      window.location.href = '/api/auth/logout';
    },
    variant: 'danger',
  },
];
