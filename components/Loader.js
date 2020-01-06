import React from 'react';
import PropTypes from 'prop-types';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

import { Text, View } from 'react-native';

export const Loader = props => {
    const {
        size,
        width,
        fill,
        tintColor,
        backgroundColor,
        loadingText
    } = props;
    const { textStyle, overlayBackground, container } = styles;

    return (
        <View style={container}>
            <View style={overlayBackground} />
            <AnimatedCircularProgress
                size={size}
                width={width}
                fill={fill}
                tintColor={tintColor}
                backgroundColor={backgroundColor}
            >
                {() => (
                    <Text style={textStyle}>
                        {loadingText ? loadingText : 'Loading data...'}
                    </Text>
                )}
            </AnimatedCircularProgress>
        </View>
    );
};

Loader.propTypes = {
    loadingText: PropTypes.string,
    size: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    fill: PropTypes.number.isRequired,
    tintColor: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired
};

Loader.defaultProps = {
    loadingText: '',
    size: 240,
    width: 5,
    fill: 100,
    tintColor: '#007aff',
    backgroundColor: '#fff'
};

const styles = {
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    overlayBackground: {
        backgroundColor: 'black',
        position: 'absolute',
        height: '100%',
        width: '100%',
        top: 0
    },
    textStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        paddingHorizontal: 5,
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20
    }
};
