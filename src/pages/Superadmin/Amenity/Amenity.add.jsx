import React, { useState, useEffect, useRef, forwardRef } from "react";
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
  Dropdown,
} from "rsuite";
import { useFormik } from "formik";
import * as Yup from "yup";
import { trackPromise } from "react-promise-tracker";
import { useDispatch } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import "react-quill/dist/quill.snow.css";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import AmenityService from "../../../services/amenity.service";

function getFormSchema() {
  return {
    name: "",
    icon: "",
    webIcon: "",

    isActive: true,
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    name: Yup.string().required("Amenity Name is required"),
    icon: Yup.string().required("Icon  is required"),

    webIcon: Yup.string().required("Web Icon  is required"),

    isActive: Yup.boolean().required("Active status is required"),
  });
}

function AddAmenity({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { amenityId } = useParams();
  const [pageError, setPageError] = useState("");
  const [AmenityDetails, setAmenityDetails] = useState({});
  const [frmSubmitted, setFrmSubmitted] = useState(false);

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    if (amenityId) {
      fetchAmenityDetails(amenityId);
    }
  }, [amenityId]);

  useEffect(() => {
    if (AmenityDetails?._id) {
      populateForm();
    }
  }, [AmenityDetails]);

  function populateForm() {
    const formobj = {
      ...frmObj.values,
      ...AmenityDetails,
    };
    frmObj.setValues(formobj);
  }

  async function fetchAmenityDetails(amenityId) {
    setPageError("");
    let respData = [];
    try {
      const resp = await trackPromise(AmenityService.getAmenityById(amenityId));
      const { data } = resp;
      if (data.success) respData = data.amenity;
    } catch (err) {
      console.error("Amenity details fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching amenity details`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setAmenityDetails(respData);
  }

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function formSubmit() {
    setFrmSubmitted(false);
    const payload = { ...frmObj.values };
    try {
      const resp = amenityId
        ? await trackPromise(AmenityService.updateAmenity(amenityId, payload))
        : await trackPromise(AmenityService.createAmenity(payload));
      const { data } = resp;
      if (data.success) {
        toast.success("Amenity saved successfully!");
        navigate(-1);
      } else {
      }
    } catch (err) {
      console.error("Amenity save error catch => ", err);
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
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Form.Group controlId="name">
                <Form.ControlLabel className="mandatory-field">
                  Name *
                </Form.ControlLabel>
                <Form.Control
                  name="name"
                  placeholder="Enter a Name"
                  value={frmObj.values.name}
                  onChange={handleFieldChange("name")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.name}
                />
              </Form.Group>
            </Col>

            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Form.Group controlId="icon">
                <Form.ControlLabel className="mandatory-field">
                  Icon *
                </Form.ControlLabel>
                <Form.Control
                  name="icon"
                  placeholder="Enter a Icon"
                  value={frmObj.values.icon}
                  onChange={handleFieldChange("icon")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.icon}
                />
              </Form.Group>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Form.Group controlId="role">
                <Form.ControlLabel className="mandatory-field">
                  Web Icon *
                </Form.ControlLabel>

                <Form.Control
                  name="webIcon"
                  placeholder="fa fa-iconname"
                  value={frmObj.values.webIcon}
                  onChange={handleFieldChange("webIcon")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.webIcon}
                />
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div
                style={{
                  color: "red",
                  fontSize: "10px",
                  marginTop: "15px",
                }}
              >
                <span>Note: Add Icons from this{"  "}</span>
                <a
                  style={{
                    textDecoration: "underline",
                  }}
                  href="https://fontawesome.com/v4/icons/"
                  target="_blank"
                >
                  Icon Library
                </a>
                <div style={{ color: "grey" }}>
                  Paste only the icon name <br />
                  eg: fa fa-address-book
                </div>
              </div>
            </Col>
          </Row>
          <Row gutter={20}>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
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

          <FlexboxGrid justify="end">
            <FlexboxGridItem>
              <Button appearance="primary" size="lg" type="submit">
                {amenityId ? "Update" : "Create"}
              </Button>
              <Button
                as={Link}
                to="../amenity-lists"
                size="lg"
                className="mr-l-1"
              >
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

export default AddAmenity;
