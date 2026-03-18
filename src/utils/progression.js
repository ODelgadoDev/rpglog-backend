function xpNeededForGlobalLevel(level) {
  return Math.round(1000 * level * (1 + 0.15 * (level - 1)));
}

function xpNeededForStatLevel(level) {
  return Math.round(200 * level * (1 + 0.1 * (level - 1)));
}

function calculateGlobalProgress(xpTotal) {
  let level = 1;
  let accumulatedBeforeLevel = 0;
  let nextThreshold = xpNeededForGlobalLevel(level);

  while (xpTotal >= accumulatedBeforeLevel + nextThreshold) {
    accumulatedBeforeLevel += nextThreshold;
    level += 1;
    nextThreshold = xpNeededForGlobalLevel(level);
  }

  return {
    level,
    xpCurrentLevel: xpTotal - accumulatedBeforeLevel,
    xpNextLevel: nextThreshold
  };
}

function calculateStatProgress(xpTotal) {
  let level = 1;
  let accumulatedBeforeLevel = 0;
  let nextThreshold = xpNeededForStatLevel(level);

  while (xpTotal >= accumulatedBeforeLevel + nextThreshold) {
    accumulatedBeforeLevel += nextThreshold;
    level += 1;
    nextThreshold = xpNeededForStatLevel(level);
  }

  return {
    level,
    xpMax: nextThreshold
  };
}

module.exports = {
  xpNeededForGlobalLevel,
  xpNeededForStatLevel,
  calculateGlobalProgress,
  calculateStatProgress
};