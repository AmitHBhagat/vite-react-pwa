import React from "react";
import { Popover } from "rsuite";
import "./home.css";

const Popup = ({ index }) => {
  const PopupData = [
    [
      "Society name, address, registration no.",
      "Society images and amenities",
      "Neighbourhood facilities and attractions",
      "You get dedicated society webpage",
    ],
    [
      "Maintenance structure setup",
      "Maintenance structure customization - Adding new or removing existing expense categories",
      "Setting up NOC non-occupancy charges and other rate amounts",
      "Automated arrears, interest calculation for overdue maintenance bills",
    ],
    [
      "Payment gateway information for credit card and netbanking payments",
      "Tracking for cheque, cash, credit card, and netbanking payments",
    ],
    [
      "Maintenance worker and agency roster",
      "Work, hours, and payment tracking",
    ],
    [
      "Attractive and visual dashboards",
      "PDFs for bills and payment receipts",
      "Excel exports: Society’s income & expense statement, balance sheet",
      "GSTR 1 and 3B compliant excel export",
      "Flat owner’s ledger and many more...",
    ],
    [
      "Flat, Parking, and Owner Information",
      "Resident Family Information",
      "Tenant Information",
      "Committee members and roles",
      "Permissions for these user roles",
      "Login credentials for all users",
    ],
    [
      "Maintenance bill generation",
      "Maintenance bill adjustment",
      "Email bill delivery and reminders",
    ],
    [
      "Document repository for society registration documents, occupation certificates, possession letters, etc.",
      "Legal templates for flat NOC, rent agreements, AMCs annual maintenance contracts for lifts, power safety, cleaning, gardening, etc.",
      "Document repository for issued NOCs, executed rent and other agreements",
      "Templates for maintenance bills, payment receipts",
    ],
    [
      "Workflow for registering flat owners, residents, and tenants,",
      "Digitized announcements and notices",
      "Conducting online polls for decisions",
      "Communicating and resolving issues",
      "Billing & payment workflow",
      "Email and SMS notifications for pending, paid, and overdue bills",
    ],
  ];
  return (
    <ul className="list" style={{ padding: "1rem" }}>
      {PopupData[index].map((e, index) => (
        <li key={index}>{e}</li>
      ))}
    </ul>
  );
};

export default Popup;
