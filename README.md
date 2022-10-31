[codelab]:https://codelabs.developers.google.com/codelabs/your-first-pwapp

# OpenWeather PWA

Este é um Progressive Web App (PWA) criado para servir de exemplo didático.

Em alguns momentos do desenvolvimento foi necessário priorizar a didática em detrimento da utilização de boas práticas.

O OpenWeather PWA foi desenvolvido a partir da idéia original no [CodeLab Your First Progressive Web App][codelab]

## Instalação
@TODO

## Push Notification

Para utilizar o Push Notification na aplicação, você deve acessar o site [Push Companion tool](https://web-push-codelab.glitch.me/) e gerar um par de chaves.

No topo do arquivo `./scripts/app-push.js` você deve inserir a chave pública (`Public Key`) gerada na constante `applicationServerPublicKey`.

Durante a execução do app, quando o usuário subscreve às notificações do app, no console do navegador irá surgir uma string JSON com os dados da subscrição. Copie esta string gerada.

Volte ao site [Push Companion tool](https://web-push-codelab.glitch.me/), e utilize a seção Codelab Message Sending para enviar uma notificação Push. Cole a string no campo correspondente, digite uma frase curta no campo logo a seguir e clique no botão `SEND PUSH MESSAGE`.

## Mais informações
@TODO

## Links
* [Your First Progressive Web App Codelab][codelab]
* [Adding push notifications to a web app](https://github.com/GoogleChromeLabs/web-push-codelab)
* [Exemplo: Um PWA](https://github.com/googlecodelabs/your-first-pwapp)
* [Exemplo: Push Notification com PWA](https://codelabs.developers.google.com/codelabs/push-notifications/index.html#2)
