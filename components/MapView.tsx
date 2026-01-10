'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import type { SiteComplet } from '@/lib/firebase'

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// FONCTION pour créer une icône sélectionnée (nouvelle instance à chaque fois)
function createSelectedIcon() {
  return new L.Icon({
    iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}

interface MapViewProps {
  sites: SiteComplet[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  onMarkerClick?: (site: SiteComplet) => void
  selectedSite?: SiteComplet | null
}

// Composant pour ajuster les bounds - AVEC PROTECTION UNMOUNT
function MapBounds({ sites }: { sites: SiteComplet[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (!map || sites.length === 0) return
    
    let mounted = true
    
    map.whenReady(() => {
      if (!mounted) return
      
      try {
        if (sites.length > 1) {
          const bounds = L.latLngBounds(sites.map(site => [site.lat, site.lng]))
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
        } else if (sites.length === 1) {
          map.setView([sites[0].lat, sites[0].lng], 15)
        }
      } catch (error) {
        console.error('Erreur MapBounds:', error)
      }
    })
    
    return () => {
      mounted = false
    }
  }, [sites, map])
  
  return null
}

export default function MapView({ sites, center, zoom = 6, height = '600px', onMarkerClick, selectedSite }: MapViewProps) {
  // Filtrer les sites avec coordonnées valides (pas 0,0)
  const validSites = sites.filter(site => 
    site.lat && site.lng && 
    site.lat !== 0 && site.lng !== 0 &&
    !isNaN(site.lat) && !isNaN(site.lng)
  )

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
    <div style={{ height }} className="rounded-lg border-2 border-blue-200 shadow-lg overflow-hidden w-full">
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        touchZoom={true}
        dragging={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {!center && <MapBounds sites={validSites} />}
        
        {validSites.map((site) => {
          const isSelected = selectedSite?.id === site.id
          
          return (
            <Marker 
              key={site.id} 
              position={[site.lat, site.lng]}
              icon={isSelected ? createSelectedIcon() : undefined}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) {
                    onMarkerClick(site)
                  }
                }
              }}
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
          )
        })}
      </MapContainer>
    </div>
  )
}
