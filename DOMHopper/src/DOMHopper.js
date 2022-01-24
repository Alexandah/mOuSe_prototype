import "helpers";
import "constants";

export class DOMHopper {
  constructor() {
    this.root = getTag("body");
    this.selected = null;
    this.selected = this.setSelected(root);
    this.selectedDOMLvl = 0;
  }

  distanceFromRoot(element) {
    if (element === root) return 0;
    else return 1 + distanceFromRoot(element.parent);
  }

  traverseDOMSubtree(node, func) {
    func(node);
    if (parentNode.hasChildNodes()) {
      node.childNodes.forEach((child) => {
        traverseDOMSubtree(child, func);
      });
    }
  }

  getDOMLvlElements(lvl) {
    var selectedDOMLvlElements = [];
    const grabIfOnSelectedDOMLvl = (node) => {
      if (distanceFromRoot(node) == lvl) selectedDOMLvlElements.push(node);
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
    var nextDOMLvlElements = this.getDOMLvlElements(this.selectedDOMLvl + 1);
    var hasNextDOMLvl = nextDOMLvlElements > 0;
    if (!hasNextDOMLvl) return;
    this.selectedDOMLvl++;
    var selectedHasChild = this.selected.hasChildNodes();
    var descendant = selectedHasChild
      ? this.selected.firstChild
      : nextDOMLvlElements[this.selectedDOMLvl][0];
    this.setSelected(descendant);
  }
}
