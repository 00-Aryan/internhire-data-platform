'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

interface PaymentButtonProps {
  candidateId: string;
  candidateEmail: string;
  referralCode?: string | null;
  couponCode?: string | null;
}

export default function PaymentButton({
  candidateId,
  candidateEmail,
  referralCode,
  couponCode,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if ((window as any).Razorpay) setSdkReady(true);
  }, []);

  const handlePayment = async () => {
    if (loading || !sdkReady) return;
    setLoading(true);

    try {
      /* 1️⃣ Create PENDING subscription */
      const pendingRes = await fetch('/api/subscription/create-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          candidateEmail,
          referralCode,
          couponCode,
        }),
      });

      if (!pendingRes.ok) {
        throw new Error('Failed to create pending subscription');
      }

      const { subscriptionId, pricePaid } = await pendingRes.json();

      /* 2️⃣ Create Razorpay order */
      const orderRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_order',
          amount: pricePaid,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error('Order creation failed');
      }

      /* 3️⃣ Open Razorpay */
      const rzp = new (window as any).Razorpay({
        key: orderData.keyId,
        order_id: orderData.order.id,
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'InternHire',
        description: 'Subscription',
        handler: async (resp: any) => {
          const verify = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'verify_payment',
              subscriptionId,
              candidateId,
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
              amount: pricePaid,
            }),
          });

          const result = await verify.json();
          if (!result.success) {
            throw new Error('Payment verification failed');
          }

          router.refresh();
        },
        prefill: { email: candidateEmail },
        theme: { color: '#2563eb' },
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />

      <button
        onClick={handlePayment}
        disabled={loading || !sdkReady}
        className="w-full bg-gray-600 hover:bg-gray-900 text-white font-bold py-3 rounded-xl disabled:opacity-60"
      >
        {loading ? 'Processing…' : 'Payment Now'}
      </button>
    </>
  );
}
