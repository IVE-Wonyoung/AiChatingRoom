import { Link } from "react-router-dom";
import styles from "./Homepage.module.css";
import { TypeAnimation } from "react-type-animation";
import { useState } from "react";

function Homepage() {
  const [typingStatus, setTypingStatus] = useState("human1");

  return (
    <div className={styles.homepage}>
      <img src="/orbital.png" alt="" className={styles.orbital} />
      <div className={styles.left}>
        <h1>AI Chating</h1>
        <h2>Begin to chating with AI！！</h2>
        <h3>
          AiChatingRoom is a transformative field of computer science focused on
          creating systems capable of performing tasks that normally require
          human intelligence.
        </h3>
        <Link to="/dashboard">Get Started</Link>
      </div>
      <div className={styles.right}>
        <div className={styles.imgContainer}>
          <div className={styles.bgContainer}>
            <div className={styles.bg}></div>
          </div>
          <img src="/bot.png" alt="" className={styles.bot} />
          <div className={styles.chat}>
            <img
              src={
                typingStatus === "human1"
                  ? "/human1.jpeg"
                  : typingStatus === "human2"
                    ? "/human2.jpeg"
                    : "/bot.png"
              }
              alt=""
            />
            <TypeAnimation
              sequence={[
                "Human: 我想去旅游，有哪里可以推荐吗",
                2000,
                () => {
                  setTypingStatus("bot");
                },
                "Bot: 欢迎来到福建....",
                2000,
                () => {
                  setTypingStatus("human2");
                },
                "Human2: 我想做一碗惠灵顿牛排要怎么做",
                2000,
                () => {
                  setTypingStatus("bot");
                },
                "Bot: 做法如下......",
                2000,
                () => {
                  setTypingStatus("human1");
                },
              ]}
              wrapper="span"
              repeat={Infinity}
              cursor={true}
              omitDeletionAnimation={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
