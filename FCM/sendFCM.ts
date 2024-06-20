import express from "express";
import { readFile } from "fs/promises";
import path from "path";
import admin from "firebase-admin"
import { Message } from "firebase-admin/messaging";

let deviceToken = `fYge-PtmTsa8ErbeK4pDRi:APA91bGudm8EgAHhM5LkeS4Qta6Q34MCKTt2wU13pF7rfv5cC9Q4B3J9d0uZpD6hOPqaLlotSczub85CjudtELxUngVQDorZipKqLTfyD-Zqp7w-Y-ltOVwTf9xdSulTCb35RIEU-kW4`;
const jsonFilePath = path.join(__dirname, "../firebaseKey.json");
const json = readFile(jsonFilePath, "utf-8");
json.then((v) => {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(v)),
  });
});
export const sendFCM = (title: string, body: string) => {
  const message: Message = {
    notification: { // 앱 켜져잇을 때, 다른 앱 사용중일때
      title: "BackGround-notifi Title",
      body: "Background-notifi Message",
    },

    token: deviceToken,
  };

  admin
    .messaging()
    .send(message)
    .then(function (response) {
      console.log("Successfully sent message: : ", response);
    })
    .catch(function (err) {
      console.log("Error Sending message!!! : ", err);
    });
};
