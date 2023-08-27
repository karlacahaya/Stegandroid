import { StyleSheet } from "react-native";
import { StatusBar } from "react-native";

export const colors = {
    primary: '#c9c5e6', 
    secondary: '#7369c2',
    background: '#f7f7f7',
    textPrimary: '#333333',
    textSecondary: '#777777',
    border: '#e0e0e0',
 };

 export const spacings = {
    small: 10,
    medium: 20,
    large: 40,
 };

 export const fonts = {
    primary: 'Home Alone',
    sizes: {
        small: 14,
        medium: 16,
        large: 20,
    }
 };

 export const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: StatusBar.currentHeight,
      backgroundColor: '#F5F5F5',
    },
    scrollView: {
      marginHorizontal: 20,
      paddingTop: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      marginTop: 30,
    },
    button: {
      backgroundColor: colors.secondary, // Primary Color
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      marginHorizontal: 10,
    },
    buttonText: {
      fontSize: 16,
      color: '#FFFFFF', // White Color
      fontWeight: '600',
    },
    imageContainer: {
      flexDirection: 'row',
      marginTop: 30,
    },
    image: {
      height: 300,
      width: 200,
      resizeMode: 'contain',
      marginHorizontal: 10,
    },
    input: {
      height: 50,
      marginVertical: 12,
      borderWidth: 1,
      borderRadius: 10,
      padding: 10,
      borderColor: '#DDD',
      backgroundColor: '#FFF',
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalView: {
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 35,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    button1: {
      borderRadius: 20,
      padding: 10,
      elevation: 2,
      marginTop: 20,
    },
    textStyle: {
      color: 'white',
      fontWeight: '600',
      textAlign: 'center',
    },
    modalText: {
      marginBottom: 20,
      textAlign: 'center',
      fontSize: 18,
      color: '#333', // Neutral Dark
    },
  });

  export const stylesHome = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    // justifyContent: 'center', // Center items vertically
    backgroundColor: '#c9c5e6',
    // flexDirection: 'column',
  },
  scrollView: {
    marginHorizontal: 20,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'column',
    marginTop: 20,
    justifyContent: 'center', // Center items vertically
    alignSelf: 'center', // Center-align the buttons
  },
  button: {
    backgroundColor: '#7369c2',
    padding: 15,
    borderRadius: 20,
    // marginHorizontal: 10,
    marginVertical: 12,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    marginHorizontal: 35,
  },
  headerContainer: {
    flex: 1,
  },
  headerStyle: {
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: fonts.primary,
    // color: 'white'
  },
  header2Style: {
    fontSize: 27,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

  export default styles
  