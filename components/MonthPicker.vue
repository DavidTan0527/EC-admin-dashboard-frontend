<script setup>
const props = defineProps({
  month: { // 0-based
    type: Number,
    default: new Date().getMonth(),
  },
  year: {
    type: Number,
    default: new Date().getFullYear(),
  },
  duration: {
    type: Number,
    default: 12,
  },
})

const monthRef = ref(props.month)
const yearRef = ref(props.year)
const durationRef = ref(props.duration)

const monthOptions = ref([
  { label: "Jan", value: 0 },
  { label: "Feb", value: 1 },
  { label: "Mar", value: 2 },
  { label: "Apr", value: 3 },
  { label: "May", value: 4 },
  { label: "Jun", value: 5 },
  { label: "Jul", value: 6 },
  { label: "Aug", value: 7 },
  { label: "Sep", value: 8 },
  { label: "Oct", value: 9 },
  { label: "Nov", value: 10 },
  { label: "Dec", value: 11 },
])

const yearOptions = ref([])
for (let year = new Date().getFullYear(); year > 1970; year--) {
  yearOptions.value.push(year)
}

defineExpose({
  month: monthRef,
  year: yearRef,
  duration: durationRef,
})
</script>

<template>
  <div class="flex flex-col space-y-6 drop-shadow-lg p-4 rounded-lg w-72">
    <select id="small" class="block p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" name="year" v-model="yearRef">
      <option :value="year" v-for="year in yearOptions" :key="year">
        {{ year }}
      </option>
    </select>

    <ul class="grid gap-x-2 gap-y-4 justify-items-center grid-cols-4">
      <li v-for="month in monthOptions" :key="month.value">
        <input
          class="hidden peer"
          type="radio"
          name="month"
          :id="month.label"
          :value="month.value"
          v-model="monthRef">
        <label
          class="px-3 py-2 rounded-md cursor-pointer hover:bg-blue-100 hover:text-gray-700 text-gray-900 peer-checked:text-white peer-checked:bg-blue-500"
          :for="month.label"
        >
          {{ month.label }}
        </label>
      </li>
    </ul>

    <ul class="grid w-full grid-cols-4 gap-2 items-stretch text-xs">
      <li>
        <input id="horizontal-duration-1-month" type="radio" :value="1" name="duration" class="peer hidden" v-model="durationRef">
        <label for="horizontal-duration-1-month" class="inline-flex items-center justify-center w-full h-full p-1 font-medium text-center text-gray-900 border rounded-lg cursor-pointer border-gray-900 peer-checked:border-blue-500 peer-checked:text-blue-500 hover:text-gray-600 hover:bg-slate-100">1 mth</label>
      </li>
      <li>
        <input id="horizontal-duration-3-month" type="radio" :value="3" name="duration" class="peer hidden" v-model="durationRef">
        <label for="horizontal-duration-3-month" class="inline-flex items-center justify-center w-full h-full p-1 font-medium text-center text-gray-900 border rounded-lg cursor-pointer border-gray-900 peer-checked:border-blue-500 peer-checked:text-blue-500 hover:text-gray-600 hover:bg-slate-100">3 mth</label>
      </li>
      <li>
        <input id="horizontal-duration-6-month" type="radio" :value="6" name="duration" class="peer hidden" v-model="durationRef">
        <label for="horizontal-duration-6-month" class="inline-flex items-center justify-center w-full h-full p-1 font-medium text-center text-gray-900 border rounded-lg cursor-pointer border-gray-900 peer-checked:border-blue-500 peer-checked:text-blue-500 hover:text-gray-600 hover:bg-slate-100">6 mth</label>
      </li>
      <li>
        <input id="horizontal-duration-12-month" type="radio" :value="12" name="duration" class="peer hidden" v-model="durationRef">
        <label for="horizontal-duration-12-month" class="inline-flex items-center justify-center w-full h-full p-1 font-medium text-center text-gray-900 border rounded-lg cursor-pointer border-gray-900 peer-checked:border-blue-500 peer-checked:text-blue-500 hover:text-gray-600 hover:bg-slate-100">1 yr</label>
      </li>
    </ul>
  </div>
</template>

