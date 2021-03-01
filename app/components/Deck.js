import React, { Component } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Platform, Alert, TouchableWithoutFeedback, NativeModules } from "react-native";
import { AntDesign, SimpleLineIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';

import SelectTune from "./SelectTune";

class Deck extends Component {

    state = {
        artist: "Deck empty",
        song: "Click to load tune",
        userTunes: this.props.userTunes,
        selectTuneEnabled: false,
        isPlaying: false,
        playbackInstance: null,
        volume: this.props.volume,
        isBuffering: false,
        pitchControl: 1,
        displayPitch: 1,
        sliderInUse: false,
        uri: null,
        lastValue: 1,
        lockPitch: false,
        iconShadow: {
            textShadowColor: this.props.color,
            textShadowRadius: 1,
        }
    }

    upDatevolume = (newVolume) => {
        if (this.state.playbackInstance != null) {
            this.state.playbackInstance.setStatusAsync({
                volume: parseFloat(newVolume),
            })
        }
        this.setState({
            volume: newVolume,
        });
    }

    componentDidUpdate = (prevProps) => {
        if (this.props.volume !== prevProps.volume) {
            this.upDatevolume(this.props.volume)
        }else if(this.props.userTunes !== prevProps.userTunes){
            this.setState({
                userTunes: this.props.userTunes
            })
        }
    }

    async componentDidMount() {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
                playsInSilentModeIOS: true,
                interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
                shouldDuckAndroid: true,
                staysActiveInBackground: true,
                playThroughEarpieceAndroid: true
            })
        } catch (e) {
            console.log(e)
        }
    }


    async loadAudio(uri) {
        console.log(this.state.volume)
        this.setState({
            pitchControl: 1,
        })
        try {
            const playbackInstance = new Audio.Sound()
            const source = {
                uri: uri
            }

            const status = {
                shouldPlay: false,
                volume: parseFloat(this.state.volume),
                rate: 1,
                shouldCorrectPitch: this.state.lockPitch,
                isMuted: false,
            }

            playbackInstance.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate)
            await playbackInstance.loadAsync(source, status, false)
            this.setState({
                playbackInstance: playbackInstance,
                isPlaying: false,
            })
        } catch (e) {
            console.log(e)
        }
    }

    onPlaybackStatusUpdate = status => {
        this.setState({
            isBuffering: status.isBuffering
        })
    }

    loadTrack = () => {
        if(this.state.isPlaying){
            Alert.alert("Deck already in use", "You cannot load a tune whilst another one is still playing")
        }else{
            this.setState({
                selectTuneEnabled: true,
            })
        }
}

    play = () => {
        if (this.state.playbackInstance != null) {
            this.state.playbackInstance.playAsync();
            this.setState({
                isPlaying: true,
            });
        }
    }

    pause = () => {
        if (this.state.playbackInstance != null) {
            this.state.playbackInstance.pauseAsync();
            this.setState({
                isPlaying: false,
            });
        }
    }

    nudgeTouch = (change) => {
        this.pitchChange(change, true);
    }

    pitchChange = (change, nudge = false) => {
        let newPitch = this.state.pitchControl + change;
        if (!nudge) {
            this.setState({
                pitchControl: newPitch,
                displayPitch: newPitch,
                lastValue: newPitch,
            });
        }
        if (this.state.playbackInstance != null) {
            this.state.playbackInstance.setStatusAsync({
                rate: newPitch,
            })
        }
    }

    getPitchAsPercentage = () => {
        let value = "";
        if(this.state.displayPitch > 1){
            value = "+";
        }
        value += ((this.state.displayPitch - 1) * 100).toFixed(2) + "%"
        return value 
    }

    selectTrack = async (artist, title, uri) => {

        if (this.state.isPlaying) {
            Alert.alert("Deck already in use", "You cannot load a tune whilst another one is still playing")
            this.setState({
                selectTuneEnabled: false,
            })
        } else {
            if (this.state.playbackInstance) {
                await this.state.playbackInstance.unloadAsync();
            }
            this.setState({
                artist: artist,
                song: title,
                isPlaying: false,
                playbackInstance: null,
                isBuffering: false,
                pitchControl: 1,
                displayPitch: 1,
                selectTuneEnabled: false,
                uri: uri,
                lastValue: 1,
            })
            this.loadAudio(uri);
        }
    }

    playButtonTemplate = (name, onpress) => {
        return (
            <TouchableOpacity style={{ flex: 1 }} onPress={onpress}>
                <View style={styles.playButton}>
                    <SimpleLineIcons name={name} adjustsFontSizeToFit size={20} color={this.props.color} style={this.state.iconShadow}/>
                </View>
            </TouchableOpacity>
        )
    }

    playButton = () => {
        return !this.state.isPlaying ? this.playButtonTemplate("control-play", this.play) : this.playButtonTemplate("control-pause", this.pause);
    }

    pitchSliderValueChange = (value) => {
        this.setState({
            pitchControl: value,
        })
        if (this.state.playbackInstance != null) {
            this.state.playbackInstance.setStatusAsync({
                rate: value,
            })
        }
    }

    backToDeck = () => {
        this.setState({
            selectTuneEnabled: false,
        })
    }

    render = () => {
        if (this.state.selectTuneEnabled) {
            return (
                <View style={styles.container}>
                    <SelectTune userTunes={this.state.userTunes} color={this.props.color} selectTuneEnabled={this.state.selectTuneEnabled} goBack={this.backToDeck} selectTrack={this.selectTrack} />
                </View>
            )
        } else {
            return (
                <View style={styles.container}>
                    <TouchableOpacity onPress={this.loadTrack}>
                        <View style={styles.title}>
                            <Text
                                style={[styles.titleText, { color: this.props.color, textShadowColor: this.props.color, textShadowRadius: 1 }]}
                                numberOfLines={1}
                            >
                                {this.state.artist + " - " + this.state.song}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <View style={[styles.Component, styles.mainElement, { flex: 1, flexDirection: "row" }]}>
                        <TouchableOpacity 
                            style={{ flex: 1 }}
                            onPress={() => {
                                if(this.state.playbackInstance != null){
                                    this.state.playbackInstance.setPositionAsync(0)
                                }
                            }}
                        >
                            <View style={[styles.playButton, { padding: 0 }]}>
                                <SimpleLineIcons 
                                name="control-start" 
                                adjustsFontSizeToFit size={20} 
                                color={ this.props.color} 
                                style={this.state.iconShadow}
                                />
                            </View>
                        </TouchableOpacity>
                        <View style={{ width: 10 }} />
                        {this.playButton()}
                        <View style={{ width: 10 }} />
                        <TouchableOpacity style={{ flex: 1 }} onPress={this.loadTrack}>
                            <View style={styles.playButton}>
                                <AntDesign 
                                    name="addfile" 
                                    adjustsFontSizeToFit size={20} 
                                    color={ this.props.color} 
                                    style={this.state.iconShadow}
                                />
                            </View>
                        </TouchableOpacity>
                        <View style={{ width: 10 }} />
                        <TouchableOpacity 
                            style={{ flex: 1 }}
                            onPress={() => {
                                let newState = !this.state.lockPitch;
                                this.setState({
                                    lockPitch: newState
                                });
                                if (this.state.playbackInstance != null) {
                                    this.state.playbackInstance.setStatusAsync({
                                        shouldCorrectPitch: newState
                                    })
                                }
                            }}
                        >
                            <View style={[styles.playButton, { padding: 0 }]}>
                                <Text
                                    adjustsFontSizeToFit
                                    numberOfLines={1}
                                    style={{
                                        fontSize: 20,
                                        color: this.state.lockPitch ? "#8cff00" : this.props.color, 
                                        textShadowColor: this.state.lockPitch ? "#8cff00" : this.props.color, 
                                        textShadowRadius: 1,
                                    }}
                                >KEY</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.Component, styles.mainElement, { flex: 0.5, flexDirection: "row"}]}>
                        <View style={{flexDirection: "column", flexGrow: 1, maxWidth: 700}}>
                            <View style={{flexGrow: 1, width: "100%", justifyContent: "center", zIndex: 2 }}>
                            <Slider
                                style={{ height: 20, flexGrow: 1 }}
                                minimumValue={0.92}
                                maximumValue={1.08}
                                value={this.state.sliderInUse ?  this.state.lastValue : this.state.pitchControl}
                                onSlidingStart={() => {
                                     this.setState({
                                        sliderInUse: true,
                                    })
                                }}
                                minimumTrackTintColor={"rgba(0,0,0,0)"}
                                maximumTrackTintColor={"rgba(0,0,0,0)"}
                                onSlidingComplete={(value) => {
                                    this.pitchSliderValueChange(value)
                                    this.setState({
                                        sliderInUse: false,
                                        lastValue: value,
                                    })
                                }}
                                onValueChange={(value) => {
                                    this.pitchSliderValueChange(value);
                                    this.setState({
                                        displayPitch: value,
                                    })
                                }}
    
                                thumbTintColor={this.props.color}
                               
                            />
                            </View>
                            <View style={{flexGrow: 1, width: "100%", justifyContent: "center", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", paddingHorizontal: 16}}>
                                <View style={{height: 2, width: "100%", zIndex: 0, backgroundColor: "#322f33"}} />
                            </View>
                        </View>
                    </View>
                    <View style={[styles.Component, styles.mainElement, { flex: 1, flexDirection: "row" }]}>
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            onPressIn={() => this.nudgeTouch(-0.03)}
                            onPressOut={() => this.nudgeTouch(0)}

                        >
                            <View style={styles.playButton}>
                                <SimpleLineIcons name="arrow-left" adjustsFontSizeToFit size={27} color={this.props.color} style={this.state.iconShadow}/>
                            </View>
                        </TouchableOpacity>
                        <View style={{ width: 10 }} />
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            onPressIn={() => this.pitchChange(-0.0001)}
                            delayLongPress={200}
                            onLongPress={() => {
                                this.setState({
                                    longPressDown: setInterval(() => {
                                        this.pitchChange(-0.0050)
                                    }, 500)
                                })
                            }}
                            onPressOut={() => {
                                if (this.state.longPressDown != null) {
                                    clearInterval(this.state.longPressDown);
                                    this.setState({
                                        longPressDown: null,
                                    })
                                }
                            }}

                        >
                            <View style={styles.playButton}>
                                <SimpleLineIcons name="minus" adjustsFontSizeToFit size={30} color={this.props.color} style={this.state.iconShadow} />
                            </View>
                        </TouchableOpacity>
                        <View style={{ width: 10 }} />
                        <View style={{ width: 60, alignItems: "center" }}>
                            <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: "grey", fontSize: 15}}>
                                {this.getPitchAsPercentage()}
                            </Text>
                        </View>
                        <View style={{ width: 10 }} />
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            onPressIn={() => this.pitchChange(0.0001)}
                            delayLongPress={200}
                            onLongPress={() => {
                                this.setState({
                                    longPressUp: setInterval(() => {
                                        this.pitchChange(0.0050)
                                    }, 500)
                                })
                            }}
                            onPressOut={() => {
                                if (this.state.longPressUp != null) {
                                    clearInterval(this.state.longPressUp);
                                    this.setState({
                                        longPressUp: null,
                                    })
                                }
                            }}
                        >
                            <View style={styles.playButton}>
                                <SimpleLineIcons name="plus" adjustsFontSizeToFit size={30} color={this.props.color} style={this.state.iconShadow}/>
                            </View>
                        </TouchableOpacity>
                        <View style={{ width: 10 }} />
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            onPressIn={() => this.nudgeTouch(0.03)}
                            onPressOut={() => this.nudgeTouch(0)}

                        >
                            <View style={styles.playButton}>
                            <SimpleLineIcons name="arrow-right" adjustsFontSizeToFit size={27} color={this.props.color} style={this.state.iconShadow} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    }
}




const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: "100%",
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    Component: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    mainElement: {
        marginTop: 10,
    },
    title: {
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    titleText: {
        fontSize: 15,
    },
    playButton: {
        flex: 1,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        padding: 5,
        borderWidth: 2,
        borderRadius: 50,
        borderColor: "#322f33",
        backgroundColor: "rgba(0,0,0,0.05)",
        marginVertical: 5,
    },
    eqComponent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
    },
    eqText: {
        color: "grey",
        fontSize: 15,
        marginBottom: 5,
    },
    eqSlider: {
        width: "100%",
        paddingHorizontal: Platform.OS == "ios" ? 11: 0,
        maxWidth: 150,
    },
    eqTextContainer: {

        overflow: "visible"
    }
})

export default Deck;