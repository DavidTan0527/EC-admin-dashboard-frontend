import {
  Chart, Title, Tooltip, Legend,
  CategoryScale, LinearScale, TimeScale,
  ArcElement, PointElement, BarElement, LineElement,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import 'chartjs-adapter-moment'

export default defineNuxtPlugin(() => {
  Chart.register(Title, Tooltip, Legend)
  Chart.register(CategoryScale, LinearScale, TimeScale)
  Chart.register(ArcElement, PointElement, BarElement, LineElement)
  Chart.register(ChartDataLabels)
})

