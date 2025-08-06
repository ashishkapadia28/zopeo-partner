const BASE_PATH = '/partner';

export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
  },
  SELLER: {
    DASHBOARD: '/seller/dashboard',
    PROFILE: '/seller/profile',
    PRODUCTS: {
      LIST: '/seller/products',
      CREATE: '/seller/products/create',
      EDIT: '/seller/products/:id/edit',
      VIEW: '/seller/products/:id',
    },
    ORDERS: {
      LIST: '/seller/orders',
      VIEW: '/seller/orders/:id',
    },
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    SELLERS: {
      LIST: '/admin/sellers',
      VIEW: '/admin/sellers/:id',
      VERIFICATION: '/admin/sellers/verification',
    },
  },
  ERROR: {
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/401',
    SERVER_ERROR: '/500',
  },
} as const;

export default ROUTES;
