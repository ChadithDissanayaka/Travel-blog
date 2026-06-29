import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { countryService } from '../../services/country.service';

export interface Country {
  name: string;
  capital: string;
  currency: string;
  flag: string;
}

interface ApiCountry {
  name?: {
    common?: string;
  };
  capital?: string[];
  currencies?: Record<string, { name?: string }>;
  flags?: {
    svg?: string;
  };
}

interface CountryDropdownProps {
  onSelect: (country: string, countryData?: Country) => void;
  selectedCountry?: string;
  label?: string;
  error?: string;
}

const CountryDropdown = ({
  onSelect,
  selectedCountry = '',
  label = 'Select Country',
  error
}: CountryDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await countryService.getAll();

        if (Array.isArray(data)) {
          const mapped = data.map((country: ApiCountry) => {
            const name = country.name?.common || 'No name available';
            const capital = country.capital && country.capital.length > 0 ? country.capital[0] : 'No capital available';
            const currency = country.currencies && Object.values(country.currencies).length > 0
              ? `${Object.values(country.currencies)[0].name || ''} (${Object.keys(country.currencies)[0]})`
              : 'No currency available';
            const flag = country.flags?.svg || 'No flag available';

            return { name, capital, currency, flag };
          });
          setCountries(mapped);
        } else {
          throw new Error("Response data is not an array.");
        }
      } catch {
        setFetchError('Error fetching countries data');
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country: Country) => {
    onSelect(country.name, country);
    setIsOpen(false);
    setSearchQuery('');
  };

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-1.5 animate-pulse">
        <div className="h-4 w-24 bg-slate-100 rounded" />
        <div className="h-12 bg-slate-50 border border-slate-200 rounded-xl" />
      </div>
    );
  }

  if (fetchError) {
    return <div className="text-xs text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">{fetchError}</div>;
  }

  const selectedCountryData = countries.find(c => c.name === selectedCountry) || null;

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      <div>
        <button
          type="button"
          className={`
            w-full flex justify-between items-center px-4 py-3 border rounded-xl text-sm font-medium transition-all
            ${error ? 'border-red-400 focus:ring-red-400 bg-red-50/20' : 'border-slate-200 focus:ring-teal-500 bg-slate-50 hover:bg-slate-100/50'}
            text-slate-700 focus:outline-none focus:ring-2 focus:border-transparent
          `}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedCountryData ? (
            <span className="flex items-center gap-2.5">
              <img
                src={selectedCountryData.flag}
                alt={`${selectedCountryData.name} flag`}
                className="w-5 h-3.5 rounded-sm object-cover shadow-sm"
              />
              {selectedCountryData.name}
            </span>
          ) : (
            <span className="text-slate-400 font-normal">Select a country</span>
          )}
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-slate-400 transition-transform duration-200" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200" />
          )}
        </button>

        {isOpen && (
          <div className="absolute z-20 mt-2 w-full rounded-2xl bg-white shadow-xl border border-slate-100 max-h-64 overflow-hidden flex flex-col transition-all duration-200 ease-out animate-fadeIn">
            {/* Search Input Box */}
            <div className="p-2.5 border-b border-slate-50 flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search country..."
                className="w-full px-2 py-1.5 bg-slate-50 rounded-lg text-xs text-slate-700 focus:outline-none placeholder-slate-400"
                autoFocus
              />
            </div>
            
            <ul className="overflow-y-auto flex-1 py-1 max-h-44 scrollbar-thin">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <li
                    key={country.name}
                    className="px-3.5 py-2.5 hover:bg-slate-50 active:bg-teal-50/50 cursor-pointer flex items-center text-sm text-slate-700 transition-colors"
                    onClick={() => handleSelect(country)}
                  >
                    <img
                      src={country.flag}
                      alt={`${country.name} flag`}
                      className="w-5 h-3.5 mr-2.5 rounded shadow-sm object-cover"
                    />
                    <span className="font-medium">{country.name}</span>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-xs text-slate-400 text-center">No countries match "{searchQuery}"</li>
              )}
            </ul>
          </div>
        )}

        {error && (
          <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    </div>
  );
};

export default CountryDropdown;
