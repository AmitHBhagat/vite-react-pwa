import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Pagination,
  Affix,
  Button,
  FlexboxGrid,
  InputPicker,
} from "rsuite";
import { trackPromise } from "react-promise-tracker";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import EditIcon from "@rsuite/icons/Edit";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { IconButton } from "rsuite";
import TrashIcon from "@rsuite/icons/Trash";
import DocPassIcon from "@rsuite/icons/DocPass";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import classNames from "classnames";
import { Link, useNavigate } from "react-router-dom";
import PaymentsService from "../../../services/payment.service";
import { setRouteData } from "../../../stores/appSlice";
import ScrollToTop from "../../../utilities/ScrollToTop";
import { useSmallScreen } from "../../../utilities/useWindowSize";
import { THEME } from "../../../utilities/theme";
import { MONTHS } from "../../../utilities/constants";
import { formatDate } from "../../../utilities/formatDate";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import { exportToExcel } from "../../../utilities/ExportDataToExcelOrPDF";

const PaymentDetail = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [payments, setPayments] = useState([]);

  const [month, setMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );
  const [year, setYear] = useState(new Date().getFullYear());
  const [topAffixed, setTopAffixed] = useState(false);
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [loading, setLoading] = useState(false);
  const [generateReceiptLoading, setGenerateReceiptLoading] = useState([
    false,
    "null",
  ]);
  const [paymentId, setPaymentId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteConsent, setDeleteConsent] = useState(false);
  const [pageError, setPageError] = useState("");

  const authState = useSelector((state) => state.authState);
  const societyId = authState?.user?.societyName;
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setRouteData({ pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    getPayments();
  }, [societyId]);

  const isSmallScreen = useSmallScreen(768);

  const getPayments = async () => {
    setLoading(true);
    let paymentsArray = [];
    try {
      const resp = await trackPromise(PaymentsService.getPayments(societyId));
      const { data } = resp;
      if (data.success) paymentsArray = data.paymentDetails;
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || `Error in fetching payments`;
      toast.error(errMsg);
      console.error("Failed to fetch payments", errMsg);
      setLoading(false);
      setPageError(errMsg);
    }
    setPayments(paymentsArray);
    setLoading(false);
  };

  const generateReceipt = async (paymentDetailsId) => {
    try {
      setGenerateReceiptLoading([true, paymentDetailsId]);
      const payload = {
        paymentDetailsId,
      };
      const resp = await trackPromise(
        PaymentsService.generatePaymentReceipt(payload)
      );
      getPayments();
      toast.success("Payment receipt generated successfully");
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Failed to generate payments", error);
    }
    setGenerateReceiptLoading([false, "null"]);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(
      (payment) => payment.year === String(year) && payment.month === month
    );
  }, [payments, month, year]);

  const getData = () => {
    if (!sortColumn || !sortType) {
      return filteredPayments.slice().sort((a, b) => a.paymentNo - b.paymentNo);
    }

    const sortedPayments = [...filteredPayments].sort((a, b) => {
      let x = 0,
        y = 0;

      if (sortColumn.startsWith("charge_")) {
        const chargeId = sortColumn.replace("charge_", "");
        x = a.paymentCharges.find((c) => c._id === chargeId)?.value || 0;
        y = b.paymentCharges.find((c) => c._id === chargeId)?.value || 0;
      } else {
        x = a[sortColumn];
        y = b[sortColumn];

        if (typeof x === "string") {
          return sortType === "asc" ? x.localeCompare(y) : y.localeCompare(x);
        }
      }

      return sortType === "asc" ? x - y : y - x;
    });

    return sortedPayments;
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

  const handleExport = async () => {
    await exportToExcel({
      data: getData(),
      worksheetName: "Maintenance Payments",
      headersConfig: [
        { key: "flatNo", title: "Flat No" },
        { key: "ownerName", title: "Owner Name" },
        { key: "bankDetails", title: "Bank Branch" },
        { key: "paymentMode", title: "Payment Mode" },
        { key: "transactionDetails", title: "Transaction Details" },
        { key: "month", title: "Maintenance Month" },
        { key: "year", title: "Maintenance Year" },
        { key: "paymentType", title: "Payment Type" },
        {
          key: "amount",
          title: "Amount",
          // formatter: (val) => `${Number(val).toLocaleString()}`, // Custom formatter
        },
        {
          key: "date",
          title: "Payment Date",
          formatter: formatDate,
        },
      ],
      filename: `Payment Details-${month}-${year}.xlsx`,
      onError: (error) => toast.error("Export failed!"),
      onSuccess: () => toast.success("Export successful!"),
    });
  };
  const handleOpenModal = (item) => {
    setPaymentId(item._id);

    setDeleteMessage(
      `Do you wish to delete the payment of ${item.amount} against the flat ${item.flatNo}?`
    );
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setPaymentId({});
    setDeleteMessage("");
    setDeleteError("");
    setModalOpen(false);
  };

  const deletePaymentReceipt = async () => {
    try {
      const resp = await trackPromise(
        PaymentsService.deletePaymentDetails(paymentId)
      );
      const { data } = resp.data;
      if (data?.consentRequired) {
        setDeleteConsent(true);
        setDeleteMessage(data.message);
      } else {
        toast.success(
          resp.data.message || "payment detail deleted successfully"
        );
        handleCloseModal();

        getPayments();
      }
    } catch (error) {
      const errMsg =
        error.response.data.message || "Error in deleting the user";
      toast.error(errMsg);
      setDeleteError(errMsg);
      console.error("Delete payment detail catch => ", error);
    }
  };

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1].map((year) => ({
      label: year,
      value: year,
    }));
  }, []);
  const finalDataForTable = () => {
    const sortedData = getData();
    const start = limit * (page - 1);
    const end = start + limit;
    return sortedData.slice(start, end);
  };

  return (
    <Container className="">
      <ScrollToTop />

      <div
        className={classNames("inner-container", { "affixed-top": topAffixed })}
      >
        <Affix onChange={setTopAffixed}>
          <FlexboxGrid justify="space-between" className="flxgrid-theme">
            <FlexboxGrid.Item
              className="filters-row section-mb"
              style={{ display: "flex", gap: "1rem" }}
            >
              <InputPicker
                data={years}
                value={year}
                onChange={(value) => setYear(value)}
                style={{ width: 150 }}
                className="rs-ml-2"
              />
              <InputPicker
                data={MONTHS}
                value={month}
                onChange={(value) => setMonth(value)}
                style={{ width: 150 }}
                className="rs-ml-2"
              />
              <Button appearance="primary" size="md" onClick={handleExport}>
                Export to Excel
              </Button>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={{ display: "flex", gap: "1rem" }}>
              <Link to={`/payments/add`}>
                <Button appearance="primary" size="md">
                  Add Payment
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
              data={finalDataForTable()}
              sortColumn={sortColumn}
              sortType={sortType}
              onSortColumn={handleSortColumn}
              loading={loading}
              autoHeight
              headerHeight={40}
              rowHeight={50}
              className="tbl-theme tbl-compact"
            >
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Flat No</HeaderCell>
                <Cell dataKey="flatNo" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Owner Name</HeaderCell>
                <Cell dataKey="ownerName" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Bank Branch</HeaderCell>
                <Cell dataKey="bankDetails" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Payment Mode</HeaderCell>
                <Cell dataKey="paymentMode" />
              </Column>

              <Column minWidth={200} sortable flexGrow={2}>
                <HeaderCell>Transaction Details</HeaderCell>
                <Cell dataKey="transactionDetails" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Maintenance Month</HeaderCell>
                <Cell dataKey="month" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Maintenance year</HeaderCell>
                <Cell dataKey="year" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Payment Type</HeaderCell>
                <Cell dataKey="paymentType" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Amount</HeaderCell>
                <Cell dataKey="amount" />
              </Column>
              <Column minWidth={150} sortable flexGrow={1.5}>
                <HeaderCell>Payment Date</HeaderCell>
                <Cell>{(rowData) => formatDate(rowData.date)}</Cell>
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
                      <IconButton
                        type="Generate Receipt"
                        icon={<DocPassIcon color={THEME[0].CLR_PRIMARY} />}
                        disabled={rowData.paymentReciptGenerated === "true"}
                        onClick={() => generateReceipt(rowData._id)}
                        loading={
                          generateReceiptLoading[0] &&
                          generateReceiptLoading[1] === rowData._id
                        }
                      />
                      <IconButton
                        title="edit"
                        icon={<EditIcon color={THEME[0].CLR_PRIMARY} />}
                        onClick={() =>
                          navigate(`/payments/edit/${rowData._id}`)
                        }
                        disabled={rowData.paymentReciptGenerated === "true"}
                      />
                      <IconButton
                        title="delete"
                        icon={<TrashIcon color={THEME[0].CLR_NEGATE} />}
                        onClick={() => handleOpenModal(rowData)}
                        disabled={rowData.paymentReciptGenerated === "true"}
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
            total={filteredPayments.length}
            limitOptions={[5, 10, 30, 50]}
            limit={limit}
            activePage={page}
            onChangePage={setPage}
            onChangeLimit={handleChangeLimit}
          />
        </div>
      </div>
      <DeleteModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        deleteAction={deletePaymentReceipt}
        deleteMsg={deleteMessage}
        deleteErr={deleteError}
        consentRequired={deleteConsent}
      />
    </Container>
  );
};

export default PaymentDetail;
