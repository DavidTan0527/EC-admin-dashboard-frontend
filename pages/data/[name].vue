<script setup>
import { AgGridVue } from "ag-grid-vue3";
const route = useRoute()

// Row Data: The data to be displayed.
const rowData = reactive([
  { make: "Tesla", model: "Model Y", price: 64950, electric: true },
  { make: "Ford", model: "F-Series", price: 33850, electric: false },
  { make: "Toyota", model: "Corolla", price: 29600, electric: false },
])

// Column Definitions: Defines the columns to be displayed.
const colDefs = ref([
  { field: "make" },
  { field: "model" },
  { field: "price" },
  { field: "electric" },
])

colDefs.value[0].rowDrag = true

const gridApi = ref(null)
function onGridReady(params) {
  gridApi.value = params.api
}

// const strData = computed(() => rowData.value.map(row => JSON.stringify(row)))

watch(rowData, () => {
  console.log("updated")
  console.table(rowData.value)
})

function log() {
  const colInstances = gridApi.value.getAllGridColumns()
  console.log(colInstances.map(e => ({ field: e.colId })))
  console.table(rowData)
}

</script>

<template>
  <h3>This is the {{ route.params.name }} page</h3>
  <div class="flex flex-row">
    <button
      type="button"
      class="text-blue-500 hover:text-white border border-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 text-center me-2 mb-2"
      @click="rowData.push({})"
    >
      Add Row
    </button>
  </div>
  <button type="button" class="text-blue-500 hover:text-white border border-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 text-center me-2 mb-2">Add Column</button>
  <button type="button" class="text-blue-500 hover:text-white border border-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 text-center me-2 mb-2" @click="log">Test</button>
  <AgGridVue
    @grid-ready="onGridReady"
    :rowData="rowData"
    :columnDefs="colDefs"
    :defaultColDef="{
      editable: true,
      singleClickEdit: true,
    }"

    autoHeaderHeight
    wrapHeaderText

    rowDragManaged
    stopEditingWhenCellsLoseFocus
    enterNavigatesVertically
    enterNavigatesVerticallyAfterEdit

    undoRedoCellEditing
    :undoRedoCellEditingLimit="20"

    animateRows
    rowSelection="multiple"

    domLayout="autoHeight"
    style="overflow-x: auto;"
    class="ag-theme-quartz"

    ref="grid"
  >
  </AgGridVue>
</template>
