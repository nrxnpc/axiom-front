import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Box, Paper, ToggleButtonGroup, ToggleButton, Typography, CircularProgress, TextField } from '@mui/material';
import Map, { Source, Layer, Marker, Popup, type MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { FeatureCollection } from 'geojson';
import { osmMapStyle } from './osmStyle';
import type { HeatPoint } from './mockData';
import {
  fetchDeliveryByBounds,
  fetchScansByBounds,
  fetchOrdersByBounds,
} from './mapApi';
import type { MapOrder } from './ordersMock';
import { defaultDateRange, type DateRange } from './dateRange';

type MapMode = 'delivery' | 'scan' | 'orders';

const center = { longitude: 37.6173, latitude: 55.7558 };

function pointsToGeoJSON(points: HeatPoint[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: points.map(([lat, lng, weight]) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: { weight },
    })),
  };
}

type BoundsGetter = () => { getWest: () => number; getSouth: () => number; getEast: () => number; getNorth: () => number };

function getBbox(map: { getBounds: BoundsGetter }): [number, number, number, number] {
  const b = map.getBounds();
  return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
}

export const MapPage = () => {
  const [mode, setMode] = useState<MapMode>('delivery');
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange);
  const [viewportDeliveryPoints, setViewportDeliveryPoints] = useState<HeatPoint[]>([]);
  const [viewportScanPoints, setViewportScanPoints] = useState<HeatPoint[]>([]);
  const [viewportOrders, setViewportOrders] = useState<MapOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<MapOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const deliveryRequestIdRef = useRef(0);
  const scanRequestIdRef = useRef(0);
  const ordersRequestIdRef = useRef(0);

  const heatPoints = useMemo(
    () => (mode === 'delivery' ? viewportDeliveryPoints : viewportScanPoints),
    [mode, viewportDeliveryPoints, viewportScanPoints]
  );

  const geojson = useMemo(() => pointsToGeoJSON(heatPoints), [heatPoints]);

  const loadParcelsForView = useCallback((map: { getBounds: BoundsGetter }, range: DateRange) => {
    const id = ++deliveryRequestIdRef.current;
    setLoading(true);
    fetchDeliveryByBounds(getBbox(map), range).then((points) => {
      if (id !== deliveryRequestIdRef.current) return;
      setViewportDeliveryPoints(points);
      setLoading(false);
    });
  }, []);

  const loadScansForView = useCallback((map: { getBounds: BoundsGetter }, range: DateRange) => {
    const id = ++scanRequestIdRef.current;
    setLoading(true);
    fetchScansByBounds(getBbox(map), range).then((points) => {
      if (id !== scanRequestIdRef.current) return;
      setViewportScanPoints(points);
      setLoading(false);
    });
  }, []);

  const loadOrdersForView = useCallback((map: { getBounds: BoundsGetter }, range: DateRange) => {
    const id = ++ordersRequestIdRef.current;
    setLoading(true);
    fetchOrdersByBounds(getBbox(map), range).then((orders) => {
      if (id !== ordersRequestIdRef.current) return;
      setViewportOrders(orders);
      setLoading(false);
    });
  }, []);

  const mapRef = useRef<MapRef | null>(null);

  const handleMoveEnd = useCallback(
    (e: { target: { getBounds: BoundsGetter } }) => {
      if (mode === 'delivery') loadParcelsForView(e.target, dateRange);
      else if (mode === 'scan') loadScansForView(e.target, dateRange);
      else loadOrdersForView(e.target, dateRange);
    },
    [mode, dateRange, loadParcelsForView, loadScansForView, loadOrdersForView]
  );

  useEffect(() => {
    setSelectedOrder(null);
  }, [mode]);

  const reloadForCurrentMode = useCallback(() => {
    const map = mapRef.current?.getMap?.();
    if (!map?.getBounds) return;
    if (mode === 'delivery') loadParcelsForView(map, dateRange);
    else if (mode === 'scan') loadScansForView(map, dateRange);
    else loadOrdersForView(map, dateRange);
  }, [mode, dateRange, loadParcelsForView, loadScansForView, loadOrdersForView]);

  useEffect(() => {
    reloadForCurrentMode();
  }, [mode, dateRange, reloadForCurrentMode]);

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Paper sx={{ p: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, value) => value != null && setMode(value)}
          size="small"
        >
          <ToggleButton value="delivery">Доставка</ToggleButton>
          <ToggleButton value="scan">Сканирования</ToggleButton>
          <ToggleButton value="orders">Заказы</ToggleButton>
        </ToggleButtonGroup>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
          <TextField
            size="small"
            type="date"
            label="Начало периода"
            value={dateRange.start}
            onChange={(e) => setDateRange((r) => ({ ...r, start: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
          <TextField
            size="small"
            type="date"
            label="Конец периода"
            value={dateRange.end}
            onChange={(e) => setDateRange((r) => ({ ...r, end: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
        </Box>
        {loading && (
          <CircularProgress size={20} sx={{ ml: 1 }} />
        )}
      </Paper>
      <Box sx={{ flex: 1, minHeight: 0, borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
        <Map
          ref={mapRef}
          initialViewState={{ ...center, zoom: 11 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={osmMapStyle as import('maplibre-gl').StyleSpecification}
          onMoveEnd={handleMoveEnd}
          onLoad={(e) => {
            if (mode === 'delivery') loadParcelsForView(e.target, dateRange);
            else if (mode === 'scan') loadScansForView(e.target, dateRange);
            else loadOrdersForView(e.target, dateRange);
          }}
        >
          {mode !== 'orders' && (
            <Source id="heatmap" type="geojson" data={geojson}>
              <Layer
                id="heatmap-layer"
                type="heatmap"
                paint={{
                  'heatmap-weight': ['get', 'weight'],
                  'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.5, 14, 1.5],
                  'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 15, 14, 40],
                  'heatmap-opacity': 0.6,
                  'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0,
                    'rgba(33,102,172,0)',
                    0.2,
                    'rgb(103,169,207)',
                    0.4,
                    'rgb(209,229,240)',
                    0.6,
                    'rgb(253,219,199)',
                    0.8,
                    'rgb(239,138,98)',
                    1,
                    'rgb(178,24,43)',
                  ],
                }}
              />
            </Source>
          )}
          {mode === 'orders' &&
            viewportOrders.map((order) => (
              <Marker
                key={order.id}
                longitude={order.lng}
                latitude={order.lat}
                anchor="bottom"
                onClick={() => setSelectedOrder(order)}
              >
                <Box
                  component="span"
                  sx={{
                    width: 28,
                    height: 28,
                    display: 'block',
                    borderRadius: '50% 50% 50% 0',
                    transform: 'rotate(-45deg)',
                    bgcolor: '#1976d2',
                    border: '2px solid #fff',
                    boxShadow: 1,
                    cursor: 'pointer',
                  }}
                />
              </Marker>
            ))}
          {mode === 'orders' && selectedOrder && (
            <Popup
              longitude={selectedOrder.lng}
              latitude={selectedOrder.lat}
              anchor="bottom"
              closeButton
              closeOnClick={false}
              onClose={() => setSelectedOrder(null)}
              style={{ paddingRight: 28 }}
            >
              <Box sx={{ p: 0.5, minWidth: 180, maxWidth: 280, pr: 3 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {selectedOrder.orderNumber}
                </Typography>
                <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
                  Состав:
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2, fontSize: '0.8rem' }}>
                  {selectedOrder.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </Box>
                <Typography variant="body2" fontWeight={600} sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                  Итого: {selectedOrder.total.toLocaleString('ru-RU')} ₽
                </Typography>
              </Box>
            </Popup>
          )}
        </Map>
      </Box>
    </Box>
  );
};
