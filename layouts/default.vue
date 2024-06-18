<script setup>
import * as jose from 'jose'
const nuxtApp = useNuxtApp()
const config = useRuntimeConfig()

const hexToUint8Array = hexString => new Uint8Array(
  hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

let links = [
  { label: "Home"           , href: "/landing"    , icon: "home" },
  { label: "User Management", href: "/users"      , icon: "users", superOnly: true },
  { label: "Permissions"    , href: "/permissions", icon: "lock" , superOnly: true },
]

const cookie = useCookie("ec-t")
if (!cookie?.value) {
  navigateTo("/login", { redirectCode: 401 })
}

nuxtApp.hook("render:html", async (html, { event }) => {
  console.log("rendered!!", import.meta.server)
  console.log(html, event)
  return
  const key = hexToUint8Array(config.jwtSecret)
  try {
    const { payload } = await jose.jwtVerify(cookie.value, key)
    if (!payload.is_super) {
      links = links.filter(link => !link.superOnly)
    }
  } catch (err) {
    navigateTo("/login", { redirectCode: 401 })
  }
})

function logout() {
  useCookie("ec-t").value = null
  navigateTo("/login")
}

onMounted(() => {
  feather.replace();
})
</script>

<template>
  <div class="h-screen overflow-y-hidden">
    <header class="flex flex-row justify-between border-b border-gray-200 p-4">
      <div class="text-lg font-bold">EC Admin Dashboard</div>
      <span class="cursor-pointer" @click="logout">
        <i data-feather="log-out"></i>
      </span>
    </header>

    <div class="flex flex-row content-container min-h-full">
      <Sidebar class="w-1/5 border-r" :links="links" />
      <div class="w-4/5 bg-neutral-50 p-4">
        <slot />
      </div>
    </div>
  </div>

</template>

