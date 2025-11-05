import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import { ArrowLeft, ArrowRight, CalendarCog, FileDown, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getDiaSemanaComData } from "@/Componentes/Utilitarios/getDiaSemanaComData";
import { formatarValor } from "@/Componentes/Utilitarios/formatarValor";
import BotaoSair from "@/Componentes/common/BotaoSair";
import BtnHome from "@/Componentes/BotaoHome/BtnHome";
import { Link } from "react-router-dom";
import Header from "@/Componentes/Header/Header";

export default function HistoricoSemanal() {
  const [mesSelecionado, setMesSelecionado] = useState("");

  const [semanaAtual, setSemanaAtual] = useState(0);
  const [agendamentos, setAgendamentos] = useState([]);
  const [totalMes, setTotalMes] = useState(0); // 👈 total do mês

  useEffect(() => {
    buscarHistorico(semanaAtual);
  }, []);

  const buscarHistorico = async (semanaOffset) => {
    const hoje = new Date();
    const diaDaSemana = hoje.getDay();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - diaDaSemana + 1 + semanaOffset * 7);

    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);

    const inicioISO = new Date(inicioSemana.setHours(0, 0, 0, 0)).toISOString();
    const fimISO = new Date(fimSemana.setHours(23, 59, 59, 999)).toISOString();

    const { data, error } = await supabase
      .from("agendamentos")
      .select(`*, cliente:cliente_id ( nome )`)
      .gte("data", inicioISO)
      .lte("data", fimISO);

    if (error) {
      console.error("Erro ao buscar histórico:", error);
    } else {
      setAgendamentos(data);
    }

    await obterTotalMes(semanaOffset); // 👈 chama total do mês
  };

  const obterTotalMes = async (semanaOffset) => {
    const hoje = new Date();
    const referencia = new Date();
    referencia.setDate(hoje.getDate() + semanaOffset * 7);
  
    const inicioMes = new Date(referencia.getFullYear(), referencia.getMonth(), 1);
    const fimMes = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 0);
  
    const { data, error } = await supabase
      .from("agendamentos")
      .select("valor")
      .gte("data", inicioMes.toISOString())
      .lte("data", fimMes.toISOString());
  
    if (error) {
      console.error("Erro ao buscar total do mês:", error);
      return;
    }
  
    const total = data.reduce((soma, ag) => soma + (ag.valor || 0), 0);
    setTotalMes(total);
  
    const nomeMes = inicioMes.toLocaleString("pt-BR", { month: "long", year: "numeric" });
    setMesSelecionado(nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)); // Capitaliza a primeira letra
  };
  

  const agendamentosAgrupados = agendamentos.reduce((acc, agendamento) => {
    const data = agendamento.data;
    if (!data) return acc;
    if (!acc[data]) acc[data] = [];
    acc[data].push(agendamento);
    return acc;
  }, {});

  const totalSemana = agendamentos.reduce((soma, ag) => soma + (ag.valor || 0), 0);

  const exportarParaPDF = () => {
    const doc = new jsPDF();
    doc.text("Histórico Semanal", 14, 10);

    Object.entries(agendamentosAgrupados).forEach(([dia, ags], index) => {
      const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 20;
      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text(getDiaSemanaComData(ags[0]?.data || dia), 14, startY - 5);

      autoTable(doc, {
        startY: 20 + index * 60,
        head: [["Data", "Cliente", "Serviço", "Valor", "Pagamento"]],
        body: ags.map((agendamento) => [
          new Date(agendamento.data).toLocaleDateString("pt-BR"),
          agendamento.cliente?.nome || "Cliente não encontrado",
          agendamento.servico,
          formatarValor(agendamento.valor),
          agendamento.pagamento,
        ]),
        theme: "grid",
        styles: { fontSize: 10 },
      });
    });

    doc.save("historico-semanal.pdf");
  };

  const exportarParaExcel = (agendamentosAgrupados) => {
    const wb = XLSX.utils.book_new();

    Object.entries(agendamentosAgrupados).forEach(([dia, ags]) => {
      const dados = ags.map((agendamento) => ({
        Data: new Date(agendamento.data).toLocaleDateString("pt-BR"),
        Cliente: agendamento.cliente?.nome || "Cliente não encontrado",
        Serviço: agendamento.servico,
        Valor: agendamento.valor,
        Pagamento: agendamento.pagamento,
      }));

      const ws = XLSX.utils.json_to_sheet(dados);
      XLSX.utils.book_append_sheet(wb, ws, dia.slice(0, 31));
    });

    XLSX.writeFile(wb, "historico-semanal.xlsx");
  };


