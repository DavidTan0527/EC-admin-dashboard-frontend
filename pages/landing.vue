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

const name = tableRes.value.data.name
const data = tableRes.value.data.rows

const { labels : lbl_counts, counts } = generateHistogram(data, "CATEGORIES")
const { labels : lbl_amount, counts : amount } = generateHistogram(data, "CATEGORIES", "TOTALRM")

const tableData = ref({
  labels: lbl_counts,
  datasets: [
    {
      label: name,
      data: counts,
      backgroundColor: [
        'rgb(255, 182, 193)', // Light Pink
        'rgb(255, 223, 186)', // Light Peach
        'rgb(176, 224, 230)', // Light Blue
        'rgb(250, 250, 210)', // Light Yellow
        'rgb(221, 160, 221)', // Plum
        'rgb(152, 251, 152)', // Light Green
        'rgb(255, 239, 213)', // Papaya Whip
        'rgb(240, 230, 140)', // Khaki
        'rgb(255, 228, 225)', // Misty Rose
        'rgb(255, 240, 245)', // Lavender Blush
        'rgb(230, 230, 250)', // Lavender
        'rgb(255, 250, 205)',  // Lemon Chiffon
      ],
      hoverOffset: 3,
    }
  ]
})

const barData = ref({
  labels: lbl_amount,
  datasets: [
    {
      label: name,
      data: amount,
      backgroundColor: [
        'rgb(255, 182, 193)', // Light Pink
        'rgb(255, 223, 186)', // Light Peach
        'rgb(176, 224, 230)', // Light Blue
        'rgb(250, 250, 210)', // Light Yellow
        'rgb(221, 160, 221)', // Plum
        'rgb(152, 251, 152)', // Light Green
        'rgb(255, 239, 213)', // Papaya Whip
        'rgb(240, 230, 140)', // Khaki
        'rgb(255, 228, 225)', // Misty Rose
        'rgb(255, 240, 245)', // Lavender Blush
        'rgb(230, 230, 250)', // Lavender
        'rgb(255, 250, 205)',  // Lemon Chiffon
      ],
      hoverOffset: 3,
    }
  ]
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: name,
    },
    datalabels: {
      align: 'top',
      formatter: Math.round,
      font: {
        weight: 'bold',
      },
    },
  },
})

</script>

<template>
  <div class="grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
    <div class="border border-gray-100 drop-shadow-lg bg-white p-4 rounded-lg">
      <Doughnut
        :data="tableData"
        :options="chartOptions" />
    </div>
    <div class="border border-gray-100 drop-shadow-lg bg-white p-5 rounded-lg">
      <Bar
        :data="barData"
        :options="chartOptions" />
    </div>
  </div>
</template>

