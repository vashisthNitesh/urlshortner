<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Links</h1>
      <button
        class="px-3 py-2 rounded-lg bg-emerald-500 text-slate-900 font-semibold"
        @click="createLink"
      >
        Create Demo Link
      </button>
    </div>

    <div v-if="pending" class="text-slate-400">Loading links...</div>
    <div v-else class="grid gap-3">
      <div
        v-for="link in links"
        :key="link.id"
        class="border border-slate-800 rounded-lg p-4 bg-slate-900/60"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="font-semibold">{{ link.slug }}</p>
            <p class="text-sm text-slate-400">{{ link.url }}</p>
          </div>
          <span class="text-xs px-2 py-1 rounded bg-slate-800">{{ link.status }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

const { data, refresh, pending } = useFetch(() => `${apiBase}/links/`)
const links = computed(() => data.value || [])

async function createLink() {
  await $fetch(`${apiBase}/links/`, {
    method: 'POST',
    body: {
      slug: `demo-${Date.now()}`,
      url: 'https://example.com',
      status: 'active',
    },
  })
  await refresh()
}
</script>
