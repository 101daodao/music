import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // 测试文件目录
  testDir: './tests/e2e',
  
  // 是否在遇到第一个失败的测试时停止
  forbidOnly: !!process.env.CI,
  
  // 失败重试次数
  retries: process.env.CI ? 2 : 0,
  
  // 并发工作进程数
  workers: process.env.CI ? 1 : undefined,
  
  // 报告器配置
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list']
  ],
  
  // 全局测试配置
  use: {
    // 基础URL
    baseURL: 'http://localhost:5173',
    
    // 是否收集跟踪信息
    trace: 'on-first-retry',
    
    // 是否录制视频
    video: 'retain-on-failure',
    
    // 是否截图
    screenshot: 'only-on-failure',
    
    // 全局超时设置
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // 测试项目配置（不同浏览器和设备）
  projects: [
    // 桌面端 Chrome
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // 桌面端 Firefox
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    // 桌面端 Safari
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // 平板设备
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    },

    // 移动设备
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],

  // 开发服务器配置
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2分钟启动超时
  },

  // 超时配置
  timeout: 30 * 1000, // 30秒全局超时
  expect: {
    // 断言超时
    timeout: 5 * 1000, // 5秒断言超时
  },

  // 忽略的文件和目录
  ignoreSnapshots: !process.env.CI,

  // 输出目录
  outputDir: 'test-results',

  // 全局设置
  fullyParallel: true,
  
  // 测试文件匹配模式
  testMatch: '**/*.spec.ts',
  
  // 排除的文件
  testIgnore: '**/node_modules/**',
  
  // 测试环境变量
  env: {
    NODE_ENV: 'test'
  }

  // 存储状态
  // storageState 会保存浏览器的 cookie、localStorage 等状态，用于跨测试保持登录状态
})