import { React, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

const HabitPopUp = ({ visible, habit, onClose, onComplete }) => {
  const [cantidad, setCantidad] = useState(false);
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.centeredView}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={[styles.modalView, {backgroundColor: habit?.color}]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <View style={styles.activityHeader}>
            <Text style={styles.icono}>{habit?.icon}</Text>
            <Text style={styles.modalTitle}>{habit?.name}</Text>
          </View>
          <Text style={styles.modalText}>{habit?.description}</Text>

          {habit?.trackingType == 'binary' ? (
            <TouchableOpacity
              style={[styles.button, styles.buttonComplete]}
              onPress={onComplete}
            >
              <Text style={styles.textStyle}>Completar</Text>
            </TouchableOpacity>
          ) : (
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                <TextInput
                  style={styles.input}
                  //value="Cantidad"
                  onChangeText={setCantidad}
                  placeholder="0"
                />
                <Text style={styles.label}>{habit?.unit}</Text>
              </View>
            <TouchableOpacity
              style={[styles.button, styles.buttonComplete]}
              onPress={() => onComplete(cantidad)}
            >
              <Text style={styles.textStyle}>Completar</Text>
            </TouchableOpacity>
            </View>
          )}

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "left",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    margin: 5,
  },
  activityHeader: {
    width: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 8,
    borderRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f44336',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonComplete: {
    backgroundColor: "#4f46e5",
  },
  textStyle: {
    fontSize: 15,
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  modalTitle: {
    color: "white",
    fontSize: 30,
    fontWeight: '600',
    textAlign: "center",
    paddingRight: 20,
  },
  icono: {
    fontSize: 24,
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    textAlign: 'center',
    borderRadius: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    width: 'auto',
    fontWeight: '600',
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
    fontSize: 20,
    color: "white",
  },
});

export default HabitPopUp;