// handler/ai-helpers.js
export function generate_model_reply(text) {
  return {
    role: "model",
    parts: [{ text }]
  };
}

export function generate_function_reply(output = "{}", action = "function") {
  // wrap in a structure the model recognizes as functionResponse
  const payload = JSON.stringify({
    functionResponse: {
      name: action,
      response: {
        output
      }
    }
  });
  return {
    role: "user",
    parts: [{ text: payload }]
  };
}
