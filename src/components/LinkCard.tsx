
import React from 'react';
import { ExternalLink, Tag } from 'lucide-react';

interface LinkCardProps {
  url: string;
  categories: string[];
  onCategoryClick: (category: string) => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ url, categories, onCategoryClick }) => {
  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Unknown Domain';
    }
  };

  const formatUrl = (url: string) => {
    if (url.length > 80) {
      return url.substring(0, 80) + '...';
    }
    return url;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 p-6 group">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* URL Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <ExternalLink size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-500 mb-1">
                {getDomainFromUrl(url)}
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 break-all block"
                title={url}
              >
                {formatUrl(url)}
              </a>
            </div>
          </div>
        </div>
        
        {/* Categories Section */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag size={14} className="text-gray-400" />
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => onCategoryClick(category)}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 transform hover:scale-105"
                title={`Filter by ${category}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkCard;
