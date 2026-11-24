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
  Layers,
  Loader2,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Minus,
  MousePointerClick,
  Navigation,
  Plus,
  X,
} from 'lucide-react';
import { INDIA_STATES_GEOJSON } from '../data/indiaStatesGeo.ts';
import { formatINR } from '../data/travelData.ts';
import type { DestinationMapPoint } from '../types.ts';

const ENV_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const INDIA_CENTER = { lat: 22.4, lng: 82.3 };
const DEFAULT_INDIA_ZOOM = 4.7;

const SVG_W = 900;
const SVG_H = 1000;
const PAD_X = 28;
const PAD_Y = 24;

const INDIA_BOUNDS = {
  minLat: 6.4,
  maxLat: 37.3,
  minLon: 67.8,
  maxLon: 97.6,
};

const STATE_SHORT_CODES: Record<string, string> = {
  'Jammu and Kashmir': 'J&K',
  Ladakh: 'LA',
  'Himachal Pradesh': 'HP',
  Uttarakhand: 'UK',
  Punjab: 'PB',
  Haryana: 'HR',
  Rajasthan: 'RJ',
  'Uttar Pradesh': 'UP',
  Bihar: 'BR',
  Gujarat: 'GJ',
  'Madhya Pradesh': 'MP',
  Chhattisgarh: 'CG',
  Jharkhand: 'JH',
  'West Bengal': 'WB',
  Sikkim: 'SK',
  Assam: 'AS',
  'Arunachal Pradesh': 'AR',
  Meghalaya: 'ML',
  Nagaland: 'NL',
  Manipur: 'MN',
  Mizoram: 'MZ',
  Tripura: 'TR',
  Maharashtra: 'MH',
  Odisha: 'OD',
  Telangana: 'TS',
  'Andhra Pradesh': 'AP',
  Karnataka: 'KA',
  Kerala: 'KL',
  'Tamil Nadu': 'TN',
  Goa: 'GA',
  'Andaman and Nicobar Islands': 'A&N',
  Lakshadweep: 'LD',
};

function projectIndiaPoint(lat: number, lon: number) {
  const usableW = SVG_W - PAD_X * 2;
  const usableH = SVG_H - PAD_Y * 2;
  const x =
    PAD_X +
    ((lon - INDIA_BOUNDS.minLon) /
      (INDIA_BOUNDS.maxLon - INDIA_BOUNDS.minLon)) *
      usableW;
  const y =
    PAD_Y +
    ((INDIA_BOUNDS.maxLat - lat) /
      (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat)) *
      usableH;
  return { x, y };
}

function unprojectIndiaPoint(svgX: number, svgY: number) {
  const usableW = SVG_W - PAD_X * 2;
  const usableH = SVG_H - PAD_Y * 2;
  const lon =
    INDIA_BOUNDS.minLon +
    ((svgX - PAD_X) / usableW) * (INDIA_BOUNDS.maxLon - INDIA_BOUNDS.minLon);
  const lat =
    INDIA_BOUNDS.maxLat -
    ((svgY - PAD_Y) / usableH) * (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat);
  return {
    lat: Number(
      Math.max(INDIA_BOUNDS.minLat, Math.min(INDIA_BOUNDS.maxLat, lat)).toFixed(4)
    ),
    lon: Number(
      Math.max(INDIA_BOUNDS.minLon, Math.min(INDIA_BOUNDS.maxLon, lon)).toFixed(4)
    ),
  };
}

function ringToSvgPath(ring: number[][]): string {
  if (!ring.length) return '';
  let d = '';
  for (let i = 0; i < ring.length; i++) {
    const [lon, lat] = ring[i];
    const { x, y } = projectIndiaPoint(lat, lon);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return `${d}Z`;
}

function featureToSvgPath(
  geometry: (typeof INDIA_STATES_GEOJSON.features)[number]['geometry']
): string {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map(ringToSvgPath).join(' ');
  }
  return geometry.coordinates
    .map((poly) => poly.map(ringToSvgPath).join(' '))
    .join(' ');
}

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

interface IndiaStatesOverlayLayerProps {
  pickingStartOnMap?: boolean;
  onHoverStateChange: (stateName: string | null) => void;
}

