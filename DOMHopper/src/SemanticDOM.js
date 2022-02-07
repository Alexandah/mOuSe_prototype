class SemanticDOMNode {
  constructor(domNode, whine = () => {}) {
    this.domNode = domNode;
    this.parent = null;
    this.children = [];
    this.whine = whine;
    return new Proxy(this, {
      set: (target, key, value) => {
        switch (key) {
          case "parent":
          case "children":
          case "whine":
            target[key] = value;
            break;
          default:
            this.domNode[key] = value;
            this.whine();
            break;
        }
        return true;
      },
    });
  }
}

export class SemanticDOM {
  constructor() {
    this.root = this.makeSemanticDOMTree(getTag("body"));
  }

  reset() {
    this.root = this.makeSemanticDOMTree(getTag("body"));
  }

  makeSemanticDOMTree(root) {
    if (!isSemantic(root)) return null;

    var semanticDOMRoot = null;
    const makeSemanticDOMSubtree = (node, lastSemanticAncestor) => {
      var semanticNode;
      if (isSemantic(node)) {
        semanticNode = new SemanticDOMNode(node, this.reset);
        if (semanticDOMRoot == null) {
          semanticDOMRoot = semanticNode;
          lastSemanticAncestor = semanticDOMRoot;
        } else {
          semanticNode.parent = lastSemanticAncestor;
          semanticNode.parent.children.push(semanticNode);
        }
      }
      if (node.hasChildNodes())
        Array.from(node.childNodes).forEach((child) => {
          makeSemanticDOMSubtree(
            child,
            isSemantic(node) ? semanticNode : lastSemanticAncestor
          );
        });
    };
    makeSemanticDOMSubtree(root, null);
    return semanticDOMRoot;
  }
}
