// src/shims-vue.d.ts
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // 声明Vue组件的类型，包含props、emit等
  const component: DefineComponent<{}, {}, any>
  export default component
}