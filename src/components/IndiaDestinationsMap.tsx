import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  InfoWindow,
  Map as GoogleMap,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  ArrowUpRight,
  BadgeCheck,
  Compass,
  ExternalLink,
  LocateFixed,
  MapPin,
  MousePointerClick,
  Navigation,
  X,
} from 'lucide-react';
import { formatINR } from '../data/travelData.ts';
import type { DestinationMapPoint } from '../types.ts';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const INDIA_CENTER = { lat: 22.5937, lng: 78.9629 };
const DEFAULT_INDIA_ZOOM = 5;

interface OriginCoords {
  lat: number;
  lon: number;
  label: string;
}

interface IndiaDestinationsMapProps {
  points: DestinationMapPoint[];
  originCoords: OriginCoords;
  isGpsOrigin: boolean;
  loading: boolean;
  pickingStartOnMap?: boolean;
  onTogglePickStart?: () => void;
  onPickOriginCoords?: (lat: number, lon: number) => void;
  onExploreDestination: (id: string) => void;
}

interface DestinationDotMarkerProps {
  point: DestinationMapPoint;
  zIndex: number;
  isSelected: boolean;
  onSelect: (
    point: DestinationMapPoint,
    marker: google.maps.marker.AdvancedMarkerElement
  ) => void;
}

const DestinationDotMarker: React.FC<DestinationDotMarkerProps> = memo(
  ({ point, zIndex, isSelected, onSelect }) => {
    const [markerRef, marker] = useAdvancedMarkerRef();

    const dotColorClass =
      point.verificationStatus === 'Verified'
        ? 'bg-[#1d4738]'
        : point.verificationStatus === 'Needs Review'
          ? 'bg-amber-600'
          : 'bg-stone-600';

    return (
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: point.lat, lng: point.lon }}
        zIndex={isSelected ? 1100 : zIndex}
        anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
        title={`${point.name} (${point.district}, ${point.state}) — ${point.distanceKm} km`}
        onClick={() => {
          if (marker) {
            onSelect(point, marker);
          }
        }}
      >
        <div
          className={`rounded-full border-2 border-white shadow-md transition-transform duration-150 cursor-pointer ${dotColorClass} ${
            isSelected
              ? 'w-4 h-4 scale-125 ring-4 ring-[#1d4738]/35'
              : 'w-3 h-3 hover:scale-150 hover:ring-2 hover:ring-white'
          }`}
        />
      </AdvancedMarker>
    );
  }
);

DestinationDotMarker.displayName = 'DestinationDotMarker';

interface OriginStartMarkerProps {
  originCoords: OriginCoords;
  isGpsOrigin: boolean;
  isSelected: boolean;
  onSelect: (marker: google.maps.marker.AdvancedMarkerElement) => void;
}

const OriginStartMarker: React.FC<OriginStartMarkerProps> = ({
  originCoords,
  isGpsOrigin,
  isSelected,
  onSelect,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <AdvancedMarker
      ref={markerRef}
      position={{ lat: originCoords.lat, lng: originCoords.lon }}
      zIndex={1250}
      anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
      title={`Trip Start: ${originCoords.label}`}
      onClick={() => {
        if (marker) {
          onSelect(marker);
        }
      }}
    >
      <div className="relative flex items-center justify-center cursor-pointer">
        <span
          aria-hidden="true"
          className="absolute w-7 h-7 rounded-full bg-sky-500/35 animate-ping"
        />
        <span
          className={`relative w-4 h-4 rounded-full bg-sky-600 border-2 border-white shadow-lg ${
            isSelected ? 'ring-4 ring-sky-400/50 scale-110' : ''
          }`}
        />
        <span className="sr-only">
          {isGpsOrigin ? 'Your GPS starting location' : originCoords.label}
        </span>
      </div>
    </AdvancedMarker>
  );
};

interface MapCameraControlsProps {
  points: DestinationMapPoint[];
  originCoords: OriginCoords;
  pickingStartOnMap?: boolean;
  onTogglePickStart?: () => void;
}

