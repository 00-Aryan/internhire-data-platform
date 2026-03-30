interface ApplicationErrorResponse {
  error?: string;
  missing?: string[];
}

export function mapApplicationError(
  response: ApplicationErrorResponse
): {
  title: string;
  message: string;
  items?: string[];
} {
  switch (response.error) {
    case 'PROFILE_INCOMPLETE':
      return {
        title: 'Profile Incomplete',
        message: 'Please complete the following before applying:',
        items: response.missing,
      };

    case 'ALREADY_APPLIED':
      return {
        title: 'Already Applied',
        message: 'You have already applied for this opportunity.',
      };

    case 'JOB_NOT_FOUND':
      return {
        title: 'Job Not Available',
        message: 'This job listing is no longer available.',
      };

    default:
      return {
        title: 'Application Failed',
        message: 'Something went wrong. Please try again.',
      };
  }
}
