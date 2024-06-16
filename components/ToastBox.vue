<script setup>
const toasts = ref([])

defineExpose({
  notify: ({ message, type = "info", timeout = 5000 }) => {
    toasts.value.push({ message, type, timeout })
  },
})
</script>

<template>
  <div class="fixed top-5 right-5 min-w-60 space-y-5" v-for="({ type, message, timeout }, i) in toasts">
    <Toast :id="`toast-${i}`" :type="type" :message="message" :key="`toast-${i}`"></Toast>
  </div>
</template>

