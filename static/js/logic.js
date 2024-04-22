// Define the URL for earthquake data
let earthquakeDataUrl = "https://earthquake-data-provider.com/week.geojson";

// Make a GET request to the specified URL
fetch(earthquakeDataUrl)
    .then(response => response.json())
    .then(function(data) {
        // Call the createFeatures function with the received data's features object
        visualizeEarthquakes(data.features);
    });

// Function to determine marker size based on magnitude
function determineMarkerSize(magnitude) {
    return magnitude * 4;
}

// Function to determine marker color based on depth
function determineMarkerColor(depth) {
    if (depth >= 90) {
        return "crimson";
    } else if (depth < 90 && depth >= 70) {
        return "orangered";
    } else if (depth < 70 && depth > 50) {
        return "darkorange";
    } else if (depth < 50 && depth > 30) {
        return "orange";
    } else if (depth < 30 && depth > 10) {
        return "yellow";
    } else {
        return "limegreen";
    }
}

// Function to create earthquake features
function visualizeEarthquakes(earthquakeData) {
    // Function to bind popup to each feature
    function onEachEarthquakeFeature(feature, layer) {
        layer.bindPopup(`<h1>Location: ${feature.properties.place}</h1><hr><h3>Magnitude: ${feature.properties.mag}</h3><br><h3>Depth: ${feature.geometry.coordinates[2]}</h3>`);
    } 

    // Create a GeoJSON layer with custom markers and popups
    let earthquakesLayer = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: determineMarkerSize(feature.properties.mag),
                fillColor: determineMarkerColor(feature.geometry.coordinates[2]),
                color: "black",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.5
            });
        },
        onEachFeature: onEachEarthquakeFeature
    });

    // Create the map
    createMap(earthquakesLayer);
}

// Function to create the map with layers
function createMap(earthquakesLayer) {
    // Define base map layers
    let streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    
    let topographyMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Define base maps object
    let baseMaps = {
        "Street Map": streetMap,
        "Topography Map": topographyMap
    };

    // Define overlay maps object
    let overlayMaps = {
        "Earthquakes": earthquakesLayer
    };

    // Create the map
    let myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [streetMap, earthquakesLayer]
    });

    // Add layer control to the map
    L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(myMap);

    // Create legend
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function(map) {
        let div = L.DomUtil.create("div", "info legend");
        const magnitudes = [-10, 10, 30, 50, 70, 90];
        const labels = [];
        const legendInfo = "<strong>Magnitude</strong>";
        div.innerHTML = legendInfo;

        // Loop through magnitudes array to generate legend HTML
        for (let i = 0; i < magnitudes.length; i++) {
            const from = magnitudes[i];
            const to = magnitudes[i + 1];
            labels.push(
                '<li style="background-color:' +
                determineMarkerColor(from + 1) +
                '"> <span>' +
                from +
                (to ? '&ndash;' + to : '+') +
                '</span></li>'
            );
        }   
  
        // Add label items to the div under the <ul> tag
        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    // Add legend to the map
    legend.addTo(myMap);
}