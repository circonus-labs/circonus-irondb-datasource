import Lexer from './lexer';

export default class Parser {
  input = '';
  lexer: Lexer;
  tokens: any[];
  index = 0;

  constructor(expression: string) {
    this.input = expression;
    this.lexer = new Lexer(expression);
    this.tokens = this.lexer.tokenize() as any[];
  }

  getAst() {
    return this.start();
  }

  start() {
    try {
      return this.functionCall() || this.metricExpression();
    }
    catch (e: any) {
      return {
        type: 'error',
        message: e.message,
        pos: e.pos,
      };
    }
  }

  curlyBraceSegment() {
    if (this.match('identifier', '{') || this.match('{')) {
      let curlySegment = '';

      while (!this.match('') && !this.match('}')) {
        curlySegment += this.consumeToken().value;
      }

      if (!this.match('}')) {
        this.errorMark("Expected closing '}'");
      }

      curlySegment += this.consumeToken().value;

      // if curly segment is directly followed by identifier
      // include it in the segment
      if (this.match('identifier')) {
        curlySegment += this.consumeToken().value;
      }

      return {
        type: 'segment',
        value: curlySegment,
      };
    }
    else {
      return null;
    }
  }

  metricSegment() {
    let curly = this.curlyBraceSegment();
    if (curly) {
      return curly;
    }

    if (this.match('identifier') || this.match('number')) {
      // hack to handle float numbers in metric segments
      let parts = this.consumeToken().value.split('.');
      if (parts.length === 2) {
        this.tokens.splice(this.index, 0, { type: '.' });
        this.tokens.splice(this.index + 1, 0, {
          type: 'number',
          value: parts[1],
        });
      }

      return {
        type: 'segment',
        value: parts[0],
      };
    }

    if (!this.match('templateStart')) {
      this.errorMark('Expected metric identifier');
    }

    this.consumeToken();

    if (!this.match('identifier')) {
      this.errorMark('Expected identifier after templateStart');
    }

    let node = {
      type: 'template',
      value: this.consumeToken().value,
    };

    if (!this.match('templateEnd')) {
      this.errorMark('Expected templateEnd');
    }

    this.consumeToken();
    return node;
  }

  metricExpression() {
    if (!this.match('templateStart') && !this.match('identifier') && !this.match('number') && !this.match('{')) {
      return null;
    }

    const segments: any[] = [];
    segments.push(this.metricSegment());

    while (this.match('.')) {
      this.consumeToken();

      let segment = this.metricSegment();
      if (!segment) {
        this.errorMark('Expected metric identifier');
      }
      segments.push(segment);
    }

    return {
      type: 'metric',
      segments,
    };
  }

  functionCall() {
    if (!this.match('identifier', '(')) {
      return null;
    }

    let node: any = {
      type: 'function',
      name: this.consumeToken().value,
    };

    // consume left parenthesis
    this.consumeToken();

    node.params = this.functionParameters();

    if (!this.match(')')) {
      this.errorMark('Expected closing parenthesis');
    }

    this.consumeToken();

    return node;
  }

  boolExpression() {
    if (!this.match('bool')) {
      return null;
    }

    return {
      type: 'bool',
      value: this.consumeToken().value === 'true',
    };
  }

  functionParameters() {
    if (this.match(')') || this.match('')) {
      return [];
    }

    let param =
      this.functionCall() ||
      this.numericLiteral() ||
      this.boolExpression() ||
      this.metricExpression() ||
      this.stringLiteral();

    if (!this.match(',')) {
      return [param];
    }

    this.consumeToken();
    const params: any[] = [param].concat(this.functionParameters());
    
    return params;
  }

  numericLiteral() {
    if (!this.match('number')) {
      return null;
    }

    return {
      type: 'number',
      value: parseFloat(this.consumeToken().value),
    };
  }

  stringLiteral() {
    if (!this.match('string')) {
      return null;
    }

    const token = this.consumeToken();
    if (token.isUnclosed) {
      throw { message: 'Unclosed string parameter', pos: token.pos };
    }

    return {
      type: 'string',
      value: token.value,
    };
  }

  errorMark(text: string) {
    const currentToken = this.tokens[this.index];
    const type = currentToken ? currentToken.type : 'end of string';
    throw {
      message: text + ' instead found ' + type,
      pos: currentToken ? currentToken.pos : this.lexer.char,
    };
  }

  // returns token value and incre
  consumeToken() {
    this.index++;
    return this.tokens[this.index - 1];
  }

  matchToken(type: string, index: number) {
    const token = this.tokens[this.index + index];
    return (token === undefined && type === '') || (token && token.type === type);
  }

  match(token1: string, token2?: string) {
    return this.matchToken(token1, 0) && (!token2 || this.matchToken(token2, 1));
  }
}
