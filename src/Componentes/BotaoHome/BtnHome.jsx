import { useNavigate } from "react-router-dom";
import { House } from "lucide-react";
import { createLogger } from "../../lib/logger";
const logger = createLogger("BtnHome");

const BtnHome = () => {
  const navigate = useNavigate();

  const goHome = () => {
    logger.info("Indo para /home");
    navigate("/home");
  };

  return (
    <button
      type="button"
      onClick={goHome}
      className="bg-secondary px-2 text-primary py-1 pt-1 rounded hover:bg-alternativo shadow-lg hover:text-secondary"
      aria-label="Ir para Home"
    >
      <House size={24} />
    </button>
  );
};

export default BtnHome;





