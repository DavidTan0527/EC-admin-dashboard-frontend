<script setup>
definePageMeta({
  middleware: ["auth", "permission"],
  permissionKey: "PG_PERM",
})
</script>

<template>
  This is the permissions page
</template>

