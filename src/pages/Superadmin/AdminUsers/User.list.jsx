import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Input,
  Pagination,
  InputGroup,
  useToaster,
  Affix,
  Button,
  FlexboxGrid,
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
import "./user.css";
import { setRouteData } from "../../../stores/appSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import classNames from "classnames";

import "../../../layouts/ProtectedLayout.css";

const Users = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const toaster = useToaster();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = React.useState(5);
  const [topAffixed, setTopAffixed] = useState(false);
  const [page, setPage] = React.useState(1);
  const [sortColumn, setSortColumn] = React.useState();
  const [sortType, setSortType] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState([]);
  const [pageError, set_pageError] = useState("");
  const [status, setStatus] = useState(false);
  const [disable, setDisable] = useState(false);
  const authState = useSelector((state) => state.authState);
  const role = authState?.user?.role;
  const societyId = authState?.user?.societyName;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    getUsers();
  }, []);

  const getUsers = async () => {
    try {
      const resp = await trackPromise(adminService.getUsers());
      const admindata = resp.data.adminUsers;

      const allAdmins = admindata.filter((user) => user.role === "admin");

      if (role !== "admin") {
        setUsers(allAdmins);
      } else {
        const societyAdmins = allAdmins.filter(
          (user) => user.societyName?._id === societyId
        );
        setUsers(societyAdmins);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.error("Failed to fetch users", error);
    }
  };

  const getData = () => {
    let filteredUsers = users;

    if (searchQuery) {
      filteredUsers = users.filter((user) =>
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

  const handleSortColumn = (sortColumn, sortType) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSortColumn(sortColumn);
      setSortType(sortType);
    }, 500);
  };

  const handleChangeLimit = (dataKey) => {
    setPage(1);
    setLimit(dataKey);
  };

  const handleOpenModal = (itemId) => {
    const user = users.find((user) => user._id === itemId);

    setSelectedItemId([itemId, `Do you wish to remove ${user.userName}?`]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItemId([]);
  };

  async function deleteUser(id) {
    try {
      const resp = await trackPromise(adminService.deleteUser(id));
      const { data } = resp;

      if (data?.success === true) {
        toast.success(data.message || "User deleted successfully");
        getUsers();
        handleCloseModal();
      }
    } catch (err) {
      toast.error(err.response.data.message);
      console.error("Delete error catch => ", err);
      if (err.code !== "ERR_NETWORK") {
        set_pageError(err.response.data.message);
      } else {
        set_pageError(err.response.data.message);
      }
    }
  }

  const isSmallScreen = useSmallScreen(768);

  return (
    <Container className="users-container">
      <DeleteModal
        itemId={selectedItemId[0]}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        deleteAction={() => {
          deleteUser(selectedItemId[0]);
        }}
        deleteMsg={selectedItemId[1]}
      />

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
            {role !== "admin" && (
              <FlexboxGrid.Item>
                <Link to={`/admin-users/add`}>
                  <Button appearance="primary" size="md">
                    Add Admin
                  </Button>
                </Link>
              </FlexboxGrid.Item>
            )}
          </FlexboxGrid>
        </Affix>
        <Row gutter={0} className="section-mb">
          <Col xs={24}>
            <Table
              autoHeight
              wordWrap="break-word"
              data={getData()}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={handleSortColumn}
              loading={loading}
              affixHeader={50}
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column flexGrow={1.5} minWidth={150} sortable>
                <HeaderCell>First Name</HeaderCell>

                <Cell dataKey="userName">
                  {(rowData) => (
                    <Link to={`/admin-users/details/${rowData._id}`}>
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
              {role !== "admin" && (
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
                        <Link to={`/admin-users/edit/${rowData._id}`}>
                          <IconButton
                            title="edit"
                            icon={<EditIcon className="icon-blue" />}
                          />
                        </Link>

                        <IconButton
                          title="delete"
                          icon={<TrashIcon color="red" />}
                          onClick={() => handleOpenModal(rowData._id)}
                        />
                      </div>
                    )}
                  </Cell>
                </Column>
              )}
            </Table>
          </Col>
        </Row>
        <div className="">
          <Pagination
            prev
            next
            first
            last
            ellipsis
            boundaryLinks
            maxButtons={5}
            size={isSmallScreen ? "xs" : "md"}
            layout={[
              "total",
              "-",
              `${!isSmallScreen ? "limit" : ""}`,
              `${!isSmallScreen ? "|" : ""}`,
              "pager",
              `${!isSmallScreen ? "|" : ""}`,
              `${!isSmallScreen ? "skip" : ""}`,
            ]}
            total={users.length}
            limitOptions={[5, 10, 30, 50]}
            limit={limit}
            activePage={page}
            onChangePage={setPage}
            onChangeLimit={handleChangeLimit}
          />
        </div>
      </div>
    </Container>
  );
};

export default Users;
