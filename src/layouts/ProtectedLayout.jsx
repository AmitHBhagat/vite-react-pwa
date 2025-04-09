import React, { useState, useEffect, forwardRef } from "react";
import { Outlet, NavLink as BaseNavLink, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  CustomProvider,
  Container,
  Navbar,
  Sidebar,
  Sidenav,
  Content,
  Nav,
  DOMHelper,
  Stack,
} from "rsuite";
import classNames from "classnames";
import ArrowLeftLineIcon from "@rsuite/icons/ArrowLeftLine";
import ArrowRightLineIcon from "@rsuite/icons/ArrowRightLine";
import Header from "../components/Header/Header";
import {
  USER_ROLES,
  SuperadminNavs,
  AdminNavs,
  UserNavs,
  SecurityNavs,
} from "../AppRoutes";
import Logo from "../assets/images/logo.jpg";
import "./ProtectedLayout.css";
import { BREAK_POINTS } from "../utilities/constants";

const { getHeight, on } = DOMHelper;

function ProtectedLayout() {
  const authState = useSelector((state) => state.authState);
  const [theme, setTheme] = useState("light");
  const [expand, setExpand] = useState(true);
  const [windowHeight, setWindowHeight] = useState(getHeight(window));
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const toggleTheme = (checked) => {
    setTheme(checked ? "light" : "dark");
  };

  useEffect(() => {
    handleResize();
    const resizeListener = on(window, "resize", handleResize);
    document.body.classList.add("body-protected");

    return () => {
      resizeListener.off();
      document.body.classList.remove("body-protected");
    };
  }, []);

  const handleResize = () => {
    const width = window.innerWidth;
    setWindowHeight(getHeight(window));
    setWindowWidth(width);
    setExpand(width >= BREAK_POINTS.MD);
  };

  const sideNavList =
    authState.user.role === USER_ROLES.superAdmin
      ? SuperadminNavs
      : authState.user.role === USER_ROLES.admin
      ? AdminNavs
      : authState.user.role === USER_ROLES.security
      ? SecurityNavs
      : UserNavs;

  const containerClasses = classNames("content-container", {
    "container-full": !expand,
  });

  const navBodyStyle = expand
    ? { height: windowHeight - 112, overflow: "auto" }
    : {};

  const sidebarClasses = classNames("sidebar", {
    "sidebar-overlay": !expand && windowWidth < BREAK_POINTS.XL,
  });

  const sidebarWidth =
    windowWidth < BREAK_POINTS.XL ? (expand ? 190 : 50) : expand ? 260 : 50;

  return (
    <CustomProvider theme={theme}>
      <Container className="container-layout-protected">
        <Sidebar
          className={sidebarClasses}
          style={{ display: "flex", flexDirection: "column" }}
          width={sidebarWidth}
          collapsible
        >
          <Sidenav.Header>
            <Brand expand={expand} />
          </Sidenav.Header>
          <Sidenav expanded={expand} appearance="subtle" defaultOpenKeys={[]}>
            <Sidenav.Body style={navBodyStyle}>
              <Nav activeKey="1">
                {sideNavList.map((item) => {
                  const { children, ...rest } = item;
                  if (children) {
                    return (
                      <Nav.Menu
                        key={item.eventKey}
                        placement="rightStart"
                        trigger="hover"
                        {...rest}
                      >
                        {children.map((child) => {
                          return <NavItem key={child.eventKey} {...child} />;
                        })}
                      </Nav.Menu>
                    );
                  }

                  if (rest.target === "_blank") {
                    return (
                      <Nav.Item key={item.eventKey} {...rest}>
                        {item.title}
                      </Nav.Item>
                    );
                  }

                  return <NavItem key={rest.eventKey} {...rest} />;
                })}
              </Nav>
            </Sidenav.Body>
          </Sidenav>
          <NavToggle expand={expand} onChange={() => setExpand(!expand)} />
        </Sidebar>

        <Container className={containerClasses}>
          <Header user={authState.user} />
          <Content>
            <Outlet />
          </Content>
        </Container>
      </Container>
    </CustomProvider>
  );
}
export default ProtectedLayout;

const Brand = (props) => {
  return (
    <Stack
      as={Link}
      justifyContent="center"
      className="sidenav-brand"
      {...props}
    >
      <Stack.Item className="brnd-img">
        <img src={Logo} />
      </Stack.Item>
      {props.expand ? (
        <Stack.Item className="brnd-text">
          <span>Society </span>
          <span> Care</span>
        </Stack.Item>
      ) : (
        <></>
      )}
    </Stack>
  );
};

const NavItem = (props) => {
  const { title, eventKey, ...rest } = props;
  return (
    <Nav.Item eventKey={eventKey} as={NavLink} {...rest}>
      {title}
    </Nav.Item>
  );
};

const NavLink = forwardRef(({ to, children, ...rest }, ref) => {
  return (
    <BaseNavLink ref={ref} to={to} {...rest}>
      {children}
    </BaseNavLink>
  );
});

const NavToggle = ({ expand, onChange }) => {
  return (
    <Navbar appearance="subtle" className="nav-toggle">
      <Nav pullRight>
        <Nav.Item
          onClick={onChange}
          style={{ textAlign: "center" }}
          icon={expand ? <ArrowLeftLineIcon /> : <ArrowRightLineIcon />}
        />
      </Nav>
    </Navbar>
  );
};
