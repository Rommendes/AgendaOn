import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabaseClient";
import { Icon } from "@mui/material";

import { createLogger } from "../../lib/logger";
const logger = createLogger ("BotaoSai")

const BotaoSair = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error("Erro ao sair:", error);
      alert("Erro ao sair!");
    } else {
     
      navigate("/"); // ✅ Redireciona corretamente
    }
  };

  return (
    <>
    
    <button onClick={handleLogout}
        className="bg-secondary px-1.5 pt-1 rounded hover:bg-alternativo shadow-lg w-fit text-primary">
        <Icon className=" pb-2 text-2xl text-primary  hover:text-secondary ">exit_to_app</Icon>
        </button>

    </>
  );
};

export default BotaoSair;