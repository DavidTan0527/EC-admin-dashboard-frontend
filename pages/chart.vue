<script setup>
const config = useRuntimeConfig()
definePageMeta({
  middleware: ["permission"],
  permissionKey: "PG_CHART",
})

const cookie = useCookie("ec-t")
if (!cookie?.value) {
  navigateTo("/login", { redirectCode: 401 })
}

const headers = {
  "Authorization": "Bearer " + cookie.value,
}

const columns = [
  { label: "Title", key: "title" },
  { label: "Permission", key: "permKey" },
  { label: "Actions", key: "actions" },
]

const { data: chartReq, refresh } = await useApiFetch("/chart", {
  headers,
})

const { data: permRes } = await useApiFetch("/permission_keys", {
  headers,
})

const { data: tableRes } = await useApiFetch("/table/schema", {
  headers,
})

const tb = ref(null)
const table = ref(null)
const form = reactive({
  id: ref(''),
  type: ref(''),
  title: ref(''),
  permKey: ref(''),
  tableId: ref(''),
  options: ref({}),
})

const selectedTable = computed(() => {
  let search = tableRes.value?.data.filter(table => table.id === form.tableId) ?? []
  return search.length > 0 ? search[0] : {}
})

function loadForm(row) {
  form.id = row.id
  form.type = row.type
  form.title = row.title
  form.permKey = row.permKey
  form.tableId = row.tableId
  form.options = row.options

  table.value.openModal()
}

async function submit() {
  try {
    const res = await $fetch(config.public.apiBase + "/chart", {
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

</script>

<template>
  <div>
    <Table
      id="chart-table"
      class="text-sm max-w-2xl"
      :columns="columns"
      :rows="chartReq.data ?? []"
      :searchColumns="['title', 'permKey']"
      addBtn
      addModal
      :addBtnAction="() => form.id = ''"
      ref="table"
    >
      <template #is_super="{ data }">
        {{ data.is_super ? "Yes" : "No" }}
      </template>
      <template #actions="{ data }">
        <button
          class="cursor-pointer font-semibold text-amber-300 hover:text-amber-200 duration-100 mr-2"
          @click="loadForm(data)"
        >
          Rename
        </button>
        <button class="cursor-pointer font-semibold text-red-500 hover:text-red-400 duration-100" @click="deleteRow(data)">Delete</button>
      </template>

      <template #modal-title>
        {{ form.id === "" ? "Add New Chart" : "Edit Chart" }}
      </template>
      <template #modal-body>
        <form class="space-y-4 p-6" @submit.prevent="submit">
          <div class="flex flex-row items-baseline">
            <label for="type" class="w-1/3 block mb-2 font-medium text-gray-900">Chart Type</label>
            <select id="type" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" v-model="form.type">
              <option value="line">Line</option>
              <option value="bar">Bar</option>
              <option value="pie">Pie</option>
              <option value="doughnut">Doughnut</option>
            </select>
          </div>
          <div class="flex flex-row items-baseline">
            <label for="title" class="w-1/3 block mb-2 font-medium text-gray-900">Title</label>
            <input type="text" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-2" id="title" v-model="form.title" required>
          </div>

          <div class="flex flex-row items-baseline">
            <label for="data-table" class="w-1/3 block mb-2 font-medium text-gray-900">Permission Key</label>
            <select id="data-table" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" v-model="form.permKey">
              <option
                v-for="key in permRes.data"
                :key="key"
                :value="key"
              >
                {{ key }}
              </option>
            </select>
          </div>

          <div class="flex flex-row items-baseline">
            <label for="data-table" class="w-1/3 block mb-2 font-medium text-gray-900">Data Table</label>
            <select id="data-table" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" v-model="form.tableId">
              <option
                v-for="table in tableRes.data"
                :key="table.id"
                :value="table.id"
              >
                {{ table.name }}
              </option>
            </select>
          </div>

          <div class="flex flex-row items-baseline">
            <label for="x-field" class="w-1/3 block mb-2 font-medium text-gray-900">x Field</label>
            <select id="x-field" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" v-model="form.options.xField">
              <option
                v-for="field in selectedTable.fields"
                :key="field.field"
                :value="field.field"
              >
                {{ field.headerName }}
              </option>
            </select>
          </div>
          <div class="flex flex-row items-baseline">
            <label for="x-label" class="w-1/3 block mb-2 font-medium text-gray-900">x Label</label>
            <input type="text" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-2" id="x-label" placeholder="(Leave blank if not needed)" v-model="form.options.xLabel">
          </div>

          <div class="flex flex-row items-baseline">
            <label for="y-field" class="w-1/3 block mb-2 font-medium text-gray-900">y Field</label>
            <select id="y-field" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" v-model="form.options.yField">
              <option :value="undefined" selected>[Count Frequency]</option>
              <option
                v-for="field in selectedTable.fields"
                :key="field.field"
                :value="field.field"
              >
                {{ field.headerName }}
              </option>
            </select>
          </div>
          <div class="flex flex-row items-baseline">
            <label for="y-label" class="w-1/3 block mb-2 font-medium text-gray-900">y Label</label>
            <input type="text" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-2" id="y-label" placeholder="(Leave blank if not needed)" v-model="form.options.yLabel">
          </div>

          <label class="inline-flex items-center cursor-pointer me-4">
            <input type="checkbox" value="" class="sr-only peer" v-model="form.options.showDatalabels">
            <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span class="ms-3 text-sm font-medium text-gray-900">Show labels?</span>
          </label>

          <label class="inline-flex items-center cursor-pointer" v-if="form.options.showDatalabels">
            <input type="checkbox" value="" class="sr-only peer" v-model="form.options.showPercentage">
            <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span class="ms-3 text-sm font-medium text-gray-900">Is percentage?</span>
          </label>

          <div class="flex flex-row justify-end">
            <button type="submit" class="py-2 px-4 h-fit rounded text-gray-50 bg-blue-500">Confirm</button>
          </div>
        </form>
      </template>
    </Table>

  </div>

  <ToastBox ref="tb"></ToastBox>
</template>

