import { z } from 'zod';
import { 
  insertUserSchema, 
  insertTaskSchema, 
  insertWithdrawalSchema, 
  insertAnnouncementSchema, 
  insertReferralSettingSchema,
  users, 
  tasks, 
  withdrawals, 
  announcements, 
  referralSettings,
  referrals
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register',
      input: insertUserSchema.extend({
        referralCode: z.string().optional(), // For the referrer's code
      }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks',
      responses: {
        200: z.array(z.custom<typeof tasks.$inferSelect & { completed: boolean }>()),
      },
    },
    complete: {
      method: 'POST' as const,
      path: '/api/tasks/:id/complete', // Used for testing mostly, real completion is via postback
      responses: {
        200: z.object({ message: z.string() }),
        400: errorSchemas.validation,
      },
    }
  },
  withdrawals: {
    list: {
      method: 'GET' as const,
      path: '/api/withdrawals',
      responses: {
        200: z.array(z.custom<typeof withdrawals.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/withdrawals',
      input: insertWithdrawalSchema,
      responses: {
        201: z.custom<typeof withdrawals.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  announcements: {
    list: {
      method: 'GET' as const,
      path: '/api/announcements',
      responses: {
        200: z.array(z.custom<typeof announcements.$inferSelect>()),
      },
    },
  },
  referrals: {
    list: {
      method: 'GET' as const,
      path: '/api/referrals',
      responses: {
        200: z.array(z.custom<typeof referrals.$inferSelect>()),
      },
    },
    stats: {
        method: 'GET' as const,
        path: '/api/referrals/stats',
        responses: {
            200: z.object({
                totalReferrals: z.number(),
                paidReferrals: z.number(),
                pendingReferrals: z.number(),
                totalEarnings: z.string(),
            })
        }
    }
  },
  // ADMIN ROUTES
  admin: {
    users: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/users',
        responses: {
          200: z.array(z.custom<typeof users.$inferSelect>()),
        },
      },
      update: {
        method: 'PATCH' as const,
        path: '/api/admin/users/:id',
        input: z.object({
          isActive: z.boolean().optional(),
          role: z.string().optional(),
        }),
        responses: {
          200: z.custom<typeof users.$inferSelect>(),
        },
      },
    },
    tasks: {
      create: {
        method: 'POST' as const,
        path: '/api/admin/tasks',
        input: insertTaskSchema,
        responses: {
          201: z.custom<typeof tasks.$inferSelect>(),
        },
      },
      list: {
        method: 'GET' as const,
        path: '/api/admin/tasks',
        responses: {
            200: z.array(z.custom<typeof tasks.$inferSelect>()),
        }
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/admin/tasks/:id',
        responses: {
            200: z.object({ message: z.string() }),
        }
      }
    },
    withdrawals: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/withdrawals',
        responses: {
          200: z.array(z.custom<typeof withdrawals.$inferSelect & { username: string; country: string }>()),
        },
      },
      update: {
        method: 'PATCH' as const,
        path: '/api/admin/withdrawals/:id',
        input: z.object({
          status: z.enum(['pending', 'approved', 'rejected']),
        }),
        responses: {
          200: z.custom<typeof withdrawals.$inferSelect>(),
        },
      },
    },
    referralSettings: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/referral-settings',
        responses: {
          200: z.array(z.custom<typeof referralSettings.$inferSelect>()),
        },
      },
      update: {
        method: 'POST' as const,
        path: '/api/admin/referral-settings',
        input: insertReferralSettingSchema,
        responses: {
          200: z.custom<typeof referralSettings.$inferSelect>(),
        },
      },
    },
    announcements: {
        create: {
            method: 'POST' as const,
            path: '/api/admin/announcements',
            input: insertAnnouncementSchema,
            responses: {
                201: z.custom<typeof announcements.$inferSelect>(),
            }
        },
        delete: {
            method: 'DELETE' as const,
            path: '/api/admin/announcements/:id',
            responses: {
                200: z.object({ message: z.string() })
            }
        }
    }
  },
  // PUBLIC POSTBACK
  postback: {
    ogads: {
      method: 'GET' as const,
      path: '/api/postback/ogads', // Standard postback URL
      input: z.object({
        user_id: z.string(),
        task_id: z.string(),
        // Add other OGAds parameters as needed
      }).passthrough(),
      responses: {
        200: z.string(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
