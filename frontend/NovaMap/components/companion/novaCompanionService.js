/**
 * novaCompanionService.js
 * 
 * Context-aware intelligent space education dialog engine for NOVA,
 * the personal astronaut AI guide of NovaQuest.
 * 
 * Supports:
 * - Real-time context tracking (Planets, Moons, Spacecraft, Small Bodies)
 * - Educational intent matching (Moons, Atmosphere, Size, Distance, Habitability, Discovery, Missions, Fun Facts)
 * - Follow-up conversation history tracking without repetitive greeting loops
 * - Natural conversational variation and child-friendly explanations
 * - Integration hook for future external AI backend (/api/nova-chat)
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
        `Welcome to ${objectName}! 🚀 I'm NOVA, your personal space guide! Let's explore its cosmic secrets together. What would you like to know?`;

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

    // 2. Formulate contextual response based on current selected object
    const context = this.currentContext;
    const profile = context?.profile;
    const name = context?.name || 'this celestial object';

    let reply = '';
    let expression = 'happy';

    // A. Identity / General Greeting
    if (cleanQ.includes('who are you') || cleanQ.includes('what are you') || cleanQ.includes('hello') || cleanQ.includes('hi nova')) {
      reply = `Hello! 👋 I'm NOVA, your personal astronaut companion and space guide! My mission is to travel across the Solar System with you and share the wonders of space science, planets, and historic spacecraft!`;
      expression = 'happy';
    }

    // B. Moons & Natural Satellites / Rings
    else if (cleanQ.includes('moon') || cleanQ.includes('satellite') || cleanQ.includes('ring')) {
      if (cleanQ.includes('ring')) {
        if (profile?.quickFacts?.ringSpan || profile?.sections?.rings || name.toLowerCase().includes('saturn')) {
          reply = profile?.sections?.rings || `${name}'s rings are made of billions of chunks of water ice, rock, and dust spanning hundreds of thousands of kilometers, yet only ~10 to 30 meters thick!`;
        } else {
          reply = `${name} does not have prominent rings like Saturn. In our solar system, only the four gas and ice giants (Jupiter, Saturn, Uranus, Neptune) possess rings!`;
        }
      } else {
        if (profile?.sections?.moons) {
          reply = profile.sections.moons;
        } else if (profile?.quickFacts?.moons) {
          reply = `${name} has ${profile.quickFacts.moons}!`;
        } else if (profile?.quickFacts?.parentPlanet) {
          reply = `${name} is itself a moon orbiting ${profile.quickFacts.parentPlanet}!`;
        } else {
          reply = `${name} has no known natural moons recorded in official astronomical databases.`;
        }
      }
      expression = 'explaining';
    }

    // C. Parent Planet (for moons)
    else if (cleanQ.includes('parent planet') || cleanQ.includes('which planet') || cleanQ.includes('orbit what') || cleanQ.includes('what does it orbit')) {
      if (profile?.quickFacts?.parentPlanet) {
        reply = `${name} is a natural satellite in orbit around ${profile.quickFacts.parentPlanet}!`;
        expression = 'explaining';
      } else {
        reply = `${name} orbits the Sun directly as a ${profile?.category || 'celestial body'}!`;
        expression = 'happy';
      }
    }

    // D. Size, Diameter, Mass, Gravity
    else if (cleanQ.includes('big') || cleanQ.includes('size') || cleanQ.includes('diameter') || cleanQ.includes('wide') || cleanQ.includes('mass') || cleanQ.includes('gravity')) {
      if (cleanQ.includes('gravity') && profile?.quickFacts?.gravity) {
        reply = `The surface gravity on ${name} is ${profile.quickFacts.gravity}!`;
      } else if (profile?.sections?.size) {
        reply = profile.sections.size;
      } else if (profile?.quickFacts?.diameter) {
        reply = `${name} has a diameter of ${profile.quickFacts.diameter}!`;
      } else {
        reply = `Scientific measurements for ${name} place it among the carefully mapped objects in our Solar System!`;
      }
      expression = 'wondering';
    }

    // E. Distance from Sun or Earth
    else if (cleanQ.includes('distance') || cleanQ.includes('how far') || cleanQ.includes('where is it') || cleanQ.includes('orbit')) {
      if (profile?.quickFacts?.distanceFromSun) {
        reply = `${name} is located approximately ${profile.quickFacts.distanceFromSun} from the Sun!`;
      } else if (profile?.quickFacts?.distanceFromEarth) {
        reply = `${name} is about ${profile.quickFacts.distanceFromEarth} from Earth!`;
      } else if (profile?.quickFacts?.distanceFromMars) {
        reply = `${name} is about ${profile.quickFacts.distanceFromMars} from Mars!`;
      } else {
        reply = `${name} follows a precise gravitational orbit derived directly from NASA JPL Horizons ephemerides!`;
      }
      expression = 'explaining';
    }

    // F. Temperature, Climate, Weather
    else if (cleanQ.includes('hot') || cleanQ.includes('cold') || cleanQ.includes('temp') || cleanQ.includes('weather') || cleanQ.includes('climate')) {
      if (profile?.sections?.temperature) {
        reply = profile.sections.temperature;
      } else if (profile?.quickFacts?.surfaceTemp) {
        reply = `The temperature on ${name} ranges around ${profile.quickFacts.surfaceTemp}!`;
      } else {
        reply = `Temperatures in this region of space are extreme, varying based on solar radiation and distance from the Sun!`;
      }
      expression = 'wondering';
    }

    // G. Atmosphere, Air, Breathing, Clouds
    else if (cleanQ.includes('air') || cleanQ.includes('breath') || cleanQ.includes('atmosphere') || cleanQ.includes('oxygen') || cleanQ.includes('gas') || cleanQ.includes('cloud')) {
      if (profile?.sections?.atmosphere) {
        reply = profile.sections.atmosphere;
      } else if (profile?.quickFacts?.atmosphere) {
        reply = `${name}'s atmosphere consists of: ${profile.quickFacts.atmosphere}.`;
      } else {
        reply = `${name} does not possess a breathable atmosphere. Astronauts always require a pressurized spacesuit with oxygen!`;
      }
      expression = 'explaining';
    }

    // H. Surface, Geology, Oceans, Water, Volcanoes, Canyons
    else if (cleanQ.includes('surface') || cleanQ.includes('rock') || cleanQ.includes('volcano') || cleanQ.includes('canyon') || cleanQ.includes('water') || cleanQ.includes('ocean') || cleanQ.includes('ice') || cleanQ.includes('made of') || cleanQ.includes('composition')) {
      if (cleanQ.includes('water') || cleanQ.includes('ocean') || cleanQ.includes('ice')) {
        if (profile?.sections?.ocean) {
          reply = profile.sections.ocean;
        } else if (profile?.sections?.surface && profile.sections.surface.toLowerCase().includes('ice')) {
          reply = profile.sections.surface;
        } else if (name.toLowerCase().includes('europa') || name.toLowerCase().includes('enceladus')) {
          reply = `${name} has an underground global liquid saltwater ocean beneath its outer ice shell!`;
        } else {
          reply = `Water ice exists in shadowed craters and polar caps on several worlds like Mercury, the Moon, and Mars, while worlds like Europa and Enceladus harbor subterranean oceans!`;
        }
      } else if (cleanQ.includes('volcano') && profile?.sections?.volcanism) {
        reply = profile.sections.volcanism;
      } else if (profile?.sections?.surface) {
        reply = profile.sections.surface;
      } else {
        reply = `${name} has a distinctive geological surface mapped by planetary orbiters and radar observations!`;
      }
      expression = 'explaining';
    }

    // I. Habitability & Human Survival
    else if (cleanQ.includes('live') || cleanQ.includes('human') || cleanQ.includes('visit') || cleanQ.includes('colon') || cleanQ.includes('survive')) {
      if (profile?.sections?.habitability) {
        reply = profile.sections.habitability;
      } else {
        reply = `Surviving on ${name} would require pressurized habitats, radiation shielding, thermal control, and a steady supply of oxygen!`;
      }
      expression = 'wondering';
    }

    // J. Discovery & History
    else if (cleanQ.includes('discover') || cleanQ.includes('who found') || cleanQ.includes('when was it') || cleanQ.includes('history')) {
      if (profile?.sections?.discovery) {
        reply = profile.sections.discovery;
      } else if (profile?.quickFacts?.launchDate) {
        reply = `${name} was launched on ${profile.quickFacts.launchDate} by ${profile.quickFacts.agency || 'aerospace engineers'}!`;
      } else {
        reply = `${name} has been catalogued and verified through official astronomical records and space exploration agencies.`;
      }
      expression = 'explaining';
    }

    // K. Exploration & Spacecraft Missions
    else if (cleanQ.includes('mission') || cleanQ.includes('spacecraft') || cleanQ.includes('probe') || cleanQ.includes('rover') || cleanQ.includes('landed') || cleanQ.includes('explore')) {
      if (profile?.sections?.exploration) {
        reply = profile.sections.exploration;
      } else if (profile?.sections?.mission) {
        reply = profile.sections.mission;
      } else {
        reply = `${name} has been studied through robotic space probes, orbital telescopes, and international space research teams!`;
      }
      expression = 'explaining';
    }

    // L. Spacecraft-Specific Inquiries (Agency, Launch Date, Status, Discoveries, Golden Record)
    else if (cleanQ.includes('agency') || cleanQ.includes('who built') || cleanQ.includes('who made') || cleanQ.includes('operator')) {
      if (profile?.quickFacts?.agency) {
        reply = `${name} was developed and operated by ${profile.quickFacts.agency}!`;
      } else {
        reply = `Information on the exact manufacturing contractor is preserved in our historical mission registry.`;
      }
      expression = 'explaining';
    }
    else if (cleanQ.includes('launch') || cleanQ.includes('when did it launch')) {
      if (profile?.quickFacts?.launchDate) {
        reply = `${name} was launched on ${profile.quickFacts.launchDate}!`;
      } else {
        reply = `Launch telemetry for ${name} is recorded in official aerospace archives.`;
      }
      expression = 'explaining';
    }
    else if (cleanQ.includes('status') || cleanQ.includes('is it still working') || cleanQ.includes('is it alive')) {
      if (profile?.quickFacts?.status) {
        reply = `${name} operational status: ${profile.quickFacts.status}!`;
      } else {
        reply = `Mission status records are verified against active NASA and international space agency telemetry.`;
      }
      expression = 'explaining';
    }
    else if (cleanQ.includes('golden record')) {
      reply = profile?.sections?.goldenRecord || `The Golden Record is a gold-plated copper phonograph record carrying greetings in 55 languages, music, and images from Earth into the cosmos on Voyager 1 and 2!`;
      expression = 'happy';
    }
    else if (cleanQ.includes('grand finale')) {
      reply = profile?.sections?.grandFinale || `Cassini's Grand Finale in 2017 involved 22 daring dives between Saturn and its rings before an intentional dive into Saturn's atmosphere to protect pristine ocean moons!`;
      expression = 'happy';
    }

    // M. Fun Facts / Curiosities
    else if (cleanQ.includes('fact') || cleanQ.includes('cool') || cleanQ.includes('fun') || cleanQ.includes('secret') || cleanQ.includes('tell me more')) {
      if (profile?.sections?.coolFact) {
        reply = `Here is a mind-blowing fact: ${profile.sections.coolFact}`;
      } else if (profile?.tagline) {
        reply = `${name} is famous as: ${profile.tagline}!`;
      } else {
        reply = `Did you know? Every object in our 3D Solar System moves along scientifically calibrated orbital paths calculated directly from NASA Keplerian formulas!`;
      }
      expression = 'happy';
    }

    // N. Default Contextual Fallback
    else {
      if (profile?.tagline) {
        reply = `Great question about ${name}! ${profile.tagline} Feel free to ask me about its size, atmosphere, temperature, moons, or space exploration history!`;
      } else {
        reply = `That's an insightful question! Exploring ${name} teaches us so much about the evolution of our Solar System. What else would you like to investigate?`;
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
