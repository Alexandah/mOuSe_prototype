import "helpers";
import "constants";

export class DOMHopper {
  constructor() {
    this.domLevels = {};
    var root = getTag("body");
    this.chartDOMLevels(root, 0);
    this.selected = null;
    this.selected = this.setSelected(root);
    this.selectedDOMLvl = 0;
  }

  chartDOMLevels(parentNode, lvl) {
    if (this.domLevels.hasOwnProperty(lvl)) {
      this.domLevels[lvl].push(parentNode);
    } else {
      this.domLevels[lvl] = [parentNode];
    }
    if (parentNode != null) parentNode.lvl = lvl;

    if (parentNode.hasChildNodes()) {
      for (var i = 0; i < parentNode.childNodes.length; i++) {
        this.chartDOMLevels(parentNode.childNodes[i], lvl + 1);
      }
    }
  }

  getSelectedDOMLvlElements() {
    if (this.selectedDOMLvl == null) return null;
    return this.domLevels[this.selectedDOMLvl];
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
    var parent = this.getSelectedDOMLvlElements().find(
      (element) => element === this.selected.parent
    );
    this.setSelected(parent);
  }
  moveSelectionLvlDown() {
    var hasNextDOMLvl = this.selectedDOMLvl + 1 in this.domLevels;
    if (!hasNextDOMLvl) return;
    this.selectedDOMLvl++;
    var selectedHasChild = this.selected.hasChildNodes();
    var descendant = selectedHasChild
      ? this.selected.firstChild
      : this.domLevels[this.selectedDOMLvl][0];
    this.setSelected(descendant);
  }
}
