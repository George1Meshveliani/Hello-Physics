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
      notes: "შენიშვნა"
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
      notes: "Note"
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

  /* ---------- boot ---------- */
  function boot() {
    var body = document.body;
    var app = document.getElementById("app");
    var subject = body.dataset.subject === "math" ? "math" : "physics";
    if (body.dataset.page === "grade") renderGrade(app, subject, body.dataset.grade);
    else renderIndex(app, subject);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
