"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

interface MapComponentProps {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  editable?: boolean;
}

function MapUpdater({ latitude, longitude }: { latitude: number | null; longitude: number | null }) {
  const map = useMap();

  useEffect(() => {
    if (latitude && longitude) {
      map.setView([latitude, longitude], map.getZoom());
    }
  }, [latitude, longitude, map]);

  return null;
}

export default function MapComponent({
  latitude,
  longitude,
  onLocationSelect,
  editable = false
}: MapComponentProps) {
  const [position, setPosition] = useState<[number, number]>(
    latitude && longitude ? [latitude, longitude] : [55.7558, 37.6173] // Москва по умолчанию
  );

  const handleMapClick = (e: any) => {
    if (editable && onLocationSelect) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    }
  };

  return (
    <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className={editable ? "cursor-crosshair" : ""}
        onclick={handleMapClick}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            {editable ? "Выбранное местоположение" : "Место путешествия"}
          </Popup>
        </Marker>
        <MapUpdater latitude={latitude} longitude={longitude} />
      </MapContainer>
    </div>
  );
}
