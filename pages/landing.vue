<script setup>
import { Bar, Doughnut } from 'vue-chartjs'

const config = useRuntimeConfig()
const cookie = useCookie("ec-t")
if (!cookie?.value) {
  navigateTo("/login", { redirectCode: 401 })
}

const headers = {
  "Authorization": "Bearer " + cookie.value,
}

const { data: chartViewReq } = await useApiFetch("/chart_view", {
  headers,
})
const currChartView = ref(chartViewReq.value.data[0]?.id ?? "")

const tb = ref(null)
const isLoading = ref(null)
const chartReq = ref({ data: [] })

let cachedSet = new Set()
let tableDataMap = {}
watch(currChartView, async () => {
  if (currChartView.value === "") {
    return
  }

  isLoading.value = true
  const req = await $fetch(`${config.public.apiBase}/chart_view/${currChartView.value}`, {
    headers
  })

  if (req.success) {
    chartReq.value = req

    let tableIdSet = new Set(req.data.map(c => c.tableId))
    let tableIds = [...tableIdSet.difference(cachedSet)]
    let tableResponses = await Promise.all(tableIds.map(id => useApiFetch(`/table/${id}`, { headers })))
    let tableData = tableResponses.map(({ data : { value: { success, data } } }, i) => [tableIds[i], data])
    tableDataMap = { ...tableDataMap, ...Object.fromEntries(tableData) }

    cachedSet = cachedSet.union(tableIdSet)
  } else {
    tb.notify({ type: "error", message: req.message })
  }
  isLoading.value = false
}, { immediate: true })


const monthPicker = ref(null)
const baseDate = ref(new Date())
const duration = ref(6)
function change() {
  baseDate.value = new Date(monthPicker.value.year, monthPicker.value.month, 1)
  duration.value = monthPicker.value.duration
}

onMounted(() => {
  initPopovers()
  feather.replace()
})

</script>

<template>
  <div class="flex flex-row space-x-4 max-w-sm mb-3">
    <select id="chart-view" class="block py-2 px-0 w-full text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-gray-200 peer" v-model="currChartView">
      <option v-for="cv in chartViewReq.data" :key="cv.id" :value="cv.id">{{ cv.name }}</option>
    </select>
    <button data-popover-target="popover" data-popover-placement="top" data-popover-offset="20" type="button" class="text-white me-4 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-3 text-center">
      <i data-feather="calendar"></i>
    </button>
  </div>
  <div>
    <MonthPicker
      data-popover
      id="popover"
      role="tooltip"
      class="absolute z-10 invisible inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-md opacity-0"
      :month="baseDate.getMonth()"
      :year="baseDate.getFullYear()"
      :duration="duration"
      @change="change"
      ref="monthPicker"
    ></MonthPicker>
    <div data-popper-arrow></div>
  </div>

  <Spinner v-if="isLoading"></Spinner>
  <div class="grid gap-4 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3" v-else>
    <Graph
      v-for="chart in chartReq.data"
      :key="chart.id"
      class="border border-gray-100 drop-shadow-lg bg-white p-4 rounded-lg h-72"
      :type="chart.type"
      :title="chart.title"
      :table="tableDataMap[chart.tableId] ?? []"
      :xField="chart.options.xField"
      :yField="chart.options.yField"

      :showDatalabels="chart.options.showDatalabels"
      :showPercentage="chart.options.showPercentage"

      :timeseries="chart.options.xField === chart.options.dateField"
      :dateField="chart.options.dateField"
      :baseDate="baseDate"
      :pastDuration="duration"
    >
    </Graph>
  </div>

  <ToastBox ref="tb"></ToastBox>
</template>

