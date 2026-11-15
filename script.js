const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#messageInput');
const conversation = document.querySelector('#conversation');
const sendButton = document.querySelector('#sendButton');
const lockScreen = document.querySelector('#lockScreen');
const passcodeScreen = document.querySelector('#passcodeScreen');
const homeScreen = document.querySelector('#homeScreen');
const messenger = document.querySelector('#messenger');
const unlockPhoneButton = document.querySelector('#unlockPhone');
const passcodeClock = document.querySelector('#passcodeClock');
const passcodeDots = document.querySelector('#passcodeDots');
const passcodeMessage = document.querySelector('#passcodeMessage');
const cancelPasscodeButton = document.querySelector('#cancelPasscode');
const emergencyButton = document.querySelector('#emergencyButton');
const openMessengerButton = document.querySelector('#openMessenger');
const backHomeButton = document.querySelector('#backHome');
const lockClock = document.querySelector('#lockClock');
const lockDate = document.querySelector('#lockDate');
const homeClock = document.querySelector('#homeClock');
const phonePasscode = '012191';

function updateHomeClock() {
  const now = new Date();
  const time = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: 'h23'
  }).format(now);
  lockClock.textContent = time;
  lockDate.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(now);
  homeClock.textContent = time;
  passcodeClock.textContent = time;
}

function unlockPhone() {
  lockScreen.hidden = true;
  passcodeScreen.hidden = false;
  passcodeScreen.querySelector('[data-digit="1"]').focus({ preventScroll: true });
}

let swipeStartY = null;

lockScreen.addEventListener('pointerdown', (event) => {
  swipeStartY = event.clientY;
});

lockScreen.addEventListener('pointerup', (event) => {
  if (swipeStartY !== null && swipeStartY - event.clientY > 50) {
    unlockPhone();
  }
  swipeStartY = null;
});

lockScreen.addEventListener('pointercancel', () => {
  swipeStartY = null;
});

unlockPhoneButton.addEventListener('click', unlockPhone);

let enteredPasscode = '';

function renderPasscode() {
  const dots = passcodeDots.querySelectorAll('.passcode-dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('filled', index < enteredPasscode.length);
  });
  passcodeDots.setAttribute('aria-label', `${enteredPasscode.length} of 6 digits entered`);
}

function addPasscodeDigit(digit) {
  if (enteredPasscode.length >= 6) {
    return;
  }

  enteredPasscode += digit;
  passcodeMessage.textContent = '';
  passcodeScreen.classList.remove('shake');
  renderPasscode();

  if (enteredPasscode.length === 6) {
    if (enteredPasscode === phonePasscode) {
      enteredPasscode = '';
      renderPasscode();
      passcodeScreen.hidden = true;
      homeScreen.hidden = false;
      openMessengerButton.focus();
      return;
    }

    passcodeMessage.textContent = 'Incorrect passcode. Try again.';
    passcodeScreen.classList.remove('shake');
    void passcodeScreen.offsetWidth;
    passcodeScreen.classList.add('shake');
    enteredPasscode = '';
    renderPasscode();
  }
}

passcodeScreen.querySelectorAll('[data-digit]').forEach((key) => {
  key.addEventListener('click', () => addPasscodeDigit(key.dataset.digit));
});

document.querySelector('#deleteDigit').addEventListener('click', () => {
  enteredPasscode = enteredPasscode.slice(0, -1);
  passcodeMessage.textContent = '';
  renderPasscode();
});

cancelPasscodeButton.addEventListener('click', () => {
  enteredPasscode = '';
  passcodeMessage.textContent = '';
  renderPasscode();
  passcodeScreen.hidden = true;
  lockScreen.hidden = false;
  unlockPhoneButton.focus();
});

emergencyButton.addEventListener('click', () => {
  passcodeMessage.textContent = 'Emergency calling is not available in this preview.';
});

document.addEventListener('keydown', (event) => {
  if (passcodeScreen.hidden) {
    return;
  }

  if (/^\d$/.test(event.key)) {
    addPasscodeDigit(event.key);
  } else if (event.key === 'Backspace') {
    enteredPasscode = enteredPasscode.slice(0, -1);
    passcodeMessage.textContent = '';
    renderPasscode();
  } else if (event.key === 'Escape') {
    cancelPasscodeButton.click();
  }
});

function openMessengerConversation() {
  homeScreen.hidden = true;
  messenger.hidden = false;
  messageInput.focus();
}

openMessengerButton.addEventListener('click', openMessengerConversation);

backHomeButton.addEventListener('click', () => {
  messenger.hidden = true;
  homeScreen.hidden = false;
  openMessengerButton.focus();
});

updateHomeClock();
window.setInterval(updateHomeClock, 60_000);

function updateSendButton() {
  const hasText = messageInput.value.trim().length > 0;
  sendButton.classList.toggle('has-text', hasText);
  sendButton.setAttribute('aria-label', hasText ? 'Send message' : 'Send a like');
  sendButton.title = hasText ? 'Send message' : 'Send a like';
}

