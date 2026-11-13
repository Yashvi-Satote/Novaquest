/**
 * Task 3 Data & Problem Definitions (Kid-friendly, ages 8-12)
 * All text and answers configured in this central file for easy editing.
 */

export const TASK3_DATA = {
  title: "TASK 3: EMERGENCY RESCUE PLAN",
  subtitle: "Helium Leak Anomaly · Surveyor 5 Descent Engine",
  
  stepA: {
    heading: "What happened to Surveyor 5?",
    explanation:
      "Surveyor 5 uses helium gas like air in a balloon. It pushes fuel into the rocket engine so the engine can work. Oh no! A little bit of helium is leaking out, so the push is getting weaker. If we do nothing, the engine might not have enough push to land gently on the Moon.",
    diagramCaption: "High-pressure helium pushes rocket fuel into the landing thrusters.",
  },

  stepB: {
    prompt: "Choose the best plan to save the mission:",
    cards: [
      {
        id: "wait",
        text: "Turn off the spacecraft and wait for the leak to stop on its own.",
        isCorrect: false,
        feedback:
          "Spacecraft leaks don't fix themselves! Waiting would cause all the helium to escape into space.",
      },
      {
        id: "refill",
        text: "Fill the tank with more helium from Earth.",
        isCorrect: false,
        feedback:
          "Surveyor 5 is already flying thousands of miles away in space! Nobody on Earth can reach it in time.",
      },
      {
        id: "reprogram",
        text:
          "Change the landing plan so the engine uses the remaining gas more carefully, and start the engine a different way.",
        isCorrect: true,
        feedback:
          "Brilliant thinking! This is close to what real NASA engineers did — reprogramming the engine to burn lower and conserve the remaining helium!",
      },
      {
        id: "ignore",
        text: "Ignore it and hope it gets better.",
        isCorrect: false,
        feedback:
          "Hoping won't solve the problem! Without enough helium push, the spacecraft would hit the Moon too hard.",
      },
    ],
  },

  stepC: {
    funFactTitle: "Real NASA History Fact!",
    funFact:
      "Real NASA engineers on Earth sent new instructions to Surveyor 5 and it landed safely on the Moon in September 1967!",
    successTitle: "Anomaly Resolved!",
    successSubtitle: "Surveyor 5 is on its way to the Moon!",
  },
};

export default TASK3_DATA;
