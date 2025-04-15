import React, { useState, useEffect, useRef, forwardRef } from "react";
import { Form, Button, Grid, Row, Col, Uploader, IconButton } from "rsuite";
import { trackPromise } from "react-promise-tracker";
import adminService from "../../../services/admin.service";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setRouteData } from "../../../stores/appSlice";
import { PiDownloadSimple } from "react-icons/pi";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";

import "./societyUser.css";

function UploadUser({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [pageError, setPageError] = useState("");
  const [fileList, setFileList] = React.useState([]);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  const handleFileChange = (fileList) => {
    if (fileList.length === 0) {
      setFileList([]);

      return;
    }
    const selectedFile = fileList[fileList.length - 1];
    setFileList([selectedFile]);
  };

  const handleSubmit = async (e) => {
    setPageError("");
    const formData = new FormData();
    formData.append("societyId", societyId);

    if (fileList.length > 0) {
      fileList.forEach((file) => {
        formData.append("file", file.blobFile || file);
      });
    }

    try {
      const resp = await trackPromise(
        adminService.uploadUser(formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      );

      const { data } = resp;
      if (data.success) {
        toast.success("Users Added successfully!");
        navigate(-1);
      } else {
        toast.error("Failed to upload file.");
      }
    } catch (err) {
      console.error("Users save error catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in  uploading the users`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
  };

  const handleDownloadSample = () => {
    const link = document.createElement("a");
    link.href = "public/templateFiles/bulk_upload_users.xlsx";
    link.download = "bulk_upload_users.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="thm-panel uploadContainer">
      <Form
        className=""
        fluid
        onSubmit={() => {
          handleSubmit();
        }}
      >
        <Grid fluid className="">
          <Row gutter={20}>
            <Col xs={24} md={12} lg={8} xl={8}>
              <Form.Group controlId="formFile">
                <Form.ControlLabel>Select File</Form.ControlLabel>

                <Uploader
                  fileList={fileList}
                  multiple={false}
                  onChange={handleFileChange}
                  autoUpload={false}
                  action=""
                >
                  <Button>Select file...</Button>
                </Uploader>
              </Form.Group>
            </Col>
            <Col xs={24} md={12} lg={8} xl={8}></Col>

            <Col xs={24} md={12} lg={8} xl={8} className="mr-b-1">
              <Button
                appearance="primary"
                size="lg"
                type="submit"
                disabled={!fileList.length}
              >
                Upload
              </Button>
              <Button
                as={Link}
                to="../member-user"
                size="lg"
                className="mr-l-1"
              >
                Cancel
              </Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <IconButton
                className="icon"
                icon={
                  <span className="uploadFile">
                    <span>Download Sample File</span>
                    <PiDownloadSimple />
                  </span>
                }
                onClick={handleDownloadSample}
              />
            </Col>
          </Row>
        </Grid>
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </Form>
    </div>
  );
}

export default UploadUser;
