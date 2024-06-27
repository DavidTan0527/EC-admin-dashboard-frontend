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

const { data: chartReq } = await useApiFetch("/chart", {
  headers,
})

let tableIds = [...new Set(chartReq.value.data.map(c => c.tableId))]
let tableResponses = await Promise.all(tableIds.map(id => useApiFetch(`/table/${id}`, { headers })))
let tableData = tableResponses.map(({ data : { value: { success, data } } }, i) => [tableIds[i], data])
let tableDataMap = Object.fromEntries(tableData)

</script>

<template>
  <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    <Graph
      v-for="chart in chartReq.data"
      :key="chart.id"
      class="border border-gray-100 drop-shadow-lg bg-white p-4 rounded-lg h-72"
      :type="chart.type"
      :title="chart.title"
      :table="tableDataMap[chart.tableId]"
      :xField="chart.options.xField"
      :yField="chart.options.yField"
      :showDatalabels="chart.options.showDatalabels"
      :showPercentage="chart.options.showPercentage"
    >
    </Graph>
  </div>
</template>

