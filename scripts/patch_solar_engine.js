const fs = require('fs');
const path = 'c:/Users/mitro/project/NQ/Novaquest/frontend/NovaMap/components/solar/SolarEngine.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Set isPlaying to false by default
content = content.replace('this.isPlaying = true;', 'this.isPlaying = false;');

// 2. Add applyFilters and setMapObjects methods
const methodsToAdd = `
  setMapObjects(objects) {
    if (this.markers && typeof this.markers.setDatabaseObjects === 'function') {
      this.markers.setDatabaseObjects(objects);
    }
  }

  applyFilters(filterState) {
    if (!filterState) return;

    // 1. Planet visibility
    const showPlanets = !filterState.objectTypes || filterState.objectTypes.has('planet');
    this.planetBodies.forEach(body => {
      body.mesh.visible = showPlanets;
      if (body.orbitLine) body.orbitLine.visible = showPlanets && this.layerVisibility.orbits;
      if (body.labelSprite) body.labelSprite.visible = showPlanets && this.layerVisibility.labels;
    });

    // 2. Moon visibility
    const showMoons = !filterState.objectTypes || filterState.objectTypes.has('moon');
    this.planetBodies.forEach(body => {
      if (body.moons) {
        body.moons.forEach(m => {
          m.mesh.visible = showMoons;
        });
      }
    });

    // 3. Spacecraft markers filtering
    if (this.markers && typeof this.markers.applyFilters === 'function') {
      this.markers.applyFilters(filterState);
    }
  }
`;

if (!content.includes('applyFilters(filterState)')) {
  content = content.replace('setLayerVisibility(layer, visible) {', methodsToAdd + '\n  setLayerVisibility(layer, visible) {');
}

fs.writeFileSync(path, content, 'utf8');
console.log('SolarEngine.js updated successfully!');

