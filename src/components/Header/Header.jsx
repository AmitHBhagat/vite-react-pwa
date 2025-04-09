import React, { useEffect, useState } from "react";
import {
  Popover,
  Whisper,
  Stack,
  Badge,
  Avatar,
  IconButton,
  List,
  Button,
  InputPicker,
  Modal,
  Row,
  Col,
  Grid,
} from "rsuite";
import NoticeIcon from "@rsuite/icons/Notice";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { trackPromise } from "react-promise-tracker";
import { toast } from "react-toastify";
import classNames from "classnames";
import { setSelectedFlat } from "../../stores/authSlice";
import {
  clearAppData,
  setLocalData,
  fetchUserNotifications,
} from "../../stores/store";
import { timeDifference } from "../../utilities/timeDifference";
import { formatDateMonthTime } from "../../utilities/formatDate";
import { USER_ROLES } from "../../AppRoutes";
import notificationService from "../../services/notification.service";
import EnvConfig from "../../envConfig";
import { useSmallScreen } from "../../utilities/useWindowSize";
import ProfileAvatar from "../../assets/images/avtar.png";
import { THEME } from "../../utilities/theme";
import "./header.css";
import { BREAK_POINTS } from "../../utilities/constants";

// Function to render Admin speaker
const renderProfileSpeaker =
  (user) =>
  ({ onClose, left, top, className }, ref) => {
    const classList = classNames(className, { "thm-popover": true });

    return (
      <Popover ref={ref} className={classList} style={{ left, top }} full>
        <ul className="popver-menu">
          <li className="pm-title">
            <div>
              {user.userName}
              <br />
              <span className="pmt-subtl">{user.role}</span>
            </div>
          </li>
          <hr className="dividr-x" />
          <li className="pm-item">
            <Link onClick={onClose} to="/profile">
              Profile
            </Link>
          </li>
          {user.role !== USER_ROLES.user ? (
            <li className="pm-item">
              <Link onClick={onClose} to="/change-password">
                Change Password
              </Link>
            </li>
          ) : (
            <></>
          )}
          <hr className="dividr-x" />
          <li className="pm-item">
            <Link onClick={clearAppData}>Sign Out</Link>
          </li>
        </ul>
      </Popover>
    );
  };

const renderNotifSpeaker =
  (noteList, user) =>
  ({ onClose, left, top, className }, ref) => {
    const NotfChunk = 3;
    const [visibleCount, setVisibleCount] = useState(NotfChunk);
    const [isScrollable, setIsScrollable] = useState(false);

    const classList = classNames(className, { "notification-wrapper": true });

    useEffect(() => {
      if (visibleCount > 5) {
        setIsScrollable(true);
      }
    }, [visibleCount]);

    const loadMore = () => {
      setVisibleCount((prevCount) => prevCount + NotfChunk);
    };

    const getNotfPath = (noteType, id) => {
      if (user.role !== USER_ROLES.admin)
        switch (noteType) {
          case "Payment":
            return `/member-payments`;
          case "PaymentReceipt":
            return `/member-payments`;
          case "Query":
            return `/member-request-queries`;
          case "Notice":
            return `/member-notices`;
          case "Meeting":
            return `/member-meetings`;
          case "BillAdjustments":
            return `/member-billingAdjustments`;
          case "Billing":
            return `/member-billings`;
          default:
            return "/";
        }
      else {
        switch (noteType) {
          case "Payment":
            return `/payments`;
          case "Query":
            return `/request-query-details/${id}`;
          case "Notice":
            return `notice-details/${id}`;
          case "Meeting":
            return `/meeting-details/${id}`;
          case "Billing":
            return `/billings`;
          case "BillAdjustments":
            return `/billing-adjustment-details`;
          default:
            return "/";
        }
      }
    };

    const handleNotifClick = async (id) => {
      try {
        const resp = await trackPromise(
          notificationService.update(id, { readAt: new Date() })
        );
        const { data } = resp;
        if (data.success) {
          fetchUserNotifications(user);
        }
      } catch (error) {
        toast.error(error.response.data.message);
        console.error("Failed to mark the notification read", error);
      }
      onClose();
    };

    const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

    return (
      <Popover
        ref={ref}
        className={classList}
        style={{ left, top, width: isSmallScreen ? 240 : 300 }}
        title="Notifications"
      >
        <div
          style={{
            maxHeight: isScrollable ? "31.25rem" : "auto",
            overflowY: isScrollable ? "scroll" : "visible",
          }}
        >
          <List>
            {noteList.slice(0, visibleCount).map((notfn, index) => {
              return (
                <List.Item key={index}>
                  <div className="notf-row">
                    <Badge
                      style={{
                        backgroundColor: !notfn.readAt
                          ? THEME[0].CLR_NEGATE
                          : "transparent",
                      }}
                    />
                    <Link
                      to={getNotfPath(notfn.noteType, notfn.noteDerivedFrom)}
                      state={{ noteOrigin: notfn?.noteDerivedFrom }}
                      onClick={() => handleNotifClick(notfn._id)}
                      className="notif-title"
                    >
                      {notfn.title}
                    </Link>
                  </div>

                  <div className="notf-subttl">
                    <span>{timeDifference(notfn.sentAt)}</span>
                    <span>{formatDateMonthTime(notfn.sentAt)}</span>
                  </div>
                </List.Item>
              );
            })}
          </List>
          {visibleCount < noteList?.length && (
            <div className="txt-cnt mr-t-1">
              <Button size="xs" onClick={loadMore}>
                Show more
              </Button>
            </div>
          )}
        </div>
      </Popover>
    );
  };

