import http from "../http-common";


let configdata = {
  headers: { 'Authorization': sessionStorage.getItem("auth") }
}

class ProviderDataService {
  getAll() {
    return http.get("/providers", configdata);
  }

  get(id) {
    return http.get(`/providers/${id}`, configdata);
  }

  create(data) {
    return http.post("/providers", data, configdata);
  }

  update(id, data) {
    return http.put(`/providers/${id}`, data, configdata);
  }

  delete(id) {
    return http.delete(`/providers/${id}`, configdata);
  }
  findByTitle(title) {
    return http.get(`/providers?title=${title}`, configdata);
  }
}

export default new ProviderDataService();