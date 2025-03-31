import React, { useEffect, useState } from "react";
import { Grid, Row, Col, FlexboxGrid, Button } from "rsuite";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ArowBackIcon from "@rsuite/icons/ArowBack";
import { trackPromise } from "react-promise-tracker";
import { setRouteData } from "../../../stores/appSlice";
import RequestDemoService from "../../../services/requestDemo.service";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { formatDate } from "../../../utilities/formatDate";
import RequestDemoUpdateModal from "./RequestDemo.update.modal";
import "./requestDemo.css";

const RequestDemoDetails = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const { requestDemoId } = useParams();
  const [requestDemoDetails, setRequestDemoDetails] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    async function fetchRequestDemoDetails() {
      try {
        const resp = await trackPromise(
          RequestDemoService.getRequestDemoById(requestDemoId)
        );
        const { data } = resp;

        if (data.success) {
          setRequestDemoDetails(data.requestDemo);
        }
      } catch (err) {
        toast.error(err?.response?.data?.message);
        console.error("Fetch requestDemo details catch => ", err);
      }
    }
    fetchRequestDemoDetails();
  }, [requestDemoId]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (!requestDemoDetails) {
    return <div>Loading...</div>;
  }
  const status = requestDemoDetails?.status;
  let color;
  // Demo Scheduled(skyblue), Demo Given(orange), Approval Pending(red), Completed(green)
  switch (status) {
    case "Demo Scheduled":
      color = "var(--clr-primary-light)";
      break;
    case "Demo Given":
      color = "var(--clr-secondary)";
      break;
    case "Approval Pending":
      color = "var(--clr-negate)";
      break;
    case "Completed":
      color = "var(--clr-affirm)";
      break;
  }
  return (
    <>
      <ScrollToTop />
      <RequestDemoUpdateModal
        itemId={requestDemoId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        requestDemoDetails={requestDemoDetails}
        setRequestDemoDetails={setRequestDemoDetails}
      ></RequestDemoUpdateModal>
      <div className="thm-panel requestDemoDetails-container">
        <FlexboxGrid justify="end" className="topfeaturebar">
          <FlexboxGrid.Item>
            <Button
              onClick={() => navigate("/request-demo")}
              appearance="ghost"
              color="blue"
            >
              <ArowBackIcon />
            </Button>
          </FlexboxGrid.Item>
        </FlexboxGrid>

        <Grid fluid className="">
          <Row gutter={20}>
            <Col xs={24} lg={8} xl={12}>
              <div className="details-grp">
                <div className="lbl">Society Name</div>
                <div className="val">{requestDemoDetails.societyName}</div>
              </div>
            </Col>
            <Col xs={24} lg={16} xl={12}>
              <div className="details-grp">
                <div className="lbl">Society Address</div>
                <div className="val">{requestDemoDetails.societyAddress}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Contact Name</div>
                <div className="val">{requestDemoDetails.name}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Contact Mobile</div>
                <div className="val">{requestDemoDetails.mobile}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Contact Email</div>
                <div className="val">{requestDemoDetails.email}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Status</div>
                <div
                  className="val status"
                  style={{ borderColor: color, color: color }}
                >
                  {requestDemoDetails.status}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Requested Date</div>
                <div className="val">
                  {formatDate(requestDemoDetails.requestedDate)}
                </div>
              </div>
            </Col>
            {requestDemoDetails.demoScheduledDate && (
              <Col xs={24} md={12} lg={8} xl={6}>
                <div className="details-grp">
                  <div className="lbl">Demo Scheduled Date</div>
                  <div className="val">
                    {formatDate(requestDemoDetails.demoScheduledDate)}
                  </div>
                </div>
              </Col>
            )}
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Feedback</div>
                <div className="val">{requestDemoDetails.feedback}</div>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button appearance="primary" onClick={() => handleOpenModal()}>
                Update Status
              </Button>
            </Col>
          </Row>
        </Grid>
      </div>
    </>
  );
};

export default RequestDemoDetails;
