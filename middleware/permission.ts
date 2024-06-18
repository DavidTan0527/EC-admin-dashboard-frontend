import Cookies from "js-cookie"

export default defineNuxtRouteMiddleware(async (to, from) => {

  const { permissionKey } = to.meta

  if (permissionKey === undefined || permissionKey === null || permissionKey === "")
    return abortNavigation()

  const config = useRuntimeConfig()
  try {
    const cookie = Cookies.get("ec-t")
    if (cookie === "" || cookie === undefined || cookie === null) {
      return navigateTo("/login", { redirectCode: 401 })
    }

    let res = await $fetch<HttpResponse>(config.public.apiBase + "/permission/" + permissionKey, {
      headers: {
        "Authorization": "Bearer " + Cookies.get("ec-t")
      },
    })

    if (!res.success || !res.data) {
      return abortNavigation("No permission")
    }

  } catch (err : any) {
    console.log("ERR", err)
    return abortNavigation(err)
  }

})

