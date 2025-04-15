import React, { useState, useEffect } from "react";
import { Grid, Row, Col, FlexboxGrid, Button } from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ArowBackIcon from "@rsuite/icons/ArowBack";
import ScrollToTop from "../../../utilities/ScrollToTop";
import adminService from "../../../services/admin.service";
import { setRouteData } from "../../../stores/appSlice";
import CheckOutlineIcon from "@rsuite/icons/CheckOutline";
import CloseOutlineIcon from "@rsuite/icons/CloseOutline";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";

function MemberUserDetails({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [pageError, setPageError] = useState("");
  const [userDetails, setUserDetails] = useState({});

  const { userId } = useParams();

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(adminService.getUserDetails(userId));

      const { data } = resp;
      if (data.success) {
        respdata = data.user;
      }
    } catch (err) {
      console.error("User fetch catch => ", err);
      const errMsg = err?.response?.data?.message || `Error in fetching user`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setUserDetails(respdata);
  };

  return (
    <>
      <ScrollToTop />

      <div className="thm-panel">
        <FlexboxGrid justify="end" className="topfeaturebar">
          <FlexboxGrid.Item>
            <Button
              onClick={() => navigate("/member-user")}
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
                <div className="lbl">Contact Name</div>
                <div className="val">{userDetails.name}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Mobile</div>
                <div className="val">{userDetails.mobile}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Email</div>
                <div className="val">{userDetails.email}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Address</div>
                <div className="val">{userDetails.address}</div>
              </div>
            </Col>
            <Col xs={24} md={12} lg={8} xl={6}>
              <div className="details-grp">
                <div className="lbl">Status</div>
                <div className="val">
                  {" "}
                  {userDetails.status ? (
                    <span className="affirm">
                      <CheckOutlineIcon />
                    </span>
                  ) : (
                    <span className="negate">
                      <CloseOutlineIcon />
                    </span>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Grid>
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </>
  );
}

export default MemberUserDetails;
