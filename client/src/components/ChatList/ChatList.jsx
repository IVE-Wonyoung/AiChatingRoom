import { Link } from "react-router-dom";
import styles from "./ChatList.module.css";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Spinner from "../Spinner/Spinner";
function ChatList() {
  const { isPending, error, data } = useQuery({
    queryKey: ["userChats"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  return (
    <div className={styles.chatList}>
      <span className={styles.title}>DASHBOARD</span>
      <Link to="/dashboard">create a new Chats</Link>
      <Link to="/">Explore AiChatingRoom</Link>
      <Link to="/">Contact</Link>
      <hr />
      <span className={styles.title}>RECENT CHATS</span>
      <div className={styles.list}>
        {isPending ? (
          <Spinner />
        ) : error ? (
          "请开启你的AI之旅"
        ) : data?.length ? (
          data.map((chat) => (
            <Link key={chat._id} to={`/dashboard/chats/${chat._id}`}>
              {chat.title}
            </Link>
          ))
        ) : (
          "请开启你的AI之旅"
        )}
      </div>
      <hr />
      <div className={styles.upgrade}>
        <img src="/logo.png" alt="" />
        <div className={styles.texts}>
          <span>Upgrade to Learn Ai</span>
          <span>From deepseek-v4-pro</span>
        </div>
      </div>
    </div>
  );
}

export default ChatList;
