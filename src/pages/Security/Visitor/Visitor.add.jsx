import React, { useState, useEffect, forwardRef } from "react";
import {
  Form,
  Button,
  Grid,
  Row,
  Col,
  Input,
  FlexboxGrid,
  Uploader,
  InputPicker,
} from "rsuite";
import { useFormik } from "formik";
import * as Yup from "yup";
import { trackPromise } from "react-promise-tracker";
import VisitorService from "../../../services/visitor.service";
import FlatService from "../../../services/flat.service";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setRouteData } from "../../../stores/appSlice";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";

function VisitorAdd({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { visitorId } = useParams();
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;
  const [pageError, setPageError] = useState("");
  const [flats, setFlats] = useState([]);
  const [visitorDetails, setVisitorDetails] = useState({});
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const [fileList, setFileList] = useState([]);

  function getFormSchema() {
    return {
      societyId: societyId || "",
      flat: "",
      flatContact: "",
      description: "",
      visitorName: "",
      visitorPhone: "",
      visitorImage: null,
    };
  }

  function getValidationSchema() {
    return Yup.object().shape({
      flat: Yup.string().required("Flat is required"),
      flatContact: Yup.string()
        .min(10, "Your flat contact must be at least 10 numbers long")
        .max(10, "Your flat contact must be max 10 numbers long")
        .required("Flat contact is Required"),
      description: Yup.string().required("Description is required"),
      visitorName: Yup.string().required("Visitor name is required"),
      visitorPhone: Yup.string()
        .min(10, "Your visitor contact must be at least 10 numbers long")
        .max(10, "Your visitor contact must be max 10 numbers long")
        .required("Visitor contact is Required"),
      visitorImage: Yup.mixed().nullable(),
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
    if (visitorId) {
      fetchVisitorDetails(visitorId);
    }
  }, [visitorId]);

  useEffect(() => {
    if (visitorDetails?._id) {
      populateForm();
    }
  }, [visitorDetails]);

  useEffect(() => {
    if (societyId) {
      getAllFlats();
    }
  }, [societyId]);

  function populateForm() {
    const formObj = {
      ...getFormSchema(),
      ...visitorDetails,
      flat: visitorDetails.flat?._id || "",
    };
    frmObj.setValues(formObj);
    if (visitorDetails.visitorImage) {
      setFileList([
        {
          name: visitorDetails.visitorImage.title || "visitor-image",
          fileKey: 1,
          url: visitorDetails.visitorImage.fileurl,
        },
      ]);
    }
  }

  const getAllFlats = async () => {
    try {
      const resp = await trackPromise(
        FlatService.getFlatsBySocietyId(societyId)
      );
      const { data } = resp;
      if (data.success) {
        const flatOptions = data.flats.map((flat) => ({
          label: flat.flatNo,
          value: flat._id,
        }));
        setFlats(flatOptions);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Error fetching the flats";
      toast.error(errMsg);
      setPageError(errMsg);
      console.error("Error fetching the flats => ", err);
    }
  };

  const fetchVisitorDetails = async (visitorId) => {
    try {
      const resp = await trackPromise(
        VisitorService.getSingleVisitor(visitorId)
      );
      const { data } = resp;
      if (data.success) {
        const visitor = data.visitor;
        setVisitorDetails(visitor);
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "Error fetching the visitor";
      toast.error(errMsg);
      setPageError(errMsg);
      console.error("Fetch visitor details catch => ", err);
    }
  };

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function formSubmit(values) {
    setFrmSubmitted(true);

    let payload = {
      societyId: values.societyId,
      flat: values.flat,
      flatContact: values.flatContact,
      description: values.description,
      visitorName: values.visitorName,
      visitorPhone: values.visitorPhone,
      visitorImage: values.visitorImage,
    };

    if (fileList.length > 0 && fileList[0].blobFile instanceof File) {
      const file = fileList[0].blobFile;
      const rename_file = `${societyId}___${file?.name || "visitor-image"}`;

      const imgFormData = new FormData();
      imgFormData.append("fileurl", file, rename_file);

      try {
        const imgResp = await trackPromise(
          VisitorService.addVisitorImage(imgFormData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        );
        const { data } = imgResp;

        if (data.success) {
          const image = data.visitor[0];
          payload.visitorImage = {
            fileurl: image.location || image.fileurl,
            title: image.originalname || rename_file,
            mimetype: image.mimetype || file.type,
            contentType: image.contentType || "application/octet-stream",
          };
        } else {
          throw new Error("Image upload failed");
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || "Error uploading image";
        toast.error(errMsg);
        setPageError(errMsg);
        console.error("Image upload error => ", err);
        return;
      }
    }

    try {
      const resp = visitorId
        ? await trackPromise(VisitorService.updateVisitor(visitorId, payload))
        : await trackPromise(VisitorService.createVisitor(payload));
      const { data } = resp;
      if (data.success) {
        toast.success(
          `Visitor ${visitorId ? "updated" : "created"} successfully!`
        );
        navigate(-1);
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        `Error ${visitorId ? "updating" : "adding"} the visitor`;
      toast.error(errMsg);
      setPageError(errMsg);
      console.error(
        `Visitor ${visitorId ? "updating" : "adding"} error catch => `,
        err.response?.data
      );
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
            <Col xs={16} md={8}>
              <Form.Group controlId="flat">
                <Form.ControlLabel>Flat No</Form.ControlLabel>
                <InputPicker
                  data={flats}
                  searchable
                  placeholder="Select Flat"
                  value={frmObj.values.flat}
                  onChange={handleFieldChange("flat")}
                  style={{ width: "100%" }}
                  cleanable={false}
                  virtualized={false}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.flat}
                />
              </Form.Group>
            </Col>
            <Col xs={16} md={8}>
              <Form.Group controlId="flatContact">
                <Form.ControlLabel>Flat Contact</Form.ControlLabel>
                <Form.Control
                  name="flatContact"
                  placeholder="Enter Flat Contact"
                  type="number"
                  value={frmObj.values.flatContact}
                  onChange={handleFieldChange("flatContact")}
                  inputMode="numeric"
                  maxLength={10}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.flatContact}
                />
              </Form.Group>
            </Col>
            <Col xs={16} md={8}>
              <Form.Group controlId="description">
                <Form.ControlLabel>Description</Form.ControlLabel>
                <Form.Control
                  name="description"
                  accepter={Textarea}
                  placeholder="Enter Description"
                  value={frmObj.values.description}
                  onChange={handleFieldChange("description")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.description}
                />
              </Form.Group>
            </Col>
            <Col xs={16} md={8}>
              <Form.Group controlId="visitorName">
                <Form.ControlLabel>Visitor Name</Form.ControlLabel>
                <Form.Control
                  name="visitorName"
                  placeholder="Enter Visitor Name"
                  value={frmObj.values.visitorName}
                  onChange={handleFieldChange("visitorName")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.visitorName}
                />
              </Form.Group>
            </Col>
            <Col xs={16} md={8}>
              <Form.Group controlId="visitorPhone">
                <Form.ControlLabel>Visitor Phone</Form.ControlLabel>
                <Form.Control
                  name="visitorPhone"
                  placeholder="Enter Visitor Phone"
                  value={frmObj.values.visitorPhone}
                  type="number"
                  onChange={handleFieldChange("visitorPhone")}
                  inputMode="numeric"
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.visitorPhone}
                />
              </Form.Group>
            </Col>
            <Col xs={16} md={8}>
              <Form.Group controlId="visitorImage">
                <Form.ControlLabel>Visitor Image</Form.ControlLabel>
                <Uploader
                  autoUpload={false}
                  fileList={fileList}
                  onChange={(files) => setFileList(files.slice(-1))}
                  accept="image/*"
                  listType="picture-text"
                  multiple={false}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.visitorImage}
                />
              </Form.Group>
            </Col>
          </Row>

          <FlexboxGrid justify="end">
            <FlexboxGridItem>
              <Button appearance="primary" size="lg" type="submit">
                {visitorId ? "Update" : "Create"}
              </Button>
              <Button
                as={Link}
                to="../visitor-entries"
                size="lg"
                className="mr-l-1"
              >
                Cancel
              </Button>
            </FlexboxGridItem>
          </FlexboxGrid>
        </Grid>
      </Form>
      <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
    </div>
  );
}

const Textarea = forwardRef((props, ref) => (
  <Input as="textarea" ref={ref} {...props} />
));

export default VisitorAdd;
