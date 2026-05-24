// GEOPULSE QUIZ ENGINE — V2.2
// Manages quiz sessions, scoring, timer, map integration
(function(){
'use strict';

window.GeoQuiz = class GeoQuiz {
  constructor(map) {
    this.map = map;
    this.lang = 'en';
    this.questions = [];
    this.current = 0;
    this.score = 0;
    this.total = 0;
    this.answers = [];
    this.difficulty = 'explorer';
    this.timer = null;
    this.timeLeft = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.startTime = 0;
    this.mapClickHandler = null;
    this.panel = document.getElementById('quiz-panel');
    this.active = false;
  }

  start(category, difficulty, count) {
    count = count || 10;
    this.difficulty = difficulty || 'explorer';
    this.lang = document.documentElement.lang === 'de' ? 'de' : (localStorage.getItem('geopulseLang') || 'en');
    let pool = category === 'all'
      ? Object.values(QUIZ_BANK).flat()
      : (QUIZ_BANK[category] || []);
    const diffMap = {explorer:['easy'],analyst:['easy','medium'],commander:['medium','hard']};
    pool = pool.filter(q => (diffMap[this.difficulty]||['easy']).includes(q.difficulty));
    if (pool.length === 0) pool = Object.values(QUIZ_BANK).flat();
    this.questions = this._shuffle(pool).slice(0, Math.min(count, pool.length));
    this.current = 0; this.score = 0; this.total = this.questions.length;
    this.answers = []; this.streak = 0; this.bestStreak = 0;
    this.startTime = Date.now(); this.active = true;
    this._hideMapLabels();
    this._showPanel(); this._showQuestion();
  }

  stop() {
    this.active = false; this._clearTimer();
    if (this.mapClickHandler) { this.map.off('click', this.mapClickHandler); this.mapClickHandler = null; }
    if (this.panel) { this.panel.style.display = 'none'; this.panel.classList.remove('locate-mode'); }
    this._restoreMapLabels();
  }

  // Hide city/country labels so they don't spoil answers
  _hideMapLabels() {
    this._labelLayers = [];
    try {
      const style = this.map.getStyle();
      if (style && style.layers) {
        style.layers.forEach(l => {
          if (l.type === 'symbol' && l.id && /label|place|country|city|town|village|state|poi|point|name|capital/i.test(l.id)) {
            const vis = this.map.getLayoutProperty(l.id, 'visibility');
            if (vis !== 'none') {
              this._labelLayers.push(l.id);
              this.map.setLayoutProperty(l.id, 'visibility', 'none');
            }
          }
        });
      }
    } catch(e) { /* style may not be loaded yet */ }
  }

  _restoreMapLabels() {
    if (this._labelLayers) {
      this._labelLayers.forEach(id => {
        try { this.map.setLayoutProperty(id, 'visibility', 'visible'); } catch(e) {}
      });
      this._labelLayers = [];
    }
  }

  _shuffle(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

  _t(obj) { return (this.lang==='de' && obj.de) ? obj.de : obj.en; }

  _showPanel() {
    if (!this.panel) return;
    this.panel.style.display = 'block';
    this.panel.classList.add('quiz-active');
  }

  _showQuestion() {
    if (this.current >= this.total) { this._showResults(); return; }
    this._answered = false;
    this._nextShown = false;
    const q = this.questions[this.current];
    if (this.mapClickHandler) { this.map.off('click', this.mapClickHandler); this.mapClickHandler = null; }
    // Fly map
    if (q.mapView) {
      let zoom = q.mapView.zoom;
      if (this.difficulty === 'commander') zoom = Math.max(zoom - 1, 2);
      if (this.difficulty === 'explorer') zoom = Math.min(zoom + 1, 18);
      this.map.flyTo({ center: q.mapView.center, zoom: zoom, duration: 2000 });
    }
    const pct = Math.round((this.current / this.total) * 100);
    const isLocate = q.type === 'locate';
    // Reposition panel for locate questions — move to left so map is clickable
    if (isLocate) {
      this.panel.classList.add('locate-mode');
    } else {
      this.panel.classList.remove('locate-mode');
    }
    let html = `<div class="quiz-header">
      <span class="quiz-label">🧠 GEOQUIZ</span>
      <span class="quiz-progress">Q ${this.current+1}/${this.total}</span>
      ${this.difficulty !== 'explorer' ? '<span class="quiz-timer" id="quiz-timer">⏱ --</span>' : ''}
    </div>
    <div class="quiz-progressbar"><div class="quiz-progressbar-fill" style="width:${pct}%"></div></div>
    <div class="quiz-question">${this._t(q.question)}</div>`;
    if (isLocate) {
      html += `<div class="quiz-locate-hint">${this.lang==='de'?'📍 Klicke auf die Karte!':'📍 Click on the map!'}</div>`;
    } else {
      const shuffled = this._shuffle(q.choices);
      const letters = ['A','B','C','D'];
      shuffled.forEach((c, i) => {
        html += `<button class="quiz-choice" data-correct="${c.correct}" data-idx="${i}">
          <span class="quiz-choice-letter">${letters[i]}</span> ${this._t(c.text)}
        </button>`;
      });
    }
    if (this.difficulty === 'explorer' && !isLocate) {
      html += `<div class="quiz-hint-wrap"><button class="quiz-hint-btn" id="quiz-hint-btn">💡 ${this.lang==='de'?'Hinweis zeigen':'Show hint'}</button></div>`;
    }
    this.panel.innerHTML = html;
    // Wire choice clicks
    this.panel.querySelectorAll('.quiz-choice').forEach(btn => {
      btn.addEventListener('click', () => this._answerMC(btn, q));
    });
    // Wire hint
    const hintBtn = document.getElementById('quiz-hint-btn');
    if (hintBtn) hintBtn.addEventListener('click', () => {
      hintBtn.textContent = this._t(q.explanation);
      hintBtn.disabled = true; hintBtn.style.opacity = '.6';
    });
    // Wire map click for locate
    if (isLocate) this._enableMapClick(q);
    // Timer
    this._clearTimer();
    if (this.difficulty !== 'explorer') {
      this.timeLeft = this.difficulty === 'commander' ? 15 : 30;
      this._tickTimer();
      this.timer = setInterval(() => this._tickTimer(), 1000);
    }
  }

  _tickTimer() {
    const el = document.getElementById('quiz-timer');
    if (el) el.textContent = `⏱ ${this.timeLeft}s`;
    if (this.timeLeft <= 0) {
      this._clearTimer();
      if (this.questions[this.current].type === 'locate') {
        this.map.off('click', this.mapClickHandler); this.mapClickHandler = null;
      }
      this._recordAnswer(0, false, 'timeout');
      this._afterAnswer(null, false);
    }
    this.timeLeft--;
  }

  _clearTimer() { if(this.timer){clearInterval(this.timer);this.timer=null;} }

  _answerMC(btn, q) {
    if (this._answered) return;
    this._answered = true;
    const correct = btn.getAttribute('data-correct') === 'true';
    this.panel.querySelectorAll('.quiz-choice').forEach(b => {
      b.disabled = true;
      if (b.getAttribute('data-correct') === 'true') b.classList.add('quiz-correct');
      else if (b === btn && !correct) b.classList.add('quiz-wrong');
    });
    this._clearTimer();
    let pts = correct ? 100 : 0;
    if (correct && this.difficulty !== 'explorer') {
      const bonus = this.difficulty === 'commander' ? Math.round(this.timeLeft * 6.67) : Math.round(this.timeLeft * 1.67);
      pts += Math.min(bonus, this.difficulty === 'commander' ? 100 : 50);
    }
    this._recordAnswer(pts, correct, correct ? 'correct' : 'wrong');
    this._afterAnswer(q, correct);
  }

  _enableMapClick(q) {
    this.mapClickHandler = (e) => {
      this.map.off('click', this.mapClickHandler); this.mapClickHandler = null;
      this._clearTimer();
      const click = [e.lngLat.lng, e.lngLat.lat];
      const target = q.target;
      const dist = this._haversine(click, target);
      const thresh = {explorer:{p:100,c:300,r:500},analyst:{p:50,c:200,r:500},commander:{p:20,c:50,r:200}};
      const t = thresh[this.difficulty];
      let pts = 0, label = '';
      if (dist < t.p) { pts = 100; label = '🎯 ' + (this.lang==='de'?'Volltreffer!':'Bullseye!'); }
      else if (dist < t.c) { pts = 75; label = '✅ ' + (this.lang==='de'?'Nah dran!':'Close!'); }
      else if (dist < t.r) { pts = 40; label = '🟡 ' + (this.lang==='de'?'In der Region':'In the region'); }
      else { pts = 0; label = '❌ ' + Math.round(dist) + ' km ' + (this.lang==='de'?'daneben':'off'); }
      this._recordAnswer(pts, pts > 0, label);
      // Show feedback
      const fb = document.createElement('div');
      fb.className = 'quiz-locate-feedback';
      fb.innerHTML = `<div>${label}</div><div style="font-size:.6rem;opacity:.6">${Math.round(dist)} km</div>`;
      this.panel.appendChild(fb);
      this._afterAnswer(q, pts > 0);
    };
    this.map.on('click', this.mapClickHandler);
  }

  _haversine(c1, c2) {
    const R = 6371, toRad = d => d * Math.PI / 180;
    const dLat = toRad(c2[1]-c1[1]), dLon = toRad(c2[0]-c1[0]);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(c1[1])) * Math.cos(toRad(c2[1])) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  _recordAnswer(pts, correct, label) {
    this.score += pts;
    if (correct) { this.streak++; this.bestStreak = Math.max(this.bestStreak, this.streak); }
    else this.streak = 0;
    this.answers.push({ qId: this.questions[this.current].id, pts, correct, label });
  }

  _afterAnswer(q, correct) {
    if (this._nextShown) return;
    this._nextShown = true;
    const showExplanation = this.difficulty === 'explorer' && q;
    setTimeout(() => {
      if (showExplanation) {
        const exp = document.createElement('div');
        exp.className = 'quiz-explanation';
        exp.textContent = this._t(q.explanation);
        this.panel.appendChild(exp);
      }
      const next = document.createElement('button');
      next.className = 'quiz-next-btn';
      next.textContent = this.current + 1 >= this.total
        ? (this.lang==='de'?'📊 Ergebnis anzeigen':'📊 Show Results')
        : (this.lang==='de'?'Weiter →':'Next →');
      this.panel.appendChild(next);
      next.addEventListener('click', () => { this.current++; this._showQuestion(); });
    }, showExplanation ? 300 : 600);
  }

  _showResults() {
    this._clearTimer(); this.active = false;
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const pct = Math.round((this.score / (this.total * 100)) * 100);
    let rank, badge;
    if (pct >= 90) { rank = '🏆 Director'; badge = '⭐⭐⭐'; }
    else if (pct >= 80) { rank = '🟢 Commander'; badge = '⭐⭐'; }
    else if (pct >= 60) { rank = '🟡 Analyst'; badge = '⭐'; }
    else if (pct >= 40) { rank = '🟠 Cadet'; badge = ''; }
    else { rank = '🔴 Recruit'; badge = ''; }
    const mins = Math.floor(elapsed/60), secs = elapsed%60;
    let html = `<div class="quiz-results">
      <div class="quiz-results-title">🏆 ${this.lang==='de'?'QUIZ ABGESCHLOSSEN!':'QUIZ COMPLETE!'}</div>
      <div class="quiz-score-big">${this.score} / ${this.total * 100}</div>
      <div class="quiz-progressbar"><div class="quiz-progressbar-fill" style="width:${pct}%"></div></div>
      <div class="quiz-rank">${rank} ${badge}</div>
      <div class="quiz-meta">⏱ ${mins}:${secs.toString().padStart(2,'0')} · 🔥 ${this.lang==='de'?'Beste Serie':'Best streak'}: ${this.bestStreak}</div>
      <div class="quiz-meta">✅ ${this.answers.filter(a=>a.correct).length} ${this.lang==='de'?'richtig':'correct'} · ❌ ${this.answers.filter(a=>!a.correct).length} ${this.lang==='de'?'falsch':'wrong'}</div>
      <div class="quiz-actions">
        <button class="quiz-action-btn" id="quiz-retry">🔄 ${this.lang==='de'?'Nochmal':'Play Again'}</button>
        <button class="quiz-action-btn" id="quiz-close">🏠 ${this.lang==='de'?'Zurück zur Karte':'Back to Map'}</button>
      </div>
    </div>`;
    this.panel.innerHTML = html;
    document.getElementById('quiz-retry')?.addEventListener('click', () => {
      this.panel.style.display = 'none';
      document.getElementById('quiz-setup')?.scrollIntoView({behavior:'smooth'});
    });
    document.getElementById('quiz-close')?.addEventListener('click', () => this.stop());
    // Save best score
    try {
      const key = 'geopulse_quiz_scores';
      const scores = JSON.parse(localStorage.getItem(key) || '{}');
      const sKey = `${this.difficulty}_${pct}`;
      if (!scores[sKey] || this.score > scores[sKey].best) {
        scores[sKey] = { best: this.score, date: new Date().toISOString().slice(0,10) };
        localStorage.setItem(key, JSON.stringify(scores));
      }
    } catch(e) {}
  }
};
})();
