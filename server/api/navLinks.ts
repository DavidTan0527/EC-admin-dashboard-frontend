import * as jose from "jose"
import { H3Event } from "h3"

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig()

  const hexToUint8Array = (hexString : string) => new Uint8Array(
    hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))

  const key = hexToUint8Array(config.jwtSecret)

  try {
    const cookie = parseCookies(event)["ec-t"]
    if (!cookie) {
      return []
    }

    const { payload } = await jose.jwtVerify(cookie, key)

    let res = await $fetch<HttpResponse>(config.public.apiBase + "/table", {
      headers: {
        "Authorization": "Bearer " + cookie
      },
    })

    if (!res.success || res.data === null) {
      console.log("FAILED", res.message)
      return []
    }

    let tables : String[] = res.data

    let links = [
      { label: "Home", href: "/landing", icon: "home" },
      { label: "Data", icon: "pie-chart",
        children: [
          { label: "Overall", href: "/data", icon: "list" },
          ...tables.map(name => (
            { label: name, href: `/data/${name}`, icon: "table" }
          )),
        ],
      },
      { label: "User Management" , href: "/users"      , icon: "users", superOnly: true },
      { label: "Permissions"     , href: "/permissions", icon: "lock" , superOnly: true },
      { label: "Account Settings", href: "/settings"   , icon: "settings" },
    ]


    if (!payload.is_super) {
      links = links.filter(link => !link.superOnly)
    }

    return links
  } catch (err) {
    console.log("ERR", err)
    return []
  }
})
