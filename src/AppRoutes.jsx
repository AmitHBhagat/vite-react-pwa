import React from "react";
import { Navigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { Icon } from "@rsuite/icons";
import { FaUsers } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { HiOutlineUsers } from "react-icons/hi2";
import { PiUsersLight } from "react-icons/pi";
import { PiUsers } from "react-icons/pi";
import { PiBuildings } from "react-icons/pi";
import { RiBillLine } from "react-icons/ri";
import { MdCategory } from "react-icons/md";
import { FaLayerGroup } from "react-icons/fa";
import { MdOutlineMapsHomeWork } from "react-icons/md";
import { HiBuildingLibrary } from "react-icons/hi2";
import { HiUsers } from "react-icons/hi";
import { FaTools } from "react-icons/fa";
import ToolsIcon from "@rsuite/icons/Tools";
import { MdNotifications } from "react-icons/md";
import { RiMoneyRupeeCircleLine } from "react-icons/ri";
import { MdCurrencyRupee } from "react-icons/md";
import { MdQuestionMark } from "react-icons/md";
import { FaMoneyBillWave } from "react-icons/fa6";
import { FaRegHandshake } from "react-icons/fa6";
import { MdEventNote } from "react-icons/md";
import { BsBoxes } from "react-icons/bs";
import { MdOutlinePoll } from "react-icons/md";
import WechatCustomerOutlineIcon from "@rsuite/icons/WechatCustomerOutline";
import { FaPeopleCarry } from "react-icons/fa";
import { MdOutlineWorkOutline } from "react-icons/md";
import { CiMoneyCheck1 } from "react-icons/ci";
import { GrUserManager } from "react-icons/gr";
import SearchDataLiveIcon from "@rsuite/icons/SearchDataLive";
import { SlPeople } from "react-icons/sl";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import ProtectedLayout from "./layouts/ProtectedLayout";

// Pages
import Users from "./pages/Superadmin/AdminUsers/User.list";
import AddUser from "./pages/Superadmin/AdminUsers/User.add";
import UserDetails from "./pages/Superadmin/AdminUsers/User.details";
import Home from "./pages/Public/Home/Home";
import CreatePassword from "./pages/Public/ForgotPassword/CreatePassword";
import ForgotPassword from "./pages/Public/ForgotPassword/ForgotPassword";
import ChangePassword from "./pages/Profile/ChangePassword";
import SocietyList from "./pages/Superadmin/Society/Society.list";
import SocietyDetails from "./pages/Superadmin/Society/Society.details";
import AddSociety from "./pages/Superadmin/Society/Society.add";
import SocietyInfo from "./pages/Admin/Society/SocietyInfo";
import SocietyInfoEdit from "./pages/Admin/Society/SocietyInfo.edit";
import SocietyImages from "./pages/Admin/Society/Society.Images";
import ProfileDetails from "./pages/Profile/Profile.details";
import ProfileEdit from "./pages/Profile/Profile.edit";
import BillsList from "./pages/Superadmin/BillingCharges/BillingCharges.list";
import BillDetails from "./pages/Superadmin/BillingCharges/BillingCharges.details";
import AddBill from "./pages/Superadmin/BillingCharges/BillingCharges.add";
import AmentityList from "./pages/Superadmin/Amenity/Amenity.list";
import AmenityDetails from "./pages/Superadmin/Amenity/Amenity.details";
import AddAmenity from "./pages/Superadmin/Amenity/Amenity.add";
import AddSocietyImage from "./pages/Admin/Society/SocietyImage.add";
import SocietyContact from "./pages/Admin/Society/SocietyContact.list";
import SocietyContactDetail from "./pages/Admin/Society/SocietyContact.details";
import AddSocietyContact from "./pages/Admin/Society/SocietyContact.add";
import RequestDemoList from "./pages/Superadmin/RequestDemo/RequestDemo.list";
import RequestDemoDetails from "./pages/Superadmin/RequestDemo/RequestDemo.details";
import BankDetail from "./pages/Admin/BankDetails/BankDetails.list";
import MaintenanceDetails from "./pages/Admin/Maintenance/MaintenanceInformation.details";
import BankDetailDetails from "./pages/Admin/BankDetails/BankDetails.details";
import AddEditBankDetail from "./pages/Admin/BankDetails/BankDetails.add";
import MemberUsers from "./pages/Admin/SocietyUsers/MemberUser";
import MemberUserDetails from "./pages/Admin/SocietyUsers/MemberUser.details";
import SocietyInformation from "./pages/User/Society/SocietyInformation";
import AddMaintenance from "./pages/Admin/Maintenance/MaintenanceInformation.edit";
import AddMemberUser from "./pages/Admin/SocietyUsers/MemberUser.add";
import UploadUser from "./pages/Admin/SocietyUsers/UploadUser";
import Expense from "./pages/Admin/Expense/Expense.list";
import ExpenseCategory from "./pages/Admin/Expense/ExpenseCategory";
import AddExpenseCategory from "./pages/Admin/Expense/ExpenseCategory.add";
import ExpenseDetails from "./pages/Admin/Expense/ExpenseDetails";
import AddEditExpense from "./pages/Admin/Expense/Expense.add";
import NoticeList from "./pages/Admin/Notifications/Notices.list";
import NoticeDetails from "./pages/Admin/Notifications/Notices.details";
import BillingList from "./pages/User/Billing/Billing.list";
import PaymentList from "./pages/User/Payment/Payment.list";
import AddEditNotice from "./pages/Admin/Notifications/Notice.add";

import FlatManagementList from "./pages/Admin/FlatManagement/FlatManagement.list";
import UploadFlat from "./pages/Admin/FlatManagement/UplodFlats";
import AddFlatManagement from "./pages/Admin/FlatManagement/FlatManagement.add";
import FlatDetails from "./pages/Admin/FlatManagement/FlatManagement.Detail";
import MaintenanceManagement from "./pages/Admin/MaintenanceManagement/MaintenanceManage";
import FlatAssociation from "./pages/Admin/FlatAssociation/FlatAssociation.add";
import MaintenManageDetails from "./pages/Admin/MaintenanceManagement/MaintenManage.details";
import RequestQueries from "./pages/Admin/RequestQuery/RequestQuery.list";
import RequestQueryDetail from "./pages/Admin/RequestQuery/RequestQuery.details";
import RequestQuery from "./pages/User/RequestQuery/RequestQuery.list";
import RequestQueryAdd from "./pages/User/RequestQuery/RequestQuery.add";
import BillingAdjustment from "./pages/User/BillingAdjustment/BillingAdjustment.list";
import MeetingsList from "./pages/User/Meetings/Meetings.list";
import NoticesList from "./pages/User/Notices/Notices.list";
import VendorsList from "./pages/User/Vendor/Vendor.list";
import PollingList from "./pages/User/Polling/Polling.list";
import EditRequestQuery from "./pages/Admin/RequestQuery/RequestQuery.edit";
import BillingDetail from "./pages/Admin/Billings/Billing.Details";
import BillingAdjustments from "./pages/Admin/Billings/BillingAdjustment";
import AddBillingAdjustment from "./pages/Admin/Billings/BillingAdjustment.add";
import MeetingList from "./pages/Admin/Meetings/MeetingMaster";
import AddEditMeeting from "./pages/Admin/Meetings/Meeting.add";
import VendorTypeList from "./pages/Admin/VendorType/VendorType.list";
import AmcList from "./pages/Admin/AMC/Amc.list";
import AddEditAmc from "./pages/Admin/AMC/Amc.add";
import PollingsList from "./pages/Admin/Polling/Polling.list";
import AddPolling from "./pages/Admin/Polling/Polling.add";
import PaymentDetail from "./pages/Admin/Payments/Payment.Details";
import PaymentReceiptDetail from "./pages/Admin/Payments/PaymentReceipt.Details";
import AddEditPayment from "./pages/Admin/Payments/Payment.add.edit";
import VisitorList from "./pages/Security/Visitor/Visitor.list";
import VisitorAdd from "./pages/Security/Visitor/Visitor.add";
import AmcDetail from "./pages/Admin/AMC/Amc.details";
import MeetingDetails from "./pages/Admin/Meetings/Meeting.details";
import VendorList from "./pages/Admin/Vendor/Vendors.list";
import AddEditVendor from "./pages/Admin/Vendor/Vendor.add";
import AddPaymentReceipt from "./pages/Admin/Payments/PaymentReceipt.add";
import LeaseHoldFlatsList from "./pages/Admin/Reports/LeaseHoldFlat.list";
import IndividualAccountList from "./pages/Admin/Reports/IndividualAccount.list";
import SecurityUserList from "./pages/Admin/SocietyUsers/SecurityUser.list";
import SecurityUserAdd from "./pages/Admin/SocietyUsers/SecurityUser.add";
import VisitorListAdmin from "./pages/Admin/Visitors/Visitors.list";
import OutstandingList from "./pages/Admin/Reports/Outstanding.list";
import IncomeExpenditureList from "./pages/Admin/Reports/IncomeExpenditure.list";
import ExpenseAccountLedgerList from "./pages/Admin/Reports/ExpenseAccountLedger.list";
import Dashboard from "./pages/Admin/DashBoard/Dashboard";

const USER_ROLES = {
  superAdmin: "superAdmin",
  admin: "admin",
  user: "user",
  security: "security",
};

const SuperadminNavs = [
  {
    eventKey: "societies",
    icon: <Icon as={PiBuildings} />,
    title: "Society List",
    to: "/societies",
  },
  {
    eventKey: "Admin users",
    icon: <Icon as={PiUsers} />,
    title: "Admin Users",
    to: "/admin-users",
  },
  {
    eventKey: "Billing Charges",
    icon: <Icon as={RiBillLine} />,
    title: "Billing Charges",
    to: "/billing-charges",
  },
  {
    eventKey: "amenityLists",
    icon: <Icon as={MdOutlineMapsHomeWork} />,
    title: "Amenity Lists",
    to: "/amenity-lists",
  },
  {
    eventKey: "requestDemo",
    icon: <Icon as={WechatCustomerOutlineIcon} />,
    title: "Request Demo",
    to: "/request-demo",
  },
];

const AdminNavs = [
  {
    eventKey: "dashboard",
    title: "Dashboard",
    icon: <Icon as={MdDashboard} />,
    to: "/dashboard",
  },
  {
    eventKey: "society",
    title: "Society",
    icon: <Icon as={MdDashboard} />,
    children: [
      {
        eventKey: "society-info",
        title: "Society Information",
        to: "/society-info",
      },
      {
        eventKey: "society-images",
        title: "Society Images",
        to: "/society-images",
      },
      {
        eventKey: "society-contacts",
        title: "Society Contacts",
        to: "/society-contacts",
      },
    ],
  },
  {
    eventKey: "bankdetails",
    title: "Bank Management",
    icon: <Icon as={HiBuildingLibrary} />,
    children: [
      {
        eventKey: "bankdetails",
        title: "Bank Details",
        to: "/bankdetails",
      },
    ],
  },
  {
    eventKey: "societyUsers",
    title: "Society Users",
    icon: <Icon as={HiUsers} />,
    children: [
      {
        eventKey: "adminUser",
        title: "Admin User",
        to: "/admin-users",
      },
      {
        eventKey: "memberUser",
        title: "Member User",
        to: "/member-user",
      },
      {
        eventKey: "securityUser",
        title: "Security User",
        to: "/security-users",
      },
    ],
  },

  {
    eventKey: "maintenance",
    title: "Maintenance",
    icon: <Icon as={ToolsIcon} />,
    children: [
      {
        eventKey: "maintenance-information",
        title: "Maintenance Information",
        to: "maintenance-information",
      },
      {
        eventKey: "flat-management",
        title: "Flat Management",
        to: "flat-management",
      },
      {
        eventKey: "flat-association",
        title: "Flat Association",
        to: "flat-association/add",
      },
      {
        eventKey: "maintenance-management",
        title: "Maintenance Management",
        to: "maintenance-management",
      },
    ],
  },
  {
    eventKey: "billing",
    title: "Billings",
    icon: <Icon as={RiBillLine} />,
    children: [
      {
        eventKey: "billing-details",
        title: "Billing Details",
        to: "billings/details",
      },
      {
        eventKey: "billing-adjustment",
        title: "Billing Adjustment",
        to: "/billing-adjustment",
      },
    ],
  },
  {
    eventKey: "payment",
    title: "Payments",
    icon: <Icon as={CiMoneyCheck1} />,
    children: [
      {
        eventKey: "payment-details",
        title: "Payment Details",
        to: "payments/details",
      },
      {
        eventKey: "paymentsReceipt-details",
        title: "Payments Receipts",
        to: "paymentsReceipt/details",
      },
    ],
  },
  {
    eventKey: "expense",
    title: "Expense",
    icon: <Icon as={RiMoneyRupeeCircleLine} />,
    children: [
      {
        eventKey: "expense",
        title: "Expense Details",
        to: "/expense",
      },
      {
        eventKey: "expense-category",
        title: "Expense Category",
        to: "/expense-category",
      },
    ],
  },
  {
    eventKey: "notifications",
    title: "Notifications",
    icon: <Icon as={MdNotifications} />,
    children: [
      {
        eventKey: "notices",
        title: "Notices",
        to: "/notices",
      },
      {
        eventKey: "request-queries",
        title: "Request Queries",
        to: "/request-queries",
      },
    ],
  },
  {
    eventKey: "meetings",
    title: "Meetings",
    icon: <Icon as={FaRegHandshake} />,
    children: [
      {
        eventKey: "meetings",
        title: "Meetings Master",
        to: "/meetings",
      },
    ],
  },
  {
    eventKey: "reports",
    title: "Reports",
    icon: <Icon as={SearchDataLiveIcon} />,
    children: [
      {
        eventKey: "outstanding-details",
        title: "Outstanding Details",
        to: "/outstanding-details",
      },
      {
        eventKey: "Leasehold-Flat-Details",
        title: "LeaseHold Flat Details",
        to: "/leasehold-flat/details",
      },
      {
        eventKey: "individualAccount",
        title: "Individual Account Details",
        to: "/individual-account/list",
      },
      {
        eventKey: "expense-account-Ledger",
        title: "Expense Account Ledger",
        to: "/expense-account-Ledger/list",
      },
      {
        eventKey: "incomeExpenditure",
        title: "Income & Expenditure",
        to: "/incomeExpenditure/list",
      },
    ],
  },
  {
    eventKey: "vendors",
    title: "Vendors",
    icon: <Icon as={FaPeopleCarry} />,
    children: [
      {
        eventKey: "vendor-types",
        title: "Vendor Types",
        to: "/vendor-types",
      },
      {
        eventKey: "vendors",
        title: "Vendors",
        to: "/vendors",
      },
    ],
  },
  {
    eventKey: "amc",
    title: "Amc/Contract Details",
    icon: <Icon as={MdOutlineWorkOutline} />,
    to: "/amc",
  },
  {
    eventKey: "polling",
    title: "Polling",
    icon: <Icon as={MdOutlinePoll} />,
    children: [
      {
        eventKey: "polling",
        title: "Polling",
        to: "/polling",
      },
    ],
  },
  {
    eventKey: "visitors",
    title: "Visitors",
    icon: <Icon as={SlPeople} />,
    children: [
      {
        eventKey: "visitors",
        title: "Visitors",
        to: "/visitors-list",
      },
    ],
  },
];

const UserNavs = [
  {
    eventKey: "society-information",
    icon: <Icon as={PiBuildings} />,
    title: "Society Information",
    to: "/society-information",
  },
  {
    eventKey: "billing",
    icon: <Icon as={RiBillLine} />,
    title: "Billing History",
    to: "/billing",
  },
  {
    eventKey: "payments",
    icon: <Icon as={MdCurrencyRupee} />,
    title: "Payment History",
    to: "/payments",
  },
  {
    eventKey: "request-queries",
    icon: <Icon as={MdQuestionMark} />,
    title: "Request Query",
    to: "/request-queries",
  },
  {
    eventKey: "member-billingAdjustments",
    icon: <Icon as={FaMoneyBillWave} />,
    title: "Billing Adjustments",
    to: "/member-billingAdjustments",
  },
  {
    eventKey: "member-meetings",
    icon: <Icon as={FaRegHandshake} />,
    title: "Meetings List",
    to: "/member-meetings",
  },
  {
    eventKey: "member-notices",
    icon: <Icon as={MdEventNote} />,
    title: "Notices List",
    to: "/member-notices",
  },
  {
    eventKey: "vendors-list",
    icon: <Icon as={BsBoxes} />,
    title: "Vendors List",
    to: "/vendors-list",
  },
  {
    eventKey: "polling-list",
    icon: <Icon as={MdOutlinePoll} />,
    title: "Polling List",
    to: "/polling-list",
  },
];

const SecurityNavs = [
  {
    eventKey: "visitors",
    icon: <Icon as={GrUserManager} />,
    title: "Visitor List",
    to: "/visitors",
  },
];

const SuperadminRoutes = [
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="societies" />,
      },
      {
        path: "societies",
        element: <SocietyList pageTitle="Society List" />,
      },
      {
        path: "society/details/:societyId",
        element: <SocietyDetails pageTitle="Society Details" />,
      },
      {
        path: "society/add",
        element: <AddSociety pageTitle="Add Society" />,
      },
      {
        path: "society/edit/:societyId",
        element: <AddSociety pageTitle="Edit Society" />,
      },
      {
        path: "admin-users",
        element: <Users pageTitle="Admin Users" />,
        id: "adminusers",
      },
      {
        path: "admin-users/add",
        element: <AddUser pageTitle="Add Admin User" />,
      },
      {
        path: "admin-users/edit/:userId",
        element: <AddUser pageTitle="Edit Admin User" />,
      },
      {
        path: "admin-users/details/:userId",
        element: <UserDetails pageTitle="Admin User Details" />,
        id: "userDetails",
      },

      {
        path: "/billing-charges",
        element: <BillsList pageTitle="Billing Charges" />,
        id: "bill",
      },
      {
        path: "bill/:billId",
        element: <BillDetails pageTitle="Billing Charges Details" />,
        id: "billDetails",
      },
      {
        path: "edit-bill/:billId",
        element: <AddBill pageTitle="Edit Billing Charges" />,
        id: "billEdit",
      },
      {
        path: "add-bill",
        element: <AddBill pageTitle="Add Bill" />,
        id: "billAdd",
      },

      {
        path: "amenity-lists",
        element: <AmentityList pageTitle="Amenity Lists" />,
      },
      {
        path: "amenity-details/:amenityId",
        element: <AmenityDetails pageTitle="Amenity Details" />,
        id: "amenityDetails",
      },
      {
        path: "add-amenity",
        element: <AddAmenity pageTitle="Add Amenity" />,
      },
      {
        path: "edit-amenity/:amenityId",
        element: <AddAmenity pageTitle="Edit Amenity" />,
      },
      {
        path: "profile",
        element: <ProfileDetails pageTitle="Profile Display" />,
        id: "profile",
      },
      {
        path: "change-password",
        element: <ChangePassword pageTitle="Change Password" />,
        id: "changePassword",
      },
      {
        path: "/request-demo",
        element: <RequestDemoList pageTitle="Request Demo" />,
        id: "requestDemo",
      },
      {
        path: "requestDemo/:requestDemoId",
        element: <RequestDemoDetails pageTitle="Request Demo Detail" />,
        id: "requestDemoDetail",
      },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/" replace />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

const AdminRoutes = [
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        path: "",
        element: <Navigate to="dashboard" />,
      },
      {
        path: "dashboard",
        element: <Dashboard pageTitle="Dashboard" />,
        id: "dashboard",
      },
      {
        path: "society-info",
        element: <SocietyInfo pageTitle="Society Information" />,
        id: "society-info",
      },
      {
        path: "society-info-edit",
        element: <SocietyInfoEdit pageTitle="Edit Society Information" />,
        id: "society-info-edit",
      },
      {
        path: "society-images",
        element: <SocietyImages pageTitle="Society Images" />,
        id: "society-images",
      },
      {
        path: "society-images/add",
        element: <AddSocietyImage pageTitle="Add Society Image" />,
      },
      {
        path: "society-contacts",
        element: <SocietyContact pageTitle="Society Contact List" />,
      },
      {
        path: "society-contacts/:societyContactId",
        element: <SocietyContactDetail pageTitle="Society Contact Details" />,
      },
      {
        path: "society-contacts/add",
        element: <AddSocietyContact pageTitle="Add Society Contact" />,
      },
      {
        path: "society-contacts/edit/:societyContactId",
        element: <AddSocietyContact pageTitle="Edit Society Contact" />,
      },
      {
        path: "bankdetails",
        element: <BankDetail pageTitle="Bank Detail List" />,
        id: "bankDetails",
      },
      {
        path: "maintenance-information",

        element: <MaintenanceDetails pageTitle="Maintenance Information" />,
        id: "maintenance-information",
      },
      {
        path: "maintenance-information/add/:societyId",

        element: <AddMaintenance pageTitle="Edit Maintenance Information" />,
        id: "add-maintenance-information",
      },
      {
        path: "flat-management",

        element: <FlatManagementList pageTitle="Society Flat Lists" />,
        id: "flat-management",
      },
      {
        path: "upload-flat",

        element: <UploadFlat pageTitle="Upload Flats" />,
        id: "upload-flat",
      },
      {
        path: "flat/add",
        element: <AddFlatManagement pageTitle="Upload Flats" />,
        id: "flat-add",
      },
      {
        path: "flat/edit/:flatId",
        element: <AddFlatManagement pageTitle="Edit Flat" />,
        id: "flat-edit",
      },
      {
        path: "flat/details/:flatId",
        element: <FlatDetails pageTitle="Flat Details" />,
        id: "flat-details",
      },
      {
        path: "flat-association/add",
        element: <FlatAssociation pageTitle="Add Flat Association" />,
        id: "flat-association",
      },
      {
        path: "maintenance-management",
        element: <MaintenanceManagement pageTitle="Maintenance Management" />,
        id: "maintenance-management",
      },
      {
        path: "maintenance-management/details/:flatId",
        element: (
          <MaintenManageDetails pageTitle="Maintenance Management Details" />
        ),
        id: "maintenance-management-details",
      },
      {
        path: "billings/details",
        element: <BillingDetail pageTitle="Billing Details" />,
        id: "billings-details",
      },
      {
        path: "billing-adjustment",
        element: <BillingAdjustments pageTitle="Billing Adjustment" />,
        id: "billing-adjustment",
      },
      {
        path: "billing-adjustment/add",
        element: <AddBillingAdjustment pageTitle=" Add Billing Adjustment" />,
      },
      {
        path: "payments/details",
        element: <PaymentDetail pageTitle="Payments" />,
        id: "payments-details",
      },
      {
        path: "payments/add",
        element: <AddEditPayment pageTitle="Add Payment Details" />,
        id: "payments-add",
      },
      {
        path: "payments/edit/:paymentId",
        element: <AddEditPayment pageTitle="Edit Payment Details" />,
        id: "payments-edit",
      },
      {
        path: "paymentsReceipt/details",
        element: <PaymentReceiptDetail pageTitle="Payment Receipts" />,
        id: "paymentsReceipt-details",
      },
      {
        path: "paymentsReceipt/add",
        element: <AddPaymentReceipt pageTitle="Add Payment Receipt" />,
        id: "paymentsReceipt-add",
      },
      {
        path: "bankdetails/details/:bankDetailId",
        element: <BankDetailDetails pageTitle="Bank Details" />,
      },
      {
        path: "bankdetails/add",
        element: <AddEditBankDetail pageTitle="Add Bank Detail" />,
      },
      {
        path: "bankdetails/edit/:bankDetailId",
        element: <AddEditBankDetail pageTitle="Edit Bank Detail" />,
      },
      {
        path: "member-user",
        element: <MemberUsers pageTitle="User List" />,
        id: "member-user",
      },
      {
        path: "member-user/details/:userId",
        element: <MemberUserDetails pageTitle="User Details" />,
      },
      {
        path: "member-user/add",
        element: <AddMemberUser pageTitle="Add User" />,
      },
      {
        path: "member-user/edit/:userId",
        element: <AddMemberUser pageTitle="Edit User" />,
      },
      {
        path: "member-user/upload-user",
        element: <UploadUser pageTitle="Upload Users" />,
      },
      {
        path: "admin-users",
        element: <Users pageTitle="Admin List" />,
      },
      {
        path: "admin-users/details/:userId",
        element: <UserDetails pageTitle="Admin Details" />,
      },
      {
        path: "security-users",
        element: <SecurityUserList pageTitle="Security Users" />,
      },
      {
        path: "security-user/add",
        element: <SecurityUserAdd pageTitle="Add Security User" />,
      },
      {
        path: "security-user/edit/:securityId",
        element: <SecurityUserAdd pageTitle="Edit Security User" />,
      },
      {
        path: "expense",
        element: <Expense pageTitle="Expense Details" />,
        id: "expense",
      },
      {
        path: "expense/details/:expId",
        element: <ExpenseDetails pageTitle="Expense Details" />,
      },
      {
        path: "expense/add",
        element: <AddEditExpense pageTitle="Expense Details" />,
      },
      {
        path: "expense/edit/:expId",
        element: <AddEditExpense pageTitle="Expense Details" />,
      },
      {
        path: "expense-category",
        element: <ExpenseCategory pageTitle="Category List" />,
        id: "expense-category",
      },

      {
        path: "expense-category/add",
        element: <AddExpenseCategory pageTitle="Add Expense Category" />,
      },
      {
        path: "expense-category/edit/:categoryId",
        element: <AddExpenseCategory pageTitle="Edit Expense Category" />,
      },
      {
        path: "notices",
        element: <NoticeList pageTitle="Notice Lists" />,
        id: "notices",
      },
      {
        path: "notices/details/:noticeId",
        element: <NoticeDetails pageTitle="Notice Details" />,
      },
      {
        path: "notices/add",
        element: <AddEditNotice pageTitle="Add Notice" />,
      },
      {
        path: "notices/edit/:noticeId",
        element: <AddEditNotice pageTitle="Edit Notice" />,
      },
      {
        path: "request-queries",
        element: <RequestQueries pageTitle="Request Queries" />,
        id: "request-queries",
      },
      {
        path: "request-queries/details/:queryId",
        element: <RequestQueryDetail pageTitle="Request Query Details" />,
      },
      {
        path: "request-queries/edit/:queryId",
        element: <EditRequestQuery pageTitle="Request Query" />,
      },
      {
        path: "meetings",
        element: <MeetingList pageTitle="Meetings Lists" />,
        id: "meetings",
      },
      {
        path: "meetings/details/:meetingId",
        element: <MeetingDetails pageTitle="Meetings Details" />,
      },
      {
        path: "meetings/add",
        element: <AddEditMeeting pageTitle=" Add Meeting" />,
      },
      {
        path: "meetings/edit/:meetingId",
        element: <AddEditMeeting pageTitle=" Edit Meeting" />,
      },
      {
        path: "outstanding-details",
        element: <OutstandingList pageTitle="Outstanding Details" />,
        id: "outstanding-details",
      },
      {
        path: "leasehold-flat/details",
        element: <LeaseHoldFlatsList pageTitle="Lease Flat Details" />,
      },
      {
        path: "individual-account/list",
        element: (
          <IndividualAccountList pageTitle="Individual Account Details" />
        ),
      },
      {
        path: "incomeExpenditure/list",
        element: <IncomeExpenditureList pageTitle="Income And Expenditure" />,
        id: "incomeExpenditure",
      },
      {
        path: "expense-account-Ledger/list",
        element: (
          <ExpenseAccountLedgerList pageTitle="Expense Account Ledgers" />
        ),
      },
      {
        path: "vendor-types",
        element: <VendorTypeList pageTitle="Vendor Type Lists" />,
        id: "vendor-types",
      },
      {
        path: "vendors",
        element: <VendorList pageTitle="Vendor Lists" />,
        id: "vendors",
      },
      {
        path: "vendors/add",
        element: <AddEditVendor pageTitle="Add Vendor" />,
        id: "addVendors",
      },
      {
        path: "vendors/edit/:vendorId",
        element: <AddEditVendor pageTitle="Edit Vendor" />,
        id: "editVendors",
      },
      {
        path: "amc",
        element: <AmcList pageTitle="AMC List" />,
        id: "amc",
      },
      {
        path: "amc/details/:amcId",
        element: <AmcDetail pageTitle="Amc Details" />,
      },
      {
        path: "amc/add",
        element: <AddEditAmc pageTitle="Add AMC" />,
      },
      {
        path: "amc/edit/:amcId",
        element: <AddEditAmc pageTitle="Edit AMC" />,
      },
      {
        path: "users",
        element: <Users pageTitle="Users" />,
        id: "users",
      },
      {
        path: "users/:userId",
        element: <UserDetails pageTitle="User Details" />,
        id: "userDetails",
      },
      {
        path: "profile",
        element: <ProfileDetails pageTitle="Profile Display" />,
        id: "profile",
      },
      {
        path: "change-password",
        element: <ChangePassword pageTitle="Change Password" />,
        id: "changePassword",
      },
      {
        path: "polling",
        element: <PollingsList pageTitle="Polling List" />,
        id: "pollingList",
      },
      {
        path: "polling/add",
        element: <AddPolling pageTitle="Add Polling" />,
        id: "addPolling",
      },
      {
        path: "polling/edit/:pollId",
        element: <AddPolling pageTitle="Edit Polling" />,
        id: "editPolling",
      },
      {
        path: "visitors-list",
        element: <VisitorListAdmin pageTitle="Visitors List" />,
        id: "visitorsList",
      },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/society-info" replace />,
  },
  {
    path: "*",
    element: <Navigate to="/society-info" replace />,
  },
];

