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
  Checkbox,
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import SearchIcon from "@rsuite/icons/Search";
import { IconButton } from "rsuite";
import EditIcon from "@rsuite/icons/Edit";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import classNames from "classnames";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import BankDetailService from "../../../services/bankDetails.service.js";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { PageErrorMessage } from "../../../components/Form/ErrorMessage";
import { THEME } from "../../../utilities/theme";
import Paginator, {
  useTableData,
  useTableState,
} from "../../../components/Table/Paginator";

const BankDetail = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [bankDetails, setBankDetails] = useState([]);
  const [topAffixed, setTopAffixed] = useState(false);
  const [pageError, setPageError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selBankDetail, setSelBankDetail] = useState({});
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteConsent, setDeleteConsent] = useState(false);
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
    getBankDetail();
  }, [dispatch, pageTitle]);

  async function getBankDetail() {
    setPageError("");
    let respdata = [];
    try {
      const resp = await trackPromise(
        BankDetailService.getBankDetails(societyId)
      );

      const { data } = resp;
      if (data.success) respdata = resp.data.bankDetail;
    } catch (err) {
      console.error("Bank details fetch catch => ", err);
      const errMsg =
        err?.response?.data?.message || `Error in fetching bank details`;
      toast.error(errMsg);
      setPageError(errMsg);
    }
    setBankDetails(respdata);
  }

  const paginatedData = useTableData({
    data: bankDetails,
    searchQuery,
    sortColumn,
    sortType,
    page,
    limit,
    filterElement: "accountHolderName",
    filterElement2: "",
  });

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
              data={paginatedData.limitData}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={setSort}
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
                    </div>
                  )}
                </Cell>
              </Column>
            </Table>
          </Col>
        </Row>
        <Paginator
          data={bankDetails}
          limit={limit}
          page={page}
          setPage={setPage}
          setLimit={setLimit}
        />

        <DeleteModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          deleteAction={deleteBankDetail}
          deleteMsg={deleteMessage}
          deleteErr={deleteError}
          consentRequired={deleteConsent}
        />

        <PageErrorMessage show={Boolean(pageError)} msgText={pageError} />
      </div>
    </Container>
  );
};

export default BankDetail;
