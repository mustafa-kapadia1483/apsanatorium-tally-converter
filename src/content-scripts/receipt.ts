import { convertTableToJson, createDownloadButton } from "../utils/ui";
import {
  getAccountingVoucherReceiptData,
  eFundTransferDebitLedgerNameBankOptions,
  type ReceiptEntry,
  type EFundTransferLedgerName,
} from "../utils/getAccountingVoucherReceiptData";
import createXls from "../utils/createXls";

console.log("Read-table-script-running");

const receiptTable = document.querySelector(
  "#GrdDAILYCOLLECTION"
) as HTMLTableElement | null;
console.log(receiptTable);

if (receiptTable) {
  // Create a dropdown for bank selection
  const bankDropdown = document.createElement("select");
  bankDropdown.style.position = "fixed";
  bankDropdown.style.top = "70px"; // Position below the download button
  bankDropdown.style.left = "20px";
  bankDropdown.style.zIndex = "9999";
  bankDropdown.style.padding = "8px";
  bankDropdown.style.borderRadius = "5px";
  bankDropdown.style.border = "1px solid #ccc";
  bankDropdown.style.backgroundColor = "white";
  bankDropdown.style.cursor = "pointer";
  bankDropdown.style.maxWidth = "250px";
  bankDropdown.multiple = false;

  eFundTransferDebitLedgerNameBankOptions.forEach(bank => {
    const option = document.createElement("option");
    option.value = bank;
    option.textContent = bank;
    bankDropdown.appendChild(option);
  });

  // Append the dropdown to the body
  document.body.appendChild(bankDropdown);

  const downloadButton = createDownloadButton();
  // Append the button to the body
  document.body.appendChild(downloadButton);

  // Add click event listener (placeholder for future functionality)
  downloadButton.addEventListener("click", () => {
    console.log("Download tally format data button clicked");
    // Future implementation for downloading tally format data will go here

    const rawCollectionReportData = convertTableToJson(receiptTable);

    const { tallyAccountingVoucherArray, ledgerArray } =
      getAccountingVoucherReceiptData(
        rawCollectionReportData,
        bankDropdown.value as EFundTransferLedgerName
      );

    createXls(
      tallyAccountingVoucherArray,
      "Accounting Voucher",
      "Accounting-Voucher-Receipt.xlsx"
    );
    createXls(ledgerArray, "Ledger", "Ledger.xlsx");
  });
}
