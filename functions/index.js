/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Cloud Functions 스케줄러를 사용하여 매일 자정에 실행될 함수 정의
exports.clearDiceGameData = functions.pubsub
  .schedule("every day 00:00")
  .timeZone("Asia/Seoul") // 본인의 지역에 맞게 타임존 설정
  .onRun(async (context) => {
    try {
      // 데이터베이스 레퍼런스 생성
      const database = admin.database();
      const diceGameRef = database.ref("minigame/dicegamerank");

      // 주사위 게임 데이터 모두 삭제
      await diceGameRef.remove();
      console.log("Cleared dice game data successfully.");
    } catch (error) {
      console.error("Error clearing dice game data:", error);
    }

    return null;
  });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
