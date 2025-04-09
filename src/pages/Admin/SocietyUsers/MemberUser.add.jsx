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
  Checkbox,
} from "rsuite";
import { useFormik } from "formik";
import * as Yup from "yup";
import { trackPromise } from "react-promise-tracker";
import adminService from "../../../services/admin.service";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";

function AddMemberUser({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();

  const [pageError, setPageError] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  function getFormSchema() {
    return {
      name: "",
      mobile: "",
      email: "",
      password: "",
      address: "",
      status: false,
    };
  }

  function getValidationSchema() {
    return Yup.object().shape({
      name: Yup.string().required("Name is required"),
      mobile: Yup.string()

        .min(10, "Your mobile must be at least 10 digits long")
        .max(10, "Your mobile must be max 10 digits long")
        .required("Mobile is required"),
      email: Yup.string()
        .email("Email is invalid")
        .required("Email is required"),
      password: Yup.string()
        .concat(!userId ? Yup.string().required("Password is required") : null)
        .min(6, "Password must be at least 6 characters"),
      status: Yup.boolean().required("Active status is required"),
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
    if (userId) {
      fetchuserDetails(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (userDetails?._id) {
      populateForm();
    }
  }, [userDetails]);

  function populateForm() {
    const formobj = {
      ...frmObj.values,
      ...userDetails,
    };
    frmObj.setValues(formobj);
  }

  async function fetchuserDetails() {
    try {
      const resp = await trackPromise(adminService.getUserDetails(userId));
      const { data } = resp;
      if (data.success) {
        setUserDetails(data.user);
      }
    } catch (err) {
      toast.error(err.response.data.message || err.message);
      console.error("Fetch User details catch => ", err);
    }
  }

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function formSubmit() {
    setFrmSubmitted(false);
    setPageError("");
    const payload = { ...frmObj.values, societyId: societyId };

    try {
      const resp = userId
        ? await trackPromise(adminService.updateMemberUser(userId, payload))
        : await trackPromise(adminService.createMemberUser(payload));
      const { data } = resp;

      if (data.success) {
        toast.success("User saved successfully!");
        navigate(-1);
      } else {
      }
    } catch (err) {
      console.error("User save error catch => ", err);
      const errMsg =
        err?.response?.data?.message ||
        `Error in ${userId ? "updating" : "creating"} the member user`;
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
              <Form.Group controlId="name">
                <Form.ControlLabel className="mandatory-field">
                  User Name *
                </Form.ControlLabel>
                <Form.Control
                  name="name"
                  placeholder="Enter a Name"
                  value={frmObj.values.name}
                  onChange={handleFieldChange("name")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.name}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
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

            {!userId && (
              <Col xs={24} md={12} lg={8} xl={6}>
                <Form.Group controlId="password">
                  <Form.ControlLabel className="mandatory-field">
                    Password *
                  </Form.ControlLabel>
                  <Form.Control
                    name="password"
                    placeholder="Enter user Password"
                    value={frmObj.values.password}
                    onChange={handleFieldChange("password")}
                  />
                  <ErrorMessage
                    show={frmSubmitted}
                    msgText={frmObj.errors.password}
                  />
                </Form.Group>
              </Col>
            )}

            <Col xs={24} md={12} lg={8} xl={6}>
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
            <Col xs={24} lg={16} xl={12}>
              <Form.Group controlId="address">
                <Form.ControlLabel> Address</Form.ControlLabel>
                <Form.Control
                  name="address"
                  placeholder="Enter a Address"
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

            <Col xs={24} lg={16} xl={12}>
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
                {userId ? "Update" : "Create"}
              </Button>
              <Button
                as={Link}
                to="../member-user"
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

const Textarea = forwardRef((props, ref) => (
  <Input as="textarea" ref={ref} {...props} />
));

export default AddMemberUser;
