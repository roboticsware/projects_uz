// 교사(teacher) 이상만 접근 가능 (teacher | sub_admin | admin)
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, user } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/auth/login')
  }

  const allowedRoles = ['teacher', 'sub_admin', 'admin']
  if (!allowedRoles.includes(user.value?.role)) {
    return navigateTo('/')
  }
})
