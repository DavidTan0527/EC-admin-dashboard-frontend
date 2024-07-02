<script setup>
const config = useRuntimeConfig()
definePageMeta({
  middleware: ["permission"],
  permissionKey: "PG_CHART_VIEW",
})

const cookie = useCookie("ec-t")
if (!cookie?.value) {
  navigateTo("/login", { redirectCode: 401 })
}

const headers = {
  "Authorization": "Bearer " + cookie.value,
}

const columns = [
  { label: "Name", key: "name" },
  { label: "Actions", key: "actions" },
]
const chartColumns = [
  { label: "", key: "control" },
  { label: "", key: "order" },
  { label: "title", key: "title" },
]

const { data: chartViewReq, refresh } = await useApiFetch("/chart_view", {
  headers,
})

const { data: chartReq } = await useApiFetch("/chart", {
  headers,
})

const tb = ref(null)
const table = ref(null)
const form = reactive({
  id: ref(""),
  name: ref(""),
  chartId: ref([]),
})
const chosenChartId = ref("")

const selectedTable = computed(() => {
  let search = tableRes.value?.data.filter(table => table.id === form.tableId) ?? []
  return search.length > 0 ? search[0] : {}
})

function clearForm() {
  form.id = ""
  form.name = ""
  form.chartId = []
}

function loadForm(row) {
  form.id = row.id
  form.name = row.name
  form.chartId = row.chartId ?? []
  table.value.openModal()
  nextTick().then(() => {
    feather.replace()
  })
}

async function submit() {
  try {
    const res = await $fetch(config.public.apiBase + "/chart_view", {
      method: form.id === "" ? "POST" : "PUT",
      headers,
      body: form,
    })

    if (res.success) {
      tb.value.notify({ message: res.message, type: "success" })
      refresh()
    } else {
      tb.value.notify({ message: res.message, type: "error", timeout: 0 })
    }
  } catch {
    tb.value.notify({ message: "Something went wrong. Please try again.", type: "error" })
  }

  table.value.closeModal()
}

async function deleteRow(row) {
  try {
    const res = await $fetch(`${config.public.apiBase}/chart_view/${row.id}`, {
      method: "DELETE",
      headers,
    })

    if (res.success) {
      tb.value.notify({ message: res.message, type: "success" })
      refresh()
    } else {
      tb.value.notify({ message: res.message, type: "error", timeout: 0 })
    }
  } catch {
    tb.value.notify({ message: "Something went wrong. Please try again.", type: "error" })
  }
}

const nonSelectedCharts = computed(() => chartReq.value.data.filter(chart => !form.chartId.includes(chart.id)))
const selectedCharts = computed(() => form.chartId.map(id => chartReq.value.data.filter(chart => chart.id === id)[0]))

function addData() {
  if (!chartReq.value.data.some(chart => chart.id === chosenChartId.value))
    return
  form.chartId.push(chosenChartId.value)
  chosenChartId.value = ""
}

function removeData(index) {
  form.chartId.splice(index, 1)
}

function moveData(index, step) {
  if (index < 0 || index >= form.chartId.length) {
    return
  }

  const targetIdx = index + step
  if (targetIdx < 0 || targetIdx >= form.chartId.length) {
    return
  }

  let temp = form.chartId[index]
  form.chartId[index] = form.chartId[targetIdx]
  form.chartId[targetIdx] = temp
}

</script>

<template>
  <div>
    <Table
      id="chart-view-table"
      class="max-w-2xl"
      :columns="columns"
      :rows="chartViewReq.data ?? []"
      :searchColumns="['name']"
      addBtn
      addModal
      :addBtnAction="clearForm"
      ref="table"
    >
      <template #actions="{ data }">
        <button
          class="cursor-pointer font-semibold text-amber-300 hover:text-amber-200 duration-100 mr-4"
          @click="loadForm(data)"
        >
          Edit
        </button>
        <button class="cursor-pointer font-semibold text-red-500 hover:text-red-400 duration-100" @click="deleteRow(data)">Delete</button>
      </template>

      <template #modal-title>
        {{ form.id === "" ? "Add New Chart View" : "Edit Chart View" }}
      </template>
      <template #modal-body>
        <form class="space-y-4 p-6" @submit.prevent="submit">
          <div class="flex flex-row items-baseline">
            <label for="name" class="w-1/3 block mb-2 font-medium text-gray-900">Name</label>
            <input type="text" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-2" id="name" v-model="form.name" required>
          </div>
          <div class="inline-flex items-center justify-center w-full">
            <hr class="w-full h-px my-8 bg-gray-200 border-0 dark:bg-gray-700">
            <span class="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-900">Configure Display Charts</span>
          </div>
          <div class="flex flex-row space-x-2 items-center">
            <select id="chart-id" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" v-model="chosenChartId">
              <option
                v-for="chart in nonSelectedCharts"
                :key="chart.id"
                :value="chart.id"
              >
                {{ chart.title }}
              </option>
            </select>
            <button type="button" class="py-2 px-4 h-fit rounded text-gray-50 bg-blue-500" @click="addData">
              <i data-feather="plus"></i>
            </button>
          </div>
          <Table
            id="chart-table"
            class="max-w-2xl"
            :columns="chartColumns"
            :rows="selectedCharts"
          >
            <template #control="{ index }">
              <button type="button" class="py-2 px-3 h-fit rounded text-gray-50 bg-red-400" @click="removeData(index)">
                <i class="h-3 w-3" data-feather="minus"></i>
              </button>
            </template>

            <template #order="{ data, index }">
              <div class="grid grid-cols-2">
                <button
                  type="button"
                  class="cursor-pointer font-semibold"
                  @click="() => moveData(index, -1)"
                  v-if="index !== 0"
                >
                  <i data-feather="arrow-up"></i>
                </button>
                <div v-else></div>


                <button
                  type="button"
                  class="cursor-pointer font-semibold"
                  @click="() => moveData(index, 1)"
                  v-if="index !== selectedCharts.length - 1"
                >
                  <i data-feather="arrow-down"></i>
                </button>
              </div>
            </template>
          </Table>

          <div class="flex flex-row justify-end">
            <button type="submit" class="py-2 px-4 h-fit rounded text-gray-50 bg-blue-500">Confirm</button>
          </div>
        </form>
      </template>
    </Table>

  </div>

  <ToastBox ref="tb"></ToastBox>
</template>


