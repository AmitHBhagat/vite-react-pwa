import { useState, useEffect } from "react";
import {
  Form,
  Button,
  Grid,
  Row,
  Col,
  InputPicker,
  FlexboxGrid,
  Checkbox,
  DatePicker,
} from "rsuite";
import { useFormik } from "formik";
import * as Yup from "yup";
import { trackPromise } from "react-promise-tracker";
import flatService from "../../../services/flat.service";
import maintenanceMasterService from "../../../services/MaintenanceMaster.service";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import { FLAT_TYPE } from "../../../utilities/constants";

function AddFlatManagement({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { flatId } = useParams();
  const [pageError, setPageError] = useState("");
  const [flatDetails, setFlatDetails] = useState({});
  const [frmSubmitted, setFrmSubmitted] = useState(false);

  const [flatDeps, setFlatDeps] = useState([]);
  const [maintenanceType, setMaintenanceType] = useState("");
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  function getFormSchema(flatDetails = {}, flatId, societyId) {
    return {
      societyId: societyId,
      flatNo: flatDetails?.flatNo || "",
      ownerName: flatDetails?.ownerName || "",
      flatArea: flatDetails?.flatArea || "",
      flatType: flatDetails?.flatType || "Residential",
      otherCharges: flatDetails?.otherCharges || 0,
      otherChargesDescription: flatDetails?.otherChargesDescription || "",
      outStandingAmount: flatDetails?.outStandingAmount || 0,
      ebillSubscribed: flatDetails?.ebillSubscribed || true,
      isOnRent: flatDetails?.isOnRent || false,
      tenantName: flatDetails?.tenantName || "",
      tenantContactDetails: flatDetails?.tenantContactDetails || "",

      leaseStartDate: new Date(),
      leaseExpiryDate: new Date(),
      status: flatDetails?.status || true,
      billDependencies: flatId
        ? flatDetails?.billDependencies?.map((dep) => ({
            _id: dep?._id || "",
            depTitle: dep?.depTitle || "",
            depValue: dep?.depValue || 0,
            valType: dep?.valType || "",
            status: dep?.status || true,
            isDefault: dep?.isDefault || false,
            tag: dep?.tag || "",
          })) || []
        : flatDeps.map((dep) => ({
            _id: dep?._id || "",
            depTitle: dep?.depTitle || "",
            depValue: dep?.depValue || 0,
            valType: dep?.valType || "",
            status: dep?.status || true,
            isDefault: dep?.isDefault || false,
            tag: dep?.tag || "",
          })) || [],
    };
  }

  function getValidationSchema() {
    return Yup.object().shape({
      flatNo: Yup.string().required("Please enter a Flat No."),
      flatArea:
        maintenanceType === "OnArea"
          ? Yup.string().required("Please enter a Flat Area")
          : Yup.string(),

      ownerName: Yup.string()
        .min(1, "Your Owner Name must be at least 1 characters long")
        .max(50, "Your Owner Name must be max 50 characters long")
        .required("Please provide a Owner Name"),

      tenantName: Yup.string().when("isOnRent", {
        is: true,
        then: (schema) => schema.required("Tenant Name is required"),
        otherwise: (schema) => schema.nullable(),
      }),

      tenantContactDetails: Yup.string().when("isOnRent", {
        is: true,
        then: (schema) => schema.required("Tenant contact is required"),
        otherwise: (schema) => schema.nullable(),
      }),

      leaseStartDate: Yup.date()
        .when("isOnRent", (isOnRent, schema) => {
          if (isOnRent) return schema.required("Lease Start Date is required");
        })
        .max(
          Yup.ref("leaseExpiryDate"),
          "Start date can't be after the end date"
        ),
      leaseExpiryDate: Yup.date()
        .when("isOnRent", (isOnRent, schema) => {
          if (isOnRent) return schema.required("Lease Expiry Date is required");
        })
        .min(
          Yup.ref("leaseStartDate"),
          "End date can't be before Lease Start Date"
        ),
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
    if (flatId) {
      fetchFlatDetails(flatId);
    }
  }, [flatId]);

  useEffect(() => {
    if (societyId && !flatId) {
      getFlatDeps();
    }
    getMaintenanceByIdForMaintenanceType();
  }, [societyId]);

  useEffect(() => {
    if (flatDetails?._id) {
      populateForm();
    }
    if (flatDeps.length !== 0) {
      populateFormDependency();
    }
  }, [flatDetails, flatDeps]);

  function populateForm() {
    const formobj = {
      ...frmObj.values,

      ...flatDetails,
      leaseStartDate: new Date(flatDetails?.leaseStartDate),
      leaseExpiryDate: new Date(flatDetails?.leaseExpiryDate),
    };
    frmObj.setValues(formobj);
  }
  function populateFormDependency() {
    const formobj = {
      ...frmObj.values,

      billDependencies: flatDeps,
      leaseStartDate: new Date(),
      leaseExpiryDate: new Date(),
    };
    frmObj.setValues(formobj);
  }

  async function fetchFlatDetails() {
    setPageError("");
    let flatDetails = {};
    try {
      const resp = await trackPromise(flatService.getFlatById(flatId));
      const { data } = resp;
      if (data.success) flatDetails = data.flat;
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || "Error in fetching flat details";
      toast.error(errMsg);
      console.error("Fetch Flats catch => ", errMsg);
      setPageError(errMsg);
    }
    setFlatDetails(flatDetails);
  }

  async function getMaintenanceByIdForMaintenanceType() {
    setPageError("");
    let maintenanceType;
    try {
      const resp = await trackPromise(
        maintenanceMasterService.getMaintenanceById(societyId)
      );

      const { data } = resp;
      if (data.success) maintenanceType = data?.maintenance[0]?.maintenanceType;
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || "Error in fetching maintenance type";
      toast.error(errMsg);
      console.error("Fetch maintenance type catch => ", err);
      setPageError(errMsg);
    }
    setMaintenanceType(maintenanceType);
  }
  async function getFlatDeps() {
    setPageError("");
    let flatDeps = [];
    try {
      const resp = await trackPromise(
        maintenanceMasterService.getFlatDepsBySocietyId(societyId)
      );
      const { data } = resp;
      if (data.success) flatDeps = data.flatDeps;
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || "Error in fetching flat dependency";
      toast.error(errMsg);
      console.error("Fetch Flats catch => ", err);
      setPageError(errMsg);
    }
    setFlatDeps(flatDeps);
  }
  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  const handleCheckboxChange = (key) => (boolean, event) => {
    frmObj.setFieldValue(key, boolean);
  };

  async function formSubmit() {
    setFrmSubmitted(false);
    setPageError("");
    const payload = { ...frmObj.values, societyId };

    try {
      const resp = flatId
        ? await trackPromise(flatService.updateFlat(flatId, payload))
        : await trackPromise(flatService.createFlat(payload));
      const { data } = resp;

      if (data.success) {
        toast.success("Flat saved successfully!");
        navigate(-1);
      } else {
      }
    } catch (err) {
      console.error("Flat save error catch => ", err);
      const errMsg =
        err?.response?.data?.message ||
        `Error in ${flatId ? "updating" : "creating"} Flat`;
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
              <Form.Group controlId="flatNo">
                <Form.ControlLabel className="mandatory-field">
                  Flat No *
                </Form.ControlLabel>
                <Form.Control
                  type="number"
                  name="flatNo"
                  placeholder="Enter a Flat No."
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
              <Form.Group controlId="ownerName">
                <Form.ControlLabel className="mandatory-field">
                  Owner Name *
                </Form.ControlLabel>
                <Form.Control
                  name="ownerName"
                  placeholder="Enter a Owner Name"
                  value={frmObj.values.ownerName}
                  onChange={handleFieldChange("ownerName")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.ownerName}
                />
              </Form.Group>
            </Col>

            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group>
                <Form.ControlLabel>Flat Area (Sq.ft)</Form.ControlLabel>
                <Form.Control
                  name="flatArea"
                  placeholder="Enter a Flat Area"
                  value={frmObj.values.flatArea}
                  onChange={handleFieldChange("flatArea")}
                />

                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.flatArea}
                />
              </Form.Group>
            </Col>

            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group>
                <Form.ControlLabel>Flat Type</Form.ControlLabel>

                <InputPicker
                  block
                  data={FLAT_TYPE}
                  name="flatType"
                  value={frmObj.values.flatType}
                  onChange={handleFieldChange("flatType")}
                  cleanable={false}
                />
              </Form.Group>
            </Col>

            {frmObj?.values?.billDependencies?.map((dep, index) => {
              if (frmObj?.values?.isOnRent && dep.tag === "nocCharges") {
                return (
                  <Col key={dep.id} xs={24} md={12} lg={8} xl={6}>
                    <Form.Group>
                      <Form.ControlLabel className="mb-b-0">
                        &nbsp;
                      </Form.ControlLabel>
                      <Checkbox
                        checked={dep.depValue}
                        id={`val-billDependencies-${index}`}
                        name={`billDependencies[${index}].depValue`}
                        onChange={(_, boolean) => {
                          handleCheckboxChange(
                            `billDependencies[${index}].depValue`
                          )(boolean);
                        }}
                      >
                        {dep.depTitle}
                      </Checkbox>
                    </Form.Group>
                  </Col>
                );
              }
            })}
            {frmObj?.values?.billDependencies?.map((dep, index) => {
              if (dep.valType === "Boolean" && dep.tag !== "nocCharges") {
                return (
                  <Col key={dep.id} xs={24} md={12} lg={8} xl={6}>
                    <Form.Group>
                      <Checkbox
                        checked={dep.depValue}
                        id={`val-billDependencies-${index}`}
                        name={`billDependencies[${index}].depValue`}
                        onChange={(_, boolean) =>
                          handleCheckboxChange(
                            `billDependencies[${index}].depValue`
                          )(boolean)
                        }
                      >
                        {dep.depTitle}
                      </Checkbox>
                    </Form.Group>
                  </Col>
                );
              }

              return null;
            })}
            {frmObj?.values?.billDependencies?.map((dep, index) => {
              if (dep.valType === "String" && dep.tag !== "nocCharges") {
                return (
                  <Col key={dep.id} xs={24} md={12} lg={8} xl={6}>
                    <Form.Group>
                      <Form.ControlLabel>{dep.depTitle}</Form.ControlLabel>
                      <Form.Control
                        type="text"
                        placeholder={`Enter ${dep.depTitle}`}
                        name={`billDependencies[${index}].depValue`}
                        onChange={handleFieldChange(
                          `billDependencies[${index}].depValue`
                        )}
                        value={dep.depValue}
                      />
                    </Form.Group>
                  </Col>
                );
              }

              return null;
            })}
            {frmObj?.values?.billDependencies?.map((dep, index) => {
              if (dep.valType === "Number" && dep.tag !== "nocCharges") {
                return (
                  <Col key={dep.id} xs={24} md={12} lg={8} xl={6}>
                    <Form.Group>
                      <Form.ControlLabel>{dep.depTitle}</Form.ControlLabel>
                      <Form.Control
                        type="number"
                        placeholder={`Enter ${dep.depTitle}`}
                        name={`billDependencies[${index}].depValue`}
                        onChange={handleFieldChange(
                          `billDependencies[${index}].depValue`
                        )}
                        value={dep.depValue}
                      />
                    </Form.Group>
                  </Col>
                );
              }

              return null;
            })}
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group>
                <Form.ControlLabel>Other Charges</Form.ControlLabel>
                <Form.Control
                  name="otherCharges"
                  type="number"
                  value={frmObj.values.otherCharges}
                  onChange={handleFieldChange("otherCharges")}
                />
              </Form.Group>
            </Col>

            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group>
                <Form.ControlLabel>Other Charges Description</Form.ControlLabel>
                <Form.Control
                  name="otherChargesDescription"
                  value={frmObj.values.otherChargesDescription}
                  onChange={handleFieldChange("otherChargesDescription")}
                  placeholder="Enter a Other Charges Description"
                />
              </Form.Group>
            </Col>

            {!flatId && (
              <Col xs={24} md={12} lg={8} xl={6}>
                <Form.Group>
                  <Form.ControlLabel>Outstanding Amount</Form.ControlLabel>
                  <Form.Control
                    name="outStandingAmount"
                    type="number"
                    value={frmObj.values.outStandingAmount}
                    onChange={handleFieldChange("outStandingAmount")}
                  />
                </Form.Group>
              </Col>
            )}
          </Row>
          <Row gutter={20}>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group>
                <Checkbox
                  name="ebillSubscribed"
                  checked={frmObj.values.ebillSubscribed}
                  onChange={(_, boolean) =>
                    handleCheckboxChange("ebillSubscribed")(boolean)
                  }
                >
                  Interested In Ebill
                </Checkbox>
              </Form.Group>
            </Col>

            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group>
                <Checkbox
                  name="isOnRent"
                  checked={frmObj.values.isOnRent}
                  onChange={(_, boolean) =>
                    handleCheckboxChange("isOnRent")(boolean)
                  }
                >
                  Is On Rent
                </Checkbox>
              </Form.Group>
            </Col>

            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group>
                <Checkbox
                  name="status"
                  checked={frmObj.values.status}
                  onChange={(_, boolean) =>
                    handleCheckboxChange("status")(boolean)
                  }
                >
                  Active
                </Checkbox>
              </Form.Group>
            </Col>
          </Row>
          <Row gutter={20}>
            {frmObj.values.isOnRent && (
              <>
                <Col xs={24} md={12} lg={8} xl={6}>
                  <Form.Group>
                    <Form.ControlLabel>Tenant Name</Form.ControlLabel>
                    <Form.Control
                      name="tenantName"
                      value={frmObj.values.tenantName}
                      onChange={handleFieldChange("tenantName")}
                      placeholder="Enter a Tenant Name"
                    />
                    {/* {errors.tenantName && touched.tenantName && ( */}
                    <ErrorMessage
                      show={frmSubmitted}
                      msgText={frmObj.errors.tenantName}
                    />
                  </Form.Group>
                </Col>

                <Col xs={24} md={12} lg={8} xl={6}>
                  <Form.Group>
                    <Form.ControlLabel>
                      Tenant Contact Details
                    </Form.ControlLabel>
                    <Form.Control
                      name="tenantContactDetails"
                      value={frmObj.values.tenantContactDetails}
                      onChange={handleFieldChange("tenantContactDetails")}
                      placeholder="Enter a Tenant Contact"
                    />
                    <ErrorMessage
                      show={frmSubmitted}
                      msgText={frmObj.errors.tenantContactDetails}
                    />
                  </Form.Group>
                </Col>

                <Col xs={24} md={12} lg={8} xl={6}>
                  <Form.Group>
                    <Form.ControlLabel>Lease Start Date</Form.ControlLabel>
                    <DatePicker
                      block
                      oneTap
                      name="leaseStartDate"
                      value={frmObj.values.leaseStartDate}
                      onChange={(value) =>
                        frmObj.setFieldValue("leaseStartDate", value)
                      }
                      format="dd-MM-yyyy"
                      ranges={[{ label: "Today", value: new Date() }]}
                      placeholder="Select Date & Time"
                    />
                    <ErrorMessage
                      show={frmSubmitted}
                      msgText={frmObj.errors.leaseStartDate}
                    />
                  </Form.Group>
                </Col>

                <Col xs={24} md={12} lg={8} xl={6}>
                  <Form.Group>
                    <Form.ControlLabel>Lease Expiry Date</Form.ControlLabel>
                    <DatePicker
                      block
                      oneTap
                      value={frmObj.values.leaseExpiryDate}
                      onChange={(value) =>
                        frmObj.setFieldValue("leaseExpiryDate", value)
                      }
                      format="dd-MM-yyyy"
                      ranges={[{ label: "Today", value: new Date() }]}
                      placeholder="Select Date & Time"
                    />
                    <ErrorMessage
                      show={frmSubmitted}
                      msgText={frmObj.errors.leaseExpiryDate}
                    />
                  </Form.Group>
                </Col>
              </>
            )}
          </Row>
          <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />

          <FlexboxGrid justify="end">
            <FlexboxGridItem>
              <Button appearance="primary" size="lg" type="submit">
                {flatId ? "Update" : "Create"}
              </Button>
              <Button
                as={Link}
                to="../flat-management"
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

export default AddFlatManagement;
