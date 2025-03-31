import React, { useState, useEffect } from "react";
import { Grid, Row, Col, FlexboxGrid, Button } from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ArowBackIcon from "@rsuite/icons/ArowBack";
import ScrollToTop from "../../../utilities/ScrollToTop";
import maintenanceService from "../../../services/maintenance.service";
import { setRouteData } from "../../../stores/appSlice";

function MaintenManageDetails({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { flatId } = useParams();
  const [pageError, setPageError] = useState("");
  const [currentList, setCurrentList] = useState([]);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    getMaintenanceInfo();
  }, [dispatch, pageTitle]);

  const getMaintenanceInfo = async () => {
    try {
      const resp = await trackPromise(
        maintenanceService.getSingleMaintenance(societyId, flatId)
      );

      const allData = resp.data;
      setCurrentList(allData.maintenance[0]);
      //setBillChargesHeaders(allData.maintenanceHeaders);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch maintenance"
      );
      console.error("Error fetching maintenance:", error);
    }
  };

  return (
    <>
      <ScrollToTop />

      <div className="thm-panel">
        <FlexboxGrid justify="end" className="topfeaturebar">
          <FlexboxGrid.Item>
            <Button
              onClick={() => navigate("/maintenance-management")}
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
                <div className="val">{currentList.flatNo}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Maintenance Charges</div>
                <div className="val">{currentList.maintenanceCharges}</div>
              </div>
            </Col>

            {currentList?.billCharges?.map((charge, index) => (
              <Col key={index} xs={24} md={12} lg={8} xl={6}>
                <div className="details-grp">
                  <div className="lbl">{charge.title}</div>
                  <div className="val">{charge.value}</div>
                </div>
              </Col>
            ))}
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Other Charges</div>
                <div className="val">{currentList.otherCharges}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Arrears</div>
                <div className="val">{currentList.arrears}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Description</div>
                <div className="val">{currentList.description}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Total</div>
                <div className="val">{currentList.totalAmount}</div>
              </div>
            </Col>
          </Row>
        </Grid>
        {/* {pageError && <div>{pageError}</div>} */}
      </div>
    </>
  );
}

export default MaintenManageDetails;
