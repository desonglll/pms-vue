import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'
import { ElMessage } from 'element-plus'

const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

http.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

http.interceptors.response.use(
  (res) => {
    const body = res.data
    if (body.code && body.code !== 200) {
      const msg = body.message || '请求失败'
      ElMessage.error(msg)
      return Promise.reject(new Error(msg))
    }
    return { ...res, data: body.data }
  },
  (err) => {
    const status = err.response?.status
    if (status === 401) {
      const auth = useAuthStore()
      auth.logout()
      router.push({ name: 'login' })
    } else if (status === 403) {
      ElMessage.error('权限不足')
    } else {
      const msg = err.response?.data?.message || err.message || '请求失败'
      ElMessage.error(msg)
    }
    return Promise.reject(err)
  },
)

export default http
