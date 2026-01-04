<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <header class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xl font-semibold">PulseLink</span>
        <span class="text-xs text-slate-400">Nuxt + Django</span>
      </div>
      <nav class="flex items-center gap-4 text-sm text-slate-300">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/links">Links</NuxtLink>
        <NuxtLink to="/billing">Billing</NuxtLink>
      </nav>
    </header>
    <main class="px-6 py-8">
      <NuxtPage />
    </main>
  </div>
</template>
