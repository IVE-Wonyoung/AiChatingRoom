import express from "express";
import cors from "cors";
import ImageKit from "@imagekit/nodejs";
import mongoose from "mongoose";
import Chat from "./models/chat.js";
import UserChats from "./models/userChats.js";
import path from "path";
import url, { fileURLToPath } from "url";
import { clerkMiddleware, getAuth, requireAuth } from "@clerk/express";

const port = process.env.PORT || 3000;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(clerkMiddleware());

app.use(express.json());

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connect to MongoDB");
  } catch (err) {
    console.log(err);
  }
};

const client = new ImageKit({
  urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
});

app.get("/api/upload", (req, res) => {
  const result = client.helper.getAuthenticationParameters();
  res.send(result);
});

app.post("/api/chats", requireAuth(), async (req, res) => {
  const { text } = req.body;
  const { userId } = getAuth(req);
  try {
    const newChat = new Chat({
      userId: userId,
      history: [{ role: "user", parts: [{ text }] }],
    });

    const savedChat = await newChat.save();

    const userChats = await UserChats.find({ userId: userId });
    //没有这个用户的聊天记录的话
    if (!userChats.length) {
      const newUserChats = new UserChats({
        userId: userId,
        chats: [
          {
            _id: savedChat._id,
            title: text.substring(0, 25),
          },
        ],
      });
      await newUserChats.save();
    } else {
      //有这个用户的聊天记录的话
      await UserChats.updateOne(
        { userId: userId },
        {
          $push: {
            chats: {
              _id: savedChat._id,
              title: text.substring(0, 25),
            },
          },
        },
      );
    }
    res.status(201).send(newChat._id);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating chat");
  }
});

app.get("/api/userchats", async (req, res) => {
  const { userId } = getAuth(req);
  try {
    const userChats = await UserChats.find({ userId: userId });

    res.status(200).send(!userChats.length ? null : userChats[0].chats);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching userchats");
  }
});

app.get("/api/chats/:id", async (req, res) => {
  const { userId } = getAuth(req);
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: userId });

    res.status(200).send(chat);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching chat");
  }
});

app.put("/api/chats/:id", async (req, res) => {
  const { userId } = getAuth(req);
  const { question, answer, img } = req.body;
  const newItem = [
    ...(question
      ? [
          {
            role: "user",
            parts: [{ text: question }],
            ...(img && { img }),
          },
        ]
      : []),
    ...(answer
      ? [
          {
            role: "assistant",
            parts: [{ text: answer }],
          },
        ]
      : []),
  ];
  try {
    const updateChat = await Chat.updateOne(
      { _id: req.params.id, userId: userId },
      {
        $push: {
          history: {
            $each: newItem,
          },
        },
      },
    );
    res.status(200).json(updateChat);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error adding conversation");
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(401).send("Unauthenticated!");
});

app.use(express.static(path.join(__dirname, "../client", "index.html")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../client", "index.html"));
});

app.listen(port, () => {
  connect();
  console.log("后端服务开启：3000");
});
