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
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import AmenityService from "../../../services/amenity.service";
import { setRouteData } from "../../../stores/appSlice";
import "react-quill/dist/quill.snow.css";

function AmenityDetails({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { amenityId } = useParams();
  const [pageError, setPageError] = useState("");
  const [amenityDetails, setAmenityDetails] = useState({});

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    if (amenityId) {
      fetchAmenityDetails(amenityId);
    }
  }, [amenityId]);

  async function fetchAmenityDetails(amenityId) {
    setPageError("");
    let respData = [];
    try {
      const resp = await trackPromise(AmenityService.getAmenityById(amenityId));
      const { data } = resp;
      if (data.success) respData = data.amenity;
    } catch (err) {
      console.error("Amenity details fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching amenity details`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setAmenityDetails(respData);
  }

  return (
    <>
      <ScrollToTop />

      <div className="thm-panel">
        <FlexboxGrid justify="end" className="topfeaturebar">
          <FlexboxGrid.Item>
            <Button
              onClick={() => navigate("/amenity-lists")}
              appearance="ghost"
              color="blue"
            >
              <ArowBackIcon />
            </Button>
          </FlexboxGrid.Item>
        </FlexboxGrid>

        <Grid fluid className="">
          <Row gutter={20}>
            <Col xs={24} lg={8} xl={8}>
              <div className="details-grp">
                <div className="lbl">Amenity Name</div>
                <div className="val">{amenityDetails.name}</div>
              </div>
            </Col>
            <Col xs={24} lg={8} xl={8}>
              <div className="details-grp">
                <div className="lbl">Web Icon</div>
                <div className="val">
                  <i
                    className={amenityDetails.webIcon}
                    style={{ color: "grey" }}
                  ></i>
                </div>
              </div>
            </Col>
            <Col xs={24} lg={8} xl={8}>
              <div className="details-grp">
                <div className="lbl">Status</div>
                <div className="val">
                  {" "}
                  {amenityDetails.status ? (
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

export default AmenityDetails;
