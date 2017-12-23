(function() {

var GMapsControl = function(Response) {
    var map;
    var self = this;
    var polylineOptions = {
        default: {
            strokeColor: '#C83939',
            strokeOpacity: 1,
            strokeWeight: 4
        },
        highlight: {
            strokeColor: '#0A89F6',
            strokeOpacity: 1,
            strokeWeight: 7
        }
    }
    var polylines = [[],[],[],[],[],[],[],[],[],[],[],[]]; // 12 days
    var stopovers = [];
    var legs = [];
    var highlightLeg = new highlightLeg();

    return {
        initMap: initMap,
    }

    function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 4,
            center: {lat: 41.85, lng: -87.65},
            mapTypeId: google.maps.MapTypeId.ROADMAP
            // zoom: 8,
            // center: {lat: 44.43, lng: -110.59}
        });

        map.addListener('click', function() {
            resetLegs();
        });

        calculateAndDisplayRoute();
    }

    function calculateAndDisplayRoute() {

        var origin = '262 Chestnut St, San Francisco, CA';
        var destination = '132 Sharon St, Medford, MA';
        var waypts = [
            { location: "Point Reyes National Seashore", stopover: false },
            { location: "3095 Highway 1, Bodega Bay, CA", stopover: false }, // photo by the ocean
            { location: "Mendocino, CA", stopover: false },
            { location: "Black Sands Beach, Whitethorn, CA", stopover: false },
            { location: "Nadelos Campground", stopover: true },

            { location: "Prairie Creek Redwoods State Park", stopover: false },
            { location: "Confusion Hill", stopover: false },
            { location: "2875 SW Fairview Blvd, Portland, OR 97205", stopover: true },

            // { location: "Port Angeles, Washington", stopover: false },
            { location: "Ocean Island Inn Backpackers Suites, Victoria, BC", stopover: true },

            // { location: "Port Angeles, Washington", stopover: false },
            { location: "8201 Greenwood Ave N, Seattle, WA", stopover: true },

            { location: "Seattle-Tacoma International Airport", stopover: false },
            { location: "Bozeman, Montana", stopover: true },

            { location: "Boiling River, Yellowstone", stopover: false },
            // { location: "Midway Geyser Basin, Wyoming", stopover: false },
            // { location: "Old Faithful, Yellowstone National Park", stopover: false },
            // { location: "Grand Teton National Park", stopover: false },
            { location: "7527 N 1000 E, Tetonia, ID 83452", stopover: true },

            // { location: "Victor Emporium", stopover: false },
            { location: "Rodeway Inn & Suites Riverton", stopover: true },

            // { location: "Deadwood, South Dakota", stopover: false },
            { location: "Mount Rushmore", stopover: false },
            { location: "Sage Creek Campground", stopover: true },

            { location: "Wall Drug Store", stopover: false },
            { location: "Sioux Falls Airport Terminal", stopover: false },
            { location: "Kansas City, Missouri", stopover: true },

            { location: "614 Pine St, Madison, WI 53715", stopover: true },

            { location: "Carnegie Mellon", stopover: true },
        ];
        window.directions = {origin: origin, destination: destination, waypts: waypts};

        renderDirectionsPolylines(Response);
        var route = Response.routes[0];

        // requestPath();
    }

    function renderDirectionsPolylines(response) {
        var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        for (var i=0; i<polylines.length; i++) {
            for (var j=0; j<polylines[i].length; j++) {
                polylines[i][j].setMap(null);

            }
        }

        legs = response.routes[0].legs;
        for (i = 0; i < legs.length; i++) {
            stopovers.push(new google.maps.Marker({
                position: legs[i].start_location,
                map: map,
                label: labels[i % labels.length]
            }));
            if (i + 1 == legs.length) {
                stopovers.push(new google.maps.Marker({
                    position: legs[i].end_location,
                    map: map,
                    label: labels[i + 1 % labels.length]
                }));
            }
            createLeg(i);
        }
    }

    function createLeg(legIndex) {
        var steps = legs[legIndex].steps;

        for (j = 0; j < steps.length; j++) {
            var nextSegment = steps[j].path;
            var stepPolyline = new google.maps.Polyline(polylineOptions.default);
            for (k = 0; k < nextSegment.length; k++) {
                stepPolyline.getPath().push(nextSegment[k]);
            }
            stepPolyline.addListener('mouseover', function(evt) {
                highlightLeg.highlight(legIndex);
            })

            stepPolyline.addListener('mouseout', function(evt) {
                highlightLeg.reset();
            })

            stepPolyline.addListener('click', function(evt) {
                console.log(stepPolyline);
                console.log("leg " + legIndex);
                console.log(evt);
                console.log(evt.latLng.toUrlValue(6));
                highlightLeg.highlight(legIndex);
                MediaControlVM.openDay(legIndex + 1);
            })
            stepPolyline.setMap(map);

            polylines[legIndex].push(stepPolyline);
        }
    }

    function highlightLeg() {
        var selectedLeg = null;
        return {
            get: selectedLeg,
            highlight: function(legIndex) {
                resetLegs(legIndex);
                for (var j=0; j<polylines[legIndex].length; j++) {
                    polylines[legIndex][j].setOptions(polylineOptions.highlight);
                }
                selectedLeg = legIndex;
            },
            reset: function () { resetLeg(selectedLeg); }
        }
    }


    function clearLeg(legIndex) {
        for (var j=0; j<polylines[legIndex].length; j++) {
            polylines[legIndex][j].setMap(null);
        }
    }

    function resetLeg(index) {
        for (var j=0; j<polylines[index].length; j++) {
            polylines[index][j].setOptions(polylineOptions.default);
        }
    }

    function resetLegs(ignoreIndex) {
        for (var i=0; i<polylines.length; i++) {
            if (!ignoreIndex || i != ignoreIndex) {
                resetLeg(i);
            }
        }
    }

    function requestPath(stringify, pretty) {
        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer({
            suppressPolylines: true,
        });
        console.log(window.directions);

        directionsService.route({
            origin: window.directions.origin,
            destination: window.directions.destination,
            waypoints: window.directions.waypts,
            travelMode: 'DRIVING',
            drivingOptions: {
                departureTime: new Date('2018-09-19')
            }
        }, function(response, status) {
            if (status === 'OK') {
                if (stringify) {
                    spacing = pretty ? 2 : 0;
                    data = stringify == 'full' ? response : response.routes[0].legs;
                    console.log(JSON.stringify(data, null, spacing));
                } else {
                    console.log(response);
                }
                directionsDisplay.setDirections(response);
                directionsDisplay.setMap(map);
                renderDirectionsPolylines(response);
                var route = response.routes[0];
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }
}

var Response = window.googleMapsResponse;

console.log(Response);
window.GMapsControl = new GMapsControl(Response);

})();
