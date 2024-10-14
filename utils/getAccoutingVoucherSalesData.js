import { getTallyFormattedDate } from "./date-utils.js";

/**
 *
 * @param {Array} salesDataArray - Array containing sales raw data json
 * @returns {Array}
 */
export default function getAccoutingVoucherSalesData(salesDataArray) {
  const accoutingVoucherSalesArray = [];
  for (let entry of salesDataArray) {
    const VOUCHER_TYPE_NAME = "Sales";

    const voucherNumber = entry["Invoice ID"];
    const guestName = entry["Name"];
    const bookingId = entry["Booking ID"];
    const invoiceDate = entry["Invoice Date"];
    const totalRoomRent = parseFloat(entry["Total Room Rent (A)"]);
    const taxableRoomRent = parseFloat(entry["Taxable Room Rent (C=A-B)"]);
    const cgstRoomRent = parseFloat(entry["CGST (D)"]);
    const sgstRoomRent = parseFloat(entry["SGST (E)"]);
    const additionalCharge = parseFloat(entry["Additional Charge (G)"]);

    const voucherDate = getTallyFormattedDate(new Date(invoiceDate));

    const debitObject = {
      "Voucher Date": voucherDate,
      "Voucher Type Name": VOUCHER_TYPE_NAME,
      "Voucher Number": voucherNumber,
      "Ledger Name": `${bookingId} ${guestName}`,
      "Ledger Amount":
        taxableRoomRent + cgstRoomRent + sgstRoomRent + additionalCharge,
      "Ledger Amount Dr/Cr": "Dr",
    };

    const occupanyRoomRentIncome = {
      ...debitObject,
      "Ledger Name": "01. Occupancy Room Rent Income",
      "Ledger Amount": totalRoomRent,
      "Ledger Amount Dr/Cr": "Cr",
    };

    const occupanyRoomRentIncomeSalesCGST = {
      ...occupanyRoomRentIncome,
      "Ledger Name": "Sales - CGST",
      "Ledger Amount": cgstRoomRent,
    };
    const occupanyRoomRentIncomeSalesSGST = {
      ...occupanyRoomRentIncome,
      "Ledger Name": "Sales - SGST",
      "Ledger Amount": sgstRoomRent,
    };

    accoutingVoucherSalesArray.push(
      debitObject,
      occupanyRoomRentIncome,
      occupanyRoomRentIncomeSalesCGST,
      occupanyRoomRentIncomeSalesSGST
    );

    if (additionalCharge > 0) {
      const additionalRoomServiceIncomeLedgerAmount = additionalCharge / 1.12;
      const additionalRoomServiceIncomeGst =
        (additionalCharge - additionalRoomServiceIncomeLedgerAmount) / 2;

      const additionalRoomServiceIncome = {
        ...occupanyRoomRentIncome,
        "Ledger Name": "02. Additional Room Service Income",
        "Ledger Amount": additionalRoomServiceIncomeLedgerAmount,
      };

      const additionalRoomServiceIncomeCGST = {
        ...occupanyRoomRentIncomeSalesCGST,
        "Ledger Amount": additionalRoomServiceIncomeGst,
      };

      const additionalRoomServiceIncomeSGST = {
        ...occupanyRoomRentIncomeSalesSGST,
        "Ledger Amount": additionalRoomServiceIncomeGst,
      };

      accoutingVoucherSalesArray.push(
        additionalRoomServiceIncome,
        additionalRoomServiceIncomeCGST,
        additionalRoomServiceIncomeSGST
      );
    }
  }

  return accoutingVoucherSalesArray;
}
