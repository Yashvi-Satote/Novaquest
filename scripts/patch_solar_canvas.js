const fs = require('fs');
const path = 'c:/Users/mitro/project/NQ/Novaquest/frontend/NovaMap/components/solar/SolarCanvas.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = `    setLayerVisibility: (layer, visible) => {
      if (engineRef.current) {
        engineRef.current.setLayerVisibility(layer, visible);
      }
    }`;

const replacement = `    setLayerVisibility: (layer, visible) => {
      if (engineRef.current) {
        engineRef.current.setLayerVisibility(layer, visible);
      }
    },
    applyFilters: (filterState) => {
      if (engineRef.current) {
        engineRef.current.applyFilters(filterState);
      }
    },
    setMapObjects: (objects) => {
      if (engineRef.current) {
        engineRef.current.setMapObjects(objects);
      }
    }`;

content = content.replace(/\r\n/g, '\n');
const normalizedTarget = target.replace(/\r\n/g, '\n');
const normalizedReplacement = replacement.replace(/\r\n/g, '\n');

if (content.includes(normalizedTarget)) {
  content = content.replace(normalizedTarget, normalizedReplacement);
  content = content.replace(/\n/g, '\r\n');
  fs.writeFileSync(path, content, 'utf8');
  console.log('SolarCanvas.jsx patched successfully!');
} else {
  console.error('Target not found in SolarCanvas.jsx');
}

