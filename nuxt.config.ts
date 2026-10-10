import { defineNuxtConfig } from 'nuxt/config'
import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  routeRules: {
    '/**': { ssr: false }
  },
  srcDir: 'src/',
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  css: ['~/index.css'],
  vite: {
    plugins: [
      tailwindcss()
    ]
  },
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'Cache-Control': 'public, max-age=0, must-revalidate'
        }
      },
      '/robots.txt': {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=86400'
        }
      }
    },
    hooks: {
      'render:html'(htmlContext: any) {
        if (htmlContext.head) {
          htmlContext.head = htmlContext.head.map((chunk: string) => {
            return chunk.replace(
              /<link rel="stylesheet" href="([^"]+\.css)"([^>]*)>/g,
              '<link rel="preload" href="$1" as="style"$2><link rel="stylesheet" href="$1" media="print" onload="this.media=\'all\'"$2><noscript><link rel="stylesheet" href="$1"$2></noscript>'
            )
          })
        }
      }
    },
    externals: {
      inline: [/[\\/]nuxt[\\/]dist[\\/]/]
    }
  } as any,
  devServer: {
    port: Number(process.env.APP_PORT || 3000)
  },
  runtimeConfig: {
    public: {
      DELCOM_BASEURL: process.env.VITE_DELCOM_BASEURL || process.env.DELCOM_BASEURL || 'https://open-api.delcom.org/api/v1'
    }
  },
  app: {
    head: {
      title: 'Delcom Cash Flow - Manajemen Arus Kas Modern',
      htmlAttrs: {
        lang: 'id'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Delcom Cash Flow - Solusi cerdas pencatatan dan pengelolaan arus kas keuangan pribadi dengan mudah, aman, dan efisien.'
        },
        { name: 'theme-color', content: '#0f172a' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: 'https://open-api.delcom.org/assets/img/logo.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'preload',
          as: 'style',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
          media: 'print',
          onload: "this.media='all'"
        }
      ],
      noscript: [
        {
          innerHTML: '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">'
        }
      ]
    }
  }
})
