// components/ui/ExportButton.tsx
'use client'

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileImage, File, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

// Export interfaces
interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  render?: string; // Change to string identifier instead of function
}

interface ExportData {
  [key: string]: any;
}

interface ExportOptions {
  filename: string;
  title?: string;
  columns: ExportColumn[];
  data: ExportData[];
  sheetName?: string;
}

interface ExportButtonProps {
  data: any[];
  columns: ExportColumn[];
  filename: string;
  title?: string;
  sheetName?: string;
  className?: string;
}

// Helper functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Helper function to format values based on type
const formatValue = (value: any, renderType?: string): string => {
  // Handle null, undefined, or empty values
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  
  if (!renderType) return String(value);
  
  switch (renderType) {
    case 'currency':
      const numValue = Number(value);
      if (isNaN(numValue)) return '-';
      return formatCurrency(numValue);
      
    case 'date':
      if (!value) return '-';
      const date = new Date(value);
      if (isNaN(date.getTime())) return '-';
      return formatDate(value);
      
    case 'datetime':
      if (!value) return '-';
      const datetime = new Date(value);
      if (isNaN(datetime.getTime())) return '-';
      return datetime.toLocaleString('id-ID');
      
    case 'number':
      const num = Number(value);
      if (isNaN(num)) return '-';
      return new Intl.NumberFormat('id-ID').format(num);
      
    case 'status':
      if (!value) return '-';
      const statusMap: { [key: string]: string } = {
        'active': 'Aktif',
        'inactive': 'Tidak Aktif',
        'draft': 'Draft',
        'waiting_approval': 'Menunggu Persetujuan',
        'approved': 'Disetujui',
        'rejected': 'Ditolak',
        'Draft': 'Draft',
        'Waiting Approval': 'Menunggu Persetujuan',
        'Approved': 'Disetujui',
        'Rejected': 'Ditolak'
      };
      return statusMap[value] || value;
      
    default:
      return String(value);
  }
};

const formatDataForExport = (data: ExportData[], columns: ExportColumn[]) => {
  return data.map(row => {
    const formattedRow: { [key: string]: any } = {};
    columns.forEach(col => {
      // Handle nested object properties (e.g., sites.name)
      const value = col.key.includes('.') 
        ? col.key.split('.').reduce((obj, key) => obj?.[key], row)
        : row[col.key];
      
      formattedRow[col.header] = formatValue(value, col.render);
    });
    return formattedRow;
  });
};

// Export functions
const exportToExcel = (options: ExportOptions) => {
  const { filename, data, columns, sheetName = 'Sheet1' } = options;
  
  const formattedData = formatDataForExport(data, columns);
  
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  
  const colWidths = columns.map(col => ({ wch: col.width || 20 }));
  worksheet['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

const exportToCSV = (options: ExportOptions) => {
  const { filename, data, columns } = options;
  
  const formattedData = formatDataForExport(data, columns);
  
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToPDF = (options: ExportOptions) => {
  const { filename, data, columns, title } = options;
  
  const doc = new jsPDF();
  
  if (title) {
    doc.setFontSize(16);
    doc.text(title, 14, 22);
  }
  
  const tableData = data.map(row => 
    columns.map(col => {
      // Handle nested object properties (e.g., sites.name)
      const value = col.key.includes('.') 
        ? col.key.split('.').reduce((obj, key) => obj?.[key], row)
        : row[col.key];
      
      return formatValue(value, col.render);
    })
  );
  
  const headers = columns.map(col => col.header);
  
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: title ? 30 : 20,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 20 },
  });
  
  doc.save(`${filename}.pdf`);
};

// Fixed Word export function to create proper .docx file
const exportToWord = (options: ExportOptions) => {
  const { filename, data, columns, title } = options;
  
  // Create HTML content for Word
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
      </style>
    </head>
    <body>
  `;
  
  if (title) {
    htmlContent += `<h1>${title}</h1>`;
  }
  
  htmlContent += '<table>';
  
  // Add headers
  htmlContent += '<thead><tr>';
  columns.forEach(col => {
    htmlContent += `<th>${col.header}</th>`;
  });
  htmlContent += '</tr></thead>';
  
  // Add data rows
  htmlContent += '<tbody>';
  data.forEach(row => {
    htmlContent += '<tr>';
    columns.forEach(col => {
      // Handle nested object properties (e.g., sites.name)
      const value = col.key.includes('.') 
        ? col.key.split('.').reduce((obj, key) => obj?.[key], row)
        : row[col.key];
      
      const cellValue = formatValue(value, col.render);
      htmlContent += `<td>${cellValue || ''}</td>`;
    });
    htmlContent += '</tr>';
  });
  htmlContent += '</tbody>';
  
  htmlContent += '</table></body></html>';
  
  // Create blob with proper MIME type for Word
  const blob = new Blob([htmlContent], { 
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.docx`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Main Export Button Component
export function ExportButton({ 
  data, 
  columns, 
  filename, 
  title, 
  sheetName,
  className = ''
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'excel' | 'csv' | 'pdf' | 'word') => {
    setIsExporting(true);
    
    const options: ExportOptions = {
      filename,
      title,
      columns,
      data,
      sheetName
    };

    try {
      switch (format) {
        case 'excel':
          exportToExcel(options);
          toast.success('File Excel berhasil diunduh');
          break;
        case 'csv':
          exportToCSV(options);
          toast.success('File CSV berhasil diunduh');
          break;
        case 'pdf':
          exportToPDF(options);
          toast.success('File PDF berhasil diunduh');
          break;
        case 'word':
          exportToWord(options);
          toast.success('File Word berhasil diunduh');
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal mengekspor data');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting || data.length === 0}
        className="inline-flex items-center px-4 py-2 border border-red-600 shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? 'Exporting...' : 'Export'}
        <ChevronDown className="h-4 w-4 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="py-1">
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
              Export to Excel
            </button>
            
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            >
              <FileText className="h-4 w-4 mr-2 text-blue-600" />
              Export to CSV
            </button>
            
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            >
              <FileImage className="h-4 w-4 mr-2 text-red-600" />
              Export to PDF
            </button>
            
            <button
              onClick={() => handleExport('word')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            >
              <File className="h-4 w-4 mr-2 text-blue-800" />
              Export to Word
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Export types for external use
export type { ExportColumn, ExportData, ExportOptions };
export { formatCurrency, formatDate };