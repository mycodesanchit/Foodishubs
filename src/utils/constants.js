export const COOKIE_MAX_AGE_1_YEAR = 365 * 24 * 60 * 60

const NEXT_PUBLIC_APP_NAME = process.env.NEXT_PUBLIC_APP_NAME

export const AUTHORIZATION_TOKEN_KEY_NAME = 'nourishubs-user-auth-token'
export const USER_ROLE_KEY_NAME = 'nourishubs-user-role'
export const USER_ID_KEY_NAME = 'nourishubs-user-id'
export const DEFAULT_ERROR_MESSAGE = 'Whoops, looks like something went wrong. Please try again!'

export const SITE_SEO_CONTENT = {
  socialPreviewTitle: NEXT_PUBLIC_APP_NAME,
  socialPreviewTitlePrefix: `${NEXT_PUBLIC_APP_NAME} |`,
  socialPreviewDescription:
    'Welcome to Nourishubs, where we offer healthy options for school meals. Join us in promoting nutritious meals for students and making healthy eating accessible for families.',
  socialPreviewKeywords: 'keywords, with, comma, separated, here',
  socialPreviewLogo: '/images/social-preview-logo.png'
}

export const SUPPORT_EMAIL_ADDRESS = 'info@nourishubs.com'
export const SUPPORT_PHONE_NUMBER = '+1 000-000-0000'

export const AOS_INIT_CONFIG_OPTIONS = {
  duration: 750, // Animation duration in milliseconds
  // offset: 200 // Offset from the original trigger point
  once: true // Whether animation should happen only once
}
