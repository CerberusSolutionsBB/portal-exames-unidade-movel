# Portal de Acesso a Exames — Unidade Móvel 121

## Visão geral

Este documento descreve a tela de acesso a resultados de exames desenvolvida para a Unidade Móvel 121 do programa Agora Tem Especialistas (CNES 8496234). A tela permite que o paciente consulte o status do seu exame informando apenas CPF e data de nascimento, sem necessidade de cadastro prévio, senha tradicional ou processo de recuperação de acesso.

## Como funciona o acesso

O formulário usa dois campos apenas: o campo rotulado "Login" recebe o CPF do paciente, e o campo rotulado "Senha" recebe a data de nascimento no formato DD/MM/AAAA. Ambos os campos aplicam máscara automática enquanto o paciente digita, e a validação só libera o envio quando o CPF tem dígito verificador válido e a data corresponde a uma data real (sem meses ou dias inexistentes, sem datas futuras). Se algum dado estiver incorreto, o campo é destacado em vermelho com uma mensagem explicando o problema, e o foco volta automaticamente para o primeiro campo inválido.

Quando os dois campos são validados com sucesso, a tela substitui o formulário por uma confirmação — "Dados validados", com o detalhe de que CPF e data de nascimento foram confirmados — seguida de um aviso em destaque informando que o resultado do exame ainda não está disponível. Essa mensagem foi definida como o comportamento padrão da tela nesta fase do projeto, já que a integração com a base de exames ainda não existe.

## Identidade visual

A paleta foi extraída de uma placa oficial do Ministério da Saúde fotografada pelo Raphael, resultando em um azul institucional profundo (#1c2b6b) usado nos títulos, na marca da unidade e no contorno do botão principal. O restante da tela permanece em fundo branco, com texto de apoio em cinza neutro, seguindo o pedido de reservar a cor apenas para o texto e os elementos de destaque, sem grandes blocos de fundo coloridos. A tipografia combina Fraunces (títulos, com peso mais forte para dar presença institucional) e Archivo (texto corrido e campos, para boa legibilidade em telas menores). A tela também responde automaticamente ao tema claro ou escuro do dispositivo do paciente, mantendo o mesmo contraste e a mesma paleta de azul em ambos os casos.

## Recursos implementados

A tela inclui máscara automática de CPF e de data de nascimento, validação de CPF por dígito verificador, validação de data real, exibição de erro por campo com foco automático no primeiro campo inválido, mensagem de confirmação com aviso de exame indisponível, adaptação automática a tema claro e escuro, layout responsivo para celular, e estados de foco visíveis para navegação por teclado.

## Estrutura técnica

O projeto é um único arquivo HTML autocontido, com CSS e JavaScript embutidos, sem dependências externas além da fonte tipográfica (Google Fonts). Não há backend: toda a validação acontece no navegador do paciente, e nenhum dado é enviado, armazenado ou consultado em qualquer serviço. O arquivo pode ser aberto diretamente em qualquer navegador ou incorporado como view em uma aplicação já existente.

## Limitações atuais e próximos passos

Por ser uma demonstração de interface, a tela ainda não está conectada a uma base real de pacientes ou exames — por isso o aviso "Resultado de exame ainda não disponível" aparece sempre, independentemente do CPF informado. Para colocar a tela em produção, seria necessário implementar um backend que valide CPF e data de nascimento contra os registros reais da unidade, consulte o status do exame correspondente e retorne o resultado (ou o mesmo aviso de indisponibilidade, quando for o caso). Como CPF e data de nascimento são dados sensíveis, essa implementação também deve considerar criptografia em trânsito (HTTPS), limitação de tentativas de acesso e tratamento adequado dos dados conforme a LGPD.
