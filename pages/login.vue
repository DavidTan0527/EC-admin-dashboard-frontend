<script setup>
const config = useRuntimeConfig()

definePageMeta({
  layout: "empty",
})

const tb = ref(null)

const username = ref("");
const password = ref("");

const cookie = useCookie("ec-t", { maxAge: 3 * 24 * 60 * 60 })

async function submitLogin() {
  let res = await $fetch(config.public.apiBase + '/login', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: { username: username.value, password: password.value },
  })

  if (res.success) {
    cookie.value = res.data
    await navigateTo("/landing")
  } else {
      tb.value.notify({ message: res.message, type: "error" })
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto mt-10">
    <form class="flex flex-col space-y-8" @submit.prevent="submitLogin">
      <div class="form-group">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
          Username
        </label>
        <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username" v-model="username">
      </div>
      <div class="form-group">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
          Password
        </label>
        <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="********" v-model="password">
      </div>

      <button type="submit" class="rounded w-full text-slate-100 bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-2 drop-shadow hover:drop-shadow-lg duration-100">Login</button>
    </form>
  </div>
  <ToastBox ref="tb"></ToastBox>
</template>

