'use client';
import React, { useState, ReactNode } from 'react';
import {
  NotificationContext,
  NotificationState,
  PaymentSuccessData,
  ApplicationSuccessData
} from './NotificationContext';

interface NotificationProviderProps {
  children: ReactNode;
}

const initialState: NotificationState = {
  isVisible: false,
  type: null,
  title: '',
  message: '',
  metadata: {},
  onConfirm: undefined,
  onClose: undefined,
};

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [state, setState] = useState<NotificationState>(initialState);

  const showPaymentSuccess = (data: PaymentSuccessData) => {
    setState({
      isVisible: true,
      type: 'payment_success',
      title: 'Payment Successful!',
      message: `You have successfully subscribed to the ${data.planName} plan for ₹${data.amount}.`,
      metadata: data,
    });
  };

  const showApplicationSuccess = (data: ApplicationSuccessData) => {
    const companyText = data.companyName ? ` at ${data.companyName}` : '';
    setState({
      isVisible: true,
      type: 'application_submitted',
      title: 'Application Submitted',
      message: `Your application for ${data.jobTitle}${companyText} has been sent successfully.`,
      metadata: data,
    });
  };

  const showCustomSuccess = (title: string, message: string, metadata: any = {}, onClose?: () => void) => {
    setState({
      isVisible: true,
      type: 'custom',
      title,
      message,
      metadata,
      onClose,
    });
  };

  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setState({
      isVisible: true,
      type: 'confirmation',
      title,
      message,
      metadata: {},
      onConfirm,
    });
  };

  //  Add this function
  const showError = (title: string, message: string) => {
    setState({
      isVisible: true,
      type: 'error',
      title,
      message,
      metadata: {},
    });
  };

  const showVerificationRequired = (title: string, message: string, onResend: () => void) => {
    setState({
      isVisible: true,
      type: 'verification_required',
      title,
      message,
      metadata: {},
      onConfirm: onResend,
    });
  };

  const hide = () => {
    setState((prev) => ({ ...prev, isVisible: false }));
  };

  return (
    <NotificationContext.Provider
      value={{ 
        ...state, 
        showPaymentSuccess, 
        showApplicationSuccess, 
        showCustomSuccess, 
        showConfirmation, 
        showError, //  Add this
        showVerificationRequired,
        hide 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}