const FlatSelectionModal = ({ isOpen, onClose, flatArr = [] }) => {
  return isOpen ? (
    <Modal
      open={isOpen}
      keyboard={false}
      backdrop="static"
      className="thm-modal"
    >
      <Modal.Header closeButton={false}>
        <Modal.Title>Select Flat</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pd-b-0">
        <Grid fluid>
          <Row gutter={0}>
            {flatArr.length ? (
              flatArr.map((flt) => (
                <Col key={flt.value} xs={24} lg={8} xl={12}>
                  <div className="flt-wrap">
                    <div className="flt-inner" onClick={() => onClose(flt)}>
                      <div className="fw-title">{flt.societyName}</div>
                      <div className="fw-subtl">{flt.flatNo}</div>
                    </div>
                  </div>
                </Col>
              ))
            ) : (
              <Col>No flat is associated to the user</Col>
            )}
          </Row>
        </Grid>
      </Modal.Body>
    </Modal>
  ) : (
    <></>
  );
};

// Header component
const Header = ({ user }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authState);
  const appState = useSelector((state) => state.appState);
  const notificationState = useSelector((state) => state.notificationState);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (authState.user?.role === USER_ROLES.user) {
      if (authState.flatList.length) {
        !authState.selectedFlat?.value
          ? setModalOpen(true)
          : setModalOpen(false);
      } else setModalOpen(true);
    }
  }, [authState.flatList]);

  function flatSelected(selectedFlt) {
    if (!selectedFlt?.value) return;
    dispatch(setSelectedFlat({ selectedFlat: selectedFlt }));
    setLocalData({ flat: selectedFlt.value });
    if (modalOpen) setModalOpen(false);
    navigate(0);
  }

  return (
    <Stack className="thm-header">
      <div className="thm-hdr-title">{appState.routeData.pageTitle}</div>

      <div className="thm-hdr-icons">
        {authState.user?.role === USER_ROLES.user ? (
          <div>
            <InputPicker
              data={authState.flatList}
              value={authState.selectedFlat?.value}
              onChange={(val) =>
                flatSelected(
                  authState.flatList.find((flt) => flt.value === val)
                )
              }
              cleanable={false}
              style={{}}
            />

            <FlatSelectionModal
              isOpen={modalOpen}
              onClose={flatSelected}
              flatArr={authState.flatList}
            />
          </div>
        ) : (
          <></>
        )}

        <Whisper
          placement="bottomEnd"
          trigger="click"
          speaker={renderNotifSpeaker(
            notificationState.notifications,
            authState.user
          )}
        >
          <IconButton
            className="notif-icon"
            icon={
              <Badge content={notificationState.unreadCount}>
                <NoticeIcon style={{ fontSize: "1.2rem" }} />
              </Badge>
            }
          />
        </Whisper>

        <Whisper
          placement="bottomEnd"
          trigger="click"
          speaker={renderProfileSpeaker(user)}
        >
          <Avatar
            size="lg"
            circle
            src={
              authState?.user?.avatar?.url
                ? authState?.user?.avatar?.url
                : ProfileAvatar
            }
            alt="User Avatar"
          />
        </Whisper>
      </div>
    </Stack>
  );
};

export default Header;
