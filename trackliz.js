Markers = new Mongo.Collection('markers');

if (Meteor.isClient) {
    Template.map.onCreated(function() {
        GoogleMaps.ready('map', function(map) {
            //Add a new marker with the given properties
            google.maps.event.addListener(map.instance, 'click', function(event) {
                //Store marker on database
                Markers.insert({
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng(),
                    score: 0,
                    issue_desc: "please describe the issue",
                    comments: "tell us about it",
                });
            });

            var markers = {};

            //add Elizabeth Trail on map
            var ctaLayer = new google.maps.KmlLayer({
                url: 'https://dl.dropboxusercontent.com/u/7958625/ElizabethRiverTrail.kml.xml',
                map: map.instance
            });

            Markers.find().observe({
                added: function(document) {
                    // add marker on the actual Google map
                    var marker = new google.maps.Marker({
                        draggable: true,
                        animation: google.maps.Animation.DROP,
                        position: new google.maps.LatLng(document.lat, document.lng),
                        map: map.instance,
                        id: document._id
                    });

                    google.maps.event.addListener(marker, 'dragend', function(event) {
                        Markers.update(marker.id, {
                            $set: {
                                lat: event.latLng.lat(),
                                lng: event.latLng.lng()
                            }
                        });
                    });


                    markers[document._id] = marker;

                    //ADD marker listener here so that a new window can be popped up

                    var dbMarker = Markers.findOne(marker.id);
                    var contentString = '<div id="content">' +
                        '<div id="marker_info">' +
                        '<h1> Current Info:</h1>' +
                        '<p>Latitude: ' + dbMarker.lat + '</p>' +
                        '<p>Longitube: ' + dbMarker.lng + '</p>' +
                        '<p>Scores: ' + dbMarker.score + '</p>' +
                        '<p>-------------------------</p>' +
						'</div> ' +
						'<form class="info_box">' +
                        'Issue Description: <br>' +
                        '<input type="text" name="' + dbMarker.issue_desc + '"><br>' +
                        'Comments: <br>' +
                        '<textarea name="comments" rows="4" cols="30">' +
                        dbMarker.comments + '</textarea><br>' +
                        '<input type="button" name="thumbup" value="Thumbup" >' +
                        '<input type="button" name="thumbdown" value="ThumbDown" >' +
                        '</form>"' +
                        '</div>';

                    var infowindow = new google.maps.InfoWindow({
                        content: contentString
                    });

                    marker.addListener('mouseover', function() {
                        infowindow.open(map.instance, marker);
                    });
					
					
					infowindow.addEventListener('rightclick', function(){
						infowindow.getElementById("thumbup").addEventListener("click", function() {
							//alert("Hello World!");
							infowindow.close();
							Markers.update(marker.id, {
								$set: {
									score: 10
								}
							});
							infowindow.open(map.instance, marker);
						
						});	
						infowindow.close();
					});
					
					/*
					infowindow.getElementById("thumbup").addEventListener("click", function() {
						//alert("Hello World!");
						//dbMarker.score = dbMarker.score + 1;
						infowindow.close();
						Markers.update(marker.id, {
                            $set: {
                                score: 10
                            }
                        });
						//infowindow.open(map.instance, marker);
						
					});
					*/

                },
                changed: function(newDocument, oldDocument) {
                    markers[newDocument._id].setPosition({
                        lat: newDocument.lat,
                        lng: newDocument.lng
                    });
                },
                removed: function(oldDocument) {
                    markers[oldDocument._id].setMap(null);
                    google.maps.event.clearInstanceListeners(markers[oldDocument._id]);
                    delete markers[oldDocument._id];
                }
				/*
				document.getElementById("thumbup").addEventListener("click", function() {
                alert("Hello World!");
				});
				*/
            });

        });
    });

    //client code
    Meteor.startup(function() {
        GoogleMaps.load();

    });

    Template.body.helpers({
        exampleMapOptions: function() {
            // Make sure the maps API has loaded
            if (GoogleMaps.loaded()) {

                var options = {
                    center: new google.maps.LatLng(36.8, -76.285),
                    //center: new google.maps.LatLng(41.876, -87.624),
                    zoom: 10
                };
                return options;
            }

        }
    });
}
if (Meteor.isServer) {
    Meteor.startup(function() {
        // code to run on server at startup
    });
}