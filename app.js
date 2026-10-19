(() => {
  "use strict";

  const STORAGE_KEY = "enzyme-lab-navigation-v1";
  const TUBE_KEYS = ["A", "B", "C"];
  const CLASS_CODES = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const MAX_VOLUME = 8;
  const MODEL_VERSION = 2;
  const GRAPH_COLORS = { A: "#2563b8", B: "#df7b24", C: "#7652bd" };

  const SCREENS = [
    { id: "entry", label: "1. 입장" },
    { id: "hypothesis", label: "2. 가설 설정" },
    { id: "design", label: "3. 실험 설계" },
    { id: "perform", label: "4. 실험 수행" },
    { id: "result", label: "5. 결과 확인" },
    { id: "conclusion", label: "6. 최종 결론" }
  ];

  const FACTORS = ["온도", "pH", "효소 농도", "기질(녹말) 농도"];

  // 교사가 나중에 선택값을 쉽게 수정할 수 있도록 한곳에 모았습니다.
  const OPTIONS = {
    starchConcentration: [1, 3, 5],
    enzymeConcentration: [25, 50, 100],
    volume: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
    temperature: [0, 20, 37, 60, 80],
    ph: [2, 4, 7, 9, 12],
    time: [1, 3, 5, 10]
  };

  const HYPOTHESIS_HINTS = {
    "온도": [
      "온도가 달라지면 아밀레이스가 녹말을 분해하는 정도는 어떻게 달라질까요?",
      "아밀레이스는 ___℃에서 녹말을 가장 잘 분해할 것이다."
    ],
    "pH": [
      "산성, 중성, 염기성 중 아밀레이스가 가장 활발하게 작용할 것으로 예상되는 조건은 무엇인가요?",
      "아밀레이스는 pH ___에서 녹말을 가장 잘 분해할 것이다."
    ],
    "효소 농도": [
      "아밀레이스가 더 많이 존재한다면 같은 시간 동안 분해되는 녹말의 양은 어떻게 달라질까요?",
      "다른 조건이 같을 때, 아밀레이스 농도가 높아지면 녹말 분해 속도는 ___할 것이다."
    ],
    "기질(녹말) 농도": [
      "아밀레이스의 양이 일정할 때 녹말의 농도를 높이면 반응 속도는 어떻게 달라질까요?",
      "다른 조건이 같을 때, 녹말 농도가 높아지면 분해 반응 속도는 ___할 것이다."
    ]
  };

  const DESIGN_HINTS = {
    "온도": "세 시험관에서 온도를 각각 어떻게 다르게 설정해야 할까요? 온도 이외의 조건은 모든 시험관에서 동일하게 유지해야 합니다.",
    "pH": "세 시험관에서 pH를 각각 어떻게 다르게 설정해야 할까요? pH 이외의 조건은 모든 시험관에서 동일하게 유지해야 합니다.",
    "효소 농도": "세 시험관에서 아밀레이스 용액의 농도를 각각 어떻게 다르게 설정해야 할까요? 효소 농도 이외의 조건은 모든 시험관에서 동일하게 유지해야 합니다.",
    "기질(녹말) 농도": "세 시험관에서 녹말 용액의 농도를 각각 어떻게 다르게 설정해야 할까요? 기질 농도 이외의 조건은 모든 시험관에서 동일하게 유지해야 합니다."
  };

  const HINT_REFERENCE_ROWS = [
    { label: "온도", factor: "온도", value: "37℃", blank: "___℃" },
    { label: "pH", factor: "pH", value: "7", blank: "___" },
    { label: "녹말 용액 농도", factor: "기질(녹말) 농도", value: "5%", blank: "___%" },
    { label: "녹말 용액 양", value: "2 mL" },
    { label: "아밀레이스 용액 농도", factor: "효소 농도", value: "100%", blank: "___%" },
    { label: "아밀레이스 용액 양", value: "1 mL" },
    { label: "증류수", value: "1 mL" },
    { label: "반응 시간", value: "5분" }
  ];

  const LIQUIDS = {
    starch: { name: "녹말 용액", color: "#f4be4e" },
    enzyme: { name: "아밀레이스 용액", color: "#9790e9" },
    water: { name: "증류수", color: "#8bd6eb" }
  };

  const START_TUBES = {
    A: tube(2, 1, 1, 5, 100, 0, 7, 5),
    B: tube(2, 1, 1, 5, 100, 37, 7, 5),
    C: tube(2, 1, 1, 5, 100, 80, 7, 5)
  };

  const START_PLAN = {
    A: tube(0, 0, 0, 1, 25, 0, 2, 1),
    B: tube(0, 0, 0, 1, 25, 0, 2, 1),
    C: tube(0, 0, 0, 1, 25, 0, 2, 1)
  };

  const DEFAULT_STATE = {
    screen: "entry",
    classCode: CLASS_CODES[0],
    studentCode: "",
    studentNumber: "",
    studentName: "",
    factor: "온도",
    hypothesis: "",
    hypothesisHint1: false,
    hypothesisHint2: false,
    factorChangedNotice: false,
    independent: "",
    controlled: "",
    dependent: "",
    designHint1: false,
    designHint2: false,
    hintUsage: {
      hypothesis: { level: 0, byFactor: {} },
      design: { level: 0, byFactor: {} }
    },
    finishHintUsage: { used: false, count: 0, requests: [] },
    // 신규 힌트 요청부터 시각을 보존합니다. 과거 기록은 기존 hintUsage 요약으로 보존.
    hintEvents: [],
    submission: null,
    plan: START_PLAN,
    actualTubes: START_TUBES,
    currentRun: null,
    experiments: [],
    prediction: "",
    observation: "",
    interpretation: "",
    conclusion: ""
  };

  const SUBMISSION_SCHEMA_VERSION = 1;
  let submissionInProgress = false;
  let state = loadState();

  const byId = (id) => document.getElementById(id);

  initialize();

  function tube(starch, enzyme, water, starchConc, enzymeConc, temp, ph, time) {
    return { starch, enzyme, water, starchConc, enzymeConc, temp, ph, time };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  // 이전 버전의 저장값도 가능한 범위에서 이어서 사용할 수 있게 읽습니다.
  function loadState() {
    let saved = {};

    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (error) {
      saved = {};
    }

    const merged = Object.assign(clone(DEFAULT_STATE), saved);
    if (!CLASS_CODES.includes(merged.classCode)) {
      merged.classCode = DEFAULT_STATE.classCode;
    }
    merged.plan = Object.assign(clone(START_PLAN), saved.plan || {});
    if (!saved.experiments?.length && isLegacyEmptyPlan(saved.plan)) {
      merged.plan = clone(START_PLAN);
    }
    merged.actualTubes = Object.assign(
      clone(START_TUBES),
      saved.actualTubes || saved.tubes || {}
    );
    merged.experiments = Array.isArray(saved.experiments) ? saved.experiments : [];
    merged.experiments.forEach((record) => {
      if (!record.modelVersion) record.modelVersion = 1;
    });
    merged.currentRun = saved.currentRun && typeof saved.currentRun === "object"
      ? saved.currentRun
      : null;
    if (merged.currentRun && !merged.currentRun.modelVersion) {
      merged.currentRun.modelVersion = 1;
    }
    if (merged.currentRun && merged.currentRun.status === "ready") {
      merged.currentRun.modelVersion = MODEL_VERSION;
      merged.currentRun.prediction = "";
      merged.currentRun.predictionLocked = false;
    }
    if (
      merged.currentRun &&
      merged.currentRun.status === "reacted" &&
      !merged.currentRun.results &&
      !(merged.currentRun.prediction || "").trim()
    ) {
      merged.currentRun.status = "ready";
      merged.currentRun.modelVersion = MODEL_VERSION;
      merged.currentRun.predictionLocked = false;
    }
    if (merged.currentRun && ["mixing", "mixed"].includes(merged.currentRun.status)) {
      merged.currentRun.status = "reacted";
    }
    if (merged.currentRun && merged.currentRun.status === "reacting") {
      merged.currentRun.status = "reacted";
    }
    if (merged.currentRun && merged.currentRun.status === "testing" && merged.currentRun.results) {
      merged.currentRun.status = "tested";
    }

    merged.hintUsage = normalizeHintUsage(saved.hintUsage);
    merged.finishHintUsage = normalizeFinishHintUsage(saved.finishHintUsage);
    merged.hintEvents = Array.isArray(saved.hintEvents) ? saved.hintEvents : [];
    merged.submission = saved.submission && typeof saved.submission === "object"
      ? saved.submission
      : null;

    if (saved.hint1 !== undefined && saved.hypothesisHint1 === undefined) {
      merged.hypothesisHint1 = saved.hint1;
      merged.hypothesisHint2 = saved.hint2;
    }


    // 이전 버전의 힌트 표시 상태도 새 사용 기록 형식으로 옮깁니다.
    if (merged.hypothesisHint1) {
      recordHintUsage(merged.hintUsage, "hypothesis", merged.factor, merged.hypothesisHint2 ? 2 : 1);
    }
    if (merged.designHint1) {
      recordHintUsage(merged.hintUsage, "design", merged.factor, merged.designHint2 ? 2 : 1);
    }

    if (merged.screen === "result" && !saved.actualTubes) {
      merged.screen = "perform";
    }

    return merged;
  }

  function isLegacyEmptyPlan(plan) {
    if (!plan) return false;
    return TUBE_KEYS.every((key) => {
      const item = plan[key];
      return item && item.starch === 0 && item.enzyme === 0 && item.water === 0 &&
        item.starchConc === 5 && item.enzymeConc === 100 && item.temp === 37 &&
        item.ph === 7 && item.time === 5;
    });
  }

  function normalizeHintUsage(savedUsage) {
    const usage = clone(DEFAULT_STATE.hintUsage);

    ["hypothesis", "design"].forEach((stage) => {
      const savedStage = savedUsage && savedUsage[stage];
      if (!savedStage) return;

      usage[stage].level = [0, 1, 2].includes(savedStage.level) ? savedStage.level : 0;
      if (savedStage.byFactor && typeof savedStage.byFactor === "object") {
        FACTORS.forEach((factor) => {
          const level = savedStage.byFactor[factor];
          if ([1, 2].includes(level)) usage[stage].byFactor[factor] = level;
        });
      }
    });

    return usage;
  }

  function recordHintUsage(usage, stage, factor, level) {
    usage[stage].level = Math.max(usage[stage].level, level);
    usage[stage].byFactor[factor] = Math.max(usage[stage].byFactor[factor] || 0, level);
  }

  function normalizeFinishHintUsage(savedUsage) {
    return {
      used: Boolean(savedUsage?.used),
      count: Number.isInteger(savedUsage?.count) ? savedUsage.count : 0,
      requests: Array.isArray(savedUsage?.requests) ? savedUsage.requests : []
    };
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function initialize() {
    bindSavedTextFields();
    buildStepNavigation();
    bindNavigationButtons();
    bindStaticButtons();
    renderFactors();
    renderHypothesisHints();
    renderDesignHints();
    renderPlanTable();
    renderDesignTubes();
    if (state.currentRun && state.currentRun.status === "tested") {
      saveExperimentRecord();
    }
    renderScreen();
    saveState();
    runModelSelfTests();
    runInquirySelfTests();
  }

  // 입력할 때마다 학생 답안을 브라우저에 저장합니다.
  function bindSavedTextFields() {
    const fieldIds = [
      "classCode",
      "studentNumber",
      "studentName",
      "hypothesis",
      "independent",
      "controlled",
      "dependent",
      "prediction",
      "observation",
      "interpretation",
      "conclusion"
    ];

    fieldIds.forEach((id) => {
      const element = byId(id);
      element.value = state[id] || "";
      element.addEventListener("input", () => {
        state[id] = element.value;
        saveState();

        if (id === "hypothesis") {
          updateRepeatedHypothesis();
        }
        if (id === "prediction" && state.screen === "perform") {
          renderProcessControls();
        }
        if (id === "observation" || id === "interpretation") {
          updateCurrentRecordAnswers();
          updateFinishButton();
        }
      });
    });
  }

  function buildStepNavigation() {
    const root = byId("steps");

    SCREENS.forEach((screen) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "step";
      button.textContent = screen.label;
      button.addEventListener("click", () => goTo(screen.id));
      root.append(button);
    });
  }

  function bindNavigationButtons() {
    document.querySelectorAll("[data-go]").forEach((button) => {
      button.addEventListener("click", () => goTo(button.dataset.go));
    });
  }

  function bindStaticButtons() {
    byId("resetAll").addEventListener("click", resetAll);
    byId("hypothesisHint1").addEventListener("click", showHypothesisHint1);
    byId("hypothesisHint2").addEventListener("click", showHypothesisHint2);
    byId("designHint1").addEventListener("click", showDesignHint1);
    byId("designHint2").addEventListener("click", showDesignHint2);
    byId("showPlan").addEventListener("click", openPlanOverlay);
    byId("closePlan").addEventListener("click", closePlanOverlay);
    byId("mixTubes").addEventListener("click", mixTubes);
    byId("runBenedict").addEventListener("click", runBenedictTest);
    byId("repeatExperiment").addEventListener("click", repeatExperiment);
    byId("finishHintButton").addEventListener("click", showFinishHint);
    byId("submitInquiry").addEventListener("click", submitInquiry);

    byId("planOverlay").addEventListener("click", (event) => {
      if (event.target === byId("planOverlay")) {
        closePlanOverlay();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closePlanOverlay();
      }
    });
  }

  function resetAll() {
    const confirmed = confirm(
      "이 기기에 저장된 입력과 시험관 설정을 모두 지우고 처음부터 시작할까요?"
    );

    if (confirmed) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  }

  // 여섯 단계의 화면과 상단 진행 표시를 함께 바꿉니다.
  function goTo(screenId) {
    if (screenId === "conclusion" && !canFinishInquiry()) {
      showFinishGuidance();
      alert("아직 탐구를 마칠 조건이 충족되지 않았어요. 실험 과정과 결과를 다시 살펴보세요.");
      return;
    }
    if (screenId === "perform" && state.screen === "design") {
      prepareExperimentRun();
    }
    state.screen = screenId;
    saveState();
    renderScreen();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderScreen() {
    const validScreen = SCREENS.some((screen) => screen.id === state.screen);
    if (!validScreen) {
      state.screen = "entry";
    }

    const currentIndex = SCREENS.findIndex((screen) => screen.id === state.screen);

    document.querySelectorAll(".screen").forEach((section) => {
      section.classList.toggle("active", section.dataset.screen === state.screen);
    });

    Array.from(byId("steps").children).forEach((button, index) => {
      button.classList.toggle("active", index === currentIndex);
      button.classList.toggle("done", index < currentIndex);
      button.setAttribute("aria-current", index === currentIndex ? "step" : "false");
    });

    updateRepeatedHypothesis();

    if (state.screen === "design") {
      renderPlanTable();
      renderDesignTubes();
    }

    if (state.screen === "perform") {
      if (!state.currentRun) prepareExperimentRun();
      renderPerformScreen();
    }

    if (state.screen === "result") {
      renderResultScreen();
      updateFinishButton();
    }

    if (state.screen === "conclusion") {
      renderSummary();
      renderExperimentHistory();
      renderSubmissionStatus();
    }
  }

  function updateRepeatedHypothesis() {
    const text = state.hypothesis.trim() || "아직 가설을 작성하지 않았습니다.";
    byId("designHypothesis").textContent = text;
    byId("resultHypothesis").textContent = text;
  }

  // 조작변인이 바뀌면 화면의 힌트만 초기화하고 가설과 사용 기록은 보존합니다.
  function renderFactors() {
    const root = byId("factorGrid");
    root.replaceChildren();

    FACTORS.forEach((factor) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice" + (state.factor === factor ? " active" : "");
      button.textContent = factor;
      button.setAttribute("aria-pressed", String(state.factor === factor));
      button.addEventListener("click", () => changeFactor(factor));
      root.append(button);
    });

    byId("hypothesisReview").hidden = !state.factorChangedNotice;
  }

  function changeFactor(factor) {
    if (state.factor === factor) {
      return;
    }

    state.factor = factor;
    state.hypothesisHint1 = false;
    state.hypothesisHint2 = false;
    state.designHint1 = false;
    state.designHint2 = false;
    state.factorChangedNotice = true;
    saveState();
    renderFactors();
    renderHypothesisHints();
    renderDesignHints();
  }

  function showHypothesisHint1() {
    if (state.hypothesisHint1) return;
    state.hypothesisHint1 = true;
    recordHintUsage(state.hintUsage, "hypothesis", state.factor, 1);
    state.hintEvents.push({
      stage: "hypothesis", factor: state.factor, level: 1,
      requestedAt: new Date().toISOString(), experimentCount: state.experiments.length
    });
    saveState();
    renderHypothesisHints();
  }

  function showHypothesisHint2() {
    if (state.hypothesisHint2) return;
    state.hypothesisHint2 = true;
    recordHintUsage(state.hintUsage, "hypothesis", state.factor, 2);
    state.hintEvents.push({
      stage: "hypothesis", factor: state.factor, level: 2,
      requestedAt: new Date().toISOString(), experimentCount: state.experiments.length
    });
    saveState();
    renderHypothesisHints();
  }

  function renderHypothesisHints() {
    const root = byId("hypothesisHints");
    root.replaceChildren();

    if (state.hypothesisHint1) {
      root.append(createHint("힌트 1 · 생각을 돕는 질문", HYPOTHESIS_HINTS[state.factor][0]));
    }

    if (state.hypothesisHint2) {
      root.append(createHint(
        "힌트 2 · 가설 작성 틀",
        HYPOTHESIS_HINTS[state.factor][1],
        "이 문장은 작성 예시입니다."
      ));
    }

    byId("hypothesisHint1").disabled = state.hypothesisHint1;
    byId("hypothesisHint2").disabled = !state.hypothesisHint1 || state.hypothesisHint2;
  }

  function showDesignHint1() {
    if (state.designHint1) return;
    state.designHint1 = true;
    recordHintUsage(state.hintUsage, "design", state.factor, 1);
    state.hintEvents.push({
      stage: "design", factor: state.factor, level: 1,
      requestedAt: new Date().toISOString(), experimentCount: state.experiments.length
    });
    saveState();
    renderDesignHints();
  }

  function showDesignHint2() {
    if (state.designHint2) return;
    state.designHint2 = true;
    recordHintUsage(state.hintUsage, "design", state.factor, 2);
    state.hintEvents.push({
      stage: "design", factor: state.factor, level: 2,
      requestedAt: new Date().toISOString(), experimentCount: state.experiments.length
    });
    saveState();
    renderDesignHints();
  }

  function renderDesignHints() {
    const root = byId("designHints");
    root.replaceChildren();

    if (state.designHint1) {
      root.append(createHint("힌트 1 · 실험 설계 질문", DESIGN_HINTS[state.factor]));
    }

    if (state.designHint2) {
      root.append(createDesignReferenceHint());
    }

    byId("designHint1").disabled = state.designHint1;
    byId("designHint2").disabled = !state.designHint1 || state.designHint2;
  }

  function createHint(title, text, note = "") {
    const element = document.createElement("details");
    element.className = "hint";
    element.open = true;
    const summary = document.createElement("summary");
    const content = document.createElement("p");
    summary.textContent = title;
    content.textContent = text;
    element.append(summary, content);
    if (note) {
      const small = document.createElement("small");
      small.className = "hint-note";
      small.textContent = note;
      element.append(small);
    }
    return element;
  }

  function createDesignReferenceHint() {
    const details = document.createElement("details");
    details.className = "hint hint-reference";
    details.open = true;

    const summary = document.createElement("summary");
    summary.textContent = "힌트 2 · 참고용 실험 조건표";

    const introduction = document.createElement("p");
    introduction.textContent = "빈칸에는 서로 비교할 값을 직접 정하세요. 이 표는 참고 자료이며 실제 실험 계획표에는 자동 입력되지 않습니다.";

    const scroll = document.createElement("div");
    scroll.className = "table-scroll";
    const table = document.createElement("table");
    table.className = "hint-table";

    const header = document.createElement("tr");
    ["실험 조건", "A", "B", "C"].forEach((label) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = label;
      header.append(th);
    });
    table.append(header);

    HINT_REFERENCE_ROWS.forEach((item) => {
      const row = document.createElement("tr");
      const heading = document.createElement("th");
      heading.scope = "row";
      heading.textContent = item.label;
      row.append(heading);

      TUBE_KEYS.forEach(() => {
        const cell = document.createElement("td");
        cell.textContent = item.factor === state.factor ? item.blank : item.value;
        if (item.factor === state.factor) cell.className = "hint-blank";
        row.append(cell);
      });
      table.append(row);
    });

    scroll.append(table);
    details.append(summary, introduction, scroll);
    return details;
  }

  // 계획표의 값은 설계 시험관 그림과 수행 단계의 준비 조건에 사용됩니다.
  function renderPlanTable() {
    const table = byId("planTable");
    const fields = [
      { label: "녹말 용액 농도", property: "starchConc", values: OPTIONS.starchConcentration, suffix: "%" },
      { label: "녹말 용액 양", property: "starch", values: OPTIONS.volume, suffix: " mL" },
      { label: "아밀레이스 용액 농도", property: "enzymeConc", values: OPTIONS.enzymeConcentration, suffix: "%" },
      { label: "아밀레이스 용액 양", property: "enzyme", values: OPTIONS.volume, suffix: " mL" },
      { label: "증류수", property: "water", values: OPTIONS.volume, suffix: " mL" },
      { label: "온도", property: "temp", values: OPTIONS.temperature, suffix: "℃" },
      { label: "pH", property: "ph", values: OPTIONS.ph, suffix: "", prefix: "pH " },
      { label: "반응 시간", property: "time", values: OPTIONS.time, suffix: "분" }
    ];
    table.replaceChildren();

    const header = document.createElement("tr");
    ["실험 조건", ...TUBE_KEYS].forEach((label) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = label;
      header.append(th);
    });
    table.append(header);

    fields.forEach((field) => {
      const row = document.createElement("tr");
      const heading = document.createElement("th");
      heading.scope = "row";
      heading.textContent = field.label;
      heading.className = planColorClass(field.property);
      row.append(heading);

      TUBE_KEYS.forEach((tubeKey) => {
        row.append(createPlanCell(
          tubeKey,
          field.property,
          field.values,
          field.suffix,
          field.prefix || "",
          field.label
        ));
      });
      table.append(row);
    });
  }

  function createPlanCell(tubeKey, property, values, suffix, prefix = "", label = property) {
    const cell = document.createElement("td");
    cell.className = planColorClass(property);
    const stepper = document.createElement("div");
    stepper.className = "plan-stepper";
    const currentIndex = values.indexOf(state.plan[tubeKey][property]);

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.disabled = currentIndex <= 0;
    minus.setAttribute("aria-label", `${tubeKey} 시험관 ${label} 낮추기`);

    const value = document.createElement("span");
    value.textContent = `${prefix}${formatNumber(state.plan[tubeKey][property])}${suffix}`;
    value.setAttribute("aria-live", "polite");

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.disabled = currentIndex >= values.length - 1;
    plus.setAttribute("aria-label", `${tubeKey} 시험관 ${label} 높이기`);

    const changeValue = (direction) => {
      const previousValue = state.plan[tubeKey][property];
      const index = values.indexOf(previousValue);
      const nextIndex = Math.max(0, Math.min(values.length - 1, index + direction));
      state.plan[tubeKey][property] = values[nextIndex];

      const volumeProperties = ["starch", "enzyme", "water"];
      if (
        volumeProperties.includes(property) &&
        totalVolume(state.plan[tubeKey]) > MAX_VOLUME
      ) {
        state.plan[tubeKey][property] = previousValue;
        alert("계획표의 시험관 총부피도 최대 8 mL까지 설정할 수 있어요.");
        renderPlanTable();
        return;
      }

      saveState();
      renderPlanTable();
      renderDesignTubes();
    };

    minus.addEventListener("click", () => changeValue(-1));
    plus.addEventListener("click", () => changeValue(1));

    stepper.append(minus, value, plus);
    cell.append(stepper);
    return cell;
  }

  function planColorClass(property) {
    if (["starch", "starchConc"].includes(property)) return "plan-starch";
    if (["enzyme", "enzymeConc"].includes(property)) return "plan-enzyme";
    if (property === "water") return "plan-water";
    return "";
  }

  function openPlanOverlay() {
    renderPlanReviewTable();
    byId("planOverlay").classList.add("open");
  }

  function closePlanOverlay() {
    byId("planOverlay").classList.remove("open");
  }

  function renderPlanReviewTable() {
    const table = byId("planReviewTable");
    const fields = [
      ["녹말 용액", (item) => `${formatNumber(item.starch)} mL · ${item.starchConc}%`],
      ["아밀레이스 용액", (item) => `${formatNumber(item.enzyme)} mL · ${item.enzymeConc}%`],
      ["증류수", (item) => `${formatNumber(item.water)} mL`],
      ["온도", (item) => `${item.temp}℃`],
      ["pH", (item) => item.ph],
      ["반응 시간", (item) => `${item.time}분`],
      ["총부피", (item) => `${formatNumber(totalVolume(item))} mL`]
    ];

    table.replaceChildren();
    const header = document.createElement("tr");
    ["계획 조건", ...TUBE_KEYS].forEach((label) => {
      const th = document.createElement("th");
      th.textContent = label;
      header.append(th);
    });
    table.append(header);

    fields.forEach(([label, format]) => {
      const row = document.createElement("tr");
      const heading = document.createElement("th");
      heading.textContent = label;
      row.append(heading);

      TUBE_KEYS.forEach((tubeKey) => {
        const cell = document.createElement("td");
        cell.textContent = format(state.plan[tubeKey]);
        row.append(cell);
      });
      table.append(row);
    });
  }

  function renderDesignTubes() {
    renderTubeSet("designTubeGrid", state.plan, { prefix: "design", mixed: false });
  }

  function prepareExperimentRun() {
    state.prediction = "";
    state.observation = "";
    state.interpretation = "";
    byId("prediction").value = "";
    byId("observation").value = "";
    byId("interpretation").value = "";
    byId("finishGuidance").hidden = true;
    byId("finishHintText").replaceChildren();
    state.actualTubes = clone(state.plan);
    state.currentRun = {
      id: `experiment-${Date.now()}`,
      status: "ready",
      factor: state.factor,
      modelVersion: MODEL_VERSION,
      prediction: "",
      predictionLocked: false,
      conditions: clone(state.plan),
      results: null,
      startedAt: new Date().toISOString()
    };
    saveState();
  }

  function renderPerformScreen() {
    const run = state.currentRun;
    if (!run) return;
    ensureTimeSeriesResults(run);

    const mixed = ["mixed", "reacting", "reacted", "testing", "tested"].includes(run.status);
    renderTubeSet("performTubeGrid", run.conditions, {
      prefix: "perform",
      mixed,
      shaking: run.status === "mixing"
    });

    byId("mixtureNote").textContent = mixed
      ? "용액을 섞은 뒤에는 하나의 혼합 용액으로 단순화하여 표시합니다."
      : "섞기 전에는 용액을 구분하기 위해 색 층으로 표시합니다.";

    const predictionInput = byId("prediction");
    const predictionLocked = Boolean(run.predictionLocked || run.status !== "ready");
    predictionInput.readOnly = predictionLocked;
    predictionInput.classList.toggle("locked-input", predictionLocked);

    renderProcessControls();
    renderBenedictResults();
  }

  function renderTubeSet(rootId, tubes, options = {}) {
    const root = byId(rootId);
    if (!root) return;
    root.replaceChildren();
    root.classList.toggle("shaking", Boolean(options.shaking));

    TUBE_KEYS.forEach((tubeKey) => {
      const item = tubes[tubeKey];
      const card = document.createElement("div");
      card.className = "tube-card";

      const title = document.createElement("div");
      title.className = "tube-title";
      title.textContent = tubeKey;

      const metrics = document.createElement("div");
      metrics.className = "tube-metrics";
      metrics.innerHTML = `<span class="metric">${item.temp}℃</span><span class="metric">pH ${item.ph}</span><span class="metric">${item.time}분</span>`;

      const footer = document.createElement("div");
      footer.className = "tube-foot";
      footer.textContent = `${formatNumber(totalVolume(item))} mL`;

      card.append(
        title,
        metrics,
        createTubeSvg(item, `${options.prefix}-${tubeKey}`, Boolean(options.mixed), tubeKey),
        footer
      );
      root.append(card);
    });
  }

  function mixTubes() {
    const run = state.currentRun;
    if (!run || run.status !== "ready") return;
    if (!state.prediction.trim()) {
      alert("'내가 예상한 실험 결과'를 작성해야 실험을 시작할 수 있습니다.");
      byId("prediction").focus();
      return;
    }
    run.prediction = state.prediction;
    run.predictionLocked = true;
    run.hypothesis = state.hypothesis;
    run.variables = {
      independent: state.independent,
      controlled: state.controlled,
      dependent: state.dependent
    };
    run.status = "mixing";
    saveState();
    renderPerformScreen();

    window.setTimeout(() => {
      if (!state.currentRun || state.currentRun.id !== run.id) return;
      state.currentRun.status = "reacting";
      saveState();
      renderPerformScreen();

      window.setTimeout(() => {
        if (!state.currentRun || state.currentRun.id !== run.id) return;
        state.currentRun.status = "reacted";
        saveState();
        renderPerformScreen();
      }, 2200);
    }, 900);
  }

  function renderProcessControls() {
    const run = state.currentRun;
    if (!run) return;
    const status = run.status;
    byId("mixTubes").disabled = status !== "ready";
    byId("mixTubes").textContent = status === "ready" ? "용액 섞기" : "섞기 완료";
    byId("runBenedict").disabled = status !== "reacted";

    const progress = byId("reactionProgress");
    if (status === "reacting") {
      const times = TUBE_KEYS.map((key) => `${key} ${run.conditions[key].time}분`).join(" · ");
      progress.innerHTML = `<b>효소 반응 진행 중</b><span>${times}의 시간 경과를 짧은 애니메이션으로 나타냅니다.</span><i class="progress-line active"></i>`;
    } else if (["reacted", "testing", "tested"].includes(status)) {
      progress.innerHTML = "<b>효소 반응이 끝났습니다.</b><span>이제 반응액 일부로 생성된 당을 검출할 수 있습니다.</span><i class=\"progress-line done\"></i>";
    } else {
      progress.replaceChildren();
    }

    byId("goResult").disabled = status !== "tested";
  }

  function runBenedictTest() {
    const run = state.currentRun;
    if (!run || run.status !== "reacted") return;
    if (!(run.prediction || "").trim()) {
      alert("'내가 예상한 실험 결과'를 작성해야 결과를 확인할 수 있습니다.");
      byId("prediction").focus();
      return;
    }
    run.status = "testing";
    run.results = calculateExperimentResults(run.conditions);
    saveState();
    renderPerformScreen();

    window.setTimeout(() => {
      if (!state.currentRun || state.currentRun.id !== run.id) return;
      state.currentRun.status = "tested";
      saveExperimentRecord();
      saveState();
      renderPerformScreen();
    }, 1800);
  }

  /*
   * 교육용 반응 모델의 가정과 한계
   * - 최적 조건은 약 37℃, pH 7로 두고 멀어질수록 활성이 낮아집니다.
   * - 반응 속도 계산에서 투입된 효소의 총량과 혼합 뒤 기질 농도를 구분합니다.
   * - 생성물 총량은 그래프에, 생성물 농도는 베네딕트 색 판정에 사용합니다.
   * - 기질 효과는 포화 곡선으로, 시간별 생성량은 기질 소모에 따라 기울기가
   *   점차 줄어드는 지수 포화 곡선으로 단순화합니다.
   * - 결과는 실제 농도나 측정값이 아닌 0~100의 상대 지수입니다.
   * - 베네딕트 색과 그래프는 아래에서 계산한 같은 relativeSugar 값을 사용합니다.
   */
  function calculateTubeResult(item) {
    const volume = totalVolume(item);
    if (volume <= 0) return zeroResult(item.time, "용액이 들어 있지 않습니다.");
    if (item.starch <= 0) return zeroResult(item.time, "녹말 용액이 없어 분해할 기질이 없습니다.");
    if (item.enzyme <= 0) return zeroResult(item.time, "아밀레이스 용액이 없어 녹말 분해가 일어나지 않습니다.");

    const starchUnits = item.starch * item.starchConc;
    const enzymeUnits = item.enzyme * item.enzymeConc / 100;
    const finalStarch = starchUnits / volume;
    const temperatureEffect = Math.exp(-Math.pow((item.temp - 37) / 22, 2));
    const phEffect = Math.exp(-Math.pow((item.ph - 7) / 2.7, 2));
    const saturationEffect = finalStarch / (finalStarch + 1.5);
    const initialRate = 7.5 * enzymeUnits * saturationEffect * temperatureEffect * phEffect;
    const timeSeries = createTimeSeries(item.time, starchUnits, initialRate);
    const lastPoint = timeSeries[timeSeries.length - 1];
    const productTotal = lastPoint.productTotal;
    const productConcentration = productTotal / volume;
    const relativeSugar = lastPoint.amount;
    const detectionRelative = Math.max(0, Math.min(100, productConcentration / 5 * 100));

    return Object.assign(
      resultValue(detectionRelative, productTotal <= 1e-12 ? "이 조건에서는 생성된 당이 거의 없습니다." : ""),
      { initialRate, timeSeries, productTotal, productConcentration, relativeSugar }
    );
  }

  function createTimeSeries(endTime, starchUnits, initialRate) {
    const steps = 24;
    const points = [];
    for (let index = 0; index <= steps; index += 1) {
      const time = endTime * index / steps;
      const productUnits = starchUnits > 0
        ? starchUnits * (1 - Math.exp(-initialRate * time / starchUnits))
        : 0;
      const amount = Math.max(0, Math.min(100, productUnits / 25 * 100));
      points.push({ time, amount, productTotal: productUnits });
    }
    return points;
  }

  function zeroResult(endTime, reason) {
    return Object.assign(resultValue(0, reason), {
      initialRate: 0,
      productTotal: 0,
      productConcentration: 0,
      relativeSugar: 0,
      timeSeries: [
        { time: 0, amount: 0, productTotal: 0 },
        { time: endTime, amount: 0, productTotal: 0 }
      ]
    });
  }

  function resultValue(detectionRelative, reason) {
    const scale = detectionRelative <= 5
      ? { color: "#3f86d9", label: "푸른색" }
      : detectionRelative <= 20
        ? { color: "#64a96b", label: "녹색" }
        : detectionRelative <= 40
          ? { color: "#e1c341", label: "노란색" }
          : detectionRelative <= 65
            ? { color: "#df8738", label: "주황색" }
            : { color: "#b94b38", label: "적갈색" };
    return {
      detectionRelative: roundForDisplay(detectionRelative),
      color: scale.color,
      colorLabel: scale.label,
      reason
    };
  }

  function roundForDisplay(value) {
    return Math.round(value * 100) / 100;
  }

  // 대표 조건 자동 점검: 화면 결과에는 표시하지 않고 개발자 콘솔에서 실패만 알립니다.
  function runModelSelfTests() {
    const base = (overrides = {}) => Object.assign(
      tube(2, 1, 1, 5, 100, 37, 7, 5),
      overrides
    );
    const result = (overrides) => calculateTubeResult(base(overrides));
    const tests = [
      ["온도 최적 경향", result({ temp: 37 }).productTotal > result({ temp: 0 }).productTotal && result({ temp: 37 }).productTotal > result({ temp: 80 }).productTotal],
      ["pH 최적 경향", result({ ph: 7 }).productTotal > result({ ph: 2 }).productTotal && result({ ph: 7 }).productTotal > result({ ph: 12 }).productTotal],
      ["효소 농도와 초기 속도", result({ enzymeConc: 25 }).initialRate < result({ enzymeConc: 50 }).initialRate && result({ enzymeConc: 50 }).initialRate < result({ enzymeConc: 100 }).initialRate],
      ["기질 농도 증가와 포화", substrateSaturationTest(result)],
      ["녹말 용액 양 증가", result({ starch: 1 }).productTotal <= result({ starch: 2 }).productTotal && result({ starch: 2 }).productTotal <= result({ starch: 4 }).productTotal],
      ["반응 시간 증가", result({ time: 1 }).productTotal < result({ time: 5 }).productTotal],
      ["기질 총량 상한", result({ time: 10 }).productTotal <= 2 * 5 + 1e-9],
      ["효소 또는 기질 없음", result({ enzyme: 0 }).productTotal === 0 && result({ starch: 0 }).productTotal === 0]
    ];
    tests.forEach(([name, passed]) => console.assert(passed, `교육용 반응 모델 점검 실패: ${name}`));
    return tests;
  }

  function substrateSaturationTest(result) {
    const low = result({ starchConc: 1 }).initialRate;
    const middle = result({ starchConc: 3 }).initialRate;
    const high = result({ starchConc: 5 }).initialRate;
    return low < middle && middle < high && (middle - low) > (high - middle);
  }

  function calculateExperimentResults(conditions) {
    const results = {};
    TUBE_KEYS.forEach((key) => {
      results[key] = calculateTubeResult(conditions[key]);
    });
    return results;
  }

  function renderBenedictResults() {
    const run = state.currentRun;
    const area = byId("benedictArea");
    const visible = run && ["testing", "tested"].includes(run.status);
    area.hidden = !visible;
    if (!visible) return;

    const testing = run.status === "testing";
    const tubes = byId("benedictTubes");
    tubes.replaceChildren();
    TUBE_KEYS.forEach((key) => {
      const result = run.results[key];
      const card = document.createElement("div");
      card.className = "test-result" + (testing ? " heating" : "");
      const color = testing ? "#3f86d9" : result.color;
      const flame = testing
        ? '<div class="heat-flame" role="img" aria-label="불꽃으로 가열 중"><i></i><i></i><i></i></div>'
        : "";
      card.innerHTML = `<b>${key}</b><div class="test-liquid" style="--result-color:${color}"></div>${flame}<strong>${testing ? "베네딕트 용액을 넣고 가열 중…" : result.colorLabel}</strong>${!testing && result.reason ? `<small>${result.reason}</small>` : ""}`;
      tubes.append(card);
    });

    const chart = byId("resultChart");
    chart.replaceChildren();
    if (!testing) renderLineChart(chart, run);
  }

  function renderLineChart(root, run, compact = false) {
    const width = 720;
    const height = compact ? 320 : 360;
    const plot = { left: 72, right: 690, top: 22, bottom: height - 55 };
    const maxTime = Math.max(...TUBE_KEYS.map((key) => run.conditions[key].time), 1);
    const graphSeries = {};
    TUBE_KEYS.forEach((key) => {
      graphSeries[key] = run.results[key].timeSeries || calculateTubeResult(run.conditions[key]).timeSeries;
    });
    const rawMaximum = Math.max(
      0,
      ...TUBE_KEYS.flatMap((key) => graphSeries[key].map((point) => point.amount))
    );
    const yAxis = createNiceAxis(rawMaximum);
    const svg = createSvgElement("svg", {
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": "반응 시간에 따른 녹말 분해로 생성된 당의 상대량"
    });
    svg.classList.add("line-chart-svg");

    for (let index = 0; index <= yAxis.tickCount; index += 1) {
      const value = yAxis.interval * index;
      const y = plot.bottom - (value / yAxis.maximum) * (plot.bottom - plot.top);
      createSvgElement("line", { x1: plot.left, y1: y, x2: plot.right, y2: y, class: "chart-grid" }, svg);
      const label = createSvgElement("text", { x: plot.left - 10, y: y + 5, "text-anchor": "end", class: "chart-label" }, svg);
      label.textContent = value;
    }

    for (let index = 0; index <= 4; index += 1) {
      const time = maxTime * index / 4;
      const x = plot.left + (index / 4) * (plot.right - plot.left);
      const label = createSvgElement("text", { x, y: plot.bottom + 23, "text-anchor": "middle", class: "chart-label" }, svg);
      label.textContent = formatGraphNumber(time);
    }

    createSvgElement("line", { x1: plot.left, y1: plot.top, x2: plot.left, y2: plot.bottom, class: "chart-axis" }, svg);
    createSvgElement("line", { x1: plot.left, y1: plot.bottom, x2: plot.right, y2: plot.bottom, class: "chart-axis" }, svg);

    const xTitle = createSvgElement("text", { x: (plot.left + plot.right) / 2, y: height - 10, "text-anchor": "middle", class: "chart-title" }, svg);
    xTitle.textContent = "반응 시간(분)";
    const yTitle = createSvgElement("text", { x: 18, y: (plot.top + plot.bottom) / 2, transform: `rotate(-90 18 ${(plot.top + plot.bottom) / 2})`, "text-anchor": "middle", class: "chart-title" }, svg);
    yTitle.textContent = "생성된 당의 상대량";

    TUBE_KEYS.forEach((key) => {
      const series = graphSeries[key];
      const points = series.map((point) => {
        const x = plot.left + (point.time / maxTime) * (plot.right - plot.left);
        const y = plot.bottom - (point.amount / yAxis.maximum) * (plot.bottom - plot.top);
        return `${x},${y}`;
      }).join(" ");
      createSvgElement("polyline", {
        points,
        fill: "none",
        stroke: GRAPH_COLORS[key],
        "stroke-width": compact ? 5 : 4,
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      }, svg);
    });

    const legend = document.createElement("div");
    legend.className = "line-legend";
    TUBE_KEYS.forEach((key) => {
      const item = document.createElement("span");
      const factor = run.factor || state.factor;
      const factorDescription = formatGraphFactor(factor, run.conditions[key]);
      item.innerHTML = `<i style="background:${GRAPH_COLORS[key]}"></i>시험관 ${key} (${factorDescription})`;
      legend.append(item);
    });
    root.append(svg, legend);
  }

  function createNiceAxis(rawMaximum) {
    if (!Number.isFinite(rawMaximum) || rawMaximum <= 0) {
      return { maximum: 1, interval: 0.2, tickCount: 5 };
    }

    const roughInterval = rawMaximum / 5;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughInterval)));
    const normalized = roughInterval / magnitude;
    const niceFactor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    const interval = niceFactor * magnitude;
    const tickCount = Math.max(1, Math.ceil(rawMaximum / interval));
    return { maximum: interval * tickCount, interval, tickCount };
  }

  function formatGraphFactor(factor, condition) {
    if (factor === "온도") return `온도 ${condition.temp}℃`;
    if (factor === "pH") return `pH ${condition.ph}`;
    if (factor === "효소 농도") return `아밀레이스 ${condition.enzymeConc}%`;
    return `녹말 ${condition.starchConc}%`;
  }

  function formatGraphNumber(value) {
    if (Number.isInteger(value)) return String(value);
    if (Math.abs(value) >= 1) return value.toFixed(1);
    if (Math.abs(value) >= 0.1) return value.toFixed(2);
    return value.toFixed(3);
  }

  function saveExperimentRecord() {
    const run = state.currentRun;
    if (!run || !run.results) return;
    const existing = state.experiments.find((record) => record.id === run.id);
    if (existing) return;

    const designCheck = evaluateExperimentDesign(run.factor || state.factor, run.conditions);
    state.experiments.push({
      id: run.id,
      completedAt: new Date().toISOString(),
      modelVersion: run.modelVersion || MODEL_VERSION,
      factor: run.factor || state.factor,
      hypothesis: run.hypothesis ?? state.hypothesis,
      variables: clone(run.variables || {
        independent: state.independent,
        controlled: state.controlled,
        dependent: state.dependent
      }),
      prediction: run.prediction,
      conditions: clone(run.conditions),
      results: clone(run.results),
      observation: state.observation,
      interpretation: state.interpretation,
      meetsMinimumDesign: designCheck.valid,
      designCheckType: designCheck.type,
      hintUsage: clone(state.hintUsage)
    });
  }

  function updateCurrentRecordAnswers() {
    if (!state.currentRun) return;
    const record = state.experiments.find((item) => item.id === state.currentRun.id);
    if (!record) return;
    record.observation = state.observation;
    record.interpretation = state.interpretation;
    saveState();
  }

  function renderResultScreen() {
    const run = state.currentRun;
    if (run) ensureTimeSeriesResults(run);
    const savedPrediction = run?.prediction ?? state.prediction;
    byId("resultPrediction").textContent = savedPrediction.trim() || "아직 예상 결과를 작성하지 않았습니다.";
    const root = byId("resultRoundSummary");
    root.replaceChildren();
    if (!run || !run.results) {
      root.textContent = "아직 확인한 실험 결과가 없습니다.";
      return;
    }

    const title = document.createElement("h2");
    title.textContent = "이번 실험 결과";
    root.append(title);

    const conditions = document.createElement("div");
    conditions.className = "result-condition-grid";
    TUBE_KEYS.forEach((key) => {
      const factor = run.factor || state.factor;
      const manipulatedValue = formatManipulatedValue(factor, run.conditions[key]);
      const item = document.createElement("div");
      item.innerHTML = `<b style="color:${GRAPH_COLORS[key]}">시험관 ${key}</b><span>${factor}: ${manipulatedValue}<br>반응 시간: ${run.conditions[key].time}분</span>`;
      conditions.append(item);
    });
    root.append(conditions);

    const chart = document.createElement("div");
    chart.className = "line-chart compact";
    renderLineChart(chart, run, true);
    root.append(chart);

    const modelNote = document.createElement("small");
    modelNote.textContent = "실제 측정값이 아니라 조건에 따른 경향을 비교하기 위한 교육용 시뮬레이션 결과입니다. 그래프의 세로축 범위는 실험 결과에 따라 자동 조정됩니다.";
    root.append(modelNote);

    const comparison = compareConditions(run.conditions, run.factor || state.factor);
    const note = document.createElement("p");
    note.className = "comparison-note";
    note.textContent = comparison;
    root.append(note);
  }

  function ensureTimeSeriesResults(run) {
    if (!run.results) return;
    const missingSeries = TUBE_KEYS.some((key) => !Array.isArray(run.results[key]?.timeSeries));
    if (!missingSeries) return;
    run.results = calculateExperimentResults(run.conditions);
    const record = state.experiments.find((item) => item.id === run.id);
    if (record) record.results = clone(run.results);
    saveState();
  }

  function formatManipulatedValue(factor, condition) {
    if (factor === "온도") return `${condition.temp}℃`;
    if (factor === "pH") return `pH ${condition.ph}`;
    if (factor === "효소 농도") return `${condition.enzymeConc}%`;
    return `${condition.starchConc}%`;
  }

  function compareConditions(conditions, factor) {
    const check = evaluateExperimentDesign(factor, conditions);
    if (check.valid) return `시험관 사이에서 달랐던 조건: ${factor}`;
    if (check.changedLabels.length === 0) {
      return "A·B·C의 주요 조건이 모두 같아 조건에 따른 차이를 비교하기 어렵습니다.";
    }
    if (check.changedLabels.length === 1) {
      return `시험관 사이에서 달랐던 조건: ${check.changedLabels[0]}`;
    }
    return `시험관 사이에서 여러 조건이 달랐습니다: ${check.changedLabels.join(", ")}. 결과 차이를 한 가지 요인만의 영향으로 판단하기 어렵습니다.`;
  }

  function repeatExperiment() {
    state.currentRun = null;
    state.prediction = "";
    state.observation = "";
    state.interpretation = "";
    byId("prediction").value = "";
    byId("observation").value = "";
    byId("interpretation").value = "";
    byId("finishGuidance").hidden = true;
    byId("finishHintText").replaceChildren();
    state.screen = "design";
    saveState();
    renderScreen();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function canFinishInquiry() {
    return getFinishStatus().complete;
  }

  function updateFinishButton() {
    byId("finishInquiry").disabled = false;
    if (canFinishInquiry()) byId("finishGuidance").hidden = true;
  }

  function evaluateExperimentDesign(factor, conditions) {
    if (!conditions || !TUBE_KEYS.every((key) => conditions[key])) {
      return { valid: false, type: "D", changedLabels: [] };
    }

    // 이번 탐구의 최소 요건에서는 A~C 모두 녹말과 아밀레이스를 포함해야 합니다.
    // 온도 0℃와 같은 환경 설정값은 용액 양 0 mL와 구분하여 이 검사에 사용하지 않습니다.
    const missingReactants = TUBE_KEYS.filter((key) => {
      return conditions[key].starch <= 0 || conditions[key].enzyme <= 0;
    });
    if (missingReactants.length > 0) {
      return { valid: false, type: "F", changedLabels: [], tubeKeys: missingReactants };
    }

    const factorKeys = {
      "온도": "temp",
      "pH": "ph",
      "효소 농도": "enzymeMixed",
      "기질(녹말) 농도": "starchMixed"
    };
    const selectedKey = factorKeys[factor];
    if (!selectedKey) {
      return { valid: false, type: "D", changedLabels: [] };
    }

    const derived = {};
    TUBE_KEYS.forEach((key) => {
      derived[key] = deriveComparisonConditions(conditions[key]);
    });
    const comparisonFields = [
      ["temp", "온도"],
      ["ph", "pH"],
      ["enzymeMixed", "혼합 후 아밀레이스 농도"],
      ["starchMixed", "혼합 후 녹말 농도"],
      ["total", "총부피"],
      ["time", "반응 시간"]
    ];
    const selectedVaries = distinctDerivedValues(derived, selectedKey).length >= 2;
    const changedControls = comparisonFields.filter(([key]) => {
      return key !== selectedKey && distinctDerivedValues(derived, key).length >= 2;
    }).map(([, label]) => label);

    if (!selectedVaries && changedControls.length > 0) {
      return {
        valid: false,
        type: changedControls.length === 1 ? "B" : "C",
        changedLabels: changedControls
      };
    }
    if (!selectedVaries) return { valid: false, type: "D", changedLabels: [] };
    if (changedControls.length > 0) return { valid: false, type: "C", changedLabels: changedControls };
    return { valid: true, type: null, changedLabels: [] };
  }

  function deriveComparisonConditions(item) {
    const total = totalVolume(item);
    return {
      temp: item.temp,
      ph: item.ph,
      enzymeMixed: total > 0 ? item.enzyme * item.enzymeConc / total : 0,
      starchMixed: total > 0 ? item.starch * item.starchConc / total : 0,
      total,
      time: item.time
    };
  }

  function distinctDerivedValues(derived, key) {
    return Array.from(new Set(TUBE_KEYS.map((tubeKey) => {
      return Math.round(derived[tubeKey][key] * 1000000) / 1000000;
    })));
  }

  function getFinishStatus() {
    return getFinishStatusForExperiments(state.experiments);
  }

  function getFinishStatusForExperiments(experiments) {
    if (experiments.length === 0) {
      return { complete: false, hints: [{ type: "A" }] };
    }

    const checked = experiments.map((record) => ({
      record,
      check: evaluateExperimentDesign(record.factor, record.conditions)
    }));
    const validExperiments = checked.filter((item) => item.check.valid);
    const interpretedValidExperiment = validExperiments.some((item) => {
      return Boolean((item.record.interpretation || "").trim());
    });

    if (interpretedValidExperiment) return { complete: true, hints: [] };
    if (validExperiments.length > 0) return { complete: false, hints: [{ type: "E" }] };

    const latest = checked[checked.length - 1];
    const hints = [{
      type: latest.check.type,
      factor: latest.record.factor,
      changedLabels: latest.check.changedLabels,
      tubeKeys: latest.check.tubeKeys
    }];
    if (!(latest.record.interpretation || "").trim()) hints.push({ type: "E" });
    return { complete: false, hints };
  }

  // 최소 탐구 요건 대표 사례 자동 점검. 학생 기록은 변경하지 않습니다.
  function runInquirySelfTests() {
    const controlledTemperature = {
      A: tube(2, 1, 1, 5, 100, 0, 7, 5),
      B: tube(2, 1, 1, 5, 100, 37, 7, 5),
      C: tube(2, 1, 1, 5, 100, 80, 7, 5)
    };
    const wrongTemperature = {
      A: tube(2, 1, 1, 5, 100, 37, 2, 5),
      B: tube(2, 1, 1, 5, 100, 37, 7, 5),
      C: tube(2, 1, 1, 5, 100, 37, 12, 5)
    };
    const controlledEnzyme = {
      A: tube(2, 1, 1, 5, 25, 37, 7, 5),
      B: tube(2, 1, 1, 5, 50, 37, 7, 5),
      C: tube(2, 1, 1, 5, 100, 37, 7, 5)
    };
    const enzymeNegativeControl = {
      A: tube(2, 0, 2, 5, 100, 37, 7, 5),
      B: tube(2, 1, 1, 5, 100, 37, 7, 5),
      C: tube(2, 2, 0, 5, 100, 37, 7, 5)
    };
    const validColdTemperature = {
      A: tube(2, 1, 1, 5, 100, 0, 7, 5),
      B: tube(2, 1, 1, 5, 100, 20, 7, 5),
      C: tube(2, 1, 1, 5, 100, 37, 7, 5)
    };
    const validRecord = { factor: "온도", conditions: controlledTemperature, interpretation: "결과를 해석함" };
    const invalidRecord = { factor: "온도", conditions: wrongTemperature, interpretation: "결과를 해석함" };
    const tests = [
      ["타당한 실험 1회와 해석", getFinishStatusForExperiments([validRecord]).complete],
      ["잘못된 실험 3회와 타당한 실험 1회", getFinishStatusForExperiments([invalidRecord, invalidRecord, invalidRecord, validRecord]).complete],
      ["온도 선택 후 pH만 변경", !evaluateExperimentDesign("온도", wrongTemperature).valid],
      ["생성물 양과 무관한 효소 농도 설계", evaluateExperimentDesign("효소 농도", controlledEnzyme).valid],
      ["음성 대조군은 최소 요건에서 제외", !evaluateExperimentDesign("효소 농도", enzymeNegativeControl).valid],
      ["온도 0℃는 유효한 설정", evaluateExperimentDesign("온도", validColdTemperature).valid],
      ["가설 내용과 무관한 판정", getFinishStatusForExperiments([{ ...validRecord, hypothesis: "실제 결과와 다른 가설" }]).complete],
      ["힌트 요청 전 상세 내용 숨김", byId("finishGuidance").hidden && byId("finishHintText").textContent === ""]
    ];
    tests.forEach(([name, passed]) => console.assert(passed, `최소 탐구 요건 점검 실패: ${name}`));
    return tests;
  }

  function showFinishGuidance() {
    byId("finishGuidance").hidden = false;
    byId("finishHintText").replaceChildren();
  }

  function showFinishHint() {
    const status = getFinishStatus();
    if (status.complete) {
      byId("finishGuidance").hidden = true;
      return;
    }

    const root = byId("finishHintText");
    root.replaceChildren();
    status.hints.forEach((hint) => {
      const message = document.createElement("p");
      message.className = "finish-hint-message";
      message.textContent = finishHintMessage(hint);
      root.append(message);
    });

    const request = {
      requestedAt: new Date().toISOString(),
      experimentCount: state.experiments.length,
      types: status.hints.map((hint) => hint.type)
    };
    state.finishHintUsage.used = true;
    state.finishHintUsage.count += 1;
    state.finishHintUsage.requests.push(request);
    saveState();
  }

  function finishHintMessage(hint) {
    if (hint.type === "A") {
      return "아직 실험을 완료하지 않았어요. 실험을 최소 1회 진행해 보세요.";
    }
    if (hint.type === "B") {
      return `탐구하려는 조작변인은 ${hint.factor}인데, 실제 실험에서는 ${hint.changedLabels.join(", ")}이(가) 달라졌어요. 자신의 가설을 확인할 수 있는 실험인지 생각해 보세요.`;
    }
    if (hint.type === "C") {
      return `시험관 사이에서 여러 조건이 달랐습니다: ${hint.changedLabels.join(", ")}. 이 결과만으로는 한 가지 요인의 영향을 판단하기 어렵습니다.`;
    }
    if (hint.type === "D") {
      return "세 시험관에서 탐구하려는 조작변인의 값이 모두 같아요. 어떤 조건을 비교해야 가설을 확인할 수 있을까요?";
    }
    if (hint.type === "F") {
      return `이번 탐구에서는 A·B·C 시험관에 모두 녹말과 아밀레이스가 포함되어야 해요. ${hint.tubeKeys?.join(", ") || "일부"} 시험관의 용액 구성을 다시 살펴보세요.`;
    }
    return "실험 결과를 바탕으로 자신의 가설을 판단하고, 그 이유를 작성해 보세요.";
  }

  function renderExperimentHistory() {
    const root = byId("experimentHistory");
    root.replaceChildren();
    const heading = document.createElement("h2");
    heading.textContent = `누적 실험 기록 (${state.experiments.length}회)`;
    root.append(heading);

    if (state.experiments.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "아직 완료한 실험이 없습니다.";
      root.append(empty);
      return;
    }

    state.experiments.forEach((record, index) => {
      const details = document.createElement("details");
      details.className = "history-round";
      if (index === state.experiments.length - 1) details.open = true;
      const summary = document.createElement("summary");
      summary.textContent = `${index + 1}회 실험 · ${record.factor}`;
      const hypothesis = document.createElement("p");
      hypothesis.textContent = `가설: ${record.hypothesis || "작성하지 않음"}`;
      const prediction = document.createElement("p");
      prediction.textContent = `예상: ${record.prediction || "작성하지 않음"}`;
      const result = document.createElement("p");
      result.textContent = TUBE_KEYS.map((key) => `${key} 상대량 ${roundForDisplay(record.results[key].relativeSugar)}`).join(" · ");
      const model = document.createElement("small");
      model.textContent = record.modelVersion === MODEL_VERSION
        ? `교육용 반응 모델 v${MODEL_VERSION}`
        : `이전 교육용 반응 모델 v${record.modelVersion || 1}로 계산된 기록`;
      const conditionTable = createHistoryConditionTable(record.conditions);
      details.append(summary, hypothesis, prediction, result, model, conditionTable);
      root.append(details);
    });
  }

  function createHistoryConditionTable(conditions) {
    const wrapper = document.createElement("div");
    wrapper.className = "table-scroll";
    const table = document.createElement("table");
    table.className = "history-table";
    table.innerHTML = "<tr><th>시험관</th><th>녹말</th><th>아밀레이스</th><th>증류수</th><th>온도</th><th>pH</th><th>시간</th></tr>";
    TUBE_KEYS.forEach((key) => {
      const item = conditions[key];
      const row = document.createElement("tr");
      [key, `${item.starch} mL·${item.starchConc}%`, `${item.enzyme} mL·${item.enzymeConc}%`, `${item.water} mL`, `${item.temp}℃`, item.ph, `${item.time}분`].forEach((value, index) => {
        const cell = document.createElement(index === 0 ? "th" : "td");
        cell.textContent = value;
        row.append(cell);
      });
      table.append(row);
    });
    wrapper.append(table);
    return wrapper;
  }

  // ---------- Google Sheets 전송 (교육용 실험 모델과 독립) ----------
  // 브라우저에서 Google Apps Script로 POST한 뒤, 별도 읽기 전용 확인 요청으로
  // 실제 시트 저장 여부를 검증합니다. 불투명(no-cors) 응답만으로 성공 처리하지 않습니다.
  function submissionEndpoint() {
    const url = String(window.ENZYME_LAB_CONFIG?.sheetsWebAppUrl || "").trim();
    return /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url) ? url : "";
  }

  function createSubmissionId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    if (!window.crypto?.getRandomValues) {
      throw new Error("이 브라우저에서는 안전한 제출 ID를 만들 수 없습니다. Chrome을 이용해 주세요.");
    }
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  }

  function buildSubmissionPayload(id) {
    const experiments = clone(state.experiments);
    // 원본 기록 자체를 보존합니다. 시험관 그래프는 시계열 전체를 포함합니다.
    return {
      schemaVersion: SUBMISSION_SCHEMA_VERSION,
      submissionId: id,
      clientCreatedAt: new Date().toISOString(),
      classCode: state.classCode,
      studentNumber: String(state.studentNumber || "").trim(),
      studentName: String(state.studentName || "").trim(),
      factor: state.factor,
      hypothesis: state.hypothesis,
      variables: {
        independent: state.independent,
        controlled: state.controlled,
        dependent: state.dependent
      },
      conclusion: state.conclusion,
      hintUsage: clone(state.hintUsage),
      hintEvents: clone(state.hintEvents),
      finishHintUsage: clone(state.finishHintUsage),
      experiments
    };
  }

  function renderSubmissionStatus() {
    const button = byId("submitInquiry");
    const status = byId("submissionStatus");
    if (!button || !status) return;
    const submitted = Boolean(state.submission?.confirmedAt);
    button.disabled = submitted || submissionInProgress || !submissionEndpoint();
    button.textContent = submitted ? "제출 완료" : submissionInProgress ? "제출 확인 중…" : "최종 제출";
    status.className = "submit-status";

    if (submitted) {
      status.classList.add("submit-success");
      status.textContent = `제출 완료 (${new Date(state.submission.confirmedAt).toLocaleString("ko-KR")}). 저장된 내용을 다시 제출하지 않습니다.`;
    } else if (!submissionEndpoint()) {
      status.textContent = "교사가 Google Sheets 연결 주소를 설정하면 제출할 수 있습니다. 탐구 기록은 이 기기에 계속 저장됩니다.";
    } else if (submissionInProgress) {
      status.textContent = "Google Sheets에 실제로 저장되었는지 확인 중입니다. 잠시 기다려 주세요.";
    } else if (state.submission?.payload) {
      status.classList.add("submit-warning");
      status.textContent = "제출이 확인되지 않았습니다. ‘최종 제출’을 다시 눌러 같은 기록을 재전송해 주세요. 처음 제출을 시도할 때의 기록이 유지됩니다.";
    } else {
      status.textContent = "최종 결론을 작성한 뒤 제출해 주세요. 제출 실패 시에도 이 기기에 기록이 남습니다.";
    }
  }

  function validateSubmissionBeforeSend() {
    if (!canFinishInquiry()) return "탐구 종료 요건을 먼저 충족해 주세요.";
    if (!String(state.conclusion || "").trim()) return "최종 결론을 작성해 주세요.";
    if (!String(state.studentNumber || "").trim() || !String(state.studentName || "").trim()) {
      return "실험실 입장 화면에서 학번과 이름을 입력해 주세요.";
    }
    return "";
  }

  async function submitInquiry() {
    if (submissionInProgress || state.submission?.confirmedAt) return;
    const endpoint = submissionEndpoint();
    if (!endpoint) { alert("아직 교사용 Google Sheets 연결이 설정되지 않았습니다."); return; }
    const issue = validateSubmissionBeforeSend();
    if (issue) { alert(issue); return; }

    try {
      // 실패/재시도 시 동일한 제출 ID 및 원본 스냅샷을 사용합니다.
      // Apps Script 서버가 ID를 기준으로 중복 기록을 차단합니다.
      if (!state.submission?.payload) {
        const id = createSubmissionId();
        state.submission = { id, payload: buildSubmissionPayload(id), confirmedAt: null };
        saveState();
      }
      submissionInProgress = true;
      renderSubmissionStatus();
      const payload = state.submission.payload;
      try {
        // text/plain은 CORS 사전요청(preflight) 없이 전달할 수 있습니다.
        // no-cors 결과는 성공 여부를 알려주지 않으므로 아래 확인 과정이 필수입니다.
        await fetch(endpoint, {
          method: "POST",
          mode: "no-cors",
          cache: "no-store",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });
      } catch (networkError) {
        // POST 응답 처리/리디렉션 실패가 실제 저장 실패를 뜻하지 않을 수 있습니다.
        console.warn("제출 POST 응답 확인 불가. 저장 상태를 별도로 확인합니다.", networkError);
      }

      let verified = false;
      for (let attempt = 0; attempt < 10; attempt += 1) {
        if (attempt > 0) await waitForSubmission(1700);
        try {
          const reply = await checkSubmissionReceipt(endpoint, payload.submissionId);
          if (reply?.saved === true && reply?.submissionId === payload.submissionId) {
            verified = true;
            break;
          }
        } catch (error) {
          console.warn("Google Sheets 저장 확인 재시도", error);
        }
      }
      if (!verified) throw new Error("서버의 실제 저장 확인을 받지 못했습니다.");
      state.submission.confirmedAt = new Date().toISOString();
      saveState();
      alert("Google Sheets에 탐구 기록이 저장되었습니다. 제출 완료!");
    } catch (error) {
      console.error("제출 확인 실패", error);
      alert("제출 완료를 확인하지 못했습니다. 기록은 기기에 보존되어 있으니 인터넷 연결을 확인한 후 다시 제출해 주세요.");
    } finally {
      submissionInProgress = false;
      renderSubmissionStatus();
    }
  }

  function waitForSubmission(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  function checkSubmissionReceipt(endpoint, submissionId) {
    // Apps Script ContentService의 JSONP 읽기 전용 영수증 확인.
    // 외부에 공개되는 값은 임의 제출 ID와 저장 유무뿐입니다(개인정보 없음).
    return new Promise((resolve, reject) => {
      const callbackName = "__enzymeReceipt_" + createSubmissionId().replace(/-/g, "");
      const tag = document.createElement("script");
      const timeout = window.setTimeout(() => finish(new Error("저장 확인 시간 초과")), 6000);
      let finished = false;
      function finish(error, data) {
        if (finished) return;
        finished = true;
        window.clearTimeout(timeout);
        delete window[callbackName];
        tag.remove();
        if (error) reject(error);
        else resolve(data);
      }
      window[callbackName] = (data) => finish(null, data);
      tag.onerror = () => finish(new Error("저장 확인 서버 연결 실패"));
      tag.src = `${endpoint}?action=status&id=${encodeURIComponent(submissionId)}&callback=${callbackName}&_=${Date.now()}`;
      document.head.append(tag);
    });
  }

  function createTubeSvg(item, uniqueKey, mixed = false, displayKey = uniqueKey) {
    const svg = createSvgElement("svg", {
      viewBox: "0 0 154 324",
      role: "img",
      "aria-label": `${displayKey} 시험관, 총 ${formatNumber(totalVolume(item))}밀리리터`
    });
    svg.classList.add("tube-svg");

    const definitions = createSvgElement("defs", {}, svg);
    const clipPath = createSvgElement("clipPath", { id: `tube-clip-${uniqueKey}` }, definitions);
    createSvgElement("path", { d: "M47 22 L107 22 L107 260 A30 30 0 0 1 47 260 Z" }, clipPath);

    const liquids = createSvgElement("g", { "clip-path": `url(#tube-clip-${uniqueKey})` }, svg);
    let bottom = 291;

    const liquidLayers = mixed
      ? [{ key: "mixed", volume: totalVolume(item), color: "#a9b6cf" }]
      : [
          { key: "starch", volume: item.starch, color: LIQUIDS.starch.color, opacity: concentrationOpacity(item.starchConc, OPTIONS.starchConcentration) },
          { key: "enzyme", volume: item.enzyme, color: LIQUIDS.enzyme.color, opacity: concentrationOpacity(item.enzymeConc, OPTIONS.enzymeConcentration) },
          { key: "water", volume: item.water, color: LIQUIDS.water.color, opacity: 1 }
        ];

    liquidLayers.forEach((liquid) => {
      const height = liquid.volume * 27;
      const y = bottom - height;

      if (height > 0) {
        createSvgElement("rect", {
          x: 42,
          y,
          width: 71,
          height,
          fill: liquid.color,
          "fill-opacity": liquid.opacity ?? 1
        }, liquids);
      }
      bottom = y;
    });

    for (let volume = 2; volume <= 8; volume += 2) {
      const y = 291 - volume * 27;
      createSvgElement("line", {
        x1: 25,
        y1: y,
        x2: 39,
        y2: y,
        stroke: "#8296a7",
        "stroke-width": 2
      }, svg);

      const label = createSvgElement("text", {
        x: 21,
        y: y + 4,
        "text-anchor": "end",
        "font-size": 12,
        fill: "#71889a"
      }, svg);
      label.textContent = volume;
    }

    createSvgElement("path", {
      d: "M43 18 L43 260 A34 34 0 0 0 111 260 L111 18",
      fill: "none",
      stroke: "#7d9bb0",
      "stroke-width": 5
    }, svg);
    createSvgElement("line", {
      x1: 37,
      y1: 18,
      x2: 117,
      y2: 18,
      stroke: "#7895aa",
      "stroke-width": 6
    }, svg);

    return svg;
  }

  function concentrationOpacity(value, values) {
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    if (maximum === minimum) return 1;
    return 0.45 + 0.55 * ((value - minimum) / (maximum - minimum));
  }

  function createSvgElement(tag, attributes = {}, parent) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attributes).forEach(([name, value]) => {
      element.setAttribute(name, String(value));
    });
    if (parent) {
      parent.append(element);
    }
    return element;
  }

  function totalVolume(item) {
    return item.starch + item.enzyme + item.water;
  }

  function formatNumber(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  function renderSummary() {
    const root = byId("summary");
    const items = [
      ["탐구 요인", state.factor],
      ["가설", state.hypothesis || "아직 작성하지 않음"],
      ["예상한 실험 결과", state.prediction || "아직 작성하지 않음"],
      ["결과 해석", state.interpretation || "아직 작성하지 않음"]
    ];

    root.replaceChildren();
    items.forEach(([title, answer]) => {
      const box = document.createElement("div");
      const heading = document.createElement("b");
      const text = document.createElement("span");
      heading.textContent = title;
      text.textContent = answer;
      box.append(heading, text);
      root.append(box);
    });
  }
})();
