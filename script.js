(function () {
  "use strict";

  const config = window.WEDDING_CONFIG;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  let currentGuest = null;
  let player = null;
  let musicPlaying = false;

  function setText(selector, value) {
    const el = $(selector);
    if (el) el.textContent = value;
  }

  function formatDate(date, options) {
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }

  function applyConfig() {
    const date = new Date(config.weddingDate);
    const deadline = new Date(config.rsvpDeadline);
    const initials = `${config.couple.bride[0]} · ${config.couple.groom[0]}`;
    const signature = `${config.couple.bride[0]} & ${config.couple.groom[0]}`;

    ["#welcomeBride", "#heroBride", "#footerBride"].forEach((id) => setText(id, config.couple.bride));
    ["#welcomeGroom", "#heroGroom", "#footerGroom"].forEach((id) => setText(id, config.couple.groom));
    ["#welcomeMonogram", "#headerMonogram"].forEach((id) => setText(id, initials));
    setText("#storySignature", signature);
    setText("#heroMonth", formatDate(date, { month: "long" }));
    setText("#heroDay", String(date.getDate()).padStart(2, "0"));
    setText("#heroYear", date.getFullYear());
    setText("#detailsWeekday", formatDate(date, { weekday: "long" }));
    setText("#detailsFullDate", formatDate(date, { month: "long", day: "numeric", year: "numeric" }));
    setText("#detailsTime", formatDate(date, { hour: "numeric", minute: "2-digit", timeZoneName: "short" }));
    setText("#rsvpDeadline", formatDate(deadline, { month: "long", day: "numeric", year: "numeric" }));
    setText("#footerDate", `${String(date.getDate()).padStart(2, "0")} · ${String(date.getMonth() + 1).padStart(2, "0")} · ${date.getFullYear()}`);
    setText("#ceremonyName", config.ceremony.name);
    setText("#ceremonyAddress", config.ceremony.address);
    $("#ceremonyMap").href = config.ceremony.mapUrl;
    setText("#receptionName", config.reception.name);
    setText("#receptionAddress", config.reception.address);
    $("#receptionMap").href = config.reception.mapUrl;
    setText("#dressCode", config.dressCode);
    setText("#dressNote", config.dressNote);
    setText("#storyParagraph1", config.story[0]);
    setText("#storyParagraph2", config.story[1]);
    document.title = `${config.couple.bride} & ${config.couple.groom} — Wedding Invitation`;
    $("#demoNote").hidden = Boolean(config.googleScriptUrl);
  }

  function updateCountdown() {
    const distance = new Date(config.weddingDate).getTime() - Date.now();
    if (distance <= 0) {
      ["#days", "#hours", "#minutes", "#seconds"].forEach((id) => setText(id, "00"));
      setText("#countdownMessage", "Today is the day!");
      return;
    }
    const day = 86400000;
    setText("#days", String(Math.floor(distance / day)).padStart(3, "0"));
    setText("#hours", String(Math.floor((distance % day) / 3600000)).padStart(2, "0"));
    setText("#minutes", String(Math.floor((distance % 3600000) / 60000)).padStart(2, "0"));
    setText("#seconds", String(Math.floor((distance % 60000) / 1000)).padStart(2, "0"));
  }

  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player("youtubePlayer", {
      height: "1",
      width: "1",
      videoId: config.youtubeVideoId,
      playerVars: { autoplay: 0, loop: 1, playlist: config.youtubeVideoId, controls: 0 },
      events: {
        onReady: () => player.setVolume(35),
        onStateChange: (event) => {
          musicPlaying = event.data === YT.PlayerState.PLAYING;
          updateMusicButton();
        }
      }
    });
  };

  function updateMusicButton() {
    $("#musicToggle").classList.toggle("playing", musicPlaying);
    setText("#musicLabel", musicPlaying ? "Pause" : "Music");
  }

  function startMusic() {
    if (player?.playVideo) player.playVideo();
  }

  function showStep(step) {
    $$(".form-step").forEach((el) => el.classList.remove("active"));
    step.classList.add("active");
    const index = step.id === "lookupForm" ? 0 : step.id === "responseForm" ? 1 : 2;
    $$(".rsvp-progress i").forEach((el, i) => el.classList.toggle("active", i <= index));
  }

  async function lookupGuest(name) {
    if (config.googleScriptUrl) {
      const url = new URL(config.googleScriptUrl);
      url.searchParams.set("action", "lookup");
      url.searchParams.set("name", name);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Could not contact the guest list.");
      return response.json();
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
    const normalized = name.trim().toLowerCase();
    const match = config.demoGuests.find((guest) => guest.name.toLowerCase() === normalized);
    return match ? { found: true, name: match.name, pax: match.pax } : { found: false };
  }

  async function submitRsvp(payload) {
    if (config.googleScriptUrl) {
      const response = await fetch(config.googleScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "rsvp", ...payload })
      });
      if (!response.ok) throw new Error("Could not save your response.");
      return response.json();
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true };
  }

  function resetRsvp() {
    currentGuest = null;
    $("#lookupForm").reset();
    $("#responseForm").reset();
    $("#attendingFields").hidden = true;
    setText("#lookupMessage", "");
    setText("#responseMessage", "");
    showStep($("#lookupForm"));
  }

  applyConfig();
  updateCountdown();
  setInterval(updateCountdown, 1000);
  document.body.classList.add("locked");

  $("#openInvitation").addEventListener("click", () => {
    $("#welcome").classList.add("is-hidden");
    document.body.classList.remove("locked");
    startMusic();
  });

  $("#musicToggle").addEventListener("click", () => {
    if (!player) return;
    musicPlaying ? player.pauseVideo() : player.playVideo();
  });

  window.addEventListener("scroll", () => {
    $("#siteHeader").classList.toggle("scrolled", window.scrollY > 80);
  }, { passive: true });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((el) => observer.observe(el));

  $("#lookupForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = $("#guestName").value.trim();
    const button = event.submitter;
    button.disabled = true;
    button.firstChild.textContent = "Searching… ";
    setText("#lookupMessage", "");
    try {
      const result = await lookupGuest(name);
      if (!result.found) {
        setText("#lookupMessage", "We couldn’t find that exact name. Please check the spelling or contact the couple.");
        return;
      }
      currentGuest = { name: result.name, pax: Number(result.pax) };
      setText("#foundGuestName", currentGuest.name);
      setText("#allowedPax", `${currentGuest.pax} ${currentGuest.pax === 1 ? "seat" : "seats"}`);
      $("#attendingPax").innerHTML = Array.from({ length: currentGuest.pax }, (_, i) =>
        `<option value="${i + 1}">${i + 1}</option>`
      ).join("");
      showStep($("#responseForm"));
    } catch (error) {
      setText("#lookupMessage", error.message || "Something went wrong. Please try again.");
    } finally {
      button.disabled = false;
      button.firstChild.textContent = "Find my invitation ";
    }
  });

  $$('input[name="attendance"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      $("#attendingFields").hidden = radio.value !== "Yes";
      $("#attendingPax").required = radio.value === "Yes";
    });
  });

  $("#responseForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const attendance = form.get("attendance");
    const payload = {
      name: currentGuest.name,
      invitedPax: currentGuest.pax,
      attendance,
      attendingPax: attendance === "Yes" ? Number(form.get("attendingPax")) : 0,
      accompanyingGuests: form.get("guestNames")?.trim() || "",
      message: form.get("message")?.trim() || ""
    };
    const button = event.submitter;
    button.disabled = true;
    button.firstChild.textContent = "Sending… ";
    setText("#responseMessage", "");
    try {
      const result = await submitRsvp(payload);
      if (!result.success) throw new Error(result.message || "Could not save your response.");
      setText("#successName", currentGuest.name.split(" ")[0]);
      setText("#successCopy", attendance === "Yes"
        ? "Your RSVP has been saved. We cannot wait to celebrate with you."
        : "Your response has been saved. You will be in our thoughts on our special day.");
      showStep($("#successStep"));
    } catch (error) {
      setText("#responseMessage", error.message || "Something went wrong. Please try again.");
    } finally {
      button.disabled = false;
      button.firstChild.textContent = "Send my RSVP ";
    }
  });

  $("#backToLookup").addEventListener("click", resetRsvp);
  $("#submitAnother").addEventListener("click", resetRsvp);
})();
