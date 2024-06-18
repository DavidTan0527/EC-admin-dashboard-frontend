import { defineStore } from 'pinia'

export const myStore = defineStore({
  id: 'my-store',
  state: () => {
    return {
      isReady: false
    }
  }
})

