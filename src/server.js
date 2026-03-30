const express = require("express");
const session = require("express-session");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

// --- INTERNATIONALIZATION ---
const translations = {
  en: {
    home: 'Home', raceFeed: 'Race Feed', myLogs: 'My Logs', logRace: '+ Log Race', perfMetrics: 'Performance Metrics',
    magic: '✨ Magic', tuningGuides: 'Tuning Guides', racingRules: 'Racing Rules',
    snipeRules: 'Snipe Class Rules', regattas: 'Regattas', myBoatPhotos: 'Photos & Videos',
    profile: 'Profile', logout: 'Logout', login: 'Login', signUp: 'Sign Up',
    tagline: 'Serious sailing, serious fun — race logs, conditions & settings to make you a Snipe genius',
    logARace: 'Log a Race', editRaceLog: 'Edit Race Log', saveRaceLog: 'Save Race Log',
    updateRaceLog: 'Update Race Log', cancel: 'Cancel', event: 'Event', conditions: 'Conditions',
    boatSettings: 'Boat Settings', notes: 'Notes', raceNotes: 'Race Notes',
    raceName: 'Race/Event Name', date: 'Date', location: 'Location', boatNumber: 'Boat Number',
    crewName: 'Crew Name', skipperWeight: 'Skipper Weight', crewWeight: 'Crew Weight',
    windSpeed: 'Wind Speed', windDirection: 'Wind Direction', seaState: 'Sea State',
    temperature: 'Temperature', currentTide: 'Current/Tide',
    finishPosition: 'Finish Position', fleetSize: 'Fleet Size', perfRating: 'Self Determined Performance Rating',
    flat: 'Flat', choppy: 'Choppy', largeWaves: 'Large Waves',
    mastRake: 'Mast Rake', shroudTension: 'Shroud Tension', staMasterTurns: 'Sta-Master Turns',
    wireSize: 'Wire Size', spreaderLength: 'Spreader Length', spreaderSweep: 'Spreader Sweep',
    jibLead: 'Jib Lead', jibClothTension: 'Jib Cloth Tension', jibHeight: 'Jib Height (deck to tack)',
    jibOutboardLead: 'Jib Outboard Lead', cunningham: 'Cunningham', outhaul: 'Outhaul', vang: 'Vang',
    mastPuller: 'Mast Fwd/Aft Puller Position', traveler: 'Traveler Position',
    augieEq: 'Augie Equalizer/Duffy Dominator', augieEqualizer: 'Augie Eq./Duffy Dom.',
    jibUsed: 'Jib', mainsailUsed: 'Mainsail', mainsailMaker: 'Main Maker', jibMaker: 'Jib Maker',
    fwdAftPuller: 'Mast Fwd/Aft Puller', travelerPosition: 'Traveler', mastWiggle: 'Shroud Adjuster Wiggle',
    selectMakerFirst: 'Select maker first', selectModel: 'Select model',
    language: 'Language', forgotPassword: 'Forgot password?', email: 'Email', password: 'Password',
    createAccount: 'Create Account', dontHaveAccount: "Don't have an account?",
    uploadPhoto: 'Upload', addPhoto: '📤 Add Photo or Video', tapToSelect: 'Tap to select a photo or video',
    phoneDesktop: 'Phone: camera or gallery • Desktop: browse files or drag & drop • Videos up to 50MB',
    findPhotos: '🔍 Find Photos or Videos of Your Snipe on the Web', myBoatGallery: '🖼️ My Boat Gallery',
    sailNumBoatRegatta: 'Sail Number, Boat Name, Skipper Name or Regatta', search: '🔍 Search',
    calculate: '✨ Calculate Settings', sailMaker: 'Sail Maker', snipeBuilder: 'Snipe Builder',
    combinedCrewWeight: 'Combined Crew Weight', lbs: 'lbs', kg: 'kg',
    windSpeedKnots: 'Wind Speed (knots)', recommended: 'Recommended Settings',
    inches: '"', cm: 'cm',
    forecast: 'Forecast', windForecast: 'Wind Forecast (24h)', tideForecast: 'Tide / Current (24h)',
    enterLocation: 'Zip code, city, or city + country', loadForecast: 'Load Forecast', locating: 'Locating...',
    useMyLocation: 'Use My Location', windSpeed: 'Wind Speed', windDir: 'Wind Direction',
    noLocation: 'Enable location or enter a location to see the forecast.',
    nearestWater: 'Nearest Sailable Water', incoming: 'Incoming', outgoing: 'Outgoing',
    tasks: 'Tasks', addHullNumber: 'Add Hull Number', enterHullNumber: 'Enter hull number',
    addTask: 'Add Task', enterTask: 'Enter task description', assignToBoat: 'Assign to boat',
    noTasks: 'No tasks yet. Add hull numbers and tasks above.', deleteTask: 'Delete',
    editTask: 'Edit', saveTask: 'Save', hullNumbers: 'Hull Numbers', taskList: 'Task List',
    dateEntered: 'Date Entered', allBoats: 'All Boats',
    // Auth & errors
    forgotPw: 'Forgot Password', sendResetLink: 'Send Reset Link', backToLogin: 'Back to Login',
    resetLink: 'Reset Link', resetPassword: 'Reset Password', newPassword: 'New Password',
    confirmNewPw: 'Confirm New Password', setNewPassword: 'Set New Password', atLeast6: 'At least 6 characters',
    invalidLink: 'Invalid Link', linkExpired: 'Link Expired', requestNewLink: 'Request New Link',
    pwUpdated: 'Password Updated Successfully!', resetLinkInvalid: 'This reset link is invalid or expired.',
    resetLinkSent: 'If that email is registered, a reset link has been sent.',
    usernameEmailPwReq: 'Username, email, and password are required.',
    pwsDontMatch: 'Passwords do not match.', pwTooShort: 'Password must be at least 6 characters.',
    usernameTaken: 'Username or email already taken.', somethingWrong: 'Something went wrong. Please try again.',
    invalidCredentials: 'Invalid email or password.', enterRegEmail: 'Enter your registered email',
    alreadyHaveAccount: 'Already have an account?',
    // Profile
    myProfile: 'My Profile', updateSailorInfo: 'Update your sailor info and boat details',
    yourName: 'Your Name', sailboatName: 'Sailboat Name', snipeSailNum: 'Snipe Sail Number',
    saveProfile: 'Save Profile', username: 'Username',
    // Photos
    deletePhoto: 'Delete this photo?', noPhotosYet: 'No photos yet',
    searchOrUpload: 'Search above or upload a photo to start your gallery!',
    uploading: 'Uploading...', uploadFailed: 'Upload failed. Please try again.',
    // Rules
    searchRules: 'Search rules...', ruleNotFound: 'Rule not found',
    showingWorldSailing: 'Showing: World Sailing — Racing Rules of Sailing 2025-2028',
    showingUSSailing: 'Showing: US Sailing Prescriptions to the Racing Rules of Sailing',
    searchClassRules: 'Search class rules...',
    // Regattas
    noUpcomingEvents: 'No upcoming events in this category.',
    noRegattas: 'You have not marked any upcoming regattas yet.',
    checkBoxInstruction: 'Check the box to mark regattas you are attending.',
    loginToTrack: 'Log in to track which regattas you are attending.',
    upcomingUS: 'upcoming US event(s)', upcomingGlobal: 'upcoming global event(s)',
    // Tasks
    deleteTaskConfirm: 'Delete this task?', voiceNotSupported: 'Voice input not supported in this browser.',
    // General
    edit: 'Edit', delete: 'Delete', deleteRaceConfirm: 'Delete this race log?',
    saveDefault: 'Save as my default for all races', errorLoadingForecast: 'Error loading forecast.',
    errorLookingUp: 'Error looking up location.', yourLocation: 'Your Location',
    // Tuning Guides
    snipeTuningGuides: 'Snipe Tuning Guides',
    tuningGuideSubtitle: 'Reference tuning settings from the top sail makers in the Snipe class.',
    quantumGuideDesc: 'Complete tuning guide with rig setup, spreader settings, mast rake, shroud tension, and sail trim for all conditions.',
    northGuideDesc: 'Comprehensive guide covering hull prep, mast tuning, spreader setup, jib trim, helm balance, and heavy air settings.',
    olimpicGuideDesc: 'Tuning guide for XP series (XPM main & XPJ jib) by Bruno Bethlem, 2009 Snipe World Champion. Covers rake, shroud tension, spreaders, and controls for light, medium & heavy air.',
    viewFullGuide: 'View Full Guide',
    // Racing Rules
    rrsTitle: 'Racing Rules of Sailing (RRS)',
    rrsSearchDesc: 'Search the key racing rules by keyword or voice.',
    ruleset: 'Ruleset', worldSailing: 'World Sailing', usSailingPrescriptions: 'US Sailing Prescriptions',
    lookUpRule: 'Look Up Rule', enterRuleNumber: 'Enter a rule number',
    searchRulesPlaceholder: 'Search rules... e.g. port starboard, mark rounding, protest',
    voiceSearch: 'Voice search', voiceInput: 'Voice input',
    part1FundamentalRules: 'Part 1 — Fundamental Rules',
    keyDefinitions: 'Key Definitions',
    usPrescriptionsTitle: 'US Sailing Prescriptions to the RRS',
    rrsReference: 'Reference: World Sailing. This is a summary for quick reference. Always consult the official rules for complete text.',
    // Snipe Class Rules
    snipeClassRulesTitle: 'Snipe Class Rules (SCIRA)',
    snipeClassRulesDesc: 'Official class rules governed by the Snipe Class International Racing Association (SCIRA). The Snipe is a strict one-design class — all boats must comply with identical specifications for fair competition.',
    searchClassRulesPlaceholder: 'Search class rules... e.g. hull weight, mast, sail area',
    classRulesReference: 'Reference: SCIRA. This is a reference summary. Always consult the official class rules PDF for complete and binding text.',
    // Sailor / Profile
    sailorNotFound: 'Sailor not found', profileUpdated: 'Profile updated!',
    raceDateNameReq: 'Race date and name are required.',
    memberSince: 'Member since', racesLogged: 'races logged', noRacesLoggedYet: 'No races logged yet',
    noRacesYet: 'No races yet', goToLogin: 'Go to Login',
    // Photos
    uploadPhotoDesc: 'Upload photos and videos of your Snipe sailboat. Only your verified media is displayed.',
    readyUpload: 'ready — fill in details below and click Upload',
    searchingPhotos: 'Searching for photos',
    searchMoreSources: 'Search more sources:',
    noDataForSetting: 'No data available for this setting. Log some races with this field filled in!',
    // Dropdowns
    none: 'None', aLittle: 'A little', moderate: 'Moderate', downrightSloppy: 'Downright Sloppy!',
    compressedStrand: 'Compressed Strand', standard: 'Standard',
    allSeaStates: 'All Sea States', settingToGraph: 'Setting to Graph',
    graphDesc: 'Graph any boat setting against your Self Determined Performance Rating across all logged races.',
    selectASetting: 'Select a Setting', sails: 'Sails', rigSettings: 'Rig Settings',
    jibSettings: 'Jib Settings', controls: 'Controls',
    staMasterWiggle: 'Shroud Adjuster Wiggle (Leeward Shroud)',
    // Dashboard
    racesLoggedStat: 'Races Logged', venues: 'Venues', sailNumber: 'Sail Number',
    bestRating: 'Best Rating',
    // Confirmations
    deletePhotoConfirm: 'Delete this photo?',
    // Rules notice
    rulesInEnglish: 'Official rules shown in English. Translations are for reference only.',
    // Placeholders
    egRaceName: 'e.g. Wednesday Night Series #5', egLocation: 'e.g. Lake Eustis, FL',
    egCrewName: 'e.g. Jane Smith', egSailNum: 'e.g. 31847', egBoatNum: 'e.g. 31234',
    egUsername: 'e.g. sailor42', egDisplayName: 'e.g. Charlie Green', egBoatName: 'e.g. Wind Dancer',
    egJibLead: 'e.g. Hole 3', egCunningham: 'e.g. Light, Medium, Max',
    egOuthaul: 'e.g. Eased, Tight', egVang: 'e.g. Light, Moderate, Heavy',
    egPuller: 'e.g. Neutral, Fwd 0.6 cm, Aft 1.0 cm',
    egTraveler: 'e.g. Centered', egAugie: 'e.g. Tight, Eased',
    egShroudTension: 'e.g. 21 (Loos PT-1 Black)', egStaMaster: 'e.g. Base, +½ turn',
    egJibCloth: 'e.g. Light wrinkles, Smooth, Tight', egJibOutboard: 'e.g. Inboard, Mid, Full outboard',
    upload: 'Upload', caption: 'Caption', egCaption: 'e.g. Don Q 2025, At the dock',
    // Regattas extended
    noRegatChecked: "You haven't marked any upcoming regattas yet. Check the boxes on events you plan to attend!",
    checkBoxToMark: "Check the box to mark regattas you're attending.",
    loginToTrackRegattas: "Log in to track which regattas you're attending.",
    select: 'Select'
  },
  es: {
    home: 'Inicio', raceFeed: 'Carreras', myLogs: 'Mis Registros', logRace: '+ Registrar', perfMetrics: 'Rendimiento',
    magic: '✨ Magia', tuningGuides: 'Guías de Ajuste', racingRules: 'Reglas de Regata',
    snipeRules: 'Reglas de Clase', regattas: 'Regatas', myBoatPhotos: 'Fotos y Videos',
    profile: 'Perfil', logout: 'Salir', login: 'Iniciar Sesión', signUp: 'Registrarse',
    tagline: 'Navegación seria, diversión seria — registros de regata, condiciones y ajustes',
    logARace: 'Registrar Regata', editRaceLog: 'Editar Registro', saveRaceLog: 'Guardar Registro',
    updateRaceLog: 'Actualizar Registro', cancel: 'Cancelar', event: 'Evento', conditions: 'Condiciones',
    boatSettings: 'Ajustes del Barco', notes: 'Notas', raceNotes: 'Notas de Regata',
    raceName: 'Nombre del Evento', date: 'Fecha', location: 'Ubicación', boatNumber: 'Número de Barco',
    crewName: 'Nombre del Tripulante', skipperWeight: 'Peso del Timonel', crewWeight: 'Peso del Tripulante',
    windSpeed: 'Velocidad del Viento', windDirection: 'Dirección del Viento', seaState: 'Estado del Mar',
    temperature: 'Temperatura', currentTide: 'Corriente/Marea',
    finishPosition: 'Posición Final', fleetSize: 'Tamaño de Flota', perfRating: 'Calificación de Rendimiento',
    flat: 'Plano', choppy: 'Picado', largeWaves: 'Olas Grandes',
    mastRake: 'Caída del Mástil', shroudTension: 'Tensión de Obenques', staMasterTurns: 'Vueltas Sta-Master',
    wireSize: 'Tamaño de Cable', spreaderLength: 'Largo de Cruceta', spreaderSweep: 'Ángulo de Cruceta',
    jibLead: 'Guía del Foque', jibClothTension: 'Tensión de Tela del Foque', jibHeight: 'Altura del Foque (cubierta a amura)',
    jibOutboardLead: 'Guía Exterior del Foque', cunningham: 'Cunningham', outhaul: 'Outhaul', vang: 'Vang',
    mastPuller: 'Posición Proa/Popa del Mástil', traveler: 'Posición del Travesaño',
    augieEq: 'Ecualizador Augie/Duffy Dominator', augieEqualizer: 'Ecual. Augie/Duffy',
    jibUsed: 'Foque', mainsailUsed: 'Mayor', mainsailMaker: 'Fabricante Mayor', jibMaker: 'Fabricante Foque',
    fwdAftPuller: 'Empujador del Mástil', travelerPosition: 'Traveler', mastWiggle: 'Holgura del Ajustador de Obenques',
    selectMakerFirst: 'Seleccionar fabricante', selectModel: 'Seleccionar modelo',
    language: 'Idioma', forgotPassword: '¿Olvidó su contraseña?', email: 'Correo', password: 'Contraseña',
    createAccount: 'Crear Cuenta', dontHaveAccount: '¿No tiene cuenta?',
    uploadPhoto: 'Subir', addPhoto: '📤 Agregar Foto o Video', tapToSelect: 'Toque para seleccionar foto o video',
    phoneDesktop: 'Teléfono: cámara o galería • Escritorio: explorar o arrastrar • Videos hasta 50MB',
    findPhotos: '🔍 Buscar Fotos o Videos de su Snipe en la Web', myBoatGallery: '🖼️ Galería de Mi Barco',
    sailNumBoatRegatta: 'Número de Vela, Nombre del Barco o Regata', search: '🔍 Buscar',
    calculate: '✨ Calcular Ajustes', sailMaker: 'Velería', snipeBuilder: 'Constructor de Snipe',
    combinedCrewWeight: 'Peso Combinado de Tripulación', lbs: 'lbs', kg: 'kg',
    windSpeedKnots: 'Velocidad del Viento (nudos)', recommended: 'Ajustes Recomendados',
    inches: '"', cm: 'cm',
    forecast: 'Pronóstico', windForecast: 'Pronóstico de Viento (24h)', tideForecast: 'Marea / Corriente (24h)',
    enterLocation: 'Código postal, ciudad, o ciudad + país', loadForecast: 'Cargar Pronóstico', locating: 'Localizando...',
    useMyLocation: 'Usar Mi Ubicación', nearestWater: 'Agua Navegable Más Cercana',
    incoming: 'Entrante', outgoing: 'Saliente', noLocation: 'Active ubicación o ingrese una ubicación.',
    forgotPw: 'Olvidó Contraseña', sendResetLink: 'Enviar Enlace', backToLogin: 'Volver al Inicio',
    resetLink: 'Enlace de Restablecimiento', resetPassword: 'Restablecer Contraseña', newPassword: 'Nueva Contraseña',
    confirmNewPw: 'Confirmar Nueva Contraseña', setNewPassword: 'Establecer Nueva Contraseña', atLeast6: 'Al menos 6 caracteres',
    invalidLink: 'Enlace Inválido', linkExpired: 'Enlace Expirado', requestNewLink: 'Solicitar Nuevo Enlace',
    pwUpdated: '¡Contraseña actualizada exitosamente!', resetLinkInvalid: 'Este enlace es inválido o ha expirado.',
    resetLinkSent: 'Si el correo está registrado, se envió un enlace de restablecimiento.',
    usernameEmailPwReq: 'Se requiere usuario, correo y contraseña.',
    pwsDontMatch: 'Las contraseñas no coinciden.', pwTooShort: 'La contraseña debe tener al menos 6 caracteres.',
    usernameTaken: 'Usuario o correo ya en uso.', somethingWrong: 'Algo salió mal. Intente de nuevo.',
    invalidCredentials: 'Correo o contraseña inválidos.', enterRegEmail: 'Ingrese su correo registrado',
    alreadyHaveAccount: '¿Ya tiene una cuenta?',
    myProfile: 'Mi Perfil', updateSailorInfo: 'Actualice su información de navegante y barco',
    yourName: 'Su Nombre', sailboatName: 'Nombre del Barco', snipeSailNum: 'Número de Vela Snipe',
    saveProfile: 'Guardar Perfil', username: 'Usuario',
    deletePhoto: '¿Eliminar esta foto?', noPhotosYet: 'Sin fotos aún',
    searchOrUpload: '¡Busque arriba o suba una foto para iniciar su galería!',
    uploading: 'Subiendo...', uploadFailed: 'Error al subir. Intente de nuevo.',
    searchRules: 'Buscar reglas...', ruleNotFound: 'Regla no encontrada',
    showingWorldSailing: 'Mostrando: World Sailing — Reglas de Regata de Vela 2025-2028',
    showingUSSailing: 'Mostrando: US Sailing Prescripciones a las Reglas de Regata',
    searchClassRules: 'Buscar reglas de clase...',
    noUpcomingEvents: 'No hay eventos próximos en esta categoría.',
    noRegattas: 'No ha marcado ninguna regata próxima.',
    checkBoxInstruction: 'Marque la casilla para indicar las regatas a las que asistirá.',
    loginToTrack: 'Inicie sesión para seguir sus regatas.',
    upcomingUS: 'evento(s) próximo(s) en EE.UU.', upcomingGlobal: 'evento(s) global(es) próximo(s)',
    deleteTaskConfirm: '¿Eliminar esta tarea?', voiceNotSupported: 'Entrada de voz no soportada.',
    edit: 'Editar', delete: 'Eliminar', deleteRaceConfirm: '¿Eliminar este registro?',
    saveDefault: 'Guardar como predeterminado', errorLoadingForecast: 'Error al cargar pronóstico.',
    errorLookingUp: 'Error al buscar ubicación.', yourLocation: 'Su Ubicación',
    tasks: 'Tareas', addHullNumber: 'Agregar Número de Casco', enterHullNumber: 'Ingrese número de casco',
    addTask: 'Agregar Tarea', enterTask: 'Ingrese descripción de tarea', assignToBoat: 'Asignar al barco',
    noTasks: 'No hay tareas. Agregue números de casco y tareas arriba.', deleteTask: 'Eliminar',
    editTask: 'Editar', saveTask: 'Guardar', hullNumbers: 'Números de Casco', taskList: 'Lista de Tareas',
    dateEntered: 'Fecha de Ingreso', allBoats: 'Todos los Barcos',
    snipeTuningGuides: 'Guías de Ajuste Snipe',
    tuningGuideSubtitle: 'Ajustes de referencia de los principales fabricantes de velas de la clase Snipe.',
    quantumGuideDesc: 'Guía completa con configuración de aparejo, crucetas, caída del mástil, tensión de obenques y trimado de velas.',
    northGuideDesc: 'Guía completa sobre preparación del casco, ajuste del mástil, crucetas, trimado del foque, equilibrio del timón y viento fuerte.',
    olimpicGuideDesc: 'Guía de ajuste serie XP (XPM mayor y XPJ foque) por Bruno Bethlem, Campeón Mundial Snipe 2009. Caída, tensión obenques, crucetas y controles.',
    viewFullGuide: 'Ver Guía Completa',
    rrsTitle: 'Reglas de Regata de Vela (RRS)',
    rrsSearchDesc: 'Busque las reglas de regata por palabra clave o voz.',
    ruleset: 'Reglamento', worldSailing: 'World Sailing', usSailingPrescriptions: 'Prescripciones US Sailing',
    lookUpRule: 'Buscar Regla', enterRuleNumber: 'Ingrese número de regla',
    searchRulesPlaceholder: 'Buscar reglas... ej. babor estribor, marca, protesta',
    voiceSearch: 'Búsqueda por voz', voiceInput: 'Entrada de voz',
    part1FundamentalRules: 'Parte 1 — Reglas Fundamentales',
    keyDefinitions: 'Definiciones Clave',
    usPrescriptionsTitle: 'Prescripciones de US Sailing a las RRS',
    rrsReference: 'Referencia: World Sailing. Resumen de referencia rápida. Consulte siempre las reglas oficiales para el texto completo.',
    snipeClassRulesTitle: 'Reglas de Clase Snipe (SCIRA)',
    snipeClassRulesDesc: 'Reglas oficiales de clase de la Asociación Internacional de Regatas de Snipe (SCIRA). El Snipe es un monotipo estricto — todos los barcos deben cumplir especificaciones idénticas.',
    searchClassRulesPlaceholder: 'Buscar reglas de clase... ej. peso del casco, mástil, área de vela',
    classRulesReference: 'Referencia: SCIRA. Resumen de referencia. Consulte siempre el PDF oficial de reglas de clase.',
    sailorNotFound: 'Regatista no encontrado', profileUpdated: '¡Perfil actualizado!',
    raceDateNameReq: 'La fecha y nombre de la regata son obligatorios.',
    memberSince: 'Miembro desde', racesLogged: 'regatas registradas', noRacesLoggedYet: 'No hay regatas registradas',
    noRacesYet: 'No hay regatas aún', goToLogin: 'Ir a Iniciar Sesión',
    uploadPhotoDesc: 'Suba fotos y videos de su Snipe. Solo se muestran sus archivos verificados.',
    readyUpload: 'listo — complete los detalles y haga clic en Subir',
    searchingPhotos: 'Buscando fotos',
    searchMoreSources: 'Buscar más fuentes:',
    noDataForSetting: 'No hay datos para este ajuste. ¡Registre regatas con este campo!',
    none: 'Ninguno', aLittle: 'Un poco', moderate: 'Moderado', downrightSloppy: '¡Completamente Flojo!',
    compressedStrand: 'Hilo Comprimido', standard: 'Estándar',
    allSeaStates: 'Todos los Estados del Mar', settingToGraph: 'Ajuste a Graficar',
    graphDesc: 'Grafique cualquier ajuste del barco contra su calificación de rendimiento en todas las regatas.',
    selectASetting: 'Seleccionar Ajuste', sails: 'Velas', rigSettings: 'Ajustes del Aparejo',
    jibSettings: 'Ajustes del Foque', controls: 'Controles',
    staMasterWiggle: 'Holgura del Ajustador (Obenque Sotavento)',
    racesLoggedStat: 'Regatas', venues: 'Lugares', sailNumber: 'Número de Vela',
    bestRating: 'Mejor Calificación',
    deletePhotoConfirm: '¿Eliminar esta foto?',
    rulesInEnglish: 'Reglas oficiales en inglés. Las traducciones son solo de referencia.',
    egRaceName: 'ej. Serie Nocturna #5', egLocation: 'ej. Bahía de Miami, FL',
    egCrewName: 'ej. Juan García', egSailNum: 'ej. 31847', egBoatNum: 'ej. 31234',
    egUsername: 'ej. marinero42', egDisplayName: 'ej. Carlos García', egBoatName: 'ej. Viento Libre',
    egJibLead: 'ej. Agujero 3', egCunningham: 'ej. Ligero, Medio, Máximo',
    egOuthaul: 'ej. Aflojado, Tenso', egVang: 'ej. Ligero, Moderado, Fuerte',
    egPuller: 'ej. Neutro, Adelante 0.6 cm, Atrás 1.0 cm',
    egTraveler: 'ej. Centrado', egAugie: 'ej. Tenso, Aflojado',
    egShroudTension: 'ej. 21 (Loos PT-1 Negro)', egStaMaster: 'ej. Base, +½ vuelta',
    egJibCloth: 'ej. Arrugas ligeras, Liso, Tenso', egJibOutboard: 'ej. Interior, Medio, Exterior',
    upload: 'Subir', caption: 'Descripción', egCaption: 'ej. Don Q 2025, En el muelle',
    noRegatChecked: '¡No ha marcado regatas próximas! Marque las casillas de los eventos que planea asistir.',
    checkBoxToMark: 'Marque la casilla para indicar las regatas a las que asistirá.',
    loginToTrackRegattas: 'Inicie sesión para rastrear a qué regatas asistirá.',
    select: 'Seleccionar'
  },
  it: {
    home: 'Home', raceFeed: 'Regate', myLogs: 'I Miei Log', logRace: '+ Registra', perfMetrics: 'Prestazioni',
    magic: '✨ Magia', tuningGuides: 'Guide di Regolazione', racingRules: 'Regole di Regata',
    snipeRules: 'Regole di Classe', regattas: 'Regate', myBoatPhotos: 'Foto e Video',
    profile: 'Profilo', logout: 'Esci', login: 'Accedi', signUp: 'Registrati',
    tagline: 'Vela seria, divertimento serio — log di regata, condizioni e regolazioni',
    logARace: 'Registra Regata', editRaceLog: 'Modifica Log', saveRaceLog: 'Salva Log',
    updateRaceLog: 'Aggiorna Log', cancel: 'Annulla', event: 'Evento', conditions: 'Condizioni',
    boatSettings: 'Regolazioni Barca', notes: 'Note', raceNotes: 'Note di Regata',
    raceName: 'Nome Evento', date: 'Data', location: 'Luogo', boatNumber: 'Numero Barca',
    crewName: 'Nome Prodiere', skipperWeight: 'Peso Timoniere', crewWeight: 'Peso Prodiere',
    windSpeed: 'Velocità del Vento', windDirection: 'Direzione del Vento', seaState: 'Stato del Mare',
    temperature: 'Temperatura', currentTide: 'Corrente/Marea',
    finishPosition: 'Posizione Finale', fleetSize: 'Dimensione Flotta', perfRating: 'Valutazione Prestazioni',
    flat: 'Piatto', choppy: 'Mosso', largeWaves: 'Onde Grandi',
    mastRake: 'Inclinazione Albero', shroudTension: 'Tensione Sartie', staMasterTurns: 'Giri Sta-Master',
    wireSize: 'Diametro Cavo', spreaderLength: 'Lunghezza Crocette', spreaderSweep: 'Angolo Crocette',
    jibLead: 'Guida Fiocco', jibClothTension: 'Tensione Tela Fiocco', jibHeight: 'Altezza Fiocco (coperta a mura)',
    jibOutboardLead: 'Guida Esterna Fiocco', cunningham: 'Cunningham', outhaul: 'Outhaul', vang: 'Vang',
    mastPuller: 'Posizione Prua/Poppa Albero', traveler: 'Posizione Carrello',
    augieEq: 'Equalizzatore Augie/Duffy Dominator', augieEqualizer: 'Equal. Augie/Duffy',
    jibUsed: 'Fiocco', mainsailUsed: 'Randa', mainsailMaker: 'Produttore Randa', jibMaker: 'Produttore Fiocco',
    fwdAftPuller: 'Spintore Albero', travelerPosition: 'Traveler', mastWiggle: 'Gioco Regolatore Sartie',
    selectMakerFirst: 'Selezionare produttore', selectModel: 'Selezionare modello',
    language: 'Lingua', forgotPassword: 'Password dimenticata?', email: 'Email', password: 'Password',
    createAccount: 'Crea Account', dontHaveAccount: 'Non hai un account?',
    uploadPhoto: 'Carica', addPhoto: '📤 Aggiungi Foto o Video', tapToSelect: 'Tocca per selezionare foto o video',
    phoneDesktop: 'Telefono: fotocamera o galleria • Desktop: sfoglia o trascina • Video fino a 50MB',
    findPhotos: '🔍 Cerca Foto o Video del tuo Snipe sul Web', myBoatGallery: '🖼️ Galleria della Mia Barca',
    sailNumBoatRegatta: 'Numero Vela, Nome Barca o Regata', search: '🔍 Cerca',
    calculate: '✨ Calcola Regolazioni', sailMaker: 'Veleria', snipeBuilder: 'Costruttore Snipe',
    combinedCrewWeight: 'Peso Combinato Equipaggio', lbs: 'lbs', kg: 'kg',
    windSpeedKnots: 'Velocità del Vento (nodi)', recommended: 'Regolazioni Raccomandate',
    inches: '"', cm: 'cm',
    forecast: 'Previsioni', windForecast: 'Previsioni Vento (24h)', tideForecast: 'Marea / Corrente (24h)',
    enterLocation: 'CAP, città, o città + paese', loadForecast: 'Carica Previsioni', locating: 'Localizzazione...',
    useMyLocation: 'Usa La Mia Posizione', nearestWater: 'Acqua Navigabile Più Vicina',
    incoming: 'Entrante', outgoing: 'Uscente', noLocation: 'Attiva posizione o inserisci una località.',
    forgotPw: 'Password Dimenticata', sendResetLink: 'Invia Link', backToLogin: 'Torna al Login',
    resetLink: 'Link di Ripristino', resetPassword: 'Ripristina Password', newPassword: 'Nuova Password',
    confirmNewPw: 'Conferma Nuova Password', setNewPassword: 'Imposta Nuova Password', atLeast6: 'Almeno 6 caratteri',
    invalidLink: 'Link Non Valido', linkExpired: 'Link Scaduto', requestNewLink: 'Richiedi Nuovo Link',
    pwUpdated: 'Password aggiornata con successo!', resetLinkInvalid: 'Questo link non è valido o è scaduto.',
    resetLinkSent: 'Se l\'email è registrata, è stato inviato un link di ripristino.',
    usernameEmailPwReq: 'Username, email e password sono obbligatori.',
    pwsDontMatch: 'Le password non corrispondono.', pwTooShort: 'La password deve avere almeno 6 caratteri.',
    usernameTaken: 'Username o email già in uso.', somethingWrong: 'Qualcosa è andato storto. Riprova.',
    invalidCredentials: 'Email o password non validi.', enterRegEmail: 'Inserire email registrata',
    alreadyHaveAccount: 'Hai già un account?',
    myProfile: 'Il Mio Profilo', updateSailorInfo: 'Aggiorna le informazioni del velista e della barca',
    yourName: 'Il Tuo Nome', sailboatName: 'Nome della Barca', snipeSailNum: 'Numero Vela Snipe',
    saveProfile: 'Salva Profilo', username: 'Username',
    deletePhoto: 'Eliminare questa foto?', noPhotosYet: 'Nessuna foto ancora',
    searchOrUpload: 'Cerca sopra o carica una foto per iniziare la galleria!',
    uploading: 'Caricamento...', uploadFailed: 'Caricamento fallito. Riprova.',
    searchRules: 'Cerca regole...', ruleNotFound: 'Regola non trovata',
    showingWorldSailing: 'Mostrando: World Sailing — Regole di Regata della Vela 2025-2028',
    showingUSSailing: 'Mostrando: US Sailing Prescrizioni alle Regole di Regata',
    searchClassRules: 'Cerca regole di classe...',
    noUpcomingEvents: 'Nessun evento imminente in questa categoria.',
    noRegattas: 'Non hai ancora selezionato regate imminenti.',
    checkBoxInstruction: 'Seleziona la casella per le regate a cui parteciperai.',
    loginToTrack: 'Accedi per seguire le tue regate.',
    upcomingUS: 'evento/i imminente/i negli USA', upcomingGlobal: 'evento/i globale/i imminente/i',
    deleteTaskConfirm: 'Eliminare questo compito?', voiceNotSupported: 'Input vocale non supportato.',
    edit: 'Modifica', delete: 'Elimina', deleteRaceConfirm: 'Eliminare questo registro?',
    saveDefault: 'Salva come predefinito', errorLoadingForecast: 'Errore nel caricamento previsioni.',
    errorLookingUp: 'Errore nella ricerca della posizione.', yourLocation: 'La Tua Posizione',
    tasks: 'Compiti', addHullNumber: 'Aggiungi Numero Scafo', enterHullNumber: 'Inserire numero scafo',
    addTask: 'Aggiungi Compito', enterTask: 'Inserire descrizione compito', assignToBoat: 'Assegnare alla barca',
    noTasks: 'Nessun compito. Aggiungi numeri di scafo e compiti sopra.', deleteTask: 'Elimina',
    editTask: 'Modifica', saveTask: 'Salva', hullNumbers: 'Numeri Scafo', taskList: 'Lista Compiti',
    dateEntered: 'Data di Inserimento', allBoats: 'Tutte le Barche',
    snipeTuningGuides: 'Guide di Regolazione Snipe',
    tuningGuideSubtitle: 'Impostazioni di riferimento dai migliori produttori di vele della classe Snipe.',
    quantumGuideDesc: 'Guida completa con setup rig, crocette, rake albero, tensione sartie e regolazione vele.',
    northGuideDesc: 'Guida completa su preparazione scafo, regolazione albero, crocette, fiocco, equilibrio timone e vento forte.',
    olimpicGuideDesc: 'Guida serie XP (XPM randa e XPJ fiocco) di Bruno Bethlem, Campione Mondiale Snipe 2009. Rake, tensione sartie, crocette e controlli.',
    viewFullGuide: 'Vedi Guida Completa',
    rrsTitle: 'Regole di Regata della Vela (RRS)',
    rrsSearchDesc: 'Cerca le regole di regata per parola chiave o voce.',
    ruleset: 'Regolamento', worldSailing: 'World Sailing', usSailingPrescriptions: 'Prescrizioni US Sailing',
    lookUpRule: 'Cerca Regola', enterRuleNumber: 'Inserire numero regola',
    searchRulesPlaceholder: 'Cerca regole... es. babordo tribordo, boa, protesta',
    voiceSearch: 'Ricerca vocale', voiceInput: 'Inserimento vocale',
    part1FundamentalRules: 'Parte 1 — Regole Fondamentali',
    keyDefinitions: 'Definizioni Chiave',
    usPrescriptionsTitle: 'Prescrizioni US Sailing alle RRS',
    rrsReference: 'Riferimento: World Sailing. Riepilogo per riferimento rapido. Consultare sempre le regole ufficiali per il testo completo.',
    snipeClassRulesTitle: 'Regole di Classe Snipe (SCIRA)',
    snipeClassRulesDesc: "Regole ufficiali di classe dell'Associazione Internazionale Snipe (SCIRA). Lo Snipe è un monotipo stretto — tutte le barche devono rispettare specifiche identiche.",
    searchClassRulesPlaceholder: 'Cerca regole di classe... es. peso scafo, albero, superficie velica',
    classRulesReference: 'Riferimento: SCIRA. Riepilogo di riferimento. Consultare sempre il PDF ufficiale delle regole di classe.',
    sailorNotFound: 'Regatante non trovato', profileUpdated: 'Profilo aggiornato!',
    raceDateNameReq: 'Data e nome della regata sono obbligatori.',
    memberSince: 'Membro dal', racesLogged: 'regate registrate', noRacesLoggedYet: 'Nessuna regata registrata',
    noRacesYet: 'Nessuna regata ancora', goToLogin: 'Vai al Login',
    uploadPhotoDesc: 'Carica foto e video del tuo Snipe. Solo i tuoi file verificati vengono visualizzati.',
    readyUpload: 'pronto — compila i dettagli e clicca Carica',
    searchingPhotos: 'Ricerca foto',
    searchMoreSources: 'Cerca altre fonti:',
    noDataForSetting: 'Nessun dato per questa impostazione. Registra regate con questo campo!',
    none: 'Nessuno', aLittle: 'Un poco', moderate: 'Moderato', downrightSloppy: 'Completamente Lento!',
    compressedStrand: 'Filo Compresso', standard: 'Standard',
    allSeaStates: 'Tutti gli Stati del Mare', settingToGraph: 'Impostazione da Graficare',
    graphDesc: 'Grafico di qualsiasi impostazione rispetto alla valutazione delle prestazioni in tutte le regate.',
    selectASetting: 'Seleziona Impostazione', sails: 'Vele', rigSettings: 'Regolazioni Rig',
    jibSettings: 'Regolazioni Fiocco', controls: 'Controlli',
    staMasterWiggle: 'Gioco Regolatore (Sartia Sottovento)',
    racesLoggedStat: 'Regate', venues: 'Luoghi', sailNumber: 'Numero di Vela',
    bestRating: 'Miglior Valutazione',
    deletePhotoConfirm: 'Eliminare questa foto?',
    rulesInEnglish: 'Regole ufficiali in inglese. Le traduzioni sono solo di riferimento.',
    egRaceName: 'es. Serie Serale #5', egLocation: 'es. Golfo di Napoli',
    egCrewName: 'es. Marco Rossi', egSailNum: 'es. 31847', egBoatNum: 'es. 31234',
    egUsername: 'es. velista42', egDisplayName: 'es. Marco Rossi', egBoatName: 'es. Vento Libero',
    egJibLead: 'es. Foro 3', egCunningham: 'es. Leggero, Medio, Massimo',
    egOuthaul: 'es. Allentato, Teso', egVang: 'es. Leggero, Moderato, Forte',
    egPuller: 'es. Neutro, Avanti 0.6 cm, Dietro 1.0 cm',
    egTraveler: 'es. Centrato', egAugie: 'es. Teso, Allentato',
    egShroudTension: 'es. 21 (Loos PT-1 Nero)', egStaMaster: 'es. Base, +½ giro',
    egJibCloth: 'es. Pieghe leggere, Liscio, Teso', egJibOutboard: 'es. Interno, Medio, Esterno',
    upload: 'Carica', caption: 'Didascalia', egCaption: 'es. Don Q 2025, Al molo',
    noRegatChecked: 'Non hai ancora selezionato regate! Spunta le caselle degli eventi a cui intendi partecipare.',
    checkBoxToMark: 'Spunta la casella per indicare le regate a cui parteciperai.',
    loginToTrackRegattas: 'Accedi per tracciare a quali regate parteciperai.',
    select: 'Seleziona'
  },
  pt: {
    home: 'Início', raceFeed: 'Regatas', myLogs: 'Meus Registros', logRace: '+ Registrar', perfMetrics: 'Desempenho',
    magic: '✨ Magia', tuningGuides: 'Guias de Ajuste', racingRules: 'Regras de Regata',
    snipeRules: 'Regras da Classe', regattas: 'Regatas', myBoatPhotos: 'Fotos e Vídeos',
    profile: 'Perfil', logout: 'Sair', login: 'Entrar', signUp: 'Cadastrar',
    tagline: 'Vela séria, diversão séria — registros de regata, condições e ajustes',
    logARace: 'Registrar Regata', editRaceLog: 'Editar Registro', saveRaceLog: 'Salvar Registro',
    updateRaceLog: 'Atualizar Registro', cancel: 'Cancelar', event: 'Evento', conditions: 'Condições',
    boatSettings: 'Ajustes do Barco', notes: 'Notas', raceNotes: 'Notas da Regata',
    raceName: 'Nome do Evento', date: 'Data', location: 'Local', boatNumber: 'Número do Barco',
    crewName: 'Nome do Proeiro', skipperWeight: 'Peso do Timoneiro', crewWeight: 'Peso do Proeiro',
    windSpeed: 'Velocidade do Vento', windDirection: 'Direção do Vento', seaState: 'Estado do Mar',
    temperature: 'Temperatura', currentTide: 'Corrente/Maré',
    finishPosition: 'Posição Final', fleetSize: 'Tamanho da Frota', perfRating: 'Avaliação de Desempenho',
    flat: 'Calmo', choppy: 'Agitado', largeWaves: 'Ondas Grandes',
    mastRake: 'Inclinação do Mastro', shroudTension: 'Tensão dos Ovéns', staMasterTurns: 'Voltas Sta-Master',
    wireSize: 'Diâmetro do Cabo', spreaderLength: 'Comprimento da Cruzeta', spreaderSweep: 'Ângulo da Cruzeta',
    jibLead: 'Guia da Vela de Proa', jibClothTension: 'Tensão do Pano da Vela de Proa', jibHeight: 'Altura da Vela de Proa (convés à amura)',
    jibOutboardLead: 'Guia Externa da Vela de Proa', cunningham: 'Cunningham', outhaul: 'Outhaul', vang: 'Vang',
    mastPuller: 'Posição Proa/Popa do Mastro', traveler: 'Posição do Travessão',
    augieEq: 'Equalizador Augie/Duffy Dominator', augieEqualizer: 'Equal. Augie/Duffy',
    jibUsed: 'Vela de Proa', mainsailUsed: 'Vela Grande', mainsailMaker: 'Fabricante V. Grande', jibMaker: 'Fabricante V. Proa',
    fwdAftPuller: 'Empurrador do Mastro', travelerPosition: 'Traveler', mastWiggle: 'Folga do Ajustador de Ovéns',
    selectMakerFirst: 'Selecione o fabricante', selectModel: 'Selecione o modelo',
    language: 'Idioma', forgotPassword: 'Esqueceu a senha?', email: 'Email', password: 'Senha',
    createAccount: 'Criar Conta', dontHaveAccount: 'Não tem conta?',
    uploadPhoto: 'Enviar', addPhoto: '📤 Adicionar Foto ou Vídeo', tapToSelect: 'Toque para selecionar foto ou vídeo',
    phoneDesktop: 'Celular: câmera ou galeria • Desktop: explorar ou arrastar • Vídeos até 50MB',
    findPhotos: '🔍 Buscar Fotos ou Vídeos do seu Snipe na Web', myBoatGallery: '🖼️ Galeria do Meu Barco',
    sailNumBoatRegatta: 'Número da Vela, Nome do Barco ou Regata', search: '🔍 Buscar',
    calculate: '✨ Calcular Ajustes', sailMaker: 'Veleiro', snipeBuilder: 'Construtor de Snipe',
    combinedCrewWeight: 'Peso Combinado da Tripulação', lbs: 'lbs', kg: 'kg',
    windSpeedKnots: 'Velocidade do Vento (nós)', recommended: 'Ajustes Recomendados',
    inches: '"', cm: 'cm',
    forecast: 'Previsão', windForecast: 'Previsão do Vento (24h)', tideForecast: 'Maré / Corrente (24h)',
    enterLocation: 'CEP, cidade, ou cidade + país', loadForecast: 'Carregar Previsão', locating: 'Localizando...',
    useMyLocation: 'Usar Minha Localização', nearestWater: 'Água Navegável Mais Próxima',
    incoming: 'Enchente', outgoing: 'Vazante', noLocation: 'Ative localização ou digite uma localização.',
    forgotPw: 'Esqueceu a Senha', sendResetLink: 'Enviar Link', backToLogin: 'Voltar ao Login',
    resetLink: 'Link de Redefinição', resetPassword: 'Redefinir Senha', newPassword: 'Nova Senha',
    confirmNewPw: 'Confirmar Nova Senha', setNewPassword: 'Definir Nova Senha', atLeast6: 'Pelo menos 6 caracteres',
    invalidLink: 'Link Inválido', linkExpired: 'Link Expirado', requestNewLink: 'Solicitar Novo Link',
    pwUpdated: 'Senha atualizada com sucesso!', resetLinkInvalid: 'Este link é inválido ou expirou.',
    resetLinkSent: 'Se o email estiver registrado, um link de redefinição foi enviado.',
    usernameEmailPwReq: 'Usuário, email e senha são obrigatórios.',
    pwsDontMatch: 'As senhas não coincidem.', pwTooShort: 'A senha deve ter pelo menos 6 caracteres.',
    usernameTaken: 'Usuário ou email já em uso.', somethingWrong: 'Algo deu errado. Tente novamente.',
    invalidCredentials: 'Email ou senha inválidos.', enterRegEmail: 'Digite seu email registrado',
    alreadyHaveAccount: 'Já tem uma conta?',
    myProfile: 'Meu Perfil', updateSailorInfo: 'Atualize suas informações de velejador e barco',
    yourName: 'Seu Nome', sailboatName: 'Nome do Barco', snipeSailNum: 'Número da Vela Snipe',
    saveProfile: 'Salvar Perfil', username: 'Usuário',
    deletePhoto: 'Excluir esta foto?', noPhotosYet: 'Nenhuma foto ainda',
    searchOrUpload: 'Pesquise acima ou envie uma foto para iniciar sua galeria!',
    uploading: 'Enviando...', uploadFailed: 'Falha no envio. Tente novamente.',
    searchRules: 'Buscar regras...', ruleNotFound: 'Regra não encontrada',
    showingWorldSailing: 'Mostrando: World Sailing — Regras de Regata da Vela 2025-2028',
    showingUSSailing: 'Mostrando: US Sailing Prescrições às Regras de Regata',
    searchClassRules: 'Buscar regras da classe...',
    noUpcomingEvents: 'Nenhum evento próximo nesta categoria.',
    noRegattas: 'Você ainda não marcou nenhuma regata.',
    checkBoxInstruction: 'Marque a caixa para indicar as regatas que participará.',
    loginToTrack: 'Faça login para acompanhar suas regatas.',
    upcomingUS: 'evento(s) próximo(s) nos EUA', upcomingGlobal: 'evento(s) global(is) próximo(s)',
    deleteTaskConfirm: 'Excluir esta tarefa?', voiceNotSupported: 'Entrada por voz não suportada.',
    edit: 'Editar', delete: 'Excluir', deleteRaceConfirm: 'Excluir este registro?',
    saveDefault: 'Salvar como padrão', errorLoadingForecast: 'Erro ao carregar previsão.',
    errorLookingUp: 'Erro ao buscar localização.', yourLocation: 'Sua Localização',
    tasks: 'Tarefas', addHullNumber: 'Adicionar Número do Casco', enterHullNumber: 'Digite número do casco',
    addTask: 'Adicionar Tarefa', enterTask: 'Digite descrição da tarefa', assignToBoat: 'Atribuir ao barco',
    noTasks: 'Nenhuma tarefa. Adicione números de casco e tarefas acima.', deleteTask: 'Excluir',
    editTask: 'Editar', saveTask: 'Salvar', hullNumbers: 'Números do Casco', taskList: 'Lista de Tarefas',
    dateEntered: 'Data de Entrada', allBoats: 'Todos os Barcos',
    snipeTuningGuides: 'Guias de Ajuste Snipe',
    tuningGuideSubtitle: 'Configurações de referência dos principais fabricantes de velas da classe Snipe.',
    quantumGuideDesc: 'Guia completo com configuração de mastro, cruzetas, rake, tensão de estaiamento e ajuste de velas.',
    northGuideDesc: 'Guia completo sobre preparação do casco, ajuste do mastro, cruzetas, vela de proa, equilíbrio do leme e vento forte.',
    olimpicGuideDesc: 'Guia de ajuste série XP (XPM mestra e XPJ genoa) por Bruno Bethlem, Campeão Mundial Snipe 2009. Rake, tensão estais, cruzetas e controles.',
    viewFullGuide: 'Ver Guia Completo',
    rrsTitle: 'Regras de Regata à Vela (RRS)',
    rrsSearchDesc: 'Pesquise as regras de regata por palavra-chave ou voz.',
    ruleset: 'Regulamento', worldSailing: 'World Sailing', usSailingPrescriptions: 'Prescrições US Sailing',
    lookUpRule: 'Buscar Regra', enterRuleNumber: 'Digite o número da regra',
    searchRulesPlaceholder: 'Buscar regras... ex. bombordo estibordo, marca, protesto',
    voiceSearch: 'Busca por voz', voiceInput: 'Entrada por voz',
    part1FundamentalRules: 'Parte 1 — Regras Fundamentais',
    keyDefinitions: 'Definições-Chave',
    usPrescriptionsTitle: 'Prescrições US Sailing às RRS',
    rrsReference: 'Referência: World Sailing. Resumo para referência rápida. Consulte sempre as regras oficiais para o texto completo.',
    snipeClassRulesTitle: 'Regras de Classe Snipe (SCIRA)',
    snipeClassRulesDesc: 'Regras oficiais de classe da Associação Internacional de Regatas Snipe (SCIRA). O Snipe é um monotipo estrito — todos os barcos devem cumprir especificações idênticas.',
    searchClassRulesPlaceholder: 'Buscar regras de classe... ex. peso do casco, mastro, área de vela',
    classRulesReference: 'Referência: SCIRA. Resumo de referência. Consulte sempre o PDF oficial das regras de classe.',
    sailorNotFound: 'Velejador não encontrado', profileUpdated: 'Perfil atualizado!',
    raceDateNameReq: 'Data e nome da regata são obrigatórios.',
    memberSince: 'Membro desde', racesLogged: 'regatas registradas', noRacesLoggedYet: 'Nenhuma regata registrada',
    noRacesYet: 'Nenhuma regata ainda', goToLogin: 'Ir para Login',
    uploadPhotoDesc: 'Envie fotos e vídeos do seu Snipe. Apenas seus arquivos verificados são exibidos.',
    readyUpload: 'pronto — preencha os detalhes e clique em Enviar',
    searchingPhotos: 'Buscando fotos',
    searchMoreSources: 'Buscar mais fontes:',
    noDataForSetting: 'Sem dados para esta configuração. Registre regatas com este campo!',
    none: 'Nenhum', aLittle: 'Um pouco', moderate: 'Moderado', downrightSloppy: 'Completamente Frouxo!',
    compressedStrand: 'Fio Comprimido', standard: 'Padrão',
    allSeaStates: 'Todos os Estados do Mar', settingToGraph: 'Configuração para Grafar',
    graphDesc: 'Grafique qualquer configuração contra sua avaliação de desempenho em todas as regatas.',
    selectASetting: 'Selecionar Configuração', sails: 'Velas', rigSettings: 'Configurações do Mastro',
    jibSettings: 'Configurações da Vela de Proa', controls: 'Controles',
    staMasterWiggle: 'Folga do Ajustador (Ovém Sotavento)',
    racesLoggedStat: 'Regatas', venues: 'Locais', sailNumber: 'Número de Vela',
    bestRating: 'Melhor Avaliação',
    deletePhotoConfirm: 'Excluir esta foto?',
    rulesInEnglish: 'Regras oficiais em inglês. As traduções são apenas para referência.',
    egRaceName: 'ex. Série Noturna #5', egLocation: 'ex. Baía de Guanabara, RJ',
    egCrewName: 'ex. João Silva', egSailNum: 'ex. 31847', egBoatNum: 'ex. 31234',
    egUsername: 'ex. velejador42', egDisplayName: 'ex. João Silva', egBoatName: 'ex. Vento Livre',
    egJibLead: 'ex. Furo 3', egCunningham: 'ex. Leve, Médio, Máximo',
    egOuthaul: 'ex. Afrouxado, Tenso', egVang: 'ex. Leve, Moderado, Forte',
    egPuller: 'ex. Neutro, Frente 0.6 cm, Atrás 1.0 cm',
    egTraveler: 'ex. Centrado', egAugie: 'ex. Tenso, Afrouxado',
    egShroudTension: 'ex. 21 (Loos PT-1 Preto)', egStaMaster: 'ex. Base, +½ volta',
    egJibCloth: 'ex. Rugas leves, Liso, Tenso', egJibOutboard: 'ex. Interior, Médio, Exterior',
    upload: 'Enviar', caption: 'Legenda', egCaption: 'ex. Don Q 2025, No cais',
    noRegatChecked: 'Você não marcou regatas próximas! Marque as caixas dos eventos que planeja participar.',
    checkBoxToMark: 'Marque a caixa para indicar as regatas que você vai participar.',
    loginToTrackRegattas: 'Faça login para rastrear em quais regatas você vai participar.',
    select: 'Selecionar'
  }
};

function t(key, lang) { return (translations[lang] || translations.en)[key] || translations.en[key] || key; }
function getLang(req) { return (req.session && req.session.lang) || 'en'; }
function isMetric(lang) { return lang === 'es' || lang === 'it' || lang === 'pt'; }

// Convert inches string to cm (e.g. '16.5"' -> '41.9 cm')
function inToCm(val) {
  if (!val) return val;
  return val.replace(/(\d+\.?\d*)\s*["″]/g, (m, n) => (parseFloat(n) * 2.54).toFixed(1) + ' cm')
            .replace(/(\d+)'(\d+\.?\d*)["″]?/g, (m, ft, inch) => ((parseFloat(ft)*12 + parseFloat(inch)) * 2.54).toFixed(1) + ' cm');
}

const app = express();
const PORT = process.env.PORT || 3000;

// SQLite database - use volume mount if available, else local
const dbDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || __dirname;
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const mediaDir = path.join(dbDir, 'media');
if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });
const db = new Database(path.join(dbDir, "snipe.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- PWA MANIFEST & SERVICE WORKER ---
app.get("/manifest.json", (req, res) => {
  res.json({
    name: "Charlie's Snipeovation Snipe Sailboat Racing Genius Tool!",
    short_name: "Snipeovation",
    description: "Snipe sailboat racing logs, tuning, forecasts & more",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7fa",
    theme_color: "#0b3d6e",
    orientation: "any",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
    ],
    categories: ["sports", "lifestyle"],
    lang: "en"
  });
});

app.get("/sw.js", (req, res) => {
  res.type("application/javascript");
  res.send(`
    const CACHE_NAME = 'snipeovation-v1';
    const PRECACHE = ['/', '/logo.jpg', '/hero.jpg'];

    self.addEventListener('install', e => {
      e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
    });

    self.addEventListener('activate', e => {
      e.waitUntil(caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
      ).then(() => self.clients.claim()));
    });

    self.addEventListener('fetch', e => {
      if (e.request.method !== 'GET') return;
      e.respondWith(
        fetch(e.request).then(resp => {
          if (resp.ok) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return resp;
        }).catch(() => caches.match(e.request))
      );
    });
  `);
});

// Generate PWA icons dynamically from logo
let iconCache192 = null, iconCache512 = null;

app.get("/icon-192.png", (req, res) => {
  if (iconCache192) { res.type('png'); return res.send(iconCache192); }
  // Serve logo.jpg as the icon (browsers handle the format)
  const logoPath = path.join(__dirname, 'public', 'logo.jpg');
  if (fs.existsSync(logoPath)) {
    const data = fs.readFileSync(logoPath);
    iconCache192 = data;
    res.type('image/jpeg');
    res.send(data);
  } else {
    res.status(404).end();
  }
});

app.get("/icon-512.png", (req, res) => {
  if (iconCache512) { res.type('png'); return res.send(iconCache512); }
  const logoPath = path.join(__dirname, 'public', 'logo.jpg');
  if (fs.existsSync(logoPath)) {
    const data = fs.readFileSync(logoPath);
    iconCache512 = data;
    res.type('image/jpeg');
    res.send(data);
  } else {
    res.status(404).end();
  }
});

// Simple session store backed by SQLite
class SQLiteSessionStore extends session.Store {
  constructor() {
    super();
    db.exec(`CREATE TABLE IF NOT EXISTS sessions (sid TEXT PRIMARY KEY, sess TEXT NOT NULL, expire INTEGER NOT NULL)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire)`);
  }
  get(sid, cb) {
    const row = db.prepare("SELECT sess FROM sessions WHERE sid = ? AND expire > ?").get(sid, Date.now());
    cb(null, row ? JSON.parse(row.sess) : null);
  }
  set(sid, sess, cb) {
    const expire = sess.cookie?.expires ? new Date(sess.cookie.expires).getTime() : Date.now() + 86400000;
    db.prepare("INSERT OR REPLACE INTO sessions (sid, sess, expire) VALUES (?, ?, ?)").run(sid, JSON.stringify(sess), expire);
    cb(null);
  }
  destroy(sid, cb) {
    db.prepare("DELETE FROM sessions WHERE sid = ?").run(sid);
    cb(null);
  }
}

app.use(
  session({
    store: new SQLiteSessionStore(),
    secret: process.env.SESSION_SECRET || "snipe-sailing-secret-key-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    boat_name TEXT,
    snipe_number TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS race_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    race_date TEXT NOT NULL,
    race_name TEXT NOT NULL,
    location TEXT,
    wind_speed TEXT,
    wind_direction TEXT,
    sea_state TEXT,
    temperature TEXT,
    current_tide TEXT,
    finish_position TEXT,
    fleet_size TEXT,
    performance_rating TEXT,
    boat_number TEXT,
    crew_name TEXT,
    skipper_weight TEXT,
    crew_weight TEXT,
    jib_used TEXT,
    mainsail_used TEXT,
    mast_rake TEXT,
    shroud_tension TEXT,
    shroud_turns TEXT,
    jib_lead TEXT,
    jib_cloth_tension TEXT,
    jib_height TEXT,
    jib_outboard_lead TEXT,
    cunningham TEXT,
    outhaul TEXT,
    vang TEXT,
    spreader_length TEXT,
    spreader_sweep TEXT,
    centerboard_position TEXT,
    traveler_position TEXT,
    augie_equalizer TEXT,
    sail_settings_notes TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Boat photos storage
db.exec(`CREATE TABLE IF NOT EXISTS boat_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  sail_number TEXT,
  caption TEXT,
  photo_data TEXT NOT NULL,
  content_type TEXT DEFAULT 'image/jpeg',
  created_at TEXT DEFAULT (datetime('now'))
)`);

// Regatta attendance tracking
db.exec(`CREATE TABLE IF NOT EXISTS regatta_attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  event_key TEXT NOT NULL,
  event_date TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_location TEXT,
  event_region TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, event_key)
)`);

// Saved hull numbers (persist independently of tasks)
db.exec(`CREATE TABLE IF NOT EXISTS user_hull_numbers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  hull_number TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, hull_number)
)`);

// Password reset tokens
db.exec(`CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
)`);

// Boat tasks
db.exec(`CREATE TABLE IF NOT EXISTS boat_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  hull_number TEXT NOT NULL,
  task_description TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
)`);

// Add new columns to existing databases (safe to run repeatedly - SQLite ignores if column exists)
try { db.exec("ALTER TABLE users ADD COLUMN wire_size_default TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'en'"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN skipper_weight TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN crew_weight TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN shroud_turns TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN wire_size TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN jib_used TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN mainsail_used TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN jib_cloth_tension TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN jib_height TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN jib_outboard_lead TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN performance_rating TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN spreader_length TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN spreader_sweep TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN traveler_position TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN augie_equalizer TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN main_maker TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN jib_maker TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN main_condition TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN jib_condition TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN mast_wiggle TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE race_logs ADD COLUMN water_type TEXT"); } catch(e) {}

// Migrate existing base64 videos from SQLite to filesystem
try {
  const vids = db.prepare("SELECT id, photo_data, content_type FROM boat_photos WHERE content_type LIKE 'video/%' AND (file_path IS NULL OR file_path = '') AND photo_data != '' AND length(photo_data) > 0").all();
  if (vids.length > 0) {
    console.log("Migrating " + vids.length + " video(s) from SQLite to filesystem...");
    for (const v of vids) {
      try {
        const ext = v.content_type === 'video/quicktime' ? '.mov' : v.content_type === 'video/webm' ? '.webm' : '.mp4';
        const fileName = 'vid_migrated_' + v.id + '_' + Date.now() + ext;
        const filePath = path.join(mediaDir, fileName);
        const buf = Buffer.from(v.photo_data, 'base64');
        fs.writeFileSync(filePath, buf);
        db.prepare("UPDATE boat_photos SET file_path = ?, photo_data = '' WHERE id = ?").run(filePath, v.id);
        console.log("  Migrated video id=" + v.id + " (" + (buf.length / 1048576).toFixed(1) + " MB) -> " + fileName);
      } catch(e) { console.error("  Failed to migrate video id=" + v.id + ":", e.message); }
    }
    console.log("Video migration complete.");
  }
} catch(e) {}

console.log("Database initialized successfully");

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  // Ensure language is loaded from DB if not in session
  if (!req.session.lang && req.session.user) {
    const u = db.prepare("SELECT language FROM users WHERE id = ?").get(req.session.user.id);
    if (u && u.language) req.session.lang = u.language;
  }
  next();
}

// Language-aware page helper: wraps any HTML content with translated section headers
function tPage(html, lang) {
  if (!lang || lang === 'en') return html;
  // Replace common English section/page headers with translations
  const replacements = {
    es: {
      'Race Feed': 'Carreras', 'My Race Log': 'Mi Registro de Regatas', 'Log a Race': 'Registrar Regata',
      'Edit Race Log': 'Editar Registro', 'Performance Metrics': 'Métricas de Rendimiento',
      'Snipe Tuning Calculator': 'Calculador de Ajustes Snipe', 'This feature learns over time': 'Esta función aprende con el tiempo',
      'Tuning Guides': 'Guías de Ajuste', 'Racing Rules of Sailing': 'Reglas de Regata de Vela',
      'Snipe Class Rules': 'Reglas de Clase Snipe', 'Regattas & Events': 'Regatas y Eventos',
      'Pictures of My Boat': 'Fotos de Mi Barco', 'Profile': 'Perfil',
      'Recommended Settings': 'Ajustes Recomendados', 'Adjustment Notes': 'Notas de Ajuste',
      'Corrective Action': 'Acción Correctiva', 'Conditions Changed on the Water': 'Condiciones Cambiaron en el Agua',
      'Show Corrective Actions': 'Mostrar Acciones Correctivas',
      'Calculate Settings': 'Calcular Ajustes', 'Sail Maker': 'Velería', 'Snipe Builder': 'Constructor',
      'Combined Crew Weight': 'Peso Combinado', 'Wind Speed': 'Velocidad del Viento', 'Sea State': 'Estado del Mar',
      'Flat': 'Plano', 'Choppy': 'Picado', 'Large Waves': 'Olas Grandes',
      'Light Air': 'Viento Ligero', 'Medium Air': 'Viento Medio', 'Heavy Air': 'Viento Fuerte',
      'Mast Rake': 'Caída del Mástil', 'Shroud Tension': 'Tensión de Obenques',
      'Sta-Master Turns': 'Vueltas Sta-Master', 'Wire Size': 'Tamaño de Cable',
      'Spreader Length': 'Largo de Cruceta', 'Spreader Sweep': 'Ángulo de Cruceta',
      'Jib Lead': 'Guía del Foque', 'Jib Cloth Tension': 'Tensión de Tela del Foque',
      'Jib Height': 'Altura del Foque', 'Jib Outboard Lead': 'Guía Exterior del Foque',
      'Cunningham': 'Cunningham', 'Outhaul': 'Outhaul', 'Vang': 'Vang',
      'Mast Fwd/Aft Puller': 'Posición Proa/Popa del Mástil',
      'Traveler Position': 'Posición del Travesaño', 'Augie Equalizer': 'Ecualizador Augie',
      'Upload a Photo': 'Subir una Foto', 'Add a Photo': 'Agregar Foto',
      'Find Photos': 'Buscar Fotos', 'My Boat Gallery': 'Galería de Mi Barco',
      'Search': 'Buscar', 'Upload': 'Subir', 'Delete': 'Eliminar',
      'Upcoming': 'Próximas', 'US Regattas': 'Regatas EEUU', 'Global Regattas': 'Regatas Globales',
      'My Regattas': 'Mis Regatas', 'days away': 'días', 'days': 'días',
      'Today!': '¡Hoy!', 'Tomorrow': 'Mañana', 'Attend?': '¿Asistir?', 'Attending': 'Asistiendo',
      'Tap to add': 'Toque para agregar', 'Tap to select a photo': 'Toque para seleccionar una foto',
      'World Sailing': 'World Sailing', 'US Sailing': 'US Sailing',
      'Section': 'Sección', 'Part': 'Parte', 'Rule': 'Regla', 'General': 'General',
      'Hull Specifications': 'Especificaciones del Casco', 'Rig': 'Aparejo', 'Sail': 'Vela',
      'Crew': 'Tripulación', 'Equipment': 'Equipo', 'Racing': 'Competición',
      'Boat Settings': 'Ajustes del Barco', 'Event': 'Evento', 'Conditions': 'Condiciones', 'Notes': 'Notas',
      'Save Race Log': 'Guardar Registro', 'Update Race Log': 'Actualizar Registro', 'Cancel': 'Cancelar',
      'Edit': 'Editar', 'Showing': 'Mostrando', 'upcoming': 'próximas', 'event': 'evento',
      'No races logged yet': 'No hay regatas registradas', 'Profile updated': 'Perfil actualizado',
      'Forgot password': 'Olvidó su contraseña', 'Region': 'Región', 'View': 'Ver',
      'lbs': 'lbs', 'knots': 'nudos'
    },
    it: {
      'Race Feed': 'Regate', 'My Race Log': 'Il Mio Log', 'Log a Race': 'Registra Regata',
      'Edit Race Log': 'Modifica Log', 'Performance Metrics': 'Metriche di Prestazione',
      'Snipe Tuning Calculator': 'Calcolatore Regolazioni Snipe', 'This feature learns over time': 'Questa funzione impara nel tempo',
      'Tuning Guides': 'Guide di Regolazione', 'Racing Rules of Sailing': 'Regole di Regata della Vela',
      'Snipe Class Rules': 'Regole di Classe Snipe', 'Regattas & Events': 'Regate ed Eventi',
      'Pictures of My Boat': 'Foto della Mia Barca', 'Profile': 'Profilo',
      'Recommended Settings': 'Regolazioni Raccomandate', 'Adjustment Notes': 'Note di Regolazione',
      'Calculate Settings': 'Calcola Regolazioni', 'Sail Maker': 'Veleria', 'Snipe Builder': 'Costruttore',
      'Combined Crew Weight': 'Peso Combinato', 'Wind Speed': 'Velocità del Vento', 'Sea State': 'Stato del Mare',
      'Flat': 'Piatto', 'Choppy': 'Mosso', 'Large Waves': 'Onde Grandi',
      'Light Air': 'Vento Leggero', 'Medium Air': 'Vento Medio', 'Heavy Air': 'Vento Forte',
      'Mast Rake': 'Inclinazione Albero', 'Shroud Tension': 'Tensione Sartie',
      'Sta-Master Turns': 'Giri Sta-Master', 'Wire Size': 'Diametro Cavo',
      'Spreader Length': 'Lunghezza Crocette', 'Spreader Sweep': 'Angolo Crocette',
      'Jib Lead': 'Guida Fiocco', 'Jib Cloth Tension': 'Tensione Tela Fiocco',
      'Jib Height': 'Altezza Fiocco', 'Jib Outboard Lead': 'Guida Esterna Fiocco',
      'Cunningham': 'Cunningham', 'Outhaul': 'Outhaul', 'Vang': 'Vang',
      'Mast Fwd/Aft Puller': 'Posizione Prua/Poppa Albero',
      'Traveler Position': 'Posizione Carrello', 'Augie Equalizer': 'Equalizzatore Augie',
      'Upload a Photo': 'Carica una Foto', 'Add a Photo': 'Aggiungi Foto',
      'Find Photos': 'Cerca Foto', 'My Boat Gallery': 'Galleria della Mia Barca',
      'Search': 'Cerca', 'Upload': 'Carica', 'Delete': 'Elimina',
      'Upcoming': 'Prossime', 'US Regattas': 'Regate USA', 'Global Regattas': 'Regate Globali',
      'My Regattas': 'Le Mie Regate', 'days away': 'giorni', 'days': 'giorni',
      'Today!': 'Oggi!', 'Tomorrow': 'Domani', 'Attend?': 'Partecipare?', 'Attending': 'Partecipando',
      'Tap to add': 'Tocca per aggiungere', 'Tap to select a photo': 'Tocca per selezionare una foto',
      'Section': 'Sezione', 'Part': 'Parte', 'Rule': 'Regola', 'General': 'Generale',
      'Hull Specifications': 'Specifiche dello Scafo', 'Rig': 'Attrezzatura', 'Sail': 'Vela',
      'Crew': 'Equipaggio', 'Equipment': 'Attrezzatura', 'Racing': 'Competizione',
      'Boat Settings': 'Regolazioni Barca', 'Event': 'Evento', 'Conditions': 'Condizioni', 'Notes': 'Note',
      'Save Race Log': 'Salva Log', 'Update Race Log': 'Aggiorna Log', 'Cancel': 'Annulla',
      'Edit': 'Modifica', 'Showing': 'Mostrando', 'upcoming': 'prossime', 'event': 'evento',
      'No races logged yet': 'Nessuna regata registrata', 'Profile updated': 'Profilo aggiornato',
      'Forgot password': 'Password dimenticata', 'Region': 'Regione', 'View': 'Vista',
      'lbs': 'lbs', 'knots': 'nodi'
    },
    pt: {
      'Race Feed': 'Regatas', 'My Race Log': 'Meu Registro', 'Log a Race': 'Registrar Regata',
      'Edit Race Log': 'Editar Registro', 'Performance Metrics': 'Métricas de Desempenho',
      'Snipe Tuning Calculator': 'Calculador de Ajustes Snipe', 'This feature learns over time': 'Esta função aprende com o tempo',
      'Tuning Guides': 'Guias de Ajuste', 'Racing Rules of Sailing': 'Regras de Regata da Vela',
      'Snipe Class Rules': 'Regras da Classe Snipe', 'Regattas & Events': 'Regatas e Eventos',
      'Pictures of My Boat': 'Fotos do Meu Barco', 'Profile': 'Perfil',
      'Recommended Settings': 'Ajustes Recomendados', 'Adjustment Notes': 'Notas de Ajuste',
      'Calculate Settings': 'Calcular Ajustes', 'Sail Maker': 'Veleiro', 'Snipe Builder': 'Construtor',
      'Combined Crew Weight': 'Peso Combinado', 'Wind Speed': 'Velocidade do Vento', 'Sea State': 'Estado do Mar',
      'Flat': 'Calmo', 'Choppy': 'Agitado', 'Large Waves': 'Ondas Grandes',
      'Light Air': 'Vento Fraco', 'Medium Air': 'Vento Médio', 'Heavy Air': 'Vento Forte',
      'Mast Rake': 'Inclinação do Mastro', 'Shroud Tension': 'Tensão dos Ovéns',
      'Sta-Master Turns': 'Voltas Sta-Master', 'Wire Size': 'Diâmetro do Cabo',
      'Spreader Length': 'Comprimento da Cruzeta', 'Spreader Sweep': 'Ângulo da Cruzeta',
      'Jib Lead': 'Guia da Vela de Proa', 'Jib Cloth Tension': 'Tensão do Pano',
      'Jib Height': 'Altura da Vela de Proa', 'Jib Outboard Lead': 'Guia Externa',
      'Cunningham': 'Cunningham', 'Outhaul': 'Outhaul', 'Vang': 'Vang',
      'Mast Fwd/Aft Puller': 'Posição Proa/Popa do Mastro',
      'Traveler Position': 'Posição do Travessão', 'Augie Equalizer': 'Equalizador Augie',
      'Upload a Photo': 'Enviar uma Foto', 'Add a Photo': 'Adicionar Foto',
      'Find Photos': 'Buscar Fotos', 'My Boat Gallery': 'Galeria do Meu Barco',
      'Search': 'Buscar', 'Upload': 'Enviar', 'Delete': 'Excluir',
      'Upcoming': 'Próximas', 'US Regattas': 'Regatas EUA', 'Global Regattas': 'Regatas Globais',
      'My Regattas': 'Minhas Regatas', 'days away': 'dias', 'days': 'dias',
      'Today!': 'Hoje!', 'Tomorrow': 'Amanhã', 'Attend?': 'Participar?', 'Attending': 'Participando',
      'Tap to add': 'Toque para adicionar', 'Tap to select a photo': 'Toque para selecionar uma foto',
      'Section': 'Seção', 'Part': 'Parte', 'Rule': 'Regra', 'General': 'Geral',
      'Hull Specifications': 'Especificações do Casco', 'Rig': 'Mastreação', 'Sail': 'Vela',
      'Crew': 'Tripulação', 'Equipment': 'Equipamento', 'Racing': 'Competição',
      'Boat Settings': 'Ajustes do Barco', 'Event': 'Evento', 'Conditions': 'Condições', 'Notes': 'Notas',
      'Save Race Log': 'Salvar Registro', 'Update Race Log': 'Atualizar Registro', 'Cancel': 'Cancelar',
      'Edit': 'Editar', 'Showing': 'Mostrando', 'upcoming': 'próximas', 'event': 'evento',
      'No races logged yet': 'Nenhuma regata registrada', 'Profile updated': 'Perfil atualizado',
      'Forgot password': 'Esqueceu a senha', 'Region': 'Região', 'View': 'Ver',
      'lbs': 'lbs', 'knots': 'nós'
    }
  };
  const dict = replacements[lang];
  if (!dict) return html;
  // Sort keys longest-first to avoid partial replacements
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length);

  // Only translate visible text content — NOT inside HTML tags, attributes, or scripts
  // Split HTML into segments: script blocks first (greedy match), then tags (skip), and text content (translate)
  const parts = html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>)/gi);
  for (let i = 0; i < parts.length; i++) {
    // Skip HTML tags and script blocks
    if (parts[i].startsWith('<')) continue;
    // Only translate text segments
    let text = parts[i];
    for (const key of keys) {
      text = text.split(key).join(dict[key]);
    }
    parts[i] = text;
  }
  return parts.join('');
}

// --- PAGE ROUTES ---

app.get("/", (req, res) => {
  const logs = db.prepare(`SELECT r.*, u.username FROM race_logs r JOIN users u ON r.user_id = u.id ORDER BY r.race_date DESC, r.created_at DESC LIMIT 50`).all();
  const lang = getLang(req);
  res.send(renderPage(homePage(logs, req.session.user, lang), req.session.user, lang, true));
});

app.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");
  res.send(renderPage(loginPage(), null));
});

app.get("/register", (req, res) => {
  if (req.session.user) return res.redirect("/dashboard");
  res.send(renderPage(registerPage(), null));
});

app.get("/dashboard", requireAuth, (req, res) => {
  const logs = db.prepare("SELECT * FROM race_logs WHERE user_id = ? ORDER BY race_date DESC").all(req.session.user.id);
  const lang = getLang(req);
  res.send(renderPage(dashboardPage(logs, req.session.user, lang), req.session.user, lang));
});

app.get("/log", requireAuth, (req, res) => {
  const userRow = db.prepare("SELECT wire_size_default FROM users WHERE id = ?").get(req.session.user.id);
  const lang = getLang(req);
  res.send(renderPage(logFormPage(null, null, userRow && userRow.wire_size_default, lang), req.session.user, lang));
});

app.get("/edit/:id", requireAuth, (req, res) => {
  const log = db.prepare("SELECT * FROM race_logs WHERE id = ? AND user_id = ?").get(req.params.id, req.session.user.id);
  if (!log) return res.redirect("/dashboard");
  const userRow2 = db.prepare("SELECT wire_size_default FROM users WHERE id = ?").get(req.session.user.id);
  const lang = getLang(req);
  res.send(renderPage(logFormPage(log, null, userRow2 && userRow2.wire_size_default, lang), req.session.user, lang));
});

app.get("/sailor/:username", (req, res) => {
  const sailor = db.prepare("SELECT id, username, display_name, boat_name, snipe_number, created_at FROM users WHERE LOWER(username) = LOWER(?)").get(req.params.username);
  if (!sailor) return res.status(404).send(renderPage("<div class='container'><h2>Sailor not found</h2></div>", req.session.user, getLang(req)));
  const logs = db.prepare("SELECT * FROM race_logs WHERE user_id = ? ORDER BY race_date DESC").all(sailor.id);
  const lang = getLang(req);
  res.send(renderPage(sailorPage(sailor, logs, lang), req.session.user, lang));
});

// --- AUTH ROUTES ---

app.post("/register", async (req, res) => {
  const { username, email, password, confirm_password, display_name, boat_name, snipe_number, language } = req.body;
  const lang = ['en','es','it','pt'].includes(language) ? language : 'en';
  if (!username || !email || !password) return res.send(renderPage(registerPage(t('usernameEmailPwReq', lang)), null, lang));
  if (password !== confirm_password) return res.send(renderPage(registerPage(t('pwsDontMatch', lang)), null, lang));
  if (password.length < 6) return res.send(renderPage(registerPage(t('pwTooShort', lang)), null, lang));

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = db.prepare(
      "INSERT INTO users (username, email, password_hash, display_name, boat_name, snipe_number, language) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(username.trim().toLowerCase(), email.trim().toLowerCase(), hash, display_name?.trim() || null, boat_name?.trim() || null, snipe_number?.trim() || null, lang);
    req.session.lang = lang;
    req.session.user = { id: result.lastInsertRowid, username: username.trim().toLowerCase(), email: email.trim().toLowerCase(), display_name: display_name?.trim() || null, boat_name: boat_name?.trim() || null, snipe_number: snipe_number?.trim() || null };
    res.redirect("/dashboard");
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.send(renderPage(registerPage(t('usernameTaken', lang)), null, lang));
    }
    return res.send(renderPage(registerPage(t('somethingWrong', lang)), null, lang));
  }
});

app.post("/login", async (req, res) => {
  const { email, password, language } = req.body;
  const lang = ['en','es','it','pt'].includes(language) ? language : 'en';
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase());
  if (!user) return res.send(renderPage(loginPage(t('invalidCredentials', lang)), null, lang));

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.send(renderPage(loginPage(t('invalidCredentials', lang)), null, lang));

  // Save language preference
  db.prepare("UPDATE users SET language = ? WHERE id = ?").run(lang, user.id);
  req.session.lang = lang;
  req.session.user = { id: user.id, username: user.username, email: user.email, display_name: user.display_name, boat_name: user.boat_name, snipe_number: user.snipe_number };
  res.redirect("/dashboard");
});

// --- FORGOT PASSWORD ---
app.get("/forgot-password", (req, res) => {
  const lang = getLang(req);
  res.send(renderPage(`<div class="container">
    <h2>${t('forgotPw', lang)}</h2>
    <div class="form-card">
      <p style="color:#555;margin-bottom:16px;">${t('enterRegEmail', lang)}</p>
      <form method="POST" action="/forgot-password">
        <div class="form-group">
          <label>${t('email', lang)}</label>
          <input type="email" name="email" required autofocus placeholder="${t('enterRegEmail', lang)}">
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;">${t('sendResetLink', lang)}</button>
      </form>
      <div class="form-footer"><a href="/login">${t('backToLogin', lang)}</a></div>
    </div>
  </div>`, null, lang));
});

app.post("/forgot-password", (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const lang = getLang(req);
  const user = db.prepare("SELECT id, email, display_name FROM users WHERE email = ?").get(email);

  if (!user) {
    return res.send(renderPage(`<div class="container">
      <h2>${t('resetLink', lang)}</h2>
      <div class="form-card" style="text-align:center;padding:32px;">
        <div style="font-size:2.5rem;margin-bottom:12px;">📧</div>
        <p style="color:#555;">${t('resetLinkSent', lang)}</p>
        <div class="form-footer"><a href="/login">${t('backToLogin', lang)}</a></div>
      </div>
    </div>`, null, lang));
  }

  // Generate token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  // Invalidate any previous tokens for this user
  db.prepare("UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0").run(user.id);

  // Store new token
  db.prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)").run(user.id, token, expiresAt);

  const resetUrl = (req.headers.host ? (req.protocol + '://' + req.headers.host) : '') + '/reset-password?token=' + token;

  res.send(renderPage(`<div class="container">
    <h2>${t('resetPassword', lang)}</h2>
    <div class="form-card" style="padding:28px;">
      <div style="text-align:center;margin-bottom:16px;">
        <div style="font-size:2.5rem;margin-bottom:8px;">🔑</div>
        <p style="color:#2e7d32;font-weight:600;">${t('resetLinkSent', lang)}</p>
      </div>
      <div style="background:#f0f7ff;border:2px solid #c5ddf5;border-radius:8px;padding:14px;margin-bottom:16px;word-break:break-all;">
        <a href="${escapeHtml(resetUrl)}" style="color:#0b3d6e;font-weight:600;font-size:0.95rem;">${escapeHtml(resetUrl)}</a>
      </div>
      <a href="${escapeHtml(resetUrl)}" class="btn btn-primary" style="display:block;text-align:center;width:100%;">${t('resetPassword', lang)}</a>
      <div class="form-footer" style="margin-top:16px;"><a href="/login">${t('backToLogin', lang)}</a></div>
    </div>
  </div>`, null));
});

app.get("/reset-password", (req, res) => {
  const token = req.query.token;
  const lang = getLang(req);
  if (!token) return res.redirect("/forgot-password");

  const reset = db.prepare("SELECT * FROM password_resets WHERE token = ? AND used = 0").get(token);
  if (!reset) {
    return res.send(renderPage(`<div class="container">
      <h2>${t('invalidLink', lang)}</h2>
      <div class="form-card" style="text-align:center;padding:32px;">
        <div style="font-size:2.5rem;margin-bottom:12px;">⚠️</div>
        <p style="color:#e53e3e;font-weight:600;">${t('resetLinkInvalid', lang)}</p>
        <div style="margin-top:16px;"><a href="/forgot-password" class="btn btn-primary">${t('requestNewLink', lang)}</a></div>
      </div>
    </div>`, null, lang));
  }

  if (new Date(reset.expires_at) < new Date()) {
    db.prepare("UPDATE password_resets SET used = 1 WHERE id = ?").run(reset.id);
    return res.send(renderPage(`<div class="container">
      <h2>${t('linkExpired', lang)}</h2>
      <div class="form-card" style="text-align:center;padding:32px;">
        <div style="font-size:2.5rem;margin-bottom:12px;">⏰</div>
        <p style="color:#e53e3e;font-weight:600;">${t('resetLinkInvalid', lang)}</p>
        <div style="margin-top:16px;"><a href="/forgot-password" class="btn btn-primary">${t('requestNewLink', lang)}</a></div>
      </div>
    </div>`, null, lang));
  }

  res.send(renderPage(`<div class="container">
    <h2>${t('resetPassword', lang)}</h2>
    <div class="form-card">
      <form method="POST" action="/reset-password">
        <input type="hidden" name="token" value="${escapeHtml(token)}">
        <div class="form-group">
          <label>${t('newPassword', lang)}</label>
          <input type="password" name="password" required minlength="6" placeholder="${t('atLeast6', lang)}">
        </div>
        <div class="form-group">
          <label>${t('confirmNewPw', lang)}</label>
          <input type="password" name="confirm_password" required minlength="6">
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;">${t('setNewPassword', lang)}</button>
      </form>
    </div>
  </div>`, null, lang));
});

app.post("/reset-password", async (req, res) => {
  const { token, password, confirm_password } = req.body;
  const lang = getLang(req);

  if (!token) return res.redirect("/forgot-password");
  if (!password || password.length < 6) {
    return res.send(renderPage(`<div class="container"><h2>${t('resetPassword', lang)}</h2><div class="alert alert-error">${t('pwTooShort', lang)}</div><div class="form-footer"><a href="/forgot-password">${t('backToLogin', lang)}</a></div></div>`, null, lang));
  }
  if (password !== confirm_password) {
    return res.send(renderPage(`<div class="container"><h2>${t('resetPassword', lang)}</h2><div class="alert alert-error">${t('pwsDontMatch', lang)}</div><div class="form-footer"><a href="/forgot-password">${t('backToLogin', lang)}</a></div></div>`, null, lang));
  }

  const reset = db.prepare("SELECT * FROM password_resets WHERE token = ? AND used = 0").get(token);
  if (!reset || new Date(reset.expires_at) < new Date()) {
    return res.send(renderPage(`<div class="container"><h2>${t('invalidLink', lang)}</h2><div class="form-card" style="text-align:center;padding:32px;"><div style="font-size:2.5rem;margin-bottom:12px;">⚠️</div><p style="color:#e53e3e;">${t('resetLinkInvalid', lang)}</p><div style="margin-top:16px;"><a href="/forgot-password" class="btn btn-primary">${t('requestNewLink', lang)}</a></div></div></div>`, null, lang));
  }

  // Update password
  const hash = await bcrypt.hash(password, 10);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, reset.user_id);

  // Mark token as used
  db.prepare("UPDATE password_resets SET used = 1 WHERE id = ?").run(reset.id);

  res.send(renderPage(`<div class="container">
    <h2>${t('resetPassword', lang)}</h2>
    <div class="form-card" style="text-align:center;padding:32px;">
      <div style="font-size:2.5rem;margin-bottom:12px;">✅</div>
      <h3 style="color:#2e7d32;margin-bottom:8px;">${t('pwUpdated', lang)}</h3>
      <div style="margin-top:16px;"><a href="/login" class="btn btn-primary">Go to Login</a></div>
    </div>
  </div>`, null));
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

app.get("/profile", requireAuth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.session.user.id);
  res.send(renderPage(profilePage(user), req.session.user, getLang(req)));
});

app.post("/profile", requireAuth, (req, res) => {
  const { display_name, boat_name, snipe_number } = req.body;
  db.prepare("UPDATE users SET display_name=?, boat_name=?, snipe_number=? WHERE id=?").run(display_name?.trim() || null, boat_name?.trim() || null, snipe_number?.trim() || null, req.session.user.id);
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.session.user.id);
  req.session.user = { id: user.id, username: user.username, email: user.email, display_name: user.display_name, boat_name: user.boat_name, snipe_number: user.snipe_number };
  res.send(renderPage(profilePage(user, "Profile updated!"), req.session.user, getLang(req)));
});

// --- RACE LOG ROUTES ---

app.post("/log", requireAuth, (req, res) => {
  const { race_date, race_name, location, wind_speed, wind_direction, sea_state, temperature, current_tide, finish_position, fleet_size, performance_rating, boat_number, crew_name, skipper_weight, crew_weight, main_maker, jib_maker, jib_used, mainsail_used, main_condition, jib_condition, mast_rake, shroud_tension, shroud_turns, wire_size, wire_size_save_default, jib_lead, jib_cloth_tension, jib_height, jib_outboard_lead, cunningham, outhaul, vang, spreader_length, spreader_sweep, centerboard_position, traveler_position, augie_equalizer, mast_wiggle, water_type, sail_settings_notes, notes } = req.body;
  if (!race_date || !race_name) return res.send(renderPage(logFormPage(req.body, "Race date and name are required.", null, getLang(req)), req.session.user, getLang(req)));

  // Save wire size as user default if checkbox checked
  if (wire_size_save_default && wire_size) {
    db.prepare("UPDATE users SET wire_size_default = ? WHERE id = ?").run(wire_size, req.session.user.id);
  }

  db.prepare(
    `INSERT INTO race_logs (user_id, race_date, race_name, location, wind_speed, wind_direction, sea_state, temperature, current_tide, finish_position, fleet_size, performance_rating, boat_number, crew_name, skipper_weight, crew_weight, main_maker, jib_maker, jib_used, mainsail_used, main_condition, jib_condition, mast_rake, shroud_tension, shroud_turns, wire_size, jib_lead, jib_cloth_tension, jib_height, jib_outboard_lead, cunningham, outhaul, vang, spreader_length, spreader_sweep, centerboard_position, traveler_position, augie_equalizer, mast_wiggle, water_type, sail_settings_notes, notes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(req.session.user.id, race_date, race_name, location, wind_speed, wind_direction, sea_state, temperature, current_tide, finish_position, fleet_size, performance_rating, boat_number, crew_name, skipper_weight, crew_weight, main_maker, jib_maker, jib_used, mainsail_used, main_condition, jib_condition, mast_rake, shroud_tension, shroud_turns, wire_size, jib_lead, jib_cloth_tension, jib_height, jib_outboard_lead, cunningham, outhaul, vang, spreader_length, spreader_sweep, centerboard_position, traveler_position, augie_equalizer, mast_wiggle, water_type, sail_settings_notes, notes);
  res.redirect("/dashboard");
});

app.post("/edit/:id", requireAuth, (req, res) => {
  const { race_date, race_name, location, wind_speed, wind_direction, sea_state, temperature, current_tide, finish_position, fleet_size, performance_rating, boat_number, crew_name, skipper_weight, crew_weight, main_maker, jib_maker, jib_used, mainsail_used, main_condition, jib_condition, mast_rake, shroud_tension, shroud_turns, wire_size, wire_size_save_default, jib_lead, jib_cloth_tension, jib_height, jib_outboard_lead, cunningham, outhaul, vang, spreader_length, spreader_sweep, centerboard_position, traveler_position, augie_equalizer, mast_wiggle, water_type, sail_settings_notes, notes } = req.body;
  if (wire_size_save_default && wire_size) {
    db.prepare("UPDATE users SET wire_size_default = ? WHERE id = ?").run(wire_size, req.session.user.id);
  }
  db.prepare(
    `UPDATE race_logs SET race_date=?, race_name=?, location=?, wind_speed=?, wind_direction=?, sea_state=?, temperature=?, current_tide=?, finish_position=?, fleet_size=?, performance_rating=?, boat_number=?, crew_name=?, skipper_weight=?, crew_weight=?, main_maker=?, jib_maker=?, jib_used=?, mainsail_used=?, main_condition=?, jib_condition=?, mast_rake=?, shroud_tension=?, shroud_turns=?, wire_size=?, jib_lead=?, jib_cloth_tension=?, jib_height=?, jib_outboard_lead=?, cunningham=?, outhaul=?, vang=?, spreader_length=?, spreader_sweep=?, centerboard_position=?, traveler_position=?, augie_equalizer=?, mast_wiggle=?, water_type=?, sail_settings_notes=?, notes=?
     WHERE id=? AND user_id=?`
  ).run(race_date, race_name, location, wind_speed, wind_direction, sea_state, temperature, current_tide, finish_position, fleet_size, performance_rating, boat_number, crew_name, skipper_weight, crew_weight, main_maker, jib_maker, jib_used, mainsail_used, main_condition, jib_condition, mast_rake, shroud_tension, shroud_turns, wire_size, jib_lead, jib_cloth_tension, jib_height, jib_outboard_lead, cunningham, outhaul, vang, spreader_length, spreader_sweep, centerboard_position, traveler_position, augie_equalizer, mast_wiggle, water_type, sail_settings_notes, notes, req.params.id, req.session.user.id);
  res.redirect("/dashboard");
});

app.post("/delete/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM race_logs WHERE id = ? AND user_id = ?").run(req.params.id, req.session.user.id);
  res.redirect("/dashboard");
});

// --- TUNING GUIDES PAGE ---
app.get("/tuning-guides", (req, res) => {
  const lang = getLang(req);
  const L = (k) => t(k, lang);
  res.send(renderPage(`<div class="container">
    <h2>${L('snipeTuningGuides')}</h2>
    <p style="color:#555;margin-bottom:24px;">${L('tuningGuideSubtitle')}</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;">
      <div class="form-card" style="padding:24px;">
        <h3 style="color:#0b3d6e;margin-bottom:12px;">Quantum Sails</h3>
        <p style="color:#555;margin-bottom:16px;">${L('quantumGuideDesc')}</p>
        <a href="https://www.quantumsails.com/getattachment/Sails/One-Design/Inshore/Snipe/Snipe_TuningGuide-2020.pdf" target="_blank" style="display:inline-block;background:#0b3d6e;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">📄 Quantum Tuning Guide (PDF)</a>
        <div style="margin-top:12px;">
          <a href="https://www.quantumsails.com/en/resources-and-expertise/articles/snipe-tuning-tips-from-the-best-in-class" target="_blank" style="color:#1565c0;text-decoration:none;font-weight:600;">📖 ${L('viewFullGuide')}</a>
        </div>
      </div>
      <div class="form-card" style="padding:24px;">
        <h3 style="color:#0b3d6e;margin-bottom:12px;">North Sails</h3>
        <p style="color:#555;margin-bottom:16px;">${L('northGuideDesc')}</p>
        <a href="https://www.northsails.com/en-us/blogs/north-sails-blog/snipe-tuning-guide" target="_blank" style="display:inline-block;background:#0b3d6e;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">📄 North Sails Tuning Guide</a>
        <div style="margin-top:12px;">
          <a href="https://www.northsails.com/en-us/blogs/north-sails-blog/video-snipe-tips-with-raul-rios" target="_blank" style="color:#1565c0;text-decoration:none;font-weight:600;">🎬 ${L('viewFullGuide')}</a>
        </div>
      </div>
      <div class="form-card" style="padding:24px;">
        <h3 style="color:#0b3d6e;margin-bottom:12px;">Olimpic Sails</h3>
        <p style="color:#555;margin-bottom:16px;">${L('olimpicGuideDesc')}</p>
        <a href="https://www.yumpu.com/en/document/view/12096792/snipe-tuning-guide-for-xp-olimpic-sails" target="_blank" style="display:inline-block;background:#0b3d6e;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">📄 Olimpic Sails Tuning Guide (Yumpu)</a>
        <div style="margin-top:12px;">
          <a href="https://pdf.nauticexpo.com/pdf/olimpic-sails/snipe/21673-21802.html" target="_blank" style="color:#1565c0;text-decoration:none;font-weight:600;">📖 ${L('viewFullGuide')}</a>
        </div>
      </div>
    </div>
  </div>`, req.session.user, lang));
});

// --- RACING RULES (RRS) ---
app.get("/racing-rules", (req, res) => {
  const lang = getLang(req);
  const L = (k) => t(k, lang);
  res.send(renderPage(`<div class="container">
    <h2>${L('rrsTitle')}</h2>
    <p style="color:#555;margin-bottom:12px;">${L('rrsSearchDesc')}</p>
    ${lang !== 'en' ? `<p style="color:#c53030;font-size:0.88rem;margin-bottom:16px;padding:8px 12px;background:#fef3cd;border-radius:6px;border:1px solid #fcd34d;">⚠️ ${L('rulesInEnglish')}</p>` : ''}

    <div style="display:flex;gap:8px;margin-bottom:20px;align-items:center;">
      <label style="font-weight:600;color:#0b3d6e;font-size:0.95rem;">${L('ruleset')}:</label>
      <button type="button" id="btn-world" class="btn btn-primary ruleset-btn active-ruleset" style="font-size:0.9rem;padding:8px 18px;">🌍 ${L('worldSailing')}</button>
      <button type="button" id="btn-us" class="btn btn-secondary ruleset-btn" style="font-size:0.9rem;padding:8px 18px;">🇺🇸 ${L('usSailingPrescriptions')}</button>
    </div>
    <div id="ruleset-source" style="color:#777;font-size:0.83rem;margin-bottom:16px;">${L('showingWorldSailing')}</div>

    <div style="display:flex;gap:8px;margin-bottom:24px;max-width:600px;">
      <div class="input-wrap" style="flex:1;position:relative;">
        <input type="text" id="rrs-search" placeholder="${L('searchRulesPlaceholder')}" style="width:100%;padding:12px 44px 12px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;">
        <button type="button" id="rrs-mic" class="mic-btn" title="${L('voiceSearch')}" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);">🎤</button>
      </div>
    </div>

    <div style="display:flex;gap:8px;margin-bottom:24px;max-width:600px;">
      <div class="input-wrap" style="flex:1;position:relative;">
        <input type="text" id="rrs-rulenum" placeholder="${L('enterRuleNumber')}... e.g. 10, 18, 44" style="width:100%;padding:12px 44px 12px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;">
        <button type="button" id="rrs-num-mic" class="mic-btn" title="${L('voiceInput')}" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);">🎤</button>
      </div>
      <button type="button" id="rrs-lookup" class="btn btn-primary" style="white-space:nowrap;">${L('lookUpRule')}</button>
    </div>
    <div id="rrs-rule-detail" style="display:none;margin-bottom:28px;"></div>

    <div id="rrs-results"></div>

    <div id="rrs-all">
      <div class="form-section" style="margin-top:0;">${L('part1FundamentalRules')}</div>
      <div class="rrs-rule" data-keywords="safety, helping, life, danger, rescue, distress">
        <h4>Rule 1 — Safety</h4>
        <p><strong>1.1</strong> A boat or competitor shall give all possible help to any person or vessel in danger.</p>
        <p><strong>1.2</strong> A boat shall carry adequate lifesaving equipment for all persons on board, including one item ready for immediate use, unless her class rules make other provisions.</p>
      </div>
      <div class="rrs-rule" data-keywords="fair sailing, sportsmanship, fair, recognized principles">
        <h4>Rule 2 — Fair Sailing</h4>
        <p>A boat and her owner shall compete in compliance with recognized principles of sportsmanship and fair play. A boat may be penalized under this rule only if it is clearly established that these principles have been violated.</p>
      </div>
      <div class="rrs-rule" data-keywords="acceptance, rules, responsibility, governing rules">
        <h4>Rule 3 — Acceptance of the Rules</h4>
        <p>By participating in a race conducted under these racing rules, each competitor and boat owner agrees to accept these rules and be governed by them.</p>
      </div>
      <div class="rrs-rule" data-keywords="decision, protest, redress, rule 69, appeal, decision to race">
        <h4>Rule 4 — Decision to Race</h4>
        <p>The responsibility for a boat's decision to participate in a race or to continue racing is hers alone.</p>
      </div>
      <div class="rrs-rule" data-keywords="doping, anti-doping, wada, substance">
        <h4>Rule 5 — Anti-Doping</h4>
        <p>A competitor shall comply with the World Anti-Doping Code and the Sailing Anti-Doping Code.</p>
      </div>

      <div class="form-section">Part 2 — When Boats Meet</div>
      <div class="rrs-rule" data-keywords="port, starboard, opposite tack, tack, right of way">
        <h4>Rule 10 — On Opposite Tacks</h4>
        <p>When boats are on opposite tacks, a port-tack boat shall keep clear of a starboard-tack boat.</p>
      </div>
      <div class="rrs-rule" data-keywords="same tack, windward, leeward, overlapped, overlap">
        <h4>Rule 11 — On the Same Tack, Overlapped</h4>
        <p>When boats are on the same tack and overlapped, a windward boat shall keep clear of a leeward boat.</p>
      </div>
      <div class="rrs-rule" data-keywords="same tack, not overlapped, clear astern, clear ahead, astern, ahead">
        <h4>Rule 12 — On the Same Tack, Not Overlapped</h4>
        <p>When boats are on the same tack and not overlapped, a boat clear astern shall keep clear of a boat clear ahead.</p>
      </div>
      <div class="rrs-rule" data-keywords="tacking, while tacking, tack, keep clear">
        <h4>Rule 13 — While Tacking</h4>
        <p>After a boat passes head to wind, she shall keep clear of other boats until she is on a close-hauled course. During that time rules 10, 11 and 12 do not apply.</p>
      </div>
      <div class="rrs-rule" data-keywords="avoiding contact, contact, collision, damage, shall avoid">
        <h4>Rule 14 — Avoiding Contact</h4>
        <p>A boat shall avoid contact with another boat if reasonably possible. However, a right-of-way boat or one sailing within the room or mark-room to which she is entitled need not act to avoid contact until it is clear that the other boat is not keeping clear or giving room or mark-room.</p>
      </div>
      <div class="rrs-rule" data-keywords="acquiring right of way, right of way, opportunity, keep clear">
        <h4>Rule 15 — Acquiring Right of Way</h4>
        <p>When a boat acquires right of way, she shall initially give the other boat room to keep clear, unless she acquires right of way because of the other boat's actions.</p>
      </div>
      <div class="rrs-rule" data-keywords="changing course, course change, room, keep clear, right of way">
        <h4>Rule 16 — Changing Course</h4>
        <p><strong>16.1</strong> When a right-of-way boat changes course, she shall give the other boat room to keep clear.</p>
        <p><strong>16.2</strong> In addition, on a beat to windward when a port-tack boat is keeping clear by sailing to pass astern of a starboard-tack boat, the starboard-tack boat shall not change course if as a result the port-tack boat would immediately need to change course to continue to keep clear.</p>
      </div>
      <div class="rrs-rule" data-keywords="same tack, proper course, leeward, proper course, overlap, restrict, curtail">
        <h4>Rule 17 — On the Same Tack; Proper Course</h4>
        <p>If a boat clear astern becomes overlapped within two of her hull lengths to leeward of a boat on the same tack, she shall not sail above her proper course while they remain on the same tack and overlapped within that distance, unless in doing so she promptly sails astern of the other boat.</p>
      </div>
      <div class="rrs-rule" data-keywords="mark room, mark, rounding, room, zone, overlap, tack, gybe, inside, outside">
        <h4>Rule 18 — Mark-Room</h4>
        <p><strong>18.1</strong> Rule 18 applies between boats when they are required to leave a mark on the same side and at least one of them is in the zone. However, it does not apply between boats on opposite tacks on a beat to windward.</p>
        <p><strong>18.2 Giving Mark-Room:</strong> (a) When boats are overlapped the outside boat shall give the inside boat mark-room, unless rule 18.2(b) applies. (b) If boats are overlapped when the first of them reaches the zone, the outside boat at that moment shall thereafter give the inside boat mark-room. If a boat is clear ahead when she reaches the zone, the boat clear astern at that moment shall thereafter give her mark-room. (c) When a boat is required to give mark-room, she shall continue to do so even if later an overlap is broken or a new overlap begins.</p>
        <p><strong>18.3 Tacking or Gybing:</strong> When an inside overlapped right-of-way boat must gybe at a mark to sail her proper course, until she gybes she shall sail no farther from the mark than needed to sail that course. Rule 18.3 does not apply at a gate mark.</p>
      </div>
      <div class="rrs-rule" data-keywords="room, obstruction, obstruction, give room, keep clear">
        <h4>Rule 19 — Room to Pass an Obstruction</h4>
        <p><strong>19.1</strong> Rule 19 applies between boats at an obstruction except when it is also a mark the boats are required to leave on the same side.</p>
        <p><strong>19.2 Giving Room:</strong> (a) A right-of-way boat may choose to pass an obstruction on either side. (b) When boats are overlapped, the outside boat shall give the inside boat room between her and the obstruction, unless she has been unable to do so from the time the overlap began.</p>
      </div>
      <div class="rrs-rule" data-keywords="room, tack, obstruction, hail, tacking at obstruction">
        <h4>Rule 20 — Room to Tack at an Obstruction</h4>
        <p><strong>20.1</strong> A boat may hail for room to tack and avoid a boat on the same tack. However, she shall not hail unless safety requires her to make a substantial course change to avoid the obstruction, and she shall not hail if she is sailing below close-hauled.</p>
        <p><strong>20.2</strong> After a boat hails, (a) she shall give the hailed boat time to respond; (b) the hailed boat shall respond by either tacking as soon as possible, or immediately replying 'You tack' and then giving the hailing boat room to tack and avoid her.</p>
      </div>
      <div class="rrs-rule" data-keywords="exoneration, penalty, not applicable, right of way, compelled">
        <h4>Rule 21 — Exoneration</h4>
        <p>When a boat is sailing within the room or mark-room to which she is entitled, she shall be exonerated if she breaks a rule of Section A or rule 15 or 16.</p>
      </div>

      <div class="form-section">Part 2 — Other Section C & D Rules</div>
      <div class="rrs-rule" data-keywords="starting, start, starting errors, recall, ocs, premature, return">
        <h4>Rule 28 — Sailing the Course</h4>
        <p>A boat shall start, sail the course and then finish. While doing so, she may leave on either side a mark that does not begin, bound or end the leg she is sailing.</p>
      </div>
      <div class="rrs-rule" data-keywords="recall, individual recall, start, flag X, ocs">
        <h4>Rule 29 — Recalls</h4>
        <p><strong>29.1 Individual Recall:</strong> When at a boat's starting signal any part of her hull is on the course side of the starting line, the race committee shall promptly display flag X with one sound. The flag shall be displayed until all such boats have sailed completely to the pre-start side.</p>
        <p><strong>29.2 General Recall:</strong> When at the starting signal the race committee is unable to identify boats that are on the course side or there has been an error in the starting procedure, the race committee may signal a general recall (display First Substitute with two sounds).</p>
      </div>
      <div class="rrs-rule" data-keywords="penalty, turns, 720, 360, two turns, one turn, penalty turn, spin, exonerate">
        <h4>Rule 31 — Touching a Mark</h4>
        <p>While racing, a boat shall not touch a starting mark before starting, a mark that begins, bounds or ends the leg of the course on which she is sailing, or a finishing mark after finishing.</p>
      </div>
      <div class="rrs-rule" data-keywords="penalty, 720, 360, two turns, one turn, taking a penalty, turns penalty, spin, exonerate">
        <h4>Rule 44 — Penalties at the Time of an Incident</h4>
        <p><strong>44.1 Taking a Penalty:</strong> A boat may take a Two-Turns Penalty when she may have broken one or more rules of Part 2 in an incident while racing. Alternatively, the notice of race or sailing instructions may specify the use of the Scoring Penalty or some other penalty.</p>
        <p><strong>44.2 One-Turn and Two-Turns Penalties:</strong> After getting well clear of other boats as soon after the incident as possible, a boat takes a One-Turn or Two-Turns Penalty by promptly making the required number of turns in the same direction, each turn including one tack and one gybe.</p>
      </div>

      <div class="form-section">Part 5 — Protests & Redress</div>
      <div class="rrs-rule" data-keywords="protest, flag, red flag, hail, protesting, inform">
        <h4>Rule 61 — Protest Requirements</h4>
        <p><strong>61.1 Informing the Protestee:</strong> (a) A boat intending to protest shall inform the other boat at the first reasonable opportunity. When her protest concerns an incident in the racing area, she shall hail 'Protest' and conspicuously display a red flag at the first reasonable opportunity for each. She shall display the flag until she is no longer racing.</p>
      </div>
      <div class="rrs-rule" data-keywords="redress, request, scoring, injury, boat damage, committee error, results">
        <h4>Rule 62 — Redress</h4>
        <p>A boat that believes her score or place in a race or series has been or may be significantly worsened through no fault of her own may request redress. Reasons include: improper action by the race committee, physical damage from a boat breaking a Part 2 rule, giving help in compliance with rule 1.1, or an action of a boat penalized under rule 2.</p>
      </div>

      <div class="form-section">${L('keyDefinitions')}</div>
      <div class="rrs-rule" data-keywords="keep clear, definition, clear, avoiding, contact, room, space">
        <h4>Keep Clear</h4>
        <p>A boat keeps clear of a right-of-way boat if the right-of-way boat can sail her course with no need to take avoiding action and, when the boats are overlapped on the same tack, if the leeward boat can change course in both directions without immediately making contact with the windward boat.</p>
      </div>
      <div class="rrs-rule" data-keywords="mark room, mark-room, room, mark, space, rounding, seamanlike, overlap">
        <h4>Mark-Room</h4>
        <p>Room for a boat to leave a mark on the required side. Also, room to sail to the mark when her proper course is to sail close to it, and room to round the mark as necessary to sail the course.</p>
      </div>
      <div class="rrs-rule" data-keywords="obstruction, large, object, area, safety, vessel, zone, rule 19">
        <h4>Obstruction</h4>
        <p>An object that a boat, if she were sailing directly towards it and one of her hull lengths from it, would need to change course to pass on one side or the other. An object that a boat can safely pass on only one side and an area so designated by the sailing instructions are also obstructions.</p>
      </div>
      <div class="rrs-rule" data-keywords="zone, three, hull lengths, mark, circle, area">
        <h4>Zone</h4>
        <p>The area around a mark within a distance of three hull lengths of a boat nearer to it. A boat is in the zone when any part of her hull is in the zone.</p>
      </div>
      <div class="rrs-rule" data-keywords="proper course, course, wind, finish, absent, would sail, optimal">
        <h4>Proper Course</h4>
        <p>A course a boat would sail to finish as soon as possible in the absence of other boats referred to in the rule using the term.</p>
      </div>
      <div class="rrs-rule" data-keywords="room, space, seamanlike, maneuver, room, definition, obligations">
        <h4>Room</h4>
        <p>The space a boat needs in the existing conditions, including space to comply with her obligations under the rules of Part 2 and rule 31, while manoeuvring promptly in a seamanlike way.</p>
      </div>
    </div>

    <div id="rrs-us" style="display:none;">
      <div class="form-section" style="margin-top:0;">${L('usPrescriptionsTitle')}</div>
      <p style="color:#555;margin-bottom:16px;">These prescriptions are adopted by US Sailing and apply to all races sailed under its jurisdiction within the United States. They modify or supplement the World Sailing Racing Rules.</p>

      <div class="rrs-rule rrs-us-rule" data-keywords="prescription, rule 3, acceptance, rules, responsibility">
        <h4>US Prescription to Rule 3</h4>
        <p>The prescriptions of US Sailing shall apply. The organizing authority of a race or regatta that is not an international event may change the prescriptions by stating so in the Notice of Race or Sailing Instructions.</p>
      </div>
      <div class="rrs-rule rrs-us-rule" data-keywords="prescription, rule 60, protest, arbitration, mediation, alternative dispute">
        <h4>US Prescription to Rule 60.3(a)</h4>
        <p>A protest committee may protest a boat, but not based solely on information in a report from an interested party. It may also call a hearing under rule 69 based on its own observation or a report received from any source, including information from a hearing.</p>
      </div>
      <div class="rrs-rule rrs-us-rule" data-keywords="prescription, rule 61, protest, protest requirements, hail, red flag, written protest">
        <h4>US Prescription to Rule 61.1(a)</h4>
        <p>For boats under 6 meters (20 feet) in overall length, the requirement to display a red flag does not apply. A hail of "Protest" is sufficient. However, the protesting boat shall inform the other boat of her intention to protest at the first reasonable opportunity.</p>
      </div>
      <div class="rrs-rule rrs-us-rule" data-keywords="prescription, rule 63, hearing, protest committee, panel, conflict, interest">
        <h4>US Prescription to Rule 63.3(a)</h4>
        <p>A support person who is not a party to the hearing and is representing a party shall be permitted in the hearing. A minor shall be entitled to be accompanied by a support person who may speak on the minor's behalf.</p>
      </div>
      <div class="rrs-rule rrs-us-rule" data-keywords="prescription, rule 64, decision, penalty, dsq, discretionary, alternative penalty">
        <h4>US Prescription to Rule 64.4</h4>
        <p>If the protest committee has reasonable doubt about a matter related to the protest, it shall resolve the doubt in favor of the protested boat. The standard of proof is a preponderance of the evidence (more likely than not), not beyond a reasonable doubt.</p>
      </div>
      <div class="rrs-rule rrs-us-rule" data-keywords="prescription, rule 67, damages, injury, cost, compensation, liability">
        <h4>US Prescription to Rule 67</h4>
        <p>The question of damages arising from a breach of any of these rules shall be governed by the applicable prescriptions of US Sailing, if any, and by the law applicable to the matter in dispute.</p>
      </div>
      <div class="rrs-rule rrs-us-rule" data-keywords="prescription, rule 69, misconduct, gross misconduct, allegation, report, discipline, sportsmanship">
        <h4>US Prescription to Rule 69</h4>
        <p>When a protest committee has acted under rule 69 and reported the facts to US Sailing, the executive director or designee shall review the report. If warranted, a hearing may be scheduled before a Disciplinary Board. Penalties may include suspension of membership, ineligibility for US Sailing events, and reports to the sailor's national authority if applicable.</p>
      </div>
      <div class="rrs-rule rrs-us-rule" data-keywords="prescription, rule 70, appeals, appeal, right, national authority, us sailing, review">
        <h4>US Prescription to Rule 70.5</h4>
        <p><strong>Right of Appeal:</strong> Decisions of protest committees may be appealed to US Sailing in accordance with its appeals procedures. The decision of the US Sailing Appeals Committee is final. An appeal shall be made within 15 days of the decision being communicated. An appeal fee shall be paid; it will be refunded if the appeal is upheld.</p>
      </div>
      <div class="rrs-rule rrs-us-rule" data-keywords="prescription, appendix, alternative penalties, advisory hearing, discretionary, spin, 720">
        <h4>US Prescription — Alternative Penalties</h4>
        <p>An organizing authority or class rules may, in the Sailing Instructions, provide for advisory hearings and alternative penalties for Part 2 infractions. Common alternative penalties adopted by US Sailing classes include: (1) a one-turn penalty for minor infractions with no damage or injury; (2) a scoring penalty of 20%; (3) advisory hearings where boats acknowledge an infraction without a formal protest.</p>
      </div>
      <div class="rrs-rule rrs-us-rule" data-keywords="prescription, safety, life jacket, pfd, coast guard, uscg, float plan, cold water">
        <h4>US Prescription — Safety Requirements</h4>
        <p>US Sailing requires compliance with US Coast Guard regulations for all vessels. Personal flotation devices (PFDs) approved by the US Coast Guard shall be worn or carried as required by the Notice of Race and/or Sailing Instructions. In cold water conditions (below 60°F/15.5°C), US Sailing strongly recommends that all competitors wear approved PFDs and appropriate cold-water gear including drysuits or wetsuits.</p>
      </div>
      <div class="rrs-rule rrs-us-rule" data-keywords="prescription, measurement, certification, class rules, one design, snipe, hull">
        <h4>US Prescription — Measurement & Class Rules</h4>
        <p>Boats racing in one-design classes (including Snipe) under US Sailing jurisdiction shall comply with the measurement rules of their class. A valid measurement certificate must be available at the event if requested. Class rules may be stricter than the RRS and take precedence where applicable.</p>
      </div>

      <div class="form-section">Key Differences from World Sailing Rules</div>
      <div class="rrs-rule rrs-us-rule" data-keywords="difference, summary, us sailing, world sailing, comparison">
        <h4>Summary of US Sailing Modifications</h4>
        <p><strong>Red Flag (Rule 61):</strong> Boats under 6m/20ft are exempt from displaying a red flag; a hail of "Protest" suffices.<br>
        <strong>Support Persons (Rule 63):</strong> Support persons may represent parties in hearings; minors may have an advocate.<br>
        <strong>Standard of Proof (Rule 64):</strong> US Sailing uses "preponderance of evidence" standard; doubts resolved in favor of the protested boat.<br>
        <strong>Appeals (Rule 70):</strong> 15-day appeal window to US Sailing Appeals Committee; appeal fee required but refundable if upheld.<br>
        <strong>Rule 69 Discipline:</strong> Reports go to US Sailing executive director; may lead to Disciplinary Board hearing and membership suspension.<br>
        <strong>Safety:</strong> Must comply with USCG regulations; PFD and cold-water gear recommendations apply.</p>
      </div>
    </div>

    <p id="rrs-ref" style="margin-top:32px;color:#888;font-size:0.85rem;">${L('rrsReference')}</p>
  </div>
  <script>
  (function() {
    const input = document.getElementById('rrs-search');
    const micBtn = document.getElementById('rrs-mic');
    const results = document.getElementById('rrs-results');
    const worldRules = document.querySelectorAll('#rrs-all .rrs-rule');
    const usRules = document.querySelectorAll('#rrs-us .rrs-rule');

    function search(query) {
      if (!query.trim()) {
        results.innerHTML = '';
        worldRules.forEach(r => r.style.display = '');
        usRules.forEach(r => r.style.display = '');
        return;
      }
      const terms = query.toLowerCase().split(/\\s+/);
      const activeSet = activeRuleset === 'us' ? usRules : worldRules;
      let found = [];
      activeSet.forEach(r => {
        const text = (r.textContent + ' ' + (r.dataset.keywords || '')).toLowerCase();
        const match = terms.every(t => text.includes(t));
        r.style.display = match ? '' : 'none';
        if (match) found.push(r);
      });
      if (found.length === 0) {
        results.innerHTML = '<div class="alert" style="background:#fff3cd;color:#856404;padding:12px;border-radius:8px;margin-bottom:16px;">No rules found matching your search. Try different keywords like "port starboard", "mark room", or "protest".</div>';
      } else {
        results.innerHTML = '<div style="color:#555;margin-bottom:12px;">Found ' + found.length + ' matching rule(s):</div>';
      }
    }

    input.addEventListener('input', () => search(input.value));

    // Voice search
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR && micBtn) {
      micBtn.addEventListener('click', function() {
        if (micBtn.classList.contains('listening')) return;
        const rec = new SR();
        rec.lang = 'en-US';
        rec.interimResults = false;
        rec.continuous = false;
        micBtn.classList.add('listening');
        rec.onresult = function(e) {
          const text = e.results[0][0].transcript;
          input.value = text;
          search(text);
          micBtn.classList.remove('listening');
        };
        rec.onerror = function() { micBtn.classList.remove('listening'); };
        rec.onend = function() { micBtn.classList.remove('listening'); };
        rec.start();
      });
    } else if (micBtn) {
      micBtn.style.display = 'none';
    }

    // --- Rule Number Lookup ---
    const ruleDB = {
      '1': {
        title: 'Rule 1 — Safety',
        text: '<strong>1.1</strong> A boat or competitor shall give all possible help to any person or vessel in danger.<br><strong>1.2</strong> A boat shall carry adequate lifesaving equipment for all persons on board, including one item ready for immediate use, unless her class rules make other provisions.',
        appeals: [
          { case: 'Case 20', summary: 'A boat that realizes she is in a position to help those in danger is obligated to do so. The time lost shall be grounds for redress under rule 62.1(c).' },
          { case: 'Case 91', summary: 'A boat that is not in danger but retires believing she may be does not meet the requirements for redress.' }
        ]
      },
      '2': {
        title: 'Rule 2 — Fair Sailing',
        text: 'A boat and her owner shall compete in compliance with recognized principles of sportsmanship and fair play. A boat may be penalized under this rule only if it is clearly established that these principles have been violated. A disqualification under this rule shall not be excluded from the boat\\'s series score.',
        appeals: [
          { case: 'Case 34', summary: 'Repeated, intentional breaking of a rule to gain an advantage is a violation of sportsmanship and rule 2.' },
          { case: 'Case 47', summary: 'A boat that deliberately hails "starboard" when on port tack has broken rule 2.' },
          { case: 'Case 73', summary: 'Attempting to gain redress by providing false evidence to a protest committee violates rule 2 and rule 69.' }
        ]
      },
      '3': {
        title: 'Rule 3 — Acceptance of the Rules',
        text: 'By participating in a race conducted under these racing rules, each competitor and boat owner agrees to accept these rules and be governed by them.',
        appeals: []
      },
      '4': {
        title: 'Rule 4 — Decision to Race',
        text: 'The responsibility for a boat\\'s decision to participate in a race or to continue racing is hers alone.',
        appeals: [
          { case: 'Case 117', summary: 'The safety of a boat and her crew is the sole responsibility of the person in charge. Neither the race committee, organizing authority, nor protest committee is responsible.' }
        ]
      },
      '5': {
        title: 'Rule 5 — Anti-Doping',
        text: 'A competitor shall comply with the World Anti-Doping Code, the rules of the World Anti-Doping Agency, and World Sailing Regulation 21 — Anti-Doping Code.',
        appeals: []
      },
      '10': {
        title: 'Rule 10 — On Opposite Tacks',
        text: 'When boats are on opposite tacks, a port-tack boat shall keep clear of a starboard-tack boat.',
        appeals: [
          { case: 'Case 23', summary: 'Rule 10 applies between boats on opposite tacks regardless of whether either boat is beating, reaching, or running, and regardless of whether it is before or after the starting signal.' },
          { case: 'Case 50', summary: 'When a port-tack boat chooses to pass astern of a starboard-tack boat, rule 10 requires her to keep clear. If she misjudges and cannot keep clear, she breaks rule 10.' },
          { case: 'Case 75', summary: 'A port-tack boat need not anticipate that a starboard-tack boat will change course, but once the starboard-tack boat changes course, the port-tack boat must respond to keep clear.' }
        ]
      },
      '11': {
        title: 'Rule 11 — On the Same Tack, Overlapped',
        text: 'When boats are on the same tack and overlapped, a windward boat shall keep clear of a leeward boat.',
        appeals: [
          { case: 'Case 7', summary: 'When a windward boat\\'s crew member overhangs the leeward boat, the windward boat is not keeping clear. Contact is not required for a breach.' },
          { case: 'Case 12', summary: 'An overlap begins when neither boat is clear astern of the other. The windward boat must immediately begin to keep clear.' },
          { case: 'Case 14', summary: 'An inside windward boat entitled to mark-room is not keeping clear if she forces the leeward boat to sail above her proper course when no room or mark-room entitlement overrides rule 11.' }
        ]
      },
      '12': {
        title: 'Rule 12 — On the Same Tack, Not Overlapped',
        text: 'When boats are on the same tack and not overlapped, a boat clear astern shall keep clear of a boat clear ahead.',
        appeals: [
          { case: 'Case 24', summary: 'A boat clear astern that becomes overlapped to leeward is no longer subject to rule 12. Rule 11 begins to apply.' },
          { case: 'Case 26', summary: 'A boat clear astern must keep clear even if the boat clear ahead is slowing, stopping, or moving backward.' }
        ]
      },
      '13': {
        title: 'Rule 13 — While Tacking',
        text: 'After a boat passes head to wind, she shall keep clear of other boats until she is on a close-hauled course. During that time rules 10, 11 and 12 do not apply. However, if two boats are subject to this rule at the same time, the one on the other\\'s port side or the one astern shall keep clear.',
        appeals: [
          { case: 'Case 106', summary: 'Rule 13 begins to apply to a boat when she passes head to wind and ceases when she is on a close-hauled course, regardless of how she arrived at head to wind.' },
          { case: 'Case 6', summary: 'A tacking boat does not break rule 13 if she completes her tack before the other boat needs to begin to take avoiding action.' }
        ]
      },
      '14': {
        title: 'Rule 14 — Avoiding Contact',
        text: '<strong>14(a)</strong> A boat shall avoid contact with another boat if reasonably possible. However, a right-of-way boat, or one sailing within the room or mark-room to which she is entitled, need not act to avoid contact until it is clear that the other boat is not keeping clear or giving room or mark-room.<br><strong>14(b)</strong> A boat that has right of way and breaks this rule shall not be penalized unless there is contact that causes damage or injury.',
        appeals: [
          { case: 'Case 87', summary: 'A right-of-way boat that could easily have avoided contact but chose not to has broken rule 14 if there is damage or injury.' },
          { case: 'Case 123', summary: 'Rule 14 does not require a right-of-way boat to anticipate that the other boat will break a rule. She only needs to act when it becomes clear the other boat is not keeping clear.' },
          { case: 'Case 50', summary: 'A keep-clear boat always has the obligation to avoid contact under rule 14, regardless of other rules.' }
        ]
      },
      '15': {
        title: 'Rule 15 — Acquiring Right of Way',
        text: 'When a boat acquires right of way, she shall initially give the other boat room to keep clear, unless she acquires right of way because of the other boat\\'s actions.',
        appeals: [
          { case: 'Case 24', summary: 'When a boat clear astern becomes overlapped to leeward of the boat ahead, she acquires right of way under rule 11 and must initially give the windward boat room to keep clear under rule 15.' },
          { case: 'Case 25', summary: 'A boat that tacks into a right-of-way position acquires right of way and must comply with rule 15. The other boat must be given room to keep clear.' }
        ]
      },
      '16': {
        title: 'Rule 16 — Changing Course',
        text: '<strong>16.1</strong> When a right-of-way boat changes course, she shall give the other boat room to keep clear.<br><strong>16.2</strong> In addition, on a beat to windward when a port-tack boat is keeping clear by sailing to pass astern of a starboard-tack boat, the starboard-tack boat shall not change course if as a result the port-tack boat would immediately need to change course to continue to keep clear.',
        appeals: [
          { case: 'Case 92', summary: 'Rule 16.1 does not restrict the right-of-way boat\\'s ability to change course, it only requires that she give the other boat room to keep clear when she does.' },
          { case: 'Case 60', summary: 'A starboard-tack boat that bears away toward a port-tack boat passing astern violates rule 16.2 if the port-tack boat must immediately change course further.' },
          { case: 'Case 100', summary: 'A leeward boat may luff a windward boat provided she gives the windward boat room to keep clear under rule 16.1.' }
        ]
      },
      '17': {
        title: 'Rule 17 — On the Same Tack; Proper Course',
        text: 'If a boat clear astern becomes overlapped within two of her hull lengths to leeward of a boat on the same tack, she shall not sail above her proper course while they remain on the same tack and overlapped within that distance, unless in doing so she promptly sails astern of the other boat. This rule does not apply if the overlap begins while the windward boat is required by rule 13 to keep clear.',
        appeals: [
          { case: 'Case 46', summary: 'When rule 17 limits a leeward boat to her proper course, she may still luff above close-hauled if that is her proper course. Proper course depends on conditions.' },
          { case: 'Case 134', summary: 'Rule 17 ceases to apply if the overlap is broken and later re-established at more than two hull lengths.' }
        ]
      },
      '18': {
        title: 'Rule 18 — Mark-Room',
        text: '<strong>18.1 When Rule 18 Applies:</strong> Rule 18 applies between boats when they are required to leave a mark on the same side and at least one of them is in the zone. However, it does not apply (a) between boats on opposite tacks on a beat to windward, (b) between boats on opposite tacks when the proper course at the mark for one but not both of them is to tack, (c) between a boat approaching a mark and one leaving it, or (d) if the mark is a continuing obstruction, in which case rule 19 applies.<br><br><strong>18.2 Giving Mark-Room:</strong> (a) When boats are overlapped the outside boat shall give the inside boat mark-room, unless rule 18.2(b) applies. (b) If boats are overlapped when the first of them reaches the zone, the outside boat at that moment shall thereafter give the inside boat mark-room. If a boat is clear ahead when she reaches the zone, the boat clear astern at that moment shall thereafter give her mark-room. (c) When a boat is required to give mark-room by rule 18.2(b), she shall continue to do so even if later an overlap is broken or a new overlap begins. (d) If there is reasonable doubt that a boat obtained or broke an overlap in time, it shall be presumed that she did not.<br><br><strong>18.3 Tacking or Gybing:</strong> When an inside overlapped right-of-way boat must gybe at a mark to sail her proper course, until she gybes she shall sail no farther from the mark than needed to sail that course. Rule 18.3 does not apply at a gate mark or a continuing obstruction.',
        appeals: [
          { case: 'Case 21', summary: 'A boat that is clear ahead when she reaches the zone is entitled to mark-room from a boat clear astern, even if the boat astern later becomes overlapped inside.' },
          { case: 'Case 63', summary: 'Mark-room includes room to tack when the mark is to be left to port and the boat\\'s proper course is to sail close to the mark and tack.' },
          { case: 'Case 70', summary: 'At a mark where rule 18 applies, if an inside boat obtained an overlap from clear astern within two hull lengths of the outside boat, she is still entitled to mark-room under 18.2(b) if the overlap existed when the first boat reached the zone.' },
          { case: 'Case 118', summary: 'The zone is three hull lengths of the boat nearer to the mark. If boats of different sizes meet, it is three hull lengths of the boat nearer to the mark.' },
          { case: 'Case 93', summary: 'Mark-room does not entitle a boat to room to sail a "tactical" rounding. It only provides room to sail to the mark and then round it in a seamanlike way.' }
        ]
      },
      '19': {
        title: 'Rule 19 — Room to Pass an Obstruction',
        text: '<strong>19.1</strong> Rule 19 applies between boats at an obstruction except when it is also a mark the boats are required to leave on the same side. However, at a continuing obstruction, rule 19 always applies and rule 18 does not.<br><strong>19.2 Giving Room:</strong> (a) A right-of-way boat may choose to pass an obstruction on either side. (b) When boats are overlapped, the outside boat shall give the inside boat room between her and the obstruction, unless she has been unable to do so from the time the overlap began. (c) While boats are passing a continuing obstruction, if a boat that was clear astern and required to keep clear becomes overlapped between the other boat and the obstruction and, at the moment the overlap begins, there is not room for her to pass between them, she is not entitled to room under rule 19.2(b).',
        appeals: [
          { case: 'Case 29', summary: 'A boat is an obstruction to other boats if they would need to change course to avoid her. A capsized boat, an anchored boat, and a boat under a penalty turn can all be obstructions.' },
          { case: 'Case 33', summary: 'At a continuing obstruction, an inside overlap does not entitle the inside boat to room if the overlap began when there was no room for her to pass.' }
        ]
      },
      '20': {
        title: 'Rule 20 — Room to Tack at an Obstruction',
        text: '<strong>20.1 Hailing:</strong> A boat may hail for room to tack and avoid a boat on the same tack. However, she shall not hail unless (a) she is approaching an obstruction and will soon need to make a substantial course change to avoid it safely, and (b) she is sailing close-hauled or above.<br><strong>20.2 Responding:</strong> After a boat hails, (a) she shall give the hailed boat time to respond; (b) the hailed boat shall respond by either (1) tacking as soon as possible, or (2) immediately replying "You tack" and then giving the hailing boat room to tack and avoid her; and (c) when the hailing boat tacks, the hailed boat shall give her room to tack and avoid her.<br><strong>20.3</strong> When a boat will be subject to rule 20.2(b) she shall not change course before the hailing boat tacks.<br><strong>20.4</strong> Rule 20 does not apply at a starting mark surrounded by navigable water or at its anchor line from the time boats are approaching them to start until they have passed them.',
        appeals: [
          { case: 'Case 35', summary: 'A hail for room to tack must be loud enough for the other boat to hear in the prevailing conditions. A boat that hails too quietly has not properly hailed.' },
          { case: 'Case 101', summary: 'A boat that hails for room to tack must be approaching the obstruction. She may not hail for tactical advantage when she could safely continue.' }
        ]
      },
      '21': {
        title: 'Rule 21 — Exoneration',
        text: 'When a boat is sailing within the room or mark-room to which she is entitled, she shall be exonerated if, in an incident with a boat required to give her that room or mark-room, (a) she breaks a rule of Section A, rule 15 or rule 16, or (b) she is compelled to break rule 31.',
        appeals: [
          { case: 'Case 114', summary: 'A boat sailing within the mark-room to which she is entitled is exonerated under rule 21 for breaking rules of Section A, even if the boat entitled to give mark-room was also sailing within mark-room.' }
        ]
      },
      '28': {
        title: 'Rule 28 — Sailing the Course',
        text: '<strong>28.1</strong> A boat shall start, sail the course and then finish. While doing so, she may leave on either side a mark that does not begin, bound or end the leg she is sailing. After finishing, she need not cross the finishing line completely.<br><strong>28.2</strong> A boat may correct any errors in sailing the course, provided she has not finished.',
        appeals: [
          { case: 'Case 106', summary: 'A boat that does not sail the course described in the sailing instructions, including leaving each mark on the required side, breaks rule 28.' },
          { case: 'Case 90', summary: 'A boat that sails the wrong course may correct the error by returning to where she went wrong, provided she has not yet finished.' }
        ]
      },
      '29': {
        title: 'Rule 29 — Recalls',
        text: '<strong>29.1 Individual Recall:</strong> When at a boat\\'s starting signal any part of her hull is on the course side of the starting line, the race committee shall promptly display flag X with one sound. The flag shall be displayed until all such boats have sailed completely to the pre-start side of the starting line or one of its extensions and have then complied with rule 30.1 if it applies, but no later than four minutes after the starting signal or one minute before any later starting signal, whichever is earlier. If rule 30.3 applies, this rule does not.<br><strong>29.2 General Recall:</strong> When at the starting signal the race committee is unable to identify boats that are on the course side of the starting line or there has been an error in the starting procedure, the race committee may signal a general recall (display the First Substitute with two sounds). The warning signal for a new start shall be made one minute after the First Substitute is removed (one sound).',
        appeals: [
          { case: 'Case 31', summary: 'A boat OCS (on the course side) must return completely to the pre-start side before starting correctly. Merely touching the line is not sufficient.' },
          { case: 'Case 79', summary: 'The race committee is not required to identify OCS boats by sail number. Displaying flag X is sufficient notification.' }
        ]
      },
      '30': {
        title: 'Rule 30 — Starting Penalties',
        text: '<strong>30.1 I Flag Rule:</strong> If flag I has been displayed, and any part of a boat\\'s hull is on the course side of the starting line or one of its extensions during the last minute before her starting signal, she shall sail to the pre-start side through an extension.<br><strong>30.2 Z Flag Rule:</strong> If flag Z has been displayed, a boat that is in the triangle formed by the ends of the starting line and the first mark during the last minute before her starting signal will receive a 20% Scoring Penalty without a hearing. If there is a general recall or postponement, the penalty shall apply in subsequent start.<br><strong>30.3 U Flag Rule:</strong> If flag U has been displayed, no part of a boat\\'s hull shall be on the course side of the starting line during the last minute before her starting signal. If a boat breaks this rule, she shall be disqualified without a hearing, but not if there is a general recall.<br><strong>30.4 Black Flag Rule:</strong> If a black flag has been displayed, no part of a boat\\'s hull shall be on the course side of the starting line during the last minute before her starting signal. A boat that breaks this rule shall be disqualified without a hearing, even if there is a general recall.',
        appeals: [
          { case: 'Case 33', summary: 'Under the I flag rule, a boat that was OCS in the last minute must round an end of the starting line. She cannot simply dip back across the line.' },
          { case: 'Case 71', summary: 'Under the black flag rule, a boat disqualified is disqualified from that race even if there is a general recall. She cannot start in the restarted race.' }
        ]
      },
      '31': {
        title: 'Rule 31 — Touching a Mark',
        text: 'While racing, a boat shall not touch a starting mark before starting, a mark that begins, bounds or ends the leg of the course on which she is sailing, or a finishing mark after finishing.',
        appeals: [
          { case: 'Case 77', summary: 'A boat that touches a mark may exonerate herself by taking a penalty under rule 44. She does not need to protest herself.' },
          { case: 'Case 10', summary: 'If a boat\\'s equipment (spinnaker pole, boom) touches a mark, she has broken rule 31. Contact by any part of the boat or her equipment counts.' }
        ]
      },
      '42': {
        title: 'Rule 42 — Propulsion',
        text: 'A boat shall compete by using only the wind and water to increase, maintain or decrease her speed. Her crew may adjust the trim of sails and hull and perform other acts of seamanship, but shall not otherwise move their bodies to propel the boat.<br><br>Exceptions include: (a) a boat\\'s crew may move their bodies to facilitate steering, (b) a crew member recovering from a position outside the lifelines may push against the hull, (c) repeated roll tacking is permitted on beats, (d) on legs not close-hauled, repeated gybes are permitted, provided each gybe is consistent with sailing the course to finish.',
        appeals: [
          { case: 'Case 69', summary: 'Repeated fanning of the sails with no wind change to propel the boat is pumping and breaks rule 42.' },
          { case: 'Case 132', summary: 'Sculling (repeated movement of the tiller/rudder) to propel the boat breaks rule 42, but a single forceful movement to change course is permitted.' }
        ]
      },
      '44': {
        title: 'Rule 44 — Penalties at the Time of an Incident',
        text: '<strong>44.1 Taking a Penalty:</strong> A boat may take a Two-Turns Penalty when she may have broken one or more rules of Part 2 in an incident while racing. She may take a One-Turn Penalty when she may have broken rule 31. The sailing instructions may specify the use of the Scoring Penalty or some other penalty, in which case the specified penalty shall replace the One-Turn and Two-Turns Penalties.<br><strong>44.2 One-Turn and Two-Turns Penalties:</strong> After getting well clear of other boats as soon after the incident as possible, a boat takes a One-Turn or Two-Turns Penalty by promptly making the required number of turns in the same direction, each turn including one tack and one gybe. When a boat takes the penalty at or near the finishing line, she shall sail completely to the course side of the line before finishing.<br><strong>44.3 Scoring Penalty:</strong> (a) A boat takes a Scoring Penalty by displaying a yellow flag at the first reasonable opportunity after the incident. (b) When a boat has taken a Scoring Penalty, she shall keep the flag displayed until finishing and call the race committee\\'s attention to it at the finish. At that time she shall also inform the race committee of the identity of the other boat involved. If this is impractical, she shall do so at the first reasonable opportunity and within the protest time limit. (c) The penalty shall be a 20% Scoring Penalty computed as stated in rule 44.3(c).',
        appeals: [
          { case: 'Case 99', summary: 'A boat that takes a Two-Turns Penalty must get well clear of other boats before beginning her turns. Performing turns in traffic may result in additional incidents.' },
          { case: 'Case 107', summary: 'A Two-Turns Penalty requires two complete turns in the same direction, each including one tack and one gybe. Both turns must be made promptly and in sequence.' },
          { case: 'Case 110', summary: 'A boat that takes a penalty acknowledges she may have broken a rule. If a protest is later filed for the same incident and the penalty is found inadequate, additional penalties may be applied.' }
        ]
      },
      '60': {
        title: 'Rule 60 — Right to Protest; Right to Request Redress or Rule 69 Action',
        text: '<strong>60.1</strong> A boat may (a) protest another boat, but not for an alleged breach of a rule of Part 2 unless she was involved in or saw the incident; or (b) request redress.<br><strong>60.2</strong> A race committee may (a) protest a boat, but not as a result of a report from an interested party or based solely on information in a protest by another boat or request for redress; (b) request redress; or (c) report to the protest committee requesting action under rule 69.<br><strong>60.3</strong> A protest committee may (a) protest a boat when it learns of an incident from any source, including evidence taken during a hearing; (b) call a hearing to consider redress; or (c) act under rule 69.',
        appeals: [
          { case: 'Case 65', summary: 'A boat that sees an incident may protest, even if she was not directly involved. She must still comply with all protest requirements of rule 61.' }
        ]
      },
      '61': {
        title: 'Rule 61 — Protest Requirements',
        text: '<strong>61.1 Informing the Protestee:</strong> (a) A boat intending to protest shall inform the other boat at the first reasonable opportunity. When her protest concerns an incident in the racing area that she was involved in or saw, she shall hail "Protest" and conspicuously display a red flag at the first reasonable opportunity for each. She shall display the flag until she is no longer racing. However, (1) if the other boat is beyond hailing distance, the protesting boat need not hail but she must inform the other boat at the first reasonable opportunity; (2) if the hull length of the protesting boat is less than 6 metres, she need not display a red flag; (3) if the incident occurs on the last leg or after finishing, she need not display a red flag but must hail before or at the time of finishing or, if she is no longer racing, as soon as reasonably possible.<br><strong>61.2</strong> A protesting boat shall deliver the protest in writing to the race office within the protest time limit. The protest shall identify the incident, the rule(s) believed to have been broken, the boat(s) protested.',
        appeals: [
          { case: 'Case 40', summary: 'A boat that hails "Protest" must do so at the first reasonable opportunity. A delayed hail may invalidate the protest.' },
          { case: 'Case 72', summary: 'The word "Protest" must be used. Shouting "You fouled me!" or similar language is not a valid protest hail.' },
          { case: 'Case 51', summary: 'A red flag must be conspicuously displayed. Tying it to a lifeline where it cannot be seen does not satisfy the rule.' }
        ]
      },
      '62': {
        title: 'Rule 62 — Redress',
        text: '<strong>62.1</strong> A boat that believes her score or place in a race or series has been or may be significantly worsened, through no fault of her own, may request redress. Reasons include: (a) an improper action or omission of the race committee, protest committee, organizing authority or technical committee; (b) injury or physical damage because of the action of a boat that was breaking a rule of Part 2 or of a vessel not racing that was required to keep clear; (c) giving help in compliance with rule 1.1; or (d) an action of a boat penalized under rule 2 or under rule 69.2(h).<br><strong>62.2</strong> A request for redress based on a protest committee decision shall be made within the time limit of rule 62.2. No reopening request shall be made more than 24 hours after being informed of the decision.',
        appeals: [
          { case: 'Case 36', summary: 'Equipment failure is not, by itself, grounds for redress. The cause of failure must come from an outside source beyond the crew\\'s control.' },
          { case: 'Case 19', summary: 'An error by the race committee in scoring or in conducting the race may be grounds for redress. A boat must show the error significantly worsened her score.' },
          { case: 'Case 135', summary: 'A change in wind conditions, even dramatic or unexpected, is not an improper action by the race committee and is not grounds for redress.' }
        ]
      },
      '63': {
        title: 'Rule 63 — Hearings',
        text: '<strong>63.1</strong> A protest or request for redress shall not be decided without a hearing. The protest committee shall hear all protests and requests for redress that have been delivered to the race office unless it allows a protest or request to be withdrawn.<br><strong>63.2</strong> A boat shall not be penalized without a protest hearing, except under rules 30.2, 30.3, 30.4, 69, A5 and P2.<br><strong>63.3 Right to Be Present:</strong> (a) The parties to the hearing and their witnesses are entitled to be present throughout the hearing. (b) If a party to a hearing does not come to the hearing, the protest committee may nevertheless decide the protest or request. (c) When there is a conflict of interest, the person concerned shall not be a member of the protest committee.',
        appeals: [
          { case: 'Case 56', summary: 'A party to a hearing has the right to be present during all testimony and to question all witnesses. Denying this right is grounds for reopening.' }
        ]
      },
      '64': {
        title: 'Rule 64 — Decisions',
        text: '<strong>64.1 Penalties and Exoneration:</strong> (a) When the protest committee decides that a boat that is a party to a protest hearing has broken a rule, it shall disqualify her unless some other penalty applies. A penalty shall be imposed whether or not the applicable rule was mentioned in the protest. (b) When as a result of breaking a rule a boat has compelled another boat to break a rule, rule 64.1(a) does not apply to the other boat, and she shall be exonerated. (c) If a boat has broken a rule when not racing, the penalty shall apply to the race sailed nearest in time to that of the incident.<br><strong>64.2</strong> When the protest committee decides that a boat is entitled to redress under rule 62, it shall make as fair an arrangement as possible for all boats affected, whether or not they asked for redress.',
        appeals: [
          { case: 'Case 110', summary: 'The protest committee may apply any applicable rule even if not cited in the protest, provided the boat had a fair opportunity to respond.' }
        ]
      },
      '69': {
        title: 'Rule 69 — Misconduct',
        text: '<strong>69.1</strong> An allegation of a breach of good manners, a breach of good sportsmanship, or bringing the sport into disrepute may be resolved by the protest committee, subject to the requirements of this rule, whether or not the boat or competitor is racing.<br><strong>69.2</strong> The protest committee shall conduct the hearing following the procedures of rules 63.2 through 63.6. If it decides the allegation is justified, it may warn the competitor, impose a points penalty, or exclude the competitor and any boat she has been sailing on. The committee shall promptly report the facts, its findings, and any penalty to the national authority.',
        appeals: [
          { case: 'Case 73', summary: 'Making false statements to a protest committee is a serious breach of sportsmanship that can lead to action under rules 2 and 69.' },
          { case: 'Case 138', summary: 'Abusive language toward race officials, competitors, or volunteers may constitute a breach of rule 69.' }
        ]
      }
    };

    // US Sailing prescriptions database for rule number lookup
    const usDB = {
      '3': { title: 'US Prescription to Rule 3', text: 'The prescriptions of US Sailing shall apply. The organizing authority of a race or regatta that is not an international event may change the prescriptions by stating so in the Notice of Race or Sailing Instructions.', appeals: [] },
      '60': { title: 'US Prescription to Rule 60.3(a)', text: 'A protest committee may protest a boat, but not based solely on information in a report from an interested party. It may also call a hearing under rule 69 based on its own observation or a report received from any source.', appeals: [] },
      '61': { title: 'US Prescription to Rule 61.1(a)', text: 'For boats under 6 meters (20 feet) in overall length, the requirement to display a red flag does not apply. A hail of "Protest" is sufficient.', appeals: [{ case: 'US Appeal 45', summary: 'A Snipe (under 20 ft) that hailed "Protest" but did not display a red flag satisfied the US prescription. The protest was valid.' }] },
      '63': { title: 'US Prescription to Rule 63.3(a)', text: 'A support person who is not a party to the hearing and is representing a party shall be permitted. A minor shall be entitled to be accompanied by a support person who may speak on the minor\\'s behalf.', appeals: [] },
      '64': { title: 'US Prescription to Rule 64.4', text: 'If the protest committee has reasonable doubt about a matter related to the protest, it shall resolve the doubt in favor of the protested boat. Standard of proof: preponderance of the evidence.', appeals: [{ case: 'US Appeal 72', summary: 'When two equally credible accounts of an incident were presented, the protest committee was required to resolve the doubt in favor of the protested boat under the US prescription.' }] },
      '67': { title: 'US Prescription to Rule 67', text: 'The question of damages arising from a breach of any of these rules shall be governed by the applicable prescriptions of US Sailing and by the law applicable to the matter in dispute.', appeals: [] },
      '69': { title: 'US Prescription to Rule 69', text: 'When a protest committee has acted under rule 69, the executive director or designee shall review the report. If warranted, a hearing may be scheduled before a Disciplinary Board. Penalties may include suspension of membership and ineligibility for US Sailing events.', appeals: [{ case: 'US Sailing Disciplinary Case', summary: 'A sailor who made threatening remarks to a race committee member was reported under rule 69. US Sailing Disciplinary Board suspended membership for one year.' }] },
      '70': { title: 'US Prescription to Rule 70.5 — Right of Appeal', text: 'Decisions of protest committees may be appealed to US Sailing within 15 days. The decision of the US Sailing Appeals Committee is final. An appeal fee is required but refundable if the appeal is upheld.', appeals: [{ case: 'US Appeal 101', summary: 'An appeal filed 16 days after the decision was rejected as untimely. The 15-day limit is strictly enforced.' }] }
    };

    // Ruleset toggle
    let activeRuleset = 'world';
    const btnWorld = document.getElementById('btn-world');
    const btnUs = document.getElementById('btn-us');
    const worldDiv = document.getElementById('rrs-all');
    const usDiv = document.getElementById('rrs-us');
    const refP = document.getElementById('rrs-ref');
    const sourceDiv = document.getElementById('ruleset-source');

    function setRuleset(rs) {
      activeRuleset = rs;
      if (rs === 'world') {
        worldDiv.style.display = '';
        usDiv.style.display = 'none';
        btnWorld.className = 'btn btn-primary ruleset-btn active-ruleset';
        btnUs.className = 'btn btn-secondary ruleset-btn';
        sourceDiv.textContent = 'Showing: World Sailing — Racing Rules of Sailing 2025-2028';
        refP.innerHTML = 'Reference: <a href="https://www.sailing.org/inside-world-sailing/rules-regulations/racing-rules-of-sailing/" target="_blank" style="color:#1565c0;">World Sailing — Racing Rules of Sailing 2025-2028</a>. This is a summary for quick reference.';
      } else {
        worldDiv.style.display = 'none';
        usDiv.style.display = '';
        btnWorld.className = 'btn btn-secondary ruleset-btn';
        btnUs.className = 'btn btn-primary ruleset-btn active-ruleset';
        sourceDiv.textContent = 'Showing: US Sailing Prescriptions to the Racing Rules of Sailing';
        refP.innerHTML = 'Reference: <a href="https://www.ussailing.org/competition/rules-officiating/the-racing-rules-of-sailing/" target="_blank" style="color:#1565c0;">US Sailing — The Racing Rules of Sailing</a>. US prescriptions modify or supplement World Sailing rules for races in the United States.';
      }
      ruleDetail.style.display = 'none';
    }
    btnWorld.addEventListener('click', () => setRuleset('world'));
    btnUs.addEventListener('click', () => setRuleset('us'));

    const ruleNumInput = document.getElementById('rrs-rulenum');
    const ruleNumMic = document.getElementById('rrs-num-mic');
    const ruleDetail = document.getElementById('rrs-rule-detail');

    function lookupRule() {
      const num = ruleNumInput.value.trim().replace(/^rule\\s*/i, '').replace(/^#/, '').trim();
      if (!num) { ruleDetail.style.display = 'none'; return; }
      const db = activeRuleset === 'us' ? usDB : ruleDB;
      const rule = db[num];
      // Also check the other DB for cross-reference
      const otherDB = activeRuleset === 'us' ? ruleDB : usDB;
      const otherRule = otherDB[num];
      if (!rule && !otherRule) {
        ruleDetail.style.display = '';
        ruleDetail.innerHTML = '<div class="rrs-rule" style="border-color:#e53e3e;"><h4 style="color:#e53e3e;">Rule ' + num + ' not found</h4><p>Try entering just the rule number (e.g. 10, 18, 44). Available rules in current ruleset: ' + Object.keys(db).join(', ') + '</p></div>';
        return;
      }
      if (!rule) {
        ruleDetail.style.display = '';
        ruleDetail.innerHTML = '<div class="rrs-rule" style="border-color:#f59e0b;"><h4 style="color:#92400e;">No ' + (activeRuleset === 'us' ? 'US Sailing prescription' : 'World Sailing rule') + ' for Rule ' + num + '</h4><p>This rule exists in the ' + (activeRuleset === 'us' ? 'World Sailing' : 'US Sailing') + ' ruleset. Switch rulesets above to view it.</p></div>';
        return;
      }
      let html = '<div class="rrs-rule" style="border:2px solid #0b3d6e;padding:24px;">';
      html += '<h4 style="font-size:1.2rem;">' + rule.title + '</h4>';
      html += '<div style="margin:12px 0;line-height:1.7;color:#333;">' + rule.text + '</div>';
      if (rule.appeals.length > 0) {
        html += '<div style="margin-top:16px;padding-top:14px;border-top:2px solid #e2e8f0;">';
        html += '<h4 style="color:#8b5e0f;font-size:1rem;margin-bottom:10px;">⚖️ Related Appeals & Cases</h4>';
        rule.appeals.forEach(a => {
          html += '<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 14px;margin-bottom:8px;">';
          html += '<strong style="color:#92400e;">' + a.case + ':</strong> ';
          html += '<span style="color:#555;">' + a.summary + '</span>';
          html += '</div>';
        });
        html += '</div>';
      } else {
        html += '<div style="margin-top:12px;color:#888;font-style:italic;">No notable appeals or cases on file for this rule.</div>';
      }
      html += '</div>';
      ruleDetail.innerHTML = html;
      ruleDetail.style.display = '';
    }

    document.getElementById('rrs-lookup').addEventListener('click', lookupRule);
    ruleNumInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') lookupRule(); });

    // Voice input for rule number
    if (SR && ruleNumMic) {
      ruleNumMic.addEventListener('click', function() {
        if (ruleNumMic.classList.contains('listening')) return;
        const rec = new SR();
        rec.lang = 'en-US';
        rec.interimResults = false;
        rec.continuous = false;
        ruleNumMic.classList.add('listening');
        rec.onresult = function(e) {
          let text = e.results[0][0].transcript.trim();
          // Extract number from speech like "rule 18", "18", "rule eighteen"
          const wordNums = {one:'1',two:'2',three:'3',four:'4',five:'5',six:'6',seven:'7',eight:'8',nine:'9',ten:'10',eleven:'11',twelve:'12',thirteen:'13',fourteen:'14',fifteen:'15',sixteen:'16',seventeen:'17',eighteen:'18',nineteen:'19',twenty:'20',twenty1:'21',twenty8:'28',twenty9:'29',thirty:'30',thirty1:'31',forty2:'42',forty4:'44',sixty:'60',sixty1:'61',sixty2:'62',sixty3:'63',sixty4:'64',sixty9:'69'};
          text = text.toLowerCase().replace(/rule\\s*/i, '');
          for (const [w, n] of Object.entries(wordNums)) { if (text.includes(w)) { text = n; break; } }
          const numMatch = text.match(/\\d+/);
          if (numMatch) text = numMatch[0];
          ruleNumInput.value = text;
          lookupRule();
          ruleNumMic.classList.remove('listening');
        };
        rec.onerror = function() { ruleNumMic.classList.remove('listening'); };
        rec.onend = function() { ruleNumMic.classList.remove('listening'); };
        rec.start();
      });
    } else if (ruleNumMic) {
      ruleNumMic.style.display = 'none';
    }
  })();
  </script>`, req.session.user, getLang(req)));
});

// --- SNIPE CLASS RULES ---
app.get("/snipe-rules", (req, res) => {
  const lang = getLang(req);
  const L = (k) => t(k, lang);
  res.send(renderPage(`<div class="container">
    <h2>${L('snipeClassRulesTitle')}</h2>
    <p style="color:#555;margin-bottom:12px;">${L('snipeClassRulesDesc')}</p>
    ${lang !== 'en' ? `<p style="color:#c53030;font-size:0.88rem;margin-bottom:16px;padding:8px 12px;background:#fef3cd;border-radius:6px;border:1px solid #fcd34d;">⚠️ ${L('rulesInEnglish')}</p>` : ''}
    <p style="color:#888;font-size:0.85rem;margin-bottom:20px;">📄 <a href="https://www.snipe.org/class-rules/" target="_blank" style="color:#1565c0;">Download the full official Class Rules PDF from snipe.org</a></p>

    <div style="display:flex;gap:8px;margin-bottom:24px;max-width:600px;">
      <div class="input-wrap" style="flex:1;position:relative;">
        <input type="text" id="snipe-search" placeholder="${L('searchClassRulesPlaceholder')}" style="width:100%;padding:12px 44px 12px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;">
        <button type="button" id="snipe-mic" class="mic-btn" title="${L('voiceSearch')}" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);">🎤</button>
      </div>
    </div>
    <div id="snipe-results"></div>

    <div id="snipe-all">

      <div class="form-section" style="margin-top:0;">Section 1 — General</div>
      <div class="rrs-rule" data-keywords="general, design, history, crosby, one-design, class, scira, association">
        <h4>1.1 — The Snipe Class</h4>
        <p>The Snipe is a 15-foot 6-inch (4.72m), two-person, one-design racing dinghy designed by William F. Crosby in 1931. It is governed by the Snipe Class International Racing Association (SCIRA). The class is sailed in over 30 countries with active fleets worldwide.</p>
      </div>
      <div class="rrs-rule" data-keywords="authority, scira, governing, international, jurisdiction, administration">
        <h4>1.2 — Governing Authority</h4>
        <p>SCIRA is the governing authority for the Snipe class. All boats shall comply with the International Snipe Building Specification and these class rules. Only SCIRA-licensed builders may produce hulls for class racing.</p>
      </div>
      <div class="rrs-rule" data-keywords="measurement, certificate, registration, sail number, compliance, inspection">
        <h4>1.3 — Measurement & Registration</h4>
        <p>Each Snipe shall have a valid measurement certificate. Sail numbers are assigned by SCIRA national secretaries. Boats must be available for measurement and inspection at any event. The measurement certificate must be available upon request.</p>
      </div>
      <div class="rrs-rule" data-keywords="licensed, builder, approved, manufacturer, construction, authorization">
        <h4>1.4 — Licensed Builders</h4>
        <p>Snipe hulls may only be built by SCIRA-licensed builders. Current licensed builders include JibeTech (USA), DB Marine/MAS (Italy), Zeltic (Spain), and Persson (Sweden). Building without a license is prohibited.</p>
      </div>

      <div class="form-section">Section 2 — Hull Specifications</div>
      <div class="rrs-rule" data-keywords="hull, length, overall, LOA, dimension, feet, meters">
        <h4>2.1 — Hull Length</h4>
        <p><strong>Length Overall (LOA):</strong> 15 ft 6 in (4.72 m)<br>
        <strong>Waterline Length (LWL):</strong> 12 ft 8 in (3.86 m)<br>
        The hull length is measured from the forward face of the stem to the aft face of the transom along the centerline. Tolerances are specified in the measurement handbook.</p>
      </div>
      <div class="rrs-rule" data-keywords="beam, width, hull, maximum, dimension">
        <h4>2.2 — Beam</h4>
        <p><strong>Maximum Beam:</strong> 5 ft 0 in (1.52 m)<br>
        Measured at the widest point of the hull. The hull features a hard-chine design.</p>
      </div>
      <div class="rrs-rule" data-keywords="weight, minimum, hull, displacement, pounds, kilograms, corrector weights">
        <h4>2.3 — Minimum Weight</h4>
        <p><strong>Minimum Hull Weight:</strong> 381 lbs (173 kg) — rigged hull without sails<br>
        This includes all rigging, fittings, and equipment permanently attached. If a hull is underweight, corrector weights shall be added and secured in a position specified by the class rules. The minimum weight ensures sound construction and fairness.</p>
      </div>
      <div class="rrs-rule" data-keywords="draft, centerboard, daggerboard, depth, board down, board up, retractable">
        <h4>2.4 — Draft</h4>
        <p><strong>Draft (board down):</strong> 3 ft 3 in (0.99 m)<br>
        <strong>Draft (board up):</strong> 6 in (0.15 m)<br>
        The Snipe uses a retractable daggerboard (not a pivoting centerboard). The board trunk position and dimensions are specified in the building specification.</p>
      </div>
      <div class="rrs-rule" data-keywords="construction, material, fiberglass, wood, frp, gelcoat, hull material, core">
        <h4>2.5 — Hull Construction</h4>
        <p>Hulls shall be constructed of fiberglass reinforced plastic (FRP). Wood hulls built prior to fiberglass adoption remain eligible. No exotic materials (carbon fiber, Kevlar) are permitted in the hull shell. Core materials are specified by the building specification. All hulls must conform to the official mold dimensions.</p>
      </div>
      <div class="rrs-rule" data-keywords="transom, stern, rudder, gudgeon, pintle, tiller, transom hung">
        <h4>2.6 — Transom & Rudder Mounting</h4>
        <p>The transom has an angled rake as specified in the building plans. The rudder is transom-hung using pintles and gudgeons. The tiller with extension is mandatory. The rudder blade shall be of the shape and dimensions specified in the class rules.</p>
      </div>
      <div class="rrs-rule" data-keywords="buoyancy, flotation, tank, air tank, self rescue, capsize, foam">
        <h4>2.7 — Buoyancy</h4>
        <p>Sufficient built-in buoyancy is required to keep the boat afloat when capsized or swamped. Air tanks or foam flotation shall be fitted as specified. The buoyancy shall be sufficient to support the crew in the water alongside the capsized boat.</p>
      </div>
      <div class="rrs-rule" data-keywords="fittings, hardware, deck, modification, alteration, permitted, prohibited">
        <h4>2.8 — Fittings & Modifications</h4>
        <p>Only fittings and modifications specifically permitted by the class rules may be used. All boats must maintain the one-design character. Decks, cockpit layout, and structural modifications beyond what is permitted are prohibited. Running rigging control lines and their leads may be configured as the sailor chooses within the rules.</p>
      </div>

      <div class="form-section">Section 3 — Rig & Mast Specifications</div>
      <div class="rrs-rule" data-keywords="rig, sloop, fractional, rig type, mast, standing rigging">
        <h4>3.1 — Rig Type</h4>
        <p>The Snipe uses a <strong>fractional sloop rig</strong> with a single set of shrouds and no forestay (the jib luff wire acts as the headstay). The rig is unstayed aft — there is no backstay.</p>
      </div>
      <div class="rrs-rule" data-keywords="mast, length, height, maximum, heel, section, aluminum, material, bend, prebend">
        <h4>3.2 — Mast Specifications</h4>
        <p><strong>Maximum mast length:</strong> 6,499 mm (21 ft 4 in) from heel to top measurement point (post-2000 boats)<br>
        <strong>Material:</strong> Aluminum alloy<br>
        <strong>Mast step position:</strong> The step shall be located 390–400 mm from the sheer as specified<br>
        Carbon fiber and other exotic materials are not permitted. The mast section, wall thickness, and taper must conform to approved specifications. Controlled pre-bend is permitted within class tolerances.</p>
      </div>
      <div class="rrs-rule" data-keywords="boom, length, material, aluminum, gooseneck, vang, outhaul">
        <h4>3.3 — Boom</h4>
        <p>The boom shall be aluminum alloy. Maximum and minimum dimensions are specified. The boom attaches to the mast via a gooseneck fitting. Boom vang, outhaul, and cunningham attachment points are permitted as specified.</p>
      </div>
      <div class="rrs-rule" data-keywords="shroud, wire, standing rigging, tension, spreader, chainplate, hound">
        <h4>3.4 — Standing Rigging & Spreaders</h4>
        <p><strong>Shrouds:</strong> Single set of shrouds, wire or rod as permitted<br>
        <strong>Wire sizes:</strong> 2.5mm compressed strand or 3mm standard are commonly used<br>
        <strong>Spreaders:</strong> Required, one pair. Spreader length and sweep angle are adjustable within class limits<br>
        Chainplate positions are fixed by the building specification. Shroud tension is adjustable at the turnbuckles.</p>
      </div>
      <div class="rrs-rule" data-keywords="mast rake, measurement, tune, transom, distance, tape measure">
        <h4>3.5 — Mast Rake</h4>
        <p>Mast rake is measured as the distance from the top of the mast to the transom using a tape measure hoisted on the main halyard. Typical rake ranges from 25'8" to 25'11" depending on conditions. The rake is adjusted via shroud tension and turnbuckle length.</p>
      </div>

      <div class="form-section">Section 4 — Sail Specifications</div>
      <div class="rrs-rule" data-keywords="sail, area, total, square feet, square meters, combined">
        <h4>4.1 — Total Sail Area</h4>
        <p><strong>Total sail area:</strong> 128 sq ft (11.9 m²)<br>
        This is the combined area of the mainsail and jib. No spinnaker or other headsails are permitted. Only two sails may be carried and used while racing.</p>
      </div>
      <div class="rrs-rule" data-keywords="mainsail, main, luff, leech, foot, roach, batten, measurement, black band">
        <h4>4.2 — Mainsail</h4>
        <p>The mainsail dimensions (luff, leech, foot, and roach) are strictly specified. Battens are required and their number, length, and position are controlled. Sail shall not extend beyond the black bands on mast and boom. Window panels are permitted within specified size limits. The mainsail shall be measured and stamped by an official measurer.</p>
      </div>
      <div class="rrs-rule" data-keywords="jib, headsail, luff, leech, foot, jib wire, measurement, genoa">
        <h4>4.3 — Jib</h4>
        <p>The jib dimensions are strictly specified. The jib luff wire serves as the headstay. Jib sheet lead position is adjustable within the cockpit. No overlapping headsails (genoas) are permitted. The jib shall be measured and stamped by an official measurer.</p>
      </div>
      <div class="rrs-rule" data-keywords="sail, maker, manufacturer, cloth, material, laminate, dacron, polyester, mylar">
        <h4>4.4 — Sail Material & Makers</h4>
        <p>Sails shall be made of woven polyester (Dacron) cloth. Laminate sails (Mylar, Kevlar, carbon) are not permitted. Sails may be obtained from any sailmaker. Popular Snipe sailmakers include Quantum Sails, North Sails, and Olimpic Sails. Each sail must carry the SCIRA class emblem and assigned sail number.</p>
      </div>
      <div class="rrs-rule" data-keywords="sail number, insignia, class emblem, snipe bird, display, numeral">
        <h4>4.5 — Sail Numbers & Insignia</h4>
        <p>Each boat is assigned a unique sail number by SCIRA. The Snipe class insignia (the snipe bird) shall be displayed on the mainsail as specified. Sail numbers shall be displayed on both sides of the mainsail in contrasting color, with minimum numeral height and spacing as specified in the class rules.</p>
      </div>

      <div class="form-section">Section 5 — Daggerboard & Rudder</div>
      <div class="rrs-rule" data-keywords="daggerboard, centerboard, board, profile, shape, material, wood, fiberglass, foil">
        <h4>5.1 — Daggerboard</h4>
        <p>The Snipe uses a retractable daggerboard (not a pivoting centerboard). The board profile, maximum thickness, length, and width are specified. Material shall be wood, fiberglass, or approved composites — no carbon fiber. The board shall fit within the trunk without excessive play. The leading and trailing edge profiles are controlled.</p>
      </div>
      <div class="rrs-rule" data-keywords="rudder, blade, shape, profile, dimension, material, kick-up, fixed">
        <h4>5.2 — Rudder</h4>
        <p>The rudder blade shape, dimensions, and profile are specified. The rudder is transom-hung and may be a fixed or kick-up design. Material shall be wood, fiberglass, or approved composites — no carbon fiber. The rudder cheeks and blade thickness are controlled by the measurement rules.</p>
      </div>

      <div class="form-section">Section 6 — Crew & Equipment</div>
      <div class="rrs-rule" data-keywords="crew, number, two, persons, skipper, weight, limit, maximum, combined, hiking">
        <h4>6.1 — Crew</h4>
        <p><strong>Number of crew:</strong> 2 (skipper and crew)<br>
        There is no maximum or minimum crew weight limit in the class rules. Optimal combined weight is generally 260–340 lbs (118–154 kg). Both crew members may hike using hiking straps. Trapeze is not permitted.</p>
      </div>
      <div class="rrs-rule" data-keywords="equipment, required, mandatory, paddle, bailer, anchor, safety, pfd, life jacket">
        <h4>6.2 — Required Equipment</h4>
        <p>Required equipment includes: paddle or oar, bailer or pump, and adequate personal flotation devices as required by the sailing instructions. An anchor with sufficient line may be required by the Notice of Race. All required equipment shall be carried while racing.</p>
      </div>
      <div class="rrs-rule" data-keywords="prohibited, equipment, electronic, gps, compass, instrument, device, camera">
        <h4>6.3 — Prohibited Equipment</h4>
        <p>Electronic instruments for measuring wind speed, wind direction, boat speed, or compass heading are prohibited while racing. A traditional magnetic compass is permitted. No communication devices may be used for coaching during racing. Cameras and recording devices are permitted but may not provide performance data.</p>
      </div>
      <div class="rrs-rule" data-keywords="hiking, straps, trapeze, body position, crew position">
        <h4>6.4 — Hiking</h4>
        <p>Hiking straps are mandatory and their positioning is specified. All hiking shall be done using the hiking straps — no mechanical hiking aids, racks, wings, or trapeze systems are permitted. Crew members' bodies shall not extend beyond the hull's natural line as aided by the hiking straps.</p>
      </div>

      <div class="form-section">Section 7 — Racing & Competition</div>
      <div class="rrs-rule" data-keywords="championship, worlds, western hemisphere, eastern hemisphere, national, continental, regatta">
        <h4>7.1 — Major Championships</h4>
        <p>SCIRA sanctions the following major championships:<br>
        <strong>World Championship</strong> — alternates between Western and Eastern Hemispheres<br>
        <strong>Western Hemisphere & Orient Championship (WHOC)</strong><br>
        <strong>European Championship</strong><br>
        <strong>South American Championship</strong><br>
        <strong>National Championships</strong> — organized by each country's national secretary<br>
        Championship events have specific entry requirements including SCIRA membership and valid measurement certificates.</p>
      </div>
      <div class="rrs-rule" data-keywords="membership, scira, dues, eligibility, racing, requirements">
        <h4>7.2 — Membership & Eligibility</h4>
        <p>To race in SCIRA-sanctioned events, the skipper must be a current SCIRA member. Crew membership is encouraged but may not be required for all events. Membership is obtained through national SCIRA secretaries. Annual dues support class administration, publications, and championship organization.</p>
      </div>
      <div class="rrs-rule" data-keywords="charter, borrow, boat, use, permitted, event, ownership">
        <h4>7.3 — Chartering Boats</h4>
        <p>Chartering (borrowing) boats for events is permitted and encouraged to promote international competition. The charter boat must have a valid measurement certificate and comply with all class rules. Charter arrangements are common at major championships where shipping boats is impractical.</p>
      </div>

    </div>

    <p style="margin-top:32px;color:#888;font-size:0.85rem;">${L('classRulesReference')}</p>
  </div>
  <script>
  (function() {
    const input = document.getElementById('snipe-search');
    const micBtn = document.getElementById('snipe-mic');
    const results = document.getElementById('snipe-results');
    const rules = document.querySelectorAll('#snipe-all .rrs-rule');

    function search(query) {
      if (!query.trim()) {
        results.innerHTML = '';
        rules.forEach(r => r.style.display = '');
        return;
      }
      const terms = query.toLowerCase().split(/\\s+/);
      let found = [];
      rules.forEach(r => {
        const text = (r.textContent + ' ' + (r.dataset.keywords || '')).toLowerCase();
        const match = terms.every(t => text.includes(t));
        r.style.display = match ? '' : 'none';
        if (match) found.push(r);
      });
      if (found.length === 0) {
        results.innerHTML = '<div class="alert" style="background:#fff3cd;color:#856404;padding:12px;border-radius:8px;margin-bottom:16px;">No rules found matching your search. Try keywords like "hull weight", "mast", "sail area", "daggerboard".</div>';
      } else {
        results.innerHTML = '<div style="color:#555;margin-bottom:12px;">Found ' + found.length + ' matching rule(s):</div>';
      }
    }

    input.addEventListener('input', () => search(input.value));

    // Voice search
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR && micBtn) {
      micBtn.addEventListener('click', function() {
        if (micBtn.classList.contains('listening')) return;
        const rec = new SR();
        rec.lang = 'en-US';
        rec.interimResults = false;
        rec.continuous = false;
        micBtn.classList.add('listening');
        rec.onresult = function(e) {
          const text = e.results[0][0].transcript;
          input.value = text;
          search(text);
          micBtn.classList.remove('listening');
        };
        rec.onerror = function() { micBtn.classList.remove('listening'); };
        rec.onend = function() { micBtn.classList.remove('listening'); };
        rec.start();
      });
    } else if (micBtn) {
      micBtn.style.display = 'none';
    }
  })();
  </script>`, req.session.user, getLang(req)));
});

// --- SNIPE REGATTAS ---
// Shared event list — single source of truth
const knownEvents = {
  us: [
    { date: '2026-01-03', title: 'Miami Snipe Invitational (Junior & U31)', location: 'US Sailing Center, Miami, FL' },
    { date: '2026-01-10', title: 'Las Vegas Regatta', location: 'Mission Bay, CA' },
    { date: '2026-01-31', title: 'Comodoro Rasco', location: 'Coconut Grove Sailing Club, Miami, FL' },
    { date: '2026-02-06', title: 'Snipe Midwinters', location: 'Key Largo, FL' },
    { date: '2026-02-28', title: 'Georgia State Championship', location: 'Lake Park, GA' },
    { date: '2026-03-05', title: 'Bacardi Cup Invitational', location: 'Miami Regatta Park, FL' },
    { date: '2026-04-10', title: 'Don Q (60th Edition)', location: 'Miami, FL' },
    { date: '2026-04-25', title: 'AYC Open', location: 'Acworth, GA' },
    { date: '2026-05-16', title: 'Herb Shear Invite', location: 'Mission Bay, CA' },
    { date: '2026-06-06', title: 'Colonial Cup', location: 'Annapolis, MD' },
    { date: '2026-06-11', title: 'US National Championship', location: 'Annapolis, MD' },
    { date: '2026-06-20', title: 'Boston Snipe A/B', location: 'Winthrop, MA' },
    { date: '2026-06-27', title: 'Fire on the Water', location: 'Raymond, NE' },
    { date: '2026-07-11', title: 'Newport Regatta', location: 'Newport, RI' },
    { date: '2026-07-11', title: 'Norm Tanner Memorial Regatta', location: 'Bow Mar, CO' },
    { date: '2026-08-01', title: 'Junior & Under 30 MBYC', location: 'Mission Bay, CA' },
    { date: '2026-08-01', title: 'New England Championship', location: 'Winthrop, MA' },
    { date: '2026-08-08', title: 'Rocky Mountain Championship', location: 'Longmont, CO' },
    { date: '2026-08-22', title: 'Board of Governors', location: 'Middlebury, CT' },
    { date: '2026-08-22', title: "US Women's Nationals", location: 'Mission Bay, CA' },
    { date: '2026-08-28', title: 'North American Championship', location: 'Newport, RI' },
    { date: '2026-09-12', title: 'Missouri Valley & District II Championship', location: 'Council Bluffs, IA' },
    { date: '2026-09-25', title: 'US Master Nationals', location: 'Mooresville, NC' },
    { date: '2026-10-10', title: 'Frigid Digit', location: 'Annapolis, MD' },
    { date: '2026-10-10', title: 'Texas State Championship', location: 'Dallas, TX' },
    { date: '2026-10-24', title: 'AYC Halloween Regatta', location: 'Acworth, GA' },
    { date: '2026-10-24', title: 'Carolyn Nute Regatta', location: 'Mission Bay, CA' }
  ],
  global: [
    { date: '2026-03-30', title: 'South American Championship', location: 'Olivos, Buenos Aires, Argentina' },
    { date: '2026-04-02', title: 'Copa de España', location: 'Los Nietos, Spain' },
    { date: '2026-04-18', title: 'Regata Nazionale Portovenere', location: 'Portovenere, Italy' },
    { date: '2026-05-01', title: 'Gran Trofeo Valencia', location: 'Valencia, Spain' },
    { date: '2026-05-02', title: 'Blackwater SC Snipe Open', location: 'Maldon, UK' },
    { date: '2026-05-23', title: 'Nordic Championship', location: 'Saro, Sweden' },
    { date: '2026-06-05', title: 'Mixed European Championship', location: 'Tavira, Portugal' },
    { date: '2026-06-20', title: 'Sipar International', location: 'Moscenicka Draga, Croatia' },
    { date: '2026-06-26', title: 'European Cup', location: 'Gdansk, Poland' },
    { date: '2026-07-04', title: 'Regata Nazionale — Trofeo Morin', location: 'Monfalcone, Italy' },
    { date: '2026-07-20', title: 'Snipe Junior World Championship', location: 'Melilla, Spain' },
    { date: '2026-08-14', title: "SWEC Women's Europeans", location: 'Tonsberg, Norway' },
    { date: '2026-08-19', title: 'Snipe Master European Championship', location: 'Tonsberg, Norway' },
    { date: '2026-09-21', title: 'Snipe World Championship', location: 'Mahon, Spain' },
    { date: '2026-11-26', title: "Snipe Women's Hemisphere Cup", location: 'Niteroi, RJ, Brazil' }
  ]
};

function makeEventKey(e, region) { return region + '_' + e.date + '_' + e.title.replace(/[^a-zA-Z0-9]/g, ''); }

// Build set of all valid event keys
const validEventKeys = new Set();
knownEvents.us.forEach(e => validEventKeys.add(makeEventKey(e, 'us')));
knownEvents.global.forEach(e => validEventKeys.add(makeEventKey(e, 'global')));

app.post("/api/regatta-attend", requireAuth, (req, res) => {
  const { event_key, event_date, event_title, event_location, event_region, attending } = req.body;
  if (attending === '1') {
    db.prepare("INSERT OR IGNORE INTO regatta_attendance (user_id, event_key, event_date, event_title, event_location, event_region) VALUES (?,?,?,?,?,?)").run(req.session.user.id, event_key, event_date, event_title, event_location || '', event_region || '');
  } else {
    db.prepare("DELETE FROM regatta_attendance WHERE user_id = ? AND event_key = ?").run(req.session.user.id, event_key);
  }
  res.json({ ok: true });
});

app.get("/api/my-regattas", requireAuth, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  // Clean up any stale/invalid records first
  db.prepare("DELETE FROM regatta_attendance WHERE user_id = ? AND event_key NOT IN (" + [...validEventKeys].map(() => '?').join(',') + ")").run(req.session.user.id, ...validEventKeys);
  const events = db.prepare("SELECT * FROM regatta_attendance WHERE user_id = ? AND event_date >= ? ORDER BY event_date ASC").all(req.session.user.id, today);
  res.json(events);
});

app.get("/regattas", (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const user = req.session.user;
  const allEvents = knownEvents;

  // Filter to today forward
  const usEvents = allEvents.us.filter(e => e.date >= today);
  const globalEvents = allEvents.global.filter(e => e.date >= today);

  // Get user's attending list
  let attendingKeys = new Set();
  if (user) {
    const rows = db.prepare("SELECT event_key FROM regatta_attendance WHERE user_id = ?").all(user.id);
    rows.forEach(r => attendingKeys.add(r.event_key));
  }

  function makeKey(e, region) { return makeEventKey(e, region); }

  function renderEventCards(events, region) {
    if (events.length === 0) return '<div style="text-align:center;padding:30px;color:#888;">No upcoming events in this category.</div>';
    return events.map(e => {
      const d = new Date(e.date + 'T12:00:00');
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const year = d.getFullYear();
      const now = new Date(); now.setHours(0,0,0,0);
      const daysAway = Math.round((d - now) / 86400000);
      const urgency = daysAway <= 7 ? '#e53e3e' : daysAway <= 30 ? '#d69e2e' : '#38a169';
      const badge = daysAway <= 0 ? 'Today!' : daysAway === 1 ? 'Tomorrow' : daysAway + ' days';
      const key = makeKey(e, region);
      const isAttending = attendingKeys.has(key);
      const checkboxHtml = user ?
        '<label class="attend-label" style="display:flex;align-items:center;gap:6px;cursor:pointer;white-space:nowrap;font-size:0.85rem;color:' + (isAttending ? '#2e7d32' : '#888') + ';font-weight:600;">' +
          '<input type="checkbox" class="attend-cb" data-key="' + escapeHtml(key) + '" data-date="' + escapeHtml(e.date) + '" data-title="' + escapeHtml(e.title) + '" data-location="' + escapeHtml(e.location) + '" data-region="' + escapeHtml(region) + '" ' + (isAttending ? 'checked' : '') + ' style="width:18px;height:18px;cursor:pointer;accent-color:#0b3d6e;">' +
          (isAttending ? '⛵ Attending' : 'Attend?') +
        '</label>' : '';
      return '<div class="rrs-rule regatta-card" data-key="' + escapeHtml(key) + '" style="display:flex;align-items:center;gap:16px;padding:14px 18px;' + (isAttending ? 'border-left:4px solid #2e7d32;background:#f0fdf4;' : '') + '">' +
        '<div style="min-width:80px;text-align:center;">' +
          '<div style="font-size:0.7rem;color:#888;text-transform:uppercase;">' + escapeHtml(dayName) + '</div>' +
          '<div style="font-size:1.3rem;font-weight:700;color:#0b3d6e;">' + escapeHtml(monthDay) + '</div>' +
          '<div style="font-size:0.7rem;color:#888;">' + year + '</div>' +
        '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-weight:600;color:#333;font-size:1rem;">' + escapeHtml(e.title) + '</div>' +
          '<div style="color:#666;font-size:0.88rem;margin-top:2px;">📍 ' + escapeHtml(e.location) + '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">' +
          '<span style="background:' + urgency + ';color:white;padding:3px 10px;border-radius:12px;font-size:0.78rem;font-weight:600;white-space:nowrap;">' + badge + '</span>' +
          checkboxHtml +
        '</div>' +
      '</div>';
    }).join('');
  }

  const usHtml = renderEventCards(usEvents, 'us');
  const globalHtml = renderEventCards(globalEvents, 'global');
  const todayDisplay = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // My Regattas section
  // Clean stale records and get only valid attending events
  if (user) {
    const validKeysArr = [...validEventKeys];
    if (validKeysArr.length > 0) {
      db.prepare("DELETE FROM regatta_attendance WHERE user_id = ? AND event_key NOT IN (" + validKeysArr.map(() => '?').join(',') + ")").run(user.id, ...validKeysArr);
    }
  }
  const myEvents = user ? db.prepare("SELECT * FROM regatta_attendance WHERE user_id = ? AND event_date >= ? ORDER BY event_date ASC").all(user.id, today) : [];
  let myHtml = '';
  if (myEvents.length > 0) {
    myHtml = myEvents.map(e => {
      const d = new Date(e.event_date + 'T12:00:00');
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const year = d.getFullYear();
      const now = new Date(); now.setHours(0,0,0,0);
      const daysAway = Math.round((d - now) / 86400000);
      const urgency = daysAway <= 7 ? '#e53e3e' : daysAway <= 30 ? '#d69e2e' : '#38a169';
      const badge = daysAway <= 0 ? 'Today!' : daysAway === 1 ? 'Tomorrow' : daysAway + ' days';
      return '<div class="rrs-rule" style="display:flex;align-items:center;gap:16px;padding:14px 18px;border-left:4px solid #2e7d32;background:#f0fdf4;">' +
        '<div style="min-width:80px;text-align:center;">' +
          '<div style="font-size:0.7rem;color:#888;text-transform:uppercase;">' + escapeHtml(dayName) + '</div>' +
          '<div style="font-size:1.3rem;font-weight:700;color:#0b3d6e;">' + escapeHtml(monthDay) + '</div>' +
          '<div style="font-size:0.7rem;color:#888;">' + year + '</div>' +
        '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-weight:600;color:#333;font-size:1rem;">⛵ ' + escapeHtml(e.event_title) + '</div>' +
          (e.event_location ? '<div style="color:#666;font-size:0.88rem;margin-top:2px;">📍 ' + escapeHtml(e.event_location) + '</div>' : '') +
        '</div>' +
        '<div style="text-align:right;">' +
          '<span style="background:' + urgency + ';color:white;padding:3px 10px;border-radius:12px;font-size:0.78rem;font-weight:600;white-space:nowrap;">' + badge + '</span>' +
        '</div>' +
      '</div>';
    }).join('');
  } else {
    myHtml = '<div style="text-align:center;padding:30px;color:#888;">You haven\'t marked any upcoming regattas yet. Check the boxes on events you plan to attend!</div>';
  }

  const myBtnClass = user ? '' : ' style="display:none;"';

  res.send(renderPage('<div class="container">' +
    '<h2>Snipe Regattas & Events</h2>' +
    '<p style="color:#555;margin-bottom:8px;">Upcoming Snipe regattas from <strong>' + escapeHtml(todayDisplay) + '</strong> forward.</p>' +
    '<p style="color:#888;font-size:0.85rem;margin-bottom:16px;">' + (user ? 'Check the box to mark regattas you\'re attending.' : 'Log in to track which regattas you\'re attending.') + '</p>' +

    '<div style="display:flex;gap:8px;margin-bottom:24px;align-items:center;flex-wrap:wrap;">' +
      '<label style="font-weight:600;color:#0b3d6e;font-size:0.95rem;">View:</label>' +
      '<button type="button" id="btn-us-reg" class="btn btn-primary ruleset-btn active-ruleset" style="font-size:0.9rem;padding:8px 18px;">🇺🇸 US Regattas (' + usEvents.length + ')</button>' +
      '<button type="button" id="btn-global-reg" class="btn btn-secondary ruleset-btn" style="font-size:0.9rem;padding:8px 18px;">🌍 Global Regattas (' + globalEvents.length + ')</button>' +
      (user ? '<button type="button" id="btn-my-reg" class="btn btn-secondary ruleset-btn" style="font-size:0.9rem;padding:8px 18px;">⛵ My Regattas (' + myEvents.length + ')</button>' : '') +
    '</div>' +

    '<div id="reg-us"><div style="display:grid;gap:12px;">' + usHtml + '</div>' +
      '<div style="margin-top:12px;color:#888;font-size:0.83rem;">Showing ' + usEvents.length + ' upcoming US event(s)</div></div>' +

    '<div id="reg-global" style="display:none;"><div style="display:grid;gap:12px;">' + globalHtml + '</div>' +
      '<div style="margin-top:12px;color:#888;font-size:0.83rem;">Showing ' + globalEvents.length + ' upcoming global event(s)</div></div>' +

    (user ? '<div id="reg-my" style="display:none;"><div id="reg-my-content"><div style="text-align:center;padding:30px;color:#888;">Loading...</div></div></div>' : '') +

    '<div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap;">' +
      '<a href="https://snipeusa.com/regattas" target="_blank" style="display:inline-block;background:#0b3d6e;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">🇺🇸 Full schedule at SnipeUSA.com</a>' +
      '<a href="https://www.snipe.org/events/" target="_blank" style="display:inline-block;background:#1565c0;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">🌍 Full schedule at Snipe.org</a>' +
      '<a href="https://www.snipe.org" target="_blank" style="display:inline-block;background:#555;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">🔗 Snipe.org Official</a>' +
    '</div>' +
    '<p style="margin-top:16px;color:#999;font-size:0.8rem;">Event dates are approximate and subject to change. Check the official sites for the latest details, notices of race, and registration.</p>' +
  '</div>' +
  '<script>' +
  '(function() {' +
    'const panels = ["reg-us","reg-global"' + (user ? ',"reg-my"' : '') + '];' +
    'const btns = ["btn-us-reg","btn-global-reg"' + (user ? ',"btn-my-reg"' : '') + '];' +

    // Function to render a My Regattas card
    'function renderMyCard(e) {' +
      'const d = new Date(e.event_date + "T12:00:00");' +
      'const dayName = d.toLocaleDateString("en-US",{weekday:"short"});' +
      'const monthDay = d.toLocaleDateString("en-US",{month:"short",day:"numeric"});' +
      'const year = d.getFullYear();' +
      'const now = new Date(); now.setHours(0,0,0,0);' +
      'const daysAway = Math.round((d - now) / 86400000);' +
      'const urgency = daysAway <= 7 ? "#e53e3e" : daysAway <= 30 ? "#d69e2e" : "#38a169";' +
      'const badge = daysAway <= 0 ? "Today!" : daysAway === 1 ? "Tomorrow" : daysAway + " days";' +
      'return \'<div class="rrs-rule" style="display:flex;align-items:center;gap:16px;padding:14px 18px;border-left:4px solid #2e7d32;background:#f0fdf4;">\' +' +
        '\'<div style="min-width:80px;text-align:center;">\' +' +
        '\'<div style="font-size:0.7rem;color:#888;text-transform:uppercase;">\' + dayName + \'</div>\' +' +
        '\'<div style="font-size:1.3rem;font-weight:700;color:#0b3d6e;">\' + monthDay + \'</div>\' +' +
        '\'<div style="font-size:0.7rem;color:#888;">\' + year + \'</div></div>\' +' +
        '\'<div style="flex:1;">\' +' +
        '\'<div style="font-weight:600;color:#333;font-size:1rem;">⛵ \' + e.event_title + \'</div>\' +' +
        '(e.event_location ? \'<div style="color:#666;font-size:0.88rem;margin-top:2px;">📍 \' + e.event_location + \'</div>\' : "") +' +
        '\'</div>\' +' +
        '\'<div style="text-align:right;"><span style="background:\' + urgency + \';color:white;padding:3px 10px;border-radius:12px;font-size:0.78rem;font-weight:600;white-space:nowrap;">\' + badge + \'</span></div>\' +' +
        '\'</div>\';' +
    '}' +

    // Function to load My Regattas dynamically
    'async function loadMyRegattas() {' +
      'const container = document.getElementById("reg-my-content");' +
      'if (!container) return;' +
      'container.innerHTML = \'<div style="text-align:center;padding:30px;color:#888;">Loading...</div>\';' +
      'try {' +
        'const resp = await fetch("/api/my-regattas");' +
        'const events = await resp.json();' +
        'if (events.length === 0) {' +
          'container.innerHTML = \'<div style="text-align:center;padding:30px;color:#888;">You haven\\\'t marked any upcoming regattas yet. Check the boxes on events you plan to attend!</div>\';' +
        '} else {' +
          'let html = \'<div style="display:grid;gap:12px;">\';' +
          'events.forEach(function(e) { html += renderMyCard(e); });' +
          'html += \'</div>\';' +
          'html += \'<div style="margin-top:12px;color:#888;font-size:0.83rem;">You\\\'re attending \' + events.length + \' upcoming regatta(s)</div>\';' +
          'container.innerHTML = html;' +
        '}' +
        // Update button count
        'const myBtn = document.getElementById("btn-my-reg");' +
        'if (myBtn) myBtn.innerHTML = "⛵ My Regattas (" + events.length + ")";' +
      '} catch(e) { container.innerHTML = \'<div style="text-align:center;padding:30px;color:#888;">Error loading regattas.</div>\'; }' +
    '}' +

    'function showPanel(idx) {' +
      'panels.forEach(function(p,i) { var el = document.getElementById(p); if(el) el.style.display = i===idx ? "" : "none"; });' +
      'btns.forEach(function(b,i) { var el = document.getElementById(b); if(el) el.className = i===idx ? "btn btn-primary ruleset-btn active-ruleset" : "btn btn-secondary ruleset-btn"; });' +
      // Refresh My Regattas every time tab is selected
      'if (panels[idx] === "reg-my") loadMyRegattas();' +
    '}' +
    'btns.forEach(function(b,i) { var el = document.getElementById(b); if(el) el.addEventListener("click", function() { showPanel(i); }); });' +

    // Checkbox attendance toggle
    'function attachCheckboxListeners() {' +
      'document.querySelectorAll(".attend-cb").forEach(function(cb) {' +
        'if (cb.dataset.bound) return;' +
        'cb.dataset.bound = "1";' +
        'cb.addEventListener("change", async function() {' +
          'const data = new URLSearchParams();' +
          'data.append("event_key", this.dataset.key);' +
          'data.append("event_date", this.dataset.date);' +
          'data.append("event_title", this.dataset.title);' +
          'data.append("event_location", this.dataset.location);' +
          'data.append("event_region", this.dataset.region);' +
          'data.append("attending", this.checked ? "1" : "0");' +
          'try {' +
            'await fetch("/api/regatta-attend", { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body: data.toString() });' +
            'const label = this.parentElement;' +
            'const card = this.closest(".regatta-card");' +
            'if (this.checked) {' +
              'label.style.color = "#2e7d32";' +
              'label.childNodes[1].textContent = "⛵ Attending";' +
              'if(card){card.style.borderLeft="4px solid #2e7d32";card.style.background="#f0fdf4";}' +
            '} else {' +
              'label.style.color = "#888";' +
              'label.childNodes[1].textContent = "Attend?";' +
              'if(card){card.style.borderLeft="";card.style.background="";}' +
            '}' +
          '} catch(e) { console.error(e); }' +
        '});' +
      '});' +
    '}' +
    'attachCheckboxListeners();' +
  '})();' +
  '</script>', req.session.user, getLang(req)));
});

// --- MY BOAT PHOTOS ---
// Debug: check stored media sizes
app.get("/api/boat-photo-debug", requireAuth, (req, res) => {
  const photos = db.prepare("SELECT id, content_type, file_path, length(photo_data) as data_len, video_url, created_at FROM boat_photos WHERE user_id = ?").all(req.session.user.id);
  const results = photos.map(p => {
    let fileSize = null;
    if (p.file_path && fs.existsSync(p.file_path)) {
      fileSize = fs.statSync(p.file_path).size;
    }
    return {
      id: p.id,
      content_type: p.content_type,
      base64_chars: p.data_len,
      base64_decoded_bytes: p.data_len ? Math.floor(p.data_len * 3 / 4) : 0,
      base64_decoded_kb: p.data_len ? Math.floor(p.data_len * 3 / 4 / 1024) : 0,
      file_path: p.file_path || null,
      file_size_bytes: fileSize,
      file_size_kb: fileSize ? Math.floor(fileSize / 1024) : null,
      video_url: p.video_url || null,
      created_at: p.created_at
    };
  });
  res.json(results);
});

// Debug: analyze MP4 atom structure
app.get("/api/boat-photo-atoms/:id", requireAuth, (req, res) => {
  const photo = db.prepare("SELECT file_path, content_type, photo_data FROM boat_photos WHERE id = ? AND user_id = ?").get(req.params.id, req.session.user.id);
  if (!photo) return res.status(404).json({error:'not found'});
  let buf;
  if (photo.file_path && fs.existsSync(photo.file_path)) {
    buf = fs.readFileSync(photo.file_path);
  } else if (photo.photo_data) {
    buf = Buffer.from(photo.photo_data, 'base64');
  } else {
    return res.json({error:'no data'});
  }
  // Parse MP4 top-level atoms
  var atoms = [];
  var offset = 0;
  while (offset < buf.length - 8) {
    var size = buf.readUInt32BE(offset);
    var type = buf.toString('ascii', offset + 4, offset + 8);
    if (size < 8 || size > buf.length - offset) break;
    atoms.push({ type: type, offset: offset, size: size });
    offset += size;
  }
  res.json({ fileSize: buf.length, atoms: atoms, moovFirst: atoms.length > 0 && atoms.some(function(a,i) { return a.type === 'moov' && i < 2; }) });
});

// Serve stored photos
app.get("/api/boat-photo/:id", (req, res) => {
  const photo = db.prepare("SELECT photo_data, content_type, file_path FROM boat_photos WHERE id = ?").get(req.params.id);
  if (!photo) return res.status(404).send('Not found');

  // If stored on filesystem, use Express sendFile (handles Range requests correctly)
  if (photo.file_path && fs.existsSync(photo.file_path)) {
    return res.sendFile(photo.file_path, {
      headers: {
        'Content-Type': photo.content_type,
        'Cache-Control': 'public, max-age=86400'
      }
    });
  }

  // Base64 data in SQLite — if it's a video, migrate to filesystem first
  const isVid = photo.content_type && photo.content_type.startsWith('video/');
  if (isVid && photo.photo_data && photo.photo_data.length > 0) {
    try {
      const ext = photo.content_type === 'video/quicktime' ? '.mov' : photo.content_type === 'video/webm' ? '.webm' : '.mp4';
      const fileName = 'vid_lazy_' + req.params.id + '_' + Date.now() + ext;
      const filePath = path.join(mediaDir, fileName);
      const buf = Buffer.from(photo.photo_data, 'base64');
      fs.writeFileSync(filePath, buf);
      db.prepare("UPDATE boat_photos SET file_path = ?, photo_data = '' WHERE id = ?").run(filePath, req.params.id);
      console.log("Lazy-migrated video id=" + req.params.id + " (" + (buf.length / 1048576).toFixed(1) + " MB)");
      return res.sendFile(filePath, {
        headers: { 'Content-Type': photo.content_type, 'Cache-Control': 'public, max-age=86400' }
      });
    } catch(e) {
      console.error("Lazy migration failed for id=" + req.params.id + ":", e.message);
    }
  }

  // Photos from SQLite (base64) — or failed video migration fallback
  const buf = Buffer.from(photo.photo_data || '', 'base64');
  res.set('Content-Type', photo.content_type);
  res.set('Content-Length', buf.length);
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(buf);
});

// Upload photo/video
app.post("/api/boat-photo", requireAuth, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const sailNum = req.body.sail_number || req.session.user.snipe_number || '';
  const caption = req.body.caption || '';
  const isVideo = req.file.mimetype.startsWith('video/');

  if (isVideo) {
    // Save video to filesystem for proper streaming
    const fileName = 'vid_' + req.session.user.id + '_' + Date.now() + path.extname(req.file.originalname || '.mp4');
    const filePath = path.join(mediaDir, fileName);
    fs.writeFileSync(filePath, req.file.buffer);
    db.prepare("INSERT INTO boat_photos (user_id, sail_number, caption, photo_data, content_type, file_path) VALUES (?,?,?,?,?,?)").run(
      req.session.user.id, sailNum, caption, '', req.file.mimetype, filePath
    );
  } else {
    // Photos stay in SQLite (small enough)
    const base64 = req.file.buffer.toString('base64');
    db.prepare("INSERT INTO boat_photos (user_id, sail_number, caption, photo_data, content_type) VALUES (?,?,?,?,?)").run(
      req.session.user.id, sailNum, caption, base64, req.file.mimetype
    );
  }
  res.json({ ok: true });
});

// Delete photo/video
app.post("/api/boat-photo-delete/:id", requireAuth, (req, res) => {
  // Remove file from disk if it exists
  const photo = db.prepare("SELECT file_path FROM boat_photos WHERE id = ? AND user_id = ?").get(req.params.id, req.session.user.id);
  if (photo && photo.file_path && fs.existsSync(photo.file_path)) {
    try { fs.unlinkSync(photo.file_path); } catch(e) {}
  }
  db.prepare("DELETE FROM boat_photos WHERE id = ? AND user_id = ?").run(req.params.id, req.session.user.id);
  res.json({ ok: true });
});

// Rename photo (update caption and/or sail number)
app.post("/api/boat-photo-rename/:id", requireAuth, (req, res) => {
  const { caption, sail_number } = req.body;
  if (caption !== undefined && sail_number !== undefined) {
    db.prepare("UPDATE boat_photos SET caption = ?, sail_number = ? WHERE id = ? AND user_id = ?").run(caption, sail_number, req.params.id, req.session.user.id);
  } else if (caption !== undefined) {
    db.prepare("UPDATE boat_photos SET caption = ? WHERE id = ? AND user_id = ?").run(caption, req.params.id, req.session.user.id);
  } else if (sail_number !== undefined) {
    db.prepare("UPDATE boat_photos SET sail_number = ? WHERE id = ? AND user_id = ?").run(sail_number, req.params.id, req.session.user.id);
  }
  res.json({ ok: true });
});

// Save photo from URL (for tap-to-add from web search)
app.post("/api/boat-photo-from-url", requireAuth, async (req, res) => {
  const { url, sail_number, caption } = req.body;
  if (!url) return res.status(400).json({ error: 'No URL' });
  try {
    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(10000) });
    if (!resp.ok) return res.json({ error: 'Could not fetch image' });
    const contentType = resp.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) return res.json({ error: 'Not an image' });
    const buffer = Buffer.from(await resp.arrayBuffer());
    if (buffer.length > 5 * 1024 * 1024) return res.json({ error: 'Image too large (5MB max)' });
    const base64 = buffer.toString('base64');
    db.prepare("INSERT INTO boat_photos (user_id, sail_number, caption, photo_data, content_type) VALUES (?,?,?,?,?)").run(
      req.session.user.id, sail_number || '', caption || '', base64, contentType
    );
    res.json({ ok: true });
  } catch(e) {
    res.json({ error: 'Failed to save image' });
  }
});

// Add video by URL
try { db.exec("ALTER TABLE boat_photos ADD COLUMN video_url TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE boat_photos ADD COLUMN file_path TEXT"); } catch(e) {}

app.post("/api/boat-video-url", requireAuth, (req, res) => {
  const { url, caption } = req.body;
  if (!url || !url.trim()) return res.status(400).json({ error: 'URL required' });
  const videoUrl = url.trim();
  const sailNum = req.session.user.snipe_number || '';
  const cap = (caption || '').trim();

  // Convert YouTube/Vimeo URLs to embed format for display
  let embedUrl = videoUrl;
  // YouTube: youtube.com/watch?v=ID or youtu.be/ID
  const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  if (ytMatch) embedUrl = 'https://www.youtube.com/embed/' + ytMatch[1];
  // Vimeo: vimeo.com/ID
  const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) embedUrl = 'https://player.vimeo.com/video/' + vimeoMatch[1];

  // Store with a placeholder image and the video_url
  db.prepare("INSERT INTO boat_photos (user_id, sail_number, caption, photo_data, content_type, video_url) VALUES (?,?,?,?,?,?)").run(
    req.session.user.id, sailNum, cap, '', 'video/embed', embedUrl
  );
  res.json({ ok: true });
});

// Add photo by URL
app.post("/api/boat-photo-url", requireAuth, (req, res) => {
  const { url, caption } = req.body;
  if (!url || !url.trim()) return res.status(400).json({ error: 'URL required' });
  const photoUrl = url.trim();
  const sailNum = req.session.user.snipe_number || '';
  const cap = (caption || '').trim();
  // Store with the URL as video_url field (reusing same column) and content_type as image/url
  db.prepare("INSERT INTO boat_photos (user_id, sail_number, caption, photo_data, content_type, video_url) VALUES (?,?,?,?,?,?)").run(
    req.session.user.id, sailNum, cap, '', 'image/url', photoUrl
  );
  res.json({ ok: true });
});

// Web image search API for tap-to-add
// Image proxy to bypass hotlinking restrictions
app.get("/api/image-proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing url');
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Referer': new URL(url).origin },
      signal: AbortSignal.timeout(8000)
    });
    if (!resp.ok) return res.status(resp.status).send('Failed');
    const ct = resp.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const buffer = await resp.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch(e) { res.status(502).send('Proxy error'); }
});

app.get("/api/web-boat-search/:query", async (req, res) => {
  const q = req.params.query.trim();
  const isNumber = /^\d+$/.test(q);
  const queries = isNumber
    ? ['"snipe" "' + q + '" sailboat', 'snipe sail number ' + q + ' racing', 'snipe ' + q + ' regatta sailing']
    : ['snipe "' + q + '" sailboat', 'snipe class "' + q + '" sailing', '"' + q + '" snipe regatta'];
  const images = [];
  const seen = new Set();

  // Try Bing first
  for (const searchQ of queries) {
    if (images.length >= 15) break;
    try {
      const searchUrl = 'https://www.bing.com/images/search?q=' + encodeURIComponent(searchQ) + '&first=1&count=20';
      const resp = await fetch(searchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Accept-Language': 'en-US,en;q=0.9' },
        signal: AbortSignal.timeout(8000)
      });
      const html = await resp.text();
      // Try multiple extraction patterns
      const patterns = [
        /murl&quot;:&quot;(https?:\/\/[^&]+?\.(?:jpg|jpeg|png|webp)[^&]*?)&quot;/gi,
        /src2?="(https?:\/\/[^\s"]+?\.(?:jpg|jpeg|png|webp)[^"]*?)"/gi,
        /"contentUrl":"(https?:\/\/[^"]+?\.(?:jpg|jpeg|png|webp)[^"]*?)"/gi
      ];
      for (const regex of patterns) {
        let match;
        while ((match = regex.exec(html)) !== null && images.length < 15) {
          let url = match[1].replace(/&amp;/g, '&');
          if (!seen.has(url) && !url.includes('bing.com/th') && !url.includes('bing.net')) {
            seen.add(url);
            images.push(url);
          }
        }
      }
    } catch(e) { /* timeout or error, continue */ }
  }

  // Fallback: try DuckDuckGo if Bing returned nothing
  if (images.length === 0) {
    try {
      const ddgQ = 'snipe sailboat ' + q;
      const ddgResp = await fetch('https://duckduckgo.com/?q=' + encodeURIComponent(ddgQ) + '&iax=images&ia=images', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(8000)
      });
      const ddgHtml = await ddgResp.text();
      const ddgRegex = /"image":"(https?:\/\/[^"]+?)"/gi;
      let m;
      while ((m = ddgRegex.exec(ddgHtml)) !== null && images.length < 15) {
        const url = m[1].replace(/\\u002F/g, '/');
        if (!seen.has(url)) { seen.add(url); images.push(url); }
      }
    } catch(e) {}
  }

  // Return proxied URLs so images load reliably in browser
  const proxied = images.map(url => '/api/image-proxy?url=' + encodeURIComponent(url));
  res.json({ images: proxied, originals: images });
});

// Get user's photos
app.get("/api/boat-photos-list", requireAuth, (req, res) => {
  const photos = db.prepare("SELECT id, sail_number, caption, content_type, created_at FROM boat_photos WHERE user_id = ? ORDER BY created_at DESC").all(req.session.user.id);
  res.json(photos);
});

// Get photos by sail number (public — for viewing other sailors' boats)
app.get("/api/boat-photos-by-sail/:num", (req, res) => {
  const photos = db.prepare("SELECT bp.id, bp.sail_number, bp.caption, bp.created_at, u.display_name, u.username FROM boat_photos bp JOIN users u ON bp.user_id = u.id WHERE bp.sail_number = ? ORDER BY bp.created_at DESC").all(req.params.num);
  res.json(photos);
});

app.get("/my-boat", requireAuth, (req, res) => {
  const lang = getLang(req);
  const L = (k) => t(k, lang);
  const user = req.session.user;
  const sailNum = user.snipe_number || '';
  const boatName = user.boat_name || '';
  const skipperName = user.display_name || '';
  const defaultSearch = [sailNum, boatName, skipperName].filter(v => v).join(' ');
  const myPhotos = db.prepare("SELECT id, sail_number, caption, content_type, video_url, created_at FROM boat_photos WHERE user_id = ? ORDER BY created_at DESC").all(user.id);

  let galleryHtml = '';
  if (myPhotos.length > 0) {
    galleryHtml = '<div class="photo-grid">';
    myPhotos.forEach(p => {
      const safeCaption = escapeHtml(p.caption || '').replace(/'/g, '&#39;');
      const safeSail = escapeHtml(p.sail_number || '').replace(/'/g, '&#39;');
      const isEmbed = (p.content_type === 'video/embed' && p.video_url);
      const isImageUrl = (p.content_type === 'image/url' && p.video_url);
      const isVideo = !isEmbed && !isImageUrl && (p.content_type || '').startsWith('video/');
      let mediaHtml;
      if (isImageUrl) {
        const safeImgUrl = escapeHtml(p.video_url);
        mediaHtml = '<img src="' + safeImgUrl + '" alt="' + escapeHtml(p.caption || 'Snipe ' + p.sail_number) + '" loading="lazy" onclick="openMediaModal(\'' + safeImgUrl + '\', false);" style="cursor:pointer;width:100%;height:100%;object-fit:cover;">' +
          '<div style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,0.6);color:white;border-radius:4px;padding:2px 8px;font-size:0.7rem;pointer-events:none;">🔗 URL</div>';
      } else if (isEmbed) {
        const safeEmbedUrl = escapeHtml(p.video_url);
        mediaHtml = '<div style="width:100%;height:100%;position:relative;cursor:pointer;background:#1a1a2e;" onclick="openMediaModal(\'' + safeEmbedUrl + '\', \'embed\');">' +
          '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">' +
          '<div style="width:70px;height:70px;background:rgba(255,0,0,0.7);border:3px solid rgba(255,255,255,0.7);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:8px;"><span style="font-size:2.2rem;color:white;margin-left:5px;">&#9654;</span></div>' +
          '<span style="color:rgba(255,255,255,0.8);font-size:0.85rem;font-weight:600;">Tap to Play</span></div>' +
          '</div>' +
          '<div style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,0.6);color:white;border-radius:4px;padding:2px 8px;font-size:0.7rem;pointer-events:none;">🎬 Video</div>';
      } else if (isVideo) {
        mediaHtml = '<div style="width:100%;height:100%;position:relative;cursor:pointer;background:#1a1a2e;" onclick="openMediaModal(\'/api/boat-photo/' + p.id + '\', true);">' +
          '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">' +
          '<div style="width:70px;height:70px;background:rgba(255,255,255,0.15);border:3px solid rgba(255,255,255,0.7);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:8px;"><span style="font-size:2.2rem;color:white;margin-left:5px;">&#9654;</span></div>' +
          '<span style="color:rgba(255,255,255,0.8);font-size:0.85rem;font-weight:600;">Tap to Play</span></div>' +
          '</div>' +
          '<div style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,0.6);color:white;border-radius:4px;padding:2px 8px;font-size:0.7rem;pointer-events:none;">🎬 Video</div>';
      } else {
        mediaHtml = '<img src="/api/boat-photo/' + p.id + '" alt="' + escapeHtml(p.caption || 'Snipe ' + p.sail_number) + '" loading="lazy" onclick="openMediaModal(\'/api/boat-photo/' + p.id + '\', false);" style="cursor:pointer;">';
      }
      galleryHtml += '<div class="photo-card" style="position:relative;" id="photo-card-' + p.id + '">' +
        mediaHtml +
        '<div style="position:absolute;bottom:0;left:0;right:0;padding:6px 10px;background:rgba(0,0,0,0.65);color:white;font-size:0.8rem;display:flex;justify-content:space-between;align-items:center;">' +
          '<span id="caption-text-' + p.id + '">' + escapeHtml(p.caption || 'Snipe #' + (p.sail_number || '')) + '</span>' +
          '<div style="display:flex;gap:4px;">' +
            '<button onclick="event.stopPropagation();renamePhoto(' + p.id + ',\'' + safeCaption + '\',\'' + safeSail + '\');" style="background:rgba(255,255,255,0.25);color:white;border:none;border-radius:4px;padding:2px 8px;cursor:pointer;font-size:0.75rem;" title="Rename">✏️</button>' +
            '<button onclick="event.stopPropagation();if(confirm(\'' + L('deletePhotoConfirm') + '\')){fetch(\'/api/boat-photo-delete/' + p.id + '\',{method:\'POST\'}).then(()=>location.reload());}" style="background:rgba(255,0,0,0.7);color:white;border:none;border-radius:4px;padding:2px 8px;cursor:pointer;font-size:0.75rem;" title="Delete">✕</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    });
    galleryHtml += '</div>';
  }

  res.send(renderPage(`<div class="container">
    <h2>📸 ${L('myBoatPhotos')}</h2>
    <p style="color:#555;margin-bottom:20px;">${L('uploadPhotoDesc')}</p>

    <div class="form-card" style="padding:24px;margin-bottom:24px;">
      <h3 style="color:#0b3d6e;margin:0 0 16px;">${L('addPhoto')}</h3>
      <div id="drop-zone" style="border:3px dashed #c5ddf5;border-radius:12px;padding:24px 16px;text-align:center;margin-bottom:16px;transition:all 0.2s;cursor:pointer;background:#f8fafc;">
        <div style="font-size:2.5rem;margin-bottom:8px;">📸</div>
        <p style="color:#0b3d6e;font-weight:600;font-size:1rem;margin-bottom:8px;">${L('tapToSelect')}</p>
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-bottom:8px;">
          <button type="button" onclick="document.getElementById('photo-camera').click();" style="padding:10px 18px;background:#0b3d6e;color:white;border:none;border-radius:8px;font-size:0.95rem;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;">
            <span>📷 ${lang === 'es' ? 'Tomar Foto (celular)' : lang === 'it' ? 'Scatta Foto (telefono)' : lang === 'pt' ? 'Tirar Foto (celular)' : 'Take Photo (use phone)'}</span>
            <span style="font-size:0.65rem;opacity:0.8;font-style:italic;">${lang === 'es' ? 'lanzar desde Snipeovation' : lang === 'it' ? 'lanciare da Snipeovation' : lang === 'pt' ? 'lançar do Snipeovation' : 'launch from Snipeovation'}</span>
          </button>
          <button type="button" onclick="document.getElementById('photo-file').click();" style="padding:10px 18px;background:#1a6fb5;color:white;border:none;border-radius:8px;font-size:0.95rem;cursor:pointer;display:flex;align-items:center;gap:6px;">🖼️ ${lang === 'es' ? 'Galería' : lang === 'it' ? 'Galleria' : lang === 'pt' ? 'Galeria' : 'Gallery / Files'}</button>
          <button type="button" onclick="document.getElementById('video-camera').click();" style="padding:10px 18px;background:#7c3aed;color:white;border:none;border-radius:8px;font-size:0.95rem;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;">
            <span>🎬 ${lang === 'es' ? 'Grabar Video (celular)' : lang === 'it' ? 'Registra Video (telefono)' : lang === 'pt' ? 'Gravar Vídeo (celular)' : 'Record Video (use phone)'}</span>
            <span style="font-size:0.65rem;opacity:0.8;font-style:italic;">${lang === 'es' ? 'lanzar desde Snipeovation' : lang === 'it' ? 'lanciare da Snipeovation' : lang === 'pt' ? 'lançar do Snipeovation' : 'launch from Snipeovation'}</span>
          </button>
        </div>
        <p style="color:#888;font-size:0.82rem;margin:0;">Desktop: drag & drop files here</p>
        <div id="drop-preview" style="margin-top:12px;display:none;"></div>
      </div>
      <!-- Camera capture (opens camera directly on phone) -->
      <input type="file" id="photo-camera" accept="image/*" capture="environment" style="display:none;">
      <!-- Gallery/file picker (all images and videos) -->
      <input type="file" name="photo" id="photo-file" accept="image/*,video/mp4,video/quicktime,video/webm,video/x-msvideo" style="display:none;">
      <!-- Video camera capture -->
      <input type="file" id="video-camera" accept="video/*" capture="environment" style="display:none;">
      <form id="upload-form" enctype="multipart/form-data" style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;">
        <div style="flex:1;min-width:120px;">
          <label style="font-weight:600;color:#333;display:block;margin-bottom:4px;">Sail Number</label>
          <input type="text" name="sail_number" id="photo-sail" value="${escapeHtml(sailNum)}" placeholder="e.g. 31847" style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:0.95rem;">
        </div>
        <div style="flex:1;min-width:150px;">
          <label style="font-weight:600;color:#333;display:block;margin-bottom:4px;">Caption</label>
          <input type="text" name="caption" id="photo-caption" placeholder="e.g. Don Q 2025, At the dock" style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:0.95rem;">
        </div>
        <button type="submit" class="btn btn-primary" style="padding:10px 24px;">📤 Upload</button>
      </form>
      <div id="upload-status" style="margin-top:8px;font-size:0.88rem;"></div>
    </div>

    <!-- Photo/Video URL Input — above web search -->
    <div style="margin-top:20px;padding:20px;background:white;border-radius:12px;border:1px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <h4 style="color:#0b3d6e;margin:0 0 12px;">📎 ${lang === 'es' ? 'Agregar Foto o Video por URL' : lang === 'it' ? 'Aggiungi Foto o Video tramite URL' : lang === 'pt' ? 'Adicionar Foto ou Vídeo por URL' : 'Add Photo or Video by URL'}</h4>
      <p style="color:#555;font-size:0.88rem;margin-bottom:12px;">${lang === 'es' ? 'Pegue un enlace a una imagen o video (YouTube, Vimeo, enlace directo).' : lang === 'it' ? 'Incolla un link a una foto o video (YouTube, Vimeo, link diretto).' : lang === 'pt' ? 'Cole um link para uma foto ou vídeo (YouTube, Vimeo, link direto).' : 'Paste a link to a photo or video (YouTube, Vimeo, direct image URL).'}</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;">
        <div style="flex:1;min-width:250px;">
          <input type="text" id="video-url-input" placeholder="${lang === 'es' ? 'ej. https://youtube.com/watch?v=... o URL de imagen' : lang === 'it' ? 'es. https://youtube.com/watch?v=... o URL immagine' : lang === 'pt' ? 'ex. https://youtube.com/watch?v=... ou URL de imagem' : 'e.g. https://youtube.com/watch?v=... or image URL'}" style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;">
        </div>
        <div style="min-width:140px;">
          <input type="text" id="video-caption-input" placeholder="${L('egCaption')}" style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;">
        </div>
        <button type="button" onclick="addMediaUrl()" class="btn btn-primary" style="padding:10px 20px;white-space:nowrap;">📎 ${lang === 'es' ? 'Agregar' : lang === 'it' ? 'Aggiungi' : lang === 'pt' ? 'Adicionar' : 'Add'}</button>
      </div>
      <div id="video-url-status" style="margin-top:8px;font-size:0.88rem;"></div>
    </div>

    <div style="margin-top:24px;">
      <h3 style="color:#0b3d6e;margin-bottom:8px;">${L('findPhotos')}</h3>
      <p style="color:#555;margin-bottom:12px;">${lang === 'es' ? 'Busque por número de vela, nombre del barco o regata.' : lang === 'it' ? 'Cerca per numero di vela, nome della barca o regata.' : lang === 'pt' ? 'Busque por número de vela, nome do barco ou regata.' : 'Search by sail number, boat name, or regatta.'} <strong>${lang === 'es' ? 'Toque una foto o video para agregarlo a su galería.' : lang === 'it' ? 'Tocca una foto o video per aggiungerlo alla galleria.' : lang === 'pt' ? 'Toque uma foto ou vídeo para adicioná-lo à galeria.' : 'Tap a photo or video to add it to your gallery.'}</strong></p>
      <div class="form-card" style="padding:18px;margin-bottom:16px;">
        <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;">
          <div style="flex:1;min-width:200px;">
            <label style="font-weight:600;color:#333;display:block;margin-bottom:4px;">Sail Number, Boat Name, Skipper Name or Regatta</label>
            <input type="text" id="web-search-input" value="${escapeHtml(defaultSearch)}" placeholder="e.g. 31847, Snipeovation, Don Q 2025" style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;">
          </div>
          <button type="button" id="web-search-btn" class="btn btn-primary" style="padding:10px 20px;">🔍 Search</button>
        </div>
      </div>
      <div id="web-search-links"></div>
      <div style="margin-top:14px;padding:14px 18px;background:#e8f5e9;border:1px solid #a5d6a7;border-radius:8px;">
        <strong style="color:#2e7d32;">📱 ${lang === 'es' ? 'Toque para agregar:' : lang === 'it' ? 'Tocca per aggiungere:' : lang === 'pt' ? 'Toque para adicionar:' : 'Tap to add:'}</strong>
        <p style="color:#555;font-size:0.9rem;margin-top:4px;line-height:1.5;">${lang === 'es' ? 'Verifique su número de vela, luego toque la foto para agregarla a su galería.' : lang === 'it' ? 'Verificare il numero di vela, poi tocca la foto per aggiungerla alla galleria.' : lang === 'pt' ? 'Verifique seu número de vela, depois toque a foto para adicioná-la à galeria.' : 'Verify your sail number is visible, then tap the photo to instantly add it to your gallery below.'}</p>
      </div>
    </div>

    <h3 style="color:#0b3d6e;margin:32px 0 16px;">🖼️ My Boat Gallery${myPhotos.length > 0 ? ' (' + myPhotos.length + ' photo' + (myPhotos.length > 1 ? 's' : '') + ')' : ''}</h3>
    <div id="my-gallery">
      ${myPhotos.length > 0 ? galleryHtml : `<div style="text-align:center;padding:40px;background:white;border:1px solid #e2e8f0;border-radius:10px;"><div style="font-size:2.5rem;margin-bottom:12px;">⛵</div><h3 style="color:#0b3d6e;margin-bottom:8px;">${L('noPhotosYet')}</h3><p style="color:#666;">${L('searchOrUpload')}</p></div>`}
    </div>
  </div>
  <style>
    .photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; margin-bottom: 24px; }
    .photo-card { position: relative; border-radius: 10px; overflow: hidden; background: #f1f5f9; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); aspect-ratio: 4/3; }
    .photo-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .photo-card:hover img { transform: scale(1.05); }
    .photo-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.88); z-index: 9999; justify-content: center; align-items: center; cursor: pointer; }
    .photo-modal.active { display: flex; }
    .photo-modal img { max-width: 92vw; max-height: 88vh; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 30px rgba(0,0,0,0.5); }
    .photo-modal video { width: 98vw; height: 96vh; max-width: 98vw; max-height: 96vh; object-fit: contain; border-radius: 4px; background: #000; }
    .photo-modal .close-btn { position: fixed; top: 2vh; right: 2vw; color: white; font-size: 2.2rem; cursor: pointer; background: rgba(255,0,0,0.7); width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 10001; border: 2px solid white; }
    @media (max-width: 768px) { .photo-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; } }
  </style>
  <div id="photo-modal" class="photo-modal">
    <div class="close-btn" onclick="closeMediaModal();" ontouchend="event.preventDefault();closeMediaModal();">✕</div>
    <div id="modal-content"></div>
  </div>
  <script>
  var modalIsVideo = false;
  function openMediaModal(src, type) {
    var container = document.getElementById('modal-content');
    var modal = document.getElementById('photo-modal');
    if (type === 'embed') {
      modalIsVideo = true;
      var autoplaySrc = src + (src.indexOf('?') >= 0 ? '&' : '?') + 'autoplay=1';
      container.innerHTML = '<iframe src="' + autoplaySrc + '" style="width:98vw;height:96vh;max-width:98vw;max-height:96vh;border:none;border-radius:4px;background:#000;" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;fullscreen" allowfullscreen></iframe>';
    } else if (type === true) {
      modalIsVideo = true;
      container.innerHTML = '<video src="' + src + '" controls autoplay playsinline style="width:98vw;height:92vh;max-width:98vw;max-height:92vh;object-fit:contain;background:#000;border-radius:4px;"></video>';
      var vid = container.querySelector('video');
      if (vid) vid.addEventListener('ended', function() { setTimeout(closeMediaModal, 1000); });
    } else {
      modalIsVideo = false;
      container.innerHTML = '<img src="' + src + '" style="max-width:92vw;max-height:88vh;border-radius:8px;">';
    }
    modal.classList.add('active');
    // For photos only — tap backdrop to close (NOT for videos)
    modal.onclick = modalIsVideo ? null : function() { closeMediaModal(); };
  }
  function closeMediaModal() {
    var modal = document.getElementById('photo-modal');
    modal.classList.remove('active');
    modal.onclick = null;
    var container = document.getElementById('modal-content');
    var vid = container.querySelector('video');
    if (vid) { vid.pause(); vid.src = ''; }
    var iframe = container.querySelector('iframe');
    if (iframe) { iframe.src = ''; }
    container.innerHTML = '';
  }
  // Drag and drop + file picker
  // Rename photo function
  // Add photo or video by URL
  window.addVideoUrl = async function() { return addMediaUrl(); };
  window.addMediaUrl = async function() {
    var urlInput = document.getElementById('video-url-input');
    var captionInput = document.getElementById('video-caption-input');
    var status = document.getElementById('video-url-status');
    var url = urlInput.value.trim();
    if (!url) { status.innerHTML = '<span style="color:red;">Please enter a URL.</span>'; return; }
    // Detect if it's a photo URL (image extension or known image hosts)
    var isImage = /\\.(jpg|jpeg|png|gif|webp|bmp|svg)(\\?|$)/i.test(url) || /imgur\\.com|flickr\\.com.*\\/photos/i.test(url);
    var isVideo = /youtube\\.com|youtu\\.be|vimeo\\.com|\\.(mp4|mov|webm|avi)(\\?|$)/i.test(url);
    if (isImage) {
      status.innerHTML = '<span style="color:#0b3d6e;">Adding photo...</span>';
      try {
        var data = new URLSearchParams();
        data.append('url', url);
        data.append('caption', captionInput.value.trim());
        var resp = await fetch('/api/boat-photo-url', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data.toString() });
        var result = await resp.json();
        if (result.ok) {
          status.innerHTML = '<span style="color:#2e7d32;">✓ Photo added! Reloading...</span>';
          setTimeout(function() { location.reload(); }, 800);
        } else {
          status.innerHTML = '<span style="color:red;">' + (result.error || 'Failed to add photo.') + '</span>';
        }
      } catch(e) {
        status.innerHTML = '<span style="color:red;">Error adding photo.</span>';
      }
    } else {
      status.innerHTML = '<span style="color:#0b3d6e;">Adding video...</span>';
      try {
        var data = new URLSearchParams();
        data.append('url', url);
        data.append('caption', captionInput.value.trim());
        var resp = await fetch('/api/boat-video-url', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data.toString() });
        var result = await resp.json();
        if (result.ok) {
          status.innerHTML = '<span style="color:#2e7d32;">✓ Video added! Reloading...</span>';
          setTimeout(function() { location.reload(); }, 800);
        } else {
          status.innerHTML = '<span style="color:red;">' + (result.error || 'Failed to add video.') + '</span>';
        }
      } catch(e) {
        status.innerHTML = '<span style="color:red;">Error adding video.</span>';
      }
    }
  };

  window.renamePhoto = async function(id, currentCaption, currentSail) {
    const newCaption = prompt('Caption:', currentCaption);
    if (newCaption === null) return;
    const newSail = prompt('Sail Number:', currentSail);
    if (newSail === null) return;
    try {
      const data = new URLSearchParams();
      data.append('caption', newCaption);
      data.append('sail_number', newSail);
      const resp = await fetch('/api/boat-photo-rename/' + id, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data.toString() });
      const result = await resp.json();
      if (result.ok) {
        const textEl = document.getElementById('caption-text-' + id);
        if (textEl) textEl.textContent = newCaption || 'Snipe #' + (newSail || '');
      }
    } catch(e) { alert('Rename failed.'); }
  };

  let selectedFile = null;
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('photo-file');
  const preview = document.getElementById('drop-preview');

  function showPreview(file) {
    selectedFile = file;
    var isVid = file.type.startsWith('video/');
    if (isVid) {
      var url = URL.createObjectURL(file);
      preview.innerHTML = '<video src="' + url + '" style="max-height:120px;border-radius:8px;border:2px solid #0b3d6e;" controls muted></video><p style="color:#2e7d32;font-weight:600;margin-top:6px;font-size:0.88rem;">🎬 ' + file.name + ' (' + (file.size / 1048576).toFixed(1) + ' MB) ${L("readyUpload")}</p>';
      preview.style.display = '';
      dropZone.style.borderColor = '#2e7d32';
      dropZone.style.background = '#f0fdf4';
    } else {
      var reader = new FileReader();
      reader.onload = function(e) {
        preview.innerHTML = '<img src="' + e.target.result + '" style="max-height:120px;border-radius:8px;border:2px solid #0b3d6e;"><p style="color:#2e7d32;font-weight:600;margin-top:6px;font-size:0.88rem;">✓ ' + file.name + ' ${L("readyUpload")}</p>';
        preview.style.display = '';
        dropZone.style.borderColor = '#2e7d32';
        dropZone.style.background = '#f0fdf4';
      };
      reader.readAsDataURL(file);
    }
  }

  fileInput.addEventListener('change', function() {
    if (this.files[0]) showPreview(this.files[0]);
  });

  // Auto-upload from phone camera/video — no extra tap needed
  async function autoUpload(file) {
    var now = new Date();
    var dateLabel = now.toLocaleDateString(${lang === 'en' ? "'en-US'" : lang === 'es' ? "'es-ES'" : lang === 'it' ? "'it-IT'" : "'pt-BR'"}, {year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
    var sailNum = document.getElementById('photo-sail').value || '${escapeHtml(user.snipe_number || '')}';
    preview.innerHTML = '<div style="color:#0b3d6e;font-weight:600;font-size:1rem;padding:12px;">⏳ Uploading to gallery...</div>';
    preview.style.display = '';
    dropZone.style.borderColor = '#f59e0b';
    dropZone.style.background = '#fffbeb';
    var formData = new FormData();
    formData.append('photo', file);
    formData.append('sail_number', sailNum);
    formData.append('caption', dateLabel);
    try {
      var resp = await fetch('/api/boat-photo', { method: 'POST', body: formData });
      var data = await resp.json();
      if (data.ok) {
        preview.innerHTML = '<div style="color:#2e7d32;font-weight:600;font-size:1rem;padding:12px;">✅ Saved to gallery — ' + dateLabel + '</div>';
        dropZone.style.borderColor = '#2e7d32';
        dropZone.style.background = '#f0fdf4';
        setTimeout(function() { location.reload(); }, 1000);
      } else {
        preview.innerHTML = '<div style="color:red;font-weight:600;">Upload failed: ' + (data.error || 'Unknown') + '</div>';
        dropZone.style.borderColor = '#ef4444';
        dropZone.style.background = '#fef2f2';
      }
    } catch(e) {
      preview.innerHTML = '<div style="color:red;font-weight:600;">Upload failed. Check connection.</div>';
      dropZone.style.borderColor = '#ef4444';
      dropZone.style.background = '#fef2f2';
    }
  }

  // Camera capture — auto-upload immediately
  var cameraInput = document.getElementById('photo-camera');
  if (cameraInput) cameraInput.addEventListener('change', function() {
    if (this.files[0]) autoUpload(this.files[0]);
  });

  // Video camera capture — auto-upload immediately
  var videoCamInput = document.getElementById('video-camera');
  if (videoCamInput) videoCamInput.addEventListener('change', function() {
    if (this.files[0]) autoUpload(this.files[0]);
  });

  dropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.style.borderColor = '#0b3d6e';
    this.style.background = '#e8f0fe';
  });
  dropZone.addEventListener('dragleave', function(e) {
    e.preventDefault();
    this.style.borderColor = selectedFile ? '#2e7d32' : '#c5ddf5';
    this.style.background = selectedFile ? '#f0fdf4' : '#f8fafc';
  });
  dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    this.style.borderColor = '#c5ddf5';
    this.style.background = '#f8fafc';
    const files = e.dataTransfer.files;
    if (files.length > 0 && (files[0].type.startsWith('image/') || files[0].type.startsWith('video/'))) {
      showPreview(files[0]);
    }
  });

  document.getElementById('upload-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const status = document.getElementById('upload-status');
    const file = selectedFile || fileInput.files[0];
    if (!file) { status.innerHTML = '<span style="color:red;">Please select a photo or video first.</span>'; return; }
    if (file.size > 50 * 1024 * 1024) { status.innerHTML = '<span style="color:red;">File must be under 50MB.</span>'; return; }
    status.innerHTML = '<span style="color:#555;">Uploading...</span>';
    const formData = new FormData(this);
    formData.set('photo', file);
    try {
      const resp = await fetch('/api/boat-photo', { method: 'POST', body: formData });
      const data = await resp.json();
      if (data.ok) {
        status.innerHTML = '<span style="color:#2e7d32;">✓ Photo uploaded!</span>';
        setTimeout(() => location.reload(), 500);
      } else {
        status.innerHTML = '<span style="color:red;">Upload failed: ' + (data.error || 'Unknown error') + '</span>';
      }
    } catch(err) {
      status.innerHTML = '<span style="color:red;">Upload failed. Please try again.</span>';
    }
  });

  // Check if all web search images failed to load
  window.checkWebGrid = function() {
    var grid = document.querySelector('.photo-grid.web-results');
    if (grid && grid.querySelectorAll('.photo-card').length === 0) {
      grid.innerHTML = '<p style="color:#888;padding:12px;text-align:center;">Images could not load — try the search links below instead.</p>';
    }
  };

  // Web search — shows tappable image previews + external links
  async function doWebSearch() {
    const q = document.getElementById('web-search-input').value.trim();
    if (!q) return;
    const linksDiv = document.getElementById('web-search-links');
    linksDiv.innerHTML = '<div style="text-align:center;padding:24px;color:#555;">⏳ ${L("searchingPhotos")} "' + q + '"...</div>';

    let html = '';

    // Fetch image previews from server
    try {
      const resp = await fetch('/api/web-boat-search/' + encodeURIComponent(q));
      const data = await resp.json();
      if (data.images && data.images.length > 0) {
        html += '<p style="color:#0b3d6e;font-weight:600;margin-bottom:4px;">Web results for "' + q + '"</p>';
        html += '<p style="color:#555;font-size:0.88rem;margin-bottom:12px;">⚠️ ${lang === "es" ? "Verifique su número de vela, luego <strong>toque para agregar</strong> a su galería." : lang === "it" ? "Verificare il numero di vela, poi <strong>tocca per aggiungere</strong> alla galleria." : lang === "pt" ? "Verifique seu número de vela, depois <strong>toque para adicionar</strong> à galeria." : "Verify your sail number is visible, then <strong>tap to add</strong> to your gallery."}</p>';
        html += '<div class="photo-grid web-results" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr));">';
        var originals = data.originals || data.images;
        data.images.forEach(function(imgUrl, idx) {
          var origUrl = (originals[idx] || imgUrl).replace(/'/g, '%27').replace(/\\\\/g, '');
          html += '<div class="photo-card tap-to-add" data-url="' + origUrl + '" style="cursor:pointer;position:relative;" title="Tap to add to gallery">';
          html += '<img src="' + imgUrl + '" loading="lazy" onerror="this.parentElement.remove();checkWebGrid();" style="width:100%;height:100%;object-fit:cover;">';
          html += '<div style="position:absolute;bottom:0;left:0;right:0;padding:5px 8px;background:rgba(11,61,110,0.8);color:white;font-size:0.75rem;text-align:center;font-weight:600;">Tap to add \\u27a4</div>';
          html += '</div>';
        });
        html += '</div>';
      } else {
        html += '<p style="color:#888;margin-bottom:12px;">No image previews found. Try the search links below.</p>';
      }
    } catch(e) {
      console.error('Web search error:', e);
      html += '<p style="color:#888;margin-bottom:12px;">Could not load previews (' + e.message + '). Try the search links below.</p>';
    }

    // External search links
    const enc = encodeURIComponent('"snipe" "' + q + '" sailboat');
    const encExact = encodeURIComponent('snipe ' + q);
    html += '<div style="margin-top:16px;"><p style="color:#555;font-size:0.88rem;margin-bottom:8px;font-weight:600;">${L("searchMoreSources")}</p>';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">';
    html += '<a href="https://www.google.com/search?tbm=isch&q=' + enc + '" target="_blank" class="btn btn-secondary" style="font-size:0.82rem;padding:6px 14px;">🖼️ Google Photos</a>';
    html += '<a href="https://www.bing.com/images/search?q=' + enc + '" target="_blank" class="btn btn-secondary" style="font-size:0.82rem;padding:6px 14px;">📷 Bing Photos</a>';
    html += '<a href="https://www.flickr.com/search/?text=' + encExact + '" target="_blank" class="btn btn-secondary" style="font-size:0.82rem;padding:6px 14px;">📸 Flickr</a>';
    html += '<a href="https://www.snipe.org/?s=' + encodeURIComponent(q) + '" target="_blank" class="btn btn-secondary" style="font-size:0.82rem;padding:6px 14px;">⛵ Snipe.org</a>';
    html += '</div>';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
    html += '<a href="https://www.youtube.com/results?search_query=' + encodeURIComponent('snipe sailboat ' + q) + '" target="_blank" class="btn btn-secondary" style="font-size:0.82rem;padding:6px 14px;">🎬 YouTube</a>';
    html += '<a href="https://www.google.com/search?tbm=vid&q=' + enc + '" target="_blank" class="btn btn-secondary" style="font-size:0.82rem;padding:6px 14px;">🎥 Google Videos</a>';
    html += '<a href="https://vimeo.com/search?q=' + encodeURIComponent('snipe sailboat ' + q) + '" target="_blank" class="btn btn-secondary" style="font-size:0.82rem;padding:6px 14px;">🎞️ Vimeo</a>';
    html += '</div></div>';

    linksDiv.innerHTML = html;

    // Attach tap-to-add handlers
    document.querySelectorAll('.tap-to-add').forEach(function(card) {
      card.addEventListener('click', async function() {
        const imgUrl = this.dataset.url;
        const sail = document.getElementById('photo-sail').value || document.getElementById('web-search-input').value || '';
        const overlay = this.querySelector('div:last-child');
        overlay.textContent = '⏳ Adding...';
        overlay.style.background = 'rgba(0,100,0,0.8)';
        try {
          const body = new URLSearchParams();
          body.append('url', imgUrl);
          body.append('sail_number', sail);
          var searchQ = document.getElementById('web-search-input').value.trim();
          body.append('caption', 'Web photo — ' + (searchQ || 'Snipe ' + sail));
          const resp = await fetch('/api/boat-photo-from-url', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
          const result = await resp.json();
          if (result.ok) {
            overlay.textContent = '✓ Added to gallery!';
            overlay.style.background = 'rgba(46,125,50,0.9)';
            this.style.pointerEvents = 'none';
          } else {
            overlay.textContent = '✕ ' + (result.error || 'Failed');
            overlay.style.background = 'rgba(200,0,0,0.8)';
            setTimeout(function() { overlay.textContent = 'Tap to add ➕'; overlay.style.background = 'rgba(11,61,110,0.8)'; card.style.pointerEvents = ''; }, 2000);
          }
        } catch(e) {
          overlay.textContent = '✕ Error';
          overlay.style.background = 'rgba(200,0,0,0.8)';
          setTimeout(function() { overlay.textContent = 'Tap to add ➕'; overlay.style.background = 'rgba(11,61,110,0.8)'; card.style.pointerEvents = ''; }, 2000);
        }
      });
    });
  }
  document.getElementById('web-search-btn').addEventListener('click', doWebSearch);
  document.getElementById('web-search-input').addEventListener('keydown', function(e) { if (e.key === 'Enter') doWebSearch(); });
  if (document.getElementById('web-search-input').value.trim()) doWebSearch();
  </script>`, user, lang));
});

// --- MAGIC SETTINGS CALCULATOR ---
app.get("/api/magic-data", requireAuth, (req, res) => {
  // Return all race logs for the current user that have a performance rating
  const logs = db.prepare("SELECT * FROM race_logs WHERE user_id = ? AND performance_rating IS NOT NULL AND performance_rating != '' ORDER BY performance_rating DESC").all(req.session.user.id);
  res.json(logs);
});

app.get("/magic", requireAuth, (req, res) => {
  const lang = getLang(req);
  res.send(renderPage(`<div class="container">
    <h2>✨ Magic — Snipe Tuning Calculator</h2>
    <p style="color:#555;margin-bottom:4px;">This feature learns over time.</p>
    <p style="color:#555;margin-bottom:20px;">Enter your conditions and get the best estimated boat settings based on tuning guides <strong>and your own race log data</strong>.</p>

    <div class="form-card wide" style="padding:28px;">
      <div class="form-grid">
        <div class="form-group">
          <label>Mainsail Maker</label>
          <select id="mg-main-maker" style="padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
            <option value="quantum">Quantum</option>
            <option value="north">North</option>
            <option value="olimpic">Olimpic</option>
          </select>
        </div>
        <div class="form-group">
          <label>Mainsail Model</label>
          <select id="mg-main-model" style="padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
          </select>
        </div>
        <div class="form-group">
          <label>Jib Maker</label>
          <select id="mg-jib-maker" style="padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
            <option value="quantum">Quantum</option>
            <option value="north">North</option>
            <option value="olimpic">Olimpic</option>
          </select>
        </div>
        <div class="form-group">
          <label>Jib Model</label>
          <select id="mg-jib-model" style="padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
          </select>
        </div>
        <div class="form-group">
          <label>${lang === 'es' ? 'Velería del Spinnaker' : lang === 'it' ? 'Veleria dello Spinnaker' : lang === 'pt' ? 'Fabricante do Spinnaker' : 'Spinnaker Maker'}</label>
          <select id="mg-spinnaker-maker" style="padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
            <option value="">-- ${lang === 'es' ? 'Seleccionar' : lang === 'it' ? 'Selezionare' : lang === 'pt' ? 'Selecionar' : 'Select'} --</option>
            <option value="Quantum">Quantum</option>
            <option value="North">North</option>
            <option value="Olimpic">Olimpic</option>
          </select>
        </div>
        <div class="form-group" id="mg-spinnaker-model-group" style="display:none;">
          <label>${lang === 'es' ? 'Modelo del Spinnaker' : lang === 'it' ? 'Modello dello Spinnaker' : lang === 'pt' ? 'Modelo do Spinnaker' : 'Spinnaker Model'}</label>
          <select id="mg-spinnaker-model" style="padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
            <option value="">-- ${lang === 'es' ? 'Seleccionar' : lang === 'it' ? 'Selezionare' : lang === 'pt' ? 'Selecionar' : 'Select'} --</option>
            <option value="Red Spinnaker">Red Spinnaker</option>
            <option value="The Whomper">The Whomper</option>
          </select>
        </div>
        <div class="form-group">
          <label>${lang === 'es' ? 'Estado del Mayor' : lang === 'it' ? 'Condizione della Randa' : lang === 'pt' ? 'Condição da Vela Grande' : 'Mainsail Condition'}</label>
          <select id="mg-main-condition" style="padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
            <option value="new">${lang === 'es' ? 'Nueva' : lang === 'it' ? 'Nuova' : lang === 'pt' ? 'Nova' : 'New'}</option>
            <option value="mid" selected>${lang === 'es' ? 'Vida media' : lang === 'it' ? 'Mezza vita' : lang === 'pt' ? 'Meia vida' : 'Mid-life'}</option>
            <option value="old">${lang === 'es' ? 'Para tirar' : lang === 'it' ? 'Da buttare' : lang === 'pt' ? 'Para descartar' : 'Ready for the rag bin'}</option>
          </select>
        </div>
        <div class="form-group">
          <label>${lang === 'es' ? 'Estado del Foque' : lang === 'it' ? 'Condizione del Fiocco' : lang === 'pt' ? 'Condição da Vela de Proa' : 'Jib Condition'}</label>
          <select id="mg-jib-condition" style="padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
            <option value="new">${lang === 'es' ? 'Nueva' : lang === 'it' ? 'Nuova' : lang === 'pt' ? 'Nova' : 'New'}</option>
            <option value="mid" selected>${lang === 'es' ? 'Vida media' : lang === 'it' ? 'Mezza vita' : lang === 'pt' ? 'Meia vida' : 'Mid-life'}</option>
            <option value="old">${lang === 'es' ? 'Para tirar' : lang === 'it' ? 'Da buttare' : lang === 'pt' ? 'Para descartar' : 'Ready for the rag bin'}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Snipe Builder</label>
          <select id="mg-builder" style="padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
            <option value="dbmas">DB/MAS/Persson</option>
            <option value="jibetech">JibeTech</option>
          </select>
        </div>
        <div class="form-group">
          <label>🔗 Wire Size</label>
          <select id="mg-wire" style="padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
            <option value="3mm">3mm Standard 1×19</option>
            <option value="2.5mm">2.5mm Compressed Strand (Dyform)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Combined Crew Weight (${lang === 'en' ? 'lbs' : 'kg'})</label>
          <input type="number" id="mg-weight" placeholder="${lang === 'en' ? 'e.g. 285' : 'e.g. 130'}" style="padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
        </div>
        <div class="form-group">
          <label>Wind Speed (knots)</label>
          <input type="number" id="mg-wind" placeholder="e.g. 12" style="padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
        </div>
        <div class="form-group">
          <label>Sea State</label>
          <select id="mg-sea" style="padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
            <option value="flat">Flat</option>
            <option value="choppy">Choppy</option>
            <option value="large">Large Waves</option>
          </select>
        </div>
        <div class="form-group">
          <label>🌊 Water Type</label>
          <select id="mg-water" style="padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
            <option value="">-- Auto-detect --</option>
            <option value="saltwater">🌊 Saltwater (ocean/sea)</option>
            <option value="freshwater">💧 Freshwater (lake/river/reservoir)</option>
          </select>
          <div id="mg-water-detect" style="margin-top:6px;font-size:0.82rem;color:#666;"></div>
        </div>
      </div>
      <div style="margin-top:16px;">
        <button type="button" id="mg-calc" class="btn btn-primary" style="font-size:1.05rem;padding:12px 32px;">✨ Calculate Settings</button>
      </div>
    </div>

    <div id="mg-results" style="display:none;margin-top:28px;">
      <h3 style="color:#0b3d6e;margin-bottom:16px;">Recommended Settings</h3>
      <div id="mg-source" style="color:#777;font-size:0.85rem;margin-bottom:16px;"></div>
      <div class="form-grid" id="mg-grid"></div>
      <!-- Corrective Action Section -->
      <div id="mg-corrective" style="display:none;margin-top:28px;padding:24px;background:linear-gradient(135deg,#fff8e1,#fff3cd);border:2px solid #f0c040;border-radius:14px;">
        <h3 style="color:#b45309;margin-bottom:16px;">🔧 Corrective Action — Conditions Changed on the Water and Your Spreaders Cannot Be Changed</h3>
        <p style="color:#666;margin-bottom:16px;font-size:0.9rem;">Enter your locked spreader settings and the new conditions. Other controls must compensate for spreaders that are no longer optimal.</p>
        <div class="form-grid" style="margin-bottom:16px;">
          <div class="form-group">
            <label style="font-weight:600;color:#b45309;">🔒 Spreader Length (locked on water)</label>
            <select id="ca-old-wind" style="padding:10px;border:1px solid #f0c040;border-radius:8px;font-size:1rem;background:#fffde7;">
              <option value="">-- Select --</option>
              <option value="16.25">16.25" (41.3 cm) — short/light crew</option>
              <option value="16.375">16 3/8" (41.6 cm) — Diaz style</option>
              <option value="16.5">16.5" (41.9 cm)</option>
              <option value="16.625">16 5/8" (42.2 cm)</option>
              <option value="16.75">16 3/4" (42.5 cm) — standard</option>
              <option value="16.875">16 7/8" (42.9 cm) — standard+</option>
              <option value="17">17" (43.2 cm)</option>
              <option value="17.125">17 1/8" (43.5 cm)</option>
              <option value="17.25">17 1/4" (43.8 cm)</option>
              <option value="17.375">17 3/8" (44.1 cm) — long/heavy crew</option>
            </select>
          </div>
          <div class="form-group">
            <label style="font-weight:600;color:#b45309;">🔒 Spreader Sweep (locked on water)</label>
            <select id="ca-old-sea" style="padding:10px;border:1px solid #f0c040;border-radius:8px;font-size:1rem;background:#fffde7;">
              <option value="">-- Select --</option>
              <option value="28.5">28.5" (72.4 cm) — very narrow/bendy</option>
              <option value="29">29" (73.7 cm) — narrow/light air</option>
              <option value="29.5">29.5" (74.9 cm) — light-medium</option>
              <option value="29.75">29 3/4" (75.6 cm)</option>
              <option value="30">30" (76.2 cm) — medium standard</option>
              <option value="30.25">30 1/4" (76.8 cm)</option>
              <option value="30.5">30.5" (77.5 cm)</option>
              <option value="30.7">30 11/16" (78 cm) — North standard</option>
              <option value="31">31" (78.7 cm) — heavy air</option>
              <option value="31.5">31.5" (80 cm) — max wide/stiff</option>
            </select>
          </div>
          <div class="form-group">
            <label style="font-weight:600;color:#d97706;">⬇️ Wind Changes To (kts)</label>
            <select id="ca-new-wind" style="padding:10px;border:2px solid #d97706;border-radius:8px;font-size:1rem;background:white;font-weight:600;">
              <option value="">-- Select New Wind --</option>
              <option value="2">2 kts (Drifter)</option>
              <option value="4">4 kts (Light)</option>
              <option value="6">6 kts (Light)</option>
              <option value="8">8 kts (Medium)</option>
              <option value="10">10 kts (Medium)</option>
              <option value="12">12 kts (Medium)</option>
              <option value="14">14 kts (Medium-Heavy)</option>
              <option value="16">16 kts (Heavy)</option>
              <option value="18">18 kts (Heavy)</option>
              <option value="20">20+ kts (Very Heavy)</option>
            </select>
          </div>
          <div class="form-group">
            <label style="font-weight:600;color:#d97706;">⬇️ Sea State Changes To</label>
            <select id="ca-new-sea" style="padding:10px;border:2px solid #d97706;border-radius:8px;font-size:1rem;background:white;font-weight:600;">
              <option value="flat">Flat</option>
              <option value="choppy">Choppy</option>
              <option value="large">Large Waves</option>
            </select>
          </div>
        </div>
        <button id="ca-calc-btn" style="background:linear-gradient(135deg,#d97706,#b45309);color:white;border:none;padding:14px 32px;border-radius:10px;font-size:1.1rem;font-weight:700;cursor:pointer;width:100%;margin-bottom:16px;">🔧 Show Corrective Actions</button>
        <div id="ca-results" style="display:none;"></div>
      </div>

      <p style="margin-top:20px;color:#999;font-size:0.82rem;">⚠️ These are estimated starting points based on published tuning guides. Fine-tune on the water based on feel and boat speed.</p>
    </div>
  </div>
  <script>
  (function() {
    var pageLang = '${getLang(req)}';
    var useInches = (pageLang === 'en');
    // Populate mainsail and jib model dropdowns based on maker selection
    var mgMainModels = { quantum: ['C-5', 'X-2', 'XFB'], north: ['SW-4', 'PR-3', 'CB-2'], olimpic: ['CRC', 'XPM', 'CM1', 'CM5', 'GTM', 'GTM-F'] };
    var mgJibModels = { quantum: ['RSJ-14', 'RSJ-8'], north: ['R3-LM', 'Cross-Cut Jib'], olimpic: ['XPJ', 'AR2-F', 'GTJ'] };
    function populateMgModels(makerSel, modelSel, models) {
      var maker = makerSel.value;
      var opts = models[maker] || [];
      modelSel.innerHTML = '';
      opts.forEach(function(m) {
        var o = document.createElement('option');
        o.value = m; o.textContent = m;
        modelSel.appendChild(o);
      });
    }
    var mgMM = document.getElementById('mg-main-maker');
    var mgMMod = document.getElementById('mg-main-model');
    var mgJM = document.getElementById('mg-jib-maker');
    var mgJMod = document.getElementById('mg-jib-model');
    if (mgMM && mgMMod) { populateMgModels(mgMM, mgMMod, mgMainModels); mgMM.addEventListener('change', function() { populateMgModels(mgMM, mgMMod, mgMainModels); }); }
    if (mgJM && mgJMod) { populateMgModels(mgJM, mgJMod, mgJibModels); mgJM.addEventListener('change', function() { populateMgModels(mgJM, mgJMod, mgJibModels); }); }

    // Spinnaker Easter egg for Magic tab
    var mgSpMaker = document.getElementById('mg-spinnaker-maker');
    var mgSpModelGroup = document.getElementById('mg-spinnaker-model-group');
    var mgSpModel = document.getElementById('mg-spinnaker-model');
    if (mgSpMaker) {
      mgSpMaker.addEventListener('change', function() {
        if (mgSpMaker.value) { mgSpModelGroup.style.display = ''; mgSpModel.value = ''; } else { mgSpModelGroup.style.display = 'none'; }
      });
    }
    if (mgSpModel) {
      mgSpModel.addEventListener('change', function() {
        if (mgSpModel.value) {
          var ov = document.createElement('div');
          ov.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;cursor:pointer;';
          ov.innerHTML = '<div style="text-align:center;padding:40px 30px;max-width:600px;"><div style="font-size:5rem;margin-bottom:20px;">\\u26f5\\ud83d\\ude02</div><div style="font-size:3rem;font-weight:900;color:#fff;text-shadow:3px 3px 6px rgba(0,0,0,0.5);line-height:1.3;animation:mgFlash 0.5s ease-in-out infinite alternate;">Ha, Fooled You!!!<br>There is no spinnaker<br>on a Snipe!</div><div style="margin-top:24px;font-size:1.2rem;color:rgba(255,255,255,0.8);">(tap anywhere to close)</div></div>';
          var cols = ['#e53e3e','#2b6cb0','#38a169','#d69e2e','#805ad5','#dd6b20'];
          var ci2 = 0; ov.style.background = cols[0];
          var fi = setInterval(function() { ci2 = (ci2 + 1) % cols.length; ov.style.background = cols[ci2]; }, 400);
          var st = document.createElement('style'); st.textContent = '@keyframes mgFlash { from { transform: scale(1); } to { transform: scale(1.08); } }';
          document.head.appendChild(st);
          ov.addEventListener('click', function() { clearInterval(fi); ov.remove(); st.remove(); mgSpModel.value = ''; mgSpMaker.value = ''; mgSpModelGroup.style.display = 'none'; });
          document.body.appendChild(ov);
        }
      });
    }

    // Tuning data derived from published Quantum and North Sails Snipe tuning guides
    // Organized by wind range: light (0-7), medium (8-14), heavy (15+)
    // Comprehensive tuning data from Quantum, North, Olimpic guides + snipe.org expert articles
    // Sources: Quantum Snipe Tuning Guide/Grid, North Sails Snipe Tuning Guide (Carol Cronin),
    // Luis Soubie (snipe.org), Alexandre Paradeda (Quantum), Eric Heim spreader article
    // Loos PT-1 Black gauge readings used throughout
    const tuning = {
      quantum: {
        light: {
          mast_rake: '21\\'6"-21\\'7" (6.55-6.58m) tape to transom — 2nd rake position',
          shroud_tension: '21',
          shroud_turns: 'Base Sta-Master position (0 turns from base)',
          spreader_length: '16.75"-16.875" (42.5-43 cm) from mast face to shroud',
          spreader_sweep: '29"-29.5" (73.5-75 cm) tip-to-tip — narrow for max mast bend & power',
          jib_lead: useInches ? '87"-88" from tack — forward, powers up entry' : '221-224 cm from tack — forward, powers up entry',
          jib_cloth_tension: 'Light wrinkles along luff — halyard eased',
          jib_height: useInches ? '3"-3.5" deck to tack — lower for tight slot & pointing in light air' : '7.6-9 cm deck to tack — lower for tight slot & pointing in light air',
          jib_outboard_lead: 'Full inboard — tight slot for light air',
          cunningham: 'Off — zero tension, allow wrinkles in luff',
          outhaul: 'Eased 1-2" (2.5-5 cm) from black band — max draft at 50%',
          vang: 'Slack — just remove slack from line, no load',
          centerboard_position: useInches ? 'Fwd 1/4"-1/2" from neutral — prebend opens leech; up to 3/4" in drifter' : 'Fwd 0.6-1.3 cm from neutral — prebend opens leech; up to 1.9 cm in drifter',
          traveler_position: useInches ? 'To windward — boom at or slightly above centerline; ease mainsheet for twist, traveler up to compensate. Flat water: all the way to windward. Chop: 1-2" below windward max for extra twist.' : 'To windward — boom at or slightly above centerline; ease mainsheet, traveler up. Flat: all the way to windward. Chop: 2-5 cm below max windward for twist.',
          augie_equalizer: useInches ? 'Pull windward AE 2-3" to center boom, add twist for light air acceleration' : 'Pull windward AE 5-8 cm to center boom, add twist for light air acceleration',
          mast_wiggle: 'Moderate to Downright Sloppy! — leeward shroud should have visible slack upwind; in drifter (<3 kts) go full sloppy for max mast freedom'
        },
        medium: {
          mast_rake: '21\\'4"-21\\'5.5" (6.50-6.54m) tape to transom — tighter rig',
          shroud_tension: '23-25',
          shroud_turns: '1 turn up on Sta-Master (6 faces = 1 full turn)',
          spreader_length: '16.75"-16.875" (42.5-43 cm) from mast face to shroud',
          spreader_sweep: '29.5"-30" (75-76 cm) tip-to-tip — standard setup',
          jib_lead: useInches ? '88"-90" from tack — standard, top batten parallel to boom' : '224-229 cm from tack — standard, top batten parallel to boom',
          jib_cloth_tension: 'Smooth — minimal wrinkles, luff firm',
          jib_height: useInches ? '3.5"-4.5" deck to tack — Paradeda: raise jib for flatter bottom & better leech' : '9-11.5 cm deck to tack — Paradeda: raise jib for flatter bottom & better leech',
          jib_outboard_lead: 'Mid position — slot slightly open',
          cunningham: 'Light — just remove wrinkles from luff',
          outhaul: 'At black band — draft at 45%',
          vang: 'Light tension — maintain leech profile when easing',
          centerboard_position: useInches ? 'At neutral mark — power up; aft 1/4" in gusts to stiffen rig' : 'At neutral mark — power up; aft 0.6 cm in gusts to stiffen rig',
          traveler_position: useInches ? '3-4" below centerline — first depower tool 10-15 kts; ease in gusts' : '8-10 cm below centerline — first depower tool 10-15 kts; ease in gusts',
          augie_equalizer: 'Released — traveler and mainsheet control boom position',
          mast_wiggle: 'A little — leeward shroud slightly loose upwind; mast can respond to gusts'
        },
        heavy: {
          mast_rake: '21\\'1"-21\\'4" (6.42-6.50m) tape to transom — max rake for depowering',
          shroud_tension: '25-28',
          shroud_turns: '2 turns up on Sta-Master (12 faces = 2 full turns)',
          spreader_length: '16.75"-16.875" (42.5-43 cm) from mast face to shroud',
          spreader_sweep: '30"-31.5" (76-80 cm) tip-to-tip — wider = stiffer mast, less bend',
          jib_lead: useInches ? '90"-93" from tack — aft, opens leech, depowers' : '229-236 cm from tack — aft, opens leech, depowers',
          jib_cloth_tension: 'Tight — max halyard, smooth luff entry',
          jib_height: useInches ? '4.5"-5" deck to tack — Paradeda max: opens slot, wave clearance, leech control' : '11.5-12.7 cm deck to tack — Paradeda max: opens slot, wave clearance, leech control',
          jib_outboard_lead: 'Full outboard — opens slot for depowering',
          cunningham: 'Heavy 10-15 cm — flatten sail, move draft forward, open leech',
          outhaul: 'Max — at black band or beyond, sail flat as possible',
          vang: 'Heavy — lock in mast bend, prevent upper leech hook; vang-sheet in gusts',
          centerboard_position: useInches ? 'Aft 3/8"-5/8" from neutral — counteracts vang; +1/4" aft in rough seas for power/twist' : 'Aft 1.0-1.6 cm from neutral — counteracts vang; +0.6 cm aft in rough seas for power/twist',
          traveler_position: useInches ? '5-7" below centerline — switch to vang sheeting 15+ kts; play main constantly' : '13-18 cm below centerline — switch to vang sheeting 15+ kts; play main constantly',
          augie_equalizer: 'Fully released — vang and traveler control all depowering',
          mast_wiggle: 'None — leeward shroud should be snug upwind; rig locked down for control'
        }
      },
      north: {
        light: {
          mast_rake: '21\\'6.75" (6.57m) tape to transom — 2nd rake, max power position',
          shroud_tension: '21',
          shroud_turns: 'Base Sta-Master position (0 turns from base)',
          spreader_length: '16.75" (42.5 cm) from mast face to shroud — North standard',
          spreader_sweep: '29.9" (76 cm) tip-to-tip — allows free mast bend',
          jib_lead: useInches ? '87"-88" from tack — forward, powers up entry' : '221-224 cm from tack — forward, powers up entry',
          jib_cloth_tension: 'Visible wrinkles along luff — ease halyard for power',
          jib_height: useInches ? '3"-3.5" deck to tack — low for tight slot & max pointing' : '7.6-9 cm deck to tack — low for tight slot & max pointing',
          jib_outboard_lead: 'Full inboard — tight slot, max pointing in light air',
          cunningham: 'Off — zero tension',
          outhaul: 'Eased 5 cm — draft at 50%, full shape',
          vang: 'Slack — just take out slack',
          centerboard_position: useInches ? 'Fwd 1/4"-1/2" from neutral — prebend opens leech; up to 3/4" in drifter' : 'Fwd 0.6-1.3 cm from neutral — prebend opens leech; up to 1.9 cm in drifter',
          traveler_position: useInches ? 'To windward — boom at or above centerline; ease mainsheet for twist, pull traveler up. Flat water: all the way to windward. Chop: 1-2" below max windward for twist.' : 'To windward — boom at or above centerline; ease mainsheet, traveler up. Flat: full windward. Chop: 2-5 cm below max windward.',
          augie_equalizer: useInches ? 'Pull windward AE 2-3" to center boom, twist for acceleration' : 'Pull windward AE 5-8 cm to center boom, twist for acceleration',
          mast_wiggle: 'Moderate to Downright Sloppy! — leeward shroud should have visible slack upwind; in drifter (<3 kts) go full sloppy for max mast freedom'
        },
        medium: {
          mast_rake: '21\\'5.5" (6.54m) tape to transom — 2nd rake, medium setting',
          shroud_tension: '23-25',
          shroud_turns: '1 turn up on Sta-Master (6 faces = 1 full turn)',
          spreader_length: '16.75" (42.5 cm) from mast face to shroud',
          spreader_sweep: '30.7" (78 cm) tip-to-tip — standard for North sails',
          jib_lead: useInches ? '88"-90" from tack — standard, telltales break evenly' : '224-229 cm from tack — standard, telltales break evenly',
          jib_cloth_tension: 'Smooth luff — firm halyard, no wrinkles',
          jib_height: useInches ? '3.5"-4.5" deck to tack — Paradeda: higher for flatter jib & better leech' : '9-11.5 cm deck to tack — Paradeda: higher for flatter jib & better leech',
          jib_outboard_lead: 'Mid position — balanced slot width',
          cunningham: 'Light to moderate — remove wrinkles, draft at 40-45%',
          outhaul: 'Near black band — draft flattening',
          vang: 'Light — maintain leech when easing mainsheet',
          centerboard_position: useInches ? 'At neutral mark — power up; aft 1/4" in gusts to stiffen' : 'At neutral mark — power up; aft 0.6 cm in gusts to stiffen',
          traveler_position: useInches ? '3-4" below centerline — first depower tool 10-15 kts; ease in puffs' : '8-10 cm below centerline — first depower tool 10-15 kts; ease in puffs',
          augie_equalizer: 'Released — traveler controls boom; mainsheet controls twist',
          mast_wiggle: 'A little — leeward shroud slightly loose upwind; mast can respond to gusts'
        },
        heavy: {
          mast_rake: '21\\'3.9" (6.50m) tape to transom — 2nd rake; 1st rake = 20\\'11.2" (6.38m)',
          shroud_tension: '25-28',
          shroud_turns: '2 turns up on Sta-Master (12 faces = 2 full turns)',
          spreader_length: '16.75" (42.5 cm) from mast face to shroud',
          spreader_sweep: '31.5" (80 cm) tip-to-tip — max width for stiff rig, heavier crews',
          jib_lead: useInches ? '90"-93" from tack — aft, opens leech, spills air' : '229-236 cm from tack — aft, opens leech, spills air',
          jib_cloth_tension: 'Very tight — max halyard tension',
          jib_height: useInches ? '4.5"-5" deck to tack — Paradeda max: depower, wave clearance' : '11.5-12.7 cm deck to tack — Paradeda max: depower, wave clearance',
          jib_outboard_lead: 'Full outboard — max slot opening',
          cunningham: 'Max tension — flatten entry, open leech, move draft to 35%',
          outhaul: 'Max — flat bottom, reduce power',
          vang: 'Heavy — lock mast bend, vang-sheet technique in gusts (ease main, keep vang)',
          centerboard_position: useInches ? 'Aft 3/8"-5/8" from neutral — counteracts vang; +1/4" aft in rough seas' : 'Aft 1.0-1.6 cm from neutral — counteracts vang; +0.6 cm aft in rough seas',
          traveler_position: useInches ? '5-7" below centerline — switch to vang sheeting 15+ kts; play main constantly' : '13-18 cm below centerline — switch to vang sheeting 15+ kts; play main constantly',
          augie_equalizer: 'Fully released — vang and traveler do all depowering',
          mast_wiggle: 'None — leeward shroud should be snug upwind; rig locked down for control'
        }
      },
      olimpic: {
        light: {
          mast_rake: '21\\'6"-21\\'7" (6.56-6.58m) tape to transom — Bethlem XP guide',
          shroud_tension: '16-18',
          shroud_turns: 'Base Sta-Master position (0 turns from base)',
          spreader_length: '16.9" (43 cm) — Olimpic standard (40.5-43 cm range by mast)',
          spreader_sweep: '29.1" (74 cm) tip-to-tip — narrow per Bethlem guide for CRC/XPM power',
          jib_lead: useInches ? '87"-88" from tack — forward, powers up entry' : '221-224 cm from tack — forward, powers up entry',
          jib_cloth_tension: 'Light wrinkles visible — XPJ requires less halyard than AR2-F',
          jib_height: useInches ? '3"-3.5" deck to tack — low for tight slot & max pointing' : '7.6-9 cm deck to tack — low for tight slot & max pointing',
          jib_outboard_lead: 'Full inboard — tight slot',
          cunningham: 'Off — zero tension; XPM more critical not to overtighten in light',
          outhaul: 'Eased 4-5 cm from black band',
          vang: 'Slack — just remove slack',
          centerboard_position: useInches ? 'Fwd ~3/8" (1 cm) from neutral — Bethlem guide: prebend for open leech' : 'Fwd 1.0 cm from neutral — Bethlem guide: prebend for open leech',
          traveler_position: useInches ? 'To windward — boom at or above centerline; ease mainsheet for twist, traveler up. Flat water: all the way to windward. Chop: 1-2" below max windward.' : 'To windward — boom at or above centerline; ease mainsheet, traveler up. Flat: full windward. Chop: 2-5 cm below max windward.',
          augie_equalizer: useInches ? 'Pull windward AE 2-3" to center boom, add twist' : 'Pull windward AE 5-8 cm to center boom, add twist',
          mast_wiggle: 'Moderate to Downright Sloppy! — leeward shroud should have visible slack upwind; in drifter (<3 kts) go full sloppy for max mast freedom'
        },
        medium: {
          mast_rake: '21\\'5"-21\\'6" (6.54-6.56m) tape to transom — Bethlem XP guide',
          shroud_tension: '21.5-22',
          shroud_turns: '1 turn up on Sta-Master (6 faces = 1 full turn)',
          spreader_length: '16.9" (43 cm)',
          spreader_sweep: '29.1" (74 cm) tip-to-tip — Bethlem: same as light per guide',
          jib_lead: useInches ? '88"-90" from tack — standard, telltales break evenly' : '224-229 cm from tack — standard, telltales break evenly',
          jib_cloth_tension: 'Smooth — firm halyard, XPJ at designed shape',
          jib_height: useInches ? '3.5"-4.5" deck to tack — Paradeda: higher for flatter jib & better leech' : '9-11.5 cm deck to tack — Paradeda: higher for flatter jib & better leech',
          jib_outboard_lead: 'Mid position',
          cunningham: 'Light — remove wrinkles; CRC tolerates slightly more than XPM',
          outhaul: 'Near black band',
          vang: 'Light — maintain leech when easing',
          centerboard_position: useInches ? 'At neutral mark — power up; aft 1/4" in gusts to stiffen' : 'At neutral mark — power up; aft 0.6 cm in gusts to stiffen',
          traveler_position: useInches ? '3-4" below centerline' : '8-10 cm below centerline',
          augie_equalizer: 'Released — traveler controls boom position',
          mast_wiggle: 'A little — leeward shroud slightly loose upwind; mast can respond to gusts'
        },
        heavy: {
          mast_rake: '21\\'2.5"-21\\'4" (6.48-6.51m) tape to transom — Bethlem XP guide heavy',
          shroud_tension: '21-24',
          shroud_turns: '2 turns up on Sta-Master (12 faces = 2 full turns)',
          spreader_length: '16.9" (43 cm)',
          spreader_sweep: '29.1"-30" (74-76 cm) tip-to-tip — Bethlem: widen slightly in 12+ kts',
          jib_lead: useInches ? '90"-93" from tack — aft, opens leech' : '229-236 cm from tack — aft, opens leech',
          jib_cloth_tension: 'Tight — max halyard',
          jib_height: useInches ? '4.5"-5" deck to tack — Paradeda max: depower, wave clearance' : '11.5-12.7 cm deck to tack — Paradeda max: depower, wave clearance',
          jib_outboard_lead: 'Full outboard — open slot',
          cunningham: 'Max — flatten entry, open leech, XPM flattens well',
          outhaul: 'Max — at or past black band',
          vang: 'Heavy — lock mast bend, vang-sheet in gusts',
          centerboard_position: useInches ? 'Fwd ~3/8" (1 cm) from neutral — Bethlem guide: prevent mast inversion in heavy air' : 'Fwd 1.0 cm from neutral — Bethlem guide: prevent mast inversion in heavy air',
          traveler_position: useInches ? '5-7" below centerline — switch to vang sheeting 15+ kts; play main constantly' : '13-18 cm below centerline — switch to vang sheeting 15+ kts; play main constantly',
          augie_equalizer: 'Fully released — vang and traveler control depowering',
          mast_wiggle: 'None — leeward shroud should be snug upwind; rig locked down for control'
        }
      }
    };

    // Sail-model-specific notes to add context
    var sailModelNotes = {
      'C-5': 'C-5: Most popular Quantum main. Good power balance across wind range. Small rig adjustments needed.',
      'X-2': 'X-2: Flatter profile for lighter teams. Very responsive to aft puller and outhaul. Consider easing outhaul 0.5" more in light air.',
      'XFB': 'XFB: Fuller shape for heavier teams (310+ lbs). More volume in bottom/middle. May need +1 on Loos in medium air for depowering.',
      'SW-4': 'SW-4: Flatter than SW-3, Worlds-winning design. Emphasis on medium/heavy air. Twists easily — forgiving in chop.',
      'PR-3': 'PR-3: Flatter bottom, fuller top. Exceptional light-wind speed. Valid to 12 kts. Consider narrower spreader sweep.',
      'CB-2': 'CB-2: Increased luff curve for vang-sheeting. Best with bendier Cobra masts. Multiple World Championship sail.',
      'CRC': 'CRC: Radial cut developed with Paradeda (2009 World Champion). Evolved from RS1 — shallower lower section for jib inboard, reduced twist. Very sensitive to small adjustments. Shape stable, long-lasting. Needs active cunningham/outhaul/mainsheet work. Pairs best with XPJ jib. Wider spreader sweep OK — sail tolerates more bend. €685.',
      'XPM': 'XPM: Less mast bend design — more volume high up, flatter lower. Very fast 8-10 kts+. Critical: do not close leech at top in light air. Tuning guide (Bethlem): Spreader angle 74 cm, pusher 1 cm fwd in light & heavy, neutral in medium. Pairs with XPJ. €695.',
      'CM1': 'CM1: Radial main developed with Rodriguez & Augie Diaz. Evolution of GTM — more power in lower section for light wind. Modified luff curve optimizes entries. Best from 10 kts but good in lighter wind. Dimension Polyant 170 SQ HTP cloth. Consider narrower sweep for light air power. €865.',
      'CM5': 'CM5: Latest premium Olimpic radial main. Top of the range. Further evolution of CM series with refined draft distribution. Premium race sail. €865.',
      'GTM-F': 'GTM-F: Flatcut main. Designed for heavier teams or windier venues. Easy to depower. Less sensitive than radial cuts — more forgiving. Good value. €695.',
      'GTM': 'GTM: Cross-cut all-purpose main. Forgiving shape, good for developing sailors. Base model for CM1 development. €695.',
      'RSJ-14': 'RSJ-14: Balanced profile, versatile light-medium performance. Precise control and enhanced pointing.',
      'RSJ-8': 'RSJ-8: Classic design — 2019 Worlds winner. Excellent all-around performance.',
      'R3-LM': 'R3-LM: Multiple Worlds winner (2024 Buenos Aires). Radial head/foot + cross-cut mid. Wide steering groove, easy to keep at full speed.',
      'Cross-Cut Jib': 'Cross-Cut Jib: NPC dacron, excellent shape holding. Balance of quality and affordability. Good for training.',
      'XPJ': 'XPJ: Broader than AR2, tauter exit, greater entry angles. More powerful entry, easier to trim, more forgiving. Requires LESS halyard tension than AR2-F — in calm sea, increase tension slightly for better pointing. Greater surface area helps downwind. €425.',
      'AR2-F': 'AR2-F: Previous generation Olimpic jib. Tighter geometry, needs MORE halyard tension. Good for pointing in flat water. €425.',
      'GTJ': 'GTJ: Radial cut premium jib. Excellent shape stability and responsiveness. Best shape retention over time. Pairs well with CM1/CM5/CRC mains. €485.'
    };

    // Weight-specific adjustments with precise numbers
    function weightNote(w) {
      if (!w) return '';
      w = parseFloat(w);
      if (w < 230) return '⚠️ Very light crew (<230 lbs/104 kg): Add 1-1.5" (2.5-4 cm) to mast rake. Reduce Loos PT-1 Black by 2 (use 19 base). Open spreader sweep 1 cm less than shown. Transition to next wind setting 3-4 kts later. Consider X-2 or PR-3 mainsail for responsiveness.';
      if (w < 260) return '💨 Light crew (230-260 lbs/104-118 kg): Add 0.5-1" (1-2.5 cm) to mast rake. Reduce Loos PT-1 by 1. Use slightly narrower spreader sweep. Transition to next setting 2 kts later.';
      if (w > 320) return '💪 Heavy crew (320+ lbs/145+ kg): Reduce mast rake by 0.5-1" (1-2.5 cm). Increase Loos PT-1 by 1-2. Widen spreader sweep 1-2 cm. Lengthen spreaders 1-2 cm. Consider XFB or CB-2 mainsail. Transition to heavier settings 2-3 kts earlier.';
      if (w > 290) return '⚡ Above-average crew (290-320 lbs/132-145 kg): Reduce mast rake by 0.5". Increase Loos PT-1 by 1. Widen spreader sweep 0.5-1 cm. Transition to heavier settings 1-2 kts earlier.';
      return '✅ Crew weight is in the optimal 260-290 lb (118-132 kg) range. Settings shown are calibrated for this weight.';
    }

    // Sea state adjustments with precise measurements
    function seaNote(sea) {
      if (sea === 'choppy') return '🌊 Choppy water adjustments: Ease outhaul 0.5-1" (1-2 cm) for power to punch through. Move jib lead forward one hole. Add 1 cm jib height. Open spreader sweep 0.5 cm for softer rig response. Ease cunningham slightly. Consider mast fwd 2-3 mm extra for prebend/twist.';
      if (sea === 'large') return '🌊 Large waves adjustments: Ease outhaul 1-1.5" for power in troughs. Ease cunningham to keep sail full. Move centerboard aft 2-3 mm extra (reduces helm in waves). Fuller jib — move lead forward one hole. Add 1-2 cm jib height for wave clearance. Open spreader sweep 1 cm. Consider more vang to maintain shape through wave impacts.';
      return '🏖️ Flat water: settings shown are optimized for flat water. Can narrow spreader sweep 0.5-1 cm. Traveler can go 1-2" higher. Maximum pointing mode.';
    }

    function waterNote(isFW, range) {
      if (isFW) {
        var notes = '💧 <strong>Freshwater:</strong> Boat sits ~2.5% lower (less buoyancy). More wetted surface but 20-30% less water viscosity.';
        if (range === 'light') {
          notes += ' In light air: ease outhaul extra 0.5" (1 cm) for more power. Ease cunningham. Consider lowering jib tack 0.5" to tighten slot — you need every bit of power. Spreader sweep 0.5 cm narrower for more mast bend/flatter sail at waterline.';
        } else if (range === 'medium') {
          notes += ' In medium air: slightly more rake (0.5-1 cm) to compensate for deeper waterline. Tighten Sta-Master 1 extra face for more rig tension.';
        } else {
          notes += ' In heavy air: minimal impact — depowering takes priority over buoyancy differences. No significant changes needed.';
        }
        return notes;
      }
      return '🌊 <strong>Saltwater:</strong> Boat rides ~2.5% higher (more buoyancy). Slightly less wetted surface. Standard settings apply — all tuning guides assume saltwater conditions.';
    }

    // Builder adjustments with specific differences
    function builderNote(builder) {
      if (builder === 'jibetech') return '🔧 JibeTech hull: Chainplates are 1" (2.5 cm) closer together than DB/MAS/Persson — spreader sweep reduced ~2.5 cm to compensate. Stiffer hull structure — increase Loos PT-1 by 1-2 from shown values. Hull stiffness allows more aggressive vang settings in heavy air. Always verify mast rake with tape to transom top.';
      return '🔧 DB/MAS/Persson hull: Settings calibrated for this hull family. Standard chainplate spacing. Classic flex characteristics.';
    }

    function wireNote(wire, range) {
      if (wire === '2.5mm') {
        var notes = '🔗 <strong>2.5mm Compressed Strand (Dyform):</strong> Stretches 30-40% less than 3mm standard 1×19. Rig behaves stiffer at the same Loos reading.';
        notes += ' <strong>Subtract 1-2 from displayed Loos PT-1 readings</strong> to achieve equivalent rig feel as standard wire.';
        notes += ' Less forestay sag in gusts — better pointing but less power in light air.';
        if (range === 'light') {
          notes += ' In light air: the stiffer rig may hurt — consider subtracting 2 full points from Loos reading and adding 1 extra Sta-Master face of looseness for mast freedom.';
        } else if (range === 'heavy') {
          notes += ' In heavy air: the stiffer rig is beneficial — less stretch under load means more consistent mast bend. Subtract only 1 from Loos reading.';
        }
        notes += ' Rig is more sensitive to small adjustments — Sta-Master changes have bigger effect.';
        return notes;
      }
      return '🔗 <strong>3mm Standard 1×19:</strong> Standard wire used in most tuning guides. Loos PT-1 readings shown are calibrated directly for this wire. More stretch = softer, more forgiving rig behavior.';
    }

    const labels = {
      mast_rake: 'Mast Rake',
      shroud_tension: 'Shroud Tension (Loos PT-1)',
      shroud_turns: 'Sta-Master Turns', wire_size: 'Wire Size',
      spreader_length: 'Spreader Length',
      spreader_sweep: 'Spreader Sweep',
      jib_lead: useInches ? 'Jib Lead (from tack)' : 'Jib Lead (from tack)',
      jib_cloth_tension: 'Jib Cloth Tension',
      jib_height: 'Jib Height (deck to tack)',
      jib_outboard_lead: 'Jib Outboard Lead',
      cunningham: 'Cunningham',
      outhaul: 'Outhaul',
      vang: 'Vang',
      centerboard_position: 'Mast Fwd/Aft Puller Position',
      traveler_position: 'Traveler Position',
      augie_equalizer: 'Augie Equalizer/Duffy Dominator',
      mast_wiggle: 'Shroud Adjuster Wiggle (Leeward Shroud Upwind)'
    };

    const icons = {
      mast_rake: '📐', shroud_tension: '🔧', shroud_turns: '🔩', spreader_length: '📏', spreader_sweep: '📐',
      jib_lead: '⛵', jib_cloth_tension: '🧵', jib_height: '📍', jib_outboard_lead: '↔️',
      cunningham: '⬇️', outhaul: '➡️', vang: '🔽',
      centerboard_position: '🔄', traveler_position: '↕️', augie_equalizer: '⚖️', mast_wiggle: '↔️'
    };

    document.getElementById('mg-calc').addEventListener('click', async function() {
      const maker = document.getElementById('mg-main-maker').value;
      const builder = document.getElementById('mg-builder').value;
      const wireSize = document.getElementById('mg-wire').value;
      var rawWeight = document.getElementById('mg-weight').value;
      // Convert kg to lbs for internal calculations when language is not English
      const weight = (!useInches && rawWeight) ? Math.round(parseFloat(rawWeight) * 2.20462) : rawWeight;
      const wind = parseFloat(document.getElementById('mg-wind').value);
      const sea = document.getElementById('mg-sea').value;
      var waterSelect = document.getElementById('mg-water').value;
      var waterType = waterSelect; // manual override
      var waterDetectEl = document.getElementById('mg-water-detect');

      // Auto-detect water type from location if not manually set
      if (!waterType) {
        try {
          var pos = await new Promise(function(ok, fail) {
            if (navigator.geolocation) navigator.geolocation.getCurrentPosition(ok, fail, {timeout:5000});
            else fail('no geo');
          });
          var lat = pos.coords.latitude, lon = pos.coords.longitude;
          // Check if near ocean/sea (within ~30 miles of coast approximation)
          // Use the Open-Meteo marine API — if it returns valid ocean data, it's saltwater
          try {
            var marResp = await fetch('https://marine-api.open-meteo.com/v1/marine?latitude=' + lat + '&longitude=' + lon + '&hourly=wave_height&forecast_days=1');
            var marData = await marResp.json();
            if (marData.hourly && marData.hourly.wave_height && marData.hourly.wave_height.some(function(h) { return h !== null && h > 0; })) {
              waterType = 'saltwater';
              waterDetectEl.innerHTML = '📍 Location detected near ocean/sea — <strong>Saltwater</strong>. <a href="#" onclick="document.getElementById(\\\'mg-water\\\').value=\\\'freshwater\\\';this.parentElement.innerHTML=\\\'Manually set to Freshwater\\\';return false;" style="color:#0b3d6e;">Change to freshwater?</a>';
            } else {
              waterType = 'freshwater';
              waterDetectEl.innerHTML = '📍 Location detected inland — <strong>Freshwater</strong>. <a href="#" onclick="document.getElementById(\\\'mg-water\\\').value=\\\'saltwater\\\';this.parentElement.innerHTML=\\\'Manually set to Saltwater\\\';return false;" style="color:#0b3d6e;">Change to saltwater?</a>';
            }
          } catch(e2) {
            waterType = 'freshwater';
            waterDetectEl.innerHTML = '📍 Could not determine water type from location — defaulting to <strong>Freshwater</strong>.';
          }
        } catch(e) {
          waterType = 'freshwater';
          waterDetectEl.innerHTML = '📍 Location not available — defaulting to <strong>Freshwater</strong>. Select manually above.';
        }
      } else {
        waterDetectEl.innerHTML = (waterType === 'saltwater' ? '🌊' : '💧') + ' <strong>' + (waterType === 'saltwater' ? 'Saltwater' : 'Freshwater') + '</strong> — manually selected.';
      }
      var isFreshwater = waterType === 'freshwater';

      if (isNaN(wind)) { alert('Please enter a wind speed.'); return; }

      let range = 'medium';
      let rangeLabel = 'Medium Air (8-14 kts)';
      if (wind <= 7) { range = 'light'; rangeLabel = 'Light Air (0-7 kts)'; }
      else if (wind >= 15) { range = 'heavy'; rangeLabel = 'Heavy Air (15+ kts)'; }

      const guideSettings = Object.assign({}, tuning[maker][range]);

      // --- Wire size: adjust shroud tension display for Dyform ---
      if (wireSize === '2.5mm') {
        // Parse the tension range and subtract 1-2 for Dyform
        var tensionStr = guideSettings.shroud_tension;
        var tensionMatch = tensionStr.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);
        if (tensionMatch) {
          var tLow = parseFloat(tensionMatch[1]);
          var tHigh = parseFloat(tensionMatch[2]);
          var adj = range === 'light' ? 2 : range === 'heavy' ? 1 : 1.5;
          guideSettings.shroud_tension = (tLow - adj).toFixed(0) + '-' + (tHigh - adj).toFixed(0) + ' (Dyform: -' + adj + ' from std; less stretch = stiffer rig)';
        } else {
          var tSingle = parseFloat(tensionStr);
          if (!isNaN(tSingle)) {
            var adj2 = range === 'light' ? 2 : range === 'heavy' ? 1 : 1.5;
            guideSettings.shroud_tension = (tSingle - adj2).toFixed(0) + ' (Dyform: -' + adj2 + ' from std ' + tSingle + ')';
          }
        }
        // Add wire size to the display
        guideSettings.wire_size = '2.5mm Compressed Strand (Dyform) — stiffer rig, less stretch, more responsive to adjustments';
      } else {
        guideSettings.wire_size = '3mm Standard 1×19 — standard wire, tuning guides calibrated for this';
      }

      // --- Dynamic spreader length/sweep based on weight, wind, sea state ---
      // Base spreader lengths by maker (cm)
      var baseLenCm = maker === 'olimpic' ? 43.0 : 42.5;
      var w = parseFloat(weight) || 280;

      // Adjust length for crew weight (Soubie: heavier crews +1-2 cm)
      var lenAdjust = 0;
      if (w < 230) lenAdjust = -0.5;
      else if (w < 260) lenAdjust = 0;
      else if (w <= 290) lenAdjust = 0;
      else if (w <= 320) lenAdjust = 1.0;
      else lenAdjust = 1.5;

      var finalLenCm = baseLenCm + lenAdjust;
      var finalLenIn = (finalLenCm / 2.54).toFixed(2);
      var lenNote = '';
      if (lenAdjust > 0) lenNote = ' (+'  + lenAdjust + ' cm for ' + w + ' lb crew)';
      else if (lenAdjust < 0) lenNote = ' (' + lenAdjust + ' cm for lighter ' + w + ' lb crew)';
      guideSettings.spreader_length = useInches
        ? finalLenIn + '" (' + finalLenCm.toFixed(1) + ' cm)' + lenNote
        : finalLenCm.toFixed(1) + ' cm (' + finalLenIn + '")' + lenNote;

      // Dynamic spreader sweep based on maker, wind, weight, sea state
      // Base sweep ranges by maker (cm): [light, medium, heavy]
      var baseSweep = {
        quantum: { light: 74.0, medium: 75.5, heavy: 78.0 },
        north:   { light: 76.0, medium: 78.0, heavy: 80.0 },
        olimpic: { light: 74.0, medium: 74.0, heavy: 75.0 }
      };
      var sweepCm = baseSweep[maker][range];

      // Weight adjustment: heavier crews open sweep more (stiffer rig needed)
      var sweepWAdj = 0;
      if (w < 230) sweepWAdj = -1.0;
      else if (w < 260) sweepWAdj = -0.5;
      else if (w <= 290) sweepWAdj = 0;
      else if (w <= 320) sweepWAdj = 0.5;
      else sweepWAdj = 1.0;

      // Sea state adjustment
      var sweepSeaAdj = 0;
      if (sea === 'choppy') sweepSeaAdj = 0.5;
      else if (sea === 'large') sweepSeaAdj = 1.0;
      else if (sea === 'flat') sweepSeaAdj = -0.5;

      // Wind-specific fine tuning within ranges
      var sweepWindAdj = 0;
      if (range === 'light' && wind <= 3) sweepWindAdj = -0.5;
      else if (range === 'heavy' && wind >= 20) sweepWindAdj = 1.0;
      else if (range === 'heavy' && wind >= 18) sweepWindAdj = 0.5;

      // JibeTech chainplates are 1" (2.5 cm) closer together — reduce sweep to match
      var sweepBuilderAdj = 0;
      if (builder === 'jibetech') sweepBuilderAdj = -2.5;

      var finalSweepCm = sweepCm + sweepWAdj + sweepSeaAdj + sweepWindAdj + sweepBuilderAdj;
      var finalSweepIn = (finalSweepCm / 2.54).toFixed(1);
      var sweepNotes = [];
      if (sweepBuilderAdj !== 0) sweepNotes.push(sweepBuilderAdj + ' cm JibeTech chainplates');
      if (sweepWAdj !== 0) sweepNotes.push((sweepWAdj > 0 ? '+' : '') + sweepWAdj + ' cm weight');
      if (sweepSeaAdj !== 0) sweepNotes.push((sweepSeaAdj > 0 ? '+' : '') + sweepSeaAdj + ' cm sea state');
      if (sweepWindAdj !== 0) sweepNotes.push((sweepWindAdj > 0 ? '+' : '') + sweepWindAdj + ' cm wind');
      var sweepDetail = sweepNotes.length > 0 ? ' (' + sweepNotes.join(', ') + ')' : '';
      guideSettings.spreader_sweep = useInches
        ? finalSweepIn + '" (' + finalSweepCm.toFixed(1) + ' cm) tip-to-tip' + sweepDetail
        : finalSweepCm.toFixed(1) + ' cm (' + finalSweepIn + '") tip-to-tip' + sweepDetail;

      // --- Dynamic shroud adjuster wiggle based on wind + sea state ---
      if (range === 'light' && (sea === 'choppy' || sea === 'large')) {
        guideSettings.mast_wiggle = 'A little — reduce wiggle in light air + ' + (sea === 'large' ? 'waves' : 'chop') + ' to prevent excessive rig movement; too much slack lets mast pump and disrupts sail shape';
      } else if (range === 'light' && sea === 'flat' && wind <= 3) {
        guideSettings.mast_wiggle = 'Downright Sloppy! — flat water drifter: maximum freedom for mast to respond to every puff';
      }

      // --- Sail aging adjustments ---
      // As sails age: draft deepens, moves aft, leech opens → can't point as high
      // Compensate by adjusting settings to flatten sail and tighten leech
      const mainCond = document.getElementById('mg-main-condition').value;
      const jibCond = document.getElementById('mg-jib-condition').value;
      var agingNotes = [];

      // Mainsail aging adjustments
      if (mainCond === 'mid') {
        // Mid-life: moderate compensation
        agingNotes.push('⛵ Mainsail mid-life: add +1-2 cm more cunningham, +1 click outhaul, slight vang increase to tighten leech');
        if (guideSettings.cunningham) guideSettings.cunningham += ' — ADD more cunningham for mid-life main (flatten entry, move draft forward)';
        if (guideSettings.outhaul) guideSettings.outhaul += ' — ADD more outhaul tension for mid-life main (flatten lower sail)';
        if (guideSettings.vang) guideSettings.vang += ' — ADD slightly more vang for mid-life main (close leech)';
      } else if (mainCond === 'old') {
        // Rag bin: maximum compensation
        agingNotes.push('⚠️ Mainsail worn: MAX cunningham, MAX outhaul, extra vang — draft is deep/aft, leech is open. Consider new sail!');
        if (guideSettings.cunningham) guideSettings.cunningham += ' — MAX cunningham for old main (draft has moved aft, flatten aggressively)';
        if (guideSettings.outhaul) guideSettings.outhaul += ' — MAX outhaul for old main (flatten deep lower section)';
        if (guideSettings.vang) guideSettings.vang += ' — ADD significant vang for old main (close open leech)';
        if (guideSettings.mast_rake) guideSettings.mast_rake += ' — consider +1/4" more rake to compensate for reduced pointing';
        if (guideSettings.traveler_position) guideSettings.traveler_position += ' — traveler slightly higher to compensate for open leech';
      }

      // Jib aging adjustments
      if (jibCond === 'mid') {
        agingNotes.push('⛵ Jib mid-life: move jib lead aft 1 hole, add halyard tension to flatten entry');
        if (guideSettings.jib_lead) guideSettings.jib_lead += ' — MOVE jib lead 1 hole aft for mid-life jib (close leech)';
        if (guideSettings.jib_cloth_tension) guideSettings.jib_cloth_tension += ' — ADD more halyard tension for mid-life jib (flatten stretched luff)';
        if (guideSettings.jib_height) guideSettings.jib_height += ' — raise tack slightly for mid-life jib (flatten lower section)';
      } else if (jibCond === 'old') {
        agingNotes.push('⚠️ Jib worn: lead well aft, MAX halyard, raise tack — stretched shape can\\'t be fully corrected. Consider new jib!');
        if (guideSettings.jib_lead) guideSettings.jib_lead += ' — MOVE jib lead 1-2 holes aft for old jib (close open leech)';
        if (guideSettings.jib_cloth_tension) guideSettings.jib_cloth_tension += ' — MAX halyard tension for old jib (take stretch out of luff)';
        if (guideSettings.jib_height) guideSettings.jib_height += ' — raise tack more for old jib (flatten deep lower section)';
        if (guideSettings.jib_outboard_lead) guideSettings.jib_outboard_lead += ' — move lead slightly inboard for old jib (tighten slot to compensate for open leech)';
      }

      const mainModel = document.getElementById('mg-main-model').value || '';
      const jibMakerVal = document.getElementById('mg-jib-maker').value;
      const jibModel = document.getElementById('mg-jib-model').value || '';
      const jibMakerName = jibMakerVal === 'quantum' ? 'Quantum' : jibMakerVal === 'north' ? 'North' : 'Olimpic';
      const makerName = maker === 'quantum' ? 'Quantum' : maker === 'north' ? 'North' : 'Olimpic';
      const builderName = builder === 'jibetech' ? 'JibeTech' : 'DB/MAS/Persson';

      // Fetch user's race log data
      let raceData = [];
      let topRaces = [];
      try {
        const resp = await fetch('/api/magic-data');
        raceData = await resp.json();
        // Filter to matching wind range and high performance (7+)
        topRaces = raceData.filter(r => {
          const rw = parseFloat(r.wind_speed);
          if (isNaN(rw)) return false;
          const rRange = rw <= 7 ? 'light' : rw >= 15 ? 'heavy' : 'medium';
          return rRange === range && parseFloat(r.performance_rating) >= 7;
        });
      } catch(e) {}

      // Build best-of from race logs for each setting
      const settingKeys = Object.keys(guideSettings);
      function bestFromLogs(key) {
        const vals = topRaces.map(r => r[key]).filter(v => v && v.trim());
        if (vals.length === 0) return null;
        // Find most common value
        const freq = {};
        vals.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
        let best = null, bestCount = 0;
        for (const [v, c] of Object.entries(freq)) {
          if (c > bestCount) { best = v; bestCount = c; }
        }
        return { value: best, count: bestCount, total: vals.length };
      }

      let html = '';
      let logMatchCount = 0;
      for (const key of settingKeys) {
        const guideVal = guideSettings[key];
        const logBest = bestFromLogs(key);
        html += '<div class="magic-setting">';
        html += '<div class="magic-icon">' + (icons[key] || '⚙️') + '</div>';
        html += '<div class="magic-label">' + labels[key] + '</div>';
        html += '<div class="magic-value">' + guideVal + '</div>';
        if (logBest) {
          logMatchCount++;
          html += '<div style="margin-top:8px;padding:6px 8px;background:#e8f5e9;border-radius:6px;font-size:0.82rem;color:#2e7d32;">';
          html += '📊 Your best: <strong>' + logBest.value + '</strong> <span style="color:#666;">(' + logBest.count + '/' + logBest.total + ' top races)</span>';
          html += '</div>';
        }
        html += '</div>';
      }

      // Notes
      let notes = [];
      const bn = builderNote(builder);
      if (bn) notes.push('🚤 ' + bn);
      const wn = weightNote(weight);
      if (wn) notes.push('⚖️ ' + wn);
      const sn = seaNote(sea);
      if (sn) notes.push(sn);
      // Water type note
      notes.push(waterNote(isFreshwater, range));
      // Wire size note
      notes.push(wireNote(wireSize, range));
      // Add sail-model-specific notes
      if (mainModel && sailModelNotes[mainModel]) notes.push('🔺 Main: ' + sailModelNotes[mainModel]);
      if (jibModel && sailModelNotes[jibModel]) notes.push('🔻 Jib: ' + sailModelNotes[jibModel]);
      // Add sail aging notes
      agingNotes.forEach(function(n) { notes.push(n); });
      if (topRaces.length > 0) {
        notes.push('📊 Found ' + topRaces.length + ' of your races in ' + rangeLabel.toLowerCase() + ' with performance rating 7+. Your most-used settings from top races are shown in green.');
      } else if (raceData.length > 0) {
        notes.push('📊 No top-rated races (7+) found in this wind range yet. Log more races to see personalized recommendations!');
      } else {
        notes.push('📊 No race data logged yet. Start logging races to get personalized settings blended with tuning guide recommendations!');
      }

      // Mast pinning reminder
      if (wind >= 12) {
        html += '<div style="grid-column:1/-1;margin-top:14px;padding:16px;background:linear-gradient(135deg,#fef2f2,#fee2e2);border:2px solid #ef4444;border-radius:10px;">';
        html += '<strong style="color:#dc2626;font-size:1.1rem;">📌 REMINDER: Pin your mast at 15+ knots!</strong>';
        html += '<div style="color:#7f1d1d;margin-top:6px;">Lock the forward mast pusher at or forward of neutral to prevent mast inversion. In winds above <strong>15 kts</strong>, the vang and mainsheet loads can reverse the mast bend — always set the mast pin before launching in heavy air. If wind builds to 15+ kts on the water, pin the mast immediately.</div>';
        html += '</div>';
      }

      document.getElementById('mg-grid').innerHTML = html;

      // Move corrective action BEFORE adjustment notes
      var corrDiv = document.getElementById('mg-corrective');
      var mgGrid = document.getElementById('mg-grid');
      mgGrid.parentNode.insertBefore(corrDiv, mgGrid.nextSibling);
      corrDiv.style.display = '';

      // Adjustment notes — AFTER corrective action
      var notesHtml = '';
      if (notes.length) {
        notesHtml += '<div style="margin-top:12px;padding:16px;background:#f0f7ff;border-radius:10px;border:1px solid #c5ddf5;">';
        notesHtml += '<strong style="color:#0b3d6e;">Adjustment Notes:</strong><br>';
        notes.forEach(n => { notesHtml += '<div style="margin-top:6px;color:#333;">' + n + '</div>'; });
        notesHtml += '</div>';
      }
      var notesDiv = document.getElementById('mg-adj-notes');
      if (!notesDiv) { notesDiv = document.createElement('div'); notesDiv.id = 'mg-adj-notes'; corrDiv.parentNode.insertBefore(notesDiv, corrDiv.nextSibling); }
      notesDiv.innerHTML = notesHtml;

      document.getElementById('mg-source').innerHTML = '📋 <strong>' + builderName + '</strong> hull — Main: <strong>' + makerName + ' ' + mainModel + '</strong> — Jib: <strong>' + jibMakerName + ' ' + jibModel + '</strong> — <strong>' + rangeLabel + '</strong> — Wind: ' + wind + ' kts — Sea: ' + sea.charAt(0).toUpperCase() + sea.slice(1).replace('large','Large Waves') + (logMatchCount > 0 ? ' — <span style="color:#2e7d32;">📊 ' + logMatchCount + ' settings matched from your logs</span>' : '');
      document.getElementById('mg-results').style.display = '';
    });

    // --- Corrective Action Calculator ---
    document.getElementById('ca-calc-btn').addEventListener('click', function() {
      var spLen = parseFloat(document.getElementById('ca-old-wind').value);
      var spSweep = parseFloat(document.getElementById('ca-old-sea').value);
      var newWind = parseFloat(document.getElementById('ca-new-wind').value);
      var newSea = document.getElementById('ca-new-sea').value;
      var useIn = ${lang === 'en' ? 'true' : 'false'};

      if (isNaN(spLen) || isNaN(spSweep) || isNaN(newWind)) {
        alert('Please select spreader length, sweep, and new wind speed.');
        return;
      }

      function windRange(w) { return w <= 7 ? 'light' : w >= 15 ? 'heavy' : 'medium'; }
      var newRange = windRange(newWind);

      // Determine what the OPTIMAL spreader settings would be for new conditions
      // Optimal length: 16.75" standard, doesn't change much with wind (set by crew weight)
      var optLen = 16.75; // standard
      // Optimal sweep by wind range (tip-to-tip inches)
      var optSweep = newRange === 'light' ? 29.25 : newRange === 'medium' ? 30.0 : 31.0;
      // Sea state adjustment to optimal sweep
      if (newSea === 'choppy') optSweep += 0.25;
      else if (newSea === 'large') optSweep += 0.5;
      else if (newSea === 'flat') optSweep -= 0.25;

      var lenDiff = spLen - optLen; // positive = too long, negative = too short
      var sweepDiff = spSweep - optSweep; // positive = too wide, negative = too narrow

      var actions = [];

      // --- Spreader Length Mismatch ---
      if (Math.abs(lenDiff) >= 0.25) {
        if (lenDiff > 0) {
          // Spreaders too LONG for conditions — rig too stiff side-to-side
          actions.push({icon:'🔒', label:'Spreader Length (LOCKED — too long by ' + lenDiff.toFixed(2) + '")', action: '<div style="color:#d32f2f;font-weight:600;margin-bottom:4px;">Spreaders ' + spLen + '" are ' + lenDiff.toFixed(2) + '" longer than optimal ' + optLen.toFixed(2) + '" for these conditions</div><div style="color:#1b5e20;">Compensate: Ease shroud tension 1-2 extra Sta-Master faces to allow more mast bend despite stiff spreaders. Push mast further forward for more prebend. Increase shroud adjuster wiggle to free the rig.</div>'});
        } else {
          // Spreaders too SHORT — rig too flexible side-to-side
          actions.push({icon:'🔒', label:'Spreader Length (LOCKED — too short by ' + Math.abs(lenDiff).toFixed(2) + '")', action: '<div style="color:#d32f2f;font-weight:600;margin-bottom:4px;">Spreaders ' + spLen + '" are ' + Math.abs(lenDiff).toFixed(2) + '" shorter than optimal ' + optLen.toFixed(2) + '" for these conditions</div><div style="color:#1b5e20;">Compensate: Tighten shroud tension 1-2 extra Sta-Master faces to stiffen the rig. The mast may bend too easily side-to-side — more shroud tension controls this.</div>'});
        }
      }

      // --- Spreader Sweep Mismatch ---
      if (Math.abs(sweepDiff) >= 0.5) {
        if (sweepDiff > 0) {
          // Sweep too WIDE — rig too stiff fore-aft, won't bend enough
          actions.push({icon:'🔒', label:'Spreader Sweep (LOCKED — too wide by ' + sweepDiff.toFixed(1) + '")', action: '<div style="color:#d32f2f;font-weight:600;margin-bottom:4px;">Sweep ' + spSweep + '" is ' + sweepDiff.toFixed(1) + '" wider than optimal ' + optSweep.toFixed(1) + '" for ' + newWind + ' kts ' + newSea + '</div><div style="color:#1b5e20;">Rig is too stiff — mast will not bend enough. Compensate:<br>• Ease shroud tension 1-2 Sta-Master turns to allow mast bend<br>• Push mast FORWARD to add prebend (force the bend)<br>• Release cunningham — wider spreaders already flatten the sail<br>• More shroud adjuster wiggle — let rig breathe<br>• Ease vang slightly — stiff rig holds leech without as much vang</div>'});
        } else {
          // Sweep too NARROW — rig too bendy, mast bends too easily
          actions.push({icon:'🔒', label:'Spreader Sweep (LOCKED — too narrow by ' + Math.abs(sweepDiff).toFixed(1) + '")', action: '<div style="color:#d32f2f;font-weight:600;margin-bottom:4px;">Sweep ' + spSweep + '" is ' + Math.abs(sweepDiff).toFixed(1) + '" narrower than optimal ' + optSweep.toFixed(1) + '" for ' + newWind + ' kts ' + newSea + '</div><div style="color:#1b5e20;">Rig is too bendy — mast overbends. Compensate:<br>• Tighten shroud tension 1-2 extra Sta-Master turns to resist bend<br>• Pull mast AFT to counteract bend — lock in with aft puller<br>• More cunningham to control luff as mast bends<br>• More vang to prevent upper mast from falling off<br>• Tighten shroud adjuster wiggle to None — lock rig down<br>• Consider pinning mast to prevent inversion if wind is 15+ kts</div>'});
        }
      }

      // ALWAYS give advice for NEW conditions — simple and direct

      // Mast Fwd/Aft Puller
      if (newRange === 'light') {
        actions.push({icon:'🔄', label:'Mast Fwd/Aft Puller', action: useIn ? 'Push mast FWD 1/4"-1/2" from neutral — prebend to open leech' : 'Push mast FWD 0.6-1.3 cm from neutral'});
      } else if (newRange === 'medium') {
        actions.push({icon:'🔄', label:'Mast Fwd/Aft Puller', action: 'Set mast at neutral mark — balance power for hiking'});
      } else {
        actions.push({icon:'🔄', label:'Mast Fwd/Aft Puller', action: useIn ? 'Pull mast AFT 3/8"-5/8" past neutral — counteract vang' : 'Pull mast AFT 1.0-1.6 cm past neutral'});
      }
      if (newSea === 'large') {
        actions.push({icon:'🔄', label:'Mast Puller (rough seas)', action: useIn ? 'Add 1/4" more AFT — power and twist for waves' : 'Add 0.6 cm more AFT for waves'});
      }

      // Traveler
      if (newRange === 'light') {
        actions.push({icon:'↕️', label:'Traveler', action: useIn ? 'To windward — boom at/above centerline; ease mainsheet for twist. Flat: all the way to windward.' : 'To windward — boom at/above centerline; ease mainsheet. Flat: full windward.'});
      } else if (newRange === 'medium') {
        actions.push({icon:'↕️', label:'Traveler', action: useIn ? 'Drop 3-4" below centerline — first depower tool' : 'Drop 8-10 cm below — first depower tool'});
      } else {
        actions.push({icon:'↕️', label:'Traveler', action: useIn ? 'Drop 5-7" below centerline — vang sheeting; play main' : 'Drop 13-18 cm below — vang sheeting'});
      }

      // Vang
      if (newRange === 'light') {
        actions.push({icon:'📐', label:'Vang', action: 'Slack — just remove slack, no load'});
      } else if (newRange === 'medium') {
        actions.push({icon:'📐', label:'Vang', action: 'Light tension — maintain leech when easing mainsheet'});
      } else {
        actions.push({icon:'📐', label:'Vang', action: 'Heavy — lock in mast bend, prevent leech hook; vang-sheet in gusts'});
      }

      // Cunningham
      if (newRange === 'light') {
        actions.push({icon:'⬇️', label:'Cunningham', action: 'Off/slack — allow wrinkles along luff for power'});
      } else if (newRange === 'medium') {
        actions.push({icon:'⬇️', label:'Cunningham', action: 'Light — just remove wrinkles from luff'});
      } else {
        actions.push({icon:'⬇️', label:'Cunningham', action: 'Heavy 10-15 cm — flatten entry, move draft forward, open leech'});
      }

      // Outhaul
      if (newRange === 'light') {
        actions.push({icon:'➡️', label:'Outhaul', action: useIn ? 'Eased 1-2" from black band — max draft' : 'Eased 2.5-5 cm — max draft'});
      } else if (newRange === 'medium') {
        actions.push({icon:'➡️', label:'Outhaul', action: 'At black band — draft at 45%'});
      } else {
        actions.push({icon:'➡️', label:'Outhaul', action: 'Max — flatten bottom of main'});
      }

      // Jib Lead
      if (newRange === 'light') {
        actions.push({icon:'🔻', label:'Jib Lead', action: useIn ? '87"-88" from tack — forward, powers up' : '221-224 cm from tack'});
      } else if (newRange === 'medium') {
        actions.push({icon:'🔻', label:'Jib Lead', action: useIn ? '88"-90" from tack — standard' : '224-229 cm from tack'});
      } else {
        actions.push({icon:'🔻', label:'Jib Lead', action: useIn ? '90"-93" from tack — aft, opens leech' : '229-236 cm from tack'});
      }

      // Jib Outboard Lead
      if (newRange === 'light') {
        actions.push({icon:'↔️', label:'Jib Outboard Lead', action: 'Inboard — tight slot, max pointing'});
      } else if (newRange === 'medium') {
        actions.push({icon:'↔️', label:'Jib Outboard Lead', action: 'Mid position — balanced slot'});
      } else {
        actions.push({icon:'↔️', label:'Jib Outboard Lead', action: 'Full outboard — open slot for depowering'});
      }

      // Shroud tension relative to spreader setting
      var sweepRange = spSweep <= 29.5 ? 'light' : spSweep >= 30.75 ? 'heavy' : 'medium';
      var rangeSteps = {light:0, medium:1, heavy:2};
      var staDiff = rangeSteps[newRange] - rangeSteps[sweepRange];
      if (staDiff !== 0) {
        actions.push({icon:'🔩', label:'Shroud Tension (Sta-Master)', action: (staDiff > 0 ? 'Tighten' : 'Loosen') + ' Sta-Master ' + Math.abs(staDiff) + ' turn(s) (6 faces/turn)'});
      }

      // Shroud wiggle
      if (newRange === 'light') {
        actions.push({icon:'↔️', label:'Shroud Adjuster Wiggle', action: 'Moderate to Sloppy — allow mast freedom'});
      } else if (newRange === 'medium') {
        actions.push({icon:'↔️', label:'Shroud Adjuster Wiggle', action: 'A little — leeward shroud slightly loose'});
      } else {
        actions.push({icon:'↔️', label:'Shroud Adjuster Wiggle', action: 'None — lock rig down, shroud snug'});
      }

      // Jib Height
      if (newRange === 'light') {
        actions.push({icon:'⬆️', label:'Jib Height', action: useIn ? '3"-3.5" deck to tack — low, tight slot' : '7.6-9 cm deck to tack'});
      } else if (newRange === 'medium') {
        actions.push({icon:'⬆️', label:'Jib Height', action: useIn ? '3.5"-4.5" deck to tack — Paradeda raised' : '9-11.5 cm deck to tack'});
      } else {
        actions.push({icon:'⬆️', label:'Jib Height', action: useIn ? '4.5"-5" deck to tack — Paradeda max' : '11.5-12.7 cm deck to tack'});
      }

      // Build output
      var out = '';
      out += '<div style="margin-bottom:12px;font-weight:700;color:#b45309;font-size:1.05rem;">🔒 Spreaders: Length ' + spLen + '" / Sweep ' + spSweep + '" — Now: ' + newWind + ' kts / ' + newSea + '</div>';
      out += '<div style="display:grid;grid-template-columns:1fr;gap:10px;">';
      out += '<div style="font-weight:700;color:#d97706;font-size:0.95rem;margin-bottom:4px;">⚙️ Set these controls for ' + newWind + ' kts ' + newSea + ':</div>';
      actions.forEach(function(a, i) {
        out += '<div style="display:flex;align-items:flex-start;gap:12px;padding:12px;background:white;border-radius:8px;border-left:4px solid #d97706;">';
        out += '<span style="font-size:1.4rem;">' + a.icon + '</span>';
        out += '<div><strong style="color:#b45309;">' + (i+1) + '. ' + a.label + '</strong><div style="color:#333;margin-top:4px;">' + a.action + '</div></div>';
        out += '</div>';
      });
      out += '</div>';
      out += '<div style="margin-top:12px;padding:10px;background:#fff3cd;border-radius:8px;font-size:0.85rem;color:#92400e;">Spreaders are LOCKED. The 🔒 items show how your rig differs from optimal. Priority: traveler, vang, cunningham (fastest). Then Sta-Master and mast puller.</div>';
      document.getElementById('ca-results').innerHTML = out;
      document.getElementById('ca-results').style.display = '';
    });
  })();
  </script>
  <style>
    .magic-setting { background:white; border:1px solid #e2e8f0; border-radius:10px; padding:16px; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
    .magic-icon { font-size:1.8rem; margin-bottom:6px; }
    .magic-label { font-size:0.8rem; color:#666; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; }
    .magic-value { font-size:1.05rem; color:#0b3d6e; font-weight:700; line-height:1.4; }
  </style>`, req.session.user, lang));
});

// --- FORECAST ---
app.get("/api/forecast", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

    // Fetch wind forecast from Open-Meteo (free, no API key)
    const windUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m&forecast_hours=24&wind_speed_unit=kn`;
    const windResp = await fetch(windUrl);
    const windData = await windResp.json();

    // Try to find nearest tide station for tide/current data
    let tideData = null;
    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);

    // Only try NOAA for locations roughly in US/territories waters
    // US bounds: lat 17-72, lon -180 to -60 (includes Alaska, Hawaii, PR, USVI, Guam)
    const isNearUS = (userLat >= 17 && userLat <= 72 && userLon >= -180 && userLon <= -60) ||
                     (userLat >= 13 && userLat <= 21 && userLon >= 143 && userLon <= 146); // Guam
    if (isNearUS) try {
      // Find nearest NOAA station
      const stationsUrl = `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=waterlevels&units=english`;
      const stResp = await fetch(stationsUrl, { signal: AbortSignal.timeout(6000) });
      const stJson = await stResp.json();

      if (stJson.stations && stJson.stations.length > 0) {
        let closest = null;
        let minDist = Infinity;

        stJson.stations.forEach(st => {
          if (!st.lat || !st.lng) return;
          const d = Math.sqrt(Math.pow(st.lat - userLat, 2) + Math.pow(st.lng - userLon, 2));
          if (d < minDist) { minDist = d; closest = st; }
        });

        if (closest && minDist < 0.5) { // Within ~0.5 degree (~30 miles) for tight local match
          const now = new Date();
          const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          const fmt = d => d.getFullYear() + '' + String(d.getMonth()+1).padStart(2,'0') + '' + String(d.getDate()).padStart(2,'0');
          const beginDate = fmt(now);
          const endDate = fmt(end);

          // Get tide predictions
          const tideUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${beginDate}&end_date=${endDate}&station=${closest.id}&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=h&units=english&format=json`;
          const tideResp = await fetch(tideUrl);
          const tideJson = await tideResp.json();

          const distMiles = Math.round(minDist * 60); // rough degrees to nautical miles
          tideData = {
            station: closest.name,
            stationId: closest.id,
            stationLat: closest.lat,
            stationLon: closest.lng,
            distanceMiles: distMiles,
            predictions: tideJson.predictions || [],
            currents: null
          };

          // Also try to find nearest current station for current speed
          try {
            const curStResp = await fetch('https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=currentpredictions&units=english');
            const curStJson = await curStResp.json();
            if (curStJson.stations && curStJson.stations.length > 0) {
              let closestCur = null, minCurDist = Infinity;
              curStJson.stations.forEach(st => {
                if (!st.lat || !st.lng) return;
                const d = Math.sqrt(Math.pow(st.lat - userLat, 2) + Math.pow(st.lng - userLon, 2));
                if (d < minCurDist) { minCurDist = d; closestCur = st; }
              });
              if (closestCur && minCurDist < 0.5) {
                const curUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${beginDate}&end_date=${endDate}&station=${closestCur.id}&product=currents_predictions&time_zone=lst_ldt&interval=h&units=english&format=json`;
                const curResp = await fetch(curUrl);
                const curJson = await curResp.json();
                if (curJson.current_predictions && curJson.current_predictions.cp) {
                  const curDistMiles = Math.round(minCurDist * 60);
                  tideData.currents = {
                    station: closestCur.name,
                    stationId: closestCur.id,
                    stationLat: closestCur.lat,
                    stationLon: closestCur.lng,
                    distanceMiles: curDistMiles,
                    predictions: curJson.current_predictions.cp
                  };
                }
              }
            }
          } catch(ce) { /* current data optional */ }
        }
      }
    } catch(e) { /* tide data is optional */ }

    // Fallback for international locations: Open-Meteo Marine API (free, global)
    if (!tideData) {
      try {
        const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction&forecast_hours=24`;
        const marineResp = await fetch(marineUrl, { signal: AbortSignal.timeout(6000) });
        const marineJson = await marineResp.json();
        if (marineJson.hourly && marineJson.hourly.wave_height) {
          const times = marineJson.hourly.time || [];
          const heights = marineJson.hourly.wave_height || [];
          const directions = marineJson.hourly.wave_direction || [];
          const periods = marineJson.hourly.wave_period || [];
          const swellH = marineJson.hourly.swell_wave_height || [];
          const swellD = marineJson.hourly.swell_wave_direction || [];
          const predictions = times.map((t, i) => ({
            t: t.replace('T', ' '),
            v: (heights[i] || 0).toFixed(3),
            waveDir: directions[i],
            wavePeriod: periods[i],
            swellHeight: swellH[i],
            swellDir: swellD[i]
          }));
          const locLabel = userLat.toFixed(2) + '°' + (userLat >= 0 ? 'N' : 'S') + ', ' + Math.abs(userLon).toFixed(2) + '°' + (userLon >= 0 ? 'E' : 'W');
          tideData = {
            station: 'Marine forecast at ' + locLabel,
            stationId: 'open-meteo-marine',
            stationLat: userLat,
            stationLon: userLon,
            distanceMiles: 0,
            predictions: predictions,
            currents: null,
            source: 'Open-Meteo Marine (wave data at forecast location)'
          };
        }
      } catch(me) { /* marine data optional */ }
    }

    // Extract water body name from tide station name
    let waterBody = null;
    if (tideData && tideData.station) {
      waterBody = tideData.station;
    }
    // Add requested location to response for display
    res.json({ wind: windData, tide: tideData, waterBody, requestedLat: userLat, requestedLon: userLon });
  } catch(e) {
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

// Geocode zip code via Open-Meteo geocoding
app.get("/api/geocode", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'query required' });

    // Split input: "city, country/state" or just "city" or zip code
    const parts = q.split(',').map(s => s.trim()).filter(Boolean);
    const cityName = parts[0];
    const qualifier = parts.length > 1 ? parts.slice(1).join(' ').toLowerCase() : null;

    // Search with just the city name for better results
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10&language=en&format=json`;
    const gResp = await fetch(geoUrl);
    const gData = await gResp.json();

    if (!gData.results || gData.results.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    let match = gData.results[0]; // default to first result

    // If user specified a country/state, find the best match
    if (qualifier) {
      const found = gData.results.find(r => {
        const country = (r.country || '').toLowerCase();
        const countryCode = (r.country_code || '').toLowerCase();
        const admin1 = (r.admin1 || '').toLowerCase();
        return country.includes(qualifier) || countryCode === qualifier ||
               admin1.includes(qualifier) || qualifier.includes(country) ||
               qualifier.includes(admin1);
      });
      if (found) match = found;
    }

    const nameParts = [match.name];
    if (match.admin1) nameParts.push(match.admin1);
    if (match.country) nameParts.push(match.country);
    res.json({ lat: match.latitude, lon: match.longitude, name: nameParts.join(', ') });
  } catch(e) {
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

app.get("/forecast", requireAuth, (req, res) => {
  const lang = getLang(req);
  const L = (k) => t(k, lang);
  const isEN = (lang === 'en');

  res.send(renderPage(`
  <div style="max-width:1000px;margin:30px auto;padding:0 15px;">
    <h2 style="color:#0b3d6e;text-align:center;">🌊 ${L('forecast')}</h2>

    <!-- Location Input -->
    <div style="background:white;border-radius:12px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.1);text-align:center;">
      <div style="display:flex;gap:10px;justify-content:center;align-items:center;flex-wrap:wrap;">
        <button onclick="useGeoLocation()" id="geo-btn" class="btn btn-primary" style="font-size:1rem;">
          📍 ${L('useMyLocation')}
        </button>
        <span style="color:#888;font-weight:600;">${lang === 'es' ? 'o' : lang === 'it' ? 'o' : lang === 'pt' ? 'ou' : 'or'}</span>
        <input type="text" id="location-input" placeholder="${L('enterLocation')}" style="padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;width:260px;">
        <button onclick="useLocationInput()" class="btn btn-secondary" style="font-size:1rem;">
          ${L('loadForecast')}
        </button>
      </div>
      <div id="location-status" style="margin-top:10px;color:#666;font-size:0.9rem;"></div>
    </div>

    <!-- Wind Forecast Chart -->
    <div id="wind-section" style="display:none;background:white;border-radius:12px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <h3 style="color:#0b3d6e;margin-top:0;">🌬️ ${L('windForecast')}</h3>
      <canvas id="wind-chart" height="280"></canvas>
      <div id="wind-detail-table" style="margin-top:18px;overflow-x:auto;"></div>
    </div>

    <!-- Wind Direction Compass Chart -->
    <div id="wind-dir-section" style="display:none;background:white;border-radius:12px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <h3 style="color:#0b3d6e;margin-top:0;">🧭 ${lang === 'es' ? 'Dirección del Viento por Hora' : lang === 'it' ? 'Direzione del Vento per Ora' : lang === 'pt' ? 'Direção do Vento por Hora' : 'Hourly Wind Direction'}</h3>
      <canvas id="wind-dir-chart" height="200"></canvas>
    </div>

    <!-- Tide/Current Chart -->
    <div id="tide-section" style="display:none;background:white;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <h3 style="color:#0b3d6e;margin-top:0;">🌊 ${L('tideForecast')}</h3>
      <div id="tide-station" style="color:#666;font-size:0.85rem;margin-bottom:10px;"></div>
      <canvas id="tide-chart" height="300"></canvas>
    </div>

    <div id="no-tide-msg" style="display:none;background:white;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.1);text-align:center;color:#888;">
      ${lang === 'es' ? 'No se encontró estación de mareas NOAA cerca de esta ubicación.' : lang === 'it' ? 'Nessuna stazione di marea NOAA trovata nelle vicinanze.' : lang === 'pt' ? 'Nenhuma estação de marés NOAA encontrada perto desta localização.' : 'No NOAA tide station found within range of this location.'}
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script>
  (function() {
    var windChart = null, tideChart = null;
    var isEN = ${isEN};
    var TXT = {
      windKts: '${lang === "es" ? "Viento (nudos)" : lang === "it" ? "Vento (nodi)" : lang === "pt" ? "Vento (nós)" : "Wind (kts)"}',
      gustsKts: '${lang === "es" ? "Ráfagas (nudos)" : lang === "it" ? "Raffiche (nodi)" : lang === "pt" ? "Rajadas (nós)" : "Gusts (kts)"}',
      knots: '${lang === "es" ? "Nudos" : lang === "it" ? "Nodi" : lang === "pt" ? "Nós" : "Knots"}',
      direction: '${lang === "es" ? "Dirección" : lang === "it" ? "Direzione" : lang === "pt" ? "Direção" : "Direction"}',
      time: '${lang === "es" ? "Hora" : lang === "it" ? "Ora" : lang === "pt" ? "Hora" : "Time"}',
      tideHeight: '${lang === "es" ? "Altura de Marea (pies)" : lang === "it" ? "Altezza Marea (piedi)" : lang === "pt" ? "Altura da Maré (pés)" : "Tide Height (ft)"}',
      heightFt: '${lang === "es" ? "Altura (pies)" : lang === "it" ? "Altezza (piedi)" : lang === "pt" ? "Altura (pés)" : "Height (ft)"}',
      noaaStation: '${lang === "es" ? "Estación NOAA" : lang === "it" ? "Stazione NOAA" : lang === "pt" ? "Estação NOAA" : "NOAA Station"}',
      noTide: '${lang === "es" ? "No se encontró estación de mareas NOAA cerca de esta ubicación." : lang === "it" ? "Nessuna stazione di marea NOAA trovata nelle vicinanze." : lang === "pt" ? "Nenhuma estação de marés NOAA encontrada perto desta localização." : "No NOAA tide station found within range of this location."}',
      incoming: '${L("incoming")}',
      outgoing: '${L("outgoing")}',
      flood: '${lang === "es" ? "Creciente" : lang === "it" ? "Flusso" : lang === "pt" ? "Enchente" : "Flood"}',
      ebb: '${lang === "es" ? "Bajante" : lang === "it" ? "Riflusso" : lang === "pt" ? "Vazante" : "Ebb"}',
      rising: '${lang === "es" ? "Subiendo" : lang === "it" ? "In salita" : lang === "pt" ? "Subindo" : "Rising"}',
      falling: '${lang === "es" ? "Bajando" : lang === "it" ? "In discesa" : lang === "pt" ? "Descendo" : "Falling"}'
    };

    function fmtHour(iso) {
      var d = new Date(iso);
      var h = d.getHours();
      if (isEN) {
        var ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return h + ampm;
      }
      return String(h).padStart(2,'0') + ':00';
    }

    function dirLabel(deg) {
      var dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
      return dirs[Math.round(deg / 22.5) % 16];
    }

    function dirArrow(deg) {
      var arrows = ['↓','↙','←','↖','↑','↗','→','↘'];
      return arrows[Math.round(deg / 45) % 8];
    }

    function loadForecast(lat, lon, locName) {
      var statusEl = document.getElementById('location-status');
      statusEl.innerHTML = '${L("locating")} <b>' + (locName || (lat.toFixed(2) + ', ' + lon.toFixed(2))) + '</b>';

      fetch('/api/forecast?lat=' + lat + '&lon=' + lon)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          // Show location + nearest water body
          var locText = '📍 <b>' + (locName || (lat.toFixed(2) + ', ' + lon.toFixed(2))) + '</b>';
          if (data.waterBody) {
            locText += ' &nbsp;—&nbsp; 🌊 ${L("nearestWater")}: <b>' + data.waterBody + '</b>';
          }
          statusEl.innerHTML = locText;
          renderWind(data.wind);
          renderTide(data.tide, data);
        })
        .catch(function(e) {
          statusEl.textContent = 'Error loading forecast.';
        });
    }

    function renderWind(wind) {
      if (!wind || !wind.hourly) return;
      try {
      var section = document.getElementById('wind-section');
      section.style.display = '';

      var times = wind.hourly.time.map(fmtHour);
      var speeds = wind.hourly.wind_speed_10m;
      var gusts = wind.hourly.wind_gusts_10m;
      var dirs = wind.hourly.wind_direction_10m;

      // Color code by wind strength
      var barColors = speeds.map(function(s) {
        if (s < 8) return 'rgba(76,175,80,0.7)';   // Light - green
        if (s < 15) return 'rgba(33,150,243,0.7)';  // Medium - blue
        if (s < 22) return 'rgba(255,152,0,0.7)';   // Heavy - orange
        return 'rgba(244,67,54,0.7)';                // Storm - red
      });

      if (windChart) windChart.destroy();
      var ctx = document.getElementById('wind-chart').getContext('2d');
      windChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: times,
          datasets: [
            {
              label: TXT.windKts,
              data: speeds,
              backgroundColor: barColors,
              borderRadius: 4,
              order: 2
            },
            {
              label: TXT.gustsKts,
              data: gusts,
              type: 'line',
              borderColor: 'rgba(244,67,54,0.8)',
              backgroundColor: 'rgba(244,67,54,0.1)',
              borderWidth: 2,
              pointRadius: 3,
              fill: false,
              order: 1
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true, position: 'top' },
            tooltip: {
              callbacks: {
                afterLabel: function(ctx) {
                  if (dirs[ctx.dataIndex] !== undefined) {
                    return 'Direction: ' + dirLabel(dirs[ctx.dataIndex]) + ' ' + dirArrow(dirs[ctx.dataIndex]) + ' (' + Math.round(dirs[ctx.dataIndex]) + '°)';
                  }
                  return '';
                }
              }
            }
          },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: TXT.knots } }
          }
        }
      });

      // Detailed hourly wind table with speed range and direction
      var rangeLabel = isEN ? 'Range (kts)' : TXT.knots;
      var gustLabel = isEN ? 'Gusts' : TXT.gustsKts;
      var html = '<table style="width:100%;border-collapse:collapse;font-size:0.85rem;border:1px solid #ddd;">';
      html += '<thead><tr style="background:#0b3d6e;color:white;">';
      html += '<th style="padding:8px;text-align:center;">' + TXT.time + '</th>';
      html += '<th style="padding:8px;text-align:center;">' + TXT.windKts + '</th>';
      html += '<th style="padding:8px;text-align:center;">' + gustLabel + '</th>';
      html += '<th style="padding:8px;text-align:center;">' + rangeLabel + '</th>';
      html += '<th style="padding:8px;text-align:center;">' + TXT.direction + '</th>';
      html += '</tr></thead><tbody>';
      for (var i = 0; i < times.length; i++) {
        var sp = Math.round(speeds[i]);
        var gu = Math.round(gusts[i]);
        var bg = speeds[i] < 8 ? '#f0fdf4' : speeds[i] < 15 ? '#eff6ff' : speeds[i] < 22 ? '#fffbeb' : '#fef2f2';
        var stripe = i % 2 === 0 ? bg : '#ffffff';
        html += '<tr style="background:' + stripe + ';border-bottom:1px solid #eee;">';
        html += '<td style="padding:8px;text-align:center;font-weight:600;">' + times[i] + '</td>';
        html += '<td style="padding:8px;text-align:center;font-size:1.1rem;font-weight:700;color:#0b3d6e;">' + sp + '</td>';
        html += '<td style="padding:8px;text-align:center;color:#e53935;">' + gu + '</td>';
        html += '<td style="padding:8px;text-align:center;font-weight:600;">' + sp + ' – ' + gu + '</td>';
        html += '<td style="padding:8px;text-align:center;font-size:1.1rem;">' + dirArrow(dirs[i]) + ' ' + dirLabel(dirs[i]) + ' <span style="color:#888;font-size:0.8rem;">(' + Math.round(dirs[i]) + '°)</span></td>';
        html += '</tr>';
      }
      html += '</tbody></table>';
      document.getElementById('wind-detail-table').innerHTML = html;

      // Wind direction chart
      try {
        document.getElementById('wind-dir-section').style.display = '';
        var dirCtx = document.getElementById('wind-dir-chart').getContext('2d');
        if (window._windDirChart) window._windDirChart.destroy();
        window._windDirChart = new Chart(dirCtx, {
          type: 'line',
          data: {
            labels: times,
            datasets: [{
              label: TXT.direction,
              data: dirs,
              borderColor: '#1565c0',
              backgroundColor: 'rgba(21,101,192,0.15)',
              borderWidth: 2,
              pointRadius: 5,
              pointBackgroundColor: '#0b3d6e',
              fill: true,
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(tipCtx) {
                    var val = tipCtx.raw;
                    return dirArrow(val) + ' ' + dirLabel(val) + ' (' + Math.round(val) + ')';
                  }
                }
              }
            },
            scales: {
              y: {
                min: 0, max: 360,
                title: { display: true, text: TXT.direction },
                ticks: {
                  stepSize: 45,
                  callback: function(val) {
                    var labels = {0:'N',45:'NE',90:'E',135:'SE',180:'S',225:'SW',270:'W',315:'NW',360:'N'};
                    return labels[val] || val;
                  }
                }
              }
            }
          }
        });
      } catch(dirErr) { console.error('Dir chart error:', dirErr); }
      } catch(windErr) { console.error('Wind render error:', windErr); }
    }

    function renderTide(tide, data) {
      var tideSection = document.getElementById('tide-section');
      var noTideMsg = document.getElementById('no-tide-msg');

      if (!tide || !tide.predictions || tide.predictions.length < 2) {
        tideSection.style.display = 'none';
        noTideMsg.style.display = '';
        return;
      }

      tideSection.style.display = '';
      noTideMsg.style.display = 'none';
      // Build detailed station info with coordinates, map link, distance, and source
      function fmtCoord(lat, lon) {
        var latDir = lat >= 0 ? 'N' : 'S';
        var lonDir = lon >= 0 ? 'E' : 'W';
        return Math.abs(lat).toFixed(4) + '\\u00B0' + latDir + ', ' + Math.abs(lon).toFixed(4) + '\\u00B0' + lonDir;
      }
      function mapLink(lat, lon) {
        return ' <a href="https://www.google.com/maps?q=' + lat + ',' + lon + '&z=12" target="_blank" style="color:#0b3d6e;text-decoration:underline;font-size:0.8rem;" title="View on Google Maps">\\ud83d\\uddfa\\ufe0f map</a>';
      }
      function calcDistNm(lat1, lon1, lat2, lon2) {
        // Haversine formula for nautical miles
        var R = 3440.065; // Earth radius in nm
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
      }
      function fmtDist(nm) {
        if (nm < 1) return '< 1 nm from forecast location';
        return nm + ' nm from forecast location';
      }

      var reqLat = data.requestedLat;
      var reqLon = data.requestedLon;

      var stationHtml = '<div style="background:#f0f7ff;border:1px solid #c5ddf5;border-radius:8px;padding:12px 14px;margin-bottom:12px;font-size:0.88rem;line-height:1.6;">';
      stationHtml += '<div style="font-weight:700;color:#0b3d6e;margin-bottom:8px;font-size:0.92rem;">Data Sources & Station Locations</div>';

      // Wind station info — always has coordinates from Open-Meteo
      if (data.wind && data.wind.latitude) {
        var windLat = data.wind.latitude;
        var windLon = data.wind.longitude;
        var windDist = calcDistNm(reqLat, reqLon, windLat, windLon);
        stationHtml += '<div style="margin-bottom:8px;padding:6px 8px;background:white;border-radius:6px;border-left:3px solid #2196f3;">';
        stationHtml += '<b>\\ud83c\\udf2c\\ufe0f Wind forecast</b><br>';
        stationHtml += '<span style="color:#444;">' + fmtCoord(windLat, windLon) + '</span>' + mapLink(windLat, windLon) + '<br>';
        stationHtml += '<span style="color:#888;font-size:0.82rem;">' + fmtDist(windDist) + ' &bull; Source: Open-Meteo</span>';
        stationHtml += '</div>';
      }

      // Tide station info
      stationHtml += '<div style="margin-bottom:8px;padding:6px 8px;background:white;border-radius:6px;border-left:3px solid #4caf50;">';
      if (tide.source) {
        stationHtml += '<b>\\ud83c\\udf0a Tide/Marine data</b><br>';
        stationHtml += '<span style="color:#444;">' + tide.station + '</span>';
        if (tide.stationLat) {
          var tideDist = calcDistNm(reqLat, reqLon, tide.stationLat, tide.stationLon);
          stationHtml += '<br><span style="color:#444;">' + fmtCoord(tide.stationLat, tide.stationLon) + '</span>' + mapLink(tide.stationLat, tide.stationLon);
          stationHtml += '<br><span style="color:#888;font-size:0.82rem;">' + fmtDist(tideDist) + ' &bull; Source: ' + tide.source + '</span>';
        } else {
          stationHtml += '<br><span style="color:#888;font-size:0.82rem;">Source: ' + tide.source + '</span>';
        }
      } else {
        stationHtml += '<b>\\ud83c\\udf0a Tide station</b><br>';
        stationHtml += '<span style="color:#444;">' + tide.station + ' (#' + tide.stationId + ')</span>';
        if (tide.stationLat) {
          var tideDist2 = calcDistNm(reqLat, reqLon, tide.stationLat, tide.stationLon);
          stationHtml += '<br><span style="color:#444;">' + fmtCoord(tide.stationLat, tide.stationLon) + '</span>' + mapLink(tide.stationLat, tide.stationLon);
          stationHtml += '<br><span style="color:#888;font-size:0.82rem;">' + fmtDist(tideDist2) + ' &bull; Source: NOAA CO-OPS</span>';
        } else {
          stationHtml += '<br><span style="color:#888;font-size:0.82rem;">Source: NOAA CO-OPS</span>';
        }
      }
      stationHtml += '</div>';

      // Current station info
      if (tide.currents && tide.currents.station) {
        stationHtml += '<div style="padding:6px 8px;background:white;border-radius:6px;border-left:3px solid #ff9800;">';
        stationHtml += '<b>\\ud83d\\udd04 Current station</b><br>';
        stationHtml += '<span style="color:#444;">' + tide.currents.station;
        if (tide.currents.stationId) stationHtml += ' (#' + tide.currents.stationId + ')';
        stationHtml += '</span>';
        if (tide.currents.stationLat) {
          var curDist = calcDistNm(reqLat, reqLon, tide.currents.stationLat, tide.currents.stationLon);
          stationHtml += '<br><span style="color:#444;">' + fmtCoord(tide.currents.stationLat, tide.currents.stationLon) + '</span>' + mapLink(tide.currents.stationLat, tide.currents.stationLon);
          stationHtml += '<br><span style="color:#888;font-size:0.82rem;">' + fmtDist(curDist) + ' &bull; Source: NOAA CO-OPS</span>';
        } else {
          stationHtml += '<br><span style="color:#888;font-size:0.82rem;">Source: NOAA CO-OPS</span>';
        }
        stationHtml += '</div>';
      }

      stationHtml += '</div>';
      document.getElementById('tide-station').innerHTML = stationHtml;

      var predictions = tide.predictions;
      var labels = [];
      var heights = [];
      var bgColors = [];

      for (var i = 0; i < predictions.length; i++) {
        var p = predictions[i];
        var dt = new Date(p.t);
        labels.push(fmtHour(p.t));
        heights.push(parseFloat(p.v));

        // Determine incoming (rising) vs outgoing (falling)
        if (i < predictions.length - 1) {
          var next = parseFloat(predictions[i + 1].v);
          var curr = parseFloat(p.v);
          if (next >= curr) {
            bgColors.push('rgba(76,175,80,0.6)'); // Green = incoming/flood
          } else {
            bgColors.push('rgba(244,67,54,0.6)'); // Red = outgoing/ebb
          }
        } else {
          // Last point — use same as previous
          bgColors.push(bgColors[bgColors.length - 1] || 'rgba(150,150,150,0.6)');
        }
      }

      if (tideChart) tideChart.destroy();
      var ctx = document.getElementById('tide-chart').getContext('2d');
      tideChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: TXT.tideHeight,
            data: heights,
            backgroundColor: bgColors,
            borderRadius: 3
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                afterLabel: function(ctx) {
                  var color = bgColors[ctx.dataIndex];
                  return color.includes('76,175,80') ? '🟢 ' + TXT.incoming + ' (' + TXT.flood + ')' : '🔴 ' + TXT.outgoing + ' (' + TXT.ebb + ')';
                }
              }
            }
          },
          scales: {
            y: { title: { display: true, text: TXT.heightFt } }
          }
        }
      });

      // Calculate max current speeds from current predictions
      var maxFloodKts = 0, maxEbbKts = 0;
      if (tide.currents && tide.currents.predictions) {
        tide.currents.predictions.forEach(function(cp) {
          var v = parseFloat(cp.Velocity_Major) || 0;
          if (v > maxFloodKts) maxFloodKts = v;
          if (v < 0 && Math.abs(v) > maxEbbKts) maxEbbKts = Math.abs(v);
        });
      }

      // Add legend with max current speed
      var legendHtml = '<div style="display:flex;gap:20px;justify-content:center;margin-top:12px;font-size:0.9rem;flex-wrap:wrap;">';
      var floodSpeed = maxFloodKts > 0 ? ' — max ' + maxFloodKts.toFixed(1) + ' kts' : '';
      var ebbSpeed = maxEbbKts > 0 ? ' — max ' + maxEbbKts.toFixed(1) + ' kts' : '';
      legendHtml += '<span>🟢 <b style="color:#4caf50;">' + TXT.incoming + '</b> (' + TXT.flood + ' / ' + TXT.rising + ')' + floodSpeed + '</span>';
      legendHtml += '<span>🔴 <b style="color:#f44336;">' + TXT.outgoing + '</b> (' + TXT.ebb + ' / ' + TXT.falling + ')' + ebbSpeed + '</span>';
      legendHtml += '</div>';

      // Current station details now shown in station info box above

      document.getElementById('tide-station').insertAdjacentHTML('afterend', legendHtml);
    }

    window.useGeoLocation = function() {
      var btn = document.getElementById('geo-btn');
      btn.textContent = '${L("locating")}';
      btn.disabled = true;

      if (!navigator.geolocation) {
        document.getElementById('location-status').textContent = 'Geolocation not supported. Please enter a zip code.';
        btn.textContent = '📍 ${L("useMyLocation")}';
        btn.disabled = false;
        return;
      }

      navigator.geolocation.getCurrentPosition(
        function(pos) {
          btn.textContent = '📍 ${L("useMyLocation")}';
          btn.disabled = false;
          loadForecast(pos.coords.latitude, pos.coords.longitude, 'Your Location (' + pos.coords.latitude.toFixed(3) + ', ' + pos.coords.longitude.toFixed(3) + ')');
        },
        function(err) {
          btn.textContent = '📍 ${L("useMyLocation")}';
          btn.disabled = false;
          document.getElementById('location-status').textContent = '${L("noLocation")}';
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    };

    window.useLocationInput = function() {
      var q = document.getElementById('location-input').value.trim();
      if (!q) return;
      document.getElementById('location-status').textContent = '${L("locating")}';

      fetch('/api/geocode?q=' + encodeURIComponent(q))
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.error) {
            document.getElementById('location-status').textContent = data.error;
            return;
          }
          loadForecast(data.lat, data.lon, data.name);
        })
        .catch(function() {
          document.getElementById('location-status').textContent = 'Error looking up location.';
        });
    };

    document.getElementById('location-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') useLocationInput();
    });

    // Auto-detect location on page load
    useGeoLocation();
  })();
  </script>`, req.session.user, lang));
});

// --- TASKS ---
app.get("/api/tasks", requireAuth, (req, res) => {
  const tasks = db.prepare("SELECT * FROM boat_tasks WHERE user_id = ? ORDER BY hull_number ASC, created_at ASC").all(req.session.user.id);
  res.json(tasks);
});

app.post("/api/tasks", requireAuth, (req, res) => {
  const { hull_number, task_description } = req.body;
  if (!hull_number || !task_description) return res.status(400).json({ error: 'Hull number and task required' });
  const result = db.prepare("INSERT INTO boat_tasks (user_id, hull_number, task_description) VALUES (?,?,?)").run(req.session.user.id, hull_number.trim(), task_description.trim());
  res.json({ ok: true, id: result.lastInsertRowid });
});

app.post("/api/tasks/:id/edit", requireAuth, (req, res) => {
  const { task_description, hull_number } = req.body;
  if (task_description !== undefined && hull_number !== undefined) {
    db.prepare("UPDATE boat_tasks SET task_description = ?, hull_number = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?").run(task_description.trim(), hull_number.trim(), req.params.id, req.session.user.id);
  } else if (task_description !== undefined) {
    db.prepare("UPDATE boat_tasks SET task_description = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?").run(task_description.trim(), req.params.id, req.session.user.id);
  }
  res.json({ ok: true });
});

app.post("/api/tasks/:id/delete", requireAuth, (req, res) => {
  db.prepare("DELETE FROM boat_tasks WHERE id = ? AND user_id = ?").run(req.params.id, req.session.user.id);
  res.json({ ok: true });
});

app.get("/api/hull-numbers", requireAuth, (req, res) => {
  const hulls = db.prepare("SELECT hull_number FROM user_hull_numbers WHERE user_id = ? ORDER BY hull_number ASC").all(req.session.user.id);
  res.json(hulls.map(h => h.hull_number));
});

app.post("/api/hull-numbers/add", requireAuth, (req, res) => {
  const { hull_number } = req.body;
  if (!hull_number || !hull_number.trim()) return res.status(400).json({ error: 'Hull number required' });
  db.prepare("INSERT OR IGNORE INTO user_hull_numbers (user_id, hull_number) VALUES (?,?)").run(req.session.user.id, hull_number.trim());
  res.json({ ok: true });
});

app.post("/api/hull-numbers/delete", requireAuth, (req, res) => {
  const { hull_number } = req.body;
  if (!hull_number) return res.status(400).json({ error: 'Hull number required' });
  db.prepare("DELETE FROM user_hull_numbers WHERE user_id = ? AND hull_number = ?").run(req.session.user.id, hull_number.trim());
  res.json({ ok: true });
});

app.get("/tasks", requireAuth, (req, res) => {
  const lang = getLang(req);
  const L = (k) => t(k, lang);
  const isEN = (lang === 'en');
  res.send(renderPage(`
  <div style="max-width:900px;margin:30px auto;padding:0 15px;">
    <h2 style="color:#0b3d6e;text-align:center;">🔧 ${L('tasks')}</h2>

    <!-- Add Hull Number Section -->
    <div style="background:white;border-radius:12px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <h3 style="color:#0b3d6e;margin-top:0;">${L('hullNumbers')}</h3>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
        <input type="text" id="hull-input" placeholder="${L('enterHullNumber')}" style="flex:1;min-width:150px;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;">
        <button onclick="addHullBtn()" class="btn btn-primary" style="white-space:nowrap;">+ ${L('addHullNumber')}</button>
        <button onclick="startVoiceHull()" title="Voice input" style="background:#0b3d6e;color:white;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:1.2rem;">🎤</button>
      </div>
      <div id="hull-tags" style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;"></div>
    </div>

    <!-- Add Task Section -->
    <div style="background:white;border-radius:12px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <h3 style="color:#0b3d6e;margin-top:0;">${L('addTask')}</h3>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
        <select id="task-hull-select" onchange="if(typeof renderTasks==='function')renderTasks()" style="padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;min-width:140px;">
          <option value="">-- ${L('assignToBoat')} --</option>
          <option value="all">${L('allBoats')}</option>
        </select>
        <input type="text" id="task-input" placeholder="${L('enterTask')}" style="flex:1;min-width:200px;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;">
        <button onclick="addTaskBtn()" class="btn btn-primary" style="white-space:nowrap;">+ ${L('addTask')}</button>
        <button onclick="startVoiceTask()" title="Voice input" style="background:#0b3d6e;color:white;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:1.2rem;">🎤</button>
      </div>
    </div>

    <!-- Task List -->
    <div id="task-list" style="background:white;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <p style="text-align:center;color:#888;">${L('noTasks')}</p>
    </div>
  </div>

  <script>
  (function() {
    var allTasks = [];
    var hullNumbers = [];
    var isEN = ${isEN};
    var L = ${JSON.stringify({
      tasks: L('tasks'), addHullNumber: L('addHullNumber'), enterHullNumber: L('enterHullNumber'),
      addTask: L('addTask'), enterTask: L('enterTask'), assignToBoat: L('assignToBoat'),
      noTasks: L('noTasks'), deleteTask: L('deleteTask'), editTask: L('editTask'),
      saveTask: L('saveTask'), hullNumbers: L('hullNumbers'), taskList: L('taskList'),
      dateEntered: L('dateEntered'), allBoats: L('allBoats')
    })};

    function formatDate(dateStr) {
      if (!dateStr) return '';
      var d = new Date(dateStr + 'Z');
      if (isEN) {
        return (d.getMonth()+1) + '/' + d.getDate() + '/' + d.getFullYear();
      } else {
        return d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
      }
    }

    function loadTasks() {
      Promise.all([
        fetch('/api/tasks').then(function(r){return r.json()}),
        fetch('/api/hull-numbers').then(function(r){return r.json()})
      ]).then(function(results) {
        allTasks = results[0];
        var savedHulls = results[1];
        // Merge saved hull numbers with any from tasks
        var hSet = {};
        savedHulls.forEach(function(h) { hSet[h] = true; });
        allTasks.forEach(function(t) { hSet[t.hull_number] = true; });
        hullNumbers = Object.keys(hSet).sort();
        updateHullUI();
        renderTasks();
      });
    }

    function updateHullUI() {
      // Update hull tags display
      var tagsDiv = document.getElementById('hull-tags');
      tagsDiv.innerHTML = '';
      hullNumbers.forEach(function(h) {
        var tag = document.createElement('span');
        tag.style.cssText = 'display:inline-flex;align-items:center;gap:4px;background:#e3f2fd;color:#0b3d6e;padding:6px 12px;border-radius:20px;font-weight:600;font-size:0.9rem;';
        tag.innerHTML = '⛵ #' + h + ' <button onclick="removeHull(\\'' + h.replace(/'/g,"\\\\'") + '\\')" style="background:none;border:none;color:#c00;cursor:pointer;font-size:1rem;padding:0 2px;" title="Remove">×</button>';
        tagsDiv.appendChild(tag);
      });

      // Update dropdown
      var sel = document.getElementById('task-hull-select');
      if (sel) {
        var val = sel.value;
        sel.innerHTML = '<option value="">-- ' + L.assignToBoat + ' --</option><option value="all">' + L.allBoats + '</option>';
        hullNumbers.forEach(function(h) {
          var opt = document.createElement('option');
          opt.value = h; opt.textContent = '#' + h;
          sel.appendChild(opt);
        });
        sel.value = val;
      }
    }

    window.renderTasks = function() {
      var container = document.getElementById('task-list');
      var filterVal = document.getElementById('task-hull-select').value;
      var filtered = (!filterVal || filterVal === 'all') ? allTasks : allTasks.filter(function(t) { return t.hull_number === filterVal; });

      if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#888;">' + L.noTasks + '</p>';
        return;
      }

      var html = '<table style="width:100%;border-collapse:collapse;">' +
        '<thead><tr style="background:#0b3d6e;color:white;"><th style="padding:10px;text-align:left;">⛵ Hull #</th><th style="padding:10px;text-align:left;">' + L.taskList + '</th><th style="padding:10px;text-align:left;">' + L.dateEntered + '</th><th style="padding:10px;text-align:center;width:120px;">Actions</th></tr></thead><tbody>';

      filtered.forEach(function(task) {
        html += '<tr id="task-row-' + task.id + '" style="border-bottom:1px solid #eee;">' +
          '<td style="padding:10px;font-weight:600;color:#0b3d6e;">#' + task.hull_number + '</td>' +
          '<td style="padding:10px;" id="task-desc-' + task.id + '">' + escapeH(task.task_description) + '</td>' +
          '<td style="padding:10px;color:#666;font-size:0.9rem;">' + formatDate(task.created_at) + '</td>' +
          '<td style="padding:10px;text-align:center;">' +
            '<button onclick="editTask(' + task.id + ')" style="background:#2196F3;color:white;border:none;border-radius:4px;padding:4px 10px;cursor:pointer;margin:2px;font-size:0.8rem;">✏️ ' + L.editTask + '</button>' +
            '<button onclick="deleteTask(' + task.id + ')" style="background:#f44336;color:white;border:none;border-radius:4px;padding:4px 10px;cursor:pointer;margin:2px;font-size:0.8rem;">🗑️ ' + L.deleteTask + '</button>' +
          '</td></tr>';
      });
      html += '</tbody></table>';
      container.innerHTML = html;
    };

    function escapeH(s) { var d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

    window.addHullBtn = function() {
      var inp = document.getElementById('hull-input');
      var val = inp.value.trim();
      if (!val) return;
      if (hullNumbers.indexOf(val) === -1) {
        fetch('/api/hull-numbers/add', {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: 'hull_number=' + encodeURIComponent(val)
        }).then(function() {
          hullNumbers.push(val);
          hullNumbers.sort();
          updateHullUI();
        });
      }
      inp.value = '';
    };

    window.removeHull = function(h) {
      fetch('/api/hull-numbers/delete', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'hull_number=' + encodeURIComponent(h)
      }).then(function() {
        hullNumbers = hullNumbers.filter(function(x) { return x !== h; });
        updateHullUI();
      });
    };

    window.addTaskBtn = function() {
      var hull = document.getElementById('task-hull-select').value;
      var desc = document.getElementById('task-input').value.trim();
      if (!hull || !desc) { alert(L.assignToBoat + ' & ' + L.enterTask); return; }
      fetch('/api/tasks', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'hull_number=' + encodeURIComponent(hull) + '&task_description=' + encodeURIComponent(desc)
      }).then(function(r){return r.json()}).then(function() {
        document.getElementById('task-input').value = '';
        loadTasks();
      });
    };

    window.editTask = function(id) {
      var cell = document.getElementById('task-desc-' + id);
      var current = cell.textContent;
      cell.innerHTML = '<div style="display:flex;gap:6px;"><input type="text" id="edit-input-' + id + '" value="' + current.replace(/"/g,'&quot;') + '" style="flex:1;padding:6px;border:1px solid #ddd;border-radius:4px;"><button onclick="saveEdit(' + id + ')" class="btn btn-primary" style="padding:4px 12px;font-size:0.85rem;">' + L.saveTask + '</button></div>';
      document.getElementById('edit-input-' + id).focus();
    };

    window.saveEdit = function(id) {
      var val = document.getElementById('edit-input-' + id).value.trim();
      if (!val) return;
      fetch('/api/tasks/' + id + '/edit', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'task_description=' + encodeURIComponent(val)
      }).then(function(){loadTasks();});
    };

    window.deleteTask = function(id) {
      if (!confirm('Delete this task?')) return;
      fetch('/api/tasks/' + id + '/delete', { method: 'POST' }).then(function(){loadTasks();});
    };

    // Voice input
    function startVoice(targetId) {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Voice input not supported in this browser.');
        return;
      }
      var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      var rec = new SR();
      rec.lang = isEN ? 'en-US' : '${lang === "es" ? "es-ES" : lang === "it" ? "it-IT" : lang === "pt" ? "pt-BR" : "en-US"}';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = function(e) {
        var text = e.results[0][0].transcript;
        var inp = document.getElementById(targetId);
        if (inp) inp.value = (inp.value ? inp.value + ' ' : '') + text;
      };
      rec.onerror = function(e) { console.error('Voice error', e.error); };
      rec.start();
    }

    window.startVoiceHull = function() { startVoice('hull-input'); };
    window.startVoiceTask = function() { startVoice('task-input'); };

    // Handle Enter key
    document.getElementById('hull-input').addEventListener('keydown', function(e) { if(e.key==='Enter') addHullBtn(); });
    document.getElementById('task-input').addEventListener('keydown', function(e) { if(e.key==='Enter') addTaskBtn(); });

    loadTasks();
  })();
  </script>`, req.session.user, lang));
});

// --- PERFORMANCE METRICS ---
app.get("/api/performance-data", requireAuth, (req, res) => {
  const logs = db.prepare("SELECT * FROM race_logs WHERE user_id = ? ORDER BY race_date ASC").all(req.session.user.id);
  res.json(logs);
});

app.get("/performance", requireAuth, (req, res) => {
  const lang = getLang(req);
  const L = (k) => t(k, lang);
  res.send(renderPage(`
  <div class="container">
    <h2>${L('perfMetrics')}</h2>
    <p style="color:#555;margin-bottom:20px;">${L('graphDesc')}</p>
    <div class="form-card" style="padding:24px;">
      <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin-bottom:24px;">
        <label style="font-weight:600;color:#0b3d6e;">${L('settingToGraph')}:</label>
        <select id="settingSelect" style="padding:10px 16px;border:1px solid #ddd;border-radius:6px;font-size:1rem;min-width:220px;">
          <option value="">-- ${L('selectASetting')} --</option>
          <optgroup label="${L('sails')}">
            <option value="jib_used">${L('jibUsed')}</option>
            <option value="mainsail_used">${L('mainsailUsed')}</option>
          </optgroup>
          <optgroup label="${L('rigSettings')}">
            <option value="mast_rake">${L('mastRake')}</option>
            <option value="shroud_tension">${L('shroudTension')}</option>
            <option value="shroud_turns">${L('staMasterTurns')}</option>
            <option value="wire_size">${L('wireSize')}</option>
            <option value="spreader_length">${L('spreaderLength')}</option>
            <option value="spreader_sweep">${L('spreaderSweep')}</option>
          </optgroup>
          <optgroup label="${L('jibSettings')}">
            <option value="jib_lead">${L('jibLead')}</option>
            <option value="jib_cloth_tension">${L('jibClothTension')}</option>
            <option value="jib_height">${L('jibHeight')}</option>
            <option value="jib_outboard_lead">${L('jibOutboardLead')}</option>
          </optgroup>
          <optgroup label="${L('controls')}">
            <option value="cunningham">${L('cunningham')}</option>
            <option value="outhaul">${L('outhaul')}</option>
            <option value="vang">${L('vang')}</option>
            <option value="centerboard_position">${L('fwdAftPuller')}</option>
            <option value="traveler_position">${L('travelerPosition')}</option>
            <option value="augie_equalizer">${L('augieEqualizer')}</option>
            <option value="mast_wiggle">${L('staMasterWiggle')}</option>
          </optgroup>
          <optgroup label="${L('conditions')}">
            <option value="wind_speed">${L('windSpeed')}</option>
            <option value="wind_direction">${L('windDirection')}</option>
            <option value="sea_state">${L('seaState')}</option>
            <option value="temperature">${L('temperature')}</option>
            <option value="current_tide">${L('currentTide')}</option>
          </optgroup>
          <optgroup label="${L('event')}">
            <option value="finish_position">${L('finishPosition')}</option>
            <option value="fleet_size">${L('fleetSize')}</option>
            <option value="skipper_weight">${L('skipperWeight')}</option>
            <option value="crew_weight">${L('crewWeight')}</option>
          </optgroup>
        </select>
        <label style="font-weight:600;color:#0b3d6e;">${lang === 'es' ? 'Rango de Viento' : lang === 'it' ? 'Range Vento' : lang === 'pt' ? 'Faixa de Vento' : 'Wind Range'}:</label>
        <select id="windRange" style="padding:10px 16px;border:1px solid #ddd;border-radius:6px;font-size:1rem;min-width:180px;">
          <option value="all">${lang === 'es' ? 'Todos los Rangos' : lang === 'it' ? 'Tutti i Range' : lang === 'pt' ? 'Todas as Faixas' : 'All Wind Ranges'}</option>
          <option value="light">${lang === 'es' ? 'Viento Ligero' : lang === 'it' ? 'Vento Leggero' : lang === 'pt' ? 'Vento Leve' : 'Light Air'} (0–8 kts)</option>
          <option value="medium">${lang === 'es' ? 'Viento Medio' : lang === 'it' ? 'Vento Medio' : lang === 'pt' ? 'Vento Médio' : 'Medium Air'} (9–16 kts)</option>
          <option value="heavy">${lang === 'es' ? 'Viento Fuerte' : lang === 'it' ? 'Vento Forte' : lang === 'pt' ? 'Vento Forte' : 'Heavy Air'} (17+ kts)</option>
        </select>
        <label style="font-weight:600;color:#0b3d6e;">${L('seaState')}:</label>
        <select id="seaState" style="padding:10px 16px;border:1px solid #ddd;border-radius:6px;font-size:1rem;min-width:180px;">
          <option value="all">${L('allSeaStates')}</option>
          <option value="flat">${L('flat')}</option>
          <option value="choppy">${L('choppy')}</option>
          <option value="large">${L('largeWaves')}</option>
        </select>
      </div>
      <div id="noData" style="display:none;text-align:center;padding:40px;color:#888;">
        <p style="font-size:1.1rem;">No data available for this setting. Log some races with this field filled in!</p>
      </div>
      <canvas id="perfChart" style="max-height:450px;"></canvas>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
  <script>
    let chart = null;
    const ctx = document.getElementById('perfChart').getContext('2d');
    const noData = document.getElementById('noData');
    const select = document.getElementById('settingSelect');
    const windSelect = document.getElementById('windRange');
    let raceData = [];

    fetch('/api/performance-data')
      .then(r => r.json())
      .then(data => { raceData = data; });

    function parseWindSpeed(val) {
      if (!val) return null;
      const match = val.match(/(\\d+)/);
      return match ? parseInt(match[0]) : null;
    }

    function filterByWind(data, range) {
      if (range === 'all') return data;
      return data.filter(r => {
        const ws = parseWindSpeed(r.wind_speed);
        if (ws === null) return false;
        if (range === 'light') return ws <= 8;
        if (range === 'medium') return ws >= 9 && ws <= 16;
        if (range === 'heavy') return ws >= 17;
        return true;
      });
    }

    const seaSelect = document.getElementById('seaState');

    function filterBySea(data, state) {
      if (state === 'all') return data;
      return data.filter(r => {
        if (!r.sea_state) return false;
        if (state === 'flat') return r.sea_state === 'Flat';
        if (state === 'choppy') return r.sea_state === 'Choppy';
        if (state === 'large') return r.sea_state === 'Large Waves';
        return true;
      });
    }

    const settingLabels = {
      jib_used: 'Jib Used', mainsail_used: 'Mainsail Used',
      mast_rake: 'Mast Rake', shroud_tension: 'Shroud Tension', shroud_turns: 'Sta-Master Turns', wire_size: 'Wire Size',
      spreader_length: 'Spreader Length', spreader_sweep: 'Spreader Sweep',
      jib_lead: 'Jib Lead Position', jib_cloth_tension: 'Jib Cloth Tension',
      jib_height: 'Jib Height (deck to tack)', jib_outboard_lead: 'Jib Outboard Lead',
      cunningham: 'Cunningham', outhaul: 'Outhaul', vang: 'Vang',
      centerboard_position: 'Mast Fwd/Aft Puller', traveler_position: 'Traveler',
      augie_equalizer: 'Augie Equalizer/Duffy Dominator',
      mast_wiggle: 'Shroud Adjuster Wiggle',
      wind_speed: 'Wind Speed', wind_direction: 'Wind Direction',
      sea_state: 'Sea State', temperature: 'Temperature', current_tide: 'Current/Tide',
      finish_position: 'Finish Position', fleet_size: 'Fleet Size',
      skipper_weight: 'Skipper Weight', crew_weight: 'Crew Weight'
    };

    function updateChart() {
      const field = select.value;
      const windRange = windSelect.value;
      const seaRange = seaSelect.value;
      if (!field) { if (chart) chart.destroy(); noData.style.display = 'none'; return; }

      const windFiltered = filterByWind(raceData, windRange);
      const seaFiltered = filterBySea(windFiltered, seaRange);
      const filtered = seaFiltered.filter(r => r[field] && r.performance_rating);
      if (filtered.length === 0) {
        if (chart) chart.destroy();
        document.getElementById('perfChart').style.display = 'none';
        noData.style.display = 'block';
        return;
      }
      noData.style.display = 'none';
      document.getElementById('perfChart').style.display = 'block';

      const labels = filtered.map(r => {
        const d = r.race_date || '';
        const name = r.race_name || '';
        return d + (name ? ' - ' + name : '');
      });
      const settingValues = filtered.map(r => r[field]);
      const ratings = filtered.map(r => parseFloat(r.performance_rating));

      // Determine if values are numeric
      const allNumeric = settingValues.every(v => !isNaN(parseFloat(v)));

      if (chart) chart.destroy();

      if (allNumeric) {
        // Scatter plot for numeric values
        const points = filtered.map(r => ({ x: parseFloat(r[field]), y: parseFloat(r.performance_rating), label: (r.race_date || '') + ' ' + (r.race_name || '') }));
        chart = new Chart(ctx, {
          type: 'scatter',
          data: {
            datasets: [{
              label: settingLabels[field] + ' vs Self Determined Performance Rating',
              data: points,
              backgroundColor: 'rgba(21,101,192,0.7)',
              borderColor: '#0b3d6e',
              pointRadius: 8,
              pointHoverRadius: 11
            }]
          },
          options: {
            responsive: true,
            scales: {
              x: { title: { display: true, text: settingLabels[field], font: { size: 14, weight: 'bold' } } },
              y: { title: { display: true, text: 'Self Determined Performance Rating', font: { size: 14, weight: 'bold' } }, min: 0, max: 10, ticks: { stepSize: 1 } }
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const p = ctx.raw;
                    return p.label + ' | ' + settingLabels[field] + ': ' + p.x + ' | Rating: ' + p.y;
                  }
                }
              }
            }
          }
        });
      } else {
        // Bar chart for categorical values
        chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Self Determined Performance Rating',
                data: ratings,
                backgroundColor: 'rgba(21,101,192,0.7)',
                borderColor: '#0b3d6e',
                borderWidth: 1,
                yAxisID: 'y'
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: { title: { display: true, text: 'Self Determined Performance Rating', font: { size: 14, weight: 'bold' } }, min: 0, max: 10, ticks: { stepSize: 1 } },
              x: { ticks: { maxRotation: 45, minRotation: 25, font: { size: 11 } } }
            },
            plugins: {
              tooltip: {
                callbacks: {
                  afterLabel: (ctx) => settingLabels[field] + ': ' + settingValues[ctx.dataIndex]
                }
              }
            }
          }
        });
      }
    }
    select.addEventListener('change', updateChart);
    windSelect.addEventListener('change', updateChart);
    seaSelect.addEventListener('change', updateChart);
  </script>
  `, req.session.user, getLang(req)));
});

// --- HTML TEMPLATES ---

function renderPage(content, user, lang, showHero) {
  lang = lang || 'en';
  const L = (key) => t(key, lang);
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0b3d6e">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Snipeovation">
  <link rel="manifest" href="/manifest.json">
  <link rel="apple-touch-icon" href="/icon-192.png">
  <title>Charlie's Snipeovation Snipe Sailboat Racing Genius Tool!</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a2a3a; line-height: 1.6; background: #f5f7fa; }

    .hero-banner {
      position: relative;
      background: url('/hero.jpg') center 62% / cover no-repeat;
      min-height: 520px;
      display: flex; flex-direction: column; justify-content: flex-end;
      filter: saturate(1.25) brightness(1.05);
    }
    .hero-banner::before {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, rgba(11,61,110,0.0) 0%, rgba(11,61,110,0.0) 40%, rgba(11,61,110,0.1) 65%, rgba(11,61,110,0.7) 90%, rgba(11,61,110,0.92) 100%);
    }
    .hero-logo {
      position: absolute; top: 12px; left: 16px; z-index: 2;
      display: flex; flex-direction: column; align-items: center; gap: 6px;
    }
    .hero-logo img {
      height: 60px; width: auto; border-radius: 6px; background: rgba(255,255,255,0.85); padding: 4px 8px;
    }
    .hero-qr {
      width: 56px; height: 56px; border-radius: 6px; background: white; padding: 3px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: pointer;
    }
    .hero-qr-label {
      font-size: 0.55rem; color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.7);
      text-align: center; font-weight: 600; line-height: 1.1;
    }
    .hero-content {
      position: relative; z-index: 1;
      padding: 40px 24px 16px; text-align: center; color: white;
    }
    .hero-content .boat-number {
      font-size: 1.1rem; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
      opacity: 0.8; margin-bottom: 4px;
    }
    .hero-content h1 {
      font-size: 2.2rem; font-weight: 800; letter-spacing: -0.5px;
      text-shadow: 0 2px 12px rgba(0,0,0,0.4);
    }
    .hero-content h1 a { color: white; text-decoration: none; }
    .hero-content .tagline { font-size: 1rem; opacity: 0.85; margin-top: 6px; }

    .header-nav {
      position: relative; z-index: 1;
      background: rgba(11,61,110,0.9); backdrop-filter: blur(8px);
      padding: 0 24px;
      display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 4px;
    }
    .sticky-nav {
      position: sticky; top: 0; z-index: 100;
      background: #0b3d6e;
      padding: 0 24px;
      display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .sticky-nav a {
      color: rgba(255,255,255,0.9); text-decoration: none; padding: 10px 14px;
      border-radius: 6px; font-weight: 600; font-size: 0.85rem; transition: background 0.2s;
    }
    .sticky-nav a:hover { background: rgba(255,255,255,0.15); }
    .sticky-nav a.btn-accent { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); }
    .sticky-nav .user-badge { color: rgba(255,255,255,0.75); font-size: 0.8rem; padding: 10px 6px; }
    .header-nav a {
      color: rgba(255,255,255,0.9); text-decoration: none; padding: 12px 16px;
      border-radius: 6px; font-weight: 600; font-size: 0.9rem; transition: background 0.2s;
    }
    .header-nav a:hover { background: rgba(255,255,255,0.15); }
    .header-nav a.btn-accent { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); }
    .header-nav .user-badge { color: rgba(255,255,255,0.75); font-size: 0.85rem; padding: 12px 8px; }

    .container { max-width: 1000px; margin: 0 auto; padding: 32px 24px; }
    h2 { font-size: 1.8rem; color: #0b3d6e; margin-bottom: 20px; }
    h2 .sub { font-size: 0.95rem; color: #666; font-weight: 400; display: block; margin-top: 4px; }
    .alert { padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-weight: 500; }
    .alert-error { background: #fde8e8; color: #c53030; border: 1px solid #feb2b2; }
    .alert-success { background: #e6ffed; color: #22543d; border: 1px solid #9ae6b4; }

    .form-card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); max-width: 500px; margin: 0 auto; }
    .form-card.wide { max-width: 800px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { margin-bottom: 16px; }
    .form-group.full { grid-column: 1 / -1; }
    .form-group label { display: block; font-weight: 600; margin-bottom: 4px; color: #333; font-size: 0.9rem; }
    .form-group input, .form-group select, .form-group textarea {
      width: 100%; padding: 10px 12px; border: 2px solid #e2e8f0; border-radius: 8px;
      font-size: 0.95rem; transition: border-color 0.2s; font-family: inherit;
    }
    .input-wrap { position: relative; }
    .input-wrap input, .input-wrap textarea { padding-right: 40px; }
    .mic-btn { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.3rem; color: #999; padding: 4px; border-radius: 50%; transition: all 0.2s; line-height: 1; }
    .mic-btn:hover { color: #0b3d6e; background: #e8f0fe; }
    .mic-btn.listening { color: #e53e3e; animation: pulse 1s infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
    .rrs-rule { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 22px; margin-bottom: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    .rrs-rule h4 { color: #0b3d6e; margin: 0 0 8px 0; font-size: 1.05rem; }
    .rrs-rule p { color: #444; margin: 6px 0; line-height: 1.6; font-size: 0.93rem; }
    .ruleset-btn { transition: all 0.2s; }
    .active-ruleset { box-shadow: 0 0 0 3px rgba(11,61,110,0.3); }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #1a6fb5; }
    .form-group textarea { resize: vertical; min-height: 100px; }
    .form-section { grid-column: 1 / -1; font-size: 1.05rem; font-weight: 700; color: #0b3d6e; margin-top: 12px; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0; }
    .btn { display: inline-block; padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: 0.95rem; text-decoration: none; border: none; cursor: pointer; transition: all 0.2s; }
    .btn-primary { background: #0b3d6e; color: white; }
    .btn-primary:hover { background: #0a3058; }
    .btn-secondary { background: #e2e8f0; color: #333; }
    .btn-secondary:hover { background: #cbd5e0; }
    .btn-danger { background: #e53e3e; color: white; font-size: 0.8rem; padding: 6px 14px; }
    .btn-danger:hover { background: #c53030; }
    .btn-sm { font-size: 0.8rem; padding: 6px 14px; }
    .form-footer { text-align: center; margin-top: 16px; color: #666; font-size: 0.9rem; }
    .form-footer a { color: #1a6fb5; text-decoration: none; font-weight: 600; }

    .log-card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); transition: transform 0.15s; }
    .log-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .log-card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .log-card-header h3 { font-size: 1.15rem; color: #0b3d6e; }
    .log-card-header .date { color: #666; font-size: 0.9rem; }
    .log-card-meta { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 12px; }
    .meta-item { font-size: 0.85rem; color: #555; }
    .meta-item strong { color: #333; }
    .log-card-notes { color: #444; font-size: 0.95rem; border-top: 1px solid #eee; padding-top: 12px; margin-top: 8px; white-space: pre-wrap; }
    .log-card-actions { display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee; }
    .sailor-link { color: #1a6fb5; text-decoration: none; font-weight: 600; }
    .sailor-link:hover { text-decoration: underline; }

    .log-card-settings { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
    .log-card-settings .section-label { width: 100%; font-size: 0.8rem; font-weight: 700; color: #0b3d6e; text-transform: uppercase; letter-spacing: 0.5px; }
    .log-card-settings-notes { color: #555; font-size: 0.9rem; font-style: italic; margin-top: 4px; white-space: pre-wrap; }

    .tag { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; background: #e6f0fa; color: #1a6fb5; }
    .tag-position { background: #fef3cd; color: #856404; }
    .empty-state { text-align: center; padding: 48px 20px; color: #888; }
    .empty-state h3 { color: #666; margin-bottom: 8px; }
    .stats-row { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .stat-card { background: white; border-radius: 10px; padding: 16px 24px; flex: 1; min-width: 140px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); text-align: center; }
    .stat-card .num { font-size: 1.8rem; font-weight: 800; color: #0b3d6e; }
    .stat-card .label { font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    footer { text-align: center; padding: 24px; color: #999; font-size: 0.85rem; }
    footer a { color: #1a6fb5; text-decoration: none; }
    .regatta-card, .my-regatta-card { display: flex; align-items: center; gap: 16px; padding: 14px 18px; }
    @media (max-width: 768px) {
      .regatta-card, .my-regatta-card { flex-wrap: wrap; gap: 10px; padding: 12px; }
      .regatta-card > div:first-child, .my-regatta-card > div:first-child { min-width: 64px !important; }
      .attend-label { font-size: 0.78rem !important; }
      .form-grid { grid-template-columns: 1fr; }
      .hero-banner {
        min-height: 380px;
        background-position: center 58%;
      }
      .hero-banner::before {
        background: linear-gradient(to bottom, rgba(11,61,110,0.0) 0%, rgba(11,61,110,0.0) 35%, rgba(11,61,110,0.1) 60%, rgba(11,61,110,0.7) 88%, rgba(11,61,110,0.92) 100%);
      }
      .hero-logo { top: 8px; left: 8px; gap: 4px; }
      .hero-logo img { height: 44px; padding: 3px 6px; }
      .hero-qr { width: 40px; height: 40px; padding: 2px; }
      .hero-qr-label { font-size: 0.45rem; }
      .hero-content { padding: 24px 16px 12px; }
      .hero-content h1 { font-size: 1.3rem; line-height: 1.3; }
      .hero-content .boat-number { font-size: 0.8rem; letter-spacing: 2px; }
      .hero-content .tagline { font-size: 0.85rem; }
      .header-nav {
        padding: 0 8px;
        justify-content: flex-start;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        flex-wrap: nowrap;
        gap: 2px;
        scrollbar-width: none;
      }
      .header-nav::-webkit-scrollbar { display: none; }
      .header-nav a {
        padding: 10px 12px;
        font-size: 0.78rem;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .header-nav .user-badge { font-size: 0.75rem; padding: 10px 6px; }
      .sticky-nav {
        padding: 0 8px; justify-content: flex-start;
        overflow-x: auto; -webkit-overflow-scrolling: touch;
        flex-wrap: nowrap; gap: 2px; scrollbar-width: none;
      }
      .sticky-nav::-webkit-scrollbar { display: none; }
      .sticky-nav a { padding: 8px 10px; font-size: 0.75rem; white-space: nowrap; flex-shrink: 0; }
      .sticky-nav .user-badge { font-size: 0.7rem; padding: 8px 4px; }
      .container { padding: 16px 12px; }
      .form-card { padding: 16px; }
      .form-card.wide { padding: 14px; }
      h2 { font-size: 1.4rem; }
      .rrs-rule { padding: 12px 14px; }
      .magic-setting { padding: 12px; }
      .magic-icon { font-size: 1.4rem; }
      .magic-label { font-size: 0.72rem; }
      .magic-value { font-size: 0.92rem; }
      .stat-card { min-width: 100px; padding: 12px 16px; }
      .stat-card .num { font-size: 1.4rem; }
      .stats-row { gap: 8px; }
      .btn { padding: 8px 16px; font-size: 0.88rem; }
      .ruleset-btn { font-size: 0.8rem !important; padding: 7px 12px !important; }
    }
    @media (max-width: 400px) {
      .hero-banner { min-height: 300px; }
      .hero-content h1 { font-size: 1.15rem; }
      .header-nav a { padding: 8px 10px; font-size: 0.72rem; }
    }
  </style>
</head>
<body>
  ${showHero ? `
  <div class="hero-banner">
    <div class="hero-logo">
      <a href="/"><img src="/logo.jpg" alt="Snipeovation"></a>
      <img class="hero-qr" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://snipeovation.com" alt="QR Code" title="Scan to install Snipeovation on your phone">
      <span class="hero-qr-label">Scan to Install<br>Snipeovation</span>
    </div>
    <div class="hero-content">
      ${user && user.snipe_number ? `<div class="boat-number">Snipe #${escapeHtml(user.snipe_number)}</div>` : `<div class="boat-number">Snipe Class Racing</div>`}
      <h1><a href="/">Charlie's Snipeovation<sup style="font-size:0.572em;vertical-align:super;">&#8480;</sup> Snipe Sailboat Racing Genius Tool!<sup style="font-size:0.484em;vertical-align:super;margin-left:2px;">&copy;</sup></a></h1>
      ${user && (user.display_name || user.boat_name) ? `<p class="tagline">${user.display_name ? escapeHtml(user.display_name) : ""}${user.display_name && user.boat_name ? " &mdash; " : ""}${user.boat_name ? "S/V " + escapeHtml(user.boat_name) : ""}</p>` : `<p class="tagline">${L('tagline')}</p>`}
    </div>
  </div>
  ` : ''}
  <div class="sticky-nav">
    ${user ? `
      <a href="/">🏠 ${L('home')}</a>
      <a href="https://www.snipeovation.com" style="font-size:0.75rem;color:#a3d4ff;">⛵ Snipeovation.com</a>
      <a href="/">${L('raceFeed')}</a>
      <a href="/dashboard">${L('myLogs')}</a>
      <a href="/log" class="btn-accent">${L('logRace')}</a>
      <a href="/performance">${L('perfMetrics')}</a>
      <a href="/magic">${L('magic')}</a>
      <a href="/tuning-guides">${L('tuningGuides')}</a>
      <a href="/racing-rules">${L('racingRules')}</a>
      <a href="/snipe-rules">${L('snipeRules')}</a>
      <a href="/regattas">${L('regattas')}</a>
      <a href="/my-boat">${L('myBoatPhotos')}</a>
      <a href="/forecast">${L('forecast')}</a>
      <a href="/tasks">${L('tasks')}</a>
      <a href="/profile">${L('profile')}</a>
      <span class="user-badge">${lang === 'es' ? '🇪🇸' : lang === 'it' ? '🇮🇹' : lang === 'pt' ? '🇧🇷' : '🇺🇸🇬🇧'} ${escapeHtml(user.display_name || user.username)}</span>
      <a href="/logout">${L('logout')}</a>
    ` : `
      <a href="/">🏠 ${L('home')}</a>
      <a href="https://www.snipeovation.com" style="font-size:0.75rem;color:#a3d4ff;">⛵ Snipeovation.com</a>
      <a href="/login">${L('login')}</a>
      <a href="/register" class="btn-accent">${L('signUp')}</a>
      <a href="/tuning-guides">${L('tuningGuides')}</a>
      <a href="/racing-rules">${L('racingRules')}</a>
      <a href="/snipe-rules">${L('snipeRules')}</a>
      <a href="/regattas">${L('regattas')}</a>
    `}
  </div>
  ${tPage(content, lang)}
  <footer>
    <p>Charlie's Snipeovation Snipe Sailboat Racing Genius Tool! Log &mdash; <a href="https://www.snipe.org" target="_blank" rel="noopener">snipe.org</a></p>
  </footer>

  <!-- PWA Install Prompt -->
  <div id="pwa-install-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;background:linear-gradient(135deg,#0b3d6e,#1565c0);color:white;padding:14px 20px;z-index:9999;box-shadow:0 -4px 12px rgba(0,0,0,0.3);text-align:center;">
    <div style="display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;">
      <img src="/icon-192.png" alt="Snipeovation" style="width:40px;height:40px;border-radius:8px;">
      <span style="font-weight:600;font-size:1rem;">Add Snipeovation to your Home Screen?</span>
      <button id="pwa-install-btn" style="background:white;color:#0b3d6e;border:none;border-radius:20px;padding:8px 20px;font-weight:700;cursor:pointer;font-size:0.95rem;">Install</button>
      <button onclick="document.getElementById('pwa-install-banner').style.display='none'" style="background:transparent;color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.3);border-radius:20px;padding:8px 14px;cursor:pointer;font-size:0.85rem;">Not Now</button>
    </div>
  </div>

  <script>
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function(){});
  }

  // PWA Install Prompt
  var deferredPrompt;
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('pwa-install-banner').style.display = '';
  });

  document.getElementById('pwa-install-btn').addEventListener('click', function() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function(result) {
        deferredPrompt = null;
        document.getElementById('pwa-install-banner').style.display = 'none';
      });
    }
  });

  window.addEventListener('appinstalled', function() {
    document.getElementById('pwa-install-banner').style.display = 'none';
  });

  // iOS Safari — no beforeinstallprompt, show manual instructions
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isIOS && !isStandalone && !sessionStorage.getItem('iosDismissed')) {
    var iosBanner = document.getElementById('pwa-install-banner');
    iosBanner.querySelector('span').textContent = 'Install Snipeovation: tap Share ⬆️ then "Add to Home Screen"';
    iosBanner.querySelector('#pwa-install-btn').style.display = 'none';
    iosBanner.style.display = '';
    iosBanner.querySelector('button:last-child').addEventListener('click', function() { sessionStorage.setItem('iosDismissed', '1'); });
  }
  </script>
  <div style="position:fixed;bottom:8px;right:12px;font-size:0.72rem;color:#999;z-index:100;pointer-events:none;">&copy;&#8480; Charles L Green 2026</div>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function renderConditions(log, lang) {
  lang = lang || 'en';
  const L = (k) => t(k, lang);
  const wtUnit = isMetric(lang) ? 'kg' : 'lbs';
  const items = [];
  if (log.wind_speed) items.push(`<span class="meta-item"><strong>${L('windSpeed')}:</strong> ${escapeHtml(log.wind_speed)}${log.wind_direction ? " " + escapeHtml(log.wind_direction) : ""}</span>`);
  if (log.sea_state) items.push(`<span class="meta-item"><strong>${L('seaState')}:</strong> ${escapeHtml(log.sea_state)}</span>`);
  if (log.water_type) items.push(`<span class="meta-item"><strong>🌊 Water:</strong> ${escapeHtml(log.water_type)}</span>`);
  if (log.temperature) items.push(`<span class="meta-item"><strong>${L('temperature')}:</strong> ${escapeHtml(log.temperature)}</span>`);
  if (log.current_tide) items.push(`<span class="meta-item"><strong>${L('currentTide')}:</strong> ${escapeHtml(log.current_tide)}</span>`);
  if (log.fleet_size) items.push(`<span class="meta-item"><strong>${L('fleetSize')}:</strong> ${escapeHtml(log.fleet_size)}</span>`);
  if (log.performance_rating) items.push(`<span class="meta-item"><strong>${L('perfRating')}:</strong> ${escapeHtml(log.performance_rating)}/10</span>`);
  if (log.crew_name) items.push(`<span class="meta-item"><strong>${L('crewName')}:</strong> ${escapeHtml(log.crew_name)}</span>`);
  if (log.skipper_weight) items.push(`<span class="meta-item"><strong>${L('skipperWeight')}:</strong> ${escapeHtml(log.skipper_weight)} ${wtUnit}</span>`);
  if (log.crew_weight) items.push(`<span class="meta-item"><strong>${L('crewWeight')}:</strong> ${escapeHtml(log.crew_weight)} ${wtUnit}</span>`);
  if (log.boat_number) items.push(`<span class="meta-item"><strong>${L('boatNumber')}:</strong> ${escapeHtml(log.boat_number)}</span>`);
  return items.length ? `<div class="log-card-meta">${items.join("")}</div>` : "";
}

function renderSettings(log, lang) {
  lang = lang || 'en';
  const L = (k) => t(k, lang);
  const items = [];
  if (log.jib_used) items.push(`<span class="meta-item"><strong>${L('jibUsed')}:</strong> ${escapeHtml(log.jib_used)}</span>`);
  if (log.mainsail_used) items.push(`<span class="meta-item"><strong>${L('mainsailUsed')}:</strong> ${escapeHtml(log.mainsail_used)}</span>`);
  if (log.main_maker && !log.mainsail_used) items.push(`<span class="meta-item"><strong>${L('mainsailMaker')}:</strong> ${escapeHtml(log.main_maker)}</span>`);
  if (log.main_condition) items.push(`<span class="meta-item"><strong>Main Condition:</strong> ${escapeHtml(log.main_condition)}</span>`);
  if (log.jib_maker && !log.jib_used) items.push(`<span class="meta-item"><strong>${L('jibMaker')}:</strong> ${escapeHtml(log.jib_maker)}</span>`);
  if (log.jib_condition) items.push(`<span class="meta-item"><strong>Jib Condition:</strong> ${escapeHtml(log.jib_condition)}</span>`);
  if (log.mast_rake) items.push(`<span class="meta-item"><strong>${L('mastRake')}:</strong> ${escapeHtml(log.mast_rake)}</span>`);
  if (log.shroud_tension) items.push(`<span class="meta-item"><strong>${L('shroudTension')}:</strong> ${escapeHtml(log.shroud_tension)}</span>`);
  if (log.shroud_turns) items.push(`<span class="meta-item"><strong>${L('staMasterTurns')}:</strong> ${escapeHtml(log.shroud_turns)}</span>`);
  if (log.wire_size) items.push(`<span class="meta-item"><strong>${L('wireSize')}:</strong> ${escapeHtml(log.wire_size)}</span>`);
  if (log.spreader_length) items.push(`<span class="meta-item"><strong>${L('spreaderLength')}:</strong> ${escapeHtml(log.spreader_length)}</span>`);
  if (log.spreader_sweep) items.push(`<span class="meta-item"><strong>${L('spreaderSweep')}:</strong> ${escapeHtml(log.spreader_sweep)}</span>`);
  if (log.jib_lead) items.push(`<span class="meta-item"><strong>${L('jibLead')}:</strong> ${escapeHtml(log.jib_lead)}</span>`);
  if (log.jib_cloth_tension) items.push(`<span class="meta-item"><strong>${L('jibClothTension')}:</strong> ${escapeHtml(log.jib_cloth_tension)}</span>`);
  if (log.jib_height) items.push(`<span class="meta-item"><strong>${L('jibHeight')}:</strong> ${escapeHtml(log.jib_height)}</span>`);
  if (log.jib_outboard_lead) items.push(`<span class="meta-item"><strong>${L('jibOutboardLead')}:</strong> ${escapeHtml(log.jib_outboard_lead)}</span>`);
  if (log.cunningham) items.push(`<span class="meta-item"><strong>${L('cunningham')}:</strong> ${escapeHtml(log.cunningham)}</span>`);
  if (log.outhaul) items.push(`<span class="meta-item"><strong>${L('outhaul')}:</strong> ${escapeHtml(log.outhaul)}</span>`);
  if (log.vang) items.push(`<span class="meta-item"><strong>${L('vang')}:</strong> ${escapeHtml(log.vang)}</span>`);
  if (log.centerboard_position) items.push(`<span class="meta-item"><strong>${L('fwdAftPuller')}:</strong> ${escapeHtml(log.centerboard_position)}</span>`);
  if (log.traveler_position) items.push(`<span class="meta-item"><strong>${L('travelerPosition')}:</strong> ${escapeHtml(log.traveler_position)}</span>`);
  if (log.augie_equalizer) items.push(`<span class="meta-item"><strong>${L('augieEqualizer')}:</strong> ${escapeHtml(log.augie_equalizer)}</span>`);
  if (log.mast_wiggle) items.push(`<span class="meta-item"><strong>${L('mastWiggle')}:</strong> ${escapeHtml(log.mast_wiggle)}</span>`);
  if (items.length === 0 && !log.sail_settings_notes) return "";
  return `<div class="log-card-settings">
    <span class="section-label">${L('boatSettings')}</span>
    ${items.join("")}
    ${log.sail_settings_notes ? `<div class="log-card-settings-notes">${escapeHtml(log.sail_settings_notes)}</div>` : ""}
  </div>`;
}

function homePage(logs, user, lang) {
  const L = (k) => t(k, lang || 'en');
  if (logs.length === 0) {
    return `<div class="container">
      <h2>${L('raceFeed')}</h2>
      <div class="empty-state">
        <h3>${L('noRacesLoggedYet')}</h3>
        <p>${user ? '<a href="/log" class="btn btn-primary" style="margin-top:12px;display:inline-block;">' + L('logRace') + '</a>' : '<a href="/register" class="btn btn-primary" style="margin-top:12px;display:inline-block;">' + L('signUp') + '</a>'}</p>
      </div>
    </div>`;
  }
  return `<div class="container">
    <h2>${L('raceFeed')}</h2>
    ${logs.map(log => `
      <div class="log-card">
        <div class="log-card-header">
          <div>
            <h3>${escapeHtml(log.race_name)}</h3>
            <span class="date">${formatDate(log.race_date)}${log.location ? " &mdash; " + escapeHtml(log.location) : ""}</span>
          </div>
          <div>
            <a href="/sailor/${encodeURIComponent(log.username)}" class="sailor-link">${escapeHtml(log.username)}</a>
            ${log.finish_position ? `<span class="tag tag-position" style="margin-left:8px;">#${escapeHtml(log.finish_position)}</span>` : ""}
          </div>
        </div>
        ${renderConditions(log, lang)}
        ${renderSettings(log, lang)}
        ${log.notes ? `<div class="log-card-notes">${escapeHtml(log.notes)}</div>` : ""}
      </div>
    `).join("")}
  </div>`;
}

function dashboardPage(logs, user, lang) {
  const L = (k) => t(k, lang || 'en');
  const totalRaces = logs.length;
  const locations = new Set(logs.map(l => l.location).filter(Boolean)).size;
  return `<div class="container">
    <h2>${L('myLogs')} <span class="sub">${escapeHtml(user.display_name || user.username)}${user.snipe_number ? " &mdash; Snipe #" + escapeHtml(user.snipe_number) : ""}</span></h2>
    <div class="stats-row">
      <div class="stat-card"><div class="num">${totalRaces}</div><div class="label">${lang === 'es' ? 'Regatas' : lang === 'it' ? 'Regate' : lang === 'pt' ? 'Regatas' : 'Races Logged'}</div></div>
      <div class="stat-card"><div class="num">${locations}</div><div class="label">${lang === 'es' ? 'Sedes' : lang === 'it' ? 'Sedi' : lang === 'pt' ? 'Locais' : 'Venues'}</div></div>
      ${user.snipe_number ? `<div class="stat-card"><div class="num">#${escapeHtml(user.snipe_number)}</div><div class="label">${lang === 'es' ? 'Número de Vela' : lang === 'it' ? 'Numero Vela' : lang === 'pt' ? 'Número da Vela' : 'Sail Number'}</div></div>` : ""}
    </div>
    <div style="margin-bottom:20px;"><a href="/log" class="btn btn-primary">${L('logRace')}</a></div>
    ${logs.length === 0 ? `
      <div class="empty-state">
        <h3>${L('noRacesYet')}</h3>
        <p>Start logging your races to track your progress!</p>
      </div>
    ` : logs.map(log => `
      <div class="log-card">
        <div class="log-card-header">
          <div>
            <h3>${escapeHtml(log.race_name)}</h3>
            <span class="date">${formatDate(log.race_date)}${log.location ? " &mdash; " + escapeHtml(log.location) : ""}</span>
          </div>
          ${log.finish_position ? `<span class="tag tag-position">#${escapeHtml(log.finish_position)}</span>` : ""}
        </div>
        ${renderConditions(log, lang)}
        ${renderSettings(log, lang)}
        ${log.notes ? `<div class="log-card-notes">${escapeHtml(log.notes)}</div>` : ""}
        <div class="log-card-actions">
          <a href="/edit/${log.id}" class="btn btn-secondary btn-sm">Edit</a>
          <form method="POST" action="/delete/${log.id}" style="display:inline;" onsubmit="return confirm('Delete this race log?')">
            <button type="submit" class="btn btn-danger">Delete</button>
          </form>
        </div>
      </div>
    `).join("")}
  </div>`;
}

function sailorPage(sailor, logs, lang) {
  lang = lang || 'en';
  return `<div class="container">
    <h2>${escapeHtml(sailor.display_name || sailor.username)} <span class="sub">${sailor.snipe_number ? "Snipe #" + escapeHtml(sailor.snipe_number) + " &mdash; " : ""}${sailor.boat_name ? "S/V " + escapeHtml(sailor.boat_name) + " &mdash; " : ""}${t('memberSince', lang)} ${formatDate(sailor.created_at)} &mdash; ${logs.length} ${t('racesLogged', lang)}</span></h2>
    ${logs.length === 0 ? `
      <div class="empty-state"><h3>${t('noRacesLoggedYet', lang)}</h3></div>
    ` : logs.map(log => `
      <div class="log-card">
        <div class="log-card-header">
          <div>
            <h3>${escapeHtml(log.race_name)}</h3>
            <span class="date">${formatDate(log.race_date)}${log.location ? " &mdash; " + escapeHtml(log.location) : ""}</span>
          </div>
          ${log.finish_position ? `<span class="tag tag-position">#${escapeHtml(log.finish_position)}</span>` : ""}
        </div>
        ${renderConditions(log, lang)}
        ${renderSettings(log, lang)}
        ${log.notes ? `<div class="log-card-notes">${escapeHtml(log.notes)}</div>` : ""}
      </div>
    `).join("")}
  </div>`;
}

function logFormPage(data, error, userWireDefault, lang) {
  userWireDefault = userWireDefault || '';
  lang = lang || 'en';
  const L = (k) => t(k, lang);
  const isEdit = data && data.id;
  const d = data || {};
  const dateVal = d.race_date || "";
  return `<div class="container">
    <h2>${isEdit ? L('editRaceLog') : L('logARace')}</h2>
    ${error ? `<div class="alert alert-error">${escapeHtml(error)}</div>` : ""}
    <div class="form-card wide">
      <form method="POST" action="${isEdit ? "/edit/" + d.id : "/log"}">
        <div class="form-grid">

          <div class="form-section">${L('event')}</div>
          <div class="form-group">
            <label>${L('raceName')} *</label>
            <input type="text" name="race_name" value="${escapeHtml(d.race_name)}" placeholder="${L('egRaceName')}" required>
          </div>
          <div class="form-group">
            <label>${L('date')} *</label>
            <input type="date" name="race_date" value="${escapeHtml(dateVal)}" required>
          </div>
          <div class="form-group">
            <label>${L('location')}</label>
            <input type="text" name="location" value="${escapeHtml(d.location)}" placeholder="${L('egLocation')}">
          </div>
          <div class="form-group">
            <label>${L('boatNumber')}</label>
            <input type="text" name="boat_number" value="${escapeHtml(d.boat_number)}" placeholder="${L('egBoatNum')}">
          </div>
          <div class="form-group">
            <label>${L('crewName')}</label>
            <input type="text" name="crew_name" value="${escapeHtml(d.crew_name)}" placeholder="${L('egCrewName')}">
          </div>
          <div class="form-group">
            <label>${L('skipperWeight')} (${isMetric(lang) ? 'kg' : 'lbs'})</label>
            <input type="number" name="skipper_weight" value="${escapeHtml(d.skipper_weight)}" placeholder="${isMetric(lang) ? 'e.g. 77' : 'e.g. 170'}">
          </div>
          <div class="form-group">
            <label>${L('crewWeight')} (${isMetric(lang) ? 'kg' : 'lbs'})</label>
            <input type="number" name="crew_weight" value="${escapeHtml(d.crew_weight)}" placeholder="${isMetric(lang) ? 'e.g. 68' : 'e.g. 150'}">
          </div>
          <div class="form-group">
            <label>${L('finishPosition')}</label>
            <input type="text" name="finish_position" value="${escapeHtml(d.finish_position)}" placeholder="e.g. 3">
          </div>
          <div class="form-group">
            <label>${L('fleetSize')}</label>
            <input type="text" name="fleet_size" value="${escapeHtml(d.fleet_size)}" placeholder="e.g. 15">
          </div>
          <div class="form-group">
            <label>${L('perfRating')}</label>
            <select name="performance_rating" style="padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;">
              <option value="">-- ${lang === 'es' ? 'Seleccionar' : lang === 'it' ? 'Seleziona' : lang === 'pt' ? 'Selecionar' : 'Select'} --</option>
              ${[1,2,3,4,5,6,7,8,9,10].map(n => `<option value="${n}" ${d.performance_rating == n ? "selected" : ""}>${n}${n === 1 ? (lang === 'es' ? " (peor)" : lang === 'it' ? " (peggiore)" : lang === 'pt' ? " (pior)" : " (worst)") : n === 10 ? (lang === 'es' ? " (mejor)" : lang === 'it' ? " (migliore)" : lang === 'pt' ? " (melhor)" : " (best)") : ""}</option>`).join("")}
            </select>
          </div>

          <div class="form-section">${L('conditions')}</div>
          <div class="form-group">
            <label>${L('windSpeed')}</label>
            <input type="text" name="wind_speed" value="${escapeHtml(d.wind_speed)}" placeholder="${lang === 'es' ? 'e.g. 12-15 nudos' : lang === 'it' ? 'e.g. 12-15 nodi' : lang === 'pt' ? 'e.g. 12-15 nós' : 'e.g. 12-15 knots'}">
          </div>
          <div class="form-group">
            <label>${L('windDirection')}</label>
            <select name="wind_direction">
              <option value="">-- ${lang === 'es' ? 'Seleccionar' : lang === 'it' ? 'Seleziona' : lang === 'pt' ? 'Selecionar' : 'Select'} --</option>
              ${["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"].map(dir =>
                `<option value="${dir}" ${d.wind_direction === dir ? "selected" : ""}>${dir}</option>`
              ).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>${L('seaState')}</label>
            <select name="sea_state" style="padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;">
              <option value="">-- ${lang === 'es' ? 'Seleccionar' : lang === 'it' ? 'Seleziona' : lang === 'pt' ? 'Selecionar' : 'Select'} --</option>
              <option value="Flat" ${d.sea_state === 'Flat' ? 'selected' : ''}>${L('flat')}</option>
              <option value="Choppy" ${d.sea_state === 'Choppy' ? 'selected' : ''}>${L('choppy')}</option>
              <option value="Large Waves" ${d.sea_state === 'Large Waves' ? 'selected' : ''}>${L('largeWaves')}</option>
            </select>
          </div>
          <div class="form-group">
            <label>🌊 ${lang === 'es' ? 'Tipo de Agua' : lang === 'it' ? 'Tipo di Acqua' : lang === 'pt' ? 'Tipo de Água' : 'Water Type'}</label>
            <select name="water_type" style="padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;">
              <option value="">-- ${lang === 'es' ? 'Seleccionar' : lang === 'it' ? 'Seleziona' : lang === 'pt' ? 'Selecionar' : 'Select'} --</option>
              <option value="Saltwater" ${d.water_type === 'Saltwater' ? 'selected' : ''}>${lang === 'es' ? '🌊 Agua Salada' : lang === 'it' ? '🌊 Acqua Salata' : lang === 'pt' ? '🌊 Água Salgada' : '🌊 Saltwater'}</option>
              <option value="Freshwater" ${d.water_type === 'Freshwater' ? 'selected' : ''}>${lang === 'es' ? '💧 Agua Dulce' : lang === 'it' ? '💧 Acqua Dolce' : lang === 'pt' ? '💧 Água Doce' : '💧 Freshwater'}</option>
            </select>
          </div>
          <div class="form-group">
            <label>${L('temperature')}</label>
            <input type="text" name="temperature" value="${escapeHtml(d.temperature)}" placeholder="${isMetric(lang) ? 'e.g. 25°C' : 'e.g. 78°F'}">
          </div>
          <div class="form-group">
            <label>${L('currentTide')}</label>
            <input type="text" name="current_tide" value="${escapeHtml(d.current_tide)}" placeholder="${lang === 'es' ? 'e.g. Marea entrante' : lang === 'it' ? 'e.g. Marea entrante' : lang === 'pt' ? 'e.g. Maré entrante' : 'e.g. Incoming tide, 0.5 kt ebb'}">
          </div>

          <div class="form-section">${L('boatSettings')}</div>

          <div class="form-group">
            <label>${lang === 'es' ? 'Velería del Mayor' : lang === 'it' ? 'Veleria della Randa' : lang === 'pt' ? 'Fabricante da Vela Grande' : 'Mainsail Maker'}</label>
            <select name="main_maker" id="main_maker" style="padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;">
              <option value="">-- ${lang === 'es' ? 'Seleccionar' : lang === 'it' ? 'Selezionare' : lang === 'pt' ? 'Selecionar' : 'Select'} --</option>
              <option value="Quantum" ${d.main_maker === 'Quantum' ? 'selected' : ''}>Quantum</option>
              <option value="North" ${d.main_maker === 'North' ? 'selected' : ''}>North</option>
              <option value="Olimpic" ${d.main_maker === 'Olimpic' ? 'selected' : ''}>Olimpic</option>
            </select>
          </div>
          <div class="form-group">
            <label>${lang === 'es' ? 'Modelo del Mayor' : lang === 'it' ? 'Modello della Randa' : lang === 'pt' ? 'Modelo da Vela Grande' : 'Mainsail Model'}</label>
            <select name="mainsail_used" id="mainsail_model" style="padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;">
              <option value="${escapeHtml(d.mainsail_used)}" selected>${escapeHtml(d.mainsail_used) || '-- ' + (lang === 'es' ? 'Seleccionar fabricante primero' : lang === 'it' ? 'Selezionare prima il produttore' : lang === 'pt' ? 'Selecione o fabricante primeiro' : 'Select maker first') + ' --'}</option>
            </select>
          </div>

          <div class="form-group">
            <label>${lang === 'es' ? 'Estado del Mayor' : lang === 'it' ? 'Condizione della Randa' : lang === 'pt' ? 'Condição da Vela Grande' : 'Mainsail Condition'}</label>
            <select name="main_condition" style="padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;">
              <option value="">-- ${lang === 'es' ? 'Seleccionar' : lang === 'it' ? 'Selezionare' : lang === 'pt' ? 'Selecionar' : 'Select'} --</option>
              <option value="New" ${d.main_condition === 'New' ? 'selected' : ''}>${lang === 'es' ? 'Nueva' : lang === 'it' ? 'Nuova' : lang === 'pt' ? 'Nova' : 'New'}</option>
              <option value="Mid-life" ${d.main_condition === 'Mid-life' ? 'selected' : ''}>${lang === 'es' ? 'Vida media' : lang === 'it' ? 'Mezza vita' : lang === 'pt' ? 'Meia vida' : 'Mid-life'}</option>
              <option value="Rag bin" ${d.main_condition === 'Rag bin' ? 'selected' : ''}>${lang === 'es' ? 'Para tirar' : lang === 'it' ? 'Da buttare' : lang === 'pt' ? 'Para descartar' : 'Ready for the rag bin'}</option>
            </select>
          </div>

          <div class="form-group">
            <label>${lang === 'es' ? 'Velería del Foque' : lang === 'it' ? 'Veleria del Fiocco' : lang === 'pt' ? 'Fabricante da Vela de Proa' : 'Jib Maker'}</label>
            <select name="jib_maker" id="jib_maker" style="padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;">
              <option value="">-- ${lang === 'es' ? 'Seleccionar' : lang === 'it' ? 'Selezionare' : lang === 'pt' ? 'Selecionar' : 'Select'} --</option>
              <option value="Quantum" ${d.jib_maker === 'Quantum' ? 'selected' : ''}>Quantum</option>
              <option value="North" ${d.jib_maker === 'North' ? 'selected' : ''}>North</option>
              <option value="Olimpic" ${d.jib_maker === 'Olimpic' ? 'selected' : ''}>Olimpic</option>
            </select>
          </div>
          <div class="form-group">
            <label>${lang === 'es' ? 'Modelo del Foque' : lang === 'it' ? 'Modello del Fiocco' : lang === 'pt' ? 'Modelo da Vela de Proa' : 'Jib Model'}</label>
            <select name="jib_used" id="jib_model" style="padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;">
              <option value="${escapeHtml(d.jib_used)}" selected>${escapeHtml(d.jib_used) || '-- ' + (lang === 'es' ? 'Seleccionar fabricante primero' : lang === 'it' ? 'Selezionare prima il produttore' : lang === 'pt' ? 'Selecione o fabricante primeiro' : 'Select maker first') + ' --'}</option>
            </select>
          </div>

          <div class="form-group">
            <label>${lang === 'es' ? 'Estado del Foque' : lang === 'it' ? 'Condizione del Fiocco' : lang === 'pt' ? 'Condição da Vela de Proa' : 'Jib Condition'}</label>
            <select name="jib_condition" style="padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;">
              <option value="">-- ${lang === 'es' ? 'Seleccionar' : lang === 'it' ? 'Selezionare' : lang === 'pt' ? 'Selecionar' : 'Select'} --</option>
              <option value="New" ${d.jib_condition === 'New' ? 'selected' : ''}>${lang === 'es' ? 'Nueva' : lang === 'it' ? 'Nuova' : lang === 'pt' ? 'Nova' : 'New'}</option>
              <option value="Mid-life" ${d.jib_condition === 'Mid-life' ? 'selected' : ''}>${lang === 'es' ? 'Vida media' : lang === 'it' ? 'Mezza vita' : lang === 'pt' ? 'Meia vida' : 'Mid-life'}</option>
              <option value="Rag bin" ${d.jib_condition === 'Rag bin' ? 'selected' : ''}>${lang === 'es' ? 'Para tirar' : lang === 'it' ? 'Da buttare' : lang === 'pt' ? 'Para descartar' : 'Ready for the rag bin'}</option>
            </select>
          </div>

          <div class="form-group">
            <label>${lang === 'es' ? 'Velería del Spinnaker' : lang === 'it' ? 'Veleria dello Spinnaker' : lang === 'pt' ? 'Fabricante do Spinnaker' : 'Spinnaker Maker'}</label>
            <select id="spinnaker_maker" style="padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;">
              <option value="">-- ${lang === 'es' ? 'Seleccionar' : lang === 'it' ? 'Selezionare' : lang === 'pt' ? 'Selecionar' : 'Select'} --</option>
              <option value="Quantum">Quantum</option>
              <option value="North">North</option>
              <option value="Olimpic">Olimpic</option>
            </select>
          </div>
          <div class="form-group" id="spinnaker-model-group" style="display:none;">
            <label>${lang === 'es' ? 'Modelo del Spinnaker' : lang === 'it' ? 'Modello dello Spinnaker' : lang === 'pt' ? 'Modelo do Spinnaker' : 'Spinnaker Model'}</label>
            <select id="spinnaker_model" style="padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;">
              <option value="">-- ${lang === 'es' ? 'Seleccionar' : lang === 'it' ? 'Selezionare' : lang === 'pt' ? 'Selecionar' : 'Select'} --</option>
              <option value="Red Spinnaker">Red Spinnaker</option>
              <option value="The Whomper">The Whomper</option>
            </select>
          </div>

          <script>
          (function() {
            var mainModels = {
              Quantum: ['C-5', 'X-2', 'XFB'],
              North: ['SW-4', 'PR-3', 'CB-2'],
              Olimpic: ['CRC', 'XPM', 'CM1', 'CM5', 'GTM', 'GTM-F']
            };
            var jibModels = {
              Quantum: ['RSJ-14', 'RSJ-8'],
              North: ['R3-LM', 'Cross-Cut Jib'],
              Olimpic: ['XPJ', 'AR2-F', 'GTJ']
            };
            var selectMakerFirstTxt = '${t("selectMakerFirst", lang)}';
            var selectModelTxt = '${t("selectModel", lang)}';
            function populateModels(makerSel, modelSel, models, currentVal) {
              var maker = makerSel.value;
              var opts = models[maker] || [];
              modelSel.innerHTML = '';
              if (!maker) {
                var o = document.createElement('option');
                o.value = '';
                o.textContent = '-- ' + selectMakerFirstTxt + ' --';
                modelSel.appendChild(o);
                return;
              }
              var o0 = document.createElement('option');
              o0.value = '';
              o0.textContent = '-- ' + selectModelTxt + ' --';
              modelSel.appendChild(o0);
              opts.forEach(function(m) {
                var o = document.createElement('option');
                o.value = maker + ' ' + m;
                o.textContent = m;
                if (currentVal === maker + ' ' + m) o.selected = true;
                modelSel.appendChild(o);
              });
            }
            var mainMaker = document.getElementById('main_maker');
            var mainModel = document.getElementById('mainsail_model');
            var jibMaker = document.getElementById('jib_maker');
            var jibModel = document.getElementById('jib_model');
            var curMain = '${escapeHtml(d.mainsail_used)}';
            var curJib = '${escapeHtml(d.jib_used)}';
            if (mainMaker && mainModel) {
              if (mainMaker.value) populateModels(mainMaker, mainModel, mainModels, curMain);
              mainMaker.addEventListener('change', function() { populateModels(mainMaker, mainModel, mainModels, ''); });
            }
            if (jibMaker && jibModel) {
              if (jibMaker.value) populateModels(jibMaker, jibModel, jibModels, curJib);
              jibMaker.addEventListener('change', function() { populateModels(jibMaker, jibModel, jibModels, ''); });
            }

            // Spinnaker Easter egg
            var spMaker = document.getElementById('spinnaker_maker');
            var spModelGroup = document.getElementById('spinnaker-model-group');
            var spModel = document.getElementById('spinnaker_model');
            if (spMaker) {
              spMaker.addEventListener('change', function() {
                if (spMaker.value) {
                  spModelGroup.style.display = '';
                  spModel.value = '';
                } else {
                  spModelGroup.style.display = 'none';
                }
              });
            }
            if (spModel) {
              spModel.addEventListener('change', function() {
                if (spModel.value) {
                  // Create full-screen flash overlay
                  var overlay = document.createElement('div');
                  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;cursor:pointer;';
                  overlay.innerHTML = '<div style="text-align:center;padding:40px 30px;max-width:600px;"><div style="font-size:5rem;margin-bottom:20px;">\\u26f5\\ud83d\\ude02</div><div style="font-size:3rem;font-weight:900;color:#fff;text-shadow:3px 3px 6px rgba(0,0,0,0.5);line-height:1.3;animation:flashPulse 0.5s ease-in-out infinite alternate;">Ha, Fooled You!!!<br>There is no spinnaker<br>on a Snipe!</div><div style="margin-top:24px;font-size:1.2rem;color:rgba(255,255,255,0.8);">(tap anywhere to close)</div></div>';
                  // Animate background colors
                  var colors = ['#e53e3e','#2b6cb0','#38a169','#d69e2e','#805ad5','#dd6b20'];
                  var ci = 0;
                  overlay.style.background = colors[0];
                  var flashInterval = setInterval(function() { ci = (ci + 1) % colors.length; overlay.style.background = colors[ci]; }, 400);
                  // Add CSS animation
                  var style = document.createElement('style');
                  style.textContent = '@keyframes flashPulse { from { transform: scale(1); } to { transform: scale(1.08); } }';
                  document.head.appendChild(style);
                  overlay.addEventListener('click', function() {
                    clearInterval(flashInterval);
                    overlay.remove();
                    style.remove();
                    spModel.value = '';
                    spMaker.value = '';
                    spModelGroup.style.display = 'none';
                  });
                  document.body.appendChild(overlay);
                }
              });
            }
          })();
          </script>
          <div class="form-group">
            <label>${L('mastRake')}</label>
            <input type="text" name="mast_rake" value="${escapeHtml(d.mast_rake)}" placeholder="${isMetric(lang) ? "e.g. 6.55m" : "e.g. 21&#39;6&quot; to transom"}">
          </div>
          <div class="form-group">
            <label>${L('shroudTension')}</label>
            <input type="text" name="shroud_tension" value="${escapeHtml(d.shroud_tension)}" placeholder="${L('egShroudTension')}">
          </div>
          <div class="form-group">
            <label>${L('staMasterTurns')}</label>
            <input type="text" name="shroud_turns" value="${escapeHtml(d.shroud_turns)}" placeholder="${L('egStaMaster')}">
          </div>
          <div class="form-group">
            <label>${L('wireSize')}</label>
            <select name="wire_size" id="wire-size-select" style="padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;">
              <option value="">-- ${lang === 'es' ? 'Seleccionar' : lang === 'it' ? 'Seleziona' : lang === 'pt' ? 'Selecionar' : 'Select'} --</option>
              <option value="2.5mm compressed" ${(d.wire_size || userWireDefault) === '2.5mm compressed' ? 'selected' : ''}>2.5mm ${lang === 'es' ? 'Comprimido' : lang === 'it' ? 'Compresso' : lang === 'pt' ? 'Comprimido' : 'Compressed Strand'}</option>
              <option value="3mm standard" ${(d.wire_size || userWireDefault) === '3mm standard' ? 'selected' : ''}>3mm Standard</option>
            </select>
            <div style="margin-top:6px;">
              <label style="font-weight:400;font-size:0.85rem;color:#555;display:inline-flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="checkbox" name="wire_size_save_default" value="1" style="width:auto;margin:0;"> ${lang === 'es' ? 'Guardar como predeterminado' : lang === 'it' ? 'Salva come predefinito' : lang === 'pt' ? 'Salvar como padrão' : 'Save as my default for all races'}
              </label>
              ${userWireDefault ? '<span style="font-size:0.8rem;color:#2e7d32;margin-left:8px;">✓ Default: ' + escapeHtml(userWireDefault) + '</span>' : ''}
            </div>
          </div>
          <div class="form-group">
            <label>${L('spreaderLength')}</label>
            <input type="text" name="spreader_length" value="${escapeHtml(d.spreader_length)}" placeholder="${isMetric(lang) ? 'e.g. 42 cm' : 'e.g. 16.75&quot;'}">
          </div>
          <div class="form-group">
            <label>${L('spreaderSweep')}</label>
            <input type="text" name="spreader_sweep" value="${escapeHtml(d.spreader_sweep)}" placeholder="${isMetric(lang) ? 'e.g. 76 cm' : 'e.g. 30&quot;'}">
          </div>
          <div class="form-group">
            <label>${lang === 'es' ? 'Guía del Foque (cm desde puño de amura)' : lang === 'it' ? 'Guida Fiocco (cm dal punto di mura)' : lang === 'pt' ? 'Guia do Foque (cm da amura)' : 'Jib Lead Position (inches from tack)'}</label>
            <input type="text" name="jib_lead" value="${escapeHtml(d.jib_lead)}" placeholder="${isMetric(lang) ? 'e.g. 226 cm' : 'e.g. 89&quot;'}">
          </div>
          <div class="form-group">
            <label>${L('jibClothTension')}</label>
            <input type="text" name="jib_cloth_tension" value="${escapeHtml(d.jib_cloth_tension)}" placeholder="${L('egJibCloth')}">
          </div>
          <div class="form-group">
            <label>${L('jibHeight')}</label>
            <input type="text" name="jib_height" value="${escapeHtml(d.jib_height)}" placeholder="${isMetric(lang) ? 'e.g. 4 cm' : 'e.g. 1.5&quot;'}">
          </div>
          <div class="form-group">
            <label>${L('jibOutboardLead')}</label>
            <input type="text" name="jib_outboard_lead" value="${escapeHtml(d.jib_outboard_lead)}" placeholder="${L('egJibOutboard')}">
          </div>
          <div class="form-group">
            <label>${L('cunningham')}</label>
            <input type="text" name="cunningham" value="${escapeHtml(d.cunningham)}" placeholder="${L('egCunningham')}">
          </div>
          <div class="form-group">
            <label>${L('outhaul')}</label>
            <input type="text" name="outhaul" value="${escapeHtml(d.outhaul)}" placeholder="${isMetric(lang) ? 'e.g. 2 cm eased' : 'e.g. Eased 1&quot;, Tight'}">
          </div>
          <div class="form-group">
            <label>${L('vang')}</label>
            <input type="text" name="vang" value="${escapeHtml(d.vang)}" placeholder="${L('egVang')}">
          </div>
          <div class="form-group">
            <label>${L('mastPuller')}</label>
            <input type="text" name="centerboard_position" value="${escapeHtml(d.centerboard_position)}" placeholder="${L('egPuller')}">
          </div>
          <div class="form-group">
            <label>${L('traveler')}</label>
            <input type="text" name="traveler_position" value="${escapeHtml(d.traveler_position)}" placeholder="${isMetric(lang) ? 'e.g. Centro, 5 cm sotto' : 'e.g. Centered, 2&quot; down'}">
          </div>
          <div class="form-group">
            <label>${L('augieEq')}</label>
            <input type="text" name="augie_equalizer" value="${escapeHtml(d.augie_equalizer)}" placeholder="${L('egAugie')}">
          </div>
          <div class="form-group">
            <label>${L('staMasterWiggle')}</label>
            <select name="mast_wiggle" style="padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;">
              <option value="">-- ${L('select')} --</option>
              <option value="None" ${d.mast_wiggle === 'None' ? 'selected' : ''}>${L('none')}</option>
              <option value="A little" ${d.mast_wiggle === 'A little' ? 'selected' : ''}>${L('aLittle')}</option>
              <option value="Moderate" ${d.mast_wiggle === 'Moderate' ? 'selected' : ''}>${L('moderate')}</option>
              <option value="Downright Sloppy!" ${d.mast_wiggle === 'Downright Sloppy!' ? 'selected' : ''}>${L('downrightSloppy')}</option>
            </select>
          </div>
          <div class="form-group full">
            <label>${lang === 'es' ? 'Notas de Ajustes' : lang === 'it' ? 'Note Regolazioni' : lang === 'pt' ? 'Notas de Ajustes' : 'Settings Notes'}</label>
            <textarea name="sail_settings_notes" placeholder="${lang === 'es' ? 'Detalles adicionales...' : lang === 'it' ? 'Dettagli aggiuntivi...' : lang === 'pt' ? 'Detalhes adicionais...' : 'Additional rig tuning details...'}">${escapeHtml(d.sail_settings_notes)}</textarea>
          </div>

          <div class="form-section">${L('notes')}</div>
          <div class="form-group full">
            <label>${L('raceNotes')}</label>
            <textarea name="notes" placeholder="${lang === 'es' ? 'Estrategia, largadas, marcas...' : lang === 'it' ? 'Strategia, partenze, boe...' : lang === 'pt' ? 'Estratégia, largadas, marcas...' : 'Race strategy, starts, mark roundings...'}">${escapeHtml(d.notes)}</textarea>
          </div>
        </div>
        <div style="display:flex; gap:12px; margin-top:8px;">
          <button type="submit" class="btn btn-primary">${isEdit ? L('updateRaceLog') : L('saveRaceLog')}</button>
          <a href="/dashboard" class="btn btn-secondary">${L('cancel')}</a>
        </div>
      </form>
      <script>
      (function() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        document.querySelectorAll('.form-grid input[type="text"], .form-grid textarea').forEach(el => {
          const wrap = document.createElement('div');
          wrap.className = 'input-wrap';
          el.parentNode.insertBefore(wrap, el);
          wrap.appendChild(el);
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'mic-btn';
          btn.innerHTML = '🎤';
          btn.title = 'Voice input';
          if (el.tagName === 'TEXTAREA') { btn.style.top = '16px'; btn.style.transform = 'none'; }
          wrap.appendChild(btn);
          btn.addEventListener('click', function() {
            if (btn.classList.contains('listening')) return;
            const rec = new SR();
            rec.lang = 'en-US';
            rec.interimResults = false;
            rec.continuous = false;
            btn.classList.add('listening');
            rec.onresult = function(e) {
              const text = e.results[0][0].transcript;
              if (el.value) el.value += ' ' + text;
              else el.value = text;
              btn.classList.remove('listening');
            };
            rec.onerror = function() { btn.classList.remove('listening'); };
            rec.onend = function() { btn.classList.remove('listening'); };
            rec.start();
          });
        });
      })();
      </script>
    </div>
  </div>`;
}

function loginPage(error) {
  return `<div class="container">
    <h2 id="login-title">Login</h2>
    ${error ? `<div class="alert alert-error">${escapeHtml(error)}</div>` : ""}
    <div class="form-card">
      <form method="POST" action="/login">
        <div class="form-group">
          <label>🌐 Language / Idioma / Lingua</label>
          <select name="language" id="lang-select" style="padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
            <option value="en">🇺🇸🇬🇧 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="it">🇮🇹 Italiano</option>
            <option value="pt">🇧🇷 Português</option>
          </select>
        </div>
        <div class="form-group">
          <label id="lbl-email">Email</label>
          <input type="email" name="email" required autofocus>
        </div>
        <div class="form-group">
          <label id="lbl-password">Password</label>
          <input type="password" name="password" required>
        </div>
        <button type="submit" id="btn-login" class="btn btn-primary" style="width:100%;">Login</button>
        <div style="text-align:right;margin-top:8px;"><a href="/forgot-password" id="lnk-forgot" style="color:#1565c0;font-size:0.88rem;">Forgot password?</a></div>
      </form>
      <div class="form-footer" id="lnk-signup">Don't have an account? <a href="/register">Sign up</a></div>
    </div>
  </div>
  <script>
  var loginL = {
    en: { title:'Login', email:'Email', password:'Password', btn:'Login', forgot:'Forgot password?', signup:'Don\\'t have an account? <a href="/register">Sign up</a>' },
    es: { title:'Iniciar Sesión', email:'Correo Electrónico', password:'Contraseña', btn:'Iniciar Sesión', forgot:'¿Olvidó su contraseña?', signup:'¿No tiene cuenta? <a href="/register">Registrarse</a>' },
    it: { title:'Accedi', email:'Email', password:'Password', btn:'Accedi', forgot:'Password dimenticata?', signup:'Non hai un account? <a href="/register">Registrati</a>' },
    pt: { title:'Entrar', email:'Email', password:'Senha', btn:'Entrar', forgot:'Esqueceu a senha?', signup:'Não tem conta? <a href="/register">Cadastrar</a>' }
  };
  function applyLoginLang(lang) {
    var t = loginL[lang] || loginL.en;
    document.getElementById('login-title').textContent = t.title;
    document.getElementById('lbl-email').textContent = t.email;
    document.getElementById('lbl-password').textContent = t.password;
    document.getElementById('btn-login').textContent = t.btn;
    document.getElementById('lnk-forgot').textContent = t.forgot;
    document.getElementById('lnk-signup').innerHTML = t.signup;
  }
  document.getElementById('lang-select').addEventListener('change', function() {
    localStorage.setItem('snipe_lang', this.value);
    applyLoginLang(this.value);
  });
  // Restore saved language on page load
  var savedLang = localStorage.getItem('snipe_lang');
  if (savedLang && ['en','es','it','pt'].includes(savedLang)) {
    document.getElementById('lang-select').value = savedLang;
    applyLoginLang(savedLang);
  }
  </script>`;
}

function registerPage(error) {
  return `<div class="container">
    <h2 id="reg-title">Create Account</h2>
    ${error ? `<div class="alert alert-error">${escapeHtml(error)}</div>` : ""}
    <div class="form-card">
      <form method="POST" action="/register">
        <div class="form-group">
          <label>🌐 Language / Idioma / Lingua</label>
          <select name="language" id="reg-lang-select" style="padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
            <option value="en">🇺🇸🇬🇧 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="it">🇮🇹 Italiano</option>
            <option value="pt">🇧🇷 Português</option>
          </select>
        </div>
        <div class="form-group">
          <label id="lbl-username">Username *</label>
          <input type="text" name="username" required autofocus placeholder="e.g. sailor42">
        </div>
        <div class="form-group">
          <label id="lbl-yourname">Your Name</label>
          <input type="text" name="display_name" placeholder="e.g. Charlie Green">
        </div>
        <div class="form-group">
          <label id="lbl-boatname">Sailboat Name</label>
          <input type="text" name="boat_name" placeholder="e.g. Wind Dancer">
        </div>
        <div class="form-group">
          <label id="lbl-sailnum">Snipe Sail Number</label>
          <input type="text" name="snipe_number" placeholder="e.g. 31847">
        </div>
        <div class="form-group">
          <label id="lbl-reg-email">Email *</label>
          <input type="email" name="email" required placeholder="your@email.com">
        </div>
        <div class="form-group">
          <label id="lbl-reg-pw">Password *</label>
          <input type="password" name="password" required minlength="6" id="reg-pw-input" placeholder="At least 6 characters">
        </div>
        <div class="form-group">
          <label id="lbl-reg-cpw">Confirm Password *</label>
          <input type="password" name="confirm_password" required minlength="6">
        </div>
        <button type="submit" id="btn-reg-submit" class="btn btn-primary" style="width:100%;">Create Account</button>
      </form>
      <div class="form-footer" id="reg-footer">Already have an account? <a href="/login">Login</a></div>
    </div>
  </div>
  <script>
  var regL = {
    en: { title:'Create Account', username:'Username *', name:'Your Name', boat:'Sailboat Name', sail:'Snipe Sail Number', email:'Email *', pw:'Password *', cpw:'Confirm Password *', btn:'Create Account', footer:'Already have an account? <a href="/login">Login</a>', pwph:'At least 6 characters' },
    es: { title:'Crear Cuenta', username:'Nombre de Usuario *', name:'Su Nombre', boat:'Nombre del Barco', sail:'Número de Vela Snipe', email:'Correo Electrónico *', pw:'Contraseña *', cpw:'Confirmar Contraseña *', btn:'Crear Cuenta', footer:'¿Ya tiene cuenta? <a href="/login">Iniciar Sesión</a>', pwph:'Al menos 6 caracteres' },
    it: { title:'Crea Account', username:'Nome Utente *', name:'Il Tuo Nome', boat:'Nome della Barca', sail:'Numero Vela Snipe', email:'Email *', pw:'Password *', cpw:'Conferma Password *', btn:'Crea Account', footer:'Hai già un account? <a href="/login">Accedi</a>', pwph:'Almeno 6 caratteri' },
    pt: { title:'Criar Conta', username:'Nome de Usuário *', name:'Seu Nome', boat:'Nome do Barco', sail:'Número da Vela Snipe', email:'Email *', pw:'Senha *', cpw:'Confirmar Senha *', btn:'Criar Conta', footer:'Já tem conta? <a href="/login">Entrar</a>', pwph:'No mínimo 6 caracteres' }
  };
  function applyRegLang(lang) {
    var t = regL[lang] || regL.en;
    document.getElementById('reg-title').textContent = t.title;
    document.getElementById('lbl-username').textContent = t.username;
    document.getElementById('lbl-yourname').textContent = t.name;
    document.getElementById('lbl-boatname').textContent = t.boat;
    document.getElementById('lbl-sailnum').textContent = t.sail;
    document.getElementById('lbl-reg-email').textContent = t.email;
    document.getElementById('lbl-reg-pw').textContent = t.pw;
    document.getElementById('lbl-reg-cpw').textContent = t.cpw;
    document.getElementById('btn-reg-submit').textContent = t.btn;
    document.getElementById('reg-footer').innerHTML = t.footer;
    document.getElementById('reg-pw-input').placeholder = t.pwph;
  }
  document.getElementById('reg-lang-select').addEventListener('change', function() {
    localStorage.setItem('snipe_lang', this.value);
    applyRegLang(this.value);
  });
  // Restore saved language on page load
  var savedLang = localStorage.getItem('snipe_lang');
  if (savedLang && ['en','es','it','pt'].includes(savedLang)) {
    document.getElementById('reg-lang-select').value = savedLang;
    applyRegLang(savedLang);
  }
  </script>`;
}

function profilePage(userData, success) {
  return `<div class="container">
    <h2>My Profile <span class="sub">Update your sailor info and boat details</span></h2>
    ${success ? `<div class="alert alert-success">${escapeHtml(success)}</div>` : ""}
    <div class="form-card">
      <form method="POST" action="/profile">
        <div class="form-group">
          <label>Your Name</label>
          <input type="text" name="display_name" value="${escapeHtml(userData.display_name)}" placeholder="e.g. Charlie Green">
        </div>
        <div class="form-group">
          <label>Sailboat Name</label>
          <input type="text" name="boat_name" value="${escapeHtml(userData.boat_name)}" placeholder="e.g. Wind Dancer">
        </div>
        <div class="form-group">
          <label>Snipe Sail Number</label>
          <input type="text" name="snipe_number" value="${escapeHtml(userData.snipe_number)}" placeholder="e.g. 31847">
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;">Save Profile</button>
      </form>
      <div class="form-footer" style="margin-top:24px;">
        <strong>Username:</strong> ${escapeHtml(userData.username)} &nbsp;&bull;&nbsp;
        <strong>Email:</strong> ${escapeHtml(userData.email)}
      </div>
    </div>
  </div>`;
}


//$removed1,(req,res)=>{res.send('<html><body><h1>Trustee Instructions</h1><p><a href="/trustee/written">Written Instructions</a></p></body></html>');});
//$removed2,(req,res)=>{res.send('<html><body><h1>Written Instructions</h1><p>Document: Dropbox/Claude/Trustee-Instructions-Snipeovation-CrewCollege.docx</p><a href="/trustee">Back</a></body></html>');});
app.get('/trustee',(req,res)=>{res.send('<html><body><h1>Trustee Instructions</h1><p><a href=/trustee/written>Written Instructions</a></p></body></html>');});
app.get('/trustee/written',(req,res)=>{res.send('<html><body><h1>Written Instructions</h1><p>Document: Dropbox/Claude/Trustee-Instructions-Snipeovation-CrewCollege.docx</p><a href=/trustee>Back</a></body></html>');});
// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
