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
  Checkbox,
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
import BankDetailService from "../../../services/bankDetails.service.js";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";

import { THEME } from "../../../utilities/theme";

const BankDetail = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [bankDetails, setBankDetails] = useState([]);
  const [topAffixed, setTopAffixed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selBankDetail, setSelBankDetail] = useState({});
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteConsent, setDeleteConsent] = useState(false);
  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
    getBankDetail();
  }, [dispatch, pageTitle]);

  const isSmallScreen = useSmallScreen(768);

  const getBankDetail = async () => {
    try {
      const resp = await trackPromise(
        BankDetailService.getBankDetails(societyId)
      );
      setBankDetails(resp.data.bankDetail);
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Failed to fetch bank details", error);
    }
  };

  const getData = () => {
    let filteredBankDetails = bankDetails.filter((bankDetails) =>
      bankDetails.accountHolderName
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    if (sortColumn && sortType) {
      filteredBankDetails.sort((a, b) => {
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
    return filteredBankDetails.slice(start, end);
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
    setSelBankDetail(item);
    setDeleteMessage(`Do you wish to delete ${item.accountHolderName}?`);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelBankDetail({});
    setDeleteMessage("");
    setDeleteError("");
    setModalOpen(false);
  };

  const deleteBankDetail = async () => {
    try {
      const resp = await trackPromise(
        BankDetailService.deleteBankDetail(selBankDetail._id)
      );
      const { data } = resp.data;
      if (data?.consentRequired) {
        setDeleteConsent(true);
        setDeleteMessage(data.message);
      } else {
        toast.success(resp.data.message || "Bank detail deleted successfully");
        handleCloseModal();
        getBankDetail();
      }
    } catch (error) {
      const errMsg =
        error.response.data.message || "Error in deleting the bank detail";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("Delete bank detail catch => ", error);
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
            {/* <FlexboxGrid.Item>
              <Link to={`/society/add`}>
                <Button appearance="primary" size="md">
                  Add Bank Details
                </Button>
              </Link>
            </FlexboxGrid.Item> */}

            <FlexboxGrid.Item>
              {bankDetails.length === 0 && (
                <Link to={`/bankdetails/add`}>
                  <Button appearance="primary" size="md">
                    Add Bank Details
                  </Button>
                </Link>
              )}
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
              headerHeight={50}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column width={200} sortable>
                <HeaderCell>Acount Holder Name</HeaderCell>
                <Cell dataKey="accountHolderName">
                  {(rowData) => (
                    <Link to={`/bankdetails/details/${rowData._id}`}>
                      {rowData.accountHolderName}
                    </Link>
                  )}
                </Cell>
              </Column>
              <Column width={140} sortable flexGrow={1.5}>
                <HeaderCell>Bank Name</HeaderCell>
                <Cell dataKey="bankName" />
              </Column>
              <Column width={150} sortable>
                <HeaderCell>Branch Name</HeaderCell>
                <Cell dataKey="branchName" />
              </Column>
              <Column width={180} sortable>
                <HeaderCell>Account Number</HeaderCell>
                <Cell dataKey="accountNumber" />
              </Column>
              <Column width={150} sortable>
                <HeaderCell>IFSC Code</HeaderCell>
                <Cell dataKey="IFSC_Code" />
              </Column>
              <Column width={150} sortable>
                <HeaderCell>Account Type</HeaderCell>
                <Cell dataKey="account_type" />
              </Column>
              <Column width={120} sortable>
                <HeaderCell>Is verified</HeaderCell>
                <Cell dataKey="is_verified">
                  {(rowData) => (
                    <Checkbox checked={rowData.is_verified} disabled />
                  )}
                </Cell>
              </Column>

              <Column width={80} align="center" className="col-action">
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
                      <Link to={`/bankdetails/edit/${rowData._id}`}>
                        <IconButton
                          title="edit"
                          icon={<EditIcon color={THEME[0].CLR_PRIMARY} />}
                        />
                      </Link>
                      {/* <IconButton
                        title="delete"
                        icon={<TrashIcon color="red" />}
                        onClick={() => handleOpenModal(rowData)}
                      /> */}
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
            total={bankDetails.length}
            limitOptions={[5, 10, 30, 50]}
            limit={limit}
            activePage={page}
            onChangePage={setPage}
            onChangeLimit={handleChangeLimit}
          />
        </div>

        <DeleteModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          deleteAction={deleteBankDetail}
          deleteMsg={deleteMessage}
          deleteErr={deleteError}
          consentRequired={deleteConsent}
        />
      </div>
    </Container>
  );
};

export default BankDetail;
