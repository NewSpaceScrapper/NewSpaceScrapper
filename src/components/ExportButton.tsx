
import React from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface LinkData {
  url: string;
  categories: string[];
  summary?: string;
}

interface ExportButtonProps {
  data: LinkData[];
  disabled?: boolean;
  originalFilename?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ data, disabled = false, originalFilename }) => {
  const exportToExcel = () => {
    if (data.length === 0) return;

    // Get all unique categories
    const allCategories = new Set<string>();
    data.forEach(item => {
      item.categories.forEach(category => allCategories.add(category));
    });

    const categories = Array.from(allCategories).sort();

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Create a sheet for each category
    categories.forEach(category => {
      // Filter data for this category
      const categoryData = data.filter(item => 
        item.categories.includes(category)
      );

      // Prepare data for the sheet
      const sheetData = [
        ['Summary', 'URL', 'Human Analysis'], // Header row
        ...categoryData.map(item => [
          item.summary || '',
          item.url,
          '' // Empty cell for human analysis
        ])
      ];

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

      // Set column widths
      worksheet['!cols'] = [
        { width: 50 }, // Summary column
        { width: 60 }, // URL column
        { width: 30 }  // Human Analysis column
      ];

      // Add worksheet to workbook with category name as sheet name
      // Excel sheet names have restrictions, so we'll clean the category name
      const cleanCategoryName = category.replace(/[\\\/\?\*\[\]]/g, '_').substring(0, 31);
      XLSX.utils.book_append_sheet(workbook, worksheet, cleanCategoryName);
    });

    // Generate filename based on original JSON filename or fallback to timestamp
    let filename = 'link-analysis.xlsx';
    if (originalFilename) {
      const nameWithoutExtension = originalFilename.replace(/\.json$/i, '');
      filename = `${nameWithoutExtension}.xlsx`;
    }
    
    XLSX.writeFile(workbook, filename);
  };

  return (
    <button
      onClick={exportToExcel}
      disabled={disabled}
      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 gap-2"
      title="Export to Excel"
    >
      <Download size={16} />
      Export to Excel
    </button>
  );
};

export default ExportButton;
