import {
  getTag,
  getElementChildren,
  hasElementChildren,
  excludeScripts,
  isEditable,
  isLink,
  getOriginalPosition,
  leftClick,
  rightClick,
  ctrlLeftClick,
} from "./helpers.js";
import { ORANGE_OUTLINE_COLOR, GREEN_OUTLINE_COLOR } from "./constants.js";

const SELECTED_BORDER = "9px solid " + ORANGE_OUTLINE_COLOR;
const SEARCH_HIGHLIGHT_BORDER = "1px solid " + GREEN_OUTLINE_COLOR;

export default class DOMHopper {
  constructor() {
    this.root = getTag("body");
    this.traverseDOMSubtree(this.root, (node) => {
      getOriginalPosition(node);
    });
    this.selected = this.root;
    this.selected.oldBorder = this.selected.style.border;
    this.selected.style.border = SELECTED_BORDER;
    this.selectedDOMLvl = 0;
    this.editingMode = false;
    this.searchMode = false;
    this.searchMatches = [];
    this.registers = {
      r0: null,
      r1: null,
      r2: null,
      r3: null,
      r4: null,
      r5: null,
      r6: null,
      r7: null,
      r8: null,
      r9: null,
    };
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
    element.style.border = SELECTED_BORDER;
    this.selected = element;
    this.selected.scrollIntoView();
    console.log(this.selected.attributes);
  }

  getElementClosestToSelectedFrom(elements) {
    var closest = null;
    var closestDistance = Infinity;
    elements.forEach((element) => {
      var distance =
        Math.abs(
          getOriginalPosition(element).x - getOriginalPosition(this.selected).x
        ) +
        Math.abs(
          getOriginalPosition(element).y - getOriginalPosition(this.selected).y
        );
      if (distance < closestDistance) {
        closest = element;
        closestDistance = distance;
      }
    });
    if (closest == null) return this.selected;
    else return closest;
  }

  jump(dirFunc) {
    if (this.editingMode) return;
    if (this.selected != null) {
      var elementsInDir = this.getSelectedDOMLvlElements().filter(dirFunc);
      var jumpTo = this.getElementClosestToSelectedFrom(elementsInDir);

      // var foundNewDestination = jumpTo !== this.selected;
      // var nowhereElseToJump = false;
      // var r = 1;
      // while (!nowhereElseToJump && !foundNewDestination) {
      //   var lvlBelow = this.selectedDOMLvl + r;
      //   var elementsInLvlBelow = this.getDOMLvlElements(lvlBelow);
      //   var hasElementsInLvlBelow = elementsInLvlBelow.length > 0;
      //   if (hasElementsInLvlBelow) {
      //     elementsInDir = elementsInLvlBelow.filter(dirFunc);
      //     jumpTo = this.getElementClosestToSelectedFrom(elementsInDir);
      //     foundNewDestination = jumpTo !== this.selected;
      //   }

      //   var lvlAbove = this.selectedDOMLvl - r;
      //   var elementsInLvlAbove = this.getDOMLvlElements(lvlAbove);
      //   var hasElementsInLvlAbove = elementsInLvlAbove.length > 0;
      //   if (hasElementsInLvlAbove) {
      //     elementsInDir = elementsInLvlAbove.filter(dirFunc);
      //     jumpTo = this.getElementClosestToSelectedFrom(elementsInDir);
      //     foundNewDestination = jumpTo !== this.selected;
      //   }

      //   nowhereElseToJump = !hasElementsInLvlAbove && !hasElementsInLvlBelow;
      //   r++;
      // }
      this.setSelected(jumpTo);
    }
  }
  jumpUp() {
    this.jump(
      (element) =>
        getOriginalPosition(element).y < getOriginalPosition(this.selected).y
    );
  }
  jumpDown() {
    this.jump(
      (element) =>
        getOriginalPosition(element).y > getOriginalPosition(this.selected).y
    );
  }
  jumpLeft() {
    this.jump(
      (element) =>
        getOriginalPosition(element).x < getOriginalPosition(this.selected).x
    );
  }
  jumpRight() {
    this.jump(
      (element) =>
        getOriginalPosition(element).x > getOriginalPosition(this.selected).x
    );
  }

