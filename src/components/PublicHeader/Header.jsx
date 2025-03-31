import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container, Row, Col, Grid } from "rsuite";
import { Link } from "react-router-dom";
import LoginModal from "../Auth/LoginModal";
import BrandImage from "../../assets/images/logo.jpg";
import "./header.css";

const PublicHeader = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const handleClose = () => {
    setShowLogin(false);
  };

  return (
    <Container className="header-public">
      <Grid fluid className="wd-100">
        <Row>
          <Col xs={24}>
            <Navbar>
              <Navbar.Brand as={Link} to="/">
                <img src={BrandImage} alt="logo" className="brand-logo-img" />
                <div>Society Care</div>
              </Navbar.Brand>

              <Nav
                onSelect={() => console.log("nav-item selected...")}
                pullRight
              >
                <Nav.Item as={Link} to="#" onClick={() => setShowLogin(true)}>
                  Login
                </Nav.Item>
              </Nav>
            </Navbar>
          </Col>
        </Row>
      </Grid>

      <LoginModal open={showLogin} onClose={handleClose} />
    </Container>
  );
};

export default PublicHeader;
