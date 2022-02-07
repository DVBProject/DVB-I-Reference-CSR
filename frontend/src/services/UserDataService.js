import http from "../http-common";


let configdata = {
  headers: { 'Authorization': sessionStorage.getItem("auth") }
}


 
class UserDataService {
  getAll() {
    return http.get("/users", configdata);
  }

  get(id) {
    return http.get(`/users/${id}`, configdata);
  }

  create(data) {
    return http.post("/users", data, configdata);
  }

  update(id, data) {
    return http.put(`/users/${id}`, data, configdata);
  }

  delete(id) {
    return http.delete(`/users/${id}`, configdata);
  }

  changePwd(data) {
    return http.post("/pwd", data, configdata);
  }
  
}

export default new UserDataService();