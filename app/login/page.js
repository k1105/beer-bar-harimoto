"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      setError(true);
    }
  };

  return (
    <>
      <style jsx global>{`
        body {
          font-family: "Helvetica Neue", Arial, sans-serif;
          background-color: #1a0f08;
          background-image: radial-gradient(#2c1a10 1px, transparent 1px);
          background-size: 20px 20px;
          color: #e5d3b3;
          height: 100dvh;
          overflow: hidden;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0;
        }
      `}</style>
      <div style={{
        width: "100%", maxWidth: "24rem", padding: "2rem",
        background: "#2c1a10", borderRadius: "1rem",
        border: "1px solid rgba(212,175,55,0.3)",
        textAlign: "center",
      }}>
        <h1 style={{
          fontFamily: '"Yuji Syuku", serif',
          fontSize: "1.875rem", color: "#d4af37",
          letterSpacing: "0.1em", marginBottom: "0.5rem",
        }}>
          Beer Bar 張本
        </h1>
        <p style={{
          fontFamily: '"Yuji Syuku", serif',
          fontSize: "0.75rem", color: "rgba(212,175,55,0.7)",
          marginBottom: "2rem",
        }}>
          〜 合言葉を入れてくれ 〜
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            style={{
              padding: "0.75rem 1rem", borderRadius: "0.5rem",
              border: error ? "1px solid #dc2626" : "1px solid rgba(212,175,55,0.3)",
              background: "#1a0f08", color: "#e5d3b3",
              fontSize: "1rem", outline: "none", textAlign: "center",
            }}
          />
          {error && (
            <p style={{ color: "#dc2626", fontSize: "0.875rem", margin: 0 }}>
              合言葉が違うぞ
            </p>
          )}
          <button type="submit" style={{
            fontFamily: '"Yuji Syuku", serif',
            background: "linear-gradient(to bottom, #e5ca75, #d4af37)",
            color: "#1a0f08", fontWeight: "bold",
            padding: "0.75rem 2rem", borderRadius: "9999px",
            border: "none", fontSize: "1.125rem", cursor: "pointer",
            boxShadow: "0 0 15px rgba(212,175,55,0.6)",
          }}>
            入店する
          </button>
        </form>
      </div>
    </>
  );
}
