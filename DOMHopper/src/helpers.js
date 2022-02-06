export function get(id) {
  return document.getElementById(id);
}

export function getClass(className) {
  return document.getElementsByClassName(className);
}

export function getTags(tagName) {
  return document.getElementsByTagName(tagName);
}

export function getTag(tagName) {
  return getTags(tagName)[0];
}

export function getScreenPos(element) {
  var rect = element.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
  };
}

export function isElement(node) {
  return node.nodeType == 1;
}

export function getElementChildren(element) {
  return Array.from(element.childNodes).filter((node) => isElement(node));
}

export function hasElementChildren(element) {
  return getElementChildren(element).length > 0;
}

export function isScript(node) {
  return node instanceof HTMLScriptElement;
}

export function excludeScripts(elementList) {
  return Array.from(elementList).filter((node) => !isScript(node));
}

export function getKeyContainingX(obj, X) {
  var keyContainingX = null;
  Object.keys(obj).forEach((key) => {
    if (obj[key].indexOf(X) !== -1) {
      keyContainingX = key;
    }
  });
  return keyContainingX;
}

export function isEditable(element) {
  switch (element.nodeName) {
    case "INPUT":
      return true;
    default:
      return false;
  }
}

export function isLink(element) {
  if (element.nodeName == "A") return true;
  return false;
}

export function getOriginalPosition(element) {
  if (!element.hasOwnProperty("originalPosition"))
    element.originalPosition = getScreenPos(element);
  return element.originalPosition;
}

export function leftClick(element) {
  element.click();
}

export function rightClick(element) {
  var evt = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
    view: window,
    button: 2,
  });
  element.dispatchEvent(evt);
}

export function ctrlLeftClick(element) {
  element.dispatchEvent(new MouseEvent("click", { ctrlKey: true }));
}

export function traverseDOMSubtree(node, func, filterChildrenBy = (x) => true) {
  func(node);
  if (node.hasChildNodes())
    Array.from(node.childNodes)
      .filter(filterChildrenBy)
      .forEach((child) => {
        traverseDOMSubtree(child, func, filterChildrenBy);
      });
}

export function traverseElementsInDOMSubtree(node, func) {
  traverseDOMSubtree(node, func, (x) => isElement(x));
}
