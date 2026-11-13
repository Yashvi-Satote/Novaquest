import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

/**
 * Shared GLTF asset loader for the NovaQuest 3D scenes.
 *
 * Goals:
 *  - Exactly one GLTFLoader / DRACOLoader / KTX2Loader instance for the app.
 *  - Never decode the same GLB twice while a scene that needs it is mounted.
 *  - Release GPU memory (geometry, materials, textures) when the last consumer
 *    unmounts, with a short grace period so React StrictMode's double mount
 *    does not throw away work it is about to reuse.
 *
 * KTX2/Basis textures live in /basis (copied from three's examples libs) and
 * Draco decoders live in /draco. Both are served from `public/`.
 */

const STRICT_MODE_GRACE_MS = 300;

let sharedLoader = null;
let dracoLoader = null;
let ktx2Loader = null;
let ktx2SupportDetected = false;

const cache = new Map();

function createLoader() {
  dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');

  ktx2Loader = new KTX2Loader();
  ktx2Loader.setTranscoderPath('/basis/');

  sharedLoader = new GLTFLoader();
  sharedLoader.setDRACOLoader(dracoLoader);
  sharedLoader.setKTX2Loader(ktx2Loader);
  sharedLoader.setMeshoptDecoder(MeshoptDecoder);

  return sharedLoader;
}

/**
 * Returns the single shared GLTFLoader. `renderer` is required the first time
 * so KTX2Loader can pick the best GPU-compressed format for the device.
 */
export function getSharedGltfLoader(renderer) {
  if (!sharedLoader) createLoader();

  if (renderer && !ktx2SupportDetected) {
    ktx2Loader.detectSupport(renderer);
    ktx2SupportDetected = true;
  }

  return sharedLoader;
}

function isUnderSharedAsset(object) {
  let current = object;
  while (current) {
    if (current.userData && current.userData.__sharedModelAsset) return true;
    current = current.parent;
  }
  return false;
}

function collectMaterialTextures(material, textures) {
  if (!material) return;

  Object.values(material).forEach((value) => {
    if (value && value.isTexture) textures.add(value);
  });

  if (material.uniforms) {
    Object.values(material.uniforms).forEach((uniform) => {
      const value = uniform && uniform.value;
      if (value && value.isTexture) textures.add(value);
      if (Array.isArray(value)) {
        value.forEach((entry) => {
          if (entry && entry.isTexture) textures.add(entry);
        });
      }
    });
  }
}

/**
 * Disposes every geometry/material/texture in a subtree. Pass
 * `{ skipSharedAssets: true }` when disposing a scene that may still contain
 * a cached model owned by gltfModelLoader; that model is released separately.
 */
export function disposeObject3D(root, { skipSharedAssets = false } = {}) {
  if (!root) return;

  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();

  root.traverse((object) => {
    if (skipSharedAssets && isUnderSharedAsset(object)) return;

    if (object.geometry) geometries.add(object.geometry);

    const objectMaterials = Array.isArray(object.material)
      ? object.material
      : object.material
        ? [object.material]
        : [];
    objectMaterials.forEach((material) => materials.add(material));

    if (object.isLight && typeof object.dispose === 'function') {
      object.dispose();
    }
  });

  materials.forEach((material) => collectMaterialTextures(material, textures));

  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
}

function disposeLoadedGltf(gltf) {
  if (!gltf || !gltf.scene) return;

  // Remove the marker so disposal is not skipped.
  gltf.scene.traverse((object) => {
    if (object.userData) delete object.userData.__sharedModelAsset;
  });

  disposeObject3D(gltf.scene);
}

function scheduleDisposal(url, entry) {
  if (entry.disposeTimer) clearTimeout(entry.disposeTimer);

  // Wait until after the current commit. React StrictMode unmounts and
  // remounts in the same tick; the remount calls acquire() and cancels this.
  entry.disposeTimer = setTimeout(() => {
    entry.disposeTimer = null;
    if (entry.refs > 0) return;

    if (cache.get(url) === entry) cache.delete(url);
    disposeLoadedGltf(entry.gltf);
    entry.gltf = null;
    entry.promise = null;
  }, STRICT_MODE_GRACE_MS);
}

/**
 * Loads (or reuses) a GLB and returns a reference-counted handle.
 *
 * Always call `handle.release()` from the consuming effect's cleanup.
 * The resolved scene is shared between sequential consumers, so do not mutate
 * its geometry; transforms (position/scale/rotation) are fine.
 */
export function acquireGltfModel(url, renderer) {
  const loader = getSharedGltfLoader(renderer);

  let entry = cache.get(url);
  if (!entry) {
    entry = {
      refs: 0,
      gltf: null,
      promise: null,
      disposeTimer: null,
    };
    cache.set(url, entry);

    entry.promise = loader
      .loadAsync(url)
      .then((gltf) => {
        entry.gltf = gltf;
        if (gltf.scene && gltf.scene.userData) {
          gltf.scene.userData.__sharedModelAsset = true;
        }
        if (entry.refs <= 0) scheduleDisposal(url, entry);
        return gltf;
      })
      .catch((error) => {
        if (cache.get(url) === entry) cache.delete(url);
        entry.promise = null;
        throw error;
      });
  }

  entry.refs += 1;
  if (entry.disposeTimer) {
    clearTimeout(entry.disposeTimer);
    entry.disposeTimer = null;
  }

  let released = false;

  return {
    promise: entry.promise,
    get gltf() {
      return entry.gltf;
    },
    release() {
      if (released) return;
      released = true;
      entry.refs = Math.max(0, entry.refs - 1);
      if (entry.refs === 0) scheduleDisposal(url, entry);
    },
  };
}

/**
 * Frees the shared decoders and any cached models. Safe to call on app
 * teardown; do not call while scenes using the loader are still mounted.
 */
export function disposeGltfModelLoader() {
  cache.forEach((entry) => {
    if (entry.disposeTimer) clearTimeout(entry.disposeTimer);
    disposeLoadedGltf(entry.gltf);
  });
  cache.clear();

  if (dracoLoader) dracoLoader.dispose();
  if (ktx2Loader) ktx2Loader.dispose();

  dracoLoader = null;
  ktx2Loader = null;
  sharedLoader = null;
  ktx2SupportDetected = false;
}
