import {
  getTag,
  getElementChildren,
  hasElementChildren,
  excludeScripts,
} from "./helpers.js";
import { ORANGE_OUTLINE_COLOR } from "./constants.js";

export default class DOMHopper {
  constructor() {
    this.root = getTag("body");
    this.selected = this.root;
    this.selected.oldBorder = this.selected.style.border;
    this.selected.style.border = "1px solid " + ORANGE_OUTLINE_COLOR;
    this.selectedDOMLvl = 0;
  }

  distanceFromRoot(element) {
    if (element === undefined) return 0;
    if (element === this.root) return 0;
    else return 1 + this.distanceFromRoot(element.parentElement);
  }

  traverseDOMSubtree(node, func) {
    func(node);
    if (hasElementChildren(node)) {
      excludeScripts(getElementChildren(node)).forEach((child) => {
        this.traverseDOMSubtree(child, func);
      });
    }
  }

  getDOMLvlElements(lvl) {
    var selectedDOMLvlElements = [];
    const grabIfOnSelectedDOMLvl = (node) => {
      if (this.distanceFromRoot(node) == lvl) selectedDOMLvlElements.push(node);
    };
    this.traverseDOMSubtree(this.root, grabIfOnSelectedDOMLvl);
    return selectedDOMLvlElements;
  }

  getSelectedDOMLvlElements() {
    if (this.selectedDOMLvl == null) return null;
    return this.getDOMLvlElements(this.selectedDOMLvl);
  }

  setSelected(element) {
    if (element !== this.selected) element.oldBorder = element.style.border;
    if (this.selected != null)
      this.selected.style.border = this.selected.oldBorder;
    element.style.border = "1px solid " + ORANGE_OUTLINE_COLOR;
    this.selected = element;
    console.log("set selected to: ", this.selected);
  }

  getElementClosestToSelectedFrom(elements) {
    var closest = null;
    var closestDistance = Infinity;
    elements.forEach((element) => {
      var distance =
        Math.abs(element.x - this.selected.x) +
        Math.abs(element.y - this.selected.y);
      if (distance < closestDistance) {
        closest = element;
        closestDistance = distance;
      }
    });
    if (closest == null) return this.selected;
    else return closest;
  }

  jump(dirFunc) {
    if (this.selected != null) {
      this.getSelectedDOMLvlElements().
      var elementsInDir = this.getSelectedDOMLvlElements().filter(dirFunc);
      console.log("jumping towards elements: ", elementsInDir);
      var jumpTo = this.getElementClosestToSelectedFrom(elementsInDir);
      this.setSelected(jumpTo);
    }
  }
  jumpUp() {
    this.jump((element) => element.y < this.selected.y);
  }
  jumpDown() {
    this.jump((element) => element.y > this.selected.y);
  }
  jumpLeft() {
    this.jump((element) => element.x < this.selected.x);
  }
  jumpRight() {
    this.jump((element) => element.x > this.selected.x);
  }

  moveSelectionLvlUp() {
    console.log("moving selection lvl up. current state: ", this);
    let atTop = this.selected === this.root;
    if (atTop) return;
    this.selectedDOMLvl--;
    console.log("new selection lvl: ", this.selectedDOMLvl);
    var parent = this.selected.parentElement;
    console.log("parent to move to: ", parent);
    this.setSelected(parent);
  }
  moveSelectionLvlDown() {
    console.log("moving selection lvl down. current state: ", this);
    var nextDOMLvlElements = this.getDOMLvlElements(this.selectedDOMLvl + 1);
    console.log("elements in the next DOM lvl: ", nextDOMLvlElements);
    var hasNextDOMLvl = nextDOMLvlElements.length > 0;
    if (!hasNextDOMLvl) return;
    this.selectedDOMLvl++;
    var selectedHasChild = hasElementChildren(this.selected);
    var descendant = selectedHasChild
      ? getElementChildren(this.selected)[0]
      : nextDOMLvlElements[this.selectedDOMLvl][0];
    console.log("selection moved down to: ", descendant);
    console.log("new selection lvl: ", this.selectedDOMLvl);
    this.setSelected(descendant);
  }
}
