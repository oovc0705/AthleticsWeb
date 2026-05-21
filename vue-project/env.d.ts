declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// CSS变量类型定义，避免IDE误报
interface CSSVars {
  '--primary-color': string
  '--primary-dark': string
  '--text-primary': string
  '--text-secondary': string
  '--bg-light': string
  '--border-color': string
}