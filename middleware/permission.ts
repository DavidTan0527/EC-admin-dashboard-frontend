export default defineNuxtRouteMiddleware(async (to, from) => {
  const { permissionKey } = to.meta

  if (permissionKey === undefined || permissionKey === null || permissionKey === "")
    return abortNavigation()

  const config = useRuntimeConfig()
  try {
    const cookie = useCookie<string>("ec-t")
    if (!cookie?.value) {
      return navigateTo("/login", { redirectCode: 401 })
    }

    let res = await $fetch<HttpResponse>(config.public.apiBase + "/permission/" + permissionKey, {
      headers: {
        "Authorization": "Bearer " + cookie.value
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

