import httpClient from "../httpClient";
const baseSlug = "/admin/notice";

class httpService {
  getNotices(societyId) {
    return httpClient.get(`admin/notices/${societyId}`);
  }

  getNoticeDetails(noticeId) {
    return httpClient.get(`${baseSlug}/${noticeId}`);
  }

  createNotice(noticeData) {
    return httpClient.post(`${baseSlug}`, noticeData);
  }

  updateNotice(noticeId, noticeData) {
    return httpClient.put(`${baseSlug}/${noticeId}`, noticeData);
  }
  deleteNotice(noticeId) {
    return httpClient.delete(`${baseSlug}/${noticeId}`);
  }
}

export default new httpService();
