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

    let tables : { id: string, name: string }[] = res.data

    let links = [
      { label: "Home", href: "/landing", icon: "home" },
      { label: "Chart", href: "/chart", icon: "bar-chart-2" },
      { label: "Chart View", href: "/chart-view", icon: "grid" },
      { label: "Data", icon: "database",
        children: [
          { label: "Overall", href: "/data", icon: "list" },
          ...tables.map(table => (
            { label: table.name, href: `/data/${table.id}`, icon: "table" }
          )),
        ],
      },
      { label: "Permissions"     , href: "/permissions", icon: "lock" , superOnly: true },
      { label: "User Management" , href: "/users"      , icon: "users", superOnly: true },
      // { label: "Account Settings", href: "/settings"   , icon: "settings" },
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
