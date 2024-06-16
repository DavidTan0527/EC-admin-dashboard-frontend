<script setup>
const props = defineProps({
  links: {
    type: Array,
    default: [],
  },
})

const route = useRoute()

function isActive(url) {
  return route.path === url
}

</script>

<template>
  <aside id="default-sidebar" class="sticky bg-white h-full w-64 transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
    <div class="h-full px-3 py-4 overflow-y-auto">
      <ul class="space-y-2 font-medium">
        <li v-for="link in links" :key="JSON.stringify(link)">
          <NuxtLink
            :to="link.href"
            class="flex items-center p-2 rounded-lg duration-100 hover:text-blue-500"
            :class="[
              isActive(link.href) ? 'text-blue-500' : 'text-gray-900',
            ]"
          >
            <i class="mr-2 w-5 h-5" v-if="'icon' in link" :data-feather="link.icon"></i>
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </aside>
</template>

