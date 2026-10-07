const examConfig = {
  title: "CMT Training: Public-Safe Demo Exam",
  source: "Public-safe workflow demonstration based on FLC exam behavior",
  totalPoints: 100,
  passScore: 80,
  questions: [
    {
      id: "q1",
      points: 20,
      prompt: "1. In this demo, what must happen before the exam unlocks?",
      options: [
        "a. The student skips registration.",
        "b. Betty manually edits the record first.",
        "c. The sandbox payment is accepted.",
        "d. The student opens Thinkific."
      ],
      answer: 2
    },
    {
      id: "q2",
      points: 20,
      prompt: "2. What does the fake checkout prove?",
      options: [
        "a. Real money can be collected tonight.",
        "b. A payment gate can control exam access.",
        "c. Stripe has already been integrated.",
        "d. MBON receives a submission."
      ],
      answer: 1
    },
    {
      id: "q3",
      points: 20,
      prompt: "3. This demo stores real credit card information.",
      options: ["a. True", "b. False"],
      answer: 1
    },
    {
      id: "q4",
      points: 20,
      prompt: "4. After submission, the system should show a score and pass/fail result.",
      options: ["a. True", "b. False"],
      answer: 0
    },
    {
      id: "q5",
      points: 20,
      prompt: "5. Betty should be able to verify the student's result from an admin view.",
      options: ["a. True", "b. False"],
      answer: 0
    }
  ]
};

const state = {
  paid: false,
  student: null,
  result: null
};

const $ = (id) => document.getElementById(id);

const guideSteps = [
  {
    target: "#course",
    title: "Start here",
    body: "This is the FLC-looking course page. The goal is to prove one course can move from registration to graded result without Thinkific."
  },
  {
    target: "#checkout",
    title: "Run fake payment",
    body: "The checkout is sandbox only. Use the prefilled success card to unlock the exam. Use 4000 0000 0000 0002 if you want to see a declined payment."
  },
  {
    target: "#exam",
    title: "Take the exam",
    body: "After the fake payment succeeds, the Chapter 1 Section 1 exam unlocks. Submit all five questions to see automatic grading."
  },
  {
    target: "#admin",
    title: "Verify the result",
    body: "The Admin Verification screen shows Betty the business proof: student, email, course, fake payment, score, pass/fail, completed time, and next action."
  }
];

let guideIndex = 0;

function normalizeCard(value) {
  return value.replace(/\D/g, "");
}

function updateBadges() {
  $("paymentStatus").textContent = state.paid ? "Paid" : "Not paid";
  $("examStatus").textContent = state.paid ? (state.result ? "Complete" : "Unlocked") : "Locked";
  $("adminStatus").textContent = state.result ? state.result.status : "No result";
}

function saveResult(result) {
  localStorage.setItem("flcShadowExamResult", JSON.stringify(result));
}

