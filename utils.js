export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

export function getRandomFloat(min, max){
  return Math.random() * (max - min+1) + min;
}

export function computeOBJDimensions(objText) {
  const lines = objText.split('\n');
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  for (const line of lines) {
    if (line.startsWith('v ')) { // This line defines a vertex.
      const parts = line.trim().split(/\s+/);
      // parts[0] is "v", parts[1] is x, parts[2] is y, parts[3] is z
      const x = parseFloat(parts[1]);
      const y = parseFloat(parts[2]);
      const z = parseFloat(parts[3]);

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (z < minZ) minZ = z;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (z > maxZ) maxZ = z;
    }
  }

  return {
    width: maxX - minX,
    height: maxY - minY,
    depth: maxZ - minZ,
    min: [minX, minY, minZ],
    max: [maxX, maxY, maxZ]
  };
}
