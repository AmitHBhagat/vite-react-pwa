import React, { useEffect } from "react";
import { forwardRef } from "react";
import {
  Modal,
  Button,
  InputPicker,
  Form,
  ButtonToolbar,
  Input,
  Grid,
  Row,
  Col,
  DatePicker,
} from "rsuite";
import { useFormik } from "formik";
import * as Yup from "yup";
import requestDemoService from "../../../services/requestDemo.service";
import { trackPromise } from "react-promise-tracker";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../../../components/Form/ErrorMessage";
const today = new Date();
today.setHours(0, 0, 0, 0);
const validationSchema = Yup.object().shape({
  status: Yup.string().required("Status is required"),
  feedback: Yup.string(),
  demoScheduledDate: Yup.date().when("status", {
    is: "Demo Scheduled",
    then: (schema) =>
      schema
        .required("Please Select Demo Schedule Date")
        .min(today, "Date cannot be in the past"),
    otherwise: (schema) => schema.nullable(),
  }),
});

const RequestDemoUpdateModal = ({
  itemId,
  isOpen,
  onClose,
  requestDemoDetails,
  setRequestDemoDetails,
  consentRequired = false,
  activeStatus = true,
  intentDisable = false,
}) => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      status: requestDemoDetails.status || "",
      feedback: requestDemoDetails.feedback || "",
      // demoScheduledDate: requestDemoDetails.demoScheduledDate || null,
      demoScheduledDate:
        requestDemoDetails.status === "Demo Scheduled" &&
        requestDemoDetails.demoScheduledDate
          ? new Date(requestDemoDetails.demoScheduledDate)
          : null,
      // demoScheduledDate: null || null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          ...requestDemoDetails,
          ...values,
          // Clear schedule date if not in Demo Scheduled status
          demoScheduledDate:
            values.status === "Demo Scheduled"
              ? values.demoScheduledDate.toISOString()
              : null,
        };

        const resp = await trackPromise(
          requestDemoService.updateRequestDemo(itemId, payload)
        );

        if (resp.data.success) {
          toast.success("Demo request updated successfully!");
          setRequestDemoDetails(payload);
          onClose();
          navigate(-1);
        }
      } catch (err) {
        console.error("Update error:", err);
        toast.error(
          err.response?.data?.message || "Failed to update demo request"
        );
      }
    },
  });

  useEffect(() => {
    if (isOpen) {
      formik.setValues({
        status: requestDemoDetails.status || "",
        feedback: requestDemoDetails.feedback || "",
        demoScheduledDate:
          requestDemoDetails.status === "Demo Scheduled"
            ? new Date(requestDemoDetails.demoScheduledDate)
            : null,
      });
    }
  }, [isOpen, requestDemoDetails]);

  const statusOptions = [
    "Demo Scheduled",
    "Demo Given",
    "Approval Pending",
    "Completed",
  ].map((item) => ({ label: item, value: item }));

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      className="thm-modal request-demo-modal"
    >
      <Modal.Header>
        <Modal.Title>Update Demo Request</Modal.Title>
      </Modal.Header>
      <Modal.Body className="request-demo-modal-body">
        <Form fluid onSubmit={formik.handleSubmit}>
          <Grid fluid>
            {/* First Row - Status and Schedule Date */}
            <Row gutter={5}>
              <Col xs={24} lg={12} md={12}>
                <Form.Group controlId="status">
                  <Form.ControlLabel>Status *</Form.ControlLabel>
                  <InputPicker
                    data={statusOptions}
                    block
                    name="status"
                    value={formik.values.status}
                    onChange={(value) => {
                      formik.setFieldValue("status", value);
                      // Reset schedule date when status changes
                      if (value !== "Demo Scheduled") {
                        formik.setFieldValue("demoScheduledDate", null);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    // placement="auto"
                    cleanable={false}
                  />
                  <ErrorMessage
                    show={formik.touched.status && !!formik.errors.status}
                    msgText={formik.errors.status}
                  />
                </Form.Group>
              </Col>

              {formik.values.status === "Demo Scheduled" && (
                <Col xs={24} lg={12} md={12}>
                  <Form.Group controlId="demoScheduledDate">
                    <Form.ControlLabel>Schedule Demo Date *</Form.ControlLabel>
                    <DatePicker
                      block
                      oneTap
                      name="demoScheduledDate"
                      value={formik.values.demoScheduledDate}
                      onChange={(value) =>
                        formik.setFieldValue("demoScheduledDate", value)
                      }
                      format="yyyy-MM-dd"
                      ranges={[{ label: "Today", value: new Date() }]}
                      placeholder="Select Date & Time"
                      onBlur={formik.handleBlur}
                    />
                    <ErrorMessage
                      show={
                        formik.touched.demoScheduledDate &&
                        !!formik.errors.demoScheduledDate
                      }
                      msgText={formik.errors.demoScheduledDate}
                    />
                  </Form.Group>
                </Col>
              )}
            </Row>

            {/* Second Row - Feedback */}
            <Row gutter={0}>
              <Col xs={24} lg={24} md={24}>
                <Form.Group controlId="feedback">
                  <Form.ControlLabel>Feedback</Form.ControlLabel>
                  <Form.Control
                    rows={5}
                    name="feedback"
                    accepter={Textarea}
                    value={formik.values.feedback}
                    onChange={(value) =>
                      formik.setFieldValue("feedback", value)
                    }
                    onBlur={formik.handleBlur}
                    placeholder="Enter feedback..."
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Form.Group className="send-request-button">
                <ButtonToolbar>
                  <Button
                    appearance="primary"
                    type="submit"
                    className="mr-3"
                    loading={formik.isSubmitting}
                  >
                    Send Request
                  </Button>
                </ButtonToolbar>
              </Form.Group>
            </Row>
          </Grid>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

const Textarea = forwardRef((props, ref) => (
  <Input as="textarea" ref={ref} {...props} />
));

export default RequestDemoUpdateModal;
