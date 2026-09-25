import React from "react";

/**
 * Politica de Privacidade PUBLICA (Bloco 8).
 * Endereco: /privacidade — exigido pela Google Play e pela LGPD.
 * Texto aprovado a partir das informacoes preenchidas pelo Pastor Valdenir.
 * Para alterar: editar este arquivo e atualizar a data no topo.
 */
export default function Privacidade() {
  return (
    <div className="min-h-screen bg-[#120B22] text-slate-300 px-5 py-10">
      <div className="mx-auto max-w-3xl space-y-4 leading-relaxed">
        <h1 className="text-2xl font-bold text-white">Política de Privacidade — Aplicativo Igreja Noah</h1>
        <p><strong className="text-white">Última atualização:</strong> 24 de setembro de 2026</p>
        <p>Esta Política explica quais dados pessoais o aplicativo <strong className="text-white">Igreja Noah</strong> e o painel administrativo da igreja coletam, por que coletam, com quem compartilham e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD).</p>
        <h2 className="text-lg font-semibold text-white pt-4">1. Quem é o responsável pelos seus dados</h2>
        <p><strong className="text-white">Controlador:</strong> Noah Curitiba</p>
        <p><strong className="text-white">CNPJ:</strong> 48.034.855/0001-60</p>
        <p><strong className="text-white">Endereço:</strong> Rua Marcos Bertoldi, 345, Campo de Santana, Curitiba/PR, CEP 81490-530</p>
        <p><strong className="text-white">Encarregado pelo tratamento de dados (LGPD, art. 41):</strong> Pastor Valdenir Lopes</p>
        <p><strong className="text-white">Contato para privacidade e exclusão de conta:</strong> <a href="mailto:valdenilopes0@gmail.com" className="text-violet-300 underline">valdenilopes0@gmail.com</a></p>
        <h2 className="text-lg font-semibold text-white pt-4">2. Quais dados coletamos</h2>
        <p><strong className="text-white">Cadastro e conta:</strong> nome, e-mail, telefone, data de nascimento, foto de perfil (opcional), número de membro, documento (quando informado), situação de membro, data de ingresso e data de batismo (quando informada).</p>
        <p><strong className="text-white">Endereço e localização no mapa:</strong> endereço informado no cadastro de membros e de células, usado para exibir pontos no mapa da igreja. Esse mapa, inclusive a vista de satélite, é visível <strong className="text-white">somente para a liderança autorizada</strong> no painel administrativo.</p>
        <p><strong className="text-white">Vida na igreja:</strong> participação em células e ministérios, presenças em cultos e cursos, inscrições em cursos e validação da carteirinha de membro.</p>
        <p><strong className="text-white">Pedidos de oração:</strong> o texto e a categoria do pedido. Você pode enviar o pedido como <strong className="text-white">anônimo</strong>. O pedido e a resposta são vistos pela liderança da igreja.</p>
        <p><strong className="text-white">Chat com a igreja:</strong> as mensagens trocadas entre você e a equipe da igreja.</p>
        <p><strong className="text-white">Doações e dízimos:</strong> registros das contribuições feitas por PIX para a igreja.</p>
        <p><strong className="text-white">Notificações:</strong> um identificador do aparelho (token de notificação), o tipo de aparelho e o nome do aparelho, usados para enviar avisos ao seu celular.</p>
        <p><strong className="text-white">Botão de emergência (SOS):</strong> quando você <strong className="text-white">segura o botão SOS por 3 segundos</strong>, o aplicativo coleta a sua <strong className="text-white">localização naquele momento</strong> (se você permitir) e envia um alerta ao pastor. A localização <strong className="text-white">não é acompanhada</strong> fora desse momento.</p>
        <p><strong className="text-white">Visitantes:</strong> quem registra a visita pelo QR Code da recepção informa nome, como conheceu a igreja e, <strong className="text-white">somente se autorizar o contato</strong>, o telefone.</p>
        <h2 className="text-lg font-semibold text-white pt-4">3. Dados sensíveis</h2>
        <p>Por se tratar de uma igreja, a sua ligação com a comunidade indica <strong className="text-white">convicção religiosa</strong>, que a LGPD considera <strong className="text-white">dado pessoal sensível</strong> (art. 5º, II). Pedidos de oração também podem conter informações sensíveis, como de saúde. Esses dados são tratados com o seu <strong className="text-white">consentimento</strong>, dado ao criar a conta e ao usar cada recurso, e acessados apenas pela liderança autorizada.</p>
        <h2 className="text-lg font-semibold text-white pt-4">4. Para que usamos os dados</h2>
        <ul className="list-disc pl-6 space-y-1"><li>Criar e manter a sua conta e a sua carteirinha de membro.</li><li>Organizar cultos, eventos, células, ministérios, cursos e presenças.</li><li>Receber e responder pedidos de oração e mensagens do chat.</li><li>Enviar avisos: pedido de oração respondido, comunicados, respostas no chat, transmissões ao vivo e eventos novos.</li><li>Registrar doações e manter o histórico financeiro da igreja.</li><li>Avisar o pastor em uma situação de emergência (botão SOS).</li><li>Contar visitantes e, com autorização, entrar em contato com eles.</li></ul>
        <h2 className="text-lg font-semibold text-white pt-4">5. Com quem compartilhamos</h2>
        <p><strong className="text-white">Não vendemos dados pessoais.</strong> Para o sistema funcionar, os dados passam por serviços de tecnologia contratados, que atuam como operadores:</p>
        <div className="overflow-x-auto"><table className="w-full text-sm border border-white/10"><thead><tr><th className="text-left p-2 border-b border-white/10 text-white">Serviço</th><th className="text-left p-2 border-b border-white/10 text-white">Para que</th></tr></thead><tbody><tr><td className="p-2 border-b border-white/5">Supabase</td><td className="p-2 border-b border-white/5">banco de dados do aplicativo, login e funções do servidor</td></tr><tr><td className="p-2 border-b border-white/5">Railway</td><td className="p-2 border-b border-white/5">servidor e banco de dados do painel administrativo</td></tr><tr><td className="p-2 border-b border-white/5">Vercel</td><td className="p-2 border-b border-white/5">hospedagem do painel administrativo</td></tr><tr><td className="p-2 border-b border-white/5">Expo</td><td className="p-2 border-b border-white/5">geração do aplicativo e envio de notificações</td></tr><tr><td className="p-2 border-b border-white/5">Google Firebase</td><td className="p-2 border-b border-white/5">entrega das notificações em celulares Android</td></tr><tr><td className="p-2 border-b border-white/5">Anthropic</td><td className="p-2 border-b border-white/5">assistente de inteligência artificial do painel (usado pela liderança)</td></tr><tr><td className="p-2 border-b border-white/5">YouTube</td><td className="p-2 border-b border-white/5">exibição das transmissões ao vivo</td></tr><tr><td className="p-2 border-b border-white/5">Esri</td><td className="p-2 border-b border-white/5">imagens de satélite do mapa do painel</td></tr><tr><td className="p-2 border-b border-white/5">WhatsApp</td><td className="p-2 border-b border-white/5">somente se você escolher enviar a mensagem de emergência ao pastor pelo WhatsApp</td></tr></tbody></table></div>
        <p>Alguns desses serviços ficam <strong className="text-white">fora do Brasil</strong>. Nesses casos, a transferência internacional segue o que a LGPD permite (art. 33).</p>
        <h2 className="text-lg font-semibold text-white pt-4">6. Por quanto tempo guardamos</h2>
        <ul className="list-disc pl-6 space-y-1"><li><strong className="text-white">Dados da conta:</strong> enquanto a conta existir.</li><li><strong className="text-white">Alertas de emergência:</strong> apagados junto com a conta.</li><li><strong className="text-white">Registros financeiros:</strong> quando a conta é excluída, o vínculo com a pessoa é removido e o registro permanece <strong className="text-white">anonimizado</strong>, para preservar o histórico financeiro da igreja.</li><li><strong className="text-white">Visitantes:</strong> enquanto necessários para o acompanhamento pela igreja, ou até o pedido de exclusão.</li></ul>
        <h2 className="text-lg font-semibold text-white pt-4">7. Seus direitos (LGPD, art. 18)</h2>
        <p>Você pode, a qualquer momento: confirmar se tratamos seus dados; acessar seus dados; corrigir dados incompletos ou errados; pedir anonimização, bloqueio ou eliminação de dados desnecessários; pedir a portabilidade; pedir a eliminação dos dados tratados com consentimento; saber com quem compartilhamos; e revogar o consentimento.</p>
        <p>Para exercer qualquer direito, escreva para <strong className="text-white"><a href="mailto:valdenilopes0@gmail.com" className="text-violet-300 underline">valdenilopes0@gmail.com</a></strong>.</p>
        <h2 className="text-lg font-semibold text-white pt-4">8. Como excluir sua conta</h2>
        <p><strong className="text-white">Pelo aplicativo:</strong> Mais → Configurações → <strong className="text-white">Excluir minha conta</strong>.</p>
        <p><strong className="text-white">Sem acesso ao aplicativo:</strong> envie um e-mail para <strong className="text-white"><a href="mailto:valdenilopes0@gmail.com" className="text-violet-300 underline">valdenilopes0@gmail.com</a></strong> com o assunto "Exclusão de conta", informando o nome e o e-mail cadastrados.</p>
        <p>Ao excluir a conta, seus dados pessoais são apagados ou anonimizados, conforme o item 6.</p>
        <h2 className="text-lg font-semibold text-white pt-4">9. Idade mínima</h2>
        <p>O aplicativo é destinado a pessoas com <strong className="text-white">14 anos ou mais</strong>. Dados de adolescentes são tratados no seu melhor interesse, como determina a LGPD (art. 14).</p>
        <h2 className="text-lg font-semibold text-white pt-4">10. Segurança</h2>
        <p>Usamos conexões protegidas (HTTPS), controle de acesso por perfil (membro, líder e administrador) e regras no banco de dados que impedem um membro de ver os dados de outro. Dados do painel são acessíveis apenas à liderança autorizada.</p>
        <h2 className="text-lg font-semibold text-white pt-4">11. Alterações desta Política</h2>
        <p>Esta Política pode ser atualizada. A data da última atualização fica sempre no topo desta página.</p>
        <h2 className="text-lg font-semibold text-white pt-4">12. Contato</h2>
        <p><strong className="text-white">Noah Curitiba</strong> — Encarregado: Pastor Valdenir Lopes — <strong className="text-white"><a href="mailto:valdenilopes0@gmail.com" className="text-violet-300 underline">valdenilopes0@gmail.com</a></strong></p>
      </div>
    </div>
  );
}
