import http from "../http-common";

class ServiceListDataService {
  getAll() {
    return http.get("/servicelist");
  }

  get(id) {
    return http.get(`/servicelist/${id}`);
  }

  create(data) {
    return http.post("/servicelist", data);
  }

  update(id, data) {
    return http.put(`/servicelist/${id}`, data);
  }

  delete(id) {
    return http.delete(`/servicelist/${id}`);
  }
  findByTitle(title) {
    return http.get(`/servicelist?title=${title}`);
  }
}

export default new ServiceListDataService();