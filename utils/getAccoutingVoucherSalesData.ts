import { getTallyFormattedDate } from "./date-utils.js";

export interface VoucherEntry {
  "Invoice ID": string;
  Name: string;
  "Booking ID": string;
  "Invoice Date": string;
  "Total Room Rent (A)": string;
  "Taxable Room Rent (C=A-B)": string;
  "CGST (D)": string;
  "SGST (E)": string;
  "Additional Charge (G)": string;
}

export interface VoucherObject {
  "Voucher Date": string;
  "Voucher Type Name": string;
  "Voucher Number": string;
  "Ledger Name": string;
  "Ledger Amount": number;
  "Ledger Amount Dr/Cr": "Dr" | "Cr";
}

/**
 * Calculates numbers such that they're rounded to 2 decimal places and their sum equals the total
 * @param total - The target total sum
 * @param num1 - First number to adjust
 * @param num2 - Second number to adjust
 * @param num3 - Third number to adjust
 * @returns An array of three numbers that sum to the total
 */
function calculateNumbers(
  total: number,
  num1: number,
  num2: number,
  num3: number
): [number, number, number] {
  // Round the numbers to 2 decimal places
  num1 = parseFloat(num1.toFixed(2));
  num2 = parseFloat(num2.toFixed(2));
  num3 = parseFloat(num3.toFixed(2));

  // Calculate the sum of rounded numbers
  let roundedSum = num1 + num2 + num3;

  // Adjust the last number to ensure the total is exactly 30
  let difference = total - roundedSum;
  num3 += difference;

  // Round again after adjustment to ensure precision
  num3 = parseFloat(num3.toFixed(2));

  return [num1, num2, num3];
}

/**
 * Processes sales data array and converts it into accounting voucher format
 * @param salesDataArray - Array containing sales raw data entries
 * @returns Array of voucher objects with accounting data
 */
export function getAccoutingVoucherSalesData(
  salesDataArray: VoucherEntry[]
): VoucherObject[] {
  const accoutingVoucherSalesArray: VoucherObject[] = [];
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

    const debitObject: VoucherObject = {
      "Voucher Date": voucherDate,
      "Voucher Type Name": VOUCHER_TYPE_NAME,
      "Voucher Number": voucherNumber,
      "Ledger Name": `${bookingId} ${guestName}`,
      "Ledger Amount":
        taxableRoomRent + cgstRoomRent + sgstRoomRent + additionalCharge,
      "Ledger Amount Dr/Cr": "Dr",
    };

    const occupanyRoomRentIncome: VoucherObject = {
      ...debitObject,
      "Ledger Name": "01. Occupancy Room Rent Income",
      "Ledger Amount": totalRoomRent,
      "Ledger Amount Dr/Cr": "Cr",
    };

    const occupanyRoomRentIncomeSalesCGST: VoucherObject = {
      ...occupanyRoomRentIncome,
      "Ledger Name": "Sales - CGST",
      "Ledger Amount": cgstRoomRent,
    };
    const occupanyRoomRentIncomeSalesSGST: VoucherObject = {
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

      const charges = calculateNumbers(
        additionalCharge,
        additionalRoomServiceIncomeLedgerAmount,
        additionalRoomServiceIncomeGst,
        additionalRoomServiceIncomeGst
      );

      const additionalRoomServiceIncome: VoucherObject = {
        ...occupanyRoomRentIncome,
        "Ledger Name": "02. Additional Room Service Income",
        "Ledger Amount": charges[0],
      };

      const additionalRoomServiceIncomeCGST: VoucherObject = {
        ...occupanyRoomRentIncomeSalesCGST,
        "Ledger Amount": charges[1],
      };

      const additionalRoomServiceIncomeSGST: VoucherObject = {
        ...occupanyRoomRentIncomeSalesSGST,
        "Ledger Amount": charges[2],
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
