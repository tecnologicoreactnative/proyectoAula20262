// ============================================================================
// CAPA: VISTA — Formulario de solicitud de préstamo
// ----------------------------------------------------------------------------
// Combina el VistaModelo de sesión (`useUser`, para saber quién solicita el
// préstamo) con el artículo recibido por parámetros de navegación (elegido
// en `articulosScreen.js`). Al confirmar, delega la creación del préstamo
// (y el descuento de stock asociado) al servicio `createLoan`
// (capa Modelo/servicio), manteniendo la Vista libre de reglas de negocio.
// ============================================================================
import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Checkbox } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../contexts/userContext';
import { createLoan } from '../services/firestoreService';

export default function LoanRequestScreen({ navigation, route }) {
  const { user } = useUser();
  const { article } = route.params || {};
  
  // Estado local del formulario de solicitud.
  const [loanType, setLoanType] = useState('interno');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Valida el formulario y, si es correcto, delega en el servicio la
  // creación del préstamo en Firestore. La Vista no sabe cómo se descuenta
  // el stock; esa regla vive en `createLoan` (services/firestoreService.js).
  const handleRequestLoan = async () => {
    if (!endDate || !purpose) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }
    
    if (!termsAccepted) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await createLoan({
        userId: user.uid,
        articuloId: article?.id,
        articuloNombre: article?.nombre,
        tipo: loanType,
        fechaInicio: startDate,
        fechaFin: endDate,
        motivo: purpose,
        observaciones: notes,
        cantidad: 1,
      });
      
      // Al terminar con éxito, se vuelve a la pantalla anterior; la Vista de
      // origen (Home/Artículos) se actualizará sola gracias a su propia
      // suscripción en tiempo real (`subscribeToLoans`/`subscribeToArticles`).
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color="#181C1A" 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Solicitar Préstamo
        </Text>
      </View>

      {article && (
        <View style={styles.articlePreview}>
          <View style={styles.articleImage}>
            <MaterialCommunityIcons 
              name="package-variant" 
              size={32} 
              color="#3E4941" 
            />
          </View>
          <Text style={styles.articleName}>
            {article.nombre}
          </Text>
          <Text style={styles.articleCategory}>
            {article.categoria}
          </Text>
          <Text style={styles.articleStock}>
            {article.stock} unidades disponibles
          </Text>
        </View>
      )}

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>
          Tipo de Préstamo
        </Text>
        <View style={styles.loanTypeContainer}>
          <TouchableOpacity
            style={[
              styles.loanTypeButton,
              { 
                backgroundColor: loanType === 'interno' ? '#ABF2C1' : '#EAEFEB',
                borderColor: loanType === 'interno' ? '#256B42' : '#6E7A71',
              }
            ]}
            onPress={() => setLoanType('interno')}
          >
            <MaterialCommunityIcons 
              name="school" 
              size={24} 
              color={loanType === 'interno' ? '#02210E' : '#3E4941'} 
            />
            <Text style={[
              styles.loanTypeTitle, 
              { color: loanType === 'interno' ? '#02210E' : '#181C1A' }
            ]}>
              Interno
            </Text>
            <Text style={[
              styles.loanTypeDescription, 
              { color: loanType === 'interno' ? '#02210E' : '#3E4941' }
            ]}>
              Dentro del laboratorio
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.loanTypeButton,
              { 
                backgroundColor: loanType === 'externo' ? '#ABF2C1' : '#EAEFEB',
                borderColor: loanType === 'externo' ? '#256B42' : '#6E7A71',
              }
            ]}
            onPress={() => setLoanType('externo')}
          >
            <MaterialCommunityIcons 
              name="home" 
              size={24} 
              color={loanType === 'externo' ? '#02210E' : '#3E4941'} 
            />
            <Text style={[
              styles.loanTypeTitle, 
              { color: loanType === 'externo' ? '#02210E' : '#181C1A' }
            ]}>
              Externo
            </Text>
            <Text style={[
              styles.loanTypeDescription, 
              { color: loanType === 'externo' ? '#02210E' : '#3E4941' }
            ]}>
              Fuera de la institución
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>
          Fecha de Entrega
        </Text>
        <TextInput
          mode="outlined"
          placeholder="YYYY-MM-DD"
          value={startDate}
          onChangeText={setStartDate}
          style={styles.input}
          outlineColor="#6E7A71"
          activeOutlineColor="#256B42"
          theme={{ roundness: 16 }}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>
          Fecha de Devolución
        </Text>
        <TextInput
          mode="outlined"
          placeholder="YYYY-MM-DD"
          value={endDate}
          onChangeText={setEndDate}
          style={styles.input}
          outlineColor="#6E7A71"
          activeOutlineColor="#256B42"
          theme={{ roundness: 16 }}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>
          Motivo del Préstamo
        </Text>
        <TextInput
          mode="outlined"
          placeholder="Seleccionar motivo..."
          value={purpose}
          onChangeText={setPurpose}
          style={styles.input}
          outlineColor="#6E7A71"
          activeOutlineColor="#256B42"
          theme={{ roundness: 16 }}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>
          Observaciones
        </Text>
        <TextInput
          mode="outlined"
          placeholder="Agregar detalles adicionales..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={[styles.input, styles.textArea]}
          outlineColor="#6E7A71"
          activeOutlineColor="#256B42"
          theme={{ roundness: 16 }}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>
          Foto del Estado Actual
        </Text>
        <TouchableOpacity style={styles.photoUpload}>
          <MaterialCommunityIcons 
            name="camera" 
            size={24} 
            color="#3E4941" 
          />
          <Text style={styles.photoUploadText}>
            Tomar foto del artículo antes del préstamo
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.termsContainer}>
        <Checkbox
          status={termsAccepted ? 'checked' : 'unchecked'}
          onPress={() => setTermsAccepted(!termsAccepted)}
          color="#256B42"
        />
        <Text style={styles.termsText}>
          Acepto los términos y condiciones del préstamo, incluyendo responsabilidad por daños y plazos de entrega.
        </Text>
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      <Button
        mode="contained"
        onPress={handleRequestLoan}
        disabled={loading || !termsAccepted}
        style={[styles.submitButton, { backgroundColor: '#256B42' }]}
        labelStyle={[styles.submitButtonText, { color: '#FEFFFE' }]}
        contentStyle={styles.submitButtonContent}
        theme={{ roundness: 28 }}
      >
        {loading ? 'Procesando...' : 'Confirmar Solicitud'}
      </Button>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

// Estilos puramente visuales de esta Vista.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FBF6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#181C1A',
  },
  articlePreview: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#EAEFEB',
  },
  articleImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#DEE4E0',
  },
  articleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181C1A',
    marginBottom: 4,
  },
  articleCategory: {
    fontSize: 12,
    color: '#3E4941',
    marginBottom: 8,
  },
  articleStock: {
    fontSize: 12,
    fontWeight: '600',
    color: '#256B42',
  },
  formSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#181C1A',
    marginBottom: 8,
  },
  loanTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  loanTypeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  loanTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  loanTypeDescription: {
    fontSize: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'transparent',
  },
  textArea: {
    height: 80,
  },
  photoUpload: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderColor: '#6E7A71',
  },
  photoUploadText: {
    fontSize: 11,
    color: '#3E4941',
    marginTop: 8,
  },
  termsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  termsText: {
    fontSize: 10,
    color: '#3E4941',
    flex: 1,
    marginTop: 8,
  },
  error: {
    fontSize: 12,
    color: '#B3261E',
    marginHorizontal: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  submitButton: {
    marginHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonContent: {
    height: 56,
  },
  bottomSpacing: {
    height: 40,
  },
});