const Botao =(
  <Link 
  to= "/agenda " 
  className=" border w-fit px-1 py-1 flex gap-2 rounded" > 
  <span className="hidden sm:inline "> Ir para Agenda</span>
  <CalendarCog size={24}/>

  </Link>
)
  

  return (
    <div className="container mx-auto p-4">
      <Header title="Histórico Semanal de Agendamentos" 
      actionButton={Botao}
      
      />
     
     
  {/* Coluna esquerda - PDF e Excel */}
    

  <div className="flex items-center justify-center gap-4 px-3 py-1.5 text-sm sm:text-base  hover:text-white transition mb-4">

  <button
      onClick={() => {
        const novaSemana = semanaAtual - 1;
        setSemanaAtual(novaSemana);
        buscarHistorico(novaSemana);
      }}
      className="w-60 flex items-center justify-center gap-1 px-3 py-1.5 text-sm sm:text-base  text-secondary border border-secondary rounded hover:border-primary transition hover:text-primary"
    >
      <ArrowLeft size={24} />
      Semana anterior
    </button>

    <button
      onClick={() => {
        const novaSemana = semanaAtual + 1;
        setSemanaAtual(novaSemana);
        buscarHistorico(novaSemana);
      }}
      className="w-60 flex items-center justify-center gap-1 px-3 py-1.5 text-sm sm:text-base border border-secondary  text-secondary rounded hover:text-primary hover:border-primary transition"
    >
      <ArrowRight size={24} />
      Mais recente
    </button>
 
  </div>
  {/* </div> */}



      {Object.entries(agendamentosAgrupados).length === 0 ? (
        <p className="text-gray-600">Nenhum agendamento encontrado para essa semana.</p>
      ) : (
        Object.entries(agendamentosAgrupados).map(([dia, ags]) => (
          <div key={dia} className="mb-6">
            <h2 className="text-lg font-semibold text-primary mb-2">- {getDiaSemanaComData(dia)} -</h2>
            <div className="overflow-x-auto border">
              <table className="w-full border border-gray-300 shadow rounded overflow-hidden">
                <thead className="border bg-azulzinho text-sm uppercase font-bold">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-primary">Data</th>
                    <th className="border border-gray-300 px-4 py-2 text-primary">Cliente</th>
                    <th className="border border-gray-300 px-4 py-2 text-primary">Serviço</th>
                    <th className="border border-gray-300 px-4 py-2 text-primary">Valor</th>
                    <th className="border border-gray-300 px-4 py-2 text-primary">Pagamento</th>
                  </tr>
                </thead>
                <tbody>
                  {ags.map((agendamento) => (
                    <tr className="border border-gray-300" key={agendamento.id}>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(agendamento.data).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="border px-4 py-2">
                        {agendamento.cliente?.nome || "Cliente não encontrado"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{agendamento.servico}</td>
                      <td className="border border-gray-300 px-4 py-2">{formatarValor(agendamento.valor)}</td>
                      <td className=" border border-gray-300 px-4 py-2">{agendamento.pagamento}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* Totalizador */}
      <div className="mt-8 bg-gray-100 p-4 rounded shadow border border-gray-300">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    {/* Resumo Financeiro */}
    <div>
      <h3 className="text-lg font-semibold text-primary">
        Resumo Financeiro - {mesSelecionado}
      </h3>
      <p className="mt-2">
        💰 Total da semana:{" "}
        <span className="font-bold text-green-700">
          {formatarValor(totalSemana)}
        </span>
      </p>
      <p className="mt-1">
        📅 Total do mês:{" "}
        <span className="font-bold text-blue-700">
          {formatarValor(totalMes)}
        </span>
      </p>
    </div>

    {/* Botões de Exportação */}
    <div className="flex gap-2 self-end sm:self-auto">
      <button
        onClick={exportarParaPDF}
        className="w-fit flex items-center justify-center gap-1 px-3 py-1.5 text-sm sm:text-base border border-primary text-primary rounded hover:bg-secondary hover:border-none hover:text-white transition"
      >
        <FileText size={24} />
        PDF
      </button>
      <button
        onClick={() => exportarParaExcel(agendamentosAgrupados)}
        className="w-fit flex items-center justify-center gap-1 px-3 py-1.5 text-sm sm:text-base border border-primary text-primary rounded hover:bg-secondary hover:border-none hover:text-white transition"
      >
        <FileDown size={24} />
        Excel
      </button>
    </div>
  </div>
</div>

      
    </div>
  );
}
