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

const dateFormatter = (params) => {
  if (!params.value) {
    return "";
  }
  let value = params.value
  if (typeof value === "string") {
    value = new Date(value)
  }
  const month = value.getMonth() + 1;
  const day = value.getDate();
  return `${value.getFullYear()}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`;
}

/*** Start of Modal ***/
const addColModal = ref(null)
const formulaInput = ref(null)

const form = reactive({
  name: ref(""),
  field: ref(""),
  isFormula: ref(false),
  formula: ref(""),
  type: ref(""),
  selectOptions: ref([]),
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
  form.selectOptions = []
}

function addFormulaTerm(field) {
  form.formula += ` data['${field}'] `
  formulaInput.value.focus()
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
        col.valueFormatter = dateFormatter
      } else if (form.type === "agSelectCellEditor") {
        col.cellEditorParams = { values: form.selectOptions }
      }
    }
    colDefs.value.push(col)
    gridApi.value.setGridOption("columnDefs", colDefs.value);
    save()
  } catch (err) {
    tb.notify({ type: "error", message: err })
  }
  addColModal.value.close()
}

watch(
  () => form.type,
  () => nextTick().then(feather.replace))
/*** End of Modal ***/


/*** Start of Table ***/
const rowData = ref([])
const colDefs = ref([])

let tableRes

try {
  ({ data: tableRes } = await useApiFetch(`/table/${route.params.id}`, {
    headers,
  }))

  if (!tableRes.value.success) {
    tb.value.notify({ message: tableRes.value.message, type: "error", timeout: 0 })
  }
} catch (err) {
  tb.value.notify({ message: err, type: "error", timeout: 0 })
}

colDefs.value = tableRes.value.data.fields
colDefs.value.map((e, i) => {
  e.filter = true
  e.editable = !('formula' in e)
  e.rowDrag = i === 0
})

colDefs.value
  .map((e, i) => ({ e, i }))
  .filter(({ e, i }) => "formula" in e)
  .forEach(({ e, i }) => colDefs.value[i].valueGetter = ({ data }) => eval(e.formula))

colDefs.value
  .map((e, i) => ({ e, i }))
  .filter(({ e, i }) => e.cellEditor === "agDateCellEditor")
  .forEach(({ e, i }) => {
    colDefs.value[i].cellDataType = "date"
    colDefs.value[i].valueFormatter = dateFormatter
  })

rowData.value = tableRes.value.data.rows
function getSumByCols() {
  const canSum = col => col.cellEditor === "agNumberCellEditor"
  const targetFields = colDefs.value.filter(e => canSum(e)).map(e => e.field)
  let res = {}
  for (const field of targetFields) {
    res[field] = 0
  }

  gridApi.value.forEachNodeAfterFilter(({ data: row }) => {
    row ??= {}
    for (const field of targetFields) {
      res[field] += row[field] ?? 0
    }
  })

  if (colDefs.value.length > 0) {
    res[colDefs.value[0].field] = "SUM"
  }
    
  return [res]
}

const gridApi = ref(null)
function onGridReady(params) {
  gridApi.value = params.api
  gridApi.value.setGridOption("columnDefs", colDefs.value);
  gridApi.value.setGridOption("pinnedBottomRowData", getSumByCols())
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
  gridApi.value.setGridOption("pinnedBottomRowData", getSumByCols())
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

    if (fromIndex === -1 || toIndex === -1)
      return

    rowData.value[toIndex] = movingData;
    rowData.value[fromIndex] = overData;
    gridApi.value.setGridOption("rowData", rowData.value);
    gridApi.value.clearFocusedCell();
  }
}

function onDragStopped(params) {
  const cols = params.api.getAllDisplayedColumns()
  colDefs.value = colDefs.value
    .sort((a, b) => cols.findIndex(col => col.colId === a.field) - cols.findIndex(col => col.colId === b.field))
    .map((e, i) => ({ ...e, rowDrag: i === 0 }))
  save()
}

function onCellEditingStopped() {
  gridApi.value.setGridOption("pinnedBottomRowData", getSumByCols())
  save()
}

function addRow() {
  const res = gridApi.value.applyTransaction({ add: [{}] });
  save()
}

