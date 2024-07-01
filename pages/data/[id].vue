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

const dateComparator = (filterDate, cellValue) => {
  let cellDate = new Date(cellValue)
  if (filterDate === cellDate) {
    return 0;
  }
  if (cellDate < filterDate) {
    return -1;
  }
  if (cellDate > filterDate) {
    return 1;
  }
  return 0;
}

/*** Start of Modal ***/
const addColModal = ref(null)
const delColModal = ref(null)
const formulaInput = ref(null)

const targetDelCol = ref("")
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
  form.formula += ` getValue('${field}') `
  formulaInput.value.focus()
}

function submitAddCol() {
  try {
    let col = { headerName: form.name, field: form.field, rowDrag: colDefs.value.length === 0 }
    if (form.isFormula) {
      let formula = unref(form.formula)
      col = {
        ...col,
        formula,
        valueGetter: ({ getValue, data, node }) => {
          const value = eval(formula)
          if (!("rowPinned" in node))
            tableRes.value.data.rows[node.rowIndex][form.field] = value
          return value
        },
        valueSetter: params => {
            params.data[form.field] = params.newValue
            return true
        },
        editable: false
      }
    } else {
      col = { ...col, cellEditor: form.type, editable: true }
      if (form.type === "agDateCellEditor") {
        col.valueFormatter = dateFormatter
      } else if (form.type === "agSelectCellEditor") {
        col.cellEditorParams = {
          values: form.selectOptions,
          valueListMaxHeight: 120,
        }
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

function submitDelCol() {
  const targetIdx = colDefs.value.findIndex(col => col.field === targetDelCol.value)
  colDefs.value.splice(targetIdx, 1)
  gridApi.value.setGridOption("columnDefs", colDefs.value);
  save()
  delColModal.value.close()
}

watch(
  () => form.type,
  () => nextTick().then(feather.replace))
/*** End of Modal ***/

/*** Start of MonthPicker ***/
const yearRef = ref(new Date().getFullYear())
const monthRef = ref(new Date().getMonth())
const monthPicker = ref(null)

async function dateChange() {
  await forceSave()
  yearRef.value = monthPicker.value.year
  monthRef.value = monthPicker.value.month
}
/*** End of MonthPicker ***/

/*** Start of Table ***/
let { data: tableRes } = await useAsyncData(
  "table-data",
  () => $fetch(`${config.public.apiBase }/table/${route.params.id}/${yearRef.value}/${monthRef.value+1}`, { headers }),
  { watch: [yearRef, monthRef] }
)

const colDefs = ref(tableRes.value.data.fields.map((e, i) => ({
  ...e,
  filter: true,
  filterParams: {
    buttons: [ 'apply', 'clear', 'reset', 'cancel' ],
    ...(e.cellEditor === "agDateCellEditor") && { comparator: dateComparator },
  },
  editable: !('formula' in e),
  rowDrag: i === 0,
  cellEditorParams: {
    ...(e.cellEditor === "agSelectCellEditor") && { valueListMaxHeight: 120 },
    ...e.cellEditorParams,
  },

  ...("formula" in e) && {
    valueGetter: ({ getValue, data, node }) => {
      const value = eval(e.formula)
      if (!("rowPinned" in node))
        tableRes.value.data.rows[node.rowIndex][e.field] = value
      return value
    },
  },

  ...(e.cellEditor === "agDateCellEditor") && {
    cellDataType: "date",
    valueFormatter: dateFormatter,
  },
})))

function getSumByCols() {
  const canSum = col => col.cellEditor === "agNumberCellEditor"
  const targetFields = colDefs.value.filter(canSum).map(e => e.field)
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

  return [res]
}

const gridApi = ref(null)
function onGridReady(params) {
  gridApi.value = params.api
  gridApi.value.setGridOption("columnDefs", colDefs.value);
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

function onModelUpdated() {
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

    let fromIndex = tableRes.value.data.rows.indexOf(movingData);
    let toIndex = tableRes.value.data.rows.indexOf(overData);

    if (fromIndex === -1 || toIndex === -1)
      return

    tableRes.value.data.rows[toIndex] = movingData;
    tableRes.value.data.rows[fromIndex] = overData;
    gridApi.value.setGridOption("rowData", tableRes.value.data.rows);
    gridApi.value.clearFocusedCell();
  }
}

function onColumnMoved(params) {
  const cols = params.api.getAllDisplayedColumns()
  colDefs.value = colDefs.value
    .sort((a, b) => cols.findIndex(col => col.colId === a.field) - cols.findIndex(col => col.colId === b.field))
    .map((e, i) => ({ ...e, rowDrag: i === 0 }))
  gridApi.value.setGridOption("columnDefs", colDefs.value);
}

function onDragStopped(params) {
  save()
}

function onCellEditingStopped() {
  gridApi.value.setGridOption("pinnedBottomRowData", getSumByCols())
  save()
}

function addRow() {
  tableRes.value.data.rows.unshift({})
  const res = gridApi.value.applyTransaction({ add: [{}], addIndex: 0 });
  save()
}

function removeSelectedRow() {
  const selectedData = gridApi.value.getSelectedRows();
  const res = gridApi.value.applyTransaction({ remove: selectedData });
  save()
}
/*** End of Table ***/


const save = debounce(saveInner, 1000)
const notify = debounce((...args) => tb.value.notify(...args), 3000)

async function saveInner() {
  if (gridApi.value === null) {
    return
  }

  try {
    const rows = []
    gridApi.value.forEachNode(({ data }) => rows.push(data))

    let res = await $fetch(`${config.public.apiBase}/table/${route.params.id}/${yearRef.value}/${monthRef.value+1}`, {
      method: "POST",
      headers,
      body: {
        fields: colDefs.value,
        rows,
      },
    })

    if (res.success) {
      notify({ message: res.message, type: "success", timeout: 1200 })
    } else {
      notify({ message: res.message, type: "error", timeout: 0 })
    }
  } catch (err) {
    notify({ message: err, type: "error" })
  }
}

async function forceSave() {
  save.cancel()
  await saveInner()
}

onMounted(() => {
  feather.replace()
  initModals()
  initPopovers()
})

onBeforeUnmount(() => {
  forceSave()
})

</script>

<template>
  <h2 class="text-2xl mb-2">Name: {{ tableRes.data.name }} ({{ yearRef }}/{{ monthRef+1 }})</h2>
  <MonthPicker
      data-popover
      id="popover"
      role="tooltip"
      class="absolute z-10 invisible inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-md opacity-0"
      :month="monthRef"
      :year="yearRef"
      @change="dateChange"
      ref="monthPicker"
  >
  </MonthPicker>
  <div class="flex flex-col space-y-4">
    <div class="flex flex-row mb-2">
      <button data-popover-target="popover" data-popover-placement="top" data-popover-offset="20" type="button" class="flex items-center text-white me-4 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center">
        <i class="w-4 h-4" data-feather="calendar"></i>
      </button>
      <button
        type="button"
        class="flex items-center text-blue-500 hover:text-white border border-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 text-center me-2"
        @click="addRow"
      >
        <i class="w-4 h-4 me-1" data-feather="plus"></i>
        Row
      </button>
      <button
        type="button"
        class="flex items-center text-blue-500 hover:text-white border border-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 text-center me-2"
        data-modal-target="addColModal"
        data-modal-toggle="addColModal"
        @click="clearForm"
      >
        <i class="w-4 h-4 me-1" data-feather="plus"></i>
        Column
      </button>

      <button
        type="button"
        class="flex items-center text-blue-500 hover:text-white border border-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 text-center me-2"
        @click="removeSelectedRow"
      >
        <i class="w-4 h-4 me-1" data-feather="minus"></i>
        Selected Row
      </button>

      <button
        type="button"
        class="flex items-center text-blue-500 hover:text-white border border-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 text-center me-2"
        data-modal-target="delColModal"
        data-modal-show="delColModal"
      >
        <i class="w-4 h-4 me-1" data-feather="minus"></i>
        Column
      </button>
    </div>

    <AgGridVue
      @grid-ready="onGridReady"
      :rowData="tableRes.data.rows"

      autoHeaderHeight
      wrapHeaderText
      :autoSizeStrategy="{
        type: 'fitCellContents',
      }"

      animateRows
      rowDragEntireRow
      @sort-changed="onSortChanged"
      @filter-changed="onFilterChanged"
      @row-drag-move="onRowDragMove"

      @column-moved="onColumnMoved"
      @drag-stopped="onDragStopped"

      stopEditingWhenCellsLoseFocus
      @cell-editing-stopped="onCellEditingStopped"

      @model-updated="onModelUpdated"

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

  <Modal id="delColModal" ref="delColModal">
    <template #title>Remove a Column</template>
    <template #body>
      <form class="space-y-4 px-4 py-6" @submit.prevent="submitDelCol">
        <div class="flex flex-row items-baseline">
          <label for="col" class="w-1/3 block mb-2 font-medium text-gray-900">Type</label>
          <select id="col" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" v-model="targetDelCol">
            <option
              v-for="col in colDefs"
              :key="col.field"
              :value="col.field"
            >
              {{ col.headerName }}
            </option>
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

<style>
.ag-center-cols-viewport {
    min-height: 200px !important;
}

.ag-floating-bottom-container .ag-row {
    background-color: var(--ag-header-background-color);
}
</style>

