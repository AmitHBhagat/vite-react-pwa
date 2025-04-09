import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import EyeIcon from "@rsuite/icons/legacy/Eye";
import EyeSlashIcon from "@rsuite/icons/legacy/EyeSlash";
import {
  Modal,
  Button,
  Panel,
  Form,
  FlexboxGrid,
  Input,
  InputGroup,
  Tabs,
} from "rsuite";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { trackPromise } from "react-promise-tracker";
import * as Yup from "yup";
import { useFormik } from "formik";
import AdminService from "../../services/admin.service";
import UserService from "../../services/user.service";
import { setAuth, setToken, setUser } from "../../stores/authSlice";
import {
  clearAppData,
  fetchUserNotifications,
  fetchUserFlats,
  setLocalData,
} from "../../stores/store";
import { THEME } from "../../utilities/theme";
import ErrorMessage, { PageErrorMessage } from "../Form/ErrorMessage";
import "./auth.css";

const getValidationSchema = (activeKey) => {
  return Yup.object().shape({
    userName:
      activeKey === "admin"
        ? Yup.string().required("Username is required.")
        : Yup.string(),
    password:
      activeKey === "admin"
        ? Yup.string()
            .min(8, "Password must be at least 8 characters")
            .required("Password is required.")
        : Yup.string(),
    mobile:
      activeKey === "member"
        ? Yup.string()
            .required("Phone number is required.")
            .length(10, "Phone number should be 10 digits")
        : Yup.string(),
    otp:
      activeKey === "member"
        ? Yup.string()
            .required("OTP Code is required.")
            .length(6, "OTP Code should be 6 digits")
        : Yup.string(),
    session_id:
      activeKey === "member"
        ? Yup.string().required("OTP Session_id is required.")
        : Yup.string(),
  });
};

const LoginModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [backdrop, setBackdrop] = useState("static");
  const [activeKey, setActiveKey] = useState("admin");
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [disablePhone, setDisablePhone] = useState(false);
  const [sendOtp, setSendOtp] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleModalClose = () => {
    resetForm();
    setServerError("");
    onClose();
    setActiveKey("admin");
    setDisablePhone(false);
    setSendOtp(false);
    setShowOtp(false);
  };

  useEffect(() => {
    if (open) {
    }
  }, [open]);

  const { values, errors, setFieldValue, handleSubmit, resetForm } = useFormik({
    initialValues: {
      userName: "",
      password: "",
      mobile: "",
      otp: "",
      session_id: "",
    },
    validationSchema: getValidationSchema(activeKey),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: formSubmit,
  });

  const handleTabSelect = (key) => {
    setActiveKey(key);
    resetForm();
    setPasswordVisible(false);
    setServerError("");
    setFrmSubmitted(false);
  };

  function handlePhoneChange(phNumb) {
    setFieldValue("mobile", phNumb);
    if (phNumb?.length === 10) {
      setSendOtp(true);
    } else {
      setSendOtp(false);
    }
  }

  async function handleSendOtp() {
    if (import.meta.env.DEV) {
      setDisablePhone(true);
      setFieldValue("session_id", "dummySessionId");
      setShowOtp(true);
      setSendOtp(false);
      return;
    }

    setServerError("");
    try {
      setLoading(true);
      const resp = await trackPromise(UserService.sendOTP(values.mobile));
      setLoading(false);
      if (resp?.data?.success) {
        const { sessionId } = resp.data;
        setDisablePhone(true);
        setFieldValue("session_id", sessionId);
        setShowOtp(true);
        setSendOtp(false);
        toast.success(`Enter OTP sent to the phone ${values.mobile}`);
      } else {
        const errMsg = `Server error in sending OTP to the phone ${values.mobile}`;
        toast.error(errMsg);
        setServerError(errMsg);
      }
    } catch (error) {
      setLoading(false);
      const errMsg =
        error?.response?.data?.message ||
        `Error in sending OTP to the phone ${values.mobile}`;
      toast.error(errMsg);
      setServerError(errMsg);
      clearAppData();
    }
  }

  async function formSubmit(values) {
    setFrmSubmitted(false);
    setServerError("");
    try {
      setLoading(true);
      const resp =
        activeKey === "admin"
          ? await trackPromise(AdminService.login(values))
          : await trackPromise(
              UserService.verifyOTP({
                ...values,
                isTestMode: import.meta.env.DEV,
              })
            );
      setLoading(false);
      if (resp?.data?.success) {
        const { token, user } = resp.data;
        dispatch(setToken({ token }));
        dispatch(setAuth({ isAuthenticated: true }));
        dispatch(setUser({ user }));
        setLocalData({
          authToken: token,
          user,
        });
        await fetchUserFlats(user);
        await fetchUserNotifications(user);
        handleModalClose();
      } else {
        const errMsg = "Server error in logging in";
        toast.error(errMsg);
        setServerError(errMsg);
      }
    } catch (error) {
      setLoading(false);
      const errMsg = error?.response?.data?.message || "Error in logging in";
      toast.error(errMsg);
      setServerError(errMsg);
      clearAppData();
    }
  }

  return (
    <Modal
      backdrop={backdrop}
      open={!!open}
      onClose={handleModalClose}
      size="xs"
      className="login-modal"
    >
      <Modal.Header>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FlexboxGrid>
          <FlexboxGrid.Item colspan={24}>
            <Panel bordered>
              <Tabs
                className="login-tab"
                activeKey={activeKey}
                onSelect={handleTabSelect}
              >
                <Tabs.Tab eventKey="admin" title="Admin">
                  <Form
                    fluid
                    onSubmit={() => {
                      setFrmSubmitted(true);
                      handleSubmit();
                    }}
                  >
                    <Form.Group>
                      <Form.ControlLabel>Username</Form.ControlLabel>
                      <Input
                        name="text"
                        value={values.userName}
                        onChange={(value) => setFieldValue("userName", value)}
                      />
                      <ErrorMessage
                        show={frmSubmitted}
                        msgText={errors.userName}
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.ControlLabel>Password</Form.ControlLabel>
                      <InputGroup inside>
                        <Input
                          type={passwordVisible ? "text" : "password"}
                          name="password"
                          value={values.password}
                          onChange={(value) => setFieldValue("password", value)}
                        />
                        <InputGroup.Button
                          title={
                            passwordVisible ? "hide password" : "show password"
                          }
                          onClick={togglePasswordVisibility}
                        >
                          {passwordVisible ? <EyeIcon /> : <EyeSlashIcon />}
                        </InputGroup.Button>
                      </InputGroup>
                      <ErrorMessage
                        show={frmSubmitted}
                        msgText={errors.password}
                      />
                    </Form.Group>

                    <Button
                      className=""
                      appearance="primary"
                      type="submit"
                      block
                      loading={loading}
                    >
                      Login
                    </Button>
                  </Form>
                </Tabs.Tab>

                <Tabs.Tab eventKey="member" title="Member">
                  <Form fluid onSubmit={handleSubmit}>
                    <Form.Group>
                      <Form.ControlLabel>Phone</Form.ControlLabel>
                      <Input
                        name="mobile"
                        type="number"
                        value={values.mobile}
                        onChange={(value) => handlePhoneChange(value)}
                        disabled={disablePhone}
                      />
                      <ErrorMessage
                        show={frmSubmitted}
                        msgText={errors.mobile}
                      />
                    </Form.Group>

                    {sendOtp ? (
                      <div className="">
                        <Button
                          type="button"
                          appearance="primary"
                          onClick={handleSendOtp}
                          block
                          loading={loading}
                        >
                          Send OTP
                        </Button>
                      </div>
                    ) : (
                      <></>
                    )}

                    {showOtp ? (
                      <Form.Group>
                        <Form.ControlLabel>OPT</Form.ControlLabel>
                        <Input
                          name="otp"
                          type="number"
                          value={values.otp}
                          onChange={(value) => setFieldValue("otp", value)}
                        />
                        <ErrorMessage
                          show={frmSubmitted}
                          msgText={errors.otp}
                        />
                      </Form.Group>
                    ) : (
                      <></>
                    )}

                    {values.otp?.length === 6 ? (
                      <Button
                        className=""
                        appearance="primary"
                        type="submit"
                        block
                        loading={loading}
                      >
                        Login
                      </Button>
                    ) : (
                      <></>
                    )}
                  </Form>
                </Tabs.Tab>
              </Tabs>
            </Panel>
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </Modal.Body>

      <Modal.Footer>
        <FlexboxGrid justify="space-between">
          <FlexboxGrid.Item>
            <Button appearance="default" onClick={handleModalClose}>
              Cancel
            </Button>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item>
            <Link to="/forgot-password" onClick={handleModalClose}>
              <Button appearance="link" style={{ color: THEME[0].CLR_NEGATE }}>
                Forgot Password?
              </Button>
            </Link>
          </FlexboxGrid.Item>
        </FlexboxGrid>

        <PageErrorMessage
          show={Boolean(serverError)}
          msgText={serverError}
          wrapperClass="mr-t-1"
        />
      </Modal.Footer>
    </Modal>
  );
};

export default LoginModal;
