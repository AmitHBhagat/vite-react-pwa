import React, { useState, useEffect } from "react";
import { Grid, Row, Col, FlexboxGrid, Button, Badge } from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ArowBackIcon from "@rsuite/icons/ArowBack";
import ScrollToTop from "../../../utilities/ScrollToTop";
import RequestQueryService from "../../../services/requestQuery.service";
import { setRouteData } from "../../../stores/appSlice";
import { formatDate } from "../../../utilities/formatDate";

function RequestQueryDetail({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { queryId } = useParams();
  const [pageError, setPageError] = useState("");
  const [queryDetail, setQueryDetail] = useState([]);

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    getQueryDetails();
  }, [dispatch, pageTitle]);

  const getQueryDetails = async (societyId) => {
    setPageError("");
    let respData = [];
    try {
      const resp = await trackPromise(
        RequestQueryService.getQueryDetails(queryId)
      );
      const { data } = resp;
      if (data.success) respData = resp.data.queries;
    } catch (err) {
      console.error("Request query fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching request query`;
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
            <Button
              // onClick={() => navigate("/request-queries")}
              onClick={navigateBack}
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
                <div className="lbl">Flat No</div>
                <div className="val">{queryDetail.flatNo}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Member Name</div>
                <div className="val">{queryDetail.memberName}</div>
              </div>
            </Col>

            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Title</div>
                <div className="val">{queryDetail.title}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Date</div>
                <div className="val">{formatDate(queryDetail.date)}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={12} xl={12}>
              <div className="details-grp">
                <div className="lbl">Description</div>
                <div className="val">{queryDetail.description}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={12} xl={12}>
              <div className="details-grp">
                <div className="lbl">Comments</div>
                <div className="val">{queryDetail.commments}</div>
              </div>
            </Col>
            {/* <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Status</div>
                <div className="val">{queryDetail.status}</div>
              </div>
            </Col> */}
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp ">
                <div className="lbl">Status</div>
                <div className={`col-status query-${queryDetail.status}`}>
                  {queryDetail.status}
                </div>
              </div>
            </Col>
          </Row>
        </Grid>
        {/* {pageError && <div>{pageError}</div>} */}
      </div>
    </>
  );
}

export default RequestQueryDetail;
