const API_BASE_URL = (window.APP_CONFIG?.API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

const display = document.getElementById("display");
const message = document.getElementById("message");
const historyList = document.getElementById("historyList");
const refreshHistoryButton = document.getElementById("refreshHistory");
const clearHistoryButton = document.getElementById("clearHistory");
const backendStatus = document.getElementById("backendStatus");
const themeButton = document.getElementById("themeButton");

function setMessage(text, success = false) {
    message.textContent = text;
    message.classList.toggle("success", success);
}

function appendValue(value) {
    display.value += value;
    setMessage("");
    display.focus();
}

document.querySelectorAll("[data-value]").forEach((button) => {
    button.addEventListener("click", () => appendValue(button.dataset.value));
});

document.querySelector('[data-action="clear"]').addEventListener("click", () => {
    display.value = "";
    setMessage("");
    display.focus();
});

document.querySelector('[data-action="backspace"]').addEventListener("click", () => {
    display.value = display.value.slice(0, -1);
    setMessage("");
    display.focus();
});

document.querySelector('[data-action="calculate"]').addEventListener("click", calculate);
refreshHistoryButton.addEventListener("click", loadHistory);
clearHistoryButton.addEventListener("click", clearAllHistory);

display.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        calculate();
    } else if (event.key === "Escape") {
        event.preventDefault();
        display.value = "";
        setMessage("");
    }
});

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const dark = document.body.classList.contains("dark");
    localStorage.setItem("calculator-theme", dark ? "dark" : "light");
    themeButton.textContent = dark ? "☀️ 主题" : "🌙 主题";
});

if (localStorage.getItem("calculator-theme") === "dark") {
    document.body.classList.add("dark");
    themeButton.textContent = "☀️ 主题";
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, options);
    let data = {};
    try {
        data = await response.json();
    } catch (_) {
        throw new Error(`服务返回异常（HTTP ${response.status}）`);
    }
    if (!response.ok) {
        throw new Error(data.message || `请求失败（HTTP ${response.status}）`);
    }
    return data;
}

async function calculate() {
    const expression = display.value.trim();
    setMessage("");
    if (!expression) {
        setMessage("请输入计算表达式");
        return;
    }

    try {
        const data = await requestJson(`${API_BASE_URL}/api/calculate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expression }),
        });

        // 最终结果完全来自后端；前端不计算表达式。
        display.value = data.result;
        setMessage("计算成功", true);
        await loadHistory();
    } catch (error) {
        setMessage(error.message || "无法连接后端服务");
    }
}

async function loadHistory() {
    historyList.innerHTML = '<div class="loading">正在读取数据库记录…</div>';
    try {
        const data = await requestJson(`${API_BASE_URL}/api/history`);
        renderHistory(data.data || []);
    } catch (error) {
        historyList.innerHTML = '<div class="empty">无法读取历史记录</div>';
    }
}

function renderHistory(records) {
    historyList.innerHTML = "";
    if (records.length === 0) {
        historyList.innerHTML = '<div class="empty">暂无计算记录</div>';
        return;
    }

    records.forEach((record) => {
        const item = document.createElement("div");
        item.className = "history-item";

        const content = document.createElement("div");
        const expression = document.createElement("div");
        expression.className = "history-expression";
        expression.textContent = record.expression;

        const result = document.createElement("div");
        result.className = "history-result";
        result.textContent = `= ${record.result}`;

        const time = document.createElement("div");
        time.className = "history-time";
        time.textContent = record.created_at;

        content.append(expression, result, time);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.type = "button";
        deleteButton.textContent = "删除";
        deleteButton.addEventListener("click", () => deleteHistory(record.id));

        item.append(content, deleteButton);
        historyList.appendChild(item);
    });
}

async function deleteHistory(id) {
    try {
        await requestJson(`${API_BASE_URL}/api/history/${id}`, { method: "DELETE" });
        setMessage("历史记录已删除", true);
        await loadHistory();
    } catch (error) {
        setMessage(error.message || "删除失败");
    }
}

async function clearAllHistory() {
    if (!window.confirm("确认清空全部历史记录吗？此操作不可撤销。")) {
        return;
    }
    try {
        const data = await requestJson(`${API_BASE_URL}/api/history`, { method: "DELETE" });
        setMessage(`已清空 ${data.deleted_count ?? 0} 条记录`, true);
        await loadHistory();
    } catch (error) {
        setMessage(error.message || "清空失败");
    }
}

async function checkBackend() {
    try {
        await requestJson(`${API_BASE_URL}/api/health`);
        backendStatus.textContent = "● 后端在线";
        backendStatus.className = "backend-status online";
    } catch (_) {
        backendStatus.textContent = "● 后端离线";
        backendStatus.className = "backend-status offline";
    }
}

checkBackend();
loadHistory();
