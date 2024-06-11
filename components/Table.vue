<template>
    <table class="table">
        <thead>
            <tr>
                <th v-for="header in headers" :key="header.key">{{ header.label }}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(row, index) in rows" :key="index">
                <td v-for="header in headers" :key="header.key + index">{{ row[header.key] }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
    headers: {
        type: Array,
        required: true,
    },
    rows: {
        type: Array,
        required: true,
    },
});
</script>
