<template>
  <section class="space-y-4">
    <h1 class="text-2xl font-semibold">Billing</h1>
    <p class="text-slate-300">Trigger a Razorpay order to test checkout flow.</p>
    <button
      class="px-4 py-2 rounded-lg bg-indigo-500 text-slate-50 font-semibold"
      @click="startCheckout"
    >
      Pay ₹99
    </button>
  </section>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const razorpayKey = config.public.razorpayKey

async function startCheckout() {
  const order = await $fetch(`${apiBase}/payments/razorpay/order/`, {
    method: 'POST',
    body: {
      amount: 9900, // in paise
      currency: 'INR',
      receipt: `order-${Date.now()}`,
    },
  })

  const options = {
    key: razorpayKey,
    amount: order.amount,
    currency: order.currency,
    name: 'PulseLink',
    order_id: order.id,
    handler: () => alert('Payment successful'),
    prefill: {
      email: 'user@example.com',
    },
  }

  // @ts-ignore
  const rzp = new window.Razorpay(options)
  rzp.open()
}
</script>
