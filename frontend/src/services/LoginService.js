import http from "../http-common";

/*
sessionStorage.setItem("auth", "token") // hax
import login from "./Login";
login.login(configdata) */

class LoginService {

    login(data) {
      return http.post("/authenticate", data)
    }

    setup() {
      return http.get("/setup")
    }
  }
  
export default new LoginService();