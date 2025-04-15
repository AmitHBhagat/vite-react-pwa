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
  ButtonToolbar,
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import SearchIcon from "@rsuite/icons/Search";
import { IconButton } from "rsuite";
import TrashIcon from "@rsuite/icons/Trash";
import EditIcon from "@rsuite/icons/Edit";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import adminService from "../../../services/admin.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { THEME } from "../../../utilities/theme";
import classNames from "classnames";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import { BREAK_POINTS } from "../../../utilities/constants";

import Paginator, {
  useTableData,
  useTableState,
} from "../../../components/Table/Paginator";

const MemberUsers = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [userInfo, setUserInfo] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selSociety, setSelSociety] = useState({});
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteConsent, setDeleteConsent] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;
  const [topAffixed, setTopAffixed] = useState(false);
  const [pageError, setPageError] = useState("");
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
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (societyId) {
      fetchUserInfo();
    }
  }, [societyId]);

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  const fetchUserInfo = async () => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(adminService.getMemberUser(societyId));
      const { data } = resp;
      if (data.success) {
        respdata = data.users;
      }
    } catch (err) {
      console.error("User fetch catch => ", err);
      const errMsg = err?.response?.data?.message || `Error in fetching user`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setUserInfo(respdata);
  };

  const paginatedData = useTableData({
    data: userInfo,
    searchQuery,
    sortColumn,
    sortType,
    page,
    limit,
    filterElement: "name",
    filterElement2: "mobile",
  });

  const handleOpenModal = (item) => {
    setSelSociety(item);
    setDeleteMessage(`Do you wish to delete ${item.name}?`);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelSociety({});
    setDeleteMessage("");
    setDeleteError("");
    setModalOpen(false);
  };

  const deleteUser = async () => {
    try {
      const resp = await trackPromise(
        adminService.deleteMemberUser(selSociety._id)
      );
      const { data } = resp.data;
      if (data?.consentRequired) {
        setDeleteConsent(true);
        setDeleteMessage(data.message);
      } else {
        toast.success(resp.data.message || "User deleted successfully");
        handleCloseModal();
        fetchUserInfo();
      }
    } catch (error) {
      const errMsg =
        error.response.data.message || "Error in deleting the user";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("Delete user catch => ", error);
    }
  };

  return (
    <Container className="">
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
              <ButtonToolbar>
                <Link to={`/member-user/add`}>
                  <Button appearance="primary" size="md" className="mr-2">
                    Add User
                  </Button>
                </Link>
                <Link to={`/member-user/upload-user`}>
                  <Button appearance="primary" size="md">
                    Upload Users
                  </Button>
                </Link>
              </ButtonToolbar>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Affix>
        <Row gutter={0} className="section-mb">
          <Col xs={24}>
            <Table
              affixHeader={60}
              wordWrap="break-word"
              data={paginatedData.limitData}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={setSort}
              loading={loading}
              autoHeight
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column width={200} sortable flexGrow={1.5}>
                <HeaderCell>User Name</HeaderCell>
                <Cell dataKey="name">
                  {(rowData) => (
                    <Link to={`/member-user/details/${rowData._id}`}>
                      {rowData.name}
                    </Link>
                  )}
                </Cell>
              </Column>
              <Column width={120} sortable>
                <HeaderCell>Mobile</HeaderCell>
                <Cell dataKey="mobile" />
              </Column>
              <Column width={200} sortable flexGrow={1}>
                <HeaderCell>Email</HeaderCell>
                <Cell dataKey="email" />
              </Column>
              <Column width={300} sortable flexGrow={1.5}>
                <HeaderCell>Address</HeaderCell>
                <Cell dataKey="address" />
              </Column>

              <Column width={100} align="center" className="col-action">
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
                      <Link to={`/member-user/edit/${rowData._id}`}>
                        <IconButton
                          title="edit"
                          icon={<EditIcon color={THEME[0].CLR_PRIMARY} />}
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
          data={userInfo}
          limit={limit}
          page={page}
          setPage={setPage}
          setLimit={setLimit}
        />
        <DeleteModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          deleteAction={deleteUser}
          deleteMsg={deleteMessage}
          deleteErr={deleteError}
          consentRequired={deleteConsent}
        />
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </Container>
  );
};

export default MemberUsers;
