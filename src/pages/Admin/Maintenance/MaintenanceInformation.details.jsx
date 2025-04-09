import React, { useEffect, useState } from "react";
import { Container, Row, Col, FlexboxGrid, Button, Affix } from "rsuite";
import { useNavigate } from "react-router-dom";
import maintenanceMasterService from "../../../services/MaintenanceMaster.service";
import { trackPromise } from "react-promise-tracker";
import { setRouteData } from "../../../stores/appSlice";
import { useDispatch, useSelector } from "react-redux";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { toast } from "react-toastify";
import { Table } from "rsuite";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import StatusIndicator from "../../../components/StatusIndicator/StatusIndicator";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";

const MaintenanceDetails = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [maintenanceDetails, setMaintenanceDetails] = useState({});
  const [finalTableArray, setFinalTableArray] = useState([]);
  const [pageError, setPageError] = useState("");
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  const navigate = useNavigate();
  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (societyId) {
      fetchMaintenanceDetails();
    }
  }, [societyId]);

  async function fetchMaintenanceDetails() {
    setPageError("");
    let maintenanceDetails = {};
    try {
      const res = await trackPromise(
        maintenanceMasterService.getMaintenanceById(societyId)
      );
      const { data } = res;
      if (data.success) maintenanceDetails = data.maintenance[0];
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || "Error in fetching maintenance details";
      toast.error(errMsg);
      console.error("Error fetching maintenance details:", errMsg);
      setPageError(errMsg);
    }
    setMaintenanceDetails(maintenanceDetails);
  }
  useEffect(() => {
    if (
      maintenanceDetails &&
      typeof maintenanceDetails === "object" &&
      maintenanceDetails._id
    ) {
      const extendedArray = [
        {
          title: "Maintenance Type",
          value: maintenanceDetails.maintenanceType || "-",
          status: "noStatus",
        },
        {
          title: "Maintenance Periods",
          value: maintenanceDetails.maintenancePeriod || "-",
          status: "noStatus",
        },
        {
          title: "Residential Charges",
          value:
            maintenanceDetails.maintenanceType === "FixedAmount"
              ? `₹ ${maintenanceDetails.residentialCharges || 0}`
              : `${maintenanceDetails.residentialCharges || 0} %`,
          status: "noStatus",
        },
        {
          title: "Commercial Charges",
          value:
            maintenanceDetails.maintenanceType === "FixedAmount"
              ? `₹ ${maintenanceDetails.commercialCharges || 0}`
              : `${maintenanceDetails.commercialCharges || 0} %`,
          status: "noStatus",
        },
      ];
      const extendedArray2 = [
        {
          title: "Arrears Interest Type",
          value: maintenanceDetails.arrearsInterestType || "-",
          status: "noStatus",
        },
        {
          title: "Arrears Interest Value",
          value:
            maintenanceDetails.arrearsInterestType === "fixed"
              ? `₹ ${maintenanceDetails.arrearsInterest || 0}`
              : `${maintenanceDetails.arrearsInterest || 0} % per annum`,
          status: "noStatus",
        },
        {
          title: "Status",
          value: maintenanceDetails.status,
          status: "noStatus",
        },
      ];
      const finalArray = [
        ...extendedArray,
        ...maintenanceDetails?.billCharges,
        ...extendedArray2,
      ];
      setFinalTableArray(finalArray);
    }
  }, [maintenanceDetails]);

  return !societyId || finalTableArray?.length === 0 ? (
    <div>Loading...</div>
  ) : (
    <Container className="maintenances-cont">
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
                onClick={() =>
                  navigate(`/maintenance-information/add/${societyId}`)
                }
                appearance="primary"
                color="blue"
              >
                Edit
              </Button>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Affix>
        <Row gutter={0}>
          <Col xs={24}>
            <Table
              data={finalTableArray}
              autoHeight
              rowKey="id"
              rowHeight={60}
              className="tbl-compact"
            >
              <Column flexGrow={2} minWidth={150}>
                <HeaderCell>Particulars</HeaderCell>

                <Cell dataKey="title" />
              </Column>

              <Column flexGrow={1} minWidth={135}>
                <HeaderCell>Values</HeaderCell>
                <Cell>
                  {(rowData) => {
                    if (typeof rowData?.value === "boolean") {
                      return <StatusIndicator status={rowData?.value} />;
                    }

                    if (typeof rowData?.value === "string") {
                      return rowData.value;
                    }

                    if (rowData?.value === "") {
                      return "-";
                    }

                    if (
                      rowData?.value === null ||
                      rowData?.value === undefined
                    ) {
                      return 0;
                    }

                    if (rowData?.calcType === "fixed") {
                      return `₹ ${rowData.value}`;
                    }
                    if (rowData?.calcType === "percent") {
                      return `${rowData.value} %`;
                    }
                    return rowData?.value;
                  }}
                </Cell>
              </Column>

              <Column flexGrow={0.5} minWidth={60}>
                <HeaderCell>Status</HeaderCell>

                <Cell>
                  {(rowData) => {
                    if (rowData?.status === "noStatus") {
                      return "";
                    }
                    return <StatusIndicator status={rowData?.status} />;
                  }}
                </Cell>
              </Column>
            </Table>
          </Col>
        </Row>
      </div>
      <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
    </Container>
  );
};

export default MaintenanceDetails;
