import http from "../http-common";

let configdata = {
  headers: { Authorization: sessionStorage.getItem("auth") },
};

class ListproviderDataService {
  get() {
    return http.get(`/listprovider`, configdata);
  }

  update(data) {
    return http.put(`/listprovider`, data, configdata);
  }
}

export default new ListproviderDataService();
