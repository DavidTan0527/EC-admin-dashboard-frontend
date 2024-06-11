<template>
    <div class="text-primary">Users page</div>
    <Table :headers="headers" :rows="rows" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Cookies from 'js-cookie'
import Table from '~components/Table.vue';

let headers = [
    { label: "Username", key: "username" },
    { label: "Super User?", key: "is_super" },
]
let rows = ref([])

onMounted(async () => {
    let req = await fetch(import.meta.env.VITE_API_BASE_URL + "/users", {
        headers: {
            "Authorization": "Bearer " + Cookies.get("ec-t")
        },
    })
    let res = await req.json()
    if (res.success) {
        rows.value = res.data
    }
    console.log(res)
})

</script>

