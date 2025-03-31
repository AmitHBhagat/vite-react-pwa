import React, { useState, useEffect, forwardRef } from "react";
import {
  Form,
  Button,
  Grid,
  Row,
  Col,
  Checkbox,
  DatePicker,
  InputPicker,
  Input,
  FlexboxGrid,
  Table,
} from "rsuite";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import { useFormik } from "formik";
import * as Yup from "yup";
import { trackPromise } from "react-promise-tracker";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Column from "rsuite/esm/Table/TableColumn";
import { Cell, HeaderCell } from "rsuite-table";
import CheckOutlineIcon from "@rsuite/icons/CheckOutline";
import CloseOutlineIcon from "@rsuite/icons/CloseOutline";
import SocietyService from "../../../services/society.service";
import AmenityService from "../../../services/amenity.service";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage from "../../../components/Form/ErrorMessage";
import { MONTHS } from "../../../utilities/constants";
import { THEME } from "../../../utilities/theme";
import "./society.css";

function getFormSchema() {
  return {
    societyName: "",
    societyAddress: "",
    societyUrl: "",
    societyEmail: "",
    societyRegistrationNo: "",
    societyMembersCount: "",
    societyActivationYear: "",
    societyActivationMonth: "",
    societySubscriptionStartDate: new Date(),
    societySubscriptionEndDate: new Date(),
    status: true,
    amenties: [],
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    societyName: Yup.string().required("Society Name is required"),
    societyAddress: Yup.string().required("Society Address is required"),
    societyUrl: Yup.string().required("Society URL is required"),
    societyEmail: Yup.string().required("Society Email is required"),
    societyRegistrationNo: Yup.string().required(
      "Society Registration No. is required"
    ),
    societyMembersCount: Yup.number()
      .required("Society Members Count is required")
      .min(1, "Society Members must be a positive value"),
    societyActivationYear: Yup.string().required(
      "Society Activation Year is required"
    ),
    societyActivationMonth: Yup.string().required(
      "Society Activation Month is required"
    ),
    societySubscriptionStartDate: Yup.date().required(
      "Subscription Start Date is required"
    ),
    societySubscriptionEndDate: Yup.date()
      .required("Subscription End Date is required")
      .min(
        Yup.ref("societySubscriptionStartDate"),
        "End date can not be before Start date"
      ),
    status: Yup.boolean().required("Status is required"),
    amenties: Yup.array().of(Yup.string()),
  });
}

