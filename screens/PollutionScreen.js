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
import { BREEZOMETER_AIR_POLLUTION_API_CALL } from '../constants/API';
import { daysOfWeek } from '../constants/Date';

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

export default function PollutionScreen() {
    const [deviceData, setDeviceData] = useState({
        location: null,
        errorMessage: null
    });
    const [loader, setLoader] = useState(false);
    const [pollutionData, setPollutionData] = useState([]);

    useEffect(() => {
        if (
            Platform.OS === 'android' &&
            !Constants.isDevice &&
            !deviceData.errorMessage.length
        ) {
            setDeviceData({
                location: null,
                errorMessage:
                    'Oops, this will not work on Sketch in an Android emulator. Try it on your device!'
            });
        } else {
            if (!deviceData.location) {
                getLocationAsync(true).then(data => {
                    setDeviceData(data);
                    setLoader(true);
                });
            } else if (deviceData.location && !pollutionData.length) {
                const { latitude, longitude } = deviceData.location;
                getPollutionData(latitude, longitude).then(response => {
                    setPollutionData(response.data);
                    setLoader(false);
                });
            }
        }
    }, [deviceData]);

    return (
        <View style={styles.container}>
            {deviceData.location && !deviceData.errorMessage && (
                <View style={styles.contentContainer}>
                    <View style={styles.locationContainer}>
                        <Text style={styles.bigText}>
                            {deviceData.location.city},{' '}
                            {deviceData.location.region}
                        </Text>
                        <Text style={[styles.bigText, styles.marginTopText]}>
                            {deviceData.location.country}
                        </Text>
                    </View>
                    <View style={styles.pollutionContainer}>
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
                        {pollutionData.length > 1 && (
                            <>
                                <View style={styles.headerContainer}>
                                    <Image
                                        source={require('../assets/images/air_pollution.png')}
                                        style={[
                                            styles.airPollutionImage,
                                            {
                                                tintColor:
                                                    pollutionData[0].indexes
                                                        .baqi.color
                                            }
                                        ]}
                                    />
                                    <Text style={styles.bigText}>
                                        {pollutionData[0].indexes.baqi.category}
                                    </Text>
                                    <View style={styles.pollutionScore}>
                                        <Text style={styles.bigText}>
                                            Score:{' '}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.bigText,
                                                {
                                                    color:
                                                        pollutionData[0].indexes
                                                            .baqi.color
                                                }
                                            ]}
                                        >
                                            {
                                                pollutionData[0].indexes.baqi
                                                    .aqi_display
                                            }
                                            %
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.todaysDate}>
                                    <Text style={styles.todaysDateText}>
                                        {
                                            daysOfWeek[
                                                new Date(
                                                    pollutionData[0].datetime
                                                ).getDay()
                                            ]
                                        }{' '}
                                        -{' '}
                                        {getHoursAndMinutesFromDate(
                                            pollutionData[0].datetime
                                        )}
                                    </Text>
                                    <Text style={styles.todaysDateLabel}>
                                        Now
                                    </Text>
                                </View>
                                <SafeAreaView style={styles.forecastContainer}>
                                    <FlatList
                                        data={pollutionData.slice(1)}
                                        style={styles.forecastContainer}
                                        renderItem={({ item }) => (
                                            <FlatListItem
                                                date={item.datetime}
                                                iconColor={
                                                    item.indexes.baqi.color
                                                }
                                                score={
                                                    item.indexes.baqi
                                                        .aqi_display
                                                }
                                            />
                                        )}
                                        keyExtractor={item => item.datetime}
                                    />
                                </SafeAreaView>
                            </>
                        )}
                    </View>
                </View>
            )}
            {!deviceData.location && !deviceData.errorMessage && (
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
        </View>
    );
}

function addZeroToDate(i) {
    if (i < 10) {
        i = '0' + i;
    }
    return i;
}

function getHoursAndMinutesFromDate(date) {
    const d = new Date(date);
    const h = addZeroToDate(d.getHours());
    const m = addZeroToDate(d.getMinutes());

    return `${h}:${m}`;
}

class FlatListItem extends PureComponent {
    render() {
        const { date, iconColor, score } = this.props;

        const dateTime = new Date(date);
        const day = dateTime ? daysOfWeek[dateTime.getDay()] : '';

        return (
            <View style={styles.flatListItem}>
                <Text style={styles.flatListDate}>
                    {day} - {getHoursAndMinutesFromDate(date)}
                </Text>
                <Image
                    source={require('../assets/images/air_pollution.png')}
                    style={[
                        styles.flatListImage,
                        {
                            tintColor: iconColor
                        }
                    ]}
                />
                <Text style={styles.flatListScore}>{score}%</Text>
            </View>
        );
    }
}

async function getPollutionData(latitude, longitude) {
    let responseData = null;

    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1);
    const startTimeISO = startTime.toISOString().split('.')[0];
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 3);
    endTime.setHours(endTime.getHours() - 1);
    const endTimeISO = endTime.toISOString().split('.')[0];

    try {
        let response = await fetch(
            `${BREEZOMETER_AIR_POLLUTION_API_CALL}&lat=${latitude}&lon=${longitude}&start_datetime=${startTimeISO}&end_datetime=${endTimeISO}`
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

PollutionScreen.navigationOptions = {
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
    pollutionContainer: {
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
    airPollutionImage: {
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
    pollutionScore: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center'
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
    flatListScore: {
        fontSize: 18,
        color: '#fff',
        lineHeight: 18,
        textAlign: 'right'
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
        // ...Platform.select({
        //     ios: {
        //         shadowColor: 'black',
        //         shadowOffset: { width: 0, height: -3 },
        //         shadowOpacity: 0.1,
        //         shadowRadius: 3
        //     },
        //     android: {
        //         elevation: 20
        //     }
        // }),
    },
    marginRightText: {
        marginRight: 10
    }
});
