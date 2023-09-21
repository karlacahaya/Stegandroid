import {StyleSheet} from 'react-native';
import {StatusBar} from 'react-native';

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
  },
};

export const stylesHIh = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    // justifyContent: 'center', // Center items vertically
    backgroundColor: colors.primary,
    // flexDirection: 'column',
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



});

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: StatusBar.currentHeight,
    paddingTop: 15,
    backgroundColor: '#c9c5e6',
  },
  scrollView: {
    marginHorizontal: 20,
  },
  input: {
    height: 50,
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    // paddingTop: 10,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  inputMessage: {
    textAlignVertical: 'top', 
    // height: 150,
    minHeight: 40, 
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    // paddingTop: 10,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
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
    marginVertical: 8,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    marginHorizontal: 25,
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
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  image: {
    height: 500,
    // width: 300,
    resizeMode: 'contain',
    // justifyContent: 'center',
    // marginHorizontal: ,
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
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
    color: '#333', // Neutral Dark
  },
  textStyle: {
    // color: 'white',
    fontWeight: '600',
    // textAlign: 'center',
    fontSize: 20,
    paddingTop: 10
  },
  footerButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  }
});

export default styles;
