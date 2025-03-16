// テキスト処理ルールの定義
const textRules = [
  {
    name: "改行ルール",
    pattern: /(\[r\]|\[p\])(?!\n)/g,
    replacement: "$1\n",
    description: "[r]と[p]の後に改行を追加（既に改行がある場合は追加しない）",
  },
  {
    name: "コメントアウト前改行ルール",
    pattern: /([^\n]);/g,
    replacement: "$1\n;",
    description:
      "コメントアウト（;で始まる文字）の前に改行を追加（既存の改行がない場合）",
  },
  {
    name: "pマーカー後空行ルール",
    pattern: /\[p\]\n(?!\n|; end)/g,
    replacement: "[p]\n\n",
    description:
      "[p]の後に空行を追加（既に空行がある場合、または次の行が; endの場合は追加しない）",
  },
  {
    name: "pマーカーとend間空行削除ルール",
    pattern: /\[p\]\n\n(?=; end)/g,
    replacement: "[p]\n",
    description: "[p]と; endの間の空行を削除",
  },
  {
    name: "空行制限ルール",
    pattern: /\n{2,}/g,
    replacement: "\n",
    description: "連続する空行を1行に制限",
  },
  // 新しいルールはここに追加
];

// テキスト処理クラス
class TextProcessor {
  constructor() {
    this.rules = textRules;
  }

  // テキストに全てのルールを適用
  process(text) {
    let processedText = text;
    // まず基本的なルールを適用
    for (const rule of this.rules) {
      processedText = this.applyRule(processedText, rule);
    }
    // その後インデントを適用
    processedText = this.applyIndentation(processedText);
    return processedText;
  }

  // 個別のルールを適用
  applyRule(text, rule) {
    return text.replace(rule.pattern, rule.replacement);
  }

  // インデントを適用
  applyIndentation(text) {
    const lines = text.split("\n");
    const result = [];
    let currentIndent = 0;
    let blockStack = [];
    let skipNextEmptyLine = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      // 空行の処理
      if (!line) {
        if (!skipNextEmptyLine) {
          result.push("");
        }
        skipNextEmptyLine = false;
        continue;
      }

      // 特定のタグの後の空行をスキップ
      if (line.includes("[to_note_during_scenario")) {
        skipNextEmptyLine = true;
      }

      // ラベルの処理（*で始まる行と; *で始まる行）
      if (line.startsWith("*") || line.startsWith("; *")) {
        blockStack.push(line);
        currentIndent = blockStack.length - 1;
        result.push("  ".repeat(currentIndent) + line);
        currentIndent = blockStack.length;
        continue;
      }

      // ブロックの終了をチェック
      if (line === "; end") {
        if (blockStack.length > 0) {
          blockStack.pop();
          currentIndent = blockStack.length;
        }
        result.push("  ".repeat(currentIndent) + line);
        continue;
      }

      // 通常の行
      result.push("  ".repeat(currentIndent) + line);
    }

    return result.join("\n");
  }
}

// グローバルスコープでTextProcessorインスタンスを作成
const textProcessor = new TextProcessor();
