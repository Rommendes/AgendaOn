export default function formatarTelefone(telefone) {
  // Remove todos os caracteres não numéricos (apenas números)
  const telefoneFormatado = telefone.replace(/\D/g, '');

  // Verifique se o número tem 11 dígitos (como um celular brasileiro)
  if (telefoneFormatado.length === 11) {
    return `whatsapp:+55${telefoneFormatado}`;
  } else {
    // Caso não tenha o formato esperado, retorne um erro ou mensagem
    return null;  // Ou você pode lançar um erro se o número estiver inválido
  }
}
