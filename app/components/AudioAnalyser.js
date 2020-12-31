import React, { Component } from "react";
import { View, StyleSheet, Text, Platform, NativeModules } from "react-native";
const { AudioByteArrayModule } = NativeModules;

///file:///storage/emulated/0/Music/Hijacked (Audiojack Remix).mp3
//http://ia902606.us.archive.org/35/items/shortpoetry_047_librivox/song_cjrg_teasdale_64kb.mp3

class AudioAnalyser extends Component {
  state = { 
    uri: this.props.uri,
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.uri !== prevProps.uri) {
        this.setState({
          uri: this.props.uri
        })
        console.log(this.state.uri)
    }
  }

  componentDidMount = () => {
    AudioByteArrayModule.isEqual(
      5,
      10,
      (status) => {
       console.log('Result ',status);
      }
     );
  }


  render = () => { 
    return ( 
      <View style={styles.container}>

      </View>
     );
  }
}
 
export default AudioAnalyser;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#322f33",
    borderRadius: 5,
  }
})





