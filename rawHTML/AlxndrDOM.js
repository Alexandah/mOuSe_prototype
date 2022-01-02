//Entities
export class DOMObject {
  constructor(varsIgnoringRender = []) {
    this.element = null;
    this.render = function () {};
    this.destroy = function () {
      this.element.parentElement.removeChild(this.element);
      Object.keys(this).forEach((k) => {
        delete this[k];
      });
    };
    return new Proxy(this, {
      set: (target, key, value) => {
        target[key] = value;
        switch (key) {
          case "element":
            break;
          default:
            let skipRender = varsIgnoringRender.indexOf(key) == -1;
            if (skipRender) break;
            this.render();
        }
        return true;
      },
    });
  }
}

/*DOMObject child schema:
      Class Thing extends DOMObject{
        constructor(a,b,c){
          super();
          this.a = a;
          this.b = b;
          this.c = c;
          this.element = make...(...)
          this.render = function () {
            this.element.style... = ...
            ...
          }
          this.render();
        }
      }
      */

//DOM Helpers
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

export function makeDiv(parent = document.body) {
  var div = document.createElement("div");
  parent.appendChild(div);
  return div;
}

export function makeP(text, parent = document.body) {
  var p = document.createElement("p");
  p.appendChild(document.createTextNode(text));
  parent.appendChild(p);
  return p;
}

export function makeUL(items, parent = document.body) {
  var ul = document.createElement("ul");
  parent.appendChild(ul);
  items.forEach((item) => {
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(item));
    ul.appendChild(li);
  });
  return ul;
}

export function makeOL(items, parent = document.body) {
  var ol = document.createElement("ol");
  parent.appendChild(ol);
  items.forEach((item) => {
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(item));
    ol.appendChild(li);
  });
  return ol;
}
