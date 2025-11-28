"use client"

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon in Next.js
// Leaflet's default icon paths don't work with webpack
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

interface SampleMapProps {
    lat: number
    lng: number
    siteName: string
    className?: string
}

export function SampleMap({ lat, lng, siteName, className = "" }: SampleMapProps) {
    const position: [number, number] = [lat, lng]

    return (
        <div className={className}>
            <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', borderRadius: '0.375rem' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} icon={icon}>
                    <Popup>
                        <div className="text-sm">
                            <strong>{siteName}</strong>
                            <br />
                            Lat: {lat.toFixed(6)}
                            <br />
                            Lng: {lng.toFixed(6)}
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    )
}
