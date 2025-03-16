document.addEventListener("DOMContentLoaded", () => {
  const inputText = document.getElementById("input-text");
  const outputText = document.getElementById("output-text");
  const copyButton = document.getElementById("copy-button");

  // 入力テキストが変更されたときの処理
  inputText.addEventListener("input", () => {
    const processedText = textProcessor.process(inputText.value);
    outputText.textContent = processedText;
  });

  // コピーボタンの処理
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(outputText.textContent);
      copyButton.textContent = "コピーしました！";
      setTimeout(() => {
        copyButton.textContent = "コピー";
      }, 2000);
    } catch (err) {
      console.error("コピーに失敗しました:", err);
      copyButton.textContent = "コピーに失敗しました";
      setTimeout(() => {
        copyButton.textContent = "コピー";
      }, 2000);
    }
  });
});
