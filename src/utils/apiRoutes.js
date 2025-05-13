export const API_ROUTER = {
  // User Management Routes
  USER_MANAGEMENT: '/v1/user-management',
  USER_MANAGEMENT_SUSPENDED: '/v1/user-management/suspended',
  USER_MANAGEMENT_STATISTICS: '/v1/user-management/statistics',

  // Staff Managemtn Routes
  STAFF_MANAGEMENT: '/v1/staff-management',

  //Order Management Routes
  SUPER_ADMIN_VENDOR_MANAGEMENT_THRESHOLD: '/v1/superadmin-vendormanagement/threshold',

  //Menu Management Routes
  ADD_FOOD_CATEGORY: '/v1/foodcategory',
  UPDATE_FOOD_CATEGORY: id => `/v1/foodcategory/${id}`,
  GET_CATEGORY_BY_ID: '/api/v1/foodcategory',
  GET_FOOD_CATEGORY: '/v1/foodcategory',
  ADD_FOOD_DISH: '/v1/dish',
  GET_FOOD_DISH: '/v1/dish',
  ADD_MODIFIER_DISH: '/v1/modifier',

  // Vendor Management Routes
  VENDOR_MANAGEMENT: '/v1/superadmin-vendormanagement',
  VENDOR_BY_ID: id => `/v1/superadmin-vendormanagement/${id}`,
  DOCUMENT_VERIFICATION_REQUESTS: '/v1/superadmin-vendormanagement/documnets',
  VENDOR_BY_ID: id => `/v1/superadmin-vendormanagement/${id}`,
  VENDOR_APPROVE_REJECT: id => `/v1/superadmin-vendormanagement/document-request/${id}`,

  CONTACT_US_INQUIRY_TABLE: '/v1/contactus'
}
