<script setup>
import { Bar, Doughnut } from 'vue-chartjs'

const cookie = useCookie("ec-t")
if (!cookie?.value) {
  navigateTo("/login", { redirectCode: 401 })
}

const headers = {
  "Authorization": "Bearer " + cookie.value,
}

definePageMeta({
  middleware: ["permission"],
  permissionKey: "DAT_ALL",
})

let { data: tableRes } = await useApiFetch("/table/667aa56b53e0b04990a0c2d8", {
  headers,
})

if (!tableRes.value.success) {
  tb.value.notify({ message: tableRes.value.message, type: "error", timeout: 0 })
}

</script>

<template>
  <div class="grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
    <Graph
      class="border border-gray-100 drop-shadow-lg bg-white p-4 rounded-lg min-h-60"
      type="pie"
      title="Percentage of Office Claims"
      :table="tableRes.data"
      xField="CATEGORIES"
      showDatalabels
      showPercentage
    >
    </Graph>
    <Graph
      class="border border-gray-100 drop-shadow-lg bg-white p-4 rounded-lg min-h-60"
      type="bar"
      title="Claim Amount per Category"
      :table="tableRes.data"
      xField="CATEGORIES"
      yField="TOTALRM"
      showDatalabels
    >
    </Graph>
  </div>
</template>

