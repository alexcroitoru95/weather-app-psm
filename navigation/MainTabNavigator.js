import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import TabBarIcon from '../components/TabBarIcon';
import WeatherScreen from '../screens/WeatherScreen';
import PollutionScreen from '../screens/PollutionScreen';

const config = Platform.select({
    web: { headerMode: 'screen' },
    default: {}
});

const WeatherStack = createStackNavigator(
    {
        Weather: WeatherScreen
    },
    config
);

WeatherStack.navigationOptions = {
    tabBarLabel: 'Weather',
    tabBarIcon: ({ focused }) => (
        <TabBarIcon
            focused={focused}
            name={
                Platform.OS === 'ios'
                    ? `ios-cloud${focused ? '' : '-outline'}`
                    : 'md-cloud'
            }
        />
    )
};

WeatherStack.path = '';

const PollutionStack = createStackNavigator(
    {
        Pollution: PollutionScreen
    },
    config
);

PollutionStack.navigationOptions = {
    tabBarLabel: 'Pollution',
    tabBarIcon: ({ focused }) => (
        <TabBarIcon
            focused={focused}
            name={Platform.OS === 'ios' ? 'ios-warning' : 'md-warning'}
        />
    )
};

PollutionStack.path = '';

const tabNavigator = createBottomTabNavigator({
    WeatherStack,
    PollutionStack
});

tabNavigator.path = '';

export default tabNavigator;
