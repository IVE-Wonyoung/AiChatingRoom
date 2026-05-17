import { useEffect, useRef, useState } from "react";
import styles from "./newPrompt.module.css";
import { ImageKitProvider, Image } from "@imagekit/react";
import Upload from "../Upload/Upload";
import Spinner from "../Spinner/Spinner";
import OpenAI from "openai";
import Markdown from "react-markdown";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { use } from "react";

const urlEndpoint = import.meta.env.VITE_IMAGE_KIT_ENDPOINT;
const deepseekKey = import.meta.env.VITE_DEEPSEEK_PUBLIC_KEY;
const deepseekURL = import.meta.env.VITE_DEEPSEEK_BASE_URL;
const qwenKey = import.meta.env.VITE_QIANWEN_PUBLIC_KEY;
const qwenURL = import.meta.env.VITE_QIANWEN_BASE_URL;

function NewPrompt({ data }) {
  const data_history = data.history?.map((his) => ({
    role: his.role,
    content: his.img
      ? [
          { type: "text", text: his.parts[0].text },
          { type: "image_url", image_url: { url: his.img } },
        ]
      : his.parts[0].text,
  }));
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const queryClient = useQueryClient();
  const hasRun = useRef(false);
  const candisplay = useRef(false);
  const [answerloading, setAnswerLoading] = useState(false);
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });
  const endRef = useRef(null);

  useEffect(
    function () {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    },
    [data, question, answer, img.dbData, img.aiData],
  );

  const mutation = useMutation({
    mutationFn: () => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.length ? question : undefined,
          answer,
          img: img.dbData?.filePath || undefined,
        }),
      }).then((res) => res.json());
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["chat", data._id] }).then(() => {
        setQuestion("");
        setAnswer("");
        setImg({ isLoading: false, error: "", dbData: {}, aiData: {} });
      });
    },
  });

  //两种llm
  const deepseek = new OpenAI({
    baseURL: deepseekURL,
    apiKey: deepseekKey,
    dangerouslyAllowBrowser: true,
  });

  const qwen = new OpenAI({
    baseURL: qwenURL,
    apiKey: qwenKey,
    dangerouslyAllowBrowser: true,
  });

  async function add(text, isInit) {
    try {
      if (!isInit) setQuestion(text);
      setAnswer("");

      const imageUrl = img.aiData?.image_url?.url;
      const hasImage = !!imageUrl;

      const client = hasImage ? qwen : deepseek;
      const model = hasImage ? "qwen3.6-plus" : "deepseek-v4-pro";
      const currentMessage = {
        role: "user",
        content: hasImage
          ? [
              { type: "text", text },
              { type: "image_url", image_url: { url: imageUrl } },
            ]
          : text,
      };
      const messages =
        data.history.length === 1
          ? [currentMessage]
          : [...data_history, currentMessage];
      console.log(messages);
      setAnswerLoading(true);
      const completion = await client.chat.completions.create({
        messages,
        model,
        ...(hasImage
          ? { max_tokens: 2048 }
          : { thinking: { type: "enabled" }, reasoning_effort: "high" }),
        stream: true,
      });

      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) setAnswerLoading(false);
        setAnswer((prev) => prev + content);
      }
      mutation.mutate();
    } catch (err) {
      console.log(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const text = e.target.text.value;
    if (!text) return;
    e.target.text.value = "";
    add(text, false);
  }

  useEffect(function () {
    if (!hasRun.current && data?._id) {
      if (data?.history?.length === 1) {
        add(data.history[0].parts[0].text, true);
        hasRun.current = true;
      }
    }
  }, []);

  return (
    <>
      <ImageKitProvider urlEndpoint={urlEndpoint}>
        {img.isLoading && <Spinner />}
        {img.dbData?.filePath && (
          <Image
            src={img.dbData.filePath}
            width={200}
            transformation={[{ width: 200 }]}
          />
        )}
      </ImageKitProvider>

      {question && (
        <div className={`${styles.message} ${styles.user}`}>{question}</div>
      )}
      {answerloading ? (
        <Spinner />
      ) : (
        answer && (
          <div className={styles.message}>
            <Markdown>{answer}</Markdown>
          </div>
        )
      )}
      <div className={styles.endChat} ref={endRef} />
      <form className={styles.newForm} onSubmit={handleSubmit}>
        <Upload setImg={setImg} />
        <input type="text" placeholder="Ask anything for Ai...." name="text" />
        <button>
          <img src="/arrow.png" alt="" />
        </button>
      </form>
    </>
  );
}

export default NewPrompt;