function loadResult() {
  const raw = localStorage.getItem("flcShadowExamResult");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function renderExam() {
  const form = $("examForm");
  form.innerHTML = "";

  examConfig.questions.forEach((question, index) => {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "question";

    const legend = document.createElement("legend");
    legend.textContent = question.prompt;
    fieldset.appendChild(legend);

    question.options.forEach((option, optionIndex) => {
      const label = document.createElement("label");
      label.className = "option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = question.id;
      input.value = String(optionIndex);
      input.required = true;
      label.append(input, document.createTextNode(option));
      fieldset.appendChild(label);
    });

    const points = document.createElement("p");
    points.className = "eyebrow";
    points.textContent = `${question.points} points`;
    fieldset.appendChild(points);
    form.appendChild(fieldset);
  });

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Submit exam";
  form.appendChild(submit);
}

function unlockExam() {
  state.paid = true;
  $("examLocked").classList.add("hidden");
  $("examForm").classList.remove("hidden");
  renderExam();
  updateBadges();
}

function gradeExam(formData) {
  let score = 0;
  const answers = {};

  examConfig.questions.forEach((question) => {
    const selected = Number(formData.get(question.id));
    const correct = selected === question.answer;
    answers[question.id] = { selected, correct };
    if (correct) score += question.points;
  });

  const passed = score >= examConfig.passScore;
  return {
    student: state.student,
    course: examConfig.title,
    paymentStatus: "Sandbox payment accepted",
    score,
    totalPoints: examConfig.totalPoints,
    percentage: Math.round((score / examConfig.totalPoints) * 100),
    status: passed ? "Pass" : "Fail",
    passScore: examConfig.passScore,
    completedAt: new Date().toLocaleString(),
    certificateStatus: passed ? "Completion placeholder ready for staff review" : "No certificate placeholder until passing score",
    nextStaffAction: passed
      ? "Review completion and decide whether to issue the normal FLC certificate/completion record."
      : "Follow up with the student about retake or remediation policy.",
    answers
  };
}

function renderResult(result) {
  $("examResult").classList.remove("hidden");
  $("examResult").innerHTML = `
    <strong>${result.status}: ${result.score}/${result.totalPoints} (${result.percentage}%)</strong><br>
    Passing threshold: ${result.passScore}%<br>
    ${result.nextStaffAction}
  `;
}

function renderAdmin() {
  const result = state.result || loadResult();
  if (!result) {
    $("adminView").innerHTML = "<p>No student result yet.</p>";
    return;
  }

  $("adminView").innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Student</th>
          <th>Email</th>
          <th>Course</th>
          <th>Fake Payment</th>
          <th>Score</th>
          <th>Pass/Fail</th>
          <th>Completed</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${escapeHtml(result.student.name)}</td>
          <td>${escapeHtml(result.student.email)}</td>
          <td>${escapeHtml(result.course)}</td>
          <td>${escapeHtml(result.paymentStatus)}</td>
          <td>${result.score}/${result.totalPoints} (${result.percentage}%)</td>
          <td><strong>${result.status}</strong></td>
          <td>${escapeHtml(result.completedAt)}</td>
        </tr>
      </tbody>
    </table>
    <p class="next-action">${escapeHtml(result.nextStaffAction)}</p>
    <p><strong>Certificate status:</strong> ${escapeHtml(result.certificateStatus)}</p>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openGuide(index = 0) {
  guideIndex = index;
  $("guideModal").classList.remove("hidden");
  renderGuide();
}

function closeGuide() {
  $("guideModal").classList.add("hidden");
}

function renderGuide() {
  const step = guideSteps[guideIndex];
  $("guideStep").innerHTML = `<strong>${step.title}</strong><p>${step.body}</p>`;
  $("prevGuide").disabled = guideIndex === 0;
  $("nextGuide").textContent = guideIndex === guideSteps.length - 1 ? "Finish" : "Next";
  location.hash = step.target;
}

$("checkoutForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const card = normalizeCard($("cardNumber").value);

  state.student = {
    name: $("studentName").value.trim(),
    email: $("studentEmail").value.trim()
  };

  if (!state.student.name || !state.student.email.includes("@")) {
    $("checkoutMessage").textContent = "Enter a student name and valid email before checkout.";
    return;
  }

  if (card === "4000000000000002") {
    state.paid = false;
    $("checkoutMessage").textContent = "Sandbox payment declined. Use the success test card to unlock the exam.";
    updateBadges();
    return;
  }

  if (card !== "4242424242424242") {
    state.paid = false;
    $("checkoutMessage").textContent = "Sandbox checkout only accepts listed test card numbers.";
    updateBadges();
    return;
  }

  $("checkoutMessage").textContent = "Sandbox payment accepted. Exam unlocked.";
  unlockExam();
  location.hash = "#exam";
});

$("examForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const missing = examConfig.questions.find((question) => !data.has(question.id));
  if (missing) {
    $("examResult").classList.remove("hidden");
    $("examResult").textContent = "Please answer every question before submitting.";
    return;
  }

  state.result = gradeExam(data);
  saveResult(state.result);
  renderResult(state.result);
  renderAdmin();
  updateBadges();
  location.hash = "#admin";
});

$("loadAdmin").addEventListener("click", renderAdmin);

["openGuideTop", "openGuideHero", "openGuideCard"].forEach((id) => {
  $(id).addEventListener("click", () => openGuide(0));
});

$("closeGuide").addEventListener("click", closeGuide);

$("prevGuide").addEventListener("click", () => {
  if (guideIndex > 0) {
    guideIndex -= 1;
    renderGuide();
  }
});

$("nextGuide").addEventListener("click", () => {
  if (guideIndex === guideSteps.length - 1) {
    closeGuide();
    return;
  }
  guideIndex += 1;
  renderGuide();
});

$("resetDemo").addEventListener("click", () => {
  localStorage.removeItem("flcShadowExamResult");
  state.paid = false;
  state.student = null;
  state.result = null;
  $("checkoutForm").reset();
  $("studentName").value = "Avery Johnson";
  $("studentEmail").value = "avery.johnson.demo@example.com";
  $("cardNumber").value = "4242 4242 4242 4242";
  $("cardExpiry").value = "12/30";
  $("cardCvc").value = "123";
  $("cardZip").value = "21702";
  $("checkoutMessage").textContent = "Demo reset.";
  $("examForm").classList.add("hidden");
  $("examLocked").classList.remove("hidden");
  $("examResult").classList.add("hidden");
  $("examResult").textContent = "";
  $("adminView").innerHTML = "<p>No student result yet.</p>";
  updateBadges();
});

renderAdmin();
updateBadges();
