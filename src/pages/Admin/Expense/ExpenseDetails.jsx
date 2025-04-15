import React, { useState, useEffect } from "react";
import { Grid, Row, Col, FlexboxGrid, Button } from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ArowBackIcon from "@rsuite/icons/ArowBack";
import CheckOutlineIcon from "@rsuite/icons/CheckOutline";
import CloseOutlineIcon from "@rsuite/icons/CloseOutline";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { formatDate } from "../../../utilities/formatDate";
import ExpenseService from "../../../services/expense.service.js";
import { setRouteData } from "../../../stores/appSlice";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";

function ExpenseDetails({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { expId } = useParams();
  const [pageError, setPageError] = useState("");
  const [expenseDetails, setExpenseDetails] = useState({});

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (expId) {
      getExpenseDetails(expId);
    }
  }, [expId]);

  const getExpenseDetails = async (expId) => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(ExpenseService.getExpenseDetails(expId));

      const { data } = resp;
      if (data.success) {
        respdata = data.expense;
      }
    } catch (err) {
      console.error("Expense fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching expense`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setExpenseDetails(respdata);
  };

  return (
    <>
      <ScrollToTop />

      <div className="thm-panel">
        <FlexboxGrid justify="end" className="topfeaturebar">
          <FlexboxGrid.Item>
            <Button
              onClick={() => navigate("/expense")}
              appearance="ghost"
              color="blue"
            >
              <ArowBackIcon />
            </Button>
          </FlexboxGrid.Item>
        </FlexboxGrid>

        <Grid fluid className="">
          <Row gutter={20}>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Expense Type</div>
                <div className="val">{expenseDetails?.expenseType}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Expense Category</div>
                <div className="val">
                  {expenseDetails?.expenseCategory?.categoryName}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Expense Description</div>
                <div className="val">{expenseDetails.expenseDescription}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Bill No.</div>
                <div className="val">{expenseDetails.expenseBillVoucherNo}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Bill Date</div>
                <div className="val">
                  {formatDate(expenseDetails.expenseBillDate)}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Payment Mode</div>
                <div className="val">{expenseDetails.paymentMode}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Payment Date</div>
                <div className="val">
                  {formatDate(expenseDetails.paymentDate)}
                </div>
              </div>
            </Col>

            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Amount</div>
                <div className="val">{expenseDetails.amount}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Prepared By</div>
                <div className="val">{expenseDetails.preparedBy}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Approved By</div>
                <div className="val">
                  {expenseDetails?.approvedBy?.contactName}
                </div>
              </div>
            </Col>

            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">status</div>
                <div className="val">
                  {expenseDetails.status ? (
                    <span className="affirm">
                      <CheckOutlineIcon />
                    </span>
                  ) : (
                    <span className="negate">
                      <CloseOutlineIcon />
                    </span>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Grid>
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </>
  );
}

export default ExpenseDetails;
