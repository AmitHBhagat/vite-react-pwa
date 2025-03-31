import React, { useState, useEffect } from "react";
import { Grid, Row, Col, FlexboxGrid, Button, Badge } from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ArowBackIcon from "@rsuite/icons/ArowBack";
import ScrollToTop from "../../../utilities/ScrollToTop";
import AmcService from "../../../services/amc.service";
import { setRouteData } from "../../../stores/appSlice";
import { formatDate } from "../../../utilities/formatDate";
import CheckOutlineIcon from "@rsuite/icons/CheckOutline";
import CloseOutlineIcon from "@rsuite/icons/CloseOutline";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";

function AmcDetail({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { amcId } = useParams();
  const [pageError, setPageError] = useState("");
  const [amcDetail, setAmcDetail] = useState({});

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (amcId) getAmcDetails(amcId);
  }, [amcId]);

  async function getAmcDetails(amcId) {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(AmcService.getAmcDetails(amcId));

      const { data } = resp;
      if (data.success) respdata = resp.data.amc;
    } catch (err) {
      console.error("AMC fetch catch => ", err);
      const errMsg = err?.response?.data?.message || `Error in fetching amc`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setAmcDetail(respdata);
  }

  return (
    <>
      <ScrollToTop />

      <div className="thm-panel">
        <FlexboxGrid justify="end" className="topfeaturebar">
          <FlexboxGrid.Item>
            <Button
              onClick={() => navigate("/amc")}
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
                <div className="lbl">Vendor Type</div>
                <div className="val">{amcDetail.vendorType}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Vendor Name</div>
                <div className="val">{amcDetail.vendorName}</div>
              </div>
            </Col>

            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Vendor Email</div>
                <div className="val">{amcDetail.vendorEmail}</div>
              </div>
            </Col>

            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Vendor Mobile</div>
                <div className="val">{amcDetail.vendorMobile}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Vendor Address</div>
                <div className="val">{amcDetail.vendorAddress}</div>
              </div>
            </Col>

            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Amc Description</div>
                <div className="val">{amcDetail.amcDescription}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Amc StartDate</div>
                <div className="val">{formatDate(amcDetail.amcStartDate)}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Amc EndDate</div>
                <div className="val">{formatDate(amcDetail.amcEndDate)}</div>
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Active</div>
                <div className="val">
                  {amcDetail.status ? (
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

export default AmcDetail;
