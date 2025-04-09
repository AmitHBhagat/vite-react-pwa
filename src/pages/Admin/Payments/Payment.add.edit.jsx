import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Grid,
  Row,
  Col,
  Checkbox,
  DatePicker,
  InputPicker,
  FlexboxGrid,
} from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import { useFormik } from "formik";
import * as Yup from "yup";
import { trackPromise } from "react-promise-tracker";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import flatService from "../../../services/flat.service";
import PaymentService from "../../../services/payment.service";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import {
  D_M_Y_DATE_FORMAT,
  PAYMENT_MODE,
  PAYMENT_TYPE,
} from "../../../utilities/constants";
import billingService from "../../../services/billing.service";

function AddEditPayment({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { paymentId } = useParams();
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [flats, setFlats] = useState([]);
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const [selectedFlat, setSelectedFlat] = useState({});
  const [pageError, setPageError] = useState("");

  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;
  function getFormSchema() {
    return {
      flatNo: "",
      flatId: selectedFlat[0]?._id || "",
      paymentType: "",
      paymentMode: "",
      transactionDetails: "",
      amount: 0,
      bankDetails: "",
      date: new Date(),
      societyId: "",
      status: false,
      year: String(new Date().getFullYear()),
    };
  }

  function getValidationSchema() {
    return Yup.object().shape({
      flatNo: Yup.string().required("Flat No. is required"),
      paymentType: Yup.string().required("Payment type is required"),
      paymentMode: Yup.string().required("Payment mode is required"),
      transactionDetails: Yup.string().required(
        "Transaction details is required"
      ),
      amount: Yup.number().required("Amount is required"),
    });
  }

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    if (paymentId) {
      fetchPaymentDetails(paymentId);
    }
  }, [paymentId]);

  useEffect(() => {
    if (societyId) {
      fetchFlats();
    }
  }, [societyId]);

  useEffect(() => {
    if (selectedFlat.length > 0) {
      frmObj.setFieldValue("flatId", selectedFlat[0]._id);
    }
  }, [selectedFlat]);

  useEffect(() => {
    if (paymentDetails._id) {
      populateForm();
    }
  }, [paymentDetails]);

  useEffect(
    () => {
      if (frmObj.values.paymentType === "Maintenance" && selectedFlat[0]?._id) {
        populateTotalAmount();
        return;
      }
      frmObj.setFieldValue("amount", 0);
    },
    [frmObj.values.flatNo, frmObj.values.paymentType],
    selectedFlat[0]?._id
  );
  function populateForm() {
    const formobj = {
      ...frmObj.values,
      ...paymentDetails,
      date: new Date(paymentDetails.date),
    };
    frmObj.setValues(formobj);
  }
  async function populateTotalAmount() {
    try {
      const resp = await trackPromise(
        billingService.getActiveBilling(societyId, selectedFlat[0]._id)
      );

      const { data } = resp;
      if (data.success) {
        frmObj.setFieldValue("amount", data?.billings?.totalAmount || 0);
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || `Error in fetching active billing`;

      toast.error(errMsg);
      console.error("Fetch active billing catch => ", errMsg);
      setPageError(errMsg);
    }
  }
  async function fetchPaymentDetails() {
    let paymentDetailArray = [];
    try {
      const resp = await trackPromise(
        PaymentService.getPaymentDetails(paymentId)
      );

      const { data } = resp;
      if (data.success) paymentDetailArray = data.paymentDetail;
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || `Error in fetching payment details`;
      toast.error(errMsg);
      console.error("Fetch payment details catch => ", errMsg);
      setPageError(errMsg);
    }
    setPaymentDetails(paymentDetailArray);
  }
  async function fetchFlats() {
    let flatsArray = [];
    try {
      const resp = await trackPromise(
        flatService.getFlatsBySocietyId(societyId)
      );

      const { data } = resp;
      if (data.success) flatsArray = data.flats;
    } catch (err) {
      const errMsg = err?.response?.data?.message || `Error in fetching flats`;
      toast.error(errMsg);
      console.error("Fetch payment details catch => ", errMsg);
      setPageError(errMsg);
    }
    setFlats(flatsArray);
  }

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
    if (key === "flatNo") {
      const SelectedFlat = flats.filter((flat) => {
        return flat.flatNo === value;
      });
      setSelectedFlat(SelectedFlat);
    }
  };
  const handleCheckboxChange = (key) => (boolean) => {
    frmObj.setFieldValue(key, boolean);
  };

  async function formSubmit() {
    setFrmSubmitted(false);
    const payload = { ...frmObj.values, societyId: societyId };

    try {
      const resp = paymentId
        ? await trackPromise(
            PaymentService.updatePaymentDetail(paymentId, payload)
          )
        : await trackPromise(PaymentService.addPaymentDetails(payload));
      const { data } = resp;

      if (data.success) {
        toast.success("Payment detail saved successfully!");
        navigate(-1);
      } else {
      }
    } catch (err) {
      console.error("Payment detail save error catch => ", err);
      toast.error(err.response.data.message);
    }
  }
  const flatNumbers = flats?.map((flat) => {
    return { label: flat.flatNo, value: flat.flatNo };
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
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="flatNo">
                <Form.ControlLabel className="mandatory-field">
                  Flat No. *
                </Form.ControlLabel>
                <InputPicker
                  block
                  name="flatNo"
                  data={flatNumbers}
                  placeholder="Select a flat number"
                  value={frmObj.values.flatNo}
                  onChange={handleFieldChange("flatNo")}
                />

                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.flatNo}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="paymentType">
                <Form.ControlLabel className="mandatory-field">
                  Payment Type *
                </Form.ControlLabel>
                <InputPicker
                  block
                  name="paymentType"
                  data={PAYMENT_TYPE}
                  placeholder="Select payment type"
                  value={frmObj.values.paymentType}
                  onChange={handleFieldChange("paymentType")}
                />

                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.paymentType}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="paymentMode">
                <Form.ControlLabel className="mandatory-field">
                  Payment Mode *
                </Form.ControlLabel>
                <InputPicker
                  block
                  name="paymentMode"
                  data={PAYMENT_MODE}
                  placeholder="Select payment mode"
                  value={frmObj.values.paymentMode}
                  onChange={handleFieldChange("paymentMode")}
                />

                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.paymentMode}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="transactionDetails">
                <Form.ControlLabel className="mandatory-field">
                  Transaction Details *
                </Form.ControlLabel>
                <Form.Control
                  name="transactionDetails"
                  placeholder="Enter a transaction details"
                  value={frmObj.values.transactionDetails}
                  onChange={handleFieldChange("transactionDetails")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.transactionDetails}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="amount">
                <Form.ControlLabel className="mandatory-field">
                  Amount *
                </Form.ControlLabel>
                <Form.Control
                  type="number"
                  name="amount"
                  placeholder="Enter a amount"
                  value={frmObj.values.amount}
                  onChange={handleFieldChange("amount")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.amount}
                />
              </Form.Group>
            </Col>

            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="bankDetails">
                <Form.ControlLabel>Bank Details</Form.ControlLabel>
                <Form.Control
                  name="bankDetails"
                  placeholder="Enter a bank details"
                  value={frmObj.values.bankDetails}
                  onChange={handleFieldChange("bankDetails")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.bankDetails}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="date">
                <Form.ControlLabel>Date</Form.ControlLabel>

                <DatePicker
                  block
                  oneTap
                  name="date"
                  value={frmObj.values.date}
                  onChange={(value) => frmObj.setFieldValue("date", value)}
                  format={D_M_Y_DATE_FORMAT}
                  ranges={[{ label: "Today", value: new Date() }]}
                  placeholder="Select Date"
                  onBlur={frmObj.handleBlur}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.ControlLabel>Active</Form.ControlLabel>
              <Form.Group className="status">
                <Checkbox
                  name="status"
                  onChange={(_, boolean) => {
                    handleCheckboxChange("status")(boolean);
                  }}
                  checked={frmObj.values.status}
                />
              </Form.Group>
            </Col>
          </Row>
          <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />

          <FlexboxGrid justify="end">
            <FlexboxGridItem>
              <Button appearance="primary" size="lg" type="submit">
                {paymentId ? "Update" : "Add"}
              </Button>
              <Button
                as={Link}
                to="/payments/details"
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

export default AddEditPayment;
