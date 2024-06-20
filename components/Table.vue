<script setup>
const props = defineProps({
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
  addBtnText: {
    type: String,
    default: "Add"
  },
  addBtnAction: {
    type: Function,
    default: () => {},
  },
  searchColumns: {
    type: Array,
    default: [],
  },
});

const search = ref("")
const displayRows = ref([])

const triggerRefresh = toRef(props, "rows")
watch(triggerRefresh, () => {
  displayRows.value = props.rows
}, { immediate: true })

</script>

<template>
  <div class="table-component">
    <div class="w-full flex flex-row justify-between items-center space-x-2 pb-4">
      <button class="py-2 px-4 h-fit rounded text-gray-50 bg-blue-500 hover:bg-blue-600 duration-100" type="button" v-if="addBtn" @click="addBtnAction">{{ addBtnText }}</button>
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
            @input="() => displayRows = props.rows.filter(row => props.searchColumns.some(key => row[key].includes(search)))"
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
        <tr class="bg-white border-b border-gray-100" :class="[`row-${i}`]" v-for="(row, i) in displayRows" :key="JSON.stringify(row)">
          <td class="px-6 py-3" :class="[column.key]" v-for="column in columns" :key="column.key">
            <slot :name="column.key" :data="row" :action="actions">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
