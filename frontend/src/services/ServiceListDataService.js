import http from "../http-common";


let configdata = {
  headers: { 'Authorization': sessionStorage.getItem("auth") }
}


 
class ServiceListDataService {
  getAll() {
    return http.get("/servicelist", configdata);
  }

  get(id) {
    return http.get(`/servicelist/${id}`, configdata);
  }

  create(data) {
    return http.post("/servicelist", data, configdata);
  }

  update(id, data) {
    return http.put(`/servicelist/${id}`, data, configdata);
  }

  delete(id) {
    return http.delete(`/servicelist/${id}`, configdata);
  }
  
  findByTitle(title) {
    return http.get(`/servicelist?title=${title}`, configdata);
  }

  getListHistory(id) {
    return http.get(`/eventhistory/${id}`, configdata);
  }

  getByProvider(id) {
    return http.get(`/servicelist/provider/${id}`, configdata);
  }
}

export default new ServiceListDataService();