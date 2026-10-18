/*
 * Collection of Problems — shared engine for the physics & mathematics problem pages.
 *
 * Collection page:  <body data-page="index" data-subject="physics|math">
 *                   + <script type="application/json" id="grades"> {...} </script>
 * Grade page:       <body data-page="grade" data-subject="physics|math" data-grade="VII">
 *                   + <script type="text/x-problems" id="problems"> ... </script>
 *
 * Problem text format (one directive or field per line, blank lines and // comments ignored):
 *
 *   # topic <id> | <weeks> | <Georgian title> | <English title>
 *   # note <Georgian footer note> | <English footer note>
 *   --- easy|medium|hard <topicId> [olympiad]
 *   KA:  question (Georgian)          EN:  question (English)
 *   HKA: hint (Georgian)              HEN: hint (English)
 *   SKA: solution steps, one per line (Georgian)
 *   SEN: solution steps, one per line (English)
 *   AKA: final answer (Georgian)      AEN: final answer (English)
 *
 * A line without a key continues the previous field (a new step for SKA/SEN, a new line otherwise).
 * Math goes between $...$ (inline) or $$...$$ (display) and is rendered with KaTeX; **text** is bold.
 *
 * Extra sections on a collection page: <script type="application/json" id="sections"> [...] </script>
 *
 * Test list page:   <body data-page="tests" data-subject="math">
 *                   + <script type="application/json" id="tests"> [...] </script>
 * Test page:        <body data-page="test" data-subject="math">
 *                   + <script type="text/x-problems" id="problems"> ... </script>
 *
 * Test text format (same fields as above, plus):
 *
 *   # title <Georgian title> | <English title>
 *   # sub <Georgian subtitle> | <English subtitle>
 *   # source <link to the original paper>
 *   # time <minutes>
 *   --- <points>                      starts the next problem (numbered in order)
 *   O:   options, one per line        OKA: / OEN: language-specific options
 *   C:   number of the correct option (1–4); problems without options are open-ended
 *   FIG: inline <svg> figure (may continue over several lines)
 */
