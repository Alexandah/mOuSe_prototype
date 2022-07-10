// import "https://cdn.jsdelivr.net/gh/Alexandah/Alxndr.js@Release7.9.2022/src/Alxndr.js";
// import "https://cdn.jsdelivr.net/gh/Alexandah/Alxndr.js@b6a09ac4d0f1074841e17b5624f5344752a4be77/src/Alxndr.js";
import "https://cdn.jsdelivr.net/gh/Alexandah/Alxndr.js@v1.0/src/Alxndr.js";
import {
  addNode,
  getChildrenWithClass,
  getChildWithClass,
  removeNode,
} from "./helpers.js";
import { PROHIBIT_SELECTION } from "./constants.js";

const elementsRejectingSpanChildren = ["INPUT"];
function canHaveSpanChildren(element) {
  return !elementsRejectingSpanChildren.includes(element.nodeName);
}

export default class Stickynote {
  constructor(node, text, noteClass = "registerNote") {
    this.stuckOn = node;
    this.noteClass = noteClass;
    this.parentOfNoteHolder = canHaveSpanChildren(this.stuckOn)
      ? this.stuckOn
      : this.stuckOn.parentElement;

    this.note = span(
      {
        class: this.noteClass,
        noHop: "",
      },
      text
    );

    var hasNoteHolder =
      getChildrenWithClass(this.parentOfNoteHolder, "noteHolder").length > 0;
    if (!hasNoteHolder) {
      var parentOfNoteHolderIsPositioned =
        this.parentOfNoteHolder.style.position != "";
      if (!parentOfNoteHolderIsPositioned)
        this.addInertPositioning(this.parentOfNoteHolder);

      const mustManuallyRepositionNoteHolder =
        this.parentOfNoteHolder !== this.stuckOn;
      const style = !mustManuallyRepositionNoteHolder
        ? { position: "absolute", top: 0, left: 0 }
        : {
            position: "absolute",
            top: this.stuckOn.offsetTop + "px",
            left: this.stuckOn.offsetLeft + "px",
          };

      this.noteHolder = span(
        {
          class: "noteHolder",
          style: style,
          noHop: "",
        },
        [this.note]
      );
      addNode(this.noteHolder, this.stuckOn);
    } else {
      this.noteHolder = getChildWithClass(
        this.parentOfNoteHolder,
        "noteHolder"
      );
      addNode(this.note, this.noteHolder);
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
      removeNode(this.noteHolder);
      this.removeInertPositioning(this.parentOfNoteHolder);
    }
  }
}
