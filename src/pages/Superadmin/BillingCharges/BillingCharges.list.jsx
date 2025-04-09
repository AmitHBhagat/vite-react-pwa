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
  FlexboxGrid,
} from "rsuite";

import billChargeService from "../../../services/billingCharge.service";
import { trackPromise } from "react-promise-tracker";
import { Link } from "react-router-dom";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import SearchIcon from "@rsuite/icons/Search";
import EditIcon from "@rsuite/icons/Edit";

import classNames from "classnames";
import { IconButton } from "rsuite";
import { setRouteData } from "../../../stores/appSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { THEME } from "../../../utilities/theme";
import "./billingCharges.css";
import "../../../layouts/ProtectedLayout.css";
import { BREAK_POINTS } from "../../../utilities/constants";
const BillsList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const toaster = useToaster();
  const [bills, setBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = React.useState(5);
  const [page, setPage] = React.useState(1);
  const [topAffixed, setTopAffixed] = useState(false);
  const [sortColumn, setSortColumn] = React.useState();
  const [sortType, setSortType] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [pageError, set_pageError] = useState("");
  const [status, setStatus] = useState(false);
  const [disable, setDisable] = useState(false);

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    getBills();
  }, []);

  const getBills = async () => {
    try {
      const resp = await trackPromise(billChargeService.getCharges());
      setBills(resp.data.data);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.error("Failed to fetch bills", error);
    }
  };

  const getData = () => {
    let filteredBills = bills;

    if (searchQuery) {
      filteredBills = bills.filter((bill) =>
        bill.billName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    let sortedBills = [...filteredBills];
    if (sortColumn && sortType) {
      sortedBills.sort((a, b) => {
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
    const paginatedBills = sortedBills.slice(start, end);
    paginatedBills.forEach((bill) => {
      bill.societyName = bill.societyName?.societyName || bill.societyName;
    });
    return paginatedBills;
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
    const bill = bills.find((bill) => bill._id === itemId);
    setStatus(bill.isActive);
    setSelectedItemId(itemId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItemId(null);
  };

  async function deleteBill(id) {
    try {
      const resp = await trackPromise(billChargeService.deleteCharge(id));
      const { data } = resp;

      if (data?.success === true) {
        toast.success(data.message || "Bill deleted successfully");
        getBills();
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

  const isSmallScreen = useSmallScreen(BREAK_POINTS.MD);

  return (
    <Container className="">
      <ScrollToTop />
      <div
        className={classNames("inner-container", { "affixed-top": topAffixed })}
      >
        <Affix>
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
              wordWrap="break-word"
              data={getData()}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={handleSortColumn}
              loading={loading}
              affixHeader={60}
              headerHeight={40}
              autoHeight
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column flexGrow={1.5} minWidth={250} sortable>
                <HeaderCell>Society Name</HeaderCell>
                <Cell dataKey="societyName">
                  {(rowData) => (
                    <Link to={`/bill/${rowData.billingCharge}`}>
                      {rowData.societyName}
                    </Link>
                  )}
                </Cell>
              </Column>
              <Column flexGrow={1} minWidth={135} sortable>
                <HeaderCell>Members Count</HeaderCell>
                <Cell dataKey="societyMembersCount" />
              </Column>
              <Column flexGrow={1} minWidth={135} sortable>
                <HeaderCell>Activation Year</HeaderCell>
                <Cell dataKey="societyActivationYear" />
              </Column>
              <Column flexGrow={1} minWidth={135} sortable>
                <HeaderCell>Activation Month</HeaderCell>
                <Cell dataKey="societyActivationMonth" />
              </Column>
              <Column
                flexGrow={0.5}
                minWidth={90}
                align="center"
                className="col-action"
              >
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
                      <Link to={`/edit-bill/${rowData.billingCharge}`}>
                        <IconButton
                          title="edit"
                          icon={
                            <EditIcon
                              className="icon-blue"
                              color={THEME[0].CLR_PRIMARY}
                            />
                          }
                        />
                      </Link>
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
            total={bills.length}
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

export default BillsList;
