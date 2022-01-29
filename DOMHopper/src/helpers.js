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

export function getElementChildren(element) {
  return Array.from(element.childNodes).filter((node) => node.nodeType == 1);
}

export function hasElementChildren(element) {
  return getElementChildren(element).length > 0;
}

export function excludeScripts(elementList) {
  return Array.from(elementList).filter(
    (node) => !(node instanceof HTMLScriptElement)
  );
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
