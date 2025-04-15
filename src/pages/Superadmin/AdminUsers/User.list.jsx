import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Input,
  InputGroup,
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
import { setRouteData } from "../../../stores/appSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import ScrollToTop from "../../../utilities/ScrollToTop";
import classNames from "classnames";
import Paginator, {
  useTableData,
  useTableState,
} from "../../../components/Table/Paginator";
import "../../../layouts/ProtectedLayout.css";
import { BREAK_POINTS } from "../../../utilities/constants";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import "./user.css";

const Users = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [topAffixed, setTopAffixed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState([]);
  const [pageError, setPageError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [status, setStatus] = useState(false);
  const [disable, setDisable] = useState(false);
  const authState = useSelector((state) => state.authState);
  const role = authState?.user?.role;
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
    getUsers();
  }, []);

  const getUsers = async () => {
    setPageError("");

    try {
      const resp = await trackPromise(adminService.getUsers());
      const adminData = resp.data.adminUsers;

      const allAdmins = adminData.filter((user) => user.role === "admin");

      if (role !== "admin") {
        setUsers(allAdmins);
      } else {
        const societyAdmins = allAdmins.filter(
          (user) => user?.societyName?._id === societyId
        );
        setUsers(societyAdmins);
      }
    } catch (err) {
      console.error("User  fetch catch => ", err);
      const errMsg = err?.response?.data?.message || `Error in fetching users`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
  };

  const paginatedData = useTableData({
    data: users,
    searchQuery,
    sortColumn,
    sortType,
    page,
    limit,
    filterElement: "userName",
  });
  const finalDataForTable = () => {
    const finalUser = paginatedData?.limitData?.map((user) => ({
      ...user,
      societyName: user.societyName?.societyName || user.societyName,
    }));

    return finalUser;
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
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || "Error in deleting the user";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("User delete catch => ", error);
    }
  }

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
        deleteErr={deleteError}
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
        <Paginator
          data={users}
          limit={limit}
          page={page}
          setPage={setPage}
          setLimit={setLimit}
        />
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </Container>
  );
};

export default Users;
