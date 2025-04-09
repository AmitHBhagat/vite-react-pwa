import React, { useState, useEffect, forwardRef } from "react";
import {
  Form,
  Button,
  Grid,
  Row,
  Col,
  InputPicker,
  Input,
  FlexboxGrid,
  Checkbox,
  DatePicker,
} from "rsuite";
import { useFormik } from "formik";
import * as Yup from "yup";
import { trackPromise } from "react-promise-tracker";
import MeetingService from "../../../services/meeting.service";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { formats, modules } from "../../../utilities/reactQuill";
import { MEETING_TYPE } from "../../../utilities/constants";

function getFormSchema() {
  return {
    meetingType: "",
    meetingAgenda: "",
    meetingDate: new Date(),
    meetingMinutes: "",
    meetingResolution: "",
    status: true,
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    meetingType: Yup.string().required("Meeting Type is required"),
    meetingAgenda: Yup.string()
      .required("Meeting Agenda is required")
      .test(
        "is-not-empty",
        "Meeting Agenda cannot be empty",
        (value) => value && value.replace(/<[^>]*>?/gm, "").trim().length > 0
      ),
  });
}

function AddEditMeeting({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { meetingId } = useParams();

  const [pageError, setPageError] = useState("");
  const [meetingDetails, setMeetingDetails] = useState({});
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (meetingId) {
      fetchMeetingDetails(meetingId);
    }
  }, [meetingId]);

  useEffect(() => {
    if (meetingDetails?._id) {
      populateForm();
    }
  }, [meetingDetails]);

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  function populateForm() {
    const formobj = {
      ...frmObj.values,
      ...meetingDetails,
      meetingDate: new Date(meetingDetails.meetingDate),
    };
    frmObj.setValues(formobj);
  }

  async function fetchMeetingDetails(meetingId) {
    try {
      const resp = await trackPromise(MeetingService.getMeetingById(meetingId));
      const { data } = resp;
      if (data.success) {
        setMeetingDetails(data.meeting);
      }
    } catch (err) {
      toast.error(err.response.data.message || err.message);
      console.error("Fetch meeting  details catch => ", err);
    }
  }

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };
  // const handleFieldChange = (key) => (value) => {
  //   frmObj.setFieldValue(key, typeof value === "string" ? value.trim() : value);
  // };

  async function formSubmit() {
    setFrmSubmitted(false);
    setPageError("");
    const payload = { ...frmObj.values, societyId: societyId };

    try {
      const resp = meetingId
        ? await trackPromise(MeetingService.updateMeeting(meetingId, payload))
        : await trackPromise(MeetingService.createMeeting(payload));
      const { data } = resp;

      if (data.success) {
        toast.success("Meeting saved successfully!");
        navigate(-1);
      } else {
      }
    } catch (err) {
      console.error("Meeting save error catch => ", err);
      const errMsg =
        err?.response?.data?.message ||
        `Error in ${meetingId ? "updating" : "creating"} the meeting`;
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
            <Col xs={16} md={12}>
              <Form.Group controlId="title">
                <Form.ControlLabel className="mandatory-field">
                  Meeting Type *
                </Form.ControlLabel>

                <InputPicker
                  block
                  name="meetingType"
                  placeholder="Select meetingType"
                  data={MEETING_TYPE}
                  value={frmObj.values.meetingType}
                  onChange={handleFieldChange("meetingType")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.meetingType}
                />
              </Form.Group>
            </Col>
            <Col xs={16} md={12}>
              <Form.Group controlId="meetingDate">
                <Form.ControlLabel>Meeting Date</Form.ControlLabel>
                <DatePicker
                  oneTap
                  block
                  cleanable={false}
                  name="meetingDate"
                  value={frmObj.values.meetingDate}
                  format="dd/MM/yyyy hh:mm aa"
                  showMeridiem
                  onChange={handleFieldChange("meetingDate")}
                />

                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.meetingDate}
                />
              </Form.Group>
            </Col>

            <Col xs={16} md={12}>
              <Form.Group controlId="meetingAgenda">
                <Form.ControlLabel className="mandatory-field">
                  Meeting Agenda *
                </Form.ControlLabel>
                <Form.Control
                  name="meetingAgenda"
                  accepter={ReactQuill}
                  theme="snow"
                  value={frmObj.values.meetingAgenda}
                  onChange={handleFieldChange("meetingAgenda")}
                  modules={modules}
                  formats={formats}
                  placeholder="Write your description ..."
                  style={{ height: "15rem" }}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.meetingAgenda}
                />
              </Form.Group>
            </Col>
            {meetingId ? (
              <>
                <Col xs={16} md={12}>
                  <Form.Group controlId="meetingMinutes">
                    <Form.ControlLabel>Meeting Minutes</Form.ControlLabel>
                    <Form.Control
                      name="meetingMinutes"
                      accepter={ReactQuill}
                      theme="snow"
                      value={frmObj.values.meetingMinutes}
                      onChange={handleFieldChange("meetingMinutes")}
                      modules={modules}
                      formats={formats}
                      placeholder="Write your description ..."
                      style={{ height: "15rem" }}
                    />
                    <ErrorMessage
                      show={frmSubmitted}
                      msgText={frmObj.errors.meetingMinutes}
                    />
                  </Form.Group>
                </Col>
                <Col xs={16} md={12}>
                  <Form.Group controlId="meetingResolution">
                    <Form.ControlLabel>Meeting Resolution</Form.ControlLabel>
                    <Form.Control
                      name="meetingResolution"
                      accepter={ReactQuill}
                      theme="snow"
                      value={frmObj.values.meetingResolution}
                      onChange={handleFieldChange("meetingResolution")}
                      modules={modules}
                      formats={formats}
                      placeholder="Write your description ..."
                      style={{ height: "15rem" }}
                    />
                    <ErrorMessage
                      show={frmSubmitted}
                      msgText={frmObj.errors.meetingResolution}
                    />
                  </Form.Group>
                </Col>
              </>
            ) : (
              ""
            )}

            <Col xs={24} lg={16} xl={12}>
              <Form.Group controlId="status">
                <Form.ControlLabel>Is Active</Form.ControlLabel>
                <Form.Control
                  name="status"
                  accepter={Checkbox}
                  checked={frmObj.values.status}
                  onChange={(val, state) => handleFieldChange("status")(state)}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.status}
                />
              </Form.Group>
            </Col>
          </Row>
          <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />

          <FlexboxGrid justify="end">
            <FlexboxGrid.Item>
              <Button appearance="primary" size="lg" type="submit">
                {meetingId ? "Update" : "Create"}
              </Button>
              <Button as={Link} to="../meetings" size="lg" className="mr-l-1">
                Cancel
              </Button>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Grid>
      </Form>
    </div>
  );
}

export default AddEditMeeting;
