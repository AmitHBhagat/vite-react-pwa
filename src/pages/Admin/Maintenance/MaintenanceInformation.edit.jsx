import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Grid,
  Row,
  Col,
  Checkbox,
  InputPicker,
  FlexboxGrid,
  InputNumber,
} from "rsuite";
import { useFormik } from "formik";
import * as Yup from "yup";
import { trackPromise } from "react-promise-tracker";
import maintenanceMasterService from "../../../services/MaintenanceMaster.service";
import { useDispatch } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage from "../../../components/Form/ErrorMessage";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import BillingTable from "../../Superadmin/BillingCharges/BillingTable";
import {
  CALC_OR_ARREARS_INTEREST_TYPES,
  MAINTENANCE_PERIOD_VALUES,
  MAINTENANCE_TYPE_VALUES,
} from "../../../utilities/constants";
import "./maintenanceInformation.css";

function getFormSchema() {
  return {
    maintenanceType: "",
    maintenancePeriod: "",
    residentialCharges: "",
    commercialCharges: "",
    arrearsInterestType: "",
    arrearsInterest: "",
    status: false,
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    residentialCharges: Yup.number().required(
      "Please enter residential charges"
    ),
    commercialCharges: Yup.number().required("Please enter commercial charges"),
    arrearsInterest: Yup.number().required("Please enter arrears interest"),
  });
}