function removeSelectedRow() {
  const selectedData = gridApi.value.getSelectedRows();
  const res = gridApi.value.applyTransaction({ remove: selectedData });
  save()
}
/*** End of Table ***/


const save = debounce(async () => {
  try {
    const rows = []
    gridApi.value.forEachNode(({ data }) => rows.push(data))

    let res = await $fetch(`${config.public.apiBase}/table/${route.params.id}`, {
      method: "POST",
      headers,
      body: {
        fields: colDefs.value,
        rows,
      },
    })

    if (res.success) {
      tb.value.notify({ message: res.message, type: "success", timeout: 1200 })
    } else {
      tb.value.notify({ message: res.message, type: "error", timeout: 0 })
    }
  } catch (err) {
    tb.value.notify({ message: err, type: "error" })
  }
}, 3000)


onMounted(() => {
  feather.replace()
  initModals()
})
</script>

<template>
  <h2 class="text-2xl mb-2">Name: {{ tableRes.data.name }}</h2>
  <div class="flex flex-col space-y-4">
    <div class="flex flex-row mb-1">
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

      <button
        type="button"
        class="flex items-center text-blue-500 hover:text-white border border-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 text-center me-2 mb-2"
        @click="removeSelectedRow"
      >
        <i class="w-4 h-4 me-1" data-feather="minus"></i>
        Selected Row
      </button>
    </div>

    <AgGridVue
      @grid-ready="onGridReady"
      :rowData="rowData"

      autoHeaderHeight
      wrapHeaderText
      :autoSizeStrategy="{
        type: 'fitGridWidth',
      }"

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

  </div>

  <!-- Add Column Modal -->
  <Modal id="addColModal" ref="addColModal">
    <template #title>Add New Column</template>
    <template #body>
      <form class="space-y-4 px-4 py-6" @submit.prevent="submitAddCol">
        <div class="flex flex-row items-baseline">
          <label for="name" class="w-1/3 block mb-2 font-medium text-gray-900">Column Name</label>
          <input type="text" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-2" id="name" v-model="form.name" required>
        </div>
        <div class="flex flex-row items-baseline">
          <label for="field" class="w-1/3 block mb-2 font-medium text-gray-900">Field</label>
          <input type="text" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-2" id="field" v-model="form.field" required>
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
        <div class="space-y-4" v-else>
          <div class="flex flex-row items-baseline">
            <label for="type" class="w-1/3 block mb-2 font-medium text-gray-900">Type</label>
            <select id="type" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" v-model="form.type">
              <option value="agTextCellEditor">Text</option>
              <option value="agNumberCellEditor">Number</option>
              <option value="agSelectCellEditor">Select</option>
              <option value="agDateCellEditor">Date</option>
              <option value="agCheckboxCellEditor">Checkbox</option>
            </select>
          </div>
          <div class="flex flex-row items-baseline" v-if="form.type === 'agSelectCellEditor'">
            <label class="flex flex-col space-y-1 items-start w-1/3 block mb-2 font-medium text-gray-900">
              Select Options
              <span class="flex flex-row space-x-2">
                <span class="hover:text-green-500" @click="() => form.selectOptions.push('')">
                  <i class="w-5 h-5 ml-2 cursor-pointer" data-feather="plus-circle"></i>
                </span>
                <span class="hover:text-red-500" @click="() => form.selectOptions.pop()">
                  <i class="w-5 h-5 ml-2 cursor-pointer" data-feather="minus-circle"></i>
                </span>
              </span>
            </label>
            <div class="w-2/3 flex flex-col space-y-1">
              <input
                type="text"
                class="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-2"
                v-model="form.selectOptions[i]"
                v-for="(_, i) in form.selectOptions"
                required>
            </div>
          </div>
        </div>
        <div class="flex flex-row justify-end">
          <button type="submit" class="py-2 px-4 h-fit rounded text-gray-50 bg-blue-500">Confirm</button>
        </div>
      </form>
    </template>
  </Modal>

  <ToastBox ref="tb"></ToastBox>
</template>

<style>
.ag-floating-bottom-container .ag-row {
    background-color: var(--ag-header-background-color);
}
</style>

