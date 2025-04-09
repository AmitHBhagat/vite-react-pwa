import React, { useState, useEffect, forwardRef } from "react";
import {
  Form,
  Button,
  Grid,
  Row,
  Col,
  Checkbox,
  DatePicker,
  InputPicker,
  Input,
  FlexboxGrid,
} from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import { useFormik } from "formik";
import * as Yup from "yup";
import { trackPromise } from "react-promise-tracker";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AmcService from "../../../services/amc.service";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";

import VendorTypeService from "../../../services/vendorType.service";

function getFormSchema() {
  return {
    vendorType: "",
    amcDescription: "",
    vendorName: "",
    vendorEmail: "",
    vendorMobile: "",
    vendorAddress: "",
    amcStartDate: new Date(),
    amcEndDate: new Date(),
    status: true,
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    vendorType: Yup.string().required("Vendor type is required."),
    amcDescription: Yup.string().required("Amc description is required."),
    vendorName: Yup.string().required("Vendor name is required."),
    vendorMobile: Yup.string()

      .min(10, "Min 10 digit")
      .max(10, "Max 10 digit")
      .required("Mobile is required."),
    amcStartDate: Yup.date()
      .required("Please Select AMC Start Date.")
      .max(Yup.ref("amcEndDate"), "Start date should be lesser than End date"),
    amcEndDate: Yup.date()
      .required("Please select AMC End Date")
      .min(
        Yup.ref("amcStartDate"),
        "End date should be greater than Start date"
      ),
  });
}

function AddEditAmc({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { amcId } = useParams();
  const [pageError, setPageError] = useState("");
  const [amcDetails, setAmcDetails] = useState({});
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;
  const [vendorTypes, setVendorTypes] = useState([]);

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    getVendorTypes();
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (amcId) {
      getAmcDetails(amcId);
    }
  }, [amcId]);

  useEffect(() => {
    if (amcDetails._id) {
      populateForm();
    }
  }, [amcDetails]);

  function navigateBack() {
    navigate(-1);
  }

  function populateForm() {
    const formobj = {
      ...frmObj.values,
      ...amcDetails,

      amcStartDate: new Date(amcDetails.amcStartDate),
      amcEndDate: new Date(amcDetails.amcEndDate),
    };
    frmObj.setValues(formobj);
  }

  const vendorType = vendorTypes.map((type) => {
    return { label: type.vendorTypeName, value: type.vendorTypeName };
  });

  async function getAmcDetails(amcId) {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(AmcService.getAmcDetails(amcId));

      const { data } = resp;
      if (data.success) respdata = resp.data.amc;
    } catch (err) {
      console.error("AMC fetch catch => ", err);
      const errMsg = err?.response?.data?.message || `Error in fetching amc`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setAmcDetails(respdata);
  }

  const getVendorTypes = async () => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(VendorTypeService.getTypes(societyId));
      const { data } = resp;
      if (data.success) respdata = resp.data.vendorTypes;
    } catch (err) {
      console.error("Vendor Types fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching vendor types`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setVendorTypes(respdata);
  };

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function formSubmit() {
    setFrmSubmitted(false);
    const payload = {
      ...frmObj.values,
      societyId: societyId,
    };

    try {
      const resp = amcId
        ? await trackPromise(AmcService.updateAmc(amcId, payload))
        : await trackPromise(AmcService.createAmc(payload));
      const { data } = resp;

      if (data.success) {
        toast.success("Amc saved successfully!");
        navigateBack();
      } else {
      }
    } catch (err) {
      console.error("Amc save error catch => ", err);
      const errMsg =
        err?.response?.data?.message ||
        `Error in ${amcId ? "updating" : "creating"} the amc`;
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
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="vendorType">
                <Form.ControlLabel className="mandatory-field">
                  Vendor Type *
                </Form.ControlLabel>
                <InputPicker
                  block
                  name="vendorType"
                  placeholder="Enter a Vendor Type"
                  data={vendorType}
                  value={frmObj.values.vendorType}
                  onChange={handleFieldChange("vendorType")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.vendorType}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="vendorName">
                <Form.ControlLabel className="mandatory-field">
                  Vendor Name *
                </Form.ControlLabel>
                <Form.Control
                  name="vendorName"
                  placeholder="Enter a Vender Name."
                  value={frmObj.values.vendorName}
                  onChange={handleFieldChange("vendorName")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.vendorName}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="vendorEmail">
                <Form.ControlLabel>Vendor Email</Form.ControlLabel>
                <Form.Control
                  name="vendorEmail"
                  placeholder="Enter a Vendor Email"
                  value={frmObj.values.vendorEmail}
                  onChange={handleFieldChange("vendorEmail")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.vendorEmail}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="vendorMobile">
                <Form.ControlLabel className="mandatory-field">
                  Vendor Mobile *
                </Form.ControlLabel>
                <Form.Control
                  type="number"
                  name="vendorMobile"
                  placeholder="Enter a vendor mobile "
                  value={frmObj.values.vendorMobile}
                  onChange={handleFieldChange("vendorMobile")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.vendorMobile}
                />
              </Form.Group>
            </Col>
            <Col xs={24} lg={8} xl={6}>
              <Form.Group controlId="vendorAddress">
                <Form.ControlLabel>Vendor Address</Form.ControlLabel>

                <Form.Control
                  name="vendorAddress"
                  placeholder="Enter Vendor Address"
                  accepter={Textarea}
                  rows="3"
                  value={frmObj.values.vendorAddress}
                  onChange={handleFieldChange("vendorAddress")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.vendorAddress}
                />
              </Form.Group>
            </Col>

            <Col xs={24} lg={8} xl={6}>
              <Form.Group controlId="amcDescription">
                <Form.ControlLabel className="mandatory-field">
                  Amc Description *
                </Form.ControlLabel>

                <Form.Control
                  name="amcDescription"
                  placeholder="Enter Amc Description"
                  accepter={Textarea}
                  rows="3"
                  value={frmObj.values.amcDescription}
                  onChange={handleFieldChange("amcDescription")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.amcDescription}
                />
              </Form.Group>
            </Col>

            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="amcStartDate">
                <Form.ControlLabel>Amc Start Date</Form.ControlLabel>
                <DatePicker
                  oneTap
                  block
                  name="amcStartDate"
                  value={frmObj.values.amcStartDate}
                  //format="dd/MM/yyyy"
                  onChange={handleFieldChange("amcStartDate")}
                  cleanable={false}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.amcStartDate}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="Amc End Date">
                <Form.ControlLabel>Amc End Date</Form.ControlLabel>
                <DatePicker
                  oneTap
                  block
                  cleanable={false}
                  name="amcEndDate"
                  value={frmObj.values.amcEndDate}
                  onChange={handleFieldChange("amcEndDate")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.amcEndDate}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="status">
                <Form.ControlLabel>Active</Form.ControlLabel>
                <Form.Control
                  name="status"
                  accepter={Checkbox}
                  checked={frmObj.values.status}
                  onChange={(val, state) => handleFieldChange("status")(state)}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.status}
                />
              </Form.Group>
            </Col>
          </Row>
          <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
          <FlexboxGrid justify="end">
            <FlexboxGridItem>
              <Button appearance="primary" size="lg" type="submit">
                {amcId ? "Update" : "Create"}
              </Button>
              <Button as={Link} to="../amc" size="lg" className="mr-l-1">
                Cancel
              </Button>
            </FlexboxGridItem>
          </FlexboxGrid>
        </Grid>
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </Form>
    </div>
  );
}
const Textarea = forwardRef((props, ref) => (
  <Input as="textarea" ref={ref} {...props} />
));

export default AddEditAmc;
