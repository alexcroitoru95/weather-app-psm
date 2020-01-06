import React, { useState, useEffect, PureComponent } from 'react';
import Constants from 'expo-constants';
import {
    Platform,
    Alert,
    Image,
    SafeAreaView,
    FlatList,
    Text,
    StyleSheet,
    View
} from 'react-native';

import getLocationAsync from '../helpers/getLocationAsync';
import { Loader } from '../components/Loader';
import { WEATHERBIT_DAILY_FORECAST_API_CALL } from '../constants/API';
import { WeatherIcons } from '../assets/icons';
import { daysOfWeek } from '../constants/Date';

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

export default function WeatherScreen(props) {
    const [respondedToUserAgreement, setRespondedToUserAgreement] = useState(
        false
    );
    const [userAgreement, setUserAgreement] = useState(false);
    const [deviceData, setDeviceData] = useState({
        location: null,
        errorMessage: null
    });
    const [loader, setLoader] = useState(false);
    const [weatherData, setWeatherData] = useState({});

    useEffect(() => {
        const { isLoaded } = props.screenProps;

        if (!userAgreement && isLoaded) {
            Alert.alert(
                'User Agreement',
                `This application requires your mobile phone location.\nIf you agree we will use your mobile location to get data from different providers and display the weather conditions as well as the level of pollution based on this device's location.\nThank you!`,
                [
                    {
                        text: 'I Accept',
                        onPress: () => {
                            setUserAgreement(true);
                            setRespondedToUserAgreement(true);
                        },
                        style: 'cancel'
                    },
                    {
                        text: 'I Decline',
                        onPress: () => {
                            setUserAgreement(false);
                            setRespondedToUserAgreement(true);
                        },
                        style: 'destructive'
                    }
                ]
            );
        } else if (userAgreement && isLoaded) {
            if (Platform.OS === 'android' && !Constants.isDevice) {
                setDeviceData({
                    location: null,
                    errorMessage:
                        'Oops, this will not work on Sketch in an Android emulator. Try it on your device!'
                });
            } else {
                getLocationAsync(userAgreement).then(data => {
                    setDeviceData(data);
                    setLoader(true);
                });
            }
        }
    }, [props.screenProps.isLoaded, userAgreement]);

    useEffect(() => {
        if (deviceData.location) {
            const { city, isoCountryCode } = deviceData.location;
            getForecastData(city, isoCountryCode).then(response => {
                setWeatherData(response.data);
                setLoader(false);
            });
        }
    }, [deviceData]);

    return (
        <View style={styles.container}>
            {respondedToUserAgreement &&
                userAgreement &&
                deviceData.location &&
                !deviceData.errorMessage && (
                    <View style={styles.contentContainer}>
                        <View style={styles.locationContainer}>
                            <Text style={styles.bigText}>
                                {deviceData.location.city},{' '}
                                {deviceData.location.region}
                            </Text>
                            <Text
                                style={[styles.bigText, styles.marginTopText]}
                            >
                                {deviceData.location.country}
                            </Text>
                        </View>
                        <View style={styles.weatherContainer}>
                            {loader && (
                                <View style={styles.loaderContainer}>
                                    <Loader
                                        size={200}
                                        width={5}
                                        fill={100}
                                        tintColor="#007aff"
                                        backgroundColor="#fff"
                                    />
                                </View>
                            )}
                            {weatherData.length && (
                                <>
                                    <View style={styles.headerContainer}>
                                        <Image
                                            source={
                                                WeatherIcons[
                                                    weatherData[0].weather.icon
                                                ]
                                            }
                                            style={styles.todaysWeatherImage}
                                        />
                                        <Text style={styles.bigText}>
                                            {weatherData[0].weather.description}
                                        </Text>
                                        <View style={styles.todaysTemperature}>
                                            <Text
                                                style={[
                                                    styles.smallText,
                                                    styles.lowOpacityText,
                                                    styles.lowTemp
                                                ]}
                                            >
                                                {weatherData[0].low_temp} °C
                                            </Text>
                                            <Text style={styles.bigText}>
                                                {weatherData[0].temp} °C
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.smallText,
                                                    styles.lowOpacityText,
                                                    styles.maxTemp
                                                ]}
                                            >
                                                {weatherData[0].max_temp} °C
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.todaysDate}>
                                        <Text style={styles.todaysDateText}>
                                            {
                                                daysOfWeek[
                                                    new Date(
                                                        weatherData[0].datetime
                                                    ).getDay()
                                                ]
                                            }
                                        </Text>
                                        <Text style={styles.todaysDateLabel}>
                                            Today
                                        </Text>
                                    </View>
                                    <SafeAreaView
                                        style={styles.forecastContainer}
                                    >
                                        <FlatList
                                            data={weatherData.slice(1)}
                                            style={styles.forecastContainer}
                                            renderItem={({ item }) => (
                                                <FlatListItem
                                                    date={item.datetime}
                                                    locale={
                                                        deviceData.location
                                                            .isoCountryCode
                                                    }
                                                    icon={item.weather.icon}
                                                    lowTemp={item.low_temp}
                                                    maxTemp={item.max_temp}
                                                />
                                            )}
                                            keyExtractor={item =>
                                                item.valid_date
                                            }
                                        />
                                    </SafeAreaView>
                                </>
                            )}
                        </View>
                    </View>
                )}
            {respondedToUserAgreement &&
                userAgreement &&
                !deviceData.location &&
                !deviceData.errorMessage && (
                    <View style={styles.loaderContainer}>
                        <Loader
                            size={230}
                            width={5}
                            fill={100}
                            tintColor="#007aff"
                            backgroundColor="#fff"
                            loadingText="Acquiring location..."
                        />
                    </View>
                )}
            {deviceData.errorMessage && (
                <View style={styles.errorContainer}>
                    <Text style={styles.bigText}>
                        Denied access to this device's location.
                    </Text>
                </View>
            )}
            {respondedToUserAgreement && !userAgreement && (
                <View style={styles.errorContainer}>
                    <Text style={styles.bigText}>Declined user agreement.</Text>
                </View>
            )}
        </View>
    );
}

