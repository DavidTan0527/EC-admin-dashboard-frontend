<script setup>
const config = useRuntimeConfig()
definePageMeta({
  middleware: ["permission"],
  permissionKey: "PG_DATA",
})

const cookie = useCookie("ec-t")
if (!cookie?.value) {
  navigateTo("/login", { redirectCode: 401 })
}

const headers = {
  "Authorization": "Bearer " + cookie.value,
}

const isLoading = ref(true)

const columns = [
  { label: "Name", key: "name" },
  { label: "Permission", key: "permKey" },
  { label: "Actions", key: "actions" },
]

const tb = ref(null)
const table = ref(null)
const form = reactive({
  name: ref(""),
  permKey: ref(""),
})

const { data: tableReq, refresh } = await useApiFetch("/table/schema", {
  headers,
})

const { data: permRes } = await useApiFetch("/permission_keys", {
  headers,
})

isLoading.value = false

let editTableId = ""
async function submit() {
  try {
    let url = editTableId === ""
      ? config.public.apiBase + "/table"
      : `${config.public.apiBase }/table/${editTableId}`

    const res = await $fetch(url, {
      method: editTableId === "" ? "POST" : "PUT",
      headers,
      body: form,
    })

    if (res.success) {
      tb.value.notify({ message: res.message + "\n" + "Refresh the page to reload sidebar", type: "success" })
      refresh()
    } else {
      tb.value.notify({ message: res.message, type: "error" })
    }
  } catch (err) {
    tb.value.notify({ message: err, type: "error" })
  }
  table.value.closeModal()
}

function addRow() {
  form.name = ""
  form.permKey = ""
  editTableId = ""
}

function editRow(row) {
  form.name = row.name
  form.permKey = row.permKey
  editTableId = row.id
  table.value.openModal()
}

function save(from, to) {
  // save from -> to, to -> from
  const saveOne = async (index) => {
    let row = tableReq.value.data[index]

    try {
      const res = await $fetch(`${config.public.apiBase }/table/sort/${row.id}`, {
        method: "PUT",
        headers,
        body: { sortKey: index },
      })

      if (!res.success) {
        tb.value.notify({ message: res.message, type: "error" })
      }
    } catch (err) {
      tb.value.notify({ message: err, type: "error" })
    }
  }

  saveOne(from)
  saveOne(to)
}



async function deleteRow(row) {
  try {
    let res = await $fetch(`${config.public.apiBase }/table/${row.id}`, {
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

</script>

<template>
  <div>
    <Spinner v-if="isLoading" />
    <Table
      v-else
      class="max-w-2xl"
      :columns="columns"
      :rows="tableReq.data ?? []"
      :searchColumns="['name', 'permKey']"
      addBtn
      :addBtnAction="addRow"
      addModal
      rowDraggable
      @roworderchange="save"
      ref="table"
    >
      <template #actions="{ data }">
        <button
          class="cursor-pointer font-semibold text-amber-300 hover:text-amber-200 duration-100 mr-4"
          @click="editRow(data)"
        >
          Edit
        </button>
        <button class="cursor-pointer font-semibold text-red-500 hover:text-red-400 duration-100" @click="deleteRow(data)">Delete</button>
      </template>

      <template #modal-title>Add New Table</template>
      <template #modal-body>
        <form class="space-y-4 p-6" @submit.prevent="submit">
          <div class="flex flex-row items-baseline">
            <label for="name" class="w-1/3 block mb-2 font-medium text-gray-900">Name</label>
            <input type="text" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-2" id="username" v-model="form.name" required>
          </div>
          <div class="flex flex-row items-baseline">
            <label for="data-table" class="w-1/3 block mb-2 font-medium text-gray-900">Permission Key</label>
            <select id="data-table" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" v-model="form.permKey">
              <option value="">--</option>
              <option
                v-for="key in permRes.data"
                :key="key"
                :value="key"
              >
                {{ key }}
              </option>
            </select>
          </div>
          <div class="flex flex-row justify-end">
            <button type="submit" class="py-2 px-4 h-fit rounded text-gray-50 bg-blue-500">Confirm</button>
          </div>
        </form>
      </template>
    </Table>
  </div>

  <ToastBox ref="tb"></ToastBox>
</template>

