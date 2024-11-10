// Global variables
let map;
let markers = [];
let currentPolygon = null;
const API_BASE_URL = 'http://localhost:3000/api';

// Initialize the map when the page loads
document.addEventListener("DOMContentLoaded", () => {
    initializeMap();
});

// Initialize the map with Leaflet
function initializeMap() {
    // Initialize the map centered on Jodhpur, India
    map = L.map('map').setView([26.4753, 73.1173], 13);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add click handler for adding points
    map.on('click', function(e) {
        const point = {
            lat: e.latlng.lat,
            lng: e.latlng.lng
        };
        addPoint(point);
    });
}

// Clear all markers and polygons from the map
function clearMapOverlays() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    if (currentPolygon) {
        map.removeLayer(currentPolygon);
        currentPolygon = null;
    }
}

// Add a point to both the map and backend
async function addPoint(point) {
    try {
        const response = await fetch(`${API_BASE_URL}/point`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(point)
        });

        if (!response.ok) {
            throw new Error('Failed to add point');
        }

        // Add marker to the map
        const marker = L.marker([point.lat, point.lng]).addTo(map);
        markers.push(marker);

    } catch (error) {
        console.error('Error adding point:', error);
        alert('Failed to add point to the system');
    }
}

// Handle nearest neighbor search
async function findNearestNeighbor() {
    const locationInput = document.getElementById('nearest-point').value;
    if (!locationInput) {
        alert('Please enter a location (Latitude, Longitude)');
        return;
    }

    try {
        // Parse location input
        const [lat, lng] = locationInput.split(',').map(num => parseFloat(num.trim()));
        
        if (isNaN(lat) || isNaN(lng)) {
            throw new Error('Invalid coordinates');
        }

        const response = await fetch(`${API_BASE_URL}/nearest_neighbor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ lat, lng })
        });

        if (!response.ok) {
            throw new Error('Failed to find nearest neighbor');
        }

        const nearest = await response.json();

        // Clear previous results
        clearMapOverlays();

        // Add query point marker (blue)
        const queryMarker = L.marker([lat, lng], {
            icon: createCustomIcon('blue')
        }).addTo(map);
        queryMarker.bindPopup('Query Point').openPopup();
        markers.push(queryMarker);

        // Add nearest point marker (red)
        const nearestMarker = L.marker([nearest.lat, nearest.lng], {
            icon: createCustomIcon('red')
        }).addTo(map);
        nearestMarker.bindPopup('Nearest Point').openPopup();
        markers.push(nearestMarker);

        // Fit bounds to show both points
        const bounds = L.latLngBounds([
            [lat, lng],
            [nearest.lat, nearest.lng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });

    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Failed to find nearest neighbor');
    }
}

// Handle range query
async function executeRangeQuery() {
    const centerInput = document.getElementById('range-point').value;
    const radiusInput = document.getElementById('range-radius').value;

    if (!centerInput || !radiusInput) {
        alert('Please enter both center location and radius');
        return;
    }

    try {
        // Parse center point
        const [lat, lng] = centerInput.split(',').map(num => parseFloat(num.trim()));
        const radius = parseFloat(radiusInput);

        if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
            throw new Error('Invalid input values');
        }

        // Calculate bounding box for the query
        const earthRadius = 6371; // km
        const latOffset = (radius / earthRadius) * (180 / Math.PI);
        const lngOffset = (radius / earthRadius) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);

        const response = await fetch(`${API_BASE_URL}/range_query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                min_lat: lat - latOffset,
                max_lat: lat + latOffset,
                min_lng: lng - lngOffset,
                max_lng: lng + lngOffset
            })
        });

        if (!response.ok) {
            throw new Error('Failed to execute range query');
        }

        const points = await response.json();

        // Clear previous results
        clearMapOverlays();

        // Draw the search circle
        const circle = L.circle([lat, lng], {
            radius: radius * 1000, // Convert km to meters
            color: 'blue',
            fillColor: '#3388ff',
            fillOpacity: 0.2
        }).addTo(map);
        currentPolygon = circle;

        // Add markers for all points in range
        points.forEach(point => {
            const marker = L.marker([point.lat, point.lng], {
                icon: createCustomIcon('green')
            }).addTo(map);
            marker.bindPopup('Found Point');
            markers.push(marker);
        });

        // Fit map to show the circle
        map.fitBounds(circle.getBounds(), { padding: [50, 50] });

    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Failed to execute range query');
    }
}

// Handle intersection detection
async function detectIntersection() {
    const areaInput = document.getElementById('intersection-point').value;
    if (!areaInput) {
        alert('Please enter area points');
        return;
    }

    try {
        // Parse area points
        const points = areaInput.split(';').map(point => {
            const [lat, lng] = point.trim().split(',').map(num => parseFloat(num.trim()));
            if (isNaN(lat) || isNaN(lng)) {
                throw new Error('Invalid coordinates in area points');
            }
            return [lat, lng];
        });

        if (points.length < 3) {
            throw new Error('Please enter at least 3 points to form a polygon');
        }

        // Clear previous results
        clearMapOverlays();

        // Draw the polygon
        const polygon = L.polygon(points, {
            color: 'blue',
            fillColor: '#3388ff',
            fillOpacity: 0.2
        }).addTo(map);
        currentPolygon = polygon;

        // Fit map to show the polygon
        map.fitBounds(polygon.getBounds(), { padding: [50, 50] });

        // Send polygon points to backend for intersection detection
        const response = await fetch(`${API_BASE_URL}/intersection`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ points })
        });

        if (!response.ok) {
            throw new Error('Failed to detect intersections');
        }

        const intersectingPoints = await response.json();

        // Add markers for intersecting points
        intersectingPoints.forEach(point => {
            const marker = L.marker([point.lat, point.lng], {
                icon: createCustomIcon('red')
            }).addTo(map);
            marker.bindPopup('Intersecting Point');
            markers.push(marker);
        });

    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Failed to detect intersections');
    }
}

// Utility function to create custom colored markers
function createCustomIcon(color) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: ${color};
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 3px rgba(0,0,0,0.5);
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });
}