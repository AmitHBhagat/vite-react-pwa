import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Input,
  Pagination,
  InputGroup,
  Affix,
  Button,
  FlexboxGrid,
  Modal,
  Grid,
} from "rsuite";
import adminService from "../../../services/admin.service";
import { trackPromise } from "react-promise-tracker";
import { Link } from "react-router-dom";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import SearchIcon from "@rsuite/icons/Search";
import EditIcon from "@rsuite/icons/Edit";
import { IconButton } from "rsuite";
import TrashIcon from "@rsuite/icons/Trash";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import { setRouteData } from "../../../stores/appSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import classNames from "classnames";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import { BREAK_POINTS } from "../../../utilities/constants";
import Paginator, {
  useTableData,
  useTableState,
} from "../../../components/Table/Paginator";
import "../../Superadmin/AdminUsers/user.css";

const SecurityUserList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [securityUsers, setSecurityUsers] = useState([]);
  const [topAffixed, setTopAffixed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSecurity, setSelectedSecurity] = useState();
  const [deleteConsent, setDeleteConsent] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [pageError, setPageError] = useState("");
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;
  const {
    searchQuery,
    setSearchQuery,
    limit,
    setLimit,
    page,
    setPage,
    sortColumn,
    sortType,
    setSort,
    loading,
    setLoading,
  } = useTableState();

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    getSecurityUsers();
  }, []);

  const getSecurityUsers = async () => {
    setPageError("");
    try {
      const resp = await trackPromise(adminService.getUsers());
      if (resp.data.success) {
        const admindata = resp.data.adminUsers;
        const allAdmins = admindata.filter((user) => user.role === "security");
        const societyAdmins = allAdmins.filter(
          (user) => user.societyName?._id === societyId
        );
        setSecurityUsers(societyAdmins);
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || "Error fetching the security users";
      setPageError(errMsg);
      toast.error(errMsg);
      console.error("Failed to fetch users", err);
    }
  };
  const paginatedData = useTableData({
    data: securityUsers,
    searchQuery,
    sortColumn,
    sortType,
    page,
    limit,
    filterElement: "userName",
    filterElement2: "",
  });

  const getData = () => {
    let filteredUsers = securityUsers;
    if (searchQuery) {
      filteredUsers = securityUsers.filter((user) =>
        user.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    let sortedUsers = [...filteredUsers];
    if (sortColumn && sortType) {
      sortedUsers.sort((a, b) => {
        let x = a[sortColumn];
        let y = b[sortColumn];
        if (typeof x === "string") {
          x = x.charCodeAt();
        }
        if (typeof y === "string") {
          y = y.charCodeAt();
        }
        if (sortType === "asc") {
          return x - y;
        } else {
          return y - x;
        }
      });
    }

    const start = limit * (page - 1);
    const end = start + limit;
    const paginatedUsers = sortedUsers.slice(start, end);
    paginatedUsers.forEach((user) => {
      user.societyName = user.societyName?.societyName || user.societyName;
    });
    return paginatedUsers;
  };
  const finalDataForTable = () => {
    const finalUser = paginatedData?.limitData?.map((user) => ({
      ...user,
      societyName: user.societyName?.societyName || user.societyName,
    }));

    return finalUser;
  };
  const handleOpenModal = (item) => {
    setSelectedSecurity(item._id);
    setDeleteMessage(`Do you wish to remove ${item.userName}?`);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSecurity("");
  };

  const deleteSecurity = async () => {
    try {
      const resp = await trackPromise(
        adminService.deleteUser(selectedSecurity)
      );
      const { data } = resp;

      if (data?.consentRequired) {
        setDeleteConsent(true);
        setDeleteMessage(data.message);
      } else {
        toast.success(data.message || "Security user deleted successfully");
        getSecurityUsers();
        handleCloseModal();
      }
    } catch (err) {
      const errMsg =
        err.response.data.message || "Error deleting the security user";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("Error deleting the security user", err);
    }
  };

  const handleOpenDetailsModal = (item) => {
    setSelectedSecurity(item);
    setModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setModalOpen(false);
    setDeleteError("");
    setDeleteMessage("");
    setSelectedSecurity("");
  };

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  return (
    <Container className="users-container">
      <ScrollToTop />
      <div
        className={classNames("inner-container", { "affixed-top": topAffixed })}
      >
        <Affix onChange={setTopAffixed}>
          <FlexboxGrid justify="space-between" className="flxgrid-theme">
            <FlexboxGrid.Item className="filters-row section-mb">
              <InputGroup inside>
                <Input
                  placeholder="Search ..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
                <InputGroup.Button>
                  <SearchIcon />
                </InputGroup.Button>
              </InputGroup>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item>
              <Link to={`/security-user/add`}>
                <Button appearance="primary" size="md">
                  Add Security
                </Button>
              </Link>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Affix>
        <Row gutter={0} className="section-mb">
          <Col xs={24}>
            <Table
              autoHeight
              wordWrap="break-word"
              data={finalDataForTable()}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={setSort}
              loading={loading}
              affixHeader={50}
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column flexGrow={1.5} minWidth={150} sortable>
                <HeaderCell>Username</HeaderCell>
                <Cell dataKey="userName">
                  {(rowData) => (
                    <Link onClick={() => handleOpenDetailsModal(rowData)}>
                      {rowData.userName}
                    </Link>
                  )}
                </Cell>
              </Column>
              <Column flexGrow={1.5} minWidth={250} sortable>
                <HeaderCell>Society Name</HeaderCell>
                <Cell dataKey="societyName" />
              </Column>
              <Column flexGrow={0.5} minWidth={70} sortable>
                <HeaderCell>Role</HeaderCell>
                <Cell dataKey="role" />
              </Column>
              <Column width={130} align="center" className="col-action">
                <HeaderCell>Actions</HeaderCell>
                <Cell>
                  {(rowData) => (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "0.625rem",
                      }}
                    >
                      <Link to={`/security-user/edit/${rowData._id}`}>
                        <IconButton
                          title="edit"
                          icon={<EditIcon className="icon-blue" />}
                        />
                      </Link>

                      <IconButton
                        title="delete"
                        icon={<TrashIcon color="red" />}
                        onClick={() => handleOpenModal(rowData)}
                      />
                    </div>
                  )}
                </Cell>
              </Column>
            </Table>
          </Col>
        </Row>
        <Paginator
          data={securityUsers}
          limit={limit}
          page={page}
          setPage={setPage}
          setLimit={setLimit}
        />

        <DetailsModal
          isOpen={modalOpen}
          onClose={handleCloseDetailsModal}
          dataObj={selectedSecurity}
        />
        <DeleteModal
          itemId={selectedSecurity}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          deleteAction={deleteSecurity}
          deleteMsg={deleteMessage}
          deleteErr={deleteError}
          consentRequired={deleteConsent}
        />
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </Container>
  );
};

export default SecurityUserList;

const DetailsModal = ({ isOpen, onClose, dataObj = {} }) => {
  return isOpen ? (
    <Modal open={isOpen} onClose={onClose} className="thm-modal">
      <Modal.Header closeButton={false}>
        <Modal.Title>{}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pd-b-0">
        <Grid fluid>
          <Row gutter={0}>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Security Name</div>
                <div className="val">{dataObj.userName}</div>
              </div>
            </Col>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Society Name</div>
                <div className="val">{dataObj.societyName}</div>
              </div>
            </Col>
            <Col xs={24}>
              <div className="details-grp">
                <div className="lbl">Role</div>
                <div className="val">{dataObj.role}</div>
              </div>
            </Col>
          </Row>
        </Grid>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} appearance="default">
          Ok
        </Button>
      </Modal.Footer>
    </Modal>
  ) : (
    <></>
  );
};
