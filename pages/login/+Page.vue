<template>
    <h1 class="text-primary">ADMIN DASHBOARD</h1>
    <form class="needs-validation" novalidate @submit.prevent="submitLogin">
        <div class="mb-3">
            <label for="username" class="col-sm-2 col-form-label">Username</label>
            <input type="text" class="form-control" id="username" v-model="username" required>
            <div class="invalid-feedback">
                username required
            </div>
        </div>
        <div class="mb-3">
            <label for="password" class="col-sm-2 col-form-label">Password</label>
            <input type="password" class="form-control" id="password" v-model="password" required>
            <div class="invalid-feedback">
                password required
            </div>
        </div>
        <button type="submit" class="btn btn-primary">Login</button>
    </form>
</template>

<script setup>
import { navigate } from 'vike/client/router'
import { ref } from 'vue'
import Cookies from 'js-cookie'

const username = defineModel('username', { type: String })
const password = defineModel('password', { type: String })

async function submitLogin() {
    // console.log(username.value, password.value)
    let req = await fetch(import.meta.env.VITE_API_BASE_URL + '/login', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.value, password: password.value }),
    })
    let res = await req.json()

    if (res.success) {
        Cookies.set('ec-t', res.data.token, { expires: 5 })
        console.log("Login success. Redirect to landing page.")
        await navigate("/landing")
    }
}

</script>


