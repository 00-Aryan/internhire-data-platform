import { createContext } from 'react';

export type NotificationType = 'payment_success' | 'application_submitted' | 'profile_updated' | 'custom' | 'confirmation' | 'error' | 'verification_required';

export interface PaymentSuccessData {
  amount: number;
  planName: string;
  validUntil?: string;
}

export interface ApplicationSuccessData {
  jobTitle: string;
  companyName?: string;
}

export interface NotificationState {
  isVisible: boolean;
  type: NotificationType | null;
  title: string;
  message: string;
  metadata: Record<string, any>;
  onConfirm?: () => void;
  onClose?: () => void;
}

export interface NotificationContextType extends NotificationState {
  showPaymentSuccess: (data: PaymentSuccessData) => void;
  showApplicationSuccess: (data: ApplicationSuccessData) => void;
  showCustomSuccess: (title: string, message: string, metadata?: any, onClose?: () => void) => void;
  showConfirmation: (title: string, message: string, onConfirm: () => void) => void;
  showError: (title: string, message: string) => void; //  Add this line
  showVerificationRequired: (title: string, message: string, onResend: () => void) => void;
  hide: () => void;
}

// Create the context with undefined as initial value
export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);