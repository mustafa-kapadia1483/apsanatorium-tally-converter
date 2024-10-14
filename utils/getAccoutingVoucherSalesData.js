import { getTallyFormattedDate } from "./date-utils.js";

/**
 * Function to calculate numbers such that it's rounded to 2 numbers and adition is always equal to total
 * @param {number} total
 * @param {number} num1
 * @param {number} num2
 * @param {number} num3
 * @returns {Array}
 */
function calculateNumbers(total, num1, num2, num3) {
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

// console.log(calculateNumbers(30)); // [26.79, 1.61, 1.60]

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

      const charges = calculateNumbers(
        additionalCharge,
        additionalRoomServiceIncomeLedgerAmount,
        additionalRoomServiceIncomeGst,
        additionalRoomServiceIncomeGst
      );

      const additionalRoomServiceIncome = {
        ...occupanyRoomRentIncome,
        "Ledger Name": "02. Additional Room Service Income",
        "Ledger Amount": charges[0],
      };

      const additionalRoomServiceIncomeCGST = {
        ...occupanyRoomRentIncomeSalesCGST,
        "Ledger Amount": charges[1],
      };

      const additionalRoomServiceIncomeSGST = {
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
