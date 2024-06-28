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
  xLabel: {
    type: String,
    default: "",
  },
  yLabel: {
    type: String,
    default: "",
  },
  timeseries: {
    type: Boolean,
    default: false,
  },
  showDatalabels: {
    type: Boolean,
    default: false,
  },
  showPercentage: {
    type: Boolean,
    default: false,
  },

  dateField: {
    type: String,
    default: undefined,
  },
  baseDate: {
    type: Date,
    default: null,
  },
  pastDuration: { // in month
    type: Number,
    default: 1,
  },
})

const options = computed(() => {
  let opts = {
    responsive: true,
    layout: {
      padding: {
        top: 5,
        left: 20,
        right: 20,
        bottom: 5,
      },
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        display: props.type === "line" || props.type === "bar",
        grid: {
          display: false,
        },
        title: {
          display: props.xLabel !== "",
          text: props.xLabel,
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
        font: {
          size: 15,
          weight: "bold",
        },
        text: props.title,
        padding: {
          bottom: props.type === "line" || props.type === "bar" ? 20 : 0,
        },
      },
      legend: {
        display: props.type === "pie" || props.type === "doughnut",
      },
    },
  }

  if (props.timeseries) {
    opts.scales = { ...opts.scales, x: {} }
    opts.scales.x.type = "time"
    opts.scales.x.time = {
      unit: "month",
      displayFormats: {
        month: "MMM YYYY"
      }
    }
  }

  if (props.dateField && props.baseDate !== null) {
    const year = props.baseDate.getFullYear()
    const month = props.baseDate.getMonth()
    const firstDayNextMonth = new Date(year, month + 1, 1)

    const start  = new Date(year, month - props.pastDuration + 1, 1)
    const end = new Date(firstDayNextMonth - 1)
    
    if (props.timeseries) {
      opts.scales.x.min = start
      opts.scales.x.max = end
    }
  }

  if (props.showDatalabels) {
    opts.plugins = { ...opts.plugins }
    opts.plugins.datalabels = {
      anchor: "center",
      align: "end",
      color: "#0a0a01",
      // display: "auto",
      font: {
        size: 12,
      },
      offset: props.type === "pie" || props.type === "doughnut" ? 18 : 0,
    }

    if (props.showPercentage) {
      opts.plugins.datalabels.formatter = (value, ctx) => {
        let sum = 0
        let dataArr = ctx.chart.data.datasets[0].data
        dataArr.map(data => { sum += data })
        let percentage = (value*100 / sum).toFixed(2)+"%"
        return percentage
      }
    }
  }

  return opts
})

const chartData = computed(() => {
  let activeRows = props.table.rows

  if (props.dateField && props.baseDate !== null && !props.timeseries) {
    const year = props.baseDate.getFullYear()
    const month = props.baseDate.getMonth()
    const firstDayNextMonth = new Date(year, month + 1, 1)

    const start  = new Date(year, month - props.pastDuration + 1, 1)
    const end = new Date(firstDayNextMonth - 1)
    activeRows = activeRows.filter(e => {
      if (!(props.dateField in e)) return false
      const date = new Date(e[props.dateField])
      return start <= date && date <= end
    })
  }

  const { labels, data } = generateHistogram(activeRows, props.xField, props.yField)
  return {
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
        hoverOffset: 7,
      }
    ]
  }
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

