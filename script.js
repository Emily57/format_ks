document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const output = document.getElementById("output");
  const copyButton = document.getElementById("copy-button");

  // 入力テキストが変更されたときに処理を実行
  input.addEventListener("input", () => {
    const processedText = textProcessor.process(input.value);
    output.textContent = processedText;
  });

  // コピーボタンの処理
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(output.textContent);
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
