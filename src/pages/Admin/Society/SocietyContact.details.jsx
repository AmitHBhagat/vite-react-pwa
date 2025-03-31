import React, { useState, useEffect } from "react";
import { Grid, Row, Col, FlexboxGrid, Button } from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ArowBackIcon from "@rsuite/icons/ArowBack";
import ScrollToTop from "../../../utilities/ScrollToTop";
import SocietyService from "../../../services/society.service";
import { setRouteData } from "../../../stores/appSlice";
import "./society.css";

function SocietyContactDetail({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [pageError, setPageError] = useState("");
  const [societyContactDetails, setSocietyContactDetails] = useState({});
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;
  const { societyContactId } = useParams();

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (societyId) {
      fetchSocietyDetails(societyId);
    }
  }, [societyId]);

  async function fetchSocietyDetails() {
    try {
      const resp = await trackPromise(SocietyService.getSocietyById(societyId));
      const { data } = resp;
      if (data.success) {
        const contactInfo = data.society.contactInfo;
        const matchedContact = contactInfo.find(
          (contact) => contact._id === societyContactId
        );

        if (matchedContact) {
          setSocietyContactDetails(matchedContact);
        } else {
          toast.error("Contact not found");
        }
      }
    } catch (err) {
      toast.error(err.response.data.message || err.message);
      console.error("Fetch society contact  details catch => ", err);
    }
  }

  return (
    <>
      <ScrollToTop />

      <div className="thm-panel">
        <FlexboxGrid justify="end" className="topfeaturebar">
          <FlexboxGrid.Item>
            <Button
              onClick={() => navigate("/society-contacts")}
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
                <div className="lbl">Contact Name</div>
                <div className="val">{societyContactDetails.contactName}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Mobile</div>
                <div className="val">{societyContactDetails.mobile}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Email</div>
                <div className="val">{societyContactDetails.email}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Position</div>
                <div className="val">{societyContactDetails.position}</div>
              </div>
            </Col>
          </Row>
        </Grid>
        {/* {pageError && <div>{pageError}</div>} */}
      </div>
    </>
  );
}

export default SocietyContactDetail;
