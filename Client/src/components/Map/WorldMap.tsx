// src/components/Map/WorldMap.tsx
// Visited-country map using react-simple-maps (already available via CDN via iframe)
// We use a lightweight approach: country name → approximate lat/lng dot on an SVG world map.
// No heavy GeoJSON needed — just dot markers on a Mercator projection background.

import { useState } from 'react';
import { MapPin, BookOpen, Images } from 'lucide-react';
import { CountryMapData } from '../../services/album.service';
import { Link } from 'react-router-dom';

// Approximate lat/lng for common travel destinations
// Covers the countries most travel bloggers write about
const COUNTRY_COORDS: Record<string, [number, number]> = {
  'Japan': [36.2, 138.25], 'Thailand': [15.87, 100.99], 'France': [46.23, 2.21],
  'Italy': [41.87, 12.57], 'Spain': [40.46, -3.75], 'USA': [37.09, -95.71],
  'United States': [37.09, -95.71], 'Germany': [51.17, 10.45], 'United Kingdom': [55.38, -3.44],
  'Australia': [-25.27, 133.78], 'New Zealand': [-40.9, 174.89], 'Canada': [56.13, -106.35],
  'Brazil': [-14.24, -51.93], 'Argentina': [-38.42, -63.62], 'Mexico': [23.63, -102.55],
  'India': [20.59, 78.96], 'China': [35.86, 104.2], 'South Korea': [35.91, 127.77],
  'Vietnam': [14.06, 108.28], 'Indonesia': [-0.79, 113.92], 'Philippines': [12.88, 121.77],
  'Malaysia': [4.21, 101.98], 'Singapore': [1.35, 103.82], 'Cambodia': [12.57, 104.99],
  'Nepal': [28.39, 84.12], 'Sri Lanka': [7.87, 80.77], 'Morocco': [31.79, -7.09],
  'Egypt': [26.82, 30.8], 'South Africa': [-30.56, 22.94], 'Kenya': [-0.02, 37.91],
  'Tanzania': [-6.37, 34.89], 'Portugal': [39.4, -8.22], 'Greece': [39.07, 21.82],
  'Turkey': [38.96, 35.24], 'Netherlands': [52.13, 5.29], 'Switzerland': [46.82, 8.23],
  'Austria': [47.52, 14.55], 'Czech Republic': [49.82, 15.47], 'Hungary': [47.16, 19.5],
  'Poland': [51.92, 19.15], 'Sweden': [60.13, 18.64], 'Norway': [60.47, 8.47],
  'Denmark': [56.26, 9.5], 'Finland': [61.92, 25.75], 'Iceland': [64.96, -19.02],
  'Ireland': [53.41, -8.24], 'Belgium': [50.5, 4.47], 'Peru': [-9.19, -75.02],
  'Colombia': [4.57, -74.3], 'Chile': [-35.68, -71.54], 'Ecuador': [-1.83, -78.18],
  'Bolivia': [-16.29, -63.59], 'Uruguay': [-32.52, -55.76], 'Cuba': [21.52, -77.78],
  'Jamaica': [18.11, -77.3], 'Costa Rica': [9.75, -83.75], 'Panama': [8.54, -80.78],
  'Guatemala': [15.78, -90.23], 'Honduras': [15.2, -86.24], 'Nicaragua': [12.87, -85.21],
  'Jordan': [30.59, 36.24], 'Israel': [31.05, 34.85], 'UAE': [23.42, 53.85],
  'Saudi Arabia': [23.89, 45.08], 'Oman': [21.51, 55.92], 'Qatar': [25.35, 51.18],
  'Iran': [32.43, 53.69], 'Pakistan': [30.38, 69.35], 'Bangladesh': [23.68, 90.36],
  'Myanmar': [21.91, 95.96], 'Laos': [19.86, 102.5], 'Taiwan': [23.7, 121.0],
  'Hong Kong': [22.35, 114.18], 'Mongolia': [46.86, 103.85], 'Kazakhstan': [48.02, 66.92],
  'Uzbekistan': [41.38, 64.59], 'Georgia': [42.32, 43.36], 'Armenia': [40.07, 45.04],
  'Azerbaijan': [40.14, 47.58], 'Ukraine': [48.38, 31.17], 'Romania': [45.94, 24.97],
  'Bulgaria': [42.73, 25.49], 'Serbia': [44.02, 21.01], 'Croatia': [45.1, 15.2],
  'Slovenia': [46.15, 14.99], 'Slovakia': [48.67, 19.7], 'Estonia': [58.6, 25.01],
  'Latvia': [56.88, 24.6], 'Lithuania': [55.17, 23.88], 'Belarus': [53.71, 27.95],
  'Moldova': [47.41, 28.37], 'Albania': [41.15, 20.17], 'North Macedonia': [41.61, 21.75],
  'Montenegro': [42.71, 19.37], 'Bosnia': [43.92, 17.68], 'Luxembourg': [49.82, 6.13],
  'Malta': [35.94, 14.38], 'Cyprus': [35.13, 33.43], 'Russia': [61.52, 105.32],
  'Ethiopia': [9.15, 40.49], 'Ghana': [7.95, -1.02], 'Nigeria': [9.08, 8.68],
  'Senegal': [14.5, -14.45], 'Uganda': [1.37, 32.29], 'Rwanda': [-1.94, 29.87],
  'Zambia': [-13.13, 27.85], 'Zimbabwe': [-19.02, 29.15], 'Mozambique': [-18.67, 35.53],
  'Madagascar': [-18.77, 46.87], 'Mauritius': [-20.35, 57.55], 'Maldives': [3.2, 73.22],
  'Bhutan': [27.51, 90.43], 'Kyrgyzstan': [41.2, 74.77], 'Tajikistan': [38.86, 71.28],
  'Turkmenistan': [38.97, 59.56], 'Afghanistan': [33.94, 67.71],
};

