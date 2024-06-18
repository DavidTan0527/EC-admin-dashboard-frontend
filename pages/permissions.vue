<script setup>
definePageMeta({
  middleware: ["permission"],
  permissionKey: "PG_PERM",
})

const isLoading = ref(true)

onMounted(() => {
  isLoading.value = false
})

</script>

<template>
  <Spinner v-if="isLoading" />
  <div v-else>
    This is the permission page
  </div>
</template>

