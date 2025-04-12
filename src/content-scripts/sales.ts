import { convertTableToJson, createDownloadButton } from "../utils/ui";
import { getAccoutingVoucherSalesData } from "../utils/getAccoutingVoucherSalesData";
import createXls from "../utils/createXls";

const salesTable = document.querySelector(
  "#GrStayRecord"
) as HTMLTableElement | null;

if (salesTable) {
  const downloadButton = createDownloadButton();

  document.body.appendChild(downloadButton);

  downloadButton.addEventListener("click", () => {
    const rawCollectionReportData = convertTableToJson(salesTable);
    const accoutingVoucherSalesArray = getAccoutingVoucherSalesData(
      rawCollectionReportData
    );

    createXls(
      accoutingVoucherSalesArray,
      "Accounting Voucher",
      "Accounting-Voucher-Sales.xlsx"
    );
  });
}
