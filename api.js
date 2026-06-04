import axios from 'axios';

const API_BASE_URL='/api';
const api=axios.create({
  baseURL:API_BASE_URL,
  headers:{'Content-Type':'application/json',},});

api.interceptors.request.use(
  (config)=>{
    const token=localStorage.getItem('token');
    if(token){
      config.headers.Authorization=`Bearer ${token}`;
    }
    console.log('Request:',config.method,config.url);
    return config;
  },
  (error)=>Promise.reject(error)
);
api.interceptors.response.use(
  (response)=>{
    console.log('Response:',response.status);
    return response;
  },
  (error)=>{
    console.error('API Error:',error.response?.status, error.response?.data);
    if (error.response?.status===401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
export const authService = {
  register: (username, password) => api.post('/auth/register', { username, password }),
  login: (username, password) => api.post('/auth/login', { username, password }),
  getProfile: () => api.get('/user/profile'),
};
export const gameService = {
  getText: (difficulty = null) => {
    const url = difficulty ? `/game/text?difficulty=${difficulty}` : '/game/text';
    return api.get(url);
  },
  saveResult: (data) => api.post('/game/save-result', data),
  getUserResults: () => api.get('/game/user-results'),
  getTextsStats: () => api.get('/game/texts/stats'),
};
export const userService = {
  getStats: () => api.get('/user/stats'),
  getHistory: (limit = 20) => api.get(`/user/history?limit=${limit}`),
  getChartData: () => api.get('/user/chart-data'),
  getAchievements: () => api.get('/user/achievements'),
  getWeeklySummary: () => api.get('/user/weekly-summary'),
  changePassword: (oldPassword, newPassword) => api.post('/user/change-password', { 
    old_password: oldPassword, 
    new_password: newPassword 
  }),
  deleteAccount: () => api.delete('/user/delete-account'),
  getSettings: () => api.get('/user/settings'),
  saveSettings: (settings) => api.post('/user/settings', settings),
};

export const leaderboardService = {
  getLeaderboard: (period = 'all', limit = 20) => 
    api.get(`/leaderboard/?period=${period}&limit=${limit}`),
  getWeeklyLeaderboard: () => api.get('/leaderboard/weekly'),
  getRecentScores:()=>api.get('/leaderboard/recent'),
};
export default api;