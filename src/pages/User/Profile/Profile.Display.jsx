import React, { useEffect } from "react";
import { Container, Row, Col, Button, Panel } from "rsuite";
import { useDispatch, useSelector } from "react-redux";
import EnvConfig from "../../../envConfig";
import { Link } from "react-router-dom";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import "./profile.css";

function ProfileDisplay({ pageTitle }) {
  const authState = useSelector((state) => state.authState);
  const user = authState.user;
  const addresses = user?.addresses || [];
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, []);

  return (
    <Container className="profile-display-container">
      <ScrollToTop />
      <Row className="profile-container">
        <Col xs={22} lg={14} className="profile">
          <Panel bordered bodyFill className="profile-panel">
            <Row className="profile-header">
              <Col xs={12}>
                <img
                  src={`${EnvConfig?.MediaBase}/${user.assetsDir}/${user.profileImage}`}
                  alt="Profile"
                  className="profile-image-large"
                />
              </Col>
              <Col xs={12}>
                <h3 className="profile-name">
                  {user?.firstName || "N/A"} {user?.lastName || "N/A"}
                </h3>
                <Col xs={24} className="phone-email">
                  <h6>Phone</h6>
                  <p>{user?.phone || "N/A"}</p>
                </Col>
                <Col xs={24} className="phone-email">
                  <h6>Email</h6>
                  <p className="emaill">{user?.email || "N/A"}</p>
                </Col>
              </Col>
            </Row>
            <Row className="profile-body" gutter={16}>
              <Col xs={24}>
                <h4 className="section-header">Addresses</h4>
                <Row gutter={16}>
                  {addresses.length > 0 ? (
                    addresses.map((address, index) => (
                      <Col key={index} xs={24} sm={12} md={8}>
                        <div>Address Card</div>
                      </Col>
                    ))
                  ) : (
                    <p>No addresses found.</p>
                  )}
                </Row>
              </Col>
            </Row>
            <Row className="profile-footer">
              <Link to="/edit-profile">
                <Button
                  appearance="primary"
                  className="profile-edit-btn btn-green"
                >
                  Edit Profile
                </Button>
              </Link>
            </Row>
          </Panel>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfileDisplay;