const UserRoutes = [
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        path: "",
        element: <Navigate to="society-information" />,
      },
      {
        path: "profile",
        element: <ProfileDetails pageTitle="Profile Details" />,
        id: "profile",
      },
      {
        path: "profile/edit",
        element: <ProfileEdit pageTitle="Manage Profile" />,
        id: "profileEdit",
      },
      // {
      //   path: "dashboard",
      //   element: <Dashboard pageTitle="Dashboard" />,
      //   id: "dashboard",
      // },
      {
        path: "society-information",
        element: <SocietyInformation pageTitle="Society Information" />,
        id: "societyInformation",
      },
      {
        path: "billing",
        element: <BillingList pageTitle="Billing History" />,
        id: "billing",
      },
      {
        path: "member-billingAdjustments",
        element: <BillingAdjustment pageTitle="Billing Adjustment" />,
        id: "memberBillingAdjustment",
      },
      {
        path: "member-meetings",
        element: <MeetingsList pageTitle="Meetings List" />,
        id: "memberMeetings",
      },
      {
        path: "member-notices",
        element: <NoticesList pageTitle="Notices List" />,
        id: "memberNotices",
      },
      {
        path: "vendors-list",
        element: <VendorsList pageTitle="Vendors List" />,
        id: "vendorsList",
      },
      {
        path: "polling-list",
        element: <PollingList pageTitle="Polling List" />,
        id: "pollingList",
      },
      {
        path: "payments",
        element: <PaymentList pageTitle="Payments" />,
        id: "payments",
      },
      {
        path: "request-queries",
        element: <RequestQuery pageTitle="Request Queries" />,
        id: "request-queries",
      },
      {
        path: "request-queries/add",
        element: <RequestQueryAdd pageTitle="Add Request Query" />,
        id: "request-queries-add",
      },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/society-information" replace />,
  },
  {
    path: "*",
    element: <Navigate to="/society-information" replace />,
  },
];

