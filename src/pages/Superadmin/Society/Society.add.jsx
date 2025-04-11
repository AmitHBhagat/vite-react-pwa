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
import { useDispatch } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SocietyService from "../../../services/society.service";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import { MONTHS } from "../../../utilities/constants";
import "./society.css";

function getFormSchema() {
  return {
    societyName: "",
    societyAddress: "",
    societyUrl: "",
    societyEmail: "",
    societyRegistrationNo: "",
    societyMembersCount: "",
    societyActivationYear: "",
    societyActivationMonth: "",
    societySubscriptionStartDate: new Date(),
    societySubscriptionEndDate: new Date(),
    status: true,
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    societyName: Yup.string().required("Society Name is required"),
    societyAddress: Yup.string().required("Society Address is required"),
    societyUrl: Yup.string().required("Society URL is required"),
    societyEmail: Yup.string().required("Society Email is required"),
    societyRegistrationNo: Yup.string().required(
      "Society Registration No. is required"
    ),
    societyMembersCount: Yup.number()
      .required("Society Members Count is required")
      .min(1, "Society Members must be a positive value"),
    societyActivationYear: Yup.string().required(
      "Society Activation Year is required"
    ),
    societyActivationMonth: Yup.string().required(
      "Society Activation Month is required"
    ),
    societySubscriptionStartDate: Yup.date().required(
      "Subscription Start Date is required"
    ),
    societySubscriptionEndDate: Yup.date()
      .required("Subscription End Date is required")
      .min(
        Yup.ref("societySubscriptionStartDate"),
        "End date can not be before Start date"
      ),
    status: Yup.boolean().required("Status is required"),
  });
}

