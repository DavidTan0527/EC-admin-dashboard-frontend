<template>
    <div id="page-container" class="container p-3">
        <div class="row" v-if="!isLogin">
            <div id="sidebar" class="col-2">
                <nav class="nav nav-pills flex-column">
                    <Link href="/landing">Landing</Link>
                    <Link href="/user">User Management</Link>
                    <Link href="/settings">Settings</Link>
                </nav>
            </div>
            <div id="page-content" class="col-10">
                <slot />
            </div>
        </div>

        <template v-else>
            <slot />
        </template>
    </div>
</template>

<script setup>
import '~renderer/css/index.css'
import Link from '~components/Link.vue'
import { computed } from 'vue'
import { usePageContext } from '~renderer/usePageContext'

const isLogin = computed(() => {
    const { urlPathname } = usePageContext()
    return urlPathname === '/login'
})

</script>

