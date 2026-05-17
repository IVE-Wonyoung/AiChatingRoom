import styles from "./DashboardPage.module.css";
import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

function DashboarDPage() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (text) => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }).then((res) => res.json());
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      navigate(`/dashboard/chats/${id}`);
    },
  });

  async function handleSubmit(e) {
    e.preventDefault();
    const text = e.target.text.value;
    if (!text) return;
    mutation.mutate(text);
  }

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.texts}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="" />
          <h1>AiChatingRoom</h1>
        </div>
        <div className={styles.options}>
          <div className={styles.option}>
            <img src="/chat.png" alt="" />
            <span>Create a New Chat</span>
          </div>
          <div className={styles.option}>
            <img src="/image.png" alt="" />
            <span>Analyza Images</span>
          </div>
          <div className={styles.option}>
            <img src="/code.png" alt="" />
            <span>Help me with my Code</span>
          </div>
        </div>
      </div>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          <input type="text" name="text" placeholder="Ask me anyhthing...." />
          <button>
            <img src="/arrow.png" alt="" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default DashboarDPage;
