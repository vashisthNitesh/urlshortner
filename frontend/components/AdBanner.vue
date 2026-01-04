<template>
  <div class="border border-slate-800 rounded-lg p-4 bg-slate-900/60">
    <p class="text-sm text-slate-400 mb-2">Sponsored</p>
    <ins
      class="adsbygoogle"
      style="display:block"
      :data-ad-client="adsenseClient"
      data-ad-slot="auto"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const adsenseClient = computed(() => config.public.adsenseClient)

onMounted(() => {
  if (typeof window !== 'undefined' && (window as any).adsbygoogle && adsenseClient.value) {
    ;(window as any).adsbygoogle.push({})
  }
})
</script>
