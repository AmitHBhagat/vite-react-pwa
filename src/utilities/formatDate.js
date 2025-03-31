import moment from "moment";
export const formatDateMonth = (date, format = "DD MMM YYYY") => {
  return moment(date).format(format);
};

export const formatDate = (date, format = "DD/MM/YYYY") => {
  return moment(date).format(format);
};

export const formatDateTime = (date, format = "DD/MM/YYYY, hh:mm A") => {
  return moment(date).format(format);
};

export const formatDateMonthTime = (
  dateTime,
  format = "DD MMM YYYY, hh:mm A"
) => {
  return moment(dateTime).format(format);
};

export const formatTime = (dateTime, format = "hh:mm A") => {
  return moment(dateTime).format(format);
};

export const getStartOfDay = (date) => {
  return moment(date).startOf("day").toISOString();
};

export const getEndOfDay = (date) => {
  return moment(date).endOf("day").toISOString();
};
