import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, Filter, ExternalLink, Tag } from 'lucide-react';
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

const CompanyPage = () => {
  const { company } = useParams<{ company: string }>();
  const [data, setData] = useState<LinkData[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompanyData = async () => {
      if (!company) return;
      
      try {
        setLoading(true);
        console.log('Loading company data for:', company);
        console.log('Current location:', window.location.href);
        console.log('Base URL:', window.location.origin);
        
        // Use a more production-friendly path structure
        const baseUrl = window.location.origin;
        const jsonPath = `/sorted-posts/${encodeURIComponent(company)}.json`;
        const fullUrl = `${baseUrl}${jsonPath}`;
        
        console.log('Attempting to fetch from:', fullUrl);
        
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('Error response body:', errorText);
          throw new Error(`Failed to fetch ${company} data: ${response.status} ${response.statusText}`);
        }
        
        const jsonData = await response.json();
        console.log('Successfully loaded company data:', jsonData);
        setData(jsonData);
      } catch (error) {
        console.error('Failed to load company data:', error);
        toast.error(`Failed to load company data for ${company}. Please check if the file exists.`);
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [company]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {company} data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {company}
          </h1>
          <p className="text-lg text-gray-600">
            Explore and organize links by categories with powerful filtering and search capabilities.
          </p>
        </div>

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
              <ExportButton data={data} disabled={data.length === 0} originalFilename={company || 'data'} />
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
      </div>
    </div>
  );
};

export default CompanyPage;
