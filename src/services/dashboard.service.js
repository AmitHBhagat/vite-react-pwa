import httpClient from "../httpClient";

class httpService {
  getAnalytics(data) {
    return httpClient.post(`analytics/productOrders`, data);
  }
}

export default new httpService();
