import React, { useEffect, useState, useCallback } from "react";
import { Container, Row, Col, Grid } from "rsuite";
import { RxHamburgerMenu } from "react-icons/rx";
import LoginModal from "../Auth/LoginModal";
import logo from "../../assets/images/logo.jpg";
import NavModel from "../../pages/Public/Home/NavModel";
import "./header.css";
import classNames from "classnames";
import { BREAK_POINTS } from "../../utilities/constants";

const PublicHeader = () => {
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= BREAK_POINTS.MD
  );
  const [showLogin, setShowLogin] = useState(false);
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("home");

  const navigationMenu = [
    { navTitle: "Home", navigateTo: "home" },
    { navTitle: "About", navigateTo: "about" },
    { navTitle: "Features", navigateTo: "features" },
    { navTitle: "Contact", navigateTo: "footer" },
  ];

  const handleResize = () => {
    setIsMobile(window.innerWidth <= BREAK_POINTS.MD);
  };

  const handleClose = () => {
    setShowLogin(false);
    setIsNavModalOpen(false);
  };

  // Function to scroll to a section and also set the active nav
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    // Set active nav immediately on click
    setActiveNav(id);
  };

  // Update active nav based on current scroll position
  // Using useCallback ensures the function reference stays stable
  const handleScrollUpdate = useCallback(() => {
    const headerOffset = 70;
    let newActive = activeNav; // default is to keep current active

    // Check if the user is at (or near) the bottom of the page.
    if (
      window.innerHeight + window.pageYOffset >=
      document.documentElement.scrollHeight - 1
    ) {
      newActive = "footer";
    } else {
      navigationMenu.forEach((menu) => {
        const section = document.getElementById(menu.navigateTo);
        if (section) {
          const rect = section.getBoundingClientRect();
          /*
           * When the header offset (70px) falls within a section (the area between
           * the section’s top and bottom), we consider that section active.
           */
          if (rect.top <= headerOffset && rect.bottom > headerOffset) {
            newActive = menu.navigateTo;
          }
        }
      });
    }

    if (newActive !== activeNav) {
      setActiveNav(newActive);
    }
  }, [activeNav, navigationMenu]);

  // Setup event listeners for resize and scroll
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScrollUpdate);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScrollUpdate);
    };
  }, [handleScrollUpdate]);

  return (
    <Container className="header-public">
      <Grid fluid className="wd-100">
        <Row>
          <Col xs={24}>
            <header className="header">
              <nav className="nav-box">
                <div
                  className="xy-center cursor-pointer"
                  onClick={() => scrollToSection(navigationMenu[0].navigateTo)}
                >
                  <img src={logo} alt="logo" className="logo" />
                  <h6>Society Care</h6>
                </div>
                <ul className="nav-list list">
                  {navigationMenu.map((menu) => (
                    <li
                      key={menu.navTitle}
                      onClick={() => scrollToSection(menu.navigateTo)}
                      className={classNames(
                        "cursor-pointer",
                        activeNav === menu.navigateTo && "active"
                      )}
                    >
                      {menu.navTitle}
                    </li>
                  ))}
                </ul>
                <div className="xy-center">
                  <button className="button" onClick={() => setShowLogin(true)}>
                    Login
                  </button>
                  <RxHamburgerMenu
                    className="hamburger-menu"
                    onClick={() => setIsNavModalOpen(true)}
                  />
                </div>
              </nav>
            </header>
          </Col>
        </Row>
      </Grid>
      <NavModel isOpen={isNavModalOpen} onClose={handleClose} />
      <LoginModal open={showLogin} onClose={handleClose} />
    </Container>
  );
};

export default PublicHeader;
