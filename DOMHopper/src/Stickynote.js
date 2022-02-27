import {
  getChildrenWithClass,
  getChildWithClass,
  makeSpan,
  removeNode,
} from "./helpers.js";
import { PROHIBIT_SELECTION } from "./constants.js";

export default class Stickynote {
  constructor(element, text, noteClass = "registerNote") {
    this.stuckOn = element;
    this.noteClass = noteClass;
    var hasNoteHolder =
      getChildrenWithClass(this.stuckOn, "noteHolder").length > 0;
    if (!hasNoteHolder) {
      var elementIsPositioned = this.stuckOn.style.position != "";
      console.log("stuckOn style.position", this.stuckOn.style.position);
      console.log("elementIsPositioned", elementIsPositioned);
      if (!elementIsPositioned) this.addInertPositioning(this.stuckOn);
      this.noteHolder = makeSpan("", this.stuckOn);
      this.noteHolder.setAttribute("class", "noteHolder");
      this.noteHolder.setAttribute(PROHIBIT_SELECTION, "");
    } else this.noteHolder = getChildWithClass(element, "noteHolder");
    this.note = makeSpan(text, this.noteHolder);
    this.note.setAttribute("class", this.noteClass);
    this.note.setAttribute(PROHIBIT_SELECTION, "");
  }

  addInertPositioning(element) {
    element.style.position = "relative";
    element.style.top = "0";
    element.style.left = "0";
  }
  removeInertPositioning(element) {
    element.style.position = "";
    element.style.top = "";
    element.style.left = "";
  }

  unstick() {
    removeNode(this.note);
    var hasNotesLeft =
      getChildrenWithClass(this.noteHolder, this.noteClass).length > 0;
    if (!hasNotesLeft) {
      removeNode(this.noteHolder);
      this.removeInertPositioning(this.stuckOn);
    }
  }
}
