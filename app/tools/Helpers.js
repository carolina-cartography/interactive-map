export function PreparePolygonForLeaftlet(place) {
    // Remove duplicate point at end of polygon arrays, invert lat/lngs from GeoJSON
    place.location.coordinates.forEach(pointList => {
        pointList.pop()
        pointList.forEach((latLng, index) => {
            let inverted = [latLng[1], latLng[0]]
            pointList[index] = inverted
        })
    }) 
}