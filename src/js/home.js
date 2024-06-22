import { CreateWebWorkerMLCEngine } from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.46/+esm"

const $ = el => document.querySelector(el)

const $form = $("form")
const $input = $("input")
const $template = $("#message-template")
const $messages = $("ul")
const $container = $("main")
const $button = $("button")
const $info = $("small")
const $loading = $(".loading")

let messages = []
let end = false

const SELECTED_MODEL = "Llama-3-8B-Instruct-q4f32_1-MLC-1k"

const engine = await CreateWebWorkerMLCEngine(
  new Worker("./service-worker.js", { type: "module" }),
  SELECTED_MODEL,
  {
    initProgressCallback: info => {
      $info.textContent = info.text
      if (info.progress === 1 && !end) {
        end = true
        $loading?.parentNode?.removeChild($loading)
        $button.removeAttribute("disabled")
        addMessage(
          "Hello! I'm a Assistant running entirely in your browser. How can I assist you today?",
          "bot"
        )
        $input.focus()
      }
    }
  }
)

$form.addEventListener("submit", async event => {
  event.preventDefault()
  const messageText = $input.value.trim()

  if (messageText !== "") {
    $input.value = ""
  }

  addMessage(messageText, "user")
  $button.setAttribute("disabled", "")

  const userMessage = {
    role: "user",
    content: messageText
  }

  messages.push(userMessage)

  const chunks = await engine.chat.completions.create({
    messages,
    stream: true
  })

  let reply = ""

  const $botMessage = addMessage("", "bot")

  for await (const chunk of chunks) {
    const choice = chunk.choices[0]
    const content = choice?.delta?.content ?? ""
    reply += content
    $botMessage.textContent = reply
  }

  $button.removeAttribute("disabled")
  messages.push({
    role: "assistant",
    content: reply
  })
  $container.scrollTop = $container.scrollHeight
})

function addMessage(text, sender) {
  const clonedTemplate = $template.content.cloneNode(true)
  const $newMessage = clonedTemplate.querySelector(".message")

  const $who = $newMessage.querySelector("span")
  const $text = $newMessage.querySelector("p")

  $text.textContent = text
  $who.textContent = sender === "bot" ? "GPT" : "Tú"
  $newMessage.classList.add(sender)

  $messages.appendChild($newMessage)

  $container.scrollTop = $container.scrollHeight

  return $text
}
