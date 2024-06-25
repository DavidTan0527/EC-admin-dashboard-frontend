<script setup>
import { AgGridVue } from "ag-grid-vue3";
const route = useRoute()
const config = useRuntimeConfig()

const cookie = useCookie("ec-t")
if (!cookie?.value) {
  navigateTo("/login", { redirectCode: 401 })
}

const headers = {
  "Authorization": "Bearer " + cookie.value,
}

const tb = ref(null)

/*** Start of Modal ***/
const addColModal = ref(null)
const formulaInput = ref(null)

const form = reactive({
  name: ref(""),
  field: ref(""),
  isFormula: ref(false),
  formula: ref(""),
  type: ref(""),
})

watch(
  () => form.name,
  () => { form.field = form.name.replaceAll(/[^a-zA-Z0-9_\-]/g, "") }
)

function clearForm() {
  form.name = ""
  form.field = ""
  form.isFormula = false
  form.formula = ""
  form.type = ""
}

function addFormulaTerm(field) {
  form.formula += ` data['${field}'] `
  formulaInput.value.focus()
}

function dateFormatter(params) {
  if (!params.value) {
    return "";
  }
  const month = params.value.getMonth() + 1;
  const day = params.value.getDate();
  return `${params.value.getFullYear()}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`;
}

function submitAddCol() {
  try {
    let col = { headerName: form.name, field: form.field, rowDrag: colDefs.value.length === 0 }
    if (form.isFormula) {
      let formula = unref(form.formula)
      col = { ...col, formula, valueGetter: ({ data }) => eval(formula), editable: false }
    } else {
      col = { ...col, cellEditor: form.type, editable: true }
      if (form.type === "agDateCellEditor") {
        col = { ...col, valueFormatter: dateFormatter }
      }
    }
    colDefs.value.push(col)
  } catch (err) {
    tb.notify({ type: "error", message: err })
  }
  addColModal.value.close()
}

/*** End of Modal ***/


/*** Start of Table ***/
const rowData = ref([])
const colDefs = ref([])

try {
  const { data: tableRes } = await useApiFetch(`/table/${route.params.id}`, {
    headers,
  })
  if (!tableRes.value.success) {
    tb.value.notify({ message: userRes.value.message, type: "error", timeout: 0 })
  }
} catch (err) {
  tb.value.notify({ message: err, type: "error", timeout: 0 })
}

rowData.value = tableRes.value.data.rows
colDefs.value = tableRes.value.data.fields
colDefs.value.map((e, i) => {
  if ("formula" in e) {
    e = { ...e, valueGetter: ({ data }) => eval(e.formula) }
  }

  if (e.cellEditor === "agDateCellEditor") {
    e = { ...e, valueFormatter: dateFormatter }
  }

  e.editable = !('formula' in e)
  e.rowDrag = i === 0
})

const gridApi = ref(null)
function onGridReady(params) {
  gridApi.value = params.api
}

let sortActive = false, filterActive = false
function onSortChanged() {
  let colState = gridApi.value.getColumnState() || [];
  sortActive = colState.some((c) => c.sort);
  let suppressRowDrag = sortActive || filterActive;
  gridApi.value.setGridOption("suppressRowDrag", suppressRowDrag);
}

function onFilterChanged() {
  filterActive = gridApi.value.isAnyFilterPresent();
  let suppressRowDrag = sortActive || filterActive;
  gridApi.value.setGridOption("suppressRowDrag", suppressRowDrag);
}

function onRowDragMove(event) {
  let movingNode = event.node;
  let overNode = event.overNode;
  let rowNeedsToMove = movingNode !== overNode;
  if (rowNeedsToMove) {
    let movingData = movingNode?.data;
    let overData = overNode?.data;

    if (movingData === null || overData === null)
      return

    let fromIndex = rowData.value.indexOf(movingData);
    let toIndex = rowData.value.indexOf(overData);
    rowData.value[toIndex] = movingData;
    rowData.value[fromIndex] = overData;
    gridApi.value.setGridOption("rowData", rowData.value);
    gridApi.value.clearFocusedCell();
  }
}

function onDragStopped(params) {
  const cols = params.columnApi.getAllDisplayedColumns()
  colDefs.value = colDefs.value
    .sort((a, b) => cols.findIndex(col => col.colId === a.field) - cols.findIndex(col => col.colId === b.field))
    .map((e, i) => ({ ...e, rowDrag: i === 0 }))
  save()
}

function onCellEditingStopped() {
  save()
}

function addRow() {
  rowData.value.push({})
  gridApi.value.setGridOption("rowData", rowData.value);
}
/*** End of Table ***/