const MapCameraControls: React.FC<MapCameraControlsProps> = ({
  points,
  originCoords,
  pickingStartOnMap,
  onTogglePickStart,
}) => {
  const map = useMap();
  const prevOriginKeyRef = useRef<string>('');
  const prevPointsSigRef = useRef<string>('');

  // Fit bounds when filters narrow down to a focused subset of places
  useEffect(() => {
    if (!map) return;
    const sig = `${points.length}:${points[0]?.id || ''}:${points[points.length - 1]?.id || ''}`;
    if (sig === prevPointsSigRef.current) return;
    prevPointsSigRef.current = sig;

    if (points.length === 1) {
      map.panTo({ lat: points[0].lat, lng: points[0].lon });
      map.setZoom(10);
    } else if (points.length > 1 && points.length <= 45) {
      const bounds = new google.maps.LatLngBounds();
      for (const pt of points) {
        bounds.extend({ lat: pt.lat, lng: pt.lon });
      }
      map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });
    } else if (points.length > 200) {
      map.panTo(INDIA_CENTER);
      map.setZoom(DEFAULT_INDIA_ZOOM);
    }
  }, [map, points]);

  // Smoothly pan to the user's starting point whenever they switch city or detect GPS
  useEffect(() => {
    if (!map) return;
    const key = `${originCoords.lat}:${originCoords.lon}:${originCoords.label}`;
    if (!prevOriginKeyRef.current) {
      prevOriginKeyRef.current = key;
      return;
    }
    if (key === prevOriginKeyRef.current) return;
    prevOriginKeyRef.current = key;
    map.panTo({ lat: originCoords.lat, lng: originCoords.lon });
  }, [map, originCoords]);

  const handleResetIndia = () => {
    if (!map) return;
    map.panTo(INDIA_CENTER);
    map.setZoom(DEFAULT_INDIA_ZOOM);
  };

  const handleFocusOrigin = () => {
    if (!map) return;
    map.panTo({ lat: originCoords.lat, lng: originCoords.lon });
    map.setZoom(7);
  };

  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleResetIndia}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-[#141714] text-xs font-semibold shadow-md border border-black/10 cursor-pointer"
      >
        <Compass className="w-3.5 h-3.5 text-[#1d4738]" />
        All India
      </button>
      <button
        type="button"
        onClick={handleFocusOrigin}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-md cursor-pointer"
      >
        <LocateFixed className="w-3.5 h-3.5" />
        Focus Start: {originCoords.label}
      </button>
      {onTogglePickStart && (
        <button
          type="button"
          onClick={onTogglePickStart}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md cursor-pointer transition-colors ${
            pickingStartOnMap
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-white/95 hover:bg-white text-[#141714] border border-black/10'
          }`}
        >
          <MousePointerClick className="w-3.5 h-3.5" />
          {pickingStartOnMap ? 'Cancel Map Pick' : 'Set Start on Map'}
        </button>
      )}
    </div>
  );
};

const IndiaDestinationsMapInner: React.FC<IndiaDestinationsMapProps> = ({
  points,
  originCoords,
  isGpsOrigin,
  loading,
  pickingStartOnMap,
  onTogglePickStart,
  onPickOriginCoords,
  onExploreDestination,
}) => {
  const status = useApiLoadingStatus();
  const [selectedPoint, setSelectedPoint] =
    useState<DestinationMapPoint | null>(null);
  const [selectedMarker, setSelectedMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [originInfoOpen, setOriginInfoOpen] = useState(false);
  const [originMarker, setOriginMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);

  // Sort northern latitudes first so southern dots cleanly render in front
  const sortedPoints = useMemo(() => {
    return [...points].sort((a, b) => b.lat - a.lat);
  }, [points]);

  // Clear stale InfoWindow if filtered out
  useEffect(() => {
    if (selectedPoint && !points.some((p) => p.id === selectedPoint.id)) {
      setSelectedPoint(null);
      setSelectedMarker(null);
    }
  }, [points, selectedPoint]);

  const handleSelectDot = useCallback(
    (
      point: DestinationMapPoint,
      marker: google.maps.marker.AdvancedMarkerElement
    ) => {
      setOriginInfoOpen(false);
      setSelectedPoint(point);
      setSelectedMarker(marker);
    },
    []
  );

  const handleSelectOrigin = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement) => {
      setSelectedPoint(null);
      setSelectedMarker(null);
      setOriginMarker(marker);
      setOriginInfoOpen(true);
    },
    []
  );

  if (
    status === APILoadingStatus.FAILED ||
    status === APILoadingStatus.AUTH_FAILURE
  ) {
    return (
      <div className="w-full h-[460px] sm:h-[520px] bg-[#ebe5da]/60 flex flex-col items-center justify-center text-center p-6">
        <MapPin className="w-8 h-8 text-[#1d4738] mb-2" />
        <p className="font-editorial text-xl font-semibold text-[#141714]">
          Google Maps could not finish loading
        </p>
        <p className="text-xs sm:text-sm text-[#5a6159] mt-1 max-w-md">
          Showing {points.length} matching destinations across India starting
          from {originCoords.label} ({originCoords.lat.toFixed(2)}° N,{' '}
          {originCoords.lon.toFixed(2)}° E). Check API key availability or click
          any destination card below for exact map coordinates.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-[460px] sm:h-[520px] ${
        pickingStartOnMap ? 'cursor-crosshair' : ''
      }`}
    >
      {pickingStartOnMap && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141714] text-white text-xs font-semibold shadow-lg">
          <MousePointerClick className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Click anywhere on the map to set your trip starting point</span>
          {onTogglePickStart && (
            <button
              type="button"
              onClick={onTogglePickStart}
              aria-label="Cancel picking start point on map"
              className="ml-1 w-5 h-5 rounded-full bg-white/15 hover:bg-white/25 grid place-items-center cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
      {loading && (
        <div className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-[#141714] text-xs font-semibold shadow border border-black/10">
          <span className="w-2 h-2 rounded-full bg-[#1d4738] animate-pulse" />
          Updating {points.length} dots...
        </div>
      )}
      <GoogleMap
        mapId="DEMO_MAP_ID"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        defaultCenter={INDIA_CENTER}
        defaultZoom={DEFAULT_INDIA_ZOOM}
        gestureHandling="greedy"
        mapTypeControl={false}
        streetViewControl={false}
        className="w-full h-[460px] sm:h-[520px]"
        onClick={(ev) => {
          if (pickingStartOnMap && ev.detail.latLng && onPickOriginCoords) {
            onPickOriginCoords(
              Number(ev.detail.latLng.lat.toFixed(4)),
              Number(ev.detail.latLng.lng.toFixed(4))
            );
            return;
          }
          setSelectedPoint(null);
          setSelectedMarker(null);
          setOriginInfoOpen(false);
        }}
      >
        <MapCameraControls
          points={sortedPoints}
          originCoords={originCoords}
          pickingStartOnMap={pickingStartOnMap}
          onTogglePickStart={onTogglePickStart}
        />

        <OriginStartMarker
          originCoords={originCoords}
          isGpsOrigin={isGpsOrigin}
          isSelected={originInfoOpen}
          onSelect={handleSelectOrigin}
        />

        {sortedPoints.map((pt, idx) => (
          <DestinationDotMarker
            key={pt.id}
            point={pt}
            zIndex={idx + 1}
            isSelected={selectedPoint?.id === pt.id}
            onSelect={handleSelectDot}
          />
        ))}

        {originInfoOpen && originMarker && (
          <InfoWindow
            anchor={originMarker}
            maxWidth={260}
            onCloseClick={() => setOriginInfoOpen(false)}
          >
            <div className="p-1 text-[#141714] space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                {isGpsOrigin ? 'Live GPS Origin' : 'Selected Starting City'}
              </p>
              <p className="text-sm font-bold">{originCoords.label}</p>
              <p className="text-[11px] font-mono text-[#5a6159]">
                {originCoords.lat.toFixed(4)}° N, {originCoords.lon.toFixed(4)}°
                E
              </p>
              <p className="text-[11px] text-[#5a6159]">
                Distances to all {points.length} places on the map are
                calculated from here.
              </p>
            </div>
          </InfoWindow>
        )}

        {selectedPoint && selectedMarker && (
          <InfoWindow
            anchor={selectedMarker}
            maxWidth={290}
            onCloseClick={() => {
              setSelectedPoint(null);
              setSelectedMarker(null);
            }}
          >
            <div className="p-1 text-[#141714] space-y-2 min-w-[220px]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1d4738]">
                    {selectedPoint.category} · {selectedPoint.region} India
                  </p>
                  <h4 className="text-sm font-bold leading-snug">
                    {selectedPoint.name}
                  </h4>
                </div>
                {selectedPoint.verificationStatus === 'Verified' && (
                  <BadgeCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                )}
              </div>

              <div className="space-y-0.5 text-xs text-[#5a6159]">
                <p className="inline-flex items-center gap-1 font-medium text-[#141714]">
                  <MapPin className="w-3.5 h-3.5 text-[#1d4738] shrink-0" />
                  {selectedPoint.district}, {selectedPoint.state}
                </p>
                <p className="font-mono text-[11px]">
                  {selectedPoint.lat.toFixed(4)}° N,{' '}
                  {selectedPoint.lon.toFixed(4)}° E
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 bg-[#f7f5f0] rounded-lg px-2.5 py-1.5 text-[11px]">
                <span className="inline-flex items-center gap-1 font-mono font-semibold text-[#1d4738]">
                  <Navigation className="w-3 h-3" />
                  {selectedPoint.distanceKm} km from {originCoords.label}
                </span>
                <span className="font-mono font-bold text-[#141714]">
                  {formatINR(selectedPoint.estimatedDailyStudentCostInr)}/d
                </span>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => onExploreDestination(selectedPoint.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-full bg-[#1d4738] hover:bg-[#15362a] text-white text-xs font-semibold cursor-pointer"
                >
                  <span>Explore Guide</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedPoint.lat},${selectedPoint.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#ebe5da] hover:bg-[#ded6c7] text-[#141714] text-xs font-semibold"
                >
                  Maps
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export const IndiaDestinationsMap: React.FC<IndiaDestinationsMapProps> = (
  props
) => {
  if (!MAPS_API_KEY) {
    return (
      <div className="w-full h-[460px] sm:h-[520px] bg-[#ebe5da]/60 flex flex-col items-center justify-center text-center p-6">
        <MapPin className="w-8 h-8 text-[#1d4738] mb-2" />
        <p className="font-editorial text-xl font-semibold text-[#141714]">
          Google Maps key not configured in environment
        </p>
        <p className="text-xs sm:text-sm text-[#5a6159] mt-1 max-w-md">
          {props.points.length} Indian destinations ready with exact GPS
          coordinates from {props.originCoords.label}. Restart the dev server to
          load your provisioned Google Maps API key.
        </p>
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={MAPS_API_KEY}
      libraries={['marker']}
      language="en"
      region="IN"
    >
      <IndiaDestinationsMapInner {...props} />
    </APIProvider>
  );
};
