import XLSX from "xlsx";

/**
 * Creates excel file with the data array provided to it
 * @param xlsDataArray - Array of objects for which excel will be created
 * @param sheetName - Sheet name in which data will be added in workbook
 * @param fileName - Filename with which Excel Workbook will be saved
 */
export default function createXls(
  xlsDataArray: any[],
  sheetName: string,
  fileName: string
): void {
  const tallyImportWorksheet = XLSX.utils.json_to_sheet(xlsDataArray);

  const tallyImportWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    tallyImportWorkbook,
    tallyImportWorksheet,
    sheetName
  );

  let url: string | null = null;
  try {
    const workbookBuffer = XLSX.write(tallyImportWorkbook, {
      bookType: "xlsx",
      type: "array",
      compression: true,
    });
    const blob = new Blob([workbookBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to create or download Excel file:", error);
    throw error;
  } finally {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }
}
