// テキスト処理クラス
class TextProcessor {
  constructor() {
    // タグのリスト
    this.newlineAfterTags = ["r", "p", "s", "iscript", "endscript"];
  }

  // メインの処理メソッド
  process(text) {
    let processedText = text;

    // 1. 空行の削除
    processedText = this.removeEmptyLines(processedText);

    // 2. 行頭・行末の空白を削除
    processedText = this.trimLines(processedText);

    // 3. 特定のタグ後の改行処理
    processedText = this.addNewlineAfterTags(processedText);

    // 4. [p]タグ後の空行追加
    processedText = this.addEmptyLineAfterP(processedText);

    // 5. ; end後の空行追加
    processedText = this.addEmptyLineAfterEnd(processedText);

    // 6. [iscript], [endscript]の行頭化
    processedText = this.moveScriptTagsToLineStart(processedText);

    // 7. インデント処理
    processedText = this.applyIndentation(processedText);

    // 8. タグの引数を"で囲む
    processedText = this.quoteTagArguments(processedText);

    return processedText;
  }

  // 空行を削除
  removeEmptyLines(text) {
    return text
      .split("\n")
      .filter((line) => line.trim() !== "")
      .join("\n");
  }

  // 各行の空白を削除
  trimLines(text) {
    return text
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
  }

  // 特定のタグ後に改行を追加
  addNewlineAfterTags(text) {
    const pattern = new RegExp(
      `(${this.newlineAfterTags
        .map((tag) => `\\[${tag}\\]`)
        .join("|")})(?!\\n)`,
      "g"
    );
    return text.replace(pattern, "$1\n");
  }

  // [p]タグ後に空行を追加
  addEmptyLineAfterP(text) {
    return text
      .replace(/\[p\]\n(?!\n|; end)/g, "[p]\n\n")
      .replace(/\[p\]\n\n(?=; end)/g, "[p]\n");
  }

  // ; end後に空行を追加
  addEmptyLineAfterEnd(text) {
    return text
      .replace(/; end\n(?!\n|; end)/g, "; end\n\n")
      .replace(/; end\n\n(?=; end)/g, "; end\n");
  }

  // [iscript], [endscript]を行頭に移動
  moveScriptTagsToLineStart(text) {
    return text.replace(/([^\n])\[(iscript|endscript)\]/g, "$1\n[$2]");
  }

  // インデントの適用
  applyIndentation(text) {
    const lines = text.split("\n");
    const result = [];
    let currentIndent = 0;
    let blockStack = [];
    let isInScript = false;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // 空行の場合はそのまま追加
      if (trimmedLine === "") {
        result.push("");
        continue;
      }

      // [iscript]ブロックの開始
      if (trimmedLine.includes("[iscript]")) {
        isInScript = true;
        result.push("  ".repeat(currentIndent) + trimmedLine);
        currentIndent++;
        continue;
      }

      // [endscript]ブロックの終了
      if (trimmedLine.includes("[endscript]")) {
        isInScript = false;
        if (currentIndent > 0) currentIndent--;
        result.push("  ".repeat(currentIndent) + trimmedLine);
        continue;
      }

      // ラベル行の処理
      if (trimmedLine.startsWith("*") || trimmedLine.startsWith("; *")) {
        blockStack.push(trimmedLine);
        currentIndent = blockStack.length - 1;
        result.push("  ".repeat(currentIndent) + trimmedLine);
        currentIndent = blockStack.length;
        continue;
      }

      // ブロック終了の処理
      if (trimmedLine === "; end") {
        if (blockStack.length > 0) {
          blockStack.pop();
          currentIndent = blockStack.length;
        }
        result.push("  ".repeat(currentIndent) + trimmedLine);
        continue;
      }

      // 通常行の処理
      result.push("  ".repeat(currentIndent) + trimmedLine);
    }

    return result.join("\n");
  }

  // タグの引数を"で囲む
  quoteTagArguments(text) {
    return text.replace(/\[([^\]]+)\]/g, (match, tagContent) => {
      // タグ名を抽出（最初の空白までの部分）
      const tagName = tagContent.match(/^[^\s]+/)[0];

      // タグ名以降の部分を取得
      const argsString = tagContent.slice(tagName.length).trim();
      if (!argsString) return match;

      // 引数を正規表現で抽出
      const argPattern = /([^\s=]+)=(?:'([^']*)'|"([^"]*)"|([^\s\]]+))/g;
      let processedArgs = argsString;
      let newArgsString = argsString;

      let matches;
      while ((matches = argPattern.exec(argsString)) !== null) {
        const [fullMatch, key, singleQuoted, doubleQuoted, unquoted] = matches;
        let value = singleQuoted || doubleQuoted || unquoted;

        // 新しい形式（ダブルクォートで囲む）
        const newArg = `${key}="${value}"`;
        // 元の引数をそのまま置換
        newArgsString = newArgsString.replace(fullMatch, newArg);
      }

      return `[${tagName} ${newArgsString}]`;
    });
  }
}

// グローバルスコープでTextProcessorインスタンスを作成
const textProcessor = new TextProcessor();
