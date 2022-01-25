class Word {
  constructor(tokens, semantics, orderMatters = false) {
    this.tokens = tokens;
    this.semantics = semantics;
    this.orderMatters = orderMatters;
  }

  is(tokenSequence) {
    if (!this.orderMatters) {
      tokenSequence.forEach((t) => {
        let isInWord = this.tokens.indexOf(t) != -1;
        if (!isInWord) return false;
      });
    } else {
      if (tokenSequence.length != this.tokens.length) return false;
      tokenSequence.forEach((t, i) => {
        let isInPlace = this.tokens[i] == t;
        if (!isInPlace) return false;
      });
    }
    return true;
  }
}

export default class InputLanguage {
  constructor() {
    this.wordsWithTokens = {};
  }

  defWord(tokenSequence, semantics, orderMatters = false) {
    var key = 0;
    tokenSequence.forEach((token) => {
      key += token.charCodeAt();
    });

    var word = new Word(tokenSequence, semantics, orderMatters);

    if (!this.wordsWithTokens.hasOwnProperty(key))
      this.wordsWithTokens[key] = [word];
    else this.wordsWithTokens[key].push(word);
  }

  getWord(tokenSequence) {
    var key = 0;
    tokenSequence.forEach((token) => {
      key += token.charCodeAt();
    });

    if (!this.wordsWithTokens.hasOwnProperty(key)) return null;

    var words = this.wordsWithTokens[key];
    for (var i = 0; i < words.length; i++) {
      if (words[i].is(tokenSequence)) return words[i];
    }

    return null;
  }

  read(tokenSequence) {
    var word = this.getWord(tokenSequence);
    if (word != null) word.semantics();
  }
}
