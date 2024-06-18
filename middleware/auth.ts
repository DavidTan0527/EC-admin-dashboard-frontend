import Cookies from "js-cookie"

export default defineNuxtRouteMiddleware(async (to, from) => {
  // skip middleware on server
  if (import.meta.server) return

  const config = useRuntimeConfig()
  try {
    const cookie = Cookies.get("ec-t")
    if (cookie === "" || cookie === undefined || cookie === null) {
      return navigateTo("/login", { redirectCode: 401 })
    }
      

    let res = await $fetch<HttpResponse>(config.public.apiBase + "/checkToken", {
      headers: {
        "Authorization": "Bearer " + Cookies.get("ec-t")
      },
    })

    if (res.success) {
      return
    }

    return navigateTo("/login", { redirectCode: 401 })

  } catch (err : any) {
    console.log("ERR", err)
    return abortNavigation(err)
  }

})