const IndiaStatesOverlayLayer: React.FC<IndiaStatesOverlayLayerProps> = ({
  pickingStartOnMap,
  onHoverStateChange,
}) => {
  const map = useMap();
  const loadedRef = useRef(false);
  const hoveredStateRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!loadedRef.current) {
      map.data.addGeoJson(INDIA_STATES_GEOJSON);
      loadedRef.current = true;
    }

    const applyStyles = () => {
      map.data.setStyle((feature) => {
        const stName = String(feature.getProperty('st_nm') || '');
        const isHovered = stName === hoveredStateRef.current;
        return {
          fillColor: '#1d4738',
          fillOpacity: isHovered ? 0.1 : 0.015,
          strokeColor: isHovered ? '#141714' : '#1d4738',
          strokeOpacity: isHovered ? 0.9 : 0.65,
          strokeWeight: isHovered ? 2.2 : 1.3,
          clickable: !pickingStartOnMap,
          zIndex: isHovered ? 2 : 1,
        };
      });
    };

    applyStyles();

    const overListener = map.data.addListener(
      'mouseover',
      (event: google.maps.Data.MouseEvent) => {
        const name = String(event.feature.getProperty('st_nm') || '');
        hoveredStateRef.current = name || null;
        onHoverStateChange(name || null);
        applyStyles();
      }
    );

    const outListener = map.data.addListener('mouseout', () => {
      hoveredStateRef.current = null;
      onHoverStateChange(null);
      applyStyles();
    });

    return () => {
      google.maps.event.removeListener(overListener);
      google.maps.event.removeListener(outListener);
    };
  }, [map, pickingStartOnMap, onHoverStateChange]);

  return null;
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

interface IndiaStateVectorMapProps extends IndiaDestinationsMapProps {
  showGoogleSwitch?: boolean;
  onSwitchToGoogle?: () => void;
}

