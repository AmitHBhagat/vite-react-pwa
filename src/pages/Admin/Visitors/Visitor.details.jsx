import React, { useState, useEffect } from "react";
import { Grid, Row, Col, FlexboxGrid, Button, Badge } from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ArowBackIcon from "@rsuite/icons/ArowBack";
import ScrollToTop from "../../../utilities/ScrollToTop";
import VisitorService from "../../../services/visitor.service";
import { setRouteData } from "../../../stores/appSlice";
import { formatDate } from "../../../utilities/formatDate";

function VisitorDetails({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { visitorId } = useParams();
  const [pageError, setPageError] = useState("");
  const [visitorDetail, setQueryDetail] = useState([]);

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    getVisitorDetails();
  }, [dispatch, pageTitle]);

  const getVisitorDetails = async () => {
    setPageError("");
    let respData = [];
    try {
      const resp = await trackPromise(
        VisitorService.getVisitorDetail(visitorId)
      );
      const { data } = resp;
      if (data.success) respData = resp.data.visitor;
    } catch (err) {
      console.error("Visitor fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching visitor`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setQueryDetail(respData);
  };

  function navigateBack() {
    navigate(-1);
  }

  return (
    <>
      <ScrollToTop />

      <div className="thm-panel">
        <FlexboxGrid justify="end" className="topfeaturebar">
          <FlexboxGrid.Item>
            <Button onClick={navigateBack} appearance="ghost" color="blue">
              <ArowBackIcon />
            </Button>
          </FlexboxGrid.Item>
        </FlexboxGrid>

        <Grid fluid className="">
          <Row gutter={20}>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Visitor Name</div>
                <div className="val">{visitorDetail.visitorName}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Vistor Phone</div>
                <div className="val">{visitorDetail.visitorPhone}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Flat No</div>
                <div className="val">{visitorDetail.flat.flatNo}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Flat Contact</div>
                <div className="val">{visitorDetail.flatContact}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Description</div>
                <div className="val">{visitorDetail.description}</div>
              </div>
            </Col>
            {visitorDetail.visitorImage?.fileurl && (
              <Col xs={24} md={12} lg={8} xl={6}>
                <div className="details-grp">
                  <div className="lbl">Visitor Image</div>
                  <div className="val">
                    <img
                      src={visitorDetail.visitorImage.fileurl}
                      alt={visitorDetail.visitorImage.title}
                      style={{ maxWidth: "200px", maxHeight: "200px" }}
                    />
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </Grid>
        {/* {pageError && <div>{pageError}</div>} */}
      </div>
    </>
  );
}

export default VisitorDetails;
