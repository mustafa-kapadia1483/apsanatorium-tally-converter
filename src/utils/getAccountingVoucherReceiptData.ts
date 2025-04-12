interface AccountingData {
  tallyAccountingVoucherArray: TallyVoucher[];
  ledgerArray: Ledger[];
}

export interface ReceiptEntry {
  Date: string;
  BookingID: string;
  "Guest Name": string;
  "Pay Type": string;
  "Rec No.": string;
  "Amt-In": number;
}

interface TallyVoucher {
  "Voucher Date": string;
  "Voucher Type Name": string;
  "Voucher Number": string;
  "Ledger Name": string;
  "Ledger Amount": number;
  "Ledger Amount Dr/Cr": "Dr" | "Cr";
  "Bank Allocations - Transaction Type": string;
  "Bank Allocations - Transfer Mode": string;
  "Bill Type of Ref": string;
  "Bill Name": string;
  "Bill Amount": number | string;
  "Bill Amount - Dr/Cr": string;
  "Stat Adjustment (GST) - Nature of Adjustment": string;
}

interface Ledger {
  Name: string;
  "Group Name": string;
  "Mailing Name": string;
  "GST Registration Type": string;
  State: string;
  Country: string;
}

import { getTallyFormattedDate } from "./date-utils.js";

export const eFundTransferDebitLedgerNameBankOptions = [
  "Axis Bank 924020058901303",
  "HDFC - Cur A/c  03567620000018",
] as const;

export type EFundTransferLedgerName =
  (typeof eFundTransferDebitLedgerNameBankOptions)[number];

/**
 * Converts raw receipt data to voucher data which can be imported in Tally Prime
 */
export function getAccountingVoucherReceiptData(
  receiptDataArray: ReceiptEntry[],
  eFundTransferDebitLedgerName: EFundTransferLedgerName
): AccountingData {
  let tallyAccountingVoucherArray: TallyVoucher[] = [];
  let ledgerArray: Ledger[] = [];
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
    let bankAllocationsTransferMode: string | null = null;
    let bankAllocationsTransferType: string | null = null;
    let debitLedgerName: string | null = null;

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
      bankAllocationsTransferType = "card";
      debitLedgerName = "Axis Bank 924020058901303";
    } else {
      bankAllocationsTransferMode = payType;
      bankAllocationsTransferType = "e-Fund Transfer";
      debitLedgerName = eFundTransferDebitLedgerName; // Qusai: To have this changeable via user input
    }

    let creditObject: TallyVoucher = {
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

    let debitObject: TallyVoucher = {
      "Voucher Date": voucherDate,
      "Voucher Type Name": VOUCHER_TYPE_NAME,
      "Voucher Number": voucherNumber,
      "Ledger Name": debitLedgerName!,
      "Ledger Amount": amount,
      "Ledger Amount Dr/Cr": "Dr",
      "Bank Allocations - Transaction Type": bankAllocationsTransferType!,
      "Bank Allocations - Transfer Mode": bankAllocationsTransferMode!,
      "Bill Type of Ref": "",
      "Bill Name": "",
      "Bill Amount": "",
      "Bill Amount - Dr/Cr": "",
      "Stat Adjustment (GST) - Nature of Adjustment":
        STAT_ADJUSTMENT_GST__NATURE_OF_ADJUSTMENT,
    };

    tallyAccountingVoucherArray.push(creditObject, debitObject);

    let ledgerObject: Ledger = {
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
