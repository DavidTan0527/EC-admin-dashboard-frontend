<template>
  <a :class="{ 'nav-link': true, active: isActive }">
    <slot />
  </a>
</template>

<script setup>
import { useAttrs, computed } from 'vue'
import { usePageContext } from '~renderer/usePageContext'

const pageContext = usePageContext()
const { href } = useAttrs()
const isActive = computed(() => {
  const { urlPathname } = pageContext
  return href === '/' ? urlPathname === href : urlPathname.startsWith(href)
})
</script>

