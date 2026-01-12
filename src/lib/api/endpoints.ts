export const API_ENDPOINTS = {
  // Authentication endpoint
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },

  // users endpoint
  USER: {
    LIST: '/users',
    DELETE: (user_id: number) => `/users/delete/${user_id}`,
  },

  // Dashboard endpoint
  DASHBOARD: {
    LIST: '/dashboard',
    ADMINS: {
      LIST: '/dashboard/admin',
    }
  },

  // profile endpoint
  PROFILE: {
    UPDATE: '/profile?name',
  },

  // Workspace endpoint
  WORKSPACE: {
    LIST: '/workspaces',
    DETAIL: (id: number) => `/workspaces/${id}`,
    CREATE: '/workspaces',
    UPDATE: (id: number) => `/workspaces/${id}`,
    SOFT_DELETE: (id: number) => `/workspaces/${id}`,
    HARD_DELETE: (id: number) => `/workspaces/${id}/permanent`,
    //workspace member
    MEMBERS: {
      LIST: (workspace_id: number) => `/workspaces/${workspace_id}/members`,
      ADD: (workspace_id: number) => `/workspaces/${workspace_id}/members`,
      SOFT_DELETE: (workspace_id: number, id: number) => `/workspaces/${workspace_id}/members/${id}`,
      HARD_DELETE: (workspace_id: number, id: number) => `/workspaces/${workspace_id}/members/${id}/permanent`,
    }
  },

  // project endpoint
  PROJECTS: {
    LIST: '/projects',
    DETAIL: (id: number) => `/projects/${id}`,
    CREATE: '/projects',
    UPDATE: (id: number) => `/projects/${id}`,
    SOFT_DELETE: (id: number) => `/projects/${id}`,
    HARD_DELETE: (id: number) => `/projects/${id}/permanent`,
    // projects members
    MEMBERS: {
      LIST: (project_id: number) => `/projects/${project_id}/members`,
      ADD: (project_id: number) => `/projects/${project_id}/members`,
      SOFT_DELETE: (project_id: number, id: number) => `/projects/${project_id}/members/${id}`,
      HARD_DELETE: (project_id: number, id: number) => `/projects/${project_id}/members/${id}/permanent`,
    },
    // Project Images
    IMAGES: {
      LIST: (project_id: number) => `/projects/${project_id}/images`,
      UPLOAD: (project_id: number) => `/projects/${project_id}/images`,
      DELETE: (project_id: number, image_id: number) =>
        `/projects/${project_id}/images/${image_id}`,
    }
  },

  // Task endpoint
  TASKS: {
    LIST: (workspace_id: number, project_id: number) =>
      `/workspaces/${workspace_id}/projects/${project_id}/tasks`,

    DETAIL: (workspace_id: number, project_id: number, task_id: number) =>
      `/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}`,

    CREATE: (workspace_id: number, project_id: number) =>
      `/workspaces/${workspace_id}/projects/${project_id}/tasks`,

    UPDATE: (workspace_id: number, project_id: number, task_id: number) =>
      `/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}`,

    SOFT_DELETE: (workspace_id: number, project_id: number, task_id: number) =>
      `/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}`,

    HARD_DELETE: (workspace_id: number, project_id: number, task_id: number) =>
      `/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/permanent`,

    // Task members
    MEMBERS: {
      LIST: (workspace_id: number, project_id: number, task_id: number) =>
        `/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/members`,

      ADD: (workspace_id: number, project_id: number, task_id: number) =>
        `/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/members`,

      SOFT_DELETE: (workspace_id: number, project_id: number, task_id: number, user_id: number) =>
        `/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/members/${user_id}`,

      HARD_DELETE: (workspace_id: number, project_id: number, task_id: number, user_id: number) =>
        `/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/members/${user_id}/permanent`,
    },

    // Task images
    IMAGES: {
      LIST: (workspace_id: number, project_id: number, task_id: number) =>
        `/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/images`,

      UPLOAD: (workspace_id: number, project_id: number, task_id: number) =>
        `/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/images`,

      DELETE: (workspace_id: number, project_id: number, task_id: number, image_id: number) =>
        `/workspaces/${workspace_id}/projects/${project_id}/tasks/${task_id}/images/${image_id}`,
    }
  },

  // members endpoint for user
  MEMBERS: {
    LIST: '/users',
    DETAIL: (id: number) => `/users/${id}`,
    UPDATE: (id: number) => `/users/${id}`,
    DELETE: (id: number) => `/users/${id}`,
  },

  // Web Socket endpoint
  ONLINE_USERS: {
    LIST: '/online-users',
    WS: (token: string, workspace_id: number) =>
      `/ws?token=${token}&workspace_id=${workspace_id}`,
  },
} as const;