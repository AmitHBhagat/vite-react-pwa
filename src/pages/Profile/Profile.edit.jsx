import React, { forwardRef, useEffect, useState } from "react";
import { Row, Col, Button, Form, Grid, FlexboxGrid, Input } from "rsuite";
import { useDispatch, useSelector } from "react-redux";
import { trackPromise } from "react-promise-tracker";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useFormik } from "formik";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import ErrorMessage, {
  PageErrorMessage,
} from "../../components/Form/ErrorMessage";
import { setRouteData } from "../../stores/appSlice";
import AuthService from "../../services/auth.service";
import { updateUserProfile } from "../../stores/store";

function getFormSchema() {
  return {
    name: "",
    mobile: "",
    email: "",
    address: "",
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    name: Yup.string().required("User Name is required"),
    mobile: Yup.string()
      .min(10, "Minimum 10 digits required")
      .max(10, "Maximum 10 digits allowed")
      .required("Phone is required"),
    email: Yup.string().email("Email is invalid").required("Email is required"),
    address: Yup.string().required("Address is required"),
  });
}

function ProfileEdit({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.authState);
  const [pageError, setPageError] = useState("");
  const [userProfile, setUserProfile] = useState({});
  const [frmSubmitted, setFrmSubmitted] = useState(false);

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  useEffect(() => {
    if (authState.user?._id) fetchUserProfile();
  }, []);

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (userProfile?._id) {
      populateForm();
    }
  }, [userProfile]);

  function navigateBack() {
    navigate(-1);
  }

  function populateForm() {
    const formobj = { ...frmObj.values, ...userProfile };
    frmObj.setValues(formobj);
  }

  const fetchUserProfile = async () => {
    try {
      const resp = await trackPromise(AuthService.getProfile());
      const { data } = resp;
      if (data.success) {
        setUserProfile(data.user);
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error fetching profile");
    }
  };

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function formSubmit() {
    setFrmSubmitted(false);
    setPageError("");
    const payload = { ...frmObj.values };
    await updateUserProfile(payload);
    navigate(-1);
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
            <Col xs={24} sm={14} xl={8} xxl={6}>
              <Form.Group controlId="name">
                <Form.ControlLabel>User Name</Form.ControlLabel>
                <Form.Control
                  name="name"
                  placeholder="Enter User Name"
                  value={frmObj.values.name}
                  onChange={handleFieldChange("name")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.name}
                />
              </Form.Group>
            </Col>
            <Col xs={24} sm={10} xl={6} xxl={4}>
              <Form.Group controlId="mobile">
                <Form.ControlLabel>Mobile</Form.ControlLabel>
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
            <Col xs={24} sm={24} xl={10} xxl={6}>
              <Form.Group controlId="email">
                <Form.ControlLabel>Email</Form.ControlLabel>
                <Form.Control
                  name="email"
                  placeholder="Enter Society Email"
                  value={frmObj.values.email}
                  onChange={handleFieldChange("email")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.email}
                />
              </Form.Group>
            </Col>
            <Col xs={24} sm={24} xl={14} xxl={8}>
              <Form.Group controlId="address">
                <Form.ControlLabel>Address</Form.ControlLabel>
                <Form.Control
                  name="address"
                  placeholder="Enter Address"
                  accepter={Textarea}
                  rows="3"
                  value={frmObj.values.address}
                  onChange={handleFieldChange("address")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.address}
                />
              </Form.Group>
            </Col>
          </Row>

          <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />

          <FlexboxGrid justify="end">
            <FlexboxGridItem>
              <Button appearance="primary" size="lg" type="submit">
                Update
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

export default ProfileEdit;

const Textarea = forwardRef((props, ref) => (
  <Input as="textarea" ref={ref} {...props} />
));
