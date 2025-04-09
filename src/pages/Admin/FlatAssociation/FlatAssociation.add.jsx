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
  AutoComplete,
  InputPicker,
  TagGroup,
  Tag,
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import SearchIcon from "@rsuite/icons/Search";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import classNames from "classnames";
import FlatService from "../../../services/flat.service";
import adminService from "../../../services/admin.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import { BREAK_POINTS } from "../../../utilities/constants";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";

const FlatAssociation = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [searchNumber, setSearchNumber] = useState("");
  const [getUser, setGetUser] = useState({});
  const [flats, setFlats] = useState([]);
  const [topAffixed, setTopAffixed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [pageError, setPageError] = useState("");
  const [deleteUser, setDeleteUser] = useState([]);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    getFlats();
  }, [societyId]);

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  const getFlats = async () => {
    setPageError("");
    let flats = [];
    try {
      const resp = await trackPromise(
        FlatService.getFlatsBySocietyId(societyId)
      );
      const { data } = resp;
      if (data.success) flats = data.flats;
    } catch (error) {
      const errMsg = err?.response?.data?.message || "Error in fetching flats";
      toast.error(errMsg);
      console.error("Failed to fetch flats", error);
      setPageError(errMsg);
    } finally {
      setFlats(flats);
    }
  };

  const getData = () => {
    let filteredFlats = flats.filter(
      (flat) =>
        flat.flatNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flat.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortColumn && sortType) {
      filteredFlats.sort((a, b) => {
        let x = a[sortColumn];
        let y = b[sortColumn];
        if (typeof x === "string") {
          x = x.charCodeAt();
        }
        if (typeof y === "string") {
          y = y.charCodeAt();
        }
        return sortType === "asc" ? x - y : y - x;
      });
    }

    const start = limit * (page - 1);
    const end = start + limit;
    return filteredFlats.slice(start, end);
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

  const handleSelectedNumber = async (rowId) => {
    setPageError("");
    const number = searchNumber[rowId];
    if (!number) return;
    try {
      const resp = await trackPromise(
        adminService.getUserByMobileNumber(number)
      );
      const { data } = resp;
      if (data.success && data.user.length === 0) {
        toast.info("no user fond with this number");
      }
      if (data.success) {
        setGetUser((prevUser) => ({ ...prevUser, [rowId]: data.user }));
      }
    } catch (error) {
      const errMsg =
        err?.response?.data?.message ||
        "Error in fetching user by mobile number";
      toast.error(errMsg);
      console.error("Failed to fetch user", error);
      setPageError(errMsg);
    }
  };

  const handleSaveUser = async (flatId) => {
    setPageError("");
    const userId = { userId: getUser[flatId][0]._id };
    try {
      await trackPromise(FlatService.updateFlatAssociation(userId, flatId));

      setSearchNumber((prev) => {
        const newState = { ...prev };
        delete newState[flatId];
        return newState;
      });

      setGetUser((prev) => {
        const newState = { ...prev };
        delete newState[flatId];
        return newState;
      });
      getFlats();
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || "Error in saving the user";
      toast.error(errMsg);
      console.error("Failed to fetch user", error);
      setPageError(errMsg);
    }
  };

  const handleOpenModal = (rowData, user) => {
    setDeleteUser([rowData._id, user._id]);
    setDeleteMessage(
      `Do you wish to dissociate ${user.name} with flat no. ${rowData.flatNo}`
    );
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setDeleteMessage("");
    setDeleteError("");
    setModalOpen(false);
  };

  const handleRemoveAssociateUser = async () => {
    const flatId = deleteUser[0];
    const userId = deleteUser[1];
    const userIdObject = { userId };
    try {
      await trackPromise(
        FlatService.removeFlatAssociation(userIdObject, flatId)
      );
      getFlats();
      handleCloseModal();
    } catch (error) {
      const errMsg =
        err?.response?.data?.message || "Error in removing the user";
      toast.error(errMsg);
      console.error("Failed to fetch user", error);
      setPageError(errMsg);
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
          </FlexboxGrid>
        </Affix>

        <Row gutter={0} className="section-mb">
          <Col xs={24}>
            <Table
              affixHeader={60}
              wordWrap="break-word"
              data={getData()}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={handleSortColumn}
              loading={loading}
              autoHeight
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact flat-association-table"
            >
              <Column minWidth={70} sortable flexGrow={0.7}>
                <HeaderCell>Flat No.</HeaderCell>
                <Cell dataKey="flatNo" />
              </Column>
              <Column minWidth={135} sortable flexGrow={1.5}>
                <HeaderCell>Owner Name</HeaderCell>
                <Cell dataKey="ownerName" />
              </Column>
              <Column minWidth={160} flexGrow={1.5}>
                <HeaderCell>Enter Mobile No.</HeaderCell>
                <Cell>
                  {(rowData) => (
                    <>
                      <InputGroup className="number-search-input-box">
                        <AutoComplete
                          value={searchNumber[rowData._id] || ""}
                          onChange={(number) =>
                            setSearchNumber({
                              ...searchNumber,
                              [rowData._id]: number,
                            })
                          }
                          placeholder="Search User By Mobile"
                          type="number"
                        />
                        <InputGroup.Button
                          onClick={() => handleSelectedNumber(rowData._id)}
                        >
                          <SearchIcon />
                        </InputGroup.Button>
                      </InputGroup>
                    </>
                  )}
                </Cell>
              </Column>
              <Column minWidth={100} flexGrow={1.5}>
                <HeaderCell>User Name</HeaderCell>
                <Cell>
                  {(rowData) => (
                    <InputPicker
                      data={getUser[rowData._id]?.map((user) => ({
                        label: user.name,
                        value: user.name,
                      }))}
                    />
                  )}
                </Cell>
              </Column>
              <Column minWidth={200} flexGrow={2}>
                <HeaderCell>Associated Users</HeaderCell>
                <Cell>
                  {(rowData, rowIndex) => (
                    <TagGroup>
                      {rowData?.userId?.map((user, index) => (
                        <Tag
                          key={index}
                          closable
                          onClose={() => handleOpenModal(rowData, user)}
                        >
                          {user?.name}
                        </Tag>
                      ))}
                    </TagGroup>
                  )}
                </Cell>
              </Column>

              <Column width={130} align="center" className="col-action">
                <HeaderCell>Actions</HeaderCell>
                <Cell>
                  {(rowData) => (
                    <Button
                      appearance="primary"
                      onClick={() => handleSaveUser(rowData._id)}
                    >
                      Save
                    </Button>
                  )}
                </Cell>
              </Column>
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
            total={flats.length}
            limitOptions={[5, 10, 30, 50]}
            limit={limit}
            activePage={page}
            onChangePage={setPage}
            onChangeLimit={handleChangeLimit}
          />
        </div>
        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />

        <DeleteModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          deleteAction={handleRemoveAssociateUser}
          deleteMsg={deleteMessage}
          deleteErr={deleteError}
        />
      </div>
    </Container>
  );
};

export default FlatAssociation;
