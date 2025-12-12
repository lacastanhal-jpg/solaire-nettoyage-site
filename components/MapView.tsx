'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface Site {
  id: string
  nomSite: string
  lat: number
  lng: number
  adresse1?: string
  ville?: string
  codePostal?: string
  surface?: number
  infosCompl?: string
}

interface MapViewProps {
  sites: Site[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
}

// Composant pour ajuster les bounds automatiquement
function MapBounds({ sites }: { sites: Site[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (sites.length > 1) {
      const bounds = L.latLngBounds(sites.map(site => [site.lat, site.lng]))
      map.fitBounds(bounds, { padding: [50, 50] })
    } else if (sites.length === 1) {
      map.setView([sites[0].lat, sites[0].lng], 15)
    }
  }, [sites, map])
  
  return null
}

export default function MapView({ sites, center, zoom = 6, height = '600px' }: MapViewProps) {
  // Filtrer les sites avec coordonnées valides
  const validSites = sites.filter(site => site.lat && site.lng)

  if (validSites.length === 0) {
    return (
      <div 
        className="bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center text-blue-700">
          <div className="text-4xl mb-2">📍</div>
          <div className="font-medium">Aucun site géolocalisé</div>
        </div>
      </div>
    )
  }

  // Centre par défaut : France
  const defaultCenter: [number, number] = center 
    ? [center.lat, center.lng] 
    : [46.603354, 1.888334]

  return (
    <div style={{ height }} className="rounded-lg border-2 border-blue-200 shadow-lg overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {!center && <MapBounds sites={validSites} />}
        
        {validSites.map((site) => (
          <Marker 
            key={site.id} 
            position={[site.lat, site.lng]}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '16px', fontWeight: 'bold' }}>
                  {site.nomSite}
                </h3>
                {site.adresse1 && (
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>📍</strong> {site.adresse1}
                  </p>
                )}
                {site.ville && (
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>🏙️</strong> {site.codePostal} {site.ville}
                  </p>
                )}
                {site.surface && site.surface > 0 && (
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>📐</strong> {site.surface} m²
                  </p>
                )}
                {site.infosCompl && (
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>ℹ️</strong> {site.infosCompl}
                  </p>
                )}
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#6b7280' }}>
                  <strong>GPS:</strong> {site.lat.toFixed(6)}, {site.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
