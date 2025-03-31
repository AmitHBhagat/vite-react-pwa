import React, { useEffect, useState } from "react";
import { Row, Col, Button, Form, Grid, FlexboxGrid, InputGroup } from "rsuite";
import { useDispatch, useSelector } from "react-redux";
import { trackPromise } from "react-promise-tracker";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useFormik } from "formik";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import EyeIcon from "@rsuite/icons/legacy/Eye";
import EyeSlashIcon from "@rsuite/icons/legacy/EyeSlash";
import ErrorMessage, {
  PageErrorMessage,
} from "../../components/Form/ErrorMessage";
import { setRouteData } from "../../stores/appSlice";
import AdminService from "../../services/admin.service";
import { clearAppData } from "../../stores/store";
import { USER_ROLES } from "../../AppRoutes";

function getFormSchema() {
  return {
    oldPassword: "",
    newPassword: "",
    confirmNewPwd: "",
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    oldPassword: Yup.string()
      .min(6, "Password should be minimum ${min} characters")
      .required("Old Password is Required"),
    newPassword: Yup.string()
      .min(6, "Password should be minimum ${min} characters")
      .required("New Password is Required"),
    confirmNewPwd: Yup.string()
      .required("Password Confirmation is Required")
      .oneOf([Yup.ref("newPassword")], "Passwords do not match"),
  });
}

function ChangePassword({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.authState);
  const [pageError, setPageError] = useState("");
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const [hideNewPwd, setHideNewPwd] = useState(true);
  const [hideOldPwd, setHideOldPwd] = useState(true);
  const [hideConfPwd, setHideConfPwd] = useState(true);

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  function navigateBack() {
    navigate(-1);
  }

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function formSubmit() {
    setFrmSubmitted(false);
    setPageError("");
    const payload = {
      password: frmObj.values.newPassword,
      oldPassword: frmObj.values.oldPassword,
      userId: authState.user._id,
    };
    try {
      const resp = await trackPromise(AdminService.updatePassword(payload));
      if (resp?.data?.success) {
        toast.success("Password changed successfully!");
        clearAppData();
      }
    } catch (err) {
      console.error("Change password catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in changing the password`;
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
          <Row gutter={0}>
            <Col xs={24} sm={14} xl={8} xxl={6}>
              <Form.Group controlId="oldPassword">
                <Form.ControlLabel>Old Password</Form.ControlLabel>
                <InputGroup>
                  <Form.Control
                    type={hideOldPwd ? "password" : "text"}
                    name="oldPassword"
                    placeholder="Enter Old Password"
                    value={frmObj.values.oldPassword}
                    onChange={handleFieldChange("oldPassword")}
                  />
                  <InputGroup.Button
                    title={hideOldPwd ? "Show" : "Hide"}
                    onClick={() => setHideOldPwd(!hideOldPwd)}
                  >
                    {hideOldPwd ? <EyeIcon /> : <EyeSlashIcon />}
                  </InputGroup.Button>
                </InputGroup>
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.oldPassword}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row gutter={0}>
            <Col xs={24} sm={14} xl={8} xxl={6}>
              <Form.Group controlId="newPassword">
                <Form.ControlLabel>New Password</Form.ControlLabel>
                <InputGroup>
                  <Form.Control
                    type={hideNewPwd ? "password" : "text"}
                    name="newPassword"
                    placeholder="Enter New Password"
                    value={frmObj.values.newPassword}
                    onChange={handleFieldChange("newPassword")}
                  />
                  <InputGroup.Button
                    title={hideNewPwd ? "Show" : "Hide"}
                    onClick={() => setHideNewPwd(!hideNewPwd)}
                  >
                    {hideNewPwd ? <EyeIcon /> : <EyeSlashIcon />}
                  </InputGroup.Button>
                </InputGroup>
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.newPassword}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row gutter={0}>
            <Col xs={24} sm={14} xl={8} xxl={6}>
              <Form.Group controlId="confirmNewPwd">
                <Form.ControlLabel>Old Password</Form.ControlLabel>
                <InputGroup>
                  <Form.Control
                    type={hideConfPwd ? "password" : "text"}
                    name="confirmNewPwd"
                    placeholder="Enter Old Password"
                    value={frmObj.values.confirmNewPwd}
                    onChange={handleFieldChange("confirmNewPwd")}
                  />
                  <InputGroup.Button
                    title={hideConfPwd ? "Show" : "Hide"}
                    onClick={() => setHideConfPwd(!hideConfPwd)}
                  >
                    {hideConfPwd ? <EyeIcon /> : <EyeSlashIcon />}
                  </InputGroup.Button>
                </InputGroup>
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.confirmNewPwd}
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

export default ChangePassword;
