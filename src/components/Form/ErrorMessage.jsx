import React from "react";
import classNames from "classnames";
import "./form-styles.css";

const ErrorMessage = ({ show = false, msgText = "" }) => {
  return show && msgText ? <div className="error-msg-wrap">{msgText}</div> : "";
};

export default ErrorMessage;

export const PageErrorMessage = ({
  show = false,
  msgText = "",
  wrapperClass = "",
}) => {
  const classList = classNames("page-errmsg-wrap", wrapperClass);
  return show && msgText ? <div className={classList}>{msgText}</div> : "";
};
