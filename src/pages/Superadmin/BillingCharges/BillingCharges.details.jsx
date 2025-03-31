import React, { useEffect, useState } from "react";
import { Container, Row, Col, FlexboxGrid, Button, Affix } from "rsuite";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { trackPromise } from "react-promise-tracker";
import { useDispatch } from "react-redux";
import ArowBackIcon from "@rsuite/icons/ArowBack";
import billChargeService from "../../../services/billingCharge.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import BillingTable from "./BillingTable";
import "./billingCharges.css";

const BillDetails = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const { billId } = useParams();
  const [billDetails, setBillDetails] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    async function fetchBillDetails() {
      try {
        const resOfBillingCharges = await trackPromise(
          billChargeService.getChargeById(billId)
        );

        const billingChargData = resOfBillingCharges.data;
        if (billingChargData.success) {
          setBillDetails(billingChargData.data.charges);
        }
      } catch (err) {
        toast.error(err?.response?.data?.message);
        console.error("Fetch bill details catch => ", err);
      }
    }
    fetchBillDetails();
  }, [billId]);

  if (!billDetails) {
    return <div>Loading...</div>;
  }

  return (
    <Container className="bills-cont">
      <ScrollToTop />
      <div className="inner-container">
        <Affix>
          <FlexboxGrid
            style={{
              width: "100%",
              backgroundColor: "white",
              padding: "10px",
            }}
            justify="space-between"
            className=""
          >
            <FlexboxGrid.Item className="filters-row"></FlexboxGrid.Item>
            <FlexboxGrid.Item>
              <Button
                onClick={() => navigate("/billing-charges")}
                appearance="ghost"
                color="blue"
              >
                <ArowBackIcon />
              </Button>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Affix>
        <Row gutter={0}>
          <Col xs={24}>
            <BillingTable
              billsData={billDetails}
              pageTitle={pageTitle}
              billId={billId}
              setBillDetails={setBillDetails}
              pageType="billingChargesDetail"
            />
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default BillDetails;
