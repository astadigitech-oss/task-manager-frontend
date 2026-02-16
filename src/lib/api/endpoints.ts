export const API_ENDPOINTS = {
  // Authentication endpoint
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },

  // users endpoint
  USER: {
    LIST: '/api/users',
    DELETE: (user_id: number) => `/api/users/delete/${user_id}`,
  },

  // Dashboard endpoint
  DASHBOARD: {
    LIST: '/api/dashboard',
    ADMINS: {
      LIST: '/api/dashboard/admin',
    }
  },

  // profile endpoint
  PROFILE: {
    UPDATE: '/api/profile?name',
    GET: '/api/profile',
  },


  // Workspace endpoint
  WORKSPACE: {
    LIST: '/api/workspaces',
    DETAIL: (id: number) => `/api/workspaces/${id}`,
    CREATE: '/api/workspaces',
    UPDATE: (id: number) => `/api/workspaces/${id}`,
    SOFT_DELETE: (id: number) => `/api/workspaces/${id}`,
    HARD_DELETE: (id: number) => `/api/workspaces/${id}/permanent`,
    //workspace member
    MEMBERS: {
      LIST: (workspace_id: number) => `/api/workspaces/${workspace_id}/members`,
      ADD: (workspace_id: number) => `/api/workspaces/${workspace_id}/members`,
      SOFT_DELETE: (workspace_id: number, id: number) => `/api/workspaces/${workspace_id}/members/${id}`,
      HARD_DELETE: (workspace_id: number, id: number) => `/api/workspaces/${workspace_id}/members/${id}/permanent`,
    },
    // Workspace Attendance
    ATTENDANCE: {
      ABSENSI: (workspace_id: number) => `/api/workspaces/${workspace_id}/attendances`,
      EXPORT: (workspace_id: number) => `/api/workspaces/${workspace_id}/attendances/export`,
    }
  },

  // project endpoint
  PROJECTS: {
    LIST: '/api/projects',
    DETAIL: (id: number) => `/api/projects/${id}`,
    CREATE: '/api/projects',
    UPDATE: (id: number) => `/api/projects/${id}`,
    SOFT_DELETE: (id: number) => `/api/projects/${id}`,
    HARD_DELETE: (id: number) => `/api/projects/${id}/permanent`,
    // projects members
    MEMBERS: {
      LIST: (project_id: number) => `/api/projects/${project_id}/members`,
      ADD: (project_id: number) => `/api/projects/${project_id}/members`,
      SOFT_DELETE: (project_id: number, id: number) => `/api/workspaces/${project_id}/members/${id}`,
      HARD_DELETE: (project_id: number, id: number) => `/api/workspaces/${project_id}/members/${id}/permanent`,
    },
    // Project Images
    IMAGES: {
      LIST: (project_id: number) => `/api/projects/${project_id}/images`,
      UPLOAD: (project_id: number) => `/api/projects/${project_id}/images`,
      DELETE: (project_id: number, image_id: number) =>
        `/api/projects/${project_id}/images/${image_id}`,
    }
  },

  // Task endpoint
  TASKS: {
    LIST: (workspace_id: number, project_id: number) =>
      `/api/workspaces/${workspace_id}/projects/${project_id}/tasks`,

    DETAIL: (workspace_id: number, project_id: number, task_id: number) =>
      `/api/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}`,

    CREATE: (workspace_id: number, project_id: number) =>
      `/api/workspaces/${workspace_id}/projects/${project_id}/tasks`,

    UPDATE: (workspace_id: number, project_id: number, task_id: number) =>
      `/api/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}`,

    UPDATE_ORDER: (workspace_id: number, project_id: number) =>
    `/api/workspaces/${workspace_id}/projects/${project_id}/tasks/reorder`,

    SOFT_DELETE: (workspace_id: number, project_id: number, task_id: number) =>
      `/api/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}`,

    HARD_DELETE: (workspace_id: number, project_id: number, task_id: number) =>
      `/api/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/permanent`,

    // Task members
    MEMBERS: {
      LIST: (workspace_id: number, project_id: number, task_id: number) =>
        `/api/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/members`,

      ADD: (workspace_id: number, project_id: number, task_id: number) =>
        `/api/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/members`,

      SOFT_DELETE: (workspace_id: number, project_id: number, task_id: number, user_id: number) =>
        `/api/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/members/${user_id}`,

      HARD_DELETE: (workspace_id: number, project_id: number, task_id: number, user_id: number) =>
        `/api/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/members/${user_id}/permanent`,
    },

    // Task images
    IMAGES: {
      LIST: (workspace_id: number, project_id: number, task_id: number) =>
        `/api/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/images`,

      UPLOAD: (workspace_id: number, project_id: number, task_id: number) =>
        `/api/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/images`,

      DELETE: (workspace_id: number, project_id: number, task_id: number, image_id: number) =>
        `/api/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/images/${image_id}`,
    }
  },

  // File 
  FILES: {
    LIST: (workspace_id: number, project_id: number, task_id: number) =>
      `/api/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/files`,
    UPLOAD: (workspace_id: number, project_id: number, task_id: number) =>
      `/api/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/files`,
    VIEW: (workspace_id: number, project_id: number, task_id: number, file_id: number) =>
      `/api/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/files/${file_id}/view`,
    DOWNLOAD: (workspace_id: number, project_id: number, task_id: number, file_id: number) =>
      `/api/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/files/${file_id}/download`,
    DELETE: (workspace_id: number, project_id: number, task_id: number, file_id: number) =>
      `/api/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/files/${file_id}`,
  },

  EXPORT: {
    // DAILY: (project_id: number) => `/api/projects/${project_id}/export/daily`,
    MONITORING: (project_id: number) => `/api/projects/${project_id}/export/monitoring`,
    WEEKLY_FORWARD: (project_id: number) => `/api/projects/${project_id}/export/weekly-forward`,
    WEEKLY_BACKWARD: (project_id: number) => `/api/projects/${project_id}/export/weekly-backward`,
  },

  // Web Socket endpoint
  ONLINE_USERS: {
    ADMIN: '/api/online-users',
    USER: (workspace_id: number) =>
      `/api/workspaces/${workspace_id}/online-members`,
    WS: (token: string, workspace_id?: number) =>
      workspace_id
        ? `/ws?token=${token}&workspace_id=${workspace_id}`
        : `/ws?token=${token}`,
  },
} as const;

