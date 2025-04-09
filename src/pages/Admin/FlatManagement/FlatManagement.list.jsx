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
import classNames from "classnames";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import FlatManagementService from "../../../services/flat.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { THEME } from "../../../utilities/theme";
import StatusIndicator from "../../../components/StatusIndicator/StatusIndicator";
import { BREAK_POINTS } from "../../../utilities/constants";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";

const FlatManagementList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [flats, setFlats] = useState(null);
  const [currentFlats, setCurrentFlats] = useState([]);
  const [topAffixed, setTopAffixed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selFlatManagement, setSelFlatManagement] = useState({});
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteConsent, setDeleteConsent] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    getFlats();
  }, [dispatch, pageTitle]);

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  const getFlats = async () => {
    setPageError("");
    let flats = null;
    try {
      setLoading(true);
      const resp = await trackPromise(
        FlatManagementService.getFlatsBySocietyId(societyId)
      );
      const { data } = resp;
      if (data.success) flats = data.flats;
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || "Error in fetching flats";
      toast.error(errMsg);
      console.error("Failed to fetch flats", error);
      setPageError(errMsg);
    } finally {
      setLoading(false);
      setFlats(flats);
    }
  };

  useEffect(() => {
    if (flats) {
      const sortedFlats = [...flats].sort((a, b) =>
        a.flatNo.localeCompare(b.flatNo, undefined, { numeric: true })
      );
      setCurrentFlats(sortedFlats);
    }
  }, [flats]);

  useEffect(() => {
    let filtered = flats || [];
    filtered = filtered.map((flat) => ({
      ...flat,
      billDependencies: flat.billDependencies || [],
    }));
    if (searchQuery) {
      filtered = filtered.filter(
        (e) =>
          e.flatNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortColumn && sortType) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        return sortType === "asc"
          ? aValue.localeCompare(bValue, undefined, { numeric: true })
          : bValue.localeCompare(aValue, undefined, { numeric: true });
      });
    }

    setCurrentFlats(filtered);
  }, [flats, searchQuery, sortColumn, sortType]);

  const getData = () => {
    let filteredFlats = currentFlats.slice((page - 1) * limit, page * limit);

    return filteredFlats;
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

  const handleOpenModal = (item) => {
    setSelFlatManagement(item);
    setDeleteMessage(`Do you wish to delete flat no. ${item.flatNo}?`);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelFlatManagement({});
    setDeleteMessage("");
    setDeleteError("");
    setModalOpen(false);
  };

  const deleteFlatManagement = async () => {
    try {
      const resp = await trackPromise(
        FlatManagementService.deleteFlat(selFlatManagement._id)
      );
      const { data } = resp.data;
      if (data?.consentRequired) {
        setDeleteConsent(true);
        setDeleteMessage(data.message);
      } else {
        toast.success(resp.data.message || "Flat deleted successfully");
        handleCloseModal();
        getFlats();
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message ||
        "Error in deleting the flatManagement";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("Delete flatManagement catch => ", error);
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
                <Link to={`/upload-flat`}>
                  <Button appearance="primary" size="md" className="mr-2">
                    Upload Flats
                  </Button>
                </Link>
                <Link to={`/Flat/add`}>
                  <Button appearance="primary" size="md">
                    Add New Flat
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
              data={getData()}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={handleSortColumn}
              loading={loading}
              autoHeight
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column flexGrow={1} sortable dataKey="flatNo">
                <HeaderCell>Flat No.</HeaderCell>
                <Cell dataKey="flatNo">
                  {(rowData) => (
                    <Link to={`/flat/details/${rowData._id}`}>
                      {rowData.flatNo}
                    </Link>
                  )}
                </Cell>
              </Column>

              <Column flexGrow={1}>
                <HeaderCell>Flat Type</HeaderCell>
                <Cell dataKey="flatType" />
              </Column>

              <Column flexGrow={1}>
                <HeaderCell>Flat Area</HeaderCell>
                <Cell dataKey="flatArea" />
              </Column>

              <Column sortable flexGrow={2}>
                <HeaderCell>Owner Name</HeaderCell>
                <Cell dataKey="ownerName" />
              </Column>

              <Column flexGrow={1}>
                <HeaderCell>Other Charges</HeaderCell>
                <Cell>{(rowData) => rowData.otherCharges || 0}</Cell>
              </Column>

              <Column flexGrow={1}>
                <HeaderCell>Is On Rent</HeaderCell>
                <Cell>
                  {(rowData) => {
                    if (typeof rowData?.isOnRent === "boolean") {
                      return <StatusIndicator status={rowData?.isOnRent} />;
                    }
                  }}
                </Cell>
              </Column>

              <Column width={130}>
                <HeaderCell title="Interested In Ebill">Ebill</HeaderCell>
                <Cell>
                  {(rowData) => {
                    if (typeof rowData?.ebillSubscribed === "boolean") {
                      return (
                        <StatusIndicator status={rowData?.ebillSubscribed} />
                      );
                    }
                  }}
                </Cell>
              </Column>

              <Column width={60}>
                <HeaderCell>Active</HeaderCell>
                <Cell>
                  {(rowData) => {
                    if (typeof rowData?.status === "boolean") {
                      return <StatusIndicator status={rowData?.status} />;
                    }
                  }}
                </Cell>
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
                      <Link to={`/flat/edit/${rowData._id}`}>
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
            total={currentFlats.length}
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
          deleteAction={deleteFlatManagement}
          deleteMsg={deleteMessage}
          deleteErr={deleteError}
          consentRequired={deleteConsent}
        />
      </div>
    </Container>
  );
};

export default FlatManagementList;