(function () {
  "use strict";

  var UI = {
    ka: {
      site: "Hello Physics",
      physics: "ფიზიკა", math: "მათემატიკა",
      collection: { physics: "ფიზიკის ამოცანების კრებული", math: "მათემატიკის ამოცანების კრებული" },
      collectionSub: {
        physics: "ამოცანები ეროვნული სასწავლო გეგმის მიხედვით, VII–XII კლასები. აირჩიეთ კლასი.",
        math: "ამოცანები ეროვნული სასწავლო გეგმის მიხედვით, VII–XII კლასები. აირჩიეთ კლასი."
      },
      gradeWord: "კლასი",
      gradeTitle: function (g, s) { return s + " · " + g + " კლასი"; },
      gradeSub: "მთელი სასწავლო წლის თემები: მარტივი, საშუალო და რთული ამოცანები. რთული დონის ბოლო 30 ამოცანა ოლიმპიურია.",
      soon: "მალე",
      problemsN: function (n) { return n + " ამოცანა"; },
      topicsN: function (n) { return n + " თემა"; },
      oly: "ოლიმპიური",
      levels: { easy: "მარტივი", medium: "საშუალო", hard: "რთული" },
      topicLabel: "თემა:",
      allTopics: "ყველა თემა",
      weeks: "კვირა",
      hint: "მინიშნება", solution: "ამოხსნა", answer: "პასუხი",
      showHint: "💡 მინიშნება", hideHint: "💡 მინიშნების დამალვა",
      showSol: "✅ ამოხსნა", hideSol: "✅ ამოხსნის დამალვა",
      empty: "ამ თემაზე ამ დონის ამოცანა ჯერ არ არის. აირჩიეთ სხვა თემა ან დონე.",
      olyDivider: "🏆 ოლიმპიური ამოცანები",
      otherCollection: { physics: "მათემატიკის ამოცანების კრებული →", math: "ფიზიკის ამოცანების კრებული →" },
      notes: "შენიშვნა",
      tests: "ეროვნული გამოცდების ტესტები",
      testsSub: "ერთიანი ეროვნული გამოცდების ტესტები მათემატიკაში: წინა წლების ტესტები და მათი მსგავსი სავარჯიშო ტესტები — პასუხებითა და ამოხსნებით.",
      testWord: "ტესტი",
      original: "გამოცდის ტესტი", practice: "სავარჯიშო ტესტი",
      pointsN: function (n) { return n + " ქულა"; },
      minutesN: function (n) { return n >= 60 && n % 60 === 0 ? n / 60 + " საათი" : n + " წუთი"; },
      sourcePdf: "📄 ორიგინალი ტესტი (PDF)",
      open: "ღია დავალება — ჩაწერეთ ამოხსნის სრული გზა, შემდეგ შეადარეთ ამოხსნას.",
      check: "✔ შემოწმება", reset: "↺ თავიდან", resetAsk: "წაიშალოს ყველა პასუხი?",
      timerStart: "⏱ დაწყება", timerStop: "⏸ შეჩერება",
      closedPart: "დახურული დავალებები", openPart: "ღია დავალებები (თვითშეფასება)", total: "სულ",
      selfScore: "თქვენი ქულა:",
      answered: function (a, n) { return "პასუხი გაცემულია: " + a + " / " + n; },
      backToTests: "← ყველა ტესტი"
    },
    en: {
      site: "Hello Physics",
      physics: "Physics", math: "Mathematics",
      collection: { physics: "Collection of Physics Problems", math: "Collection of Mathematics Problems" },
      collectionSub: {
        physics: "Problems following the Georgian National Curriculum, grades VII–XII. Choose a grade.",
        math: "Problems following the Georgian National Curriculum, grades VII–XII. Choose a grade."
      },
      gradeWord: "Grade",
      gradeTitle: function (g, s) { return s + " · Grade " + g; },
      gradeSub: "Topics of the whole school year: easy, medium and hard problems. The last 30 hard problems are olympiad-style.",
      soon: "coming soon",
      problemsN: function (n) { return n + " problems"; },
      topicsN: function (n) { return n + " topics"; },
      oly: "Olympiad",
      levels: { easy: "Easy", medium: "Medium", hard: "Hard" },
      topicLabel: "Topic:",
      allTopics: "All topics",
      weeks: "weeks",
      hint: "Hint", solution: "Solution", answer: "Answer",
      showHint: "💡 Hint", hideHint: "💡 Hide hint",
      showSol: "✅ Solution", hideSol: "✅ Hide solution",
      empty: "No problems of this level on this topic yet. Pick another topic or level.",
      olyDivider: "🏆 Olympiad problems",
      otherCollection: { physics: "Collection of Mathematics Problems →", math: "Collection of Physics Problems →" },
      notes: "Note",
      tests: "National Exam Tests",
      testsSub: "Unified National Exam tests in mathematics: papers from past years and similar practice tests, with answers and solutions.",
      testWord: "Test",
      original: "Exam paper", practice: "Practice test",
      pointsN: function (n) { return n + (n === 1 ? " point" : " points"); },
      minutesN: function (n) { return n >= 60 && n % 60 === 0 ? n / 60 + (n === 60 ? " hour" : " hours") : n + " minutes"; },
      sourcePdf: "📄 Original paper (PDF)",
      open: "Open-ended task: write out the full solution, then compare it with ours.",
      check: "✔ Check", reset: "↺ Start over", resetAsk: "Clear all answers?",
      timerStart: "⏱ Start", timerStop: "⏸ Pause",
      closedPart: "Multiple-choice tasks", openPart: "Open-ended tasks (self-marked)", total: "Total",
      selfScore: "Your points:",
      answered: function (a, n) { return "Answered: " + a + " / " + n; },
      backToTests: "← All tests"
    }
  };
  var GRADES = ["VII", "VIII", "IX", "X", "XI", "XII"];
  var LEVELS = ["easy", "medium", "hard"];
  var ICON = { physics: "⚛️", math: "📐" };

  /* ---------- language ---------- */
  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, val);
    } catch (e) { /* storage unavailable (private mode, file://) */ }
    return null;
  }
  function initialLang() {
    var m = /[?&]lang=(ka|en)\b/.exec(window.location.search);
    if (m) return m[1];
    var saved = store("hp-lang");
    return saved === "en" || saved === "ka" ? saved : "ka";
  }
  var lang = initialLang();
  function t() { return UI[lang]; }

  /* ---------- rich text: $math$, $$math$$, **bold**, newlines ---------- */
  function esc(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function tex(src, el, display) {
    if (window.katex) {
      try {
        window.katex.render(src, el, { throwOnError: false, displayMode: display, strict: false });
        return;
      } catch (e) { /* fall through to plain text */ }
    }
    el.textContent = src;
  }
  function rich(el, text) {
    el.innerHTML = "";
    text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g).forEach(function (p) {
      if (!p) return;
      var node;
      if (p.slice(0, 2) === "$$") {
        node = document.createElement("div");
        node.className = "math-display";
        tex(p.slice(2, -2), node, true);
      } else if (p.charAt(0) === "$") {
        node = document.createElement("span");
        tex(p.slice(1, -1), node, false);
      } else {
        node = document.createElement("span");
        node.innerHTML = esc(p).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
      }
      el.appendChild(node);
    });
    return el;
  }
  function h(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }

  /* ---------- parser ---------- */
  var FIELD = /^(KA|EN|HKA|HEN|SKA|SEN|AKA|AEN)\s*:\s?(.*)$/;
  var FIELD_NAMES = { KA: "q.ka", EN: "q.en", HKA: "h.ka", HEN: "h.en", SKA: "s.ka", SEN: "s.en", AKA: "a.ka", AEN: "a.en" };

  function parse(text) {
    var topics = [], notes = [], problems = [], cur = null, field = null;
    text.split(/\r?\n/).forEach(function (raw, i) {
      var line = raw.trim();
      if (!line || line.slice(0, 2) === "//") return;
      var m;
      if ((m = /^#\s*topic\s+(\S+)\s*\|(.*)$/.exec(line))) {
        var parts = m[2].split("|").map(function (s) { return s.trim(); });
        topics.push({ id: m[1], weeks: parts[0], ka: parts[1], en: parts[2] || parts[1] });
        return;
      }
      if ((m = /^#\s*note\s+(.*)$/.exec(line))) {
        var np = m[1].split("|").map(function (s) { return s.trim(); });
        notes.push({ ka: np[0], en: np[1] || np[0] });
        return;
      }
      if ((m = /^-{3,}\s*(easy|medium|hard)\s+(\S+)(\s+olympiad)?\s*$/i.exec(line))) {
        cur = {
          level: m[1].toLowerCase(), topic: m[2], oly: !!m[3],
          q: { ka: "", en: "" }, h: { ka: "", en: "" }, s: { ka: [], en: [] }, a: { ka: "", en: "" }
        };
        problems.push(cur);
        field = null;
        return;
      }
      if (!cur) { console.warn("problems: line " + (i + 1) + " is outside a problem:", line); return; }
      if ((m = FIELD.exec(line))) {
        field = FIELD_NAMES[m[1]];
        line = m[2].trim();
        if (!line) return;
      }
      if (!field) { console.warn("problems: line " + (i + 1) + " has no field:", line); return; }
      var k = field.split("."), slot = cur[k[0]];
      if (k[0] === "s") slot[k[1]].push(line);
      else slot[k[1]] = slot[k[1]] ? slot[k[1]] + "\n" + line : line;
    });
    // Show problems in curriculum order (topic declaration order), olympiad problems last,
    // so new problems can simply be appended to the end of a page. Then number them per level.
    var topicIndex = {};
    topics.forEach(function (tp, i) { topicIndex[tp.id] = i; });
    problems.forEach(function (p, i) { p.order = i; });
    problems.sort(function (a, b) {
      return (a.oly - b.oly) ||
        ((topicIndex[a.topic] || 0) - (topicIndex[b.topic] || 0)) ||
        (a.order - b.order);
    });
    var counters = { easy: 0, medium: 0, hard: 0 };
    problems.forEach(function (p) {
      p.no = ++counters[p.level];
      p.id = p.level + "-" + p.no;
    });
    return { topics: topics, notes: notes, problems: problems };
  }

  /* ---------- shared chrome ---------- */
  function langSwitch(onChange) {
    var box = h("div", "lang");
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", "Language");
    [["ka", "ქარ"], ["en", "EN"]].forEach(function (pair) {
      var b = h("button", pair[0] === lang ? "on" : "", pair[1]);
      b.type = "button";
      b.setAttribute("aria-pressed", pair[0] === lang ? "true" : "false");
      b.onclick = function () {
        if (lang === pair[0]) return;
        lang = pair[0];
        store("hp-lang", lang);
        onChange();
      };
      box.appendChild(b);
    });
    return box;
  }
  function crumbs(items) {
    var nav = h("nav", "crumbs");
    items.forEach(function (it, i) {
      if (i) nav.appendChild(h("span", "", "›"));
      if (it.href) {
        var a = h("a", "", it.text);
        a.href = it.href;
        nav.appendChild(a);
      } else nav.appendChild(h("span", "", it.text));
    });
    return nav;
  }
  function topbar(items, rerender) {
    var bar = h("div", "topbar");
    bar.appendChild(crumbs(items));
    bar.appendChild(langSwitch(rerender));
    return bar;
  }
  function hero(subject, title, sub, stats) {
    var box = h("header", "hero");
    box.appendChild(h("div", "icon", ICON[subject]));
    box.appendChild(h("h1", "", title));
    box.appendChild(h("p", "", sub));
    if (stats && stats.length) {
      var row = h("div", "stats");
      stats.forEach(function (s) { row.appendChild(h("span", "stat", s)); });
      box.appendChild(row);
    }
    return box;
  }
  function setDocLang(title) {
    document.documentElement.lang = lang;
    document.title = title;
  }

  /* ---------- collection (index) page ---------- */
  function renderIndex(app, subject) {
    var cfg = JSON.parse(document.getElementById("grades").textContent);
    var secEl = document.getElementById("sections");
    var sections = secEl ? JSON.parse(secEl.textContent) : [];
    function draw() {
      var L = t();
      setDocLang(L.collection[subject]);
      app.innerHTML = "";
      var wrap = h("div", "wrap");
      wrap.appendChild(topbar([{ text: L.site, href: "../../" }, { text: L.collection[subject] }], draw));
      wrap.appendChild(hero(subject, L.collection[subject], L.collectionSub[subject]));
      var grid = h("div", "grades");
      GRADES.forEach(function (g) {
        var info = cfg[g];
        var card = h(info ? "a" : "div", "grade" + (info ? "" : " off"));
        if (info) card.href = g + ".html";
        card.appendChild(h("div", "num", g));
        var lbl = h("div", "lbl", lang === "ka" ? g + " " + L.gradeWord : L.gradeWord + " " + g);
        if (!info) lbl.appendChild(h("span", "pill", L.soon));
        card.appendChild(lbl);
        if (info) card.appendChild(h("div", "desc", info[lang] || info.en));
        grid.appendChild(card);
      });
      wrap.appendChild(grid);
      sections.forEach(function (sec) {
        wrap.appendChild(h("h2", "section-title", sec.title[lang] || sec.title.en));
        if (sec.sub) wrap.appendChild(h("p", "section-sub", sec.sub[lang] || sec.sub.en));
        var sg = h("div", "grades");
        sec.items.forEach(function (it) {
          var c = h("a", "grade feature");
          c.href = it.href;
          c.appendChild(h("div", "num", it.num));
          c.appendChild(h("div", "lbl", it.lbl[lang] || it.lbl.en));
          c.appendChild(h("div", "desc", it.desc[lang] || it.desc.en));
          sg.appendChild(c);
        });
        wrap.appendChild(sg);
      });
      var other = h("p", "other");
      var a = h("a", "", L.otherCollection[subject]);
      a.href = subject === "physics" ? "../math/" : "../physics/";
      other.appendChild(a);
      wrap.appendChild(other);
      app.appendChild(wrap);
    }
    draw();
  }

  /* ---------- grade page ---------- */
  function renderGrade(app, subject, grade) {
    var data = parse(document.getElementById("problems").textContent);
    var topicById = {};
    data.topics.forEach(function (tp) { topicById[tp.id] = tp; });
    data.problems.forEach(function (p) {
      if (!topicById[p.topic]) console.warn("problems: unknown topic '" + p.topic + "' in " + p.id);
    });

    var hashLevel = window.location.hash.replace("#", "");
    var state = { level: LEVELS.indexOf(hashLevel) >= 0 ? hashLevel : "easy", topic: "all", open: {} };

    function pick(obj) { return obj[lang] || obj.en || obj.ka || ""; }

    function card(p) {
      var L = t();
      var c = h("article", "card" + (p.oly ? " oly" : ""));
      c.id = p.id;
      var body = h("div", "body");
      var meta = h("div", "meta");
      meta.appendChild(h("span", "no", "№ " + p.no));
      var tp = topicById[p.topic];
      if (tp) meta.appendChild(h("span", "chip", pick(tp)));
      if (p.oly) meta.appendChild(h("span", "badge-oly", "🏆 " + L.oly));
      body.appendChild(meta);
      body.appendChild(rich(h("div", "q"), pick(p.q)));

      var actions = h("div", "actions");
      var panels = h("div");
      function toggle(kind, btn, build) {
        var key = p.id + ":" + kind;
        var panel = null;
        function sync() {
          var open = !!state.open[key];
          btn.setAttribute("aria-expanded", open ? "true" : "false");
          btn.textContent = kind === "h" ? (open ? L.hideHint : L.showHint) : (open ? L.hideSol : L.showSol);
          if (open && !panel) { panel = build(); panels.appendChild(panel); }
          if (!open && panel) { panel.remove(); panel = null; }
          // keep hint above solution
          if (kind === "h" && panel && panels.firstChild !== panel) panels.insertBefore(panel, panels.firstChild);
        }
        btn.onclick = function () { state.open[key] = !state.open[key]; sync(); };
        sync();
      }
      var hintText = pick(p.h);
      if (hintText) {
        var hb = h("button", "btn hint");
        hb.type = "button";
        actions.appendChild(hb);
        toggle("h", hb, function () {
          var box = h("div", "panel hint");
          box.appendChild(h("div", "ttl", L.hint));
          box.appendChild(rich(h("div"), hintText));
          return box;
        });
      }
      var steps = p.s[lang].length ? p.s[lang] : (p.s.en.length ? p.s.en : p.s.ka);
      var answer = pick(p.a);
      if (steps.length || answer) {
        var sb = h("button", "btn sol");
        sb.type = "button";
        actions.appendChild(sb);
        toggle("s", sb, function () {
          var box = h("div", "panel sol");
          box.appendChild(h("div", "ttl", L.solution));
          if (steps.length) {
            var ol = h("ol");
            steps.forEach(function (s) { ol.appendChild(rich(h("li"), s)); });
            box.appendChild(ol);
          }
          if (answer) {
            var ans = h("div", "answer");
            ans.appendChild(document.createTextNode(L.answer + ": "));
            ans.appendChild(rich(h("span"), answer));
            box.appendChild(ans);
          }
          return box;
        });
      }
      body.appendChild(actions);
      body.appendChild(panels);
      c.appendChild(body);
      return c;
    }

    function draw() {
      var L = t();
      var subjName = L[subject];
      var title = L.gradeTitle(grade, subjName);
      setDocLang(title);
      app.innerHTML = "";
      var wrap = h("div", "wrap");
      wrap.appendChild(topbar([
        { text: L.site, href: "../../" },
        { text: L.collection[subject], href: "./" },
        { text: lang === "ka" ? grade + " " + L.gradeWord : L.gradeWord + " " + grade }
      ], draw));
      wrap.appendChild(hero(subject, title, L.gradeSub, [
        L.problemsN(data.problems.length), L.topicsN(data.topics.length)
      ]));

      // difficulty tabs
      var tabs = h("div", "tabs");
      tabs.setAttribute("role", "tablist");
      LEVELS.forEach(function (lv) {
        var n = data.problems.filter(function (p) { return p.level === lv; }).length;
        var b = h("button", lv === state.level ? "on" : "");
        b.type = "button";
        b.dataset.d = lv;
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", lv === state.level ? "true" : "false");
        b.appendChild(document.createTextNode(L.levels[lv]));
        b.appendChild(h("span", "cnt", "(" + n + ")"));
        b.onclick = function () {
          state.level = lv;
          try { history.replaceState(null, "", "#" + lv); } catch (e) { window.location.hash = lv; }
          draw();
        };
        tabs.appendChild(b);
      });
      wrap.appendChild(tabs);

      // topic filter (only topics that have problems at this level)
      var filter = h("div", "filter");
      var lab = h("label", "", L.topicLabel);
      lab.htmlFor = "topicSel";
      var sel = h("select");
      sel.id = "topicSel";
      var all = h("option", "", L.allTopics);
      all.value = "all";
      sel.appendChild(all);
      data.topics.forEach(function (tp) {
        var n = data.problems.filter(function (p) { return p.level === state.level && p.topic === tp.id; }).length;
        if (!n) return;
        var o = h("option", "", pick(tp) + " (" + L.weeks + " " + tp.weeks + ") — " + n);
        o.value = tp.id;
        sel.appendChild(o);
      });
      if (!sel.querySelector('option[value="' + state.topic + '"]')) state.topic = "all";
      sel.value = state.topic;
      sel.onchange = function () { state.topic = sel.value; draw(); };
      filter.appendChild(lab);
      filter.appendChild(sel);
      wrap.appendChild(filter);

      // list
      var list = h("div", "list");
      var shown = data.problems.filter(function (p) {
        return p.level === state.level && (state.topic === "all" || p.topic === state.topic);
      });
      var dividerDone = false;
      shown.forEach(function (p) {
        if (p.oly && !dividerDone) { list.appendChild(h("div", "oly-divider", L.olyDivider)); dividerDone = true; }
        list.appendChild(card(p));
      });
      if (!shown.length) list.appendChild(h("div", "empty", L.empty));
      wrap.appendChild(list);

      if (data.notes.length) {
        var f = h("footer");
        data.notes.forEach(function (n) { f.appendChild(rich(h("div"), pick(n))); });
        wrap.appendChild(f);
      }
      app.appendChild(wrap);
    }
    draw();
  }

  /* ---------- national exam tests: list page ---------- */
  function renderTests(app, subject) {
    var list = JSON.parse(document.getElementById("tests").textContent);
    function draw() {
      var L = t();
      setDocLang(L.tests);
      app.innerHTML = "";
      var wrap = h("div", "wrap");
      wrap.appendChild(topbar([
        { text: L.site, href: "../../" },
        { text: L.collection[subject], href: "./" },
        { text: L.tests }
      ], draw));
      wrap.appendChild(hero(subject, L.tests, L.testsSub));
      var grid = h("div", "grades");
      list.forEach(function (it, i) {
        var c = h("a", "grade test-card" + (it.kind === "original" ? " orig" : ""));
        c.href = it.href;
        var top = h("div", "num", L.testWord + " " + (i + 1));
        c.appendChild(top);
        var lbl = h("div", "lbl", it.title[lang] || it.title.en);
        c.appendChild(lbl);
        c.appendChild(h("span", "pill kind", it.kind === "original" ? L.original : L.practice));
        c.appendChild(h("div", "desc", L.problemsN(it.n) + " · " + L.pointsN(it.points) + " · " + L.minutesN(it.time)));
        if (it.desc) c.appendChild(h("div", "desc", it.desc[lang] || it.desc.en));
        grid.appendChild(c);
      });
      wrap.appendChild(grid);
      app.appendChild(wrap);
    }
    draw();
  }

  /* ---------- national exam tests: one test ---------- */
  var LETTERS = { ka: ["ა", "ბ", "გ", "დ", "ე"], en: ["A", "B", "C", "D", "E"] };
  var TFIELD = /^(KA|EN|HKA|HEN|SKA|SEN|AKA|AEN|OKA|OEN|O|C|FIG)\s*:\s?(.*)$/;

  function parseTest(text) {
    var meta = {}, items = [], cur = null, field = null;
    text.split(/\r?\n/).forEach(function (raw, i) {
      var line = raw.trim();
      if (!line || line.slice(0, 2) === "//") return;
      var m;
      if ((m = /^#\s*(title|sub|source|time)\s+(.*)$/.exec(line))) {
        var parts = m[2].split("|").map(function (s) { return s.trim(); });
        meta[m[1]] = { ka: parts[0], en: parts[1] || parts[0] };
        return;
      }
      if ((m = /^-{3,}\s*(\d+)\s*$/.exec(line))) {
        cur = {
          pts: parseInt(m[1], 10), c: -1, fig: "",
          q: { ka: "", en: "" }, h: { ka: "", en: "" }, s: { ka: [], en: [] }, a: { ka: "", en: "" },
          o: { all: [], ka: [], en: [] }
        };
        items.push(cur);
        field = null;
        return;
      }
      if (!cur) { console.warn("test: line " + (i + 1) + " is outside a problem:", line); return; }
      if ((m = TFIELD.exec(line))) {
        if (m[1] === "C") { cur.c = parseInt(m[2], 10) - 1; field = null; return; }
        field = m[1];
        line = m[2].trim();
        if (!line) return;
      }
      if (!field) { console.warn("test: line " + (i + 1) + " has no field:", line); return; }
      if (field === "FIG") { cur.fig += raw + "\n"; return; }
      if (field === "O") { cur.o.all.push(line); return; }
      if (field === "OKA" || field === "OEN") { cur.o[field.slice(1).toLowerCase()].push(line); return; }
      var k = FIELD_NAMES[field].split("."), slot = cur[k[0]];
      if (k[0] === "s") slot[k[1]].push(line);
      else slot[k[1]] = slot[k[1]] ? slot[k[1]] + "\n" + line : line;
    });
    items.forEach(function (p, i) {
      p.no = i + 1;
      p.fig = p.fig.replace(/^\s*FIG\s*:\s?/, "");
      if (p.o.all.length || p.o.ka.length || p.o.en.length) {
        if (p.c < 0) console.warn("test: problem " + p.no + " has options but no correct answer (C:)");
      }
    });
    return { meta: meta, items: items };
  }

  function renderTest(app, subject) {
    var data = parseTest(document.getElementById("problems").textContent);
    var items = data.items;
    var maxPts = items.reduce(function (s, p) { return s + p.pts; }, 0);
    var minutes = data.meta.time ? parseInt(data.meta.time.en, 10) : 180;
    var key = "hp-test:" + window.location.pathname.replace(/\.html$/, "");

    function pick(obj) { return obj[lang] || obj.en || obj.ka || ""; }
    function opts(p) { return p.o[lang].length ? p.o[lang] : (p.o.all.length ? p.o.all : (p.o.en.length ? p.o.en : p.o.ka)); }
    function isMC(p) { return p.c >= 0; }

    var state = { ans: {}, self: {}, checked: false, elapsed: 0, running: false };
    try {
      var saved = JSON.parse(store(key) || "null");
      if (saved && typeof saved === "object") {
        state.ans = saved.ans || {};
        state.self = saved.self || {};
        state.checked = !!saved.checked;
        state.elapsed = saved.elapsed || 0;
      }
    } catch (e) { /* ignore broken saved state */ }
    var open = {}, startedAt = 0, tick = null;
    function save() {
      store(key, JSON.stringify({ ans: state.ans, self: state.self, checked: state.checked, elapsed: elapsedNow() }));
    }
    function elapsedNow() { return state.elapsed + (state.running ? (Date.now() - startedAt) / 1000 : 0); }
    function clock() {
      var left = Math.max(0, minutes * 60 - elapsedNow());
      var hh = Math.floor(left / 3600), mm = Math.floor(left % 3600 / 60), ss = Math.floor(left % 60);
      return hh + ":" + (mm < 10 ? "0" : "") + mm + ":" + (ss < 10 ? "0" : "") + ss;
    }

    function score() {
      var r = { mc: 0, mcMax: 0, open: 0, openMax: 0, answered: 0 };
      items.forEach(function (p) {
        if (isMC(p)) {
          r.mcMax += p.pts;
          if (state.ans[p.no] != null) r.answered++;
          if (state.ans[p.no] === p.c) r.mc += p.pts;
        } else {
          r.openMax += p.pts;
          r.open += state.self[p.no] || 0;
        }
      });
      return r;
    }

    function card(p) {
      var L = t();
      var c = h("article", "card");
      c.id = "q" + p.no;
      var body = h("div", "body");
      var meta = h("div", "meta");
      meta.appendChild(h("span", "no", "№ " + p.no));
      meta.appendChild(h("span", "chip", L.pointsN(p.pts)));
      body.appendChild(meta);
      var qrow = h("div", p.fig ? "qrow" : "");
      qrow.appendChild(rich(h("div", "q"), pick(p.q)));
      if (p.fig) {
        var fig = h("div", "fig");
        fig.innerHTML = p.fig;
        qrow.appendChild(fig);
      }
      body.appendChild(qrow);

      if (isMC(p)) {
        var list = opts(p);
        var long = list.some(function (o) { return o.replace(/\$[^$]*\$/g, "xx").length > 22; });
        var grid = h("div", "opts" + (long ? " long" : ""));
        list.forEach(function (o, i) {
          var b = h("button", "opt");
          b.type = "button";
          var chosen = state.ans[p.no] === i;
          if (chosen) b.className += " sel";
          if (state.checked) {
            if (i === p.c) b.className += " ok";
            else if (chosen) b.className += " bad";
          }
          b.setAttribute("aria-pressed", chosen ? "true" : "false");
          b.appendChild(h("span", "let", LETTERS[lang][i] + ")"));
          b.appendChild(rich(h("span", "val"), o));
          b.onclick = function () {
            if (state.ans[p.no] === i) delete state.ans[p.no];
            else state.ans[p.no] = i;
            save();
            redrawCard(p);
            updateBar();
          };
          grid.appendChild(b);
        });
        body.appendChild(grid);
      } else {
        body.appendChild(h("div", "open-note", L.open));
        if (state.checked) {
          var self = h("label", "self");
          self.appendChild(document.createTextNode(L.selfScore + " "));
          var sel = h("select");
          for (var k = 0; k <= p.pts; k++) {
            var o = h("option", "", String(k));
            o.value = String(k);
            sel.appendChild(o);
          }
          sel.value = String(state.self[p.no] || 0);
          sel.onchange = function () { state.self[p.no] = parseInt(sel.value, 10); save(); updateBar(); };
          self.appendChild(sel);
          self.appendChild(document.createTextNode(" / " + p.pts));
          body.appendChild(self);
        }
      }

      var actions = h("div", "actions");
      var panels = h("div");
      function toggle(kind, btn, build) {
        var k = p.no + ":" + kind, panel = null;
        function sync() {
          var on = !!open[k];
          btn.setAttribute("aria-expanded", on ? "true" : "false");
          btn.textContent = kind === "h" ? (on ? L.hideHint : L.showHint) : (on ? L.hideSol : L.showSol);
          if (on && !panel) { panel = build(); panels.appendChild(panel); }
          if (!on && panel) { panel.remove(); panel = null; }
          if (kind === "h" && panel && panels.firstChild !== panel) panels.insertBefore(panel, panels.firstChild);
        }
        btn.onclick = function () { open[k] = !open[k]; sync(); };
        sync();
      }
      var hintText = pick(p.h);
      if (hintText) {
        var hb = h("button", "btn hint");
        hb.type = "button";
        actions.appendChild(hb);
        toggle("h", hb, function () {
          var box = h("div", "panel hint");
          box.appendChild(h("div", "ttl", L.hint));
          box.appendChild(rich(h("div"), hintText));
          return box;
        });
      }
      var steps = p.s[lang].length ? p.s[lang] : (p.s.en.length ? p.s.en : p.s.ka);
      var sb = h("button", "btn sol");
      sb.type = "button";
      actions.appendChild(sb);
      toggle("s", sb, function () {
        var box = h("div", "panel sol");
        box.appendChild(h("div", "ttl", L.solution));
        if (steps.length) {
          var ol = h("ol");
          steps.forEach(function (s) { ol.appendChild(rich(h("li"), s)); });
          box.appendChild(ol);
        }
        var ans = h("div", "answer");
        ans.appendChild(document.createTextNode(L.answer + ": "));
        var text = pick(p.a);
        if (isMC(p)) ans.appendChild(document.createTextNode(LETTERS[lang][p.c] + ") "));
        ans.appendChild(rich(h("span"), text || (isMC(p) ? opts(p)[p.c] || "" : "")));
        box.appendChild(ans);
        return box;
      });
      body.appendChild(actions);
      body.appendChild(panels);
      c.appendChild(body);
      return c;
    }

    var cards = {}, bar = null, result = null, timerBtn = null, timeEl = null;
    function redrawCard(p) {
      var old = cards[p.no], fresh = card(p);
      if (old && old.parentNode) old.parentNode.replaceChild(fresh, old);
      cards[p.no] = fresh;
    }
    function updateBar() {
      var L = t(), r = score(), mcCount = items.filter(isMC).length;
      if (bar) bar.textContent = L.answered(r.answered, mcCount);
      if (!result) return;
      result.innerHTML = "";
      if (!state.checked) { result.style.display = "none"; return; }
      result.style.display = "";
      [[L.closedPart, r.mc, r.mcMax], [L.openPart, r.open, r.openMax]].forEach(function (row) {
        var d = h("div", "row");
        d.appendChild(h("span", "", row[0]));
        d.appendChild(h("b", "", row[1] + " / " + row[2]));
        result.appendChild(d);
      });
      var tot = h("div", "row total");
      tot.appendChild(h("span", "", L.total));
      tot.appendChild(h("b", "", (r.mc + r.open) + " / " + maxPts));
      result.appendChild(tot);
    }
    function syncTimer() {
      var L = t();
      if (timerBtn) timerBtn.textContent = state.running ? L.timerStop : L.timerStart;
      if (timeEl) timeEl.textContent = clock();
    }

    function draw() {
      var L = t();
      var title = pick(data.meta.title || { ka: L.testWord, en: L.testWord });
      setDocLang(title);
      app.innerHTML = "";
      cards = {};
      var wrap = h("div", "wrap");
      wrap.appendChild(topbar([
        { text: L.site, href: "../../" },
        { text: L.collection[subject], href: "./" },
        { text: L.tests, href: "tests.html" },
        { text: title }
      ], draw));
      var stats = [L.problemsN(items.length), L.pointsN(maxPts), L.minutesN(minutes)];
      wrap.appendChild(hero(subject, title, data.meta.sub ? pick(data.meta.sub) : "", stats));
      if (data.meta.source) {
        var src = h("p", "source");
        var a = h("a", "", L.sourcePdf);
        a.href = data.meta.source.en;
        a.target = "_blank";
        a.rel = "noopener";
        src.appendChild(a);
        wrap.appendChild(src);
      }

      var tb = h("div", "test-bar");
      timerBtn = h("button", "btn");
      timerBtn.type = "button";
      timerBtn.onclick = function () {
        if (state.running) { state.elapsed = elapsedNow(); state.running = false; clearInterval(tick); tick = null; }
        else { startedAt = Date.now(); state.running = true; tick = setInterval(syncTimer, 1000); }
        save();
        syncTimer();
      };
      timeEl = h("span", "clock");
      tb.appendChild(timerBtn);
      tb.appendChild(timeEl);
      bar = h("span", "progress");
      tb.appendChild(bar);
      wrap.appendChild(tb);

      var list = h("div", "list");
      items.forEach(function (p) {
        cards[p.no] = card(p);
        list.appendChild(cards[p.no]);
      });
      wrap.appendChild(list);

      var foot = h("div", "test-foot");
      var chk = h("button", "btn sol big", L.check);
      chk.type = "button";
      chk.onclick = function () {
        state.checked = true;
        save();
        items.forEach(redrawCard);
        updateBar();
        result.scrollIntoView({ behavior: "smooth", block: "center" });
      };
      var rst = h("button", "btn big", L.reset);
      rst.type = "button";
      rst.onclick = function () {
        if (!window.confirm(L.resetAsk)) return;
        state.ans = {}; state.self = {}; state.checked = false; state.elapsed = 0;
        if (state.running) startedAt = Date.now();
        save();
        draw();
      };
      foot.appendChild(chk);
      foot.appendChild(rst);
      wrap.appendChild(foot);
      result = h("div", "result");
      wrap.appendChild(result);

      var back = h("p", "other");
      var bl = h("a", "", L.backToTests);
      bl.href = "tests.html";
      back.appendChild(bl);
      wrap.appendChild(back);
      app.appendChild(wrap);
      updateBar();
      syncTimer();
    }
    window.addEventListener("pagehide", save);
    draw();
  }

  /* ---------- boot ---------- */
  function boot() {
    var body = document.body;
    var app = document.getElementById("app");
    var subject = body.dataset.subject === "math" ? "math" : "physics";
    if (body.dataset.page === "grade") renderGrade(app, subject, body.dataset.grade);
    else if (body.dataset.page === "tests") renderTests(app, subject);
    else if (body.dataset.page === "test") renderTest(app, subject);
    else renderIndex(app, subject);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
