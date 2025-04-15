import {
  BottomNavigation,
  BottomNavigationAction,
  Menu,
  MenuItem,
  Popover,
} from "@mui/material";
import React, { useState, useEffect, forwardRef } from "react";
import {
  useNavigate,
  useLocation,
  NavLink as BaseNavLink,
} from "react-router-dom";
import { DOMHelper } from "rsuite";
import { Icon } from "@rsuite/icons";
import { GrMoreVertical } from "react-icons/gr";
import { MdKeyboardArrowRight, MdKeyboardArrowDown } from "react-icons/md";
import classNames from "classnames";
import "./bottomNav.css";

const { on } = DOMHelper;
const MoreMenuItem = {
  eventKey: "moreMenu",
  title: "More",
  icon: <Icon as={GrMoreVertical} />,
};

const BottomTab = ({ navList = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuList, setMenuList] = useState([]);
  const [moreMenus, setMoreMenus] = useState([]);
  const [navIndex, setNavIndex] = useState(0);
  const [moreMenuElm, setMoreMenuElm] = useState(null);
  const [subMenus, setSubMenus] = useState([]);

  useEffect(() => {
    const docClicked = on(document, "click", (docEvt) => {
      console.log("document clicked...", docEvt.target);
      const clickTab = docEvt.target.closest("[data-bottom-tab]");
      console.log("is on tab => ", clickTab);
      if (clickTab) {
        setMoreMenuElm(clickTab);
      }
    });

    return () => {
      docClicked.off();
    };
  }, []);

  useEffect(() => {
    console.log("location.pathname => ", location.pathname);
    // ToDo: compute nav-index by path
  }, [location.pathname]);

  useEffect(() => {
    if (navList.length) {
      setMenuList([...navList.slice(0, 4), MoreMenuItem]);
      setMoreMenus(navList.slice(4));
    }
  }, [navList]);

  useEffect(() => {
    if (moreMenuElm?.dataset?.bottomTab) {
      const tabKey = moreMenuElm.dataset.bottomTab;
      if (tabKey) {
        if (tabKey === MoreMenuItem.eventKey) {
          setSubMenus(moreMenus);
        } else {
          const navitm = navList.find((nav, inx) => {
            if (nav.eventKey === tabKey) {
              setNavIndex(inx);
              return true;
            }
            return false;
          });
          if (Object.hasOwn(navitm, "children")) {
            setSubMenus(navitm.children);
          } else {
            navigate(navitm.to);
            setMoreMenuElm(null);
          }
        }
      }
    }
  }, [moreMenuElm]);

  const handleNavigation = (event, index) => {
    setNavIndex(index);
    const navitm = navList[index];
    if (Object.hasOwn(navitm, "children")) {
      // navigate(navitm.children[0].to);
      // setMoreMenuElm(event.currentTarget);
      return;
    }
    // navigate(navitm.to);
  };

  const handleMenuClick = (mnItem) => {
    if (Object.hasOwn(mnItem, "children")) {
      setSubMenus(
        subMenus.map(
          (itm) => ((itm.isOpen = itm.eventKey === mnItem.eventKey), itm)
        )
      );
    } else {
      navigate(mnItem.to);
      setMoreMenuElm(null);
    }
  };

  const handleClose = () => {
    setMoreMenuElm(null);
  };

  return (
    <>
      <BottomNavigation
        showLabels
        value={navIndex}
        // onChange={handleNavigation}
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
        {menuList?.length ? (
          menuList.map((mnt, inx) => (
            <BottomNavigationAction
              key={mnt.eventKey}
              label={mnt.title}
              icon={mnt.icon}
              data-bottom-tab={mnt.eventKey}
              sx={{
                fontSize: "1.4rem",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflowX: "clip",
                ".MuiBottomNavigationAction-label": {
                  maxWidth: "100%",
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

      <Menu
        anchorEl={moreMenuElm}
        open={Boolean(moreMenuElm)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        className="bottomtab-menu"
      >
        {subMenus?.length &&
          subMenus.map((itm, inx) => (
            <MenuItem key={itm.eventKey} onClick={() => handleMenuClick(itm)}>
              <div>
                <div className="menu-heading">
                  {itm.title}{" "}
                  {Object.hasOwn(itm, "children") ? (
                    <span className="mnh-icon">
                      {itm.isOpen ? (
                        <Icon as={MdKeyboardArrowDown} />
                      ) : (
                        <Icon as={MdKeyboardArrowRight} />
                      )}
                    </span>
                  ) : (
                    ""
                  )}
                </div>
                {Object.hasOwn(itm, "children") ? (
                  itm.isOpen ? (
                    <ul className="submenu">
                      {itm.children.map((chld) => (
                        <li
                          key={chld.eventKey}
                          onClick={() => handleMenuClick(chld)}
                          className="submn-item"
                        >
                          {chld.title}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <></>
                  )
                ) : (
                  <></>
                )}
              </div>
            </MenuItem>
          ))}
      </Menu>

      {/* <Popover
        anchorEl={moreMenuElm}
        open={Boolean(moreMenuElm)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        Paper={{
          sx: {
            p: 1,
            mb: 7,
            borderRadius: 2,
            minWidth: 180,
          },
        }}
      >
        {subMenus?.length &&
          subMenus.map((itm, inx) => (
            <MenuItem
              key={itm.eventKey}
              onClick={() => handleMenuClick(itm.to)}
            >
              {itm.title}
            </MenuItem>
          ))}
      </Popover> */}
    </>
  );
};

const NavLink = forwardRef(({ to, children, ...rest }, ref) => {
  return (
    <BaseNavLink ref={ref} to={to} {...rest}>
      {children}
    </BaseNavLink>
  );
});

const DefaultPopover = forwardRef(({ content, ...props }, ref) => {
  return (
    <Popover ref={ref} title="Title" {...props}>
      <p>This is a Popover </p>
      <p>{content}</p>
    </Popover>
  );
});

export default BottomTab;