const IndiaStateVectorMap: React.FC<IndiaStateVectorMapProps> = ({
  points,
  originCoords,
  loading,
  pickingStartOnMap,
  onTogglePickStart,
  onPickOriginCoords,
  onExploreDestination,
  showGoogleSwitch,
  onSwitchToGoogle,
}) => {
  const [activePoint, setActivePoint] = useState<DestinationMapPoint | null>(
    null
  );
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragRef = useRef<{
    dragging: boolean;
    moved: boolean;
    startClientX: number;
    startClientY: number;
    startPanX: number;
    startPanY: number;
  }>({
    dragging: false,
    moved: false,
    startClientX: 0,
    startClientY: 0,
    startPanX: 0,
    startPanY: 0,
  });
  const svgRef = useRef<SVGSVGElement | null>(null);

  const stateShapes = useMemo(() => {
    return INDIA_STATES_GEOJSON.features.map((feature) => {
      const labelPos = projectIndiaPoint(
        feature.properties.labelLat,
        feature.properties.labelLng
      );
      return {
        name: feature.properties.st_nm,
        code: feature.properties.st_code,
        shortCode: STATE_SHORT_CODES[feature.properties.st_nm] || '',
        path: featureToSvgPath(feature.geometry),
        labelPos,
      };
    });
  }, []);

  const statePointCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const pt of points) {
      counts[pt.state] = (counts[pt.state] || 0) + 1;
    }
    return counts;
  }, [points]);

  const sortedPoints = useMemo(() => {
    return [...points].sort((a, b) => b.lat - a.lat);
  }, [points]);

  useEffect(() => {
    if (activePoint && !points.some((p) => p.id === activePoint.id)) {
      setActivePoint(null);
    }
  }, [points, activePoint]);

  const originProjected = useMemo(
    () => projectIndiaPoint(originCoords.lat, originCoords.lon),
    [originCoords.lat, originCoords.lon]
  );

  const clampPan = useCallback((nx: number, ny: number, targetZoom: number) => {
    const maxPanX = (SVG_W * (targetZoom - 1)) / 2 + 120;
    const maxPanY = (SVG_H * (targetZoom - 1)) / 2 + 120;
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, nx)),
      y: Math.max(-maxPanY, Math.min(maxPanY, ny)),
    };
  }, []);

  const handleZoomBy = (factor: number) => {
    setZoom((prev) => {
      const next = Math.max(1, Math.min(5.5, Number((prev * factor).toFixed(2))));
      setPan((p) => clampPan(p.x, p.y, next));
      return next;
    });
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleFocusStart = () => {
    const targetZoom = 2.4;
    const cx = SVG_W / 2;
    const cy = SVG_H / 2;
    const nextPanX = (cx - originProjected.x) * targetZoom;
    const nextPanY = (cy - originProjected.y) * targetZoom;
    setZoom(targetZoom);
    setPan(clampPan(nextPanX, nextPanY, targetZoom));
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    dragRef.current = {
      dragging: true,
      moved: false,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current.dragging || !svgRef.current) return;
    const dxPx = e.clientX - dragRef.current.startClientX;
    const dyPx = e.clientY - dragRef.current.startClientY;
    if (Math.hypot(dxPx, dyPx) > 4) {
      dragRef.current.moved = true;
    }
    if (!dragRef.current.moved) return;

    const rect = svgRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const scaleX = SVG_W / rect.width;
    const scaleY = SVG_H / rect.height;
    setPan(
      clampPan(
        dragRef.current.startPanX + dxPx * scaleX,
        dragRef.current.startPanY + dyPx * scaleY,
        zoom
      )
    );
  };

  const handlePointerUp = () => {
    dragRef.current.dragging = false;
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }
    if (!pickingStartOnMap || !onPickOriginCoords || !svgRef.current) {
      setActivePoint(null);
      return;
    }
    const rect = svgRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const scale = Math.min(rect.width / SVG_W, rect.height / SVG_H);
    const renderedW = SVG_W * scale;
    const renderedH = SVG_H * scale;
    const offsetX = (rect.width - renderedW) / 2;
    const offsetY = (rect.height - renderedH) / 2;

    const viewX = ((e.clientX - rect.left - offsetX) / renderedW) * SVG_W;
    const viewY = ((e.clientY - rect.top - offsetY) / renderedH) * SVG_H;

    // Invert transform translate(cx + panX, cy + panY) scale(zoom) translate(-cx, -cy)
    const cx = SVG_W / 2;
    const cy = SVG_H / 2;
    const svgX = (viewX - cx - pan.x) / zoom + cx;
    const svgY = (viewY - cy - pan.y) / zoom + cy;

    const { lat, lon } = unprojectIndiaPoint(svgX, svgY);
    onPickOriginCoords(lat, lon);
  };

  const invScale = 1 / Math.pow(zoom, 0.65);

  return (
    <div
      className={`relative w-full h-[500px] sm:h-[580px] bg-[#dfecee] overflow-hidden select-none ${
        pickingStartOnMap ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      {/* Top-left State / Map Switcher */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        {showGoogleSwitch && onSwitchToGoogle && (
          <div className="inline-flex items-center rounded-full bg-white/95 p-0.5 shadow-md border border-black/10 text-[11px] font-semibold">
            <button
              type="button"
              onClick={onSwitchToGoogle}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[#5a6159] hover:text-[#141714] cursor-pointer"
            >
              <MapIcon className="w-3 h-3" />
              Google Map
            </button>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1d4738] text-white">
              <Layers className="w-3 h-3" />
              State Borders
            </span>
          </div>
        )}
        {hoveredState && (
          <div className="px-3 py-1 rounded-full bg-white/95 text-[#141714] text-xs font-semibold shadow-md border border-black/10">
            {hoveredState}{' '}
            <span className="text-[#1d4738] font-mono">
              ({statePointCounts[hoveredState] || 0})
            </span>
          </div>
        )}
      </div>

      {/* Top-right Zoom Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => handleZoomBy(1.4)}
          aria-label="Zoom in India map"
          className="w-8 h-8 rounded-full bg-white/95 hover:bg-white text-[#141714] shadow-md border border-black/10 grid place-items-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleZoomBy(1 / 1.4)}
          aria-label="Zoom out India map"
          className="w-8 h-8 rounded-full bg-white/95 hover:bg-white text-[#141714] shadow-md border border-black/10 grid place-items-center cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {pickingStartOnMap && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141714] text-white text-xs font-semibold shadow-lg">
          <MousePointerClick className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Click anywhere on India map to set your starting point</span>
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
        <div className="absolute top-12 right-3 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-[#141714] text-xs font-semibold shadow border border-black/10">
          <span className="w-2 h-2 rounded-full bg-[#1d4738] animate-pulse" />
          Updating {points.length} dots...
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleSvgClick}
        role="img"
        aria-label={`Interactive India map with all 36 state and UT borders showing ${points.length} destinations`}
        className="w-full h-full touch-none"
      >
        <g
          transform={`translate(${SVG_W / 2 + pan.x}, ${SVG_H / 2 + pan.y}) scale(${zoom}) translate(${-SVG_W / 2}, ${-SVG_H / 2})`}
        >
          {/* Subtle latitude / longitude grid */}
          {[10, 15, 20, 25, 30, 35].map((lat) => {
            const { y } = projectIndiaPoint(lat, 80);
            return (
              <line
                key={`lat-${lat}`}
                x1={0}
                y1={y}
                x2={SVG_W}
                y2={y}
                stroke="#cbe0e3"
                strokeWidth={0.9 * invScale}
                strokeDasharray="5 5"
              />
            );
          })}
          {[70, 75, 80, 85, 90, 95].map((lon) => {
            const { x } = projectIndiaPoint(20, lon);
            return (
              <line
                key={`lon-${lon}`}
                x1={x}
                y1={0}
                x2={x}
                y2={SVG_H}
                stroke="#cbe0e3"
                strokeWidth={0.9 * invScale}
                strokeDasharray="5 5"
              />
            );
          })}

          {/* All 36 Indian States & UTs with exact State Borders */}
          {stateShapes.map((st) => {
            const isHovered = hoveredState === st.name;
            const hasActiveDot = activePoint?.state === st.name;
            return (
              <path
                key={st.name}
                d={st.path}
                fill={
                  hasActiveDot
                    ? '#e5efe9'
                    : isHovered
                      ? '#e9f1ec'
                      : '#f9f7f2'
                }
                stroke={isHovered || hasActiveDot ? '#1d4738' : '#7b9687'}
                strokeWidth={(isHovered || hasActiveDot ? 1.8 : 1.1) * invScale}
                strokeLinejoin="round"
                className="transition-colors duration-150"
                onMouseEnter={() => setHoveredState(st.name)}
                onMouseLeave={() =>
                  setHoveredState((prev) => (prev === st.name ? null : prev))
                }
              >
                <title>
                  {st.name} ({statePointCounts[st.name] || 0} places)
                </title>
              </path>
            );
          })}

          {/* Crisp State Labels */}
          {stateShapes.map((st) => {
            const label = zoom >= 1.8 ? st.name : st.shortCode;
            if (!label) return null;
            return (
              <text
                key={`lbl-${st.name}`}
                x={st.labelPos.x}
                y={st.labelPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={(zoom >= 1.8 ? 10 : 11) * invScale}
                fontWeight="600"
                fill="#56695e"
                opacity={0.78}
                pointerEvents="none"
                style={{ letterSpacing: '0.03em' }}
              >
                {label}
              </text>
            );
          })}

          {/* All matching Indian destinations plotted as clickable dots */}
          {sortedPoints.map((pt) => {
            const { x, y } = projectIndiaPoint(pt.lat, pt.lon);
            const isSelected = activePoint?.id === pt.id;
            const fill =
              pt.verificationStatus === 'Verified'
                ? '#1d4738'
                : pt.verificationStatus === 'Needs Review'
                  ? '#d97706'
                  : '#57534e';

            return (
              <circle
                key={pt.id}
                cx={x}
                cy={y}
                r={(isSelected ? 8.5 : 4.6) * invScale}
                fill={fill}
                stroke="#ffffff"
                strokeWidth={(isSelected ? 2.4 : 1.3) * invScale}
                className="cursor-pointer transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePoint(pt);
                }}
              >
                <title>
                  {pt.name} ({pt.district}, {pt.state}) — {pt.distanceKm} km from{' '}
                  {originCoords.label}
                </title>
              </circle>
            );
          })}

          {/* User starting location dot */}
          <g
            transform={`translate(${originProjected.x}, ${originProjected.y})`}
            className="cursor-default"
          >
            <circle r={16 * invScale} fill="#0284c7" opacity="0.22" />
            <circle
              r={7.5 * invScale}
              fill="#0284c7"
              stroke="#ffffff"
              strokeWidth={2.5 * invScale}
            />
            <title>
              Trip Start: {originCoords.label} ({originCoords.lat.toFixed(2)}° N,{' '}
              {originCoords.lon.toFixed(2)}° E)
            </title>
          </g>
        </g>
      </svg>

      {/* Bottom-left Camera & Pick Controls */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleResetView}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-[#141714] text-xs font-semibold shadow-md border border-black/10 cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-[#1d4738]" />
          All India
        </button>
        <button
          type="button"
          onClick={handleFocusStart}
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

      {/* Selected Destination Card */}
      {activePoint && (
        <div className="absolute bottom-4 right-4 z-30 w-[290px] max-w-[calc(100%-2rem)] bg-white rounded-2xl border border-black/10 shadow-xl p-3.5 space-y-2 text-[#141714]">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1d4738]">
                {activePoint.category} · {activePoint.region} India
              </p>
              <h4 className="text-sm font-bold leading-snug truncate">
                {activePoint.name}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setActivePoint(null)}
              aria-label="Close destination map preview"
              className="w-6 h-6 rounded-full hover:bg-[#f7f5f0] grid place-items-center cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5 text-xs text-[#5a6159]">
            <p className="inline-flex items-center gap-1 font-medium text-[#141714]">
              <MapPin className="w-3.5 h-3.5 text-[#1d4738] shrink-0" />
              {activePoint.district}, {activePoint.state}
            </p>
            <p className="font-mono text-[11px]">
              {activePoint.lat.toFixed(4)}° N, {activePoint.lon.toFixed(4)}° E
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 bg-[#f7f5f0] rounded-lg px-2.5 py-1.5 text-[11px]">
            <span className="inline-flex items-center gap-1 font-mono font-semibold text-[#1d4738]">
              <Navigation className="w-3 h-3" />
              {activePoint.distanceKm} km from {originCoords.label}
            </span>
            <span className="font-mono font-bold text-[#141714]">
              {formatINR(activePoint.estimatedDailyStudentCostInr)}/d
            </span>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => onExploreDestination(activePoint.id)}
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-full bg-[#1d4738] hover:bg-[#15362a] text-white text-xs font-semibold cursor-pointer"
            >
              <span>Explore Guide</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${activePoint.lat},${activePoint.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#ebe5da] hover:bg-[#ded6c7] text-[#141714] text-xs font-semibold"
            >
              Maps
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

interface IndiaDestinationsMapInnerProps extends IndiaDestinationsMapProps {
  onRuntimeError: () => void;
  onSwitchToStateBorders: () => void;
}

const IndiaDestinationsMapInner: React.FC<IndiaDestinationsMapInnerProps> = ({
  points,
  originCoords,
  isGpsOrigin,
  loading,
  pickingStartOnMap,
  onTogglePickStart,
  onPickOriginCoords,
  onExploreDestination,
  onRuntimeError,
  onSwitchToStateBorders,
}) => {
  const status = useApiLoadingStatus();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedPoint, setSelectedPoint] =
    useState<DestinationMapPoint | null>(null);
  const [selectedMarker, setSelectedMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [originInfoOpen, setOriginInfoOpen] = useState(false);
  const [originMarker, setOriginMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const statePointCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const pt of points) {
      counts[pt.state] = (counts[pt.state] || 0) + 1;
    }
    return counts;
  }, [points]);

  // Detect if Google Maps injects an inline error container (e.g. InvalidKeyMapError / RefererNotAllowed)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const checkErr = () => {
      if (el.querySelector('.gm-err-container')) {
        onRuntimeError();
      }
    };
    const observer = new MutationObserver(checkErr);
    observer.observe(el, { childList: true, subtree: true });
    const timer = window.setTimeout(checkErr, 2500);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [onRuntimeError]);

  const sortedPoints = useMemo(() => {
    return [...points].sort((a, b) => b.lat - a.lat);
  }, [points]);

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
      <IndiaStateVectorMap
        points={points}
        originCoords={originCoords}
        isGpsOrigin={isGpsOrigin}
        loading={loading}
        pickingStartOnMap={pickingStartOnMap}
        onTogglePickStart={onTogglePickStart}
        onPickOriginCoords={onPickOriginCoords}
        onExploreDestination={onExploreDestination}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[500px] sm:h-[580px] ${
        pickingStartOnMap ? 'cursor-crosshair' : ''
      }`}
    >
      {/* Top-left Map Mode Switch + State Hover Badge */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center rounded-full bg-white/95 p-0.5 shadow-md border border-black/10 text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1d4738] text-white">
            <MapIcon className="w-3 h-3" />
            Google Map
          </span>
          <button
            type="button"
            onClick={onSwitchToStateBorders}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[#5a6159] hover:text-[#141714] cursor-pointer"
          >
            <Layers className="w-3 h-3" />
            State Borders
          </button>
        </div>
        {hoveredState && (
          <div className="px-3 py-1 rounded-full bg-white/95 text-[#141714] text-xs font-semibold shadow-md border border-black/10">
            {hoveredState}{' '}
            <span className="text-[#1d4738] font-mono">
              ({statePointCounts[hoveredState] || 0})
            </span>
          </div>
        )}
      </div>

      {pickingStartOnMap && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141714] text-white text-xs font-semibold shadow-lg">
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
        <div className="absolute top-3 right-14 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-[#141714] text-xs font-semibold shadow border border-black/10">
          <span className="w-2 h-2 rounded-full bg-[#1d4738] animate-pulse" />
          Updating {points.length} dots...
        </div>
      )}

      <GoogleMap
        mapId="DEMO_MAP_ID"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        defaultCenter={INDIA_CENTER}
        defaultZoom={DEFAULT_INDIA_ZOOM}
        minZoom={4}
        gestureHandling="greedy"
        mapTypeControl={false}
        streetViewControl={false}
        style={{ width: '100%', height: '100%' }}
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
        <IndiaStatesOverlayLayer
          pickingStartOnMap={pickingStartOnMap}
          onHoverStateChange={setHoveredState}
        />

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
  const [resolvedKey, setResolvedKey] = useState<string>(ENV_MAPS_API_KEY);
  const [resolvingKey, setResolvingKey] = useState<boolean>(!ENV_MAPS_API_KEY);
  const [googleMapFailed, setGoogleMapFailed] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'google' | 'borders'>('google');

  useEffect(() => {
    const onQuotaOrAuthFail = () => setGoogleMapFailed(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaOrAuthFail);
    return () =>
      window.removeEventListener('gmp-quota-exceeded', onQuotaOrAuthFail);
  }, []);

  useEffect(() => {
    if (ENV_MAPS_API_KEY) {
      setResolvedKey(ENV_MAPS_API_KEY);
      setResolvingKey(false);
      return;
    }

    let active = true;
    fetch('/api/maps-config')
      .then(async (res) => {
        if (!res.ok) return '';
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) return '';
        const data = (await res.json()) as { apiKey?: string };
        return data.apiKey?.trim() || '';
      })
      .then((key) => {
        if (active && key) {
          setResolvedKey(key);
        }
      })
      .catch(() => {
        // State Borders vector map renders cleanly without network dependency
      })
      .finally(() => {
        if (active) setResolvingKey(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (resolvingKey) {
    return (
      <div className="w-full h-[500px] sm:h-[580px] bg-[#ebe5da]/50 flex flex-col items-center justify-center text-center p-6">
        <Loader2 className="w-7 h-7 animate-spin text-[#1d4738] mb-2" />
        <p className="text-sm font-semibold text-[#141714]">
          Loading India Map with State Borders ({props.points.length} locations)...
        </p>
      </div>
    );
  }

  const canUseGoogle = Boolean(resolvedKey) && !googleMapFailed;

  if (!canUseGoogle || viewMode === 'borders') {
    return (
      <IndiaStateVectorMap
        {...props}
        showGoogleSwitch={canUseGoogle}
        onSwitchToGoogle={() => setViewMode('google')}
      />
    );
  }

  return (
    <APIProvider
      apiKey={resolvedKey}
      libraries={['marker']}
      language="en"
      region="IN"
      onError={() => setGoogleMapFailed(true)}
    >
      <IndiaDestinationsMapInner
        {...props}
        onRuntimeError={() => setGoogleMapFailed(true)}
        onSwitchToStateBorders={() => setViewMode('borders')}
      />
    </APIProvider>
  );
};
