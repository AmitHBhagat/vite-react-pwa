import React, { useState, useEffect } from "react";
import { Grid, Row, Col, FlexboxGrid, Button } from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ArowBackIcon from "@rsuite/icons/ArowBack";
import ScrollToTop from "../../../utilities/ScrollToTop";
import noticeService from "../../../services/notice.service.js";
import { setRouteData } from "../../../stores/appSlice";
import CheckOutlineIcon from "@rsuite/icons/CheckOutline";
import CloseOutlineIcon from "@rsuite/icons/CloseOutline";
import { formatDate } from "../../../utilities/formatDate";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";

function NoticeDetails({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [pageError, setPageError] = useState("");
  const [noticeDetails, setNoticeDetails] = useState({});

  const { noticeId } = useParams();

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (noticeId) {
      fetchNoticeDetails(noticeId);
    }
  }, [noticeId]);

  async function fetchNoticeDetails(noticeId) {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(noticeService.getNoticeDetails(noticeId));
      const { data } = resp;
      if (data.success) respdata = resp.data.notice;
    } catch (err) {
      console.error("Notice fetch catch => ", err);
      const errMsg = err?.response?.data?.message || `Error in fetching notice`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setNoticeDetails(respdata);
  }

  return (
    <>
      <ScrollToTop />

      <div className="thm-panel">
        <FlexboxGrid justify="end" className="topfeaturebar">
          <FlexboxGrid.Item>
            <Button
              onClick={() => navigate("/notices")}
              appearance="ghost"
              color="blue"
            >
              <ArowBackIcon />
            </Button>
          </FlexboxGrid.Item>
        </FlexboxGrid>

        <Grid fluid className="">
          <Row gutter={20}>
            <Col xs={24} md={12} lg={8} xl={16}>
              <div className="details-grp">
                <div className="lbl">Title</div>
                <div className="val">{noticeDetails.title}</div>
              </div>
            </Col>

            <Col xs={24} md={12} lg={8} xl={8}>
              <div className="details-grp">
                <div className="lbl">Date</div>
                <div className="val">{formatDate(noticeDetails.date)}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={16} xl={16}>
              <div className="details-grp">
                <div className="lbl">Comments</div>
                {/* <div className="val">{noticeDetails.commments}</div> */}
                <div
                  dangerouslySetInnerHTML={{ __html: noticeDetails?.commments }}
                ></div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={16} xl={8}>
              <div className="details-grp">
                <div className="lbl">Status</div>
                <div className="val">
                  {noticeDetails.status ? (
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

export default NoticeDetails;
