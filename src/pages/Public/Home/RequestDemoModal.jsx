import { useState } from "react";
import { Modal, Button, Form, Grid, Row, Col, InputNumber } from "rsuite";
import { useFormik } from "formik";
import * as Yup from "yup";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import requestDemoService from "../../../services/requestDemo.service";
import { toast } from "react-toastify";
import { trackPromise } from "react-promise-tracker";
import "./home.css";

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(1, "Your username must consist of at least 1 characters ")
    .max(50, "Your username must consist of max 50 characters ")
    .required("Please enter a username"),
  mobile: Yup.string()
    .required("Please provide a mobile")
    .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  email: Yup.string()
    .email("Enter Valid Email")
    .required("Please provide a email"),
  societyName: Yup.string()
    .min(1, "Your societyname must be at least 1 characters long")
    .max(50, "Your societyname must be max 50 characters long")
    .required("Please provide a societyname"),
});

const RequestDemoModal = ({ isOpen, onClose }) => {
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const [pageError, setPageError] = useState("");
  const [loading, setLoading] = useState(false);

  const frmObj = useFormik({
    initialValues: {
      email: "",
      mobile: "",
      name: "",
      societyAddress: "",
      societyName: "",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function handleSubmit() {
    setPageError("");
    setLoading(true);
    const payload = { ...frmObj.values };
    try {
      const resp = await trackPromise(
        requestDemoService.sendRequestDemo(payload)
      );
      const { data } = resp;
      if (data.success) {
        toast.success("Request demo send successfully");
        onClose();
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || `Error in sending request demo`;
      toast.error(errMsg);
      console.error("Failed to sending request demo", errMsg);
      setPageError(errMsg);
    }
    setLoading(false);
  }
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      className="thm-modal request-demo-modal homepage-request-demo-modal"
    >
      <Modal.Header>
        <Modal.Title>Request a Demo</Modal.Title>
      </Modal.Header>
      <Modal.Body className="request-demo-modal-body">
        <Form
          className=""
          fluid
          onSubmit={() => {
            setFrmSubmitted(true);
            frmObj.handleSubmit();
          }}
        >
          <Grid fluid className="">
            <Row gutter={10}>
              <Col xs={24} md={24} lg={12}>
                <Form.Group>
                  <Form.ControlLabel>Full Name *</Form.ControlLabel>
                  <Form.Control
                    name="name"
                    placeholder="Enter full name"
                    value={frmObj.values.name}
                    onChange={handleFieldChange("name")}
                  />
                  <ErrorMessage
                    show={frmSubmitted}
                    msgText={frmObj.errors.name}
                  />
                </Form.Group>
              </Col>
              <Col xs={24} md={24} lg={12}>
                <Form.Group>
                  <Form.ControlLabel>Mobile no. *</Form.ControlLabel>
                  <Form.Control
                    name="mobile"
                    accepter={InputNumber}
                    placeholder="Enter mobile number"
                    value={frmObj.values.mobile}
                    onChange={handleFieldChange("mobile")}
                  />
                  <ErrorMessage
                    show={frmSubmitted}
                    msgText={frmObj.errors.mobile}
                  />
                </Form.Group>
              </Col>

              <Col xs={24} md={24} lg={12}>
                <Form.Group>
                  <Form.ControlLabel>Email *</Form.ControlLabel>
                  <Form.Control
                    name="email"
                    placeholder="Enter email"
                    value={frmObj.values.email}
                    onChange={handleFieldChange("email")}
                  />
                  <ErrorMessage
                    show={frmSubmitted}
                    msgText={frmObj.errors.email}
                  />
                </Form.Group>
              </Col>
              <Col xs={24} md={24} lg={12}>
                <Form.Group>
                  <Form.ControlLabel>Society Name *</Form.ControlLabel>
                  <Form.Control
                    name="societyName"
                    placeholder="Enter society name"
                    value={frmObj.values.societyName}
                    onChange={handleFieldChange("societyName")}
                  />
                  <ErrorMessage
                    show={frmSubmitted}
                    msgText={frmObj.errors.societyName}
                  />
                </Form.Group>
              </Col>
              <Col xs={24} md={24} lg={24}>
                <Form.Group>
                  <Form.ControlLabel>Society Address</Form.ControlLabel>
                  <Form.Control
                    name="societyAddress"
                    placeholder="Enter society address"
                    value={frmObj.values.societyAddress}
                    onChange={handleFieldChange("societyAddress")}
                  />
                  <ErrorMessage
                    show={frmSubmitted}
                    msgText={frmObj.errors.societyAddress}
                  />
                </Form.Group>
              </Col>

              <Col xs={24} md={24} lg={24}>
                <Form.Group className="txt-rgt">
                  <Button
                    appearance="primary"
                    align="center"
                    type="submit"
                    loading={loading}
                  >
                    Send Request
                  </Button>
                </Form.Group>
              </Col>
            </Row>
          </Grid>
        </Form>
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </Modal.Body>
    </Modal>
  );
};

export default RequestDemoModal;
