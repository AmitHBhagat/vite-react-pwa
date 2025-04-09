import React, { forwardRef, useEffect, useState } from "react";
import {
  Row,
  Col,
  Button,
  Form,
  Grid,
  FlexboxGrid,
  Input,
  Uploader,
  Loader,
} from "rsuite";
import { useDispatch, useSelector } from "react-redux";
import { trackPromise } from "react-promise-tracker";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useFormik } from "formik";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import ErrorMessage, {
  PageErrorMessage,
} from "../../components/Form/ErrorMessage";
import { setRouteData } from "../../stores/appSlice";
import AuthService from "../../services/auth.service";
import { updateUserProfile } from "../../stores/store";
import AvatarIcon from "@rsuite/icons/legacy/Avatar";

function getFormSchema() {
  return {
    name: "",
    mobile: "",
    email: "",
    address: "",
  };
}

function getValidationSchema() {
  return Yup.object().shape({
    name: Yup.string().required("User Name is required"),
    mobile: Yup.string()
      .min(10, "Minimum 10 digits required")
      .max(10, "Maximum 10 digits allowed")
      .required("Phone is required"),
    email: Yup.string().email("Email is invalid").required("Email is required"),
    address: Yup.string().required("Address is required"),
  });
}

function ProfileEdit({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.authState);
  const [pageError, setPageError] = useState("");
  const [userProfile, setUserProfile] = useState({});
  const [frmSubmitted, setFrmSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const frmObj = useFormik({
    initialValues: getFormSchema(),
    validationSchema: getValidationSchema(),
    onSubmit: formSubmit,
  });

  useEffect(() => {
    if (authState.user?._id) fetchUserProfile();
  }, []);

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (userProfile?._id) {
      populateForm();
      if (userProfile.avatar?.url) {
        setFileList([
          {
            name: userProfile.avatar.title || "profile-image",
            fileKey: 1,
            url: userProfile.avatar.url,
          },
        ]);
      }
    }
  }, [userProfile]);

  function navigateBack() {
    navigate(-1);
  }

  function populateForm() {
    const formobj = { ...frmObj.values, ...userProfile };
    frmObj.setValues(formobj);
  }

  const fetchUserProfile = async () => {
    try {
      const resp = await trackPromise(AuthService.getProfile());
      const { data } = resp;
      if (data.success) {
        setUserProfile(data.user);
      }
    } catch (err) {
      const errMsg = err.response.data.message || "Error fetching profile";
      toast.error(errMsg);
      setPageError(errMsg);
      console.error("Error fetching profile", err);
    }
  };

  const handleFieldChange = (key) => (value) => {
    frmObj.setFieldValue(key, value);
  };

  async function formSubmit() {
    setFrmSubmitted(false);
    setPageError("");
    const payload = {
      ...frmObj.values,
      avatar:
        fileList.length > 0
          ? { url: fileList[0].url, title: fileList[0].name }
          : undefined,
    };
    try {
      const resp = await trackPromise(updateUserProfile(payload));
      fetchUserProfile();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Error updating profile";
      setPageError(errMsg);
      toast.error(errMsg);
      console.error("Profile update error", err);
    }
  }

  const handleUpload = async (fileList) => {
    if (fileList.length === 0) return;

    const file = fileList[fileList.length - 1];
    handleImageUpload(file);
  };

  const handleImageUpload = async (fileInfo) => {
    if (!fileInfo || !fileInfo.blobFile) {
      toast.error("Invalid file");
      return;
    }
    setUploading(true);
    setPageError("");
    const fileName = `${authState.user?.userId || "user"}___${fileInfo.name}`;
    const formData = new FormData();
    formData.append("fileurl", fileInfo.blobFile, fileName);

    try {
      const uploadResp = await trackPromise(
        AuthService.addProfileImage(formData, {
          headers: { "Content-Type": "multipart/form-data" },
          params: { timestamp: new Date().getTime() },
        })
      );
      const { data: uploadData } = uploadResp;

      if (!uploadData.success) {
        throw new Error(uploadData.message || "Image upload failed");
      }

      const image = uploadData.visitor[0];
      const imageUrl = image.location;

      const updatedProfileData = {
        ...userProfile,
        avatar: {
          url: imageUrl,
          title: image.originalname || fileName,
        },
      };

      await trackPromise(updateUserProfile(updatedProfileData));
      const newImage = {
        name: image.originalname || fileName,
        fileKey: fileInfo.fileKey || Date.now(),
        url: imageUrl,
      };
      setFileList([newImage]);
      setUploading(false);
    } catch (error) {
      setUploading(false);
      const errMsg =
        error.response?.data?.message || error.message || "Upload failed";
      toast.error(errMsg);
      setPageError(errMsg);
      console.error("Image upload error", error);
    }
  };

  return (
    <div className="thm-panel">
      <Form
        className=""
        fluid
        onSubmit={(event) => {
          setFrmSubmitted(true);
          frmObj.handleSubmit();
        }}
      >
        <Grid fluid className="">
          <Row gutter={20}>
            <Col xs={24} sm={12} xl={6}>
              <Uploader
                fileListVisible={false}
                listType="picture"
                multiple={false}
                autoUpload={false}
                accept="image/*"
                onChange={(fileList) => handleUpload(fileList)}
              >
                <button
                  type="button"
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: "50%",
                    overflow: "hidden",
                    position: "relative",
                    border: "2px solid #ddd",
                  }}
                >
                  {uploading && <Loader backdrop center />}
                  {fileList.length > 0 ? (
                    <img
                      src={fileList[0].url}
                      alt="Profile"
                      width="100%"
                      height="100%"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <AvatarIcon style={{ fontSize: 80, color: "#aaa" }} />
                  )}
                </button>
              </Uploader>
            </Col>

            <Col xs={24} sm={14} xl={8}>
              <Form.Group controlId="name">
                <Form.ControlLabel>User Name</Form.ControlLabel>
                <Form.Control
                  name="name"
                  placeholder="Enter User Name"
                  value={frmObj.values.name}
                  onChange={handleFieldChange("name")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.name}
                />
              </Form.Group>
            </Col>
            <Col xs={24} sm={10} xl={6}>
              <Form.Group controlId="mobile">
                <Form.ControlLabel>Mobile</Form.ControlLabel>
                <Form.Control
                  type="number"
                  name="mobile"
                  placeholder="Enter a Mobile"
                  value={frmObj.values.mobile}
                  onChange={handleFieldChange("mobile")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.mobile}
                />
              </Form.Group>
            </Col>
            <Col xs={24} sm={24} xl={14}>
              <Form.Group controlId="email">
                <Form.ControlLabel>Email</Form.ControlLabel>
                <Form.Control
                  name="email"
                  placeholder="Enter Society Email"
                  value={frmObj.values.email}
                  onChange={handleFieldChange("email")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.email}
                />
              </Form.Group>
            </Col>
            <Col xs={24} sm={24} xl={14}>
              <Form.Group controlId="address">
                <Form.ControlLabel>Address</Form.ControlLabel>
                <Form.Control
                  name="address"
                  placeholder="Enter Address"
                  accepter={Textarea}
                  rows="3"
                  value={frmObj.values.address}
                  onChange={handleFieldChange("address")}
                />
                <ErrorMessage
                  show={frmSubmitted}
                  msgText={frmObj.errors.address}
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

export default ProfileEdit;

const Textarea = forwardRef((props, ref) => (
  <Input as="textarea" ref={ref} {...props} />
));
