// src/features/subscription/utils/referralShare.ts

export const getReferralLink = (code: string) => {
  // Safe check for SSR, though this is mostly used on client
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/auth/signup?ref=`;
};

export const getReferralShareText = (link: string) => {
  return `Join InternHire using my referral and get benefits 🎉\n`;
};

export const shareReferralContent = async (code: string) => {
  const link = getReferralLink(code);
  const text = getReferralShareText(link);

  // 1. Try Native Share (Mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'InternHire Referral',
        text,
        url: link,
      });
      return;
    } catch {
      // User cancelled, ignore
      return;
    }
  }

  // 2. Fallback to WhatsApp
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank');
};
