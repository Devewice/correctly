/** Mensajes de toque a amigos por idioma */
export const NUDGE_TEMPLATES = {
  thinking: {
    es: 'Acabo de pensar en ti 💭',
    en: 'I just thought of you 💭',
    pt: 'Acabei de pensar em você 💭',
  },
  call_me: {
    es: 'Llámame cuando puedas 📞',
    en: 'Call me when you can 📞',
    pt: 'Me liga quando puder 📞',
  },
  remembered: {
    es: 'Me acordé de ti y sonreí ✨',
    en: 'I remembered you and smiled ✨',
    pt: 'Lembrei de você e sorri ✨',
  },
  morning: {
    es: 'Buenos días — que tu día sea suave ☀️',
    en: 'Good morning — keep it gentle ☀️',
    pt: 'Bom dia — que o dia seja leve ☀️',
  },
  check_in: {
    es: '¿Cómo vas? Estoy aquí 🌿',
    en: 'How are you doing? I’m here 🌿',
    pt: 'Como você está? Estou aqui 🌿',
  },
  proud: {
    es: 'Estoy orgulloso/a de ti 💛',
    en: 'I’m proud of you 💛',
    pt: 'Tenho orgulho de você 💛',
  },
  laugh: {
    es: 'Necesito una risa contigo 😄',
    en: 'I need a laugh with you 😄',
    pt: 'Preciso de uma risada com você 😄',
  },
  rest: {
    es: 'Cuida tu noche — descansa bien 🌙',
    en: 'Take care tonight — rest well 🌙',
    pt: 'Cuide da sua noite — descanse bem 🌙',
  },
}

export const NUDGE_MAX_LEN = 160
export const NUDGE_DAILY_LIMIT = 8

export function resolveNudgeMessage(templateId, custom, language = 'es') {
  const lang = ['es', 'en', 'pt'].includes(language) ? language : 'es'
  if (templateId && NUDGE_TEMPLATES[templateId]) {
    return NUDGE_TEMPLATES[templateId][lang] || NUDGE_TEMPLATES[templateId].es
  }
  const text = String(custom || '').trim().slice(0, NUDGE_MAX_LEN)
  return text || null
}
