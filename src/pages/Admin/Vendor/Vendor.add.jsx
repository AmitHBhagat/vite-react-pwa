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
import VendorService from "../../../services/vendor.service";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import { EXPENSETYPE, PAYMENTMODE } from "../../../utilities/constants";
import VendorTypeService from "../../../services/vendorType.service";

function getFormSchema() {
  return {
    vendorType: "",
    vendorName: "",
    vendorEmail: "",
    vendorMobile: "",
    vendorDetails: "",
    vendorDescription: "",
    status: true,
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    vendorType: Yup.string().required("Vendor type is required."),
    vendorName: Yup.string().required("Vendor name is required."),
    vendorMobile: Yup.string()
      .min(10, "Min 10 digit")
      .max(10, "Max 10 digit")
      .required("Mobile is required."),
  });
}

function AddEditVendor({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const [pageError, setPageError] = useState("");
  const [vendorDetails, setVendorDetails] = useState({});
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
    if (vendorId) {
      getVendorDetails(vendorId);
    }
  }, [vendorId]);

  useEffect(() => {
    if (vendorDetails._id) {
      populateForm();
    }
  }, [vendorDetails]);

  function navigateBack() {
    navigate(-1);
  }

  function populateForm() {
    const formobj = {
      ...frmObj.values,
      ...vendorDetails,
    };
    frmObj.setValues(formobj);
  }

  const vendorType = vendorTypes.map((type) => {
    return { label: type.vendorTypeName, value: type.vendorTypeName };
  });

  const getVendorDetails = async (vendorId) => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(VendorService.getVendorById(vendorId));
      const { data } = resp;
      if (data.success) {
        respdata = data.vendor;
      }
    } catch (err) {
      console.error("Vendor details fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching vendor details`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setVendorDetails(respdata);
  };

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
  console.log("object value", frmObj.values);
  async function formSubmit() {
    setFrmSubmitted(false);
    const payload = {
      ...frmObj.values,
      societyId: societyId,
    };

    try {
      const resp = vendorId
        ? await trackPromise(VendorService.updateVendor(vendorId, payload))
        : await trackPromise(VendorService.createVendor(payload));
      const { data } = resp;

      if (data.success) {
        toast.success("Vendor saved successfully!");
        navigateBack();
      } else {
      }
    } catch (err) {
      console.error("Vendor save error catch => ", err);
      const errMsg =
        err?.response?.data?.message ||
        `Error in ${vendorId ? "updating" : "creating"} the vendor`;
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
                <Form.ControlLabel>Vendor Type</Form.ControlLabel>
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
                <Form.ControlLabel>Vendor Name</Form.ControlLabel>
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
                <Form.ControlLabel>Vendor Mobile</Form.ControlLabel>
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
              <Form.Group controlId="vendorDetails">
                <Form.ControlLabel>Vendor Details</Form.ControlLabel>

                <Form.Control
                  name="vendorDetails"
                  placeholder="Enter a Vendor details"
                  value={frmObj.values.vendorDetails}
                  onChange={handleFieldChange("vendorDetails")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.vendorDetails}
                />
              </Form.Group>
            </Col>

            <Col xs={24} lg={8} xl={6}>
              <Form.Group controlId="vendorDescription">
                <Form.ControlLabel>Vendor Description</Form.ControlLabel>

                <Form.Control
                  name="vendorDescription"
                  placeholder="Enter vendor description"
                  accepter={Textarea}
                  rows="3"
                  value={frmObj.values.vendorDescription}
                  onChange={handleFieldChange("vendorDescription")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.vendorDescription}
                />
              </Form.Group>
            </Col>

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
                {vendorId ? "Update" : "Create"}
              </Button>
              <Button as={Link} to="../vendors" size="lg" className="mr-l-1">
                Cancel
              </Button>
            </FlexboxGridItem>
          </FlexboxGrid>
        </Grid>
        {/* {pageError && <div>{pageError}</div>} */}
      </Form>
    </div>
  );
}
const Textarea = forwardRef((props, ref) => (
  <Input as="textarea" ref={ref} {...props} />
));

export default AddEditVendor;
