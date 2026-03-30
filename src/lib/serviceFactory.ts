import { ReferralRepository } from '@/core/referral/referralRepository';
import { ReferralService } from '@/core/referral/referralService';
import { SubscriptionRepository } from '@/core/subscription/subscriptionRepository';
import { SubscriptionService } from '@/core/subscription/subscriptionService';
import { WalletRepository } from '@/core/wallet/walletRepository';
import { WalletService } from '@/core/wallet/walletService';

// Instantiate Repositories
const referralRepository = new ReferralRepository();
const walletRepository = new WalletRepository();
const subscriptionRepository = new SubscriptionRepository();

// Instantiate Services
export const referralService = new ReferralService(referralRepository);
export const walletService = new WalletService(walletRepository);

export const subscriptionService = new SubscriptionService(
  subscriptionRepository,
  referralService,
  walletService
);
