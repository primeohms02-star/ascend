export async function askAtlas(prompt: string): Promise<string> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 45_000);

  try {
    console.time("Atlas Request");
    const response = await fetch(
      "http://127.0.0.1:11434/api/generate",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        signal: controller.signal,

      body: JSON.stringify({
  model: "gemma3:4b",
  prompt,
  stream: false,
  keep_alive: "30m",

  options: {
    temperature: 0.2,
    num_predict: 300,
  },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Atlas AI failed with status ${response.status}.`
      );
    }

    const data = await response.json();
console.timeEnd("Atlas Request");

    if (!data.response) {
      throw new Error("Atlas AI returned an empty response.");
    }
console.log("Response length:", data.response?.length);
    return data.response;
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw new Error(
        "Atlas AI timed out after 45 seconds."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}