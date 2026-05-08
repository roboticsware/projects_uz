// 부관리자(sub_admin) 이상만 접근 가능 (sub_admin | admin)
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, user } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/auth/login')
  }

  const allowedRoles = ['sub_admin', 'admin']
  if (!allowedRoles.includes(user.value?.role)) {
    return navigateTo('/')
  }
})
