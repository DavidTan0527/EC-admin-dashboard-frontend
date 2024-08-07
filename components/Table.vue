<script setup>
import { initFlowbite } from 'flowbite'

const props = defineProps({
  id: {
    type: String,
    default: "table",
  },
  columns: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    required: true,
  },
  actions: {
    type: Object,
    default: () => {},
  },
  addBtn: {
    type: Boolean,
    default: false,
  },
  addModal: {
    type: Boolean,
    default: false,
  },
  addBtnAction: {
    type: Function,
    default: () => {},
  },
  addBtnText: {
    type: String,
    default: "Add"
  },
  searchColumns: {
    type: Array,
    default: [],
  },
  rowDraggable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([ "roworderchange" ])

const search = ref("")
const originalRows = toRef(props, "rows")
const displayRows = computed(() =>
  originalRows.value.filter(row => props.searchColumns.length === 0 || props.searchColumns.some(key => key in row && row[key].includes(search.value)))
)

const modal = ref(null)
function onAddBtnClick() {
  props.addBtnAction()
  if (props.addModal) {
    modal.value.open()
  }
}

watch(originalRows, () => {
  nextTick().then(() => feather.replace())
}, { deep: true })

let moveTarget = null
const onRowDragStart = event => {
  moveTarget = event.target
}

const onRowDragEnd = event => {
  moveTarget = null
}

const onRowDragOver = event => {
  let moveOverRow = event.target.parentElement
  const fromIndex = parseInt(moveTarget.dataset.index)
  const toIndex = parseInt(moveOverRow.dataset.index)
  
  if (fromIndex === toIndex) {
    return
  }

  const temp = originalRows.value[fromIndex]
  originalRows.value[fromIndex] = originalRows.value[toIndex]
  originalRows.value[toIndex] = temp

  emit("roworderchange", fromIndex, toIndex)
}

defineExpose({
  openModal: () => modal.value.open(),
  closeModal: () => modal.value.close(),
})

</script>

<template>
  <div class="table-component">
    <div class="w-full flex flex-row justify-between items-center space-x-2 pb-4">
      <button
        class="py-2 px-4 h-fit rounded text-gray-50 bg-blue-500 hover:bg-blue-600 duration-100"
        type="button"
        v-if="addBtn"
        @click="onAddBtnClick"
      >
        {{ addBtnText }}
      </button>
      <div class="bg-white grow" v-if="searchColumns.length > 0">
        <label for="table-search" class="sr-only">Search</label>
        <div class="relative">
          <div class="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input
            type="text" id="table-search"
            class="block py-2 ps-10 text-sm text-gray-900 border border-gray-300 w-full rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search for items"
            v-model="search"
          >
        </div>
      </div>
    </div>
    <table class="w-full rounded sm:rounded-lg border-collapse border border-gray-100 shadow-md">
      <thead class="text-sm text-gray-700 uppercase bg-gray-50">
        <tr>
          <th class="px-6 py-3" v-for="column in columns" :key="column.key">{{ column.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr class="bg-white border-b border-gray-100" :class="[`row-${i}`]" v-for="(row, i) in displayRows" :key="JSON.stringify(row)"
          :data-index="i"
          :draggable="rowDraggable && search.length === 0" @dragstart="onRowDragStart" @dragend="onRowDragEnd" @dragover.prevent="onRowDragOver">
          <td class="px-6 py-3" :class="[column.key]" v-for="column in columns" :key="column.key">
            <slot :name="column.key" :data="row" :index="i" :action="actions">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <Modal v-if="addModal" :id="id + '-modal'" ref="modal">
      <template #title>
        <slot name="modal-title"></slot>
      </template>
      <template #body>
        <slot name="modal-body"></slot>
      </template>
    </Modal>
  </div>
</template>
