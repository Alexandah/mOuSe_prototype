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

export function getElementChildren(element) {
  return element.childNodes.filter((node) => node.nodeType == 1);
}

export function hasElementChildren(element) {
  return getElementChildren(element) > 0;
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
