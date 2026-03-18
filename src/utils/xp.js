function xpNeededForLevel(level) {
  // curva simple (puedes ajustarla después)
  // L2:100, L3:250, L4:450, etc.
  return 50 + (level - 1) * 100;
}

function applyXp({ level, xp }, gainedXp) {
  let newLevel = level ?? 1;
  let newXp = (xp ?? 0) + (gainedXp ?? 0);

  // sube niveles mientras alcance el umbral
  while (newXp >= xpNeededForLevel(newLevel + 1)) {
    newLevel += 1;
  }

  return { level: newLevel, xp: newXp };
}

module.exports = { xpNeededForLevel, applyXp };