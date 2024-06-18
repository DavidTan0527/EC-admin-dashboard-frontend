import * as jose from "jose"

export default defineNuxtRouteMiddleware(async (to, from) => {
  // skip middleware on client
  if (import.meta.client) return

  if (to.meta.layout === "empty") return

  const config = useRuntimeConfig()
  try {
    const cookie = useCookie<string>("ec-t")
    if (!cookie?.value) {
      return navigateTo("/login", { redirectCode: 401 })
    }
    
    const hexToUint8Array = (hexString : string) => new Uint8Array(
      hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    const key = hexToUint8Array(config.jwtSecret)

    const { payload } = await jose.jwtVerify(cookie.value, key)
    console.log("PAYLOAD", payload)

  } catch (err : any) {
    console.log("ERR", err)
    return navigateTo("/login", { redirectCode: 401 })
    // return abortNavigation(err)
  }

})

