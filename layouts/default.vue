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

const { data: links, refresh } = await useFetch("/meta/navLinks")

function logout() {
  cookie.value = null
  navigateTo("/login")
}
</script>

<template>
  <div class="flex flex-col items-stretch h-screen">
    <header class="flex flex-row justify-between items-center border-b border-gray-200 px-5 py-2">
      <div class="text-lg font-bold">EC Admin Dashboard</div>
      <span class="cursor-pointer rounded p-2 hover:text-white hover:bg-blue-500 duration-300" @click="logout">
        <i data-feather="log-out"></i>
      </span>
    </header>

    <div class="flex flex-row content-container grow">
      <div class="flex flex-col justify-between w-1/5 max-w-lg">
        <Sidebar :links="links" />
      </div>
      <div class="relative w-4/5 p-4 xl:grow">
        <slot />
      </div>
    </div>
  </div>

</template>

