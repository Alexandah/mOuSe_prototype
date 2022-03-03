import {
  getChildrenWithClass,
  getChildWithClass,
  makeSpan,
  removeNode,
} from "./helpers.js";
import { PROHIBIT_SELECTION } from "./constants.js";

const elementsRejectingSpanChildren = ["INPUT"];
function canHaveSpanChildren(element) {
  return !elementsRejectingSpanChildren.includes(element.nodeName);
}

export default class Stickynote {
  constructor(element, text, noteClass = "registerNote") {
    this.stuckOn = element;
    this.noteClass = noteClass;
    console.log("stuck on", element);
    console.log("node name", element.nodeName);
    console.log("can have span kids ", canHaveSpanChildren(element));
    if (canHaveSpanChildren(this.stuckOn)) {
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
    } else {
      var parentElement = this.stuckOn.parentElement;

      var hasNoteHolder =
        getChildrenWithClass(parentElement, "noteHolder").length > 0;
      if (!hasNoteHolder) {
        var elementIsPositioned = parentElement.style.position != "";
        if (!elementIsPositioned) this.addInertPositioning(parentElement);
        this.noteHolder = makeSpan("", parentElement);
        this.noteHolder.setAttribute("class", "noteHolder");
        this.noteHolder.setAttribute(
          "style",
          "position: absolute; top: " +
            this.stuckOn.offsetTop +
            "px; left: " +
            this.stuckOn.offsetLeft +
            "px;"
        );
        console.log(
          "offset of stuckOn ",
          this.stuckOn.offsetTop,
          this.stuckOn.offsetLeft
        );
        this.noteHolder.setAttribute(PROHIBIT_SELECTION, "");
      } else this.noteHolder = getChildWithClass(parentElement, "noteHolder");
      this.note = makeSpan(text, this.noteHolder);
      this.note.setAttribute("class", this.noteClass);
      this.note.setAttribute(PROHIBIT_SELECTION, "");
    }
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
      var elementToRestorePositioning = canHaveSpanChildren(this.stuckOn)
        ? this.noteHolder
        : this.noteHolder.parentElement;
      this.removeInertPositioning(elementToRestorePositioning);
      removeNode(this.noteHolder);
    }
  }
}
