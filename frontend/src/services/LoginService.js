import http from "../http-common";

let configdata = {
  headers: { Authorization: sessionStorage.getItem("auth") },
};

class LoginService {
  async login(data) {
    const res = await http.post("/authenticate", data).catch((err) => {
      console.log(err);
      // clear session storage
      sessionStorage.clear();
    });

    if (res && res.data.success) {
      // set sessionStorage items
      sessionStorage.setItem("auth", res.data.token);
      const user = res.data.user || {};
      sessionStorage.setItem("user", JSON.stringify(user));
      return { success: true };
    } else {
      return { success: false };
    }
  }

  async logout() {
    await http.get("/logout", configdata).catch((err) => {
      console.log(err);
    });
    // clear session storage
    sessionStorage.clear();
  }

  // TODO: handler for request auth exceptions (currently views will redirect to /)
  //

  // initial user setup req
  setup() {
    return http.get("/setup");
  }

  reset() {
    console.log("reset");
    // clear session information
    sessionStorage.clear();
    // reload previous view & trigger re-login
    window.location = "/";
  }

  // ui-routing middleware
  authCheck(to, from, next) {
    if (to.matched.some((record) => record.meta.requiresAuth)) {
      if (sessionStorage.getItem("auth") == null) {
        next({
          path: "/login",
          params: { nextUrl: to.fullPath },
        });
      } else {
        let user = JSON.parse(sessionStorage.getItem("user"));
        if (to.matched.some((record) => record.meta.is_admin)) {
          if (user.role) {
            next();
          } else {
            console.log("admin user requested");
            next({
              path: "/login",
              params: { nextUrl: to.fullPath },
            });
          }
        } else {
          next();
        }
      }
    } else if (to.matched.some((record) => record.meta.guest)) {
      if (sessionStorage.getItem("auth") == null) {
        next();
      } else {
        next({ path: from.fullPath });
      }
    } else {
      next();
    }
  }
}

export default new LoginService();