const SecurityRoutes = [
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        path: "",
        element: <Navigate to="visitors" />,
      },
      {
        path: "visitors",
        element: <VisitorList pageTitle="Visitor List" />,
        id: "visitors",
      },
      {
        path: "visitors/add",
        element: <VisitorAdd pageTitle="Visitor Add" />,
        id: "visitors-add",
      },
      {
        path: "visitors/edit/:visitorId",
        element: <VisitorAdd pageTitle="Visitor Edit" />,
        id: "visitors-edit",
      },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/visitors" replace />,
  },
  {
    path: "*",
    element: <Navigate to="/visitors" replace />,
  },
];

const PublicRoutes = [
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        path: "/",
        element: <Home pageTitle="Home" />,
        id: "home",
      },
      {
        path: "/create-password/:token",
        element: <CreatePassword pageTitle="Create Password" />,
        id: "create-password",
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword pageTitle="Forgot Password" />,
        id: "forgotPassword",
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
];

const GetRoutes = (isAuth = false, user = {}) => {
  const { role } = user;

  if (isAuth) {
    switch (role) {
      case USER_ROLES?.superAdmin:
        return SuperadminRoutes;
      case USER_ROLES?.admin:
        return AdminRoutes;
      case USER_ROLES?.user:
        return UserRoutes;
      case USER_ROLES?.security:
        return SecurityRoutes;
      default:
        return PublicRoutes;
    }
  } else {
    return PublicRoutes;
  }
};

export {
  USER_ROLES,
  GetRoutes,
  SuperadminNavs,
  SuperadminRoutes,
  AdminNavs,
  AdminRoutes,
  UserNavs,
  SecurityRoutes,
  SecurityNavs,
};
