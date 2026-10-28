export const mapCopy = {
  es: {
    title: 'Ubicaciones', subtitle: 'Encuentra nuestro punto de atención',
    available: 'Puntos disponibles', select: 'Ver ubicación', selected: 'Seleccionado',
    recenter: 'Centrar mapa', loading: 'Cargando mapa…',
    errorTitle: 'No se pudo cargar el mapa', errorMessage: 'Comprueba la conexión y vuelve a intentarlo.',
    retry: 'Reintentar', emptyTitle: 'No hay ubicaciones disponibles',
    emptyMessage: 'Por ahora no hay puntos con una ubicación válida.',
  },
  en: {
    title: 'Locations', subtitle: 'Find our service location',
    available: 'Available locations', select: 'View location', selected: 'Selected',
    recenter: 'Center map', loading: 'Loading map…',
    errorTitle: 'The map could not load', errorMessage: 'Check your connection and try again.',
    retry: 'Try again', emptyTitle: 'No locations available',
    emptyMessage: 'There are currently no locations with valid coordinates.',
  },
  pt: {
    title: 'Localizações', subtitle: 'Encontre nosso ponto de atendimento',
    available: 'Pontos disponíveis', select: 'Ver localização', selected: 'Selecionado',
    recenter: 'Centralizar mapa', loading: 'Carregando mapa…',
    errorTitle: 'Não foi possível carregar o mapa', errorMessage: 'Verifique sua conexão e tente novamente.',
    retry: 'Tentar novamente', emptyTitle: 'Nenhuma localização disponível',
    emptyMessage: 'No momento, não há pontos com uma localização válida.',
  },
  fr: {
    title: 'Emplacements', subtitle: 'Trouvez notre point de service',
    available: 'Points disponibles', select: 'Voir l’emplacement', selected: 'Sélectionné',
    recenter: 'Centrer la carte', loading: 'Chargement de la carte…',
    errorTitle: 'Impossible de charger la carte', errorMessage: 'Vérifiez votre connexion et réessayez.',
    retry: 'Réessayer', emptyTitle: 'Aucun emplacement disponible',
    emptyMessage: 'Aucun point ne possède actuellement de coordonnées valides.',
  },
} as const

export const getMapCopy = (language: string) =>
  mapCopy[language.split('-')[0] as keyof typeof mapCopy] ?? mapCopy.es
