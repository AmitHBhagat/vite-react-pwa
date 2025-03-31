import React, { useState, memo, useEffect } from "react";
import { Table, IconButton } from "rsuite";
import { Cell, HeaderCell } from "rsuite-table";
import Column from "rsuite/esm/Table/TableColumn";
import EditIcon from "@rsuite/icons/Edit";
import TrashIcon from "@rsuite/icons/Trash";
import DeleteModal from "../../../components/DeleteModal/Delete.Modal";
import DeleteRestrictedModal from "../../../components/DeleteModal/Delete.Restricted.Modal";
import billChargeService from "../../../services/billingCharge.service";
import { trackPromise } from "react-promise-tracker";
import { toast } from "react-toastify";
import MaintenanceUpdateModal from "../../Admin/Maintenance/MaintenanceInformation.update.modal";
import CheckOutlineIcon from "@rsuite/icons/CheckOutline";
import CloseOutlineIcon from "@rsuite/icons/CloseOutline";
import { THEME } from "../../../utilities/theme";
import { capitalizeFirstLetter } from "../../../utilities/functions";
import StatusIndicator from "../../../components/StatusIndicator/StatusIndicator";

const BillingTable = memo(
  ({
    billId,
    pageTitle,
    billsData,
    setBillDetails,
    selectedBill,
    setSelectedBill,
    frmObj,
    isMaintenanceModalOpen,
    setIsMaintenanceModalOpen,
    status,
    setStatus,
    pageType,
  }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRestrictedModalOpen, setIsRestrictedModalOpen] = useState(false);
    const [pageError, set_pageError] = useState("");
    const [currentIndex, setcurrentIndex] = useState("");

    useEffect(() => {
      if (billId !== null) {
        fetchbillDetails(billId);
      }
    }, [billId]);

    async function fetchbillDetails(billId) {
      try {
        const resOfBillingCharges = await trackPromise(
          billChargeService.getChargeById(billId)
        );

        const billingChargData = resOfBillingCharges.data;
        if (billingChargData.success) {
          setBillDetails(billingChargData.data.charges);
        }
      } catch (err) {
        toast.error(err.response.data.message);
        console.error("Fetch bill details catch => ", err);
      }
    }

    async function deleteBill(deleteIndex) {
      if (deleteIndex !== null) {
        setBillDetails((prevDetails) => {
          return prevDetails.filter((_, index) => index !== deleteIndex);
        });
        handleCloseModal();
      }
    }
    const handleModal = ([rowIndex, title], rowData) => {
      setcurrentIndex([rowIndex, title]);
      if (rowData.isDefault) {
        setIsRestrictedModalOpen(true);
      } else {
        setIsModalOpen(true);
      }
    };
    const handleCloseModal = () => {
      setIsModalOpen(false);
      setIsRestrictedModalOpen(false);
      setIsMaintenanceModalOpen(false);
    };

    // for Maintenance modal (admin section)
    async function handleMaintenanceUpdateModal(selectedBill, rowIndex) {
      setStatus("Edit");

      setSelectedBill({ ...selectedBill, rowIndex });
      setIsMaintenanceModalOpen(true);
    }
    return (
      <>
        {isModalOpen && (
          <DeleteModal
            itemId={currentIndex[0]}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            deleteAction={() => deleteBill(currentIndex[0])}
            deleteMsg={`Do you wish to delete ${currentIndex[1]}?`}
          />
        )}
        {isRestrictedModalOpen && (
          <DeleteRestrictedModal
            isOpen={isRestrictedModalOpen}
            onClose={handleCloseModal}
          />
        )}
        {isMaintenanceModalOpen && (
          <MaintenanceUpdateModal
            isOpen={isMaintenanceModalOpen}
            onClose={handleCloseModal}
            selectedBill={selectedBill}
            setSelectedBill={setSelectedBill}
            status={status}
            setStatus={setStatus}
          />
        )}

        <Table
          data={billsData}
          autoHeight
          rowKey="id"
          rowHeight={60}
          className="tbl-compact"
        >
          <Column flexGrow={1.5} minWidth={150}>
            <HeaderCell>Title</HeaderCell>
            <Cell dataKey="title" />
          </Column>

          <Column flexGrow={1} minWidth={135}>
            <HeaderCell>Value</HeaderCell>
            <Cell dataKey="value" />
          </Column>

          <Column flexGrow={1} minWidth={135}>
            <HeaderCell>Calculation Type</HeaderCell>

            <Cell>{(rowData) => capitalizeFirstLetter(rowData.calcType)}</Cell>
          </Column>

          <Column flexGrow={1} minWidth={90}>
            <HeaderCell>Charge Type</HeaderCell>

            <Cell>
              {(rowData) => capitalizeFirstLetter(rowData.chargeType)}
            </Cell>
          </Column>

          <Column flexGrow={1} minWidth={120}>
            <HeaderCell>Flat Dependent</HeaderCell>
            <Cell>
              {(rowData) => (
                <StatusIndicator status={rowData?.isFlatDependent} />
              )}
            </Cell>
          </Column>

          <Column flexGrow={1} minWidth={135}>
            <HeaderCell>Dependency</HeaderCell>
            <Cell dataKey="dependencyParam" />
          </Column>

          <Column flexGrow={0.5} minWidth={60}>
            <HeaderCell>Status</HeaderCell>
            <Cell>
              {(rowData) => <StatusIndicator status={rowData?.status} />}
            </Cell>
          </Column>

          {(pageType === "billingChargesEdit" ||
            pageType === "maintenanceInformationEdit") && (
            <Column flexGrow={1} minWidth={120} align="center">
              <HeaderCell>Actions</HeaderCell>
              <Cell>
                {(rowData, rowIndex) => (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.625rem",
                    }}
                  >
                    <IconButton
                      title="edit"
                      icon={<EditIcon className="icon-blue" />}
                      onClick={() => {
                        handleMaintenanceUpdateModal(rowData, rowIndex);
                      }}
                    />
                    {pageType === "billingChargesEdit" && (
                      <IconButton
                        title="delete"
                        icon={<TrashIcon color="red" />}
                        onClick={() =>
                          handleModal([rowIndex, rowData.title], rowData)
                        }
                      />
                    )}
                  </div>
                )}
              </Cell>
            </Column>
          )}
        </Table>
      </>
    );
  }
);

export default BillingTable;
