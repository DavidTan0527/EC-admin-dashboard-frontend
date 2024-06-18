<script setup>
import { initFlowbite } from 'flowbite'

onMounted(() => {
  initFlowbite()
});
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
