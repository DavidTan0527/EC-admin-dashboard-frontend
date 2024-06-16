<script setup>
import Cookies from "js-cookie"

const links = [
  { label: "Home"           , href: "/landing"    , icon: "home" },
  { label: "User Management", href: "/users"      , icon: "users" },
  { label: "Permissions"    , href: "/permissions", icon: "lock" },
]

function logout() {
  Cookies.remove("ec-t")
  navigateTo("/login")
}
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

