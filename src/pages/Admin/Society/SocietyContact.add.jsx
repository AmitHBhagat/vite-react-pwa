import React, { useState, useEffect, forwardRef } from "react";
import {
  Form,
  Button,
  Grid,
  Row,
  Col,
  InputPicker,
  Input,
  FlexboxGrid,
} from "rsuite";
import { useFormik } from "formik";
import * as Yup from "yup";
import { trackPromise } from "react-promise-tracker";
import SocietyService from "../../../services/society.service";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import { POSITION } from "../../../utilities/constants";

function AddSocietyContact({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { societyContactId } = useParams();

  const [pageError, setPageError] = useState("");
  const [societyContactDetails, setSocietyContactDetails] = useState({});
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  function getFormSchema() {
    return {
      contactName: "",
      mobile: "",
      email: "",
      position: "",
    };
  }

  function getValidationSchema() {
    return Yup.object().shape({
      contactName: Yup.string().required("Contact name is required"),
      mobile: Yup.string()

        .min(10, "Your mobile must be at least 10 characters long")
        .max(10, "Your mobile must be max 10 characters long")
        .required("Mobile is required"),
      email: Yup.string()
        .email("Email is invalid")
        .required("Email is required"),
      position: Yup.string().required("Position is required"),
    });
  }
  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (societyId) {
      fetchSocietyContactDetails(societyId);
    }
  }, [societyId]);

  useEffect(() => {
    if (societyContactId && societyContactDetails.length) {
      const matchedContact = societyContactDetails.find(
        (item) => item._id === societyContactId
      );
      if (matchedContact) {
        populateForm(matchedContact);
      }
    }
  }, [societyContactId, societyContactDetails]);

  function populateForm(contact) {
    const formobj = {
      contactName: contact.contactName,
      mobile: contact.mobile,
      email: contact.email,
      position: contact.position,
    };
    frmObj.setValues(formobj);
  }

  const fetchSocietyContactDetails = async () => {
    setPageError("");
    let respData = [];
    try {
      const resp = await trackPromise(SocietyService.getSocietyById(societyId));
      const { data } = resp;
      if (data.success) respData = resp.data.society.contactInfo;
    } catch (err) {
      console.error("Request query fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching request query`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setSocietyContactDetails(respData);
  };

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function formSubmit() {
    setPageError("");
    setFrmSubmitted(false);
    const payload = { ...frmObj.values };

    try {
      const resp = societyContactId
        ? await trackPromise(
            SocietyService.updateSocietyContact(
              societyId,
              societyContactId,
              payload
            )
          )
        : await trackPromise(
            SocietyService.createSocietyContact(societyId, payload)
          );
      const { data } = resp;
      if (data.success) {
        toast.success("Society Contact saved successfully!");
        navigate(-1);
      }
    } catch (err) {
      console.error("Society Contact save error catch => ", err);
      const errMsg =
        err?.response?.data?.message ||
        `Error in ${
          societyContactId ? "updating" : "creating"
        } the Society Contact`;
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
            <Col xs={16} md={6}>
              <Form.Group controlId="contactName">
                <Form.ControlLabel className="mandatory-field">
                  Contact Name *
                </Form.ControlLabel>
                <Form.Control
                  name="contactName"
                  placeholder="Enter a Contact Name"
                  value={frmObj.values.contactName}
                  onChange={handleFieldChange("contactName")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.contactName}
                />
              </Form.Group>
            </Col>
            <Col xs={16} md={6}>
              <Form.Group controlId="mobile">
                <Form.ControlLabel className="mandatory-field">
                  Mobile *
                </Form.ControlLabel>
                <Form.Control
                  type="number"
                  name="mobile"
                  placeholder="Enter a Mobile"
                  value={frmObj.values.mobile}
                  onChange={handleFieldChange("mobile")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.mobile}
                />
              </Form.Group>
            </Col>

            <Col xs={16} md={6}>
              <Form.Group controlId="email">
                <Form.ControlLabel className="mandatory-field">
                  Email *
                </Form.ControlLabel>
                <Form.Control
                  name="email"
                  placeholder="Enter a email"
                  value={frmObj.values.email}
                  onChange={handleFieldChange("email")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.email}
                />
              </Form.Group>
            </Col>

            <Col xs={16} md={6}>
              <Form.Group controlId="position">
                <Form.ControlLabel className="mandatory-field">
                  Position *
                </Form.ControlLabel>

                <InputPicker
                  block
                  name="position"
                  placeholder="Enter position"
                  data={POSITION}
                  value={frmObj.values.position}
                  onChange={handleFieldChange("position")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.position}
                />
              </Form.Group>
            </Col>
          </Row>
          <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
          <FlexboxGrid justify="end">
            <FlexboxGridItem>
              <Button appearance="primary" size="lg" type="submit">
                {societyContactId ? "Update" : "Create"}
              </Button>
              <Button
                as={Link}
                to="../society-contacts"
                size="lg"
                className="mr-l-1"
              >
                Cancel
              </Button>
            </FlexboxGridItem>
          </FlexboxGrid>
        </Grid>
      </Form>
    </div>
  );
}

export default AddSocietyContact;
