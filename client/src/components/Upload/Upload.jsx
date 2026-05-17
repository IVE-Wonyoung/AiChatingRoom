import { ImageKitProvider, upload } from "@imagekit/react";

const urlEndpoint = import.meta.env.VITE_IMAGE_KIT_ENDPOINT;
const publicKey = import.meta.env.VITE_IMAGE_KIT_PUBLIC_KEY;

function Upload({ setImg }) {
  const authenticator = async () => {
    try {
      // Perform the request to the upload authentication endpoint.
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/upload`,
      );
      if (!response.ok) {
        // If the server response is not successful, extract the error text for debugging.
        const errorText = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`,
        );
      }

      // Parse and destructure the response JSON for upload credentials.
      const data = await response.json();
      return {
        signature: data.signature,
        expire: data.expire,
        token: data.token,
        publicKey: publicKey,
      };
    } catch (error) {
      // Log the original error for debugging before rethrowing a new error.
      console.error("Authentication error:", error);
      throw new Error("Authentication request failed");
    }
  };

  const onError = (err) => {
    console.log("Error", err);
  };

  const onSuccess = (res) => {
    console.log("success", res);
  };

  // 上传处理函数
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 读取文件为 base64，供 AI 视觉识别使用
    const base64Url = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    setImg((prev) => ({
      ...prev,
      isLoading: true,
      error: "",
      aiData: {
        type: "image_url",
        image_url: { url: base64Url },
      },
    }));

    try {
      const authParams = await authenticator();
      const result = await upload({
        ...authParams,
        file: file,
        fileName: "test-upload.png",
        useUniqueFileName: true,
        onError: onError,
        onSuccess: onSuccess,
      });
      console.log("Upload result:", result);
      setImg((prev) => ({ ...prev, isLoading: false, dbData: result }));
    } catch (error) {
      setImg((prev) => ({ ...prev, isLoading: true, error: error }));
    }
  };

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <label htmlFor="file">
        <img src="/attachment.png" alt="" />
        <input
          id="file"
          type="file"
          multiple={false}
          hidden
          onChange={handleUpload}
        />
      </label>
    </ImageKitProvider>
  );
}

export default Upload;
