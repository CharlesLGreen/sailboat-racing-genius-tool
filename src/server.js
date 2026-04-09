// Snipeovation - Deploy trigger 2026-04-06
const express = require("express");
const session = require("express-session");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const Anthropic = require("@anthropic-ai/sdk");

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
    select: 'Select',
    // Data Sharing card
    dataSharing: 'Data Sharing',
    dsChoose: 'Choose how your race data is shared before logging.',
    dsShareBtn: 'Share my data',
    dsPrivateBtn: 'Keep Private',
    dsShareDesc: 'Your races appear in the Race Feed and contribute to fleet-wide coaching insights. You benefit from aggregated data from all Snipeovation sailors.',
    dsPrivateDesc: 'Your data is yours alone — not visible in Race Feed and not used in fleet analytics. Your coaching uses only your personal history.',
    dsOneQuickThing: 'One quick thing first...',
    dsHowUsed: 'How would you like your data used within the Snipeovation community?',
    dsShareChoiceDesc: 'Contribute to Race Feed and fleet-wide aggregated insights. I benefit from the collective knowledge of all Snipeovation sailors.',
    dsPrivateChoiceDesc: 'My data is for my use only. I won\'t contribute to or receive fleet-wide aggregated coaching insights.',
    dsContinue: 'Continue',
    dsChangeAnytime: 'You can change this anytime in',
    dsProfileSettings: 'Profile settings'
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
    select: 'Seleccionar',
    dataSharing: 'Compartir Datos',
    dsChoose: 'Elija cómo se comparten sus datos de regata antes de registrar.',
    dsShareBtn: 'Compartir mis datos',
    dsPrivateBtn: 'Mantener Privado',
    dsShareDesc: 'Sus regatas aparecen en el Feed de Regatas y contribuyen a análisis de flota. Usted se beneficia de los datos agregados de todos los navegantes de Snipeovation.',
    dsPrivateDesc: 'Sus datos son solo suyos — no visibles en el Feed de Regatas ni usados en análisis de flota. Su coaching usa solo su historial personal.',
    dsOneQuickThing: 'Una cosa rápida primero...',
    dsHowUsed: '¿Cómo le gustaría que se usen sus datos en la comunidad Snipeovation?',
    dsShareChoiceDesc: 'Contribuir al Feed de Regatas y análisis agregados de flota. Me beneficio del conocimiento colectivo de todos los navegantes de Snipeovation.',
    dsPrivateChoiceDesc: 'Mis datos son solo para mi uso. No contribuiré ni recibiré análisis agregados de coaching de flota.',
    dsContinue: 'Continuar',
    dsChangeAnytime: 'Puede cambiar esto en cualquier momento en',
    dsProfileSettings: 'Configuración de Perfil'
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
    select: 'Seleziona',
    dataSharing: 'Condivisione Dati',
    dsChoose: 'Scegli come condividere i dati delle tue regate prima di registrare.',
    dsShareBtn: 'Condividi i miei dati',
    dsPrivateBtn: 'Mantieni Privato',
    dsShareDesc: 'Le tue regate appaiono nel Feed Regate e contribuiscono alle analisi della flotta. Benefici dei dati aggregati di tutti i velisti Snipeovation.',
    dsPrivateDesc: 'I tuoi dati sono solo tuoi — non visibili nel Feed Regate e non usati nelle analisi della flotta. Il tuo coaching usa solo la tua storia personale.',
    dsOneQuickThing: 'Una cosa veloce prima...',
    dsHowUsed: 'Come vorresti che i tuoi dati vengano usati nella comunità Snipeovation?',
    dsShareChoiceDesc: 'Contribuisci al Feed Regate e alle analisi aggregate della flotta. Beneficio della conoscenza collettiva di tutti i velisti Snipeovation.',
    dsPrivateChoiceDesc: 'I miei dati sono solo per il mio uso. Non contribuirò né riceverò analisi aggregate di coaching della flotta.',
    dsContinue: 'Continua',
    dsChangeAnytime: 'Puoi cambiare questo in qualsiasi momento in',
    dsProfileSettings: 'Impostazioni Profilo'
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
    select: 'Selecionar',
    dataSharing: 'Compartilhamento de Dados',
    dsChoose: 'Escolha como seus dados de regata são compartilhados antes de registrar.',
    dsShareBtn: 'Compartilhar meus dados',
    dsPrivateBtn: 'Manter Privado',
    dsShareDesc: 'Suas regatas aparecem no Feed de Regatas e contribuem para análises da frota. Você se beneficia dos dados agregados de todos os velejadores do Snipeovation.',
    dsPrivateDesc: 'Seus dados são somente seus — não visíveis no Feed de Regatas e não usados em análises da frota. Seu coaching usa apenas seu histórico pessoal.',
    dsOneQuickThing: 'Uma coisa rápida primeiro...',
    dsHowUsed: 'Como você gostaria que seus dados fossem usados na comunidade Snipeovation?',
    dsShareChoiceDesc: 'Contribuir para o Feed de Regatas e análises agregadas da frota. Me beneficio do conhecimento coletivo de todos os velejadores do Snipeovation.',
    dsPrivateChoiceDesc: 'Meus dados são apenas para meu uso. Não contribuirei nem receberei análises agregadas de coaching da frota.',
    dsContinue: 'Continuar',
    dsChangeAnytime: 'Você pode mudar isso a qualquer momento em',
    dsProfileSettings: 'Configurações do Perfil'
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

// Diagnostic route — if this 404s in production, the request isn't reaching Express at all.
app.get('/ping', (req, res) => res.send('pong'));

// --- PWA MANIFEST & SERVICE WORKER ---
// IMPORTANT: declared BEFORE express.static so static files can never shadow them.
// Inline strings, no filesystem dependency, no auth middleware in front of them.
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.send(JSON.stringify({
    id: '/',
    name: 'Snipeovation',
    short_name: 'Snipeovation',
    description: 'AI-powered Snipe sailing coach and racing tool',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a1628',
    theme_color: '#0a1628',
    orientation: 'portrait',
    categories: ['sports', 'navigation'],
    prefer_related_applications: false,
    icons: [
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
    ],
    screenshots: [
      { src: '/screenshots/screen1.png', sizes: '1280x720', type: 'image/png', form_factor: 'wide', label: 'Snipeovation desktop view' },
      { src: '/screenshots/screen2.png', sizes: '390x844', type: 'image/png', form_factor: 'narrow', label: 'Snipeovation mobile view' }
    ],
    share_target: {
      action: '/vakaros/share',
      method: 'POST',
      enctype: 'multipart/form-data',
      params: { files: [{ name: 'file', accept: ['text/csv', '.csv', '.vkx', 'text/plain', '.txt'] }] }
    }
  }));
});

// PWA screenshot placeholders — generated on demand with sharp, cached in memory.
var screenshotCache = {};
function makeScreenshotPng(width, height) {
  var sharp = require('sharp');
  var fontSize = Math.round(Math.min(width, height) / 8);
  var subSize = Math.round(fontSize / 3);
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' +
    '<rect width="100%" height="100%" fill="#0a1628"/>' +
    '<text x="50%" y="50%" font-family="Segoe UI,Arial,sans-serif" font-size="' + fontSize + '" font-weight="800" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">Snipeovation</text>' +
    '<text x="50%" y="' + (height / 2 + fontSize) + '" font-family="Segoe UI,Arial,sans-serif" font-size="' + subSize + '" fill="#90caf9" text-anchor="middle">' + width + '×' + height + '</text>' +
    '</svg>';
  return sharp(Buffer.from(svg)).png().toBuffer();
}
function serveScreenshot(width, height, key, res) {
  if (screenshotCache[key]) {
    res.type('png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(screenshotCache[key]);
  }
  makeScreenshotPng(width, height).then(function(buf) {
    screenshotCache[key] = buf;
    res.type('png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buf);
  }).catch(function(err) {
    res.status(500).send('screenshot generation failed: ' + err.message);
  });
}
app.get('/screenshots/screen1.png', (req, res) => serveScreenshot(1280, 720, 'screen1', res));
app.get('/screenshots/screen2.png', (req, res) => serveScreenshot(390, 844, 'screen2', res));

app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.send(`const CACHE='snipeovation-v4';self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));self.addEventListener('fetch',e=>{if(e.request.method==='POST'&&new URL(e.request.url).pathname==='/vakaros/share'){e.respondWith((async()=>{var fd=await e.request.formData();var f=fd.get('file');var nfd=new FormData();if(f)nfd.append('file',f);return fetch('/vakaros/share',{method:'POST',body:nfd,credentials:'same-origin'});})());return;}if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));});`);
});

app.use(express.static(path.join(__dirname, "public")));

// Generate PWA icons dynamically from logo
// PWA icons — generated as REAL PNGs (not JPEGs) at the exact dimensions the
// manifest declares, so PWABuilder's icon-type/size validation passes.
let iconCache192 = null, iconCache512 = null;
function makeIconPng(size) {
  const sharp = require('sharp');
  const fontSize = Math.round(size * 0.62);
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '">' +
    '<rect width="100%" height="100%" fill="#0a1628"/>' +
    '<text x="50%" y="50%" font-family="Segoe UI,Arial,sans-serif" font-size="' + fontSize + '" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="central">S</text>' +
    '</svg>';
  return sharp(Buffer.from(svg)).png().toBuffer();
}
function serveIcon(size, cacheRef, res) {
  const cached = cacheRef === 192 ? iconCache192 : iconCache512;
  if (cached) {
    res.type('png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(cached);
  }
  makeIconPng(size).then(function(buf) {
    if (cacheRef === 192) iconCache192 = buf; else iconCache512 = buf;
    res.type('png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buf);
  }).catch(function(err) {
    res.status(500).send('icon generation failed: ' + err.message);
  });
}
app.get(["/icons/icon-192x192.png", "/icons/icon-192.png", "/icon-192.png"], (req, res) => serveIcon(192, 192, res));
app.get(["/icons/icon-512x512.png", "/icons/icon-512.png", "/icon-512.png"], (req, res) => serveIcon(512, 512, res));

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

// User boats (My Boats on profile)
db.exec(`CREATE TABLE IF NOT EXISTS user_boats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  sail_number TEXT NOT NULL,
  nickname TEXT,
  sort_order INTEGER DEFAULT 0,
  is_default INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, sail_number)
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
try { db.exec("ALTER TABLE users ADD COLUMN data_sharing TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE users ADD COLUMN last_boat_number TEXT"); } catch(e) {}
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
try { db.exec("ALTER TABLE vakaros_uploads ADD COLUMN import_source TEXT DEFAULT 'csv'") } catch(e) {}
try { db.exec("ALTER TABLE vakaros_uploads ADD COLUMN event_id TEXT") } catch(e) {}
try { db.exec("ALTER TABLE vakaros_uploads ADD COLUMN division TEXT") } catch(e) {}

// Vakaros data uploads and coaching reports
db.exec(`CREATE TABLE IF NOT EXISTS vakaros_uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  race_log_id INTEGER REFERENCES race_logs(id),
  filename TEXT,
  row_count INTEGER,
  duration_minutes REAL,
  distance_nm REAL,
  avg_speed REAL,
  max_speed REAL,
  avg_heel REAL,
  avg_vmg REAL,
  tack_count INTEGER,
  gybe_count INTEGER,
  csv_summary TEXT,
  created_at TEXT DEFAULT (datetime('now'))
)`);
db.exec(`CREATE TABLE IF NOT EXISTS vakaros_coaching (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  upload_id INTEGER REFERENCES vakaros_uploads(id),
  race_log_id INTEGER REFERENCES race_logs(id),
  coaching_report TEXT,
  created_at TEXT DEFAULT (datetime('now'))
)`);
db.exec(`CREATE TABLE IF NOT EXISTS coaching_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  report_type TEXT DEFAULT 'full',
  race_count INTEGER,
  has_vakaros INTEGER DEFAULT 0,
  coaching_report TEXT,
  created_at TEXT DEFAULT (datetime('now'))
)`);

db.exec(`CREATE TABLE IF NOT EXISTS vakaros_api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) UNIQUE,
  api_token TEXT,
  created_at TEXT DEFAULT (datetime('now'))
)`);

// Shared reports (Share with Crew)
db.exec(`CREATE TABLE IF NOT EXISTS shared_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  share_type TEXT NOT NULL,
  race_log_id INTEGER,
  coaching_report_id INTEGER,
  snapshot_data TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
)`);

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

// One-time: set data_sharing='share' for users who have race logs but never chose
try {
  const updated = db.prepare("UPDATE users SET data_sharing = 'share' WHERE data_sharing IS NULL AND id IN (SELECT DISTINCT user_id FROM race_logs)").run();
  if (updated.changes > 0) console.log("Auto-shared " + updated.changes + " user(s) with existing race logs");
} catch(e) {}

console.log("Database initialized successfully");

function getUserBoats(userId) {
  return db.prepare("SELECT * FROM user_boats WHERE user_id = ? ORDER BY sort_order ASC, id ASC").all(userId);
}

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

// Landing page at "/". Logged-in users go straight to the race feed.
// Logged-out users see a chooser between Snipe Genius Tool and Crew College
// over a fullscreen looping sailing video.
app.get("/", (req, res) => {
  if (req.session && req.session.user) return res.redirect("/feed");
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0a1628">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Snipeovation">
  <link rel="manifest" href="/manifest.json">
  <link rel="apple-touch-icon" href="/icons/icon-192x192.png">
  <title>Snipeovation — Snipe Sailing Tools</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; width: 100%; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #fff; background: #0a1628; overflow: hidden; }
    .landing-root { position: relative; height: 100vh; width: 100vw; overflow: hidden; }
    .landing-bg-video {
      position: absolute; inset: 0; z-index: 0;
      width: 100%; height: 100%; object-fit: cover;
    }
    .landing-overlay {
      position: absolute; inset: 0; z-index: 1;
      background: linear-gradient(180deg, rgba(10,22,40,0.35) 0%, rgba(10,22,40,0.50) 50%, rgba(10,22,40,0.85) 100%);
    }
    .landing-qr { position: absolute; top: 14px; left: 14px; z-index: 5; display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .landing-qr img { width: 56px; height: 56px; border-radius: 6px; background: white; padding: 3px; box-shadow: 0 2px 8px rgba(0,0,0,0.4); }
    .landing-qr span { font-size: 0.55rem; color: #fff; font-weight: 700; line-height: 1.1; text-align: center; text-shadow: 0 1px 3px rgba(0,0,0,0.7); }
    .landing-content {
      position: absolute; inset: 0; z-index: 2;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 24px 20px; text-align: center;
    }
    .landing-logo-frame {
      width: 100%; max-width: 560px;
      margin-bottom: 56px;
      background: #ffffff;
      border-top: 3px solid #e8ecf2;
      border-left: 3px solid #dde3ec;
      border-right: 4px solid #9aa5b8;
      border-bottom: 5px solid #6b7a92;
      border-radius: 14px;
      padding: 16px 18px;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.9),
        0 12px 32px rgba(0,0,0,0.45),
        0 2px 6px rgba(0,0,0,0.25);
      animation: logoFloat 4s ease-in-out infinite, logoGlow 3s ease-in-out infinite alternate;
    }
    .landing-logo-frame img { width: 100%; height: auto; display: block; border-radius: 8px; }
    @keyframes logoFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-6px); }
    }
    @keyframes logoGlow {
      0% { filter: drop-shadow(0 6px 18px rgba(37,99,235,0.18)) drop-shadow(0 2px 6px rgba(0,0,0,0.12)); }
      100% { filter: drop-shadow(0 12px 30px rgba(37,99,235,0.40)) drop-shadow(0 4px 14px rgba(245,158,11,0.20)) drop-shadow(0 0 36px rgba(37,99,235,0.18)); }
    }
    .landing-buttons { display: flex; gap: 24px; align-items: stretch; justify-content: center; flex-wrap: wrap; }
    .card-btn {
      display: flex; flex-direction: column;
      width: 11rem; min-width: 11rem;
      background: linear-gradient(180deg, #ffffff 0%, #f1f5fb 100%);
      border-top: 1px solid #e2e8f0;
      border-left: 1px solid #e2e8f0;
      border-right: 2px solid #94a3b8;
      border-bottom: 4px solid #64748b;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      text-decoration: none;
      color: #0b3d6e;
      box-shadow: 0 8px 24px rgba(0,0,0,0.35);
      transition: all 0.15s ease;
    }
    .card-btn:hover {
      background: linear-gradient(180deg, #f8fafc 0%, #e6eef8 100%);
      box-shadow: 0 14px 32px rgba(0,0,0,0.45);
      transform: translateY(-2px);
    }
    .card-btn:active {
      border-top: 2px solid #94a3b8;
      border-left: 2px solid #94a3b8;
      border-right: 1px solid #e2e8f0;
      border-bottom: 2px solid #e2e8f0;
      transform: translateY(2px);
    }
    .card-icon-frame {
      height: 6.3rem; margin: 0.4rem; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #0b3d6e 0%, #1565c0 100%);
      box-shadow: inset 0 0 12px rgba(0,0,0,0.25);
      overflow: hidden;
    }
    .card-icon-frame .emoji { font-size: 4rem; line-height: 1; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4)); }
    .card-title {
      flex: 1; display: flex; align-items: center; justify-content: center;
      padding: 12px 10px; text-align: center;
    }
    .card-title h2 {
      font-size: 0.95rem; font-weight: 800; color: #0b3d6e;
      margin: 0; line-height: 1.25; letter-spacing: 0.2px;
    }
    .landing-foot {
      position: absolute; bottom: 14px; left: 0; right: 0; z-index: 3;
      display: flex; gap: 14px; flex-wrap: wrap; justify-content: center;
      font-size: 0.78rem; color: rgba(255,255,255,0.7);
      padding: 0 16px; pointer-events: none;
      text-shadow: 0 1px 3px rgba(0,0,0,0.6);
    }
    .landing-foot a { color: rgba(144,202,249,0.95); text-decoration: none; pointer-events: auto; }
    .landing-foot a:hover { text-decoration: underline; color: #fff; }
    @media (max-width: 640px) {
      .landing-logo-frame { margin-bottom: 36px; padding: 12px 14px; }
      .landing-buttons { gap: 14px; }
      .card-btn { width: 9.2rem; min-width: 9.2rem; }
      .card-icon-frame { height: 5.4rem; }
      .card-icon-frame .emoji { font-size: 3.2rem; }
      .card-title h2 { font-size: 0.85rem; }
      .landing-qr img { width: 44px; height: 44px; }
      .landing-qr span { font-size: 0.5rem; }
    }
    @media (max-height: 640px) {
      .landing-logo-frame { margin-bottom: 24px; }
    }
  </style>
</head>
<body>
  <div class="landing-root">
    <video class="landing-bg-video" autoplay muted loop playsinline poster="/hero.jpg">
      <source src="/videos/snipe-loop.mp4" type="video/mp4">
    </video>
    <div class="landing-overlay"></div>

    <div class="landing-qr">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://snipeovation.com" alt="QR Code — Scan to install Snipeovation on your phone">
      <span>Scan to Install<br>Snipeovation</span>
    </div>

    <div class="landing-content">
      <div class="landing-logo-frame">
        <img src="/logo.jpg" alt="Snipeovation">
      </div>

      <div class="landing-buttons">
        <a class="card-btn" href="/feed">
          <div class="card-icon-frame"><span class="emoji">⛵</span></div>
          <div class="card-title"><h2>Snipe Sailboat<br>Racing Genius Tool</h2></div>
        </a>
        <a class="card-btn" href="https://my-project-tan-seven-56.vercel.app" target="_blank" rel="noopener noreferrer">
          <div class="card-icon-frame"><span class="emoji">🎓</span></div>
          <div class="card-title"><h2>Snipe<br>Crew College<sup style="font-size:0.5rem;">©</sup></h2></div>
        </a>
      </div>
    </div>

    <div class="landing-foot">
      <a href="/feed">Public race feed</a>
      <a href="/login">Log in</a>
      <a href="/register">Sign up</a>
      <a href="/tuning-guides">Tuning guides</a>
      <a href="/racing-rules">Racing rules</a>
    </div>
  </div>
  <script>
    if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(function(){}); }
  </script>
</body>
</html>`);
});

// Public race feed (formerly the homepage). Linked from the landing page and from
// every page's nav bar. Logged-in users land here automatically after visiting /.
app.get("/feed", (req, res) => {
  const logs = db.prepare(`SELECT r.*, u.username FROM race_logs r JOIN users u ON r.user_id = u.id WHERE u.data_sharing = 'share' ORDER BY r.race_date DESC, r.created_at DESC LIMIT 50`).all();
  const lang = getLang(req);
  res.send(renderPage(homePage(logs, req.session.user, lang), req.session.user, lang, true));
});

