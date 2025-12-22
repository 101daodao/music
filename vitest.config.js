import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    // 测试环境
    environment: 'jsdom',
    
    // 设置文件
    setupFiles: ['./tests/setup.js'],
    
    // 全局配置
    globals: true,
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        'dist/',
        'cypress/',
        'coverage/',
        '.vscode/',
        '.cospec/'
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
    
    // 测试文件匹配模式
    include: [
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    
    // 排除文件
    exclude: [
      'node_modules/',
      'dist/',
      '**/*.config.{js,ts}'
    ],
    
    // 测试超时
    testTimeout: 10000,
    
    // 钩子超时
    hookTimeout: 10000,
    
    // 并发配置
    threads: true,
    
    // 监听文件
    watchExclude: [
      'node_modules/',
      'dist/'
    ]
  },
  
  // 路径解析
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  
  // 服务器配置
  server: {
    port: 3000,
    host: true
  }
})