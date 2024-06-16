<script setup>
import { initFlowbite } from 'flowbite'

onMounted(() => {
  initFlowbite()
  feather.replace();
});
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
