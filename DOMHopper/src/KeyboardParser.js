export default class KeyboardParser {
  constructor(pressFadeTime = 200, maxDuplicatePresses = 2) {
    this.ctrl = false;
    this.shift = false;
    this.alt = false;
    this.meta = false;
    this.keysActive = {};
    this.pressFadeTime = pressFadeTime;
    this.maxDuplicatePresses = maxDuplicatePresses;
    document.addEventListener("keydown", (event) => {
      var key = this.parseCurrentKeyEvent(event).toLowerCase();
      this.log(key, event);
    });
  }

  keys() {
    var keys = [];
    Object.keys(this.keysActive).forEach((key) => {
      var timesPressed = this.keysActive[key].timesPressed;
      for (var i = 0; i < timesPressed; i++) {
        keys.push(key);
      }
    });
    return keys.filter((key) => key !== "null");
  }

  log(key, keyEvent) {
    var keyIsInactive = !(key in this.keysActive);
    if (keyIsInactive) {
      this.keysActive[key] = { timesPressed: 1 };
      this.fade(key);
    } else {
      var keyIsBeingHeldDown = keyEvent.repeat;
      var keyAllowsMoreMultiPresses =
        this.keysActive[key].timesPressed < this.maxDuplicatePresses;
      if (!keyIsBeingHeldDown && keyAllowsMoreMultiPresses) {
        this.keysActive[key].timesPressed++;
      }
    }
  }

  fade(key) {
    setTimeout(() => {
      var keyIsActive = key in this.keysActive;
      if (keyIsActive) {
        this.deactivate(key);
      }
    }, this.pressFadeTime);
  }

  deactivate(key) {
    delete this.keysActive[key];
  }

  parseCurrentKeyEvent(event) {
    var key = event.key;
    switch (key) {
      case "Control":
      case "Shift":
      case "Alt":
      case "Meta":
        key = null;
        break;
      default:
        key = key.toLowerCase();
        break;
    }
    this.ctrl = event.ctrlKey;
    this.shift = event.shiftKey;
    this.alt = event.altKey;
    this.meta = event.metaKey;
    return key;
  }
}
