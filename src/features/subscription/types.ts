export type SubscriptionRole = 'candidate' | 'recruiter';

export interface BaseSubscriptionConfig {
  role: SubscriptionRole;
  title: string;
  price: number;
  isActive: boolean;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string | null;
}
