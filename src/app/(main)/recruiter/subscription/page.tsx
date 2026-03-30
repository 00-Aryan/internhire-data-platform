// import { getSessionUser } from '@/core/auth/authUtils';
// import { redirect } from 'next/navigation';
// import {
//   SUBSCRIPTION_PLANS,
//   hasRecruiterActiveSubscription,
// } from '@/core/subscription/subscriptionUtils.legacy';

// export default async function RecruiterSubscriptionPage() {
//   const user = await getSessionUser();

//   if (!user || !user.recruiterProfile) {
//     redirect('/auth/login');
//   }

//   const isActive = hasRecruiterActiveSubscription(
//     user.recruiterProfile.subscriptionExpiry,
//     user.email
//   );

//   return (
//     <BaseSubscriptionPage
//       config={{
//         role: 'recruiter',
//         title: 'Recruiter Subscription',
//         price: SUBSCRIPTION_PLANS.recruiter.price,
//         isActive,
//         userId: user.recruiterProfile.id,
//         userName: user.name,
//         userEmail: user.email,
//         userPhone: user.phone,
//       }}
//     />
//   );
// }
