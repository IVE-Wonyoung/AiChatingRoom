import { BrowserRouter, Routes, Route } from "react-router-dom";
import RootLayout from "./layouts/rootLayout/RootLayout";
import DashboardLayout from "./layouts/dashboardLayout/DashboardLayout";
import Homepage from "./pages/homepage/Homepage";
import DashboardPage from "./pages/dashboardPage/DashboardPage";
import ChatPage from "./pages/chatPage/ChatPage";
import SignInPage from "./pages/signInPage/SignInPage";
import SignUpPage from "./pages/signUpPage/SignUpPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Homepage />} />
            <Route path="sign-in/*" element={<SignInPage />}></Route>
            <Route path="sign-up/*" element={<SignUpPage />}></Route>
            <Route element={<DashboardLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="dashboard/chats/:id" element={<ChatPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
