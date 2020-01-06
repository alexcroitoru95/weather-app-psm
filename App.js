import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React, { useState, useEffect } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SplashScreen from './components/SplashScreen';

import AppNavigator from './navigation/AppNavigator';

const loaderLogo = require('./assets/images/logo_loader.png');

export default function App(props) {
    const [isLoadingComplete, setLoadingComplete] = useState(false);
    const [animationDone, setAnimationDone] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setAnimationDone(true);
        }, 2600);
    });

    const screenProps = {
        isLoaded: animationDone
    };

    if (!isLoadingComplete && !props.skipLoadingScreen) {
        return (
            <AppLoading
                startAsync={loadResourcesAsync}
                onError={handleLoadingError}
                onFinish={() => handleFinishLoading(setLoadingComplete)}
            />
        );
    } else {
        return (
            <>
                {Platform.OS === 'ios' ? (
                    <SplashScreen
                        isLoaded={animationDone}
                        imageSource={loaderLogo}
                        backgroundStyle={styles.loadingBackgroundStyle}
                    >
                        <View style={styles.container}>
                            {Platform.OS === 'ios' && (
                                <StatusBar barStyle="default" />
                            )}
                            <AppNavigator screenProps={screenProps} />
                        </View>
                    </SplashScreen>
                ) : (
                    <View style={styles.container}>
                        <AppNavigator screenProps={screenProps} />
                    </View>
                )}
            </>
        );
    }
}

async function loadResourcesAsync() {
    await Promise.all([
        Asset.loadAsync([require('./assets/images/air_pollution.png')]),
        Font.loadAsync({
            // This is the font that we are using for our tab bar
            ...Ionicons.font,
            // We include SpaceMono because we use it in HomeScreen.js. Feel free to
            // remove this if you are not using it in your app
            'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf')
        })
    ]);
}

function handleLoadingError(error) {
    // In this case, you might want to report the error to your error reporting
    // service, for example Sentry
    console.warn(error);
}

function handleFinishLoading(setLoadingComplete) {
    setLoadingComplete(true);
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    loadingBackgroundStyle: {
        backgroundColor: 'black'
    }
});
