import * as THREE from 'three';

/**
 * LeonardJaffeModel.js
 * 
 * Reusable 3D Character Model for Dr. Leonard Jaffe (1967 NASA Surveyor Project Scientist):
 * - 1960s short-sleeved white buttoned shirt with collar
 * - Thin dark 1960s tie and NASA Apollo ID badge clip
 * - Horn-rimmed retro glasses
 * - Charcoal tailored trousers and formal leather shoes
 * - Procedural animation rig: walking approach, talking/lip-sync, hand gestures
 */
export function createLeonardJaffeCharacter({ scale = 1.0 } = {}) {
  const root = new THREE.Group();
  root.name = 'NPC_LeonardJaffe';

  // --- Materials ---
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xfbd0b0, // warm peach Caucasian tone
    roughness: 0.65,
    metalness: 0.05
  });

  const shirtMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // crisp white 1960s shirt
    roughness: 0.8,
    metalness: 0.05
  });

  const tieMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a, // dark navy 60s narrow tie
    roughness: 0.5
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // slate-700 trousers
    roughness: 0.7
  });

  const shoesMat = new THREE.MeshStandardMaterial({
    color: 0x1e1b18, // polished dark brown leather
    roughness: 0.3,
    metalness: 0.4
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x451a03, // dark brown vintage side-part hair
    roughness: 0.9
  });

  const glassesFrameMat = new THREE.MeshStandardMaterial({
    color: 0x18181b, // retro black horn-rimmed frames
    roughness: 0.2,
    metalness: 0.3
  });

  const glassesLensMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.85,
    opacity: 0.3,
    transparent: true,
    roughness: 0.1,
    ior: 1.5
  });

  // --- Pelvis / Hip Center ---
  const hipGroup = new THREE.Group();
  hipGroup.position.y = 0.95 * scale;
  root.add(hipGroup);

  // Torso / White Shirt
  const torsoGeo = new THREE.CylinderGeometry(0.32 * scale, 0.28 * scale, 0.72 * scale, 16);
  const torsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
  torsoMesh.position.y = 0.36 * scale;
  hipGroup.add(torsoMesh);

  // Belt & Buckle
  const beltGeo = new THREE.CylinderGeometry(0.29 * scale, 0.29 * scale, 0.08 * scale, 16);
  const beltMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.4 });
  const belt = new THREE.Mesh(beltGeo, beltMat);
  belt.position.y = 0.02 * scale;
  hipGroup.add(belt);

  const buckleGeo = new THREE.BoxGeometry(0.08 * scale, 0.06 * scale, 0.04 * scale);
  const buckleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
  const buckle = new THREE.Mesh(buckleGeo, buckleMat);
  buckle.position.set(0, 0.02 * scale, 0.29 * scale);
  hipGroup.add(buckle);

  // Shirt Collar
  const collarGeo = new THREE.TorusGeometry(0.18 * scale, 0.04 * scale, 8, 16);
  const collar = new THREE.Mesh(collarGeo, shirtMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.72 * scale;
  hipGroup.add(collar);

  // 1960s Thin Dark Tie
  const tieKnotGeo = new THREE.ConeGeometry(0.05 * scale, 0.07 * scale, 4);
  const tieKnot = new THREE.Mesh(tieKnotGeo, tieMat);
  tieKnot.rotation.z = Math.PI;
  tieKnot.position.set(0, 0.68 * scale, 0.28 * scale);
  hipGroup.add(tieKnot);

  const tieGeo = new THREE.BoxGeometry(0.06 * scale, 0.42 * scale, 0.02 * scale);
  const tie = new THREE.Mesh(tieGeo, tieMat);
  tie.position.set(0, 0.44 * scale, 0.29 * scale);
  hipGroup.add(tie);

  // NASA Badge Clip on Pocket
  const badgeGeo = new THREE.BoxGeometry(0.09 * scale, 0.12 * scale, 0.02 * scale);
  const badgeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const badge = new THREE.Mesh(badgeGeo, badgeMat);
  badge.position.set(0.18 * scale, 0.52 * scale, 0.28 * scale);
  hipGroup.add(badge);

  // --- Neck & Head Group ---
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.78 * scale;
  hipGroup.add(headGroup);

  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.11 * scale, 0.13 * scale, 0.16 * scale, 12);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.y = 0.06 * scale;
  headGroup.add(neck);

  // Head
  const headGeo = new THREE.SphereGeometry(0.25 * scale, 24, 24);
  headGeo.scale(1.0, 1.15, 1.05);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.y = 0.3 * scale;
  headGroup.add(headMesh);

  // Vintage 1960s Hair (Neat combed side part)
  const hairGeo = new THREE.SphereGeometry(0.26 * scale, 20, 20);
  hairGeo.scale(1.05, 0.9, 1.1);
  const hairMesh = new THREE.Mesh(hairGeo, hairMat);
  hairMesh.position.set(0, 0.42 * scale, -0.02 * scale);
  headGroup.add(hairMesh);

  // Nose
  const noseGeo = new THREE.ConeGeometry(0.04 * scale, 0.1 * scale, 6);
  const nose = new THREE.Mesh(noseGeo, skinMat);
  nose.rotation.x = -Math.PI / 2.2;
  nose.position.set(0, 0.3 * scale, 0.26 * scale);
  headGroup.add(nose);

  // Mouth / Animated Jaw
  const mouthGeo = new THREE.BoxGeometry(0.08 * scale, 0.02 * scale, 0.02 * scale);
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0x991b1b });
  const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
  mouthMesh.position.set(0, 0.21 * scale, 0.25 * scale);
  headGroup.add(mouthMesh);

  // Horn-rimmed Glasses (Left & Right Rims + Bridge)
  const glassesRimGeo = new THREE.TorusGeometry(0.06 * scale, 0.012 * scale, 8, 16);
  const rimL = new THREE.Mesh(glassesRimGeo, glassesFrameMat);
  rimL.position.set(-0.09 * scale, 0.32 * scale, 0.25 * scale);
  const rimR = new THREE.Mesh(glassesRimGeo, glassesFrameMat);
  rimR.position.set(0.09 * scale, 0.32 * scale, 0.25 * scale);
  headGroup.add(rimL);
  headGroup.add(rimR);

  // Glasses Bridge
  const bridgeGeo = new THREE.BoxGeometry(0.06 * scale, 0.015 * scale, 0.015 * scale);
  const bridge = new THREE.Mesh(bridgeGeo, glassesFrameMat);
  bridge.position.set(0, 0.32 * scale, 0.26 * scale);
  headGroup.add(bridge);

  // Lens Glass
  const lensGeo = new THREE.CircleGeometry(0.055 * scale, 16);
  const lensL = new THREE.Mesh(lensGeo, glassesLensMat);
  lensL.position.set(-0.09 * scale, 0.32 * scale, 0.255 * scale);
  const lensR = new THREE.Mesh(lensGeo, glassesLensMat);
  lensR.position.set(0.09 * scale, 0.32 * scale, 0.255 * scale);
  headGroup.add(lensL);
  headGroup.add(lensR);

  // --- Arms (Left & Right Pivots) ---
  // Left Arm (Short sleeve white + skin forearm)
  const armLPivot = new THREE.Group();
  armLPivot.position.set(-0.36 * scale, 0.62 * scale, 0);
  hipGroup.add(armLPivot);

  // Short Sleeve
  const sleeveLGeo = new THREE.CylinderGeometry(0.11 * scale, 0.11 * scale, 0.2 * scale, 12);
  const sleeveL = new THREE.Mesh(sleeveLGeo, shirtMat);
  sleeveL.position.y = -0.1 * scale;
  armLPivot.add(sleeveL);

  // Forearm & Hand
  const forearmLGeo = new THREE.CapsuleGeometry(0.08 * scale, 0.32 * scale, 6, 12);
  const forearmL = new THREE.Mesh(forearmLGeo, skinMat);
  forearmL.position.y = -0.32 * scale;
  armLPivot.add(forearmL);

  // Right Arm (Animated gesturing arm)
  const armRPivot = new THREE.Group();
  armRPivot.position.set(0.36 * scale, 0.62 * scale, 0);
  hipGroup.add(armRPivot);

  const sleeveRGeo = new THREE.CylinderGeometry(0.11 * scale, 0.11 * scale, 0.2 * scale, 12);
  const sleeveR = new THREE.Mesh(sleeveRGeo, shirtMat);
  sleeveR.position.y = -0.1 * scale;
  armRPivot.add(sleeveR);

  const forearmRGeo = new THREE.CapsuleGeometry(0.08 * scale, 0.32 * scale, 6, 12);
  const forearmR = new THREE.Mesh(forearmRGeo, skinMat);
  forearmR.position.y = -0.32 * scale;
  armRPivot.add(forearmR);

  // --- Legs & Shoes (Left & Right Pivots) ---
  // Left Leg
  const legLPivot = new THREE.Group();
  legLPivot.position.set(-0.16 * scale, 0, 0);
  hipGroup.add(legLPivot);

  const legLGeo = new THREE.CapsuleGeometry(0.12 * scale, 0.65 * scale, 6, 12);
  const legL = new THREE.Mesh(legLGeo, pantsMat);
  legL.position.y = -0.42 * scale;
  legLPivot.add(legL);

  const shoeLGeo = new THREE.BoxGeometry(0.15 * scale, 0.12 * scale, 0.32 * scale);
  const shoeL = new THREE.Mesh(shoeLGeo, shoesMat);
  shoeL.position.set(0, -0.84 * scale, 0.05 * scale);
  legLPivot.add(shoeL);

  // Right Leg
  const legRPivot = new THREE.Group();
  legRPivot.position.set(0.16 * scale, 0, 0);
  hipGroup.add(legRPivot);

  const legRGeo = new THREE.CapsuleGeometry(0.12 * scale, 0.65 * scale, 6, 12);
  const legR = new THREE.Mesh(legRGeo, pantsMat);
  legR.position.y = -0.42 * scale;
  legRPivot.add(legR);

  const shoeRGeo = new THREE.BoxGeometry(0.15 * scale, 0.12 * scale, 0.32 * scale);
  const shoeR = new THREE.Mesh(shoeRGeo, shoesMat);
  shoeR.position.set(0, -0.84 * scale, 0.05 * scale);
  legRPivot.add(shoeR);

  // Internal Animation Controller
  const anim = {
    state: 'idle', // 'idle' | 'walk' | 'talk' | 'welcome'
    speed: 1.0,
    isSpeaking: false,
    update: (timeDelta, timeSeconds) => {
      // Mouth talking animation when speaking
      if (anim.isSpeaking || anim.state === 'talk') {
        const mouthOpen = 0.5 + Math.sin(timeSeconds * 16) * 0.5;
        mouthMesh.scale.y = 1.0 + mouthOpen * 3.5;
        // Head slight nod while talking
        headGroup.rotation.x = Math.sin(timeSeconds * 4) * 0.08;
        headGroup.rotation.y = Math.sin(timeSeconds * 2) * 0.06;

        // Explanatory hand gestures
        armRPivot.rotation.x = -0.8 + Math.sin(timeSeconds * 3) * 0.25;
        armRPivot.rotation.z = 0.4 + Math.sin(timeSeconds * 2.5) * 0.2;
        armLPivot.rotation.x = -0.4 + Math.sin(timeSeconds * 2) * 0.15;
        armLPivot.rotation.z = -0.3;
      } else if (anim.state === 'walk') {
        // Natural walking gait cycle
        const freq = 5.0 * anim.speed;
        const angleL = Math.sin(timeSeconds * freq) * 0.45;
        const angleR = -angleL;

        legLPivot.rotation.x = angleL;
        legRPivot.rotation.x = angleR;

        armLPivot.rotation.x = angleR * 0.5;
        armRPivot.rotation.x = angleL * 0.5;
        armLPivot.rotation.z = -0.1;
        armRPivot.rotation.z = 0.1;

        hipGroup.position.y = (0.95 + Math.abs(Math.sin(timeSeconds * freq)) * 0.04) * scale;
        headGroup.rotation.y = Math.sin(timeSeconds * freq * 0.5) * 0.05;
        mouthMesh.scale.y = 1.0;
      } else {
        // Idle gentle breathing
        hipGroup.position.y = (0.95 + Math.sin(timeSeconds * 2.0) * 0.015) * scale;
        legLPivot.rotation.x = 0;
        legRPivot.rotation.x = 0;
        armLPivot.rotation.x = 0.05;
        armRPivot.rotation.x = 0.05;
        armLPivot.rotation.z = -0.15;
        armRPivot.rotation.z = 0.15;
        headGroup.rotation.x = Math.sin(timeSeconds * 1.5) * 0.02;
        headGroup.rotation.y = Math.sin(timeSeconds * 0.8) * 0.05;
        mouthMesh.scale.y = 1.0;
      }
    }
  };

  root.userData.anim = anim;
  root.userData.parts = {
    headGroup,
    mouthMesh,
    armLPivot,
    armRPivot,
    legLPivot,
    legRPivot,
    hipGroup
  };

  return root;
}