const quickReactions = ['❤️', '😆', '😮', '😢', '😡', '👍'];
const moreReactions = ['🥰', '🔥', '🎉', '😍', '🙏', '👏'];

function addReactionControls(row, bubble) {
  const bubbleWrap = document.createElement('div');
  bubbleWrap.className = 'bubble-wrap';
  if (bubble.parentElement) {
    bubble.replaceWith(bubbleWrap);
  }
  bubbleWrap.append(bubble);

  const reactionButton = document.createElement('button');
  reactionButton.className = 'reaction-trigger';
  reactionButton.type = 'button';
  reactionButton.setAttribute('aria-label', 'Add reaction');
  reactionButton.title = 'Add reaction';
  reactionButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="11.5" r="7.5"></circle><path d="M8 13.5s.8 1.5 2.5 1.5 2.5-1.5 2.5-1.5M8 9h.01M13 9h.01M19 15v6m-3-3h6"></path></svg>';

  const picker = document.createElement('div');
  picker.className = 'reaction-picker';
  picker.hidden = true;
  picker.setAttribute('aria-label', 'Choose a reaction');

  const chip = document.createElement('button');
  chip.className = 'reaction-chip';
  chip.type = 'button';
  chip.hidden = true;
  chip.setAttribute('aria-label', 'Remove reaction');

  function chooseReaction(emoji) {
    chip.textContent = emoji;
    chip.hidden = false;
    picker.hidden = true;
  }

  function addReactionOptions(choices, parent) {
    choices.forEach((emoji) => {
      const option = document.createElement('button');
      option.className = 'reaction-option';
      option.type = 'button';
      option.textContent = emoji;
      option.setAttribute('aria-label', `React ${emoji}`);
      option.addEventListener('click', (event) => {
        event.stopPropagation();
        chooseReaction(emoji);
      });
      parent.append(option);
    });
  }

  const quickOptions = document.createElement('div');
  quickOptions.className = 'quick-reactions';
  addReactionOptions(quickReactions, quickOptions);

  const moreButton = document.createElement('button');
  moreButton.className = 'reaction-option more-reactions-button';
  moreButton.type = 'button';
  moreButton.textContent = '+';
  moreButton.setAttribute('aria-label', 'More reactions');

  const moreOptions = document.createElement('div');
  moreOptions.className = 'more-reactions';
  moreOptions.hidden = true;
  addReactionOptions(moreReactions, moreOptions);
  moreButton.addEventListener('click', (event) => {
    event.stopPropagation();
    moreOptions.hidden = !moreOptions.hidden;
  });

  picker.append(quickOptions, moreButton, moreOptions);
  reactionButton.addEventListener('click', (event) => {
    event.stopPropagation();
    document.querySelectorAll('.reaction-picker:not([hidden])').forEach((openPicker) => {
      if (openPicker !== picker) {
        openPicker.hidden = true;
      }
    });
    picker.hidden = !picker.hidden;
  });

  chip.addEventListener('click', (event) => {
    event.stopPropagation();
    chip.hidden = true;
  });

  bubbleWrap.append(reactionButton, picker, chip);
  row.append(bubbleWrap);
  row.addEventListener('click', (event) => {
    if (!bubbleWrap.contains(event.target)) {
      picker.hidden = true;
    }
  });
}

conversation.querySelectorAll('.message-row:not(.typing):not(.historical-message)').forEach((row) => {
  const bubble = row.querySelector('.bubble');
  if (bubble) {
    addReactionControls(row, bubble);
  }
});

conversation.querySelectorAll('.history-video').forEach((videoWrap) => {
  const video = videoWrap.querySelector('.history-video-player');
  const playButton = videoWrap.querySelector('.history-video-play');
  const status = videoWrap.querySelector('.history-video-status');

  playButton.addEventListener('click', async () => {
    if (video.paused) {
      try {
        await video.play();
      } catch (error) {
        status.textContent = `Video playback failed: ${error.message}`;
        status.hidden = false;
        playButton.disabled = true;
        playButton.setAttribute('aria-label', 'Video unavailable');
        return;
      }
      videoWrap.classList.add('is-playing');
      playButton.setAttribute('aria-label', 'Pause video message');
      playButton.textContent = 'Ⅱ';
      return;
    }

    video.pause();
    videoWrap.classList.remove('is-playing');
    playButton.setAttribute('aria-label', 'Play video message');
    playButton.textContent = '▶';
  });

  video.addEventListener('ended', () => {
    videoWrap.classList.remove('is-playing');
    playButton.setAttribute('aria-label', 'Replay video message');
    playButton.textContent = '↻';
  });

  video.addEventListener('error', () => {
    videoWrap.classList.add('video-error');
    status.textContent = 'Video could not be loaded in this preview.';
    status.hidden = false;
    playButton.disabled = true;
    playButton.setAttribute('aria-label', 'Video unavailable');
    videoWrap.setAttribute('aria-label', 'Video message could not be loaded');
  });
});

