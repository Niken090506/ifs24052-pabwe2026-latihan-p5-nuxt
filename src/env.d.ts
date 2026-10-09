/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DELCOM_BASEURL: string
  readonly DELCOM_BASEURL: string
  readonly APP_PORT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_DELCOM_BASEURL?: string
      DELCOM_BASEURL?: string
      APP_PORT?: string
    }
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

export {}
