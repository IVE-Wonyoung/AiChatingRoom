import { useEffect, useRef } from "react";
import styles from "./ChatPage.module.css";
import NewPrompt from "../../components/newPrompt/NewPrompt";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { ImageKitProvider, Image } from "@imagekit/react";
import Spinner from "../../components/Spinner/Spinner";
import Markdown from "react-markdown";

function ChatPage() {
  const { id } = useParams();

  const { isPending, error, data } = useQuery({
    queryKey: ["chat", id],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chats/${id}`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  return (
    <div className={styles.chatPage}>
      <div className={styles.wrapper}>
        <div className={styles.chat}>
          {isPending ? (
            <Spinner />
          ) : error ? (
            "There have some errors"
          ) : (
            data?.history?.map((message, i) => (
              <>
                {message.img && (
                  <ImageKitProvider
                    key={i}
                    urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                  >
                    <Image
                      src={message.img}
                      width={200}
                      transformation={[{ width: 200 }]}
                      loading="lazy"
                      key={i}
                    />
                  </ImageKitProvider>
                )}
                <div
                  className={`${styles.message} ${message.role === "user" ? styles.user : ""}`}
                  key={i}
                >
                  <Markdown>{message.parts[0].text}</Markdown>
                </div>
              </>
            ))
          )}
          {data && <NewPrompt data={data} />}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
