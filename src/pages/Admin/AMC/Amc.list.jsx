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
  Whisper,
  Tooltip,
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
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import AmcService from "../../../services/amc.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { formatDate } from "../../../utilities/formatDate";
import { THEME } from "../../../utilities/theme";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import { BREAK_POINTS } from "../../../utilities/constants";

const AmcList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authState);
  const [pageError, setPageError] = useState("");
  const [AmcList, setAmcList] = useState([]);
  const [topAffixed, setTopAffixed] = useState(false);
  const [searchAMC, setSearchAMC] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConsent, setDeleteConsent] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [selectedAmc, setSelectedAmc] = useState({});

  const societyId = authState?.user?.societyName;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    getAmcs();
  }, [dispatch, pageTitle]);

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  const getAmcs = async () => {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(AmcService.getAmcs(societyId));
      const { data } = resp;
      if (data.success) {
        respdata = data.amcs;
      }
    } catch (err) {
      console.error("Amc fetch catch => ", err);
      const errMsg = err?.response?.data?.message || `Error in fetching amc`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setAmcList(respdata);
  };

  const getData = () => {
    let filteredList = AmcList?.filter(
      (itm) =>
        itm.vendorType?.toLowerCase()?.includes(searchAMC.toLowerCase()) ||
        itm.vendorName?.toLowerCase()?.includes(searchAMC.toLowerCase())
    );

    if (sortColumn && sortType) {
      filteredList?.sort((a, b) => {
        let x = a[sortColumn] || "";
        let y = b[sortColumn] || "";

        if (typeof x === "string" && typeof y === "string") {
          return sortType === "asc" ? x.localeCompare(y) : y.localeCompare(x);
        }
        return sortType === "asc" ? x - y : y - x;
      });
    }

    const start = limit * (page - 1);
    const end = start + limit;
    return filteredList?.slice(start, end);
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
    setSelectedAmc(item);
    setDeleteMessage(`Do you wish to delete this AMC?`);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedAmc({});
    setDeleteMessage("");
    setDeleteError("");
    setModalOpen(false);
  };

  const deleteAMC = async () => {
    try {
      const resp = await trackPromise(AmcService.deleteAmc(selectedAmc._id));
      const { data } = resp.data;
      if (data?.consentRequired) {
        setDeleteConsent(true);
        setDeleteMessage(data.message);
      } else {
        toast.success(resp.data.message || "Amc deleted successfully");
        handleCloseModal();
        getAmcs();
      }
    } catch (error) {
      const errMsg = error.response.data.message || "Error in deleting the amc";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("Delete amc catch => ", error);
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
                  value={searchAMC}
                  onChange={setSearchAMC}
                />
                <InputGroup.Button>
                  <SearchIcon />
                </InputGroup.Button>
              </InputGroup>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item>
              <Link to={`/amc/add`}>
                <Button appearance="primary" size="md">
                  Add AMC
                </Button>
              </Link>
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
              <Column sortable flexGrow={1.5}>
                <HeaderCell>AMC Description</HeaderCell>
                <Cell dataKey="amcDescription">
                  {(rowData) => (
                    <Link to={`/amc/details/${rowData._id}`}>
                      <div className="two-line-ellipsis">
                        {rowData.amcDescription}
                      </div>
                    </Link>
                  )}
                </Cell>
              </Column>
              <Column sortable flexGrow={1}>
                <HeaderCell>Vendor Name</HeaderCell>
                <Cell dataKey="vendorName"></Cell>
              </Column>

              <Column flexGrow={1.2}>
                <HeaderCell>Vendor Type</HeaderCell>
                <Cell dataKey="vendorType"></Cell>
              </Column>

              <Column flexGrow={0.55}>
                <HeaderCell>Vendor Mobile</HeaderCell>
                <Cell dataKey="vendorMobile" />
              </Column>

              <Column flexGrow={0.6}>
                <HeaderCell>Amc Start Date</HeaderCell>
                <Cell dataKey="amcStartDate">
                  {(rawData) => formatDate(rawData.amcStartDate)}
                </Cell>
              </Column>
              <Column flexGrow={0.6}>
                <HeaderCell>Amc End Date</HeaderCell>
                <Cell dataKey="amcEndDate">
                  {(rawData) => formatDate(rawData.amcEndDate)}
                </Cell>
              </Column>

              <Column width={50} align="center" className="col-action">
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
                      <Link to={`/amc/edit/${rowData._id}`}>
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
            total={AmcList?.length}
            limitOptions={[5, 10, 30, 50]}
            limit={limit}
            activePage={page}
            onChangePage={setPage}
            onChangeLimit={handleChangeLimit}
          />
        </div>
        <DeleteModal
          showBigMsg={true}
          bigMsg={selectedAmc.amcDescription}
          isOpen={modalOpen}
          onClose={handleCloseModal}
          deleteAction={deleteAMC}
          deleteMsg={deleteMessage}
          deleteErr={deleteError}
          consentRequired={deleteConsent}
        />

        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </Container>
  );
};

export default AmcList;
