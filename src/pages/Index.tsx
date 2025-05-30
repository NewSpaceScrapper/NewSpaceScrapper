
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Search, Filter, ExternalLink, Tag, FileText } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import CategoryFilter from '../components/CategoryFilter';
import LinkCard from '../components/LinkCard';
import SearchBar from '../components/SearchBar';
import ExportButton from '../components/ExportButton';
import { toast } from 'sonner';

interface LinkData {
  url: string;
  categories: string[];
  summary?: string;
}

const Index = () => {
  const [data, setData] = useState<LinkData[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [originalFilename, setOriginalFilename] = useState<string>('');

  // List of available company JSON files - these must match exactly with the filenames in /sorted posts/
  const availableCompanies = [
    'HyPrSpace',
    'Isar Aerospace',
    'PLD Space',
    'RFA',
    'Sirius'
  ];

  const handleFileUpload = (jsonData: LinkData[], filename: string) => {
    setData(jsonData);
    setSelectedCategories([]);
    setSearchQuery('');
    setOriginalFilename(filename);
    toast.success(`Successfully loaded ${jsonData.length} links!`);
  };

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    data.forEach(item => {
      item.categories.forEach(category => categories.add(category));
    });
    return Array.from(categories).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.some(cat => item.categories.includes(cat));
      
      const matchesSearch = searchQuery === '' || 
        item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.summary && item.summary.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [data, selectedCategories, searchQuery]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    allCategories.forEach(category => {
      stats[category] = data.filter(item => item.categories.includes(category)).length;
    });
    return stats;
  }, [data, allCategories]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            JSON Link Organizer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your JSON file to explore and organize links by categories with powerful filtering and search capabilities.
          </p>
        </div>

        {/* Available Companies Section */}
        {data.length === 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={20} />
                Available Company Data
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableCompanies.map((company) => (
                  <Link
                    key={company}
                    to={`/company/${company}`}
                    className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm group-hover:scale-105 transition-transform">
                        {company.split(' ').map(word => word[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                          {company}
                        </h3>
                        <p className="text-sm text-gray-600">View company data</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* File Upload */}
        {data.length === 0 && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Or Upload Your Own File</h2>
              <p className="text-gray-600">Upload a custom JSON file to analyze</p>
            </div>
            <FileUpload onUpload={handleFileUpload} />
          </div>
        )}

        {/* Dashboard */}
        {data.length > 0 && (
          <div className="space-y-6">
            {/* Stats Bar */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{data.length}</div>
                  <div className="text-sm text-gray-600">Total Links</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{allCategories.length}</div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{filteredData.length}</div>
                  <div className="text-sm text-gray-600">Filtered Results</div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
              <div className="flex gap-2">
                <ExportButton data={data} disabled={data.length === 0} originalFilename={originalFilename} />
                <button
                  onClick={() => {
                    setData([]);
                    setSelectedCategories([]);
                    setSearchQuery('');
                    setOriginalFilename('');
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Upload size={16} />
                  Upload New File
                </button>
              </div>
            </div>

            {/* Category Filters */}
            <CategoryFilter
              categories={allCategories}
              selectedCategories={selectedCategories}
              onCategoryChange={setSelectedCategories}
              categoryStats={categoryStats}
            />

            {/* Results */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <ExternalLink size={20} />
                Links ({filteredData.length})
              </h2>
              
              {filteredData.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border">
                  <div className="text-gray-400 mb-2">
                    <Search size={48} className="mx-auto" />
                  </div>
                  <p className="text-gray-600">No links found matching your criteria.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredData.map((item, index) => (
                    <LinkCard
                      key={index}
                      url={item.url}
                      categories={item.categories}
                      summary={item.summary}
                      onCategoryClick={(category) => {
                        if (selectedCategories.includes(category)) {
                          setSelectedCategories(selectedCategories.filter(c => c !== category));
                        } else {
                          setSelectedCategories([...selectedCategories, category]);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
