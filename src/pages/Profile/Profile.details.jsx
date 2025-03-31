import React, { useEffect, useState } from "react";
import { Row, Col, Button, Grid, FlexboxGrid } from "rsuite";
import { useDispatch, useSelector } from "react-redux";
import { trackPromise } from "react-promise-tracker";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { setRouteData } from "../../stores/appSlice";
import AuthService from "../../services/auth.service";
import ScrollToTop from "../../utilities/ScrollToTop";
import { USER_ROLES } from "../../AppRoutes";

function ProfileDetails({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authState = useSelector((state) => state.authState);
  const [isMemberUser, setIsMemberUser] = useState(
    authState.user?.role === USER_ROLES.user
  );
  const [userProfile, setUserProfile] = useState({});

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
        setUserProfile(isMemberUser ? data.user : data.user);
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error fetching profile");
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

        <Grid fluid className="">
          <Row gutter={20}>
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
      </div>
    </>
  );
}

export default ProfileDetails;
