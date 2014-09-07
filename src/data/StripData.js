define(function(require, exports, module) {
	// will hold the geo-data response, an array of objects with place_id and name, to
	// be returned to our Famo.us application
	var data;

	// geo vars
	// reasonable test lat, long: 34.070767, -117.143456 (best set in chrome's inspect tool)
	var geocoder;
	var map;
	var infowindow = new google.maps.InfoWindow();
	var marker;
	var lat;
	var long;
	var searchRadius = 500; 	// meters
	var searchTypes = ['food'] 	// options available defined in google map api

	function initGeolocation() {
	    console.log("Beginning search of nearby locations based on Geolocation.");
	    if (navigator && navigator.geolocation) {
	        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
	    } else {
	    	msg = "Geolocation is not supported.";
	        console.log(msg);
	        alert(msg);
	    }
	}

	function successCallback(position) {
	    console.log("Geolocation is available.");

	    lat = position.coords.latitude;
	    long = position.coords.longitude;
	    console.log("Searching from: ", lat, long);

	    geocoder = new google.maps.Geocoder();
	    var latlng = new google.maps.LatLng(lat, long);

	    // current implementation uses a hidden map
	    var mapOptions = {
	        zoom: 17,
	        center: latlng,
	        mapTypeId: 'roadmap'
	    }

	    // TODO
	    // my current understanding of the maps api leads me to believe I need to pass
	    // in a map object to be able to search nearby. Seems unlikely. Will research later.
	    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	    geocoder.geocode({
	        'latLng': latlng
	    }, function(results, status) {
	        if (status == google.maps.GeocoderStatus.OK) {
	            if (results[1]) {
	                console.log("Nearest address: ", results[0].formatted_address);
	                infowindow.setContent(results[1].formatted_address);

	            } else {
	            	msg = "No nearby results.";
	            	console.log(msg);
	                alert(msg);
	            }
	        } else {
	        	msg = "Geocoder failed: " + status;
	         	console.log(msg);
	            alert(msg);
	        }
	    });

	    // the request sets up parameters to be returned
	    var request = {
	      location: latlng,
	      radius: 	searchRadius,
	      types: 	searchTypes,
	     };

	     // TODO
	     // my current understanding of the maps api leads me to believe I need to pass
	     // in a map object to be able to search nearby. Seems unlikely. Will research later.
	     var service = new google.maps.places.PlacesService(map);
	     service.nearbySearch(request, searchCallback);
	}

	function searchCallback(results, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
	    	//console.log(results);
	    	data = [];
	    	for (var i = 0; i < results.length; i++) {
	      		r = results[i];
	      		data[i] = {place_id: r.place_id, name: r.name};
	    	}
	 	} else {
	    	console.log("Search Results Error:", status)
	  	}
	  	// populate exports to make data available to the Famo.us application
    	module.exports = data;
    	console.log("Returning the following data back to the application:", data);
	}

	function errorCallback(position) {
	    msg = "Navigator errorback called: ", position;
	    console.log(msg);
	    alert(msg);
	}

	// kick off the process
	initGeolocation();
});