const save = debounce(async () => {
  console.log("colDefs", colDefs.value)
  console.table(rowData.value)
  try {
    let res = await $fetch(`${config.public.apiBase}/table/${route.params.id}`, {
      method: "POST",
      headers,
      body: {
        fields: colDefs.value,
        rows: rowData.value,
      },
    })

    if (res.success) {
      tb.value.notify({ message: res.message, type: "success" })
    } else {
      tb.value.notify({ message: res.message, type: "error", timeout: 0 })
    }
  } catch (err) {
    tb.value.notify({ message: err, type: "error" })
  }
}, 3000)


function log() {
  onCellEditingStopped()
}

onMounted(() => {
  feather.replace()
  initFlowbite()
})
</script>

<template>
  <h2 class="text-2xl">{{ tableRes.data.name }}</h2>
  <div class="flex flex-row">
    <button
      type="button"
      class="flex items-center text-blue-500 hover:text-white border border-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 text-center me-2 mb-2"
      @click="addRow"
    >
      <i class="w-4 h-4 me-1" data-feather="plus"></i>
      Row
    </button>
    <button
      type="button"
      class="flex items-center text-blue-500 hover:text-white border border-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 text-center me-2 mb-2"
      data-modal-target="addColModal"
      data-modal-toggle="addColModal"
      @click="clearForm"
    >
      <i class="w-4 h-4 me-1" data-feather="plus"></i>
      Column
    </button>
  </div>
  <button type="button" class="text-blue-500 hover:text-white border border-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 text-center me-2 mb-2" @click="log">Test</button>
  <AgGridVue
    @grid-ready="onGridReady"
    :rowData="rowData"
    :columnDefs="colDefs"
    :defaultColDefs="{
      singleClickEdit: true,
    }"

    autoHeaderHeight
    wrapHeaderText

    animateRows
    rowDragEntireRow
    @sort-changed="onSortChanged"
    @filter-changed="onFilterChanged"
    @row-drag-move="onRowDragMove"

    @drag-stopped="onDragStopped"

    stopEditingWhenCellsLoseFocus
    @cell-editing-stopped="onCellEditingStopped"

    enterNavigatesVertically
    enterNavigatesVerticallyAfterEdit

    rowSelection="multiple"

    domLayout="autoHeight"
    style="overflow-x: auto;"
    class="ag-theme-quartz"

    ref="grid"
  >
  </AgGridVue>

  <Modal id="addColModal" ref="addColModal">
    <template #title>Add New Column</template>
    <template #body>
      <form class="space-y-4 px-4 py-6" @submit.prevent="submitAddCol">
        <div class="flex flex-row items-baseline">
          <label for="name" class="w-1/3 block mb-2 font-medium text-gray-900">Column Name</label>
          <input type="text" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-2" id="name" v-model="form.name" required>
        </div>
        <div class="flex flex-row items-baseline">
          <label for="name" class="w-1/3 block mb-2 font-medium text-gray-900">Field</label>
          <input type="text" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-2" id="name" v-model="form.field" required>
        </div>
        <label class="inline-flex items-center cursor-pointer">
          <input type="checkbox" value="" class="sr-only peer" v-model="form.isFormula">
          <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span class="ms-3 text-sm font-medium text-gray-900">Is Formula?</span>
        </label>
        <div v-if="form.isFormula">
          <div class="inline-flex mb-4" role="group">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border-t border-b border-l border-gray-900 hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white"
              :class="{
                'rounded-s-lg': index === 0,
                'border-r rounded-e-lg': index === colDefs.length - 1,
              }"
              v-for="(col, index) in colDefs"
              :key="col.field"
              @click="addFormulaTerm(col.field)"
            >
              {{ col.field }}
            </button>
          </div>
          <input
            type="text"
            class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-2"
            id="name"
            v-model="form.formula"
            required
            ref="formulaInput">
        </div>
        <div class="flex flex-row items-baseline" v-else>
          <label for="name" class="w-1/3 block mb-2 font-medium text-gray-900">Type</label>
          <select id="countries" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" v-model="form.type">
            <option value="agTextCellEditor">Text</option>
            <option value="agNumberCellEditor">Number</option>
            <option value="agDateCellEditor">Date</option>
            <option value="agCheckboxCellEditor">Checkbox</option>
          </select>
        </div>
        <div class="flex flex-row justify-end">
          <button type="submit" class="py-2 px-4 h-fit rounded text-gray-50 bg-blue-500">Confirm</button>
        </div>
      </form>
    </template>
  </Modal>

  <ToastBox ref="tb"></ToastBox>
</template>
