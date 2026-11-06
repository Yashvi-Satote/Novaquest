/**
 * novaCompanionService.js
 * 
 * Context-aware intelligent space education dialog engine for NOVA,
 * the personal astronaut AI guide of NovaQuest.
 * 
 * Supports:
 * - Real-time context tracking (Planets, Moons, Spacecraft, Small Bodies)
 * - Educational intent matching (Moons, Atmosphere, Size, Distance, Habitability, Missions, Fun Facts)
 * - Follow-up conversation history tracking
 * - Natural conversational variation and kid-friendly explanations
 */

import { getNovaProfile } from './novaSpaceKnowledge';

export class NovaCompanionService {
  constructor() {
    this.currentContext = null;
    this.conversationHistory = [];
    this.voiceEnabled = false;
    this.speechSynth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  }

  /**
   * Called whenever user clicks any celestial body or spacecraft in the 3D scene.
   */
  selectObject(idOrSlug, fallbackData = {}) {
    const profile = getNovaProfile(idOrSlug);
    const objectName = profile?.name || fallbackData.name || idOrSlug;

    const isNewContext = !this.currentContext || this.currentContext.id !== (profile?.id || idOrSlug);

    this.currentContext = {
      id: profile?.id || idOrSlug,
      name: objectName,
      type: profile?.type || fallbackData.type || 'celestial_object',
      profile,
      fallbackData
    };

    if (isNewContext) {
      const greetingText = profile?.greeting || 
        `Welcome to ${objectName}! 🚀 I'm NOVA, your space guide! Let's explore its cosmic secrets together. What would you like to know?`;

      const novaMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        sender: 'nova',
        text: greetingText,
        timestamp: new Date(),
        expression: 'explaining',
        suggestedQuestions: profile?.suggestedQuestions || [
          `Tell me a fun fact about ${objectName}!`,
          `How far is ${objectName} from the Sun?`,
          `Could humans visit ${objectName}?`
        ]
      };

      this.conversationHistory.push(novaMessage);
      this.speak(greetingText);
      return novaMessage;
    }

