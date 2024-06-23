import admin from "firebase-admin";
import { Message, getMessaging } from "firebase-admin/messaging";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const jsonFilePath = path.join(fileURLToPath(new URL(".", import.meta.url)), "../../firebaseKey.json");
const json = readFile(jsonFilePath, "utf-8");
json.then((v) => {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(v)),
  });
});

export const subscribeTopic = (token: string | string[], topic: string) => {
  getMessaging().subscribeToTopic(token, topic)
    .then((response) => {
      response.errors.forEach((err) => {
        console.log({ err })
      });
    })
    .catch((error) => {
      console.log('Error subscribing to topic:', error);
    })
    .finally(() => {
      console.log('Successfully subscribed to topic:', topic);
    });
}

export const unsubscribeTopic = (token: string | string[], topic: string) => {
  getMessaging().unsubscribeFromTopic(token, topic)
    .then((response) => {
      response.errors.forEach((err) => {
        console.log({ err })
      });
    })
    .catch((error) => {
      console.log('Error unsubscribing from topic:', error);
    })
    .finally(() => {
      console.log('Successfully subscribed from topic:', topic);
    });
}

export const sendFCM = (notification: { title: string, body: string }, topic: string, link: string) => {
  const message: Message = {
    notification,
    data: {
      topic
    },
    topic,
    webpush: {
      fcmOptions: {
        link
      }
    }
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
};
