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
import adminServices from "../../../services/admin.service";
import { useDispatch } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import "react-quill/dist/quill.snow.css";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import useFetchSocieties from "../../../utilities/useFetchSocieties";
import { ROLE } from "../../../utilities/constants";
import "./user.css";

function AddUser({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();
  const [pageError, setPageError] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  function getFormSchema() {
    return {
      userName: "",
      societyName: "",
      password: "",
      role: "",
      isActive: true,
    };
  }

  function getValidationSchema() {
    return Yup.object().shape({
      userName: Yup.string().required("User name is required"),
      societyName: Yup.string().required("User society name is required"),
      password: Yup.string().when([], {
        is: () => !userDetails._id,
        then: (schema) =>
          schema.required("Password is required").min(6).max(20),
        otherwise: (schema) => schema.notRequired(),
      }),
      role: Yup.string().required("User role is required"),

      isActive: Yup.boolean().required("Active status is required"),
    });
  }
  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    if (userId) {
      fetchuserDetails();
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
      societyName: userDetails?.societyName?._id,
      userSubscriptionStartDate: new Date(
        userDetails.userSubscriptionStartDate
      ),
      userSubscriptionEndDate: new Date(userDetails.userSubscriptionEndDate),
    };
    frmObj.setValues(formobj);
  }

  async function fetchuserDetails() {
    setPageError("");
    try {
      const resp = await trackPromise(adminServices.getUserById(userId));
      const { data } = resp;
      if (data.success) {
        const user = data.adminUser;
        setUserDetails(user);
      }
    } catch (err) {
      console.error("User details fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching user details`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
  }

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function formSubmit() {
    setPageError("");
    setFrmSubmitted(false);
    const payload = { ...frmObj.values };
    try {
      const resp = userId
        ? await trackPromise(adminServices.updateUser(userId, payload))
        : await trackPromise(adminServices.createUser(payload));
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
        `Error in ${userId ? "updating" : "creating"} the user`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
  }

  const { societies, error: fetchError, refresh } = useFetchSocieties();

  const modifySocieties = societies.map((soc) => {
    return { label: soc.societyName, value: soc._id };
  });

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
              <Form.Group controlId="userName">
                <Form.ControlLabel className="mandatory-field">
                  User Name *
                </Form.ControlLabel>
                <Form.Control
                  name="userName"
                  placeholder="Enter Full Name"
                  value={frmObj.values.userName}
                  onChange={handleFieldChange("userName")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.userName}
                />
              </Form.Group>
            </Col>
            <Col xs={16} md={6}>
              <Form.Group controlId="societyName">
                <Form.ControlLabel className="mandatory-field">
                  Society Name *
                </Form.ControlLabel>

                <InputPicker
                  block
                  name="societyName"
                  placeholder="Enter society Name"
                  data={modifySocieties}
                  value={frmObj.values.societyName}
                  onChange={handleFieldChange("societyName")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societyName}
                />
              </Form.Group>
            </Col>
            {!userDetails?._id && (
              <Col xs={16} md={6}>
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
            <Col xs={16} md={6}>
              <Form.Group controlId="role">
                <Form.ControlLabel className="mandatory-field">
                  User Role *
                </Form.ControlLabel>

                <InputPicker
                  block
                  name="role"
                  placeholder="Enter role Name"
                  data={ROLE}
                  value={frmObj.values.role}
                  onChange={handleFieldChange("role")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.role}
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
                to="../admin-users"
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

export default AddUser;
