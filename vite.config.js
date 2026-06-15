import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 상대 경로 → GitHub Pages 프로젝트 하위경로(/bitcoin/)에서도 자산이 정상 로드됨
  base: './',
  plugins: [react()],
  server: {
    port: 5180,
    open: true,
  },
})
