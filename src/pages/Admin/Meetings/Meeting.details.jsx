import React, { useState, useEffect } from "react";
import { Grid, Row, Col, FlexboxGrid, Button, Badge } from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ArowBackIcon from "@rsuite/icons/ArowBack";
import ScrollToTop from "../../../utilities/ScrollToTop";
import MeetingService from "../../../services/meeting.service";
import { setRouteData } from "../../../stores/appSlice";
import { formatDate } from "../../../utilities/formatDate";
import CheckOutlineIcon from "@rsuite/icons/CheckOutline";
import CloseOutlineIcon from "@rsuite/icons/CloseOutline";
import parse from "html-react-parser";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";

function MeetingDetails({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { meetingId } = useParams();
  const [pageError, setPageError] = useState("");
  const [meetingDetail, setMeetingDetail] = useState({});

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (meetingId) {
      fetchMeetingDetails(meetingId);
    }
  }, [meetingId]);

  async function fetchMeetingDetails(meetingId) {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(MeetingService.getMeetingById(meetingId));
      const { data } = resp;
      if (data.success) respdata = resp.data.meeting;
    } catch (err) {
      console.error("Meeting fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching meeting`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setMeetingDetail(respdata);
  }

  return (
    <>
      <ScrollToTop />

      <div className="thm-panel">
        <FlexboxGrid justify="end" className="topfeaturebar">
          <FlexboxGrid.Item>
            <Button
              onClick={() => navigate("/meetings")}
              appearance="ghost"
              color="blue"
            >
              <ArowBackIcon />
            </Button>
          </FlexboxGrid.Item>
        </FlexboxGrid>
        <Grid fluid className="">
          <Row gutter={20}>
            <Col xs={24} md={12} lg={8} xl={8}>
              <div className="details-grp">
                <div className="lbl">Meeting Type</div>
                <div className="val">{meetingDetail.meetingType}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={8}>
              <div className="details-grp">
                <div className="lbl">Meeting Date</div>
                <div className="val">
                  {formatDate(meetingDetail.meetingDate)}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={8}>
              <div className="details-grp">
                <div className="lbl">Status</div>
                <div className="val">
                  {meetingDetail.status ? (
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
            <Col xs={24} md={12} lg={8} xl={8}>
              <div className="details-grp">
                <div className="lbl">Meeting Agenda</div>
                <div className="val">
                  {meetingDetail?.meetingAgenda
                    ? parse(meetingDetail.meetingAgenda)
                    : ""}
                </div>
              </div>
            </Col>

            <Col xs={24} md={12} lg={8} xl={8}>
              <div className="details-grp">
                <div className="lbl">Meeting Minutes</div>
                <div className="val">
                  {meetingDetail?.meetingMinutes
                    ? parse(meetingDetail.meetingMinutes)
                    : "NA"}
                </div>
              </div>
            </Col>

            <Col xs={24} md={12} lg={8} xl={8}>
              <div className="details-grp">
                <div className="lbl">Meeting Resolution</div>
                <div className="val">
                  {meetingDetail?.meetingResolution
                    ? parse(meetingDetail?.meetingResolution)
                    : "NA"}
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

export default MeetingDetails;
