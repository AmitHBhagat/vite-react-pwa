import React, { useState, useEffect, forwardRef } from "react";
import {
  Form,
  Button,
  Grid,
  Row,
  Col,
  Input,
  FlexboxGrid,
  InputPicker,
} from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import { useFormik } from "formik";
import * as Yup from "yup";
import { trackPromise } from "react-promise-tracker";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BillingAdjustmentService from "../../../services/billingAdjustments.service";
import FlatManagementService from "../../../services/flat.service";
import { ADJUSTMENT_TYPE } from "../../../utilities/constants";

import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";

function getFormSchema() {
  return {
    societyId: "",
    flatId: "",
    adjustmentType: "",
    adjustmentDescription: "",
    amount: "",
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    flatId: Yup.string().required("Flat Name is required"),
    adjustmentType: Yup.string().required("Adjustment Type is required"),
    adjustmentDescription: Yup.string().required(
      "Adjustment Description is required"
    ),
    amount: Yup.string().required("Amount is required"),
  });
}

function AddBillingAdjustment({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.authState);
  const { billingId } = useParams();
  const [pageError, setPageError] = useState("");
  const [billAdjustDetails, setBillAdjustDetails] = useState({});
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const societyId = authState?.user?.societyName;
  const [flats, setFlats] = useState([]);

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    getFlats();
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (billingId) fetchBillAdjustDetails(billingId);
  }, [billingId]);

  useEffect(() => {
    if (billAdjustDetails._id) {
      populateForm(billAdjustDetails);
    }
  }, [billAdjustDetails]);

  function navigateBack() {
    navigate(-1);
  }

  function populateForm(newData = {}) {
    const formobj = {
      ...frmObj.values,
      ...newData,
    };
    frmObj.setValues(formobj);
  }

  async function fetchBillAdjustDetails(billingId) {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(
        BillingAdjustmentService.getBillAdjustmentById(billingId)
      );
      const { data } = resp;
      if (data.success) respdata = resp.data.billAdjustments;
    } catch (err) {
      console.error("BillAdjustments fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching billAdjustments`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setBillAdjustDetails(respdata);
  }

  const getFlats = async () => {
    try {
      const resp = await trackPromise(
        FlatManagementService.getFlatsBySocietyId(societyId)
      );
      setFlats(resp.data.flats);
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Failed to fetch flats", error);
    }
  };

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function formSubmit() {
    setFrmSubmitted(false);
    setPageError("");

    try {
      const selectedFlatId = frmObj.values.flatId;
      const selectedFlat = flats.find((flat) => flat._id === selectedFlatId);
      const flatNo = selectedFlat ? selectedFlat.flatNo : "";

      const payload = {
        ...frmObj.values,
        flatNo,
        societyId: societyId,
      };
      const resp = await trackPromise(
        BillingAdjustmentService.createBillAdjustment(payload)
      );

      const { data } = resp;
      if (data.success) {
        toast.success("Billing Adjustment saved successfully!");
        navigate(-1);
      }
    } catch (err) {
      console.error("Billing adjustment save error catch => ", err);
      const errMsg =
        err?.response?.data?.message ||
        `Error in creating the billing adjustment`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
  }

  return (
    <div className="thm-panel">
      <Form
        className=""
        fluid
        onSubmit={() => {
          setFrmSubmitted(true);
          frmObj.handleSubmit();
        }}
      >
        <Grid fluid className="">
          <Row gutter={20}>
            <Col xs={24} lg={8} xl={6}>
              <Form.Group controlId="flatId">
                <Form.ControlLabel>Flat No.</Form.ControlLabel>
                <InputPicker
                  block
                  name="flatId"
                  placeholder="Select flat"
                  data={flats.map((flats) => ({
                    label: flats.flatNo,
                    value: flats._id,
                  }))}
                  value={frmObj.values.flatId}
                  onChange={(value) => {
                    handleFieldChange("flatId")(value);
                  }}
                />

                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.flatId}
                />
              </Form.Group>
            </Col>
            <Col xs={24} lg={8} xl={6}>
              <Form.Group controlId="adjustmentType">
                <Form.ControlLabel>Adjustment Type</Form.ControlLabel>
                <InputPicker
                  block
                  name="adjustmentType"
                  placeholder="Select Adjustment Type"
                  data={ADJUSTMENT_TYPE}
                  value={frmObj.values.adjustmentType}
                  onChange={handleFieldChange("adjustmentType")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.adjustmentType}
                />
              </Form.Group>
            </Col>
            <Col xs={24} lg={8} xl={6}>
              <Form.Group controlId="adjustmentDescription">
                <Form.ControlLabel>Adjustment Description</Form.ControlLabel>

                <Form.Control
                  name="adjustmentDescription"
                  placeholder="Enter Adjustment Description"
                  accepter={Textarea}
                  rows="3"
                  value={frmObj.values.adjustmentDescription}
                  onChange={handleFieldChange("adjustmentDescription")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.adjustmentDescription}
                />
              </Form.Group>
            </Col>
            <Col xs={24} lg={8} xl={6}>
              <Form.Group controlId="amount">
                <Form.ControlLabel>Amount</Form.ControlLabel>
                <Form.Control
                  name="amount"
                  placeholder="Enter amount"
                  type="number"
                  value={frmObj.values.amount}
                  onChange={handleFieldChange("amount")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.amount}
                />
              </Form.Group>
            </Col>
          </Row>

          <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />

          <FlexboxGrid justify="end">
            <FlexboxGridItem>
              <Button appearance="primary" size="lg" type="submit">
                Create
              </Button>
              <Button onClick={navigateBack} size="lg" className="mr-l-1">
                Cancel
              </Button>
            </FlexboxGridItem>
          </FlexboxGrid>
        </Grid>
      </Form>
    </div>
  );
}

const Textarea = forwardRef((props, ref) => (
  <Input as="textarea" ref={ref} {...props} />
));

export default AddBillingAdjustment;
