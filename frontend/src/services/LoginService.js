import http from "../http-common";


class LoginService {

  async login(data) {
    const res = await http.post("/authenticate", data)
    if(res) {
      console.log(res.data)
      // set sessionStorage items
      sessionStorage.setItem("auth", res.data.token)
      const user = res.data.user || {}
      console.log(user)
      sessionStorage.setItem("user", JSON.stringify(user))

      return {success: true}
    }
    else return {success: false}
  }

  setup() {
    return http.get("/setup")
  }

  reset() {
    // clear session information
    sessionStorage.clear()
  }

  authCheck (to, from, next) {
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (sessionStorage.getItem("auth") == null) {
        next({
          path: '/login',
          params: { nextUrl: to.fullPath }
        })
      } 
      else {
        let user = JSON.parse( sessionStorage.getItem('user') )
        if (to.matched.some(record => record.meta.is_admin)) {
          if (user.is_admin) {
            next()
          } 
          else {
            console.log("admin user requested")
            next({
              path: '/login',
              params: { nextUrl: to.fullPath }
            })
          }
        } 
        else {
          next()
        }
      }
    } 
    else if (to.matched.some(record => record.meta.guest)) {
      if (sessionStorage.getItem("auth") == null) {
        next()
      } 
      else {
        next({ path: from.fullPath })
      }
    } 
    else {
      next()
    }
  }
  
}
  
export default new LoginService();