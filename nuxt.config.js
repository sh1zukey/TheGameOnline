export default {
  ssr: false,
  server: {
    port: 3001,
  },
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'TheGameOnline',
    htmlAttrs: {
      lang: 'ja',
    },
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, shrink-to-fit=no',
      },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: ['@/assets/scss/app.scss'],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    // '@nuxtjs/eslint-module',
    '@nuxtjs/style-resources',
    '@nuxt/typescript-build',
  ],

  styleResources: {
    scss: ['@/assets/scss/app.scss'],
  },

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: ['bootstrap-vue/nuxt'],

  bootstrapVue: {
    bootstrapCSS: false,
    bootstrapVueCSS: false,
  },
  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
    vendor: [
      'socket.io-client'
    ],
  },
}
