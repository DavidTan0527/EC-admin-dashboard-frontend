<script setup>
const config = useRuntimeConfig()
definePageMeta({
  middleware: ["permission"],
  permissionKey: "PG_USER_MANAGEMENT",
})

const cookie = useCookie("ec-t")
if (!cookie?.value) {
  navigateTo("/login", { redirectCode: 401 })
}

const headers = {
  "Authorization": "Bearer " + cookie.value
}

const table = ref(null)
const columns = [
  { label: "Username", key: "username" },
  { label: "Super User?", key: "is_super" },
  { label: "Actions", key: "actions" },
]

const tb = ref(null)

const form = reactive({
  username: ref(""),
  password: ref(""),
  isSuper: ref(false),
})

const isLoading = ref(true)

try {
  const { data: userRes, refresh } = await useApiFetch("/users", {
    headers,
  })
  if (!userRes.value.success) {
    tb.value.notify({ message: userRes.value.message, type: "error", timeout: 0 })
  }
} catch (err) {
  tb.value.notify({ message: err, type: "error", timeout: 0 })
}

isLoading.value = false

async function submitRegister() {
  try {
    let res = await $fetch(config.public.apiBase + "/register", {
      method: "POST",
      headers,
      body: {
        username: form.username,
        password: form.password,
        is_super: form.isSuper
      }
    })

    if (res.success) {
      tb.value.notify({ message: res.message, type: "success" })
      refresh()
    } else {
      tb.value.notify({ message: res.message, type: "error", timeout: 0 })
    }
  } catch {
    tb.value.notify({ message: "Something went wrong. Please try again.", type: "error" })
  }
  table.value.closeModal()
}

async function deleteRow(row) {
  try {
    if (row?.id === null || row?.id === undefined) {
      return
    }

    let res = await $fetch(config.public.apiBase + `/user/${row.id}`, {
      method: "DELETE",
      headers,
    })

    if (res.success) {
      tb.value.notify({ message: res.message, type: "success" })
      refresh()
    } else {
      tb.value.notify({ message: res.message, type: "error", timeout: 0 })
    }
  } catch {
    tb.value.notify({ message: "Something went wrong. Please try again.", type: "error" })
  }
}

function clearForm() {
    form.username = ""
    form.password = ""
    form.isSuper = false
}

</script>

<template>
  <Spinner v-if="isLoading" />
  <Table v-else class="max-w-md" :columns="columns" :rows="userRes.data" :searchColumns="['username']" addBtn ref="table">
    <template #is_super="{ data }">
      {{ data.is_super ? "Yes" : "No" }}
    </template>
    <template #actions="{ data }">
      <button class="cursor-pointer font-semibold text-red-500 hover:text-red-400 duration-100" @click="deleteRow(data)">Delete</button>
    </template>

    <template #modal-title>Add New User</template>
    <template #modal-body>
      <form class="space-y-4 p-6" @submit.prevent="submitRegister">
        <div class="flex flex-row items-baseline">
          <label for="username" class="w-1/4 block mb-2 font-medium text-gray-900">Username</label>
          <input type="text" class="w-3/4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-2" id="username" v-model="form.username" required>
        </div>
        <div class="flex flex-row items-baseline">
          <label for="password" class="w-1/4 block mb-2 font-medium text-gray-900">Password</label>
          <input type="text" class="w-3/4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-2" id="password" v-model="form.password" required>
        </div>
        <div>
          <input class="mr-2 rounded text-blue-500 border-gray-300" type="checkbox" value="" id="is-super" v-model="form.isSuper">
          <label class="form-check-label" for="is-super">
              set as super user?
          </label>
        </div>
        <div class="flex flex-row justify-end">
          <button type="submit" class="py-2 px-4 h-fit rounded text-gray-50 bg-blue-500">Confirm</button>
        </div>
      </form>
    </template>
  </Table>


  <ToastBox ref="tb"></ToastBox>
</template>


