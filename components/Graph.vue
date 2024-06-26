<script setup>
import { Bar, Line, Doughnut, Pie } from 'vue-chartjs'

const props = defineProps({
  type: {
    type: String,
    validator: (value, props) => ["line", "bar", "pie", "doughnut"].includes(value)
  }
})
</script>

<template>
</template>

