/* RenAI ChatBot - site scripts (moved out of final.html) */

/* Chat widget settings. Keep this first: widget.js reads it when it loads. */
// SECURITY: widgetKey is the only credential needed for authentication
// Backend resolves the application from the widget key - appId is for reference only
window.OceanRAGWidgetConfig = {
  widgetKey: "wgt_pub_lGfi9kxOZDNN87qmyM2v12yZvePC6uKylQMWANGTXc0",
  appId: "40463b5b-d7f0-4c67-b0d3-f0b86f21d57a",  // Reference only - NOT used for security/authorization
  backendUrl: "https://chatbot3-proj.onrender.com"
};

/* Page behaviour. Runs once the page markup is ready. */
document.addEventListener('DOMContentLoaded', function () {

  (function () {
    /* Mobile nav: toggle hamburger and aria-expanded for the overlay menu. */
    function initMobileNav() {
      const menuBtn = document.querySelector('.menu-toggle');
      const menu = document.getElementById('mobile-menu');
      if (!menuBtn || !menu) return;
      menuBtn.addEventListener('click', () => {
        const open = menu.hasAttribute('hidden');
        menu.toggleAttribute('hidden', !open);
        menuBtn.setAttribute('aria-expanded', String(open));
      });
    }

    /* Moving text bars (top, middle, model list): pause/resume button; hover also pauses (CSS). */
    function initMarqueePause() {
      document.querySelectorAll('.marquee-section, .Blue-bar1, .Blue-bar').forEach((bar) => {
        const pause = bar.querySelector('.marquee-pause');
        if (!pause) return;
        pause.addEventListener('click', () => {
          const on = bar.classList.toggle('paused');
          pause.textContent = on ? '▶' : 'Ⅱ';
          pause.setAttribute('aria-label', on ? 'Resume moving text' : 'Pause moving text');
        });
      });
    }

    /* Reveal: fade-in for [data-reveal] and .reveal as they enter the viewport. */
    function initRevealOnScroll() {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const nodes = document.querySelectorAll('[data-reveal], .reveal');
      const io = (!reduce && 'IntersectionObserver' in window)
        ? new IntersectionObserver((entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add('in');
                io.unobserve(e.target);
              }
            });
          }, { threshold: 0.12 })
        : null;
      nodes.forEach((el, i) => {
        el.style.transitionDelay = (i % 5) * 0.07 + 's';
        io ? io.observe(el) : el.classList.add('in');
      });
    }

    /* Billing: monthly vs annual (20% off) for Starter/Growth prices. */
    function initBillingToggle() {
      document.querySelectorAll('[data-billing]').forEach((button) => {
        button.addEventListener('click', () => {
          const billing = button.dataset.billing;
          document.querySelectorAll('[data-billing]').forEach((btn) => btn.setAttribute('aria-pressed', String(btn === button)));
          document.querySelectorAll('[data-price]').forEach((price) => {
            const base = Number(price.dataset.price);
            const annual = billing === 'annual';
            price.textContent = annual ? (base * 0.8).toFixed(0) : String(base);
            const note = price.closest('.price-card').querySelector('.billing-note');
            if (note && note.dataset.monthlyNote) {
              note.textContent = annual
                ? '$' + (base * 0.8 * 12).toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' billed annually'
                : note.dataset.monthlyNote;
            }
          });
        });
      });
    }

    /* Pipeline tabs: swap Connect / Understand / Answer copy in Knowledge Studio. */
    function initPipelineTabs() {
      const steps = [
        { label: '1 GIVE YOUR KNOWLEDGE A HOME', title: 'Everything you know.\nFinally, connected.', description: 'Bring together your documents, help articles, and website content. RenAI preserves their structure to build a knowledge base that makes sense.', note: 'Headings, relationships, and context stay intact.', nodes: ['Your documents', 'Smart chunking', 'Knowledge base'] },
        { label: '2 FIND THE MEANING, NOT JUST THE MATCH', title: 'The right context.\nNot just similar words.', description: 'Keyword search finds precise terms. Semantic search understands intent.', note: 'Keyword precision and semantic meaning work together.', nodes: ['Your question', 'Hybrid retrieval', 'Reranked context'] },
        { label: '3 AN ANSWER YOU CAN TRACE', title: 'One clear answer.\nAnd the source to back it.', description: 'Relevant context guides the model. Sources let customers explore the original.', note: 'Every answer links back to the source it came from.', nodes: ['Relevant context', 'Your AI model', 'Cited answer'] }
      ];
      const tabs = document.querySelectorAll('.pipeline-tab');
      const AUTO_MS = 3000;           /* 1 Connect -> 2 Understand -> 3 Answer -> back to 1, every 3 seconds */
      let current = 0;
      let timer = null;

      function goTo(index) {
        current = index;
        tabs.forEach((t, i) => t.setAttribute('aria-selected', String(i === index)));
        const step = steps[index];
        const label = document.getElementById('pipeline-step-label');
        const title = document.getElementById('pipeline-heading');
        const desc = document.getElementById('pipeline-description');
        if (label) label.textContent = step.label;
        if (title) {
          title.replaceChildren();
          step.title.split('\n').forEach((line, i) => { if (i) title.append(document.createElement('br')); title.append(document.createTextNode(line)); });
        }
        if (desc) desc.textContent = step.description;
        const note = document.getElementById('pipeline-note');
        if (note && step.note) note.textContent = step.note;
        document.querySelectorAll('.diagram-label').forEach((el, i) => { el.textContent = step.nodes[i]; });
      }

      function restartTimer() {
        clearInterval(timer);
        timer = setInterval(() => goTo((current + 1) % steps.length), AUTO_MS);
      }

      /* A manual click still works; it shows that step and restarts the countdown. */
      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => { goTo(index); restartTimer(); });
      });

      /* Keep the panel the same size on every step: measure the tallest of the 3 steps once
         (and again on resize / font load) and reserve that height, so nothing jumps when the step changes. */
      function lockSize() {
        const content = document.getElementById('pipeline-content');
        if (!content) return;
        const keep = current;
        content.style.minHeight = '';
        let tallest = 0;
        steps.forEach((_, i) => { goTo(i); tallest = Math.max(tallest, content.offsetHeight); });
        goTo(keep);
        content.style.minHeight = tallest + 'px';
      }
      lockSize();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(lockSize);
      let lockTimer;
      window.addEventListener('resize', () => { clearTimeout(lockTimer); lockTimer = setTimeout(lockSize, 150); });

      restartTimer();
    }

    /* Studio chat: local scripted answers for returns / plans / onboarding. */
    function initStudioChat() {
      const knowledge = {
        returns: 'You can return unused products within 30 days of delivery, in original packaging.',
        plans: 'You can request an upgrade whenever you’re ready. Your knowledge base stays in place.',
        onboarding: 'Start with a workspace, add a knowledge source, then test a few common questions.',
        purchase: 'Select the plan and press the Explore button, fill in the details and send the request. Our team will contact you soon.'
      };
      const log = document.getElementById('chat-log');
      const form = document.getElementById('chat-form');
      const input = document.getElementById('chat-input');
      const reset = document.getElementById('chat-reset');
      if (!log || !form || !input) return;
      function add(text, user) {
        const el = document.createElement('div');
        el.className = 'chat-message' + (user ? ' user' : '');
        el.textContent = text;
        log.append(el);
        log.scrollTop = log.scrollHeight;
      }
      function welcome() { log.replaceChildren(); add('Hi there! I’m RenAI Chatbot . Start Your Business Conversation !'); }
      function ask(q) {
        if (!q.trim()) return;
        add(q, true);
        const key = /purchase|buy/i.test(q) ? 'purchase' : /return|refund/i.test(q) ? 'returns' : /plan|bill|upgrad/i.test(q) ? 'plans' : /start|setup|onboard/i.test(q) ? 'onboarding' : null;
        setTimeout(() => add(key ? knowledge[key] : 'I don’t have that in this sample knowledge base. Try returns, plans, getting started, or how to purchase.'), 400);
      }
      welcome();
      form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); input.value = ''; });
      document.querySelectorAll('.sample-prompt').forEach((b) => b.addEventListener('click', () => ask(b.dataset.question)));
      if (reset) reset.addEventListener('click', welcome);
    }

    /* Copy snippet: clipboard for the illustrative SDK example. */
    function initCopySnippet() {
      const copyBtn = document.querySelector('.copy-code');
      const code = document.getElementById('integration-code');
      if (!copyBtn || !code) return;
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code.textContent);
          const span = copyBtn.querySelector('span');
          if (span) { span.textContent = 'Copied'; setTimeout(() => { span.textContent = 'Copy'; }, 1400); }
        } catch (err) {}
      });
    }

    /* Integration tabs: switch web vs mobile preview labels. */
    function initIntegrationTabs() {
      document.querySelectorAll('.integration-tabs button').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.integration-tabs button').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }

    initMobileNav();
    initMarqueePause();
    initRevealOnScroll();
    initBillingToggle();
    initPipelineTabs();
    initStudioChat();
    initCopySnippet();
    initIntegrationTabs();
  })();

  /* Purchase ChatBot CTA sheet: opens only from [data-purchase] buttons, sends name, contact number and
     description to send-enquiry.php, then closes and leaves the visitor exactly where they clicked. */
  (function () {
    const sheet = document.getElementById('leadSheet');
    const form = document.getElementById('leadCtaForm');
    const status = document.getElementById('leadCtaStatus');
    if (!sheet || !form || !status) return;
    const planField = document.getElementById('leadPlanField');
    const planInput = document.getElementById('leadPlan');
    let trigger = null;
    let closeTimer = null;

    function open(from) {
      trigger = from || null;
      clearTimeout(closeTimer);
      /* Plan buttons (Starter / Pro / Enterprise) show and send the chosen plan; other buttons do not. */
      const plan = from && from.dataset ? (from.dataset.plan || '') : '';
      if (planField && planInput) {
        planInput.value = plan;
        planInput.disabled = !plan;
        planField.hidden = !plan;
      }
      status.hidden = true;
      status.textContent = '';
      const gap = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = gap > 0 ? gap + 'px' : '';
      document.body.style.overflow = 'hidden';
      sheet.hidden = false;
      const first = form.querySelector('input');
      if (first) first.focus({ preventScroll: true });
    }

    function close() {
      clearTimeout(closeTimer);
      sheet.hidden = true;
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
      trigger = null;
    }

    document.querySelectorAll('[data-purchase]').forEach((b) => b.addEventListener('click', () => open(b)));
    sheet.querySelectorAll('[data-lead-close]').forEach((b) => b.addEventListener('click', close));
    sheet.addEventListener('click', (e) => { if (e.target === sheet) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) close(); });

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      status.hidden = false;
      status.textContent = 'Sending your details...';
      status.style.color = 'inherit';
      if (button) button.disabled = true;
      let sent = false;
      try {
        const response = await fetch('send-enquiry.php', {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        let result;
        try { result = await response.json(); }
        catch (_) { throw new Error('The server did not return a valid reply. The site must be opened through a PHP server (for example http://localhost:8000/final.html), not by double-clicking the HTML file.'); }
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Unable to send your details. Please try again.');
        }
        sent = true;
        status.textContent = result.message || 'Your details were submitted successfully!';
        status.style.color = '#16803c';
        form.reset();
      } catch (error) {
        /* "Failed to fetch" = the browser could not reach send-enquiry.php at all (offline, wrong address, or no PHP server). */
        const unreachable = error instanceof TypeError;
        status.textContent = unreachable
          ? 'Could not reach the server. Check your internet connection. If you are testing locally, run the site with PHP (php -S localhost:8000) and open http://localhost:8000/final.html.'
          : (error.message || 'Unable to send your details. Please try again.');
        status.style.color = '#b42318';
      } finally {
        if (button) button.disabled = false;
      }
      if (sent) closeTimer = setTimeout(close, 1400);
    });
  })();

  /* Knowledge Studio sheet: "Explore the experience" and "Or, try the walkthrough" ([data-studio]) open a short
     sheet, then close it and scroll to the Knowledge Studio (#playground). Close / Esc / backdrop just closes it. */
  (function () {
    const sheet = document.getElementById('studioSheet');
    if (!sheet) return;
    const SHEET_MS = 1800;        /* how long the sheet stays before it redirects (ms) */
    let trigger = null;
    let timer = null;

    function hide() {
      clearTimeout(timer);
      sheet.hidden = true;
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      sheet.classList.remove('running');
    }

    function open(from) {
      trigger = from || null;
      clearTimeout(timer);
      const gap = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = gap > 0 ? gap + 'px' : '';
      document.body.style.overflow = 'hidden';
      sheet.hidden = false;
      sheet.classList.remove('running');
      void sheet.offsetWidth;
      sheet.classList.add('running');
      const go = sheet.querySelector('[data-studio-go]');
      if (go) go.focus({ preventScroll: true });
      timer = setTimeout(redirect, SHEET_MS);
    }

    function redirect() {
      hide();
      const target = document.getElementById('playground');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function close() {
      hide();
      if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
      trigger = null;
    }

    document.querySelectorAll('[data-studio]').forEach((b) => b.addEventListener('click', () => open(b)));
    sheet.querySelectorAll('[data-studio-close]').forEach((b) => b.addEventListener('click', close));
    sheet.querySelectorAll('[data-studio-go]').forEach((b) => b.addEventListener('click', redirect));
    sheet.addEventListener('click', (e) => { if (e.target === sheet) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) close(); });
  })();

  /* ------------------------------------------------------------
     Hero chat box: automatic conversation demo
     Edit the questions / answers / timings below. Everything else
     reuses the chat markup that is already in final.html.
     All pairs are shown one after another (answer typed letter by
     letter), earlier pairs slide upward (and hide behind the top edge
     when the box is full), and after the last pair the animation waits
     a few seconds and starts again. Any page scroll also restarts it.
     ------------------------------------------------------------ */
  (function () {
    const DEMO_CHAT = [
      { question: 'What is RenAI ChatBot?',
        answer:   'RenAI is an AI + RAG Based Chatbot that provides intelligent customer support.' },
      { question: 'Can RenAI handle student admission enquiries?',
        answer:   'Yes! RenAI can answer questions about courses, admission procedures, fees, and eligibility using your institutions information.' },
      { question: 'Can it provide course details and eligibility criteria to students?',
        answer:   'Absolutely! RenAI can provide accurate course information, eligibility requirements, duration, and other academic details.' },
      { question: 'Can I integrate RenAI into my existing college website?',
        answer:   'Of course! We can integrate RenAI ChatBot into your existing website, making it easy for students to access information 24/7 without changing your website design.'},
      { question: 'Sounds great! How can I get started with RenAI ChatBot ?',
        answer:   'Getting started is easy! Simply register your details using our enquiry form or mail to shankar1042005@gmail.com and our team will contact you to understand your requirements and help integrate RenAI into your institutions website.'}
    ];
    const TIMING = {
      questionPause: 600,   // question shown, before the dots appear (ms)
      typingDots:    1100,  // how long the three dots bounce (ms)
      typeSpeed:     35,    // ms per letter while typing an answer
      betweenPairs:  900,   // pause before the next question appears (ms)
      restartDelay:  4000,  // all pairs shown: wait this long, then restart (ms)
      slide:         450,   // how long earlier pairs take to move upward (ms)
      scrollDebounce: 150   // restart this long after scrolling stops (ms)
    };

    const box = document.querySelector('.product-window .chat-conversation');
    if (!box) return;
    const customerTpl = box.querySelector('.customer-message');
    const assistantTpl = box.querySelector('.assistant-message');
    if (!customerTpl || !assistantTpl || !assistantTpl.querySelector('.answer-bubble')) return;
    const avatarTpl = customerTpl.querySelector('.user-avatar');
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Build one scrolling track; the original message markup is cloned for every pair. */
    const track = document.createElement('div');
    track.className = 'chat-track';
    box.replaceChildren(track);

    /* Hovering the chat box freezes everything (typing, waits, restart) until the cursor leaves it. */
    let hovering = false;
    let resumeWaiters = [];
    const win0 = box.closest('.product-window') || box;
    win0.addEventListener('mouseenter', () => { hovering = true; });
    win0.addEventListener('mouseleave', () => {
      hovering = false;
      const w = resumeWaiters; resumeWaiters = [];
      w.forEach((f) => f());
    });
    const sleep = (ms) => new Promise((r) => {
      let left = ms;
      let last = Date.now();
      (function tick() {
        const now = Date.now();
        if (!hovering) left -= now - last;
        last = now;
        if (left <= 0) return r();
        setTimeout(tick, Math.min(left, 50));
      })();
    });
    const dotsHTML = '<span class="typing-dots" role="img" aria-label="RenAI is typing"><i></i><i></i><i></i></span>';

    function makePair(item) {
      const customer = customerTpl.cloneNode(true);
      customer.textContent = item.question;
      if (avatarTpl) customer.appendChild(avatarTpl.cloneNode(true));
      const assistant = assistantTpl.cloneNode(true);
      const bubble = assistant.querySelector('.answer-bubble');
      bubble.replaceChildren();
      const p = document.createElement('p');
      p.textContent = item.answer;
      bubble.appendChild(p);
      return { customer, assistant, bubble, p };
    }

    /* The chat box is sized to fit inside the hero stage, so the blue moving-text bar below stays visible.
       Content is anchored to the bottom: each new message pushes earlier ones upward, and when there is
       no space left the oldest pair slides up and hides behind the top edge (with a soft fade). */
    const stage = box.closest('.hero-stage');
    const win = box.closest('.product-window');
    let viewHeight = 0;     // visible height for messages inside the box
    function measure() {
      box.style.height = '';
      box.style.overflow = '';
      track.style.cssText = '';
      track.replaceChildren();
      DEMO_CHAT.forEach((item) => {
        const pair = makePair(item);
        track.append(pair.customer, pair.assistant);
      });
      const cs = getComputedStyle(box);
      const padV = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      let boxHeight = box.offsetHeight;                    // natural height: all pairs shown
      if (stage && win) {
        const chrome = win.offsetHeight - box.offsetHeight; // header, window bar, input, footer
        const tilt = Math.ceil(win.offsetWidth * 0.03);     // allowance for the window's slight rotation
        const room = stage.clientHeight - win.offsetTop - chrome - tilt - 10;
        const minBox = padV + 300;                           // always keep at least one full pair readable
        boxHeight = Math.min(boxHeight, Math.max(room, minBox));
      }
      box.style.height = boxHeight + 'px';
      box.style.overflow = 'hidden';
      box.style.position = 'relative';
      viewHeight = boxHeight - padV;
      track.replaceChildren();
      track.style.position = 'absolute';
      track.style.left = cs.paddingLeft;
      track.style.right = cs.paddingRight;
      track.style.top = cs.paddingTop;
    }
    function updateOffset(instant) {
      const shift = viewHeight - track.offsetHeight;       // negative once content is taller than the box
      track.style.transition = instant || reduceMotion ? 'none' : 'transform ' + TIMING.slide + 'ms ease';
      track.style.transform = 'translateY(' + shift + 'px)';
    }

    /* Keep the track anchored while the answer grows line by line. */
    const grow = typeof ResizeObserver === 'function' ? new ResizeObserver(() => updateOffset(false)) : null;
    if (grow) grow.observe(track);

    let runId = 0;
    async function play() {
      const id = ++runId;
      const alive = () => id === runId;
      track.replaceChildren();
      updateOffset(true);
      for (const item of DEMO_CHAT) {
        const pair = makePair(item);
        pair.customer.classList.add('demo-hidden');
        pair.assistant.classList.add('demo-hidden');
        pair.bubble.innerHTML = dotsHTML;
        track.append(pair.customer);                       // 1. visitor question
        updateOffset(false);
        void pair.customer.offsetWidth;
        pair.customer.classList.remove('demo-hidden');
        await sleep(TIMING.questionPause);
        if (!alive()) return;
        track.append(pair.assistant);                      // 2. typing dots
        updateOffset(false);
        void pair.assistant.offsetWidth;
        pair.assistant.classList.remove('demo-hidden');
        await sleep(TIMING.typingDots);
        if (!alive()) return;
        pair.bubble.replaceChildren(pair.p);               // 3. answer, letter by letter
        pair.p.textContent = '';
        if (reduceMotion) {
          pair.p.textContent = item.answer;
        } else {
          for (let n = 1; n <= item.answer.length; n++) {
            pair.p.textContent = item.answer.slice(0, n);
            await sleep(TIMING.typeSpeed);
            if (!alive()) return;
          }
        }
        await sleep(TIMING.betweenPairs);
        if (!alive()) return;
      }
      await sleep(TIMING.restartDelay);                    // 4. all pairs visible, then loop
      if (!alive()) return;
      play();
    }

    function start() {
      runId++;
      measure();
      play();
    }
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);

    /* Scrolling restarts the chat only after the visitor has moved 2 pages down (2 screen heights),
       and only once per trip down: it re-arms when they come back above that point. The chat also
       restarts by itself a few seconds after the last answer (TIMING.restartDelay). */
    const RESET_PAGES = 2;
    let armed = true;
    window.addEventListener('scroll', () => {
      const passed = window.pageYOffset >= window.innerHeight * RESET_PAGES;
      if (passed && armed) { armed = false; runId++; play(); }
      else if (!passed && window.pageYOffset < window.innerHeight * RESET_PAGES - 20) armed = true;
    }, { passive: true });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(start, 250);
    });
  })();

});
