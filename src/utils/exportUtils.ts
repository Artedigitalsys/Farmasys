import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

type Column<T> = {
  header: string;
  accessor: keyof T;
  cell?: (item: T) => React.ReactNode;
};

export function exportToExcel<T>(
  data: T[],
  columns: Column<T>[],
  filename: string
) {
  // Prepare data for export
  const exportData = data.map((item) => {
    const row: Record<string, any> = {};
    columns.forEach((column) => {
      row[column.header] = item[column.accessor];
    });
    return row;
  });

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Generate file
  XLSX.writeFile(workbook, filename);
}

export function exportToPdf<T>(
  data: T[],
  columns: Column<T>[],
  title: string,
  filename: string
) {
  // Create document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  // Prepare table data
  const tableColumn = columns.map((col) => col.header);
  const tableRows = data.map((item) => {
    return columns.map((column) => {
      return String(item[column.accessor] || '');
    });
  });
  
  // Generate table
  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [51, 122, 183],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });
  
  // Save document
  doc.save(filename);
}