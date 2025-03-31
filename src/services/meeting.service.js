import httpClient from "../httpClient";

const baseSlug = "/admin/meeting";

class HttpService {
  async createMeeting(meetingData) {
    return await httpClient.post(baseSlug, meetingData);
  }

  async getAllMeetings(societyId) {
    return await httpClient.get(`/admin/meetings/${societyId}`);
  }

  async getMeetingById(meetingId) {
    return await httpClient.get(`${baseSlug}/${meetingId}`);
  }

  async updateMeeting(meetingId, updatedData) {
    return await httpClient.put(`${baseSlug}/${meetingId}`, updatedData);
  }

  async deleteMeeting(meetingId) {
    return await httpClient.delete(`${baseSlug}/${meetingId}`);
  }
}

const http = new HttpService();
export default http;
