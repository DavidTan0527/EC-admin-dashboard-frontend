import * as jose from "jose"
import { H3Event } from "h3"

export default defineEventHandler(async (event: H3Event) => {
  let links = [
    { label: "Home"            , href: "/landing"    , icon: "home" },
    { label: "User Management" , href: "/users"      , icon: "users", superOnly: true },
    { label: "Permissions"     , href: "/permissions", icon: "lock" , superOnly: true },
    { label: "Account Settings", href: "/settings"   , icon: "settings" },
  ]

  const hexToUint8Array = (hexString : string) => new Uint8Array(
    hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))

  const config = useRuntimeConfig()
  const key = hexToUint8Array(config.jwtSecret)

  try {
    const cookie = parseCookies(event)["ec-t"]
    if (!cookie) {
      return []
    }

    const { payload } = await jose.jwtVerify(cookie, key)
    if (!payload.is_super) {
      links = links.filter(link => !link.superOnly)
    }
  } catch (err) {
    console.log("ERR", err)
    return []
  }

  return links
})
