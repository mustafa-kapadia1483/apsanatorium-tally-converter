/**
 * Function to convert raw receipt data to voucher data
 * @param {Array} receiptDataArray
 * @returns {Array}
 */
export default function getAccountingVoucherData(receiptDataArray) {
  let result = [];
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

    let bankAllocationsTransferMode = null;
    let bankAllocationsTransferType = null;
    let debitLedgerName = null;

    if (typeof payType != "string" || payType.length == 0) {
      payType = "NEFT"; // Qusai: pass it as NEFT if blank or undefined
    }

    if (payType.toLowerCase().includes("cash")) {
      bankAllocationsTransferMode = "";
      bankAllocationsTransferType = "";
      debitLedgerName = "Cash Collections";
    } else {
      bankAllocationsTransferMode = payType;
      bankAllocationsTransferType = "e-Fund Transfer";
      debitLedgerName = "HDFC - Cur A/c  03567620000018";
    }

    let creditObject = {
      "Voucher Date": date,
      "Voucher Type Name": VOUCHER_TYPE_NAME,
      "Voucher Number": voucherNumber,
      "Ledger Name": `${bookingId} ${guestName}`,
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
      "Voucher Date": date,
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

    result.push(creditObject, debitObject);
  }
  return result;
}