app.get("/coaching-beta", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0a1628">
  <title>Snipeovation AI Coaching + Vakaros Beta</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a2a3a; line-height: 1.6; background: #f5f7fa; }
    .cb-wrap { max-width: 700px; margin: 0 auto; padding: 32px 20px; }
    .cb-header { text-align: center; margin-bottom: 28px; }
    .cb-header img { height: 64px; border-radius: 10px; margin-bottom: 12px; }
    .cb-header h1 { color: #0b3d6e; font-size: 1.6rem; margin: 0 0 4px; }
    .cb-header .cb-badge { color: #059669; font-weight: 700; font-size: 1.1rem; }
    .cb-intro { background: linear-gradient(135deg,#f0f7ff,#e6f0fa); border: 2px solid #93c5fd; border-radius: 16px; padding: 24px; margin-bottom: 24px; }
    .cb-intro p:first-child { color: #0b3d6e; font-size: 1.05rem; font-weight: 600; margin: 0 0 12px; }
    .cb-intro p:last-child { color: #444; font-size: 0.95rem; line-height: 1.7; margin: 0; }
    h2 { color: #0b3d6e; margin-bottom: 12px; font-size: 1.2rem; }
    .cb-steps { display: flex; flex-direction: column; gap: 14px; margin-bottom: 28px; }
    .cb-step { display: flex; align-items: flex-start; gap: 14px; background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .cb-step-icon { font-size: 1.8rem; flex-shrink: 0; }
    .cb-step p:first-child { font-weight: 700; color: #0b3d6e; margin: 0 0 4px; }
    .cb-step p:last-child { color: #555; font-size: 0.9rem; margin: 0; }
    .cb-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 28px; }
    .cb-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .cb-list li { font-size: 0.93rem; color: #333; }
    .cb-donq { background: #f0fdf4; border: 2px solid #86efac; border-radius: 14px; padding: 20px; margin-bottom: 28px; }
    .cb-donq h2 { color: #059669; font-size: 1.05rem; margin: 0 0 8px; }
    .cb-donq p { color: #444; font-size: 0.93rem; line-height: 1.6; margin: 0; }
    .cb-cta { text-align: center; margin-bottom: 16px; }
    .cb-btn { display: inline-block; background: #0b3d6e; color: white; padding: 14px 36px; border-radius: 8px; font-size: 1.1rem; font-weight: 600; text-decoration: none; margin-bottom: 10px; }
    .cb-btn:hover { background: #0a3058; }
    .cb-login { color: #1a6fb5; font-weight: 600; font-size: 0.95rem; text-decoration: none; }
    .cb-footer { text-align: center; color: #999; font-size: 0.8rem; padding: 16px 0; }
    .cb-footer a { color: #1a6fb5; text-decoration: none; }
    .cb-nav { background: #0b3d6e; padding: 12px 20px; text-align: center; }
    .cb-nav a { color: rgba(255,255,255,0.9); text-decoration: none; font-weight: 600; font-size: 0.9rem; margin: 0 10px; }
    .cb-nav a:hover { color: white; }
  </style>
</head>
<body>
  <div class="cb-nav">
    <a href="/">Home</a>
    <a href="/login">Log In</a>
    <a href="/register">Sign Up</a>
  </div>
  <div class="cb-wrap">
    <div class="cb-header">
      <img src="/logo.jpg" alt="Snipeovation">
      <h1>AI Coaching + Vakaros</h1>
      <p class="cb-badge">Now in Beta</p>
    </div>

    <div class="cb-intro">
      <p>Snipeovation is debuting AI-powered sailing coaching at the Don Q Regatta.</p>
      <p>For the first time, Snipe sailors can get personalized coaching reports generated by Claude AI &mdash; analyzing your race history, practice notes, tuning settings, and Vakaros telemetry data to deliver specific, actionable advice tailored to your sailing.</p>
    </div>

    <h2>How It Works</h2>
    <div class="cb-steps">
      <div class="cb-step">
        <span class="cb-step-icon">&#128203;</span>
        <div>
          <p>Log Your Races</p>
          <p>Use Quick Race Entry to log results in under 10 seconds &mdash; right from the water on your phone.</p>
        </div>
      </div>
      <div class="cb-step">
        <span class="cb-step-icon">&#128225;</span>
        <div>
          <p>Share Your Vakaros Data</p>
          <p>After sailing, open Vakaros Connect &rarr; Sessions &rarr; Export &rarr; Share &rarr; choose Snipeovation. Your speed, heel, VMG, and GPS data flow in automatically.</p>
        </div>
      </div>
      <div class="cb-step">
        <span class="cb-step-icon">&#129302;</span>
        <div>
          <p>Get AI Coaching</p>
          <p>Claude AI analyzes everything &mdash; your results trend, tuning choices, practice notes, and Vakaros telemetry &mdash; and generates a personalized coaching report with Snipe-specific advice.</p>
        </div>
      </div>
    </div>

    <h2>What the Coach Analyzes</h2>
    <div class="cb-card">
      <ul class="cb-list">
        <li>&#9989; <strong>Race results &amp; trends</strong> &mdash; Are you improving? Where do results drop off?</li>
        <li>&#9989; <strong>Tuning patterns</strong> &mdash; Mast rake, shroud tension, sail selection by wind range</li>
        <li>&#9989; <strong>Practice session notes</strong> &mdash; What you've been working on and what's clicking</li>
        <li>&#9989; <strong>Upwind &amp; downwind performance</strong> &mdash; VMG, pointing, speed consistency</li>
        <li>&#9989; <strong>Boat handling</strong> &mdash; Tack/gybe counts, heel angle consistency, starts</li>
        <li>&#128225; <strong>Vakaros telemetry trends</strong> &mdash; Speed, heel, VMG tracked across every session</li>
      </ul>
    </div>

    <div class="cb-donq">
      <h2>&#9973; Debuting at the Don Q Regatta</h2>
      <p>We're launching the AI Coaching + Vakaros beta at the Don Q. Sailors participating can log their races, share Vakaros sessions, and get their first AI coaching report during the regatta. Your feedback will shape how this feature evolves.</p>
    </div>

    <div class="cb-card">
      <h2 style="margin-top:0;">No Vakaros? No Problem.</h2>
      <p style="color:#555;font-size:0.93rem;line-height:1.6;">AI Coaching works with just your race logs and practice notes. Vakaros adds optional telemetry depth &mdash; speed, heel angle, VMG, tack efficiency &mdash; but it's not required. Every Snipe sailor can benefit.</p>
    </div>

    <div class="cb-cta">
      <a href="/register" class="cb-btn">Create Free Account</a>
      <br>
      <a href="/login" class="cb-login">Already have an account? Log in</a>
    </div>

    <div class="cb-footer">
      <p>Snipeovation AI Coaching is powered by Claude AI from Anthropic.</p>
      <p style="margin-top:8px;"><a href="/">Back to Snipeovation</a></p>
    </div>
  </div>
</body>
</html>`);
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
  const justSaved = req.query.saved === '1';
  res.send(renderPage(dashboardPage(logs, req.session.user, lang, justSaved), req.session.user, lang));
});

app.get("/log-race", (req, res) => res.redirect("/log"));

app.get("/log", requireAuth, (req, res) => {
  const userCheck = db.prepare("SELECT wire_size_default, data_sharing, last_boat_number FROM users WHERE id = ?").get(req.session.user.id);
  const lang = getLang(req);
  const userBoats = getUserBoats(req.session.user.id);
  res.send(renderPage(logFormPage(null, null, userCheck.wire_size_default, lang, userCheck.data_sharing, userCheck.last_boat_number, userBoats), req.session.user, lang));
});

app.get("/quick-log", requireAuth, (req, res) => {
  const lang = getLang(req);
  const userCheck = db.prepare("SELECT data_sharing, last_boat_number FROM users WHERE id = ?").get(req.session.user.id);
  if (!userCheck.data_sharing) {
    return res.send(renderPage(dataSharingChoicePage(lang, '/quick-log'), req.session.user, lang));
  }
  const userBoats = getUserBoats(req.session.user.id);
  res.send(renderPage(quickLogPage(null, null, lang, userCheck.last_boat_number, userBoats, userCheck.data_sharing), req.session.user, lang));
});

app.post("/quick-log", requireAuth, (req, res) => {
  const { race_date, race_name, finish_position, fleet_size, notes, entry_mode, session_focus, wind_speed, boat_number } = req.body;
  const lang = getLang(req);
  const isPractice = entry_mode === 'practice';
  const effectiveName = isPractice ? (race_name || 'Practice Session') : race_name;
  if (!race_date || !effectiveName) {
    const dsRow = db.prepare("SELECT data_sharing FROM users WHERE id = ?").get(req.session.user.id);
    return res.send(renderPage(quickLogPage(req.body, "Race date and event name are required.", lang, null, getUserBoats(req.session.user.id), dsRow && dsRow.data_sharing), req.session.user, lang));
  }

  const fullNotes = isPractice
    ? [session_focus ? 'Focus: ' + session_focus : '', wind_speed ? 'Wind: ' + wind_speed : '', notes || ''].filter(Boolean).join('\n')
    : (notes || null);
  if (boat_number) {
    db.prepare("UPDATE users SET last_boat_number = ? WHERE id = ?").run(boat_number, req.session.user.id);
  }
  db.prepare(
    `INSERT INTO race_logs (user_id, race_date, race_name, finish_position, fleet_size, wind_speed, boat_number, notes)
     VALUES (?,?,?,?,?,?,?,?)`
  ).run(req.session.user.id, race_date, effectiveName, isPractice ? null : (finish_position || null), isPractice ? null : (fleet_size || null), isPractice ? (wind_speed || null) : null, boat_number || null, fullNotes);
  res.redirect("/dashboard?saved=1");
});

app.get("/edit/:id", requireAuth, (req, res) => {
  const log = db.prepare("SELECT * FROM race_logs WHERE id = ? AND user_id = ?").get(req.params.id, req.session.user.id);
  if (!log) return res.redirect("/dashboard");
  const userRow2 = db.prepare("SELECT wire_size_default, data_sharing, last_boat_number FROM users WHERE id = ?").get(req.session.user.id);
  const lang = getLang(req);
  const userBoats = getUserBoats(req.session.user.id);
  res.send(renderPage(logFormPage(log, null, userRow2 && userRow2.wire_size_default, lang, userRow2 && userRow2.data_sharing, userRow2 && userRow2.last_boat_number, userBoats), req.session.user, lang));
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
    req.session.user = { id: result.lastInsertRowid, username: username.trim().toLowerCase(), email: email.trim().toLowerCase(), display_name: display_name?.trim() || null, boat_name: boat_name?.trim() || null, snipe_number: snipe_number?.trim() || null, data_sharing: null };
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
  req.session.user = { id: user.id, username: user.username, email: user.email, display_name: user.display_name, boat_name: user.boat_name, snipe_number: user.snipe_number, data_sharing: user.data_sharing || null };
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
  const userBoats = getUserBoats(req.session.user.id);
  res.send(renderPage(profilePage(user, null, userBoats), req.session.user, getLang(req)));
});

app.post("/profile", requireAuth, (req, res) => {
  const { display_name, boat_name, snipe_number } = req.body;
  db.prepare("UPDATE users SET display_name=?, boat_name=?, snipe_number=? WHERE id=?").run(display_name?.trim() || null, boat_name?.trim() || null, snipe_number?.trim() || null, req.session.user.id);
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.session.user.id);
  req.session.user = { id: user.id, username: user.username, email: user.email, display_name: user.display_name, boat_name: user.boat_name, snipe_number: user.snipe_number, data_sharing: user.data_sharing || null };
  const userBoats = getUserBoats(req.session.user.id);
  res.send(renderPage(profilePage(user, "Profile updated!", userBoats), req.session.user, getLang(req)));
});

// --- DATA SHARING PREFERENCE ---
app.post("/data-sharing", requireAuth, (req, res) => {
  const choice = req.body.data_sharing === 'share' ? 'share' : 'private';
  db.prepare("UPDATE users SET data_sharing = ? WHERE id = ?").run(choice, req.session.user.id);
  req.session.user.data_sharing = choice;

  // JSON response for inline saves from log form
  if (req.headers['accept'] === 'application/json' || req.headers['content-type'] === 'application/json') {
    return res.json({ ok: true, choice });
  }

  // Redirect to the page they were trying to access, or profile
  const next = req.body.next;
  if (next && (next === '/log' || next === '/quick-log')) {
    return res.redirect(next);
  }
  res.redirect("/profile?updated=1");
});

// --- RACE LOG ROUTES ---

app.post("/log", requireAuth, (req, res) => {
  const { race_date, race_name, location, wind_speed, wind_direction, sea_state, temperature, current_tide, finish_position, fleet_size, performance_rating, boat_number, crew_name, skipper_weight, crew_weight, main_maker, jib_maker, jib_used, mainsail_used, main_condition, jib_condition, mast_rake, shroud_tension, shroud_turns, wire_size, wire_size_save_default, jib_lead, jib_cloth_tension, jib_height, jib_outboard_lead, cunningham, outhaul, vang, spreader_length, spreader_sweep, centerboard_position, traveler_position, augie_equalizer, mast_wiggle, water_type, sail_settings_notes, notes } = req.body;
  if (!race_date || !race_name) {
    const dsRow = db.prepare("SELECT data_sharing, last_boat_number FROM users WHERE id = ?").get(req.session.user.id);
    return res.send(renderPage(logFormPage(req.body, "Race date and name are required.", null, getLang(req), dsRow && dsRow.data_sharing, dsRow && dsRow.last_boat_number, getUserBoats(req.session.user.id)), req.session.user, getLang(req)));
  }

  // Save wire size as user default if checkbox checked
  if (wire_size_save_default && wire_size) {
    db.prepare("UPDATE users SET wire_size_default = ? WHERE id = ?").run(wire_size, req.session.user.id);
  }

  // Save last boat number to user profile
  if (boat_number) {
    db.prepare("UPDATE users SET last_boat_number = ? WHERE id = ?").run(boat_number, req.session.user.id);
  }

  db.prepare(
    `INSERT INTO race_logs (user_id, race_date, race_name, location, wind_speed, wind_direction, sea_state, temperature, current_tide, finish_position, fleet_size, performance_rating, boat_number, crew_name, skipper_weight, crew_weight, main_maker, jib_maker, jib_used, mainsail_used, main_condition, jib_condition, mast_rake, shroud_tension, shroud_turns, wire_size, jib_lead, jib_cloth_tension, jib_height, jib_outboard_lead, cunningham, outhaul, vang, spreader_length, spreader_sweep, centerboard_position, traveler_position, augie_equalizer, mast_wiggle, water_type, sail_settings_notes, notes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(req.session.user.id, race_date, race_name, location, wind_speed, wind_direction, sea_state, temperature, current_tide, finish_position, fleet_size, performance_rating, boat_number, crew_name, skipper_weight, crew_weight, main_maker, jib_maker, jib_used, mainsail_used, main_condition, jib_condition, mast_rake, shroud_tension, shroud_turns, wire_size, jib_lead, jib_cloth_tension, jib_height, jib_outboard_lead, cunningham, outhaul, vang, spreader_length, spreader_sweep, centerboard_position, traveler_position, augie_equalizer, mast_wiggle, water_type, sail_settings_notes, notes);
  res.redirect("/dashboard?saved=1");
});

app.post("/edit/:id", requireAuth, (req, res) => {
  const { race_date, race_name, location, wind_speed, wind_direction, sea_state, temperature, current_tide, finish_position, fleet_size, performance_rating, boat_number, crew_name, skipper_weight, crew_weight, main_maker, jib_maker, jib_used, mainsail_used, main_condition, jib_condition, mast_rake, shroud_tension, shroud_turns, wire_size, wire_size_save_default, jib_lead, jib_cloth_tension, jib_height, jib_outboard_lead, cunningham, outhaul, vang, spreader_length, spreader_sweep, centerboard_position, traveler_position, augie_equalizer, mast_wiggle, water_type, sail_settings_notes, notes } = req.body;
  if (wire_size_save_default && wire_size) {
    db.prepare("UPDATE users SET wire_size_default = ? WHERE id = ?").run(wire_size, req.session.user.id);
  }
  if (boat_number) {
    db.prepare("UPDATE users SET last_boat_number = ? WHERE id = ?").run(boat_number, req.session.user.id);
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
        if (micBtn.classList.contains('listening')) {
          if (micBtn._rec) { micBtn._rec.stop(); }
          return;
        }
        const rec = new SR();
        rec.lang = 'en-US';
        rec.interimResults = false;
        rec.continuous = false;
        micBtn.style.cssText = 'position:absolute;right:6px;top:50%;transform:translateY(-50%);background:#e53e3e;color:#fff;border:none;cursor:pointer;border-radius:12px;padding:3px 8px;font-size:0.75rem;white-space:nowrap;line-height:1.4;';
        micBtn.innerHTML = '⏹ Stop';
        micBtn.style.cssText = 'position:absolute;right:6px;top:50%;transform:translateY(-50%);background:#e53e3e;color:#fff;border:none;cursor:pointer;border-radius:12px;padding:3px 8px;font-size:0.75rem;white-space:nowrap;line-height:1.4;';
        micBtn.innerHTML = '⏹ Stop';
        micBtn.classList.add('listening');
        rec.onresult = function(e) {
          const text = e.results[0][0].transcript;
          input.value = text;
          search(text);
          micBtn.classList.remove('listening');
          micBtn.style.cssText = '';
          micBtn.innerHTML = '🎤';
          micBtn._rec = null;
        };
        rec.onerror = function() { micBtn.classList.remove('listening'); micBtn.style.cssText = ''; micBtn.innerHTML = '🎤'; micBtn._rec = null; };
        rec.onend = function() { micBtn.classList.remove('listening'); micBtn.style.cssText = ''; micBtn.innerHTML = '🎤'; micBtn._rec = null; };
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
        if (ruleNumMic.classList.contains('listening')) {
          if (ruleNumMic._rec) { ruleNumMic._rec.stop(); }
          return;
        }
        const rec = new SR();
        rec.lang = 'en-US';
        rec.interimResults = false;
        rec.continuous = false;
        ruleNumMic.style.cssText = 'position:absolute;right:6px;top:50%;transform:translateY(-50%);background:#e53e3e;color:#fff;border:none;cursor:pointer;border-radius:12px;padding:3px 8px;font-size:0.75rem;white-space:nowrap;line-height:1.4;';
        ruleNumMic.innerHTML = '⏹ Stop';
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
          ruleNumMic.classList.remove('listening'); ruleNumMic.style.cssText = ''; ruleNumMic.innerHTML = '🎤'; ruleNumMic._rec = null;
        };
        rec.onerror = function() { ruleNumMic.classList.remove('listening'); ruleNumMic.style.cssText = ''; ruleNumMic.innerHTML = '🎤'; ruleNumMic._rec = null; };
        rec.onend = function() { ruleNumMic.classList.remove('listening'); ruleNumMic.style.cssText = ''; ruleNumMic.innerHTML = '🎤'; ruleNumMic._rec = null; };
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
        if (micBtn.classList.contains('listening')) {
          if (micBtn._rec) { micBtn._rec.stop(); }
          return;
        }
        const rec = new SR();
        rec.lang = 'en-US';
        rec.interimResults = false;
        rec.continuous = false;
        micBtn.style.cssText = 'position:absolute;right:6px;top:50%;transform:translateY(-50%);background:#e53e3e;color:#fff;border:none;cursor:pointer;border-radius:12px;padding:3px 8px;font-size:0.75rem;white-space:nowrap;line-height:1.4;';
        micBtn.innerHTML = '⏹ Stop';
        micBtn.classList.add('listening');
        rec.onresult = function(e) {
          const text = e.results[0][0].transcript;
          input.value = text;
          search(text);
          micBtn.classList.remove('listening');
          micBtn.style.cssText = '';
          micBtn.innerHTML = '🎤';
          micBtn._rec = null;
        };
        rec.onerror = function() { micBtn.classList.remove('listening'); micBtn.style.cssText = ''; micBtn.innerHTML = '🎤'; micBtn._rec = null; };
        rec.onend = function() { micBtn.classList.remove('listening'); micBtn.style.cssText = ''; micBtn.innerHTML = '🎤'; micBtn._rec = null; };
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
            <option value="pl">PL Sails (Pires de Lima, Portugal)</option>
            <option value="vb">VB Voiles (France)</option>
            <option value="wb">WB Sails (Finland)</option>
            <option value="ullman">Ullman Sails</option>
            <option value="custom">Other / Custom…</option>
          </select>
        </div>
        <div class="form-group">
          <label>Mainsail Model</label>
          <select id="mg-main-model" style="padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
          </select>
          <input id="mg-main-maker-custom" type="text" placeholder="Sailmaker name (custom)" style="display:none;margin-top:6px;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
          <input id="mg-main-model-custom" type="text" placeholder="Mainsail model (custom)" style="display:none;margin-top:6px;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
        </div>
        <div class="form-group">
          <label>Jib Maker</label>
          <select id="mg-jib-maker" style="padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
            <option value="quantum">Quantum</option>
            <option value="north">North</option>
            <option value="olimpic">Olimpic</option>
            <option value="pl">PL Sails (Pires de Lima, Portugal)</option>
            <option value="vb">VB Voiles (France)</option>
            <option value="wb">WB Sails (Finland)</option>
            <option value="ullman">Ullman Sails</option>
            <option value="custom">Other / Custom…</option>
          </select>
        </div>
        <div class="form-group">
          <label>Jib Model</label>
          <select id="mg-jib-model" style="padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
          </select>
          <input id="mg-jib-maker-custom" type="text" placeholder="Jib sailmaker name (custom)" style="display:none;margin-top:6px;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
          <input id="mg-jib-model-custom" type="text" placeholder="Jib model (custom)" style="display:none;margin-top:6px;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;width:100%;">
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
    var mgMainModels = {
      quantum: ['C-5', 'X-2', 'XFB'],
      north: ['SW-4', 'PR-3', 'CB-2'],
      olimpic: ['CRC', 'XPM', 'CM1', 'CM5', 'GTM', 'GTM-F'],
      pl: ['PL Radial', 'PL Cross-cut', 'PL Light Air Special'],
      vb: ['VB Radial', 'VB Heavy Air', 'VB Light Air'],
      wb: ['WB Standard Main'],
      ullman: ['Ullman Standard Main'],
      custom: ['(enter model below)']
    };
    var mgJibModels = {
      quantum: ['RSJ-14', 'RSJ-8'],
      north: ['R3-LM', 'Cross-Cut Jib'],
      olimpic: ['XPJ', 'AR2-F', 'GTJ'],
      pl: ['PL Radial Jib', 'PL Cross-cut Jib'],
      vb: ['VB Radial Jib', 'VB All-Purpose Jib'],
      wb: ['WB Standard Jib'],
      ullman: ['Ullman Standard Jib'],
      custom: ['(enter model below)']
    };
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
    function toggleCustomInputs(makerSel, makerCustom, modelCustom) {
      var isCustom = makerSel.value === 'custom';
      if (makerCustom) makerCustom.style.display = isCustom ? '' : 'none';
      if (modelCustom) modelCustom.style.display = isCustom ? '' : 'none';
    }
    var mgMMC = document.getElementById('mg-main-maker-custom');
    var mgMModC = document.getElementById('mg-main-model-custom');
    var mgJMC = document.getElementById('mg-jib-maker-custom');
    var mgJModC = document.getElementById('mg-jib-model-custom');
    if (mgMM && mgMMod) {
      populateMgModels(mgMM, mgMMod, mgMainModels);
      toggleCustomInputs(mgMM, mgMMC, mgMModC);
      mgMM.addEventListener('change', function() {
        populateMgModels(mgMM, mgMMod, mgMainModels);
        toggleCustomInputs(mgMM, mgMMC, mgMModC);
      });
    }
    if (mgJM && mgJMod) {
      populateMgModels(mgJM, mgJMod, mgJibModels);
      toggleCustomInputs(mgJM, mgJMC, mgJModC);
      mgJM.addEventListener('change', function() {
        populateMgModels(mgJM, mgJMod, mgJibModels);
        toggleCustomInputs(mgJM, mgJMC, mgJModC);
      });
    }

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
      },
      // ⚠️ PL Sails: NO published official tuning guide. Numbers below are derived
      // from sail-design characteristics + European fleet feedback, NOT from the sailmaker.
      // Always cross-check with Velas Pires de Lima before racing.
      pl: {
        light: {
          mast_rake: '6.57-6.60 m tape to transom — fuller entry, allow more forestay sag',
          shroud_tension: '14-16 (Loos PT-1 Black)',
          shroud_turns: 'Base Sta-Master position',
          spreader_length: '16.5"-16.9" (42-43 cm) — PL has no published number; use class baseline',
          spreader_sweep: '28.7"-29.1" (73-74 cm) tip-to-tip',
          jib_lead: useInches ? '87"-88" from tack — forward, fuller entry' : '221-224 cm from tack — forward, fuller entry',
          jib_cloth_tension: 'Eased — radial dacron holds shape; ease halyard slightly for power',
          jib_height: useInches ? '3"-3.5" deck to tack' : '7.6-9 cm deck to tack',
          jib_outboard_lead: 'Inboard — crew forward to leeward',
          cunningham: 'Off',
          outhaul: 'Eased 2-3 cm from black band',
          vang: 'Slack',
          centerboard_position: '1 cm fwd (mast pusher) — fuller design wants prebend',
          traveler_position: 'To windward — boom on or above centerline',
          augie_equalizer: 'Pull windward AE to center boom for light-air twist',
          mast_wiggle: '⚠️ Unofficial settings — no PL published tuning guide. Contact Velas Pires de Lima (facebook.com/PLSails). Profile: medium-full depth, medium-full entry, medium top, radial dacron.'
        },
        medium: {
          mast_rake: '6.55-6.57 m tape to transom — transition to neutral mast',
          shroud_tension: '17-19 (Loos PT-1 Black)',
          shroud_turns: '~1 turn up on Sta-Master',
          spreader_length: '16.5"-16.9" (42-43 cm)',
          spreader_sweep: '29.1" (74 cm) tip-to-tip',
          jib_lead: useInches ? '88"-90" from tack' : '224-229 cm from tack',
          jib_cloth_tension: 'Smooth — radial holds shape well',
          jib_height: useInches ? '3.5"-4.5" deck to tack' : '9-11.5 cm deck to tack',
          jib_outboard_lead: 'Mid — jib ~1" from spreader tip',
          cunningham: 'Light',
          outhaul: 'At black band',
          vang: 'Light — check prebend 0–1/4"',
          centerboard_position: 'Neutral (mast pusher)',
          traveler_position: '3-4" / 8-10 cm below centerline',
          augie_equalizer: 'Released',
          mast_wiggle: '⚠️ Unofficial settings — derived from sail-design profile (medium-full depth, radial dacron). No published PL tuning guide; contact Velas Pires de Lima.'
        },
        heavy: {
          mast_rake: '6.44-6.55 m tape to transom — depower aggressively (12-18 kts: 6.51-6.55; 18-24: 6.48-6.52; 24+: 6.44-6.49)',
          shroud_tension: '20-26 (Loos PT-1 Black) — 12-18: 20-22; 18-24: 22-24; 24+: 24-26',
          shroud_turns: '2 turns up on Sta-Master',
          spreader_length: '16.5"-16.9" (42-43 cm)',
          spreader_sweep: '29.1"-29.9" (74-76 cm) tip-to-tip — widen progressively as wind builds',
          jib_lead: useInches ? '90"-93" from tack — aft, opens leech' : '229-236 cm from tack — aft, opens leech',
          jib_cloth_tension: 'Tight — max halyard',
          jib_height: useInches ? '4.5"-5" deck to tack' : '11.5-12.7 cm deck to tack',
          jib_outboard_lead: 'Outboard — opens slot',
          cunningham: 'Max',
          outhaul: 'Max — moderate luff curve, match mast bend',
          vang: 'Firm to max — robust cloth handles heavy weather',
          centerboard_position: 'Neutral to slightly aft mast pusher; ram aft to lock mast at 18+ kts (locked aft at 24+)',
          traveler_position: '5-7" / 13-18 cm below centerline — vang sheet 15+ kts',
          augie_equalizer: 'Fully released',
          mast_wiggle: '⚠️ Unofficial — no PL published guide. Fuller design needs more depower. Secondary spreader pins required at 24+ kts. Contact Velas Pires de Lima for mast-specific settings.'
        }
      },
      // ⚠️ VB Sails: NO published official tuning guide. Numbers below are derived
      // from sail-design characteristics + European Snipe fleet reports.
      vb: {
        light: {
          mast_rake: '6.57-6.59 m tape to transom — slightly less sag than fuller sails',
          shroud_tension: '15-17 (Loos PT-1 Black)',
          shroud_turns: 'Base Sta-Master position',
          spreader_length: '16.5"-16.9" (42-43 cm) — VB has no published number; class baseline',
          spreader_sweep: '28.7"-29.1" (73-74 cm) tip-to-tip',
          jib_lead: useInches ? '87"-88" from tack' : '221-224 cm from tack',
          jib_cloth_tension: 'Eased slightly — light-air speed is a VB strength',
          jib_height: useInches ? '3"-3.5" deck to tack' : '7.6-9 cm deck to tack',
          jib_outboard_lead: 'Inboard',
          cunningham: 'Off',
          outhaul: 'Eased — medium profile',
          vang: 'Slack',
          centerboard_position: '1 cm fwd (mast pusher) — mast forward of partners',
          traveler_position: 'To windward',
          augie_equalizer: 'Pull windward AE to center boom',
          mast_wiggle: '⚠️ Unofficial settings — no VB published tuning guide. Contact VB Voiles (Jean Jacques Frebault, France). Profile: medium depth, medium-fine entry, medium-full top, radial dacron.'
        },
        medium: {
          mast_rake: '6.55-6.57 m tape to transom — clean transition to neutral',
          shroud_tension: '18-20 (Loos PT-1 Black)',
          shroud_turns: '~1 turn up on Sta-Master',
          spreader_length: '16.5"-16.9" (42-43 cm)',
          spreader_sweep: '29.1" (74 cm) tip-to-tip',
          jib_lead: useInches ? '88"-90" from tack — inboard for pointing in chop' : '224-229 cm from tack — inboard for pointing in chop',
          jib_cloth_tension: 'Smooth — medium profile holds well',
          jib_height: useInches ? '3.5"-4.5" deck to tack' : '9-11.5 cm deck to tack',
          jib_outboard_lead: 'Mid — jib ~1" from spreader tip',
          cunningham: 'Light',
          outhaul: 'Firm, near max',
          vang: 'Light — controls leech and lower mast bend',
          centerboard_position: 'Neutral (mast pusher)',
          traveler_position: '3-4" / 8-10 cm below centerline',
          augie_equalizer: 'Released',
          mast_wiggle: '⚠️ Unofficial settings — derived from VB sail-design profile. No published guide; contact VB Voiles.'
        },
        heavy: {
          mast_rake: '6.43-6.54 m tape to transom — 12-18: 6.51-6.54; 18-24: 6.47-6.51; 24+: 6.43-6.48',
          shroud_tension: '20-27 (Loos PT-1 Black) — 12-18: 20-23; 18-24: 22-25; 24+: 24-27',
          shroud_turns: '2 turns up on Sta-Master',
          spreader_length: '16.5"-16.9" (42-43 cm)',
          spreader_sweep: '29.1"-29.9" (74-76 cm) tip-to-tip — jib 2-3 cm from spreader tip',
          jib_lead: useInches ? '90"-93" from tack — aft, opens leech' : '229-236 cm from tack — aft, opens leech',
          jib_cloth_tension: 'Max halyard; ease jib 2-4 cm in survival squalls',
          jib_height: useInches ? '4.5"-5" deck to tack' : '11.5-12.7 cm deck to tack',
          jib_outboard_lead: 'Outboard',
          cunningham: 'Max',
          outhaul: 'Max — medium-top design flattens well',
          vang: 'Heavy — but in chop ease slightly for twist through waves; do not over-vang (inversion risk)',
          centerboard_position: 'Neutral to slightly aft mast pusher; ram fully aft (locked at 24+)',
          traveler_position: '5-7" / 13-18 cm below centerline — crew weight max outboard',
          augie_equalizer: 'Fully released',
          mast_wiggle: '⚠️ Unofficial — no VB published guide. Secondary spreader pins essential at 24+ kts. Contact VB Voiles.'
        }
      },
      // WB Sails (Finland) — no published Snipe tuning guide. Use class baseline (mirrors Quantum medium-rake setup).
      wb: {
        light: {
          mast_rake: '21\\'6"-21\\'7" (6.55-6.58m) — class baseline; WB has no published guide',
          shroud_tension: '21 (Loos PT-1 Black)',
          shroud_turns: 'Base Sta-Master position',
          spreader_length: '16.75"-16.875" (42.5-43 cm)',
          spreader_sweep: '29"-29.5" (73.5-75 cm) tip-to-tip',
          jib_lead: useInches ? '87"-88" from tack' : '221-224 cm from tack',
          jib_cloth_tension: 'Light wrinkles along luff',
          jib_height: useInches ? '3"-3.5" deck to tack' : '7.6-9 cm deck to tack',
          jib_outboard_lead: 'Inboard',
          cunningham: 'Off',
          outhaul: 'Eased 1-2"',
          vang: 'Slack',
          centerboard_position: 'Fwd 1/4"-1/2" mast pusher',
          traveler_position: 'To windward',
          augie_equalizer: 'Pull windward AE to center boom',
          mast_wiggle: '⚠️ WB Sails has no published Snipe tuning guide. Settings shown are general class baseline (Quantum-equivalent). Contact WB Sails (Finland) for sail-specific recommendations.'
        },
        medium: {
          mast_rake: '21\\'4"-21\\'5.5" (6.50-6.54m) — class baseline',
          shroud_tension: '23-25 (Loos PT-1 Black)',
          shroud_turns: '1 turn up on Sta-Master',
          spreader_length: '16.75"-16.875" (42.5-43 cm)',
          spreader_sweep: '29.5"-30" (75-76 cm) tip-to-tip',
          jib_lead: useInches ? '88"-90" from tack' : '224-229 cm from tack',
          jib_cloth_tension: 'Smooth',
          jib_height: useInches ? '3.5"-4.5" deck to tack' : '9-11.5 cm deck to tack',
          jib_outboard_lead: 'Mid',
          cunningham: 'Light',
          outhaul: 'At black band',
          vang: 'Light',
          centerboard_position: 'Neutral mast pusher',
          traveler_position: '3-4" / 8-10 cm below centerline',
          augie_equalizer: 'Released',
          mast_wiggle: '⚠️ Class baseline shown — WB Sails has no published Snipe tuning guide. Contact WB Sails for sail-specific recommendations.'
        },
        heavy: {
          mast_rake: '21\\'1"-21\\'4" (6.42-6.50m) — class baseline',
          shroud_tension: '25-28 (Loos PT-1 Black)',
          shroud_turns: '2 turns up on Sta-Master',
          spreader_length: '16.75"-16.875" (42.5-43 cm)',
          spreader_sweep: '30"-31.5" (76-80 cm) tip-to-tip',
          jib_lead: useInches ? '90"-93" from tack' : '229-236 cm from tack',
          jib_cloth_tension: 'Max halyard',
          jib_height: useInches ? '4.5"-5" deck to tack' : '11.5-12.7 cm deck to tack',
          jib_outboard_lead: 'Outboard',
          cunningham: 'Max',
          outhaul: 'Max',
          vang: 'Heavy — vang-sheet in gusts',
          centerboard_position: 'Aft 3/8"-5/8" mast pusher',
          traveler_position: '5-7" / 13-18 cm below centerline',
          augie_equalizer: 'Fully released',
          mast_wiggle: '⚠️ Class baseline — WB Sails has no published Snipe tuning guide. Contact WB Sails directly for heavy-air settings.'
        }
      },
      // Ullman Sails — no published Snipe tuning guide. Class baseline.
      ullman: {
        light: {
          mast_rake: '21\\'6"-21\\'7" (6.55-6.58m) — class baseline; Ullman has no published Snipe guide',
          shroud_tension: '21 (Loos PT-1 Black)',
          shroud_turns: 'Base Sta-Master position',
          spreader_length: '16.75"-16.875" (42.5-43 cm)',
          spreader_sweep: '29"-29.5" (73.5-75 cm) tip-to-tip',
          jib_lead: useInches ? '87"-88" from tack' : '221-224 cm from tack',
          jib_cloth_tension: 'Light wrinkles along luff',
          jib_height: useInches ? '3"-3.5" deck to tack' : '7.6-9 cm deck to tack',
          jib_outboard_lead: 'Inboard',
          cunningham: 'Off',
          outhaul: 'Eased 1-2"',
          vang: 'Slack',
          centerboard_position: 'Fwd 1/4"-1/2" mast pusher',
          traveler_position: 'To windward',
          augie_equalizer: 'Pull windward AE to center boom',
          mast_wiggle: '⚠️ Ullman Sails has no published Snipe tuning guide. Settings shown are general class baseline. Contact Ullman Sails for sail-specific recommendations.'
        },
        medium: {
          mast_rake: '21\\'4"-21\\'5.5" (6.50-6.54m) — class baseline',
          shroud_tension: '23-25 (Loos PT-1 Black)',
          shroud_turns: '1 turn up on Sta-Master',
          spreader_length: '16.75"-16.875" (42.5-43 cm)',
          spreader_sweep: '29.5"-30" (75-76 cm) tip-to-tip',
          jib_lead: useInches ? '88"-90" from tack' : '224-229 cm from tack',
          jib_cloth_tension: 'Smooth',
          jib_height: useInches ? '3.5"-4.5" deck to tack' : '9-11.5 cm deck to tack',
          jib_outboard_lead: 'Mid',
          cunningham: 'Light',
          outhaul: 'At black band',
          vang: 'Light',
          centerboard_position: 'Neutral mast pusher',
          traveler_position: '3-4" / 8-10 cm below centerline',
          augie_equalizer: 'Released',
          mast_wiggle: '⚠️ Class baseline — Ullman Sails has no published Snipe tuning guide. Contact Ullman directly.'
        },
        heavy: {
          mast_rake: '21\\'1"-21\\'4" (6.42-6.50m) — class baseline',
          shroud_tension: '25-28 (Loos PT-1 Black)',
          shroud_turns: '2 turns up on Sta-Master',
          spreader_length: '16.75"-16.875" (42.5-43 cm)',
          spreader_sweep: '30"-31.5" (76-80 cm) tip-to-tip',
          jib_lead: useInches ? '90"-93" from tack' : '229-236 cm from tack',
          jib_cloth_tension: 'Max halyard',
          jib_height: useInches ? '4.5"-5" deck to tack' : '11.5-12.7 cm deck to tack',
          jib_outboard_lead: 'Outboard',
          cunningham: 'Max',
          outhaul: 'Max',
          vang: 'Heavy — vang-sheet in gusts',
          centerboard_position: 'Aft 3/8"-5/8" mast pusher',
          traveler_position: '5-7" / 13-18 cm below centerline',
          augie_equalizer: 'Fully released',
          mast_wiggle: '⚠️ Class baseline — Ullman Sails has no published Snipe tuning guide. Contact Ullman directly.'
        }
      },
      // Custom / Other — generic Snipe baseline. User entered their own sailmaker name.
      custom: {
        light: {
          mast_rake: '21\\'6"-21\\'7" (6.55-6.58m) — generic Snipe baseline',
          shroud_tension: '21 (Loos PT-1 Black)',
          shroud_turns: 'Base Sta-Master position',
          spreader_length: '16.75" (42.5 cm)',
          spreader_sweep: '29"-29.5" (73.5-75 cm) tip-to-tip',
          jib_lead: useInches ? '87"-88" from tack' : '221-224 cm from tack',
          jib_cloth_tension: 'Light wrinkles along luff',
          jib_height: useInches ? '3"-3.5" deck to tack' : '7.6-9 cm deck to tack',
          jib_outboard_lead: 'Inboard',
          cunningham: 'Off',
          outhaul: 'Eased 1-2"',
          vang: 'Slack',
          centerboard_position: 'Fwd 1/4"-1/2" mast pusher',
          traveler_position: 'To windward',
          augie_equalizer: 'Pull windward AE to center boom',
          mast_wiggle: '⚠️ Generic Snipe baseline — your sailmaker is not in our database. Contact your sailmaker directly for sail-specific tuning recommendations.'
        },
        medium: {
          mast_rake: '21\\'4"-21\\'5.5" (6.50-6.54m) — generic baseline',
          shroud_tension: '23-25 (Loos PT-1 Black)',
          shroud_turns: '1 turn up on Sta-Master',
          spreader_length: '16.75" (42.5 cm)',
          spreader_sweep: '29.5"-30" (75-76 cm) tip-to-tip',
          jib_lead: useInches ? '88"-90" from tack' : '224-229 cm from tack',
          jib_cloth_tension: 'Smooth',
          jib_height: useInches ? '3.5"-4.5" deck to tack' : '9-11.5 cm deck to tack',
          jib_outboard_lead: 'Mid',
          cunningham: 'Light',
          outhaul: 'At black band',
          vang: 'Light',
          centerboard_position: 'Neutral mast pusher',
          traveler_position: '3-4" / 8-10 cm below centerline',
          augie_equalizer: 'Released',
          mast_wiggle: '⚠️ Generic Snipe baseline — contact your sailmaker directly for sail-specific recommendations.'
        },
        heavy: {
          mast_rake: '21\\'1"-21\\'4" (6.42-6.50m) — generic baseline',
          shroud_tension: '25-28 (Loos PT-1 Black)',
          shroud_turns: '2 turns up on Sta-Master',
          spreader_length: '16.75" (42.5 cm)',
          spreader_sweep: '30"-31.5" (76-80 cm) tip-to-tip',
          jib_lead: useInches ? '90"-93" from tack' : '229-236 cm from tack',
          jib_cloth_tension: 'Max halyard',
          jib_height: useInches ? '4.5"-5" deck to tack' : '11.5-12.7 cm deck to tack',
          jib_outboard_lead: 'Outboard',
          cunningham: 'Max',
          outhaul: 'Max',
          vang: 'Heavy — vang-sheet in gusts',
          centerboard_position: 'Aft 3/8"-5/8" mast pusher',
          traveler_position: '5-7" / 13-18 cm below centerline',
          augie_equalizer: 'Fully released',
          mast_wiggle: '⚠️ Generic baseline — contact your sailmaker directly for heavy-air recommendations.'
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
      const makerLabels = {
        quantum: 'Quantum', north: 'North', olimpic: 'Olimpic',
        pl: 'PL Sails (Pires de Lima)', vb: 'VB Voiles',
        wb: 'WB Sails', ullman: 'Ullman Sails', custom: 'Custom'
      };
      const customMainMaker = (document.getElementById('mg-main-maker-custom') || {}).value || '';
      const customMainModel = (document.getElementById('mg-main-model-custom') || {}).value || '';
      const customJibMaker = (document.getElementById('mg-jib-maker-custom') || {}).value || '';
      const customJibModel = (document.getElementById('mg-jib-model-custom') || {}).value || '';
      const jibMakerName = jibMakerVal === 'custom' && customJibMaker ? customJibMaker : (makerLabels[jibMakerVal] || 'Quantum');
      const makerName = maker === 'custom' && customMainMaker ? customMainMaker : (makerLabels[maker] || 'Quantum');
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
    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);

    // Fetch wind forecast from NOAA NWS api.weather.gov (US locations).
    // This is the same API used for the 7-day forecast — confirmed reachable
    // from Railway. Convert NWS hourly periods into the Open-Meteo response
    // shape that the existing renderWind() frontend expects.
    let windData = null;
    const compassToDegMap = { N:0,NNE:22.5,NE:45,ENE:67.5,E:90,ESE:112.5,SE:135,SSE:157.5,S:180,SSW:202.5,SW:225,WSW:247.5,W:270,WNW:292.5,NW:315,NNW:337.5 };
    try {
      const pointsResp = await fetch(`https://api.weather.gov/points/${userLat.toFixed(4)},${userLon.toFixed(4)}`, {
        signal: AbortSignal.timeout(10000),
        headers: { 'User-Agent': 'Snipeovation/1.0 (snipeovation.com)', 'Accept': 'application/geo+json' }
      });
      console.log('/api/forecast NWS points status:', pointsResp.status);
      const pointsJson = await pointsResp.json();
      const hourlyUrl = pointsJson && pointsJson.properties && pointsJson.properties.forecastHourly;
      if (hourlyUrl) {
        const hourlyResp = await fetch(hourlyUrl, {
          signal: AbortSignal.timeout(10000),
          headers: { 'User-Agent': 'Snipeovation/1.0 (snipeovation.com)', 'Accept': 'application/geo+json' }
        });
        console.log('/api/forecast NWS hourly status:', hourlyResp.status);
        const hourlyJson = await hourlyResp.json();
        const periods = (hourlyJson && hourlyJson.properties && hourlyJson.properties.periods) || [];
        if (periods.length) {
          const next24 = periods.slice(0, 24);
          const time = next24.map(p => p.startTime);
          const speeds = next24.map(p => {
            const mph = parseFloat((p.windSpeed || '').split(' ')[0]) || 0;
            return Math.round(mph * 0.868976 * 10) / 10; // mph -> knots
          });
          const dirs = next24.map(p => compassToDegMap[p.windDirection] !== undefined ? compassToDegMap[p.windDirection] : 0);
          // NWS hourly doesn't expose gusts; use a 1.3x estimate so the chart still shows the gust line
          const gusts = speeds.map(s => Math.round(s * 1.3 * 10) / 10);
          windData = {
            hourly: {
              time: time,
              wind_speed_10m: speeds,
              wind_direction_10m: dirs,
              wind_gusts_10m: gusts
            }
          };
        }
      } else {
        console.error('/api/forecast NWS points: no forecastHourly URL (non-US location?)');
      }
    } catch(we) {
      console.error('/api/forecast NWS wind fetch failed:', we.message);
    }

    // Fallback to Open-Meteo if NWS didn't work (e.g. non-US location)
    if (!windData) {
      try {
        const windUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m&forecast_hours=24&wind_speed_unit=kn`;
        const windResp = await fetch(windUrl, { signal: AbortSignal.timeout(10000) });
        const windText = await windResp.text();
        try { windData = JSON.parse(windText); }
        catch(pe) { console.error('/api/forecast Open-Meteo fallback parse failed:', windText.slice(0, 200)); }
      } catch(we) {
        console.error('/api/forecast Open-Meteo fallback fetch failed:', we.message);
      }
    }

    // Try to find nearest tide station for tide/current data
    let tideData = null;

    // Only try NOAA for locations roughly in US/territories waters
    // US bounds: lat 17-72, lon -180 to -60 (includes Alaska, Hawaii, PR, USVI, Guam)
    const isNearUS = (userLat >= 17 && userLat <= 72 && userLon >= -180 && userLon <= -60) ||
                     (userLat >= 13 && userLat <= 21 && userLon >= 143 && userLon <= 146); // Guam
    if (isNearUS) try {
      // Find nearest NOAA station
      const stationsUrl = `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=waterlevels&units=english`;
      const stResp = await fetch(stationsUrl, { signal: AbortSignal.timeout(8000) });
      const stCt = stResp.headers.get('content-type') || '';
      if (!stCt.includes('application/json')) throw new Error('NOAA stations non-JSON: ' + stCt);
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

    // Unconditional hardcoded fallback: Virginia Key station 8723214.
    // If no station was found via the search above, always return Virginia Key
    // tide predictions so the UI never shows "No NOAA tide station found".
    if (!tideData) {
      try {
        const now = new Date();
        const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const fmt = d => d.getFullYear() + '' + String(d.getMonth()+1).padStart(2,'0') + '' + String(d.getDate()).padStart(2,'0');
        const tideUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${fmt(now)}&end_date=${fmt(end)}&station=8723214&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=h&units=english&format=json`;
        const tideResp = await fetch(tideUrl, { signal: AbortSignal.timeout(8000) });
        const tideJson = await tideResp.json();
        if (tideJson.predictions && tideJson.predictions.length) {
          tideData = {
            station: 'Virginia Key, FL',
            stationId: '8723214',
            stationLat: 25.7317,
            stationLon: -80.1617,
            distanceMiles: Math.round(Math.sqrt(Math.pow(25.7317 - userLat, 2) + Math.pow(-80.1617 - userLon, 2)) * 60),
            predictions: tideJson.predictions,
            currents: null
          };
        }
      } catch(e) { console.error('Virginia Key fallback failed:', e.message); }
    }

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
    console.error('/api/forecast error:', e && (e.stack || e.message || e));
    res.status(500).json({ error: 'Failed to fetch forecast', detail: e && e.message });
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

    <!-- ============================================ -->
    <!-- HRRR WIND FORECAST MAP (Open-Meteo, 18h)     -->
    <!-- Standalone, isolated from other IIFEs        -->
    <!-- ============================================ -->
    <div style="background:#0a1628;color:#e8eaf0;border-radius:14px;padding:20px;margin-bottom:20px;box-shadow:0 2px 12px rgba(0,0,0,0.15);">
      <h3 style="color:#90caf9;margin:0 0 4px;display:flex;align-items:center;gap:8px;">🌪️ HRRR wind forecast <span style="font-size:0.7rem;color:#78909c;font-weight:400;">via Open-Meteo</span></h3>
      <div id="hrrr-location-label" style="font-size:0.82rem;color:#90a4ae;margin-bottom:12px;">Detecting location…</div>
      <div id="hrrr-wind-map" style="height:420px;border-radius:10px;background:#06101a;"></div>
      <div style="margin-top:14px;background:rgba(255,255,255,0.05);border-radius:10px;padding:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:10px;">
          <strong style="color:#90caf9;font-size:0.88rem;">Forecast hour:</strong>
          <span id="hrrr-time-label" style="color:#fff;font-weight:700;font-size:0.95rem;">+0h</span>
          <button id="hrrr-play-btn" type="button" style="background:#1d6ea5;color:#fff;border:none;border-radius:6px;padding:6px 14px;cursor:pointer;font-weight:700;font-size:0.85rem;">▶ Play</button>
        </div>
        <input type="range" id="hrrr-time-slider" min="0" max="47" value="0" step="1" style="width:100%;">
        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:#78909c;margin-top:4px;">
          <span>Now</span><span>+2h</span><span>+4h</span><span>+6h</span><span>+8h</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px;">
          <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:0.72rem;color:#78909c;text-transform:uppercase;letter-spacing:0.5px;">Avg wind</div>
            <div id="hrrr-stat-avg" style="font-size:1.4rem;font-weight:800;color:#fff;">—</div>
            <div style="font-size:0.7rem;color:#78909c;">kts</div>
          </div>
          <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:0.72rem;color:#78909c;text-transform:uppercase;letter-spacing:0.5px;">Max gust</div>
            <div id="hrrr-stat-gust" style="font-size:1.4rem;font-weight:800;color:#fff;">—</div>
            <div style="font-size:0.7rem;color:#78909c;">kts</div>
          </div>
          <div style="background:rgba(255,255,255,0.06);border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:0.72rem;color:#78909c;text-transform:uppercase;letter-spacing:0.5px;">Direction</div>
            <div id="hrrr-stat-dir" style="font-size:1.4rem;font-weight:800;color:#fff;">—</div>
            <div style="font-size:0.7rem;color:#78909c;">from</div>
          </div>
        </div>
        <div style="margin-top:14px;">
          <div style="height:12px;border-radius:6px;background:linear-gradient(to right,#1a3a5c 0%,#1a3a5c 16%,#1d6ea5 16%,#1d6ea5 33%,#1d9e75 33%,#1d9e75 50%,#8db83a 50%,#8db83a 66%,#e8a020 66%,#e8a020 83%,#d84030 83%,#d84030 100%);"></div>
          <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:#78909c;margin-top:4px;">
            <span>0</span><span>5</span><span>10</span><span>15</span><span>20</span><span>25+</span>
          </div>
          <div style="font-size:0.72rem;color:#78909c;margin-top:8px;line-height:1.5;">
            Streaming particles flow with the wind field; arrows show direction and the white number is speed in knots. Color = wind speed bucket.
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================ -->
    <!-- RAINVIEWER RADAR MAP (free, no API key)      -->
    <!-- Standalone, isolated from other IIFEs        -->
    <!-- ============================================ -->
    <div style="background:#0a1628;color:#e8eaf0;border-radius:14px;padding:20px;margin-bottom:20px;box-shadow:0 2px 12px rgba(0,0,0,0.15);">
      <h3 style="color:#90caf9;margin:0 0 4px;display:flex;align-items:center;gap:8px;">🌧️ Radar map <span style="font-size:0.7rem;color:#78909c;font-weight:400;">via RainViewer</span></h3>
      <div id="radar-location-label" style="font-size:0.82rem;color:#90a4ae;margin-bottom:12px;">Loading radar…</div>
      <div id="radar-map" style="height:420px;border-radius:10px;background:#06101a;"></div>
      <div style="margin-top:14px;background:rgba(255,255,255,0.05);border-radius:10px;padding:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:10px;">
          <strong style="color:#90caf9;font-size:0.88rem;">Frame:</strong>
          <span id="radar-time-label" style="color:#fff;font-weight:700;font-size:0.95rem;">—</span>
          <button id="radar-play-btn" type="button" style="background:#1d6ea5;color:#fff;border:none;border-radius:6px;padding:6px 14px;cursor:pointer;font-weight:700;font-size:0.85rem;">▶ Play</button>
        </div>
        <input type="range" id="radar-time-slider" min="0" max="0" value="0" step="1" style="width:100%;">
        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:#78909c;margin-top:4px;">
          <span id="radar-past-label">Past</span><span>Now</span><span id="radar-future-label">Nowcast</span>
        </div>
        <div style="margin-top:14px;">
          <div style="height:12px;border-radius:6px;background:linear-gradient(to right,#08306b 0%,#2171b5 20%,#6baed6 40%,#9ecae1 50%,#fd8d3c 65%,#e6550d 80%,#a50f15 100%);"></div>
          <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:#78909c;margin-top:4px;">
            <span>Light</span><span>Moderate</span><span>Heavy</span><span>Intense</span>
          </div>
          <div style="font-size:0.72rem;color:#78909c;margin-top:8px;line-height:1.5;">
            Past frames (last ~2 hours) and nowcast frames (next ~30 min) from RainViewer's global radar composite. Updated every 10 minutes. Color shows precipitation intensity.
          </div>
        </div>
      </div>
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

    <!-- ======================================== -->
    <!-- SAILING AREA CURRENT MAP (NOAA CO-OPS)   -->
    <!-- ======================================== -->
    <div style="background:#0b1a2b;color:#e8eaf0;border-radius:14px;padding:20px;margin-top:24px;margin-bottom:20px;box-shadow:0 2px 12px rgba(0,0,0,0.15);">
      <h3 style="color:#90caf9;margin:0 0 14px;display:flex;align-items:center;gap:8px;">🌊 Sailing Area Current Map</h3>
      <div id="current-map" style="height:420px;border-radius:10px;background:#06101a;"></div>
      <div id="current-station-info" style="margin-top:10px;font-size:0.85rem;color:#90caf9;"></div>
      <div style="margin-top:14px;background:rgba(255,255,255,0.05);border-radius:10px;padding:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <strong style="color:#90caf9;font-size:0.88rem;">Forecast Time:</strong>
          <span id="current-time-label" style="color:#fff;font-weight:700;font-size:0.95rem;">Now</span>
        </div>
        <input type="range" id="current-time-slider" min="0" max="24" value="0" step="1" style="width:100%;">
        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:#78909c;margin-top:4px;">
          <span>Now</span><span>+6h</span><span>+12h</span><span>+18h</span><span>+24h</span>
        </div>
        <div style="display:flex;gap:14px;margin-top:12px;font-size:0.78rem;flex-wrap:wrap;">
          <span style="display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:14px;height:14px;background:#42a5f5;border-radius:3px;"></span>Light (&lt; 0.5 kts)</span>
          <span style="display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:14px;height:14px;background:#ffd54f;border-radius:3px;"></span>Moderate (0.5–1.5 kts)</span>
          <span style="display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:14px;height:14px;background:#ef5350;border-radius:3px;"></span>Strong (&gt; 1.5 kts)</span>
        </div>
      </div>
    </div>

    <!-- ======================================== -->
    <!-- 7-DAY NWS WIND FORECAST (US locations)   -->
    <!-- ======================================== -->
    <div style="background:#0b1a2b;color:#e8eaf0;border-radius:14px;padding:20px;margin-bottom:20px;box-shadow:0 2px 12px rgba(0,0,0,0.15);">
      <h3 style="color:#90caf9;margin:0 0 14px;display:flex;align-items:center;gap:8px;">🌬️ 7-Day Wind Forecast <span style="font-size:0.7rem;color:#78909c;font-weight:400;">via NOAA NWS</span></h3>
      <div id="nws-forecast-status" style="font-size:0.85rem;color:#78909c;margin-bottom:10px;">Loading 7-day forecast for Miami, FL...</div>
      <div id="nws-forecast-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px;"></div>
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
      try {
        window.__forecastLocation = { lat: lat, lon: lon, name: locName || null };
        window.dispatchEvent(new CustomEvent('forecast-location-changed', { detail: { lat: lat, lon: lon, name: locName || null } }));
      } catch(e) {}

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

    // Try GPS first; fall back to Miami if geolocation is denied / unavailable.
    function autoLoad() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(pos) { loadForecast(pos.coords.latitude, pos.coords.longitude, 'Your location'); },
          function() { loadForecast(25.7617, -80.1918, 'Miami, FL'); },
          { timeout: 6000, maximumAge: 600000 }
        );
      } else {
        loadForecast(25.7617, -80.1918, 'Miami, FL');
      }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoLoad);
    } else {
      autoLoad();
    }
  })();
  </script>

  <!-- Sailing Area Current Map: standalone Leaflet section, defaults to Miami -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
  (function() {
    var map = null;
    var currentMarkers = [];
    var nearbyStations = [];
    var sliderHourOffset = 0;
    var mapCenter = { lat: 25.7617, lon: -80.1918 }; // Miami default
    var SEARCH_RADIUS_KM = 100;
    var MAX_STATIONS = 30;
    var GRID_SPACING_KM = 2;
    var GRID_RADIUS_KM = 120;
    var LAND_FILTER_KM = 8;

    function haversine(lat1, lon1, lat2, lon2) {
      var R = 6371;
      var dLat = (lat2 - lat1) * Math.PI / 180;
      var dLon = (lon2 - lon1) * Math.PI / 180;
      var a = Math.sin(dLat/2)*Math.sin(dLat/2) +
              Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
              Math.sin(dLon/2)*Math.sin(dLon/2);
      return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    function initCurrentMap(lat, lon) {
      mapCenter = { lat: lat, lon: lon };
      if (!map) {
        map = L.map('current-map').setView([lat, lon], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap', maxZoom: 19
        }).addTo(map);
        map.on('zoomend', function() { redrawAllArrows(); });
      } else {
        map.setView([lat, lon], 11);
      }
      findNearbyCurrentStations(lat, lon);
    }

    function findNearbyCurrentStations(lat, lon) {
      var infoEl = document.getElementById('current-station-info');
      infoEl.textContent = 'Finding NOAA current stations within ' + SEARCH_RADIUS_KM + ' km...';
      fetch('https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=currentpredictions')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var stations = data.stations || [];
          var withDist = stations.map(function(s) {
            return { id: s.id, name: s.name, lat: s.lat, lng: s.lng, distKm: haversine(lat, lon, s.lat, s.lng) };
          }).filter(function(s) { return s.distKm <= SEARCH_RADIUS_KM; })
            .sort(function(a, b) { return a.distKm - b.distKm; })
            .slice(0, MAX_STATIONS);

          if (withDist.length === 0) {
            infoEl.textContent = 'No NOAA current stations within ' + SEARCH_RADIUS_KM + ' km of this location.';
            clearCurrentMarkers();
            nearbyStations = [];
            return;
          }
          nearbyStations = withDist;
          infoEl.innerHTML = '📡 Found <b>' + withDist.length + '</b> stations within ' + SEARCH_RADIUS_KM + ' km — loading predictions...';
          fetchAllStationCurrents();
        })
        .catch(function(err) {
          infoEl.textContent = 'Error fetching NOAA stations: ' + err.message;
        });
    }

    function fetchAllStationCurrents() {
      var now = new Date();
      var pad = function(n) { return String(n).padStart(2,'0'); };
      var fmtDate = function(d) { return d.getFullYear() + pad(d.getMonth()+1) + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); };
      var endDate = new Date(now.getTime() + 24*3600*1000);

      var promises = nearbyStations.map(function(station) {
        var url = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?' +
          'product=currents_predictions&application=Snipeovation&format=json&units=english&time_zone=lst_ldt' +
          '&interval=h&station=' + station.id +
          '&begin_date=' + fmtDate(now) + '&end_date=' + fmtDate(endDate);
        return fetch(url)
          .then(function(r) { return r.json(); })
          .then(function(data) {
            var preds = (data.current_predictions && data.current_predictions.cp) || [];
            if (preds.length) {
              station.data = {
                times: preds.map(function(p) { return p.Time; }),
                speeds: preds.map(function(p) { return parseFloat(p.Velocity_Major) || parseFloat(p.Speed) || 0; }),
                dirs: preds.map(function(p) { return parseFloat(p.meanFloodDir) || parseFloat(p.Direction) || 0; })
              };
            }
          })
          .catch(function() {});
      });

      Promise.all(promises).then(function() {
        nearbyStations = nearbyStations.filter(function(s) { return s.data; });
        var infoEl = document.getElementById('current-station-info');
        if (!nearbyStations.length) {
          infoEl.innerHTML = '<span style="color:#ef5350;">No predictions returned for any stations.</span>';
          return;
        }
        infoEl.innerHTML = '📡 <b>' + nearbyStations.length + '</b> NOAA stations loaded. Grid-interpolated current field shown across the area.';
        redrawAllArrows();
        updateSliderLabel(0);
      });
    }

    function clearCurrentMarkers() {
      currentMarkers.forEach(function(m) { map.removeLayer(m); });
      currentMarkers = [];
    }

    function interpolateAt(lat, lon, hourIdx) {
      if (!nearbyStations.length) return null;
      var sumW = 0, vx = 0, vy = 0;
      var POWER = 2;
      for (var i = 0; i < nearbyStations.length; i++) {
        var s = nearbyStations[i];
        if (!s.data) continue;
        var idx = Math.min(hourIdx, s.data.speeds.length - 1);
        var speed = s.data.speeds[idx] || 0;
        var dir = s.data.dirs[idx] || 0;
        var actualDir = speed < 0 ? (dir + 180) % 360 : dir;
        var spd = Math.abs(speed);
        var d = haversine(lat, lon, s.lat, s.lng);
        if (d < 0.05) return { speed: spd, dir: actualDir };
        var w = 1 / Math.pow(d, POWER);
        var rad = actualDir * Math.PI / 180;
        vx += w * spd * Math.sin(rad);
        vy += w * spd * Math.cos(rad);
        sumW += w;
      }
      if (sumW === 0) return null;
      vx /= sumW; vy /= sumW;
      var interpSpeed = Math.sqrt(vx*vx + vy*vy);
      var interpDir = (Math.atan2(vx, vy) * 180 / Math.PI + 360) % 360;
      return { speed: interpSpeed, dir: interpDir };
    }

    function arrowSizeForZoom() {
      if (!map) return 14;
      var z = map.getZoom();
      if (z <= 9) return 10;
      if (z <= 10) return 12;
      if (z <= 11) return 14;
      if (z <= 12) return 17;
      if (z <= 13) return 20;
      return 24;
    }

    function makeArrowHtml(speed, dir, size, isStation, showLabel) {
      var color = speed < 0.5 ? '#42a5f5' : speed < 1.5 ? '#ffd54f' : '#ef5350';
      var opacity = isStation ? 1 : 0.85;
      var sw = Math.max(1.5, size * 0.13);
      var stationStroke = isStation ? ' stroke="#0b1a2b" stroke-width="0.8"' : '';
      var cx = size / 2;
      var svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" ' +
        'style="transform:rotate(' + dir + 'deg);transform-origin:center;display:block;overflow:visible;filter:drop-shadow(0 0 1.5px rgba(0,0,0,0.85));">' +
        '<line x1="' + cx + '" y1="' + size + '" x2="' + cx + '" y2="' + (size/3) + '" stroke="' + color + '" stroke-width="' + sw + '" stroke-linecap="round"/>' +
        '<polygon points="' + cx + ',0 ' + (size*0.22) + ',' + (size/3) + ' ' + (size*0.78) + ',' + (size/3) + '" fill="' + color + '"' + stationStroke + '/>' +
        '</svg>';
      var label = '';
      if (showLabel) {
        label = '<span style="position:absolute;left:' + (size + 2) + 'px;top:50%;transform:translateY(-50%);font-size:13px;font-weight:bold;color:' + color + ';background:#fff;padding:2px;border-radius:3px;border:1px solid ' + color + ';white-space:nowrap;font-family:sans-serif;">' + speed.toFixed(1) + ' kt</span>';
      }
      return '<div style="position:relative;width:' + size + 'px;height:' + size + 'px;opacity:' + opacity + ';pointer-events:none;">' + svg + label + '</div>';
    }

    function isLikelyWater(lat, lon) {
      for (var i = 0; i < nearbyStations.length; i++) {
        var s = nearbyStations[i];
        if (haversine(lat, lon, s.lat, s.lng) <= LAND_FILTER_KM) return true;
      }
      return false;
    }

    function redrawAllArrows() {
      if (!map || !nearbyStations.length) return;
      clearCurrentMarkers();
      var hourIdx = sliderHourOffset;
      var size = arrowSizeForZoom();
      var center = mapCenter;
      var latStep = GRID_SPACING_KM / 111;
      var lonStep = GRID_SPACING_KM / (111 * Math.cos(center.lat * Math.PI / 180));
      var radiusDeg = GRID_RADIUS_KM / 111;
      var showGridLabels = true;
      var labelExtra = 36;

      for (var dLat = -radiusDeg; dLat <= radiusDeg; dLat += latStep) {
        for (var dLon = -radiusDeg; dLon <= radiusDeg; dLon += lonStep) {
          var glat = center.lat + dLat;
          var glon = center.lon + dLon;
          if (haversine(center.lat, center.lon, glat, glon) > GRID_RADIUS_KM) continue;
          if (!isLikelyWater(glat, glon)) continue;
          var interp = interpolateAt(glat, glon, hourIdx);
          if (!interp || interp.speed < 0.05) continue;
          var html = makeArrowHtml(interp.speed, interp.dir, size, false, showGridLabels);
          var iconW = showGridLabels ? size + labelExtra : size;
          var icon = L.divIcon({ html: html, className: '', iconSize: [iconW, size], iconAnchor: [size/2, size/2] });
          var marker = L.marker([glat, glon], { icon: icon, interactive: false }).addTo(map);
          currentMarkers.push(marker);
        }
      }

      var stationSize = size + 4;
      nearbyStations.forEach(function(s) {
        if (!s.data) return;
        var idx = Math.min(hourIdx, s.data.speeds.length - 1);
        var rawSpeed = s.data.speeds[idx] || 0;
        var rawDir = s.data.dirs[idx] || 0;
        var spd = Math.abs(rawSpeed);
        var dir = rawSpeed < 0 ? (rawDir + 180) % 360 : rawDir;
        var html = makeArrowHtml(spd, dir, stationSize, true, true);
        var icon = L.divIcon({ html: html, className: '', iconSize: [stationSize + labelExtra, stationSize], iconAnchor: [stationSize/2, stationSize/2] });
        var marker = L.marker([s.lat, s.lng], { icon: icon })
          .bindPopup('<b>' + s.name + '</b><br>Station ' + s.id + '<br>Speed: ' + spd.toFixed(2) + ' kts<br>Direction: ' + Math.round(dir) + '°<br>' + (rawSpeed < 0 ? 'EBB' : 'FLOOD'))
          .addTo(map);
        currentMarkers.push(marker);
      });
    }

    function updateSliderLabel(hourIdx) {
      var label = document.getElementById('current-time-label');
      if (hourIdx === 0) { label.textContent = 'Now'; return; }
      var t = new Date(Date.now() + hourIdx * 3600 * 1000);
      label.textContent = '+' + hourIdx + 'h (' + t.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) + ')';
    }

    document.getElementById('current-time-slider').addEventListener('input', function(e) {
      sliderHourOffset = parseInt(e.target.value, 10);
      updateSliderLabel(sliderHourOffset);
      redrawAllArrows();
    });

    window.addEventListener('forecast-location-changed', function(e) {
      if (e && e.detail && typeof e.detail.lat === 'number' && typeof e.detail.lon === 'number') {
        initCurrentMap(e.detail.lat, e.detail.lon);
      }
    });

    // Initialize immediately with Miami default — main forecast location bar will update us
    initCurrentMap(mapCenter.lat, mapCenter.lon);
  })();
  </script>

  <!-- 7-Day NWS Wind Forecast: standalone, defaults to Miami, fully isolated -->
  <script>
  (function() {
    var DEFAULT_LAT = 25.7617;
    var DEFAULT_LON = -80.1918;

    function compassToDeg(c) {
      var m = {N:0,NNE:22.5,NE:45,ENE:67.5,E:90,ESE:112.5,SE:135,SSE:157.5,S:180,SSW:202.5,SW:225,WSW:247.5,W:270,WNW:292.5,NW:315,NNW:337.5};
      return m[c] || 0;
    }

    function loadNwsForecast(lat, lon) {
      var statusEl = document.getElementById('nws-forecast-status');
      var gridEl = document.getElementById('nws-forecast-grid');
      if (!statusEl || !gridEl) return;
      statusEl.textContent = 'Loading 7-day forecast for ' + lat.toFixed(2) + ', ' + lon.toFixed(2) + '...';
      gridEl.innerHTML = '';
      fetch('https://api.weather.gov/points/' + lat.toFixed(4) + ',' + lon.toFixed(4))
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (!data.properties || !data.properties.forecast) {
            statusEl.textContent = 'NWS forecast not available for this location (US only).';
            return null;
          }
          return fetch(data.properties.forecast);
        })
        .then(function(r) { return r ? r.json() : null; })
        .then(function(data) {
          if (!data) return;
          var periods = (data.properties && data.properties.periods) || [];
          if (!periods.length) { statusEl.textContent = 'No forecast periods returned.'; return; }
          statusEl.textContent = 'Showing ' + Math.min(periods.length, 14) + ' periods (~7 days):';
          gridEl.innerHTML = periods.slice(0, 14).map(function(p) {
            var dirDeg = compassToDeg(p.windDirection);
            var windNum = parseFloat((p.windSpeed || '').split(' ')[0]) || 0;
            var color = windNum < 8 ? '#4caf50' : windNum < 15 ? '#42a5f5' : windNum < 22 ? '#ff9800' : '#ef5350';
            return '<div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;border-left:4px solid ' + color + ';">' +
              '<div style="font-weight:700;color:#90caf9;font-size:0.88rem;margin-bottom:4px;">' + (p.name || '') + '</div>' +
              '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
                '<div style="font-size:1.6rem;transform:rotate(' + dirDeg + 'deg);color:#fff;">↓</div>' +
                '<div><div style="font-size:1.1rem;font-weight:700;color:#fff;">' + (p.windSpeed || '?') + '</div>' +
                '<div style="font-size:0.78rem;color:#90a4ae;">' + (p.windDirection || '') + '</div></div>' +
              '</div>' +
              '<div style="font-size:0.78rem;color:#cfd8dc;">' + (p.shortForecast || '') + '</div>' +
              '<div style="font-size:0.74rem;color:#78909c;margin-top:4px;">' + p.temperature + '°' + p.temperatureUnit + '</div>' +
              '</div>';
          }).join('');
        })
        .catch(function(err) {
          statusEl.textContent = 'Error loading NWS forecast: ' + err.message;
        });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { loadNwsForecast(DEFAULT_LAT, DEFAULT_LON); });
    } else {
      loadNwsForecast(DEFAULT_LAT, DEFAULT_LON);
    }
  })();
  </script>

  <!-- HRRR Wind Forecast Map: standalone, isolated IIFE, fetches Open-Meteo client-side -->
  <script>
  (function() {
    var FALLBACK_LAT = 25.77, FALLBACK_LON = -80.19;
    var GRID_STEP = 0.05;
    var GRID_N = 3;
    var STEP_MIN = 10;            // forecast step in minutes
    var STEPS = 48;               // 8 hours x 6 steps/hour
    var HOURS_TO_FETCH = 9;       // need hour 0..8 to interpolate steps 0..47
    var SUBSTEPS_PER_HOUR = 60 / STEP_MIN; // 6
    var hours = HOURS_TO_FETCH;   // (kept name for fetch slicing)
    var data = null;
    var map = null, arrowLayer = null, currentStep = 0, playTimer = null;
    var particleCanvas = null, particleCtx = null, particles = [], rafId = null;
    var MODEL_CHAIN = ['gfs_hrrr', 'best_match', 'gfs_global'];

    function speedColor(s) {
      if (s < 5) return '#1a3a5c';
      if (s < 10) return '#1d6ea5';
      if (s < 15) return '#1d9e75';
      if (s < 20) return '#8db83a';
      if (s < 25) return '#e8a020';
      return '#d84030';
    }

    function degToCompass(d) {
      var dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
      return dirs[Math.round(((d % 360) / 22.5)) % 16];
    }

    // Directional arrow with white speed label. dirFromDeg = direction wind comes FROM (Open-Meteo).
    // Arrow points in the direction the wind is blowing TOWARD.
    function buildArrowSvg(speedKt, dirFromDeg, color) {
      var size = 64, cx = size/2, cy = size/2;
      var toDeg = (dirFromDeg + 180) % 360;
      // Rotate arrow path: pointing up (north) by default, then rotate by toDeg.
      // Arrow shaft length scales slightly with speed, capped.
      var len = Math.min(22, 8 + speedKt * 0.6);
      var arrow = '<g transform="translate(' + cx + ',' + cy + ') rotate(' + toDeg + ')">' +
        '<line x1="0" y1="' + len + '" x2="0" y2="-' + len + '" stroke="' + color + '" stroke-width="3" stroke-linecap="round"/>' +
        '<polygon points="0,-' + (len + 6) + ' -6,-' + (len - 2) + ' 6,-' + (len - 2) + '" fill="' + color + '"/>' +
        '</g>';
      // White speed label, centered at the bottom of the icon, with dark stroke for contrast.
      var label = '<text x="' + cx + '" y="' + (size - 4) + '" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="13" font-weight="800" fill="#ffffff" stroke="#000000" stroke-width="3" paint-order="stroke" style="paint-order:stroke;">' + Math.round(speedKt) + '</text>';
      return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' + arrow + label + '</svg>';
    }

    function buildGrid(centerLat, centerLon) {
      var pts = [], half = (GRID_N - 1) / 2;
      for (var i = 0; i < GRID_N; i++) {
        for (var j = 0; j < GRID_N; j++) {
          pts.push({ lat: centerLat + (i - half) * GRID_STEP, lon: centerLon + (j - half) * GRID_STEP });
        }
      }
      return pts;
    }

    // Linear interp between hourly values to STEPS 10-minute steps.
    // Wind direction uses circular (u/v vector) interpolation so 359°→1° doesn't whip across.
    function interpolatePoint(hourlyWs, hourlyWd, hourlyWg) {
      var ws = new Array(STEPS), wd = new Array(STEPS), wg = new Array(STEPS);
      for (var i = 0; i < STEPS; i++) {
        var hr = i / SUBSTEPS_PER_HOUR;
        var i0 = Math.floor(hr), i1 = Math.min(HOURS_TO_FETCH - 1, i0 + 1);
        var t = hr - i0;
        var s0 = hourlyWs[i0], s1 = hourlyWs[i1];
        var g0 = hourlyWg[i0], g1 = hourlyWg[i1];
        var d0 = hourlyWd[i0], d1 = hourlyWd[i1];
        if (s0 == null || s1 == null || d0 == null || d1 == null) {
          ws[i] = null; wd[i] = null; wg[i] = null;
          continue;
        }
        ws[i] = s0 + (s1 - s0) * t;
        wg[i] = (g0 != null && g1 != null) ? (g0 + (g1 - g0) * t) : null;
        // Circular interp via u/v components, weighted by speed so calm hours don't dominate.
        var r0 = d0 * Math.PI / 180, r1 = d1 * Math.PI / 180;
        var u0 = Math.sin(r0) * s0, v0 = Math.cos(r0) * s0;
        var u1 = Math.sin(r1) * s1, v1 = Math.cos(r1) * s1;
        var u = u0 + (u1 - u0) * t, v = v0 + (v1 - v0) * t;
        var deg = Math.atan2(u, v) * 180 / Math.PI;
        if (deg < 0) deg += 360;
        wd[i] = deg;
      }
      return { ws: ws, wd: wd, wg: wg };
    }

    function fetchOneModel(pts, model) {
      var lats = pts.map(function(p) { return p.lat.toFixed(4); }).join(',');
      var lons = pts.map(function(p) { return p.lon.toFixed(4); }).join(',');
      var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lats + '&longitude=' + lons +
                '&hourly=windspeed_10m,winddirection_10m,windgusts_10m&windspeed_unit=kn&forecast_days=1&models=' + model;
      return fetch(url).then(function(r) {
        if (!r.ok) throw new Error(model + ' http ' + r.status);
        return r.json();
      }).then(function(json) {
        var arr = Array.isArray(json) ? json : [json];
        var hourlyTimes = arr[0] && arr[0].hourly ? (arr[0].hourly.time || []).slice(0, HOURS_TO_FETCH) : [];
        if (hourlyTimes.length < HOURS_TO_FETCH) throw new Error(model + ' too few hours');
        // Build STEPS step-times from the first hourly time + i*STEP_MIN minutes.
        var t0 = new Date(hourlyTimes[0]).getTime();
        var stepTimes = new Array(STEPS);
        for (var k = 0; k < STEPS; k++) stepTimes[k] = new Date(t0 + k * STEP_MIN * 60000).toISOString();

        var points = arr.map(function(loc, idx) {
          var h = loc.hourly || {};
          var hws = (h.windspeed_10m || []).slice(0, HOURS_TO_FETCH);
          var hwd = (h.winddirection_10m || []).slice(0, HOURS_TO_FETCH);
          var hwg = (h.windgusts_10m || []).slice(0, HOURS_TO_FETCH);
          var interp = interpolatePoint(hws, hwd, hwg);
          return { lat: pts[idx].lat, lon: pts[idx].lon, ws: interp.ws, wd: interp.wd, wg: interp.wg };
        });
        var anyData = points.some(function(p) { return p.ws.some(function(v) { return v != null; }); });
        if (!anyData) throw new Error(model + ' no coverage');
        return { times: stepTimes, points: points, model: model };
      });
    }

    function fetchHrrr(centerLat, centerLon) {
      var pts = buildGrid(centerLat, centerLon);
      // Try gfs_hrrr → best_match → gfs_global in sequence; resolve with first success.
      return MODEL_CHAIN.reduce(function(prev, model) {
        return prev.catch(function() { return fetchOneModel(pts, model); });
      }, Promise.reject(new Error('init')));
    }

    // Bilinear interpolation of wind vector at (lat,lon) from the 3x3 grid for a given hour.
    // Returns { u, v, speed } in screen-pixel direction (u east-positive, v south-positive),
    // or null if outside grid bounds / no data.
    function sampleWind(lat, lon, hour) {
      if (!data) return null;
      var pts = data.points;
      var lats = [], lons = [];
      for (var i = 0; i < GRID_N; i++) lats.push(pts[i * GRID_N].lat);
      for (var j = 0; j < GRID_N; j++) lons.push(pts[j].lon);
      // Grid is regular and sorted ascending.
      if (lat < lats[0] || lat > lats[GRID_N - 1] || lon < lons[0] || lon > lons[GRID_N - 1]) return null;
      var fi = (lat - lats[0]) / (lats[GRID_N - 1] - lats[0]) * (GRID_N - 1);
      var fj = (lon - lons[0]) / (lons[GRID_N - 1] - lons[0]) * (GRID_N - 1);
      var i0 = Math.floor(fi), j0 = Math.floor(fj);
      var i1 = Math.min(GRID_N - 1, i0 + 1), j1 = Math.min(GRID_N - 1, j0 + 1);
      var di = fi - i0, dj = fj - j0;
      function vec(ix, jx) {
        var p = pts[ix * GRID_N + jx];
        var s = p.ws[hour], d = p.wd[hour];
        if (s == null || d == null) return null;
        var toRad = ((d + 180) % 360) * Math.PI / 180;
        return { u: Math.sin(toRad) * s, v: -Math.cos(toRad) * s, s: s };
      }
      var v00 = vec(i0, j0), v01 = vec(i0, j1), v10 = vec(i1, j0), v11 = vec(i1, j1);
      if (!v00 || !v01 || !v10 || !v11) return null;
      var u = (1 - di) * ((1 - dj) * v00.u + dj * v01.u) + di * ((1 - dj) * v10.u + dj * v11.u);
      var v = (1 - di) * ((1 - dj) * v00.v + dj * v01.v) + di * ((1 - dj) * v10.v + dj * v11.v);
      var s = Math.sqrt(u * u + v * v);
      return { u: u, v: v, speed: s };
    }

    function spawnParticle() {
      if (!map) return null;
      var sz = map.getSize();
      return { x: Math.random() * sz.x, y: Math.random() * sz.y, age: Math.floor(Math.random() * 60) };
    }

    function tickParticles() {
      rafId = null;
      if (!particleCtx || !particleCanvas || !map || !data) return;
      var w = particleCanvas.width, h = particleCanvas.height;
      // Fade trail
      particleCtx.globalCompositeOperation = 'destination-out';
      particleCtx.fillStyle = 'rgba(0,0,0,0.10)';
      particleCtx.fillRect(0, 0, w, h);
      particleCtx.globalCompositeOperation = 'source-over';
      var maxAge = 80;
      var step = 0.23; // pixels per frame multiplier
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.age++;
        if (p.age > maxAge || p.x < 0 || p.y < 0 || p.x > w || p.y > h) {
          var np = spawnParticle();
          if (np) { p.x = np.x; p.y = np.y; p.age = 0; }
          continue;
        }
        var ll = map.containerPointToLatLng([p.x, p.y]);
        var s = sampleWind(ll.lat, ll.lng, currentStep);
        if (!s) { p.age = maxAge + 1; continue; }
        var nx = p.x + s.u * step;
        var ny = p.y + s.v * step;
        var color = speedColor(s.speed);
        particleCtx.strokeStyle = color;
        particleCtx.lineWidth = 1.4;
        particleCtx.beginPath();
        particleCtx.moveTo(p.x, p.y);
        particleCtx.lineTo(nx, ny);
        particleCtx.stroke();
        p.x = nx; p.y = ny;
      }
      rafId = requestAnimationFrame(tickParticles);
    }

    function ensureParticles() {
      if (!map) return;
      var sz = map.getSize();
      if (!particleCanvas) {
        particleCanvas = document.createElement('canvas');
        particleCanvas.style.position = 'absolute';
        particleCanvas.style.top = '0';
        particleCanvas.style.left = '0';
        particleCanvas.style.pointerEvents = 'none';
        particleCanvas.style.zIndex = '400';
        map.getContainer().appendChild(particleCanvas);
        particleCtx = particleCanvas.getContext('2d');
      }
      if (particleCanvas.width !== sz.x || particleCanvas.height !== sz.y) {
        particleCanvas.width = sz.x;
        particleCanvas.height = sz.y;
      }
      // Re-seed particles
      particles = [];
      var count = Math.min(800, Math.max(200, Math.floor((sz.x * sz.y) / 1500)));
      for (var i = 0; i < count; i++) particles.push(spawnParticle());
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tickParticles);
    }

    function renderFrame(hour) {
      if (!data || !map) return;
      if (arrowLayer) { arrowLayer.clearLayers(); }
      else { arrowLayer = L.layerGroup().addTo(map); }
      var sumWs = 0, maxGust = 0, sumDirX = 0, sumDirY = 0, n = 0;
      data.points.forEach(function(p) {
        var s = p.ws[hour], d = p.wd[hour], g = p.wg[hour];
        if (s == null || d == null) return;
        var color = speedColor(s);
        var svg = buildArrowSvg(s, d, color);
        var icon = L.divIcon({ className: 'hrrr-arrow', html: svg, iconSize: [64, 64], iconAnchor: [32, 32] });
        L.marker([p.lat, p.lon], { icon: icon, interactive: false }).addTo(arrowLayer);
        sumWs += s; if (g != null && g > maxGust) maxGust = g;
        var rad = d * Math.PI / 180;
        sumDirX += Math.sin(rad); sumDirY += Math.cos(rad);
        n++;
      });
      if (n > 0) {
        var avg = sumWs / n;
        var meanDir = (Math.atan2(sumDirX / n, sumDirY / n) * 180 / Math.PI + 360) % 360;
        document.getElementById('hrrr-stat-avg').textContent = avg.toFixed(1);
        document.getElementById('hrrr-stat-gust').textContent = maxGust.toFixed(1);
        document.getElementById('hrrr-stat-dir').textContent = degToCompass(meanDir);
      }
      var minsAhead = hour * STEP_MIN;
      var hh = Math.floor(minsAhead / 60), mm = minsAhead % 60;
      var off;
      if (hh === 0) off = '+' + mm + 'min';
      else if (mm === 0) off = '+' + hh + 'h';
      else off = '+' + hh + 'h ' + mm + 'min';
      var label = off;
      if (data.times[hour]) {
        var t = new Date(data.times[hour]);
        label = t.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + '  ' + off;
      }
      document.getElementById('hrrr-time-label').textContent = label;
    }

    function initMap(centerLat, centerLon, locLabel) {
      var locEl = document.getElementById('hrrr-location-label');
      if (locEl) locEl.textContent = locLabel + ' (' + centerLat.toFixed(2) + ', ' + centerLon.toFixed(2) + ')';
      if (typeof L === 'undefined') {
        if (locEl) locEl.textContent = 'Leaflet failed to load.';
        return;
      }
      // If already initialized, just re-center and refetch.
      if (map) {
        map.setView([centerLat, centerLon], 10);
        if (arrowLayer) arrowLayer.clearLayers();
        if (particleCtx && particleCanvas) particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        fetchHrrr(centerLat, centerLon).then(function(d) {
          data = d;
          if (!data.points.length || !data.points[0].ws.length) return;
          if (locEl) locEl.textContent = locLabel + ' (' + centerLat.toFixed(2) + ', ' + centerLon.toFixed(2) + ') · model: ' + data.model;
          renderFrame(currentStep);
          ensureParticles();
        }).catch(function(err) {
          if (locEl) locEl.textContent = locLabel + ' — all model fetches failed (' + err.message + ').';
        });
        return;
      }
      map = L.map('hrrr-wind-map', { zoomControl: true, attributionControl: true }).setView([centerLat, centerLon], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      fetchHrrr(centerLat, centerLon).then(function(d) {
        data = d;
        if (!data.points.length || !data.points[0].ws.length) {
          document.getElementById('hrrr-location-label').textContent = locLabel + ' — no wind data for this location.';
          return;
        }
        document.getElementById('hrrr-location-label').textContent = locLabel + ' (' + centerLat.toFixed(2) + ', ' + centerLon.toFixed(2) + ') · model: ' + data.model;
        renderFrame(0);
        ensureParticles();
        map.on('moveend zoomend resize', function() { ensureParticles(); renderFrame(currentStep); });
      }).catch(function(err) {
        document.getElementById('hrrr-location-label').textContent = locLabel + ' — all model fetches failed (' + err.message + ').';
      });
    }

    function startHrrr() {
      var slider = document.getElementById('hrrr-time-slider');
      var playBtn = document.getElementById('hrrr-play-btn');
      if (slider) {
        slider.addEventListener('input', function() {
          currentStep = parseInt(slider.value, 10) || 0;
          renderFrame(currentStep);
        });
      }
      if (playBtn) {
        playBtn.addEventListener('click', function() {
          if (playTimer) {
            clearInterval(playTimer); playTimer = null; playBtn.textContent = '▶ Play';
          } else {
            playBtn.textContent = '⏸ Pause';
            playTimer = setInterval(function() {
              currentStep = (currentStep + 1) % STEPS;
              if (slider) slider.value = currentStep;
              renderFrame(currentStep);
            }, 600);
          }
        });
      }
      // Always re-init when the user changes the forecast-page location.
      window.addEventListener('forecast-location-changed', function(e) {
        if (e && e.detail && typeof e.detail.lat === 'number' && typeof e.detail.lon === 'number') {
          var lbl = e.detail.name || 'Selected location';
          initMap(e.detail.lat, e.detail.lon, lbl);
        }
      });

      // 1) Selected location already set by the forecast page → use it immediately.
      var preset = window.__forecastLocation;
      if (preset && typeof preset.lat === 'number' && typeof preset.lon === 'number') {
        initMap(preset.lat, preset.lon, preset.name || 'Selected location');
        return;
      }

      // 2) Otherwise, give the forecast page a brief window to dispatch its location event.
      //    If nothing arrives in 1500 ms, fall back to geolocation → Miami.
      var initialized = false;
      function onceFromEvent(e) {
        if (initialized) return;
        if (e && e.detail && typeof e.detail.lat === 'number' && typeof e.detail.lon === 'number') {
          initialized = true;
          initMap(e.detail.lat, e.detail.lon, e.detail.name || 'Selected location');
        }
      }
      window.addEventListener('forecast-location-changed', onceFromEvent);
      setTimeout(function() {
        if (initialized) return;
        initialized = true;
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            function(pos) { initMap(pos.coords.latitude, pos.coords.longitude, 'Your location'); },
            function() { initMap(FALLBACK_LAT, FALLBACK_LON, 'Miami, FL (default)'); },
            { timeout: 6000, maximumAge: 600000 }
          );
        } else {
          initMap(FALLBACK_LAT, FALLBACK_LON, 'Miami, FL (default)');
        }
      }, 1500);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startHrrr);
    } else {
      startHrrr();
    }
  })();
  </script>

  <!-- RainViewer Radar Map: standalone, isolated IIFE, free public API, no key -->
  <script>
  (function() {
    var FALLBACK_LAT = 25.77, FALLBACK_LON = -80.19;
    var TILE_HOST = 'https://tilecache.rainviewer.com';
    var TILE_SIZE = 256;     // 256 or 512
    var COLOR_SCHEME = 2;    // 0=BW, 1=Original, 2=Universal Blue, 3=TITAN, 4=The Weather Channel, 6=NEXRAD level III, 7=Rainbow @ SELEX-IS, 8=Dark Sky
    var SMOOTHING = 1, SNOW = 1;
    var map = null, frames = [], tileLayers = {}, currentIdx = 0, playTimer = null, mapInited = false;

    function fmtTime(unix) {
      var d = new Date(unix * 1000);
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    function loadFrame(idx) {
      if (!frames.length || !map) return;
      idx = ((idx % frames.length) + frames.length) % frames.length;
      currentIdx = idx;
      var frame = frames[idx];
      var key = frame.path;
      if (!tileLayers[key]) {
        var url = TILE_HOST + frame.path + '/' + TILE_SIZE + '/{z}/{x}/{y}/' + COLOR_SCHEME + '/' + SMOOTHING + '_' + SNOW + '.png';
        tileLayers[key] = L.tileLayer(url, { tileSize: 256, opacity: 0, zIndex: 10, attribution: '&copy; <a href="https://www.rainviewer.com/">RainViewer</a>' });
        tileLayers[key].addTo(map);
      }
      // Hide all but the current; fade-in current.
      Object.keys(tileLayers).forEach(function(k) {
        tileLayers[k].setOpacity(k === key ? 0.7 : 0);
      });
      var slider = document.getElementById('radar-time-slider');
      if (slider) slider.value = idx;
      var label = document.getElementById('radar-time-label');
      var nowOffset = idx - (frames.pastCount - 1);
      var rel;
      if (nowOffset === 0) rel = 'Now';
      else if (nowOffset < 0) rel = nowOffset * 10 + ' min';
      else rel = '+' + (nowOffset * 10) + ' min';
      if (label) label.textContent = fmtTime(frame.time) + '  (' + rel + ')';
    }

    function fetchFrames() {
      return fetch('https://api.rainviewer.com/public/weather-maps.json')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var past = (data.radar && data.radar.past) || [];
          var nowcast = (data.radar && data.radar.nowcast) || [];
          var combined = past.concat(nowcast);
          combined.pastCount = past.length;
          return combined;
        });
    }

    function initMap(centerLat, centerLon, locLabel) {
      var locEl = document.getElementById('radar-location-label');
      if (locEl) locEl.textContent = locLabel + ' (' + centerLat.toFixed(2) + ', ' + centerLon.toFixed(2) + ')';
      if (typeof L === 'undefined') {
        if (locEl) locEl.textContent = 'Leaflet failed to load.';
        return;
      }
      if (!mapInited) {
        map = L.map('radar-map', { zoomControl: true, attributionControl: true, minZoom: 6 }).setView([centerLat, centerLon], 8);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          minZoom: 6,
          maxZoom: 18,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        mapInited = true;
      } else {
        map.setView([centerLat, centerLon], 8);
      }
      fetchFrames().then(function(f) {
        frames = f;
        if (!frames.length) {
          if (locEl) locEl.textContent = locLabel + ' — no radar frames available.';
          return;
        }
        var slider = document.getElementById('radar-time-slider');
        if (slider) { slider.min = 0; slider.max = frames.length - 1; }
        var pastEl = document.getElementById('radar-past-label');
        var futEl = document.getElementById('radar-future-label');
        if (pastEl) pastEl.textContent = '-' + ((frames.pastCount - 1) * 10) + ' min';
        if (futEl) futEl.textContent = '+' + ((frames.length - frames.pastCount) * 10) + ' min';
        // Start at "now" — the last past frame.
        loadFrame(frames.pastCount - 1);
      }).catch(function(err) {
        if (locEl) locEl.textContent = locLabel + ' — failed to load radar: ' + err.message;
      });
    }

    function startRadar() {
      var slider = document.getElementById('radar-time-slider');
      var playBtn = document.getElementById('radar-play-btn');
      if (slider) {
        slider.addEventListener('input', function() {
          loadFrame(parseInt(slider.value, 10) || 0);
        });
      }
      if (playBtn) {
        playBtn.addEventListener('click', function() {
          if (playTimer) {
            clearInterval(playTimer); playTimer = null; playBtn.textContent = '▶ Play';
          } else {
            playBtn.textContent = '⏸ Pause';
            playTimer = setInterval(function() { loadFrame(currentIdx + 1); }, 500);
          }
        });
      }

      // Listen for forecast-page location changes (shared with HRRR map and Sailing Area Current Map).
      window.addEventListener('forecast-location-changed', function(e) {
        if (e && e.detail && typeof e.detail.lat === 'number' && typeof e.detail.lon === 'number') {
          initMap(e.detail.lat, e.detail.lon, e.detail.name || 'Selected location');
        }
      });

      // Use already-set forecast location if available.
      var preset = window.__forecastLocation;
      if (preset && typeof preset.lat === 'number' && typeof preset.lon === 'number') {
        initMap(preset.lat, preset.lon, preset.name || 'Selected location');
        return;
      }

      // Otherwise wait briefly for an event, then fall back to geolocation → Miami.
      var initialized = false;
      function once(e) {
        if (initialized) return;
        if (e && e.detail && typeof e.detail.lat === 'number' && typeof e.detail.lon === 'number') {
          initialized = true;
          initMap(e.detail.lat, e.detail.lon, e.detail.name || 'Selected location');
        }
      }
      window.addEventListener('forecast-location-changed', once);
      setTimeout(function() {
        if (initialized) return;
        initialized = true;
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            function(pos) { initMap(pos.coords.latitude, pos.coords.longitude, 'Your location'); },
            function() { initMap(FALLBACK_LAT, FALLBACK_LON, 'Miami, FL (default)'); },
            { timeout: 6000, maximumAge: 600000 }
          );
        } else {
          initMap(FALLBACK_LAT, FALLBACK_LON, 'Miami, FL (default)');
        }
      }, 1500);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startRadar);
    } else {
      startRadar();
    }
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

// --- MY BOATS API ---
app.get("/api/my-boats", requireAuth, (req, res) => {
  res.json(getUserBoats(req.session.user.id));
});

app.post("/api/my-boats/add", requireAuth, (req, res) => {
  const { sail_number, nickname } = req.body;
  if (!sail_number || !sail_number.trim()) return res.status(400).json({ error: 'Sail number required' });
  const uid = req.session.user.id;
  const existing = getUserBoats(uid);
  const maxOrder = existing.length > 0 ? Math.max(...existing.map(b => b.sort_order)) + 1 : 0;
  const isFirst = existing.length === 0 ? 1 : 0;
  try {
    db.prepare("INSERT INTO user_boats (user_id, sail_number, nickname, sort_order, is_default) VALUES (?,?,?,?,?)")
      .run(uid, sail_number.trim(), (nickname || '').trim() || null, maxOrder, isFirst);
    const boat = db.prepare("SELECT * FROM user_boats WHERE user_id = ? AND sail_number = ?").get(uid, sail_number.trim());
    res.json({ ok: true, boat });
  } catch(e) {
    if (e.message.includes('UNIQUE')) return res.status(400).json({ error: 'Boat already exists' });
    res.status(500).json({ error: 'Failed to add boat' });
  }
});

app.post("/api/my-boats/:id/delete", requireAuth, (req, res) => {
  const uid = req.session.user.id;
  const boat = db.prepare("SELECT * FROM user_boats WHERE id = ? AND user_id = ?").get(req.params.id, uid);
  if (!boat) return res.status(404).json({ error: 'Not found' });
  db.prepare("DELETE FROM user_boats WHERE id = ? AND user_id = ?").run(req.params.id, uid);
  if (boat.is_default) {
    const first = db.prepare("SELECT id FROM user_boats WHERE user_id = ? ORDER BY sort_order ASC, id ASC LIMIT 1").get(uid);
    if (first) db.prepare("UPDATE user_boats SET is_default = 1 WHERE id = ?").run(first.id);
  }
  res.json({ ok: true });
});

app.post("/api/my-boats/:id/set-default", requireAuth, (req, res) => {
  const uid = req.session.user.id;
  const boat = db.prepare("SELECT id FROM user_boats WHERE id = ? AND user_id = ?").get(req.params.id, uid);
  if (!boat) return res.status(404).json({ error: 'Not found' });
  db.prepare("UPDATE user_boats SET is_default = 0 WHERE user_id = ?").run(uid);
  db.prepare("UPDATE user_boats SET is_default = 1 WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

app.post("/api/my-boats/reorder", requireAuth, (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) return res.status(400).json({ error: 'order array required' });
  const uid = req.session.user.id;
  const stmt = db.prepare("UPDATE user_boats SET sort_order = ? WHERE id = ? AND user_id = ?");
  const tx = db.transaction((ids) => { ids.forEach((id, i) => stmt.run(i, id, uid)); });
  tx(order);
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
        <input type="text" id="hull-input" placeholder="${L('enterHullNumber')}" style="flex:1;min-width:150px;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;background:#fff;">
        <button onclick="addHullBtn()" class="btn btn-primary" style="white-space:nowrap;">+ ${L('addHullNumber')}</button>
        <button id="hull-mic-btn" onclick="startVoiceHull()" title="Voice input" style="background:#0b3d6e;color:white;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:1.2rem;">🎤</button>
      </div>
      <div id="hull-tags" style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;"></div>
    </div>

    <!-- Add Task Section -->
    <div style="background:white;border-radius:12px;padding:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <h3 style="color:#0b3d6e;margin-top:0;">${L('addTask')}</h3>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
        <select id="task-hull-select" onchange="if(typeof renderTasks==='function')renderTasks()" style="padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;min-width:140px;background:#fff;">
          <option value="">-- ${L('assignToBoat')} --</option>
          <option value="all">${L('allBoats')}</option>
        </select>
        <button id="boat-mic-btn" onclick="startVoiceBoatSelect()" title="Voice input" style="background:#0b3d6e;color:white;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:1.2rem;flex-shrink:0;">🎤</button>
        <input type="text" id="task-input" placeholder="${L('enterTask')}" style="flex:1;min-width:200px;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:1rem;background:#fff;">
        <button onclick="addTaskBtn()" class="btn btn-primary" style="white-space:nowrap;">+ ${L('addTask')}</button>
        <button id="task-mic-btn" onclick="startVoiceTask()" title="Voice input" style="background:#0b3d6e;color:white;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:1.2rem;">🎤</button>
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
    var _voiceRec = null;
    var _voiceBtn = null;
    var RED_STYLE = 'background:#e53e3e;color:#fff;border:none;border-radius:12px;padding:3px 8px;font-size:0.75rem;white-space:nowrap;cursor:pointer;height:auto;width:auto;';
    var BLUE_STYLE = 'background:#0b3d6e;color:white;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:1.2rem;';

    function setMicActive(btn) {
      if (!btn) return;
      btn.style.cssText = RED_STYLE;
      btn.innerHTML = '⏹ Stop';
    }
    function setMicIdle(btn) {
      if (!btn) return;
      btn.style.cssText = BLUE_STYLE;
      btn.innerHTML = '🎤';
    }

    function startVoice(targetId) {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Voice input not supported in this browser.');
        return;
      }
      var inp = document.getElementById(targetId);
      var btnId = targetId === 'hull-input' ? 'hull-mic-btn' : 'task-mic-btn';
      var btn = document.getElementById(btnId);
      // Toggle off if already listening
      if (_voiceRec) { _voiceRec.stop(); _voiceRec = null; setMicIdle(_voiceBtn); _voiceBtn = null; return; }
      var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      var rec = new SR();
      rec.lang = isEN ? 'en-US' : '${lang === "es" ? "es-ES" : lang === "it" ? "it-IT" : lang === "pt" ? "pt-BR" : "en-US"}';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = function(e) {
        var text = e.results[0][0].transcript;
        if (inp) inp.value = (inp.value ? inp.value + ' ' : '') + text;
      };
      rec.onerror = function(e) { console.error('Voice error', e.error); _voiceRec = null; setMicIdle(_voiceBtn); _voiceBtn = null; };
      rec.onend = function() { _voiceRec = null; setMicIdle(_voiceBtn); _voiceBtn = null; };
      _voiceRec = rec;
      _voiceBtn = btn;
      setMicActive(btn);
      rec.start();
    }

    window.startVoiceHull = function() { startVoice('hull-input'); };
    window.startVoiceTask = function() { startVoice('task-input'); };
    window.startVoiceBoatSelect = function() {
      if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        alert(L.voiceNotSupported || 'Voice input not supported in this browser.'); return;
      }
      var btn = document.getElementById('boat-mic-btn');
      if (_voiceRec) { _voiceRec.stop(); _voiceRec = null; setMicIdle(_voiceBtn); _voiceBtn = null; return; }
      var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      var rec = new SR();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = function(e) {
        var spoken = e.results[0][0].transcript.trim().toLowerCase();
        var sel = document.getElementById('task-hull-select');
        var matched = false;
        for (var i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value && sel.options[i].value.toLowerCase().indexOf(spoken) !== -1) {
            sel.value = sel.options[i].value;
            if (typeof renderTasks === 'function') renderTasks();
            matched = true; break;
          }
        }
        if (!matched) alert('No matching boat found for: ' + spoken);
      };
      rec.onerror = function(e) { console.error('Voice error', e.error); _voiceRec = null; setMicIdle(_voiceBtn); _voiceBtn = null; };
      rec.onend = function() { _voiceRec = null; setMicIdle(_voiceBtn); _voiceBtn = null; };
      _voiceRec = rec;
      _voiceBtn = btn;
      setMicActive(btn);
      rec.start();
    };

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

// --- Performance Trends ---
app.get("/trends", requireAuth, (req, res) => { res.redirect("/performance"); });

app.get("/performance", requireAuth, (req, res) => {
  const lang = getLang(req);
  const L = (k) => t(k, lang);
  const trendLogs = db.prepare("SELECT * FROM race_logs WHERE user_id = ? ORDER BY race_date ASC").all(req.session.user.id);
  const trendsHtml = trendsSection(trendLogs);
  res.send(renderPage(`
  <div class="container">
    <h2>${L('perfMetrics')}</h2>

    ${trendsHtml}

    <h3 style="color:#0b3d6e;margin:32px 0 8px;font-size:1.15rem;border-bottom:2px solid #e2e8f0;padding-bottom:8px;">&#128295; Settings vs Performance Rating</h3>
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

// --- VAKAROS COACH ---

// ---- SHARED TELEMETRY STATS COMPUTATION ----
// Used by both CSV upload AND API import paths — same stats, same shape.

function computeTelemetryStats(rows, colMap) {
  // rows: array of objects with keys matching colMap keys
  // colMap keys used: timestamp, latitude, longitude, speed, heading, heel, vmg

  const get = (row, key) => row[key] !== undefined ? row[key] : '';

  const speeds   = rows.map(r => parseFloat(get(r,'speed'))).filter(v => !isNaN(v) && v > 0);
  const heels    = rows.map(r => parseFloat(get(r,'heel'))).filter(v => !isNaN(v));
  const vmgs     = rows.map(r => parseFloat(get(r,'vmg'))).filter(v => !isNaN(v));
  const headings = rows.map(r => parseFloat(get(r,'heading'))).filter(v => !isNaN(v));
  const lats     = rows.map(r => parseFloat(get(r,'latitude'))).filter(v => !isNaN(v));
  const lons     = rows.map(r => parseFloat(get(r,'longitude'))).filter(v => !isNaN(v));
  const timestamps = rows.map(r => get(r,'timestamp')).filter(Boolean);

  const avg = arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;

  // Tack/gybe counting via smoothed heading changes
  let tackCount = 0, gybeCount = 0;
  if (headings.length > 10) {
    const sw = 5;
    const smoothed = headings.map((_, i) => {
      const slice = headings.slice(Math.max(0,i-sw), i+1);
      return avg(slice);
    });
    for (let i = 1; i < smoothed.length; i++) {
      let d = smoothed[i] - smoothed[i-1];
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      if (Math.abs(d) > 25 && Math.abs(d) < 120) {
        if (speeds[i] !== undefined && speeds[i] < avg(speeds)*1.1) tackCount++;
        else gybeCount++;
      }
    }
  }

  // Distance via haversine
  let distanceNm = 0;
  if (lats.length > 1 && lats.length === lons.length) {
    for (let i = 1; i < lats.length; i++) {
      const dLat = (lats[i]-lats[i-1])*Math.PI/180;
      const dLon = (lons[i]-lons[i-1])*Math.PI/180;
      const a = Math.sin(dLat/2)**2 + Math.cos(lats[i-1]*Math.PI/180)*Math.cos(lats[i]*Math.PI/180)*Math.sin(dLon/2)**2;
      distanceNm += 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))*3440.065;
    }
  }

  // Duration from timestamps
  let durationMin = 0;
  if (timestamps.length > 1) {
    const first = new Date(timestamps[0]);
    const last  = new Date(timestamps[timestamps.length-1]);
    if (!isNaN(first) && !isNaN(last)) durationMin = (last-first)/60000;
  }
  if (durationMin <= 0 && rows.length > 1) durationMin = rows.length/60;

  // Build condensed CSV summary for AI (sample ~200 rows)
  const sampleInterval = Math.max(1, Math.floor(rows.length/200));
  const keys = Object.keys(colMap);
  const csvLines = [keys.join(',')];
  rows.filter((_,i)=>i%sampleInterval===0).forEach(r => {
    csvLines.push(keys.map(k => get(r,k)||'').join(','));
  });

  return {
    rowCount: rows.length,
    durationMinutes: Math.round(durationMin*10)/10,
    distanceNm: Math.round(distanceNm*100)/100,
    avgSpeed: Math.round(avg(speeds)*100)/100,
    maxSpeed: Math.round(Math.max(0,...speeds)*100)/100,
    avgHeel: Math.round(avg(heels)*10)/10,
    avgVmg: Math.round(avg(vmgs)*100)/100,
    tackCount,
    gybeCount,
    csvSummary: csvLines.join('\n')
  };
}

// ---- CSV UPLOAD PATH (unchanged, kept for backwards compatibility) ----

function parseVakarosCsv(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("CSV file is empty or has no data rows");
  const headers = lines[0].toLowerCase().split(",").map(h => h.trim());

  const colMap = {};
  const aliases = {
    timestamp: ["timestamp","time","datetime","date_time","utc","gps_time"],
    latitude: ["latitude","lat"],
    longitude: ["longitude","lon","lng","long"],
    speed: ["speed","sog","speed_kts","speed_knots","boat_speed","bsp"],
    heading: ["heading","hdg","cog","course"],
    heel: ["heel","heel_angle","heel_deg"],
    trim: ["trim","pitch","trim_angle"],
    vmg: ["vmg","vmg_kts"]
  };
  for (const [key, names] of Object.entries(aliases)) {
    const idx = headers.findIndex(h => names.includes(h.replace(/[^a-z0-9_]/g,"")));
    if (idx !== -1) colMap[key] = idx;
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = lines[i].split(",");
    const row = {};
    for (const [key, idx] of Object.entries(colMap)) {
      row[key] = cols[idx] !== undefined ? cols[idx].trim() : "";
    }
    rows.push(row);
  }

  return computeTelemetryStats(rows, colMap);
}

// ---- API IMPORT PATH (NEW) ----

// Parse the Vakaros REST API response format: { Fields: [...], Rows: [[...], ...] }
function parseVakarosTelemetryResponse(telData) {
  const { Fields, Rows } = telData;
  if (!Fields || !Fields.length) throw new Error('No field definitions in API response');
  if (!Rows || Rows.length === 0) throw new Error('No telemetry rows returned — check your time range');

  // Map field names to indices
  const aliases = {
    timestamp: ['timestamp','time','datetime','utc'],
    latitude:  ['latitude','lat'],
    longitude: ['longitude','lon','lng'],
    speed:     ['speed','sog','speed_kts','boat_speed'],
    heading:   ['heading','hdg','cog','course'],
    heel:      ['heel','heel_angle'],
    trim:      ['trim','pitch'],
    vmg:       ['vmg','vmg_kts']
  };

  const colMap = {};  // key -> field index
  for (const [key, names] of Object.entries(aliases)) {
    const i = Fields.findIndex(f => names.includes(f.toLowerCase().replace(/[^a-z0-9_]/g,'')));
    if (i !== -1) colMap[key] = i;
  }

  // Convert array rows to objects
  const rows = Rows.map(r => {
    const obj = {};
    for (const [key, idx] of Object.entries(colMap)) {
      obj[key] = r[idx] !== null && r[idx] !== undefined ? String(r[idx]) : '';
    }
    return obj;
  });

  return computeTelemetryStats(rows, colMap);
}

// ---- VAKAROS REST API HELPER ----

const VAKAROS_API_BASE = 'https://teleapi.regatta.app';

async function vakarosApiFetch(path, apiToken) {
  const res = await fetch(`${VAKAROS_API_BASE}${path}`, {
    headers: { 'Authorization': `Bearer ${apiToken}` }
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Vakaros API ${res.status}: ${path}`);
  }
  return res.json();
}

// ---- ROUTES ----

// Save/update Vakaros API token
app.post('/vakaros/token', requireAuth, (req, res) => {
  const token = (req.body.api_token || '').trim();
  if (!token) return res.status(400).json({ error: 'API token required' });
  db.prepare('INSERT OR REPLACE INTO vakaros_api_keys (user_id, api_token) VALUES (?,?)')
    .run(req.session.user.id, token);
  res.json({ success: true });
});

// Discover event: returns divisions, races, and time ranges — used to populate the import UI
app.get('/vakaros/api/events/:event_id', requireAuth, async (req, res) => {
  const keyRow = db.prepare('SELECT api_token FROM vakaros_api_keys WHERE user_id = ?').get(req.session.user.id);
  if (!keyRow) return res.status(401).json({ error: 'No Vakaros API token saved. Add your token first.' });

  try {
    const [summary, times] = await Promise.all([
      vakarosApiFetch(`/telemetry/racing-summary/${encodeURIComponent(req.params.event_id)}`, keyRow.api_token),
      vakarosApiFetch(`/telemetry/event-times/${encodeURIComponent(req.params.event_id)}`, keyRow.api_token)
    ]);

    // Also fetch short_ids for each division (needed for WebSocket live tracking)
    const divisions = summary.divisions || [];
    const shortIds = {};
    await Promise.all(divisions.map(async d => {
      try {
        const data = await vakarosApiFetch(
          `/division/short-id/${encodeURIComponent(req.params.event_id)}/${encodeURIComponent(d.division)}`,
          keyRow.api_token
        );
        shortIds[d.division] = data.short_id;
      } catch(e) {}
    }));

    res.json({ summary, times, shortIds });
  } catch(err) {
    res.status(400).json({ error: err.message });
  }
});

// Import telemetry for a specific event+division+time range into vakaros_uploads
app.post('/vakaros/import-event', requireAuth, async (req, res) => {
  const { event_id, division, after, before, race_log_id, label } = req.body;
  if (!event_id || !after) return res.status(400).json({ error: 'event_id and after timestamp are required' });

  const keyRow = db.prepare('SELECT api_token FROM vakaros_api_keys WHERE user_id = ?').get(req.session.user.id);
  if (!keyRow) return res.status(401).json({ error: 'No Vakaros API token saved.' });

  try {
    const params = new URLSearchParams({ after: String(after), limit: '100000' });
    if (division) params.set('division', division);
    if (before)   params.set('before', String(before));

    const telData = await vakarosApiFetch(
      `/telemetry/event/${encodeURIComponent(event_id)}?${params}`,
      keyRow.api_token
    );

    const stats = parseVakarosTelemetryResponse(telData);
    const filename = label || `${event_id}${division ? ' / ' + division : ''} (API)`;

    db.prepare(`
      INSERT INTO vakaros_uploads
        (user_id, race_log_id, filename, row_count, duration_minutes, distance_nm,
         avg_speed, max_speed, avg_heel, avg_vmg, tack_count, gybe_count, csv_summary,
         import_source, event_id, division)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      req.session.user.id, race_log_id || null, filename,
      stats.rowCount, stats.durationMinutes, stats.distanceNm,
      stats.avgSpeed, stats.maxSpeed, stats.avgHeel, stats.avgVmg,
      stats.tackCount, stats.gybeCount, stats.csvSummary,
      'api', event_id, division || null
    );

    res.json({ success: true, stats, filename });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Live race tracking page
app.get('/vakaros/live/:event_id', requireAuth, async (req, res) => {
  const keyRow = db.prepare('SELECT api_token FROM vakaros_api_keys WHERE user_id = ?').get(req.session.user.id);
  if (!keyRow) return res.redirect('/coaching?notice=add-token');

  try {
    const [summary, times] = await Promise.all([
      vakarosApiFetch(`/telemetry/racing-summary/${encodeURIComponent(req.params.event_id)}`, keyRow.api_token),
      vakarosApiFetch(`/telemetry/event-times/${encodeURIComponent(req.params.event_id)}`, keyRow.api_token)
    ]);

    const divisions = summary.divisions || [];

    // Fetch short_ids for WebSocket topics
    const shortIds = {};
    await Promise.all(divisions.map(async d => {
      try {
        const data = await vakarosApiFetch(
          `/division/short-id/${encodeURIComponent(req.params.event_id)}/${encodeURIComponent(d.division)}`,
          keyRow.api_token
        );
        shortIds[d.division] = data.short_id;
      } catch(e) {}
    }));

    res.send(renderLiveTrackingPage(req.params.event_id, divisions, shortIds, times, keyRow.api_token));
  } catch(err) {
    res.status(500).send(`<h2>Error loading event</h2><p>${err.message}</p><a href="/coaching">Back</a>`);
  }
});

// Existing CSV upload routes — UNCHANGED
app.get("/vakaros", requireAuth, (req, res) => { res.redirect("/coaching"); });

app.get("/coaching", requireAuth, (req, res) => {
  const lang = getLang(req);
  const logs = db.prepare("SELECT * FROM race_logs WHERE user_id = ? ORDER BY race_date DESC").all(req.session.user.id);
  const uploads = db.prepare(`
    SELECT vu.*, rl.race_name, rl.race_date, vc.coaching_report, vc.id as coaching_id
    FROM vakaros_uploads vu
    LEFT JOIN race_logs rl ON vu.race_log_id = rl.id
    LEFT JOIN vakaros_coaching vc ON vc.upload_id = vu.id
    WHERE vu.user_id = ?
    ORDER BY vu.created_at DESC
  `).all(req.session.user.id);
  const pastReports = db.prepare("SELECT * FROM coaching_reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 10").all(req.session.user.id);
  const hasApiToken = !!db.prepare('SELECT 1 FROM vakaros_api_keys WHERE user_id = ?').get(req.session.user.id);
  res.send(renderPage(coachingPage(logs, uploads, pastReports, null, null, lang, null, hasApiToken), req.session.user, lang));
});

app.post("/vakaros/upload", requireAuth, upload.single("vakaros_csv"), (req, res) => {
  const lang = getLang(req);
  const logs = db.prepare("SELECT * FROM race_logs WHERE user_id = ? ORDER BY race_date DESC").all(req.session.user.id);
  if (!req.file) {
    const uploads = db.prepare("SELECT vu.*, rl.race_name, rl.race_date, vc.coaching_report, vc.id as coaching_id FROM vakaros_uploads vu LEFT JOIN race_logs rl ON vu.race_log_id = rl.id LEFT JOIN vakaros_coaching vc ON vc.upload_id = vu.id WHERE vu.user_id = ? ORDER BY vu.created_at DESC").all(req.session.user.id);
    const pastReports = db.prepare("SELECT * FROM coaching_reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 10").all(req.session.user.id);
    return res.send(renderPage(coachingPage(logs, uploads, pastReports, null, "Please select a CSV file.", lang), req.session.user, lang));
  }
  try {
    const csvText = req.file.buffer.toString("utf-8");
    const stats = parseVakarosCsv(csvText);
    const raceLogId = req.body.race_log_id || null;
    db.prepare(`
      INSERT INTO vakaros_uploads (user_id, race_log_id, filename, row_count, duration_minutes, distance_nm, avg_speed, max_speed, avg_heel, avg_vmg, tack_count, gybe_count, csv_summary, import_source)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'csv')
    `).run(req.session.user.id, raceLogId, req.file.originalname, stats.rowCount, stats.durationMinutes, stats.distanceNm, stats.avgSpeed, stats.maxSpeed, stats.avgHeel, stats.avgVmg, stats.tackCount, stats.gybeCount, stats.csvSummary);
    res.redirect("/coaching");
  } catch (err) {
    const uploads = db.prepare("SELECT vu.*, rl.race_name, rl.race_date, vc.coaching_report, vc.id as coaching_id FROM vakaros_uploads vu LEFT JOIN race_logs rl ON vu.race_log_id = rl.id LEFT JOIN vakaros_coaching vc ON vc.upload_id = vu.id WHERE vu.user_id = ? ORDER BY vu.created_at DESC").all(req.session.user.id);
    const pastReports = db.prepare("SELECT * FROM coaching_reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 10").all(req.session.user.id);
    res.send(renderPage(coachingPage(logs, uploads, pastReports, null, "Error parsing CSV: " + err.message, lang), req.session.user, lang));
  }
});

app.post("/vakaros/share", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.redirect("/coaching");
  try {
    const csvText = req.file.buffer.toString("utf-8");
    const stats = parseVakarosCsv(csvText);
    db.prepare(`
      INSERT INTO vakaros_uploads (user_id, race_log_id, filename, row_count, duration_minutes, distance_nm, avg_speed, max_speed, avg_heel, avg_vmg, tack_count, gybe_count, csv_summary, import_source)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'csv')
    `).run(req.session.user.id, null, req.file.originalname || "Shared session", stats.rowCount, stats.durationMinutes, stats.distanceNm, stats.avgSpeed, stats.maxSpeed, stats.avgHeel, stats.avgVmg, stats.tackCount, stats.gybeCount, stats.csvSummary);
    res.redirect("/coaching");
  } catch (err) {
    res.redirect("/coaching");
  }
});

app.post("/vakaros/delete/:uploadId", requireAuth, (req, res) => {
  db.prepare("DELETE FROM vakaros_coaching WHERE upload_id = ? AND user_id = ?").run(req.params.uploadId, req.session.user.id);
  db.prepare("DELETE FROM vakaros_uploads WHERE id = ? AND user_id = ?").run(req.params.uploadId, req.session.user.id);
  res.redirect("/coaching");
});

// =============================================================================
// LIVE TRACKING PAGE — rendered server-side, connects via WebSocket client-side
// =============================================================================

function renderLiveTrackingPage(eventId, divisions, shortIds, times, apiToken) {
  const divOptions = divisions.map(d =>
    `<option value="${escapeHtml(d.division)}" data-shortid="${escapeHtml(shortIds[d.division]||'')}">
      ${escapeHtml(d.division)} (${(d.races||[]).length} race${(d.races||[]).length!==1?'s':''})
    </option>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Live Race Tracking — ${escapeHtml(eventId)}</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',sans-serif;background:#0b1a2b;color:#e8eaf0;display:flex;flex-direction:column;height:100vh}
    header{background:#0b3d6e;padding:12px 20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
    header h1{font-size:1.1rem;font-weight:600;color:#fff}
    .controls{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-left:auto}
    select,button{padding:7px 14px;border-radius:6px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:#fff;font-size:0.88rem;cursor:pointer}
    button{background:#1a6fb5;border-color:#1a6fb5}button:hover{background:#1558a0}
    #status{font-size:0.82rem;padding:4px 10px;border-radius:12px;background:rgba(255,255,255,0.1)}
    #status.connected{background:#1a4a1a;color:#4caf50}
    #status.error{background:#4a1a1a;color:#f44336}
    #map{flex:1}
    #sidebar{position:absolute;right:12px;top:80px;width:260px;background:rgba(11,30,50,0.92);border-radius:10px;border:1px solid rgba(255,255,255,0.1);padding:12px;z-index:1000;max-height:calc(100vh - 100px);overflow-y:auto}
    #sidebar h3{font-size:0.85rem;color:#90caf9;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.04em}
    .boat-card{padding:8px 10px;border-radius:6px;background:rgba(255,255,255,0.06);margin-bottom:6px;font-size:0.82rem;border-left:3px solid #1a6fb5}
    .boat-card .sail{font-weight:600;color:#e8eaf0;font-size:0.9rem}
    .boat-card .stats{color:#90a4ae;margin-top:3px}
    .boat-card .status-badge{display:inline-block;padding:2px 7px;border-radius:10px;font-size:0.73rem;font-weight:600;margin-top:4px}
    .badge-STARTED{background:#1b5e20;color:#a5d6a7}
    .badge-OCS{background:#7f0000;color:#ffcdd2}
    .badge-NOT_STARTED{background:#1a237e;color:#c5cae9}
    .race-info{background:rgba(255,255,255,0.06);border-radius:6px;padding:8px 10px;margin-bottom:10px;font-size:0.82rem}
    .race-info .flag{display:inline-block;background:#b71c1c;color:#fff;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;margin-right:4px;margin-top:3px}
  </style>
</head>
<body>
<header>
  <h1>⛵ Live Tracking — ${escapeHtml(eventId)}</h1>
  <div class="controls">
    <select id="divisionSelect">${divOptions}</select>
    <button onclick="connect()">Connect</button>
    <button onclick="disconnect()" style="background:#5a1a1a;border-color:#5a1a1a">Disconnect</button>
    <span id="status">Disconnected</span>
  </div>
</header>
<div style="background:#1a1a2e;border-bottom:1px solid rgba(255,255,255,0.1);padding:6px 20px;font-size:0.75rem;color:#90a4ae;text-align:center;">
  <strong style="color:#ffb74d;">Class Rules Notice:</strong> Snipe Class Rules prohibit the use of electronic devices for tactical advantage during racing (SCIRA Rule 28). Live tracking is for <strong>coaching, spectator, and post-race analysis purposes only</strong>. Do not use this data to make tactical decisions while racing.
</div>
<div style="position:relative;flex:1;display:flex">
  <div id="map"></div>
  <div id="sidebar">
    <div class="race-info" id="raceInfo">Select a division and connect.</div>
    <h3>Participants</h3>
    <div id="boatList"><p style="color:#546e7a;font-size:0.82rem">No data yet</p></div>
  </div>
</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  const API_TOKEN = ${JSON.stringify(apiToken)};
  const SHORT_IDS = ${JSON.stringify(shortIds)};

  const map = L.map('map').setView([0,0],2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'© OpenStreetMap',maxZoom:19
  }).addTo(map);

  let ws = null;
  let markers = {};
  let courseLayers = [];
  let hasSetView = false;

  const BOAT_COLORS = ['#2196f3','#f44336','#4caf50','#ff9800','#9c27b0','#00bcd4','#ffeb3b','#ff5722','#8bc34a','#e91e63'];
  let boatColorMap = {};
  let colorIdx = 0;

  function getBoatColor(serial) {
    if (!boatColorMap[serial]) {
      boatColorMap[serial] = BOAT_COLORS[colorIdx++ % BOAT_COLORS.length];
    }
    return boatColorMap[serial];
  }

  function setStatus(msg, cls='') {
    const el = document.getElementById('status');
    el.textContent = msg;
    el.className = cls;
  }

  function connect() {
    if (ws) ws.close();
    const sel = document.getElementById('divisionSelect');
    const shortId = SHORT_IDS[sel.value] || sel.options[sel.selectedIndex].dataset.shortid;
    if (!shortId) { setStatus('No short ID for this division', 'error'); return; }

    setStatus('Connecting…');
    ws = new WebSocket('wss://live.regatta.app/ws');

    ws.onopen = () => {
      setStatus('Authenticating…');
      ws.send(JSON.stringify({ action:'auth', token: API_TOKEN }));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'auth_success') {
        setStatus('Subscribing…');
        ws.send(JSON.stringify({ action:'subscribe', topic:'live/'+shortId }));
      } else if (msg.type === 'subscription_confirmed') {
        setStatus('Live — ' + sel.value, 'connected');
      } else if (msg.type === 'auth_failed') {
        setStatus('Auth failed: ' + msg.error, 'error');
      } else if (msg.type === 'subscription_error') {
        setStatus('Error: ' + msg.error, 'error');
      } else if (msg.type === 'pong') {
        // keepalive
      } else if (msg.race !== undefined) {
        handleRaceUpdate(msg, sel.value);
      }
    };

    ws.onerror = () => setStatus('Connection error', 'error');
    ws.onclose = () => setStatus('Disconnected');

    // Keepalive ping every 30s
    clearInterval(window._pingInterval);
    window._pingInterval = setInterval(() => {
      if (ws && ws.readyState === 1) ws.send(JSON.stringify({ action:'ping', timestamp: new Date().toISOString() }));
    }, 30000);
  }

  function disconnect() {
    clearInterval(window._pingInterval);
    if (ws) { ws.close(); ws = null; }
    setStatus('Disconnected');
  }

  function handleRaceUpdate(data, division) {
    // Update race info panel
    const stageColors = { IN_PROGRESS:'#2e7d32', STARTING:'#e65100', PRE_START:'#1a237e' };
    const stageColor = stageColors[data.race_stage] || '#333';
    const flags = (data.flags||[]).map(f => '<span class="flag">'+f+'</span>').join('');
    document.getElementById('raceInfo').innerHTML =
      '<strong style="color:#90caf9">'+division+'</strong><br>'+
      'Race '+(data.race||'?')+' Start '+(data.start||'?')+'<br>'+
      '<span style="background:'+stageColor+';padding:2px 8px;border-radius:4px;font-size:0.78rem;font-weight:700">'+(data.race_stage||'?')+'</span>'+
      flags+
      (data.current_start_ts ? '<br><span style="color:#78909c;font-size:0.78rem">Start: '+new Date(data.current_start_ts).toLocaleTimeString()+'</span>' : '');

    // Draw course marks
    courseLayers.forEach(l => map.removeLayer(l));
    courseLayers = [];
    const achievements = data.course?.achievements || [];
    for (const ach of achievements) {
      for (const [devId, dev] of Object.entries(ach.deviceData || {})) {
        if (!dev.position) continue;
        const markColors = { PIN:'#ffeb3b', BOAT:'#ff9800', FINISH_LEFT:'#e53935', FINISH_RIGHT:'#e53935', GENERIC_MARK:'#ce93d8' };
        const col = markColors[dev.markType] || '#90a4ae';
        const circle = L.circleMarker([dev.position.latitude, dev.position.longitude], {
          radius:8, fillColor:col, color:'#fff', weight:2, fillOpacity:0.9
        }).bindPopup(ach.type+'<br>'+dev.markType).addTo(map);
        courseLayers.push(circle);
      }
    }

    // Draw/update participants
    const participants = data.participants || [];
    const seen = new Set();

    for (const p of participants) {
      if (!p.position) continue;
      seen.add(p.serial_number);
      const color = getBoatColor(p.serial_number);
      const latlng = [p.position.latitude, p.position.longitude];

      if (!hasSetView && participants.length > 0) {
        map.setView(latlng, 13);
        hasSetView = true;
      }

      if (!markers[p.serial_number]) {
        const icon = L.divIcon({
          html: \`<div style="width:14px;height:14px;background:\${color};border:2px solid #fff;border-radius:50%;transform:rotate(\${p.heading||0}deg)"></div>\`,
          className:'', iconSize:[14,14], iconAnchor:[7,7]
        });
        markers[p.serial_number] = L.marker(latlng, {icon}).addTo(map);
      } else {
        markers[p.serial_number].setLatLng(latlng);
      }
      markers[p.serial_number].bindPopup(
        \`<strong>\${p.sail_number||p.serial_number}</strong><br>
         SOG: \${(p.sog||0).toFixed(1)} kts | Hdg: \${Math.round(p.heading||0)}°<br>
         Heel: \${(p.heel||0).toFixed(1)}° | Pitch: \${(p.pitch||0).toFixed(1)}°<br>
         Status: \${p.status||'?'}\`
      );
    }

    // Remove markers for boats no longer in update
    for (const serial of Object.keys(markers)) {
      if (!seen.has(parseInt(serial))) { map.removeLayer(markers[serial]); delete markers[serial]; }
    }

    // Update sidebar boat list
    const sorted = [...participants].sort((a,b) => {
      const order = {STARTED:0,OCS:1,NOT_STARTED:2,UNKNOWN:3};
      return (order[a.status]||9) - (order[b.status]||9);
    });
    document.getElementById('boatList').innerHTML = sorted.map(p =>
      \`<div class="boat-card">
        <div class="sail">\${p.sail_number||('#'+p.serial_number)}</div>
        <div class="stats">\${(p.sog||0).toFixed(1)} kts | \${Math.round(p.heading||0)}° | heel \${(p.heel||0).toFixed(1)}°</div>
        <span class="status-badge badge-\${p.status||'UNKNOWN'}">\${p.status||'?'}</span>
      </div>\`
    ).join('') || '<p style="color:#546e7a;font-size:0.82rem">No participants</p>';
  }

  // Auto-connect on load if there's exactly one division
  if (Object.keys(SHORT_IDS).length === 1) connect();
</script>
</body>
</html>`;
}


// --- Share with Crew ---
app.post("/share/race/:id", requireAuth, (req, res) => {
  const log = db.prepare("SELECT * FROM race_logs WHERE id = ? AND user_id = ?").get(req.params.id, req.session.user.id);
  if (!log) return res.status(404).json({ error: "Race log not found" });
  const user = db.prepare("SELECT display_name, username, snipe_number FROM users WHERE id = ?").get(req.session.user.id);
  const token = crypto.randomBytes(16).toString("hex");
  const snapshot = JSON.stringify({ log, user });
  db.prepare("INSERT INTO shared_reports (user_id, token, share_type, race_log_id, snapshot_data) VALUES (?,?,?,?,?)")
    .run(req.session.user.id, token, "race", log.id, snapshot);
  res.json({ token, url: "/share/" + token });
});

app.post("/share/coaching/:id", requireAuth, (req, res) => {
  const report = db.prepare("SELECT * FROM coaching_reports WHERE id = ? AND user_id = ?").get(req.params.id, req.session.user.id);
  if (!report) return res.status(404).json({ error: "Report not found" });
  const user = db.prepare("SELECT display_name, username, snipe_number FROM users WHERE id = ?").get(req.session.user.id);
  const recentLogs = db.prepare("SELECT race_name, race_date, location, finish_position, fleet_size, wind_speed, wind_direction, performance_rating FROM race_logs WHERE user_id = ? ORDER BY race_date DESC LIMIT 5").all(req.session.user.id);
  const token = crypto.randomBytes(16).toString("hex");
  const snapshot = JSON.stringify({ report, user, recentLogs });
  db.prepare("INSERT INTO shared_reports (user_id, token, share_type, coaching_report_id, snapshot_data) VALUES (?,?,?,?,?)")
    .run(req.session.user.id, token, "coaching", report.id, snapshot);
  res.json({ token, url: "/share/" + token });
});

app.get("/share/:token", (req, res) => {
  const row = db.prepare("SELECT * FROM shared_reports WHERE token = ?").get(req.params.token);
  if (!row) return res.status(404).send(renderSharePage("Not Found", `<div style="text-align:center;padding:60px 20px;"><h2 style="color:#c53030;">Link Not Found</h2><p style="color:#666;margin-top:12px;">This shared link doesn't exist or has been removed.</p><a href="/" style="display:inline-block;margin-top:20px;color:#1a6fb5;font-weight:600;">Go to Snipeovation</a></div>`));
  const data = JSON.parse(row.snapshot_data);
  if (row.share_type === "race") {
    res.send(renderSharePage(
      data.log.race_name + " — Shared Race Log",
      sharedRacePage(data.log, data.user, row.created_at)
    ));
  } else {
    res.send(renderSharePage(
      "Coaching Report — " + (data.user.display_name || data.user.username),
      sharedCoachingPage(data.report, data.user, data.recentLogs, row.created_at)
    ));
  }
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
  <meta name="theme-color" content="#0a1628">
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
      background: url('/hero8.jpg') center 62% / cover no-repeat;
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
    .ds-badge { font-size: 0.7rem !important; padding: 4px 8px !important; border-radius: 6px !important; font-weight: 700 !important; text-decoration: none !important; white-space: nowrap; }
    .ds-share { background: rgba(5,150,105,0.25) !important; color: #6ee7b7 !important; border: 1px solid rgba(110,231,183,0.3) !important; }
    .ds-private { background: rgba(11,61,110,0.5) !important; color: #93c5fd !important; border: 1px solid rgba(147,197,253,0.35) !important; }
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
    .mic-btn.listening { color: #fff !important; background: #e53e3e !important; border-radius: 12px !important; padding: 3px 8px !important; font-size: 0.75rem !important; animation: pulse 1s infinite !important; white-space: nowrap !important; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
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

    /* Quick Race Entry - Mobile-optimized, high contrast for on-the-water use */
    .quick-race-container {
      max-width: 500px; margin: 0 auto; padding: 16px 12px;
    }
    .quick-race-header {
      text-align: center; margin-bottom: 20px;
    }
    .quick-race-header h2 {
      font-size: 1.5rem; color: #0b3d6e; margin-bottom: 4px;
    }
    .quick-race-header .quick-race-subtitle {
      font-size: 0.85rem; color: #666;
    }
    .quick-race-card {
      background: #fff; border-radius: 16px; padding: 24px 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1); border: 2px solid #e2e8f0;
    }
    .quick-race-field {
      margin-bottom: 20px;
    }
    .quick-race-field label {
      display: block; font-size: 1rem; font-weight: 700; color: #1a2a3a;
      margin-bottom: 8px; letter-spacing: 0.3px;
    }
    .quick-race-field input,
    .quick-race-field textarea {
      width: 100%; padding: 14px 16px; border: 3px solid #cbd5e0; border-radius: 12px;
      font-size: 1.1rem; font-family: inherit; background: #f8fafc;
      color: #1a2a3a; -webkit-appearance: none; appearance: none;
      min-height: 52px;
    }
    .quick-race-field input:focus,
    .quick-race-field textarea:focus {
      outline: none; border-color: #0b3d6e; background: #fff;
      box-shadow: 0 0 0 3px rgba(11,61,110,0.15);
    }
    .quick-race-field textarea {
      min-height: 80px; resize: vertical;
    }
    .quick-race-field input::placeholder,
    .quick-race-field textarea::placeholder {
      color: #94a3b8; font-size: 1rem;
    }
    .quick-race-position-row {
      display: flex; gap: 12px; align-items: center;
    }
    .quick-race-position-row input {
      flex: 1; text-align: center; font-size: 1.3rem; font-weight: 700;
    }
    .quick-race-position-row .qr-of {
      font-size: 1.1rem; font-weight: 700; color: #666; flex-shrink: 0;
    }
    .quick-race-actions {
      display: flex; flex-direction: column; gap: 12px; margin-top: 24px;
    }
    .btn-quick-save {
      display: block; width: 100%; padding: 18px 24px; border-radius: 14px;
      font-size: 1.2rem; font-weight: 800; text-align: center;
      border: none; cursor: pointer; letter-spacing: 0.5px;
      background: linear-gradient(135deg, #0b3d6e, #1565c0); color: #fff;
      box-shadow: 0 4px 12px rgba(11,61,110,0.3);
      min-height: 56px;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .btn-quick-save:active {
      transform: scale(0.98); box-shadow: 0 2px 6px rgba(11,61,110,0.3);
    }
    .btn-quick-cancel {
      display: block; width: 100%; padding: 14px 24px; border-radius: 14px;
      font-size: 1rem; font-weight: 600; text-align: center;
      text-decoration: none; color: #666; background: #f1f5f9;
      border: 2px solid #e2e8f0; min-height: 48px;
      line-height: 1;
    }
    .btn-quick-cancel:active { background: #e2e8f0; }
    .quick-race-link-row {
      text-align: center; margin-top: 16px;
    }
    .quick-race-link-row a {
      color: #1a6fb5; font-size: 0.9rem; text-decoration: none; font-weight: 600;
    }
    /* Mode toggle */
    .quick-mode-toggle {
      display: flex; gap: 0; margin-bottom: 24px;
      border-radius: 14px; overflow: hidden;
      border: 3px solid #cbd5e0; background: #f1f5f9;
    }
    .quick-mode-btn {
      flex: 1; padding: 16px 12px; font-size: 1.1rem; font-weight: 700;
      text-align: center; cursor: pointer; border: none; background: transparent;
      color: #64748b; transition: all 0.2s; min-height: 56px;
      font-family: inherit; line-height: 1.2;
    }
    .quick-mode-btn.active-race {
      background: linear-gradient(135deg, #0b3d6e, #1565c0); color: #fff;
      box-shadow: 0 2px 8px rgba(11,61,110,0.3);
    }
    .quick-mode-btn.active-practice {
      background: linear-gradient(135deg, #059669, #10b981); color: #fff;
      box-shadow: 0 2px 8px rgba(5,150,105,0.3);
    }
    .quick-mode-btn:active { transform: scale(0.97); }
    .quick-practice-chips {
      display: flex; flex-wrap: wrap; gap: 10px;
    }
    .quick-practice-chips label {
      display: block; cursor: pointer;
    }
    .quick-practice-chips input[type="radio"] {
      display: none;
    }
    .quick-chip {
      display: inline-block; padding: 12px 18px; border-radius: 12px;
      font-size: 1rem; font-weight: 600; background: #f1f5f9;
      border: 3px solid #cbd5e0; color: #334155;
      transition: all 0.15s; min-height: 48px;
      text-align: center;
    }
    .quick-practice-chips input[type="radio"]:checked + .quick-chip {
      background: #ecfdf5; border-color: #059669; color: #059669;
      box-shadow: 0 0 0 2px rgba(5,150,105,0.2);
    }
    .quick-chip:active { transform: scale(0.96); }
    .btn-quick-save.practice-mode {
      background: linear-gradient(135deg, #059669, #10b981);
      box-shadow: 0 4px 12px rgba(5,150,105,0.3);
    }
    /* Quick form voice input */
    .quick-voice-wrap {
      position: relative;
    }
    .quick-voice-wrap input,
    .quick-voice-wrap textarea {
      padding-right: 52px;
    }
    .quick-mic {
      position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
      width: 40px; height: 40px; border-radius: 50%;
      background: #e8f0fe; border: 2px solid #cbd5e0;
      font-size: 1.3rem; cursor: pointer; display: flex;
      align-items: center; justify-content: center;
      transition: all 0.15s; color: #0b3d6e; padding: 0; line-height: 1;
    }
    .quick-mic:active { transform: translateY(-50%) scale(0.93); }
    .quick-mic:hover { background: #d0e2f7; border-color: #0b3d6e; }
    .quick-mic.qm-listening {
      background: #e53e3e; border-color: #c53030; color: #fff;
      animation: qm-pulse 1s infinite;
    }
    .quick-voice-wrap textarea ~ .quick-mic {
      top: 20px; transform: none;
    }
    @keyframes qm-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(229,62,62,0.4); } 50% { box-shadow: 0 0 0 8px rgba(229,62,62,0); } }
    /* Dashboard quick-log button */
    .btn-quick-log {
      display: inline-block; padding: 10px 20px; border-radius: 8px;
      font-weight: 700; font-size: 0.95rem; text-decoration: none;
      border: 2px solid #0b3d6e; color: #0b3d6e; background: #e6f0fa;
      margin-left: 8px; transition: all 0.2s;
    }
    .btn-quick-log:hover { background: #0b3d6e; color: #fff; }
    /* Nav quick entry highlight */
    .sticky-nav a.btn-quick-entry {
      background: linear-gradient(135deg,#f59e0b,#d97706); color: #fff;
      border-radius: 6px; font-weight: 700;
    }
    /* Coaching */
    .vak-stats-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px; margin: 20px 0;
    }
    .vak-stat {
      background: #f0f7ff; border-radius: 10px; padding: 16px; text-align: center;
      border: 1px solid #d0e2f7;
    }
    .vak-stat .vak-num { font-size: 1.6rem; font-weight: 800; color: #0b3d6e; }
    .vak-stat .vak-label { font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
    .vak-upload-zone {
      border: 3px dashed #cbd5e0; border-radius: 16px; padding: 40px 24px;
      text-align: center; background: #f8fafc; cursor: pointer;
      transition: all 0.2s;
    }
    .vak-upload-zone:hover, .vak-upload-zone.dragover {
      border-color: #0b3d6e; background: #eef4fb;
    }
    .vak-upload-zone .vak-upload-icon { font-size: 2.5rem; margin-bottom: 8px; }
    .vak-upload-zone p { color: #666; font-size: 0.95rem; }
    .vak-coaching-report {
      background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px;
      padding: 24px; margin-top: 20px; line-height: 1.7; white-space: pre-wrap;
      font-size: 0.95rem; color: #1a2a3a;
    }
    .vak-coaching-report h3, .vak-coaching-report h4 { color: #0b3d6e; margin: 16px 0 8px; }
    .vak-coaching-report h3:first-child { margin-top: 0; }
    .btn-coaching {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 24px; border-radius: 10px; font-weight: 700;
      font-size: 1rem; border: none; cursor: pointer; transition: all 0.15s;
    }
    .btn-coaching:active { transform: scale(0.97); }
    .btn-analyze {
      background: linear-gradient(135deg, #059669, #10b981); color: #fff;
      box-shadow: 0 3px 10px rgba(5,150,105,0.3);
    }
    .btn-read-aloud {
      background: #e6f0fa; color: #0b3d6e; border: 2px solid #0b3d6e;
    }
    .btn-read-aloud.speaking { background: #fde8e8; color: #c53030; border-color: #c53030; }
    .vak-spinner {
      display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3);
      border-top-color: #fff; border-radius: 50%; animation: vak-spin 0.8s linear infinite;
    }
    @keyframes vak-spin { to { transform: rotate(360deg); } }
    .vak-history-card {
      background: white; border-radius: 10px; padding: 16px; margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;
    }
    .vak-history-card h4 { color: #0b3d6e; margin: 0 0 8px; font-size: 1rem; }
    .vak-history-meta { font-size: 0.85rem; color: #666; margin-bottom: 8px; }
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
      <a href="/quick-log" class="btn-quick-entry">&#9889; Quick</a>
      <a href="/log" class="btn-accent">${L('logRace')}</a>
      <a href="/magic">${L('magic')}</a>
      <a href="/performance">${L('perfMetrics')}</a>
      <a href="/coaching" style="color:#a3f0d0;">&#127919; Coaching + Vakaros</a>
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
  window.deferredPwaPrompt = null;
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    window.deferredPwaPrompt = e;
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
  <script>
  function shareWithCrew(type, id, btn) {
    var orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Sharing...';
    fetch('/share/' + type + '/' + id, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.error) { alert(data.error); btn.innerHTML = orig; btn.disabled = false; return; }
        var url = location.origin + data.url;
        if (navigator.share) {
          navigator.share({ title: 'My Sailing Report', url: url }).catch(function() {});
          btn.innerHTML = '&#9989; Shared!';
          setTimeout(function() { btn.innerHTML = orig; btn.disabled = false; }, 2000);
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function() {
            btn.innerHTML = '&#9989; Link Copied!';
            setTimeout(function() { btn.innerHTML = orig; btn.disabled = false; }, 2500);
          });
        } else {
          prompt('Copy this link to share with your crew:', url);
          btn.innerHTML = orig; btn.disabled = false;
        }
      })
      .catch(function() { alert('Failed to create share link'); btn.innerHTML = orig; btn.disabled = false; });
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

function dashboardPage(logs, user, lang, justSaved) {
  const L = (k) => t(k, lang || 'en');
  const totalRaces = logs.length;
  const locations = new Set(logs.map(l => l.location).filter(Boolean)).size;
  return `<div class="container">
    ${justSaved ? `
    <div id="vakaros-nudge" style="background:linear-gradient(135deg,#f0f7ff,#e6f0fa);border:2px solid #93c5fd;border-radius:14px;padding:20px;margin-bottom:20px;position:relative;">
      <button onclick="document.getElementById('vakaros-nudge').style.display='none'" style="position:absolute;top:10px;right:14px;background:none;border:none;color:#94a3b8;font-size:1.2rem;cursor:pointer;padding:4px;" title="Dismiss">&times;</button>
      <div style="display:flex;align-items:flex-start;gap:14px;flex-wrap:wrap;">
        <div style="font-size:2rem;flex-shrink:0;">&#9989;</div>
        <div style="flex:1;min-width:200px;">
          <p style="color:#059669;font-weight:700;font-size:1.05rem;margin:0 0 4px;">Race logged!</p>
          <p style="color:#0b3d6e;font-weight:700;font-size:0.95rem;margin:0 0 6px;">&#9973; Don't forget your Vakaros data!</p>
          <p style="color:#555;font-size:0.88rem;margin:0 0 10px;">Share your session from Vakaros Connect to get telemetry-powered coaching.</p>
          <div style="background:#fff;border:1px solid #d0e2f7;border-radius:10px;padding:10px 14px;font-size:0.84rem;color:#444;margin-bottom:10px;">
            <strong>Steps:</strong> Open Vakaros Connect &rarr; Tap Sessions &rarr; Export &rarr; Share &rarr; Snipeovation
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <a href="/coaching" class="btn btn-primary" style="font-size:0.88rem;padding:8px 18px;">&#127919; Go to Coaching</a>
            <button onclick="document.getElementById('vakaros-nudge').style.display='none'" style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;padding:8px 16px;font-size:0.85rem;color:#666;cursor:pointer;font-weight:600;">Remind me later</button>
          </div>
        </div>
      </div>
    </div>
    ` : ''}
    <h2>${L('myLogs')} <span class="sub">${escapeHtml(user.display_name || user.username)}${user.snipe_number ? " &mdash; Snipe #" + escapeHtml(user.snipe_number) : ""}</span></h2>
    <div class="stats-row">
      <div class="stat-card"><div class="num">${totalRaces}</div><div class="label">${lang === 'es' ? 'Regatas' : lang === 'it' ? 'Regate' : lang === 'pt' ? 'Regatas' : 'Races Logged'}</div></div>
      <div class="stat-card"><div class="num">${locations}</div><div class="label">${lang === 'es' ? 'Sedes' : lang === 'it' ? 'Sedi' : lang === 'pt' ? 'Locais' : 'Venues'}</div></div>
      ${user.snipe_number ? `<div class="stat-card"><div class="num">#${escapeHtml(user.snipe_number)}</div><div class="label">${lang === 'es' ? 'Número de Vela' : lang === 'it' ? 'Numero Vela' : lang === 'pt' ? 'Número da Vela' : 'Sail Number'}</div></div>` : ""}
    </div>
    <div style="margin-bottom:20px;">
      <a href="/quick-log" class="btn btn-primary" style="background:linear-gradient(135deg,#f59e0b,#d97706);font-size:1rem;padding:12px 24px;">&#9889; Quick Race Entry</a>
      <a href="/log" class="btn-quick-log">${L('logRace')} (Detailed)</a>
    </div>
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
          <button class="btn btn-secondary btn-sm" onclick="shareWithCrew('race', ${log.id}, this)" style="background:#e0f2fe;color:#0b3d6e;border:1px solid #93c5fd;">&#128279; Share</button>
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

function coachingPage(raceLogs, uploads, pastReports, highlightUploadId, error, lang, successMsg, hasApiToken) {
  lang = lang || 'en';
  const raceCount = raceLogs.length;
  const practiceCount = raceLogs.filter(r => !r.finish_position && r.notes).length;
  const hasVakaros = uploads.length > 0;

  return `<div class="container">
    <!-- IMPORT VIA VAKAROS API — top of page, always visible -->
    <div style="margin-bottom:24px;padding:20px;border:3px solid #1a6fb5;border-radius:14px;background:linear-gradient(135deg,#eaf4ff,#dbeafe);">
      <h3 style="color:#0b3d6e;margin:0 0 16px;font-size:1.15rem;">&#9889; Import via Vakaros API</h3>

      <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:14px;">
        <div style="flex:1;min-width:260px;background:#fff;border:1px solid #bfdbfe;border-radius:10px;padding:14px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="font-weight:700;color:#0b3d6e;font-size:0.92rem;">1. API Token</span>
            ${hasApiToken ? '<span style="color:#059669;font-weight:700;font-size:0.9rem;">&#10003; Token saved</span>' : '<span style="color:#dc2626;font-size:0.85rem;">Not set</span>'}
          </div>
          <div style="display:flex;gap:8px;">
            <input type="text" id="vak-api-token" placeholder="Paste your Vakaros API token" style="flex:1;padding:8px 10px;border:2px solid #93c5fd;border-radius:8px;font-size:0.88rem;">
            <button class="btn btn-primary" style="padding:8px 16px;font-size:0.88rem;white-space:nowrap;" onclick="saveVakarosToken()">Save</button>
          </div>
          <div id="vak-token-status" style="margin-top:6px;font-size:0.82rem;"></div>
        </div>

        <div style="flex:1;min-width:260px;background:#fff;border:1px solid #bfdbfe;border-radius:10px;padding:14px;">
          <div style="font-weight:700;color:#0b3d6e;font-size:0.92rem;margin-bottom:8px;">2. Look Up Event</div>
          <div style="display:flex;gap:8px;">
            <input type="text" id="vak-event-id" placeholder="Event ID (e.g. my-regatta-2026)" style="flex:1;padding:8px 10px;border:2px solid #93c5fd;border-radius:8px;font-size:0.88rem;">
            <button class="btn btn-primary" style="padding:8px 16px;font-size:0.88rem;white-space:nowrap;" onclick="lookupVakarosEvent()">Look Up</button>
          </div>
          <div id="vak-event-status" style="margin-top:6px;font-size:0.82rem;"></div>
        </div>
      </div>

      <div id="vak-event-results" style="display:none;background:#fff;border:2px solid #86efac;border-radius:10px;padding:16px;">
        <div style="font-weight:700;color:#059669;font-size:0.95rem;margin-bottom:12px;">&#9989; Event Loaded &mdash; Select a division/race to import</div>
        <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;margin-bottom:12px;">
          <div style="flex:2;min-width:200px;">
            <label style="font-weight:600;color:#333;font-size:0.85rem;display:block;margin-bottom:4px;">Division / Race</label>
            <select id="vak-division-select" style="width:100%;padding:8px 10px;border:2px solid #93c5fd;border-radius:8px;font-size:0.88rem;" onchange="updateVakarosTimeRange()"></select>
          </div>
          <div style="flex:1;min-width:120px;">
            <label style="font-weight:600;color:#333;font-size:0.82rem;display:block;margin-bottom:3px;">Start</label>
            <input type="text" id="vak-after" readonly style="width:100%;padding:6px 8px;border:1px solid #e2e8f0;border-radius:6px;font-size:0.82rem;background:#f8fafc;color:#555;">
          </div>
          <div style="flex:1;min-width:120px;">
            <label style="font-weight:600;color:#333;font-size:0.82rem;display:block;margin-bottom:3px;">End</label>
            <input type="text" id="vak-before" readonly style="width:100%;padding:6px 8px;border:1px solid #e2e8f0;border-radius:6px;font-size:0.82rem;background:#f8fafc;color:#555;">
          </div>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <button class="btn btn-primary" style="padding:12px 28px;font-size:1rem;font-weight:700;" onclick="importVakarosEvent()">&#128229; Import Telemetry</button>
          <a id="vak-live-link" href="#" target="_blank" style="color:#1a6fb5;font-weight:700;font-size:0.95rem;text-decoration:none;">&#9881;&#65039; Watch Live &rarr;</a>
        </div>
        <div id="vak-import-status" style="margin-top:8px;font-size:0.85rem;"></div>
      </div>
    </div>

    <h2>&#127919; AI Sailing Coach <span class="sub">Personalized coaching based on your race history, results, and sensor data</span></h2>
    ${successMsg ? `<div class="alert alert-success" style="font-size:1rem;">${escapeHtml(successMsg)}</div>` : ""}
    ${error ? `<div class="alert alert-error">${escapeHtml(error)}</div>` : ""}

    <!-- PRIMARY: Get Coaching Report -->
    <div class="form-card wide" style="margin-bottom:24px;border:2px solid #0b3d6e;">
      <div style="text-align:center;margin-bottom:20px;">
        <h3 style="color:#0b3d6e;margin:0 0 8px;font-size:1.3rem;">Get My Coaching Report</h3>
        <p style="color:#555;font-size:0.93rem;margin:0;">Claude AI analyzes your complete sailing history and generates personalized coaching</p>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;font-size:0.88rem;font-weight:600;${raceCount > 0 ? 'background:#ecfdf5;color:#059669;border:1px solid #86efac' : 'background:#f1f5f9;color:#94a3b8;border:1px solid #e2e8f0'}">
          ${raceCount > 0 ? '&#9989;' : '&#9744;'} Race History (${raceCount} ${raceCount === 1 ? 'race' : 'races'})
        </div>
        <div style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;font-size:0.88rem;font-weight:600;${practiceCount > 0 ? 'background:#ecfdf5;color:#059669;border:1px solid #86efac' : 'background:#f1f5f9;color:#94a3b8;border:1px solid #e2e8f0'}">
          ${practiceCount > 0 ? '&#9989;' : '&#9744;'} Practice Notes (${practiceCount})
        </div>
        <div style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;font-size:0.88rem;font-weight:600;${hasVakaros ? 'background:#ecfdf5;color:#059669;border:1px solid #86efac' : 'background:#fff7ed;color:#c2410c;border:1px solid #fed7aa'}">
          ${hasVakaros ? '&#9989;' : '&#128314;'} Vakaros Data ${hasVakaros ? '(' + uploads.length + ' sessions)' : '(optional)'}
        </div>
      </div>

      ${raceCount === 0 ? `
        <div style="text-align:center;padding:16px;background:#fefce8;border-radius:10px;border:1px solid #fde68a;">
          <p style="color:#92400e;font-weight:600;margin:0;">Log at least one race or practice session to get coaching.</p>
          <a href="/quick-log" class="btn btn-primary" style="margin-top:12px;display:inline-block;">&#9889; Log Your First Race</a>
        </div>
      ` : `
        <div style="text-align:center;">
          <button class="btn-coaching btn-analyze" id="full-coaching-btn" onclick="requestFullCoaching()" style="padding:16px 40px;font-size:1.15rem;">
            &#129302; Generate My Coaching Report
          </button>
          <div id="full-coaching-result"></div>
          <p style="color:#888;font-size:0.8rem;margin-top:10px;">Analysis uses Claude AI to review all your logged data</p>
        </div>
      `}
    </div>

    ${!hasVakaros ? `
    <div style="background:linear-gradient(135deg,#f0f7ff,#e6f0fa);border:2px solid #93c5fd;border-radius:14px;padding:20px;margin-bottom:20px;">
      <div style="display:flex;align-items:flex-start;gap:14px;flex-wrap:wrap;">
        <div style="font-size:2rem;flex-shrink:0;">&#128225;</div>
        <div style="flex:1;min-width:200px;">
          <p style="color:#0b3d6e;font-weight:700;font-size:1.05rem;margin:0 0 6px;">Get deeper coaching with Vakaros</p>
          <p style="color:#555;font-size:0.9rem;margin:0 0 10px;">If you use a Vakaros Atlas or Edge, share your sessions directly to Snipeovation after each sail. Your coach will analyze speed, heel angle, VMG, tacking efficiency, and trends across every session.</p>
          <div style="background:#fff;border:1px solid #d0e2f7;border-radius:10px;padding:12px 14px;font-size:0.85rem;color:#444;margin-bottom:10px;">
            <strong>How it works:</strong> After sailing, open Vakaros Connect &rarr; Sessions &rarr; Export &rarr; Share &rarr; choose Snipeovation. That's it &mdash; your data flows into your next coaching report automatically.
          </div>
          <p style="color:#888;font-size:0.82rem;margin:0;">No Vakaros? No problem &mdash; coaching works great with just your race logs. Vakaros adds optional telemetry depth.</p>
        </div>
      </div>
    </div>
    ` : ''}

    <!-- Past coaching reports -->
    ${pastReports.length > 0 ? `
    <h3 style="color:#0b3d6e;margin-bottom:12px;">Past Coaching Reports</h3>
    ${pastReports.map(r => `
      <div class="vak-history-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
          <div>
            <h4>Coaching Report &mdash; ${escapeHtml(r.created_at.slice(0,10))}</h4>
            <div class="vak-history-meta">${r.race_count} races analyzed${r.has_vakaros ? ' &bull; includes Vakaros data' : ''}</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" onclick="shareWithCrew('coaching', ${r.id}, this)" style="background:#e0f2fe;color:#0b3d6e;border:1px solid #93c5fd;font-size:0.8rem;padding:4px 12px;">&#128279; Share with Crew</button>
            <form method="POST" action="/coaching/delete/${r.id}" style="display:inline;" onsubmit="return confirm('Delete this coaching report?')">
              <button type="submit" class="btn btn-danger">Delete</button>
            </form>
          </div>
        </div>
        <details style="margin-top:8px;">
          <summary style="cursor:pointer;color:#0b3d6e;font-weight:600;font-size:0.9rem;">View Report</summary>
          <div class="vak-coaching-report" id="coaching-past-${r.id}" style="margin-top:8px;">${r.coaching_report.replace(/## /g, '<h3>').replace(/\n/g, '<br>')}</div>
          <div style="margin-top:8px;display:flex;gap:12px;flex-wrap:wrap;">
            <button class="btn-coaching btn-read-aloud" onclick="toggleReadAloud(this, 'coaching-past-${r.id}')">&#128266; Read Aloud</button>
          </div>
        </details>
      </div>
    `).join("")}
    ` : ''}

    <!-- SECONDARY: Vakaros Upload -->
    <details style="margin-top:24px;" ${uploads.length > 0 ? 'open' : ''}>
      <summary style="cursor:pointer;color:#0b3d6e;font-weight:700;font-size:1.1rem;padding:12px 0;">
        &#128225; Vakaros Sensor Data ${uploads.length > 0 ? '<span style="font-size:0.85rem;color:#059669;font-weight:600;">(' + uploads.length + ' uploaded)</span>' : '<span style="font-size:0.85rem;color:#888;font-weight:400;">(optional &mdash; enhances coaching)</span>'}
      </summary>

      <div class="form-card wide" style="margin-top:12px;margin-bottom:16px;">
        <div style="background:#f0f7ff;border:1px solid #d0e2f7;border-radius:12px;padding:16px;margin-bottom:16px;">
          <h4 style="color:#0b3d6e;margin:0 0 10px;font-size:0.9rem;">Share from Vakaros (installed app):</h4>
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="background:#0b3d6e;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;flex-shrink:0;">1</span>
              <span style="font-size:0.88rem;color:#333;">Open <strong>Vakaros Connect</strong> &rarr; <strong>Sessions</strong> &rarr; select session</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="background:#059669;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;flex-shrink:0;">2</span>
              <span style="font-size:0.88rem;color:#333;">Tap <strong>Export</strong> &rarr; <strong>Share</strong> &rarr; choose <strong>Snipeovation</strong></span>
            </div>
          </div>
          <p style="color:#059669;font-weight:600;font-size:0.85rem;margin:0;">Data appears here automatically!</p>
          <hr style="border:none;border-top:1px solid #d0e2f7;margin:12px 0;">
          <p style="color:#555;font-size:0.82rem;margin:0;">Or upload manually below. <a href="#" onclick="if(window.deferredPwaPrompt){window.deferredPwaPrompt.prompt();}else{alert('Open in your mobile browser and tap Add to Home Screen.');}return false;" style="color:#1a6fb5;font-weight:600;">Install app for sharing</a></p>
        </div>

        <form method="POST" action="/vakaros/upload" enctype="multipart/form-data">
          <div class="vak-upload-zone" id="vak-dropzone" onclick="document.getElementById('vak-file-input').click()">
            <div style="background:linear-gradient(135deg,#0b3d6e,#1565c0);color:#fff;display:inline-block;padding:12px 28px;border-radius:12px;font-size:1rem;font-weight:700;margin-bottom:8px;">&#128194; Choose CSV File</div>
            <p style="color:#666;font-size:0.85rem;">Tap to choose your Vakaros CSV file</p>
            <div id="vak-file-status" style="display:none;margin-top:10px;padding:8px 14px;background:#ecfdf5;border:2px solid #86efac;border-radius:10px;">
              <span style="color:#059669;font-weight:700;">&#9989;</span>
              <span style="color:#059669;font-weight:600;font-size:0.9rem;" id="vak-file-name"></span>
            </div>
            <input type="file" name="vakaros_csv" id="vak-file-input" accept=".csv,.txt,.vkx" style="display:none">
          </div>
          <div style="margin-top:12px;">
            <label style="font-weight:600;color:#333;font-size:0.85rem;display:block;margin-bottom:4px;">Link to Race Log (optional)</label>
            <select name="race_log_id" style="width:100%;padding:8px 10px;border:2px solid #e2e8f0;border-radius:8px;font-size:0.9rem;">
              <option value="">-- No linked race --</option>
              ${raceLogs.map(r => `<option value="${r.id}">${escapeHtml(r.race_date)} &mdash; ${escapeHtml(r.race_name)}${r.location ? " (" + escapeHtml(r.location) + ")" : ""}</option>`).join("")}
            </select>
          </div>
          <div style="margin-top:12px;text-align:center;">
            <button type="submit" class="btn btn-primary" style="padding:10px 28px;">Upload Vakaros Data</button>
          </div>
        </form>
      </div>

      ${uploads.length > 0 ? `
      <h4 style="color:#0b3d6e;margin-bottom:10px;">Your Vakaros Sessions (${uploads.length})</h4>
      <p style="color:#666;font-size:0.82rem;margin-bottom:10px;">All sessions are included in your coaching analysis.</p>
      ${uploads.map((u, idx) => `
        <div class="vak-history-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
            <div>
              <h4 style="font-size:0.95rem;">
                <span style="color:#0b3d6e;font-size:0.8rem;">#${uploads.length - idx}</span>
                ${escapeHtml(u.created_at.slice(0,10))} &mdash; ${escapeHtml(u.filename || 'Vakaros Data')}${u.race_name ? ' (' + escapeHtml(u.race_name) + ')' : ''}
              </h4>
              <div class="vak-history-meta">${u.duration_minutes}m &bull; ${u.avg_speed} kts avg &bull; ${u.max_speed} kts max &bull; ${u.avg_heel}&deg; heel &bull; VMG ${u.avg_vmg} kts &bull; ${u.tack_count} tacks &bull; ${u.gybe_count} gybes &bull; ${u.distance_nm} nm</div>
            </div>
            <form method="POST" action="/vakaros/delete/${u.id}" style="display:inline;" onsubmit="return confirm('Delete this session? It will be removed from future coaching analysis.')">
              <button type="submit" class="btn btn-danger">Delete</button>
            </form>
          </div>
        </div>
      `).join("")}
      ` : ''}
    </details>
  </div>

  <script>
  // File selection
  (function() {
    var zone = document.getElementById('vak-dropzone');
    var fileInput = document.getElementById('vak-file-input');
    var fileStatus = document.getElementById('vak-file-status');
    var fileName = document.getElementById('vak-file-name');
    if (!zone || !fileInput) return;
    function showFile(name) {
      fileName.textContent = name;
      fileStatus.style.display = 'block';
      zone.style.borderColor = '#059669';
      zone.style.background = '#f0fdf4';
    }
    ['dragenter','dragover'].forEach(function(e) {
      zone.addEventListener(e, function(ev) { ev.preventDefault(); zone.classList.add('dragover'); });
    });
    ['dragleave','drop'].forEach(function(e) {
      zone.addEventListener(e, function(ev) { ev.preventDefault(); zone.classList.remove('dragover'); });
    });
    zone.addEventListener('drop', function(ev) {
      if (ev.dataTransfer.files.length) {
        fileInput.files = ev.dataTransfer.files;
        showFile(ev.dataTransfer.files[0].name);
      }
    });
    fileInput.addEventListener('change', function() {
      if (fileInput.files.length) showFile(fileInput.files[0].name);
    });
  })();

  // --- Vakaros API integration ---
  var _vakEventData = null;

  function saveVakarosToken() {
    var token = document.getElementById('vak-api-token').value.trim();
    var status = document.getElementById('vak-token-status');
    if (!token) { status.innerHTML = '<span style="color:#dc2626;">Please enter a token.</span>'; return; }
    status.innerHTML = '<span style="color:#888;">Saving...</span>';
    fetch('/vakaros/token', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({api_token:token}) })
      .then(function(r){ return r.json(); })
      .then(function(d){
        if (d.error) { status.innerHTML = '<span style="color:#dc2626;">' + d.error + '</span>'; return; }
        status.innerHTML = '<span style="color:#059669;font-weight:700;">&#10003; Token saved!</span>';
      })
      .catch(function(){ status.innerHTML = '<span style="color:#dc2626;">Network error.</span>'; });
  }

  function lookupVakarosEvent() {
    var eventId = document.getElementById('vak-event-id').value.trim();
    var status = document.getElementById('vak-event-status');
    var results = document.getElementById('vak-event-results');
    if (!eventId) { status.innerHTML = '<span style="color:#dc2626;">Enter an Event ID.</span>'; return; }
    status.innerHTML = '<span style="color:#888;">Looking up event...</span>';
    results.style.display = 'none';
    fetch('/vakaros/api/events/' + encodeURIComponent(eventId))
      .then(function(r){ return r.json(); })
      .then(function(data){
        if (data.error) { status.innerHTML = '<span style="color:#dc2626;">' + data.error + '</span>'; return; }
        _vakEventData = data;
        status.innerHTML = '<span style="color:#059669;">&#10003; Event found!</span>';

        // Populate division/race dropdown
        var sel = document.getElementById('vak-division-select');
        sel.innerHTML = '';
        var divisions = (data.summary && data.summary.divisions) || [];
        var times = (data.times && data.times.divisions) || data.times || {};
        divisions.forEach(function(div){
          var races = div.races || [];
          if (races.length === 0) {
            var opt = document.createElement('option');
            opt.value = JSON.stringify({division:div.division, after:'', before:''});
            opt.textContent = div.division + ' (no races)';
            sel.appendChild(opt);
          } else {
            races.forEach(function(race, ri){
              var opt = document.createElement('option');
              var after = race.start || race.after || '';
              var before = race.end || race.before || '';
              opt.value = JSON.stringify({division:div.division, after:after, before:before, race:race.race||ri+1});
              opt.textContent = div.division + ' — Race ' + (race.race||ri+1) + (after ? ' (' + new Date(after).toLocaleString() + ')' : '');
              sel.appendChild(opt);
            });
          }
        });
        if (sel.options.length === 0) {
          var opt = document.createElement('option');
          opt.value = JSON.stringify({division:'', after:'', before:''});
          opt.textContent = 'All data (no divisions found)';
          sel.appendChild(opt);
        }
        updateVakarosTimeRange();
        document.getElementById('vak-live-link').href = '/vakaros/live/' + encodeURIComponent(eventId);
        results.style.display = 'block';
      })
      .catch(function(){ status.innerHTML = '<span style="color:#dc2626;">Network error. Is your API token saved?</span>'; });
  }

  function updateVakarosTimeRange() {
    var sel = document.getElementById('vak-division-select');
    if (!sel.value) return;
    try {
      var v = JSON.parse(sel.value);
      document.getElementById('vak-after').value = v.after ? new Date(v.after).toLocaleString() : '(auto)';
      document.getElementById('vak-before').value = v.before ? new Date(v.before).toLocaleString() : '(auto)';
    } catch(e){}
  }

  function importVakarosEvent() {
    var sel = document.getElementById('vak-division-select');
    var eventId = document.getElementById('vak-event-id').value.trim();
    var status = document.getElementById('vak-import-status');
    if (!sel.value || !eventId) { status.innerHTML = '<span style="color:#dc2626;">Select a division/race first.</span>'; return; }
    var v;
    try { v = JSON.parse(sel.value); } catch(e){ return; }
    status.innerHTML = '<span style="color:#888;">&#9203; Importing telemetry...</span>';
    var body = { event_id: eventId, division: v.division || '', after: v.after || '', before: v.before || '' };
    if (v.race) body.label = eventId + ' / ' + v.division + ' Race ' + v.race;
    fetch('/vakaros/import-event', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
      .then(function(r){ return r.json(); })
      .then(function(data){
        if (data.error) { status.innerHTML = '<span style="color:#dc2626;">' + data.error + '</span>'; return; }
        status.innerHTML = '<span style="color:#059669;font-weight:700;">&#10003; Imported ' + data.stats.rowCount + ' rows (' + data.stats.durationMinutes + 'm, ' + data.stats.avgSpeed + ' kts avg). Reloading...</span>';
        setTimeout(function(){ window.location.reload(); }, 1500);
      })
      .catch(function(){ status.innerHTML = '<span style="color:#dc2626;">Import failed. Check your token and event ID.</span>'; });
  }

  // Full coaching report (no upload needed)
  function requestFullCoaching() {
    var btn = document.getElementById('full-coaching-btn');
    var resultDiv = document.getElementById('full-coaching-result');
    if (!btn || !resultDiv) return;
    btn.disabled = true;
    btn.innerHTML = '<span class="vak-spinner"></span> Claude AI is analyzing your sailing history...';
    fetch('/coaching/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.error) {
          btn.innerHTML = '&#129302; Generate My Coaching Report';
          btn.disabled = false;
          resultDiv.innerHTML = '<div class="alert alert-error" style="margin-top:12px;">' + data.error + '</div>';
          return;
        }
        btn.style.display = 'none';
        var reportHtml = data.report.replace(/## /g, '<h3>').replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
        resultDiv.innerHTML = '<div class="vak-coaching-report" id="full-coaching-report" style="margin-top:20px;">' + reportHtml + '</div>' +
          '<div style="margin-top:12px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">' +
          '<button class="btn-coaching btn-read-aloud" onclick="toggleReadAloud(this, \\'full-coaching-report\\')">&#128266; Read Aloud</button>' +
          (data.reportId ? '<button class="btn btn-secondary btn-sm" onclick="shareWithCrew(\\'coaching\\', ' + data.reportId + ', this)" style="background:#e0f2fe;color:#0b3d6e;border:1px solid #93c5fd;padding:8px 18px;border-radius:8px;font-weight:600;">&#128279; Share with Crew</button>' : '') +
          '</div>';
        document.getElementById('full-coaching-report').scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
      .catch(function(err) {
        btn.innerHTML = '&#129302; Generate My Coaching Report';
        btn.disabled = false;
        resultDiv.innerHTML = '<div class="alert alert-error" style="margin-top:12px;">Request failed. Check your connection.</div>';
      });
  }

  // Read Aloud with Web Speech API
  var currentUtterance = null;
  function toggleReadAloud(btn, reportId) {
    if (currentUtterance && speechSynthesis.speaking) {
      speechSynthesis.cancel();
      currentUtterance = null;
      btn.innerHTML = '&#128266; Read Aloud';
      btn.classList.remove('speaking');
      return;
    }
    var el = document.getElementById(reportId);
    if (!el) return;
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }
    var text = el.innerText || el.textContent;
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.rate = 0.95;
    currentUtterance.onend = function() {
      btn.innerHTML = '&#128266; Read Aloud';
      btn.classList.remove('speaking');
      currentUtterance = null;
    };
    btn.innerHTML = '&#9209; Stop Reading';
    btn.classList.add('speaking');
    speechSynthesis.speak(currentUtterance);
  }
  </script>`;
}

function quickLogPage(data, error, lang, lastBoatNumber, userBoats, dataSharing) {
  lang = lang || 'en';
  const L = (k) => t(k, lang);
  const d = data || {};
  const today = new Date().toISOString().slice(0, 10);
  const dateVal = d.race_date || today;
  const donQActive = today >= '2026-04-05' && today <= '2026-04-07';
  const defaultRaceName = d.race_name || (donQActive ? 'Don Q Regatta' : '');
  const isPractice = d.entry_mode === 'practice';
  const dsVal = dataSharing || '';
  return `<div class="quick-race-container">
    <div class="quick-race-header">
      <h2>&#9889; Quick Entry</h2>
      <div class="quick-race-subtitle">Log a race or practice in seconds</div>
    </div>
    ${error ? `<div class="alert alert-error" style="margin-bottom:16px;font-size:1rem;">${escapeHtml(error)}</div>` : ""}
    <div class="quick-race-card">
      <form method="POST" action="/quick-log" id="quick-form">
        <input type="hidden" name="entry_mode" id="entry-mode" value="${isPractice ? 'practice' : 'race'}">

        <div class="quick-mode-toggle">
          <button type="button" id="mode-race" class="quick-mode-btn${!isPractice ? ' active-race' : ''}" onclick="setMode('race')">&#127937; Race</button>
          <button type="button" id="mode-practice" class="quick-mode-btn${isPractice ? ' active-practice' : ''}" onclick="setMode('practice')">&#9973; Practice</button>
        </div>

        <!-- Data Sharing Preference Card -->
        <div id="ds-card" style="margin:12px 0 16px;padding:14px 16px;border-radius:10px;border:2px solid ${dsVal === 'share' ? '#059669' : dsVal === 'private' ? '#0b3d6e' : '#e2e8f0'};background:${dsVal === 'share' ? '#ecfdf5' : dsVal === 'private' ? '#eff6ff' : '#f8fafc'};">
          <div style="font-size:0.82rem;color:#555;font-weight:600;margin-bottom:10px;">${L('dataSharing')}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div style="display:flex;flex-direction:column;gap:5px;">
              <button type="button" id="ds-share-btn" onclick="setDataSharing('share')" style="padding:8px 12px;border-radius:8px;font-size:0.82rem;font-weight:700;cursor:pointer;transition:all 0.2s;border:2px solid ${dsVal === 'share' ? '#059669' : '#d1d5db'};background:${dsVal === 'share' ? '#059669' : '#fff'};color:${dsVal === 'share' ? '#fff' : '#6b7280'};width:100%;">&#127760; ${L('dsShareBtn')}</button>
              <div id="ds-share-desc" style="font-size:0.74rem;line-height:1.4;color:${dsVal === 'share' ? '#065f46' : '#94a3b8'};padding:0 2px;">${L('dsShareDesc')}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:5px;">
              <button type="button" id="ds-private-btn" onclick="setDataSharing('private')" style="padding:8px 12px;border-radius:8px;font-size:0.82rem;font-weight:700;cursor:pointer;transition:all 0.2s;border:2px solid ${dsVal === 'private' ? '#0b3d6e' : '#d1d5db'};background:${dsVal === 'private' ? '#0b3d6e' : '#fff'};color:${dsVal === 'private' ? '#fff' : '#6b7280'};width:100%;">&#128274; ${L('dsPrivateBtn')}</button>
              <div id="ds-private-desc" style="font-size:0.74rem;line-height:1.4;color:${dsVal === 'private' ? '#1e3a5f' : '#94a3b8'};padding:0 2px;">${L('dsPrivateDesc')}</div>
            </div>
          </div>
        </div>

        <div class="quick-race-field">
          <label>Date</label>
          <input type="date" name="race_date" value="${escapeHtml(dateVal)}" required>
        </div>

        <div id="section-race" style="${isPractice ? 'display:none' : ''}">
          <div class="quick-race-field">
            <label>Regatta / Event</label>
            <div class="quick-voice-wrap">
              <input type="text" name="race_name" id="race-name-input" value="${escapeHtml(defaultRaceName)}" placeholder="e.g. Midwinters Race 3" autocomplete="off">
              <button type="button" class="quick-mic" data-target="race-name-input" aria-label="Voice input">&#127908;</button>
            </div>
          </div>
          <div class="quick-race-field">
            <label>Finish Position</label>
            <div class="quick-race-position-row">
              <input type="number" name="finish_position" value="${escapeHtml(d.finish_position || '')}" placeholder="#" min="1" inputmode="numeric">
              <span class="qr-of">of</span>
              <input type="number" name="fleet_size" value="${escapeHtml(d.fleet_size || '')}" placeholder="boats" min="1" inputmode="numeric">
            </div>
          </div>
        </div>

        <div id="section-practice" style="${!isPractice ? 'display:none' : ''}">
          <div class="quick-race-field">
            <label>Session Name</label>
            <div class="quick-voice-wrap">
              <input type="text" id="practice-name-input" value="${escapeHtml(isPractice ? (d.race_name || '') : '')}" placeholder="e.g. Tuesday Practice" autocomplete="off">
              <button type="button" class="quick-mic" data-target="practice-name-input" aria-label="Voice input">&#127908;</button>
            </div>
          </div>
          <div class="quick-race-field">
            <label>Session Focus</label>
            <div class="quick-practice-chips">
              <label><input type="radio" name="session_focus" value="Upwind tuning"${d.session_focus === 'Upwind tuning' ? ' checked' : ''}><span class="quick-chip">&#127788;&#65039; Upwind tuning</span></label>
              <label><input type="radio" name="session_focus" value="Tacking drills"${d.session_focus === 'Tacking drills' ? ' checked' : ''}><span class="quick-chip">&#8635; Tacking drills</span></label>
              <label><input type="radio" name="session_focus" value="Starts"${d.session_focus === 'Starts' ? ' checked' : ''}><span class="quick-chip">&#127937; Starts</span></label>
              <label><input type="radio" name="session_focus" value="Downwind speed"${d.session_focus === 'Downwind speed' ? ' checked' : ''}><span class="quick-chip">&#128168; Downwind speed</span></label>
              <label><input type="radio" name="session_focus" value="Mark roundings"${d.session_focus === 'Mark roundings' ? ' checked' : ''}><span class="quick-chip">&#128204; Mark roundings</span></label>
              <label><input type="radio" name="session_focus" value="Boat handling"${d.session_focus === 'Boat handling' ? ' checked' : ''}><span class="quick-chip">&#9973; Boat handling</span></label>
            </div>
          </div>
          <div class="quick-race-field">
            <label>Wind Conditions</label>
            <div class="quick-voice-wrap" style="position:relative;">
              <input type="text" name="wind_speed" id="wind-speed-input" value="${escapeHtml(d.wind_speed || '')}" placeholder="e.g. 12-15 kts SW" autocomplete="off" style="padding-right:52px;">
              <button type="button" class="quick-mic" data-target="wind-speed-input" aria-label="Voice input" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);width:40px;height:40px;border-radius:50%;background:#e8f0fe;border:2px solid #cbd5e0;font-size:1.3rem;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#0b3d6e;padding:0;line-height:1;z-index:2;">&#127908;</button>
            </div>
          </div>
        </div>

        <div class="quick-race-field">
          <label>Boat Number</label>
          ${(function() {
            const boats = userBoats || [];
            const curVal = d.boat_number || lastBoatNumber || (boats.find(b => b.is_default) || boats[0] || {}).sail_number || '';
            if (boats.length === 0) {
              return '<input type="text" name="boat_number" value="' + escapeHtml(curVal) + '" placeholder="e.g. 31234" style="padding:10px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.95rem;width:100%;">';
            }
            const boatNums = boats.map(b => b.sail_number);
            const isOther = curVal && !boatNums.includes(curVal);
            return '<select id="qb-select" onchange="var oi=document.getElementById(\'qb-other\');var hi=document.getElementById(\'qb-hidden\');if(this.value===\'other\'){oi.style.display=\'block\';oi.focus();hi.value=oi.value;}else{oi.style.display=\'none\';hi.value=this.value;}" style="padding:10px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.95rem;width:100%;">'
              + boats.map(function(b) { return '<option value="' + escapeHtml(b.sail_number) + '"' + (curVal === b.sail_number ? ' selected' : '') + '>' + escapeHtml(b.sail_number) + (b.nickname ? ' — ' + escapeHtml(b.nickname) : '') + '</option>'; }).join('')
              + '<option value="other"' + (isOther ? ' selected' : '') + '>Other...</option>'
              + '</select>'
              + '<input type="text" id="qb-other" placeholder="e.g. 31234" value="' + (isOther ? escapeHtml(curVal) : '') + '" oninput="document.getElementById(\'qb-hidden\').value=this.value" style="display:' + (isOther ? 'block' : 'none') + ';margin-top:6px;padding:10px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.95rem;width:100%;">'
              + '<input type="hidden" name="boat_number" id="qb-hidden" value="' + escapeHtml(curVal) + '">';
          })()}
        </div>

        <div class="quick-race-field">
          <label>Notes <span style="font-weight:400;color:#94a3b8;">(optional)</span></label>
          <div class="quick-voice-wrap">
            <textarea name="notes" placeholder="${isPractice ? 'What you worked on, what clicked...' : 'Wind, conditions, key moments...'}" id="notes-field">${escapeHtml(d.notes || '')}</textarea>
            <button type="button" class="quick-mic" data-target="notes-field" aria-label="Voice input">&#127908;</button>
          </div>
        </div>
        <div class="quick-race-actions">
          <button type="submit" class="btn-quick-save" id="save-btn">Save Race</button>
          <a href="/dashboard" class="btn-quick-cancel">Cancel</a>
        </div>
      </form>
    </div>
    <div class="quick-race-link-row">
      <a href="/log">Need full details? Use the detailed form &rarr;</a>
    </div>
  </div>
  <script>
  function setDataSharing(choice) {
    fetch('/data-sharing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: 'data_sharing=' + encodeURIComponent(choice)
    }).then(function(r) { return r.json(); }).then(function(d) {
      if (!d.ok) return;
      var card = document.getElementById('ds-card');
      var shareBtn = document.getElementById('ds-share-btn');
      var privBtn = document.getElementById('ds-private-btn');
      var shareDesc = document.getElementById('ds-share-desc');
      var privDesc = document.getElementById('ds-private-desc');
      if (choice === 'share') {
        card.style.borderColor = '#059669'; card.style.background = '#ecfdf5';
        shareBtn.style.borderColor = '#059669'; shareBtn.style.background = '#059669'; shareBtn.style.color = '#fff';
        privBtn.style.borderColor = '#d1d5db'; privBtn.style.background = '#fff'; privBtn.style.color = '#6b7280';
        shareDesc.style.color = '#065f46'; privDesc.style.color = '#94a3b8';
      } else {
        card.style.borderColor = '#0b3d6e'; card.style.background = '#eff6ff';
        privBtn.style.borderColor = '#0b3d6e'; privBtn.style.background = '#0b3d6e'; privBtn.style.color = '#fff';
        shareBtn.style.borderColor = '#d1d5db'; shareBtn.style.background = '#fff'; shareBtn.style.color = '#6b7280';
        privDesc.style.color = '#1e3a5f'; shareDesc.style.color = '#94a3b8';
      }
    });
  }
  function setMode(mode) {
    var modeInput = document.getElementById('entry-mode');
    var raceBtn = document.getElementById('mode-race');
    var practiceBtn = document.getElementById('mode-practice');
    var raceSection = document.getElementById('section-race');
    var practiceSection = document.getElementById('section-practice');
    var saveBtn = document.getElementById('save-btn');
    var notesField = document.getElementById('notes-field');
    var raceNameInput = document.getElementById('race-name-input');
    var practiceNameInput = document.getElementById('practice-name-input');

    modeInput.value = mode;

    if (mode === 'practice') {
      raceBtn.className = 'quick-mode-btn';
      practiceBtn.className = 'quick-mode-btn active-practice';
      raceSection.style.display = 'none';
      practiceSection.style.display = '';
      saveBtn.textContent = 'Save Practice';
      saveBtn.className = 'btn-quick-save practice-mode';
      notesField.placeholder = 'What you worked on, what clicked...';
      raceNameInput.removeAttribute('required');
    } else {
      raceBtn.className = 'quick-mode-btn active-race';
      practiceBtn.className = 'quick-mode-btn';
      raceSection.style.display = '';
      practiceSection.style.display = 'none';
      saveBtn.textContent = 'Save Race';
      saveBtn.className = 'btn-quick-save';
      notesField.placeholder = 'Wind, conditions, key moments...';
    }
  }

  // Voice input
  (function() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var mics = document.querySelectorAll('.quick-mic');
    if (!SR) {
      for (var i = 0; i < mics.length; i++) mics[i].style.display = 'none';
      return;
    }
    var activeRec = null;
    var activeBtn = null;
    function stopCurrent() {
      if (activeRec) { activeRec.abort(); activeRec = null; }
      if (activeBtn) { activeBtn.innerHTML = '\\u{1F3A4}'; activeBtn.classList.remove('qm-listening'); activeBtn = null; }
    }
    for (var i = 0; i < mics.length; i++) {
      mics[i].addEventListener('click', function() {
        var btn = this;
        var targetId = btn.getAttribute('data-target');
        var field = document.getElementById(targetId);
        if (!field) return;
        if (activeBtn === btn) { stopCurrent(); return; }
        stopCurrent();
        var rec = new SR();
        rec.lang = '${lang === "es" ? "es-ES" : lang === "it" ? "it-IT" : lang === "pt" ? "pt-BR" : "en-US"}';
        rec.interimResults = false;
        rec.continuous = false;
        activeRec = rec;
        activeBtn = btn;
        btn.innerHTML = '\\u23F9';
        btn.classList.add('qm-listening');
        rec.onresult = function(e) {
          var text = e.results[0][0].transcript;
          if (field.value && field.tagName === 'TEXTAREA') {
            field.value += ' ' + text;
          } else {
            field.value = text;
          }
          field.focus();
        };
        rec.onend = function() { stopCurrent(); };
        rec.onerror = function() { stopCurrent(); };
        rec.start();
      });
    }
  })();

  document.getElementById('quick-form').addEventListener('submit', function(e) {
    var mode = document.getElementById('entry-mode').value;
    var raceNameInput = document.getElementById('race-name-input');
    var practiceNameInput = document.getElementById('practice-name-input');
    if (mode === 'race') {
      if (!raceNameInput.value.trim()) {
        e.preventDefault();
        raceNameInput.focus();
        raceNameInput.style.borderColor = '#e53e3e';
        return;
      }
      raceNameInput.name = 'race_name';
      practiceNameInput.removeAttribute('name');
    } else {
      practiceNameInput.name = 'race_name';
      raceNameInput.removeAttribute('name');
      if (!practiceNameInput.value.trim()) {
        practiceNameInput.value = 'Practice Session';
      }
    }
  });
  </script>`;
}

function logFormPage(data, error, userWireDefault, lang, dataSharing, lastBoatNumber, userBoats) {
  userWireDefault = userWireDefault || '';
  lang = lang || 'en';
  const L = (k) => t(k, lang);
  const isEdit = data && data.id;
  const d = data || {};
  const today = new Date().toISOString().slice(0, 10);
  const dateVal = d.race_date || "";
  const donQActive = today >= '2026-04-05' && today <= '2026-04-07';
  const defaultRaceName = d.race_name || (!isEdit && donQActive ? 'Don Q Regatta' : '');
  const dsVal = dataSharing || '';
  return `<div class="container">
    <h2>${isEdit ? L('editRaceLog') : L('logARace')}</h2>
    ${error ? `<div class="alert alert-error">${escapeHtml(error)}</div>` : ""}

    <!-- Data Sharing Preference Card -->
    <div id="ds-card" style="margin-bottom:20px;padding:16px 20px;border-radius:12px;border:2px solid ${dsVal === 'share' ? '#059669' : dsVal === 'private' ? '#0b3d6e' : '#e2e8f0'};background:${dsVal === 'share' ? '#ecfdf5' : dsVal === 'private' ? '#eff6ff' : '#f8fafc'};">
      <div style="font-size:0.85rem;color:#555;font-weight:600;margin-bottom:12px;">${L('dataSharing')}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div style="display:flex;flex-direction:column;gap:6px;">
          <button type="button" id="ds-share-btn" onclick="setDataSharing('share')" style="padding:10px 16px;border-radius:8px;font-size:0.85rem;font-weight:700;cursor:pointer;transition:all 0.2s;border:2px solid ${dsVal === 'share' ? '#059669' : '#d1d5db'};background:${dsVal === 'share' ? '#059669' : '#fff'};color:${dsVal === 'share' ? '#fff' : '#6b7280'};width:100%;">&#127760; ${L('dsShareBtn')}</button>
          <div id="ds-share-desc" style="font-size:0.78rem;line-height:1.4;color:${dsVal === 'share' ? '#065f46' : '#94a3b8'};padding:0 2px;">${L('dsShareDesc')}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          <button type="button" id="ds-private-btn" onclick="setDataSharing('private')" style="padding:10px 16px;border-radius:8px;font-size:0.85rem;font-weight:700;cursor:pointer;transition:all 0.2s;border:2px solid ${dsVal === 'private' ? '#0b3d6e' : '#d1d5db'};background:${dsVal === 'private' ? '#0b3d6e' : '#fff'};color:${dsVal === 'private' ? '#fff' : '#6b7280'};width:100%;">&#128274; ${L('dsPrivateBtn')}</button>
          <div id="ds-private-desc" style="font-size:0.78rem;line-height:1.4;color:${dsVal === 'private' ? '#1e3a5f' : '#94a3b8'};padding:0 2px;">${L('dsPrivateDesc')}</div>
        </div>
      </div>
    </div>
    <script>
    function setDataSharing(choice) {
      fetch('/data-sharing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
        body: 'data_sharing=' + encodeURIComponent(choice)
      }).then(function(r) { return r.json(); }).then(function(d) {
        if (!d.ok) return;
        var card = document.getElementById('ds-card');
        var shareBtn = document.getElementById('ds-share-btn');
        var privBtn = document.getElementById('ds-private-btn');
        var shareDesc = document.getElementById('ds-share-desc');
        var privDesc = document.getElementById('ds-private-desc');
        if (choice === 'share') {
          card.style.borderColor = '#059669'; card.style.background = '#ecfdf5';
          shareBtn.style.borderColor = '#059669'; shareBtn.style.background = '#059669'; shareBtn.style.color = '#fff';
          privBtn.style.borderColor = '#d1d5db'; privBtn.style.background = '#fff'; privBtn.style.color = '#6b7280';
          shareDesc.style.color = '#065f46'; privDesc.style.color = '#94a3b8';
        } else {
          card.style.borderColor = '#0b3d6e'; card.style.background = '#eff6ff';
          privBtn.style.borderColor = '#0b3d6e'; privBtn.style.background = '#0b3d6e'; privBtn.style.color = '#fff';
          shareBtn.style.borderColor = '#d1d5db'; shareBtn.style.background = '#fff'; shareBtn.style.color = '#6b7280';
          privDesc.style.color = '#1e3a5f'; shareDesc.style.color = '#94a3b8';
        }
      });
    }
    </script>

    <div class="form-card wide">
      <form method="POST" action="${isEdit ? "/edit/" + d.id : "/log"}">
        <div class="form-grid">

          <div class="form-section">${L('event')}</div>
          <div class="form-group full">
  <label>⛵ Snipe Builder</label>
  <select name="snipe_builder" style="padding:10px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.95rem;width:100%;">
    <option value="">-- Select Builder --</option>
    <option value="Persson"${d.snipe_builder==='Persson'?' selected':''}>Persson</option>
    <option value="DB"${d.snipe_builder==='DB'?' selected':''}>DB</option>
    <option value="MAS"${d.snipe_builder==='MAS'?' selected':''}>MAS</option>
    <option value="Jibetech"${d.snipe_builder==='Jibetech'?' selected':''}>Jibetech</option>
    <option value="Zeltcc"${d.snipe_builder==='Zeltcc'?' selected':''}>Zeltcc</option>
    <option value="J2 Lemao"${d.snipe_builder==='J2 Lemao'?' selected':''}>J2 Lemao</option>
  </select>
</div><div class="form-group">
            <label>${L('raceName')} *</label>
            <input type="text" name="race_name" value="${escapeHtml(defaultRaceName)}" placeholder="${L('egRaceName')}" required>
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
            ${(function() {
              const boats = userBoats || [];
              const curVal = d.boat_number || lastBoatNumber || (boats.find(b => b.is_default) || boats[0] || {}).sail_number || '';
              if (boats.length === 0) {
                return '<input type="text" name="boat_number" value="' + escapeHtml(curVal) + '" placeholder="' + L('egBoatNum') + '" style="padding:10px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.95rem;width:100%;">';
              }
              const boatNums = boats.map(b => b.sail_number);
              const isOther = curVal && !boatNums.includes(curVal);
              return '<select id="boat-number-select" onchange="var oi=document.getElementById(\'boat-number-other\');var hi=document.getElementById(\'boat-number-hidden\');if(this.value===\'other\'){oi.style.display=\'block\';oi.focus();hi.value=oi.value;}else{oi.style.display=\'none\';hi.value=this.value;}" style="padding:10px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.95rem;width:100%;">'
                + boats.map(function(b) { return '<option value="' + escapeHtml(b.sail_number) + '"' + (curVal === b.sail_number ? ' selected' : '') + '>' + escapeHtml(b.sail_number) + (b.nickname ? ' — ' + escapeHtml(b.nickname) : '') + '</option>'; }).join('')
                + '<option value="other"' + (isOther ? ' selected' : '') + '>Other...</option>'
                + '</select>'
                + '<input type="text" id="boat-number-other" placeholder="' + L('egBoatNum') + '" value="' + (isOther ? escapeHtml(curVal) : '') + '" oninput="document.getElementById(\'boat-number-hidden\').value=this.value" style="display:' + (isOther ? 'block' : 'none') + ';margin-top:6px;padding:10px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.95rem;width:100%;">'
                + '<input type="hidden" name="boat_number" id="boat-number-hidden" value="' + escapeHtml(curVal) + '">';
            })()}
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
            <select name="performance_rating" style="padding:10px;border:1p<input type="text" id="task-input" placeholder="Enter task description" style="flex:1;min-width:200px;padding:10px;border:1px s
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
            <select name="sea_state" style="padding:10px;border:1p<input type="text" id="task-input" placeholder="Enter task description" style="flex:1;min-width:200px;padding:10px;border:1px s
              <option value="">-- ${lang === 'es' ? 'Seleccionar' : lang === 'it' ? 'Seleziona' : lang === 'pt' ? 'Selecionar' : 'Select'} --</option>
              <option value="Flat" ${d.sea_state === 'Flat' ? 'selected' : ''}>${L('flat')}</option>
              <option value="Choppy" ${d.sea_state === 'Choppy' ? 'selected' : ''}>${L('choppy')}</option>
              <option value="Large Waves" ${d.sea_state === 'Large Waves' ? 'selected' : ''}>${L('largeWaves')}</option>
            </select>
          </div>
          <div class="form-group">
            <label>🌊 ${lang === 'es' ? 'Tipo de Agua' : lang === 'it' ? 'Tipo di Acqua' : lang === 'pt' ? 'Tipo de Água' : 'Water Type'}</label>
            <select name="water_type" style="padding:10px;border:1p<input type="text" id="task-input" placeholder="Enter task description" style="flex:1;min-width:200px;padding:10px;border:1px s
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
            <select name="main_maker" id="main_maker" style="padding:10px;border:1p<input type="text" id="task-input" placeholder="Enter task description" style="flex:1;min-width:200px;padding:10px;border:1px s
              <option value="">-- ${lang === 'es' ? 'Seleccionar' : lang === 'it' ? 'Selezionare' : lang === 'pt' ? 'Selecionar' : 'Select'} --</option>
              <option value="Quantum" ${d.main_maker === 'Quantum' ? 'selected' : ''}>Quantum</option>
              <option value="North" ${d.main_maker === 'North' ? 'selected' : ''}>North</option>
              <option value="Olimpic" ${d.main_maker === 'Olimpic' ? 'selected' : ''}>Olimpic</option>
            </select>
          </div>
          <div class="form-group">
            <label>${lang === 'es' ? 'Modelo del Mayor' : lang === 'it' ? 'Modello della Randa' : lang === 'pt' ? 'Modelo da Vela Grande' : 'Mainsail Model'}</label>
            <select name="mainsail_used" id="mainsail_model" style="padding:10px;border:1p<input type="text" id="task-input" placeholder="Enter task description" style="flex:1;min-width:200px;padding:10px;border:1px s
              <option value="${escapeHtml(d.mainsail_used)}" selected>${escapeHtml(d.mainsail_used) || '-- ' + (lang === 'es' ? 'Seleccionar fabricante primero' : lang === 'it' ? 'Selezionare prima il produttore' : lang === 'pt' ? 'Selecione o fabricante primeiro' : 'Select maker first') + ' --'}</option>
            </select>
          </div>

          <div class="form-group">
            <label>${lang === 'es' ? 'Estado del Mayor' : lang === 'it' ? 'Condizione della Randa' : lang === 'pt' ? 'Condição da Vela Grande' : 'Mainsail Condition'}</label>
            <select name="main_condition" style="padding:10px;border:1p<input type="text" id="task-input" placeholder="Enter task description" style="flex:1;min-width:200px;padding:10px;border:1px s
              <option value="">-- ${lang === 'es' ? 'Seleccionar' : lang === 'it' ? 'Selezionare' : lang === 'pt' ? 'Selecionar' : 'Select'} --</option>
              <option value="New" ${d.main_condition === 'New' ? 'selected' : ''}>${lang === 'es' ? 'Nueva' : lang === 'it' ? 'Nuova' : lang === 'pt' ? 'Nova' : 'New'}</option>
              <option value="Mid-life" ${d.main_condition === 'Mid-life' ? 'selected' : ''}>${lang === 'es' ? 'Vida media' : lang === 'it' ? 'Mezza vita' : lang === 'pt' ? 'Meia vida' : 'Mid-life'}</option>
              <option value="Rag bin" ${d.main_condition === 'Rag bin' ? 'selected' : ''}>${lang === 'es' ? 'Para tirar' : lang === 'it' ? 'Da buttare' : lang === 'pt' ? 'Para descartar' : 'Ready for the rag bin'}</option>
            </select>
          </div>

          <div class="form-group">
            <label>${lang === 'es' ? 'Velería del Foque' : lang === 'it' ? 'Veleria del Fiocco' : lang === 'pt' ? 'Fabricante da Vela de Proa' : 'Jib Maker'}</label>
            <select name="jib_maker" id="jib_maker" style="padding:10px;border:1p<input type="text" id="task-input" placeholder="Enter task description" style="flex:1;min-width:200px;padding:10px;border:1px s
              <option value="">-- ${lang === 'es' ? 'Seleccionar' : lang === 'it' ? 'Selezionare' : lang === 'pt' ? 'Selecionar' : 'Select'} --</option>
              <option value="Quantum" ${d.jib_maker === 'Quantum' ? 'selected' : ''}>Quantum</option>
              <option value="North" ${d.jib_maker === 'North' ? 'selected' : ''}>North</option>
              <option value="Olimpic" ${d.jib_maker === 'Olimpic' ? 'selected' : ''}>Olimpic</option>
            </select>
          </div>
          <div class="form-group">
            <label>${lang === 'es' ? 'Modelo del Foque' : lang === 'it' ? 'Modello del Fiocco' : lang === 'pt' ? 'Modelo da Vela de Proa' : 'Jib Model'}</label>
            <select name="jib_used" id="jib_model" style="padding:10px;border:1p<input type="text" id="task-input" placeholder="Enter task description" style="flex:1;min-width:200px;padding:10px;border:1px s
              <option value="${escapeHtml(d.jib_used)}" selected>${escapeHtml(d.jib_used) || '-- ' + (lang === 'es' ? 'Seleccionar fabricante primero' : lang === 'it' ? 'Selezionare prima il produttore' : lang === 'pt' ? 'Selecione o fabricante primeiro' : 'Select maker first') + ' --'}</option>
            </select>
          </div>

          <div class="form-group">
            <label>${lang === 'es' ? 'Estado del Foque' : lang === 'it' ? 'Condizione del Fiocco' : lang === 'pt' ? 'Condição da Vela de Proa' : 'Jib Condition'}</label>
            <select name="jib_condition" style="padding:10px;border:1p<input type="text" id="task-input" placeholder="Enter task description" style="flex:1;min-width:200px;padding:10px;border:1px s
              <option value="">-- ${lang === 'es' ? 'Seleccionar' : lang === 'it' ? 'Selezionare' : lang === 'pt' ? 'Selecionar' : 'Select'} --</option>
              <option value="New" ${d.jib_condition === 'New' ? 'selected' : ''}>${lang === 'es' ? 'Nueva' : lang === 'it' ? 'Nuova' : lang === 'pt' ? 'Nova' : 'New'}</option>
              <option value="Mid-life" ${d.jib_condition === 'Mid-life' ? 'selected' : ''}>${lang === 'es' ? 'Vida media' : lang === 'it' ? 'Mezza vita' : lang === 'pt' ? 'Meia vida' : 'Mid-life'}</option>
              <option value="Rag bin" ${d.jib_condition === 'Rag bin' ? 'selected' : ''}>${lang === 'es' ? 'Para tirar' : lang === 'it' ? 'Da buttare' : lang === 'pt' ? 'Para descartar' : 'Ready for the rag bin'}</option>
            </select>
          </div>

          <div class="form-group">
            <label>${lang === 'es' ? 'Velería del Spinnaker' : lang === 'it' ? 'Veleria dello Spinnaker' : lang === 'pt' ? 'Fabricante do Spinnaker' : 'Spinnaker Maker'}</label>
            <select id="spinnaker_maker" style="padding:10px;border:1p<input type="text" id="task-input" placeholder="Enter task description" style="flex:1;min-width:200px;padding:10px;border:1px s
              <option value="">-- ${lang === 'es' ? 'Seleccionar' : lang === 'it' ? 'Selezionare' : lang === 'pt' ? 'Selecionar' : 'Select'} --</option>
              <option value="Quantum">Quantum</option>
              <option value="North">North</option>
              <option value="Olimpic">Olimpic</option>
            </select>
          </div>
          <div class="form-group" id="spinnaker-model-group" style="display:none;">
            <label>${lang === 'es' ? 'Modelo del Spinnaker' : lang === 'it' ? 'Modello dello Spinnaker' : lang === 'pt' ? 'Modelo do Spinnaker' : 'Spinnaker Model'}</label>
            <select id="spinnaker_model" style="padding:10px;border:1p<input type="text" id="task-input" placeholder="Enter task description" style="flex:1;min-width:200px;padding:10px;border:1px s
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
            <select name="wire_size" id="wire-size-select" style="padding:10px;border:1p<input type="text" id="task-input" placeholder="Enter task description" style="flex:1;min-width:200px;padding:10px;border:1px s
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
            <select name="mast_wiggle" style="padding:10px;border:1p<input type="text" id="task-input" placeholder="Enter task description" style="flex:1;min-width:200px;padding:10px;border:1px s
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
            if (btn.classList.contains('listening')) {
              if (btn._rec) { btn._rec.stop(); }
              return;
            }
            const rec = new SR();
            rec.lang = 'en-US';
            rec.interimResults = false;
            rec.continuous = false;
            btn.style.cssText = 'position:absolute;right:6px;top:50%;transform:translateY(-50%);background:#e53e3e;color:#fff;border:none;cursor:pointer;border-radius:12px;padding:3px 8px;font-size:0.75rem;white-space:nowrap;line-height:1.4;';
            btn.innerHTML = '⏹ Stop';
            btn.classList.add('listening');
            rec.onresult = function(e) {
              const text = e.results[0][0].transcript;
              if (el.value) el.value += ' ' + text;
              else el.value = text;
              btn.classList.remove('listening'); btn.style.cssText = ''; btn.innerHTML = '🎤'; btn._rec = null;
            };
            rec.onerror = function() { btn.classList.remove('listening'); btn.style.cssText = ''; btn.innerHTML = '🎤'; btn._rec = null; };
            rec.onend = function() { btn.classList.remove('listening'); btn.style.cssText = ''; btn.innerHTML = '🎤'; btn._rec = null; };
            btn._rec = rec;
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

function dataSharingChoicePage(lang, nextUrl) {
  const L = (k) => t(k, lang);
  return `<div class="container" style="max-width:560px;">
    <div class="form-card wide" style="padding:32px 24px;text-align:center;">
      <h2 style="color:#0b3d6e;margin:0 0 8px;font-size:1.4rem;">${L('dsOneQuickThing')}</h2>
      <p style="color:#555;font-size:0.95rem;margin-bottom:24px;">${L('dsHowUsed')}</p>

      <form method="POST" action="/data-sharing">
        <input type="hidden" name="next" value="${escapeHtml(nextUrl || '')}">
        <label style="display:flex;align-items:flex-start;gap:12px;padding:18px 16px;border:2px solid #e2e8f0;border-radius:12px;margin-bottom:12px;cursor:pointer;text-align:left;transition:all 0.2s;" onmouseover="this.style.borderColor='#059669';this.style.background='#f0fdf4'" onmouseout="this.style.borderColor=this.querySelector('input').checked?'#059669':'#e2e8f0';this.style.background=this.querySelector('input').checked?'#ecfdf5':'#fff'">
          <input type="radio" name="data_sharing" value="share" style="margin-top:4px;accent-color:#059669;width:18px;height:18px;flex-shrink:0;">
          <div>
            <div style="font-weight:700;color:#059669;font-size:1.05rem;">&#127760; ${L('dsShareBtn')}</div>
            <div style="color:#555;font-size:0.88rem;margin-top:4px;line-height:1.5;">${L('dsShareChoiceDesc')}</div>
          </div>
        </label>

        <label style="display:flex;align-items:flex-start;gap:12px;padding:18px 16px;border:2px solid #e2e8f0;border-radius:12px;margin-bottom:20px;cursor:pointer;text-align:left;transition:all 0.2s;" onmouseover="this.style.borderColor='#0b3d6e';this.style.background='#f0f7ff'" onmouseout="this.style.borderColor=this.querySelector('input').checked?'#0b3d6e':'#e2e8f0';this.style.background=this.querySelector('input').checked?'#f0f7ff':'#fff'">
          <input type="radio" name="data_sharing" value="private" style="margin-top:4px;accent-color:#0b3d6e;width:18px;height:18px;flex-shrink:0;">
          <div>
            <div style="font-weight:700;color:#0b3d6e;font-size:1.05rem;">&#128274; ${L('dsPrivateBtn')}</div>
            <div style="color:#555;font-size:0.88rem;margin-top:4px;line-height:1.5;">${L('dsPrivateChoiceDesc')}</div>
          </div>
        </label>

        <button type="submit" class="btn btn-primary" style="width:100%;padding:14px;font-size:1.05rem;" id="ds-save-btn" disabled>${L('dsContinue')}</button>
      </form>
      <p style="color:#94a3b8;font-size:0.8rem;margin-top:14px;">${L('dsChangeAnytime')} <a href="/profile" style="color:#1a6fb5;font-weight:600;">${L('dsProfileSettings')}</a>.</p>
    </div>
  </div>
  <script>
  (function() {
    var radios = document.querySelectorAll('input[name="data_sharing"]');
    var btn = document.getElementById('ds-save-btn');
    for (var i = 0; i < radios.length; i++) {
      radios[i].addEventListener('change', function() {
        btn.disabled = false;
        // Update label highlight
        for (var j = 0; j < radios.length; j++) {
          var lbl = radios[j].closest('label');
          if (radios[j].checked) {
            lbl.style.borderColor = radios[j].value === 'share' ? '#059669' : '#0b3d6e';
            lbl.style.background = radios[j].value === 'share' ? '#ecfdf5' : '#f0f7ff';
          } else {
            lbl.style.borderColor = '#e2e8f0';
            lbl.style.background = '#fff';
          }
        }
      });
    }
  })();
  </script>`;
}

function profilePage(userData, success, userBoats) {
  const sharing = userData.data_sharing;
  const boats = userBoats || [];
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

    <!-- My Boats -->
    <div class="form-card" style="margin-top:24px;">
      <h3 style="color:#0b3d6e;margin:0 0 4px;font-size:1.1rem;">My Boats</h3>
      <p style="color:#666;font-size:0.85rem;margin-bottom:16px;">Manage your boats. The default boat is pre-selected when logging races. Drag to reorder.</p>
      <ul id="my-boats-list" style="list-style:none;padding:0;margin:0 0 16px;">
        ${boats.map(b => `<li data-id="${b.id}" draggable="true" style="display:flex;align-items:center;gap:8px;padding:10px 12px;margin-bottom:6px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;cursor:grab;transition:background 0.15s;">
          <span style="cursor:grab;color:#94a3b8;font-size:1.1rem;user-select:none;" title="Drag to reorder">&#9776;</span>
          <span style="font-weight:700;font-size:1rem;color:#0b3d6e;min-width:60px;">${escapeHtml(b.sail_number)}</span>
          <span style="color:#64748b;font-size:0.85rem;flex:1;">${b.nickname ? escapeHtml(b.nickname) : ''}</span>
          <button type="button" onclick="setBoatDefault(${b.id})" title="Set as default" style="background:none;border:none;cursor:pointer;font-size:1.2rem;padding:2px 6px;${b.is_default ? 'color:#f59e0b;' : 'color:#d1d5db;'}" class="boat-star" data-id="${b.id}">${b.is_default ? '&#9733;' : '&#9734;'}</button>
          <button type="button" onclick="deleteBoat(${b.id})" title="Remove boat" style="background:none;border:none;cursor:pointer;font-size:1rem;padding:2px 6px;color:#ef4444;">&#10005;</button>
        </li>`).join('')}
      </ul>
      ${boats.length === 0 ? '<p style="color:#94a3b8;font-size:0.88rem;text-align:center;padding:12px 0;">No boats yet. Add one below.</p>' : ''}
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end;">
        <div style="flex:1;min-width:100px;">
          <label style="font-size:0.8rem;color:#555;font-weight:600;">Sail Number *</label>
          <input type="text" id="add-boat-num" placeholder="e.g. 31847" style="padding:8px 10px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.95rem;width:100%;">
        </div>
        <div style="flex:1;min-width:100px;">
          <label style="font-size:0.8rem;color:#555;font-weight:600;">Name <span style="font-weight:400;color:#94a3b8;">(optional)</span></label>
          <input type="text" id="add-boat-nick" placeholder="e.g. Race Boat" style="padding:8px 10px;border:1px solid #e2e8f0;border-radius:8px;font-size:0.95rem;width:100%;">
        </div>
        <button type="button" id="add-boat-btn" onclick="addBoat()" style="padding:8px 18px;border-radius:8px;font-size:0.9rem;font-weight:700;cursor:pointer;border:2px solid #0b3d6e;background:#0b3d6e;color:#fff;white-space:nowrap;">+ Add Boat</button>
      </div>
      <div id="boat-msg" style="margin-top:8px;font-size:0.82rem;color:#ef4444;display:none;"></div>
    </div>
    <script>
    function addBoat() {
      var num = document.getElementById('add-boat-num');
      var nick = document.getElementById('add-boat-nick');
      var msg = document.getElementById('boat-msg');
      if (!num.value.trim()) { msg.textContent = 'Sail number is required.'; msg.style.display = 'block'; return; }
      msg.style.display = 'none';
      fetch('/api/my-boats/add', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({sail_number: num.value.trim(), nickname: nick.value.trim()}) })
        .then(function(r) { return r.json(); })
        .then(function(d) {
          if (d.error) { msg.textContent = d.error; msg.style.display = 'block'; return; }
          location.reload();
        });
    }
    function deleteBoat(id) {
      if (!confirm('Remove this boat?')) return;
      fetch('/api/my-boats/' + id + '/delete', { method:'POST' })
        .then(function(r) { return r.json(); })
        .then(function(d) { if (d.ok) location.reload(); });
    }
    function setBoatDefault(id) {
      fetch('/api/my-boats/' + id + '/set-default', { method:'POST' })
        .then(function(r) { return r.json(); })
        .then(function(d) {
          if (!d.ok) return;
          document.querySelectorAll('.boat-star').forEach(function(s) {
            s.innerHTML = '&#9734;'; s.style.color = '#d1d5db';
          });
          var star = document.querySelector('.boat-star[data-id="' + id + '"]');
          if (star) { star.innerHTML = '&#9733;'; star.style.color = '#f59e0b'; }
        });
    }
    (function() {
      var list = document.getElementById('my-boats-list');
      if (!list) return;
      var dragEl = null;
      list.addEventListener('dragstart', function(e) {
        dragEl = e.target.closest('li');
        if (dragEl) { dragEl.style.opacity = '0.4'; e.dataTransfer.effectAllowed = 'move'; }
      });
      list.addEventListener('dragend', function(e) {
        if (dragEl) dragEl.style.opacity = '1';
        dragEl = null;
      });
      list.addEventListener('dragover', function(e) {
        e.preventDefault();
        var target = e.target.closest('li');
        if (target && target !== dragEl) {
          var rect = target.getBoundingClientRect();
          var mid = rect.top + rect.height / 2;
          if (e.clientY < mid) { list.insertBefore(dragEl, target); }
          else { list.insertBefore(dragEl, target.nextSibling); }
        }
      });
      list.addEventListener('drop', function(e) {
        e.preventDefault();
        var order = Array.from(list.querySelectorAll('li')).map(function(li) { return parseInt(li.dataset.id); });
        fetch('/api/my-boats/reorder', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({order: order}) });
      });
      // Touch support for mobile drag
      var touchEl = null, touchClone = null, touchStartY = 0;
      list.addEventListener('touchstart', function(e) {
        var li = e.target.closest('li');
        if (!li || !e.target.closest('span[title="Drag to reorder"]')) return;
        touchEl = li;
        touchStartY = e.touches[0].clientY;
        touchClone = li.cloneNode(true);
        touchClone.style.position = 'fixed';
        touchClone.style.zIndex = '9999';
        touchClone.style.opacity = '0.8';
        touchClone.style.width = li.offsetWidth + 'px';
        touchClone.style.pointerEvents = 'none';
        touchClone.style.left = li.getBoundingClientRect().left + 'px';
        touchClone.style.top = e.touches[0].clientY - 20 + 'px';
        document.body.appendChild(touchClone);
        li.style.opacity = '0.3';
      }, {passive: true});
      list.addEventListener('touchmove', function(e) {
        if (!touchEl) return;
        e.preventDefault();
        var y = e.touches[0].clientY;
        touchClone.style.top = y - 20 + 'px';
        var items = Array.from(list.querySelectorAll('li'));
        for (var i = 0; i < items.length; i++) {
          if (items[i] === touchEl) continue;
          var rect = items[i].getBoundingClientRect();
          if (y > rect.top && y < rect.bottom) {
            if (y < rect.top + rect.height / 2) list.insertBefore(touchEl, items[i]);
            else list.insertBefore(touchEl, items[i].nextSibling);
            break;
          }
        }
      }, {passive: false});
      list.addEventListener('touchend', function(e) {
        if (!touchEl) return;
        touchEl.style.opacity = '1';
        if (touchClone && touchClone.parentNode) touchClone.parentNode.removeChild(touchClone);
        var order = Array.from(list.querySelectorAll('li')).map(function(li) { return parseInt(li.dataset.id); });
        fetch('/api/my-boats/reorder', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({order: order}) });
        touchEl = null; touchClone = null;
      });
    })();
    </script>

    <!-- Data Sharing Preference -->
    <div class="form-card" style="margin-top:24px;">
      <h3 style="color:#0b3d6e;margin:0 0 12px;font-size:1.1rem;">Data Sharing</h3>
      <p style="color:#666;font-size:0.88rem;margin-bottom:16px;">Control how your data is used within the Snipeovation community.</p>
      <form method="POST" action="/data-sharing">
        <label style="display:flex;align-items:flex-start;gap:10px;padding:14px;border:2px solid ${sharing === 'share' ? '#059669' : '#e2e8f0'};border-radius:10px;margin-bottom:10px;cursor:pointer;background:${sharing === 'share' ? '#ecfdf5' : '#fff'};transition:all 0.2s;">
          <input type="radio" name="data_sharing" value="share" ${sharing === 'share' ? 'checked' : ''} style="margin-top:3px;accent-color:#059669;">
          <div>
            <div style="font-weight:700;color:#059669;font-size:0.95rem;">&#127760; Share my data</div>
            <div style="color:#555;font-size:0.83rem;margin-top:2px;">Contribute to Race Feed and fleet-wide aggregated insights. Benefit from the collective knowledge of all Snipeovation sailors.</div>
          </div>
        </label>
        <label style="display:flex;align-items:flex-start;gap:10px;padding:14px;border:2px solid ${sharing === 'private' ? '#0b3d6e' : '#e2e8f0'};border-radius:10px;margin-bottom:16px;cursor:pointer;background:${sharing === 'private' ? '#f0f7ff' : '#fff'};transition:all 0.2s;">
          <input type="radio" name="data_sharing" value="private" ${sharing === 'private' ? 'checked' : ''} style="margin-top:3px;accent-color:#0b3d6e;">
          <div>
            <div style="font-weight:700;color:#0b3d6e;font-size:0.95rem;">&#128274; Keep private</div>
            <div style="color:#555;font-size:0.83rem;margin-top:2px;">Your data is for your use only. You won't contribute to or receive fleet-wide aggregated coaching insights.</div>
          </div>
        </label>
        <button type="submit" class="btn btn-primary" style="width:100%;">Save Preference</button>
      </form>
      ${!sharing ? '<p style="color:#c2410c;font-size:0.82rem;margin-top:10px;font-weight:600;">You haven\'t chosen a preference yet. You\'ll be asked when you log your first race.</p>' : ''}
    </div>
  </div>`;
}

// --- Performance Trends page ---

function trendsSection(logs) {
  const races = logs.filter(l => l.finish_position && parseInt(l.finish_position) > 0);
  const practices = logs.filter(l => !l.finish_position || parseInt(l.finish_position) === 0 || isNaN(parseInt(l.finish_position)));
  const totalLogs = logs.length;

  const positions = races.map(r => parseInt(r.finish_position)).filter(p => !isNaN(p));
  const best = positions.length ? Math.min(...positions) : '-';
  const worst = positions.length ? Math.max(...positions) : '-';
  const avg = positions.length ? (positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1) : '-';
  const pctScores = races
    .filter(r => r.fleet_size && parseInt(r.fleet_size) > 0)
    .map(r => ((parseInt(r.finish_position) / parseInt(r.fleet_size)) * 100).toFixed(1));
  const avgPct = pctScores.length ? (pctScores.reduce((a, b) => a + parseFloat(b), 0) / pctScores.length).toFixed(1) : '-';

  const chartData = races.map(r => ({
    date: r.race_date,
    name: r.race_name,
    position: parseInt(r.finish_position),
    fleet: r.fleet_size ? parseInt(r.fleet_size) : null,
    pct: (r.fleet_size && parseInt(r.fleet_size) > 0) ? parseFloat(((parseInt(r.finish_position) / parseInt(r.fleet_size)) * 100).toFixed(1)) : null,
    location: r.location || ''
  })).sort((a, b) => a.date.localeCompare(b.date));

  const monthMap = {};
  logs.forEach(l => {
    const m = l.race_date ? l.race_date.slice(0, 7) : 'Unknown';
    if (!monthMap[m]) monthMap[m] = { races: 0, practices: 0 };
    const pos = parseInt(l.finish_position);
    if (pos > 0) monthMap[m].races++;
    else monthMap[m].practices++;
  });
  const months = Object.keys(monthMap).sort();
  const breakdownData = {
    labels: months.map(m => { const d = new Date(m + '-01'); return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }); }),
    races: months.map(m => monthMap[m].races),
    practices: months.map(m => monthMap[m].practices)
  };

  if (races.length === 0) {
    return `
    <div class="form-card wide" style="text-align:center;padding:30px;margin-bottom:24px;">
      <h3 style="color:#0b3d6e;margin-bottom:8px;">No race results yet</h3>
      <p style="color:#666;">Log races with finish positions to see your trends here.</p>
    </div>`;
  }

  return `
    <!-- Trends Filter -->
    <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:16px;">
      <label style="font-weight:600;color:#0b3d6e;font-size:0.9rem;">Trends:</label>
      <select id="trends-filter" onchange="applyTrendsFilter()" style="padding:8px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:0.9rem;font-weight:600;color:#0b3d6e;">
        <option value="5">Last 5 Races</option>
        <option value="10" selected>Last 10 Races</option>
        <option value="20">Last 20 Races</option>
        <option value="all">All Time</option>
      </select>
    </div>

    <!-- Stats cards -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:20px;">
      <div class="trends-stat-card"><div class="trends-stat-num" id="stat-races">${races.length}</div><div class="trends-stat-label">Races</div></div>
      <div class="trends-stat-card"><div class="trends-stat-num" style="color:#d4a017;" id="stat-best">${best}</div><div class="trends-stat-label">Best Finish</div></div>
      <div class="trends-stat-card"><div class="trends-stat-num" id="stat-avg">${avg}</div><div class="trends-stat-label">Avg Finish</div></div>
      <div class="trends-stat-card"><div class="trends-stat-num" id="stat-worst">${worst}</div><div class="trends-stat-label">Worst Finish</div></div>
      <div class="trends-stat-card"><div class="trends-stat-num" style="color:#059669;" id="stat-pct">${avgPct}${avgPct !== '-' ? '%' : ''}</div><div class="trends-stat-label">Avg Fleet %</div></div>
      <div class="trends-stat-card"><div class="trends-stat-num" style="color:#7c3aed;">${practices.length}</div><div class="trends-stat-label">Practices</div></div>
    </div>

    <!-- Position Trend Chart -->
    <div class="form-card wide" style="margin-bottom:16px;padding:18px;">
      <h3 style="color:#0b3d6e;margin:0 0 4px;font-size:1rem;">&#127937; Finishing Position Trend</h3>
      <p style="color:#888;font-size:0.78rem;margin:0 0 10px;">Lower is better &bull; Gray bars show fleet size</p>
      <div style="position:relative;height:260px;"><canvas id="trendPosChart"></canvas></div>
    </div>

    <!-- Percentage Trend Chart -->
    <div class="form-card wide" style="margin-bottom:16px;padding:18px;">
      <h3 style="color:#0b3d6e;margin:0 0 4px;font-size:1rem;">&#128202; Fleet Percentage Trend</h3>
      <p style="color:#888;font-size:0.78rem;margin:0 0 10px;">Position &divide; Fleet Size &bull; Lower % = better</p>
      <div style="position:relative;height:240px;"><canvas id="trendPctChart"></canvas></div>
    </div>

    <!-- Race vs Practice breakdown -->
    <div class="form-card wide" style="margin-bottom:24px;padding:18px;">
      <h3 style="color:#0b3d6e;margin:0 0 4px;font-size:1rem;">&#128197; Race vs Practice Breakdown</h3>
      <p style="color:#888;font-size:0.78rem;margin:0 0 10px;">Monthly activity &bull; ${totalLogs} total sessions</p>
      <div style="position:relative;height:200px;"><canvas id="trendBrkChart"></canvas></div>
    </div>

    <style>
      .trends-stat-card { background:white; border-radius:12px; padding:14px 10px; text-align:center; box-shadow:0 2px 10px rgba(0,0,0,0.06); }
      .trends-stat-num { font-size:1.5rem; font-weight:800; color:#0b3d6e; line-height:1.2; }
      .trends-stat-label { font-size:0.75rem; color:#888; font-weight:600; margin-top:2px; text-transform:uppercase; letter-spacing:0.3px; }
      @media (max-width:600px) { .trends-stat-num { font-size:1.2rem; } .trends-stat-card { padding:10px 6px; } }
    </style>

    <script>
    window.addEventListener('load', function() {
      var allTrendData = ${JSON.stringify(chartData)};
      var trendBreakdown = ${JSON.stringify(breakdownData)};
      if (!allTrendData.length) return;

      var navy='#0b3d6e', gold='#d4a017', goldLight='rgba(212,160,23,0.15)', green='#059669', greenLight='rgba(5,150,105,0.15)', grayBar='rgba(203,213,225,0.5)', purple='#7c3aed';
      var tPosChart, tPctChart, tBrkChart;

      function getTrendFiltered() {
        var v = document.getElementById('trends-filter').value;
        if (v === 'all') return allTrendData.slice();
        return allTrendData.slice(-parseInt(v));
      }

      function updateTrendStats(data) {
        var pos = data.map(function(d){return d.position;});
        var pcts = data.filter(function(d){return d.pct!==null;}).map(function(d){return d.pct;});
        document.getElementById('stat-races').textContent = data.length;
        document.getElementById('stat-best').textContent = pos.length ? Math.min.apply(null,pos) : '-';
        document.getElementById('stat-worst').textContent = pos.length ? Math.max.apply(null,pos) : '-';
        document.getElementById('stat-avg').textContent = pos.length ? (pos.reduce(function(a,b){return a+b;},0)/pos.length).toFixed(1) : '-';
        var ap = pcts.length ? (pcts.reduce(function(a,b){return a+b;},0)/pcts.length).toFixed(1) : '-';
        document.getElementById('stat-pct').textContent = ap !== '-' ? ap+'%' : '-';
      }

      function shortD(d) { var p=d.split('-'); var m=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return m[parseInt(p[1])-1]+' '+parseInt(p[2]); }

      function buildTrendPosChart(data) {
        var labels=data.map(function(d){return shortD(d.date);}), positions=data.map(function(d){return d.position;}), fleets=data.map(function(d){return d.fleet;});
        var maxY=Math.max.apply(null,fleets.concat(positions).filter(function(v){return v!==null;}))+2;
        if (tPosChart) tPosChart.destroy();
        tPosChart = new Chart(document.getElementById('trendPosChart'), {
          type:'bar',
          data:{ labels:labels, datasets:[
            { type:'bar', label:'Fleet Size', data:fleets, backgroundColor:grayBar, borderColor:'rgba(203,213,225,0.8)', borderWidth:1, borderRadius:4, order:2 },
            { type:'line', label:'Finish Position', data:positions, borderColor:gold, backgroundColor:goldLight, fill:true, tension:0.3, pointBackgroundColor:gold, pointBorderColor:'#fff', pointBorderWidth:2, pointRadius:5, pointHoverRadius:7, order:1 }
          ]},
          options:{ responsive:true, maintainAspectRatio:false, interaction:{mode:'index',intersect:false},
            plugins:{ legend:{position:'top',labels:{usePointStyle:true,padding:12,font:{size:11}}},
              tooltip:{ callbacks:{ title:function(i){return data[i[0].dataIndex].name+' ('+data[i[0].dataIndex].date+')';}, afterBody:function(i){var d2=data[i[0].dataIndex];return d2.location||'';} }}
            },
            scales:{ y:{reverse:true,min:1,max:maxY,title:{display:true,text:'Position (lower=better)',color:navy,font:{size:11,weight:'bold'}},ticks:{stepSize:1,color:'#666'},grid:{color:'rgba(0,0,0,0.05)'}}, x:{ticks:{color:'#666',font:{size:10},maxRotation:45},grid:{display:false}} }
          }
        });
      }

      function buildTrendPctChart(data) {
        var filtered=data.filter(function(d){return d.pct!==null;});
        if(!filtered.length){document.getElementById('trendPctChart').parentElement.innerHTML='<p style="text-align:center;color:#888;padding:30px;">Add fleet size to races to see fleet % trends.</p>';return;}
        var labels=filtered.map(function(d){return shortD(d.date);}), pcts=filtered.map(function(d){return d.pct;}), running=[], sum=0;
        for(var i=0;i<pcts.length;i++){sum+=pcts[i];running.push(parseFloat((sum/(i+1)).toFixed(1)));}
        if(tPctChart) tPctChart.destroy();
        tPctChart = new Chart(document.getElementById('trendPctChart'), {
          type:'line',
          data:{ labels:labels, datasets:[
            { label:'Fleet %', data:pcts, borderColor:green, backgroundColor:greenLight, fill:true, tension:0.3, pointBackgroundColor:green, pointBorderColor:'#fff', pointBorderWidth:2, pointRadius:5, pointHoverRadius:7 },
            { label:'Running Avg', data:running, borderColor:navy, borderDash:[6,3], borderWidth:2, pointRadius:0, fill:false, tension:0.4 }
          ]},
          options:{ responsive:true, maintainAspectRatio:false, interaction:{mode:'index',intersect:false},
            plugins:{ legend:{position:'top',labels:{usePointStyle:true,padding:12,font:{size:11}}},
              tooltip:{ callbacks:{ title:function(i){var idx=i[0].dataIndex;return filtered[idx].name+' ('+filtered[idx].date+')';}, label:function(i){return i.dataset.label+': '+i.raw+'%';} }}
            },
            scales:{ y:{min:0,max:100,title:{display:true,text:'Fleet % (lower=better)',color:navy,font:{size:11,weight:'bold'}},ticks:{callback:function(v){return v+'%';},color:'#666'},grid:{color:'rgba(0,0,0,0.05)'}}, x:{ticks:{color:'#666',font:{size:10},maxRotation:45},grid:{display:false}} }
          }
        });
      }

      function buildTrendBrkChart() {
        if(!trendBreakdown.labels.length) return;
        if(tBrkChart) tBrkChart.destroy();
        tBrkChart = new Chart(document.getElementById('trendBrkChart'), {
          type:'bar',
          data:{ labels:trendBreakdown.labels, datasets:[
            { label:'Races', data:trendBreakdown.races, backgroundColor:gold, borderRadius:4 },
            { label:'Practice', data:trendBreakdown.practices, backgroundColor:purple, borderRadius:4 }
          ]},
          options:{ responsive:true, maintainAspectRatio:false,
            plugins:{ legend:{position:'top',labels:{usePointStyle:true,padding:12,font:{size:11}}} },
            scales:{ y:{beginAtZero:true,ticks:{stepSize:1,color:'#666'},grid:{color:'rgba(0,0,0,0.05)'},title:{display:true,text:'Sessions',color:navy,font:{size:11,weight:'bold'}}}, x:{stacked:true,ticks:{color:'#666',font:{size:10}},grid:{display:false}} }
          }
        });
      }

      window.applyTrendsFilter = function() {
        var data = getTrendFiltered();
        updateTrendStats(data);
        buildTrendPosChart(data);
        buildTrendPctChart(data);
      };
      applyTrendsFilter();
      buildTrendBrkChart();
    });
    </script>`;
}

function trendsPage(logs, lang) {
  lang = lang || 'en';
  // Split races (has finish_position) vs practice (no finish_position)
  const races = logs.filter(l => l.finish_position && parseInt(l.finish_position) > 0);
  const practices = logs.filter(l => !l.finish_position || parseInt(l.finish_position) === 0 || isNaN(parseInt(l.finish_position)));
  const totalLogs = logs.length;

  // Compute stats
  const positions = races.map(r => parseInt(r.finish_position)).filter(p => !isNaN(p));
  const best = positions.length ? Math.min(...positions) : '-';
  const worst = positions.length ? Math.max(...positions) : '-';
  const avg = positions.length ? (positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1) : '-';

  // Percentage scores (lower = better)
  const pctScores = races
    .filter(r => r.fleet_size && parseInt(r.fleet_size) > 0)
    .map(r => {
      const pos = parseInt(r.finish_position);
      const fleet = parseInt(r.fleet_size);
      return ((pos / fleet) * 100).toFixed(1);
    });
  const avgPct = pctScores.length ? (pctScores.reduce((a, b) => a + parseFloat(b), 0) / pctScores.length).toFixed(1) : '-';

  // Prepare JSON data for charts (races only, sorted by date)
  const chartData = races.map(r => ({
    date: r.race_date,
    name: r.race_name,
    position: parseInt(r.finish_position),
    fleet: r.fleet_size ? parseInt(r.fleet_size) : null,
    pct: (r.fleet_size && parseInt(r.fleet_size) > 0) ? parseFloat(((parseInt(r.finish_position) / parseInt(r.fleet_size)) * 100).toFixed(1)) : null,
    location: r.location || ''
  })).sort((a, b) => a.date.localeCompare(b.date));

  // Monthly breakdown for race vs practice bar chart
  const monthMap = {};
  logs.forEach(l => {
    const m = l.race_date ? l.race_date.slice(0, 7) : 'Unknown';
    if (!monthMap[m]) monthMap[m] = { races: 0, practices: 0 };
    const pos = parseInt(l.finish_position);
    if (pos > 0) monthMap[m].races++;
    else monthMap[m].practices++;
  });
  const months = Object.keys(monthMap).sort();
  const breakdownData = {
    labels: months.map(m => { const d = new Date(m + '-01'); return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }); }),
    races: months.map(m => monthMap[m].races),
    practices: months.map(m => monthMap[m].practices)
  };

  return `<div class="container">
    <h2>&#128200; Performance Trends <span class="sub">Track your racing progress over time</span></h2>

    ${races.length === 0 ? `
      <div class="form-card wide" style="text-align:center;padding:40px;">
        <h3 style="color:#0b3d6e;margin-bottom:8px;">No race results yet</h3>
        <p style="color:#666;margin-bottom:16px;">Log some races with finish positions to see your trends.</p>
        <a href="/quick-log" class="btn btn-primary">&#9889; Log a Race</a>
      </div>
    ` : `

    <!-- Filter -->
    <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:20px;">
      <label style="font-weight:600;color:#0b3d6e;font-size:0.9rem;">Show:</label>
      <select id="trends-filter" onchange="applyFilter()" style="padding:8px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:0.9rem;font-weight:600;color:#0b3d6e;">
        <option value="5">Last 5 Races</option>
        <option value="10" selected>Last 10 Races</option>
        <option value="20">Last 20 Races</option>
        <option value="all">All Time</option>
      </select>
    </div>

    <!-- Stats cards -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:24px;" id="stats-cards">
      <div class="trends-stat-card">
        <div class="trends-stat-num" id="stat-races">${races.length}</div>
        <div class="trends-stat-label">Races</div>
      </div>
      <div class="trends-stat-card">
        <div class="trends-stat-num" style="color:#d4a017;" id="stat-best">${best}</div>
        <div class="trends-stat-label">Best Finish</div>
      </div>
      <div class="trends-stat-card">
        <div class="trends-stat-num" id="stat-avg">${avg}</div>
        <div class="trends-stat-label">Avg Finish</div>
      </div>
      <div class="trends-stat-card">
        <div class="trends-stat-num" id="stat-worst">${worst}</div>
        <div class="trends-stat-label">Worst Finish</div>
      </div>
      <div class="trends-stat-card">
        <div class="trends-stat-num" style="color:#059669;" id="stat-pct">${avgPct}${avgPct !== '-' ? '%' : ''}</div>
        <div class="trends-stat-label">Avg Fleet %</div>
      </div>
      <div class="trends-stat-card">
        <div class="trends-stat-num" style="color:#7c3aed;">${practices.length}</div>
        <div class="trends-stat-label">Practices</div>
      </div>
    </div>

    <!-- Position Trend Chart -->
    <div class="form-card wide" style="margin-bottom:20px;padding:20px;">
      <h3 style="color:#0b3d6e;margin:0 0 4px;font-size:1.05rem;">&#127937; Finishing Position Trend</h3>
      <p style="color:#888;font-size:0.8rem;margin:0 0 12px;">Lower is better &bull; Gray bars show fleet size</p>
      <div style="position:relative;height:280px;"><canvas id="positionChart"></canvas></div>
    </div>

    <!-- Percentage Trend Chart -->
    <div class="form-card wide" style="margin-bottom:20px;padding:20px;">
      <h3 style="color:#0b3d6e;margin:0 0 4px;font-size:1.05rem;">&#128202; Fleet Percentage Trend</h3>
      <p style="color:#888;font-size:0.8rem;margin:0 0 12px;">Position &divide; Fleet Size &bull; Lower % = better relative finish</p>
      <div style="position:relative;height:260px;"><canvas id="pctChart"></canvas></div>
    </div>

    <!-- Race vs Practice breakdown -->
    <div class="form-card wide" style="margin-bottom:20px;padding:20px;">
      <h3 style="color:#0b3d6e;margin:0 0 4px;font-size:1.05rem;">&#128197; Race vs Practice Breakdown</h3>
      <p style="color:#888;font-size:0.8rem;margin:0 0 12px;">Monthly activity &bull; ${totalLogs} total sessions</p>
      <div style="position:relative;height:220px;"><canvas id="breakdownChart"></canvas></div>
    </div>

    `}
  </div>

  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
  <script>
  (function() {
    var allData = ${JSON.stringify(chartData)};
    var breakdownData = ${JSON.stringify(breakdownData)};
    if (!allData.length) return;

    var navy = '#0b3d6e';
    var gold = '#d4a017';
    var goldLight = 'rgba(212,160,23,0.15)';
    var green = '#059669';
    var greenLight = 'rgba(5,150,105,0.15)';
    var grayBar = 'rgba(203,213,225,0.5)';
    var purple = '#7c3aed';

    var posCtx = document.getElementById('positionChart');
    var pctCtx = document.getElementById('pctChart');
    var brkCtx = document.getElementById('breakdownChart');
    var posChart, pctChart, brkChart;

    function getFiltered() {
      var v = document.getElementById('trends-filter').value;
      if (v === 'all') return allData.slice();
      var n = parseInt(v);
      return allData.slice(-n);
    }

    function updateStats(data) {
      var positions = data.map(function(d) { return d.position; });
      var pcts = data.filter(function(d) { return d.pct !== null; }).map(function(d) { return d.pct; });
      document.getElementById('stat-races').textContent = data.length;
      document.getElementById('stat-best').textContent = positions.length ? Math.min.apply(null, positions) : '-';
      document.getElementById('stat-worst').textContent = positions.length ? Math.max.apply(null, positions) : '-';
      document.getElementById('stat-avg').textContent = positions.length ? (positions.reduce(function(a,b){return a+b;},0)/positions.length).toFixed(1) : '-';
      var avgP = pcts.length ? (pcts.reduce(function(a,b){return a+b;},0)/pcts.length).toFixed(1) : '-';
      document.getElementById('stat-pct').textContent = avgP !== '-' ? avgP + '%' : '-';
    }

    function shortDate(d) { var p = d.split('-'); var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return m[parseInt(p[1])-1] + ' ' + parseInt(p[2]); }

    function buildPositionChart(data) {
      var labels = data.map(function(d) { return shortDate(d.date); });
      var positions = data.map(function(d) { return d.position; });
      var fleets = data.map(function(d) { return d.fleet; });
      var maxY = Math.max.apply(null, fleets.concat(positions).filter(function(v){return v!==null;})) + 2;

      var cfg = {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              type: 'bar',
              label: 'Fleet Size',
              data: fleets,
              backgroundColor: grayBar,
              borderColor: 'rgba(203,213,225,0.8)',
              borderWidth: 1,
              borderRadius: 4,
              order: 2
            },
            {
              type: 'line',
              label: 'Finish Position',
              data: positions,
              borderColor: gold,
              backgroundColor: goldLight,
              fill: true,
              tension: 0.3,
              pointBackgroundColor: gold,
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
              order: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, padding: 14, font: { size: 12 } } },
            tooltip: {
              callbacks: {
                title: function(items) { return data[items[0].dataIndex].name + ' (' + data[items[0].dataIndex].date + ')'; },
                afterBody: function(items) { var d2 = data[items[0].dataIndex]; return d2.location ? d2.location : ''; }
              }
            }
          },
          scales: {
            y: {
              reverse: true,
              min: 1,
              max: maxY,
              title: { display: true, text: 'Position (lower = better)', color: navy, font: { size: 12, weight: 'bold' } },
              ticks: { stepSize: 1, color: '#666' },
              grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
              ticks: { color: '#666', font: { size: 11 }, maxRotation: 45 },
              grid: { display: false }
            }
          }
        }
      };
      if (posChart) posChart.destroy();
      posChart = new Chart(posCtx, cfg);
    }

    function buildPctChart(data) {
      var filtered = data.filter(function(d) { return d.pct !== null; });
      if (!filtered.length) { pctCtx.parentElement.innerHTML = '<p style="text-align:center;color:#888;padding:40px;">Add fleet size to your race logs to see fleet percentage trends.</p>'; return; }
      var labels = filtered.map(function(d) { return shortDate(d.date); });
      var pcts = filtered.map(function(d) { return d.pct; });

      // Running average
      var running = [];
      var sum = 0;
      for (var i = 0; i < pcts.length; i++) { sum += pcts[i]; running.push(parseFloat((sum / (i + 1)).toFixed(1))); }

      var cfg = {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Fleet %',
              data: pcts,
              borderColor: green,
              backgroundColor: greenLight,
              fill: true,
              tension: 0.3,
              pointBackgroundColor: green,
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7
            },
            {
              label: 'Running Avg',
              data: running,
              borderColor: navy,
              borderDash: [6, 3],
              borderWidth: 2,
              pointRadius: 0,
              fill: false,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, padding: 14, font: { size: 12 } } },
            tooltip: {
              callbacks: {
                title: function(items) { var idx = items[0].dataIndex; return filtered[idx].name + ' (' + filtered[idx].date + ')'; },
                label: function(item) { return item.dataset.label + ': ' + item.raw + '%'; }
              }
            }
          },
          scales: {
            y: {
              min: 0,
              max: 100,
              title: { display: true, text: 'Fleet % (lower = better)', color: navy, font: { size: 12, weight: 'bold' } },
              ticks: { callback: function(v) { return v + '%'; }, color: '#666' },
              grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
              ticks: { color: '#666', font: { size: 11 }, maxRotation: 45 },
              grid: { display: false }
            }
          }
        }
      };
      if (pctChart) pctChart.destroy();
      pctChart = new Chart(pctCtx, cfg);
    }

    // Breakdown chart (always shows all data)
    function buildBreakdownChart() {
      if (!breakdownData.labels.length) return;
      var cfg = {
        type: 'bar',
        data: {
          labels: breakdownData.labels,
          datasets: [
            { label: 'Races', data: breakdownData.races, backgroundColor: gold, borderRadius: 4 },
            { label: 'Practice', data: breakdownData.practices, backgroundColor: purple, borderRadius: 4 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, padding: 14, font: { size: 12 } } }
          },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1, color: '#666' }, grid: { color: 'rgba(0,0,0,0.05)' }, title: { display: true, text: 'Sessions', color: navy, font: { size: 12, weight: 'bold' } } },
            x: { stacked: true, ticks: { color: '#666', font: { size: 11 } }, grid: { display: false } }
          }
        }
      };
      if (brkChart) brkChart.destroy();
      brkChart = new Chart(brkCtx, cfg);
    }

    window.applyFilter = function() {
      var data = getFiltered();
      updateStats(data);
      buildPositionChart(data);
      buildPctChart(data);
    };

    // Initial render
    applyFilter();
    buildBreakdownChart();
  })();
  </script>

  <style>
    .trends-stat-card {
      background: white;
      border-radius: 12px;
      padding: 16px 12px;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    }
    .trends-stat-num {
      font-size: 1.6rem;
      font-weight: 800;
      color: #0b3d6e;
      line-height: 1.2;
    }
    .trends-stat-label {
      font-size: 0.78rem;
      color: #888;
      font-weight: 600;
      margin-top: 2px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    @media (max-width: 600px) {
      .trends-stat-num { font-size: 1.3rem; }
      .trends-stat-label { font-size: 0.72rem; }
      .trends-stat-card { padding: 12px 8px; }
    }
  </style>`;
}

// --- Shared page templates (Share with Crew) ---

function renderSharePage(title, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0a1628">
  <title>${escapeHtml(title)} — Snipeovation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a2a3a; line-height: 1.6; background: #f5f7fa; }
    .share-header { background: #0b3d6e; color: white; padding: 16px 20px; text-align: center; }
    .share-header h1 { font-size: 1.1rem; font-weight: 700; }
    .share-header .sub { font-size: 0.8rem; opacity: 0.75; display: block; margin-top: 2px; }
    .share-container { max-width: 700px; margin: 0 auto; padding: 20px 16px; }
    .share-card { background: white; border-radius: 14px; padding: 24px 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); margin-bottom: 16px; }
    .share-card h2 { font-size: 1.3rem; color: #0b3d6e; margin-bottom: 4px; }
    .share-card h3 { font-size: 1.05rem; color: #0b3d6e; margin: 16px 0 8px; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0; }
    .share-meta { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
    .share-meta .tag { display: inline-flex; align-items: center; gap: 4px; background: #f0f7ff; color: #0b3d6e; padding: 5px 10px; border-radius: 6px; font-size: 0.82rem; font-weight: 600; }
    .share-meta .tag-position { background: #0b3d6e; color: white; font-size: 1rem; padding: 6px 14px; border-radius: 8px; font-weight: 700; }
    .share-section { margin-top: 16px; }
    .share-section-label { text-transform: uppercase; font-size: 0.75rem; font-weight: 700; color: #0b3d6e; letter-spacing: 0.5px; margin-bottom: 8px; }
    .share-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .share-grid .item { background: #f8fafc; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; color: #444; }
    .share-grid .item strong { color: #333; }
    .share-notes { background: #fafbfc; border-left: 3px solid #0b3d6e; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-top: 12px; font-size: 0.9rem; color: #444; white-space: pre-wrap; }
    .share-report { line-height: 1.7; font-size: 0.93rem; color: #333; }
    .share-report h3 { font-size: 1rem; color: #0b3d6e; margin: 18px 0 6px; border: none; padding: 0; }
    .share-report br + br { display: none; }
    .share-sailor { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .share-sailor .avatar { width: 48px; height: 48px; border-radius: 50%; background: #0b3d6e; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 700; flex-shrink: 0; }
    .share-sailor .info { flex: 1; }
    .share-sailor .name { font-size: 1.1rem; font-weight: 700; color: #0b3d6e; }
    .share-sailor .detail { font-size: 0.82rem; color: #888; }
    .share-footer { text-align: center; padding: 24px 16px; color: #999; font-size: 0.8rem; }
    .share-footer a { color: #1a6fb5; text-decoration: none; font-weight: 600; }
    .share-races { margin-top: 12px; }
    .share-race-item { background: #f8fafc; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; }
    .share-race-item .name { font-weight: 600; color: #333; font-size: 0.9rem; }
    .share-race-item .detail { font-size: 0.8rem; color: #888; }
    @media (max-width: 500px) {
      .share-card { padding: 18px 14px; }
      .share-card h2 { font-size: 1.15rem; }
      .share-meta .tag { font-size: 0.78rem; padding: 4px 8px; }
    }
  </style>
</head>
<body>
  <div class="share-header">
    <h1>Snipeovation</h1>
    <span class="sub">Shared with you</span>
  </div>
  ${content}
  <div class="share-footer">
    Shared via <a href="/">Snipeovation</a> &mdash; Snipe Sailboat Racing Genius Tool
  </div>
</body>
</html>`;
}

function sharedRacePage(log, user, sharedAt) {
  const sailorName = user.display_name || user.username;
  const initial = sailorName.charAt(0).toUpperCase();
  const items = [];
  if (log.wind_speed) items.push(`<div class="item"><strong>Wind:</strong> ${escapeHtml(log.wind_speed)}${log.wind_direction ? " " + escapeHtml(log.wind_direction) : ""}</div>`);
  if (log.sea_state) items.push(`<div class="item"><strong>Sea:</strong> ${escapeHtml(log.sea_state)}</div>`);
  if (log.water_type) items.push(`<div class="item"><strong>Water:</strong> ${escapeHtml(log.water_type)}</div>`);
  if (log.temperature) items.push(`<div class="item"><strong>Temp:</strong> ${escapeHtml(log.temperature)}</div>`);
  if (log.current_tide) items.push(`<div class="item"><strong>Current/Tide:</strong> ${escapeHtml(log.current_tide)}</div>`);
  if (log.fleet_size) items.push(`<div class="item"><strong>Fleet:</strong> ${escapeHtml(log.fleet_size)} boats</div>`);
  if (log.crew_name) items.push(`<div class="item"><strong>Crew:</strong> ${escapeHtml(log.crew_name)}</div>`);
  if (log.boat_number) items.push(`<div class="item"><strong>Boat:</strong> #${escapeHtml(log.boat_number)}</div>`);
  if (log.performance_rating) items.push(`<div class="item"><strong>Rating:</strong> ${escapeHtml(log.performance_rating)}/10</div>`);

  const settings = [];
  if (log.mast_rake) settings.push(`<div class="item"><strong>Mast Rake:</strong> ${escapeHtml(log.mast_rake)}</div>`);
  if (log.shroud_tension) settings.push(`<div class="item"><strong>Shroud:</strong> ${escapeHtml(log.shroud_tension)}</div>`);
  if (log.shroud_turns) settings.push(`<div class="item"><strong>Sta-Master:</strong> ${escapeHtml(log.shroud_turns)}</div>`);
  if (log.wire_size) settings.push(`<div class="item"><strong>Wire:</strong> ${escapeHtml(log.wire_size)}</div>`);
  if (log.spreader_length) settings.push(`<div class="item"><strong>Spreader Len:</strong> ${escapeHtml(log.spreader_length)}</div>`);
  if (log.spreader_sweep) settings.push(`<div class="item"><strong>Spreader Sweep:</strong> ${escapeHtml(log.spreader_sweep)}</div>`);
  if (log.jib_lead) settings.push(`<div class="item"><strong>Jib Lead:</strong> ${escapeHtml(log.jib_lead)}</div>`);
  if (log.cunningham) settings.push(`<div class="item"><strong>Cunningham:</strong> ${escapeHtml(log.cunningham)}</div>`);
  if (log.outhaul) settings.push(`<div class="item"><strong>Outhaul:</strong> ${escapeHtml(log.outhaul)}</div>`);
  if (log.vang) settings.push(`<div class="item"><strong>Vang:</strong> ${escapeHtml(log.vang)}</div>`);
  if (log.traveler_position) settings.push(`<div class="item"><strong>Traveler:</strong> ${escapeHtml(log.traveler_position)}</div>`);
  if (log.main_maker) settings.push(`<div class="item"><strong>Main:</strong> ${escapeHtml(log.main_maker)}${log.main_condition ? " (" + escapeHtml(log.main_condition) + ")" : ""}</div>`);
  if (log.jib_maker) settings.push(`<div class="item"><strong>Jib:</strong> ${escapeHtml(log.jib_maker)}${log.jib_condition ? " (" + escapeHtml(log.jib_condition) + ")" : ""}</div>`);

  return `<div class="share-container">
    <div class="share-card">
      <div class="share-sailor">
        <div class="avatar">${initial}</div>
        <div class="info">
          <div class="name">${escapeHtml(sailorName)}</div>
          <div class="detail">${user.snipe_number ? "Snipe #" + escapeHtml(user.snipe_number) + " &bull; " : ""}Shared ${escapeHtml(sharedAt.slice(0, 10))}</div>
        </div>
      </div>
      <h2>${escapeHtml(log.race_name)}</h2>
      <div class="share-meta">
        <span class="tag">${formatDate(log.race_date)}</span>
        ${log.location ? `<span class="tag">${escapeHtml(log.location)}</span>` : ""}
        ${log.finish_position ? `<span class="tag tag-position">#${escapeHtml(log.finish_position)}</span>` : ""}
      </div>

      ${items.length ? `
      <div class="share-section">
        <div class="share-section-label">Conditions &amp; Details</div>
        <div class="share-grid">${items.join("")}</div>
      </div>` : ""}

      ${settings.length ? `
      <div class="share-section">
        <div class="share-section-label">Boat Settings</div>
        <div class="share-grid">${settings.join("")}</div>
      </div>` : ""}

      ${log.sail_settings_notes ? `
      <div class="share-section">
        <div class="share-section-label">Settings Notes</div>
        <div class="share-notes">${escapeHtml(log.sail_settings_notes)}</div>
      </div>` : ""}

      ${log.notes ? `
      <div class="share-section">
        <div class="share-section-label">Race Notes</div>
        <div class="share-notes">${escapeHtml(log.notes)}</div>
      </div>` : ""}
    </div>
  </div>`;
}

function sharedCoachingPage(report, user, recentLogs, sharedAt) {
  const sailorName = user.display_name || user.username;
  const initial = sailorName.charAt(0).toUpperCase();
  const reportHtml = report.coaching_report.replace(/## /g, '<h3>').replace(/\n/g, '<br>');

  return `<div class="share-container">
    <div class="share-card">
      <div class="share-sailor">
        <div class="avatar">${initial}</div>
        <div class="info">
          <div class="name">${escapeHtml(sailorName)}'s Coaching Report</div>
          <div class="detail">${user.snipe_number ? "Snipe #" + escapeHtml(user.snipe_number) + " &bull; " : ""}${report.race_count} races analyzed${report.has_vakaros ? " &bull; includes Vakaros data" : ""} &bull; ${escapeHtml(report.created_at.slice(0, 10))}</div>
        </div>
      </div>
      <div class="share-report">${reportHtml}</div>
    </div>

    ${recentLogs && recentLogs.length > 0 ? `
    <div class="share-card">
      <h3 style="margin-top:0;">Recent Races</h3>
      <div class="share-races">
        ${recentLogs.map(l => `
          <div class="share-race-item">
            <div>
              <div class="name">${escapeHtml(l.race_name)}</div>
              <div class="detail">${formatDate(l.race_date)}${l.location ? " &mdash; " + escapeHtml(l.location) : ""}${l.wind_speed ? " &bull; " + escapeHtml(l.wind_speed) : ""}</div>
            </div>
            ${l.finish_position ? `<span class="tag tag-position" style="background:#0b3d6e;color:white;padding:4px 10px;border-radius:6px;font-weight:700;font-size:0.85rem;">#${escapeHtml(l.finish_position)}${l.fleet_size ? "/" + escapeHtml(l.fleet_size) : ""}</span>` : ""}
          </div>
        `).join("")}
      </div>
    </div>` : ""}
  </div>`;
}

// Start server

// Serve enhanced hero image
const HERO_IMG_B64 = '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';
const HERO_IMG_BUF = Buffer.from(HERO_IMG_B64, 'base64');
app.get('/hero8.jpg', (req, res) => {
  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(HERO_IMG_BUF);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
