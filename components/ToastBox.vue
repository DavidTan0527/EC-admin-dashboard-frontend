<script setup>
const toasts = ref([])

defineExpose({
  notify: ({ message, type = "info", timeout = 5000 }) => {
    toasts.value?.push({ message, type, timeout })
  },
})
</script>

<template>
  <div class="fixed top-5 right-5 min-w-60 space-y-5">
    <Toast
      :id="`toast-${i}`"
      :type="type"
      :message="message"
      :timeout="timeout"
      v-for="({ type, message, timeout }, i) in toasts"
      :key="`toast-${i}`"
    ></Toast>
  </div>
</template>

