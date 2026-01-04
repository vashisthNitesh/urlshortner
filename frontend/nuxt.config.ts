export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || 'http://localhost:8000/api',
      adsenseClient: process.env.NUXT_PUBLIC_ADSENSE_CLIENT || '',
      razorpayKey: process.env.NUXT_PUBLIC_RAZORPAY_KEY_ID || '',
    },
  },
  app: {
    head: {
      script: [
        {
          src: 'https://checkout.razorpay.com/v1/checkout.js',
          defer: true,
        },
        {
          src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NUXT_PUBLIC_ADSENSE_CLIENT || ''}`,
          async: true,
          crossorigin: 'anonymous',
        },
      ],
    },
  },
})
