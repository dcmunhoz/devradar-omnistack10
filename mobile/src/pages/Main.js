import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { requestPermissionsAsync, getCurrentPositionAsync } from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons'

import api from './../services/api';

function Main({ navigation }){

    const [currentRegion, setCurrentRegion] = useState(null);
    const [myCurrentLocation, setMyCurrentLocation] = useState(null);
    const [formPosition, setFormPosition] = useState(20);
    const [techs, setTechs] = useState('');

    const [devs, setDevs] = useState([]);

    useEffect(() => {
        async function loadInitialPosition(){

            const { granted } = await requestPermissionsAsync();


            if (granted) {

                const { coords } = await getCurrentPositionAsync({
                    enableHighAccuracy: true,
                });


                const { latitude, longitude } = coords;
                
                setCurrentRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04,
                });

                setMyCurrentLocation({
                    latitude,
                    longitude,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04,
                });


            }

        }

        loadInitialPosition();
    }, []);

    useEffect(()=>{
        
        Keyboard.addListener('keyboardDidShow', event =>{
            
            const { height } = event.endCoordinates;

            let count = 0;

            setFormPosition(height + 20);

            
        });

        Keyboard.addListener('keyboardDidHide', event =>{
        

            setFormPosition(20);

            
        });

    }, []);

    async function loadDevs() {

        const { latitude, longitude } = currentRegion;

        const response = await api.get('/search', {
            params: {
                latitude,
                longitude,
                techs
            }
        });

        
        setDevs(response.data.devs);

    }

    function handleReagionChange(region) {

        setCurrentRegion(region);

    }

    function handleTypping(){

        Keyboard.emit('keyboardDidShow');

    }

    if (!currentRegion) {
        return null;
    }

    return(
        <>
            <MapView 
                onRegionChangeComplete={handleReagionChange} 
                initialRegion={currentRegion} 
                style={styles.map} 
            > 
                <Marker coordinate={myCurrentLocation} >
                    <View style={styles.myLocation} />
                </Marker>
                
                {devs.map(dev => (
                    <Marker 
                        coordinate={{ 
                            latitude: dev.location.coordinates[1], 
                            longitude: dev.location.coordinates[0] 
                        }} 
                        key={dev._id}
                    > 
                        <Image 
                            style={styles.avatar} 
                            source={{uri: dev.avatar_url}}
                        />
                    
                        <Callout onPress={() => { navigation.navigate('Profile', { github_username: dev.github_username }) }} >
                            <View style={styles.callout}>
                                <Text style={styles.devName}> {dev.name} </Text>
                                <Text style={styles.devBio}> {dev.bio} </Text>
                                <Text style={styles.devTechs}> {dev.techs} </Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}

            </MapView>

            <View style={{ ...styles.searchForm, bottom: formPosition }}>
                <TextInput 
                    onChangeText={setTechs}
                    onSubmitEditing={Keyboard.dismiss}
                    style={styles.searchInput} 
                    placeholder="Buscar devs pro techs..."
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    autoCorrect={false}
                    value={techs}
                />

                <TouchableOpacity onPress={loadDevs} style={styles.loadButton} > 
                    <Text> <MaterialIcons name="my-location" size={20} color="#FFF" /> </Text>
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },

    avatar: {
        width: 54,
        height: 54,
        borderRadius: 4,
        borderWidth: 4,
        borderColor: "#FFF"
    },

    callout: {
        padding: 5,
        width: 260
    },  

    devName: {
        fontWeight: 'bold',
        fontSize: 16
    },

    devBio: {
        color: '#666',
        marginTop: 5
    },

    devTechs:{
        marginTop: 5
    },

    searchForm: {
        position: 'absolute',
        left: 20,
        right: 20,
        zIndex: 5,
        flexDirection: 'row'
    },

    searchInput: {
        flex: 1,
        height: 50,
        backgroundColor: '#fff',
        color: '#333',
        borderRadius: 25,
        paddingHorizontal: 25,
        fontSize: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 4,
            height: 4
        },
        elevation: 2
    },

    loadButton: {
        width: 50,
        height: 50,
        backgroundColor: '#8e4dff',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15

    },

    myLocation:{
        width: 15,
        height: 15,
        backgroundColor: "#7D04E7",
        borderRadius: 50,
        
    }
});

export default Main;