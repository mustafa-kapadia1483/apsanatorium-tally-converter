/**
 * Accounting vouher data and ledger data
 * @typedef {Object} AccountingData
 * @property {Array} tallyAccountingVoucherArray - Accouting vouchers
 * @property {Array} ledgerArray - Ledgers needer for accouting vouchers
 */

import { getTallyFormattedDate } from "./date-utils.js";

/**
 * Function to convert raw receipt data to voucher data which can be imported in Tally Primme
 * @param {Array} receiptDataArray
 * @returns {AccountingData}
 *
 */
export default function getAccountingVoucherReceiptData(receiptDataArray) {
  let tallyAccountingVoucherArray = [];
  let ledgerArray = [];
  for (let entry of receiptDataArray) {
    const VOUCHER_TYPE_NAME = "Receipt";
    const BILL_TYPE_OF_REF = "New Ref";
    const STAT_ADJUSTMENT_GST__NATURE_OF_ADJUSTMENT = "Advance Payment";

    let date = entry["Date"];
    let bookingId = entry["BookingID"];
    let guestName = entry["Guest Name"];
    let payType = entry["Pay Type"];
    let voucherNumber = entry["Rec No."];
    let amount = entry["Amt-In"];

    let voucherDate = getTallyFormattedDate(new Date(date));
    let bankAllocationsTransferMode = null;
    let bankAllocationsTransferType = null;
    let debitLedgerName = null;

    let ledgerName = `${bookingId} ${guestName}`.trim();

    if (typeof payType != "string" || payType.length == 0) {
      payType = "NEFT"; // Qusai: pass it as NEFT if blank or undefined
    }

    if (payType.toLowerCase().includes("cash")) {
      bankAllocationsTransferMode = "";
      bankAllocationsTransferType = "";
      debitLedgerName = "Cash Collections";
    } else if (payType.toLowerCase().includes("credit")) {
      // For credit card  debit ledger name is different
      bankAllocationsTransferMode = payType;
      bankAllocationsTransferType = "e-Fund Transfer";
      debitLedgerName = "Axis Bank 924020058901303";
    } else {
      bankAllocationsTransferMode = payType;
      bankAllocationsTransferType = "e-Fund Transfer";
      debitLedgerName = "HDFC - Cur A/c  03567620000018";
    }

    let creditObject = {
      "Voucher Date": voucherDate,
      "Voucher Type Name": VOUCHER_TYPE_NAME,
      "Voucher Number": voucherNumber,
      "Ledger Name": ledgerName,
      "Ledger Amount": amount,
      "Ledger Amount Dr/Cr": "Cr",
      "Bank Allocations - Transaction Type": "",
      "Bank Allocations - Transfer Mode": "",
      "Bill Type of Ref": BILL_TYPE_OF_REF,
      "Bill Name": voucherNumber,
      "Bill Amount": amount,
      "Bill Amount - Dr/Cr": "Cr",
      "Stat Adjustment (GST) - Nature of Adjustment":
        STAT_ADJUSTMENT_GST__NATURE_OF_ADJUSTMENT,
    };

    let debitObject = {
      "Voucher Date": voucherDate,
      "Voucher Type Name": VOUCHER_TYPE_NAME,
      "Voucher Number": voucherNumber,
      "Ledger Name": debitLedgerName,
      "Ledger Amount": amount,
      "Ledger Amount Dr/Cr": "Dr",
      "Bank Allocations - Transaction Type": bankAllocationsTransferType,
      "Bank Allocations - Transfer Mode": bankAllocationsTransferMode,
      "Bill Type of Ref": "",
      "Bill Name": "",
      "Bill Amount": "",
      "Bill Amount - Dr/Cr": "",
      "Stat Adjustment (GST) - Nature of Adjustment":
        STAT_ADJUSTMENT_GST__NATURE_OF_ADJUSTMENT,
    };

    tallyAccountingVoucherArray.push(creditObject, debitObject);

    let ledgerObject = {
      Name: ledgerName,
      "Group Name": "Sundry Debtors",
      "Mailing Name": ledgerName,
      "GST Registration Type": "Unregistered/Consumer",
      State: "Maharashtra",
      Country: "India",
    };

    ledgerArray.push(ledgerObject);
  }
  return { tallyAccountingVoucherArray, ledgerArray };
}
