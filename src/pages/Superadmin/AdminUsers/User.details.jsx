import React, { useEffect, useState } from "react";
import { Grid, Row, Col, FlexboxGrid, Button } from "rsuite";
import { useNavigate, useParams } from "react-router-dom";
import adminService from "../../../services/admin.service";
import { trackPromise } from "react-promise-tracker";
import { setRouteData } from "../../../stores/appSlice";
import { useDispatch } from "react-redux";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import { toast } from "react-toastify";
import ArowBackIcon from "@rsuite/icons/ArowBack";
import "./user.css";

const UserDetails = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const [user, setUser] = useState();
  const [pageError, setPageError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    async function fetchUserDetails() {
      setPageError("");
      let respData = [];
      try {
        const resp = await trackPromise(adminService.getUserById(userId));
        const { data } = resp;
        if (data.success) respData = data.adminUser;
      } catch (err) {
        console.error("User details fetch catch => ", err);
        const errMsg =
          err?.response?.data?.message || `Error in fetching user details`;
        toast.error(errMsg);
        setPageError(errMsg);
      }
      setUser(respData);
    }
    fetchUserDetails();
  }, [userId]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <ScrollToTop />

      <div className="thm-panel">
        <FlexboxGrid justify="end" className="topfeaturebar">
          <FlexboxGrid.Item>
            <Button
              onClick={() => navigate("/admin-users")}
              appearance="ghost"
              color="blue"
            >
              <ArowBackIcon />
            </Button>
          </FlexboxGrid.Item>
        </FlexboxGrid>

        <Grid fluid className="">
          <Row gutter={20}>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">User Name</div>
                <div className="val">{user.userName}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Society Name</div>
                <div className="val">{user?.societyName?.societyName}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">User Role</div>
                <div className="val">{user.role}</div>
              </div>
            </Col>
          </Row>
        </Grid>
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </>
  );
};

export default UserDetails;
