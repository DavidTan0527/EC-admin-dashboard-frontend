<script setup>
import Cookies from "js-cookie"
const config = useRuntimeConfig()
definePageMeta({ middleware: ["auth"] })

const columns = [
    { label: "Username", key: "username" },
    { label: "Super User?", key: "is_super" },
    { label: "Actions", key: "actions" },
]
const rows = ref([])

// modal refs
const addModal = ref(null)
const btnOpenModal = ref(null)
const btnModalSubmit = ref(null)

const tb = ref(null)

const form = reactive({
    username: ref(""),
    password: ref(""),
    isSuper: ref(false),
})

let isLoading = ref(true)

async function getAllRows() {
  try {
    let res = await $fetch(config.public.apiBase + "/users", {
      headers: {
        "Authorization": "Bearer " + Cookies.get("ec-t")
      },
    })
    if (res.success) {
      rows.value = res.data
    } else {
      tb.value.notify({ message: res.message, type: "error", timeout: 0 })
    }
  } catch {
    tb.value.notify({ message: "Something went wrong. Please try again.", type: "error" })
  }
}

async function submitRegister() {
  try {
    let res = await $fetch(config.public.apiBase + "/register", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + Cookies.get("ec-t"),
        "Content-Type": "application/json",
      },
      body: {
        username: form.username,
        password: form.password,
        is_super: form.isSuper
      }
    })
    console.log(res)
    if (res.success) {
      tb.value.notify({ message: `User ${form.username} added`, type: "success" })
      getAllRows()
      addModal.value.close()
    } else {
      tb.value.notify({ message: res.message, type: "error", timeout: 0 })
    }
  } catch {
    tb.value.notify({ message: "Something went wrong. Please try again.", type: "error" })
  }
}

async function deleteRow(row) {
  try {
    if (row?.id === null || row?.id === undefined) {
      return
    }

    let res = await $fetch(config.public.apiBase + `/user/${row.id}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + Cookies.get("ec-t")
      },
    })

    if (res.success) {
      tb.value.notify({ message: `User ${row.username} deleted`, type: "success" })
      getAllRows()
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

onMounted(async () => {
  await getAllRows()
  isLoading.value = false
})
</script>

<template>
  <Spinner v-if="isLoading" />
  <Table v-else class="w-1/2 max-w-lg" :columns="columns" :rows="rows" :searchColumns="['username']" addBtn :addBtnAction="() => $refs.btnOpenModal.click()">
    <template #is_super="{ data }">
      {{ data.is_super ? "Yes" : "No" }}
    </template>
    <template #actions="{ data }">
      <button class="cursor-pointer font-semibold text-red-500 hover:text-red-400 duration-100" @click="deleteRow(data)">Delete</button>
    </template>
  </Table>

  <button class="hidden" data-modal-target="addModal" data-modal-toggle="addModal" ref="btnOpenModal" @click="clearForm"></button>
  <Modal id="addModal" ref="addModal">
    <template #title>Add New User</template>
    <template #body>
      <form class="space-y-4 px-4 py-6" @submit.prevent="submitRegister" novalidate>
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
  </Modal>

  <ToastBox ref="tb"></ToastBox>
</template>


