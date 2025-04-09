import React, { useEffect, useState } from "react";
import { Grid, Row, Col, FlexboxGrid, Button, Stat } from "rsuite";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ArowBackIcon from "@rsuite/icons/ArowBack";
import { useDispatch } from "react-redux";
import { trackPromise } from "react-promise-tracker";
import flatService from "../../../services/flat.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import StatusIndicator from "../../../components/StatusIndicator/StatusIndicator";
import { capitalizeFirstLetter } from "../../../utilities/functions";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";

const FlatDetails = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const { flatId } = useParams();
  const [flatDetails, setFlatDetails] = useState([]);
  const [pageError, setPageError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    fetchFlatDetails();
  }, [flatId]);

  async function fetchFlatDetails() {
    setPageError("");
    let flatDetails = [];
    try {
      const resp = await trackPromise(flatService.getFlatById(flatId));
      const { data } = resp;
      if (data.success) flatDetails = data?.flat;
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || "Error in fetching flat Details";
      toast.error(errMsg);
      console.error("Fetch flat details catch => ", err);
      setPageError(errMsg);
    }
    setFlatDetails(flatDetails);
  }

  if (!flatDetails) {
    return <div>Loading...</div>;
  }

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
              // onClick={() => navigate("/flat-management")}
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
                <div className="val">{flatDetails.flatNo}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Owner Name</div>
                <div className="val">{flatDetails.ownerName}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Flat Area</div>
                <div className="val">{flatDetails.flatArea}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Flat Type</div>
                <div className="val">{flatDetails.flatType}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Outstanding Amount</div>
                <div className="val">{flatDetails.outStandingAmount}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Other Charges</div>
                <div className="val">{flatDetails.otherCharges}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Other Charges Description</div>
                <div className="val">{flatDetails.otherChargesDescription}</div>
              </div>
            </Col>
            {flatDetails.billDependencies.map((dep) => (
              <Col xs={24} md={12} lg={8} xl={6}>
                <div className="details-grp">
                  <div className="lbl">
                    {capitalizeFirstLetter(dep.depTitle)}
                  </div>
                  {dep.valType === "Boolean" || dep.tag === "nocCharges" ? (
                    <StatusIndicator status={dep.depValue} />
                  ) : (
                    <div className="val">
                      {dep.depValue === ""
                        ? "-"
                        : capitalizeFirstLetter(dep.depValue)}
                    </div>
                  )}
                </div>
              </Col>
            ))}
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Is On Rent</div>
                <StatusIndicator status={flatDetails.isOnRent} />
              </div>
            </Col>{" "}
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Ebill Subscribed</div>
                <StatusIndicator status={flatDetails.ebillSubscribed} />
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Status</div>
                <StatusIndicator status={flatDetails.status} />
              </div>
            </Col>
          </Row>
        </Grid>
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </>
  );
};

export default FlatDetails;
