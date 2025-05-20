import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

interface Country {
  name: string;
  capital: string;
  currency: string;
  flag: string;
}

interface CountryDropdownProps {
  onSelect: (country: string) => void;
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
  const [selectedCountryData, setSelectedCountryData] = useState<Country | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const storedApiKey = JSON.parse(localStorage.getItem('apiKey'));
        const apiKey = storedApiKey[0]?.key;
        if (!apiKey) {
          setFetchError('API key is missing.');
          return;
        }

        const response = await axios.get('http://localhost:3000/api/countries', {
          headers: {
            'x-api-key': apiKey,
          },
        });

        if (Array.isArray(response.data)) {
          // Map the data if it's an array
          const countries = response.data.map((country, index) => {
            // Check if country has the necessary fields before accessing them
            const name = country.name && country.name.common ? country.name.common : 'No name available';
            const capital = country.capital && country.capital.length > 0 ? country.capital[0] : 'No capital available';
            const currency = country.currencies && Object.values(country.currencies).length > 0
              ? `${Object.values(country.currencies)[0].name} (${Object.keys(country.currencies)[0]})`
              : 'No currency available';
            const flag = country.flags && country.flags.svg ? country.flags.svg : 'No flag available';

            // Return the formatted country object
            return { name, capital, currency, flag };
          });
          setCountries(countries);
          return countries;
        } else {
          throw new Error("Response data is not an array.");
        }

      } catch (error) {
        setFetchError('Error fetching countries data');
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const countryData = countries.find(c => c.name === selectedCountry) || null;
      setSelectedCountryData(countryData);
    } else {
      setSelectedCountryData(null);
    }
  }, [selectedCountry, countries]);

  const handleSelect = (country: Country) => {
    onSelect(country.name);
    setIsOpen(false);
    setSelectedCountryData(country);
  };

  if (loading) {
    return <div className="pt-16 text-center">Loading countries...</div>;
  }

  if (fetchError) {
    return <div className="pt-16 text-center text-red-600">{fetchError}</div>;
  }

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          className={`
            w-full flex justify-between items-center px-3 py-2 border rounded-md
            ${error ? 'border-red-500' : 'border-gray-300'}
            bg-white text-left focus:outline-none focus:ring-2 focus:ring-teal-500
          `}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedCountry || 'Select a country'}
          <ChevronDown className={`h-5 w-5 text-gray-400 ${isOpen ? 'hidden' : 'block'}`} />
          <ChevronUp className={`h-5 w-5 text-gray-400 ${isOpen ? 'block' : 'hidden'}`} />
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg max-h-60 overflow-auto">
            <ul className="py-1">
              {countries.map((country) => (
                <li
                  key={country.name}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => handleSelect(country)}
                >
                  <img
                    src={country.flag}
                    alt={`${country.name} flag`}
                    className="w-5 h-4 mr-2"
                  />
                  {country.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>

      {selectedCountryData && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-teal-600 hover:text-teal-800 flex items-center"
          >
            {showDetails ? 'Hide details' : 'Show country details'}
            {showDetails ? (
              <ChevronUp className="h-4 w-4 ml-1" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-1" />
            )}
          </button>

          {showDetails && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              <div className="flex items-center mb-2">
                <img
                  src={selectedCountryData.flag}
                  alt={`${selectedCountryData.name} flag`}
                  className="w-8 h-6 mr-2"
                />
                <h3 className="font-medium">{selectedCountryData.name}</h3>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Capital:</span> {selectedCountryData.capital}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Currency:</span> {selectedCountryData.currency}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CountryDropdown;
