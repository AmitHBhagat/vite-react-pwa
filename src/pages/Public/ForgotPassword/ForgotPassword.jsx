import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Form,
  Input,
  Button,
  Tabs,
  Message,
  Col,
  Row,
  Container,
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import userService from "../../../services/user.service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setRouteData } from "../../../stores/appSlice";

const ForgotPassword = ({ pageTitle }) => {
  const [activeKey, setActiveKey] = useState("email");
  const [serverError, setServerError] = useState("");
  const [send, setSend] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (send) {
      navigate("/");
    }
  }, [send, navigate]);

  const validationSchema = Yup.object().shape({
    email:
      activeKey === "email"
        ? Yup.string().email("Invalid email").required("Email is required.")
        : Yup.string(),
    phone:
      activeKey === "phone"
        ? Yup.string()
            .required("Phone number is required.")
            .length(10, "Phone number should be 10 digits")
        : Yup.string(),
  });

  const { values, errors, handleSubmit, setFieldValue } = useFormik({
    initialValues: {
      email: "",
      phone: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload =
          activeKey === "email"
            ? { email: values.email }
            : { phone: values.phone };
        const resp = await trackPromise(userService.forgotPassword(payload));
        toast.success(resp.data.message);
        setSend(true);
        setServerError("");
      } catch (error) {
        toast.error(error?.response?.data?.message);
        serverError(error?.response?.data?.message);
      }
    },
  });

  const handleTabSelect = (key) => {
    setActiveKey(key);
    setFieldValue("email", "");
    setFieldValue("phone", "");
    setServerError("");
  };

  return (
    <Container className="forgot-bg">
      <Row>
        <Col xs={22} md={12} className="forgot-container">
          <div className="forgot-password-container">
            <h3>Forgot Password</h3>
            <Tabs activeKey={activeKey} onSelect={handleTabSelect}>
              <Tabs.Tab eventKey="email" title="Email">
                <Form fluid onSubmit={handleSubmit}>
                  <Form.Group>
                    <Form.ControlLabel>Email</Form.ControlLabel>
                    <Input
                      name="email"
                      value={values.email}
                      onChange={(value) => setFieldValue("email", value)}
                    />
                    {errors.email && (
                      <div className="error-messaaage">{errors.email}</div>
                    )}
                  </Form.Group>
                  <Button
                    className="btn-green"
                    appearance="primary"
                    type="submit"
                  >
                    Send Reset Link
                  </Button>
                </Form>
              </Tabs.Tab>

              <Tabs.Tab eventKey="phone" title="Phone">
                <Form fluid onSubmit={handleSubmit}>
                  <Form.Group>
                    <Form.ControlLabel>Phone</Form.ControlLabel>
                    <Input
                      name="phone"
                      value={values.phone}
                      onChange={(value) => setFieldValue("phone", value)}
                    />
                    {errors.phone && (
                      <div className="error-messaaage">{errors.phone}</div>
                    )}
                  </Form.Group>
                  <Button
                    className="btn-green"
                    appearance="primary"
                    type="submit"
                  >
                    Send Reset Link
                  </Button>
                </Form>
              </Tabs.Tab>
            </Tabs>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
