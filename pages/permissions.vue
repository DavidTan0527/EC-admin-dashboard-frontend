<script setup>
const config = useRuntimeConfig()
definePageMeta({
  middleware: ["permission"],
  permissionKey: "PG_PERM",
})

const cookie = useCookie("ec-t")
if (!cookie?.value) {
  navigateTo("/login", { redirectCode: 401 })
}

const headers = {
  "Authorization": "Bearer " + cookie.value,
}

const tb = ref(null)
const btnAdd = ref(null)
const modal = ref(null)
const isLoading = ref(true)

const selectedPermKey = ref("")

const columns = [
  { label: "", key: "actions" },
  { label: "Username", key: "username" },
]
const { data: reqUsers } = await useApiFetch("/users", {
  headers,
})
const permUserList = ref([])

const form = reactive({
  key: ref(""),
})

const { data: reqPermKeys, refresh } = await useApiFetch("/permission_keys", {
  headers,
})

async function submitAdd() {
  try {
    const res = await $fetch(config.public.apiBase + "/permission", {
      method: "POST",
      headers,
      body: {
        key: form.key,
      },
    })

    if (res.success) {
      tb.value.notify({ message: res.message, type: "success" })
    } else {
      tb.value.notify({ message: res.message, type: "error", timeout: 0 })
    }
  } catch (err) {
    tb.value.notify({ message: err, type: "error" })
  }

  modal.value.close()
  refresh()
}

async function getPermUserList() {
  try {
    const res = await $fetch(config.public.apiBase + `/permission/${selectedPermKey.value}/list`, {
      headers,
    })

    if (res.success) {
      permUserList.value = res.data
    } else {
      tb.value.notify({ message: res.message, type: "error", timeout: 0 })
    }
  } catch (err) {
    tb.value.notify({ message: err, type: "error" })
  }
}

async function updatePerm(event, user_id) {
  const isChecked = event.target.checked

  try {
    const res = await $fetch(config.public.apiBase + "/permission", {
      method: isChecked ? "POST" : "DELETE",
      headers,
      body: {
        key: selectedPermKey.value,
        user_id,
      },
    })

    if (res.success) {
      tb.value.notify({ message: res.message, type: "success" })
    } else {
      tb.value.notify({ message: res.message, type: "error", timeout: 0 })
    }
  } catch (err) {
    tb.value.notify({ message: err, type: "error" })
  }
}

function clearForm() {
  form.key = ""
}

onMounted(() => {
  try {
    if (reqPermKeys.value.success) {
      if (reqPermKeys.value.data.length > 0) {
        selectedPermKey.value = reqPermKeys.value.data[0]
      }
    } else {
      tb.value.notify({ message: reqPermKeys.value.message, type: "error", timeout: 0 })
    }
  } catch (err) {
    tb.value.notify({ message: err, type: "error" })
  }

  getPermUserList()

  isLoading.value = false
})

watch(isLoading, (_) => {
  nextTick().then(feather.replace)
})

</script>

<template>
  <Spinner v-if="isLoading" />
  <div v-else>
    <div class="mb-2">
      <label for="perm-keys" class="block mb-2 text-sm font-medium text-gray-900">Permission Keys</label>
      <div class="flex flex-row">
        <select
          name="perm-keys"
          id="perm-keys"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 me-2"
          v-model="selectedPermKey"
          @change="getPermUserList"
        >
          <template v-for="key in reqPermKeys.data" :key="key">
            <option :value="key">{{ key }}</option>
          </template>
        </select>
        <button
          data-modal-target="popup-modal"
          data-modal-toggle="popup-modal"
          class="flex flex-row items-center py-2 px-4 h-fit rounded text-gray-50 bg-blue-500 hover:bg-blue-600 duration-100"
          ref="btnAdd"
          @click="clearForm"
        >
          Add <i class="ms-1 w-4 h-4" data-feather="plus"></i>
        </button>
      </div>
    </div>
    <div class="block mb-2 text-sm font-medium text-gray-500">* Unused permissions will automatically be deleted</div>

    <hr class="h-px my-8 bg-gray-200 border-0">

    <Table class="max-w-md" :columns="columns" :rows="reqUsers.data" :searchColumns="['username']">
      <template #actions="{ data }">
        <input
          :id="data.id"
          :value="data.id"
          type="checkbox"
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          :checked="permUserList.includes(data.id)"
          @click="updatePerm($event, data.id)"
        >
      </template>
    </Table>

    <Modal id="popup-modal" ref="modal">
      <template #title>Add New Permission</template>
      <template #body>
        <form class="space-y-4 px-4 py-6" @submit.prevent="submitAdd">
          <div class="flex flex-row items-baseline">
            <label for="key" class="w-1/3 block mb-2 font-medium text-gray-900">Permission Name</label>
            <input type="text" class="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-2" id="key" v-model="form.key" required>
          </div>
          <div class="flex flex-row justify-end">
            <button type="submit" class="py-2 px-4 h-fit rounded text-gray-50 bg-blue-500">Confirm</button>
          </div>
        </form>
      </template>
    </Modal>
  </div>

  <ToastBox ref="tb"></ToastBox>
</template>

