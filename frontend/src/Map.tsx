import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import type { CircleMarker as LeafletCircle } from "leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";

// ── Componente interno: ajusta foco/zoom do mapa ──────────────────────────────
function Focus({
  selected,
  items,
  location,
}: {
  selected: string;
  items: any[];
  location?: number[];
}) {
  const map = useMap();
  const animated = !matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    map.invalidateSize();

    // 1. Se um ponto está selecionado, centraliza nele
    const p = items.find((p) => p.id === selected);
    if (p) {
      map.flyTo([p.latitude, p.longitude], 15, { animate: animated });
      return;
    }

    // 2. Se temos a localização do usuário, ajusta zoom para mostrar
    //    o usuário + o ponto mais próximo (ou todos se não houver próximo)
    if (location && items.length > 0) {
      const nearest = items[0]; // items já chegam ordenados por distância quando há localização
      map.fitBounds(
        [
          [location[0], location[1]],
          [nearest.latitude, nearest.longitude],
        ],
        { padding: [60, 60], maxZoom: 14, animate: animated }
      );
      return;
    }

    // 3. Só localização, sem pontos
    if (location) {
      map.setView([location[0], location[1]], 13, { animate: animated });
      return;
    }

    // 4. Sem localização: fitBounds de todos os pontos
    if (items.length) {
      map.fitBounds(
        items.map((p) => [p.latitude, p.longitude] as [number, number]),
        { padding: [35, 35], maxZoom: 12, animate: animated }
      );
    }
  }, [selected, items, location, map, animated]);

  return null;
}

// ── Componente interno: captura clique no mapa (modo pick) ────────────────────
function Pick({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

// ── Marcador da posição do usuário ────────────────────────────────────────────
function UserMarker({ location }: { location: number[] }) {
  return (
    <>
      {/* Anel externo animado (pulse) */}
      <CircleMarker
        center={[location[0], location[1]]}
        radius={18}
        pathOptions={{
          color: "#1a6faf",
          weight: 2,
          fillColor: "#1a6faf",
          fillOpacity: 0.15,
          className: "user-pulse",
        }}
        interactive={false}
      />
      {/* Ponto central sólido */}
      <CircleMarker
        center={[location[0], location[1]]}
        radius={8}
        pathOptions={{
          color: "#fff",
          weight: 3,
          fillColor: "#1a6faf",
          fillOpacity: 1,
        }}
        interactive={false}
      >
        <Popup>
          <strong>Sua localização</strong>
        </Popup>
      </CircleMarker>
    </>
  );
}

// ── Componente principal exportado ────────────────────────────────────────────
export default function Map({
  items,
  selected = "",
  onSelect = () => {},
  location,
  onPick,
}: {
  items: any[];
  selected?: string;
  onSelect?: (id: string) => void;
  location?: number[];
  onPick?: (lat: number, lng: number) => void;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="map-wrap">
      {failed && (
        <p className="map-warning" role="status">
          Mapa indisponível. Use os endereços na lista.
        </p>
      )}
      <MapContainer
        center={
          location
            ? [location[0], location[1]]
            : [-15.78, -47.93] // centro do Brasil como fallback
        }
        zoom={location ? 12 : 5}
        style={{ height: "100%", minHeight: 360 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
          eventHandlers={{ tileerror: () => setFailed(true) }}
        />

        <Focus items={items} selected={selected} location={location} />

        {onPick && <Pick onPick={onPick} />}

        {/* Marcador da posição do usuário */}
        {location && <UserMarker location={location} />}

        {/* Marcadores dos pontos de doação */}
        {items.map((p) => (
          <PointMarker
            key={p.id}
            p={p}
            selected={selected}
            onSelect={onSelect}
            picking={!!onPick}
          />
        ))}
      </MapContainer>
    </div>
  );
}

// ── Marcador de cada ponto de doação ──────────────────────────────────────────
function PointMarker({
  p,
  selected,
  onSelect,
  picking,
}: {
  p: any;
  selected: string;
  onSelect: (id: string) => void;
  picking: boolean;
}) {
  const ref = useRef<LeafletCircle>(null);
  const isSelected = p.id === selected;

  useEffect(() => {
    if (isSelected) ref.current?.openPopup();
  }, [isSelected]);

  // Endereço seguro (escapa XSS — React JSX já faz isso automaticamente)
  const address =
    p.isDemo
      ? "DEMONSTRAÇÃO — LOCAL FICTÍCIO"
      : [p.street, p.number].filter(Boolean).join(", ");

  // Categorias do ponto
  const cats: string[] = p.categories?.map((c: any) => c.category?.name).filter(Boolean) ?? [];

  // Link "Como chegar" via OpenStreetMap
  const osmDir = `https://www.openstreetmap.org/directions?to=${p.latitude},${p.longitude}`;

  return (
    <CircleMarker
      ref={ref}
      center={[p.latitude, p.longitude]}
      radius={isSelected ? 14 : 9}
      pathOptions={{
        color: "#fff",
        weight: isSelected ? 3 : 2,
        fillColor: isSelected ? "#a4583a" : "#174f3d",
        fillOpacity: 1,
      }}
      eventHandlers={{ click: () => onSelect(p.id) }}
    >
      <Popup minWidth={200}>
        <strong style={{ fontSize: 14, display: "block", marginBottom: 4 }}>
          {p.name}
        </strong>

        {cats.length > 0 && (
          <p style={{ margin: "4px 0", fontSize: 11, color: "#436447" }}>
            {cats.join(" · ")}
          </p>
        )}

        <p style={{ margin: "4px 0", fontSize: 12 }}>{address}</p>

        {p.distance !== undefined && (
          <p style={{ margin: "4px 0", fontSize: 11, color: "#687168" }}>
            {formatDist(p.distance)} de distância
          </p>
        )}

        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {!picking && (
            <Link
              to={"/pontos/" + p.id}
              style={{ fontSize: 12, color: "#174f3d" }}
            >
              Ver detalhes
            </Link>
          )}
          {!p.isDemo && (
            <a
              href={osmDir}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 12, color: "#1a6faf" }}
            >
              Como chegar ↗
            </a>
          )}
        </div>
      </Popup>
    </CircleMarker>
  );
}

// ── Utilitário: formata distância ─────────────────────────────────────────────
export function formatDist(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return km.toFixed(1).replace(".", ",") + " km";
}
