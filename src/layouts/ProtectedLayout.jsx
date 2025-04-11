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
  Whisper,
  Popover,
} from "rsuite";
import classNames from "classnames";
import ArrowLeftLineIcon from "@rsuite/icons/ArrowLeftLine";
import ArrowRightLineIcon from "@rsuite/icons/ArrowRightLine";
import BottomTab from "../components/BottomNav/BottomTab";
import Header from "../components/Header/Header";
import {
  USER_ROLES,
  SuperadminNavs,
  AdminNavs,
  UserNavs,
  SecurityNavs,
} from "../AppRoutes";
import { BREAK_POINTS } from "../utilities/constants";
import { debounceFn } from "../utilities/functions";
import Logo from "../assets/images/logo.jpg";
import "./ProtectedLayout.css";

const NavStates = ["expanded", "collapsed", "hidden"];

const { getHeight, on } = DOMHelper;

function ProtectedLayout() {
  const authState = useSelector((state) => state.authState);
  const [theme, setTheme] = useState("light");
  const [windowHeight, setWindowHeight] = useState(getHeight(window));
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [navState, setNavState] = useState(NavStates[0]);
  const [sideNavList, setSideNavList] = useState([]);
  const [contanrClass, setContanrClass] = useState("");
  const [openNavKeys, setOpenNavKeys] = useState([]);

  const toggleTheme = (checked) => {
    setTheme(checked ? "light" : "dark");
  };

  useEffect(() => {
    const resizeListener = on(window, "resize", debounceFn(handleResize, 100));
    document.body.classList.add("body-protected");

    return () => {
      resizeListener.off();
      document.body.classList.remove("body-protected");
    };
  }, []);

  useEffect(() => {
    setNavState(
      windowWidth < BREAK_POINTS.MD
        ? NavStates[2]
        : windowWidth >= BREAK_POINTS.MD && windowWidth < BREAK_POINTS.XL
        ? NavStates[1]
        : NavStates[0]
    );
  }, [windowWidth]);

  useEffect(() => {
    const contnrclasses = classNames("content-container", {
      "container-partial": navState === NavStates[1],
      "container-full": navState === NavStates[2],
    });
    setContanrClass(contnrclasses);
  }, [navState]);

  useEffect(() => {
    setSideNavList(
      authState.user.role === USER_ROLES.superAdmin
        ? SuperadminNavs
        : authState.user.role === USER_ROLES.admin
        ? AdminNavs
        : authState.user.role === USER_ROLES.security
        ? SecurityNavs
        : UserNavs
    );
  }, [authState.user?.role]);

  const handleResize = () => {
    setWindowWidth(window.innerWidth);
    setWindowHeight(getHeight(window));
  };

  const setSidenavState = () => {
    setNavState((preVal) =>
      preVal === NavStates[0] ? NavStates[1] : NavStates[0]
    );
  };

  return (
    <CustomProvider theme={theme}>
      <Container className={`container-layout-protected ${navState}`}>
        {navState === NavStates[2] ? (
          <BottomTab navList={sideNavList} />
        ) : (
          <Sidebar
            style={{ display: "flex", flexDirection: "column" }}
            width={
              navState === NavStates[0]
                ? "20%"
                : navState === NavStates[1]
                ? "5rem"
                : 0
            }
            collapsible
          >
            <Sidenav.Header>
              <Brand navOpen={navState === NavStates[0]} />
            </Sidenav.Header>
            <Sidenav
              expanded={navState === NavStates[0]}
              appearance="subtle"
              // defaultOpenKeys={[]}
              // openKeys={openNavKeys}
              // onOpenChange={setOpenNavKeys}
              style={
                navState === NavStates[2]
                  ? {}
                  : { height: windowHeight - 112, overflowY: "auto" }
              }
            >
              <Sidenav.Body>
                <Nav activeKey="1">
                  {sideNavList.map((item) => {
                    const { children, ...rest } = item;

                    if (children) {
                      return navState === NavStates[0] ? (
                        <Nav.Menu key={item.eventKey} {...rest}>
                          {children.map((child) => {
                            return <NavItem key={child.eventKey} {...child} />;
                          })}
                        </Nav.Menu>
                      ) : (
                        <Whisper
                          key={item.eventKey}
                          placement="rightEnd"
                          trigger="click"
                          speaker={renderSubmenu(item.title, children)}
                        >
                          {
                            <Nav.Item key={item.eventKey} {...rest}>
                              {item.title}
                            </Nav.Item>
                          }
                        </Whisper>
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
            <NavToggle
              navOpen={navState === NavStates[0]}
              onChange={setSidenavState}
            />
          </Sidebar>
        )}

        <Container className={contanrClass}>
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
      {props.navOpen ? (
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

const renderSubmenu =
  (menuTitle, menuList) =>
  ({ onClose, left, top, className }, ref) => {
    const classList = classNames(className, { "thm-popover": true });
    return (
      <Popover ref={ref} className={classList} style={{ left, top }} full>
        <ul className="popver-menu">
          <li className="pm-title">{menuTitle}</li>
          {menuList.map((itm) => {
            return <NavItem key={itm.eventKey} onClick={onClose} {...itm} />;
          })}
        </ul>
      </Popover>
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

const NavToggle = ({ navOpen, onChange }) => {
  return (
    <Navbar appearance="subtle" className="nav-toggle">
      <Nav pullRight>
        <Nav.Item
          onClick={onChange}
          style={{ textAlign: "center" }}
          icon={navOpen ? <ArrowLeftLineIcon /> : <ArrowRightLineIcon />}
        />
      </Nav>
    </Navbar>
  );
};
