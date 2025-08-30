import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabaseClient";
import { Icon } from "@mui/material";
import { House } from "lucide-react";

const BtnHome = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Erro ao sair:", error);
      alert("Erro ao sair!");
    } else {
     
      navigate("/home"); // ✅ Redireciona corretamente
    }
  };

  return (
    <>
    
    <button onClick={handleLogout}
        className="bg-secondary px-2  py-1 pt-1 rounded hover:bg-alternativo shadow-lg ">
        {/* <Icon className=" pb-2 text-2xl text-white">home</Icon> */}
        <House size={24} />
        </button>

    </>
  );
};

export default BtnHome;




