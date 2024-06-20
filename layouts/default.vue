<script setup>
import * as jose from 'jose'
const nuxtApp = useNuxtApp()
const config = useRuntimeConfig()

const hexToUint8Array = hexString => new Uint8Array(
  hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

const cookie = useCookie("ec-t")
if (!cookie?.value) {
  navigateTo("/login", { redirectCode: 401 })
}

const { data: links } = await useFetch("/api/navLinks")

function logout() {
  cookie.value = null
  navigateTo("/login")
}

onMounted(() => {
  feather.replace()
})
</script>

<template>
  <div class="h-screen overflow-y-hidden">
    <header class="flex flex-row justify-between items-center border-b border-gray-200 px-5 py-2">
      <div class="text-lg font-bold">EC Admin Dashboard</div>
      <span class="cursor-pointer rounded p-2 hover:text-white hover:bg-blue-500 duration-300" @click="logout">
        <i data-feather="log-out"></i>
      </span>
    </header>

    <div class="flex flex-row content-container min-h-full">
      <Sidebar class="w-1/5" :links="links" />
      <div class="w-4/5 p-4">
        <slot />
      </div>
    </div>
  </div>

</template>

