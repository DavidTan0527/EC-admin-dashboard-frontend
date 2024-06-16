export default defineNuxtRouteMiddleware((to, from) => {
  const config = useRuntimeConfig()
  console.log(config.public)
  // console.log(jwt.verify(Cookies.get("ec-t"), config.jwtSecret))

  // In a real app you would probably not redirect every route to `/`
  // however it is important to check `to.path` before redirecting or you
  // might get an infinite redirect loop
  if (to.path === '/') {
    return navigateTo('/landing', { redirectCode: 301 })
  }
})

