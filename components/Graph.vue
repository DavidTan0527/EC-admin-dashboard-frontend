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
  xColumnGroups: {
    type: Array,
    default: [],
  },
  yField: {
    type: [String, Number],
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
  totalFields: {
    type: Array,
    default: [],
  },
  showPercentage: {
    type: Boolean,
    default: false,
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

const dateField = "__DATA_TIMEBUCKET"
const isTimeseries = computed(() => props.xField === dateField)

const typeRef = toRef(props, "type")
const tableRef = toRef(props, "table")
const xColumnGroupsRef = toRef(props, "xColumnGroups")

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
          padding: 5,
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

  if (isTimeseries.value) {
    opts.scales.x.type = "time"
    opts.scales.x.time = {
      unit: "month",
      displayFormats: {
        month: "MMM YYYY"
      }
    }
  }

  if (props.baseDate !== null && isTimeseries.value) {
    const year = props.baseDate.getFullYear()
    const month = props.baseDate.getMonth()
    const firstDayNextMonth = new Date(year, month + 1, 1)

    const start  = new Date(year, month - props.pastDuration + 1, 1)
    const end = new Date(firstDayNextMonth - 1)
    
    opts.scales.x.min = start
    opts.scales.x.max = end
  }

  if (props.showPercentage) {
    opts.plugins = { ...opts.plugins }
    opts.plugins.datalabels = {}

    opts.plugins.datalabels.formatter = (value, ctx) => {
      let sum = 0
      let dataArr = ctx.chart.data.datasets[0].data
      dataArr.map(data => { sum += data })
      let percentage = (value*100 / sum).toFixed(2)+"%"
      return percentage
    }
  }

  return opts
})

const activeRows = computed(() => {
  let rows = tableRef.value.rows ?? []

  if (props.baseDate !== null && !isTimeseries.value) {
    const year = props.baseDate.getFullYear()
    const month = props.baseDate.getMonth()
    const firstDayNextMonth = new Date(year, month + 1, 1)

    const start  = new Date(year, month - props.pastDuration + 1, 1)
    const end = new Date(firstDayNextMonth - 1)
    rows = rows.filter(e => {
      const date = new Date(e[dateField])
      return start <= date && date <= end
    })
  }

  return rows
})

const chartData = computed(() => {
  let { labels, data } = generateHistogram(
    activeRows.value,
    props.xField === "__DATA_COLUMNGROUPS" ? xColumnGroupsRef.value : props.xField,
    props.yField
  )

  if (props.xField === "__DATA_COLUMNGROUPS") {
    labels = labels.map(label => tableRef.value.fields?.filter(col => col.field === label)[0]?.headerName)
  }

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
        hoverOffset: 6,
      }
    ]
  }
})

const norm = value => typeof value !== "number" || isNaN(value) ? 0 : value
const currencyFormatter = (currency, symbol) => {
  if (currency === 0) {
    return ""
  }

  let sign = currency < 0 ? "-" : ""
  currency = Math.abs(currency)
  currency = currency.toFixed(2)

  let formatted = currency.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return sign + symbol + `${formatted}`
}

function isCurrencyField(field) {
  return tableRef.value.fields?.filter(col => col.field === field)[0]?.type === "currency" ?? false
}

function sumField(field) {
  let value = activeRows.value.reduce((acc, cur) => acc + norm(cur[field]), 0)
  return isCurrencyField(field) ? currencyFormatter(value, "RM") : value
}

</script>

<template>
  <div class="flex flex-col items-center">
    <div class="w-full h-64 2xl:h-72">
      <Bar
        v-if="typeRef === 'bar'"
        :data="chartData"
        :options="options" />
      <Line
        v-else-if="typeRef === 'line'"
        :data="chartData"
        :options="options" />
      <Pie
        v-else-if="typeRef === 'pie'"
        :data="chartData"
        :options="options" />
      <Doughnut
        v-else-if="typeRef === 'doughnut'"
        :data="chartData"
        :options="options" />
    </div>
    <div class="flex flex-row flex-wrap w-3/4 mt-6 gap-y-2" v-if="totalFields.length > 0">
      <span
        class="border border-gray-50 text-sm font-medium rounded-full shadow-md"
        v-for="field in totalFields"
        :key="field"
      >
        <span class="text-white bg-blue-400 rounded-s-full p-1 pl-2">
          {{ tableRef.fields?.filter(col => col.field === field)[0]?.headerName ?? "???" }}
        </span>
        <span class="bg-gray-50 rounded-e-full p-1 pr-2">
          {{ sumField(field) }}
        </span>
      </span>
    </div>
  </div>
</template>

