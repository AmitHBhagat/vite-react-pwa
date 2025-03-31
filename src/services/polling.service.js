import httpClient from "../httpClient";
const baseSlug = "/admin/poll";

class PollService {
  createPoll(data) {
    return httpClient.post(baseSlug, data);
  }

  getAllPolls(societyId) {
    return httpClient.get(`${baseSlug}s/${societyId}`);
  }

  getPollById(id) {
    return httpClient.get(`${baseSlug}/${id}`);
  }

  updatePoll(id, data) {
    return httpClient.put(`${baseSlug}/${id}`, data);
  }

  deletePoll(id) {
    return httpClient.delete(`${baseSlug}/${id}`);
  }
}

export default new PollService();
