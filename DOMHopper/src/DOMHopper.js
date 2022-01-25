import { getTag } from "./helpers.js";
import { ORANGE_OUTLINE_COLOR } from "./constants.js";

export default class DOMHopper {
  constructor() {
    this.root = getTag("body");
    this.selected = null;
    this.selected = this.setSelected(this.root);
    this.selectedDOMLvl = 0;
  }

  distanceFromRoot(element) {
    if (element === undefined) return 0;
    if (element === this.root) return 0;
    else return 1 + this.distanceFromRoot(element.parent);
  }

  traverseDOMSubtree(node, func) {
    func(node);
    if (node.hasChildNodes()) {
      node.childNodes.forEach((child) => {
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
    console.log("setting selected for: ", this);
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
      var elementsAbove = this.getSelectedDOMLvlElements().filter(dirFunc);
      var jumpTo = this.getElementClosestToSelectedFrom(elementsAbove);
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
    if (this.selectedDOMLvl == 0) return;
    this.selectedDOMLvl--;
    var parent = this.selected.parent;
    this.setSelected(parent);
  }
  moveSelectionLvlDown() {
    console.log("moving selection lvl down. current state: ", this);
    var nextDOMLvlElements = this.getDOMLvlElements(this.selectedDOMLvl + 1);
    console.log("elements in the next DOM lvl: ", nextDOMLvlElements);
    var hasNextDOMLvl = nextDOMLvlElements.length > 0;
    if (!hasNextDOMLvl) return;
    this.selectedDOMLvl++;
    console.log("this is: ", this);
    console.log("currently selected: ", this.selected);
    var selectedHasChild = this.selected.hasChildNodes();
    var descendant = selectedHasChild
      ? this.selected.firstChild
      : nextDOMLvlElements[this.selectedDOMLvl][0];
    console.log("selection moved down to: ", descendant);
    this.setSelected(descendant);
  }
}
