<script setup>
import { initFlowbite } from 'flowbite'
const props = defineProps({
  links: {
    type: Array,
    default: [],
  },
})

const route = useRoute()

function isActive(url) {
  return route.path.replace(/\/$/, '') === url.replace(/\/$/, '')
}

onMounted(() => {
  feather.replace()
  initFlowbite()
})
</script>

<template>
  <aside id="default-sidebar" class="sticky bg-white h-full w-64 transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
    <div class="flex flex-col justify-between h-full px-3 py-4 overflow-y-auto">
      <ul class="space-y-2 font-medium">
        <li v-for="link in links" :key="JSON.stringify(link)">
          <NuxtLink
            v-if="link.href"
            :to="link.href"
            class="flex items-center p-2 rounded-lg text-base transition duration-75 hover:bg-gray-100"
            :class="[
              isActive(link.href) ? 'text-blue-500' : 'text-gray-900',
            ]"
          >
            <i class="mr-3 w-5 h-5" v-if="'icon' in link" :data-feather="link.icon ?? false"></i>
            {{ link.label }}
          </NuxtLink>

          <template v-else-if="link.children">
            <button
              type="button"
              class="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100"
              :aria-controls="'dropdown-' + link.label.replaceAll(' ', '-')"
              :data-collapse-toggle="'dropdown-' + link.label.replaceAll(' ', '-')"
            >
              <i class="mr-3 w-5 h-5" v-if="'icon' in link" :data-feather="link.icon"></i>
              <span class="flex-1 text-left rtl:text-right whitespace-nowrap">{{ link.label }}</span>
              <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
              </svg>
            </button>
            <ul :id="'dropdown-' + link.label.replaceAll(' ', '-')" class="hidden py-1 pl-1 ml-4 space-y-2 border-l-2 border-gray-500">
              <li v-for="child in link.children" :key="JSON.stringify(child)">
                <NuxtLink
                  v-if="child.href"
                  :to="child.href"
                  class="flex items-center p-2 rounded-lg duration-100 hover:bg-gray-100"
                  :class="[
                    isActive(child.href) ? 'text-blue-500' : 'text-gray-900',
                  ]"
                >
                  <i class="mr-3 w-5 h-5" v-if="'icon' in child" :data-feather="child.icon ?? false"></i>
                  {{ child.label }}
                </NuxtLink>
              </li>
            </ul>
          </template>
        </li>
      </ul>
    </div>
  </aside>
</template>

