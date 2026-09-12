// ============================================================================
// CAPA: VISTA — Catálogo de artículos con búsqueda y filtro por categoría
// ----------------------------------------------------------------------------
// Se suscribe en tiempo real al catálogo completo de artículos
// (`subscribeToArticles`, capa de servicio/Modelo) y aplica, en memoria,
// lógica de presentación (búsqueda por texto y filtro por categoría) sobre
// esos datos. Esta lógica de filtrado es puramente de Vista: no modifica
// datos en Firestore, solo decide qué subconjunto mostrar.
// ============================================================================
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { subscribeToArticles } from '../services/firestoreService';

export default function ArticulosScreen({ navigation }) {
  // `articles`: copia íntegra de los datos del Modelo (fuente de verdad).
  // `filteredArticles`: subconjunto derivado que realmente se renderiza.
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', 'Herramientas', 'Dispositivos', 'Cables', 'Redes'];

  useEffect(() => {
    // Suscripción reactiva al catálogo completo de artículos (Modelo).
    const unsubscribe = subscribeToArticles((articlesData) => {
      setArticles(articlesData);
      setFilteredArticles(articlesData);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Recalcula la lista filtrada cada vez que cambian los artículos, el
    // texto de búsqueda o la categoría seleccionada. Es lógica de
    // presentación derivada, no de negocio.
    let filtered = articles;
    
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.descripcion?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(article => article.categoria === selectedCategory);
    }
    
    setFilteredArticles(filtered);
  }, [searchQuery, selectedCategory, articles]);

  // Determina el color del indicador de stock según la disponibilidad.
  const getStockColor = (stock) => {
    if (stock === 0) return '#B3261E';
    if (stock <= 2) return '#F39C12';
    return '#256B42';
  };

  // Renderiza la tarjeta de un artículo individual, con navegación al
  // detalle o a la solicitud de préstamo según dónde toque el usuario.
  const renderArticle = (article) => {
    const stockColor = getStockColor(article.stock);
    
    return (
      <Card 
        key={article.id} 
        style={styles.articleCard}
      >
        <Card.Content style={styles.articleContent}>
          <TouchableOpacity 
            style={styles.articleInfo}
            onPress={() => navigation.navigate('ArticleDetail', { article })}
          >
            <View style={styles.articleHeader}>
              <Text style={styles.articleName}>
                {article.nombre}
              </Text>
              <View style={[styles.stockBadge, { backgroundColor: stockColor }]}>
                <Text style={styles.stockText}>
                  {article.stock} disp.
                </Text>
              </View>
            </View>
            
            <Text style={styles.articleCategory}>
              {article.categoria}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: article.stock === 0 ? '#DEE4E0' : '#256B42' }]}
            onPress={() => navigation.navigate('LoanRequest', { article })}
            disabled={article.stock === 0}
          >
            <MaterialCommunityIcons 
              name="plus" 
              size={24} 
              color={article.stock === 0 ? '#3E4941' : '#FEFFFE'} 
            />
          </TouchableOpacity>
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Artículos
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#3E4941" />
        <TextInput
          placeholder="Buscar"
          placeholderTextColor="#6E7A71"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryChip,
              { 
                backgroundColor: selectedCategory === category ? '#256B42' : '#EAEFEB'
              }
            ]}
          >
            <Text style={[
              styles.categoryText,
              { color: selectedCategory === category ? '#FEFFFE' : '#181C1A' }
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.articlesContainer}>
        {filteredArticles.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons 
              name="package-variant" 
              size={48} 
              color="#3E4941" 
            />
            <Text style={styles.emptyText}>
              No se encontraron artículos
            </Text>
          </View>
        ) : (
          filteredArticles.map(renderArticle)
        )}
      </View>

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
    paddingTop: 60,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#181C1A',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4EAE5',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 28,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#181C1A',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  articlesContainer: {
    paddingHorizontal: 16,
  },
  emptyCard: {
    backgroundColor: '#E4EAE5',
    borderRadius: 28,
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: '#3E4941',
    marginTop: 12,
  },
  articleCard: {
    marginBottom: 16,
    borderRadius: 28,
    backgroundColor: '#E4EAE5',
  },
  articleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  articleInfo: {
    flex: 1,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  articleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#181C1A',
    flex: 1,
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 28,
  },
  stockText: {
    fontSize: 13,
    color: '#FEFFFE',
    fontWeight: '500',
  },
  articleCategory: {
    fontSize: 15,
    color: '#3E4941',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  bottomSpacing: {
    height: 100,
  },
});
