<script setup>
import { initFlowbite } from 'flowbite'
const btnOpen = ref(null)
const btnClose = ref(null)

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

onMounted(() => {
  initModals()
})

onUpdated(() => {
  initModals()
})

defineExpose({
  open: () => btnOpen.value.click(),
  close: () => btnClose.value.click(),
})
</script>

<template>
  <div :id="id" tabindex="-1" class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
    <div class="relative p-4 w-full max-w-lg max-h-full">
      <!-- Modal content -->
      <div class="relative bg-white rounded-lg shadow">
        <!-- Modal header -->
        <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            <slot name="title"></slot>
          </h3>
          <button
            type="button"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
            :data-modal-hide="id"
            ref="btnClose"
          >
              <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
              <span class="sr-only">Close modal</span>
          </button>
        </div>
        <!-- Modal body -->
        <slot class="p-4 md:p-5" name="body"></slot>
      </div>
    </div>
  </div>
  <button class="hidden" :data-modal-target="id" :data-modal-show="id" ref="btnOpen"></button>
</template>

