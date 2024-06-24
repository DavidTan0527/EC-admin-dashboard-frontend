<script setup>
const config = useRuntimeConfig()

const cookie = useCookie("ec-t")
if (!cookie?.value) {
  navigateTo("/login", { redirectCode: 401 })
}

const headers = {
  "Authorization": "Bearer " + cookie.value
}

const isLoading = ref(true)

const table = ref(null)
const columns = [
  { label: "Name", key: "name" },
  { label: "Actions", key: "actions" },
]

const editModal = ref(null)
const tb = ref(null)

const form = reactive({
  name: ref(""),
})
const editForm = reactive({
  name: ref(""),
})

const { data: tableReq, refresh } = await useApiFetch("/table", {
  headers,
})

isLoading.value = false

async function submitAdd() {
  if (tableReq.value.data.includes(form.name)) {
    tb.notify({ type: "error", message: `Table with name ${form.name} already exists!` })
    return
  }

  try {
    const res = await $fetch(config.public.apiBase + "/table", {
      method: "POST",
      headers,
      body: {
        name: form.name,
        fields: [],
        rows: [],
      },
    })

    if (res.success) {
      tb.value.notify({ message: res.message, type: "success" })
      refresh()
    } else {
      tb.value.notify({ message: res.message, type: "error" })
    }
  } catch (err) {
    tb.value.notify({ message: err, type: "error" })
  }

  table.value.closeModal()
}

async function submitEdit() {
  if (tableReq.value.data.includes(editForm.name)) {
    tb.notify({ type: "error", message: `Table with name ${editForm.name} already exists!` })
    return
  }

  try {
    const res = await $fetch(config.public.apiBase + "/table", {
      method: "POST",
      headers,
      body: {
        name: form.name,
        fields: [],
        rows: [],
      },
    })

    if (res.success) {
      tb.value.notify({ message: res.message, type: "success" })
      refresh()
    } else {
      tb.value.notify({ message: res.message, type: "error" })
    }
  } catch (err) {
    tb.value.notify({ message: err, type: "error" })
  }

  table.value.closeModal()
}

function editRow(row) {
  console.log("edit", row)
}

function deleteRow(row) {
  console.log("delete", row)
}

</script>

<template>
  <div>
    <Spinner v-if="isLoading" />
    <Table
      v-else
      class="max-w-md"
      :columns="columns"
      :rows="tableReq.data.map(el => ({ name: el })) ?? []"
      :searchColumns="['name']"
      addBtn
      ref="table"
    >
      <template #is_super="{ data }">
        {{ data.is_super ? "Yes" : "No" }}
      </template>
      <template #actions="{ data }">
        <button
          class="cursor-pointer font-semibold text-amber-300 hover:text-amber-200 duration-100 mr-2"
          @click="editForm.name = data.name"
          data-modal-target="editModal"
          data-modal-toggle="editModal"
        >
          Rename
        </button>
        <button class="cursor-pointer font-semibold text-red-500 hover:text-red-400 duration-100" @click="deleteRow(data)">Delete</button>
      </template>

      <template #modal-title>Add New Table</template>
      <template #modal-body>
        <form class="space-y-4 p-6" @submit.prevent="submitAdd">
          <div class="flex flex-row items-baseline">
            <label for="name" class="w-1/4 block mb-2 font-medium text-gray-900">Name</label>
            <input type="text" class="w-3/4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-2" id="username" v-model="form.name" required>
          </div>
          <div class="flex flex-row justify-end">
            <button type="submit" class="py-2 px-4 h-fit rounded text-gray-50 bg-blue-500">Confirm</button>
          </div>
        </form>
      </template>
    </Table>
  </div>

  <Modal id="editModal" ref="editModal">
    <template #title>Rename</template>
    <template #body>
      <form class="space-y-4 p-6" @submit.prevent="submitAdd">
        <div class="flex flex-row items-baseline">
          <label for="name" class="w-1/4 block mb-2 font-medium text-gray-900">Name</label>
          <input type="text" class="w-3/4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-2" id="username" v-model="editForm.name" required>
        </div>
        <div class="flex flex-row justify-end">
          <button type="submit" class="py-2 px-4 h-fit rounded text-gray-50 bg-blue-500">Confirm</button>
        </div>
      </form>
    </template>
  </Modal>

  <ToastBox ref="tb"></ToastBox>
</template>