    return null;
  }

  /**
   * Process a user question using contextual intelligence.
   */
  ask(question) {
    if (!question || !question.trim()) return null;
    const cleanQ = question.trim().toLowerCase();

    // 1. Record user question in conversation history
    const userMsg = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender: 'user',
      text: question.trim(),
      timestamp: new Date()
    };
    this.conversationHistory.push(userMsg);

    // 2. Formulate contextual response
    const context = this.currentContext;
    const profile = context?.profile;
    const name = context?.name || 'this celestial object';

    let reply = '';
    let expression = 'happy';

    // A. General Greeting / Identity
    if (cleanQ.includes('who are you') || cleanQ.includes('what are you') || cleanQ.includes('hello') || cleanQ.includes('hi nova')) {
      reply = `Hello! 👋 I'm NOVA, your personal astronaut companion and space guide! My mission is to travel across the Solar System with you and share the wonders of space science, planets, and historic spacecraft!`;
      expression = 'happy';
    }

    // B. Moons & Satellites
    else if (cleanQ.includes('moon') || cleanQ.includes('satellite') || cleanQ.includes('ring')) {
      if (profile?.sections?.moons) {
        reply = profile.sections.moons;
      } else if (profile?.quickFacts?.moons) {
        reply = `${name} has ${profile.quickFacts.moons}!`;
      } else {
        reply = `${name} does not have known natural moons in official astronomical records!`;
      }
      expression = 'explaining';
    }

    // C. Size, Diameter, Mass
    else if (cleanQ.includes('big') || cleanQ.includes('size') || cleanQ.includes('diameter') || cleanQ.includes('wide') || cleanQ.includes('mass')) {
      if (profile?.sections?.size) {
        reply = profile.sections.size;
      } else if (profile?.quickFacts?.diameter) {
        reply = `${name} has a diameter of ${profile.quickFacts.diameter}!`;
      } else {
        reply = `${name} is an extraordinary object in our Solar System!`;
      }
      expression = 'wondering';
    }

    // D. Distance from Sun or Earth
    else if (cleanQ.includes('distance') || cleanQ.includes('how far') || cleanQ.includes('orbit')) {
      if (profile?.quickFacts?.distanceFromSun) {
        reply = `${name} is located approximately ${profile.quickFacts.distanceFromSun} from the Sun!`;
      } else if (profile?.quickFacts?.distanceFromEarth) {
        reply = `${name} is about ${profile.quickFacts.distanceFromEarth} from Earth!`;
      } else {
        reply = `${name} follows a precise gravitational orbit calculated from NASA JPL ephemerides!`;
      }
      expression = 'explaining';
    }

    // E. Temperature, Climate, Weather
    else if (cleanQ.includes('hot') || cleanQ.includes('cold') || cleanQ.includes('temp') || cleanQ.includes('weather') || cleanQ.includes('climate')) {
      if (profile?.sections?.temperature) {
        reply = profile.sections.temperature;
      } else if (profile?.quickFacts?.surfaceTemp) {
        reply = `The temperature on ${name} ranges around ${profile.quickFacts.surfaceTemp}!`;
      } else {
        reply = `Temperatures in outer space are extreme, ranging from burning solar radiation to deep interstellar frost!`;
      }
      expression = 'wondering';
    }

    // F. Atmosphere, Air, Breathing
    else if (cleanQ.includes('air') || cleanQ.includes('breath') || cleanQ.includes('atmosphere') || cleanQ.includes('oxygen') || cleanQ.includes('gas')) {
      if (profile?.sections?.atmosphere) {
        reply = profile.sections.atmosphere;
      } else if (profile?.quickFacts?.atmosphere) {
        reply = `${name}'s atmosphere is composed of: ${profile.quickFacts.atmosphere}.`;
      } else {
        reply = `${name} does not have a breathable atmosphere. Astronauts always need a pressurized spacesuit with oxygen!`;
      }
      expression = 'explaining';
    }

    // G. Surface, Terrain, Canyons, Volcanoes
    else if (cleanQ.includes('surface') || cleanQ.includes('rock') || cleanQ.includes('volcano') || cleanQ.includes('canyon') || cleanQ.includes('water') || cleanQ.includes('ocean')) {
      if (profile?.sections?.surface) {
        reply = profile.sections.surface;
      } else if (profile?.sections?.ocean) {
        reply = profile.sections.ocean;
      } else {
        reply = `${name} has a distinctive geological surface mapped by planetary orbiters and radar observations!`;
      }
      expression = 'explaining';
    }

    // H. Can humans live / visit / habitability
    else if (cleanQ.includes('live') || cleanQ.includes('human') || cleanQ.includes('visit') || cleanQ.includes('colon') || cleanQ.includes('survive')) {
      if (profile?.sections?.habitability) {
        reply = profile.sections.habitability;
      } else {
        reply = `Surviving on ${name} would require advanced life support, sealed habitats, and thermal protection against extreme space conditions!`;
      }
      expression = 'wondering';
    }

    // I. Exploration & Spacecraft missions
    else if (cleanQ.includes('visit') || cleanQ.includes('spacecraft') || cleanQ.includes('mission') || cleanQ.includes('explore') || cleanQ.includes('probe') || cleanQ.includes('apollo') || cleanQ.includes('rover')) {
      if (profile?.sections?.exploration) {
        reply = profile.sections.exploration;
      } else if (profile?.sections?.mission) {
        reply = profile.sections.mission;
      } else {
        reply = `${name} has been studied through robotic space probes, space telescopes, and planetary science teams around the world!`;
      }
      expression = 'explaining';
    }

    // J. Fun facts / Cool facts
    else if (cleanQ.includes('fact') || cleanQ.includes('cool') || cleanQ.includes('fun') || cleanQ.includes('secret') || cleanQ.includes('tell me more')) {
      if (profile?.sections?.coolFact) {
        reply = `Here is a mind-blowing fact: ${profile.sections.coolFact}`;
      } else if (profile?.tagline) {
        reply = `${name} is famous as: ${profile.tagline}!`;
      } else {
        reply = `Did you know? Every celestial body in our 3D Solar System moves along scientifically calculated orbital paths derived directly from NASA Keplerian formulas!`;
      }
      expression = 'happy';
    }

    // K. Specific Spacecraft inquiries (Golden Record, Instruments, Airbags)
    else if (cleanQ.includes('golden record')) {
      reply = profile?.sections?.goldenRecord || `The Golden Record is a gold-plated copper phonograph carrying the sounds, languages, and music of Earth to potential extraterrestrial civilizations!`;
      expression = 'happy';
    } else if (cleanQ.includes('sojourner') || cleanQ.includes('rover')) {
      reply = profile?.sections?.sojourner || `Sojourner was the first micro-rover ever driven on another planet, proving that robotic wheels could navigate Martian rock fields!`;
      expression = 'happy';
    }

    // L. Default Contextual Fallback
    else {
      if (profile?.tagline) {
        reply = `Great question! On ${name}, ${profile.tagline.toLowerCase()} We're still discovering new secrets about it every year through missions and space telescopes! Feel free to ask about its size, atmosphere, temperature, moons, or exploration history!`;
      } else {
        reply = `That's a curious question! Exploring ${name} teaches us so much about how our Solar System formed 4.6 billion years ago. What else would you like to investigate?`;
      }
      expression = 'wondering';
    }

    const novaReply = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender: 'nova',
      text: reply,
      timestamp: new Date(),
      expression
    };

    this.conversationHistory.push(novaReply);
    this.speak(reply);
    return novaReply;
  }

  /**
   * Text-to-Speech synthesis with kid-friendly pitch.
   */
  speak(text) {
    if (!this.voiceEnabled || !this.speechSynth) return;
    try {
      this.speechSynth.cancel(); // Cancel prior utterances
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.15; // Friendly, slightly upbeat tone
      utterance.rate = 1.02;
      this.speechSynth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis not available or failed:', e);
    }
  }

  setVoiceEnabled(enabled) {
    this.voiceEnabled = Boolean(enabled);
    if (!this.voiceEnabled && this.speechSynth) {
      this.speechSynth.cancel();
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

export const novaCompanion = new NovaCompanionService();
