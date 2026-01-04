<template>
  <section class="space-y-4">
    <h1 class="text-3xl font-bold">Welcome to PulseLink</h1>
    <p class="text-slate-300">
      This Nuxt 3 frontend is wired to the Django REST API. Configure
      <code>API_BASE</code> to point to your Render-hosted backend (e.g., <code>https://your-app.onrender.com/api</code>).
    </p>
    <AdBanner />
    <div class="grid gap-4 md:grid-cols-2">
      <div class="p-4 rounded-lg border border-slate-800 bg-slate-900/50">
        <h2 class="text-xl font-semibold mb-2">Database</h2>
        <p class="text-slate-300">Backend uses Django + PostgreSQL via <code>DATABASE_URL</code>.</p>
      </div>
      <div class="p-4 rounded-lg border border-slate-800 bg-slate-900/50">
        <h2 class="text-xl font-semibold mb-2">Payments</h2>
        <p class="text-slate-300">Razorpay Checkout is available at <NuxtLink to="/billing">Billing</NuxtLink>.</p>
      </div>
    </div>
  </section>
</template>
