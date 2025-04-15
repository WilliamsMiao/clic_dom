/**
 * ELO评分系统
 * 用于计算玩家对战后的评分变化
 */

// 获取胜率期望值
const getExpectedScore = (ratingA, ratingB) => {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
};

// 计算新评分
const calculateNewRating = (rating, expectedScore, actualScore, kFactor = 32) => {
  return Math.round(rating + kFactor * (actualScore - expectedScore));
};

// 计算两名玩家对战后的评分变化
const calculateRatingChange = (winnerRating, loserRating, isDraw = false, kFactor = 32) => {
  const expectedWinner = getExpectedScore(winnerRating, loserRating);
  const expectedLoser = getExpectedScore(loserRating, winnerRating);
  
  let actualWinner, actualLoser;
  
  if (isDraw) {
    actualWinner = 0.5;
    actualLoser = 0.5;
  } else {
    actualWinner = 1.0;
    actualLoser = 0.0;
  }
  
  const newWinnerRating = calculateNewRating(winnerRating, expectedWinner, actualWinner, kFactor);
  const newLoserRating = calculateNewRating(loserRating, expectedLoser, actualLoser, kFactor);
  
  return {
    winnerNewRating: newWinnerRating,
    loserNewRating: newLoserRating,
    winnerChange: newWinnerRating - winnerRating,
    loserChange: newLoserRating - loserRating
  };
};

// 计算多人对战的评分变化
const calculateTeamRatingChange = (teamARatings, teamBRatings, teamAWon, isDraw = false, kFactor = 32) => {
  // 计算团队平均评分
  const teamAAvg = teamARatings.reduce((sum, rating) => sum + rating, 0) / teamARatings.length;
  const teamBAvg = teamBRatings.reduce((sum, rating) => sum + rating, 0) / teamBRatings.length;
  
  // 计算期望值
  const expectedA = getExpectedScore(teamAAvg, teamBAvg);
  const expectedB = getExpectedScore(teamBAvg, teamAAvg);
  
  // 确定实际得分
  let actualA, actualB;
  
  if (isDraw) {
    actualA = 0.5;
    actualB = 0.5;
  } else if (teamAWon) {
    actualA = 1.0;
    actualB = 0.0;
  } else {
    actualA = 0.0;
    actualB = 1.0;
  }
  
  // 计算每个玩家的新评分
  const teamANewRatings = teamARatings.map(rating => {
    // 根据玩家评分与团队平均评分的差异调整K因子
    const playerKFactor = adjustKFactor(rating, teamAAvg, kFactor);
    return calculateNewRating(rating, expectedA, actualA, playerKFactor);
  });
  
  const teamBNewRatings = teamBRatings.map(rating => {
    const playerKFactor = adjustKFactor(rating, teamBAvg, kFactor);
    return calculateNewRating(rating, expectedB, actualB, playerKFactor);
  });
  
  return {
    teamANewRatings,
    teamBNewRatings,
    teamAChanges: teamANewRatings.map((newRating, i) => newRating - teamARatings[i]),
    teamBChanges: teamBNewRatings.map((newRating, i) => newRating - teamBRatings[i])
  };
};

// 根据玩家评分与团队平均评分的差异调整K因子
const adjustKFactor = (playerRating, teamAvgRating, baseKFactor) => {
  // 如果玩家评分高于团队平均，降低K因子；如果低于平均，提高K因子
  const ratingDiff = playerRating - teamAvgRating;
  const adjustmentFactor = 1 - (ratingDiff / 1000); // 每1000分差异调整100%
  
  // 限制调整范围在0.5到1.5之间
  const limitedAdjustment = Math.max(0.5, Math.min(1.5, adjustmentFactor));
  
  return Math.round(baseKFactor * limitedAdjustment);
};

module.exports = {
  getExpectedScore,
  calculateNewRating,
  calculateRatingChange,
  calculateTeamRatingChange,
  adjustKFactor
}; 