function AddMaintenance({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { societyId } = useParams();
  const [maintenanceDetails, setMaintenanceDetails] = useState({});
  const [billCharges, setBillCharges] = useState([]);
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const [selectedBill, setSelectedBill] = useState({});
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [status, setStatus] = useState("noChange");

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formUpdate,
  });

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [pageTitle, dispatch]);

  useEffect(() => {
    if (societyId) {
      async function fetchMaintenanceDetails() {
        try {
          const res = await trackPromise(
            maintenanceMasterService.getMaintenanceById(societyId)
          );
          const maintenanceData = res.data;
          if (maintenanceData.success) {
            setMaintenanceDetails(maintenanceData.maintenance[0]);
            setBillCharges(maintenanceData.maintenance[0].billCharges);
          }
        } catch (err) {
          toast.error(err?.response?.data?.message);
          console.error("Error fetching maintenance details:", err);
        }
      }
      fetchMaintenanceDetails();
    }
  }, [societyId]);
  useEffect(() => {
    function populateForm() {
      const formobj = {
        maintenanceType: maintenanceDetails.maintenanceType,
        maintenancePeriod: maintenanceDetails.maintenancePeriod,
        residentialCharges: maintenanceDetails.residentialCharges,
        commercialCharges: maintenanceDetails.commercialCharges,
        arrearsInterestType: maintenanceDetails.arrearsInterestType,
        arrearsInterest: maintenanceDetails.arrearsInterest,
        status: maintenanceDetails.status,
      };
      frmObj.setValues(formobj);
    }

    populateForm();
  }, [maintenanceDetails._id]);

  useEffect(() => {
    if (status === "Edited") {
      if (selectedBill._id && selectedBill.rowIndex !== undefined) {
        setBillCharges((prevDetails) =>
          prevDetails.map((bill, index) =>
            index === selectedBill.rowIndex ? selectedBill : bill
          )
        );

        setSelectedBill({});
        setStatus("noChange");
      }
    }
  }, [status]);

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };
  const handleCheckboxChange = (key) => (boolean, event) => {
    frmObj.setFieldValue(key, boolean);
  };

  async function formUpdate() {
    setFrmSubmitted(false);
    const payload = { ...maintenanceDetails, billCharges, ...frmObj.values };

    try {
      const resp = await trackPromise(
        maintenanceMasterService.updateMaintenanceById(
          maintenanceDetails._id,
          payload
        )
      );

      const { data } = resp;
      if (data.success) {
        toast.success("maintenance saved successfully!");
        navigate(-1);
      } else {
      }
    } catch (err) {
      console.error("maintenance save error catch => ", err);
      toast.error(err.response.data.message);
    }
  }

  return billCharges.length === 0 ? (
    <div>Loading...</div>
  ) : (
    <div className="thm-panel maintenance-add-component-container">
      <Form
        className=""
        fluid
        onSubmit={() => {
          setFrmSubmitted(true);
          frmObj.handleSubmit();
        }}
      >
        <Grid fluid className="billing-charges">
          <Row gutter={20}>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="maintenance-type">
                <Form.ControlLabel>Maintenance Type</Form.ControlLabel>
                <InputPicker
                  block
                  name="maintenanceType"
                  placeholder="Enter Maintenance Type"
                  data={MAINTENANCE_TYPE_VALUES}
                  value={frmObj.values.maintenanceType}
                  onChange={handleFieldChange("maintenanceType")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.maintenanceType}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="maintenance-period">
                <Form.ControlLabel>Maintenance Period</Form.ControlLabel>
                <InputPicker
                  block
                  name="maintenancPeriod"
                  placeholder="Enter Maintenance Period"
                  data={MAINTENANCE_PERIOD_VALUES}
                  value={frmObj.values.maintenancePeriod}
                  onChange={handleFieldChange("maintenancePeriod")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.maintenancePeriod}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group>
                <Form.ControlLabel>Residential Charges</Form.ControlLabel>
                <Form.Control
                  type="number"
                  accepter={InputNumber}
                  placeholder="Enter Residential Charges"
                  value={frmObj.values.residentialCharges}
                  onChange={handleFieldChange("residentialCharges")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.residentialCharges}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group>
                <Form.ControlLabel>Commercial Charges</Form.ControlLabel>
                <Form.Control
                  type="number"
                  accepter={InputNumber}
                  placeholder="Enter Commercial Charges"
                  value={frmObj.values.commercialCharges}
                  onChange={handleFieldChange("commercialCharges")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.commercialCharges}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="Arrears-interest-type">
                <Form.ControlLabel>Arrears Interest Type</Form.ControlLabel>
                <InputPicker
                  block
                  name="ArrearsInterestType"
                  placeholder="Arrears Interest Type"
                  data={CALC_OR_ARREARS_INTEREST_TYPES}
                  value={frmObj.values.arrearsInterestType}
                  onChange={handleFieldChange("arrearsInterestType")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.arrearsInterestType}
                />
              </Form.Group>
            </Col>

            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group>
                <Form.ControlLabel>Arrears Interest</Form.ControlLabel>
                <Form.Control
                  name="number"
                  accepter={InputNumber}
                  placeholder="Enter Arrears Interest"
                  value={frmObj.values.arrearsInterest}
                  onChange={handleFieldChange("arrearsInterest")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.arrearsInterest}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.ControlLabel>Status</Form.ControlLabel>
              <Form.Group className="status">
                <Checkbox
                  name="status"
                  onChange={(_, boolean) => {
                    handleCheckboxChange("status")(boolean);
                  }}
                  checked={frmObj.values.status}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <div className="content-title">Billing Charges</div>
          </Row>
          <Row gutter={20}>
            <BillingTable
              billId={null}
              pageTitle={pageTitle}
              billsData={billCharges}
              setBillDetails={setBillCharges}
              selectedBill={selectedBill}
              setSelectedBill={setSelectedBill}
              frmObj={frmObj}
              isMaintenanceModalOpen={isMaintenanceModalOpen}
              setIsMaintenanceModalOpen={setIsMaintenanceModalOpen}
              status={status}
              setStatus={setStatus}
              pageType="maintenanceInformationEdit"
            />
          </Row>
          <Row gutter={20}>
            <FlexboxGrid justify="end" align="bottom">
              <FlexboxGridItem>
                <Button appearance="primary" size="lg" type="submit">
                  Update
                </Button>
                <Button
                  as={Link}
                  to="/maintenance-information"
                  size="lg"
                  className="mr-l-1"
                >
                  Cancel
                </Button>
              </FlexboxGridItem>
            </FlexboxGrid>
          </Row>
        </Grid>
      </Form>
    </div>
  );
}

export default AddMaintenance;
