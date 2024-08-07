//start with map creation

//functions for marker size and color
function markerSize(mag){
    let radius = 1;
    if (mag > 0) {
        radius = mag ** 5;
    }
    return radius
}

function chooseColor(depth) {
    let color = "black"

    if (depth <= 10) {
        color = "#DAF7A6";
      } else if (depth <= 30) {
        color = "#FFC300";
      } else if (depth <= 50) {
        color = "#FF5733";
      } else if (depth <= 70) {
        color = "#C70039";
      } else if (depth <= 90) {
        color = "#900C3F";
      } else {
        color = "#581845";
      }
      return (color);
    }



function createMap(data, geodata) {
    //being with base layers
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
    
      let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      });

    //overlay layers
    let markers = L.markerClusterGroup();
    let heatArray = [];
    let circleArray = [];

    for (let i = 0; i <data.length; i++){
        let row = datap[i];
        let location = row.geometry;


        //marker
        if (location) {
            let point = [location.coordinates[1], location.coordinates[0]];

            let marker = L.marker(point);
            let popup = `<h1>${row.properties.title}</h1>`;
            marker.bindPopup(popup);
            markers.addLayer(marker);


            //heatmap connection
            heatArray.push(point);
            //circle creation for marker
            let circleMarker = L.circle(point,{
                fillOpacity: .8,
                color: chooseColor(location.coordinates[2]),
                fillColor: chooseColor(location.coordinates[2]),
                radius: markerSize(row.properties.mag)
            }).bindPopup(popup);

            circleArray.push(circleMarker);

        }
    }
    //create heatmap layer and tectonic plate layer
    let heatLayer = L.heatLayer(heatArray, {
        radius: 30,
        blur:15
    });

    let circleLayer = L.layerGroup(circleArray);

    let geolayer = L.geoJSON(geo_data,{
        style: {
            "color": "forestgreen",
            "weight" : 10
        }
    });

    //layer controls

    let baseLayers = {
        Street: street,
        Topography: topo
    };

    let overlayLayers = {
        Markers: markers,
        Heatmap: heatLayer,
        Circles: circleLayer,
        "Tectonic Plates": geolayer
    }

    //map initilazation 
    let myMap = L.map("map", {
        center: [40,-95],
        zoom: 5,
        layers: [ street,markers,geolayer]
    });

    //layer control & legend
    L.control.layers(baseLayers, overlayLayers).addTo(myMap);

    let legend = L.control({position: "topright"});
    legend.onAdd = function(){
        let div = L.DomUtil.create("div", "info legend");

        let legendInfo = "<h4>Legend</h4>"
        legendInfo += "<i style='background: #DAF7A6'></i>-10-10<br/>";
        legendInfo += "<i style='background: #FFC300'></i>10-30<br/>";
        legendInfo += "<i style='background: #FF5733'></i>30-50<br/>";
        legendInfo += "<i style='background: #C70039'></i>50-70<br/>";
        legendInfo += "<i style='background: #900C3F'></i>70-90<br/>";
        legendInfo += "<i style='background: #581845'></i>90+";

        div.innerHTML = legendInfo;
        return div;
    };

    //adding the legend to the map
    legend.addTo(myMap);
}

function doWork(){
    //api query URLs
    let earth_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
    let github_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

    d3.json(earth_url).then(function (data){
        console.log(data);
        d3.json(github_url).then(function (geodata){
            let data_rows  = data.features;
            //map creation with both datasets
            createMap(data_rows, geodata);
        });
    });
}

doWork();