function AddSociety({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { societyId } = useParams();
  const [pageError, setPageError] = useState("");
  const [societyDetails, setSocietyDetails] = useState({});
  const [frmSubmitted, setFrmSubmitted] = useState(false);

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (societyId) fetchSocietyDetails(societyId);
  }, [societyId]);

  useEffect(() => {
    if (societyDetails._id) {
      populateForm();
    }
  }, [societyDetails]);

  function navigateBack() {
    navigate(-1);
  }

  function populateForm() {
    const formobj = {
      ...frmObj.values,
      ...societyDetails,
      societySubscriptionStartDate: new Date(
        societyDetails.societySubscriptionStartDate
      ),
      societySubscriptionEndDate: new Date(
        societyDetails.societySubscriptionEndDate
      ),
    };
    frmObj.setValues(formobj);
  }

  async function fetchSocietyDetails(societyid) {
    try {
      const resp = await trackPromise(SocietyService.getSocietyById(societyid));
      const { data } = resp;
      if (data.success) {
        setSocietyDetails(data.society);
      }
    } catch (err) {
      toast.error(err.response.data.message);
      console.error("Fetch society details catch => ", err);
    }
  }

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function formSubmit() {
    setFrmSubmitted(false);
    setPageError("");
    const payload = { ...frmObj.values };
    try {
      const resp = societyId
        ? await trackPromise(SocietyService.updateSociety(societyId, payload))
        : await trackPromise(SocietyService.createSociety(payload));
      const { data } = resp;
      if (data.success) {
        toast.success("Society saved successfully!");
        navigate(-1);
      }
    } catch (err) {
      console.error("Society save error catch => ", err);
      const errMsg =
        err?.response?.data?.message ||
        `Error in ${societyId ? "updating" : "creating"} the society`;
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
            <Col xs={24} lg={8} xl={12}>
              <Form.Group controlId="societyName">
                <Form.ControlLabel className="mandatory-field">
                  Society Name *
                </Form.ControlLabel>
                <Form.Control
                  name="societyName"
                  placeholder="Enter Society Name"
                  value={frmObj.values.societyName}
                  onChange={handleFieldChange("societyName")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societyName}
                />
              </Form.Group>
            </Col>
            <Col xs={24} lg={16} xl={12}>
              <Form.Group controlId="societyAddress">
                <Form.ControlLabel>Society Address</Form.ControlLabel>
                <Form.Control
                  name="societyAddress"
                  placeholder="Enter Society Address"
                  accepter={Textarea}
                  rows="3"
                  value={frmObj.values.societyAddress}
                  onChange={handleFieldChange("societyAddress")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societyAddress}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="societyUrl">
                <Form.ControlLabel className="mandatory-field">
                  Society URL *
                </Form.ControlLabel>
                <Form.Control
                  name="societyUrl"
                  placeholder="Enter Society URL"
                  value={frmObj.values.societyUrl}
                  onChange={handleFieldChange("societyUrl")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societyUrl}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="societyEmail">
                <Form.ControlLabel className="mandatory-field">
                  Society Email *
                </Form.ControlLabel>
                <Form.Control
                  name="societyEmail"
                  placeholder="Enter Society Email"
                  value={frmObj.values.societyEmail}
                  onChange={handleFieldChange("societyEmail")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societyEmail}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="societyRegistrationNo">
                <Form.ControlLabel className="mandatory-field">
                  Society Registration No. *
                </Form.ControlLabel>
                <Form.Control
                  name="societyRegistrationNo"
                  placeholder="Enter Society Registration No."
                  value={frmObj.values.societyRegistrationNo}
                  onChange={handleFieldChange("societyRegistrationNo")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societyRegistrationNo}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="societyMembersCount">
                <Form.ControlLabel className="mandatory-field">
                  Society Members Count *
                </Form.ControlLabel>
                <Form.Control
                  name="societyMembersCount"
                  placeholder="Enter Society Members Count"
                  type="number"
                  value={frmObj.values.societyMembersCount}
                  onChange={handleFieldChange("societyMembersCount")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societyMembersCount}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="societyActivationYear">
                <Form.ControlLabel className="mandatory-field">
                  Society Activation Year *
                </Form.ControlLabel>
                <Form.Control
                  name="societyActivationYear"
                  placeholder="Enter Society Activation Year"
                  type="number"
                  value={frmObj.values.societyActivationYear}
                  onChange={handleFieldChange("societyActivationYear")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societyActivationYear}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="societyActivationMonth">
                <Form.ControlLabel className="mandatory-field">
                  Society Activation Month *
                </Form.ControlLabel>
                <InputPicker
                  block
                  name="societyActivationMonth"
                  placeholder="Enter Society Activation Month"
                  data={MONTHS}
                  value={frmObj.values.societyActivationMonth}
                  onChange={handleFieldChange("societyActivationMonth")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societyActivationMonth}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="societySubscriptionStartDate">
                <Form.ControlLabel>Subscription Start Date</Form.ControlLabel>
                <DatePicker
                  oneTap
                  block
                  name="societySubscriptionStartDate"
                  value={frmObj.values.societySubscriptionStartDate}
                  onChange={handleFieldChange("societySubscriptionStartDate")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societySubscriptionStartDate}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="societySubscriptionEndDate">
                <Form.ControlLabel>Subscription End Date</Form.ControlLabel>
                <DatePicker
                  oneTap
                  block
                  name="societySubscriptionEndDate"
                  value={frmObj.values.societySubscriptionEndDate}
                  onChange={handleFieldChange("societySubscriptionEndDate")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societySubscriptionEndDate}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="status">
                <Form.ControlLabel>Is Active</Form.ControlLabel>
                <Form.Control
                  name="status"
                  accepter={Checkbox}
                  checked={frmObj.values.status}
                  onChange={(val, state) => handleFieldChange("status")(state)}
                />
              </Form.Group>
            </Col>
          </Row>

          <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />

          <FlexboxGrid justify="end">
            <FlexboxGridItem>
              <Button appearance="primary" size="lg" type="submit">
                {societyId ? "Update" : "Create"}
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

export default AddSociety;
