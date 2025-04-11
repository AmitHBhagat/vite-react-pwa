import {
  BottomNavigation,
  BottomNavigationAction,
  Popover,
} from "@mui/material";
import React, { useState, useEffect, forwardRef } from "react";
import {
  useNavigate,
  useLocation,
  NavLink as BaseNavLink,
} from "react-router-dom";
import { Button, Nav, Whisper } from "rsuite";
import classNames from "classnames";
import "./bottomNav.css";

const BottomTab = ({ navList = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [navIndex, setNavIndex] = useState(0);

  useEffect(() => {
    console.log("location.pathname => ", location.pathname);
    // ToDo: compute nav-index by path
  }, [location.pathname]);

  const handleNavigation = (event, index) => {
    setNavIndex(index);
    const navitm = navList[index];
    if (Object.hasOwn(navitm, "children")) {
      navigate(navitm.children[0].to);
      return;
    }
    navigate(navitm.to);
  };

  const NavLink = forwardRef(({ to, children, ...rest }, ref) => {
    return (
      <BaseNavLink ref={ref} to={to} {...rest}>
        {children}
      </BaseNavLink>
    );
  });

  return (
    <BottomNavigation
      showLabels
      value={navIndex}
      onChange={handleNavigation}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: "white",
        zIndex: 1000,
        height: "5rem",
        borderTop: "1px solid var(--clr-grey-04)",
      }}
    >
      {navList?.length ? (
        navList.slice(0, 5).map((mnt, inx) => (
          <BottomNavigationAction
            key={mnt.eventKey}
            label={mnt.title}
            icon={mnt.icon}
            sx={{
              fontSize: "1.4rem",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflowX: "clip",
              ".MuiBottomNavigationAction-label": {
                maxWidth: "60px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "inline-block",
              },
            }}
          />
        ))
      ) : (
        <></>
      )}
    </BottomNavigation>
  );
};

const DefaultPopover = forwardRef(({ content, ...props }, ref) => {
  return (
    <Popover ref={ref} title="Title" {...props}>
      <p>This is a Popover </p>
      <p>{content}</p>
    </Popover>
  );
});

export default BottomTab;
