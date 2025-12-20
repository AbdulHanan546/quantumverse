import axios from 'axios';

export const cmsUrl: string = import.meta.env.VITE_CMS_BASE_URL || 'http://localhost:5000/';

export const cms = axios.create({
  baseURL: cmsUrl,
  timeout: 120000, // 2 minutes for long-running requests like AI generation
});

// Response interceptor
// api.interceptors.response.use(
//   (response) => response,
//   (error: AxiosError) => {
//     if (error.response?.status === 401) {
//       tokenStorage.clear();
//       if (
//         !location.pathname.startsWith('/signin') &&
//         !location.pathname.startsWith('/signup')
//       ) {
//         location.href = '/';
//       }
//     }
//     return Promise.reject(error);
//   }
// );
