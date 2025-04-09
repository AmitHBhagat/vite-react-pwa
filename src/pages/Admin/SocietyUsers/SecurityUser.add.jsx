import React, { useState, useEffect, forwardRef } from "react";
import { Form, Button, Grid, Row, Col, Input, FlexboxGrid } from "rsuite";
import { useFormik } from "formik";
import * as Yup from "yup";
import { trackPromise } from "react-promise-tracker";
import adminServices from "../../../services/admin.service";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import "react-quill/dist/quill.snow.css";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import "../../Superadmin/AdminUsers/user.css";

function SecurityAddUser({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { securityId } = useParams();
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;
  const [pageError, setPageError] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  function getFormSchema() {
    return {
      userName: "",
      societyName: societyId,
      password: "",
      role: "security",
      isActive: true,
    };
  }

  function getValidationSchema() {
    return Yup.object().shape({
      userName: Yup.string().required("User Name is required"),
      password: Yup.string().when([], {
        is: () => !securityId,
        then: (schema) =>
          schema
            .required("Password is required")
            .min(6, "Minimum 6 characters")
            .max(20, "Maximum 20 characters"),
        otherwise: (schema) => schema.notRequired(),
      }),
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
    if (securityId) {
      fetchSecurityDetails(securityId);
    }
  }, [securityId, dispatch, pageTitle]);

  useEffect(() => {
    if (userDetails?._id) {
      populateForm();
    }
  }, [userDetails]);

  function populateForm() {
    const formObj = {
      ...getFormSchema(),
      ...userDetails,
      userName: userDetails.userName || "",
      societyName: societyId,
      password: "",
      role: userDetails.role,
      isActive: userDetails.isActive ?? true,
    };
    frmObj.setValues(formObj);
  }

  async function fetchSecurityDetails(securityId) {
    try {
      const resp = await trackPromise(adminServices.getUserById(securityId));
      const { data } = resp;
      if (data.success) {
        const user = data.adminUser;
        setUserDetails(user);
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "Error fetching the security user";
      toast.error(errMsg);
      setPageError(errMsg);
      console.error("Fetch security user details catch => ", err);
    }
  }

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function formSubmit() {
    setFrmSubmitted(true);
    const payload = { ...frmObj.values };
    try {
      const resp = securityId
        ? await trackPromise(adminServices.updateUser(securityId, payload))
        : await trackPromise(adminServices.createUser(payload));
      const { data } = resp;
      if (data.success) {
        toast.success(
          `Security user ${securityId ? "updated" : "created"} successfully!`
        );
        navigate(-1);
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        `Error ${securityId ? "updating" : "adding"} the user`;
      toast.error(errMsg);
      setPageError(errMsg);
      console.error(
        `User ${securityId ? "updating" : "adding"} error catch => `,
        err
      );
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
            {!userDetails._id && (
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
          </Row>

          <FlexboxGrid justify="end">
            <FlexboxGridItem>
              <Button appearance="primary" size="lg" type="submit">
                {securityId ? "Update" : "Create"}
              </Button>
              <Button
                as={Link}
                to="../security-users"
                size="lg"
                className="mr-l-1"
              >
                Cancel
              </Button>
            </FlexboxGridItem>
          </FlexboxGrid>
        </Grid>
      </Form>
      <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
    </div>
  );
}

export default SecurityAddUser;
