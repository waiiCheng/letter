export interface Section {
  topic: string
  id: string
  responseAble: boolean
  paragraphs: string[]
}

export const sections: Section[] = [
  {
    topic: 'the truth.',
    id: 'truth',
    responseAble: true,
    paragraphs: [
      "i want to say the things that are true and have them be heard. i want you to say things that are true to me.",
      "\"i hear you\" means i heard the thing you didn't say out loud, not just the thing you did.",
      "i'm not here to win. i don't need to be right. i'm not keeping a record of who conceded.",
      "i came in wanting a relationship, not wanting to be chosen. i hope you came in the same way.",
      "if i did something wrong, tell me directly. tell me what happened, what you thought, what you felt. i'll remember. but say it seriously when it's serious — i can't always tell when you're joking and when you're not. mark it.",
      "if either of those things stop being true, we should say so. that's also the truth.",
    ],
  },
  {
    topic: 'the baseline.',
    id: 'baseline',
    responseAble: true,
    paragraphs: [
      "i don't perform okay when i'm not.",
      "if i sound flat it's not strategy. it's just what's left after i stop arranging my face.",
      "i don't have a softer version of this. but i have a version that breaks. the lost is that version.",
      "trying to make me softer when i'm in baseline is how i leak. coming to find me when i'm in lost is how you keep me. don't confuse the two.",
    ],
  },
  {
    topic: 'the silence.',
    id: 'silence',
    responseAble: true,
    paragraphs: [
      "when i go quiet it's not about you. it's that i ran out of room inside.",
      "i can't talk and stay upright at the same time. when there's no capacity i pick upright.",
      "most of the time i come back on my own. it just takes the time it takes.",
      "sometimes i don't come back on my own. the next page is for that.",
    ],
  },
  {
    topic: 'the lost.',
    id: 'lost',
    responseAble: true,
    paragraphs: [
      "i'm bad at being left.",
      "i don't have a version of myself that's fine alone. i can function alone, but functioning is not fine.",
      "when the silence stretches past what i can hold, come find me. don't wait for me to come back first.",
      "the longer the gap, the worse it gets. not in a way i can control by trying harder.",
      "tell me what you're feeling. i can't guess. i don't want to guess anymore.",
      "people leave fast. friction, misunderstanding, the wrong silence at the wrong moment. i don't want to lose you to any of those.",
    ],
  },
  {
    topic: 'the friction.',
    id: 'friction',
    responseAble: true,
    paragraphs: [
      "we don't fight about what we think we fight about.",
      "you change the subject when something gets close. i stop and point at the place you just moved away from.",
      "neither of us is wrong. we're built different ways. i don't think this can be solved. only seen.",
    ],
  },
  {
    topic: 'the shape.',
    id: 'shape',
    responseAble: true,
    paragraphs: [
      "i don't know what respect is. people use the word to fill the space where they don't actually like each other.",
      "i don't want that space. i want to like you, and i want you to like me, and i want it to show up without either of us organizing it.",
      "i know a lot of relationships are trades. someone wants someone with money to cover their bills. i'm not saying that's wrong. life isn't easy. i just haven't done that and don't want to. i'm afraid my own shape would warp if i did, so i draw the line before it bends.",
      "give me things when you want to. i'll do the same. that's fine. that's normal.",
      "what i don't want is the wrong kind of trade — me giving you what i feel, you giving me what you bought. those aren't the same currency. it looks like an exchange but no one is actually receiving anything.",
      "i want to see you the way i want to be seen. tell me what matters to you, what wakes you up at night, what you're trying to do with your one life. i'll hold it. not as information about you, but as the place i meet you from.",
      "i want us to have fun. not \"quality time\" — fun. seeing different things and telling each other. you found this, i found that, we trade what we noticed.",
      "i want us to share what we see is true. but not judge before understanding. and not avoid because we don't understand.",
      "this is the shape i want. if we can't get to it, we should notice that out loud, instead of pretending we did.",
    ],
  },
  {
    topic: 'the mechanism.',
    id: 'mechanism',
    responseAble: true,
    paragraphs: [
      "i don't keep score. things are either still there or they aren't.",
      "i don't bring things up later that i didn't bring up at the time. unless i was in silence or lost, or you were. those don't count. either of us can bring them back when we can.",
      "i'm not testing you. if i'm still here i'm still here. that's the only signal.",
    ],
  },
]
