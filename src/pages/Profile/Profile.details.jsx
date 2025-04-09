import React, { useEffect, useState } from "react";
import { Row, Col, Button, Grid, FlexboxGrid, Uploader, Loader } from "rsuite";
import { useDispatch, useSelector } from "react-redux";
import { trackPromise } from "react-promise-tracker";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { setRouteData } from "../../stores/appSlice";
import AuthService from "../../services/auth.service";
import ScrollToTop from "../../utilities/ScrollToTop";
import { USER_ROLES } from "../../AppRoutes";
import { updateUserProfile } from "../../stores/store";
import AvatarIcon from "@rsuite/icons/legacy/Avatar";
import { PageErrorMessage } from "../../components/Form/ErrorMessage";

function ProfileDetails({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.authState);
  const [fileList, setFileList] = useState();
  const [isMemberUser, setIsMemberUser] = useState(
    authState.user?.role === USER_ROLES.user
  );
  const [userProfile, setUserProfile] = useState({});
  const [uploading, setUploading] = useState(false);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  const fetchUserProfile = async () => {
    try {
      const resp = await trackPromise(AuthService.getProfile());
      const { data } = resp;
      if (data.success) {
        const profile = isMemberUser ? data.user : data.user;

        setUserProfile(profile);
        if (profile.avatar?.url) {
          setFileList([
            {
              name: profile.avatar.title,
              fileKey: 1,
              url: profile.avatar.url,
            },
          ]);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching profile");
      console.error("Error fetching profile", error);
    }
  };

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
      // if (isMemberUser === "security") {
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
      // }
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
    <>
      <ScrollToTop />

      <div className="thm-panel">
        <FlexboxGrid justify="end" className="topfeaturebar">
          <FlexboxGrid.Item>
            {isMemberUser ? (
              <Button
                onClick={() => navigate("/profile/edit")}
                href=""
                appearance="primary"
                color="blue"
              >
                Edit Profile
              </Button>
            ) : (
              <></>
            )}
          </FlexboxGrid.Item>
        </FlexboxGrid>

        <Grid fluid className="profile-grid">
          <Row gutter={20}>
            {isMemberUser ? (
              <Col xs={24} sm={12} xl={6} xxl={4}>
                {fileList?.length > 0 ? (
                  <img
                    src={fileList[0].url}
                    alt="Profile"
                    className="profile-image"
                  />
                ) : (
                  <AvatarIcon />
                )}
              </Col>
            ) : (
              ""
            )}
            {isMemberUser ? (
              <>
                <Col xs={24} sm={14} xl={8} xxl={6}>
                  <div className="details-grp">
                    <div className="lbl">User Name</div>
                    <div className="val">{userProfile.name}</div>
                  </div>
                </Col>
                <Col xs={24} sm={10} xl={6} xxl={4}>
                  <div className="details-grp">
                    <div className="lbl">Mobile</div>
                    <div className="val">{userProfile.mobile}</div>
                  </div>
                </Col>
                <Col xs={24} sm={24} xl={10} xxl={6}>
                  <div className="details-grp">
                    <div className="lbl">Email</div>
                    <div className="val">{userProfile.email}</div>
                  </div>
                </Col>
                <Col xs={24} sm={24} xl={14} xxl={8}>
                  <div className="details-grp">
                    <div className="lbl">Address</div>
                    <div className="val">{userProfile.address}</div>
                  </div>
                </Col>
              </>
            ) : (
              <>
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
                      {fileList?.length > 0 ? (
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
                <Col xs={24} sm={14} xl={8} xxl={6}>
                  <div className="details-grp">
                    <div className="lbl">User Name</div>
                    <div className="val">{userProfile.userName}</div>
                  </div>
                </Col>
                <Col xs={24} sm={24} xl={10} xxl={6}>
                  <div className="details-grp">
                    <div className="lbl">Role</div>
                    <div className="val">{userProfile.role}</div>
                  </div>
                </Col>
                {authState.user?.role === USER_ROLES.admin ? (
                  <Col xs={24} sm={24} xl={10} xxl={6}>
                    <div className="details-grp">
                      <div className="lbl">Society Name</div>
                      <div className="val">
                        {userProfile.societyName?.societyName}
                      </div>
                    </div>
                  </Col>
                ) : (
                  <></>
                )}
              </>
            )}
          </Row>
        </Grid>
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </>
  );
}

export default ProfileDetails;
