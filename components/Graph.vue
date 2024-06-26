<script setup>
import { Bar, Line, Doughnut, Pie } from 'vue-chartjs'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value, props) => ["line", "bar", "pie", "doughnut"].includes(value),
  },
  title: {
    type: String,
    default: "",
  },
  table: {
    type: Object,
    validator: (value, props) => "rows" in value,
    required: true,
  },
  xField: {
    type: String,
    required: true,
  },
  yField: {
    type: String,
    default: undefined,
  },
  yLabel: {
    type: String,
    default: "",
  },
  showDatalabels: {
    type: Boolean,
    default: false,
  },
  showPercentage: {
    type: Boolean,
    default: false,
  },
})

const options = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      display: props.type === "line" || props.type === "bar",
      grid: {
        display: false,
      },
    },
    y: {
      display: "auto",
      grid: {
        display: props.type === "line" || props.type === "bar",
      },
      ticks: {
        padding: 25,
      },
      title: {
        display: props.yLabel !== "",
        text: props.yLabel,
      },
    },
  },
  plugins: {
    title: {
      display: true,
      text: props.title,
    },
    legend: {
      display: props.type === "pie" || props.type === "doughnut",
    },
  },
})

if (props.showDatalabels) {
  options.value.plugins.datalabels = {
    color: "#fefafa",
    font: {
      size: 16,
      weight: "bold",
    },
  }

  if (props.showPercentage) {
    options.value.plugins.datalabels.formatter = (value, ctx) => {
      let sum = 0
      let dataArr = ctx.chart.data.datasets[0].data
      dataArr.map(data => { sum += data })
      let percentage = (value*100 / sum).toFixed(2)+"%"
      return percentage
    }
  }
}

const { labels, data } = generateHistogram(props.table.rows, props.xField, props.yField)

const chartData = ref({
  labels,
  datasets: [
    {
      label: props.title,
      data,
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
      hoverOffset: 5,
    }
  ]
})

</script>

<template>
  <div>
    <Bar
      v-if="props.type === 'bar'"
      :data="chartData"
      :options="options" />
    <Line
      v-else-if="props.type === 'line'"
      :data="chartData"
      :options="options" />
    <Pie
      v-else-if="props.type === 'pie'"
      :data="chartData"
      :options="options" />
    <Doughnut
      v-else-if="props.type === 'doughnut'"
      :data="chartData"
      :options="options" />
  </div>
</template>

