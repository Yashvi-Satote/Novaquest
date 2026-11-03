const fs = require('fs');
const path = 'c:/Users/mitro/project/NQ/Novaquest/frontend/NovaMap/components/solar/SpacecraftMarkerManager.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Upgrade createLabelSprite to show Craft Name + Mission Name + Status
const oldLabelSprite = `  createLabelSprite(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Translucent rounded capsule backing
    ctx.fillStyle = 'rgba(8, 14, 28, 0.78)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(16, 10, 352, 44, 10);
    ctx.fill();
    ctx.stroke();

    // Spacecraft name typography
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 192, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    this.disposables.push(texture);

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    this.disposables.push(spriteMat);

    const labelSprite = new THREE.Sprite(spriteMat);
    labelSprite.scale.set(3.2, 0.55, 1);
    return labelSprite;
  }`;

const newLabelSprite = `  createLabelSprite(name, missionName = '', status = '') {
    const canvas = document.createElement('canvas');
    canvas.width = 420;
    canvas.height = 72;
    const ctx = canvas.getContext('2d');

    // Translucent rounded capsule backing
    ctx.fillStyle = 'rgba(6, 10, 24, 0.88)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(10, 8, 400, 56, 12);
    ctx.fill();
    ctx.stroke();

    // Line 1: Spacecraft name (bold white)
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(name, 210, 15);

    // Line 2: Mission name • Status (cyan & status color)
    ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#38bdf8';
    const subText = missionName ? \`\${missionName} • \${status || 'Active'}\` : (status || 'Active Telemetry');
    ctx.fillText(subText, 210, 38);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    this.disposables.push(texture);

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    this.disposables.push(spriteMat);

    const labelSprite = new THREE.Sprite(spriteMat);
    labelSprite.scale.set(3.6, 0.62, 1);
    return labelSprite;
  }`;

content = content.replace(oldLabelSprite.replace(/\r\n/g, '\n'), newLabelSprite.replace(/\r\n/g, '\n'));

// 2. Add applyFilters method
const applyFiltersMethod = `
  /**
   * Dynamically filters displayed 3D markers based on NovaBase active filters
   */
  applyFilters(filterState) {
    if (!filterState) return;
    const { objectTypes, statuses, search, selectedMissionSlug } = filterState;

    this.markers.forEach((markerData, slug) => {
      const craft = markerData.craft || {};
      const rawType = (craft.object_type || craft.spacecraft_type || craft.type || 'spacecraft').toLowerCase();
      const opStatus = (craft.operational_status || craft.status || 'Active').toLowerCase();

      // Normalize to 1 of the 8 types: spacecraft, satellite, space_telescope, lander, rover, probe
      let normType = 'spacecraft';
      if (rawType.includes('telescope') || rawType.includes('observatory')) normType = 'space_telescope';
      else if (rawType.includes('rover')) normType = 'rover';
      else if (rawType.includes('lander')) normType = 'lander';
      else if (rawType.includes('satellite')) normType = 'satellite';
      else if (rawType.includes('probe') || rawType.includes('flyby')) normType = 'probe';

      // 1. Type filter
      let typeMatch = true;
      if (objectTypes && objectTypes.size > 0) {
        typeMatch = objectTypes.has(normType) || objectTypes.has('spacecraft');
      }

      // 2. Status filter
      let statusMatch = true;
      if (statuses && statuses.size > 0) {
        statusMatch = Array.from(statuses).some(s => opStatus.includes(s.toLowerCase()));
      }

      // 3. Search query
      let searchMatch = true;
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        const craftName = (craft.name || '').toLowerCase();
        const missionName = (craft.mission || craft.mission_name || '').toLowerCase();
        const agency = (craft.agency || '').toLowerCase();
        searchMatch = craftName.includes(q) || missionName.includes(q) || agency.includes(q);
      }

      // 4. Mission highlight
      if (selectedMissionSlug && markerData.haloSprite) {
        const mSlug = (craft.mission_slug || craft.missionSlug || '').toLowerCase();
        if (mSlug && mSlug === selectedMissionSlug.toLowerCase()) {
          markerData.haloSprite.material.opacity = 0.95;
          markerData.labelSprite.visible = true;
        }
      }

      const isVisible = typeMatch && statusMatch && searchMatch;
      markerData.group.visible = isVisible && this.visibleMarkers;
      if (markerData.orbitLine) {
        markerData.orbitLine.visible = isVisible && this.visibleTrajectories;
      }
    });

    this.orbiters.forEach((orbiter, slug) => {
      const markerData = this.markers.get(slug);
      if (markerData) {
        orbiter.group.visible = markerData.group.visible;
      }
    });

    this.heliocentricProbes.forEach((probe, slug) => {
      const markerData = this.markers.get(slug);
      if (markerData) {
        probe.group.visible = markerData.group.visible;
      }
    });
  }
`;

if (!content.includes('applyFilters(filterState)')) {
  content = content.replace('setMarkersVisible(visible) {', applyFiltersMethod + '\n  setMarkersVisible(visible) {');
}

fs.writeFileSync(path, content, 'utf8');
console.log('SpacecraftMarkerManager.js successfully patched!');

