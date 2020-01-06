import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

export default async function getLocationAsync(userAgreement) {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);

    let resultObject = {
        location: null,
        errorMessage: null
    };

    if (userAgreement) {
        if (status !== 'granted') {
            resultObject = {
                location: null,
                errorMessage: 'Permission to access location was denied'
            };
        }

        let location = await Location.getCurrentPositionAsync({});

        if (location.coords) {
            const { latitude, longitude } = location.coords;

            const postalAddress = await Location.reverseGeocodeAsync({
                latitude,
                longitude
            });

            if (postalAddress && !postalAddress[0].city) {
                // Some cities are not recognized (Dumbravita) and Google Maps API requires Payment
                // Below are the latitude and longitude of Timisoara, Romania
                const postalAddressTimisoara = await Location.reverseGeocodeAsync(
                    {
                        latitude: 45.75372,
                        longitude: 21.22571
                    }
                );

                resultObject = {
                    location: {
                        ...postalAddressTimisoara[0],
                        latitude,
                        longitude
                    },
                    errorMessage: null
                };
            } else {
                resultObject = {
                    location: {
                        ...postalAddress[0],
                        latitude,
                        longitude
                    },
                    errorMessage: null
                };
            }
        }
    }

    return resultObject;
}