// Mercator projection helper (simplified, works well for ±80° lat)
const toSvgCoords = (lat: number, lng: number, width: number, height: number) => {
  const x = (lng + 180) / 360 * width;
  const latRad = lat * Math.PI / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = height / 2 - (height * mercN) / (2 * Math.PI);
  return { x, y };
};

const W = 800;
const H = 420;

interface WorldMapProps {
  countries: CountryMapData[];
  profileUserId: number;
}

const WorldMap = ({ countries, profileUserId }: WorldMapProps) => {
  const [hovered, setHovered] = useState<CountryMapData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const visitedSet = new Set(countries.map(c => c.country));
  const unmapped = countries.filter(c => !COUNTRY_COORDS[c.country]);

  return (
    <div className="bg-white rounded-3xl shadow-card overflow-hidden mb-8">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-800">World Map</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {countries.length} {countries.length === 1 ? 'country' : 'countries'} visited
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-teal-500 inline-block" /> Visited
          </span>
        </div>
      </div>

      {/* SVG Map */}
      <div className="relative px-4 pb-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded-2xl"
          style={{ background: 'linear-gradient(to bottom, #e0f2fe, #bae6fd)' }}
        >
          {/* Simple landmass background — placeholder continents using a rect tint */}
          <rect x="0" y="0" width={W} height={H} fill="#bae6fd" rx="12" />
          {/* We overlay dots; the map background is decorative */}
          <image
            href="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
            x="0" y="0" width={W} height={H}
            opacity="0.18"
            preserveAspectRatio="xMidYMid slice"
          />

          {/* Country dots */}
          {countries.map(c => {
            const coords = COUNTRY_COORDS[c.country];
            if (!coords) return null;
            const { x, y } = toSvgCoords(coords[0], coords[1], W, H);
            return (
              <g
                key={c.country}
                onMouseEnter={(e) => {
                  setHovered(c);
                  const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
                  const svgRect = (e.target as SVGElement).closest('svg') as SVGSVGElement;
                  const pt = svgRect.createSVGPoint();
                  pt.x = x; pt.y = y;
                  setTooltipPos({ x, y });
                }}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Pulse ring */}
                <circle cx={x} cy={y} r={10} fill="#14b8a6" opacity={0.2} />
                {/* Main dot */}
                <circle
                  cx={x} cy={y} r={6}
                  fill={c.albums.length > 0 ? '#0d9488' : '#5eead4'}
                  stroke="white" strokeWidth={2}
                />
                {/* Album count badge */}
                {c.albums.length > 0 && (
                  <text x={x + 9} y={y - 6} fontSize="9" fill="#0f766e" fontWeight="600">
                    {c.albums.length}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hovered && (
          <div
            className="absolute pointer-events-none bg-white rounded-xl shadow-lg border border-slate-100 p-3 w-48 z-10"
            style={{
              left: `${(tooltipPos.x / W) * 100}%`,
              top: `${(tooltipPos.y / H) * 100}%`,
              transform: 'translate(-50%, -110%)',
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <MapPin className="h-3.5 w-3.5 text-teal-500" />
              <span className="font-semibold text-sm text-slate-800">{hovered.country}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> {hovered.postCount} {hovered.postCount === 1 ? 'post' : 'posts'}
              </span>
              <span className="flex items-center gap-1">
                <Images className="h-3 w-3" /> {hovered.albums.length} {hovered.albums.length === 1 ? 'album' : 'albums'}
              </span>
            </div>
            {hovered.albums.length > 0 && (
              <Link
                to={`/profile/${profileUserId}/albums`}
                className="mt-2 block text-xs font-medium text-teal-600 hover:text-teal-800"
              >
                View albums →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Unmapped countries note */}
      {unmapped.length > 0 && (
        <div className="px-6 py-3 border-t border-slate-50">
          <p className="text-xs text-slate-400">
            Also visited: {unmapped.map(c => c.country).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

export default WorldMap;
