const fs = require('fs');
const path = 'c:/Users/mitro/project/NQ/Novaquest/frontend/NovaMap/components/solar/spacecraftModelRegistry.js';
let content = fs.readFileSync(path, 'utf8');

const target = `export async function loadSpacecraft3DModel(slug) {
  const spec = getSpacecraftModelSpec(slug);

  if (!spec) {
    // Return a generic scientific probe placeholder if no entry found
    return PROCEDURAL_GENERATORS.newHorizons();
  }

  // 1. If spec has a GLB modelPath, load authentic model
  if (spec.isAuthenticModel && spec.modelPath) {
    try {
      let gltfScene = modelCache.get(spec.modelPath);
      if (!gltfScene) {
        const gltf = await new Promise((resolve, reject) => {
          loader.load(
            spec.modelPath,
            resolve,
            undefined,
            reject
          );
        });
        gltfScene = gltf.scene;
        modelCache.set(spec.modelPath, gltfScene);
      }

      // Deep clone mesh and materials
      const clone = gltfScene.clone(true);

      // Compute bounding box and normalize center
      const bbox = new THREE.Box3().setFromObject(clone);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      bbox.getCenter(center);
      bbox.getSize(size);

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const targetScale = (spec.scale || 1.0) * (2.2 / maxDim);

      clone.position.sub(center); // Center geometry

      const rootGroup = new THREE.Group();
      rootGroup.add(clone);
      rootGroup.scale.setScalar(targetScale);

      if (spec.rotation) {
        rootGroup.rotation.set(...spec.rotation);
      }

      rootGroup.userData = {
        slug,
        name: spec.name,
        isAuthenticModel: true,
        provenance: spec.provenance,
        isFallback: false
      };

      return rootGroup;
    } catch (err) {
      console.warn(\`Failed to load authentic GLB model for \${slug} (\${spec.modelPath}):\`, err);
      // Fall through to procedural fallback
    }
  }

  // 2. Procedural generator
  const genKey = spec.proceduralKey || 'newHorizons';
  const generator = PROCEDURAL_GENERATORS[genKey] || PROCEDURAL_GENERATORS.newHorizons;
  const procGroup = generator();
  const rootGroup = new THREE.Group();
  rootGroup.add(procGroup);
  rootGroup.scale.setScalar(spec.scale || 1.0);

  rootGroup.userData = {
    slug,
    name: spec.name,
    isAuthenticModel: false,
    provenance: spec.provenance,
    isFallback: true
  };

  return rootGroup;
}`;

const replacement = `export async function loadSpacecraft3DModel(slug, customModelPath = null) {
  const spec = getSpacecraftModelSpec(slug);
  const pathToLoad = customModelPath || spec?.modelPath;

  // 1. If we have a verified model path (from database or registry), load authentic model
  if (pathToLoad) {
    try {
      let gltfScene = modelCache.get(pathToLoad);
      if (!gltfScene) {
        const gltf = await new Promise((resolve, reject) => {
          loader.load(
            pathToLoad,
            resolve,
            undefined,
            reject
          );
        });
        gltfScene = gltf.scene;
        modelCache.set(pathToLoad, gltfScene);
      }

      // Deep clone mesh and materials
      const clone = gltfScene.clone(true);

      // Compute bounding box and normalize center
      const bbox = new THREE.Box3().setFromObject(clone);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      bbox.getCenter(center);
      bbox.getSize(size);

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const targetScale = ((spec && spec.scale) || 1.0) * (2.2 / maxDim);

      clone.position.sub(center); // Center geometry

      const rootGroup = new THREE.Group();
      rootGroup.add(clone);
      rootGroup.scale.setScalar(targetScale);

      if (spec && spec.rotation) {
        rootGroup.rotation.set(...spec.rotation);
      }

      rootGroup.userData = {
        slug,
        name: spec?.name || slug,
        isAuthenticModel: true,
        provenance: spec?.provenance || 'NASA Eyes on the Solar System (Official Public Domain - matthewgiarra/spacecraft-models)',
        isFallback: false
      };

      return rootGroup;
    } catch (err) {
      console.warn(\`Failed to load authentic 3D model for \${slug} (\${pathToLoad}):\`, err);
      // Fall through to procedural fallback
    }
  }

  // 2. Procedural generator placeholder
  const genKey = spec?.proceduralKey || 'newHorizons';
  const generator = PROCEDURAL_GENERATORS[genKey] || PROCEDURAL_GENERATORS.newHorizons;
  const procGroup = generator();
  const rootGroup = new THREE.Group();
  rootGroup.add(procGroup);
  rootGroup.scale.setScalar(spec?.scale || 1.0);

  rootGroup.userData = {
    slug,
    name: spec?.name || slug,
    isAuthenticModel: false,
    provenance: spec?.provenance || 'Mission-appropriate geometric placeholder (Official 3D model unavailable)',
    isFallback: true
  };

  return rootGroup;
}`;

// Normalize line breaks for replacement
content = content.replace(/\r\n/g, '\n');
const normalizedTarget = target.replace(/\r\n/g, '\n');
const normalizedReplacement = replacement.replace(/\r\n/g, '\n');

if (content.includes(normalizedTarget)) {
  content = content.replace(normalizedTarget, normalizedReplacement);
  // Restore CRLF
  content = content.replace(/\n/g, '\r\n');
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully updated loadSpacecraft3DModel in spacecraftModelRegistry.js');
} else {
  console.error('Target not found in spacecraftModelRegistry.js');
}

