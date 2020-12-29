import { StatusBar } from 'expo-status-bar';
import React, { Component} from 'react';
import { Alert, Easing, PixelRatio, Platform, SafeAreaView, StyleSheet, Text, View, Animated } from 'react-native';
import Constants from "expo-constants";
import Slider from '@react-native-community/slider';
import * as MediaLibrary from 'expo-media-library';
import MusicInfo from 'expo-music-info';
import {request, PERMISSIONS, requestMultiple} from 'react-native-permissions';
import Deck from "./app/components/Deck";

const colors = ["#00f2ff", "#ff9500", "#2a282b", "#322f33"];

export default class App extends Component {

  state = {
    userTunes: [],
    deckAVolume: 0.70,
    deckBVolume: 0.70,
    crossfadeValue: 0,
    animationsTitle: new Animated.Value(1),
    animations0: new Animated.Value(1),
    animations1: new Animated.Value(1),
    animations2: new Animated.Value(1),
    animations3: new Animated.Value(1),
    animations4: new Animated.Value(1),
    animations5: new Animated.Value(1),
    animations6: new Animated.Value(1),
    animations7: new Animated.Value(1),
    animations8: new Animated.Value(1),
    animationInterval: null,
    crossfadeInUse: false,
  }

  async getTunes(lastId) {
    const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 1000,
    });
    let filteredMedia = media.assets.filter((tune) => {
      if(tune.duration > 60){
        return true;
      }
    })
    this.setState({
      userTunes: filteredMedia
    })
    this.updateTuneData()
  }

  async updateTuneData() {
    let array = [...this.state.userTunes];
    for (let i = 0; i < this.state.userTunes.length; i++) {
        let metadata = await this.getTuneTitleAndArtist(i);
        array[i].metadata = metadata;
    };
    this.setState({
      userTunes: array,
    });
    this.startAnimations();
  }

  async getTuneTitleAndArtist(i) {
      let tune = this.state.userTunes[i];
      const metadata = await MusicInfo.getMusicInfoAsync(tune.uri, {
          title: true,
          artist: true,
      });
  
      return metadata;
  }

  async componentDidMount() {
    let status = await MediaLibrary.requestPermissionsAsync();
    if(Platform.OS == "android"){
      let status2 = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    }
    console.log("after await in component did mount")
    this.getTunes();
  }

  animate = (index, delay) => {
    let stateObject = "animations" + index;
    setTimeout(() => {
      Animated.timing(this.state[stateObject], {
        toValue: 1.5,
        easing: Easing.back(),
        duration: 500,
        useNativeDriver: true
      }).start();
      setTimeout(() => {
        Animated.timing(this.state[stateObject], {
          toValue: 1,
          easing: Easing.back(),
          duration: 400,
          useNativeDriver: true
        }).start();
      }, 500)
    }, delay)
  }

  animateTitle = () => {
    Animated.timing(this.state.animationsTitle, {
      toValue: 1.5,
      easing: Easing.back(),
      duration: 400,
      useNativeDriver: true
    }).start();
    setTimeout(() => {
      Animated.timing(this.state.animationsTitle, {
        toValue: 1,
        easing: Easing.back(),
        duration: 150,
        useNativeDriver: true
      }).start();
    }, 400)
  }

  startAnimations = () => {
    this.setState({
      animationInterval: setInterval(() => {
        if(!this.state.crossfadeInUse){
          this.animateTitle();
          this.animate(0, 50);
          this.animate(1, 100);
          this.animate(2, 150);
          this.animate(3, 200);
          this.animate(4, 250);
          this.animate(5, 300);
          this.animate(6, 350);
          this.animate(7, 400);
          this.animate(8, 450);
        }
      }, 20000)
    })
  }

  androidStatusBarPadding = () => {
    if(Platform.OS == "android"){
      return (
        <View
          style={{
            height: Constants.statusBarHeight,
            }}
        ></View>
      )
    }
  }

  lineBreak = (marginBottom = true) => {
    return (
      <View style={{borderTopWidth: 1/PixelRatio.get(), width: "33%", borderColor: colors[3], marginTop: 15, marginBottom: marginBottom ? 15 : 0}}></View>
    )
  }

  decoration = (color, height, opacity, index = 10) => {
    let stateObject = "animations" + index;
    return (
      <View style={{
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center"
      }}>
        <Animated.View style={[
          {
            backgroundColor: color, 
            height: height, 
            opacity: opacity, 
            width: 4, 
            borderRadius: 2
          }, 
          index < 9 && {
            transform: [{
              scale: this.state[stateObject]
            }]
          }
          ]}> 
        </Animated.View>
      </View>
    )
  }

  loadingTest = () => {
    return (
      <React.Fragment>
        <View style={[styles.component, {paddingTop: 10, flexDirection: "row", flex: 0.5, justifyContent: "center", alignItems: "center"}]}>
          <View style={{flexGrow: 1, height: "100%", flexDirection: "row", marginLeft: 5}}>
            {this.decoration(colors[1], "80%", 0.8, 8)}
            {this.decoration(colors[1], "100%", 1, 7)}
            {this.decoration(colors[1], "80%", 0.8, 6)}
            {this.decoration(colors[1], "60%", 0.6, 5)}
            {this.decoration(colors[1], "40%", 0.4, 4)}
            {this.decoration(colors[1], "80%", 0.8, 3)}
            {this.decoration(colors[1], "60%", 0.6, 2)}
            {this.decoration(colors[1], "40%", 0.4, 1)}
            {this.decoration(colors[1], "20%", 0.2, 0)}
          </View>
          <Animated.View style={{
            transform: [{
              scale: this.state.animationsTitle
            }]
          }}>
            <Text style={[styles.titleText, {fontSize: 60}]} numberOfLines={1} adjustsFontSizeToFit>
              NoSync
            </Text>
          </Animated.View>
          <View style={{flexGrow: 1, height: "100%", flexDirection: "row", marginRight: 5}}>
          {this.decoration(colors[1], "20%", 0.2, 0)}
          {this.decoration(colors[1], "40%", 0.4, 1)} 
          {this.decoration(colors[1], "60%", 0.6, 2)} 
          {this.decoration(colors[1], "80%", 0.8, 3)}
          {this.decoration(colors[1], "40%", 0.4, 4)} 
          {this.decoration(colors[1], "60%", 0.6, 5)} 
          {this.decoration(colors[1], "80%", 0.8, 6)}
          {this.decoration(colors[1], "100%", 1, 7)}
          {this.decoration(colors[1], "80%", 0.8, 8)}
        </View>
        </View>
        {this.lineBreak()}
        <View style={[styles.deck, styles.component]}>
          <Deck color={colors[1]} buttonColor={colors[3]} userTunes={this.state.userTunes} volume={this.state.deckAVolume}/>  
        </View>
        {this.lineBreak()}
        <View style={[styles.deck, styles.component]}>
          <Deck color={colors[0]} buttonColor={colors[3]} userTunes={this.state.userTunes} volume={this.state.deckBVolume}/>
        </View>
        {this.lineBreak(false)}
        <View style={[styles.component, styles.crossfadeContainer]}>
          <View style={styles.crossfade}>
            <View style={{flexDirection: "row", alignSelf: "flex-start", alignContent: "center", flex: 1, marginBottom: 10}}>
              <View style={{flex: 1, flexDirection: "row", height: "100%", paddingRight: 15, opacity: 0.75}}>
                {this.decoration(colors[1], "100%", 1)}
                {this.decoration(colors[1], "80%", 0.8)}
                {this.decoration(colors[1], "60%", 0.6)}
                {this.decoration(colors[1], "40%", 0.4)}
                {this.decoration(colors[1], "20%", 0.2)}
              </View>
              <View style={{height: "100%", justifyContent: "center"}}>
                <Text style={{textAlign: "center", color: "grey", fontSize: 15}}>X-Fade</Text>
              </View>
              <View style={{flex: 1, flexDirection: "row", height: "100%", paddingLeft: 15, opacity: 0.75}}>
                {this.decoration(colors[0], "20%", 0.2)}
                {this.decoration(colors[0], "40%", 0.4)}
                {this.decoration(colors[0], "60%", 0.6)}
                {this.decoration(colors[0], "80%", 0.8)}
                {this.decoration(colors[0], "100%", 1)}
              </View>
            </View>
            <View style={{flexDirection: "column", width: "100%", maxWidth: 700}}>
              <View style={{flexGrow: 1, width: "100%", justifyContent: "center", zIndex: 2 }}>
                <Slider
                  style={{width: "100%", height: 20}}
                  minimumValue={-1}
                  maximumValue={1}
                  value={0}
                  minimumTrackTintColor={"rgba(0,0,0,0)"}
                  maximumTrackTintColor={"rgba(0,0,0,0)"}
                  thumbTintColor={"grey"}
                  onValueChange={(value) => {
                      this.logarithmicCrossfade(value)
                    
                  }}
                  onSlidingStart={() => {
                    this.setState({
                      crossfadeInUse: true,
                    })
                  }}
                  onSlidingComplete={(value) => {
                    this.logarithmicCrossfade(value);
                    this.setState({
                      crossfadeInUse: false,
                    })
                  }}
                  thumbImage={require("./app/images/greyCircle.png")}
                />
              </View>
              <View style={{flexGrow: 1, width: "100%", justifyContent: "center", position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", paddingHorizontal: 16}}>
                  <View style={{height: 2, width: "100%", zIndex: 0, backgroundColor: colors[3] }} />
              </View>
            </View>
          </View>
        </View>
      </React.Fragment>
    )
  }

  logarithmicCrossfade = (value) => {
    let angle = (value + 1) * (0.25 * Math.PI.toFixed(4));
    this.setState({
      deckAVolume: (value == 1) ? 0 : Math.cos(angle).toFixed(2),
      deckBVolume: (value == -1) ? 0 : Math.sin(angle).toFixed(2),
    })
  }

  render = () => {
    return (
      <SafeAreaView style={styles.container}>
        {this.androidStatusBarPadding()}
        <StatusBar style="light" />
        {this.loadingTest()}
        <View style={{height: 25}}></View>
      </SafeAreaView>
    );
  
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  deck: {
    flex: 4,
  },
  titleText: {
    fontSize: 50,
    paddingHorizontal:5,
    color: colors[0],
    textShadowColor: colors[0],
    textShadowRadius: 5,
  },
  component: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  crossfadeContainer: {
    paddingHorizontal: 10,
    flex: 1,
  },
  crossfade: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
