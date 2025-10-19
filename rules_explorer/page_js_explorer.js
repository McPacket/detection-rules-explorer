// app/page.js
// Main Detection Rules Explorer component

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, ChevronRight, Loader } from 'lucide-react';

export default function DetectionRulesExplorer() {
  const [rules, setRules] = useState([]);
  const [filterIndex, setFilterIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [expandedFilters, setExpandedFilters] = useState({
    domain: true,
    type: true,
    os: false,
    use_cases: false,
    tactics: false,
    data_sources: false,
    language: false,
    severity: false
  });
  const [selectedRule, setSelectedRule] = useState(null);

  // Load rules and index on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Use environment-aware paths (works in both dev and production)
        const basePath = process.env.NODE_ENV === 'production' ? '/detection-rules-explorer' : '';
        
        const [rulesResponse, indexResponse] = await Promise.all([
          fetch(`${basePath}/data/rules.json`),
          fetch(`${basePath}/data/index.json`)
        ]);

        if (!rulesResponse.ok || !indexResponse.ok) {
          throw new Error('Failed to load data files');
        }

        const rulesData = await rulesResponse.json();
        const indexData = await indexResponse.json();

        setRules(rulesData);
        setFilterIndex(indexData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter rules based on active filters and search term
  const filteredRules = useMemo(() => {
    if (!rules.length) return [];

    return rules.filter(rule => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const searchableText = [
          rule.name,
          rule.description,
          rule.id
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      // Active filters
      for (const [filterKey, selectedValues] of Object.entries(activeFilters)) {
        if (selectedValues.length === 0) continue;
        
        const ruleValue = rule[filterKey];
        
        if (Array.isArray(ruleValue)) {
          if (!ruleValue.some(v => selectedValues.includes(v))) {
            return false;
          }
        } else {
          if (!selectedValues.includes(ruleValue)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [rules, searchTerm, activeFilters]);

  const toggleFilter = (category, value) => {
    setActiveFilters(prev => {
      const current = prev[category] || [];
      const newValues = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      if (newValues.length === 0) {
        const { [category]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [category]: newValues };
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
  };

  const toggleFilterExpand = (category) => {
    setExpandedFilters(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const activeFilterCount = Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-gray-600">Loading detection rules...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Rules</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <p className="text-sm text-red-600">
              Make sure to run <code className="bg-red-100 px-1 rounded">npm run prebuild</code> first
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Detection Rules Explorer</h1>
          <p className="text-sm text-gray-600 mt-1">
            Explore and search through {rules.length} threat detection rules
          </p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search rules by name, description, or ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter size={18} />
                  <h2 className="font-semibold text-gray-900">Filters</h2>
                  {activeFilterCount > 0 && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {filterIndex && Object.entries(filterIndex.filters).map(([category, options]) => (
                  <div key={category} className="border-b border-gray-200 last:border-b-0">
                    <button
                      onClick={() => toggleFilterExpand(category)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                    >
                      <span className="font-medium text-sm text-gray-700 capitalize">
                        {category.replace('_', ' ')}
                      </span>
                      {expandedFilters[category] ? 
                        <ChevronDown size={16} /> : 
                        <ChevronRight size={16} />
                      }
                    </button>
                    
                    {expandedFilters[category] && (
                      <div className="px-4 pb-3 space-y-2">
                        {options.map(({ value, count }) => {
                          const isActive = activeFilters[category]?.includes(value) || false;

                          return (
                            <label
                              key={value}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                checked={isActive}
                                onChange={() => toggleFilter(category, value)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1 capitalize">
                                {value.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-gray-500">{count}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {filteredRules.length} of {rules.length} rules
                  {activeFilterCount > 0 && ` (${activeFilterCount} filters applied)`}
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredRules.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-500">No rules match your current filters</p>
                    <button
                      onClick={clearAllFilters}
                      className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  filteredRules.map(rule => (
                    <div
                      key={rule.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedRule(rule)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {rule.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {rule.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            {rule.severity && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                rule.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                rule.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                rule.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {rule.severity}
                              </span>
                            )}
                            {rule.type && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                {rule.type}
                              </span>
                            )}
                            {rule.domain && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                {rule.domain}
                              </span>
                            )}
                            {rule.tactics?.slice(0, 2).map(tactic => (
                              <span key={tactic} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {tactic.replace('_', ' ')}
                              </span>
                            ))}
                            {rule.tactics && rule.tactics.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                +{rule.tactics.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 text-right">
                          <div>ID: {rule.id}</div>
                          {rule.updated && <div className="mt-1">Updated: {rule.updated}</div>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Rule Detail Modal */}
      {selectedRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRule(null)}>
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedRule.name}</h2>
                <p className="text-sm text-gray-600 mt-1">Rule ID: {selectedRule.id}</p>
              </div>
              <button
                onClick={() => setSelectedRule(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{selectedRule.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedRule.severity && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Severity</h3>
                    <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                      selectedRule.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      selectedRule.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      selectedRule.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedRule.severity}
                    </span>
                  </div>
                )}

                {selectedRule.type && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Type</h3>
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
                      {selectedRule.type}
                    </span>
                  </div>
                )}

                {selectedRule.domain && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Domain</h3>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                      {selectedRule.domain}
                    </span>
                  </div>
                )}

                {selectedRule.language && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Language</h3>
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-medium">
                      {selectedRule.language}
                    </span>
                  </div>
                )}
              </div>

              {selectedRule.os && selectedRule.os.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Operating Systems</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRule.os.map(os => (
                      <span key={os} className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {os}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRule.tactics && selectedRule.tactics.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">MITRE ATT&CK Tactics</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRule.tactics.map(tactic => (
                      <span key={tactic} className="px-3 py-1 bg-red-50 text-red-700 rounded text-sm">
                        {tactic.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRule.data_sources && selectedRule.data_sources.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Data Sources</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRule.data_sources.map(source => (
                      <span key={source} className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                        {source.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRule.use_cases && selectedRule.use_cases.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Use Cases</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRule.use_cases.map(useCase => (
                      <span key={useCase} className="px-3 py-1 bg-green-50 text-green-700 rounded text-sm">
                        {useCase.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRule.query && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Detection Query</h3>
                  <pre className="bg-gray-50 p-4 rounded text-xs overflow-x-auto border border-gray-200">
                    <code>{selectedRule.query}</code>
                  </pre>
                </div>
              )}

              {(selectedRule.created || selectedRule.updated) && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  {selectedRule.created && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Created</h3>
                      <p className="text-sm text-gray-600">{selectedRule.created}</p>
                    </div>
                  )}
                  {selectedRule.updated && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Last Updated</h3>
                      <p className="text-sm text-gray-600">{selectedRule.updated}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}