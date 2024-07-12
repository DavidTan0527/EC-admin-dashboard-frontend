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

const selectedTableId = computed(() => form.tableId)

const { data: tableDataRes } = await useAsyncData(
  "table-data",
  () => {
    if (form.tableId === "") {
      return {
        data: { data: {} }
      }
    }
    return $fetch(`${config.public.apiBase}/table/${form.tableId}`, { headers })
  },
  {
    server: false,
    watch: [ selectedTableId ],
  }
)

const tableData = computed(() => {
  return transformTableData(tableDataRes.value?.data ?? {})
})

function clearForm() {
  form.id = ""
  form.type = ""
  form.title = ""
  form.permKey = ""
  form.tableId = ""
  form.options = {}
  form.options.xColumnGroups = []
}

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
  } catch (err) {
    tb.value.notify({ message: err, type: "error" })
  }

  table.value.closeModal()
}

async function deleteRow(row) {
  try {
    const res = await $fetch(`${config.public.apiBase}/chart/${row.id}`, {
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
      id="chart-table"
      class="max-w-2xl"
      :columns="columns"
      :rows="chartReq.data ?? []"
      :searchColumns="['title', 'permKey']"
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
        {{ form.id === "" ? "Add New Chart" : "Edit Chart" }}
      </template>
      <template #modal-body>
        <div class="grid grid-cols-2 gap-4 px-4">
          <form class="space-y-4 p-4" @submit.prevent="submit">
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
                <option value="">--</option>
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

            <template v-if="form.tableId !== ''">
              <div class="flex flex-row items-baseline">
                <label for="x-field" class="w-1/3 block mb-2 font-medium text-gray-900">x Field</label>
                <select id="x-field" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" v-model="form.options.xField">
                  <option value="__DATA_TIMEBUCKET" selected>[Sheet's Month]</option>
                  <option value="__DATA_COLUMNGROUPS" selected>[Column Fields]</option>
                  <option
                    v-for="field in selectedTable.fields"
                    :key="field.field"
                    :value="field.field"
                  >
                    {{ field.headerName }}
                  </option>
                </select>
              </div>
              <div class="flex items-center mb-4 space-x-4 flex-wrap" v-if="form.options.xField === '__DATA_COLUMNGROUPS'">
                <span v-for="field in selectedTable.fields" :key="field.field">
                  <input :id="field.field" type="checkbox" :value="field.field" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" v-model="form.options.xColumnGroups">
                  <label :for="field.field" class="ms-1 text-sm font-medium text-gray-900 dark:text-gray-300">{{ field.headerName }}</label>
                </span>
              </div>

              <div class="flex flex-row items-baseline">
                <label for="x-label" class="w-1/3 block mb-2 font-medium text-gray-900">x Label</label>
                <input type="text" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-2" id="x-label" placeholder="(Leave blank if not needed)" v-model="form.options.xLabel">
              </div>

              <div class="flex flex-row items-baseline">
                <label for="y-field" class="w-1/3 block mb-2 font-medium text-gray-900">y Field</label>
                <select id="y-field" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" v-model="form.options.yField">
                  <template v-if="form.options.xField === '__DATA_COLUMNGROUPS'">
                    <option :value="0">SUM</option>
                    <option :value="1">AVG</option>
                  </template>
                  <template v-else>
                    <option :value="undefined" selected>[Count Frequency]</option>
                    <option
                      v-for="field in selectedTable.fields"
                      :key="field.field"
                      :value="field.field"
                    >
                      {{ field.headerName }}
                    </option>
                  </template>
                </select>
              </div>
              <div class="flex flex-row items-baseline">
                <label for="y-label" class="w-1/3 block mb-2 font-medium text-gray-900">y Label</label>
                <input type="text" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-2" id="y-label" placeholder="(Leave blank if not needed)" v-model="form.options.yLabel">
              </div>

              <div class="flex flex-row">
                <label class="inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" class="sr-only peer" v-model="form.options.showPercentage">
                  <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span class="ms-3 text-sm font-medium text-gray-900">Is percentage?</span>
                </label>
              </div>

              <div class="flex flex-row">
                <label for="total-fields" class="w-1/3 block mb-2 text-sm font-medium text-gray-900">Display Total</label>
                <select multiple id="total-fields" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" v-model="form.options.totalFields">
                  <option
                    v-for="field in selectedTable.fields"
                    :key="field.field"
                    :value="field.field"
                  >
                    {{ field.headerName }}
                  </option>
                </select>
              </div>
            </template>


            <div class="flex flex-row justify-end">
              <button type="submit" class="py-2 px-4 h-fit rounded text-gray-50 bg-blue-500">Confirm</button>
            </div>
          </form>

          <div class="p-4">
            <h4 class="text-md font-light italic underline mb-1">Preview with past 3 months of data</h4>
            <Graph
              v-if="form.type !== ''"
              :type="form.type"
              :title="form.title"
              :table="tableData"
              :xField="form.options.xField ?? ''"
              :xColumnGroups="form.options.xColumnGroups ?? []"
              :yField="form.options.yField"
              :xLabel="form.options.xLabel"
              :yLabel="form.options.yLabel"
              :totalFields="form.options.totalFields ?? []"

              :showPercentage="form.options.showPercentage"

              :baseDate="new Date()"
              :pastDuration="3"
            >
            </Graph>
          </div>
        </div>
      </template>
    </Table>

  </div>

  <ToastBox ref="tb"></ToastBox>
</template>

