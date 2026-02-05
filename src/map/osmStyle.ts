export const osmMapStyle = {
  version: 8,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster' as const,
      source: 'osm',
      paint: {
        'raster-opacity': 0.9,
        'raster-saturation': 0.2,
        'raster-brightness-min': 0.4,
        'raster-brightness-max': 0.9,
      },
    },
  ],
};
