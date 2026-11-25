const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

async function placeholder(method, resource) {
  throw new Error(
    `TouristCare API integration not configured. ${method} ${resource} requires VITE_API_BASE_URL.`
  )
}

export const touristCareApi = {
  getProfile: () => placeholder('GET', '/profile'),
  uploadDocument: () => placeholder('POST', '/documents'),
  submitIncident: () => placeholder('POST', '/incidents'),
  getCases: () => placeholder('GET', '/cases'),
  submitSupportRequest: () => placeholder('POST', '/support-requests'),
  getStaffReports: () => placeholder('GET', '/staff/reports'),
  login: () => placeholder('POST', '/auth/login'),
}
