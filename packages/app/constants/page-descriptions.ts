/**
 * Page descriptions for help modal
 * These descriptions explain what each page does to help users understand the app flow
 */

export const PAGE_DESCRIPTIONS = {
  // Auth pages
  login:
    'Sign in to your HandymanKiosk account to access your dashboard, manage jobs, and connect with handymen or homeowners.',
  register:
    'Create a new account to start using HandymanKiosk. You can register as a homeowner to post jobs or as a handyman to find work.',
  'verify-phone':
    'Verify your phone number to secure your account and enable important notifications about your jobs and applications.',
  'forgot-password':
    "Reset your password if you've forgotten it. We'll send you an email with instructions to create a new password.",

  // Homeowner job management
  'create-job':
    'Create a new job listing to find the right handyman for your project. Add details like title, budget, location, and photos to attract qualified applicants. Once posted, handymen can apply and you can review their proposals.',
  'edit-job':
    'Update your job listing details. You can modify the title, description, budget, and other information. Note that you cannot edit jobs that are already assigned or completed.',
  'job-detail':
    "View complete details of your job posting including applications from handymen. You can edit or delete the job if it's still open. Check the applications section to review proposals from interested handymen.",
  'job-management':
    'Manage all your job postings in one place. View open jobs, track assigned projects, and see completed work. Tap on any job to see details and applications.',

  // Homeowner applications
  'review-applications':
    'Review proposals from handymen who applied to your job. Compare their estimated hours, pricing, and materials. Accept the best proposal to assign the job to that handyman.',

  // Handyman job pages
  'find-jobs':
    'Browse available jobs posted by homeowners in your area. Filter by category, location, or budget to find work that matches your skills. Tap on a job to view details and submit your proposal.',
  'job-detail-handyman':
    'View detailed information about a job posting. See the job description, location, budget, and homeowner requirements. If interested, submit your proposal with your estimated hours and pricing.',
  'apply-job':
    'Submit your proposal for this job. Include your estimated hours, total price, and any materials needed. You can also add notes to explain your approach or negotiate terms. Homeowners will review your proposal and may accept it.',
  'applied-jobs':
    "Track all jobs you've applied to. See the status of each application: pending review, accepted, or rejected. Once accepted, the job moves to your active workspace.",
  'application-detail':
    "View details of your submitted proposal. Check the current status and any messages from the homeowner. If your application is accepted, you'll be assigned to the job and can start working.",

  // Direct offers
  'create-direct-offer':
    'Send a direct job offer to a specific handyman you want to hire. This skips the public posting and application process. The handyman will receive your offer and can accept or decline.',
  'direct-offer-detail':
    "View details of a direct offer you sent to a handyman. Track whether it's pending, accepted, or declined. Once accepted, it becomes an active job in your workspace.",
  'direct-offers-list':
    "See all direct offers you've received from homeowners. Review the job details and decide whether to accept or decline each offer.",

  // Ongoing work
  'ongoing-dashboard':
    'Manage your active jobs here. Track progress, submit daily reports, request reimbursements for expenses, and communicate with the homeowner or handyman.',
  'daily-report':
    'Submit a daily report to update the homeowner on your progress. Include what work was completed, hours spent, and any issues encountered. This helps maintain transparency throughout the project.',
  reimbursement:
    'Request reimbursement for work-related expenses like materials, tools, or transportation. Upload receipts and provide details about each expense for the homeowner to review.',

  // Profile pages
  'edit-profile':
    'Update your profile information including your name, contact details, and profile picture. Keeping your profile up-to-date helps build trust with homeowners or handymen.',
  'view-profile':
    'View your public profile as others see it. Check your ratings, reviews, completed jobs, and other information that helps build your reputation on the platform.',

  // Chat
  chat: 'Communicate directly with homeowners or handymen about job details, scheduling, or any questions. Keep all your project conversations organized in one place.',
  conversations:
    'View all your active conversations with homeowners and handymen. Tap on any conversation to continue chatting or review past messages.',

  // Reviews
  reviews:
    'Read reviews and ratings from previous clients or handymen. Reviews help you make informed decisions when hiring or accepting work.',
} as const

export type PageDescriptionKey = keyof typeof PAGE_DESCRIPTIONS

/**
 * Get description for a specific page
 */
export function getPageDescription(key: PageDescriptionKey): string {
  return PAGE_DESCRIPTIONS[key]
}