class FlatListItem extends PureComponent {
    render() {
        const { date, icon, lowTemp, maxTemp } = this.props;
        const dateTime = new Date(date);
        const day = dateTime ? daysOfWeek[dateTime.getDay()] : '';

        return (
            <View style={styles.flatListItem}>
                <Text style={styles.flatListDate}>{day}</Text>
                <Image
                    source={WeatherIcons[icon]}
                    style={styles.flatListImage}
                />
                <Text style={[styles.flatListTemp, styles.marginRightText]}>
                    {maxTemp}
                </Text>
                <Text style={[styles.flatListTemp, styles.lowOpacityText]}>
                    {lowTemp}
                </Text>
            </View>
        );
    }
}

async function getForecastData(city, isoCountryCode) {
    let responseData = null;

    try {
        let response = await fetch(
            `${WEATHERBIT_DAILY_FORECAST_API_CALL}&city=${city}&country=${isoCountryCode}`
        );
        responseData = await response.json();
    } catch (error) {
        Alert.alert('Error', error, [
            {
                text: 'Ok',
                onPress: () => undefined,
                style: 'cancel'
            }
        ]);
    }

    return responseData;
}

WeatherScreen.navigationOptions = {
    header: null
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000'
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    contentContainer: {
        flex: 1,
        ...Platform.select({
            ios: {
                paddingTop: 30
            },
            android: {
                paddingTop: 10
            }
        })
    },
    locationContainer: {
        alignItems: 'center',
        marginTop: 50
    },
    weatherContainer: {
        flex: 1
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000'
    },
    headerContainer: {
        alignItems: 'center'
    },
    todaysWeatherImage: {
        ...Platform.select({
            ios: {
                width: 150,
                height: 150
            },
            android: {
                width: 125,
                height: 125
            }
        }),
        marginLeft: 'auto',
        marginRight: 'auto',
        resizeMode: 'contain',
        marginTop: 3
    },
    todaysTemperature: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    todaysDate: {
        flexDirection: 'row',
        marginTop: 25,
        marginLeft: 20,
        marginRight: 20,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#fff'
    },
    forecastContainer: {
        flex: 1,
        marginTop: 5,
        marginBottom: 10,
        ...Platform.select({
            ios: {
                paddingLeft: 20,
                paddingRight: 20
            },
            android: {
                paddingLeft: 10,
                paddingRight: 10
            }
        })
    },
    flatListItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    flatListDate: {
        fontSize: 18,
        color: '#fff',
        lineHeight: 18,
        textAlign: 'left'
    },
    flatListImage: {
        width: 35,
        height: 35,
        marginLeft: 'auto',
        marginRight: 'auto',
        resizeMode: 'contain'
    },
    flatListTemp: {
        fontSize: 18,
        color: '#fff',
        lineHeight: 18,
        textAlign: 'right'
    },
    lowOpacityText: {
        opacity: 0.5
    },
    lowTemp: {
        marginRight: 30
    },
    maxTemp: {
        marginLeft: 30
    },
    bigText: {
        fontSize: 28,
        color: '#fff',
        lineHeight: 28,
        textAlign: 'center'
    },
    smallText: {
        fontSize: 24,
        color: '#fff',
        lineHeight: 24,
        textAlign: 'center'
    },
    todaysDateText: {
        fontSize: 18,
        color: '#fff',
        lineHeight: 18
    },
    todaysDateLabel: {
        fontSize: 14,
        color: '#fff',
        lineHeight: 14,
        fontWeight: 'bold',
        marginLeft: 10,
        textTransform: 'uppercase'
    },
    marginTopText: {
        marginTop: 10
    },
    marginRightText: {
        marginRight: 10
    }
});
