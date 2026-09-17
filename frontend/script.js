const API_URL = "/predict";
const form = document.querySelector("#complaint-form");
const complaintInput = document.querySelector("#complaint");
const analyzeButton = document.querySelector("#analyze-button");
const clearButton = document.querySelector("#clear-button");
const loading = document.querySelector("#loading");
const formError = document.querySelector("#form-error");
const resultPanel = document.querySelector("#result-panel");
const category = document.querySelector("#category");
const confidence = document.querySelector("#confidence");
const confidenceBar = document.querySelector("#confidence-bar");
const submittedComplaint = document.querySelector("#submitted-complaint");

function showError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

function resetResult() {
  resultPanel.hidden = true;
  category.textContent = "—";
  confidence.textContent = "—";
  confidenceBar.style.width = "0%";
  submittedComplaint.textContent = "—";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const complaint = complaintInput.value.trim();
  formError.hidden = true;
  if (!complaint) {
    showError("Please enter a patient complaint before analyzing.");
    complaintInput.focus();
    return;
  }

  analyzeButton.disabled = true;
  loading.hidden = false;
  resultPanel.hidden = true;
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaint })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "The analysis could not be completed.");

    const percentage = Number(data.confidence) * 100;
    category.textContent = data.category;
    confidence.textContent = `${percentage.toFixed(2)}%`;
    confidenceBar.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
    submittedComplaint.textContent = complaint;
    resultPanel.hidden = false;
  } catch (error) {
    showError(error.message.includes("Failed to fetch") ? "The backend is unavailable. Start Flask and try again." : error.message);
  } finally {
    analyzeButton.disabled = false;
    loading.hidden = true;
  }
});

clearButton.addEventListener("click", () => {
  complaintInput.value = "";
  formError.hidden = true;
  resetResult();
  complaintInput.focus();
});
