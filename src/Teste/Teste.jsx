import React, { useEffect } from "react";
import { criarLinksDeAcoes } from "./utils/whatsapp";

export default function Teste() {
  useEffect(() => {
    const links = criarLinksDeAcoes({
      nome: "Maria",
      data: "05/12/2025",
      hora: "14:30",
    });

    console.log("Links gerados:", links);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Teste de Links</h1>
      <p>
        Confira o console (F12 → aba Console) para ver os links gerados do
        WhatsApp.
      </p>
    </div>
  );
}
