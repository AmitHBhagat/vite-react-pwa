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
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import BankDetailService from "../../../services/bankDetails.service.js";
import { setRouteData } from "../../../stores/appSlice";

function BankDetailDetails({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bankDetailId } = useParams();
  const [pageError, setPageError] = useState("");
  const [bankDetails, setbankDetails] = useState({});

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (bankDetailId) {
      fetchBankDetails(bankDetailId);
    }
  }, [bankDetailId]);

  async function fetchBankDetails(bankDetailId) {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(
        BankDetailService.getBankDetailDetails(bankDetailId)
      );

      const { data } = resp;
      if (data.success) respdata = resp.data.bankDetail;
    } catch (err) {
      console.error("Bank details fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching bank details`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setbankDetails(respdata);
  }

  return (
    <>
      <ScrollToTop />

      <div className="thm-panel">
        <FlexboxGrid justify="end" className="topfeaturebar">
          <FlexboxGrid.Item>
            <Button
              onClick={() => navigate("/bankdetails")}
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
                <div className="lbl">Account Holder Name</div>
                <div className="val">{bankDetails.accountHolderName}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Bank Name</div>
                <div className="val">{bankDetails.bankName}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Branch Name</div>
                <div className="val">{bankDetails.branchName}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Account Number</div>
                <div className="val">{bankDetails.accountNumber}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">IFSC Code</div>
                <div className="val">{bankDetails.IFSC_Code}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Account Type</div>
                <div className="val">{bankDetails.account_type}</div>
              </div>
            </Col>

            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Is Verified</div>
                <div className="val">
                  {bankDetails.is_verified ? (
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

export default BankDetailDetails;
