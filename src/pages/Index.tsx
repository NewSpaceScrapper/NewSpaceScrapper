import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Search, Filter, ExternalLink, Tag, FileText, BookOpen, Copy } from 'lucide-react'; // Copy icon imported
import FileUpload from '../components/FileUpload';
import CategoryFilter from '../components/CategoryFilter';
import LinkCard from '../components/LinkCard';
import SearchBar from '../components/SearchBar';
import ExportButton from '../components/ExportButton';
import { toast } from 'sonner';

import prompt from '../prompt.md?raw';

// Helper to get icon path - updated for .jpg files with spaces and lowercase
const getCompanyIcon = (company: string) =>
  `/icons/${company.toLowerCase()}.jpg`;

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
  const [availableCompanyData, setAvailableCompanyData] = useState<Set<string>>(new Set());
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const CACHE_KEY = 'company_data_availability';
  const CACHE_EXPIRY_KEY = 'company_data_availability_expiry';
  const CACHE_DURATION = 600000; // 10 minutes in ms

  // Sample prompt text - replace with your actual prompt
  const promptText = prompt;

  const availableCompanies = [
    'Agnikul',
    'Gilmour',
    'HyPrSpace',
    'HyImpulse',
    'Innospace',
    'Interstellar Technologies',
    'Isar Aerospace',
    'Maia Space',
    'Orbex',
    'Perigee',
    'PLD Space',
    'RFA',
    'Sirius',
    'Skyroot',
    'Skyrora',
    'Space One',
  ];

  // Load cached availability data
  const loadCachedAvailability = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);
      
      if (cached && cacheExpiry) {
        const expiryTime = parseInt(cacheExpiry, 10);
        const now = Date.now();
        
        if (now < expiryTime) {
          const availableCompaniesData = JSON.parse(cached);
          console.log('Loading cached availability data:', availableCompaniesData);
          setAvailableCompanyData(new Set(availableCompaniesData));
          return true; // Cache is valid
        } else {
          console.log('Cache expired, will refresh data');
          localStorage.removeItem(CACHE_KEY);
          localStorage.removeItem(CACHE_EXPIRY_KEY);
        }
      }
    } catch (error) {
      console.log('Error loading cached data:', error);
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
    }
    return false; // No valid cache
  };

  // Save availability data to cache
  const saveCachedAvailability = (availableSet: Set<string>) => {
    try {
      const availableArray = Array.from(availableSet);
      const expiryTime = Date.now() + CACHE_DURATION;
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(availableArray));
      localStorage.setItem(CACHE_EXPIRY_KEY, expiryTime.toString());
      console.log('Saved availability data to cache:', availableArray);
    } catch (error) {
      console.log('Error saving to cache:', error);
    }
  };

  // Check which companies have available data
  const checkCompanyDataAvailability = async () => {
    setIsCheckingAvailability(true);
    const available = new Set<string>();
    
    const checkPromises = availableCompanies.map(async (company) => {
      try {
        const encodedPath = `/sorted%20posts/${encodeURIComponent(company)}.json`;
        const response = await fetch(encodedPath);
        
        if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
          const responseData = await response.json();
          if (Array.isArray(responseData) && responseData.length > 0) {
            available.add(company);
            console.log(`✓ Data found for ${company}: ${responseData.length} items`);
          } else {
            console.log(`✗ No valid data for ${company}: empty or invalid JSON`);
          }
        } else {
          console.log(`✗ No data file for ${company}: ${response.status}`);
        }
      } catch (error) {
        console.log(`✗ Error loading ${company}:`, error);
      }
    });
    
    await Promise.all(checkPromises);
    
    console.log(`Found data for ${available.size}/${availableCompanies.length} companies:`, Array.from(available));
    setAvailableCompanyData(available);
    saveCachedAvailability(available);
    setIsCheckingAvailability(false);
  };

  React.useEffect(() => {
    const hasCachedData = loadCachedAvailability();
    if (!hasCachedData) {
      checkCompanyDataAvailability();
    }
  }, []);

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

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptText)
      .then(() => {
        toast.success('Prompt copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy prompt: ', err);
        toast.error('Failed to copy prompt.');
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            NewSpace Scrapper
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your JSON file to explore and organize links by categories.
          </p>
        </div>

        {/* Available Companies Section */}
        {data.length === 0 && (
          <div className="max-w-8xl mx-auto mb-8">
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FileText size={20} />
                  Available Company Data
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {availableCompanies.map((company) => {
                  const hasData = availableCompanyData.has(company);
                  const CardComponent = hasData ? Link : 'div';
                  
                  return (
                    <CardComponent
                      key={company}
                      {...(hasData ? { to: `/company/${encodeURIComponent(company)}` } : {})}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        hasData 
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-gray-200 hover:border-blue-300 hover:shadow-md group cursor-pointer' 
                          : 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className={`relative flex-shrink-0 w-16 h-16 border rounded-lg overflow-hidden shadow-sm ${
                          hasData ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-300'
                        }`}>
                          <img
                            src={getCompanyIcon(company)}
                            alt={`${company} logo`}
                            className={`w-full h-full object-contain p-1 ${hasData ? '' : 'grayscale'}`}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const bgClass = hasData 
                                  ? 'bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600' 
                                  : 'bg-gray-200 text-gray-400';
                                parent.innerHTML = `<div class="w-full h-full ${bgClass} flex items-center justify-center text-lg font-bold">${company.charAt(0)}</div>`;
                              }
                            }}
                          />
                          {/* REMOVED COPY BUTTON FROM HERE */}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-medium transition-colors text-sm leading-tight ${
                            hasData 
                              ? 'text-gray-800 group-hover:text-blue-600' 
                              : 'text-gray-500'
                          }`}>
                            {company}
                          </h3>
                          <p className={`text-xs mt-1 ${
                            hasData ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {hasData ? 'View data' : 'No data available'}
                          </p>
                        </div>
                      </div>
                    </CardComponent>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* File Upload and Prompt Display Section */}
        {data.length === 0 && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File Upload Section (Left Container) */}
              <div>
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Or Upload Your Own File</h2>
                  <p className="text-gray-600">Upload a custom JSON file to analyze</p>
                </div>
                <FileUpload onUpload={handleFileUpload} />
              </div>

              {/* Prompt Display Section (Right Container) */}
              <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col h-full">
                <div className="flex items-center justify-between gap-2 mb-4"> {/* Changed to justify-between */}
                  <div className="flex items-center gap-2"> {/* Grouped title and icon */}
                    <BookOpen size={20} className="text-purple-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Analysis Prompt</h2>
                  </div>
                  {/* ADDED COPY BUTTON FOR PROMPT HERE */}
                  <button
                    onClick={handleCopyPrompt}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Copy prompt text"
                    title="Copy prompt text"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex-1 overflow-y-auto min-h-0"> 
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                      {promptText}
                    </div>
                  </div>
                </div>
              </div>
            </div>
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