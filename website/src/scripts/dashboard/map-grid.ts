export interface OnlineViewport {
  lat: number
  lng: number
  zoom: number
}

export function gridViewports(
  center: { lat: number; lng: number },
  radiusKm: number,
  spacingKm: number
): OnlineViewport[] {
  if (!Number.isFinite(center.lat) || Math.abs(center.lat) > 85
    || !Number.isFinite(center.lng) || Math.abs(center.lng) > 180
    || !Number.isFinite(radiusKm) || radiusKm < 0 || radiusKm > 50
    || !Number.isFinite(spacingKm) || spacingKm < 1 || spacingKm > 20) {
    throw new Error('map grid: center, radius or spacing is outside the allowed range')
  }

  const zoom = Math.max(1, Math.min(21, Math.round(14 + Math.log2(10 / spacingKm))))
  const steps = Math.floor(radiusKm / spacingKm)
  const latStep = spacingKm / 111.32
  const lngStep = spacingKm / (111.32 * Math.cos(center.lat * Math.PI / 180))
  const points: { lat: number; lng: number; distance: number; dx: number; dy: number }[] = []

  for (let dy = -steps; dy <= steps; dy++) {
    for (let dx = -steps; dx <= steps; dx++) {
      const distance = Math.hypot(dx, dy)
      if (distance * spacingKm > radiusKm + 1e-9) continue
      const lat = center.lat + dy * latStep
      if (Math.abs(lat) > 90) continue
      const rawLng = center.lng + dx * lngStep
      const lng = ((rawLng + 180) % 360 + 360) % 360 - 180
      points.push({ lat, lng, distance, dx, dy })
    }
  }
  points.sort((a, b) => a.distance - b.distance || a.dy - b.dy || a.dx - b.dx)
  return points.map(point => ({ lat: point.lat, lng: point.lng, zoom }))
}
