const MSG = {
  es: {
    title: 'Correctly',
    water: '¿Un vasito de agua? 💧',
    mood: '¿Cómo te sientes ahora?',
    meals: 'Si ya comiste, cuéntalo en un toque',
    habits: 'Un momentito para tus hábitos',
    sleep: 'Buena hora para ir bajando el ritmo 🌙',
    summary: '¿Cómo va tu día? Échale un vistazo',
    friends: '¿Una nota o foto para tus amigos?',
    custom: 'Tu recordatorio de Correctly',
  },
  en: {
    title: 'Correctly',
    water: 'A glass of water? 💧',
    mood: 'How are you feeling right now?',
    meals: 'If you already ate, log it in one tap',
    habits: 'A moment for your habits',
    sleep: 'Nice time to slow down 🌙',
    summary: "How's your day going? Take a look",
    friends: 'A note or photo for your friends?',
    custom: 'Your Correctly reminder',
  },
  pt: {
    title: 'Correctly',
    water: "Um copinho d'água? 💧",
    mood: 'Como você se sente agora?',
    meals: 'Se já comeu, registre em um toque',
    habits: 'Um momentinho para seus hábitos',
    sleep: 'Boa hora para ir desacelerando 🌙',
    summary: 'Como vai seu dia? Dê uma olhada',
    friends: 'Uma nota ou foto para seus amigos?',
    custom: 'Seu lembrete do Correctly',
  },
}

const ROUTES = {
  water: '/water',
  mood: '/mood',
  meals: '/meals',
  habits: '/habits',
  sleep: '/sleep',
  summary: '/dashboard',
  friends: '/friends',
  custom: '/dashboard',
}

export function reminderPayload(reminder, language = 'es') {
  const lang = MSG[language] ? language : 'es'
  const pack = MSG[lang]
  const body =
    reminder.label?.trim() ||
    pack[reminder.type] ||
    pack.custom
  return {
    title: pack.title,
    body,
    url: ROUTES[reminder.type] || '/dashboard',
    tag: `correctly-${reminder.id}`,
    silent: reminder.withSound === false,
  }
}
