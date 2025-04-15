import React, { useState, useEffect, useRef, forwardRef } from "react";
import { Form, Button, Grid, Row, Col, Uploader, IconButton } from "rsuite";

import { trackPromise } from "react-promise-tracker";
import SocietyService from "../../../services/society.service";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ErrorMessage, {
  PageErrorMessage,
} from "../../../components/Form/ErrorMessage";
import { setRouteData } from "../../../stores/appSlice";
import CameraRetroIcon from "@rsuite/icons/legacy/CameraRetro";
import "./society.css";

function AddSocietyImage({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [pageError, setPageError] = useState("");
  const [societyInfo, setSocietyInfo] = useState({});
  const [previewImage, setPreviewImage] = useState();
  const [fileList, setFileList] = React.useState([]);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (societyId) {
      fetchSocietyInfo();
    }
  }, [societyId]);

  const fetchSocietyInfo = async () => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(SocietyService.getSocietyById(societyId));
      const { data } = resp;
      if (data.success) {
        respdata = data.society.societyName;
      }
    } catch (err) {
      console.error("Society information fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching society information`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setSocietyInfo(respdata);
  };

  const handleFileChange = (fileList) => {
    if (fileList.length === 0) {
      setFileList([]);
      setPreviewImage(null);
      return;
    }
    const selectedFile = fileList[fileList.length - 1];
    setFileList([selectedFile]);
    setPreviewImage(URL.createObjectURL(selectedFile.blobFile));
  };

  const handleSubmit = async (e) => {
    setPageError("");
    const societyId = authState?.user?.societyName;
    const rename_file = `${societyInfo}___${fileList[0]?.blobFile?.name}`;

    const formData = new FormData();

    if (fileList.length > 0) {
      fileList.forEach((file) => {
        formData.append("fileurl", file.blobFile || file, rename_file);
      });
    }

    try {
      const resp = await trackPromise(
        SocietyService.createSocietyImage(societyId, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      );

      const { data } = resp;
      if (data.success) {
        toast.success("Society Image Added successfully!");
        navigate(-1);
      } else {
        toast.error("Failed to upload file.");
      }
    } catch (err) {
      console.error("Society image save error catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in  creating the Society Image`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
  };

  return (
    <div className="thm-panel addImageContainer">
      <Form
        className=""
        fluid
        onSubmit={() => {
          handleSubmit();
        }}
      >
        <Grid fluid className="">
          <Row gutter={20}>
            <Col xs={24} md={12} lg={8} xl={6}>
              <Form.Group controlId="formFile">
                <Form.ControlLabel>Select Image</Form.ControlLabel>

                <Uploader
                  name="socImages"
                  fileList={fileList}
                  multiple={false}
                  onChange={handleFileChange}
                  autoUpload={false}
                  accept=".jpg, .jpeg, .png"
                >
                  <IconButton
                    icon={<CameraRetroIcon className="large-icon" />}
                  />
                </Uploader>
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}></Col>
            <Col xs={24} md={12} lg={8} xl={6}></Col>

            <Col xs={24} md={12} lg={8} xl={6}>
              <Button
                appearance="primary"
                size="lg"
                type="submit"
                disabled={fileList.length === 0}
              >
                Upload
              </Button>
              <Button
                as={Link}
                to="../society-images"
                size="lg"
                className="mr-l-1"
              >
                Cancel
              </Button>
            </Col>
          </Row>
          <Row>
            {previewImage && (
              <div className="society-image">
                <img className="preview" src={previewImage} alt="Preview" />
              </div>
            )}
          </Row>
        </Grid>
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </Form>
    </div>
  );
}

export default AddSocietyImage;
