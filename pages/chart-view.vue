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
  { label: "", key: "select" },
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

          <Table
            id="chart-table"
            class="max-w-2xl"
            :columns="chartColumns"
            :rows="chartReq.data ?? []"
            :searchColumns="['title']"
          >
            <template #select="{ data }">
              <input :id="data.id" type="checkbox" :value="data.id" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" v-model="form.chartId">
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


