import { Chart, ArcElement, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

export default defineNuxtPlugin(() => {
  Chart.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
  Chart.register(ChartDataLabels)
})

