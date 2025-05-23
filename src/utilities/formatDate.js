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

export const getDayMonthYear = (date) => {
  const day = moment(date).format("D");
  const month = moment(date).format("MM");
  const year = moment(date).format("YYYY");

  return { day, month, year };
};

export const getLast24Hours = () => {
  const endOfDay = moment().endOf("day").toISOString();
  const startOfLast24Hours = moment().subtract(24, "hours").toISOString();
  return { startOfLast24Hours, endOfDay };
};
