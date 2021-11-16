import http from "../http-common";



class ProviderDataService {
  getAll() {
    return http.get("/providers");
  }

  get(id) {
    return http.get(`/providers/${id}`);
  }

  create(data) {
    return http.post("/providers", data);
  }

  update(id, data) {
    return http.put(`/providers/${id}`, data);
  }

  delete(id) {
    return http.delete(`/providers/${id}`);
  }
  findByTitle(title) {
    return http.get(`/providers?title=${title}`);
  }
}

export default new ProviderDataService();