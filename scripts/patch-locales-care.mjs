import fs from 'fs'

for (const loc of ['en', 'pt']) {
  const p = `client/src/locales/${loc}.json`
  const j = JSON.parse(fs.readFileSync(p, 'utf8'))
  const isEn = loc === 'en'

  Object.assign(
    j.day,
    isEn
      ? {
          moodAsk_1: 'Which face fits today?',
          moodAsk_2: 'Quick check-in: how are you?',
          waterAsk_1: 'A sip of water with what you are doing?',
          waterAsk_2: 'Your body wants a drink. Add one?',
          mealAsk_1: 'Anything tasty to note?',
          mealAsk_2: 'One line about your meal is enough.',
          habitAsk_1: 'Did you cross this habit?',
          habitAsk_2: 'Small step: shall we mark it?',
          sleepAsk_1: 'Did sleep take care of you?',
          sleepAsk_2: 'Did you wake more or less rested?',
          meditationAsk_1: 'Three minutes just for you?',
          meditationAsk_2: 'Lower the pace with a breath?',
          activityAsk_1: 'Body in motion today?',
          activityAsk_2: 'A short walk or stretch counts?',
          journalAsk_1: 'What would you like to remember?',
          journalAsk_2: 'One short line from today.',
          shareWithFriends: 'Share with friends',
          closeTitle: 'Day close',
          closeCared: 'Today you cared for:',
          closePhraseHigh: 'You cared for yourself gently. That is already a lot.',
          closePhraseMid: 'You are doing fine. Keep going without pressure.',
          closePhraseSoft: 'Every log counts. Thanks for being here.',
          closePhraseEmpty: 'There is still time. One step is enough.',
          lowEnergy: 'Low energy',
          freezeLeft: '{n} grace day',
          burstMood: 'Mood saved',
          burstWater: 'Water added',
          burstMeal: 'Meal logged',
          burstHabit: 'Habit done',
          burstSleep: 'Sleep logged',
          burstDone: 'Done',
        }
      : {
          moodAsk_1: 'Qual cara combina com hoje?',
          moodAsk_2: 'Check-in rápido: como vai?',
          waterAsk_1: 'Um gole de água no que você faz?',
          waterAsk_2: 'Seu corpo pede água. Somamos?',
          mealAsk_1: 'Algo gostoso para anotar?',
          mealAsk_2: 'Uma linha sobre a refeição basta.',
          habitAsk_1: 'Já fez esse hábito?',
          habitAsk_2: 'Pequeno passo: marcamos?',
          sleepAsk_1: 'O sono cuidou de você?',
          sleepAsk_2: 'Acordou mais ou menos descansado?',
          meditationAsk_1: 'Três minutos só para você?',
          meditationAsk_2: 'Baixamos o ritmo com a respiração?',
          activityAsk_1: 'Corpo em movimento hoje?',
          activityAsk_2: 'Uma caminhada ou alongamento conta?',
          journalAsk_1: 'O que você quer lembrar?',
          journalAsk_2: 'Uma linha curta do dia.',
          shareWithFriends: 'Compartilhar com amigos',
          closeTitle: 'Fechamento do dia',
          closeCared: 'Hoje você cuidou de:',
          closePhraseHigh: 'Você se cuidou com calma. Isso já é muito.',
          closePhraseMid: 'Vai bem. O importante é seguir sem pressão.',
          closePhraseSoft: 'Cada registro conta. Obrigado por estar aqui.',
          closePhraseEmpty: 'Ainda dá tempo. Um passo basta.',
          lowEnergy: 'Energia baixa',
          freezeLeft: '{n} dia de graça',
          burstMood: 'Humor anotado',
          burstWater: 'Água somada',
          burstMeal: 'Refeição registrada',
          burstHabit: 'Hábito pronto',
          burstSleep: 'Sono contado',
          burstDone: 'Pronto',
        },
  )
  j.day.moreHints = {
    ...(j.day.moreHints || {}),
    practices: isEn ? '1–3 min micro-practices' : 'Micropráticas de 1–3 min',
  }

  j.rituals = isEn
    ? {
        morning: { short: 'Wake', title: 'Morning ritual' },
        evening: { short: 'Close', title: 'Evening ritual' },
        reset: { short: 'Reset', title: 'Reset ritual' },
      }
    : {
        morning: { short: 'Manhã', title: 'Ritual da manhã' },
        evening: { short: 'Noite', title: 'Ritual da noite' },
        reset: { short: 'Reset', title: 'Ritual de reset' },
      }

  j.practices = isEn
    ? {
        title: 'Micro-practices',
        subtitle: '1 to 3 minutes. No long courses.',
        open: 'See micro-practices',
        minutes: '{n} min',
        items: {
          breathe_box: { title: 'Short breath', hint: 'Calm the system' },
          shoulders: { title: 'Shoulders & neck', hint: 'Release tension' },
          gratitude_one: { title: 'One gratitude', hint: 'Opens the journal' },
          walk_desk: { title: 'Desk walk', hint: '3 minutes of movement' },
          body_scan_mini: { title: 'Mini body scan', hint: 'Notice the body' },
          water_pause: { title: 'Water pause', hint: 'A mindful glass' },
        },
      }
    : {
        title: 'Micropráticas',
        subtitle: '1 a 3 minutos. Sem cursos longos.',
        open: 'Ver micropráticas',
        minutes: '{n} min',
        items: {
          breathe_box: { title: 'Respiração curta', hint: 'Acalma o sistema' },
          shoulders: { title: 'Ombros e pescoço', hint: 'Solta a tensão' },
          gratitude_one: { title: 'Uma gratidão', hint: 'Abre o diário' },
          walk_desk: { title: 'Caminhada de mesa', hint: '3 minutos de movimento' },
          body_scan_mini: { title: 'Escaneamento breve', hint: 'Notar o corpo' },
          water_pause: { title: 'Pausa com água', hint: 'Um copo consciente' },
        },
      }

  j.journal = {
    ...j.journal,
    promptsTitle: isEn ? 'Want a gentle prompt?' : 'Quer um empurrãozinho?',
    prompts: isEn
      ? {
          peace: 'Today brought me peace…',
          proud: 'Today I feel proud of…',
          release: 'Today I can let go of…',
          thanks: 'Today I am grateful for…',
          tomorrow: 'Tomorrow I want to care for…',
        }
      : {
          peace: 'Hoje me trouxe paz…',
          proud: 'Hoje me sinto orgulhoso de…',
          release: 'Hoje posso soltar…',
          thanks: 'Hoje agradeço…',
          tomorrow: 'Amanhã quero cuidar…',
        },
  }

  j.friends = {
    ...j.friends,
    reactCheer: isEn ? 'Cheer' : 'Ânimo',
    reactStrength: isEn ? 'Strength' : 'Força',
    checkInTitle: isEn ? 'Friends check-in' : 'Check-in com amigos',
    checkInHint: isEn
      ? 'A short note or photo. Just today. No social feed pressure.'
      : 'Uma nota curta ou foto. Só hoje. Sem pressão de rede social.',
    likesStat: isEn ? 'Cheers received' : 'Ânimos recebidos',
    dislikesStat: isEn ? 'Strength received' : 'Força recebida',
  }

  j.stats = {
    ...j.stats,
    freeze: isEn ? 'Grace days' : 'Dias de graça',
    freezeHint: isEn
      ? 'If you miss a day, your streak can be saved once a week.'
      : 'Se falhar um dia, a sequência pode se salvar uma vez por semana.',
    correlations: isEn ? 'Gentle patterns' : 'Padrões suaves',
    correlationsEmpty: isEn
      ? 'With more logged days, kind patterns will show here.'
      : 'Com mais dias registrados, padrões amáveis aparecem aqui.',
    likes: isEn ? 'Friend cheers' : 'Ânimos de amigos',
    dislikes: isEn ? 'Friend strength' : 'Força de amigos',
  }

  j.insights = {
    ...j.insights,
    corrSleepMood: isEn
      ? 'When you sleep better, your mood often rises. Worth caring for.'
      : 'Quando você dorme melhor, o humor costuma subir. Vale cuidar.',
    corrWaterMood: isEn
      ? 'Days with more water line up with a better mood in your history.'
      : 'Dias com mais água coincidem com melhor humor no seu histórico.',
    corrMoveMood: isEn
      ? 'Moving a little seems to go with a higher mood.'
      : 'Se mover um pouco parece acompanhar um humor mais alto.',
  }

  fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n')
  console.log('updated', loc)
}
