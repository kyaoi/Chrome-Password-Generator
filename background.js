chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generatePassword",
    title: "Generate Password",
    contexts: ["all"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generatePassword") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: openPopupOverlay,
    });
  }
});

function openPopupOverlay() {
  const existingPopup = document.getElementById("passwordPopupOverlay");
  if (existingPopup) return; // 既にポップアップが表示されている場合は何もしない
  document.body.style.overflow = "hidden";

  const overlay = document.createElement("div");
  overlay.id = "passwordPopupOverlay";
  overlay.style.cssText = `
    all: unset !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background-color: rgba(0, 0, 0, 0.5) !important;
    z-index: 2147483647 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    font-family: 'Roboto', sans-serif !important;
    font-size: 16px !important;
    color: #333 !important;
  `;

  document.body.appendChild(overlay);

  const popup = document.createElement("div");
  popup.id = "popup";
  popup.style.cssText = `
    all: unset !important;
    width: 350px !important;
    padding: 25px !important;
    background-color: white !important;
    border-radius: 15px !important;
    box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2) !important;
    position: relative !important;
    font-family: 'Roboto', sans-serif !important;
    font-size: 1em !important;
    color: #333 !important;
  `;

  popup.innerHTML = `
  <h3 style="text-align: center; font-size: 1.5em !important; color: #000 !important; margin-bottom: 20px !important;">Generate Password</h3>
  <form id="passwordForm" style="display: flex; flex-direction: column; gap: 15px !important;">
      <label style="display: flex; align-items: center; font-size: 1em !important;">
          <input type="checkbox" id="includeSymbols" checked style="margin-right: 10px !important; border: 2px solid #ccc !important; border-radius: 5px !important; padding: 5px !important; transition: border-color 0.3s ease !important;" />
          Include Symbols
      </label>
      <label style="display: flex; align-items: center; font-size: 1em !important;">
          <input type="checkbox" id="includeNumbers" checked style="margin-right: 10px !important; border: 2px solid #ccc !important; border-radius: 5px !important; padding: 5px !important; transition: border-color 0.3s ease !important;" />
          Include Numbers
      </label>
      <label style="display: flex; justify-content: space-between; align-items: center; font-size: 1em !important;">
          Password Length:
          <input type="number" id="length" value="20" min="8" max="32" style="width: 60px !important; padding: 5px !important; font-size: 1em !important; border: 2px solid #ccc !important; border-radius: 5px !important; transition: border-color 0.3s ease !important;" />
      </label>
      <button type="submit" style="padding: 10px !important; background-color: #4CAF50 !important; color: white !important; border: none !important; border-radius: 5px !important; cursor: pointer !important; font-size: 1em !important;">Generate</button>
  </form>
  <p style="margin-top: 20px !important; font-size: 1.1em !important; color: #333 !important;">Generated Password:<br><span id="result" style="font-weight: bold !important; color: #007bff !important;"></span></p>
  <button id="closePopup" style="position:absolute !important; top:10px !important; right:10px !important; border:none !important; background:transparent !important; font-size: 1.2em !important; color: #000 !important; cursor:pointer !important;">✖</button>
`;

  // Custom styles for focus effect and border color transition
  const style = document.createElement("style");
  style.textContent = `
        input[type="checkbox"], input[type="number"] {
            border: 2px solid #ccc !important;
            border-radius: 5px !important;
            padding: 5px !important;
            transition: border-color 0.3s ease !important;
        }

        input[type="checkbox"]:focus, input[type="number"]:focus {
            outline: none !important;
            border-color: #4CAF50 !important;
        }
    `;

  document.head.appendChild(style);

  overlay.appendChild(popup);

  // Overlayがクリックされたらポップアップを閉じる
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closePopupOverlay();
    }
  });
  document.getElementById("closePopup").addEventListener("click", () => {
    closePopupOverlay();
  });

  function closePopupOverlay() {
    const overlay = document.getElementById("passwordPopupOverlay");
    if (overlay) {
      document.body.removeChild(overlay);
      // スクロールを再度有効化
      document.body.style.overflow = "auto";
    }
  }

  document
    .getElementById("passwordForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const includeSymbols = document.getElementById("includeSymbols").checked;
      const includeNumbers = document.getElementById("includeNumbers").checked;
      const length = parseInt(document.getElementById("length").value);

      const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const numbers = "0123456789";
      const symbols = "!@#$%^&*()_+[]{}|;:,.<>?/";

      let characters = letters;
      if (includeSymbols) characters += symbols;
      if (includeNumbers) characters += numbers;

      const password = generateSecurePassword(characters, length);

      document.getElementById("result").textContent = password;

      // クリップボードにコピー
      copyToClipboard(password);
    });

  function generateSecurePassword(characters, length) {
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = array[i] % characters.length;
      password += characters.charAt(randomIndex);
    }
    return password;
  }

  function copyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
}
