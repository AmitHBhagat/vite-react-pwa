export const BREAK_POINTS = {
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400,
};

export const CHART_TYPES = {
  line: "line",
  area: "area",
  bar: "bar",
  histogram: "histogram",
  pie: "pie",
  donut: "donut",
  radialBar: "radialBar",
  scatter: "scatter",
  bubble: "bubble",
  heatmap: "heatmap",
  treemap: "treemap",
  boxPlot: "boxPlot",
  candlestick: "candlestick",
  radar: "radar",
  polarArea: "polarArea",
  rangeBar: "rangeBar",
};

export const MONTHS = [
  { label: "January", value: "January" },
  { label: "February", value: "February" },
  { label: "March", value: "March" },
  { label: "April", value: "April" },
  { label: "May", value: "May" },
  { label: "June", value: "June" },
  { label: "July", value: "July" },
  { label: "August", value: "August" },
  { label: "September", value: "September" },
  { label: "October", value: "October" },
  { label: "November", value: "November" },
  { label: "December", value: "December" },
];

export const POSITION = [
  { label: "Chairman", value: "Chairman" },
  { label: "Secretary", value: "Secretary" },
  { label: "Treasurer", value: "Treasurer" },
  { label: "Member", value: "Member" },
];

export const ACCOUNTTYPE = [
  { label: "Saving", value: "Saving" },
  { label: "Current", value: "Current" },
  { label: "CC", value: "CC" },
];

export const ROLE = [
  { label: "Admin", value: "admin" },
  { label: "Security", value: "security" },
];
// maintenance add
export const MAINTENANCE_TYPE_VALUES = [
  { label: "Fixed Amount", value: "FixedAmount" },
  { label: "On-Area", value: "OnArea" },
];

export const MAINTENANCE_PERIOD_VALUES = [
  { label: "Monthly", value: "Monthly" },
  { label: "Quarterly", value: "Quaterly" }, // Quaterly is spelled wrong on purpose by db
  { label: "Yearly", value: "Yearly" },
];

// maintenance modal
export const CALC_OR_ARREARS_INTEREST_TYPES = [
  { label: "Fixed", value: "fixed" },
  { label: "Percent", value: "percent" },
];
export const CHARGE_TYPES = [
  { label: "Additional", value: "additional" },
  { label: "Inclusive", value: "inclusive" },
];
export const PARAM_TYPES = [
  { label: "String", value: "String" },
  { label: "Number", value: "Number" },
  { label: "Boolean", value: "Boolean" },
];

export const EXPENSETYPE = [
  { label: "Bill", value: "Bill" },
  { label: "Voucher", value: "Voucher" },
];
export const PAYMENTMODE = [
  { label: "Cheque", value: "Cheque" },
  { label: "Cash", value: "Cash" },
  { label: "Transfer", value: "Transfer" },
];

// flat management
// "commercial" not accepted by server
// "both values are accepted in capital letters"
export const FLAT_TYPE = [
  { label: "Residential", value: "Residential" },
  { label: "Commercial", value: "Commercial" },
];

export const REQUESTQUERY_STATUS = [
  { label: "Open", value: "Open" },
  { label: "Pending", value: "Pending" },
  { label: "Closed", value: "Closed" },
];

export const ADJUSTMENT_TYPE = [
  { label: "Credit", value: "Credit" },
  { label: "Debit", value: "Debit" },
];

export const MEETING_TYPE = [
  { label: "General Meeting", value: "General Meeting" },
  { label: "Committee Meeting", value: "Committee Meeting" },
  { label: "Ad-hoc", value: "Ad-hoc" },
  { label: "AGM", value: "AGM" },
  { label: "Other", value: "Other" },
];

export const PAYMENT_TYPE = [
  { label: "Maintenance", value: "Maintenance" },
  { label: "NOC", value: "NOC" },
  { label: "Other", value: "Other" },
];

export const PAYMENT_MODE = [
  { label: "Cheque", value: "Cheque" },
  { label: "Cash", value: "Cash" },
  { label: "Transfer", value: "Transfer" },
];

export const D_M_Y_DATE_FORMAT = "dd-MM-yyyy";