function SocietyInfoEdit({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.authState);
  const [societyId, setSocietyId] = useState("");
  const [pageError, setPageError] = useState("");
  const [societyInfo, setSocietyInfo] = useState({});
  const [amenityList, setAmenityList] = useState([]);
  const [frmSubmitted, setFrmSubmitted] = useState(false);

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    if (authState?.user?.societyName) {
      setSocietyId(authState.user.societyName);
    }
  }, [authState?.user?.societyName]);

  useEffect(() => {
    if (societyId) {
      fetchSocietyInfo(societyId);
    }
  }, [societyId]);

  useEffect(() => {
    if (societyInfo._id) {
      populateForm();
      fetchAmenities();
    }
  }, [societyInfo]);

  function navigateBack() {
    navigate(-1);
  }

  function populateForm() {
    const formobj = {
      ...frmObj.values,
      ...societyInfo,
      societySubscriptionStartDate: new Date(
        societyInfo.societySubscriptionStartDate
      ),
      societySubscriptionEndDate: new Date(
        societyInfo.societySubscriptionEndDate
      ),
      amenties: societyInfo.amenties.map((itm) => itm._id),
    };
    frmObj.setValues(formobj);
  }

  async function fetchSocietyInfo(societyid) {
    try {
      const resp = await trackPromise(SocietyService.getSocietyById(societyid));
      const { data } = resp;
      if (data.success) {
        setSocietyInfo(data.society);
      }
    } catch (err) {
      toast.error(err.response.data.message);
      console.error("Fetch society details catch => ", err);
    }
  }

  async function fetchAmenities() {
    try {
      const resp = await trackPromise(AmenityService.getAmenityList());
      const { data } = resp;
      if (data.success) {
        setAmenityList(
          data.amenities.map(
            (itm) => (
              (itm.isSelected = societyInfo.amenties.some(
                (amt) => amt._id === itm._id
              )),
              itm
            )
          )
        );
      }
    } catch (err) {
      toast.error(err.response.data.message);
      console.error("Fetch amenity list catch => ", err);
    }
  }

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  const onAmenityChecked = (id) => {
    setAmenityList(
      amenityList.map((itm) => {
        if (itm._id === id) itm.isSelected = !itm.isSelected;
        return itm;
      })
    );
  };

  async function formSubmit() {
    setFrmSubmitted(false);
    const payload = {
      ...frmObj.values,
      amenties: amenityList
        .filter((itm) => itm.isSelected)
        .map((itm) => itm._id),
    };
    try {
      const resp = await trackPromise(
        SocietyService.updateSociety(societyId, payload)
      );
      const { data } = resp;
      if (data.success) {
        toast.success("Society saved successfully!");
        navigateBack();
      } else {
      }
    } catch (err) {
      console.error("Society save error catch => ", err);
      toast.error(err.response.data.message);
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
            <Col xs={24} lg={8} xl={12}>
              <Form.Group controlId="societyName">
                <Form.ControlLabel>Society Name</Form.ControlLabel>
                <Form.Control
                  name="societyName"
                  placeholder="Enter Society Name"
                  value={frmObj.values.societyName}
                  onChange={handleFieldChange("societyName")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societyName}
                />
              </Form.Group>
            </Col>
            <Col xs={24} lg={16} xl={12}>
              <Form.Group controlId="societyAddress">
                <Form.ControlLabel>Society Address</Form.ControlLabel>
                <Form.Control
                  name="societyAddress"
                  placeholder="Enter Society Address"
                  accepter={Textarea}
                  rows="3"
                  value={frmObj.values.societyAddress}
                  onChange={handleFieldChange("societyAddress")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societyAddress}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="societyUrl">
                <Form.ControlLabel>Society URL</Form.ControlLabel>
                <Form.Control
                  name="societyUrl"
                  placeholder="Enter Society URL"
                  value={frmObj.values.societyUrl}
                  onChange={handleFieldChange("societyUrl")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societyUrl}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="societyEmail">
                <Form.ControlLabel>Society Email</Form.ControlLabel>
                <Form.Control
                  name="societyEmail"
                  placeholder="Enter Society Email"
                  value={frmObj.values.societyEmail}
                  onChange={handleFieldChange("societyEmail")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societyEmail}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="societyRegistrationNo">
                <Form.ControlLabel>Society Registration No.</Form.ControlLabel>
                <Form.Control
                  name="societyRegistrationNo"
                  placeholder="Enter Society Registration No."
                  value={frmObj.values.societyRegistrationNo}
                  onChange={handleFieldChange("societyRegistrationNo")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societyRegistrationNo}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="societyMembersCount">
                <Form.ControlLabel>Society Members Count</Form.ControlLabel>
                <Form.Control
                  name="societyMembersCount"
                  placeholder="Enter Society Members Count"
                  type="number"
                  value={frmObj.values.societyMembersCount}
                  onChange={handleFieldChange("societyMembersCount")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societyMembersCount}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="societyActivationYear">
                <Form.ControlLabel>Society Activation Year</Form.ControlLabel>
                <Form.Control
                  name="societyActivationYear"
                  placeholder="Enter Society Activation Year"
                  type="number"
                  value={frmObj.values.societyActivationYear}
                  onChange={handleFieldChange("societyActivationYear")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societyActivationYear}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="societyActivationMonth">
                <Form.ControlLabel>Society Activation Month</Form.ControlLabel>
                <InputPicker
                  block
                  name="societyActivationMonth"
                  placeholder="Enter Society Activation Month"
                  data={MONTHS}
                  value={frmObj.values.societyActivationMonth}
                  onChange={handleFieldChange("societyActivationMonth")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societyActivationMonth}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="societySubscriptionStartDate">
                <Form.ControlLabel>Subscription Start Date</Form.ControlLabel>
                <DatePicker
                  oneTap
                  block
                  name="societySubscriptionStartDate"
                  value={frmObj.values.societySubscriptionStartDate}
                  onChange={handleFieldChange("societySubscriptionStartDate")}
                  readOnly
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societySubscriptionStartDate}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="societySubscriptionEndDate">
                <Form.ControlLabel>Subscription End Date</Form.ControlLabel>
                <DatePicker
                  oneTap
                  block
                  name="societySubscriptionEndDate"
                  value={frmObj.values.societySubscriptionEndDate}
                  onChange={handleFieldChange("societySubscriptionEndDate")}
                  readOnly
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.societySubscriptionEndDate}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
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

          <Row gutter={0} className="mr-b-1">
            <Col xs={24}>
              <div className="content-title">Select Amenities</div>
            </Col>
            <Col xs={24}>
              <Table
                wordWrap="break-word"
                data={amenityList}
                autoHeight
                headerHeight={30}
                rowHeight={40}
                className="tbl-theme tbl-compact"
              >
                <Column width={150}>
                  <HeaderCell>Select</HeaderCell>
                  <Cell dataKey="webIcon">
                    {(rowData) => (
                      <Checkbox
                        value={rowData._id}
                        checked={rowData.isSelected}
                        onChange={onAmenityChecked}
                      />
                    )}
                  </Cell>
                </Column>
                <Column width={250}>
                  <HeaderCell>Name</HeaderCell>
                  <Cell dataKey="name" />
                </Column>
                <Column width={150} align="center">
                  <HeaderCell>Icon</HeaderCell>
                  <Cell dataKey="webIcon">
                    {(rowData) => <i className={`${rowData.webIcon} pr-2`}></i>}
                  </Cell>
                </Column>
                <Column width={150} align="center">
                  <HeaderCell>Status</HeaderCell>
                  <Cell dataKey="webIcon">
                    {(rowData) =>
                      rowData.status ? (
                        <CheckOutlineIcon color={THEME[0].CLR_AFFIRM} />
                      ) : (
                        <CloseOutlineIcon color={THEME[0].CLR_NEGATE} />
                      )
                    }
                  </Cell>
                </Column>
              </Table>
            </Col>
          </Row>

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
        {/* {pageError && <div>{pageError}</div>} */}
      </Form>
    </div>
  );
}

const Textarea = forwardRef((props, ref) => (
  <Input as="textarea" ref={ref} {...props} />
));

export default SocietyInfoEdit;