  moveSelectionLvlUp() {
    if (this.editingMode) return;
    let atTop = this.selected === this.root;
    if (atTop) return;
    this.selectedDOMLvl--;
    var parent = this.selected.parentElement;
    this.setSelected(parent);
  }
  moveSelectionLvlDown() {
    if (this.editingMode) return;
    var nextDOMLvlElements = this.getDOMLvlElements(this.selectedDOMLvl + 1);
    var hasNextDOMLvl = nextDOMLvlElements.length > 0;
    if (!hasNextDOMLvl) return;
    this.selectedDOMLvl++;
    var selectedHasChild = hasElementChildren(this.selected);
    var descendant = selectedHasChild
      ? getElementChildren(this.selected)[0]
      : nextDOMLvlElements[this.selectedDOMLvl][0];
    this.setSelected(descendant);
  }

  goToRootSelectionLvl() {
    if (this.editingMode) return;
    this.selectedDOMLvl = 0;
    this.setSelected(this.root);
  }

  enterEditingMode() {
    this.selected.focus();
    this.editingMode = true;
  }
  exitEditingMode() {
    this.selected.blur();
    this.editingMode = false;
  }

  primaryClick() {
    if (this.selected != null) {
      if (isEditable(this.selected)) {
        this.enterEditingMode();
      }
      leftClick(this.selected);
    }
  }
  secondaryClick() {
    if (this.selected != null) {
      if (isLink(this.selected)) {
        ctrlLeftClick(this.selected);
      } else rightClick(this.selected);
    }
  }

  copySelectedToRegister(id) {
    if (id in this.registers) this.registers[id] = this.selected;
  }
  jumpToElementInRegister(id) {
    if (!(id in this.registers)) return;
    var element = this.registers[id];
    if (element === undefined) return;
    this.selectedDOMLvl = this.distanceFromRoot(element);
    this.setSelected(element);
  }

  //SEARCH MODE
  enterSearchMode() {}
  exitSearchMode() {}

  toggleSearchHighlight(element) {
    if (element === this.selected) return;
    if (element.style.border != SEARCH_HIGHLIGHT_BORDER) {
      element.oldBorder = element.style.border;
      element.style.border = SEARCH_HIGHLIGHT_BORDER;
    } else {
      element.style.border = element.oldBorder;
    }
  }

  parseSearchString(string) {
    var terms = string.split(" ");
    const isElementString = (term) =>
      term[0] == "<" && term[term.length - 1] == ">";
    return terms.map((x) => {
      if (isElementString(x))
        return {
          text: x.substring(1, x.length - 1).toUpperCase(),
          isElementTerm: true,
        };
      else return { text: x, isElementTerm: false };
    });
  }

  searchDOM(string) {
    var searchTerms = this.parseSearchString(string);
    this.searchMatches.forEach((element) =>
      this.toggleSearchHighlight(element)
    );
    this.searchMatches = [];

    this.traverseDOMSubtree(this.root, (element) => {
      var matchesAllTerms = true;
      for (var i = 0; i < searchTerms.length; i++) {
        var searchTerm = searchTerms[i];
        if (searchTerm.isElementTerm) {
          var isDesiredElement = element.nodeName == searchTerm.text;
          if (!isDesiredElement) {
            matchesAllTerms = false;
            break;
          }
        } else {
          //check for text matches
        }
      }
      if (matchesAllTerms) this.searchMatches.push(element);
    });

    this.searchMatches.forEach((element) =>
      this.toggleSearchHighlight(element)
    );
    return this.searchMatches;
  }

  toggleSearchBar() {}

  acceptMatches() {}
}
