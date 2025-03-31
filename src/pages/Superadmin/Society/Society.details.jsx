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
import SocietyService from "../../../services/society.service";
import { setRouteData } from "../../../stores/appSlice";
import "./society.css";

function SocietyDetails({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { societyId } = useParams();
  const [pageError, setPageError] = useState("");
  const [societyDetails, setSocietyDetails] = useState({});

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (societyId) fetchSocietyDetails(societyId);
  }, [societyId]);

  async function fetchSocietyDetails(societyid) {
    try {
      const resp = await trackPromise(SocietyService.getSocietyById(societyid));
      const { data } = resp;
      if (data.success) {
        setSocietyDetails(data.society);
      }
    } catch (err) {
      toast.error(err.response.data.message || err.message);
      console.error("Fetch society details catch => ", err);
    }
  }

  return (
    <>
      <ScrollToTop />

      <div className="thm-panel">
        <FlexboxGrid justify="end" className="topfeaturebar">
          <FlexboxGrid.Item>
            <Button
              onClick={() => navigate("/society")}
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
                <div className="val">{societyDetails.societyName}</div>
              </div>
            </Col>
            <Col xs={24} lg={16} xl={12}>
              <div className="details-grp">
                <div className="lbl">Society Address</div>
                <div className="val">{societyDetails.societyAddress}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Society URL</div>
                <div className="val">{societyDetails.societyUrl}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Society Email</div>
                <div className="val">{societyDetails.societyEmail}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Society Registration No.</div>
                <div className="val">
                  {societyDetails.societyRegistrationNo}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Society Members Count</div>
                <div className="val">{societyDetails.societyMembersCount}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Society Activation Year</div>
                <div className="val">
                  {societyDetails.societyActivationYear}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Society Activation Month</div>
                <div className="val">
                  {societyDetails.societyActivationMonth}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Subscription Start Date</div>
                <div className="val">
                  {formatDate(societyDetails.societySubscriptionStartDate)}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Subscription End Date</div>
                <div className="val">
                  {formatDate(societyDetails.societySubscriptionEndDate)}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Is Active</div>
                <div className="val">
                  {societyDetails.status ? (
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
        {/* {pageError && <div>{pageError}</div>} */}
      </div>
    </>
  );
}

export default SocietyDetails;
