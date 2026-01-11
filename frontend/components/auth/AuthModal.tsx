import React, { useState } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import { User } from "../../types";

interface AuthModalProps {
  onLogin: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <>
      {mode === "login" ? (
        <LoginModal
          onLogin={onLogin}
          switchToRegister={() => setMode("register")}
        />
      ) : (
        <RegisterModal
          onRegister={onLogin}
          switchToLogin={() => setMode("login")}
        />
      )}
    </>
  );
};

export default AuthModal;