function addMessage(text, direction) {
  const row = document.createElement('div');
  row.className = `message-row ${direction}`;

  if (direction === 'incoming') {
    const avatar = document.createElement('img');
    avatar.className = 'avatar avatar-small';
    avatar.src = 'images/profile.jpg';
    avatar.alt = '';
    row.append(avatar);
  }

  const bubble = document.createElement('p');
  bubble.className = 'bubble';
  bubble.textContent = text;
  addReactionControls(row, bubble);
  conversation.append(row);
  conversation.scrollTop = conversation.scrollHeight;
}

const scriptedReplies = [
  'yow hello po ma’am! sa wakas nag-reply rin hahahaahaa',
  'joke lng ma’am, may sasabihin tlga ako',
  `thank u thank u ma’am dahil nakilala ko tlga kayo. Wag ka magagalit ma’am hahahaha kasi nung first yr sec sem, di po kmi namemeet ni sir Gel kaya there was a time na kayo ung substitute for that certain time. Prior to that moment ma’am, binalaan kasi kmi ni sir Alex na kung gano raw sya kabait, ganun daw po kayo kasungit. So nung hapon na time nmin na supposedly si sir gel na kayo po ung magtuturo muna raw, i decided not to pasok sa inyo ma’am hahahaha sorry po. Takot yarn!😂😂. Then here goes 2nd yr, my first meeting with u ma’am, sobrang kabado ako ma’am tas nagpa-lab pa kayo non eh wla akong alam sa ws hahahha. Pero nung mga sumunod na meeting, hindi nmn pla tlga masungit si ma’am roan. Naging comfortable na rin ako sa room tas sainyo ma’am. Tas nuong mga una una pa pla, patulog tulog pako, pero di kayo nagalit ma’am, tinanong nyo pa ko after class kung ok lang ba ako. That question touched something in me ma’am. Thank you po!❤️.\n\nang first impression nga tlaga ay hindi totoo. We really need to be with the person to really know them.\n\nThank you so much ma’am!!!!❤️❤️❤️`,
  'yun lang po ma’am, thank u;>>>'
];
const replyQueue = [];
let nextReplyIndex = 0;
let isTypingReply = false;
let isAwaitingFollowUpReply = false;
let hasSentFollowUpMessage = false;
const followUpMessage = 'kung marami tlga kayong pera ma’am, bka naman, dji action 4 lang or iphone 18 lang.';
const followUpReply = 'joke lng po ma’am hahahahahahahahhahahahahhahahahahah';

function showTypingIndicator(message, isFollowUp = false) {
  const typingRow = document.createElement('div');
  typingRow.className = 'message-row incoming typing';
  typingRow.setAttribute('aria-label', 'Kim is typing');

  const avatar = document.createElement('img');
  avatar.className = 'avatar avatar-small';
  avatar.src = 'images/profile.jpg';
  avatar.alt = '';

  const typingBubble = document.createElement('div');
  typingBubble.className = 'bubble';
  typingBubble.setAttribute('aria-hidden', 'true');
  typingBubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';

  typingRow.append(avatar, typingBubble);
  conversation.append(typingRow);
  conversation.scrollTop = conversation.scrollHeight;

  window.setTimeout(() => {
    typingRow.remove();
    addMessage(message, 'incoming');
    if (isFollowUp) {
      isAwaitingFollowUpReply = true;
    }
    isTypingReply = false;
    if (!isFollowUp && !hasSentFollowUpMessage && replyQueue.length === 0 && nextReplyIndex === scriptedReplies.length) {
      hasSentFollowUpMessage = true;
      isTypingReply = true;
      showTypingIndicator(followUpMessage, true);
      return;
    }
    showNextReply();
  }, 900);
}

function showNextReply() {
  if (isTypingReply || replyQueue.length === 0) {
    return;
  }

  isTypingReply = true;
  showTypingIndicator(replyQueue.shift());
}

messageInput.addEventListener('input', () => {
  messageInput.style.height = 'auto';
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 140)}px`;
  updateSendButton();
});

messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    messageForm.requestSubmit();
  }
});

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();

  if (!message) {
    addMessage('👍', 'outgoing');
    return;
  }

  addMessage(message, 'outgoing');
  messageInput.value = '';
  messageInput.style.height = 'auto';
  updateSendButton();
  messageInput.focus();

  if (isAwaitingFollowUpReply) {
    isAwaitingFollowUpReply = false;
    replyQueue.push(followUpReply);
    showNextReply();
  } else if (nextReplyIndex < scriptedReplies.length) {
    replyQueue.push(scriptedReplies[nextReplyIndex]);
    nextReplyIndex += 1;
    showNextReply();
  }
});
