import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const studentService = {
  getAll: () => api.get('/students'),
  getById: (id: string) => api.get(`/students/${id}`),
  create: (data: any) => api.post('/students', data),
  update: (id: string, data: any) => api.put(`/students/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch(`/students/${id}/status`, { status }),
  addFlag: (id: string, flag: string) => api.post(`/students/${id}/flags`, { flag }),
  removeFlag: (id: string, flag: string) => api.delete(`/students/${id}/flags/${flag}`),
};

export const kitService = {
  getAll: () => api.get('/kits'),
  getById: (id: string) => api.get(`/kits/${id}`),
  create: (data: any) => api.post('/kits', data),
  update: (id: string, data: any) => api.put(`/kits/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch(`/kits/${id}/status`, { status }),
  addComponent: (id: string, data: any) => api.post(`/kits/${id}/components`, data),
  updateComponent: (kitId: string, componentId: string, data: any) => 
    api.put(`/kits/${kitId}/components/${componentId}`, data),
  removeComponent: (kitId: string, componentId: string) => 
    api.delete(`/kits/${kitId}/components/${componentId}`),
};

export const borrowService = {
  getAll: () => api.get('/borrow'),
  getById: (id: string) => api.get(`/borrow/${id}`),
  getByStudent: (studentId: string) => api.get(`/borrow/student/${studentId}`),
  getByKit: (kitId: string) => api.get(`/borrow/kit/${kitId}`),
  create: (data: any) => api.post('/borrow', data),
  returnKit: (id: string, data: any) => api.post(`/borrow/${id}/return`, data),
  updateStatus: (id: string, status: string) => api.patch(`/borrow/${id}/status`, { status }),
};

export const adminService = {
  getConfig: () => api.get('/admin/config'),
  updateConfig: (data: any) => api.put('/admin/config', data),
  getNotifications: () => api.get('/admin/notifications'),
  updateNotifications: (data: any) => api.put('/admin/notifications', data),
  runRetention: () => api.post('/admin/retention'),
  getStats: () => api.get('/admin/stats'),
};